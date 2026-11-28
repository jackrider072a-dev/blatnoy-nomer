'use strict';

const GarageMarket = (() => {
  const coinKeys = ['common','rare','epic','legend','elite'];
  const covers = {common:'vesta',rare:'camry',epic:'cayenne',legend:'p911',elite:'urus',star:'chiron'};
  const bundleKeys = ['dash','firstpair','duo','rolling','myth','dream_amgone','first'];
  const featuredPackKey = 'pack:dream_amgone';
  let showReceipt = () => {};

  function storeInventory() {
    return S.paid.garage ||= { ownedPlates:[], plates:[], cars:[] };
  }

  function receiptRandom(receipt) {
    let seed = 2166136261;
    for (const char of receipt) seed = Math.imul(seed ^ char.codePointAt(0),16777619);
    return () => {
      seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function weighted(pool, random) {
    let point = random() * pool.reduce((sum,[,weight]) => sum + weight,0);
    for (const [entry,weight] of pool) {
      point -= weight;
      if (point < 0) return entry;
    }
    return pool.at(-1)?.[0];
  }

  function toPlate([series,digits,region,tier]) {
    return { l1:series[0],l23:series.slice(1),d:digits,reg:region,tier };
  }

  function grant(receipt) {
    const product = globalThis.GARAGE_PRODUCTS?.[receipt.item];
    if (!product) return false;
    const inventory = storeInventory();
    const owned = new Set([...inventory.ownedPlates,...heldKeys()]);
    const models = new Set(DC_ADMIN.list().map(([id]) => id));
    const random = receiptRandom(receipt.id);
    const rewards = [];
    for (const component of product.rewards) {
      if (component.kind === 'cash') rewards.push({kind:'cash',amount:shopCash(component.sku)});
      if (component.kind === 'boost') rewards.push(component);
      if (component.kind === 'car' || component.kind === 'car-pool') {
        const id = component.id || weighted(component.pool,random);
        if (!models.has(id)) return false;
        rewards.push({kind:'car',id});
      }
      if (component.kind === 'plate' || component.kind === 'plate-pool' || component.kind === 'plate-series') {
        let values = component.plate;
        if (component.kind === 'plate-pool') values = weighted(component.pool,random);
        if (component.kind === 'plate-series') {
          const candidates = component.pool.filter(variant => !owned.has(plateKey(toPlate(variant))));
          values = candidates[Math.floor(random() * candidates.length)];
        }
        if (!values) return false;
        const plate = toPlate(values);
        if (classify(plate) !== plate.tier) return false;
        owned.add(plateKey(plate));
        rewards.push({kind:'plate',plate});
      }
    }
    if (rewards.length !== product.rewards.length) return false;
    for (const reward of rewards) {
      if (reward.kind === 'cash') gain(reward.amount);
      if (reward.kind === 'boost') S.buffUntil = Math.max(Date.now(),S.buffUntil) + reward.hours * 3600000;
      if (reward.kind === 'car') {
        if (DC_NY.full()) inventory.cars.push(reward.id);
        else DC_ADMIN.give(reward.id,true);
      }
      if (reward.kind === 'plate') {
        const plate = reward.plate;
        const key = plateKey(plate);
        if (!inventory.ownedPlates.includes(key)) inventory.ownedPlates.push(key);
        if (heldKeys().has(key) || S.plates.length >= slots()) inventory.plates.push(plate);
        else {
          const awarded = { ...plate,id:S.nid++,got:Date.now(),val:plateValue(plate,plate.tier) };
          S.plates.push(awarded);
          markFound(awarded);
        }
      }
    }
    S.paid.buys = (S.paid.buys || 0) + 1;
    Platform.track('paid_garage_store');
    toast(L('Получено · {0}',product.title));
    renderPills();
    showReceipt(receipt.item,rewards);
    return true;
  }

  function mount(source) {
    const main = $('main');
    const nav = $('nav');
    const section = document.createElement('section');
    section.id = 'tab-shop';
    section.className = 'tab';
    const screen = document.createElement('iframe');
    screen.title = L('Магазин');
    screen.setAttribute('sandbox','allow-scripts allow-same-origin');
    section.append(screen);
    main.append(section);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.tab = 'shop';
    button.innerHTML = '<span aria-hidden="true">🛒</span><b data-i18n="Магазин">' + L('Магазин') + '</b>';
    nav.querySelector('[data-tab="more"]').before(button);
    const fromFile = location.protocol === 'file:';
    const origin = fromFile ? '*' : location.origin;
    const peerOrigin = fromFile ? 'null' : location.origin;
    let sent = '';
    let lastCheckout = null;
    let checkoutPending = false;
    let frameReady = false;
    let requestedCase = '';
    let paymentCatalog = null;
    let checkingPayments = false;
    function paidOffers() {
      const offers = {};
      if (!paymentCatalog?.enabled || S.tut >= 0) return offers;
      const products = globalThis.GARAGE_PRODUCTS || {};
      const owned = new Set([...storeInventory().ownedPlates,...heldKeys()]);
      const add = (key,sku,extra = {}) => {
        const item = products[sku];
        const label = item && Platform.price(sku,item.stars);
        if (label) offers[key] = {sku,label,...extra};
      };
      const late = new Set(['convoy','museum','key5']);
      for (const sku of Object.keys(products)) {
        const prefix = 'garage_case_';
        if (!sku.startsWith(prefix)) continue;
        const key = sku.slice(prefix.length);
        if (late.has(key) && S.story.ch < STORY.length) continue;
        add('case:' + key,sku);
      }
      for (const key of bundleKeys) {
        if (key === 'dream_amgone' && !paymentCatalog.dreamAmg) continue;
        const sku = 'garage_pack_' + key;
        const pack = products[sku];
        if (!pack) continue;
        const remaining = pack.rewards.filter(reward => reward.kind !== 'plate-series' ||
          reward.pool.some(values => !owned.has(plateKey(toPlate(values)))));
        if (remaining.length === pack.rewards.length) add('pack:' + key,sku);
        else if (remaining.length === 1) {
          const selected = remaining[0];
          const suffix = selected.kind === 'plate-series' ? selected.pool[0][2] + '_' + selected.pool[0][3] : 'car';
          add('pack:' + key,sku + '_' + suffix,{partial:true});
        }
        if (key === 'dream_amgone' && remaining.length === pack.rewards.length) {
          add(featuredPackKey + ':car',sku + '_car');
        }
      }
      for (const [sku,item] of Object.entries(products)) {
        if (!sku.startsWith('garage_plate_')) continue;
        const plate = toPlate(item.rewards[0].plate);
        add('plate:' + plateKey(plate),sku);
      }
      return offers;
    }
    const originalGarage = renderGarage;
    renderGarage = function () {
      originalGarage();
      const inventory = S.paid.garage;
      if (!inventory || (!inventory.plates.length && !inventory.cars.length)) return;
      const stock = document.createElement('section');
      stock.className = 'card';
      stock.innerHTML = `<h3>${L('Запас покупок')}</h3>${inventory.plates.map((plate,index) => `<div class="item">${plateHTML(plate,'small')}
        <button type="button" data-act="marketTakePlate" data-index="${index}" ${heldKeys().has(plateKey(plate)) || S.plates.length >= slots() ? 'disabled' : ''}>${L('В гараж')}</button></div>`).join('')}`;
      for (const [index,id] of inventory.cars.entries()) {
        const row = document.createElement('div');
        row.className = 'item';
        const label = document.createElement('span');
        label.textContent = DC_ADMIN.list().find(([model]) => model === id)?.[1] || L('Машина');
        row.append(label);
        const take = document.createElement('button');
        take.type = 'button';
        take.dataset.act = 'marketTakeCar';
        take.dataset.index = index;
        take.disabled = DC_NY.full();
        take.textContent = L('В гараж');
        row.append(take);
        stock.append(row);
      }
      $('tab-garage').firstElementChild.after(stock);
    };
    ACTS.marketTakePlate = ({index}) => {
      const stock = storeInventory().plates;
      const plate = stock[index];
      if (!plate || S.plates.length >= slots() || heldKeys().has(plateKey(plate))) return;
      const awarded = { ...plate,id:S.nid++,got:Date.now(),val:plateValue(plate,plate.tier) };
      S.plates.push(awarded);
      stock.splice(Number(index),1);
      markFound(awarded);
      save(); renderGarage(); renderHeader();
    };
    ACTS.marketTakeCar = ({index}) => {
      const stock = storeInventory().cars;
      if (!stock[index] || DC_NY.full() || !DC_ADMIN.give(stock[index],true)) return;
      stock.splice(Number(index),1);
      save(); renderGarage(); renderHeader();
    };

    function send(type,data = {}) {
      screen.contentWindow?.postMessage({channel:'blatnoy-live-shop',type,...data},origin);
    }
    showReceipt = (sku,rewards) => {
      if (tab !== 'shop') return;
      const bundle = bundleKeys.find(key => sku === 'garage_pack_' + key || sku.startsWith('garage_pack_' + key + '_'));
      const legacyDream = sku === 'garage_pack_dream' || sku === 'garage_pack_dream_car';
      const product = legacyDream ? featuredPackKey : bundle ? 'pack:' + bundle : sku.startsWith('garage_plate_') ? 'case:platepick' : 'case:' + sku.slice('garage_case_'.length);
      send('award',{product,rewards});
    };

    function sync() {
      if (tab !== 'shop') return;
      if (!checkingPayments && Platform.canPay && globalThis.GARAGE_PRODUCTS) {
        checkingPayments = true;
        Platform.garageStoreCatalog().then(info => { paymentCatalog = info; sync(); });
      }
      const star = DC_STORE.star();
      const payload = { coins:Math.floor(S.coins), star, covers, other:Platform.canPay, lang:I18N.lang, platform:Platform.name,
        adAt:DC_STORE.adAt(), starLocked:DC_STORE.starLocked(),
        offers:Object.fromEntries(coinKeys.map(key => [key,DC_STORE.coins(key)])),
        cars:DC_ADMIN.list().map(([id,name]) => [id,name]),
        paid:paidOffers(), plates:[...storeInventory().ownedPlates,...heldKeys()] };
      const next = JSON.stringify(payload);
      if (next === sent) return;
      sent = next;
      send('catalog',payload);
    }

    const originalTab = renderTab;
    renderTab = function () {
      const entering = tab === 'shop' && !main.classList.contains('live-shop-main');
      main.classList.toggle('live-shop-main',tab === 'shop');
      if (tab !== 'shop') return originalTab();
      if (!screen.hasAttribute('src')) {
        const url = new URL(source,location.href);
        url.searchParams.set('embedded','1');
        url.searchParams.set('live','1');
        screen.src = url.href;
      }
      sync();
      if (entering) send('enter');
    };
    const originalHeader = renderHeader;
    renderHeader = function () {
      originalHeader();
      sync();
    };

    const originalShop = ACTS.shop;
    ACTS.shop = () => {
      if (tab === 'shop') return originalShop();
      if (!$('modal').classList.contains('hidden')) closeModal();
      openTab('shop');
    };
    function openRequestedCase() {
      if (!frameReady || tab !== 'shop' || !requestedCase) return;
      send('focus-case',{ key:requestedCase });
      requestedCase = '';
    }
    ACTS.dcCase = ({v}) => {
      if (!coinKeys.includes(v)) return;
      requestedCase = v;
      openTab('shop');
      main.scrollTop = 0;
      openRequestedCase();
    };

    window.addEventListener('message',async event => {
      const request = event.data;
      if (event.source !== screen.contentWindow || event.origin !== peerOrigin || request?.channel !== 'blatnoy-live-shop') return;
      if (request.type === 'ready') { frameReady = true; sent = ''; sync(); openRequestedCase(); return; }
      if (tab !== 'shop') return;
      if (request.type === 'other') { originalShop(); return; }
      if (request.type === 'go' && ['cars','garage','buy'].includes(request.tab)) {
        openTab(request.tab);
        main.scrollTop = 0;
        return;
      }
      if (request.type !== 'checkout' || !Number.isInteger(request.token) || checkoutPending) return;
      if (lastCheckout && request.token <= lastCheckout.token) {
        if (request.token === lastCheckout.token) send('checkout',lastCheckout);
        return;
      }
      const finish = result => {
        lastCheckout = {token:request.token,...result,coins:Math.floor(S.coins)};
        send('checkout',lastCheckout);
      };
      if (request.variant === 'ad') {
        if (request.key !== 'common') { finish({error:'unavailable'}); return; }
        checkoutPending = true;
        try { finish(await DC_STORE.takeAd()); }
        finally { checkoutPending = false; renderHeader(); }
        return;
      }
      if (request.key === 'star' && DC_STORE.star()) {
        finish({native:true});
        shopBuy(STAR_BOX_ITEM);
        return;
      }
      if (request.sku) {
        let key = request.choice ? 'plate:' + request.choice : request.product;
        if (key === featuredPackKey && request.variant === 'car') key += ':car';
        const offer = paidOffers()[key];
        if (!offer || offer.sku !== request.sku) { finish({error:'price'}); return; }
        finish({native:true});
        shopBuy(offer.sku);
        return;
      }
      if (!coinKeys.includes(request.key)) {
        finish({error:'unavailable'});
        return;
      }
      finish(DC_STORE.take(request.key,request.quote));
      const active = $('tab-shop');
      if (active?.classList.contains('on')) renderHeader();
    });
  }

  return { mount, grant };
})();
