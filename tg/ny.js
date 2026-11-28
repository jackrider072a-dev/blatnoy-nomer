// ===================== НОВОГОДНЕЕ ОБНОВЛЕНИЕ «БЛАТНОЙ НОВЫЙ ГОД» =====================
// Подключается после game.js и cars.js и пользуется их функциями (как cars.js): S, L, fmt, toast, fx, openModal, plateHTML…
// Даты (по времени сервера): тизер «Скоро Новый год» 20–30 ноября, событие 1 декабря — 14 января, календарь — 31 подарок на весь декабрь.
// Проверка на этом компьютере (127.0.0.1): ?ny=1 — событие, ?nyteaser — тизер, ?nydemo — демо с бесплатными покупками.
// Что внутри: снегопад и гирлянда, 🍊 мандарины (валюта события), «Подарки под ёлкой» (12 подарков, один в день),
// «Ёлочный базар» (обмен мандаринов), новогодние номера (под замком), оформление за мандарины, Дед Мороз в сюжете,
// праздничный доход ×1.5 31 декабря и 1 января, сцена «С Новым годом!» после полуночи.
// Награды деньгами считаются в минутах дохода (priceIncome), как задания дня, — экономику v5 не разгоняют.
"use strict";
(() => {
const Q = new URLSearchParams(location.search), LOCAL = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
const FORCE = LOCAL ? Q.get("ny") : null;                  // ?ny=1 / ?ny=0 / ?nyfest — проверка только на этом компьютере, в игре не сработают
// демо для проверки (только на локальном адресе, ?nydemo): событие включено, донат бесплатный, мандарины без конца, панель «🧪 Демо»
const DEMO = Q.has("nydemo") && /^(127.0.0.1|localhost)$/.test(location.hostname);
const NY_FROM = [12, 1], NY_TO = [1, 14];                 // [месяц, день] включительно
// ----- часы: время берём с сервера, чтобы событие и подарки нельзя было открыть переводом часов на телефоне.
// Яндекс — время из SDK площадки (внешние запросы там нежелательны), ВК и Telegram — наш сервер (GET /time).
// Пока сервер не ответил (или недоступен) — часы устройства. Часовой пояс — игрока: полночь у каждого своя.
const SRV = "https://blatnoy-nomer.blatnoy.workers.dev";
let OFF = 0, timeOK = false, timeTry = 0;
const now = () => Date.now() + OFF;
const nowD = () => new Date(now());
const dayStr = () => { const d = nowD(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
function syncTime() {
  if (timeOK || timeTry > 20) return; timeTry++;            // раз в 3 с из nyTick, пока не получится (SDK Яндекса грузится не сразу)
  const st = Platform.serverTime ? Platform.serverTime() : 0;
  if (st > 1e12) { OFF = st - Date.now(); timeOK = true; return; }
  if (Platform.name === "ya") return;                       // в Яндексе ждём SDK (он грузится позже), к своему серверу не ходим
  const t0 = Date.now();
  fetch(SRV + "/time", { cache: "no-store" }).then(r => r.json()).then(j => {
    if (j && j.t > 1e12) { OFF = j.t + (Date.now() - t0) / 2 - Date.now(); timeOK = true; try { nyTick(); renderPills(); } catch (e) {} }
  }).catch(() => {});
}
function nyOn() {
  if (FORCE === "1" || DEMO) return true; if (FORCE === "0") return false;
  const d = nowD(), m = d.getMonth() + 1, day = d.getDate();
  return (m === NY_FROM[0] && day >= NY_FROM[1]) || (m === NY_TO[0] && day <= NY_TO[1]);
}
const season = () => { const d = nowD(); return String(d.getMonth() + 1 === 12 ? d.getFullYear() + 1 : d.getFullYear()); };   // год, который встречаем
const isHoliday = () => { const d = nowD(), m = d.getMonth() + 1, day = d.getDate(); return (m === 12 && day === 31) || (m === 1 && day === 1) || (FORCE === "1" && Q.has("nyfest")); };
const isNewYearDay = () => { const d = nowD(); return (d.getMonth() === 0 && d.getDate() <= 7) || (FORCE === "1" && Q.has("nyfest")); };
const HOLI = 1.5;                                          // праздничный доход 31.12 и 1.01

// ----- состояние события (живёт в сохранении; новый сезон — всё с нуля, купленное оформление остаётся)
function N() {
  const s = season();
  if (!S.ny || S.ny.s !== s) S.ny = { s, m: 0, cal: 0, calDay: "", day: "", dm: 0, bp: 0, bl: 0, gb: 0, intro: 0, ny1: 0, gold: 0, snow: S.ny ? S.ny.snow !== 0 : 1 };
  if (S.ny.day !== dayStr()) { S.ny.day = dayStr(); S.ny.dm = 0; }
  return S.ny;
}
const DAY_CAP = 80;
// «Подарочный контейнер»: 250 🍊, не больше 5 за праздники. Расчёт: казуал (20 мин/день) набирает ~640 🍊 за праздники — 1–2 контейнера,
// активный (1 ч/день) ~2900 — все 5 и ещё остаётся на легенду и оформление. При 150 активный открывал контейнер каждые ~1.4 дня.
const BOX_M = 250, BOX_MAX = 5;                                        // мандаринов в день из бланков, слияний и такси (помощник не ферма)

// ----- Дед Мороз — персонаж для диалогов
CHARS.ded = Lprops({ n: "Дед Мороз", i: "🎅", c: "#ff5a5a" }, "n");

// ----- оформление за мандарины: в «Оформлении» появляется после покупки (нет ни p, ни st — openCos его не продаёт)
const NY_COS = [["hold", { id: "garland", n: "Новогодняя гирлянда", ny: 120 }], ["fx", { id: "snow", n: "Снежок", ny: 100 }], ["gar", { id: "tree", n: "Гараж с ёлкой", ny: 150 }]];
// за звёзды/голоса/яны (цены дублируются в server/src/worker.js, ITEMS) — продаются только в праздники; goldtree — из «Золотого календаря»
const NY_COS_PAID = [["hold", { id: "aurora", n: "Северное сияние", st: 35, nys: 1 }], ["fx", { id: "firework", n: "Фейерверк", st: 39, nys: 1 }], ["gar", { id: "winter", n: "Зимняя резиденция", st: 49, nys: 1 }],
  ["gar", { id: "goldtree", n: "Золотая ёлка", nys: 1 }]];
[...NY_COS, ...NY_COS_PAID].forEach(([k, x]) => { Lprops(x, "n"); if (!COS[k].find(y => y.id === x.id)) COS[k].push(x); });
const _openCos = openCos;                                  // вне праздников платное новогоднее оформление не продаётся (купленное остаётся)
openCos = function (t) {
  if (nyOn()) return _openCos(t);
  const hide = NY_COS_PAID.filter(([k, x]) => !S.cos.own.includes(k + ":" + x.id)), saved = hide.map(([k, x]) => [k, x, COS[k].indexOf(x)]);
  hide.forEach(([k, x]) => COS[k].splice(COS[k].indexOf(x), 1));
  try { _openCos(t); } finally { saved.sort((a, b) => a[2] - b[2]).forEach(([k, x, i]) => COS[k].splice(i, 0, x)); }
};

// ----- звук: колокольчики
function bells() { if (!S.set.sfx) return; [84, 88, 91, 96, 91, 96].forEach((m, i) => tone(mtof(m), 0.35, "sine", 0.08, i * 0.09)); }

// ----- мандарины
function addM(n, x, y) {
  const s = N(); s.m += n;
  const r = $("coinsBox").getBoundingClientRect();
  floatText(x != null ? x : r.left + 20, y != null ? y : r.bottom + 6, "+" + n + " 🍊", "#ff9a3c");
  renderBar();
}
function dropM(n, x, y) {                                  // мандарины за игру — с дневным лимитом
  if (!nyOn() || S.tut !== -1) return; const s = N();
  n = Math.min(n, DAY_CAP - s.dm); if (n <= 0) return;
  s.dm += n; addM(n, x, y);
}
const M_PACK = { basic: 0.12, prem: 0.6, elite: 1, black: 3, ny: 2 };
// «Ёлочный бланк» — праздничный кейс на вкладке «Номера». Цена — 150 с дохода (как у бланков: растёт с доходом), блатной и выше — 20%:
// за секунду дохода выходит почти как премиум, но открыт с 4 уровня и все номера — новогодние (на зимней тачке — пара ×2)
const NY_PACK = Lprops({ name: "Ёлочный бланк", icon: "🎄", price: 6000, w: [0, 30, 50, 17, 2.7, 0.3], lvl: 4, xp: 12 }, "name");
function syncPack() {
  if (nyOn()) { if (!PACKS.ny) { PACKS.ny = NY_PACK; PACK_SEC.ny = 150; } }
  else if (PACKS.ny) { delete PACKS.ny; delete PACK_SEC.ny; if (catPack === "ny") catPack = "basic"; }
}
syncPack();
const _drawPlate = drawPlate;
drawPlate = function (packId, minTier) {
  const r = _drawPlate(packId, minTier);
  if (packId === "ny" && r && !r.sk) r.ny = 1;             // новогодний вид; замок не ставим — его можно продать, слить и повесить на тачку
  const k = M_PACK[packId] || 0, n = Math.floor(k) + (Math.random() < k % 1 ? 1 : 0);
  if (n) dropM(n);
  return r;
};
const _doMerge = doMerge;
doMerge = function (t) { const before = S.merges; _doMerge(t); if (S.merges > before) dropM(1 + Math.floor(t / 2)); };
const _taxi = taxi;
taxi = function (e) { _taxi(e); if (Math.random() < 0.02) dropM(1, e && e.clientX, e && e.clientY ? e.clientY - 40 : null); };
const _questClaim = questClaim;
questClaim = function (i) { const q = S.quests.list[i], was = q && q.got; _questClaim(i); if (q && !was && q.got && nyOn()) addM(5); };
const _questChest = questChest;
questChest = function () { const was = S.quests.chest; _questChest(); if (!was && S.quests.chest && nyOn()) addM(15); };

// ----- праздничный доход
const _incMult = incMult;
incMult = function () { return _incMult() * (nyOn() && isHoliday() ? HOLI : 1); };

// ----- новогодние номера: свой вид, всегда под замком, не перебиваются
const NY_DIG = ["001", "027", "312", "101", "111", "777"];  // 1 января, 2027 год, 31.12 …
function makeNy(tier) {
  const held = heldKeys(); let pl;
  for (let i = 0; i < 300; i++) {
    pl = { id: 0, l1: pick(LETTERS), d: pick(NY_DIG), l23: pick(LETTERS) + pick(LETTERS), reg: pick(ELITE_REG), tier, ny: 1, lock: true, got: Date.now(), pack: "nygift" };
    if (!held.has(plateKey(pl))) break;
  }
  pl.id = S.nid++; pl.val = nice(TIERS[tier].val * 1.5);
  return pl;
}
function giveNy(tier, top) {
  const p = makeNy(tier); markFound(p); S.tc[tier]++; keepPlate(p); bells();
  enqueueCinema({ color: "#9be7ff", big: tier >= 4, bg: "#0b2a46", cls: "nycine", top: top || L("Подарок от Деда Мороза"), title: L("НОВОГОДНИЙ НОМЕР!"),
    plate: plateHTML(p, ""), value: p.val, valueLabel: L("СТОИМОСТЬ"), valueIcon: "💰", sub: L("🎄 Новогодние номера бывают только в праздники. Он уже под замком в гараже."), coinRain: false });
  save(); if (tab === "garage") renderGarage();
}
const _plateHTML = plateHTML;
plateHTML = function (p, cls = "") { return _plateHTML(p, p && p.ny ? cls + " nyp" : cls); };
const _plateNote = plateNote;
plateNote = function (p) { return p && p.ny ? L("🎄 Новогодний номер — бывает только в праздники") : _plateNote(p); };
const _rerollPlate = rerollPlate;
rerollPlate = function (id, what) { const p = S.plates.find(x => x.id === id); if (p && p.ny && p.pack === "nygift") return toast(L("🎄 Новогодний номер не перебивается — это память о празднике")); _rerollPlate(id, what); };

// ----- бесплатный бланк: обычная покупка с рулеткой, деньги на неё кладём перед покупкой
function freeBlank(id) {
  if (S.lvl < PACKS[id].lvl) return false;
  if (rolling) { toast(L("Дождись, пока допечатается номер")); return false; }
  closeModal(); openTab("buy");
  S.coins += packPrice(id); buy(id); return true;
}
const G = () => N().gold ? 2 : 1;                         // «Золотой календарь»: подарки под ёлкой вдвое больше
const cashMin = m => Math.max(500, Math.round(priceIncome() * 60 * m / 10) * 10);
function cashGift(m) { const v = cashMin(m); gain(v); fx.fly(innerWidth / 2, innerHeight / 2, 16); Snd.sell(); toast(L("🎁 +{0} 💰", fmt(v))); }
function buffGift(min) { S.buffUntil = Math.max(S.buffUntil, Date.now()) + min * 60000; vignette("#ffd23f"); renderPills(); toast(L("🔥 Доход ×2 на {0} мин!", min)); }

// ----- «Подарки под ёлкой»: 12 подарков по порядку, один в календарный день
// Адвент-календарь: подарок №N открывается N декабря (по времени сервера), с каждым днём крупнее; 31-й — новогодняя легенда в новогоднюю ночь.
// Пропущенные дни не сгорают — накопившиеся подарки забираются подряд. «Золотой календарь» (донат): всё вдвое и 32-й подарок 1 января.
const blankGift = want => { const ok = id => PACKS[id] && S.lvl >= PACKS[id].lvl; const id = [want, "prem", "basic"].find(ok) || "basic"; freeBlank(id); if (N().gold) addM(10); };
const nyGift = (t, m) => { giveNy(t); if (N().gold) addM(m); };
const CAL = [
  { i: "🍊", t: "3 мандарина", go: () => addM(3 * G()) },
  { i: "💰", t: "Горсть монет (2 мин дохода)", go: () => cashGift(2 * G()) },
  { i: "🍊", t: "5 мандаринов", go: () => addM(5 * G()) },
  { i: "🔥", t: "Доход ×2 на 5 минут", go: () => buffGift(5 * G()) },
  { i: "📄", t: "Обычный бланк", b: 1, go: () => blankGift("basic") },
  { i: "🍊", t: "8 мандаринов", go: () => addM(8 * G()) },
  { i: "💰", t: "Пачка монет (5 мин дохода)", go: () => cashGift(5 * G()) },
  { i: "💼", t: "Премиум-бланк", b: 1, go: () => blankGift("prem") },
  { i: "🍊", t: "10 мандаринов", go: () => addM(10 * G()) },
  { i: "🔥", t: "Доход ×2 на 10 минут", go: () => buffGift(10 * G()) },
  { i: "💰", t: "Мешок денег (10 мин дохода)", go: () => cashGift(10 * G()) },
  { i: "🍊", t: "15 мандаринов", go: () => addM(15 * G()) },
  { i: "💼", t: "Премиум-бланк", b: 1, go: () => blankGift("prem") },
  { i: "🎄", t: "Новогодний красивый номер", go: () => nyGift(1, 15) },
  { i: "💰", t: "Мешок денег (15 мин дохода)", go: () => cashGift(15 * G()) },
  { i: "🍊", t: "20 мандаринов", go: () => addM(20 * G()) },
  { i: "🎄", t: "Ёлочный бланк", b: 1, go: () => blankGift("ny") },
  { i: "🔥", t: "Доход ×2 на 15 минут", go: () => buffGift(15 * G()) },
  { i: "💰", t: "Мешок денег (20 мин дохода)", go: () => cashGift(20 * G()) },
  { i: "🍊", t: "25 мандаринов", go: () => addM(25 * G()) },
  { i: "🎄", t: "Новогодний редкий номер", go: () => nyGift(2, 25) },
  { i: "👑", t: "Элитный бланк", b: 1, go: () => blankGift("elite") },
  { i: "💰", t: "Сундук денег (30 мин дохода)", go: () => cashGift(30 * G()) },
  { i: "🍊", t: "30 мандаринов", go: () => addM(30 * G()) },
  { i: "🎄", t: "Ёлочный бланк", b: 1, go: () => blankGift("ny") },
  { i: "🔥", t: "Доход ×2 на 30 минут", go: () => buffGift(30 * G()) },
  { i: "💰", t: "Сундук денег (45 мин дохода)", go: () => cashGift(45 * G()) },
  { i: "🍊", t: "40 мандаринов", go: () => addM(40 * G()) },
  { i: "🎄", t: "Новогодний блатной номер", go: () => nyGift(3, 40) },
  { i: "💼", t: "Чемодан денег и 50 мандаринов", go: () => { cashGift(60 * G()); addM(50 * G()); } },
  { i: "🎅", t: "Новогодняя ЛЕГЕНДА", go: () => { giveNy(4, L("Подарок новогодней ночи")); if (N().gold) addM(60); } },
  { i: "🌟", t: "Праздничный контейнер", gold: 1, car: 1, go: () => { closeModal(); window.DC_NY && DC_NY.open("paid"); } }   // 32-й — 1 января, только с «Золотым календарём»
];
CAL.forEach(c => Lprops(c, "t"));
const LAST = 30;                                            // индекс 31-го подарка
const calLen = () => N().gold ? CAL.length : CAL.length - 1;
const calAvail = () => { if (FORCE === "1" || DEMO) return CAL.length; const d = nowD(); return d.getMonth() === 11 ? d.getDate() : d.getMonth() === 0 ? CAL.length : 0; };   // сколько подарков открыто по дате
const calDate = i => i < 31 ? L("{0} дек", i + 1) : L("1 янв");
const calReady = () => nyOn() && S.tut === -1 && N().cal < Math.min(calLen(), calAvail());
function calOpen(i) {
  const s = N(); if (i !== s.cal || !calReady()) return;
  const c = CAL[i], blank = !!c.b;
  if (blank && rolling) return toast(L("Дождись, пока допечатается номер"));
  if (c.car && window.DC_NY && DC_NY.busy()) return toast(L("Дождись, пока откроется контейнер"));
  s.cal++; Platform.track("ny_gift_" + s.cal);
  bells(); fx.confetti(60, ["#ff3d71", "#7dff8a", "#ffd23f", "#fff", "#4fc3f7"]);
  c.go(); save(); renderBar(); updateMoreDot();
  if (!blank && !c.car && i < LAST && !$("modal").classList.contains("hidden")) openNy("cal");
  else if (i === LAST) closeModal();
}

// ----- «Ёлочный базар»: обмен мандаринов
const SHOP_NY = [
  { k: "cash",  i: "💰", t: "Мешок денег",                  d: () => L("{0} 💰 — 20 минут дохода", fmt(cashMin(20))), c: 10 },
  { k: "buff",  i: "🔥", t: "Доход ×2 на 15 минут",         d: () => Platform.name === "tg" ? "продлевает активный ×2" : L("складывается с рекламным ×2 по времени"), c: 20 },
  { k: "prem",  i: "💼", t: "Премиум-бланк",                 d: () => L("бесплатная покупка с рулеткой"), c: 15, lvl: () => PACKS.prem.lvl },
  { k: "elite", i: "👑", t: "Элитный бланк",                 d: () => L("бесплатная покупка с рулеткой"), c: 40, lvl: () => PACKS.elite.lvl },
  { k: "nyb",   i: "🎄", t: "Новогодний блатной номер",      d: () => L("под замком · осталось {0} из 3", 3 - N().bp), c: 60, left: () => N().bp < 3 },
  { k: "nyl",   i: "🎅", t: "Новогодняя легенда",            d: () => L("одна за праздники · {0}", N().bl ? L("уже твоя") : L("доступна")), c: 250, left: () => !N().bl },
  { k: "nycase", i: "🎄", t: "Ёлочный бланк",                d: () => L("бесплатное открытие с рулеткой · номер в новогоднем оформлении"), c: 25, lvl: () => NY_PACK.lvl },
  { k: "nybox", i: "🎁", t: "Подарочный контейнер",          d: () => L("тачка эпическая и выше: новогодняя или в зимней ливрее · осталось {0} из 5", BOX_MAX - (N().gb || 0)), c: BOX_M, left: () => (N().gb || 0) < BOX_MAX },
  ...NY_COS.map(([k, x]) => ({ k: "cos_" + k + "_" + x.id, i: k === "hold" ? "🖼" : k === "fx" ? "✨" : "🏠", t: x.n, d: () => L("оформление навсегда"), c: x.ny, cos: [k, x] }))
];
SHOP_NY.forEach(x => Lprops(x, "t"));
function nyBuy(key) {
  const it = SHOP_NY.find(x => x.k === key), s = N(); if (!it || !nyOn()) return;
  if (it.cos && S.cos.own.includes(it.cos[0] + ":" + it.cos[1].id)) return;
  if (it.left && !it.left()) return;
  if (it.lvl && S.lvl < it.lvl()) return toast(L("Откроется на уровне {0}", it.lvl()));
  if (s.m < it.c) return toast(L("Нужно {0} 🍊", it.c));
  if ((key === "prem" || key === "elite" || key === "nycase") && rolling) return toast(L("Дождись, пока допечатается номер"));
  if (key === "nybox" && (!window.DC_NY || DC_NY.busy())) return toast(L("Дождись, пока откроется контейнер"));
  s.m -= it.c; Platform.track("ny_shop_" + key);
  if (key === "cash") cashGift(20);
  else if (key === "buff") buffGift(15);
  else if (key === "prem" || key === "elite" || key === "nycase") { freeBlank(key === "nycase" ? "ny" : key); save(); return; }
  else if (key === "nyb") { s.bp++; closeModal(); giveNy(3, L("Ёлочный базар")); }
  else if (key === "nyl") { s.bl = 1; closeModal(); giveNy(4, L("Ёлочный базар")); }
  else if (key === "nybox") { s.gb = (s.gb || 0) + 1; closeModal(); DC_NY.open("gift"); bells(); save(); renderBar(); return; }
  else if (it.cos) { const [k, x] = it.cos; S.cos.own.push(k + ":" + x.id); S.cos[k] = x.id; applyCos(); sendState(); fx.confetti(80); Snd.win(2); toast(L("🎨 «{0}» — твоё навсегда!", x.n)); }
  bells(); save(); renderBar(); if (!$("modal").classList.contains("hidden")) openNy("shop");
}

// ----- новогодние эксклюзивы за донат (звёзды Telegram, голоса ВК, яны Яндекса). Цены и названия — в server/src/worker.js (ITEMS);
// в Яндексе каждый товар нужно завести в консоли с тем же ключом. Продаются только в праздники.
const NY_PAID = [
  { k: "ny_sani", st: 149, t: "Сани Деда Мороза", d: () => L("Суперлегендарная машина и именной номер"), done: () => !!S.paid.ny_sani },
  { k: "ny_gold", st: 99, i: "🌟", t: "Золотой календарь", hit: 1, d: () => L("бонусы к оставшимся подаркам, праздничный контейнер с 1 января и гараж «Золотая ёлка» навсегда"), done: () => !!N().gold },
  { k: "ny_set", st: 79, i: "🎁", t: "Новогодний набор", d: () => L("300 🍊, новогодняя легенда и доход ×2 на 3 часа · один раз"), done: () => !!S.paid.ny_set },
  { k: "case_ny", st: 39, i: "🎅", t: "Кейс Деда Мороза", d: () => L("3 новогодних номера сразу: блатной, легенда (25%) или суперлегенда (2%)") },
  { k: "box_ny", st: 79, i: "📦", t: "Праздничный контейнер", hit: 1, d: () => L("все новогодние тачки: Куранты и Снегурочка — 30%, шанс на Сани Деда Мороза") },
  { k: "ny_mand", st: 25, i: "🍊", t: "Мешок мандаринов", d: () => L("150 мандаринов для «Ёлочного базара»") },
  ...NY_COS_PAID.filter(([, x]) => x.st).map(([k, x]) => ({ k: "cos_" + k + "_" + x.id, st: x.st, i: "", t: x.n, cos: [k, x], d: () => L("анимированное оформление навсегда"), done: () => S.cos.own.includes(k + ":" + x.id) }))
];
NY_PAID.forEach(x => Lprops(x, "t"));
const GOLD_CALENDAR = NY_PAID.find(it => it.k === "ny_gold");
const paidList = () => nyOn() && Platform.canPay ? NY_PAID.filter(it => sells(it.k, it.st)) : [];
const buyItem = shopBuy;
shopBuy = function (item) {
  if (!nyOn() && NY_PAID.some(it => it.k === item)) return toast(L("Новогоднее событие закончилось."));
  buyItem(item);
};
function goldCalendarOfferPrice(s) {
  return hasFeaturedShop() && S.tut === -1 && s.cal > 0 && !s.gold && nyOn()
    ? priceOf(GOLD_CALENDAR.k, GOLD_CALENDAR.st) : null;
}
function openGoldCalendar() {
  const s = N(), price = goldCalendarOfferPrice(s);
  if (!price) return;
  const plate = S.plates[0] || { l1: "А", d: "777", l23: "АА", reg: "77", tier: 0 };
  openModal(`<div class="nymodal nygold-details"><h2>🌟 ${GOLD_CALENDAR.t}</h2>
    <div class="nygold-garage gar-goldtree"><div><small>Оформление гаража</small><b>Золотая ёлка</b></div><span aria-hidden="true">🎄</span>${plateHTML(plate, "small")}</div>
    <ul class="nygold-benefits">
      ${s.cal < calLen() ? `<li><b>Бонусы к оставшимся подаркам</b><small>Бонусы к монетам, мандаринам и ускорению. К бланкам и номерам — мандарины.</small></li>` : ""}
      <li><b>Дополнительный подарок</b><small>Праздничный контейнер доступен с 1 января.</small></li>
      <li><b>Гараж «Золотая ёлка» навсегда</b><small>Оформление включится сразу после покупки.</small></li>
    </ul>
    <button class="btn star shopbtn" type="button" data-act="shopBuy" data-k="${GOLD_CALENDAR.k}"><span>Купить календарь</span><b>${price}</b></button>
    <button class="btn alt" type="button" data-act="nyOpen" data-t="cal">К подаркам</button></div>`);
}
const SANI_PLATE = { l1: "Х", d: "001", l23: "ОХ", reg: "77" };
const _shopGrant = shopGrant;
shopGrant = function (item, why) {
  const s = N();
  if (item === "ny_mand") { addM(150); toast(L("🍊 +150 мандаринов!")); }
  else if (item === "case_ny") {
    closeModal();
    for (let i = 0; i < 3; i++) { const x = Math.random() * 100; giveNy(x < 2 ? 5 : x < 27 ? 4 : 3, L("Кейс Деда Мороза · {0} из 3", i + 1)); }
  }
  else if (item === "ny_set") { S.paid.ny_set = 1; addM(300); S.buffUntil = Math.max(S.buffUntil, Date.now()) + 3 * 3600000; renderPills(); giveNy(4, L("Новогодний набор")); }
  else if (item === "ny_gold") {
    s.gold = 1; if (!S.cos.own.includes("gar:goldtree")) S.cos.own.push("gar:goldtree"); S.cos.gar = "goldtree"; applyCos(); sendState();
    enqueueCinema({ color: "#ffd23f", bg: "#2a1f05", cls: "nycine", icon: "🌟", top: L("Новогодний эксклюзив"), title: L("ЗОЛОТОЙ КАЛЕНДАРЬ"), sub: L("Бонусы к оставшимся подаркам включены. Праздничный контейнер доступен с 1 января. Гараж «Золотая ёлка» уже твой!"), confetti: 160 });
  }
  else if (item === "box_ny" || item === "ny_sani") {
    if (!window.DC_NY) return _shopGrant(item, why);
    if (item === "ny_sani") {
      S.paid.ny_sani = 1;
      const held = heldKeys(), p = Object.assign({ id: S.nid++, tier: 4, ny: 1, lock: true, got: Date.now(), pack: "nygift" }, SANI_PLATE);
      if (!held.has(plateKey(p))) { p.val = nice(TIERS[4].val * 3); markFound(p); S.tc[4]++; keepPlate(p); }
    }
    closeModal(); DC_NY.open(item === "box_ny" ? "paid" : "sani");
  }
  else return _shopGrant(item, why);
  if (!why) S.paid.buys = (S.paid.buys || 0) + 1;
  Platform.track((why ? "gift_" : "paid_") + item); Platform.happytime(); bells(); save(); renderBar();
};
const _openShop = openShop;                               // в обычном магазине — баннер новогодних эксклюзивов
openShop = function () {
  _openShop(); if (!paidList().length) return;
  const h = $("mbox").querySelector("h2");
  if (h) h.insertAdjacentHTML("afterend", `<button class="btn star nyshopban" data-act="nyOpen" data-t="paid">${L("🎄 Новогодние эксклюзивы — только до 14 января")}</button>`);
};

// ----- окно события
let nyTab = "cal";
function untilText() {
  const d = nowD(), y = d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear(), ny = new Date(y, 0, 1), end = new Date(y, NY_TO[0] - 1, NY_TO[1] + 1);
  return d < ny ? L("до Нового года {0}", mmss(ny - d)) : L("праздник ещё {0}", mmss(end - d));
}
function openNy(t) {
  if (t) nyTab = t; const s = N();
  const tabs = [["cal", "🎁 Подарки"], ["shop", "🍊 Базар"], ...(paidList().length ? [["paid", "⭐ Эксклюзивы"]] : []), ["how", "❓ Как получить 🍊"]].map(([k, n]) => `<button class="btn sm ${k === nyTab ? "green" : "alt"}" data-act="nyOpen" data-t="${k}">${L(n)}</button>`).join("");
  let body = "";
  if (nyTab === "cal") {
    const avail = Math.min(calLen(), calAvail()), nx = s.cal, nc = CAL[nx];
    const goldPrice = goldCalendarOfferPrice(s);
    const goldCard = goldPrice ? `<button class="btn nygold-card" type="button" data-act="nyGoldCalendar">
      <span class="nygold-icon" aria-hidden="true">🌟</span><span class="nygold-copy"><strong>${GOLD_CALENDAR.t}</strong><small>${nx < calLen() ? "Больше наград и гараж «Золотая ёлка»" : "Дополнительный подарок и гараж «Золотая ёлка»"}</small></span><b>${goldPrice}</b></button>` : "";
    const head = nx >= calLen() ? `<div class="nyhead done">✅ ${L("Все подарки календаря открыты!")}</div>`
      : nx < avail ? `<div class="nyhead ready"><span class="nyhi">${nc.i}</span><div><small>${L("Подарок №{0} · {1}", nx + 1, calDate(nx))}${avail - nx > 1 ? " · " + L("ещё ждут: {0}", avail - nx - 1) : ""}</small><b>${nc.t}</b></div><button class="btn sm green ready" data-act="nyGift" data-i="${nx}">${L("Забрать")}</button></div>`
      : `<div class="nyhead"><span class="nyhi">🎁</span><div><small>${L("Следующий подарок — {0}", calDate(nx))}</small><b>${nc.t}</b></div></div>`;
    body = head + goldCard + `<div class="nycal">` +
      CAL.slice(0, calLen()).map((c, i) => { const done = i < s.cal, open = i < avail, ready = i === s.cal && open, big = i >= LAST;
        return `<button class="nygift ${done ? "done" : ready ? "ready" : open ? "wait" : "lock"} ${big ? "last" : ""} ${c.gold ? "gold" : ""}" ${ready ? `data-act="nyGift" data-i="${i}"` : "disabled"} title="${c.t}">
          <span class="nyd">${big ? calDate(i) : i + 1}</span><span class="nyi">${done ? "✅" : c.i}</span>${big ? `<small>${c.t}</small>` : ""}</button>`; }).join("") + `</div>` +
      `<p class="hint">${L("Подарок №N открывается N декабря. Пропустил — не страшно, накопившиеся подарки заберёшь подряд.")}</p>` +
      (s.gold ? `<p class="nyfest">🌟 ${L("Золотой календарь: бонусы к подаркам и 32-й подарок с 1 января")}</p>` : !goldCard && sells(GOLD_CALENDAR.k, GOLD_CALENDAR.st) ? `<button class="btn star" data-act="nyOpen" data-t="paid">🌟 ${L("Золотой календарь — бонусы и 32-й подарок")}</button>` : "");
  } else if (nyTab === "shop") {
    body = `<p class="hint">${L("Меняй мандарины на подарки. Мандарины сгорят после праздников — не копи их до весны!")}</p><div class="card coslist">` +
      SHOP_NY.map(it => { const own = it.cos && S.cos.own.includes(it.cos[0] + ":" + it.cos[1].id), lock = it.lvl && S.lvl < it.lvl(), gone = it.left && !it.left();
        const prev = it.cos ? (it.cos[0] === "hold" ? `<div class="oh-${it.cos[1].id}">${plateHTML({ l1: "Е", d: "027", l23: "ХО", reg: "77", tier: 3 }, "small other")}</div>` : it.cos[0] === "fx" ? `<div class="ppins pfx-${it.cos[1].id}">${plateHTML({ l1: "Е", d: "027", l23: "ХО", reg: "77", tier: 3 }, "small")}</div>` : `<div class="garswatch gar-${it.cos[1].id}">🚘</div>`)
          : `<div class="nysi">${it.i}</div>`;
        const btn = own ? (S.cos[it.cos[0]] === it.cos[1].id ? `<button class="btn sm alt" data-act="cos" data-t="${it.cos[0]}">${L("✓ Надето")}</button>` : `<button class="btn sm green" data-act="cosSet" data-k="${it.cos[0]}" data-v="${it.cos[1].id}">${L("Надеть")}</button>`) : gone ? "✅" : lock ? `<button class="btn sm alt" disabled>🔒 ${L("ур. {0}", it.lvl())}</button>`
          : `<button class="btn sm ${s.m >= it.c ? "green" : "alt"}" data-act="nyBuy" data-k="${it.k}" ${s.m >= it.c ? "" : "disabled"}>${it.c} 🍊</button>`;
        return `<div class="cosrow"><div class="cosprev nyprev">${prev}</div><div class="cosn"><b>${it.t}</b><small>${own ? L("куплено") : it.d()}</small></div>${btn}</div>`; }).join("") + `</div>`;
  } else if (nyTab === "paid" && paidList().length) {
    body = `<p class="nyoffer-note">${L("В продаже до 14 января")}</p><div class="nypaid">` +
      paidList().map(it => {
        const done = it.done && it.done();
        const titleId = `nyoffer-${it.k}`;
        const buy = done ? `<span class="nyoffer-owned">✓ ${L("куплено")}</span>`
          : `<button class="btn sm star" type="button" data-act="shopBuy" data-k="${it.k}" aria-describedby="${titleId}">${priceOf(it.k, it.st)}</button>`;
        if (it.k === "ny_sani") return `<article class="nyoffer nyoffer-sani">
          <img class="nyoffer-sani-photo" src="${DC_NY.photo("sani")}" alt="">
          <div class="nyoffer-sani-body"><h3 id="${titleId}">${it.t}</h3><p>${it.d()}</p>
            <div class="nyoffer-sani-footer">${plateHTML({ ...SANI_PLATE, tier: 4, ny: true }, "small other")}<div class="nyoffer-buy">${buy}</div></div></div></article>`;
        const prev = it.cos ? (it.cos[0] === "hold" ? `<div class="oh-${it.cos[1].id}">${plateHTML({ l1: "Е", d: "027", l23: "ХО", reg: "77", tier: 3 }, "small other")}</div>` : it.cos[0] === "fx" ? `<div class="ppins pfx-${it.cos[1].id}">${plateHTML({ l1: "Е", d: "027", l23: "ХО", reg: "77", tier: 3 }, "small")}</div>` : `<div class="garswatch gar-${it.cos[1].id}">🚘</div>`)
          : `<span aria-hidden="true">${it.i}</span>`;
        return `<article class="nyoffer ${it.hit ? "nyoffer-featured" : ""}"><div class="nyoffer-heading">${it.cos ? "" : `<span class="nyoffer-icon">${prev}</span>`}<h3 id="${titleId}">${it.t}</h3></div>
          <p>${it.d()}</p><div class="nyoffer-footer">${it.cos ? prev : ""}<div class="nyoffer-buy">${buy}</div></div></article>`;
      }).join("") + `</div>`;
  } else {
    nyTab = "how";
    body = `<div class="card nyhow">
      <p>📄 ${L("Бланки: обычный — иногда, премиум — часто, элитный — 1, чёрный — 3 мандарина")}</p>
      <p>🔀 ${L("Слияние номеров: 1–3 мандарина")}</p>
      <p>🚕 ${L("Такси: изредка мандарин выпадает из пассажира")}</p>
      <p>📅 ${L("Задания дня: +5 за каждое и +15 за сундук")}</p>
      <p>🎁 ${L("Календарь: мандарины почти каждый третий день, к Новому году — всё больше")}</p>
      <p class="hint">${L("Из бланков, слияний и такси — не больше {0} в день. Сегодня: {1}/{0}", DAY_CAP, s.dm)}</p></div>
      ${isHoliday() ? `<p class="nyfest">🥂 ${L("Сегодня праздник: доход гаража ×{0}!", HOLI)}</p>` : `<p class="hint">🥂 ${L("31 декабря и 1 января доход гаража ×{0}", HOLI)}</p>`}
      <div class="setrow"><span>${L("❄️ Снегопад")}</span><button class="tog ${s.snow ? "on" : ""}" data-act="nySnow"></button></div>`;
  }
  openModal(`<div class="nymodal"><h2>${L("🎄 Блатной Новый год")}</h2><div class="nytop"><b>🍊 ${fmt(s.m)}</b><small>${untilText()}</small></div>
    <div class="atabs">${tabs}</div>${body}<button class="btn alt" data-act="closeModal">${L("Закрыть")}</button></div>`);
}

// ----- полоска на главной, плашка сверху, точка на «Ещё», карточка во вкладке «Ещё»
function barHTML() {
  const s = N(), ready = calReady();
  return `<button class="nybar ${ready ? "ready" : ""}" data-act="nyOpen"><span class="nyb-t">🎄 ${L("Новый год")}</span><span class="nyb-m">🍊 ${fmt(s.m)}</span><span class="nyb-g">${ready ? L("🎁 Подарок ждёт!") : s.cal >= calLen() ? L("все подарки открыты") : L("🍊 Базар")}</span></button>`;
}
// ----- тизер «Скоро Новый год»: 1–14 декабря (до старта события) — плашка, полоска над бланками и окно «что будет». Проверка: ?nyteaser на 127.0.0.1
const teaserOn = () => { if (nyOn() || S.tut !== -1) return false; if (Q.has("nyteaser") && LOCAL) return true; const d = nowD(); return d.getMonth() === 10 && d.getDate() >= 20; };
const teaseLeft = () => { const d = nowD(); return new Date(d.getFullYear(), 11, 1) - d; };
function openTease() {
  Platform.track("ny_tease_open");
  const car = (k, t) => `<div class="nyt-car"><img src="cars/${k}.webp" alt=""><b>${L(t)}</b></div>`;
  openModal(`<div class="nymodal nytease"><h2>${L("🎄 Скоро: Блатной Новый год")}</h2>
    <div class="nytop"><b>${L("1 декабря")}</b><small>${L("старт через {0}", mmss(teaseLeft()))}</small></div>
    <div class="nyt-cars">${car("sani", "Сани Деда Мороза")}${car("kuranty", "Куранты")}${car("sneg", "Снегурочка")}</div>
    <div class="card nyhow">
      <p>🏎️ ${L("Новогодние тачки — только в праздники, потом их не достать")}</p>
      <p>📦 ${L("Праздничный контейнер и Кейс Деда Мороза")}</p>
      <p>🍊 ${L("Мандарины и «Ёлочный базар»")}</p>
      <p>🎁 ${L("Календарь на весь декабрь: подарок каждый день, чем ближе Новый год — тем круче. 31-й — новогодняя легенда")}</p>
      <p>❄️ ${L("Снег, гирлянды и Дед Мороз в гараже")}</p></div>
    <button class="btn green" data-act="nyTeaseOk">${L("Жду! 🎄")}</button></div>`);
}
function renderBar() {
  let b = $("nyBar");
  if (teaserOn()) {
    if (!b) { b = document.createElement("div"); b.id = "nyBar"; const p = $("packs"); p.parentNode.insertBefore(b, p); }
    b.innerHTML = `<button class="nybar tease" data-act="nyTease"><span class="nyb-t">🎄 ${L("Скоро Новый год")}</span><span class="nyb-m">${mmss(teaseLeft())}</span><span class="nyb-g">${L("что будет →")}</span></button>`;
    return;
  }
  if (!nyOn() || S.tut !== -1) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement("div"); b.id = "nyBar"; const p = $("packs"); p.parentNode.insertBefore(b, p); }
  b.innerHTML = barHTML();
}
const _renderPacks = renderPacks;
renderPacks = function () {
  _renderPacks(); renderBar();
  const b = document.querySelector('#packs [data-pack="ny"]'), row = b && b.closest(".pack");
  if (row) { row.classList.add("nypack"); row.parentNode.prepend(row); }
};
const _renderPills = renderPills;
renderPills = function () {
  _renderPills();
  if (teaserOn()) { $("pills").insertAdjacentHTML("afterbegin", `<span class="pill nypill tease" data-act="nyTease">${L("🎄 Новый год через {0}", mmss(teaseLeft()))}</span>`); return; }
  if (!nyOn()) return;
  $("pills").insertAdjacentHTML("afterbegin", `<span class="pill nypill" data-act="nyOpen">${isHoliday() ? L("🥂 Праздник: доход ×{0}", HOLI) : "🎄 " + untilText()}</span>`);
};
const _updateMoreDot = updateMoreDot;
updateMoreDot = function () { _updateMoreDot(); if (calReady()) $("moreDot").classList.add("on"); };
const _renderMore = renderMore;
renderMore = function () {
  _renderMore(); if (!nyOn() || S.tut !== -1) return;
  const h = $("tab-more").querySelector("h2"); if (h) h.insertAdjacentHTML("afterend", `<div class="nymore">${barHTML()}</div>`);
};

// ----- снегопад: свой холст под интерфейсом, лёгкий (до 70 снежинок, без перерисовки во фоне)
const snow = { cv: null, c: null, f: [], on: false, last: 0 };
function snowStart() {
  if (snow.on) return;
  if (!snow.cv) { snow.cv = document.createElement("canvas"); snow.cv.id = "nysnow"; document.body.insertBefore(snow.cv, $("app")); snow.c = snow.cv.getContext("2d"); }
  snow.on = true; snow.cv.style.display = ""; snowSize(); requestAnimationFrame(snowLoop);
}
function snowStop() { snow.on = false; if (snow.cv) snow.cv.style.display = "none"; }
function snowSize() {
  if (!snow.cv) return; const w = innerWidth, h = innerHeight; snow.cv.width = w; snow.cv.height = h;
  const n = Math.min(70, Math.round(w * h / 9000));
  while (snow.f.length < n) snow.f.push({ x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2.6, v: 18 + Math.random() * 40, ph: Math.random() * 6.28 });
  snow.f.length = n;
}
addEventListener("resize", snowSize);
function snowLoop(t) {
  if (!snow.on) return;
  const dt = Math.min((t - (snow.last || t)) / 1000, 0.05); snow.last = t;
  if (!hidden) {
    const c = snow.c, w = snow.cv.width, h = snow.cv.height; c.clearRect(0, 0, w, h); c.fillStyle = "#fff";
    for (const f of snow.f) {
      f.y += f.v * dt; f.ph += dt; f.x += Math.sin(f.ph) * 12 * dt;
      if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
      c.globalAlpha = 0.35 + f.r / 6; c.beginPath(); c.arc(f.x, f.y, f.r, 0, 6.283); c.fill();
    }
    c.globalAlpha = 1;
  }
  requestAnimationFrame(snowLoop);
}
function applySnow() { nyOn() && N().snow ? snowStart() : snowStop(); }

// ----- праздничный вид интерфейса и ночного города
function applyDeco() {
  const on = nyOn();
  document.body.classList.toggle("ny", on);
  window.BgCity?.setWinter?.(on);
}

// ----- сюжет и праздничные моменты (проверка раз в 3 секунды, когда игрок не занят)
let introQ = false;
function nyTick() {
  syncTime();
  const had = !!PACKS.ny; syncPack(); if (had !== !!PACKS.ny && tab === "buy" && !rolling) renderPacks();
  applyDeco(); if (!nyOn()) { snowStop(); renderBar(); return; }
  applySnow(); if (S.tut !== -1 || S.drawn < 3) return;
  const s = N();
  if (!s.intro && !introQ && !talkBusy() && !Talk.cur) {
    introQ = true;                                         // отметка — в конце диалога: закрыл игру посреди него — Дед Мороз придёт снова
    say([["ded", "Хо-хо-хо! Слыхал я, тут самый блатной гараж в городе?"],
      ["ded", "Принёс тебе мешок мандаринов 🍊 — они выпадают из бланков, слияний и даже из такси."],
      ["ded", "Меняй их на «Ёлочном базаре», а в календаре каждый день тебя ждёт подарок — чем ближе Новый год, тем круче. Тридцать первый — в новогоднюю ночь!"],
      ["valera", "Дед, а номер с цифрами 001 под ёлку положишь? 😏"],
      ["ded", "Хорошо себя вёл — будет! Жми на 🎄 над бланками."]], () => { N().intro = 1; addM(10); bells(); save(); });
  }
  if (isNewYearDay() && s.ny1 !== 1 && !talkBusy()) {
    s.ny1 = 1; const v = cashMin(60); gain(v); s.m += 30; save(); bells();
    enqueueCinema({ color: "#ffd23f", big: true, bg: "#0b2a46", cls: "nycine", icon: "🎆", top: L("Куранты пробили!"), title: L("С НОВЫМ ГОДОМ!"),
      value: v, valueLabel: L("ПОДАРОК"), valueIcon: "💰", sub: L("+30 🍊 и праздничный доход ×{0} весь день 1 января. Пусть все номера будут блатными!", HOLI), confetti: 220 });
    renderBar();
  }
}
setInterval(nyTick, 3000);

// ----- кнопки
Object.assign(ACTS, {
  nyTease: () => openTease(),
  nyTeaseOk: () => { Platform.track("ny_tease_wait"); closeModal(); bells(); fx.confetti(40, ["#ff3d71", "#7dff8a", "#ffd23f", "#fff"]); },
  nyOpen: d => openNy(d.t),
  nyGoldCalendar: () => openGoldCalendar(),
  nyGift: d => calOpen(+d.i),
  nyBuy: d => nyBuy(d.k),
  nySnow: (d, e, el) => { const s = N(); s.snow = s.snow ? 0 : 1; el.classList.toggle("on", !!s.snow); applySnow(); save(); }
});

// старт: облачное сохранение может прийти позже — N() сам создаст состояние события
if (DEMO) {
  Object.defineProperty(Platform, "canPay", { get: () => true, configurable: true });
  Platform.price = (k, st) => "⭐ " + st + " · демо";
  shopBuy = function (k) { closeModal(); toast("🧪 Демо: покупка бесплатно"); shopGrant(k); save(); renderAll(); };
  if (S.tut !== -1) { tutHide(); S.tut = -1; } S.drawn = Math.max(S.drawn, 20); S.lvl = Math.max(S.lvl, 15); S.story.ch = Math.max(S.story.ch, 99);
  S.coins = Math.max(S.coins, 5e7); const s = N(); s.intro = 1; s.m = Math.max(s.m, 5000); save();
  setInterval(() => { const s = N(); if (s.m < 1000) s.m = 5000; s.gb = 0; s.calDay = ""; if (s.cal >= (s.gold ? 32 : 31)) s.cal = 0; S.paid.ny_set = 0; S.paid.ny_sani = 0; }, 1500);
  const DEMO_BTN = [["box_ny", "📦 Праздничный контейнер (донат)"], ["nygift", "🎁 Подарочный контейнер (за 🍊)"], ["case_ny", "🎅 Кейс Деда Мороза (3 номера)"], ["ny_sani", "🛷 Сани Деда Мороза"],
    ["nyblank", "🎄 Ёлочный бланк"], ["ny_set", "🎁 Новогодний набор"], ["ny_gold", "🌟 Золотой календарь"], ["nyfest", "🎆 Сцена «С Новым годом!»"], ["box_star", "⭐ Звёздный контейнер (для сравнения)"]];
  ACTS.nyDemo = d => {
    const k = d.k; closeModal();
    if (k === "nygift") { if (window.DC_NY) DC_NY.open("gift"); }
    else if (k === "nyblank") { openTab("buy"); S.coins += packPrice("ny"); buy("ny"); }
    else if (k === "nyfest") enqueueCinema({ color: "#ffd23f", big: true, bg: "#0b2a46", cls: "nycine", icon: "🎆", top: L("Куранты пробили!"), title: L("С НОВЫМ ГОДОМ!"), value: cashMin(60), valueLabel: L("ПОДАРОК"), valueIcon: "💰", sub: L("+30 🍊 и праздничный доход ×{0} весь день 1 января. Пусть все номера будут блатными!", HOLI), confetti: 220 });
    else shopGrant(k);
    save();
  };
  ACTS.nyDemoOpen = () => openModal(`<h2>🧪 Демо новогоднего обновления</h2><p class="hint">Всё бесплатно, мандарины не кончаются. Работает только на этом компьютере (адрес 127.0.0.1 и ?nydemo).</p>
    ${DEMO_BTN.map(([k, t]) => `<button class="btn ${/^(box_ny|ny_sani|case_ny)$/.test(k) ? "star" : "alt"}" data-act="nyDemo" data-k="${k}">${t}</button>`).join("")}
    <button class="btn alt" data-act="nyOpen" data-t="paid">⭐ Окно «Эксклюзивы»</button><button class="btn alt" data-act="closeModal">Закрыть</button>`);
  const b = document.createElement("button"); b.className = "nydemo"; b.dataset.act = "nyDemoOpen"; b.textContent = "🧪 Демо"; document.body.appendChild(b);
}
syncTime(); applyDeco(); applySnow(); renderBar(); renderPills();
window.NY = { on: nyOn, open: openNy, season, boxCost: BOX_M, m: () => N().m, boxLeft: () => Math.max(0, BOX_MAX - (N().gb || 0)),   // cars.js: «Подарочный контейнер» в ленте
  spendBox: () => { const s = N(); if (!nyOn() || (s.gb || 0) >= BOX_MAX || s.m < BOX_M) return false; s.m -= BOX_M; s.gb = (s.gb || 0) + 1; renderBar(); save(); return true; } };                     // для проверки из консоли
})();
