// ===================== ТАЧКИ: вкладка «Тачки» — контейнеры с машинами, номера на тачках, коллекция =====================
// Подключается после game.js и пользуется его функциями: S, fmt, toast, fx, openModal, plateHTML…
// Фото машин — Wikimedia Commons (свободные лицензии), авторы — в CREDITS ниже и в окне «Авторы фото» внизу вкладки.
// Звёздный контейнер — покупка за звёзды Telegram через магазин бота (товар box_star в server/src/worker.js).
// Смысл: тачка без номера не зарабатывает. Вешаешь на неё свой номер из гаража — тачка приносит доход,
// чем круче номер, тем больше. Редкость номера = редкость тачки → «идеальная пара» ×1.5.
"use strict";
(() => {
const RC = [
  { n: "Обычная", tag: "ОБЫЧНАЯ", c: "#9aa5b8" }, { n: "Редкая", tag: "РЕДКАЯ", c: "#4fc3f7" }, { n: "Эпическая", tag: "ЭПИЧЕСКАЯ", c: "#b388ff" },
  { n: "Легендарная", tag: "ЛЕГЕНДАРНАЯ", c: "#ffb300" }, { n: "Мифическая", tag: "МИФИЧЕСКАЯ", c: "#ff3d71" }, { n: "Суперлегенда", tag: "СУПЕРЛЕГЕНДА", c: "#5ef2ff" },
];
const PM = [1, 1.2, 1.4, 1.75, 2.5, 4], PAIR = 1.5, INC_SEC = 5400, SELL = 0.5;   // множитель от номера, пара, окупаемость тачки в секундах, продажа за половину
// q — место номера на фото в % ширины/высоты картинки: верх-лево, верх-право, низ-право, низ-лево
const CARS = [
  ["granta", "Lada Granta", 0, 20000, [5.1, 69.3, 17.7, 69.1, 17.7, 75.8, 5.1, 76.1]],
  ["logan", "Dacia Logan", 0, 22000, [8.5, 61, 22, 62.5, 22, 70, 8.5, 68.5]],
  ["solaris", "Hyundai Accent", 0, 24000, [6.5, 63.5, 17.5, 64, 17.5, 70.8, 6.5, 70.3]],
  ["rio", "Kia Rio", 0, 26000, [84, 69.5, 95, 67.5, 95, 75, 84, 77]],
  ["polo", "Volkswagen Polo", 0, 27000, [6.5, 65.5, 19.5, 67, 19.5, 75.5, 6.5, 74]],
  ["vesta", "Lada Vesta", 0, 28000, [7.5, 66, 23.5, 67, 23.5, 75, 7.5, 74]],
  ["octavia", "Škoda Octavia", 1, 70000, [7, 66, 17, 67, 17, 74.5, 7, 73]],
  ["passat", "Volkswagen Passat", 1, 78000, [6, 63, 17.5, 64, 17.5, 72, 6, 71]],
  ["mazda6", "Mazda 6", 1, 85000, [84, 72, 95, 71, 95, 79, 84, 80]],
  ["tiguan", "Volkswagen Tiguan", 1, 95000, [7, 68.5, 19, 70, 19, 77.5, 7, 76]],
  ["camry", "Toyota Camry", 1, 110000, [83.5, 67.5, 94, 67.3, 94, 74.3, 83.5, 74.5]],
  ["a6", "Audi A6", 2, 200000, [3.3, 64, 11.7, 65.2, 11.7, 72.6, 3.3, 70.6]],
  ["bmw5", "BMW 5 Series", 2, 230000, [10.4, 71, 21.8, 73.4, 21.8, 80.4, 10.4, 77.6]],
  ["eclass", "Mercedes-Benz E-Class", 2, 250000, [7.3, 72.1, 17.9, 75, 17.9, 81.7, 7.3, 78.8]],
  ["cayenne", "Porsche Cayenne", 2, 280000, [83.9, 68.4, 92.9, 65.8, 92.9, 72.4, 83.9, 75.5]],
  ["lc", "Toyota Land Cruiser", 2, 300000, [8.5, 70, 19.5, 70, 19.5, 77.5, 8.5, 77.5]],
  ["lc300", "Lexus LX", 2, 320000, [7.3, 58.5, 17.5, 58.8, 17.5, 65.3, 7.3, 65]],
  ["m5", "BMW M5", 3, 600000, [0.8, 73.5, 16.8, 76, 16.8, 83.5, 0.8, 81]],
  ["rr", "Range Rover", 3, 750000, [86, 61, 96, 59.5, 96, 67, 86, 68.5]],
  ["gclass", "Mercedes-Benz G-Class", 3, 900000, [83, 60, 91.5, 59.5, 91.5, 66, 83, 66.5]],
  ["p911", "Porsche 911", 3, 1000000, [89, 68, 98, 66, 98, 72, 89, 74]],
  ["urus", "Lamborghini Urus", 3, 1200000, [11, 73, 25, 74, 25, 81.5, 11, 80.5]],
  ["mcl720", "McLaren 720S", 4, 2500000, [85.5, 71, 94, 73.5, 94, 80.5, 85.5, 78]],
  ["aventador", "Lamborghini Aventador", 4, 3000000, [81, 71, 91, 73.5, 91, 80, 81, 78]],
  ["sf90", "Ferrari SF90", 4, 3500000, [84, 72, 94, 70, 94, 77, 84, 79]],
  ["cullinan", "Rolls-Royce Cullinan", 4, 5000000, [12, 67.5, 29, 68.5, 29, 77, 12, 76]],
  ["phantom", "Rolls-Royce Phantom", 5, 12000000, [5.5, 70.5, 18.5, 71.5, 18.5, 80, 5.5, 79]],
  ["aurus", "Aurus Senat", 5, 15000000, [93.4, 65.6, 98.9, 65, 98.9, 71.1, 93.4, 71.5]],
  ["huayra", "Pagani Huayra", 5, 25000000, [80, 80, 90, 81, 90, 86.5, 80, 85.5]],
  ["jesko", "Koenigsegg Agera RS", 5, 30000000, [3, 64, 13, 67, 13, 73, 3, 70]],   // ключ jesko остаётся ради сохранений; на фото — Agera RS
  ["chiron", "Bugatti Chiron", 5, 40000000, [81, 79.5, 91, 80, 91, 85.5, 81, 85]],
].map(([k, n, r, p, q]) => ({ k, n, r, p, q, base: p / INC_SEC }));
const CK = Object.fromEntries(CARS.map(c => [c.k, c]));
// build.ps1: window.CARS_CLEAN (ВК и Яндекс) — фото из cars-clean с затёртыми логотипами; window.CARS_NOBRAND (только ВК) — прозвища вместо марок
const NOBRAND = !!window.CARS_NOBRAND, CLEAN = !!window.CARS_CLEAN;
if (NOBRAND) {
  const NN = { granta: "Народный седан", logan: "Бюджетник", solaris: "Таксист", rio: "Городской седан", polo: "Студент", vesta: "Свежак с завода",
    octavia: "Практичный лифтбек", passat: "Бизнес-лайт", mazda6: "Красный самурай", tiguan: "Семейный кроссовер", camry: "Три с половиной",
    a6: "Немецкий бизнес", bmw5: "Пятёрка", eclass: "Министерский", cayenne: "Перчик", lc: "Крузак", lc300: "Люкс-внедорожник",
    m5: "Бешеная пятёрка", rr: "Британский лорд", gclass: "Кубик", p911: "Спорт-классика", urus: "Бык-кроссовер",
    mcl720: "Британская ракета", aventador: "Бык V12", sf90: "Красный гибрид", cullinan: "Алмаз",
    phantom: "Дворец на колёсах", aurus: "Кортеж", huayra: "Ветер Анд", jesko: "Шведский призрак", chiron: "Король скорости" };
  CARS.forEach(c => { c.n = NN[c.k]; Lprops(c, "n"); });
}
const IMGV = 3;                                            // поменяли фото — увеличь, чтобы Telegram не показывал старые из кэша
const img = k => `cars/${k}.webp?v=${IMGV}${CLEAN ? "c" : ""}`;   // у фото без логотипов своя метка — кэш не подсунет старые с логотипами
// авторы фото (Wikimedia Commons): ключ — [автор, лицензия]
const CREDITS = { granta: ["Ilya Plekhanov", "CC BY-SA 4.0"], logan: ["Mihnea Lazăr", "CC BY-SA 4.0"], solaris: ["Kevauto", "CC BY-SA 4.0"], rio: ["Vauxford", "CC BY-SA 4.0"],
  polo: ["M 93", "CC BY-SA 3.0 DE"], vesta: ["Throwawayacc222", "CC0"], octavia: ["Mike-fiesta", "CC BY-SA 4.0"], passat: ["M 93", "CC BY-SA 3.0 DE"], mazda6: ["Vauxford", "CC BY-SA 4.0"],
  tiguan: ["Alexander-93", "CC BY-SA 4.0"], camry: ["EurovisionNim", "CC BY-SA 4.0"], a6: ["Alexander-93", "CC BY-SA 4.0"], bmw5: ["Alexander-93", "CC BY-SA 4.0"], eclass: ["Alexander-93", "CC BY-SA 4.0"],
  cayenne: ["M 93", "CC BY-SA 3.0 DE"], lc: ["Autosdeprimera", "CC BY 3.0"], lc300: ["Kevauto", "CC BY-SA 4.0"], m5: ["Alexander Migl", "CC BY-SA 4.0"], rr: ["Vauxford", "CC BY-SA 4.0"],
  gclass: ["Julian Herzog", "CC BY 4.0"], p911: ["Matti Blume", "CC BY-SA 4.0"], urus: ["Alexander Migl", "CC BY-SA 4.0"], mcl720: ["Vauxford", "CC BY-SA 4.0"], aventador: ["Calreyn88", "CC BY-SA 4.0"],
  sf90: ["Alexandre Prevot", "CC BY-SA 2.0"], cullinan: ["Vauxford", "CC BY-SA 4.0"], phantom: ["Vauxford", "CC BY-SA 4.0"], aurus: ["DIM68", "CC BY 4.0"], huayra: ["Matti Blume", "CC BY-SA 4.0"],
  jesko: ["Matti Blume", "CC BY-SA 4.0"], chiron: ["Calreyn88", "CC BY-SA 4.0"] };
// шансы по редкостям тачек, %: [обычн, редк, эпик, леген, миф, суперлегенда]
// звёздный — первым: его видно сразу при входе и в ленте контейнеров
const BOXES = [
  { id: "star", n: "Звёздный контейнер", sn: "Звёздный", r: 5, stars: 49, odds: [0, 0, 0, 0, 70, 30], star: 1, note: "Мифическая или суперлегенда — всегда" },
  { id: "common", n: "Обычный контейнер", sn: "Обычный", r: 0, price: 150000, odds: [75, 20, 4.5, .5, 0, 0], note: "С него все начинают" },
  { id: "rare", n: "Редкий контейнер", sn: "Редкий", r: 1, price: 500000, odds: [20, 55, 20, 5, 0, 0], free: 1, note: "В основном редкие тачки" },
  { id: "epic", n: "Эпический контейнер", sn: "Эпический", r: 2, price: 1500000, odds: [0, 30, 55, 14, 1, 0], free: 1, note: "Обычных тачек внутри нет" },
  { id: "leg", n: "Легендарный контейнер", sn: "Легендарный", r: 3, price: 5000000, odds: [0, 0, 50, 44, 5.9, .1], note: "Почти половина — легендарные" },
  { id: "elite", n: "Элитный контейнер", sn: "Элитный", r: 3, price: 12000000, odds: [0, 0, 0, 75, 24, 1], elite: 1, note: "Только легендарные и выше" },
];
RC.forEach(r => Lprops(r, "n", "tag")); BOXES.forEach(b => Lprops(b, "n", "sn", "note"));   // переводятся при чтении (английский — в i18n.js)
// звёздный (он первый в списке) — только там, где есть оплата звёздами. Проверяем каждый раз: SDK Telegram грузится уже после старта игры
const minBi = () => sells("box_star", 49) ? 0 : 1;   // Telegram — звёзды, ВК — голоса, Яндекс — если товар box_star есть в каталоге
const starPrice = () => priceOf("box_star", 49);
// обычный контейнер бесплатно за рекламу — раз в AD_BOX_GAP
const AD_BOX = "common", AD_BOX_GAP = 15 * 60000;
const boxCol = b => b.elite ? "#ffd23f" : b.star ? "#5ef2ff" : RC[b.r].c;

// ---------- состояние (хранится в сохранении игры) ----------
function D() {
  if (!S.dc) S.dc = { cars: [], nid: 1, seen: [], sub: "boxes", filt: -1 };
  if (!S.dc.v2) { S.dc.v2 = 1; S.dc.bi = 0; S.dc.free = { rare: 1, epic: 1 }; }   // бесплатные — по id контейнера; при входе показываем звёздный
  if (!S.dc.v3) { S.dc.v3 = 1; S.dc.slots = Math.min(SLOT_COST.length, Math.max(0, S.dc.cars.length - SLOT0)); }   // у кого тачек уже больше 3 — места под них даём сразу
  return S.dc;
}
// ---------- места в гараже: сначала 3, расширение за монеты по одному месту до 15 ----------
const SLOT0 = 3, SLOT_COST = [40000, 80000, 150000, 250000, 400000, 650000, 1000000, 1600000, 2500000, 4000000, 6000000, 10000000];
const cap = () => SLOT0 + (D().slots || 0), SLOT_MAX = SLOT0 + SLOT_COST.length;
const isFull = () => D().cars.length >= cap();
const slotCost = () => SLOT_COST[D().slots || 0];   // undefined — уже максимум
const slotBtn = () => slotCost() != null ? `<button class="btn sm" data-act="dcSlot" data-cost="${slotCost()}">${L("🅿️ +1 место — {0} 💰", fmt(slotCost()))}</button>` : `<small class="dc-slmax">${L("Максимум — {0} мест", SLOT_MAX)}</small>`;
function garageBar() {
  const n = D().cars.length, c = cap();
  const cells = Array.from({ length: SLOT_MAX }, (_, i) => `<i class="${i < Math.min(n, c) ? "car" : i < c ? "free" : "lk"}"></i>`).join("");
  return `<div class="card dc-slots${n >= c ? " full" : ""}"><div class="dc-slt">${L("🅿️ Места в гараже:")} <b>${n}/${c}</b>${n >= c ? `<span>${L("гараж полон")}</span>` : ""}</div>
    <div class="dc-slbar">${cells}</div>${slotBtn()}</div>`;
}
function fullModal() {
  openModal(`<h2>${L("🅿️ Гараж полон")}</h2><p>${L("Все места заняты ({0}/{1}). Продай ненужную тачку или расширь гараж — и открывай контейнеры дальше.", D().cars.length, cap())}</p>
    ${slotBtn()}<button class="btn alt" data-act="dcGoMy">${L("🚘 К моим тачкам")}</button><button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`);
  refreshDisabled();
}
function buySlot() {
  const c = slotCost(); if (c == null) return;
  if (S.coins < c) { toast(L("Не хватает монет: нужно {0} 💰", fmt(c))); shake($("coinsBox")); return; }
  S.coins -= c; D().slots = (D().slots || 0) + 1; Snd.level(); vignette("#ffd23f"); buzz(30);
  toast(L("🅿️ Гараж расширен: теперь мест — {0}", cap())); Platform.track("dc_slot_" + cap());
  if (!$("modal").classList.contains("hidden")) closeModal();
  renderHeader(); renderCars(); save();
}
const plateById = id => S.plates.find(p => p.id === id);
function carInc(x) {
  const c = CK[x.k], p = x.pl != null && plateById(x.pl);
  if (!p) return 0;
  return c.base * PM[p.tier] * (p.tier === c.r ? PAIR : 1);
}
const carsInc = () => D().cars.reduce((a, x) => a + carInc(x), 0);
function cleanup() {   // номер продали/слили в игре — снимаем его с тачки
  for (const x of D().cars) if (x.pl != null && !plateById(x.pl)) x.pl = null;
}

// ---------- встраиваемся в игру ----------
const _income = income;
income = function () { return _income() + carsInc(); };   // тачки с номерами дают доход в общую копилку игры
const _priceIncome = priceIncome;                          // цена бланков и награды заданий считаются от дохода — тачки тоже в нём,
priceIncome = function () { return _priceIncome() + carsInc(); };   // иначе богач с тачками покупает бланки по цене новичка
const _renderTab = renderTab;
renderTab = function () { if (tab === "cars") { renderCars(); refreshDisabled(); return; } _renderTab(); };
const _doPrestige = doPrestige;
doPrestige = function () {                                 // тачки (в т.ч. купленные за звёзды) переезд не обнуляет; номера с них снимутся сами
  const dc = S.dc; _doPrestige(); if (dc && S !== undefined) { S.dc = dc; for (const x of dc.cars) x.pl = null; dc.show = null; save(); }
};
const _shopGrant = shopGrant;
shopGrant = function (item, why) {                         // оплатили звёздный контейнер — открываем его
  if (item !== "box_star") return _shopGrant(item, why);
  if (!why) S.paid.buys = (S.paid.buys || 0) + 1;
  Platform.track("paid_box"); Platform.happytime();
  if (tab !== "cars") openTab("cars");
  D().sub = "boxes"; D().bi = 0; renderCars();
  setTimeout(() => openBox(true), 300);
};

// ---------- тачка в профиле ----------
// В снимок гаража (его видят друзья и рейтинг) добавляется car: [ключ тачки, номер на ней или null]
const shownCar = () => { const d = D(), x = d.show != null && d.cars.find(v => v.id === d.show); if (!x) { d.show = null; return null; } return x; };
const _garageSnap = garageSnap;
garageSnap = function () {
  const g = _garageSnap(), x = shownCar();
  if (x) { const p = x.pl != null && plateById(x.pl); g.car = [x.k, p ? [p.l1 + p.d + p.l23, p.reg, p.tier] : null]; }
  return g;
};
const _cleanSnap = cleanSnap;
cleanSnap = function (g) {                                 // чужой снимок: тачку берём только из известного списка
  const r = _cleanSnap(g);
  if (r && g && Array.isArray(g.car) && CK[g.car[0]]) r.car = [g.car[0], Array.isArray(g.car[1]) ? g.car[1] : null];
  return r;
};
function profCarHTML(car) {
  const c = CK[car[0]], R = RC[c.r], p = car[1] ? snapPlate(car[1]) : null;
  return `<div class="pcar" style="--rc:${R.c}"><div class="pcar-h"><span>${L("🚘 Тачка")}</span><b>${R.tag}</b></div>
    <img src="${img(c.k)}" alt=""><div class="pcar-n">${escapeHTML(c.n)}</div>
    ${p ? `<div class="dc-frame${p.tier === c.r ? " pair" : ""}" style="--pc:${TIERS[p.tier].color}"><span class="dc-fr">${plateHTML(p)}</span></div>` : ""}</div>`;
}
const _profCardHTML = profCardHTML;
profCardHTML = function (o, small) {
  const html = _profCardHTML(o, small), g = o.mine ? o.g : cleanSnap(o.g);
  if (!g || !g.car || small) return html;
  return html.replace(/<\/div>\s*$/, profCarHTML(g.car) + "</div>");
};
const _openProfile = openProfile;
openProfile = function () {                                // в редакторе профиля — выбор тачки для показа
  _openProfile();
  const ed = document.querySelector("#mbox .pfedit"); if (!ed) return;
  const d = D(), list = d.cars.map(x => ({ x, c: CK[x.k] })).sort((a, b) => b.c.r - a.c.r || b.c.p - a.c.p).slice(0, 30);
  ed.insertAdjacentHTML("beforeend", `<label>${L("🚘 Тачка в профиле — одна, её видят все")}</label>
    <div class="pfcars">${list.length ? list.map(({ x, c }) => `<button class="${d.show === x.id ? "on" : ""}" style="--rc:${RC[c.r].c}" data-act="dcShow" data-id="${x.id}"><img src="${img(c.k)}" alt=""><span>${escapeHTML(c.n)}</span></button>`).join("") : `<p class="hint">${L("Тачек пока нет — открой контейнер во вкладке «Тачки»")}</p>`}</div>`);
};

// ---------- звук ----------
let AC = null;
function ac2() { if (!S.set.sfx) return null; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC; } catch (e) { return null; } }
function tone(f, d, type = "sine", v = .12, at = 0, f2) {
  const a = ac2(); if (!a) return; const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .05);
}
function noise(d, f = 2000, v = .15, at = 0, q = 1, f2) {
  const a = ac2(); if (!a) return; const t = a.currentTime + at, n = a.sampleRate * d, b = a.createBuffer(1, n, a.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; fl.type = "bandpass"; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl).connect(g).connect(a.destination); s.start(t);
}
const Sx = {
  whoosh(dir) { noise(.32, dir > 0 ? 600 : 2600, .14, 0, .9, dir > 0 ? 3200 : 500); },
  land(r) { tone(70 + r * 8, .3, "sine", .32, 0, 40); noise(.12, 900, .14); if (r >= 3) tone(1320 + r * 120, .5, "sine", .05, .05); },
  thud(i) { tone(90 + i * 20, .25, "sine", .3, 0, 40); noise(.15, 600 + i * 300, .2); },
  boom() { noise(.8, 300, .4, 0, .5, 3000); tone(60, .6, "sine", .35, 0, 30); },
  tick() { tone(1800, .03, "square", .035); },
  stop() { tone(700, .08, "triangle", .1); },
  screw() { noise(.05, 4200, .22, 0, 2); tone(2600, .03, "square", .03); },
  win(r) {
    const base = [[523, 659, 784], [523, 659, 784, 1047], [587, 740, 880, 1175], [523, 659, 784, 1047, 1319, 1568], [440, 554, 659, 880, 1109, 1319, 1760], [392, 494, 587, 784, 988, 1175, 1568, 1976]][r];
    base.forEach((f, i) => { tone(f, .5, "triangle", .1, i * .09); if (r >= 3) tone(f * 2, .4, "sine", .03, i * .09 + .02); });
    if (r >= 3) { noise(1.2, 8000, .06, .3, .5); tone(base[base.length - 1], 1.2, "sine", .07, base.length * .09); }
    if (r === 5) { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 1.6, "sawtooth", .025, 1 + i * .02)); tone(98, 1.5, "sine", .3, 0, 49); }
  },
};
const wait = ms => new Promise(r => setTimeout(r, ms));
function flash() { let f = $("dcFlash"); if (!f) { f = document.createElement("div"); f.id = "dcFlash"; f.className = "dc-flash"; document.body.appendChild(f); } f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }

