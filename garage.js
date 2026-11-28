'use strict';

const GarageUI = (() => {
  const orderRules = [
    { label:'Простой', client:'tamara', rate:.2, cap:30, wait:120000,
      requests:[{ tier:1 }, { tier:0 }, { tier:2, min:4 }] },
    { label:'Коллекционный', client:'gosha', rate:.3, cap:100, wait:180000,
      requests:[{ tier:2, digits:'100', min:4 }, { tier:2, digits:'777', min:4 }, { tier:2, region:'77', min:4 }] },
    { label:'Серия и регион', client:'sanych', rate:.4, cap:400, wait:300000,
      requests:[{ tier:3, series:'ООО', region:'77', min:6 }, { tier:3, series:'ААА', region:'97', min:6 }, { tier:3, series:'ММР', region:'77', min:6 }] }
  ];
  const groups = [
    ['garage','Гараж','🏠',['park','slots']],
    ['blanks','Бланки','📄',['luck','disc','pity']],
    ['taxi','Такси','🚕',['taxi','crit']],
    ['workshop','Мастерская','🔧',['forge','bot']]
  ];
  const limits = { park:15, taxi:15, crit:6, luck:10, disc:5 };
  const rentBonus = level => 15 * Math.min(level,3) + 7 * Math.min(Math.max(level - 3,0),5) + 2 * Math.max(level - 8,0);
  const taxiBase = level => 5 + 3 * Math.min(level,5) + Math.max(level - 5,0);
  const middleWeight = level => 1.1 ** level;
  const bonuses = {
    park:level => L('+{0}% к доходу с номеров',rentBonus(level)),
    slots:level => L('{0} мест для номеров',12 + 2 * level),
    luck:level => L('×{0} к весу средних редкостей',middleWeight(level).toLocaleString(I18N.loc,{maximumFractionDigits:2})),
    disc:level => L('−{0}% к расчётной цене бланков',4 * level),
    pity:level => L('{0} покупок до гарантии',120 - 10 * level),
    taxi:level => L('{0} монет за тап до бонуса уровня',taxiBase(level)),
    crit:level => L('{0}% шанс выплаты ×{1}',5 * level,3),
    forge:level => L('+{0}% к расчётному шансу',5 * level),
    bot:level => level ? L('покупка раз в {0} с',(25 / (1 + .5 * level)).toLocaleString(I18N.loc,{maximumFractionDigits:1})) : L('Помощник ещё не нанят')
  };

  function mount({ preview = false } = {}) {
    const route = preview ? location.hash.slice(1) : '';
    const garage = $('tab-garage');
    const board = document.createElement('section');
    board.className = 'client-board';
    board.setAttribute('aria-label',L('Заказы клиентов'));
    const dialog = document.createElement('dialog');
    dialog.className = 'client-review';
    dialog.setAttribute('aria-labelledby','client-review-title');
    $('app').append(dialog);
    let expanded = route === 'garage';
    let activeSlot = 0;
    let activeGroup = 'garage';
    let boardMarkup = '';
    let quote = null;

    if (route === 'garage' || route === 'upgrades') {
      S.coins = 32740;
      dispCoins = S.coins;
      Object.assign(S.up,{ park:5, slots:3, luck:3, disc:2, taxi:8, crit:3, forge:1 });
      for (const [l1,d,l23,reg] of [['К','321','МХ','50'],['Т','313','КЕ','54'],['М','100','ТА','77'],['А','417','МР','97']]) {
        const plate = { l1,d,l23,reg, id:S.nid++, got:Date.now() };
        plate.tier = classify(plate);
        plate.val = plateValue(plate,plate.tier);
        S.plates.push(plate);
      }
      const legendary = S.plates.at(-1);
      legendary.lock = true;
      S.market = { kind:'tier', key:2, mult:1.5, until:Date.now() + 150000 };
    }

    if (preview) {
      for (const upgrade of UPS) if (limits[upgrade.id]) upgrade.max = limits[upgrade.id];
      rentMultiplier = () => 1 + rentBonus(up('park')) / 100;
      blankMultiplier = () => 1 - .04 * up('disc');
      taxiTap = () => taxiBase(up('taxi')) * (1 + .02 * (S.lvl - 1));
      taxiCriticalMultiplier = () => 3;
      const baseWeights = packWeights;
      packWeights = function (id) {
        const connectionLuck = Math.min(40,1.03 ** S.pts) * evMult('luck');
        const weights = baseWeights(id,connectionLuck);
        const first = weights.findIndex(weight => weight > 0);
        const middle = weights.slice(first + 1,4).reduce((sum,weight) => sum + weight,0);
        if (!middle) return weights;
        const boost = middleWeight(up('luck'));
        const normalizeMiddle = (weights[first] + middle) / (weights[first] + middle * boost);
        weights[first] *= normalizeMiddle;
        for (let tier = first + 1; tier < 4; tier++) weights[tier] *= normalizeMiddle * boost;
        return weights;
      };
    }

    function newOrder(slot, previous) {
      const rule = orderRules[slot];
      if (S.story.ch <= 1 && S.ordersDone < 2 && slot === 0) {
        return { id:S.nid++, slot, request:{tier:S.ordersDone ? 0 : 1}, intro:true };
      }
      const options = rule.requests.filter(request => S.lvl >= (request.min ?? 1));
      const alternatives = options.filter(request => JSON.stringify(request) !== JSON.stringify(previous?.request));
      const request = previous ? pick(alternatives.length ? alternatives : options) : options[0];
      return { id:S.nid++, slot, request };
    }

    ensureOrders = function () {
      if (!ordersOpen()) return;
      if (S.clientOrderVersion !== 1 || !Array.isArray(S.orders)) {
        S.orders = [];
        S.clientOrderVersion = 1;
      }
      orderRules.forEach((_,slot) => {
        const existing = S.orders[slot];
        if (!existing) S.orders[slot] = newOrder(slot);
        else if (existing.readyAt && Date.now() >= existing.readyAt) S.orders[slot] = newOrder(slot,existing);
        else if (!existing.request && !existing.readyAt && S.lvl >= orderRules[slot].requests[0].min) {
          S.orders[slot] = newOrder(slot);
        }
      });
    };

    function matches(order) {
      if (!order?.request || order.readyAt) return [];
      const {tier,digits,series,region} = order.request;
      return S.plates.filter(plate => !isLocked(plate) && !S.dc?.cars?.some(car => car.pl === plate.id) &&
        plate.tier === tier && (!digits || plate.d === digits) && (!series || seriesOf(plate) === series) &&
        (!region || plate.reg === region)).sort((a,b) => a.val - b.val || a.id - b.id);
    }

    function payment(order, plate) {
      const rule = orderRules[order.slot];
      return order.intro ? 80 : plate.val + Math.min(rule.cap,Math.round(plate.val * rule.rate));
    }

    function requestName({tier,digits,series,region}) {
      return [TIERS[tier].name, series && L('серия {0}',series), digits && L('цифры {0}',digits), region && L('регион {0}',region)].filter(Boolean).join(' · ');
    }

    const waiting = order => `<time data-until="${order.readyAt}"></time>`;
    function caseFor(plate) {
      return `<div class="client-plate-stage" style="--plate-color:var(--t${plate.tier})">
        ${plateHTML(plate,'client-plate')}<span class="client-rarity">${TIERS[plate.tier].name}</span></div>`;
    }

    function orderCard(order, eligible) {
      const rule = orderRules[order.slot];
      const client = CHARS[rule.client];
      const best = eligible[0];
      const value = best ? payment(order,best) : 0;
      const hasReplacement = rule.requests.filter(request => S.lvl >= (request.min ?? 1)).length > 1;
      const head = `<header class="client-card-head"><span class="client-avatar" style="--client-color:${client.c}" aria-hidden="true">${client.i}</span><div><h3>${client.n}</h3><p>${L(rule.label)}</p></div>
        ${best ? `<span class="client-state ready">${L('Готов к сдаче')}</span>` : ''}</header>`;
      if (!order.request) {
        return `<article class="client-card">${head}<div class="client-order-empty"><b>${L('Откроется на уровне {0}',rule.requests[0].min)}</b></div></article>`;
      }
      if (order.readyAt) {
        return `<article class="client-card">${head}<div class="client-order-empty"><b>${L('Заказ выполнен')}</b><span>${L('Следующий через {0}',waiting(order))}</span></div></article>`;
      }
      return `<article class="client-card">${head}<p class="client-request">${requestName(order.request)}</p>
        ${best ? `${caseFor(best)}<div class="client-reward"><span>${L('Выплата клиента')}<strong>${fmt(value)} <span>💰</span></strong></span><span class="client-xp">${L('+15 опыта')}</span></div>
          <p class="client-hint">${L('Продать сейчас за {0} монет',fmt(sellVal(best)))}${sellVal(best) > value ? ' · ' + L('сейчас рынок платит больше') : ''}</p>
          <button class="btn client-primary" type="button" data-act="clientReview">${eligible.length > 1 ? L('Выбрать номер · {0}',eligible.length) : L('Посмотреть перед сдачей')}</button>`
          : `<div class="client-order-empty"><b>${L('В гараже нет свободного номера')}</b><span>${L('Закреплённые и установленные на машины номера защищены.')}</span></div>
            <div class="client-order-buttons"><button class="btn sm alt" type="button" data-act="clientFind">${L('К бланкам')}</button>
            ${hasReplacement && !order.intro ? `<button class="btn sm alt" type="button" data-act="clientReroll" ${Date.now() < S.ordAt ? 'disabled' : ''}>${Date.now() < S.ordAt ? L('Смена через {0}',`<time data-until="${S.ordAt}"></time>`) : L('Сменить заказ')}</button>` : ''}</div>`}</article>`;
    }

    function drawBoard() {
      if (!ordersOpen() || !board.isConnected) return;
      ensureOrders();
      const options = S.orders.map(order => matches(order));
      const count = options.filter(list => list.length).length;
      const header = `<button type="button" class="client-board-toggle" data-act="clientToggle" aria-expanded="${expanded}" aria-controls="client-board-body">
        <span class="client-board-icon" aria-hidden="true">📋</span><span><b>${L('Заказы клиентов')}</b><small>${count ? L(count === 1 ? '{0} из {1} готов к сдаче' : '{0} из {1} готовы к сдаче',count,orderRules.length) : L('Нет готовых заказов')}</small></span>
        <span class="client-chevron" aria-hidden="true">›</span></button>`;
      const body = expanded ? `<div class="client-board-content" id="client-board-body">
        <div class="client-requests" role="group" aria-label="${L('Клиенты')}">${S.orders.map((order,i) => `<button type="button" data-act="clientSelect" data-slot="${i}" aria-pressed="${i === activeSlot}">
          <b>${CHARS[orderRules[i].client].n}</b><small class="${options[i].length ? 'ready' : ''}">${L(options[i].length ? 'Готов' : order.readyAt ? 'Выполнен' : order.request ? 'В поиске' : 'Закрыт')}</small></button>`).join('')}</div>
        ${orderCard(S.orders[activeSlot],options[activeSlot])}</div>` : '<div id="client-board-body" hidden></div>';
      if (header + body !== boardMarkup) {
        boardMarkup = header + body;
        board.innerHTML = boardMarkup;
        board.querySelectorAll('time[data-until]').forEach(time => time.textContent = mmss(+time.dataset.until - Date.now()));
      }
    }

    const originalGarage = renderGarage;
    renderGarage = function () {
      const focused = board.contains(document.activeElement) ? document.activeElement : null;
      board.remove();
      originalGarage();
      if (!ordersOpen()) return;
      garage.firstElementChild.after(board);
      drawBoard();
      if (focused?.isConnected) focused.focus({ preventScroll:true });
    };
    updateOrderDot = drawBoard;
    syncNav = () => {};
    $('nav').querySelector('[data-tab="orders"]').remove();
    STORY[1].intro[1][1] = 'Клиенты уже ждут! Открой «Заказы клиентов» в гараже и выбери номер для сдачи.';
    const originalGoal = renderGoal;
    renderGoal = function () {
      originalGoal();
      if (S.story.ch !== 1 || S.ordersDone >= 2 || $('goal').querySelector('[data-act="clientOpen"]')) return;
      $('goal').insertAdjacentHTML('beforeend',`<button class="client-goal btn sm alt" type="button" data-act="clientOpen">${L('К клиентам')}</button>`);
    };

    function review(order, selected) {
      const eligible = matches(order);
      const plate = eligible.find(candidate => candidate.id === selected) ?? eligible[0];
      if (!plate) return;
      quote = { order:order.id, plate:plate.id, value:payment(order,plate) };
      const sale = sellVal(plate);
      dialog.innerHTML = `<div class="client-review-content"><div class="client-review-heading"><h2 id="client-review-title">${L('Сдача номера')}</h2><button type="button" class="client-close" aria-label="${L('Закрыть')}" data-act="clientCancel">×</button></div>
        <p class="client-request">${CHARS[orderRules[order.slot].client].n} · ${requestName(order.request)}</p>
        ${caseFor(plate)}
        ${eligible.length > 1 ? `<div class="client-choices" role="group" aria-label="${L('Подходящие номера')}">
          ${eligible.map(option => `<button type="button" data-act="clientPlate" data-plate="${option.id}" aria-pressed="${option === plate}">${plateHTML(option,'mini')}<small>${fmt(payment(order,option))} 💰</small></button>`).join('')}</div>` : ''}
        <dl class="client-quote"><div><dt>${L('Продажа на рынке')}</dt><dd>${fmt(sale)} 💰</dd></div><div><dt>${L('Выплата за заказ')}</dt><dd><b>${fmt(quote.value)} 💰</b> · ${L('+15 опыта')}</dd></div></dl>
        ${sale > quote.value ? `<p class="client-market-note">${L('Сейчас на рынке за этот номер заплатят больше.')}</p>` : ''}
        <div class="client-order-buttons"><button type="button" class="btn sm" data-act="clientConfirm">${L('Отдать номер')}</button><button type="button" class="btn sm alt" data-act="clientCancel">${L('Оставить себе')}</button></div></div>`;
      if (!dialog.open) {
        dialog.showModal();
        dialog.querySelector('.client-close').focus();
      } else {
        dialog.querySelector('[aria-pressed="true"]')?.focus();
      }
    }

    dialog.addEventListener('close',() => {
      quote = null;
      (board.querySelector('[data-act="clientReview"]') || board.querySelector('[data-act="clientToggle"]'))?.focus({ preventScroll:true });
    });
    ACTS.clientToggle = () => { expanded = !expanded; drawBoard(); board.querySelector('[data-act="clientToggle"]').focus({ preventScroll:true }); };
    ACTS.clientOpen = () => { expanded = true; activeSlot = 0; openTab('garage'); $('main').scrollTop = 0; };
    ACTS.clientSelect = ({slot}) => { activeSlot = +slot; drawBoard(); board.querySelector('[aria-pressed="true"]')?.focus({ preventScroll:true }); };
    ACTS.clientFind = () => { openTab('buy'); $('main').scrollTop = 0; };
    ACTS.clientReview = () => review(S.orders[activeSlot]);
    ACTS.clientPlate = ({plate}) => review(S.orders[activeSlot],+plate);
    ACTS.clientCancel = () => dialog.close();
    ACTS.clientConfirm = () => {
      if (!dialog.open || !quote) return;
      const order = S.orders[activeSlot];
      const plate = matches(order).find(candidate => candidate.id === quote.plate);
      if (order.id !== quote.order || !plate || payment(order,plate) !== quote.value) {
        dialog.close(); drawBoard(); return toast(L('Состав гаража изменился. Выбери номер ещё раз.'));
      }
      const value = quote.value;
      S.plates = S.plates.filter(candidate => candidate.id !== plate.id);
      gain(value);
      S.ordersDone++;
      S.orders[activeSlot] = order.intro ? newOrder(activeSlot,order) : { ...order, readyAt:Date.now() + orderRules[activeSlot].wait };
      addXp(15);
      dialog.close();
      Snd.win(2); vignette('#43c76b'); toast(L('Заказ выполнен. +{0} монет',fmt(value)));
      renderGarage(); renderHeader(); renderGoal(); checkAch(); save();
    };
    ACTS.clientReroll = () => {
      const order = S.orders[activeSlot];
      if (!order?.request || order.intro || order.readyAt || matches(order).length || Date.now() < S.ordAt) return;
      S.orders[activeSlot] = newOrder(activeSlot,order);
      S.ordAt = Date.now() + 600000;
      drawBoard(); board.querySelector('[aria-pressed="true"]')?.focus({ preventScroll:true }); save();
    };

    const notes = {
      park:preview ? 'Быстрее всего растут первые три уровня.' : 'Бонус начисляется на доход с номеров.',
      slots:'Влияют на вместимость гаража и запас под слияние.',
      luck:preview ? 'Шансы легенд и суперлегенд заданы отдельно для каждого бланка.' : 'При высоких уровнях бонус достигает предела.',
      pity:'Счётчик сбрасывается при выпадении блатного или более редкого номера.',
      crit:preview ? 'При срабатывании выплата за тап утраивается.' : 'При срабатывании выплата за тап увеличивается в 10 раз.',
      forge:'Шанс попытки по-прежнему ограничен 85%.',
      bot:'Покупает выбранный бланк, соблюдая резерв монет.'
    };
    const percent = value => value.toLocaleString(I18N.loc,{maximumFractionDigits:1});
    const levelRent = level => preview ? rentBonus(level) : 100 * PARK * level;
    function bonusText(id, level) {
      if (!preview) {
        if (id === 'park') return L('+{0}% к доходу с номеров',percent(levelRent(level)));
        if (id === 'disc') return L('−{0}% к расчётной цене бланков',percent(100 * (1 - .93 ** level)));
        if (id === 'taxi') return L('{0} монет за тап до бонуса уровня',5 + 3 * level);
        if (id === 'crit') return L('{0}% шанс выплаты ×{1}',5 * level,taxiCriticalMultiplier());
        if (id === 'luck') return L('×{0} к весу средних редкостей',percent(Math.min(40,1.12 ** level * 1.03 ** S.pts)));
      }
      return bonuses[id](level);
    }
    function upgradeCard(item,index) {
      const {id,max} = item;
      const level = up(id), maxed = level >= max, cost = upCost(item);
      const title = item.name.slice(item.name.indexOf(' ') + 1);
      const icon = item.name.slice(0,item.name.indexOf(' '));
      const delta = id === 'park' && !maxed ?
        S.plates.reduce((sum,plate) => sum + plateInc(plate),0) * PAY_SEC / rentMultiplier() * (levelRent(level + 1) - levelRent(level)) / 100 : 0;
      return `<article class="garage-up-card" style="--up-delay:${index * 45}ms">
        <div class="garage-up-card-head"><span class="garage-up-icon" aria-hidden="true">${icon}</span><div><h3>${title}</h3><p>${L('Уровень {0} из {1}',level,max)}</p></div></div>
        <div class="garage-up-meter" role="progressbar" aria-label="${title}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${level}"><i style="width:${100 * level / max}%"></i></div>
        <dl class="garage-up-effects"><div><dt>${L('Сейчас')}</dt><dd>${bonusText(id,level)}</dd></div>
          ${maxed ? '' : `<div><dt>${L('Следующий уровень')}</dt><dd>${bonusText(id,level + 1)}</dd></div>`}</dl>
        ${delta > 0 ? `<p class="garage-up-delta">${L('+{0} монет за 30 сек с текущими номерами',percent(delta))}</p>` : ''}
        ${notes[id] ? `<p class="client-hint">${L(notes[id])}</p>` : ''}
        <div class="client-order-buttons">${maxed ? `<span class="client-state ready">${L('Максимум')}</span>` : `<button class="btn sm" type="button" data-act="buyUp" data-id="${id}" data-cost="${cost}">${L('Улучшить · {0} 💰',fmt(cost))}</button>`}
        ${id === 'bot' && level ? `<button class="btn sm alt" type="button" data-act="botOpen">${L('⚙ Настроить помощника')}</button>` : ''}</div></article>`;
    }
    renderUps = function () {
      const selected = groups.find(([key]) => key === activeGroup);
      $('tab-up').innerHTML = `<div class="garage-up-title"><h2>${L('Апгрейды')}</h2></div>
        <div class="garage-up-groups" role="group" aria-label="${L('Разделы апгрейдов')}">${groups.map(([key,label,icon]) => `<button type="button" data-act="garageUpGroup" data-group="${key}" aria-pressed="${key === activeGroup}"><span aria-hidden="true">${icon}</span>${L(label)}</button>`).join('')}</div>
        <div class="garage-up-list">${selected[3].map((id,index) => upgradeCard(UPS.find(item => item.id === id),index)).join('')}</div>`;
      refreshDisabled();
    };
    ACTS.garageUpGroup = ({group}) => { activeGroup = group; renderUps(); $('tab-up').querySelector('[aria-pressed="true"]').focus({ preventScroll:true }); };
    const originalBuyUpgrade = ACTS.buyUp;
    ACTS.buyUp = data => {
      originalBuyUpgrade(data);
      const next = $('tab-up').querySelector('[data-id="' + data.id + '"]');
      (next && !next.disabled ? next : $('tab-up').querySelector('[aria-pressed="true"]'))?.focus({ preventScroll:true });
    };
    ensureOrders();
    renderGoal();
    renderHeader();
    return route === 'garage' ? 'garage' : route === 'upgrades' ? 'up' : 'shop';
  }

  return { mount };
})();