// ---------- контейнер (SVG) ----------
function crate(b) {
  const c = RC[b.r].c, id = "k" + Math.random().toString(36).slice(2, 7), gold = b.elite, st = b.star;
  const metal = gold ? ["#5a4a2a", "#3b301c", "#2a2214"] : st ? ["#2a3c52", "#1b2a3c", "#121d2a"] : ["#4a5263", "#2d333f", "#20252f"];
  const acc = boxCol(b);
  return `<svg viewBox="0 0 120 120" class="cr"><defs>
    <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${metal[0]}"/><stop offset="1" stop-color="${metal[1]}"/></linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${metal[1]}"/><stop offset="1" stop-color="${metal[2]}"/></linearGradient>
    <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${metal[2]}"/><stop offset="1" stop-color="#101318"/></linearGradient>
    <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <polygon points="60,16 104,37 60,58 16,37" fill="url(#${id}t)"/>
    <polygon points="16,37 60,58 60,106 16,85" fill="url(#${id}l)"/>
    <polygon points="60,58 104,37 104,85 60,106" fill="url(#${id}r)"/>
    ${[0, 1, 2].map(i => `<line x1="${22 + i * 12}" y1="${46 + i * 6}" x2="${22 + i * 12}" y2="${82 + i * 6}" stroke="#000" stroke-opacity=".35" stroke-width="2"/><line x1="${66 + i * 12}" y1="${61 - i * 6}" x2="${66 + i * 12}" y2="${97 - i * 6}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`).join("")}
    <polygon points="16,37 24,41 24,89 16,85" fill="#0008"/><polygon points="96,41 104,37 104,85 96,89" fill="#0008"/>
    <polygon points="56,56 64,56 64,106 56,104" fill="#0006"/>
    <path d="M16,37 L60,58 L104,37" fill="none" stroke="${acc}" stroke-width="2.2" filter="url(#${id}g)"/>
    <path d="M16,37 L60,58 L104,37" fill="none" stroke="${acc}" stroke-width="1.1"/>
    <path d="M38,26.5 L82,47.5" stroke="${acc}" stroke-width="1.6" opacity=".9"/><path d="M38,26.5 L82,47.5" stroke="${acc}" stroke-width="4" opacity=".5" filter="url(#${id}g)"/>
    <path d="M16,85 L60,106 L104,85" fill="none" stroke="${acc}" stroke-width="1" opacity=".5"/>
    <path d="M60,58 V106" stroke="${acc}" stroke-width="1" opacity=".55"/>
    ${[[16, 37], [104, 37], [16, 85], [104, 85], [60, 16], [60, 106]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#15181f" stroke="${acc}" stroke-width=".8"/>`).join("")}
    ${st ? `<path d="M0,-10 l3.2,6.5 7.1,1 -5.2,5 1.3,7 -6.4,-3.4 -6.4,3.4 1.3,-7 -5.2,-5 7.1,-1 z" fill="#ffd76a" transform="translate(60,37) scale(1.2,.6) rotate(45)"/>` : ""}
    <rect x="34" y="66" width="12" height="8" rx="1.5" fill="${acc}" opacity=".85" transform="skewY(25)" transform-origin="40 70"/>
  </svg>`;
}

// ---------- номер поверх фото: перспектива по 4 углам ----------
function solve(A, B) {
  const n = B.length;
  for (let i = 0; i < n; i++) {
    let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r;
    [A[i], A[m]] = [A[m], A[i]]; [B[i], B[m]] = [B[m], B[i]];
    for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; B[r] -= f * B[i]; }
  }
  const x = Array(n); for (let i = n - 1; i >= 0; i--) { let s = B[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; }
  return x;
}
function quadMatrix(w, h, d) {   // прямоугольник w×h → четырёхугольник d (TL, TR, BR, BL)
  const src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], B = [];
  for (let i = 0; i < 4; i++) { const [x, y] = src[i], u = d[i * 2], v = d[i * 2 + 1]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v); }
  const [a, b, c, dd, e, f, g, hh] = solve(A, B);
  return `matrix3d(${a},${dd},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}
const blank = () => `<div class="plate p0 dc-blank"><div class="m"><span class="c">&nbsp;</span></div><div class="r"><b class="c">&nbsp;</b><i>RUS<em class="flag"></em></i></div></div>`;
// Номер не клеим на фото: чужие номера со снимков стёрты (заливка фоном бампера), а свой показываем в рамке под машиной
function carView(c, x, fly) {
  const p = x && x.pl != null ? plateById(x.pl) : null;
  const pair = p && p.tier === c.r;
  const frame = `<div class="dc-frame${p ? "" : " empty"}${pair ? " pair" : ""}" style="--pc:${p ? TIERS[p.tier].color : "#8d99b3"}" ${x && x.id ? `data-act="dcPick" data-id="${x.id}"` : ""}>
    <span class="dc-fr">${p ? `<span class="dc-fly${fly ? " go" : ""}">${plateHTML(p)}</span>` : `<span class="dc-add">${L("＋ Повесить номер")}</span>`}</span>
    ${p ? `<span class="dc-fl" style="color:${TIERS[p.tier].color}">${TIERS[p.tier].name}${pair ? " · " + L("💎 пара") : ""}</span>` : ""}</div>`;
  return `<div class="dc-car" data-k="${c.k}"><img src="${img(c.k)}" alt=""></div>${frame}`;
}
function fitPlates() {}
addEventListener("resize", () => fitPlates());

// ===================== ВКЛАДКА =====================
function renderCars() {
  cleanup(); preload();
  if (minBi() === 0 && !D().starShown) { D().starShown = 1; D().bi = 0; }   // в Telegram при первом заходе сразу показываем звёздный
  if (D().bi >= BOXES.length || D().bi < minBi()) D().bi = minBi();
  const d = D(), el = $("tab-cars"), inc = carsInc(), idle = d.cars.filter(x => !carInc(x)).length;
  el.innerHTML = `<div class="card dc-head">
      <div class="dc-inc">${L("🏎️ Тачки приносят")} <b>${L("+{0}/сек", fmt(inc))}</b></div>
      <p style="margin:0">${L("Тачка без номера стоит на приколе. Повесь на неё свой номер из гаража — и она начнёт зарабатывать. Чем круче номер, тем больше доход, а")} <b style="color:var(--gold)">${L("номер той же редкости, что и тачка")}</b> ${L("— ещё ×1.5.")}</p>
      ${idle ? `<p style="margin:0;color:#ff8a98">${L("🚫 Без номера стоят: {0}", idle)}</p>` : ""}
    </div>
    <div class="dc-seg">${[["boxes", L("📦 Контейнеры")], ["my", L("🚘 Мои тачки · {0}", d.cars.length + "/" + cap())], ["coll", L("🏆 Коллекция")]].map(([k, t]) => `<button class="${d.sub === k ? "on" : ""}" data-act="dcSub" data-v="${k}">${t}</button>`).join("")}</div>
    <div id="dcBody"></div>`;
  if (d.sub === "boxes") renderBoxes(); else if (d.sub === "my") renderMy(); else renderColl();
}

// ---------- контейнеры ----------
function boxInfo(b, i) {
  const c = boxCol(b), free = b.free && D().free[b.id];
  const segs = b.odds.map((v, r) => v > 0 ? `<i style="flex:${Math.max(v, 3)};background:${RC[r].c};animation-delay:${r * 60}ms"></i>` : "").join("");
  const inside = CARS.filter(x => b.odds[x.r] > 0).sort((a, z) => z.r - a.r || z.p - a.p).slice(0, 10);
  const btn = isFull() ? `<button class="btn alt dc-open" data-act="dcFull">${L("🅿️ Гараж полон ({0}) — освободи место", D().cars.length + "/" + cap())}</button>`
    : free ? `<button class="btn green dc-open" data-act="dcOpen">${L("🎁 Открыть бесплатно")}</button>`
    : b.star ? `<button class="btn star dc-open" data-act="dcOpen">${L("Открыть за {0}", starPrice())}</button>`
    : `<button class="btn dc-open" data-act="dcOpen">${L("Открыть за {0} 💰", fmt(b.price))}</button>`
      + (b.id === AD_BOX && Platform.adsOK ? (() => { const w = (D().adBox || 0) - Date.now();
        return `<button class="btn ${w > 0 ? "alt" : "green"} dc-open" data-act="dcAdBox">${w > 0 ? L("📺 Бесплатно через") + ` <span class="timer" data-until="${D().adBox}"></span>` : L("📺 Открыть бесплатно за рекламу")}</button>`; })() : "");
  return `<div class="dc-name" style="--rc:${c}">${[...b.n].map((ch, k) => `<span style="animation-delay:${k * 22}ms">${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</div>
    <div class="dc-note">${b.note}</div>${free ? `<span class="dc-free">${L("первый раз бесплатно!")}</span>` : ""}
    ${b.star ? `<div class="dc-promo">${(NOBRAND ? L("💎 Почти каждый третий — <b>суперлегенда</b>") : L("💎 Почти каждый третий — <b>суперлегенда</b>: Bugatti, Koenigsegg, Pagani, Aurus, Rolls-Royce"))}</div>` : ""}
    <div class="dc-bar">${segs}</div>
    <div class="dc-leg">${b.odds.map((v, r) => v > 0 ? `<span style="--c:${RC[r].c}">${RC[r].n} ${v}%</span>` : "").join("")}</div>
    <div class="dc-thumbs">${inside.map((x, k) => `<div style="--c:${RC[x.r].c};animation-delay:${120 + k * 45}ms"><img src="${img(x.k)}">${x.n}</div>`).join("")}</div>
    ${btn}`;
}
function orbs(b) { return b.r >= 3 || b.star ? Array.from({ length: b.star ? 7 : b.elite ? 6 : 4 }, (_, k) => `<i class="dc-orb" style="left:50%;top:44%;animation-delay:${-k * 3 / (b.star ? 7 : b.elite ? 6 : 4)}s;animation-duration:${b.star ? 2.4 : 3}s"></i>`).join("") : ""; }
// лента всех контейнеров: звёздный первым, крупнее и с переливающейся рамкой
function boxList() {
  const d = D();
  return `<div class="dc-list" id="dcList">${BOXES.map((b, i) => { if (i < minBi()) return "";
    const free = b.free && d.free[b.id], price = b.star ? starPrice() : free ? L("бесплатно") : fmt(b.price) + " 💰";
    return `<div class="dc-li${b.star ? " hit" : ""}${i === d.bi ? " on" : ""}${free ? " fr" : ""}" style="--rc:${boxCol(b)}" data-act="dcPickBox" data-i="${i}">
      ${b.star ? `<span class="dc-badge">${L("🔥 ХИТ")}</span>` : free ? `<span class="dc-badge g">🎁</span>` : ""}
      ${crate(b)}<b>${b.sn}</b><small>${price}</small>${b.star ? `<em>${L("30% суперлегенда")}</em>` : ""}</div>`;
  }).join("")}</div>`;
}
const starStage = b => b.star ? `<div class="dc-twinkle"></div><div class="dc-ribbon">${L("⭐ Лучший шанс на суперлегенду — 30%")}</div>` : "";
function renderBoxes() {
  const d = D(), b = BOXES[d.bi], c = boxCol(b);
  $("dcBody").innerHTML = boxList() + `<div class="dc-show${b.r >= 3 || b.star ? " hot" : ""}${b.star ? " star" : ""}" id="dcShow" style="--rc:${c}">
      <div id="dcStar">${starStage(b)}</div>
      <div class="dc-beam"></div><div class="dc-floor"></div><div class="dc-ring" id="dcRing"></div><div class="dc-streak" id="dcStreak"></div>
      <div id="dcOrbs">${orbs(b)}</div>
      <div class="dc-crate" id="dcCrate">${crate(b)}</div>
      <button class="dc-arr l" data-act="dcPrev" ${d.bi > minBi() ? "" : "disabled"}>‹</button><button class="dc-arr r" data-act="dcNext" ${d.bi < BOXES.length - 1 ? "" : "disabled"}>›</button>
      <div class="dc-dots">${BOXES.map((x, i) => i < minBi() ? "" : `<i data-i="${i}" class="${i === d.bi ? "on" : ""}"></i>`).join("")}</div>
    </div><div class="dc-info" id="dcInfo">${boxInfo(b, d.bi)}</div>`;
  const sh = $("dcShow"); let x0 = null;
  sh.addEventListener("pointerdown", e => { x0 = e.clientX; });
  sh.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) boxGo(dx < 0 ? 1 : -1); });
}
let switching = false;
async function boxGo(dir, to) {   // смена контейнера: старый улетает с разворотом, новый влетает и «приземляется» с волной и искрами
  const d = D(), n = to != null ? to : d.bi + dir; if (switching || n < minBi() || n >= BOXES.length || n === d.bi) return;
  dir = Math.sign(n - d.bi);
  switching = true; d.bi = n;
  document.querySelectorAll("#dcList .dc-li").forEach((x, i) => x.classList.toggle("on", i === n));
  const li = document.querySelector(`#dcList .dc-li[data-i="${n}"]`); if (li) li.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  const b = BOXES[n], c = boxCol(b), show = $("dcShow"), cr = $("dcCrate"), info = $("dcInfo");
  Sx.whoosh(dir); buzz(10);
  const st = $("dcStreak"); st.animate([{ opacity: 0, transform: "translateX(0)" }, { opacity: .9, transform: `translateX(${-dir * 40}px)` }, { opacity: 0, transform: `translateX(${-dir * 90}px)` }], { duration: 520, easing: "ease-out" });
  const out = cr.animate([{ transform: "none", opacity: 1, filter: "blur(0)" }, { transform: `translateX(${-dir * 150}%) rotateY(${-dir * 80}deg) rotateZ(${-dir * 8}deg) scale(.5)`, opacity: 0, filter: "blur(6px)" }], { duration: 300, easing: "cubic-bezier(.5,0,.9,.5)", fill: "forwards" });
  info.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 30}px)` }], { duration: 200, fill: "forwards" });
  show.querySelectorAll(".dc-dots i").forEach(x => x.classList.toggle("on", +x.dataset.i === n));
  show.querySelector(".dc-arr.l").disabled = n <= minBi(); show.querySelector(".dc-arr.r").disabled = n >= BOXES.length - 1;
  await wait(260);
  show.style.setProperty("--rc", c); show.classList.toggle("hot", b.r >= 3 || !!b.star); show.classList.toggle("star", !!b.star);
  $("dcStar").innerHTML = starStage(b);
  $("dcOrbs").innerHTML = orbs(b);
  await out.finished; out.cancel();
  cr.innerHTML = crate(b);
  const inn = cr.animate([
    { transform: `translateX(${dir * 150}%) rotateY(${dir * 80}deg) rotateZ(${dir * 10}deg) scale(.45)`, opacity: 0, filter: "blur(6px) brightness(2)" },
    { transform: `translateX(${-dir * 7}%) translateY(-18px) rotateY(${-dir * 12}deg) scale(1.1)`, opacity: 1, filter: "blur(0) brightness(1.4)", offset: .62 },
    { transform: "translateY(4px) scale(1.04,.94)", filter: "brightness(1.1)", offset: .82 },
    { transform: "none", filter: "none" }], { duration: 640, easing: "cubic-bezier(.2,.8,.3,1)" });
  info.innerHTML = boxInfo(b, n); info.getAnimations().forEach(a => a.cancel());
  info.animate([{ opacity: 0, transform: `translateX(${dir * 30}px)` }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
  await wait(520);
  Sx.land(b.r); buzz(b.r >= 3 ? 30 : 15);   // приземление: волна по полу, искры цвета редкости
  $("dcRing").animate([{ opacity: .9, transform: "scale(.5)" }, { opacity: 0, transform: "scale(1.9)" }], { duration: 650, easing: "ease-out" });
  const r = show.getBoundingClientRect();
  fx.burst(r.left + r.width / 2, r.top + r.height * .78, 10 + b.r * 6, [c, "#fff"], { speed: 160 + b.r * 30, up: 120, g: 500, life: .7 });
  if (b.r >= 3 || b.star) { show.animate([{ boxShadow: `0 0 0 ${c}` }, { boxShadow: `0 0 50px ${c}` }, { boxShadow: `0 0 30px ${c}66` }], { duration: 700 }); }
  await inn.finished; switching = false; save();
}

// ---------- открытие ----------
let opening = null;
const pick6 = odds => { let x = Math.random() * 100; for (let r = 0; r < odds.length; r++) if ((x -= odds[r]) < 0) return r; return odds.findLastIndex(v => v > 0); };
const carOfR = r => { const l = CARS.filter(c => c.r === r); return l[rnd(l.length)]; };
function pay(i) {
  const d = D(), b = BOXES[i];
  if (b.free && d.free[b.id]) { d.free[b.id] = 0; return true; }
  if (b.star) { shopBuy("box_star"); return false; }   // оплата звёздами через бота; после оплаты shopGrant("box_star") откроет контейнер
  if (S.coins < b.price) { toast(L("Не хватает монет: нужно {0} 💰", fmt(b.price))); shake($("coinsBox")); return false; }
  S.coins -= b.price; Platform.track("box_" + b.id); return true;
}
function ov() { let o = $("dcOv"); if (!o) { o = document.createElement("div"); o.id = "dcOv"; document.body.appendChild(o); } return o; }
async function openBox(paidStar, viaAd) {
  if (paidStar && (opening || switching)) return setTimeout(() => openBox(true), 1500);   // оплата пришла, пока открывался другой — откроем следом
  const d = D(), si = BOXES.findIndex(x => x.star), i = paidStar ? si : viaAd ? BOXES.findIndex(x => x.id === AD_BOX) : d.bi, b = BOXES[i];
  if (!b || opening || switching) return;
  if (!paidStar && !viaAd && isFull()) return fullModal();   // оплаченный звёздный и «за рекламу» открываем всегда — за них уже «заплачено»
  if (!paidStar && !viaAd && !pay(i)) return;
  if (viaAd) Platform.track("box_ad");
  const win = carOfR(pick6(b.odds)), c = boxCol(b), o = ov();
  opening = { i, b, win, skip: false }; renderHeader(); save();
  $("fx").style.zIndex = 75;
  o.style.setProperty("--rc", c); o.classList.add("on");
  o.innerHTML = `<div class="dco"><div class="dco-t">${b.n}</div>${crate(b)}<div class="dco-m">${L("Вскрываем…")}</div></div>`;
  const cr = o.querySelector(".cr");
  for (let k = 1; k <= 3; k++) { await wait(k === 1 ? 500 : 420); cr.classList.remove("s1", "s2", "s3"); void cr.getBBox(); cr.classList.add("s" + k); Sx.thud(k); buzz(30 * k); }
  await wait(520); cr.classList.add("boom"); Sx.boom(); flash(); buzz(90);
  const r = cr.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 60, [c, "#fff"], { speed: 420, g: 120 });
  await wait(380);
  await roulette(b, win);
  if (opening) reveal(win);
}
async function roulette(b, win) {
  const o = ov(), N = 56, W = 4, step = 128;
  const items = Array.from({ length: N }, (_, i) => {
    if (i === N - W) return win;
    let r = pick6(b.odds);
    if ((i === N - W - 1 || i === N - W + 1) && Math.random() < .55) r = Math.max(r, b.odds.findLastIndex(v => v > 0) - (Math.random() < .5 ? 0 : 1));   // «почти!»
    return carOfR(r);
  });
  o.innerHTML = `<button class="dco-skip" data-act="dcSkip">${L("Пропустить ⏩")}</button><div class="dco"><div class="dco-t">${b.n}</div>
    <div class="dco-rl"><div class="dco-mark"></div><div class="dco-strip" id="dcStrip">${items.map((c, i) => `<div class="dco-ri" style="--rc:${RC[c.r].c}" ${i === N - W ? 'id="dcWin"' : ""}><img src="${img(c.k)}"><b>${c.n}</b></div>`).join("")}</div></div>
    <div class="dco-m">${L("Крутим…")}</div></div>`;
  const strip = $("dcStrip"), vw = o.querySelector(".dco-rl").clientWidth;
  const target = -((N - W) * step + 60) + vw / 2 + (Math.random() - .5) * 90;
  const an = strip.animate([{ transform: "translateX(0)" }, { transform: `translateX(${target}px)` }], { duration: win.r === 5 ? 7200 : 5600, easing: "cubic-bezier(.08,.72,.12,1)", fill: "forwards" });
  let last = -1;
  const tk = () => { if (!opening || an.playState === "finished") return; const x = new DOMMatrix(getComputedStyle(strip).transform).m41, idx = Math.floor((-x + vw / 2) / step); if (idx !== last) { last = idx; Sx.tick(); } requestAnimationFrame(tk); };
  requestAnimationFrame(tk); opening.an = an;
  await an.finished.catch(() => {});
  Sx.stop(); const w = $("dcWin"); if (w) w.classList.add("win"); buzz(40);
  await wait(opening && opening.skip ? 50 : 750);
}
async function reveal(c) {
  const d = D(), R = RC[c.r], o = ov(), sup = c.r === 5, x = { id: d.nid++, k: c.k, pl: null };
  d.cars.push(x); const isNew = !d.seen.includes(c.k); if (isNew) d.seen.push(c.k);
  opening.id = x.id; save();
  if (sup) {   // суперлегенда: тишина и гул, потом триколор
    o.style.setProperty("--rc", "#000"); o.innerHTML = `<div class="dco"><div class="dco-t" style="color:#fff">…</div></div>`;
    tone(55, 1.4, "sine", .35, 0, 110); buzz(300); await wait(1300);
    o.classList.remove("quake"); void o.offsetWidth; o.classList.add("quake");
  }
  o.style.setProperty("--rc", R.c);
  o.innerHTML = `<div class="dco" style="--rc:${R.c}"><div class="dco-rays${sup ? " tri" : ""}"></div>
    <div class="dco-tag${sup ? " tri" : ""}">${R.tag}${isNew ? " • " + L("НОВАЯ!") : ""}</div>
    ${carView(c, x)}
    <div class="dco-n">${c.n}</div>
    <div class="dco-i"><div>${L("Стоимость")}<b>${fmt(c.p)} 💰</b></div><div>${L("С номером")}<b style="color:var(--ok)">${L("от +{0}/сек", fmt(c.base))}</b></div></div>
    <div class="dco-b"><button class="btn green" data-act="dcPick" data-id="${x.id}">${L("🔢 Повесить номер")}</button>
      <div class="row2"><button class="btn alt" data-act="dcSellWon">${L("Продать {0}", fmt(c.p * SELL))}</button>${isFull() ? `<button class="btn alt" data-act="dcFull">${L("🅿️ Гараж полон")}</button>` : `<button class="btn" data-act="dcAgain">${L("Ещё ↻")}</button>`}</div>
      <button class="btn alt dco-close" data-act="dcClose">${L("Закрыть — тачка останется в гараже")}</button></div></div>
    <button class="dco-x" data-act="dcClose" aria-label="${L("Закрыть")}">✕</button>`;
  fitPlates(o);
  flash(); Sx.win(c.r); buzz(c.r >= 3 ? 200 : 60);
  const cx = innerWidth / 2, cy = innerHeight * .4, cols = sup ? ["#fff", "#2f6bff", "#ff2e3e", "#5ef2ff"] : [R.c, "#fff"];
  fx.burst(cx, cy, 30 + c.r * 25, cols, { speed: 260 + c.r * 50, g: 140 });
  if (c.r >= 3) setTimeout(() => fx.confetti(sup ? 220 : 90, sup ? cols : undefined), 250);
  if (sup) for (let k = 1; k <= 3; k++) setTimeout(() => { flash(); fx.firework(Math.random() * innerWidth, innerHeight * (.2 + Math.random() * .4)); Sx.boom(); }, 900 * k);
}
function closeOv() { const o = ov(); o.classList.remove("on", "quake"); o.innerHTML = ""; $("fx").style.zIndex = ""; opening = null; renderCars(); }

// ---------- мои тачки ----------
function renderMy(flyId) {
  const d = D(), own = d.cars.map(x => ({ x, c: CK[x.k], inc: carInc(x) }));
  const list = own.filter(o => d.filt < 0 || o.c.r === d.filt).sort((a, b) => b.inc - a.inc || b.c.p - a.c.p);
  $("dcBody").innerHTML = garageBar() + (own.length ? `<div class="dc-filters"><button class="${d.filt < 0 ? "on" : ""}" data-act="dcFilt" data-r="-1">${L("Все · {0}", own.length)}</button>${RC.map((r, i) => { const n = own.filter(o => o.c.r === i).length; return n ? `<button class="${d.filt === i ? "on" : ""}" style="--c:${r.c}" data-act="dcFilt" data-r="${i}"><i></i>${r.n} · ${n}</button>` : ""; }).join("")}</div>` +
    list.map(({ x, c, inc }) => {
      const p = x.pl != null ? plateById(x.pl) : null, pair = p && p.tier === c.r;
      return `<div class="dc-card${inc ? "" : " idle"}" style="--rc:${RC[c.r].c}" id="dcc${x.id}"><span class="dc-tag">${RC[c.r].tag}</span>${carView(c, x, flyId === x.id)}
        <div class="dc-crow"><div class="t"><b>${c.n}</b>${p ? `<small>${L("+{0}/сек", fmt(inc))}${pair ? " · ×1.5" : ""}</small>` : `<small class="no">${L("🚫 без номера — не зарабатывает")}</small>`}</div>
        <button class="btn sm${p ? " alt" : " green"}" data-act="dcPick" data-id="${x.id}">🔢 ${p ? L("Сменить") : L("Номер")}</button></div>
        <div class="dc-acts"><button class="dc-act${d.show === x.id ? " on" : ""}" data-act="dcShow" data-id="${x.id}">${d.show === x.id ? L("✓ Стоит в профиле") : L("👤 В профиль")}</button><button class="dc-act sell" data-act="dcSell" data-id="${x.id}">${L("Продать за {0} 💰", fmt(c.p * SELL))}</button></div></div>`;
    }).join("") : `<div class="dc-empty">${L("Тачек пока нет — открой контейнер 📦")}</div>`);
  fitPlates($("dcBody")); refreshDisabled();
}
function pickPlate(id) {
  const x = D().cars.find(v => v.id === id), c = CK[x.k];
  const on = new Map(D().cars.filter(v => v.pl != null).map(v => [v.pl, v]));
  const list = S.plates.slice().sort((a, b) => b.tier - a.tier || b.val - a.val).slice(0, 60);
  openModal(`<h2>${L("🔢 Номер на {0}", c.n)}</h2><p style="font-size:12px;color:var(--dim);margin:0">${L("Идеально подходит {0} номер — доход ×1.5", `<b style="color:${RC[c.r].c}">${TIERS[c.r].name}</b>`)}</p>
    <div class="dc-pick">${list.length ? list.map(p => { const m = PM[p.tier] * (p.tier === c.r ? PAIR : 1), other = on.get(p.id);
      return `<div class="item${x.pl === p.id ? " cur" : ""}" data-act="dcHang" data-id="${id}" data-p="${p.id}">${plateHTML(p)}<div class="info"><b style="color:${TIERS[p.tier].color}">${TIERS[p.tier].name}</b><br>${other && other.id !== id ? L("сейчас на {0}", CK[other.k].n) : x.pl === p.id ? L("висит сейчас") : ""}</div>
        <div class="dc-mult">${L("+{0}/сек", fmt(c.base * m))}${p.tier === c.r ? `<small>${L("💎 пара")}</small>` : ""}</div></div>`; }).join("") : `<div class="dc-empty">${L("В гараже нет номеров — купи бланки на вкладке «Номера»")}</div>`}</div>
    ${x.pl != null ? `<button class="btn alt" data-act="dcUnhang" data-id="${id}">${L("Снять номер")}</button>` : ""}<button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`);
}
async function hang(id, pid) {
  const d = D(), x = d.cars.find(v => v.id === id), c = CK[x.k], p = plateById(pid); if (!x || !p) return;
  for (const v of d.cars) if (v.pl === pid) v.pl = null;   // номер переезжает с другой тачки
  const old = x.pl != null && plateById(x.pl); if (old && old.dcLock) { old.lock = false; delete old.dcLock; }
  if (!p.lock) { p.lock = true; p.dcLock = true; }       // номер на тачке защищён от продажи и слияния
  x.pl = pid; closeModal(); if (opening) closeOv();
  d.sub = "my"; d.filt = -1; renderCars(); renderMy(id);
  const card = $("dcc" + id); if (card) card.scrollIntoView({ block: "center" });
  Sx.whoosh(1); await wait(560);
  const pl = card && card.querySelector(".dc-fr .plate");
  if (pl) { const r = pl.getBoundingClientRect(); for (const sx of [r.left + 4, r.right - 4]) { Sx.screw(); fx.burst(sx, r.top + r.height / 2, 8, ["#fff", "#ffd23f"], { speed: 140, life: .4 }); buzz(12); await wait(120); } }
  if (card) card.classList.add("pop");
  const pair = p.tier === c.r;
  if (pair) { vignette(RC[c.r].c); Sx.win(Math.min(c.r, 4)); toast(L("💎 Идеальная пара! {0} номер на {1} тачке — ×1.5", TIERS[p.tier].name, RC[c.r].n.toLowerCase())); }
  else { tone(880, .12, "triangle", .1); tone(1320, .2, "triangle", .08, .08); toast(L("{0} поехала: +{1}/сек", c.n, fmt(carInc(x)))); }
  renderHeader(); save();
}

// ---------- коллекция ----------
function renderColl() {
  const seen = D().seen, got = CARS.filter(c => seen.includes(c.k)).length;
  $("dcBody").innerHTML = `<div class="card" style="margin-bottom:4px"><b>${L("Собрано {0} из {1}", got, CARS.length)}</b><div class="dc-prog"><i style="width:${got / CARS.length * 100}%"></i></div></div>` +
    RC.map((r, ri) => { const l = CARS.filter(c => c.r === ri), g = l.filter(c => seen.includes(c.k)).length;
      return `<div class="dc-rh" style="--rc:${r.c}">${r.n} <small>${g}/${l.length}${ri < 5 ? " · " + L("весь набор: +{0}% к доходу тачек", (ri + 1) * 5) : " · " + L("самые редкие тачки")}</small></div>
        <div class="dc-grid">${l.map(c => { const lk = !seen.includes(c.k); return `<div class="dc-cc${lk ? " lk" : ""}${ri === 5 && !lk ? " sl" : ""}" style="--rc:${r.c}"><img src="${img(c.k)}" loading="lazy"><b>${lk ? "???" : c.n}</b><small>${lk ? r.n : fmt(c.p) + " 💰"}</small></div>`; }).join("")}</div>`; }).join("");
}

// ---------- кнопки ----------
function sellCar(id) {
  const d = D(), x = d.cars.find(v => v.id === id); if (!x) return; const c = CK[x.k], p = x.pl != null && plateById(x.pl);
  if (p && p.dcLock) { p.lock = false; delete p.dcLock; }
  if (d.show === id) d.show = null;
  d.cars = d.cars.filter(v => v.id !== id); gain(c.p * SELL); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 10); toast(L("Продано: +{0} 💰", fmt(c.p * SELL))); save();
}
Object.assign(ACTS, {
  dcSub: d => { D().sub = d.v; renderCars(); },
  dcPrev: () => boxGo(-1), dcNext: () => boxGo(1), dcPickBox: d => boxGo(0, +d.i),
  dcOpen: () => openBox(),
  dcAdBox: () => {                                         // обычный контейнер за рекламу: место в гараже проверяем до рекламы
    const w = (D().adBox || 0) - Date.now();
    if (w > 0) return toast(L("Следующий бесплатный контейнер — через {0}", mmss(w)));
    if (isFull()) return fullModal();
    if (opening || switching) return;
    rewardedAd(() => { D().adBox = Date.now() + AD_BOX_GAP; save(); openBox(false, true); });
  },
  dcFull: () => fullModal(),
  dcSlot: () => buySlot(),
  dcGoMy: () => { closeModal(); if (opening) closeOv(); D().sub = "my"; renderCars(); },
  dcSkip: () => { if (opening && opening.an) { opening.skip = true; opening.an.finish(); } },
  dcAgain: () => { closeOv(); openBox(); },
  dcClose: () => { if (opening && opening.an && opening.an.playState !== "finished") return; closeOv(); },
  dcShow: d => {                                       // одна тачка в профиле — её видят друзья и рейтинг
    const id = +d.id, dd = D(); dd.show = dd.show === id ? null : id; save(); try { sendState(); } catch (e) {}
    toast(dd.show ? L("👤 Тачка теперь в профиле — её видят друзья и рейтинг") : L("Тачка убрана из профиля"));
    if (!$("modal").classList.contains("hidden") && $("pfNick")) { pfSync(); openProfile(); } else if (tab === "cars") renderCars();
  },
  dcSellWon: () => { const id = opening.id; closeOv(); sellCar(id); renderCars(); },
  dcPick: d => pickPlate(+d.id),
  dcHang: d => hang(+d.id, +d.p),
  dcUnhang: d => { const x = D().cars.find(v => v.id === +d.id), p = x && plateById(x.pl); if (p && p.dcLock) { p.lock = false; delete p.dcLock; } if (x) x.pl = null; closeModal(); renderCars(); save(); },
  dcSell: (d, e, el) => {                              // продажа в два нажатия, чтобы не продать тачку случайно
    if (!el.dataset.sure) {
      el.dataset.sure = 1; const was = el.textContent; el.textContent = L("Точно? Жми ещё раз"); el.classList.add("sure");
      setTimeout(() => { if (el.isConnected) { delete el.dataset.sure; el.textContent = was; el.classList.remove("sure"); } }, 3000);
      return;
    }
    sellCar(+d.id); renderCars();
  },
  dcFilt: d => { D().filt = +d.r; renderMy(); },
  dcCredits: () => openModal(`<h2>📷 Авторы фото</h2><p>Фото машин — с Wikimedia Commons, по свободным лицензиям. Фон убран, номера на фото стёрты. Марки и модели принадлежат их владельцам, игра с ними не связана.</p>
    <div class="dc-cred">${CARS.map(c => `<div><b>${escapeHTML(c.n)}</b> — ${escapeHTML(CREDITS[c.k][0])}, ${CREDITS[c.k][1]}</div>`).join("")}</div>
    <button class="btn alt" data-act="closeModal">Закрыть</button>`),
});
// колёсико мыши над горизонтальной лентой листает её вбок (на телефоне — просто пальцем)
document.addEventListener("wheel", e => {
  const el = e.target.closest && e.target.closest(".dc-thumbs, .dc-filters, .dc-list");
  if (!el || el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  const max = el.scrollWidth - el.clientWidth;
  if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;   // на краю — крутим страницу дальше
  e.preventDefault(); el.scrollBy({ left: e.deltaY * 1.2, behavior: "smooth" });
}, { passive: false });
addEventListener("keydown", e => { if (tab === "cars" && D().sub === "boxes" && !opening) { if (e.key === "ArrowLeft") boxGo(-1); if (e.key === "ArrowRight") boxGo(1); } });
let preloaded = false;                                     // фото грузим при первом заходе во вкладку, чтобы рулетка не была пустой (не нагружаем старт игры)
function preload() { if (preloaded) return; preloaded = true; CARS.forEach(c => { const i = new Image(); i.src = img(c.k); }); }
})();
