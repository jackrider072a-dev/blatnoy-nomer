"use strict";
// =====================================================================
//  БЛАТНОЙ НОМЕР — кликер про покупку автомобильных номеров
// =====================================================================

// ===================== ДАННЫЕ =====================
const LETTERS = [..."АВЕКМНОРСТУХ"];
const ELITE_REG = ["77", "97", "99", "177", "197", "199", "777", "799"];
const NORMAL_REG = ["02","16","50","52","63","66","74","78","86","90","102","116","123","161","163","174","178","196","750","93","95","54","24"];
const SPECIAL_DIGITS = ["777", "007", "001", "999", "888", "555", "666", "100"];
const LEGEND_SER = ["АМР", "ЕКХ"];
// спецсерия «АМР» 97 региона: любой такой номер — легенда, а с цифрами SUPER_DIGITS — суперлегенда
const GOV_SER = "АМР", GOV_REG = "97";
const SUPER_DIGITS = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "100",   // первые номера серии и «сотня»
  "111", "222", "333", "444", "555", "666", "777", "888", "999"];                          // тройные цифры
const BLAT_SER = ["ООО", "МОС", "ВОС", "ААА", "ММР"];
const SERIES_INFO = {
  "АМР": "Легендарная серия — по слухам, для «самых важных» водителей",
  "ЕКХ": "Серия-легенда автофорумов, о ней ходит больше всего слухов",
  "ООО": "Тройная «О» — серия солидных деловых людей",
  "МОС": "«Столичная» по звучанию серия больших кабинетов",
  "ВОС": "Серия «с характером», её уважают в автоклубах",
  "ААА": "Три первые буквы алфавита — VIP-серия",
  "ММР": "Загадочная серия «больших людей»"
};
const TIERS = [
  { name: "Обычный",  val: 12,    color: "#9aa5b8" },
  { name: "Красивый", val: 80,    color: "#4fc3f7" },
  { name: "Редкий",   val: 400,   color: "#b388ff" },
  { name: "Блатной",  val: 2500,  color: "#ffb300" },
  { name: "Легенда",  val: 20000, color: "#ff3d71" },
  { name: "Суперлегенда", val: 250000, color: "#5ef2ff" }
];
const PACKS = {
  basic: { name: "Обычный бланк",  icon: "📄", price: 100,  w: [70, 20, 7.6, 2.37, 0.03, 0.002], lvl: 1,  xp: 2 },
  prem:  { name: "Премиум-бланк",  icon: "💼", price: 700,  w: [0, 50, 32, 17.5, 0.5, 0.02],    lvl: 4,  xp: 8 },
  elite: { name: "Элитный бланк",  icon: "👑", price: 1500, w: [0, 0, 59, 40, 1, 0.08],          lvl: 12, xp: 30 }
};
const TOP = TIERS.length - 1;               // самая высокая редкость
const UPS = [
  { id: "luck",  name: "🍀 Удача",            base: 800,   mul: 2.0, max: 40, desc: "Шанс на красивые, редкие и блатные ×1.12 за уровень (легенды — слабее, они «прям редкие»)" },
  { id: "disc",  name: "🏷 Скидка на бланки",  base: 700,   mul: 2.4, max: 8,  desc: "Все бланки дешевле на 7% за уровень" },
  { id: "taxi",  name: "🚕 Таксопарк",         base: 200,   mul: 1.8, max: 60, desc: "+3 к заработку за тап «Таксовать»" },
  { id: "crit",  name: "💥 Чаевые",            base: 1500,  mul: 2.2, max: 10, desc: "+5% шанс, что тап в такси даст ×10" },
  { id: "slots", name: "🏠 Парковочные места", base: 500,   mul: 1.9, max: 30, desc: "+2 места в гараже" },
  { id: "park",  name: "📈 Сдача в аренду",    base: 600,   mul: 2.1, max: 40, desc: "+25% дохода с гаража за уровень" },
  { id: "bot",   name: "🤖 Помощник",         base: 15000, mul: 2.6, max: 15, desc: "Сам покупает обычные бланки: раз в 25с÷(1+0.5×ур.)" },
  { id: "forge", name: "🔨 Золотые руки мастера", base: 2000, mul: 2.3, max: 10, desc: "+5% к шансу успеха в мастерской за уровень (от текущего шанса)" },
  { id: "pity",  name: "🎯 Гарантия",          base: 50000, mul: 3.2, max: 5,  desc: "Гарантированный блатной номер на 10 покупок раньше" }
];
// названия переводятся при каждом обращении: язык может смениться уже после первой отрисовки (его сообщает площадка)
Lprops(SERIES_INFO, ...Object.keys(SERIES_INFO));
TIERS.forEach(t => Lprops(t, "name")); Object.values(PACKS).forEach(p => Lprops(p, "name")); UPS.forEach(u => Lprops(u, "name", "desc"));
const PITY_BASE = 120;
const INC_DIV = 400;                       // доход номера в сек = цена / INC_DIV
// слияние: сколько номеров редкости t нужно на один номер редкости t+1. Чем выше, тем больше нужно — иначе цепочка слияний
// умножает деньги быстрее, чем игрок успевает их тратить (из 81 обычного за 8 тыс. выходила легенда за 20 тыс.)
const MERGE_NEED = [3, 3, 4, 5, 8];
const SAVE_KEY = "blatnoy_nomer_v3";       // новый ключ = у всех чистый старт после ребаланса
const DAILY = [200, 400, 700, 1200, 2000, 3500, "prem"];
const BUYER_MIN = 70, BUYER_MAX = 160;
const START_COINS = 500;
const AD_GAP = 180000;                     // бонус за рекламу — не чаще раза в 3 минуты (требование площадок)

// ===================== УТИЛИТЫ =====================
const $ = id => document.getElementById(id);
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function fmt(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString(I18N.loc);
  const u = I18N.lang === "ru" ? [[1e15, " квдр"], [1e12, " трлн"], [1e9, " млрд"], [1e6, " млн"], [1e3, " тыс"]] : [[1e15, "Qa"], [1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [d, s] of u) if (n >= d) return (n / d).toFixed(n / d >= 100 ? 0 : n / d >= 10 ? 1 : 2) + s;
  return String(n);
}
const pctStr = pc => pc.toFixed(pc >= 10 ? 0 : pc >= 1 ? 1 : pc >= 0.01 ? 2 : 3);   // проценты: у суперлегенды 0.002%
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), p = n => String(n).padStart(2, "0");   // 4:05 · 3:04:05 · 2 д 7 ч
  return s >= 86400 ? L("{0} д {1} ч", Math.floor(s / 86400), Math.floor(s % 86400 / 3600)) : s >= 3600 ? Math.floor(s / 3600) + ":" + p(Math.floor(s % 3600 / 60)) + ":" + p(s % 60) : Math.floor(s / 60) + ":" + p(s % 60); };
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
const yesterdayStr = () => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };

// ===================== СОСТОЯНИЕ =====================
const fresh = () => ({
  v: 4, sets: {}, merges: 0, mergeBest: 0, story: { ch: 0, intro: false, ev: {} }, tut: 0, title: "", achClaim: {}, coins: START_COINS, drawn: 0, goal: 0, forge: { sel: [], coins: 0, target: null, lots: [], lotsAt: 0, boost: false, tries: 0, wins: 0, legend: 0 }, forgePend: null, earned: 0, earnedRun: 0, plates: [], found: {}, up: {}, bought: 0, sold: 0,
  tc: [0, 0, 0, 0, 0, 0], pity: 0, xp: 0, lvl: 1, pts: 0, prest: 0, orders: [], ordAt: 0, ach: {},
  daily: { last: "", streak: 0 }, mini: { best: 0, next: 0, plays: 0 },
  set: { music: true, sfx: true, vib: true, auto: -1, city: true }, market: null, t: Date.now(), nid: 1,
  playSec: 0, ordersDone: 0, buffUntil: 0, buyers: 0, taxis: 0, botAcc: 0, adNext: 0,
  subs: { at: 0, n: 0 },                               // бонусы за подписку (только Telegram): tg/vk — получено, at/n — когда и сколько раз звали
  paid: { x2: 0, got: [], starter: 0, starterUntil: 0 }, // покупки за звёзды (Telegram): x2 — доход ×2 навсегда, got — id уже выданных платежей, набор новичка
  quests: { day: "", list: [], chest: 0 },              // задания дня: list — [{ k, n, base, got, nt }], chest — сундук за все три забран
  album: { got: {}, rw: {} },                           // альбом номеров: got — собранные клетки ("r:77", "d:777"…), rw — забранные награды страниц ("reg1" — половина, "reg2" — вся)
  soc: { resp: 0 },                                     // сколько респектов гаражу игрок уже видел (Telegram)
  bot: { on: true, pack: "basic", sell: -2, merge: -1, reserve: 0, wish: [], log: [], n: 0, found: 0 },   // помощник: вкл, бланк, что продавать (-2 — как авто-продажа), автослияние до редкости (-1 — нет), запас денег, «ищу номер», журнал
  prof: { nick: "", ava: "😎", frame: "base", bio: "", pins: [] }   // профиль: ник, аватар, рамка, статус, закреплённые номера (id, до 3)
});
let S = fresh();
function normalize(r) {                              // сохранение (локальное или облачное) → полное состояние игры
  const s = Object.assign(fresh(), r); s.set = Object.assign(fresh().set, r.set); s.mini = Object.assign(fresh().mini, r.mini); s.daily = Object.assign(fresh().daily, r.daily);
  s.forge = Object.assign(fresh().forge, r.forge);                        // мастерская: старые сейвы с другим форматом
  s.subs = Object.assign(fresh().subs, r.subs);
  s.paid = Object.assign(fresh().paid, r.paid); if (!Array.isArray(s.paid.got)) s.paid.got = [];
  s.quests = Object.assign(fresh().quests, r.quests); if (!Array.isArray(s.quests.list)) s.quests.list = [];
  s.album = Object.assign(fresh().album, r.album); s.album.got = Object.assign({}, s.album.got); s.album.rw = Object.assign({}, s.album.rw);
  s.soc = Object.assign(fresh().soc, r.soc);
  s.bot = Object.assign(fresh().bot, r.bot); if (!Array.isArray(s.bot.wish)) s.bot.wish = []; if (!Array.isArray(s.bot.log)) s.bot.log = [];
  s.prof = Object.assign(fresh().prof, r.prof); if (!Array.isArray(s.prof.pins)) s.prof.pins = [];
  s.story = Object.assign(fresh().story, r.story); s.story.ev = Object.assign({}, s.story.ev);
  if (!r.story) s.tut = r.drawn > 0 ? -1 : 0;                              // сейв до сюжета: опытным игрокам обучение не показываем
  if (!Array.isArray(s.forge.sel)) s.forge.sel = [];
  if (!Array.isArray(s.forge.lots)) s.forge.lots = [];
  if (s.forgePend && !s.forgePend.v2) s.forgePend = null;
  if (!Array.isArray(s.tc)) s.tc = [];
  while (s.tc.length < TIERS.length) s.tc.push(0);                       // старые сейвы: счётчик без суперлегенд
  if (!(r.v >= 4)) {                                                      // до слияния обычные продавались сами — теперь они нужны для слияния
    if (s.set.auto === 0) s.set.auto = -1;
    for (const p of s.plates) s.found["t:" + p.tier] = true;
    for (let t = 0; t < TIERS.length; t++) if (s.tc[t]) s.found["t:" + t] = true;
    s.v = 4;
  }
  return s;
}
const RESET = /[?&]reset\b/.test(location.search);   // ссылка вида ...?reset — сброс прогресса
let hadLocal = false;
(function load() {
  try {
    if (RESET) localStorage.removeItem(SAVE_KEY);
    const r = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (r) { S = normalize(r); hadLocal = true; }
  } catch (e) {}
})();
const up = id => S.up[id] || 0;
let noSave = false, cloudOK = false, cloudDirty = false;
const save = () => {
  if (noSave) return; cloudDirty = true; try { S.t = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  if (Platform.primary) cloudFlush(false);           // хранилище площадки — главное (CrazyGames): пишем сразу, SDK сам копит изменения
};

let pending = null, rolling = false, skipReel = false, tab = "buy", dispCoins = S.coins, hidden = false;

// ===================== ЗВУК =====================
const A = { ctx: null, sfx: null, mus: null, out: null };
let muted = false;                                   // площадка просит выключить звук (CrazyGames: muteAudio) — это главнее настроек игры
function setMuted(m) { muted = !!m; if (A.out) A.out.gain.value = muted ? 0 : 1; }
function ac() {
  if (!A.ctx) {
    try {
      A.ctx = new (window.AudioContext || window.webkitAudioContext)();
      A.out = A.ctx.createGain(); A.out.gain.value = muted ? 0 : 1; A.out.connect(A.ctx.destination);
      const comp = A.ctx.createDynamicsCompressor(); comp.connect(A.out);
      A.sfx = A.ctx.createGain(); A.sfx.gain.value = 0.9; A.sfx.connect(comp);
      A.mus = A.ctx.createGain(); A.mus.gain.value = 0.35; A.mus.connect(comp);
    } catch (e) { return null; }
  }
  if (A.ctx.state === "suspended" && !hidden) A.ctx.resume();
  return A.ctx;
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function tone(f, d, type = "sine", v = 0.15, delay = 0, slide = 0, bus = "sfx") {
  if (bus === "sfx" && !S.set.sfx) return;
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(A[bus]); o.start(t); o.stop(t + d + 0.02);
}
function noise(d, v, delay = 0, f0 = 2000, f1 = 2000, bus = "sfx") {
  if (bus === "sfx" && !S.set.sfx) return;
  const c = ac(); if (!c) return;
  const len = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = buf;
  const fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + delay;
  fl.type = "bandpass"; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl); fl.connect(g); g.connect(A[bus]); s.start(t);
}
const Snd = {
  click() { tone(520, 0.05, "square", 0.05); },
  tick(i = 0) { tone(260 + (i % 3) * 25, 0.035, "square", 0.045); },
  thunk(i = 0) { tone(150 + i * 38, 0.16, "sine", 0.3, 0, -70); noise(0.06, 0.12, 0, 1800, 600); tone(660 + i * 90, 0.07, "triangle", 0.08); },
  drum() { tone(90, 0.12, "sine", 0.35, 0, -40); },
  rise(d) { tone(70, d, "sawtooth", 0.07, 0, 380); tone(140, d, "triangle", 0.05, 0, 760); noise(d, 0.05, 0, 400, 6000); },
  boom() { tone(60, 0.9, "sine", 0.5, 0, -30); noise(0.7, 0.25, 0, 3000, 200); },
  coin() { tone(1175, 0.07, "square", 0.05); tone(1568, 0.16, "square", 0.05, 0.06); },
  sell() { tone(880, 0.07, "triangle", 0.12); tone(1320, 0.12, "triangle", 0.12, 0.07); noise(0.1, 0.08, 0.05, 6000, 3000); },
  keep() { tone(420, 0.08, "triangle", 0.12); tone(630, 0.1, "triangle", 0.12, 0.07); },
  err() { tone(160, 0.25, "sawtooth", 0.12, 0, -70); },
  whoosh() { noise(0.45, 0.14, 0, 300, 4000); },
  taxi(p = 0) { tone(700 + p * 45, 0.05, "square", 0.06); tone(1050 + p * 45, 0.07, "square", 0.05, 0.04); },
  crit() { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.15, "triangle", 0.12, i * 0.05)); },
  level() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, "triangle", 0.14, i * 0.08)); },
  win(t) {
    const seqs = [[392], [440, 554], [523, 659, 784], [523, 659, 784, 1046, 1318], [392, 523, 659, 784, 1046, 1318, 1568, 2093]];
    seqs[t].forEach((f, i) => { tone(f, 0.28, "triangle", 0.14, i * 0.085); if (t >= 3) tone(f / 2, 0.3, "sawtooth", 0.04, i * 0.085); });
    if (t >= 2) noise(0.5, 0.1, 0, 800, 7000);
    if (t >= 4) { [523, 659, 784].forEach(f => tone(f, 1.4, "sawtooth", 0.05, 0.75)); noise(1.2, 0.12, 0.7, 500, 9000); }
  }
};

// фоновая музыка: простая генеративная лупа в ля миноре
const Mus = {
  timer: null, next: 0, step: 0,
  prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
  pent: [69, 72, 74, 76, 79, 81],
  start() { if (this.timer || !S.set.music) return; const c = ac(); if (!c) return; this.next = c.currentTime + 0.1; this.timer = setInterval(() => this.sched(), 200); },
  stop() { clearInterval(this.timer); this.timer = null; },
  sched() {
    if (!A.ctx || !S.set.music || hidden) return;
    while (this.next < A.ctx.currentTime + 0.5) { this.play(this.step++, this.next - A.ctx.currentTime); this.next += 0.28; }
  },
  play(step, d) {
    const ch = this.prog[(step >> 3) & 3], s = step & 7;
    if (s % 4 === 0) tone(mtof(ch[0] - 12), 0.6, "sine", 0.3, d, 0, "mus");
    if (s === 0) ch.forEach(n => tone(mtof(n), 2.0, "sawtooth", 0.018, d, 0, "mus"));
    if (s % 2 === 0 || s === 5) tone(mtof(ch[s % 3] + 12), 0.28, "triangle", 0.09, d, 0, "mus");
    if (Math.random() < 0.2) tone(mtof(pick(this.pent)), 0.45, "sine", 0.07, d, 0, "mus");
    if (s % 2 === 1) noise(0.04, 0.03, d, 7000, 7000, "mus");
  }
};

// ===================== ЭФФЕКТЫ (canvas) =====================
const fx = {
  cv: $("fx"), ps: [], w: 0, h: 0, dpr: 1, arrived: 0,
  init() { this.c = this.cv.getContext("2d"); this.resize(); addEventListener("resize", () => this.resize()); requestAnimationFrame(t => this.loop(t)); },
  resize() { this.dpr = Math.min(devicePixelRatio || 1, 2); this.w = innerWidth; this.h = innerHeight; this.cv.width = this.w * this.dpr; this.cv.height = this.h * this.dpr; this.c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); },
  add(p) { if (this.ps.length < 700) this.ps.push(p); },
  burst(x, y, n, colors, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = (o.speed || 220) * (0.3 + Math.random());
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (o.up || 60), g: o.g == null ? 420 : o.g, life: 0, max: o.life || 0.9 + Math.random() * 0.5, size: 3 + Math.random() * 4, color: pick(colors), type: o.type || "spark", rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12 });
    }
  },
  confetti(n = 80, colors = ["#ffd23f", "#ff3d71", "#4fc3f7", "#7dff8a", "#b388ff"]) {
    for (let i = 0; i < n; i++) this.add({ x: Math.random() * this.w, y: -20 - Math.random() * 100, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 220, g: 120, life: 0, max: 3 + Math.random() * 1.5, size: 6 + Math.random() * 5, color: pick(colors), type: "conf", rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14 });
  },
  coinRain(n = 40) {
    for (let i = 0; i < n; i++) this.add({ x: Math.random() * this.w, y: -30 - Math.random() * 400, vx: (Math.random() - 0.5) * 60, vy: 120 + Math.random() * 200, g: 500, life: 0, max: 3, size: 8 + Math.random() * 4, color: "#ffd23f", type: "coin", rot: 0, vr: 6 });
  },
  firework(x, y) {
    const cols = [["#ff3d71", "#ffd23f"], ["#4fc3f7", "#fff"], ["#7dff8a", "#ffd23f"], ["#b388ff", "#ff3d71"]][rnd(4)];
    this.burst(x, y, 60, cols, { speed: 330, g: 160, life: 1.4, up: 0 });
    Snd.coin();
    noise(0.25, 0.1, 0, 3000, 400);
  },
  fireworks(n = 7) { for (let i = 0; i < n; i++) setTimeout(() => this.firework(this.w * (0.15 + Math.random() * 0.7), this.h * (0.15 + Math.random() * 0.4)), i * 260); },
  // монетки летят к счётчику
  fly(x, y, n = 8) {
    const r = $("coinsBox").getBoundingClientRect(), tx = r.left + 18, ty = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = 120 + Math.random() * 200;
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0, life: -Math.random() * 0.25, max: 3, size: 7, color: "#ffd23f", type: "fly", tx, ty, rot: 0, vr: 8 });
    }
  },
  loop(now) {
    const dt = Math.min((now - (this.last || now)) / 1000, 0.05); this.last = now;
    const c = this.c; c.clearRect(0, 0, this.w, this.h);
    for (const p of this.ps) {
      p.life += dt; if (p.life < 0) continue;
      if (p.type === "fly") {
        const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), k = 3200 * dt;
        p.vx += dx / d * k; p.vy += dy / d * k; p.vx *= 0.93; p.vy *= 0.93;
        if (d < 22) { p.life = 99; if (performance.now() - this.arrived > 70) { this.arrived = performance.now(); Snd.coin(); const b = $("coinsBox"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); } }
      } else p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = clamp(1 - (p.life / p.max), 0, 1);
      c.globalAlpha = p.type === "fly" ? 1 : Math.min(1, a * 2.2);
      c.fillStyle = p.color;
      if (p.type === "conf") { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); c.restore(); }
      else if (p.type === "coin" || p.type === "fly") {
        c.save(); c.translate(p.x, p.y); c.scale(Math.abs(Math.cos(p.rot)) * 0.8 + 0.2, 1);
        c.beginPath(); c.arc(0, 0, p.size, 0, 6.283); c.fill(); c.strokeStyle = "#b8860b"; c.lineWidth = 2; c.stroke(); c.restore();
      } else { c.beginPath(); c.arc(p.x, p.y, p.size * a + 0.5, 0, 6.283); c.fill(); }
    }
    c.globalAlpha = 1;
    this.ps = this.ps.filter(p => p.life < p.max && p.y < this.h + 60);
    requestAnimationFrame(t => this.loop(t));
  }
};
fx.init();

function vignette(color) { const v = $("vignette"); v.style.setProperty("--vc", color); v.classList.remove("on"); void v.offsetWidth; v.classList.add("on"); }
function bigText(text, color) { const b = $("big"); b.textContent = text; b.style.color = color; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); }
function shake(el, long) { el.classList.remove("shake", "shake2"); void el.offsetWidth; el.classList.add(long ? "shake2" : "shake"); }
function buzz(ms) { if (S.set.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} }
function toast(t) {
  const el = document.createElement("div"); el.className = "toast"; el.textContent = t; $("toasts").appendChild(el);
  while ($("toasts").children.length > 2) $("toasts").firstChild.remove();
  setTimeout(() => el.remove(), 2700);
}
function floatText(x, y, text, color) {
  const el = document.createElement("div"); el.className = "float"; el.textContent = text;
  el.style.left = x + "px"; el.style.top = y + "px"; if (color) el.style.color = color; document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// ===================== НОМЕРА =====================
function mk(l1, d, l2, l3, reg) { return { l1, d, l23: l2 + l3, reg }; }
function randPlate(reg) { return mk(pick(LETTERS), String(100 + rnd(900)), pick(LETTERS), pick(LETTERS), reg || pick(NORMAL_REG)); }
const seriesOf = p => p.l1 + p.l23;
function classify(p) {
  const ser = seriesOf(p), elite = ELITE_REG.includes(p.reg);
  if (ser === GOV_SER && p.reg === GOV_REG) return SUPER_DIGITS.includes(p.d) ? 5 : 4;   // спецсерия: всегда легенда
  if (LEGEND_SER.includes(ser)) return elite ? 4 : 3;
  if (BLAT_SER.includes(ser)) return elite ? 3 : 2;
  if (SPECIAL_DIGITS.includes(p.d) || elite) return 2;
  const d = p.d;
  if (d[0] === d[1] && d[1] === d[2]) return 1;
  if (d.endsWith("00") || ["123", "321", "234", "456"].includes(d) || d[0] === d[2]) return 1;
  if (p.l1 === p.l23[0] && p.l23[0] === p.l23[1]) return 1;
  return 0;
}
function build(tier) {
  let p;
  if (tier === 5) p = mk(GOV_SER[0], pick(SUPER_DIGITS), GOV_SER[1], GOV_SER[2], GOV_REG);
  else if (tier === 4) { const s = pick(LEGEND_SER); p = mk(s[0], String(100 + rnd(900)), s[1], s[2], pick(ELITE_REG)); }
  else if (tier === 3) { const s = pick(BLAT_SER); p = mk(s[0], String(100 + rnd(900)), s[1], s[2], pick(ELITE_REG)); }
  else if (tier === 2) { p = randPlate(); if (Math.random() < 0.5) p.d = pick(SPECIAL_DIGITS); else p.reg = pick(ELITE_REG); }
  else if (tier === 1) {
    p = randPlate(); const k = rnd(4);
    if (k === 0) { const x = String(1 + rnd(9)); p.d = x + x + x; }
    else if (k === 1) p.d = String(1 + rnd(9)) + "00";
    else if (k === 2) p.d = pick(["123", "321", "234", "456"]);
    else { const x = pick(LETTERS); p.l1 = x; p.l23 = x + x; }
  } else p = randPlate();
  return p;
}
const luckMult = () => Math.min(40, Math.pow(1.12, up("luck")) * Math.pow(1.03, S.pts)) * evMult("luck");
// событие из админки для всех игроков (Telegram): { inc, luck, until (сек), text }
let EV = null;
const evOn = () => !!(EV && Date.now() < EV.until * 1000);
const evMult = k => evOn() ? Math.max(1, +EV[k] || 1) : 1;
function pityMax() { return PITY_BASE - 10 * up("pity"); }
// веса редкостей бланка: удача усиливает всё выше самой низкой редкости, легенды и суперлегенды — только корнем из удачи (они «прям редкие»)
function packWeights(packId) {
  const ws = PACKS[packId].w.slice(), first = ws.findIndex(x => x > 0), lk = luckMult();
  for (let i = first + 1; i <= TOP; i++) ws[i] *= i >= 4 ? Math.sqrt(lk) : lk;
  return ws;
}
function rollTier(packId) {
  const ws = packWeights(packId), first = ws.findIndex(x => x > 0);
  const sum = ws.reduce((a, b) => a + b, 0); let r = Math.random() * sum;
  for (let i = 0; i <= TOP; i++) { r -= ws[i]; if (r <= 0) return i; }
  return first;
}
function drawPlate(packId, minTier = 0) {
  let want = Math.max(rollTier(packId), minTier), gift = false;
  S.drawn++;
  // подарки новичку: 1-й номер — редкий, 2–4-й — обычные (сразу собираются в первое слияние), 7-й — блатной
  if (S.drawn === 1 && want < 2) { want = 2; gift = true; }
  if (S.drawn >= 2 && S.drawn <= 4 && want <= 2) want = 0;
  if (S.drawn === 7 && want < 3) { want = 3; gift = true; }
  S.pity++;
  if (S.pity >= pityMax() && want < 3) want = Math.random() < 0.02 ? 4 : 3;
  if (want >= 3) S.pity = 0;
  let p, tier;
  for (let i = 0; i < 40; i++) { p = build(want); tier = classify(p); if (tier === want) break; }
  return { id: S.nid++, l1: p.l1, d: p.d, l23: p.l23, reg: p.reg, tier, val: TIERS[tier].val, got: Date.now(), gift, pack: packId };
}
function plateHTML(p, cls = "") {
  const cs = [p.l1, ...p.d, p.l23[0], p.l23[1]].map(c => `<span class="c">${c}</span>`).join("");
  return `<div class="plate p${p.tier} ${cls}"><div class="m">${cs}</div><div class="r"><b class="c">${p.reg}</b><i>RUS</i></div></div>`;
}
function plateNote(p) {
  const ser = seriesOf(p);
  if (p.tier === 5) return L("Спецсерия «АМР» 97 региона с цифрами «{0}» — таких номеров единицы", p.d);
  if (ser === GOV_SER && p.reg === GOV_REG) return L("Спецсерия «АМР» 97 региона — всегда легенда");
  if (SERIES_INFO[ser]) return L("Серия «{0}»: {1}", ser, SERIES_INFO[ser]);
  if (SPECIAL_DIGITS.includes(p.d)) return L("Красивая комбинация цифр «{0}»", p.d);
  if (ELITE_REG.includes(p.reg)) return L("Престижный регион {0}", p.reg);
  if (p.tier === 1) return L("Красивый номер — повторы или «зеркало»");
  return L("Обычный номер. Повезёт в следующий раз!");
}
function markFound(p) {
  const ser = seriesOf(p), keys = ["t:" + p.tier];
  if (SERIES_INFO[ser]) keys.push("s:" + ser);
  if (SPECIAL_DIGITS.includes(p.d)) keys.push("d:" + p.d);
  if (ELITE_REG.includes(p.reg)) keys.push("r:" + p.reg);
  for (const k of keys) if (!S.found[k]) { S.found[k] = true; setProgress(k); }
  albumAdd(p); wishCheck(p);
}

// ===================== ЭКОНОМИКА =====================
function gain(n) { S.coins += n; S.earned += n; S.earnedRun += n; }
const slots = () => 12 + 2 * up("slots");
function incMult() { return (1 + 0.25 * up("park")) * (1 + 0.1 * S.pts) * (1 + 0.02 * (S.lvl - 1)) * (1 + setBonus() + albumBonus()) * (Date.now() < S.buffUntil ? 2 : 1) * (S.paid.x2 ? 2 : 1) * evMult("inc"); }
function income() { let s = 0; for (const p of S.plates) s += p.val; return s / INC_DIV * incMult(); }
const plateInc = p => p.val / INC_DIV * incMult();
const packPrice = id => Math.max(60, Math.round(PACKS[id].price * Math.pow(0.93, up("disc"))));
const upCost = u => Math.round(u.base * Math.pow(u.mul, up(u.id)));
const taxiTap = () => (5 + 3 * up("taxi")) * (1 + 0.02 * (S.lvl - 1));
const xpNeed = l => Math.round(60 * Math.pow(l, 1.7));
const adReward = () => Math.max(500, Math.round(income() * 150));
const XP_TIER = [1, 2, 6, 25, 150, 1000];

// рынок: «в тренде» повышает цену продажи
function marketMult(p) {
  const m = S.market; if (!m || Date.now() > m.until) return 1;
  if (m.kind === "tier" && p.tier === m.key) return m.mult;
  if (m.kind === "series" && seriesOf(p) === m.key) return m.mult;
  return 1;
}
const sellVal = p => Math.round(p.val * marketMult(p));
function refreshMarket() {
  if (S.market && Date.now() < S.market.until) return;
  if (S.lvl < 3) { S.market = null; return; }           // «тренды» — с 3 уровня, новичку и так есть на что смотреть
  const m = Math.random() < 0.5 ? { kind: "tier", key: 1 + rnd(3), mult: 1.5 } : { kind: "series", key: pick([...LEGEND_SER, ...BLAT_SER]), mult: 2 };
  m.until = Date.now() + 150000; S.market = m; renderPills();
}

function addXp(n) {
  S.xp += n;
  while (S.xp >= xpNeed(S.lvl)) {
    S.xp -= xpNeed(S.lvl); S.lvl++;
    if ([2, 3, 5, 7, 10, 15, 20, 30].includes(S.lvl)) Platform.track("lvl_" + S.lvl);   // воронка в Метрике (только Telegram)
    const r = 60 * S.lvl; gain(r);
    const ut = unlockText(S.lvl);
    if (ut) {                                        // уровни, которые что-то открывают, — полноэкранная сцена (покажется, когда игрок не занят)
      enqueueCinema({ color: "#4fc3f7", bg: "#0d2238", icon: "⭐", top: L("Новый уровень"), title: L("УРОВЕНЬ {0}", S.lvl), value: r, valueLabel: L("НАГРАДА"), valueIcon: "💰", sub: ut || L("Так держать!"), coinRain: false, confetti: 70 });
    } else { Snd.level(); vignette("#4fc3f7"); fx.confetti(40); toast(L("⭐ Уровень {0}! +{1} 💰", S.lvl, fmt(r))); }
    renderPacks(); syncNav(); if (tab === "orders") renderOrders();
  }
}
function unlockText(l) { const t = { 2: "Открыты заказы!", 4: "Премиум-бланк и мини-игра!", 10: "Престиж!", 12: "Элитный бланк!" }[l]; return t ? L(t) : ""; }

// ===================== ПОКУПКА =====================
function setStage(html, tier, tierText, note, glow) {
  $("stage").className = "stage" + (glow ? " g" + glow : "");
  const t = $("tier"); t.className = "tier t" + tier + " in"; t.textContent = tierText;
  $("plateBox").innerHTML = html; $("note").textContent = note;
}
function updatePity() {
  const max = pityMax();
  $("pitybar").style.width = clamp(S.pity / max * 100, 0, 100) + "%";
  $("pitytxt").textContent = L("До гарантированного блатного номера: {0}", Math.max(0, max - S.pity));
}
function buy(id) {
  if (rolling) return;
  const P = PACKS[id];
  if (S.lvl < P.lvl) return toast(L("Откроется на уровне {0}", P.lvl));
  const c = packPrice(id);
  if (S.coins < c) { Snd.err(); return toast(Platform.adsOK ? L("Не хватает денег — таксуй или посмотри рекламу") : L("Не хватает денег — таксуй")); }
  ac(); Mus.start();
  if (pending) resolvePending(false);
  S.coins -= c; S.bought++; addXp(P.xp);
  if (S.bought === 1 || S.bought === 10 || S.bought === 100) Platform.track("buy_" + S.bought);
  const r = drawPlate(id);
  rolling = true; skipReel = false;
  Snd.whoosh();
  $("resolveRow").style.display = "none";
  rarityRoll(r, () => {                             // сначала рулетка редкостей, потом печать самого номера
    setStage(plateHTML({ ...r, tier: 0 }, "rolling"), r.tier, TIERS[r.tier].name, L("Печатаем номер…"), r.tier >= 1 ? r.tier : 0);
    $("stage").classList.add("rolling");
    playReel(r, () => reveal(r));
  });
  renderPacks(); updatePity();
}
// Рулетка редкостей при каждой покупке. Время и звук одинаковые при любом исходе, а рядом с выпавшей
// карточкой часто стоят «почти» блатной/легенда — по рулетке нельзя заранее понять, что выпадет.
const ROLL_MS = 1600, RCARD = 112, RFIN = 30;
function rarityRoll(r, done) {
  const cards = [];
  for (let i = 0; i < RFIN + 6; i++) { const k = Math.random(); cards.push(k < 0.4 ? 0 : k < 0.65 ? 1 : k < 0.84 ? 2 : k < 0.95 ? 3 : k < 0.99 ? 4 : 5); }
  cards[RFIN] = r.tier;
  for (const j of [RFIN - 1, RFIN + 1]) if (Math.random() < 0.55) cards[j] = pick([2, 3, 3, 4, 4, 5]);
  setStage(`<div class="jp-strip-wrap roll" id="rollWrap"><div class="jp-mark"></div><div class="jp-strip" id="rollStrip">${cards.map(c => `<div class="jp-card" style="--cc:${TIERS[c].color}">${TIERS[c].name}</div>`).join("")}</div></div>`,
    0, L("Что же выпадет?"), L("(тапни по табло, чтобы пропустить)"), 0);
  const wrap = $("rollWrap"), strip = $("rollStrip");
  const startX = wrap.offsetWidth / 2 - RCARD / 2, finalX = startX - (RFIN * RCARD + (Math.random() - 0.5) * 70);
  strip.style.transform = `translateX(${startX}px)`; void strip.offsetWidth;
  strip.style.transition = `transform ${ROLL_MS}ms cubic-bezier(.1,.6,.08,1)`; strip.style.transform = `translateX(${finalX}px)`;
  const t0 = performance.now(); let last = -1, ended = false;
  const finish = () => {
    if (ended) return; ended = true;
    strip.style.transition = "none"; strip.style.transform = `translateX(${finalX}px)`;
    strip.children[RFIN].classList.add("win"); Snd.thunk(0);
    setTimeout(done, skipReel ? 120 : 380);
  };
  (function tick() {
    if (ended || !rolling) return;
    if (skipReel || performance.now() - t0 >= ROLL_MS) return finish();
    const x = new DOMMatrix(getComputedStyle(strip).transform).m41, idx = Math.floor((startX - x + RCARD / 2) / RCARD);
    if (idx !== last) { last = idx; Snd.tick(idx); }   // щелчок на каждую карточку под маркером
    requestAnimationFrame(tick);
  })();
}
function playReel(r, done) {
  const cells = [...$("plateBox").querySelectorAll(".c")];
  const finals = [r.l1, r.d[0], r.d[1], r.d[2], r.l23[0], r.l23[1], r.reg];
  const isDigit = i => i >= 1 && i <= 3;
  const stops = cells.map((_, i) => 300 + i * 160 + (r.tier >= 3 && i >= 4 ? (i - 3) * 300 : 0) + (r.tier >= 4 && i === 6 ? 500 : 0));
  const t0 = performance.now(); let stopped = 0, n = 0;
  (function frame() {
    if (!rolling) return;
    const t = performance.now() - t0; n++;
    cells.forEach((c, i) => {
      if (c.dataset.s) return;
      if (skipReel || t >= stops[i]) { c.textContent = finals[i]; c.dataset.s = 1; c.classList.add("stop"); Snd.thunk(stopped++); }
      else c.textContent = i === 6 ? pick([...NORMAL_REG, ...ELITE_REG]) : isDigit(i) ? String(rnd(10)) : pick(LETTERS);
    });
    if (stopped < cells.length) {
      if (n % 2 === 0) Snd.tick(n);
      if (r.tier >= 3 && stopped >= 3 && n % 3 === 0) Snd.drum();
      setTimeout(frame, 50);
    } else setTimeout(done, r.tier >= 3 ? 450 : 220);
  })();
}
$("stage").addEventListener("click", () => { if (rolling) skipReel = true; });
$("plateBox").addEventListener("click", () => { if (!rolling && lastRevealed) showInfo(lastRevealed.id); });

function reveal(r) {
  rolling = false; markFound(r); S.tc[r.tier]++; lastRevealed = r;
  const st = $("stage"); st.classList.remove("rolling");
  setStage(plateHTML(r, "pop"), r.tier, TIERS[r.tier].name, plateNote(r), r.tier >= 1 ? r.tier : 0);
  const rect = $("plateBox").getBoundingClientRect(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const col = TIERS[r.tier].color;
  if (r.tier < 3) Snd.win(r.tier);
  if (r.tier === 1) { fx.burst(cx, cy, 24, [col, "#fff"]); vignette(col); }
  if (r.tier === 2) { fx.burst(cx, cy, 45, [col, "#fff", "#e0c8ff"], { speed: 280 }); vignette(col); shake($("app")); buzz(60); }
  if (r.tier >= 3) jackpot(r);                      // блатной и легенда — отдельная кинематографичная сцена
  S.pity = r.tier >= 3 ? 0 : S.pity;
  addXp(XP_TIER[r.tier]);
  updatePity();
  if (r.gift) { $("note").textContent = L("🎁 Подарок новичку! {0}", plateNote(r)); toast(L("🎁 Подарок новичку — повезло!")); }
  if (r.tier <= S.set.auto && !isLocked(r)) {       // авто-продажа по порогу (номер из «Ищу» — никогда)
    const v = sellVal(r); gain(v); S.sold++;
    $("note").textContent = L("{0} — продан за {1}", plateNote(r), fmt(v));
    fx.fly(cx, cy, 4); Snd.sell();
  } else {
    pending = r;
    $("btnSell").textContent = L("Продать (+{0})", fmt(sellVal(r)));
    $("resolveRow").style.display = "flex";
  }
  checkAch(); renderPacks(); save();
}
function keepPlate(p) {   // кладём в гараж; если полон — сначала сливаем тройку, иначе вытесняем самый дешёвый
  if (S.plates.length >= slots()) { const t = mergeTiers()[0]; if (t != null) { const m = mergeTake(t); toast(L("Гараж полон: слито {2} × «{0}» → «{1}»", TIERS[t].name, TIERS[m.tier].name, MERGE_NEED[t])); } }
  if (S.plates.length < slots()) { S.plates.push(p); return "kept"; }
  const free = S.plates.filter(x => !isLocked(x)), worst = free.length ? free.reduce((a, b) => a.val <= b.val ? a : b) : null;
  if (isLocked(p) && !worst) { S.plates.push(p); toast(L("🔒 Гараж переполнен запертыми номерами — купи места в улучшениях")); return "kept"; }
  if (worst && (worst.val < p.val || isLocked(p))) { S.plates = S.plates.filter(x => x.id !== worst.id); gain(sellVal(worst)); S.sold++; S.plates.push(p); toast(L("Гараж полон: продан самый дешёвый номер")); return "swapped"; }
  gain(sellVal(p)); S.sold++; toast(L("Гараж полон: номер продан. Купи места в улучшениях!")); return "sold";
}
function resolvePending(sell) {
  if (!pending) return;
  const p = pending; pending = null; $("resolveRow").style.display = "none";
  const rect = $("plateBox").getBoundingClientRect();
  if (sell) { gain(sellVal(p)); S.sold++; fx.fly(rect.left + rect.width / 2, rect.top + 30, 6); Snd.sell(); }
  else { keepPlate(p); Snd.keep(); }
  renderPacks(); checkAch(); save();
}

// ===================== СЛИЯНИЕ: несколько номеров одной редкости → 1 номер редкостью выше =====================
// Так любой выпавший номер — шаг вперёд: три обычных дают красивый, три красивых — редкий и т.д. до суперлегенды.
// 🔒 запертые номера (и закреплённые в профиле) не сливаются, не продаются пачкой, не отдаются в заказы и тюнинг
const isLocked = p => !!(p && (p.lock || (S.prof && S.prof.pins.includes(p.id))));
const freeOf = t => S.plates.filter(p => p.tier === t && !isLocked(p));
const tierCount = t => freeOf(t).length + (pending && pending.tier === t && !isLocked(pending) ? 1 : 0);
const mergeTiers = () => { const r = []; for (let t = 0; t < TOP; t++) if (freeOf(t).length >= MERGE_NEED[t]) r.push(t); return r; };
function mergeTake(t) {                                 // без анимации: убрать три номера, положить новый
  const src = freeOf(t).sort((a, b) => a.id - b.id).slice(0, MERGE_NEED[t]), ids = src.map(p => p.id);
  S.plates = S.plates.filter(p => !ids.includes(p.id));
  const r = makePlate(t + 1); r.merged = true;
  S.plates.push(r); markFound(r); S.merges++; S.mergeBest = Math.max(S.mergeBest, r.tier); addXp(XP_TIER[r.tier]);
  if (S.merges === 1) Platform.track("merge_first");
  return { r, src, tier: r.tier };
}
function doMerge(t) {
  if (rolling || forging) return;
  if (pending) resolvePending(false);
  if (freeOf(t).length < MERGE_NEED[t]) { Snd.err(); return toast(L("Не хватает номеров без замка 🔒")); }
  const { r, src } = mergeTake(t), col = TIERS[r.tier].color;
  Snd.rise(0.9); buzz(30);
  openModal(`<h2 style="color:${col}">${L("⚡ Слияние!")}</h2>
    <div class="merge-anim">${src.map((p, i) => `<div class="mg mg${i}">${plateHTML(p, "small")}</div>`).join("")}<div class="mg-flash" style="--mc:${col}"></div>
    <div class="mg-res">${plateHTML(r, "")}</div></div>
    <p class="mg-txt" style="color:${col}"><b>${TIERS[r.tier].name}</b> · ${L("стоимость {0} 💰 (было {1})", fmt(r.val), fmt(TIERS[t].val * MERGE_NEED[t]))}<br><small>${plateNote(r)}</small></p>
    <button class="btn green" data-act="closeModal">${L("Класс!")}</button>`, true);
  setTimeout(() => {
    modalLocked = false; Snd.boom(); Snd.win(Math.min(r.tier, 4)); vignette(col); shake($("mbox"));
    fx.burst(innerWidth / 2, innerHeight / 2, 30 + r.tier * 15, [col, "#fff"], { speed: 300 });
    if (r.tier >= 3) { closeModal(); jackpot(r); }
  }, 900);
  renderPacks(); if (tab === "garage") renderGarage(); renderHeader(); checkAch(); save();
}
function renderMergeBar() {                             // под табло: прогресс слияния и кнопка «Слить»
  const el = $("mergeBar"); if (!el) return;
  const ready = []; for (let t = 0; t < TOP; t++) if (tierCount(t) >= MERGE_NEED[t]) ready.push(t);   // с учётом номера на табло
  let h = "";
  if (ready.length) {
    const t = ready[0];
    h = `<button class="btn mergebtn ready" data-act="merge" data-t="${t}">${L("⚡ Слить {2} × «{0}» → «{1}»", TIERS[t].name, TIERS[t + 1].name, MERGE_NEED[t])}</button>`;
  } else if (S.drawn) {
    const t = pending ? Math.min(pending.tier, TOP - 1) : 0, need = MERGE_NEED[t], n = Math.min(tierCount(t), need);
    const dots = Array.from({ length: need }, (_, i) => `<i class="${i < n ? "on" : ""}" style="--mc:${TIERS[t].color}"></i>`).join("");
    h = `<div class="mergeinfo"><span class="mdots">${dots}</span><span>${L("Собери {2} × «{0}» в гараже → получишь «{1}»", TIERS[t].name, TIERS[t + 1].name, need)}</span></div>`;
  }
  el.style.display = h ? "" : "none";
  if (el._h !== h) { el._h = h; el.innerHTML = h; }    // без лишней перерисовки, чтобы не терять нажатия
}
function buyMany(id) {
  if (rolling) return;
  const c = Math.round(packPrice(id) * 9.5);
  if (S.coins < c) { Snd.err(); return toast(L("Нужно {0}", fmt(c))); }
  ac(); Mus.start();
  if (pending) resolvePending(false);
  S.coins -= c; S.bought += 10; addXp(PACKS[id].xp * 10);
  const res = []; for (let i = 0; i < 10; i++) res.push(drawPlate(id));
  if (!res.some(r => r.tier >= 1)) { const k = drawPlate(id, 1); res[9] = k; }
  let soldSum = 0, soldN = 0, kept = 0, best = 0;
  res.forEach(r => {
    markFound(r); S.tc[r.tier]++; best = Math.max(best, r.tier); addXp(XP_TIER[r.tier]);
    if (r.tier <= S.set.auto && !isLocked(r)) { const v = sellVal(r); gain(v); S.sold++; soldSum += v; soldN++; } else { keepPlate(r); kept++; }
  });
  if (res.some(r => r.tier >= 3)) S.pity = 0;
  const chips = [...res].sort((a, b) => b.tier - a.tier).map(r => plateHTML(r, "mini")).join("");
  const summary = () => openModal(`<h2>${L("Десяток бланков!")}</h2><div class="grid">${chips}</div>
    <p style="font-size:13px;color:#8d99b3">${L("Продано: {0} шт. (+{1}) · В гараж: {2}", soldN, fmt(soldSum), kept)}</p>
    <button class="btn" data-act="closeModal">${L("Класс!")}</button>`);
  const col = TIERS[best].color, bestPlate = res.filter(r => r.tier === best)[0];
  if (best >= 3) jackpot(bestPlate, { then: summary });          // сначала сцена джекпота, потом итог десятки
  else { Snd.win(best); [0, 1, 2, 3, 4, 5].forEach(i => setTimeout(() => Snd.thunk(i), i * 70)); summary(); if (best >= 2) { fx.confetti(60 + best * 20); vignette(col); } }
  updatePity(); renderPacks(); checkAch(); save();
}

// ===================== КИНО-СЦЕНЫ: джекпот, переезд, уровень, достижения =====================
// рулетка (для номеров) → удар → заголовок → иконка/номер переворачивается → барабан цифр останавливается → «Забрать»
let jpState = null;
const cinemaQueue = [];
function tierChanceText(r) {
  if (!r.pack || !PACKS[r.pack]) return "";
  const ws = packWeights(r.pack), sum = ws.reduce((a, b) => a + b, 0), pc = ws[r.tier] / sum * 100;
  return pc > 0 ? L("Шанс выпадения: {0}% — в среднем 1 из {1}", pctStr(pc), fmt(Math.round(100 / pc))) : "";
}
function jackpot(r, opts = {}) {                         // выпал блатной, легенда или суперлегенда: праздничная сцена (рулетка уже была при покупке)
  const t = r.tier, legend = t >= 4, sup = t === 5;
  if (legend) { Platform.happytime(); Platform.track(sup ? "superlegend" : "legend"); }
  if (legend && window.BgCity) BgCity.event("legend");     // на фоне по дороге проносится кортеж с мигалками
  cinema({
    color: TIERS[t].color, big: legend, bg: sup ? "#06243a" : undefined, cls: sup ? "super" : "",
    top: sup ? L("Такого не бывает…") : legend ? L("Что-то невероятное…") : L("Что же там внутри…"),
    title: sup ? L("СУПЕРЛЕГЕНДА!") : legend ? L("ЛЕГЕНДА!") : L("БЛАТНОЙ!"),
    plate: plateHTML(r, ""), value: r.val, valueLabel: L("СТОИМОСТЬ"), valueIcon: "💰",
    x: L("в {0} раз дороже обычного номера", fmt(Math.round(r.val / TIERS[0].val))), sub: tierChanceText(r), then: opts.then,
    share: Platform.canShare ? r : null                  // Telegram: «похвастаться» прямо с праздничного экрана
  });
}
function enqueueCinema(cfg) { cinemaQueue.push(cfg); }   // сцена покажется, когда игрок не занят (нет анимаций, окон, мини-игры)
setInterval(() => {
  if (!cinemaQueue.length || jpState || rolling || forging || miniRun || !$("modal").classList.contains("hidden")) return;
  cinema(cinemaQueue.shift());
}, 600);
function cinema(cfg) {
  if (jpState) jpState.close(true);
  const col = cfg.color, big = !!cfg.big, el = $("jp");
  const timers = []; const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let finished = false, fw = null;
  el.className = (big ? "legend " : "") + (cfg.cls || ""); el.style.setProperty("--jc", col); el.style.setProperty("--jbg", cfg.bg || (big ? "#4a0f2a" : "#2a1740"));
  // рулетка редкостей: на финальной позиции — наш тир, рядом — «почти» (у блатного рядом легенда)
  const FIN = 38, WCARD = 112, cards = []; let stripHTML = "";
  if (cfg.roulette != null) {
    const t = cfg.roulette;
    for (let i = 0; i < 46; i++) { const k = Math.random(); cards.push(k < 0.45 ? 0 : k < 0.72 ? 1 : k < 0.9 ? 2 : k < 0.98 ? 3 : 4); }
    cards[FIN] = t; cards[FIN + 1] = t === 4 ? 3 : 4; cards[FIN - 1] = t === 4 ? 4 : 3;
    stripHTML = `<div class="jp-strip-wrap" id="jpWrap"><div class="jp-mark"></div><div class="jp-strip" id="jpStrip">${cards.map(c => `<div class="jp-card" style="--cc:${TIERS[c].color}">${TIERS[c].name}</div>`).join("")}</div></div>`;
  }
  let li = 0;                                          // буквы влетают по одной; слова не рвутся, длинное название переносится по словам
  const title = String(cfg.title).split(" ").map(w => `<b class="jw">${w.split("").map(c => `<span style="animation-delay:${li++ * 0.07}s">${c}</span>`).join("")}</b>`).join(" ");
  let odoHTML = "";
  if (cfg.value) {
    const s = String(Math.floor(cfg.value));
    [...s].forEach((d, i) => { odoHTML += `<div class="odo-col"><div class="odo-strip" data-d="${d}" data-i="${i}"></div></div>`; if ((s.length - i - 1) % 3 === 0 && i < s.length - 1) odoHTML += `<div class="odo-sep"></div>`; });
  }
  el.innerHTML = `<div class="jp-rays"></div><div class="jp-flash" id="jpFlash"></div>
    <div class="jp-top" id="jpTop">${cfg.top || ""}</div>${stripHTML}
    <div class="jp-title" id="jpTitle">${title}</div>
    <div class="jp-plate" id="jpPlate">${cfg.plate || `<div class="jp-icon">${cfg.icon || "⭐"}</div>`}</div>
    <div class="jp-pricebox" id="jpPrice">${cfg.value ? `<div class="jp-lbl">${cfg.valueLabel || ""}</div><div class="odo" id="odo">${odoHTML}<span class="odo-c">${cfg.valueIcon || "💰"}</span></div>` : ""}<div class="jp-x" id="jpX"></div></div>
    <div class="jp-sub" id="jpSub">${cfg.sub || ""}</div>
    <button class="btn" id="jpBtn">${L("Забрать")}</button>${cfg.share ? `<button class="btn alt" id="jpShare">${L("📤 Похвастаться другу")}</button>` : ""}`;
  el.classList.remove("hidden"); void el.offsetWidth; el.classList.add("on");

  const wrap = $("jpWrap"), strip = $("jpStrip");
  const stripT = wrap ? (big ? 4800 : 3400) : 0, T1 = (wrap ? stripT + 450 : 1000);
  if (wrap) {
    const startX = wrap.offsetWidth / 2 - WCARD / 2;
    strip.style.transform = `translateX(${startX}px)`;
    const finalX = startX - (FIN * WCARD + (Math.random() - 0.5) * 40);
    later(() => { strip.style.transition = `transform ${stripT}ms cubic-bezier(.08,.6,.05,1)`; strip.style.transform = `translateX(${finalX}px)`; }, 120);
    const N = big ? 46 : 36;
    for (let i = 1; i <= N; i++) later(() => Snd.tick(i), 120 + stripT * (1 - Math.pow(1 - i / (N + 3), 0.5)));
    if (big) for (let i = 0; i < 7; i++) later(() => Snd.drum(), 1500 + i * 520);
  } else for (let i = 0; i < 5; i++) later(() => Snd.drum(), 100 + i * 170);
  Snd.rise(T1 / 1000);

  later(() => {                                                    // удар
    $("jpFlash").classList.add("go"); Snd.boom(); shake($("app"), big); vignette(col); buzz(big ? [120, 60, 240] : [120]);
    if (wrap) wrap.classList.add("gone"); $("jpTop").style.opacity = 0;
    $("jpTitle").classList.add("on"); Snd.win(big ? 4 : 3);
    fx.confetti(cfg.confetti || (big ? 170 : 90)); fx.burst(innerWidth / 2, innerHeight * 0.3, 70, [col, "#fff", "#ffe08a"], { speed: 380 });
    if (cfg.coinRain !== false) fx.coinRain(big ? 80 : 35);
    if (big) { fx.fireworks(8); fw = setInterval(() => fx.firework(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.12 + Math.random() * 0.35)), 1100); }
  }, T1);
  later(() => { $("jpPlate").classList.add("on"); Snd.whoosh(); }, T1 + 800);
  later(() => runOdo(), T1 + 1700);

  const cols = () => [...el.querySelectorAll(".odo-strip")];
  function prepOdo() {                                              // лента 0-9 повторяется несколько кругов, останов на нужной цифре
    cols().forEach((s, i) => {
      const fin = +s.dataset.d, cyc = 3 + i, n = cyc * 10 + fin + 1; let h = "";
      for (let k = 0; k < n; k++) h += `<span>${k % 10}</span>`;
      s.innerHTML = h; s.dataset.idx = n - 1; s.style.transition = "none"; s.style.transform = "translateY(0)";
    });
  }
  prepOdo();
  function runOdo() {
    $("jpPrice").classList.add("on"); void el.offsetWidth;
    const cs = cols();
    cs.forEach((s, i) => {
      const dur = 1500 + i * 450;
      s.style.transition = `transform ${dur}ms cubic-bezier(.12,.7,.08,1)`; s.style.transform = `translateY(calc(${-s.dataset.idx} * 1.1em))`;
      later(() => Snd.thunk(i), dur);
      for (let k = 1; k <= 10; k++) later(() => Snd.tick(k + i), dur * k / 11);
    });
    later(() => revealRest(), cs.length ? 1500 + (cs.length - 1) * 450 + 200 : 400);
  }
  function revealRest() {
    if (finished) return; finished = true;
    $("jpPrice").classList.add("on");
    if (cfg.x) $("jpX").textContent = cfg.x;
    $("jpSub").classList.add("on"); $("jpBtn").classList.add("on"); if ($("jpShare")) $("jpShare").classList.add("on");
    fx.fly(innerWidth / 2, innerHeight * 0.55, big ? 24 : 12); Snd.level();
  }
  function skip() {                                                  // тап: сразу финальная картинка
    timers.forEach(clearTimeout); timers.length = 0; if (finished) return;
    if (wrap) { wrap.classList.add("gone"); strip.style.transition = "none"; } $("jpTop").style.opacity = 0;
    $("jpTitle").classList.add("on", "instant"); $("jpPlate").classList.add("on", "instant"); $("jpPrice").classList.add("on");
    cols().forEach(s => { s.style.transition = "none"; s.style.transform = `translateY(calc(${-s.dataset.idx} * 1.1em))`; });
    revealRest();
  }
  function close(silent) {
    timers.forEach(clearTimeout); if (fw) clearInterval(fw);
    el.classList.remove("on"); el.classList.add("hidden"); el.innerHTML = ""; jpState = null;
    if (!silent && cfg.then) cfg.then();
  }
  jpState = { close };
  el.onclick = e => { if (e.target.id === "jpShare") brag(cfg.share); else if (e.target.id === "jpBtn" || (finished && e.target === el)) close(); else skip(); };
}

// ===================== ВЕРХНЯЯ ПАНЕЛЬ =====================
function renderPills() {
  let h = "";
  if (evOn()) h += `<span class="pill ev">🎉 ${escapeHTML(EV.text || L("Событие"))}: ${evText()} · ${mmss(EV.until * 1000 - Date.now())}</span>`;
  if (Date.now() < S.buffUntil) h += `<span class="pill buff">${L("🔥 Ажиотаж ×2 · {0}", mmss(S.buffUntil - Date.now()))}</span>`;
  const m = S.market;
  if (m && Date.now() < m.until) {
    const nm = m.kind === "tier" ? L("{0} номера", TIERS[m.key].name) : L("серия «{0}»", m.key);
    h += `<span class="pill mkt">${L("📈 В тренде: {0} ×{1} · {2}", nm, m.mult, mmss(m.until - Date.now()))}</span>`;
  }
  $("pills").innerHTML = h;
}
function renderHeader() {
  $("lvlnum").textContent = L("Ур. {0}", S.lvl);
  $("xpbar").style.width = (S.xp / xpNeed(S.lvl) * 100) + "%";
  $("ptsLabel").textContent = (S.title ? "🏷 " + L(S.title) + " " : "") + (S.pts ? "⭐ " + S.pts : "");
  $("inc").textContent = L("{0}/сек", fmt(income()));
  const bb = $("btnBuff"), left = S.buffUntil - Date.now();
  if (bb) { bb.disabled = left > 0; bb.textContent = left > 0 ? L("🔥 Доход ×2 · {0}", mmss(left)) : L("🔥 Доход ×2 на 5 мин (📺 реклама)"); }
  const ab = $("btnAd"), aleft = S.adNext - Date.now();     // бонус за рекламу — не чаще раза в AD_GAP
  if (ab) { ab.disabled = aleft > 0; ab.textContent = aleft > 0 ? L("🎁 Бонус · {0}", mmss(aleft)) : L("🎁 +{0} (📺 реклама)", fmt(adReward())); }
}

// ===================== ВКЛАДКА «НОМЕРА»: паки, шансы =====================
function renderPacks() {
  let h = "";
  for (const id in PACKS) {
    const P = PACKS[id], locked = S.lvl < P.lvl, c = packPrice(id);
    const ws = packWeights(id);
    const sum = ws.reduce((a, b) => a + b, 0), blat = ((ws[3] + ws[4]) / sum * 100);
    h += `<div class="pack ${locked ? "locked" : ""}"><div class="pi">${P.icon}</div>
      <div class="pt"><b>${P.name}</b><small>${locked ? L("🔒 Откроется на уровне {0}", P.lvl) : L("Шанс блатного+: {0}%", blat.toFixed(blat < 10 ? 1 : 0))}</small></div>
      <div class="btns"><button class="btn sm ${id === "basic" && S.drawn === 0 ? "ready" : ""}" data-act="buy" data-pack="${id}" data-cost="${c}" ${locked ? "disabled" : ""}>${fmt(c)} 💰</button>
      ${id === "basic" && !locked ? `<button class="btn sm alt" data-act="buy10" data-pack="${id}" data-cost="${Math.round(c * 9.5)}">×10 · ${fmt(Math.round(c * 9.5))}</button>` : ""}</div></div>`;
  }
  $("packs").innerHTML = h; refreshDisabled();
  let o = "";
  const w = packWeights("basic");
  const sum = w.reduce((a, b) => a + b, 0);
  TIERS.forEach((t, i) => { const pc = w[i] / sum * 100; o += `<div class="orow"><span style="color:${t.color}"><b>${t.name}</b> · ${L("продажа {0}", fmt(t.val))}</span><span style="text-align:right">${pctStr(pc)}%</span><div class="ob"><i style="width:${Math.max(pc, 1)}%;background:${t.color}"></i></div></div>`; });
  $("odds").innerHTML = o;
  $("btnTaxi").textContent = L("🚕 Таксовать +{0}", fmt(taxiTap()));
  syncAdButtons(); renderMergeBar();
}
// кнопки рекламы прячем, если площадка её не даёт (блокировщик, пробный запуск) — пустых кнопок быть не должно
function syncAdButtons() {
  $("btnAd").style.display = Platform.adsOK ? "" : "none";
  $("btnShop").style.display = Platform.canPay && S.tut === -1 ? "" : "none";   // магазин за звёзды — Telegram, после обучения
  $("btnBuff").style.display = Platform.adsOK && S.lvl >= 3 && S.plates.length ? "" : "none";   // доход ×2 имеет смысл, когда гараж уже приносит деньги
}
// вкладки открываются по мере роста, чтобы новичок не тонул в кнопках
function syncNav() { const b = document.querySelector('nav button[data-tab="orders"]'); if (b) b.classList.toggle("hidden", !ordersOpen()); }
function refreshDisabled() {
  document.querySelectorAll("[data-cost]").forEach(b => { const lockedPack = b.dataset.pack && S.lvl < PACKS[b.dataset.pack].lvl; b.disabled = lockedPack || S.coins < +b.dataset.cost; });
}

// ===================== ТАКСИ =====================
let taxiCombo = 0, taxiLast = 0;
function taxi(e) {
  ac(); Mus.start();
  const now = performance.now(); taxiCombo = now - taxiLast < 500 ? Math.min(taxiCombo + 1, 12) : 0; taxiLast = now;
  let v = taxiTap(), crit = Math.random() < 0.05 * up("crit"); if (crit) v *= 10;
  v = Math.round(v); gain(v); S.taxis++;
  const x = e && e.clientX ? e.clientX : innerWidth / 2, y = e && e.clientY ? e.clientY : innerHeight - 160;
  floatText(x - 10, y - 20, (crit ? "💥 " : "+") + fmt(v), crit ? "#ff3d71" : "#ffd23f");
  fx.burst(x, y, crit ? 24 : 4, ["#ffd23f", "#fff"], { speed: crit ? 260 : 120, life: 0.5, type: "coin" });
  crit ? (Snd.crit(), vignette("#ffd23f"), buzz(40)) : Snd.taxi(taxiCombo);
}

// ===================== ГАРАЖ =====================
function renderGarage() {
  const list = [...S.plates].sort((a, b) => b.val - a.val || b.id - a.id);
  let h = `<h2>${L("🏠 Гараж")} <small>${L("{0}/{1} мест · доход {2}/сек", S.plates.length, slots(), fmt(income()))}</small></h2>
    <div class="chips"><small style="align-self:center">${L("Продать всё ниже:")}</small>
    ${[0, 1, 2].map(t => `<button class="chip" data-act="sellTier" data-t="${t}" style="color:${TIERS[t].color}">≤ ${TIERS[t].name}</button>`).join("")}</div>`;
  const locked = S.plates.filter(isLocked).length;
  h += `<div class="row botrow"><button class="btn alt" data-act="botOpen">${L("🤖 Помощник")}${up("bot") ? ` <small>${S.bot.on ? L("работает") : L("выключен")}</small>` : ""}</button><button class="btn alt" data-act="botOpen" data-sec="wish">${L("🎯 Ищу номер")}${S.bot.wish.length ? ` <small>${S.bot.wish.length}</small>` : ""}</button></div>`;
  h += `<div class="mergegrid">${TIERS.slice(0, TOP).map((tr, t) => { const n = freeOf(t).length, lk = S.plates.filter(p => p.tier === t && isLocked(p)).length, ok = n >= MERGE_NEED[t];
    return `<button class="mcell ${ok ? "ready" : ""}" data-act="merge" data-t="${t}" ${ok ? "" : "disabled"} style="--mc:${tr.color}"><b>${tr.name}</b><small>${Math.min(n, 99)}/${MERGE_NEED[t]} → ${TIERS[t + 1].name}${lk ? " · 🔒" + lk : ""}</small></button>`; }).join("")}</div>`;
  if (locked) h += `<p class="hint" style="margin:4px 0">${L("🔒 Под замком: {0} — они не сливаются и не продаются. Замок — кнопка у номера.", locked)}</p>`;
  const ar = albumReady();
  h += `<button class="btn ${ar ? "green ready" : "alt"} albumbtn" data-act="album">${L("📒 Альбом номеров · {0}/{1}", albumCount(), ALBUM_TOTAL)}${ar ? " 🎁" : ""}${albumBonus() ? ` <small>+${Math.round(albumBonus() * 100)}%</small>` : ""}</button>`;
  h += setsHTML();
  if (!list.length) h += `<div class="hint">${L("Гараж пуст. Купи номер и нажми «В гараж» — номера приносят доход, даже когда тебя нет.")}</div>`;
  list.slice(0, 100).forEach(p => {
    const mm = marketMult(p);
    h += `<div class="item"><span data-act="plateInfo" data-id="${p.id}" style="cursor:pointer">${plateHTML(p, "small")}</span><div class="info" data-act="plateInfo" data-id="${p.id}" style="cursor:pointer"><b style="color:${TIERS[p.tier].color}">${TIERS[p.tier].name}</b>${mm > 1 ? " 📈" : ""} ℹ<br>${L("+{0}/сек", plateInc(p).toFixed(2))}<br><small>${L("нажми — история номера")}</small></div>
      <button class="lockbtn ${isLocked(p) ? "on" : ""}" data-act="lockPlate" data-id="${p.id}" title="${L("Замок: не сливать и не продавать")}">${isLocked(p) ? "🔒" : "🔓"}</button>
      ${isLocked(p) ? `<button class="sold-lock" disabled>${L("Под замком")}</button>` : `<button data-act="sellPlate" data-id="${p.id}">${L("Продать {0}", fmt(sellVal(p)))}</button>`}</div>`;
  });
  $("tab-garage").innerHTML = h;
}
function sellPlate(id) {
  const p = S.plates.find(x => x.id === id); if (!p) return;
  if (isLocked(p)) return toast(L("🔒 Номер под замком — сначала сними замок"));
  S.plates = S.plates.filter(x => x.id !== id); gain(sellVal(p)); S.sold++; Snd.sell();
  fx.fly(innerWidth / 2, innerHeight / 2, 4); renderGarage(); renderHeader(); save();
}
function sellTier(t) {
  let sum = 0, n = 0; const keep = [];
  S.plates.forEach(p => { if (p.tier <= t && !isLocked(p)) { sum += sellVal(p); n++; } else keep.push(p); });
  if (!n) return toast(L("Нечего продавать"));
  S.plates = keep; gain(sum); S.sold += n; Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 10);
  toast(L("Продано {0} шт. на {1}", n, fmt(sum))); renderGarage(); renderHeader(); save();
}

// ===================== ЗАКАЗЫ =====================
function genOrder() {
  const L = S.lvl, r = Math.random(); let o;
  if (L >= 10 && r < 0.1) o = { k: "tier", t: 3 };
  else if (r < 0.45 || L < 3) o = { k: "tier", t: 1 };
  else if (r < 0.7) o = { k: "tier", t: 2 };
  else if (r < 0.85 && L >= 4) o = { k: "digits", d: pick(SPECIAL_DIGITS) };
  else if (L >= 6) o = { k: "series", s: pick(BLAT_SER) };
  else o = { k: "tier", t: 1 };
  const base = o.k === "tier" ? TIERS[o.t].val * 1.8 : o.k === "digits" ? 700 : 4500;
  o.reward = Math.round(base * (1 + 0.06 * L)); o.id = S.nid++; o.who = pick(Object.keys(CLIENT_LINE)); return o;
}
function orderMatch(o, p) { return o.k === "tier" ? p.tier >= o.t : o.k === "digits" ? p.d === o.d : seriesOf(p) === o.s; }
function orderText(o) { return o.k === "tier" ? L("Номер не ниже «{0}»", TIERS[o.t].name) : o.k === "digits" ? L("Номер с цифрами «{0}»", o.d) : L("Номер серии «{0}»", o.s); }
function orderPlate(o) { return S.plates.filter(p => orderMatch(o, p) && !isLocked(p)).sort((a, b) => a.val - b.val)[0]; }
const ordersOpen = () => S.lvl >= 2 || S.story.ch >= 1;   // заказы открывает 2 уровень или глава «Первые клиенты»
function ensureOrders() { if (!ordersOpen()) return; while (S.orders.length < 3) S.orders.push(genOrder()); }
function renderOrders() {
  if (!ordersOpen()) { $("tab-orders").innerHTML = `<h2>${L("📋 Заказы")}</h2><div class="hint">${L("Откроются на уровне 2")}</div>`; return; }
  ensureOrders();
  let h = `<h2>${L("📋 Заказы клиентов")}</h2><p style="font-size:12px;color:#8d99b3;margin-top:-4px">${L("Отдай подходящий номер из гаража — получишь больше, чем при продаже.")}</p>`;
  S.orders.forEach(o => {
    const p = orderPlate(o);
    const who = CHARS[o.who] || CHARS.tamara;
    h += `<div class="card ${p ? "done" : ""}"><div class="client"><span>${who.i}</span><b style="color:${who.c}">${who.n}</b><i>«${L(CLIENT_LINE[o.who] || CLIENT_LINE.tamara)}»</i></div><h3>${orderText(o)}</h3><p>${L("Награда:")} <b style="color:#ffd23f">${fmt(o.reward)} 💰</b> · ${L("+15 опыта")}</p>
      ${p ? plateHTML(p, "small") : ""}
      <button class="btn ${p ? "green ready" : "alt"}" data-act="orderDo" data-id="${o.id}" ${p ? "" : "disabled"}>${p ? L("Отдать номер") : L("Нет подходящего номера")}</button></div>`;
  });
  const wait = S.ordAt - Date.now();
  h += `<button class="btn alt" data-act="orderReroll" ${wait > 0 ? "disabled" : ""}>${L("🔄 Обновить заказы")} ${wait > 0 ? '<span class="timer" data-until="' + S.ordAt + '"></span>' : L("(бесплатно)")}</button>`;
  $("tab-orders").innerHTML = h;
}
function orderDo(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return; const p = orderPlate(o); if (!p) return;
  S.plates = S.plates.filter(x => x.id !== p.id); gain(o.reward); S.ordersDone++; addXp(15);
  S.orders = S.orders.filter(x => x.id !== id); S.orders.push(genOrder());
  Snd.win(2); fx.fly(innerWidth / 2, innerHeight / 2, 14); vignette("#43c76b"); toast(L("Заказ выполнен! +{0}", fmt(o.reward)));
  renderOrders(); renderHeader(); checkAch(); save();
}
function orderReroll() {
  if (Date.now() < S.ordAt) return; S.orders = []; ensureOrders(); S.ordAt = Date.now() + 600000; Snd.whoosh(); renderOrders(); save();
}
function updateOrderDot() { $("orderDot").classList.toggle("on", ordersOpen() &&S.orders.some(o => orderPlate(o))); }

// ===================== УЛУЧШЕНИЯ =====================
function renderUps() {
  let h = `<h2>${L("⚙ Улучшения")}</h2>`;
  UPS.forEach(u => {
    const lvl = up(u.id), maxed = lvl >= u.max, cost = upCost(u);
    h += `<div class="card"><h3>${u.name} <small>${L("ур. {0}", lvl)}${maxed ? L(" (макс.)") : "/" + u.max}</small></h3><p>${u.desc}</p>
      <button class="btn" data-act="buyUp" data-id="${u.id}" data-cost="${maxed ? 1e300 : cost}" ${maxed ? "disabled" : ""}>${maxed ? L("МАКСИМУМ") : L("Улучшить — {0} 💰", fmt(cost))}</button>${u.id === "bot" && lvl ? `<button class="btn alt" data-act="botOpen">${L("⚙ Настроить помощника")}</button>` : ""}</div>`;
  });
  $("tab-up").innerHTML = h; refreshDisabled();
}
function buyUp(id) {
  const u = UPS.find(x => x.id === id), c = upCost(u);
  if (up(id) >= u.max || S.coins < c) return Snd.err();
  S.coins -= c; S.up[id] = up(id) + 1; Snd.level(); vignette("#ffd23f"); fx.burst(innerWidth / 2, 200, 20, ["#ffd23f", "#fff"]);
  renderUps(); renderPacks(); updatePity(); renderHeader(); save();
}

// ===================== ЕЩЁ: мини-игра, престиж, серии, достижения, статистика, настройки =====================
// ===================== СТАРТОВОЕ МЕНЮ И «КАК ИГРАТЬ» =====================
function showMenu() {
  $("menu").innerHTML = `<div class="mlogo">🚘</div><h1>${I18N.TITLE[I18N.lang] || I18N.TITLE.ru}</h1>
    <div class="msub">${L("Выбивай блатные номера и собирай гараж с доходом")}</div>
    <button class="btn green" data-act="menuPlay">${L("▶ Играть")}</button>
    <button class="btn alt" data-act="menuHow">${L("📖 Как играть")}</button>
    <button class="btn alt" data-act="menuSettings">${L("🔧 Настройки")}</button>
    <div class="mfoot">${L("Игра вымышленная: номера генерируются случайно, монеты нельзя обменять на реальные деньги.")}</div>`;
  $("menu").classList.remove("hidden");
}
function hideMenu() { $("menu").classList.add("hidden"); Mus.start(); }
function showHowTo() {
  const P = [
    "🚘 Покупай бланки номеров. Табло крутится — и выпадает номер одной из 6 редкостей: обычный, красивый, редкий, блатной, легенда или суперлегенда.",
    "🏠 Ставь номера в гараж — там они приносят доход каждую секунду, даже когда ты не в игре.",
    "⚡ Главное — слияние: несколько номеров одной редкости превращаются в 1 номер редкостью выше (обычные и красивые — по 3, редкие — по 4, блатные — по 5, легенды — по 8).",
    "📚 Собирай наборы коллекции (во вкладке «Гараж»): за каждый собранный набор — награда и вечный бонус к доходу.",
    "🚕 Не хватает денег — жми «Таксовать».",
    "📋 Со 2-го уровня открываются заказы: отдай подходящий номер и получи больше, чем при продаже.",
    "🔨 В «Тюнинге» можно рискнуть: поставь номера и выбери цель подороже — стрелка решит, получишь ли ты её или потеряешь ставку.",
    "⚙ Апгрейды повышают шанс редких номеров, дают скидки на бланки и места в гараже.",
    "🎣 С 4-го уровня — мини-игра «Поймай номер», с 10-го — «Переезд в Москву»: начни заново с вечным бонусом.",
    "📖 Шансы выпадения смотри под бланками, достижения — во вкладке «Ещё»."
  ];
  openModal(`<h2>${L("📖 Как играть")}</h2><div class="howto">${P.map(p => `<p>${L(p)}</p>`).join("")}</div>
    <div class="row"><button class="btn alt" data-act="menuBack">${L("← В меню")}</button><button class="btn green" data-act="closeModal">${L("Играть")}</button></div>`);
}
function openTab(t) { const b = document.querySelector(`nav button[data-tab="${t}"]`); if (b) b.click(); }

function renderMore() {
  const miniWait = S.mini.next - Date.now(), canMini = S.lvl >= 4 && miniWait <= 0;
  let h = `<h2>${L("☰ Ещё")}</h2>
  <div class="row"><button class="btn alt" data-act="menuOpen">${L("☰ Главное меню")}</button><button class="btn alt" data-act="menuHow">${L("📖 Как играть")}</button></div>
  <div class="profbox" data-act="profile">${myCard(true)}</div>
  <div class="row"><button class="btn alt" data-act="profile">${L("✏️ Мой профиль")}</button>${Platform.canShare ? `<button class="btn ${reqsN ? "green ready" : "alt"}" data-act="friends">${L("👥 Друзья")}${reqsN ? ` <b class="badge">${reqsN}</b>` : ""}</button>` : ""}</div>
  ${isAdmin ? `<button class="btn red" data-act="admin">🛠 Админка</button>` : ""}
  ${Platform.canPay ? `<button class="btn star" data-act="shop">${L("⭐ Магазин — деньги, номера, ×2 навсегда")}</button>` : ""}
  ${questsHTML()}
  ${Platform.canShare ? `<div class="card"><h3>${L("🤝 Пригласи друга")}</h3><p>${L("Друг сразу получит блатной номер, а ты — блатной, когда друг дойдёт до 3 уровня. Друзей — без ограничений!")}</p>
    ${refs.n ? `<p style="font-size:13px;color:#8d99b3">${L("Пришли по твоей ссылке: {0} · втянулись: {1}", refs.n, refs.done)}</p>` : ""}
    ${refs.respect ? `<p style="font-size:13px;color:#8d99b3">${L("👍 Респектов твоему гаражу: {0}", refs.respect)}</p>` : ""}
    <button class="btn green" data-act="invite">${L("📤 Пригласить друга")}</button></div>
    <button class="btn alt" data-act="top">${L("🏆 Рейтинг недели — призы каждый понедельник")}</button>` : ""}
  ${subsLeft().length ? `<div class="card subcard"><h3>${L("🎁 Бонус за подписку")}</h3>${subsHTML("green")}</div>` : ""}
  ${achWaiting() ? `<div class="card achbox"><h3>${L("🏆 Награды за достижения")}</h3><p>${L("Готово к получению: {0}", achWaiting())}</p>
    <button class="btn green ready" data-act="achClaimAll">${L("Забрать всё (+{0} 💰)", fmt(Object.keys(S.achClaim).reduce((s, id) => s + achReward(ACH.find(a => a.id === id) || { r: 0 }), 0)))}</button></div>` : ""}
  <div class="card"><h3>${L("🎣 Поймай номер")}</h3><p>${L("Мини-игра на 25 секунд: лови падающие номера тапом — блатные дороже! Но не трогай 🚔.")} ${L("Рекорд:")} <b>${fmt(S.mini.best)}</b></p>
    <button class="btn ${canMini ? "green ready" : "alt"}" data-act="miniStart" ${canMini ? "" : "disabled"}>${S.lvl < 4 ? L("🔒 Откроется на уровне {0}", 4) : miniWait > 0 ? L("Перезарядка") + ' <span class="timer" data-until="' + S.mini.next + '"></span>' : L("ИГРАТЬ")}</button>
    ${S.lvl >= 4 && miniWait > 0 && Platform.adsOK ? `<button class="btn alt" data-act="miniAd">${L("🎁 Сбросить перезарядку (📺 реклама)")}</button>` : ""}</div>`;
  const gain_ = prestigeGain();
  h += `<div class="card"><h3>${L("🏛 Переезд в Москву")} <small>${L("(престиж)")}</small></h3><p>${L("Сбрось деньги, гараж и апгрейды — и получи ⭐ «Связи»: каждая даёт навсегда +10% дохода и +3% к удаче.")} ${L("Сейчас ⭐ {0}. За этот забег:", S.pts)} <b style="color:#ffb300">+${gain_} ⭐</b></p>
    <button class="btn ${gain_ > 0 ? "red" : "alt"}" data-act="prestige" ${S.lvl >= 10 && gain_ > 0 ? "" : "disabled"}>${S.lvl < 10 ? L("🔒 Откроется на уровне {0}", 10) : gain_ > 0 ? L("Переехать (+{0} ⭐)", gain_) : L("Нужно заработать ещё (от {0} за забег)", fmt(1500000))}</button></div>`;
  h += `<div class="card"><h3>${L("📖 История")} <small>${Math.min(S.story.ch, STORY.length)}/${STORY.length}</small></h3>` +
    STORY.map((c, i) => { const st = i < S.story.ch ? "✅" : i === S.story.ch ? "▶" : "🔒";
      return `<div class="ach ${i > S.story.ch ? "lock" : ""}"><div class="ai">${st}</div><div><b>${L("Глава {0} · {1}", i + 1, i > S.story.ch ? "???" : L(c.t))}</b><small>${i <= S.story.ch && c.title ? L("титул «{0}»", L(c.title)) : ""}</small></div><div></div></div>`; }).join("") + `</div>`;
  h += `<div class="card"><h3>${L("🏆 Достижения")} <small>${Object.keys(S.ach).length}/${ACH.length}</small></h3>`;
  ACH.forEach(a => { const ok = S.ach[a.id], wait = S.achClaim[a.id]; h += `<div class="ach ${ok ? "" : "lock"}"><div class="ai">${a.i}</div><div><b>${a.n}</b><small>${a.d}</small></div><div>${wait ? `<button class="btn sm green ready" data-act="achClaim" data-id="${a.id}">${L("Забрать +{0}", fmt(achReward(a)))}</button>` : ok ? "✅" : "+" + fmt(achReward(a))}</div></div>`; });
  h += `</div><div class="card"><h3>${L("📊 Статистика")}</h3>
    ${[["Куплено номеров", S.bought], ["Продано", S.sold], ["Всего заработано", fmt(S.earned)], ["Выпало: обычных", S.tc[0]], ["Выпало: красивых", S.tc[1]], ["Выпало: редких", S.tc[2]], ["Выпало: блатных", S.tc[3]], ["Выпало: легенд", S.tc[4]], ["Выпало: суперлегенд", S.tc[5]], ["Слияний", S.merges], ["Наборов собрано", setsDone() + "/" + SETS.length], ["Альбом номеров", albumCount() + "/" + ALBUM_TOTAL],["Заказов выполнено", S.ordersDone], ["Попыток в мастерской", S.forge.tries], ["Удачных улучшений", S.forge.wins], ["Переездов", S.prest], ["Время в игре", L("{0} мин", Math.floor(S.playSec / 60))]]
      .map(r => `<div class="stat"><span>${L(r[0])}</span><b>${r[1]}</b></div>`).join("")}</div>
  <div class="card"><h3>${L("🔧 Настройки")}</h3>
    <div class="setrow"><span>${L("🎵 Музыка")}</span><button class="tog ${S.set.music ? "on" : ""}" data-act="toggle" data-k="music"></button></div>
    <div class="setrow"><span>${L("🔊 Звуки")}</span><button class="tog ${S.set.sfx ? "on" : ""}" data-act="toggle" data-k="sfx"></button></div>
    <div class="setrow"><span>${L("📳 Вибрация")}</span><button class="tog ${S.set.vib ? "on" : ""}" data-act="toggle" data-k="vib"></button></div>
    <div class="setrow"><span>${L("🌃 Живой фон (город)")}</span><button class="tog ${S.set.city ? "on" : ""}" data-act="toggle" data-k="city"></button></div>
    <div class="setrow"><span>${L("Авто-продажа")}</span><select id="autoSel">${["Выкл", "Обычные", "До красивых", "До редких"].map((n, i) => `<option value="${i - 1}" ${S.set.auto === i - 1 ? "selected" : ""}>${L(n)}</option>`).join("")}</select></div>
    <button class="btn alt" data-act="resetSave" id="btnReset">${L("Сбросить прогресс")}</button></div>
  <div class="hint">${L("Игра вымышленная: все истории, владельцы и слухи придуманы, любые совпадения случайны. «Блатными» в народе называют номера, которые считают статусными. Внутриигровые монеты нельзя обменять на реальные деньги и призы.")}</div>`;
  $("tab-more").innerHTML = h;
  const sel = $("autoSel"); if (sel) sel.onchange = () => { S.set.auto = +sel.value; save(); };
}
const prestigeGain = () => Math.floor(Math.sqrt(S.earnedRun / 1500000));
function doPrestige() {
  const g = prestigeGain(); if (g < 1) return;
  const keep = { drawn: S.drawn, goal: S.goal, achClaim: S.achClaim, story: S.story, tut: S.tut, title: S.title, sets: S.sets, merges: S.merges, mergeBest: S.mergeBest, forge: Object.assign({}, S.forge, { sel: [], coins: 0, target: null, lots: [], boost: false }), found: S.found, ach: S.ach, lvl: S.lvl, xp: S.xp, set: S.set, mini: S.mini, daily: S.daily, tc: S.tc, bought: S.bought, sold: S.sold, earned: S.earned, ordersDone: S.ordersDone, playSec: S.playSec, taxis: S.taxis, buyers: S.buyers, subs: S.subs, paid: S.paid, quests: S.quests, album: S.album, soc: S.soc, bot: Object.assign({}, S.bot, { log: [] }), prof: Object.assign({}, S.prof, { pins: [] }) };   // покупки и бонусы за подписку переезд не обнуляет
  const n = fresh(); Object.assign(n, keep); n.pts = S.pts + g; n.prest = S.prest + 1; n.nid = S.nid; n.coins = START_COINS + 200 * n.pts;
  S = n; pending = null; closeModal(); cinemaQueue.length = 0;
  enqueueCinema({ color: "#ffb300", bg: "#3a2a05", big: true, icon: "🏛", top: L("Переезд в Москву"), title: L("НОВАЯ ЖИЗНЬ"), value: g, valueLabel: L("СВЯЗИ ПОЛУЧЕНО"), valueIcon: "⭐",
    x: L("Всего ⭐ {0}: +{1}% к доходу и ×{2} к удаче", n.pts, n.pts * 10, Math.pow(1.03, n.pts).toFixed(2)), sub: L("Деньги, гараж и апгрейды обнулены — зато теперь всё идёт быстрее") });
  renderAll(); checkAch(); save();
}

// ===================== МИНИ-ИГРА «ПОЙМАЙ НОМЕР» =====================
let miniRun = null;
function startMini() {
  if (S.lvl < 4 || Date.now() < S.mini.next) return;
  ac(); Mus.start();
  openModal(`<h2>${L("🎣 Поймай номер!")}</h2><small>${L("Тапай номера · 🚔 = −3 сек")}</small>
    <div class="timer" id="miniHud" style="margin-top:6px;font-size:16px"></div>
    <canvas id="mini" width="340" height="440"></canvas>`, true);
  const cv = $("mini"), c = cv.getContext("2d");
  const m = { items: [], pops: [], t: 25, score: 0, combo: 0, spawn: 0.3, last: performance.now(), run: true };
  miniRun = m;
  const W = 340, H = 440;
  cv.onpointerdown = e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    for (let i = m.items.length - 1; i >= 0; i--) {
      const it = m.items[i];
      if (x > it.x - 10 && x < it.x + it.w + 10 && y > it.y - 10 && y < it.y + it.h + 10) {
        m.items.splice(i, 1);
        if (it.cop) { m.t -= 3; m.combo = 0; Snd.err(); m.pops.push({ x: it.x, y: it.y, t: 0, txt: L("−3 сек"), col: "#ff3d71" }); }
        else {
          m.combo++; const v = Math.round([4, 25, 120, 800, 5000][it.tier] * (1 + Math.min(m.combo, 20) * 0.05)); m.score += v;
          Snd.coin(); if (it.tier >= 2) Snd.win(it.tier - 1);
          m.pops.push({ x: it.x, y: it.y, t: 0, txt: "+" + fmt(v), col: TIERS[it.tier].color });
        }
        return;
      }
    }
  };
  function draw() {
    c.fillStyle = "#10182a"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#1b2440"; for (let i = 0; i < 4; i++) c.fillRect(W / 4 * i + W / 8 - 1, 0, 2, H);
    for (const it of m.items) {
      if (it.cop) { c.font = "34px Arial"; c.textBaseline = "top"; c.fillText("🚔", it.x, it.y - 2); continue; }
      c.fillStyle = "#fff"; c.strokeStyle = TIERS[it.tier].color; c.lineWidth = 3;
      c.beginPath(); c.roundRect ? c.roundRect(it.x, it.y, it.w, it.h, 5) : c.rect(it.x, it.y, it.w, it.h); c.fill(); c.stroke();
      c.fillStyle = "#111"; c.font = "bold 13px Arial"; c.textBaseline = "middle"; c.textAlign = "center"; c.fillText(it.txt, it.x + it.w / 2, it.y + it.h / 2 + 1); c.textAlign = "left";
    }
    for (const p of m.pops) { c.globalAlpha = 1 - p.t; c.fillStyle = p.col; c.font = "bold 17px Arial"; c.fillText(p.txt, p.x, p.y - p.t * 40); }
    c.globalAlpha = 1;
  }
  (function loop(now) {
    if (!m.run) return;
    const dt = Math.min((now - m.last) / 1000, 0.05); m.last = now;
    m.t -= dt; m.spawn -= dt;
    if (m.spawn <= 0) {
      m.spawn = Math.max(0.25, 0.62 - (25 - m.t) * 0.014);
      const w = 74, lane = rnd(4);
      if (Math.random() < 0.14) m.items.push({ cop: true, x: W / 4 * lane + 20, y: -30, w: 34, h: 34, vy: 150 });
      else {
        const r = Math.random() * 100, tier = r < 58 ? 0 : r < 84 ? 1 : r < 94 ? 2 : r < 99 ? 3 : 4;
        const p = build(tier); m.items.push({ tier, txt: p.l1 + p.d + p.l23 + " " + p.reg, x: clamp(W / 4 * lane + rnd(10), 2, W - w - 2), y: -30, w, h: 26, vy: 130 + (25 - m.t) * 7 });
      }
    }
    m.items.forEach(it => it.y += it.vy * dt); m.items = m.items.filter(it => it.y < H + 30);
    m.pops.forEach(p => p.t += dt * 1.4); m.pops = m.pops.filter(p => p.t < 1);
    $("miniHud") && ($("miniHud").textContent = "⏱ " + Math.max(0, m.t).toFixed(1) + " · 💰 " + fmt(m.score) + (m.combo > 2 ? " · 🔥 x" + m.combo : ""));
    draw();
    if (m.t <= 0) endMini(m); else requestAnimationFrame(loop);
  })(performance.now());
}
function endMini(m) {
  m.run = false; miniRun = null;
  const pay = Math.round(m.score * (1 + 0.08 * S.lvl));
  gain(pay); S.mini.plays++; S.mini.best = Math.max(S.mini.best, m.score); S.mini.next = Date.now() + 240000;
  Snd.win(pay > 8000 ? 4 : pay > 1500 ? 3 : 2); fx.confetti(60); fx.fly(innerWidth / 2, innerHeight / 2, 12);
  openModal(`<h2>${L("Время вышло!")}</h2><div style="font-size:34px;font-weight:bold;color:#ffd23f;margin:8px 0">+${fmt(pay)} 💰</div>
    <p style="font-size:13px;color:#8d99b3">${L("Очки: {0} × бонус уровня. Рекорд: {1}", fmt(m.score), fmt(S.mini.best))}</p><button class="btn" data-act="closeModal">${L("Отлично")}</button>`);
  checkAch(); save(); if (tab === "more") renderMore();
  interstitial();
}

// ===================== ПОКУПАТЕЛЬ (золотая машина) =====================
let buyerTimer = null;
function scheduleBuyer() { clearTimeout(buyerTimer); buyerTimer = setTimeout(spawnBuyer, (BUYER_MIN + Math.random() * (BUYER_MAX - BUYER_MIN)) * 1000); }
function spawnBuyer() {
  if (hidden || S.lvl < 1) return scheduleBuyer();
  const b = $("buyer"); b.classList.remove("hidden"); b.style.animation = "none"; void b.offsetWidth;
  b.style.top = (22 + Math.random() * 40) + "%"; b.style.animation = ""; Snd.whoosh();
  setTimeout(() => b.classList.add("hidden"), 7100); scheduleBuyer();
}
$("buyer").addEventListener("pointerdown", e => {
  const b = $("buyer"); if (b.classList.contains("hidden")) return;
  b.classList.add("hidden"); S.buyers++;
  if (Math.random() < 0.5) { const v = Math.round(40 + income() * 45); gain(v); toast(L("🚘 Богатый покупатель дал {0}!", fmt(v))); fx.fly(e.clientX, e.clientY, 14); Snd.sell(); }
  else { S.buffUntil = Math.max(S.buffUntil, Date.now()) + 20000; toast(L("🔥 Ажиотаж! Доход ×2 на 20 секунд")); fx.burst(e.clientX, e.clientY, 30, ["#ffd23f", "#ff9a3c"]); Snd.level(); renderPills(); }
  vignette("#ffd23f");
});

// ===================== ЕЖЕДНЕВНЫЙ БОНУС =====================
function checkDaily() {
  if (S.daily.last === todayStr()) return;
  S.daily.streak = S.daily.last === yesterdayStr() ? (S.daily.streak % 7) + 1 : 1;
  const d = S.daily.streak;
  const days = DAILY.map((r, i) => `<div class="day ${i + 1 === d ? "cur" : i + 1 < d ? "got" : ""}">${L("День {0}", i + 1)}<b>${r === "prem" ? "💼" : fmt(r)}</b></div>`).join("");
  openModal(`<h2>${L("🎁 Ежедневный бонус")}</h2><p style="font-size:13px;color:#8d99b3">${L("Заходи каждый день — на 7-й день ждёт номер из премиум-бланка!")}</p><div class="days">${days}</div>
    <button class="btn green" data-act="claimDaily">${L("Забрать")}</button>`, true);
}
function claimDaily() {
  const r = DAILY[S.daily.streak - 1]; S.daily.last = todayStr(); closeModal(); Snd.win(2);
  if (r === "prem") {
    const p = drawPlate("prem"); markFound(p); S.tc[p.tier]++; keepPlate(p); if (p.tier >= 3) jackpot(p); else { fx.confetti(100); bigText(TIERS[p.tier].name + "!", TIERS[p.tier].color); }
    toast(L("💼 Номер в гараже: {0}", p.l1 + p.d + p.l23 + " " + p.reg)); Snd.win(p.tier);
  } else { const v = Math.round(r * (1 + 0.05 * S.lvl)); gain(v); fx.fly(innerWidth / 2, innerHeight / 2, 14); toast("+" + fmt(v) + " 💰"); }
  renderAll(); save();
}

// ===================== ДОСТИЖЕНИЯ =====================
const found = pre => Object.keys(S.found).filter(k => k.startsWith(pre)).length;
const ACH = [
  { id: "b1", i: "🛒", n: "Первый номер", d: "Купи номер", c: () => S.bought >= 1, r: 50 },
  { id: "b2", i: "🧾", n: "Постоянный клиент", d: "Купи 50 номеров", c: () => S.bought >= 50, r: 600 },
  { id: "b3", i: "🏭", n: "Оптовик", d: "Купи 500 номеров", c: () => S.bought >= 500, r: 8000 },
  { id: "t2", i: "💜", n: "Редкая находка", d: "Выбей редкий номер", c: () => S.tc[2] + S.tc[3] + S.tc[4] + S.tc[5] >= 1, r: 150 },
  { id: "t3", i: "⭐", n: "Блатной!", d: "Выбей блатной номер", c: () => S.tc[3] + S.tc[4] + S.tc[5] >= 1, r: 1000 },
  { id: "t4", i: "🔥", n: "Легенда", d: "Выбей легендарный номер", c: () => S.tc[4] + S.tc[5] >= 1, r: 6000 },
  { id: "t5", i: "🦅", n: "Спецсерия", d: "Выбей суперлегендарный номер", c: () => S.tc[5] >= 1, r: 60000 },
  { id: "s4", i: "📖", n: "Коллекционер", d: "Найди 4 блатные серии", c: () => found("s:") >= 4, r: 3000 },
  { id: "s7", i: "📚", n: "Все серии", d: "Найди все 7 серий", c: () => found("s:") >= 7, r: 25000 },
  { id: "g1", i: "🏠", n: "Полный гараж", d: "Заполни все места в гараже", c: () => S.plates.length >= slots(), r: 500 },
  { id: "e1", i: "💵", n: "Миллионер", d: "Заработай 1 млн за всё время", c: () => S.earned >= 1e6, r: 10000 },
  { id: "e2", i: "💎", n: "Миллиардер", d: "Заработай 1 млрд за всё время", c: () => S.earned >= 1e9, r: 1e6 },
  { id: "o1", i: "📋", n: "Исполнитель", d: "Выполни 10 заказов", c: () => S.ordersDone >= 10, r: 1500 },
  { id: "m1", i: "🎣", n: "Ловец номеров", d: "Набери 2000 очков в мини-игре", c: () => S.mini.best >= 2000, r: 1000 },
  { id: "l1", i: "🎖", n: "Опытный", d: "Достигни 10 уровня", c: () => S.lvl >= 10, r: 3000 },
  { id: "p1", i: "🏛", n: "Новая жизнь", d: "Переедь в Москву", c: () => S.prest >= 1, r: 5000 },
  { id: "x1", i: "🚕", n: "Таксист", d: "Тапни «Таксовать» 500 раз", c: () => S.taxis >= 500, r: 500 },
  { id: "f1", i: "🔨", n: "Мастер тюнинга", d: "Удачно улучши номер в мастерской", c: () => S.forge.wins >= 1, r: 300 },
  { id: "f2", i: "🎲", n: "Рискованный", d: "Сделай легенду в мастерской", c: () => S.forge.legend >= 1, r: 5000 },
  { id: "f3", i: "🧯", n: "Упорство", d: "Сделай 20 попыток в мастерской", c: () => S.forge.tries >= 20, r: 1000 },
  { id: "y1", i: "🚘", n: "Лови покупателя", d: "Поймай 5 богатых покупателей", c: () => S.buyers >= 5, r: 500 }
];
ACH.forEach(a => Lprops(a, "n", "d"));
const achReward = a => a.r;                  // награды — не больше стоимости самого достижения, чтобы не ломать экономику
// достижения не всплывают на экране: награда копится, на вкладке «Ещё» горит точка, игрок забирает её сам
const achWaiting = () => Object.keys(S.achClaim).length;
function updateMoreDot() { $("moreDot").classList.toggle("on", achWaiting() > 0 || questsReady() > 0 || reqsN > 0); }
function checkAch() {
  checkSets(); renderGoal(); storyEvents();
  ACH.forEach(a => {
    if (!S.ach[a.id] && a.c()) {
      if (!achWaiting()) toast(L("🏆 Новое достижение — награда ждёт во вкладке «Ещё»"));   // одна подсказка на пачку, дальше хватает точки
      S.ach[a.id] = true; S.achClaim[a.id] = 1; Snd.coin(); updateMoreDot();
      if (tab === "more") renderMore(); }
  });
}
function claimAch(ids) {
  let sum = 0; ids.forEach(id => { const a = ACH.find(x => x.id === id); if (a && S.achClaim[id]) { sum += achReward(a); delete S.achClaim[id]; } });
  if (!sum) return;
  gain(sum); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, Math.min(20, 6 + ids.length * 2)); fx.confetti(30); toast("🏆 +" + fmt(sum) + " 💰");
  updateMoreDot(); renderMore(); renderHeader(); save();
}

// ===================== МАСТЕРСКАЯ ТЮНИНГА («апгрейдер») =====================
// Выбираешь номера (и можешь добавить монеты), выбираешь цель. Шанс = стоимость входа / стоимость цели × 0.9.
// Чем дороже цель относительно входа — тем ниже шанс и выше награда. Стрелка падает в дугу — успех, иначе входные номера сгорают.
const FORGE_EDGE = 0.8, FORGE_CAP = 0.85, FORGE_MIN = 0.01, GAUGE_C = 703.72;
let forging = false, forgeView = "mine", needleAng = 0;
const selPlates = () => S.forge.sel.map(id => S.plates.find(p => p.id === id)).filter(Boolean);
const curLot = () => S.forge.lots.find(l => l.id === S.forge.target) || null;
const plateSum = () => selPlates().reduce((a, p) => a + p.val, 0);
const forgeFactor = () => FORGE_EDGE * (1 + 0.05 * up("forge")) * (S.forge.boost ? 1.25 : 1);
const forgeChanceFor = (inV, lot) => (!lot || inV <= 0) ? 0 : Math.min(FORGE_CAP, forgeFactor() * inV / lot.val);
const forgeMaxCoins = () => { const l = curLot(); return l ? Math.max(0, Math.min(Math.floor(S.coins), Math.ceil(l.val * FORGE_CAP / forgeFactor()) - plateSum())) : 0; };
function chanceLabel(ch) {
  const p = ch * 100;
  const r = p < 5 ? ["очень низкий", "#ff3d3d"] : p < 20 ? ["низкий", "#ff8a3c"] : p < 45 ? ["средний", "#ffd23f"] : p < 70 ? ["высокий", "#9be34a"] : ["очень высокий", "#43e07a"];
  return [L(r[0]), r[1]];
}
function makePlate(tier) {
  let p, c = 0;
  for (let i = 0; i < 40; i++) { p = build(tier); c = classify(p); if (c === tier) break; }
  return { id: S.nid++, l1: p.l1, d: p.d, l23: p.l23, reg: p.reg, tier: c, val: TIERS[c].val, got: Date.now() };
}
function genLots() {                                     // цели для улучшения: 11 номеров разной цены
  const lots = [];
  // дорогие цели открываются с уровнем: блатные — с 4-го, легенды — с 10-го (иначе тюнинг сразу даёт легенду);
  // но если в гараже уже есть номер нужной редкости, цель на ступень выше доступна сразу — иначе его некуда улучшать
  const has = t => S.plates.some(p => p.tier >= t);
  [[1, S.lvl >= 4 ? 3 : 5], [2, S.lvl >= 4 ? 3 : 5], [3, S.lvl >= 4 || has(2) ? 3 : 0], [4, S.lvl >= 10 || has(3) ? 2 : 0]].forEach(([tier, n]) => {
    for (let i = 0; i < n; i++) { const p = makePlate(tier); p.val = Math.round(TIERS[tier].val * (0.8 + Math.random() * 0.6)); lots.push({ id: S.nid++, plate: p, val: p.val }); }
  });
  S.forge.lots = lots.sort((a, b) => a.val - b.val); S.forge.lotsAt = Date.now() + 300000;
  if (!curLot()) S.forge.target = null;
}
function gaugeSVG() {
  let ticks = ""; for (let i = 0; i < 72; i++) { const big = i % 6 === 0; ticks += `<line x1="150" y1="${big ? 6 : 9}" x2="150" y2="15" stroke="${big ? "#6b7390" : "#323850"}" stroke-width="${big ? 2 : 1.2}" transform="rotate(${i * 5} 150 150)"/>`; }
  return `<svg viewBox="0 0 300 300"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23f"/><stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ff1f3d"/></linearGradient>
    <radialGradient id="gbg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#171a26"/><stop offset="1" stop-color="#0a0c12"/></radialGradient></defs>
    <circle cx="150" cy="150" r="146" fill="url(#gbg)" stroke="#2a2f44" stroke-width="2"/>${ticks}
    <text x="150" y="34" fill="#7a829c" font-size="11" text-anchor="middle" font-weight="bold">100</text>
    <text x="27" y="154" fill="#7a829c" font-size="11" text-anchor="middle" font-weight="bold">50</text><text x="273" y="154" fill="#7a829c" font-size="11" text-anchor="middle" font-weight="bold">50</text>
    <circle cx="150" cy="150" r="112" fill="none" stroke="#161a26" stroke-width="24"/>
    <circle id="garc" cx="150" cy="150" r="112" fill="none" stroke="url(#gg)" stroke-width="24" stroke-dasharray="0 ${GAUGE_C}" transform="rotate(90 150 150)"/>
    <circle cx="150" cy="150" r="96" fill="#0d0f17" stroke="#222737" stroke-width="2"/>
    <path d="M150 62 L196 112 L150 98 L104 112 Z" fill="#14171f" opacity=".9"/>
    <g id="needle" style="transform-origin:150px 150px;transform:rotate(${needleAng}deg)"><path d="M150 40 L162 70 L150 63 L138 70 Z" fill="#ffd23f" stroke="#7a5200" stroke-width="1"/></g></svg>`;
}
function forgeCardsHTML() {
  const inV = plateSum() + S.forge.coins;
  if (forgeView === "mine") {
    const list = S.plates.filter(p => p.tier <= 3).sort((a, b) => b.val - a.val).slice(0, 60);
    if (!list.length) return `<div class="hint" style="grid-column:1/3">${L("Нет подходящих номеров. Оставляй номера в гараже, чтобы улучшать их здесь.")}</div>`;
    return list.map(p => { const on = S.forge.sel.includes(p.id);
      return `<div class="fcard t${p.tier}b ${on ? "on" : ""}" data-act="forgeToggle" data-id="${p.id}"><div class="fv">${fmt(p.val)} <i>●</i></div>${plateHTML(p, "mini")}<div class="fn">${TIERS[p.tier].name}</div><div class="fchk">✓</div></div>`; }).join("");
  }
  const lock = !S.forge.lots.some(l => l.plate.tier >= 4)   // почему нет легенд — иначе кажется, что улучшать дальше некуда
    ? `<div class="hint" style="grid-column:1/3">${L("🔒 Легенды появятся в целях, когда в гараже будет блатной номер (или с {0} уровня)", 10)}</div>` : "";
  return S.forge.lots.map(l => { const on = S.forge.target === l.id;
    return `<div class="fcard t${l.plate.tier}b ${on ? "on" : ""}" data-act="forgeTarget" data-id="${l.id}"><div class="fv">${fmt(l.val)} <i>●</i></div>${plateHTML(l.plate, "mini")}<div class="fn">${TIERS[l.plate.tier].name}</div><div class="fb" data-lotv="${l.val}">0%</div><div class="fchk">✓</div></div>`; }).join("") + lock;
}
function renderForge() {
  if (forging) return;
  if (!S.drawn) { $("tab-forge").innerHTML = `<h2>${L("🔨 Мастерская тюнинга")}</h2><div class="hint">${L("Купи первый номер — и рискни улучшить его здесь")}</div>`; return; }
  const legendsDue = !S.forge.lots.some(l => l.plate.tier >= 4) && (S.lvl >= 10 || S.plates.some(p => p.tier >= 3));   // появился блатной — легенды в целях сразу, а не через 5 минут
  if (!S.forge.lots.length || Date.now() > S.forge.lotsAt || legendsDue) genLots();
  S.forge.sel = S.forge.sel.filter(id => S.plates.some(p => p.id === id));
  const lot = curLot(), ps = selPlates();
  const inHTML = ps.length ? ps.slice(0, 4).map(p => plateHTML(p, "mini")).join("") + (ps.length > 4 ? `<div class="fmore">${L("+{0} ещё", ps.length - 4)}</div>` : "") : `<div class="fempty">${L("Выбери номера<br>из гаража ⬇")}</div>`;
  const rwHTML = lot ? `<div class="rtier t${lot.plate.tier}">${TIERS[lot.plate.tier].name}</div>${plateHTML(lot.plate, "mid")}<div class="rmult" id="fmult"></div>` : `<div class="fempty">${L("Выбери цель ⬇")}</div><div class="rmult" id="fmult"></div>`;
  $("tab-forge").innerHTML = `
    <div class="ug">
      <div class="ug-row">
        <div class="ug-card"><div class="ug-t">${L("Вход")}</div><div class="ug-body">${inHTML}</div><div class="ug-sum"><b id="fin">0</b> <i>●</i></div></div>
        <div class="ug-card rw ${lot ? "rt" + lot.plate.tier : ""}"><div class="ug-t">${L("Награда")}</div><div class="ug-body">${rwHTML}</div><div class="ug-sum">${lot ? `<b>${fmt(lot.val)}</b> <i>●</i>` : "—"}</div></div>
      </div>
      <div class="gauge" id="gauge">${gaugeSVG()}<div class="ghub"><div class="gnum" id="gnum">0</div><div class="glab" id="glab"></div></div></div>
      <div class="ug-slider"><div class="ug-sl-top"><span>${L("Добавить монет")}</span><b id="fcoinTxt">0</b></div><input type="range" id="fslider" min="0" max="1000" value="0"></div>
      <div class="ug-presets">
        <button data-act="forgeMult" data-m="2">×2</button><button data-act="forgeMult" data-m="4">×4</button><button data-act="forgeMult" data-m="10">×10</button><button data-act="forgeMult" data-m="25">×25</button>
        <button class="pc" data-act="forgePct" data-p="5">5%</button><button class="pc" data-act="forgePct" data-p="25">25%</button><button class="pc" data-act="forgePct" data-p="50">50%</button><button class="pc" data-act="forgePct" data-p="75">75%</button>
      </div>
      <button class="ug-go" id="btnSpin" data-act="forgeSpin"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 13l7-7 7 7M5 19l7-7 7 7" fill="none" stroke="#2a2000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span id="spinTxt">${L("Прокачать")}</span></button>
      ${S.forge.boost || Platform.adsOK ? `<button class="btn alt" data-act="forgeBoost" ${S.forge.boost ? "disabled" : ""} style="font-size:13px;padding:10px">${S.forge.boost ? L("✅ Мастер позван: шанс ×1.25") : L("🎁 Позвать мастера: шанс ×1.25 (📺 реклама)")}</button>` : ""}
      <div class="ug-seg"><button class="${forgeView === "mine" ? "on" : ""}" data-act="forgeView" data-v="mine">${L("🏠 Мои номера")}</button><button class="${forgeView === "targets" ? "on" : ""}" data-act="forgeView" data-v="targets">${L("🎯 Выбери цель")}</button>${forgeView === "targets" ? `<button data-act="forgeLots" style="flex:0 0 46px">🔄</button>` : ""}</div>
      <div class="ug-grid" id="fgrid">${forgeCardsHTML()}</div>
    </div>`;
  forgeCalc();
}
function forgeCalc(fromSlider) {
  const lot = curLot(), ps = plateSum(), max = lot ? forgeMaxCoins() : 0;
  S.forge.coins = clamp(S.forge.coins, 0, max);
  const inV = ps + S.forge.coins, ch = forgeChanceFor(inV, lot), lab = chanceLabel(ch);
  const set = (id, fn) => { const el = $(id); if (el) fn(el); };
  set("gnum", e => { e.textContent = ch > 0 ? (ch * 100).toFixed(2) : "0"; e.style.color = ch > 0 ? lab[1] : "#6b7390"; });
  set("glab", e => { e.textContent = ch > 0 ? lab[0] : lot ? L("добавь номера") : L("выбери цель"); e.style.color = lab[1]; });
  set("garc", e => { e.setAttribute("stroke-dasharray", (ch * GAUGE_C).toFixed(1) + " " + GAUGE_C); e.setAttribute("transform", `rotate(${(90 - ch * 180).toFixed(2)} 150 150)`); });
  set("fin", e => e.textContent = fmt(inV));
  set("fmult", e => e.textContent = lot && inV > 0 ? "×" + (lot.val / inV).toFixed(2) : "");
  set("fcoinTxt", e => e.textContent = fmt(S.forge.coins) + " / " + fmt(max));
  if (!fromSlider) set("fslider", e => { e.disabled = max <= 0; e.value = max > 0 ? Math.round(1000 * Math.sqrt(S.forge.coins / max)) : 0; });
  set("btnSpin", e => {
    const ok = lot && inV > 0 && ch >= FORGE_MIN && !forging;
    e.disabled = !ok; e.classList.toggle("ready", !!ok);
    $("spinTxt").textContent = !lot ? L("Выбери цель") : inV <= 0 ? L("Выбери номера") : ch < FORGE_MIN ? L("Шанс меньше 1%") : L("Прокачать · {0}%", (ch * 100).toFixed(1));
  });
  document.querySelectorAll("[data-lotv]").forEach(b => { const c = forgeChanceFor(inV, { val: +b.dataset.lotv }); b.textContent = c > 0 ? (c * 100).toFixed(c < 0.1 ? 1 : 0) + "%" : "—"; b.style.color = chanceLabel(c)[1]; });
}
document.addEventListener("input", e => {
  if (e.target.id !== "fslider") return;
  const max = forgeMaxCoins(), v = +e.target.value / 1000;
  S.forge.coins = Math.round(max * v * v); forgeCalc(true);
});
function forgeSpin() {
  if (forging) return;
  const lot = curLot(), ps = selPlates(), pSum = plateSum(), inV = pSum + S.forge.coins;
  if (!lot || inV <= 0) return;
  const ch = forgeChanceFor(inV, lot); if (ch < FORGE_MIN) return toast(L("Шанс меньше 1% — добавь номеров или монет"));
  if (S.coins < S.forge.coins) return Snd.err();
  ac(); Mus.start();
  const win = (S.forge.tries === 0 && lot.plate.tier <= 2) || Math.random() < ch;   // первая попытка (обучение) удачная, но только до редкого
  S.coins -= S.forge.coins; S.plates = S.plates.filter(x => !S.forge.sel.includes(x.id)); S.forge.tries++;
  const pend = { v2: true, win, chance: ch, inV, lot: win ? lot : null, refund: win ? 0 : Math.round(pSum * 0.1) };
  if (win) { S.forge.wins++; if (lot.plate.tier === 4) S.forge.legend++; S.forge.lots = S.forge.lots.filter(l => l.id !== lot.id); }
  S.forgePend = pend; S.forge.sel = []; S.forge.coins = 0; S.forge.boost = false; S.forge.target = null; save();   // итог записан заранее
  forging = true;
  document.querySelectorAll("#tab-forge button, #tab-forge input").forEach(b => b.disabled = true);
  // стрелка: дуга шанса центрирована снизу (180°). Угол стрелки — по часовой от верха
  const half = ch * 180, rest = 360 - ch * 360, k = Math.random();
  let a;
  if (win) a = 180 + (Math.random() * 2 - 1) * half * 0.9;
  else if (k < 0.45) a = Math.random() < 0.5 ? 180 + half + rest * (0.015 + 0.05 * Math.random()) : 180 - half - rest * (0.015 + 0.05 * Math.random());   // «почти попал»
  else a = 180 + half + rest * (0.08 + 0.84 * Math.random());
  a = ((a % 360) + 360) % 360;
  const T = 6200, cur = needleAng % 360, target = needleAng + 360 * 6 + (((a - cur) % 360) + 360) % 360;
  const nd = $("needle"); nd.style.transition = `transform ${T}ms cubic-bezier(.08,.7,.06,1)`; nd.style.transform = `rotate(${target}deg)`; needleAng = target;
  $("gauge").classList.add("spinning"); Snd.whoosh();
  const N = 52; for (let i = 1; i <= N; i++) setTimeout(() => { Snd.tick(i); if (i > N - 7) Snd.drum(); }, T * (1 - Math.pow(1 - i / (N + 2), 0.5)));
  setTimeout(() => {
    const g = $("gauge"); g.classList.remove("spinning"); g.classList.add(win ? "gwin" : "glose");
    if (win) { Snd.win(2); fx.burst(innerWidth / 2, g.getBoundingClientRect().top + g.offsetHeight / 2, 40, ["#43e07a", "#ffd23f", "#fff"], { speed: 300 }); }
    else { Snd.err(); vignette("#ff3d3d"); shake($("app")); }
    setTimeout(() => applyForge(false), win ? 1100 : 1000);
  }, T + 150);
}
function applyForge(silent) {
  const pd = S.forgePend; forging = false; if (!pd) return; S.forgePend = null;
  if (pd.win && pd.lot) {
    const p = pd.lot.plate, col = TIERS[p.tier].color; p.got = Date.now();
    markFound(p); lastRevealed = p; keepPlate(p); addXp(XP_TIER[p.tier] * 2);   // в «Выпало» не считаем: достижения за выпадение — только за бланки
    const modal = () => openModal(`<h2 style="color:#43c76b">${L("✅ Прокачка удалась!")}</h2><p style="font-size:13px;color:#8d99b3">${L("Вложено {0} → награда {1} · шанс был {2}%", fmt(pd.inV), fmt(p.val), (pd.chance * 100).toFixed(1))}</p>
      <div style="margin:14px 0">${plateHTML(p, "pop")}</div>
      <button class="btn" data-act="plateInfo" data-id="${p.id}">${L("📖 История номера")}</button><button class="btn alt" data-act="closeModal">${L("Отлично")}</button>`);
    if (!silent && p.tier >= 3) jackpot(p, { then: modal });       // блатной/легенда — полная сцена джекпота
    else {
      if (!silent) { Snd.win(p.tier); vignette(col); fx.confetti(60 + p.tier * 30); shake($("app")); buzz(120); bigText(L("УСПЕХ!"), col); }
      modal();
    }
  } else {
    gain(pd.refund);
    if (!silent) { buzz(200); fx.burst(innerWidth / 2, innerHeight / 2, 40, ["#ff9a3c", "#ff3d71", "#555"], { speed: 260 }); }
    openModal(`<h2 style="color:#ff5e5e">${L("🔥 Не повезло")}</h2><p style="font-size:13px;color:#cfd6e6">${L("Шанс был {0}% — стрелка упала мимо дуги. Вложенное сгорело.", (pd.chance * 100).toFixed(1))}${pd.refund ? "<br>" + L("Мастер вернул {0} за труды.", "<b style=\"color:#ffd23f\">" + fmt(pd.refund) + " 💰</b>") : ""}</p>
      <button class="btn" data-act="closeModal">${L("Ещё раз")}</button>`);
  }
  checkAch(); if (tab === "forge") renderForge(); renderHeader(); save();
}

// ===================== КОЛЛЕКЦИЯ: наборы номеров с вечным бонусом к доходу =====================
// k: ключи из S.found (t: редкость, d: цифры, r: регион, s: серия); b: +% к доходу навсегда; r: разовая награда
const SETS = [
  { id: "start", n: "Первая коллекция",  k: ["t:0", "t:1", "t:2"],          b: 5,  r: 150 },
  { id: "lucky", n: "Счастливые цифры",  k: ["d:777", "d:007", "d:001"],    b: 10, r: 700 },
  { id: "even",  n: "Ровный счёт",       k: ["d:999", "d:888", "d:555"],    b: 10, r: 700 },
  { id: "round", n: "Круглые и дерзкие", k: ["d:100", "d:666"],             b: 8,  r: 500 },
  { id: "msk",   n: "Москва",            k: ["r:77", "r:97", "r:99"],       b: 10, r: 1000 },
  { id: "msk2",  n: "Новая Москва",      k: ["r:177", "r:197", "r:199"],    b: 12, r: 1500 },
  { id: "msk3",  n: "Трёхзначная столица", k: ["r:777", "r:799"],           b: 12, r: 1500 },
  { id: "biz",   n: "Деловые серии",     k: ["s:ООО", "s:МОС", "s:ВОС"],    b: 15, r: 4000 },
  { id: "vip",   n: "VIP-серии",         k: ["s:ААА", "s:ММР"],             b: 15, r: 4000 },
  { id: "top",   n: "Вершина",           k: ["t:3", "t:4", "t:5"],          b: 25, r: 15000 },
  { id: "leg",   n: "Легенды",           k: ["s:АМР", "s:ЕКХ"],             b: 30, r: 40000 }
];
SETS.forEach(s => Lprops(s, "n"));
const setBonus = () => SETS.reduce((a, s) => a + (S.sets[s.id] ? s.b : 0), 0) / 100;
const setsDone = () => SETS.filter(s => S.sets[s.id]).length;
const setHave = s => s.k.filter(k => S.found[k]).length;
function keyLabel(k) {
  const [t, v] = [k.slice(0, 1), k.slice(2)];
  return t === "t" ? TIERS[+v].name : t === "d" ? v : t === "r" ? L("рег. {0}", v) : v;
}
function setProgress(k) {                               // новый элемент коллекции: показываем, сколько осталось до набора
  const s = SETS.find(x => !S.sets[x.id] && x.k.includes(k)); if (!s) return;
  const have = setHave(s);
  if (s.k.length - have === 1) toast(L("📚 Набору «{0}» не хватает одного номера!", s.n));   // о каждом новом номере не сообщаем — только когда набор почти собран
}
function checkSets() {
  for (const s of SETS) {
    if (S.sets[s.id] || setHave(s) < s.k.length) continue;
    S.sets[s.id] = true; gain(s.r);
    enqueueCinema({ color: "#7dff8a", bg: "#0c2a18", icon: "📚", cls: "long", top: L("Набор коллекции собран"), title: s.n.toUpperCase(), value: s.r, valueLabel: L("НАГРАДА"), valueIcon: "💰", sub: L("+{0}% к доходу гаража навсегда", s.b), confetti: 80 });
  }
}
function setsHTML() {
  let h = `<div class="card sets"><h3>${L("📚 Коллекция")} <small>${L("{0}/{1} наборов · +{2}% к доходу", setsDone(), SETS.length, Math.round(setBonus() * 100))}</small></h3>
    <p class="sets-hint">${L("Собери все номера набора — получишь награду и вечный бонус к доходу. Новые номера дают покупки и слияния.")}</p>`;
  SETS.forEach(s => {
    const done = S.sets[s.id];
    h += `<div class="set ${done ? "done" : ""}"><div class="set-h"><b>${s.n}</b><small>${done ? "✅ +" + s.b + "%" : "+" + s.b + "% · " + fmt(s.r) + " 💰"}</small></div>
      <div class="set-k">${s.k.map(k => `<span class="${S.found[k] ? "on" : ""}">${S.found[k] ? keyLabel(k) : "?"}</span>`).join("")}</div></div>`;
  });
  return h + "</div>";
}

// ===================== АЛЬБОМ НОМЕРОВ =====================
// Большая коллекция на все площадки: каждая клетка — номер с нужным регионом, цифрами, буквами или серией.
// За половину страницы — деньги, за всю страницу — номер и вечный бонус к доходу.
const ALL_REG = [...ELITE_REG, ...NORMAL_REG];
const NICE_DIG = [...new Set([...SPECIAL_DIGITS, ..."123456789".split("").map(x => x + x + x), ..."123456789".split("").map(x => x + "00"), "123", "321", "234", "456"])];
const ALBUM = [
  { id: "reg", n: "Регионы России", ico: "🗺", k: ALL_REG.map(r => "r:" + r), b: 10, plate: 3, hint: "Любой номер с этим регионом" },
  { id: "dig", n: "Красивые цифры", ico: "🔢", k: NICE_DIG.map(d => "d:" + d), b: 10, plate: 3, hint: "Номер с такими цифрами" },
  { id: "let", n: "Три одинаковые буквы", ico: "🔤", k: LETTERS.map(x => "l:" + x), b: 5, plate: 3, hint: "Номер вида А…АА" },
  { id: "ser", n: "Блатные серии", ico: "🚘", k: [...BLAT_SER, ...LEGEND_SER].map(s => "s:" + s), b: 15, plate: 4, hint: "Номер этой серии" },
  { id: "gov", n: "АМР 97 — суперлегенды", ico: "💎", k: SUPER_DIGITS.map(d => "g:" + d), b: 50, plate: 5, hint: "Суперлегенда с этими цифрами" }
];
ALBUM.forEach(a => Lprops(a, "n", "hint"));
const ALBUM_TOTAL = ALBUM.reduce((a, pg) => a + pg.k.length, 0);
const albumHave = pg => pg.k.filter(k => S.album.got[k]).length;
const albumCount = () => ALBUM.reduce((a, pg) => a + albumHave(pg), 0);
const albumBonus = () => ALBUM.reduce((a, pg) => a + (S.album.rw[pg.id + "2"] ? pg.b : 0), 0) / 100;
const albumHalfCash = () => Math.max(2000, Math.round(income() * 1800 / 10) * 10);   // ~30 минут дохода
// награды страницы: 1 — половина собрана, 2 — вся
const albumCan = (pg, st) => !S.album.rw[pg.id + st] && albumHave(pg) >= (st === 1 ? Math.ceil(pg.k.length / 2) : pg.k.length);
const albumReady = () => ALBUM.reduce((a, pg) => a + (albumCan(pg, 1) ? 1 : 0) + (albumCan(pg, 2) ? 1 : 0), 0);
function albumKeys(p) {
  const k = ["r:" + p.reg], ser = seriesOf(p);
  if (NICE_DIG.includes(p.d)) k.push("d:" + p.d);
  if (p.l1 === p.l23[0] && p.l1 === p.l23[1]) k.push("l:" + p.l1);
  if (BLAT_SER.includes(ser) || LEGEND_SER.includes(ser)) k.push("s:" + ser);
  if (ser === GOV_SER && p.reg === GOV_REG && SUPER_DIGITS.includes(p.d)) k.push("g:" + p.d);
  return k;
}
function albumLabel(k) {
  const [t, v] = [k[0], k.slice(2)];
  return t === "l" ? v + "…" + v + v : t === "g" ? "А" + v + "МР" : v;
}
function albumAdd(p, silent) {
  const before = albumReady();
  for (const k of albumKeys(p)) {
    const pg = ALBUM.find(x => x.k.includes(k));
    if (!pg || S.album.got[k]) continue;
    S.album.got[k] = 1;
    if (!silent) toast(L("📒 В альбом: {0} ({1}/{2})", (k[0] === "r" ? L("регион") + " " : "") + albumLabel(k), albumHave(pg), pg.k.length));
  }
  if (!silent && albumReady() > before) setTimeout(() => toast(L("📒 Награда в альбоме ждёт — загляни в гараж")), 1200);
}
let albumPage = "reg";
function openAlbum(pgId) {
  if (pgId) albumPage = pgId;
  const pg = ALBUM.find(x => x.id === albumPage) || ALBUM[0], have = albumHave(pg), half = Math.ceil(pg.k.length / 2);
  const cell = k => {
    const on = S.album.got[k], t = k[0], v = k.slice(2);
    const sub = t === "r" ? (REGION_NAME[v] || "") : t === "s" ? L("серия") : t === "g" ? "97 RUS" : "";
    return `<div class="acell ${on ? "on" : ""} t-${t}"><b>${albumLabel(k)}</b>${sub ? `<small>${L(sub)}</small>` : ""}</div>`;
  };
  const rw = (st, need, what) => {
    const got = S.album.rw[pg.id + st], can = albumCan(pg, st);
    return `<div class="qrow"><div><b>${st === 1 ? L("½ страницы") : L("Вся страница")}</b><small>${what}</small></div>
      ${got ? "✅" : `<button class="btn sm ${can ? "green ready" : "alt"}" data-act="albumClaim" data-p="${pg.id}" data-s="${st}" ${can ? "" : "disabled"}>${can ? L("Забрать") : have + "/" + need}</button>`}</div>`;
  };
  openModal(`<h2>${L("📒 Альбом номеров")} <small>${albumCount()}/${ALBUM_TOTAL}</small></h2>
    <div class="atabs">${ALBUM.map(x => { const r = albumCan(x, 1) || albumCan(x, 2);
      return `<button class="btn sm ${x.id === pg.id ? "green" : "alt"} ${r ? "ready" : ""}" data-act="album" data-p="${x.id}">${x.ico} ${albumHave(x)}/${x.k.length}</button>`; }).join("")}</div>
    <h3 style="margin:8px 0 2px">${pg.ico} ${pg.n}</h3><p class="hint" style="margin:0 0 8px">${pg.hint}. ${L("Новые номера дают покупки, слияния и тюнинг.")}</p>
    <div class="bar"><i style="width:${have / pg.k.length * 100}%"></i></div>
    <div class="agrid">${pg.k.map(cell).join("")}</div>
    <div class="card quests">${rw(1, half, L("+{0} 💰", fmt(albumHalfCash())))}${rw(2, pg.k.length, L("{0} в гараж и +{1}% к доходу навсегда", TIERS[pg.plate].name, pg.b))}</div>
    <p class="hint">${L("Бонус альбома сейчас: +{0}% к доходу", Math.round(albumBonus() * 100))}</p>
    <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`);
}
function albumClaim(id, st) {
  const pg = ALBUM.find(x => x.id === id); if (!pg || !albumCan(pg, st)) return;
  S.album.rw[pg.id + st] = 1; Platform.track("album_" + pg.id + st);
  if (st === 1) { const v = albumHalfCash(); gain(v); toast(L("📒 Альбом: +{0} 💰", fmt(v))); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 16); openAlbum(); }
  else {
    closeModal(); const p = makePlate(pg.plate); markFound(p); keepPlate(p); jackpot(p);
    enqueueCinema({ color: "#7dff8a", bg: "#0c2a18", icon: "📒", cls: "long", top: L("Страница альбома собрана"), title: pg.n.toUpperCase(), value: pg.b, valueLabel: L("% К ДОХОДУ НАВСЕГДА"), valueIcon: "📈", sub: L("+{0}% к доходу гаража навсегда", pg.b), confetti: 100 });
  }
  save(); renderHeader(); if (tab === "garage") renderGarage();
}
// старые сейвы: заполнить альбом тем, что уже есть в гараже и в коллекции
function albumBackfill() {
  for (const p of S.plates) albumAdd(p, true);
  for (const k of Object.keys(S.found)) if (/^[sdr]:/.test(k) && ALBUM.some(pg => pg.k.includes(k))) S.album.got[k] = 1;
}

// ===================== ПОМОЩНИК И «ИЩУ НОМЕР» =====================
// Помощник (апгрейд «🤖 Помощник») сам покупает бланки. Настройки: какой бланк, что сразу продавать, автослияние до нужной
// редкости, запас денег, который он не тратит. «Ищу номер» — список желаемого (регион, цифры, серия, три буквы): такой номер
// при любой покупке (своей или помощника), слиянии и подарке сразу запирается 🔒 — его не продаст и не сольёт никто.
const plateStr = p => p.l1 + p.d + p.l23 + " " + p.reg;
const WISH_KINDS = [["reg", "Регион", "77"], ["dig", "Цифры", "777"], ["ser", "Серия — 3 буквы", "АМР"], ["let", "Три одинаковые буквы", "А"]];
const wishLabel = w => w.k === "reg" ? L("регион {0}", w.v) + (REGION_NAME[w.v] ? " · " + L(REGION_NAME[w.v]) : "") : w.k === "dig" ? L("цифры {0}", w.v) : w.k === "ser" ? L("серия {0}", w.v) : L("буквы {0}", w.v + "…" + w.v + w.v);
const wishMatch = (w, p) => w.k === "reg" ? p.reg === w.v : w.k === "dig" ? p.d === w.v : w.k === "ser" ? seriesOf(p) === w.v : p.l1 === w.v && p.l23 === w.v + w.v;
function wishCheck(p) {
  if (!S.bot.wish.length || p.wc) return;
  const w = S.bot.wish.find(x => wishMatch(x, p)); if (!w) return;
  p.wc = 1; p.lock = true; p.wish = 1; w.got = (w.got || 0) + 1; S.bot.found++;
  setTimeout(() => { toast(L("🎯 Выбит номер из «Ищу»: {0} — он под замком 🔒", plateStr(p))); vignette("#43c76b"); fx.confetti(60); }, 400);
  Platform.track("wish_found");
  if (w.once) S.bot.wish = S.bot.wish.filter(x => x !== w);
}
const botEvery = () => 25 / (1 + 0.5 * up("bot"));
const botPack = () => PACKS[S.bot.pack] && S.lvl >= PACKS[S.bot.pack].lvl ? S.bot.pack : "basic";
function botLog(p, a) { S.bot.log.unshift({ p: [p.l1 + p.d + p.l23, p.reg, p.tier], a }); S.bot.log = S.bot.log.slice(0, 12); }
function botBuy() {
  const pk = botPack(), c = packPrice(pk);
  if (S.coins - c < Math.max(c * 2, S.bot.reserve)) return;                 // запас денег не трогает
  S.coins -= c; S.bought++; S.bot.n++;
  const r = drawPlate(pk); markFound(r); S.tc[r.tier]++; addXp(PACKS[pk].xp);
  const sellT = S.bot.sell === -2 ? S.set.auto : S.bot.sell;
  if (r.tier <= sellT && !isLocked(r)) { gain(sellVal(r)); S.sold++; botLog(r, "sold"); }
  else {
    keepPlate(r); botLog(r, r.wish ? "wish" : "kept");
    if (r.tier >= 1 && !r.wish) toast(L("🤖 Помощник купил: {0} ({1})", plateStr(r), TIERS[r.tier].name));
  }
  let merged = 0;                                                            // автослияние — только незапертых и не выше выбранной редкости
  if (S.bot.merge >= 1) for (let i = 0; i < 8; i++) { const t = mergeTiers().find(x => x + 1 <= S.bot.merge); if (t == null) break; botLog(mergeTake(t).r, "merge"); merged++; }
  if (merged) toast(L("🤖 Помощник сделал слияний: {0}", merged));
  updatePity(); renderPacks();
}
function openBot(sec) {
  const b = S.bot, lv = up("bot");
  const opt = (k, list) => `<select data-bot="${k}">${list.map(([v, n]) => `<option value="${v}" ${b[k] === v ? "selected" : ""}>${L(n)}</option>`).join("")}</select>`;
  const packs = Object.keys(PACKS).map(k => { const P = PACKS[k], ok = S.lvl >= P.lvl;
    return `<button class="btn sm ${botPack() === k ? "green" : "alt"}" data-act="botSet" data-k="pack" data-v="${k}" ${ok ? "" : "disabled"}>${P.icon} ${P.name.split(/[ -]/)[0]}<small>${ok ? fmt(packPrice(k)) + " 💰" : L("🔒 ур. {0}", P.lvl)}</small></button>`; }).join("");
  const ico = { sold: "💰", kept: "🏠", wish: "🎯", merge: "⚡" };
  openModal(`<h2>${L("🤖 Помощник")}</h2>
    ${lv ? `<div class="card botcard"><div class="setrow"><span><b>${b.on ? L("Работает") : L("Выключен")}</b><small>${L("Ур. {0} · покупает раз в {1} с · куплено {2}", lv, botEvery().toFixed(1), b.n)}</small></span><button class="tog ${b.on ? "on" : ""}" data-act="botSet" data-k="on"></button></div></div>
    <h3>${L("Какой бланк покупать")}</h3><div class="botpacks">${packs}</div>
    <h3>${L("Что сразу продавать")}</h3>${opt("sell", [[-2, "Как «Авто-продажа» в настройках"], [-1, "Ничего — всё в гараж"], [0, "Обычные"], [1, "Обычные и красивые"], [2, "Всё до редких включительно"]])}
    <h3>${L("Автослияние")}</h3>${opt("merge", [[-1, "Выключено — сливаю сам"], [1, "До красивых"], [2, "До редких"], [3, "До блатных"], [4, "До легенд"], [5, "До суперлегенд"]])}
    <h3>${L("Не тратить ниже")}</h3>${opt("reserve", [[0, "Тратить всё"], [1e4, "10 тыс"], [1e5, "100 тыс"], [1e6, "1 млн"], [1e7, "10 млн"], [1e8, "100 млн"], [1e9, "1 млрд"]])}
    <p class="hint">${L("Номера под замком 🔒 помощник не продаёт и не сливает.")}</p>`
    : `<div class="card"><p>${L("Помощника ещё нет — его можно купить во вкладке «⚙ Улучшения» → «🤖 Помощник». Он сам покупает бланки, продаёт ненужное и сливает номера.")}</p><p class="hint">${L("«Ищу номер» работает уже сейчас — и для твоих покупок.")}</p></div>`}
    <h3 id="wishSec">${L("🎯 Ищу номер")} <small>${L("найдено: {0}", b.found)}</small></h3>
    <p class="hint" style="margin-top:0">${L("Номер из списка сразу ставится под замок 🔒 — его не продаст ни помощник, ни авто-продажа, и он не сольётся.")}</p>
    ${b.wish.length ? `<div class="card toplist">${b.wish.map((w, i) => `<div class="toprow"><span>🎯</span><b>${escapeHTML(wishLabel(w))}<small>${w.once ? " · " + L("один раз") : ""}${w.got ? " · " + L("выбито: {0}", w.got) : ""}</small></b><button class="btn sm alt" data-act="wishDel" data-i="${i}">✖</button></div>`).join("")}</div>` : ""}
    <div class="wishadd"><select id="wK">${WISH_KINDS.map(([k, n]) => `<option value="${k}">${L(n)}</option>`).join("")}</select><input id="wV" maxlength="3" placeholder="${L("например 77, 777, АМР")}"><button class="btn sm green" data-act="wishAdd">➕</button></div>
    <label class="chk wishonce"><input type="checkbox" id="wOnce" checked> ${L("убрать из списка, когда выбьется")}</label>
    ${lv && b.log.length ? `<h3>${L("Последние покупки помощника")}</h3><div class="botlog">${b.log.map(x => `<div><i>${ico[x.a] || ""}</i>${plateHTML(snapPlate(x.p), "mini")}</div>`).join("")}</div><p class="hint">${L("💰 продал · 🏠 в гараж · 🎯 нашёл из списка · ⚡ слил")}</p>` : ""}
    <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`);
  document.querySelectorAll("#mbox [data-bot]").forEach(s => s.onchange = () => { S.bot[s.dataset.bot] = +s.value; save(); toast(L("🤖 Сохранено")); });
  if (sec === "wish") setTimeout(() => { const e = $("wishSec"); if (e) e.scrollIntoView({ block: "start" }); }, 30);
}
function wishAdd() {
  const k = ($("wK") || {}).value; let v = ((($("wV") || {}).value) || "").trim().toUpperCase().replace(/\s/g, "").replace(/[ABEKMHOPCTYX]/g, c => LAT2CYR[c]);
  if (k === "reg") { if (!ALL_REG.includes(v)) return toast(L("Такого региона в игре нет. Есть: {0}", ALL_REG.join(", "))); }
  else if (k === "dig") { if (!/^\d{3}$/.test(v)) return toast(L("Цифры — ровно три, например 777")); }
  else if (k === "ser") { if (!/^[АВЕКМНОРСТУХ]{3}$/.test(v)) return toast(L("Серия — три буквы из: {0}", LETTERS.join(" "))); }
  else { v = v.slice(0, 1); if (!LETTERS.includes(v)) return toast(L("Буква — одна из: {0}", LETTERS.join(" "))); }
  if (S.bot.wish.some(w => w.k === k && w.v === v)) return toast(L("Уже в списке"));
  if (S.bot.wish.length >= 10) return toast(L("Не больше 10 номеров в списке"));
  const w = { k, v, once: !!($("wOnce") || {}).checked, got: 0 };
  const have = S.plates.filter(p => wishMatch(w, p));
  have.forEach(p => { p.lock = true; p.wish = 1; });
  if (have.length && w.once) toast(L("Такой уже есть в гараже ({0} шт.) — поставил замок 🔒", have.length));
  else { S.bot.wish.push(w); toast(have.length ? L("🎯 Добавлено. В гараже уже есть {0} шт. — они под замком 🔒", have.length) : L("🎯 Добавлено — ищем!")); }
  Platform.track("wish_add_" + k); save(); openBot("wish");
}

// ===================== СЮЖЕТ: персонажи, диалоги, обучение, главы =====================
// Все персонажи вымышленные. Реплики — массивы [кто, текст]; текст переводится при показе.
const upSum = () => UPS.reduce((a, u) => a + up(u.id), 0);
const garageVal = () => S.plates.reduce((a, p) => a + p.val, 0);
const hasBlat = () => S.tc[3] + S.tc[4] + S.tc[5] >= 1 || S.mergeBest >= 3;
const hasLegend = () => S.tc[4] + S.tc[5] >= 1 || S.mergeBest >= 4;
const CHARS = {
  valera: { n: "Дядя Валера",      i: "👴", c: "#ffd23f" },
  artur:  { n: "Артур «Номерной»", i: "😎", c: "#ff3d71" },
  tamara: { n: "Тамара",           i: "👩‍🦰", c: "#4fc3f7" },
  gosha:  { n: "Гоша-блогер",      i: "🤳", c: "#b388ff" },
  sanych: { n: "Сан Саныч",        i: "🧔", c: "#7dff8a" },
  liza:   { n: "Лиза",             i: "👩‍💼", c: "#ff9a3c" }
};
Object.values(CHARS).forEach(c => Lprops(c, "n"));
const CLIENT_LINE = { tamara: "Чтобы как у людей!", gosha: "Для ролика, бро!", sanych: "На дачу ездить солидно", liza: "Клиенту в подарок" };
const DUEL = 25000;                                     // стоимость гаража Артура в главе «Дуэль»
// задание: c — условие, либо v/n — счётчик с прогресс-баром
const STORY = [
  { t: "Гараж на окраине", r: 300,
    intro: [],
    tasks: [{ t: "Пройди обучение у дяди Валеры", c: () => S.tut < 0 }],
    outro: [["valera", "Ну всё, гараж твой. Держи на развитие — и не подведи старика!"]] },
  { t: "Первые клиенты", r: 600,
    intro: [["tamara", "Здравствуйте! Мне сказали, тут номера продают… Нужен красивый, чтобы как у людей!"],
            ["valera", "Видал? Клиенты пошли. Заказы теперь во вкладке «Заказы» — платят больше, чем скупщики."]],
    tasks: [{ t: "Выполни 2 заказа", v: () => S.ordersDone, n: 2 }, { t: "Сделай 3 слияния", v: () => S.merges, n: 3 }],
    outro: [["tamara", "Ой, какая красота! Всем подругам расскажу!"], ["valera", "Сарафанное радио — лучшая реклама. Молодец!"]] },
  { t: "Соперник", r: 1500, title: "Коллекционер",
    intro: [["artur", "Это что, гараж? Я думал, сарай. И номера у тебя — как у курьера."],
            ["valera", "Не слушай его, это Артур «Номерной», главный коллекционер района. Собери пару наборов и добудь блатной — пусть знает."]],
    tasks: [{ t: "Собери 2 набора коллекции", v: setsDone, n: 2 }, { t: "Выбей или слей блатной номер", c: hasBlat }],
    outro: [["artur", "Ладно, признаю: для новичка неплохо. Но до меня тебе далеко."]] },
  { t: "Большая ставка", r: 3000, title: "Рисковый",
    intro: [["artur", "Настоящие коллекционеры номера не копят — тюнингуют. Слабо рискнуть по-крупному?"],
            ["valera", "Возьми его на слабо. Только с головой: ставь то, что не жалко."]],
    tasks: [{ t: "Удачные улучшения в «Тюнинге»", v: () => S.forge.wins, n: 3 }, { t: "Купи улучшения", v: upSum, n: 5 }],
    outro: [["artur", "…Хм, рука у тебя лёгкая. Но это ещё ничего не значит."]] },
  { t: "Дуэль", r: 6000, title: "Гроза Артура",
    intro: [["artur", "Давай по-честному: чей гараж дороже — тот и король района. Мой стоит 25 000."],
            ["valera", "Номера в гараже считаются по стоимости. Сливай, тюнингуй — и обгони его!"]],
    tasks: [{ t: "Гараж дороже, чем у Артура", v: garageVal, n: DUEL }, { t: "Достигни 8 уровня", v: () => S.lvl, n: 8 }],
    outro: [["artur", "Не может быть… Ладно. Район твой. Но в Москве тебя съедят."], ["valera", "Слышал? Москва зовёт. Готовься к переезду."]] },
  { t: "Переезд в Москву", r: 10000, title: "Столичный",
    intro: [["valera", "В Москве номера дороже, а связи важнее денег. Переедешь — начнёшь с нуля, но со связями ⭐."],
            ["valera", "Переезд — во вкладке «Ещё», с 10 уровня. А гараж я за тобой придержу."]],
    tasks: [{ t: "Достигни 10 уровня", v: () => S.lvl, n: 10 }, { t: "Переезжай в Москву (престиж)", c: () => S.prest >= 1 }],
    outro: [["valera", "Ну как столица? Говорят, там уже про тебя спрашивают."], ["artur", "Ты и тут? Ну, посмотрим, кто кого."]] },
  { t: "Охота за АМР", r: 50000, title: "Король номеров",
    intro: [["gosha", "Бро, ходит слух: где-то есть «АМР» 97-го с красивыми цифрами. Найдёшь — сниму про тебя ролик!"],
            ["artur", "Я ищу его пять лет. Удачи, новичок."]],
    tasks: [{ t: "Выбей или слей легенду", c: hasLegend }, { t: "Собери наборы коллекции", v: setsDone, n: 8 }, { t: "Добудь суперлегенду", c: () => S.tc[5] >= 1 || S.mergeBest >= 5 }],
    outro: [["gosha", "Миллион просмотров за ночь! Ты теперь легенда, бро!"], ["artur", "…Снимаю шляпу. Король номеров — ты."], ["valera", "Я всегда знал. Горжусь, племяш!"]] }
];
const taskDone = t => t.c ? !!t.c() : t.v() >= t.n;
function renderGoal() {                                 // блок над бланками: текущая глава и её задания
  const el = $("goal"), C = STORY[S.story.ch]; let h;
  if (!C) h = `<span>👑</span><div class="gbody"><b>${L("История пройдена!")}</b><br><small>${L("Ты — король номеров. Охоться за суперлегендами и собирай коллекцию дальше.")}</small></div>`;
  else h = `<span>📖</span><div class="gbody"><small class="gch">${L("Глава {0} · {1}", S.story.ch + 1, L(C.t))}</small>` +
    C.tasks.map(t => { const d = taskDone(t), v = t.v ? Math.min(t.v(), t.n) : 0;
      return `<div class="gt ${d ? "ok" : ""}">${d ? "✅" : "▫️"} ${L(t.t)}${t.v && !d ? ` <small>(${fmt(v)}/${fmt(t.n)})</small>` : ""}</div>` +
        (t.v && !d ? `<div class="gbar"><i style="width:${v / t.n * 100}%"></i></div>` : ""); }).join("") +
    `<small>${L("Награда:")} ${fmt(C.r)} 💰${C.title ? " · " + L("титул «{0}»", L(C.title)) : ""}</small></div>`;
  el.style.display = "flex"; el.dataset.act = "storyReplay";
  if (el._h !== h) { el._h = h; el.innerHTML = h; }
}
function checkStory() {                                 // вступление главы → задания → финал с наградой
  const C = STORY[S.story.ch]; if (!C) return;
  if (!S.story.intro) { S.story.intro = true; save(); renderGoal(); if (C.intro.length) say(C.intro); return; }
  if (!C.tasks.every(taskDone)) return;
  const n = S.story.ch + 1;
  S.story.ch++; S.story.intro = false; gain(C.r); if (C.title) S.title = C.title;   // награда записана сразу, сцены — следом
  Platform.track("chapter_" + S.story.ch);
  save(); renderGoal(); renderHeader(); syncNav();
  say(C.outro, () => enqueueCinema({ color: "#ffd23f", bg: "#2a2005", icon: "📖", cls: "long", top: L("Глава {0} пройдена", n), title: L(C.t).toUpperCase(),
    value: C.r, valueLabel: L("НАГРАДА"), valueIcon: "💰", sub: C.title ? L("Новый титул: «{0}»", L(C.title)) : "", confetti: 90 }));
}
function sayOnce(id, lines) { if (S.story.ev[id]) return; S.story.ev[id] = 1; say(lines); }
function storyEvents() {                                // короткие реплики на яркие моменты
  if (S.tut >= 0) return;
  if (hasBlat()) sayOnce("blat", [["valera", "Вот это да, блатной! Я такой первый раз увидел через год таксования."]]);
  if (hasLegend()) sayOnce("leg", [["valera", "Племяш… это легенда. Я такую видел один раз в жизни — и то издалека."], ["artur", "Откуда?! Ладно, не задавайся."]]);
  if (S.forge.tries > S.forge.wins) sayOnce("ffail", [["valera", "Мастер дал — мастер взял. Не вешай нос, в следующий раз повезёт."]]);
  if (S.ordersDone >= 5) sayOnce("ord5", [["gosha", "Бро, я про твой гараж пост запилил. Жди клиентов!"]]);
  if (S.plates.length >= slots()) sayOnce("full", [["valera", "Гараж забит! Сливай одинаковые номера или купи места в «Апгрейдах»."]]);
}

// ---------- окно реплик ----------
const Talk = { q: [], cur: null, i: 0, typeT: null, full: "" };
const TK = { el: $("talk") }; ["dim", "hole", "finger", "box", "ava", "name", "text", "next", "skip"].forEach(k => TK[k] = TK.el.querySelector(".tk-" + k));
function say(lines, then) { Talk.q.push({ lines: lines.slice(), then }); }
const talkBusy = () => rolling || forging || miniRun || jpState || cinemaQueue.length || !$("modal").classList.contains("hidden") || !$("menu").classList.contains("hidden");
function tkSet(who, text) {
  const c = CHARS[who]; TK.box.style.setProperty("--cc", c.c); TK.ava.textContent = c.i; TK.name.textContent = c.n;
  clearInterval(Talk.typeT); Talk.full = text; let i = 0; TK.text.textContent = "";
  Talk.typeT = setInterval(() => { i += 2; TK.text.textContent = text.slice(0, i); if (i % 8 === 0) Snd.tick(i); if (i >= text.length) { clearInterval(Talk.typeT); Talk.typeT = null; } }, 22);
}
function tkFinish() { if (!Talk.typeT) return false; clearInterval(Talk.typeT); Talk.typeT = null; TK.text.textContent = Talk.full; return true; }
function dlgLine() { const [who, text] = Talk.cur.lines[Talk.i]; tkSet(who, L(text)); }
function dlgNext() {
  if (tkFinish()) return;
  if (++Talk.i < Talk.cur.lines.length) return dlgLine();
  const then = Talk.cur.then; Talk.cur = null; TK.el.classList.add("hidden"); if (then) then();
}
function dlgStart(item) {
  Talk.cur = item; Talk.i = 0; Tut.block = false; Tut.txt = "";
  TK.el.className = "dlg"; TK.box.className = "tk-box bottom"; TK.next.style.display = ""; TK.skip.style.display = "none";
  TK.hole.style.display = TK.finger.style.display = "none";   // подсветка от обучения в диалоге не нужна
  dlgLine();
}

// ---------- обучение: дядя Валера подсвечивает нужную кнопку ----------
// el — что подсветить (строка или функция), done — когда шаг пройден, next — шаг с кнопкой «Дальше», free — не блокировать другие нажатия
const forgeEl = () => !S.forge.sel.length ? (forgeView === "mine" ? "#fgrid .fcard" : '[data-act="forgeView"][data-v="mine"]')
  : !S.forge.target ? (forgeView === "targets" ? "#fgrid .fcard" : '[data-act="forgeView"][data-v="targets"]') : "#btnSpin";
const TUT = [
  { say: "Здорово, племяш! Я — дядя Валера. Отдаю тебе свой старый гараж: будешь собирать красивые номера. Я подскажу, что к чему.", next: true },
  { say: "Вот бланк номера. Жми — посмотрим, что выпадет!", el: '[data-act="buy"][data-pack="basic"]', done: () => S.drawn >= 1 },
  { say: "Есть! Ставь его в гараж — номера в гараже приносят деньги каждую секунду.", el: '[data-act="keepPending"]', done: () => S.plates.length >= 1 && !pending },
  { say: () => L("Обычные номера — тоже не мусор. Купи ещё бланков, пока не наберётся три одинаковых ({0}/3).", Math.min(tierCount(0), 3)), el: '[data-act="buy"][data-pack="basic"]', done: () => !!document.querySelector(".mergebtn") },
  { say: "А теперь фокус: три одинаковых номера сливаем в один получше. Жми!", el: ".mergebtn", done: () => S.merges >= 1 },
  { say: "Загляни в гараж — там твоя коллекция.", el: 'nav button[data-tab="garage"]', done: () => tab === "garage" },
  { say: "Собираешь наборы — получаешь награду и вечный бонус к доходу. Первый набор ты уже собрал!", el: "#tab-garage .sets .set", next: true, free: true },
  { say: "Хочешь рискнуть? В «Тюнинге» номер можно поднять подороже… или потерять.", el: 'nav button[data-tab="forge"]', done: () => tab === "forge" },
  { say: () => !S.forge.sel.length ? L(forgeView === "mine" ? "Отметь номер, который поставишь на кон." : "Открой «Мои номера» и отметь, что ставишь.")
      : !S.forge.target ? L(forgeView === "targets" ? "Выбери, во что превратить. Чем дешевле цель — тем выше шанс." : "Теперь открой «Выбери цель».")
      : L("Жми «Прокачать»! Первый раз мастер точно не подведёт."), el: forgeEl, free: true, done: () => S.forge.tries >= 1 },
  { say: "Видал, как стрелка крутится? Но в другой раз может и не повезти. Возвращайся к бланкам.", el: 'nav button[data-tab="buy"]', done: () => tab === "buy" },
  { say: "Кончатся деньги — таксуй, как я в молодости. Тапни пару раз!", el: "#btnTaxi", done: () => S.taxis >= Tut.base + 3 },
  { say: "Всё, дальше сам. Над бланками будут задания — по ним и иди. Удачи, племяш!", next: true }
];
TUT.forEach(s => typeof s.say === "string" && Lprops(s, "say"));
const Tut = { block: false, target: null, txt: "", base: 0, scrolled: -1 };
const shown = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
function tutHide() { TK.el.classList.add("hidden"); Tut.block = false; Tut.target = null; }
function tutGo(n) { S.tut = n; Tut.base = S.taxis; Tut.txt = ""; if (n >= TUT.length) S.tut = -1;
  if (S.tut === -1) Platform.track(n === -1 ? "tut_skip" : "tut_done"); else if (n > 0) Platform.track("tut_" + n); save(); tutHide(); renderGoal(); renderSubs(); }
function tutTick() {
  const st = TUT[S.tut]; if (!st) return tutGo(-1);
  if (st.done && st.done()) return tutGo(S.tut + 1);
  const sel = typeof st.el === "function" ? st.el() : st.el;
  const tg = sel ? [...document.querySelectorAll(sel)].find(shown) : null;
  if (sel && !tg) { tutHide(); return; }                // нужная кнопка ещё не на экране — ждём
  if (tg && Tut.scrolled !== S.tut) { Tut.scrolled = S.tut; tg.scrollIntoView({ block: "center", behavior: "smooth" }); }
  TK.el.className = tg ? "" : "dlg"; Tut.target = tg; Tut.block = !st.free;
  TK.next.style.display = st.next ? "" : "none"; TK.skip.style.display = "";
  const txt = typeof st.say === "function" ? st.say() : st.say;
  if (txt !== Tut.txt) { Tut.txt = txt; tkSet("valera", txt); }
  if (!tg) { TK.hole.style.display = TK.finger.style.display = "none"; TK.box.className = "tk-box bottom"; return; }
  const r = tg.getBoundingClientRect(), pad = 6, low = r.top + r.height / 2 > innerHeight * 0.55;
  Object.assign(TK.hole.style, { display: "block", left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
  TK.hole.classList.toggle("dim", !st.free);
  TK.box.className = "tk-box " + (low ? "top" : "bottom");
  TK.finger.style.display = "block"; TK.finger.textContent = low ? "👇" : "👆"; TK.finger.classList.toggle("up", !low);
  TK.finger.style.left = r.left + r.width / 2 - 18 + "px"; TK.finger.style.top = (low ? r.top - 46 : r.bottom + 4) + "px";
}
TK.el.addEventListener("click", e => {
  if (Talk.cur) return dlgNext();
  if (e.target.closest(".tk-skip")) { tutGo(-1); toast(L("Обучение пропущено")); return; }
  const st = TUT[S.tut]; if (st && st.next && !tkFinish()) tutGo(S.tut + 1);
});
document.addEventListener("click", e => {               // во время подсказки нажимается только подсвеченная кнопка
  if (!Tut.block || TK.el.classList.contains("hidden") || e.target.closest("#talk")) return;
  if (Tut.target && Tut.target.contains(e.target)) return;
  e.stopPropagation(); e.preventDefault();
}, true);
setInterval(() => {
  if (Talk.cur) return;
  if (talkBusy()) { if (!TK.el.classList.contains("hidden")) tutHide(); return; }
  if (Talk.q.length) return dlgStart(Talk.q.shift());
  if (S.tut >= 0) return tutTick();
  checkStory();
}, 200);

// ===================== ИСТОРИЯ НОМЕРА =====================
// Все истории вымышленные: любые совпадения с реальными людьми и организациями случайны.
const REGION_NAME = {
  "77": "Москва", "97": "Москва", "99": "Москва", "177": "Москва", "197": "Москва", "199": "Москва", "777": "Москва", "799": "Москва",
  "02": "Башкортостан", "102": "Башкортостан", "16": "Татарстан", "116": "Татарстан", "50": "Московская область", "90": "Московская область",
  "750": "Московская область", "52": "Нижегородская область", "63": "Самарская область", "163": "Самарская область", "66": "Свердловская область",
  "196": "Свердловская область", "74": "Челябинская область", "174": "Челябинская область", "78": "Санкт-Петербург", "178": "Санкт-Петербург",
  "86": "Ханты-Мансийский округ", "123": "Краснодарский край", "93": "Краснодарский край", "161": "Ростовская область", "95": "Чечня",
  "54": "Новосибирская область", "24": "Красноярский край"
};
const REGION_FACT = {
  "Москва": "Столичный регион: в пробках здесь номер видят чаще, чем где-либо.", "Санкт-Петербург": "Номер видел столько разводных мостов, что мог бы вести экскурсии.",
  "Татарстан": "Здесь любят хорошие машины и красивые номера — в регионе целая культура «номерного» тюнинга.", "Краснодарский край": "Номер много раз ездил к морю и знает все курортные пробки.",
  "Свердловская область": "Номер зимовал на Урале и не боится никаких морозов.", "Новосибирская область": "Для этого номера −35 — это «лёгкая прохлада».",
  "Московская область": "Номер знает все дачные дороги и каждую яму на трассе.", "Башкортостан": "Номер пробовал настоящий башкирский мёд — и теперь гордится этим.",
  "Челябинская область": "Номер вырос рядом с заводами и любит всё железное.", "Самарская область": "Номер ездил вдоль Волги и обожает закаты.",
  "Ростовская область": "Номер знает вкус настоящего донского арбуза.", "Нижегородская область": "Номер помнит, как выглядит Волга с высокого берега.",
  "Красноярский край": "Номер пережил зиму, от которой замёрзли бы даже пингвины.", "Ханты-Мансийский округ": "Номер возил вахтовиков и знает цену тёплой печке.", "Чечня": "Номер видел горные серпантины и не боится крутых поворотов."
};
const SERIES_STORY = {
  "АМР": ["Среди автолюбителей — номер-легенда: говорят, его узнают с первого взгляда.", "Про серию «АМР» в интернете больше мифов, чем фактов — в этом её шарм.", "Коллекционеры готовы часами спорить, кто и когда ездил с такими номерами.", "Считается самой «громкой» серией в игре: другие водители на дороге невольно уступают."],
  "ЕКХ": ["Три буквы, о которых ходит больше всего слухов на автофорумах.", "Серия стала нарицательной: «как с ЕКХ» говорят про машину, которой все уступают.", "Старые номера этой серии считаются раритетом, их показывают на выставках.", "Владельцы шутят, что у них не номер, а пропуск в любую пробку."],
  "ООО": ["Тройная «О» — любимая серия солидных деловых людей.", "Среди водителей ходит шутка: «ООО» — «Обгоняю Охотно Окружающих».", "Такие номера любят ставить на чёрные седаны с тонировкой.", "В коллекционных кругах «ООО» ценят за красоту: три круглые буквы смотрятся как бусы."],
  "МОС": ["Серия «МОС» — «столичная» по звучанию: в ней слышится название города.", "Машины с ней часто можно увидеть в центре города у больших кабинетов.", "Коллекционеры любят, что слово читается целиком: М-О-С.", "Владельцы шутят, что у них номер «московского разлива»."],
  "ВОС": ["«ВОС» — серия с характером: коротко, звучно и запоминается.", "Говорят, такой номер выбирают те, кто любит спокойную и уверенную езду.", "В автомобильных клубах серию «ВОС» уважают за редкость.", "Некоторые читают «ВОС» как «Вот Он Сам»."],
  "ААА": ["Три первые буквы алфавита — как «пятёрка с плюсом» для номера.", "«ААА» — VIP-серия: такие номера мгновенно привлекают внимание.", "Есть байка, что номер «ААА» никогда не стоит в очереди.", "Коллекционеры называют «ААА» тройной «пятёркой» среди номеров."],
  "ММР": ["«ММР» — загадочная серия «больших людей»: точно никто ничего не знает.", "На автофорумах споры об этой серии идут годами и никогда не заканчиваются.", "Читают как «Мур-мур»: владелец-кошатник уверен, что это знак судьбы.", "Номер из тех, что запоминают, даже если видели секунду."]
};
const DIGIT_STORY = {
  "777": ["«Три топора» — цифры удачи; такой номер стоит дороже обычного.", "Владельцы «777» уверяют, что светофор для них всегда зелёный."],
  "007": ["Номер агента: «лицензия на обгон».", "Владелец «007» обязательно говорит: «Меня зовут… Номер»."],
  "001": ["Первый номер в серии — мечта коллекционеров.", "Из-за «001» владелец чувствует себя капитаном всей улицы."],
  "999": ["Три девятки — максимум по цифрам, выше уже не бывает.", "Девятки — любимые цифры тех, кто не признаёт полумер."],
  "888": ["Восьмёрки — любимое число многих бизнесменов: они символизируют достаток.", "С такими цифрами парковщики здороваются первыми."],
  "555": ["Три пятёрки: идеальная оценка в дневнике автолюбителя.", "Номер «555» хорошо ложится в память и в рекламу."],
  "666": ["Число зверя — берут те, кто не боится суеверий.", "Владелец «666» говорит, что никто не подрезает — боятся."],
  "100": ["Круглая сотня — запоминается с первого раза.", "«100» — как отличная оценка в школьном аттестате."]
};
const NICK = [
  ["«Тихий работяга»", "«Серая мышка»", "«Дачный рассвет»", "«Колёсный трудяга»", "«Дорожный скромник»", "«Старожил»"],
  ["«Зеркальце»", "«Ровный»", "«Счастливая тройка»", "«Красавчик»", "«Симметричный»", "«Номер-открытка»"],
  ["«Золотая рыбка»", "«Фиолетовый гость»", "«Редкая птица»", "«Находка года»", "«Тот самый»", "«Вот это повезло»"],
  ["«Главный по трассе»", "«Тяжёлая артиллерия»", "«Дорогой гость»", "«Громкое имя»", "«Мэтр»", "«Красная дорожка»"],
  ["«Легенда»", "«Король дороги»", "«Тот, кому уступают»", "«Номер из учебника»", "«Живой миф»", "«Император трассы»"],
  ["«Госномер»", "«Спецсерия»", "«Первое лицо трассы»", "«Номер вне очереди»"]
];
const OWNERS = [
  ["водитель маршрутки", "студент-заочник", "пенсионер-дачник", "курьер", "дядя Ашот-таксист", "продавец шаурмы", "школьный учитель физкультуры", "наладчик станков"],
  ["автолюбитель-коллекционер", "владелец автомойки", "блогер про тачки", "фермер из пригорода", "молодой предприниматель", "дизайнер интерьеров", "тренер по рыбалке", "хозяин пекарни"],
  ["бизнесмен средней руки", "директор рынка", "известный тренер", "владелец сети шиномонтажей", "хозяин ресторана грузинской кухни", "руководитель строительной фирмы", "ювелир с Арбата", "продюсер местных звёзд"],
  ["директор крупного холдинга", "владелец сети заправок", "«друг одного очень занятого человека»", "основатель логистической империи", "хозяин горнолыжного курорта", "дама из высшего общества", "коллекционер с тремя гаражами"],
  ["«человек, которого лучше не обгонять»", "миллиардер-затворник", "бывший чемпион, ставший магнатом", "«тот, кого всегда пропускают»", "владелец острова и автопарка", "анонимный коллекционер из Швейцарии"],
  ["специальный гараж", "«очень важное ведомство»", "водитель, которому не задают вопросов", "кортеж, о котором не пишут в новостях"]
];
const CARS = [
  // без марок: товарные знаки в игре не используем (правила VK Mini Apps, п. 2.1.4)
  ["потрёпанный хэтчбек", "бюджетный седан", "старенькая «семёрка»", "маленький городской седан", "универсал «для дачи»", "недорогой кроссовер"],
  ["семейный седан", "городской кроссовер", "аккуратный лифтбек", "японский седан", "компактный хэтчбек", "минивэн для большой семьи"],
  ["седан бизнес-класса", "немецкий седан", "премиальный кроссовер", "универсал с полным приводом", "шведский внедорожник", "большой японский внедорожник"],
  ["представительский седан", "британский внедорожник", "спортивный кроссовер", "гран-туризмо", "огромный внедорожник", "американский внедорожник"],
  ["чёрный лимузин", "отечественный лимузин", "седан с тонировкой", "кортеж из трёх одинаковых машин", "английский лимузин", "лимузин на заказ"],
  ["лимузин с мигалкой", "чёрный внедорожник сопровождения", "бронированный седан", "головная машина кортежа"]
];
const EVENTS = [
  "Трижды попадал в ДТП и ни разу не был виноват.", "Шесть часов простоял в пробке на Садовом.", "Сменил четырёх владельцев через «Авито».", "Был выигран в карты, о чём владелец до сих пор молчит.",
  "Его угоняли, но нашли через неделю на соседней улице.", "Участвовал в свадебном кортеже и украсил капот лентами.", "Попал в кадр дорожной камеры — штраф так и не пришёл.",
  "Простоял в гараже 5 лет, пока владелец был «в командировке».", "Проехал через всю страну по трассе «Байкал» и обратно.", "Был снят в кино, но вырезали на монтаже.",
  "Когда-то его перепутали с другим номером, и владельцу пришла чужая квитанция.", "Однажды замёрз в −40 и завёлся только на третий день.", "Участвовал в дрэге на пустыре и занял второе место.",
  "Побывал на выставке «Гаражные сокровища» и получил диплом.", "Его фотографировали туристы — и выложили в соцсети.", "Прошёл ТО без единого замечания (в это никто не поверил).",
  "Был потерян в «Авито» и найден по объявлению через полгода.", "Съездил на дачу и вернулся с ведром огурцов на заднем сиденье.", "Побывал на заправках всех цветов радуги.",
  "Ездил с прицепом на дачу тридцать раз и ни разу не застрял.", "Попал под ливень, и владелец клялся, что видел на капоте радугу.", "Однажды хозяин забыл его на парковке торгового центра на неделю.",
  "Стал героем местной газеты: «Номер, который все запомнили».", "Был подарен на юбилей в красивой коробке.", "Однажды ночью проехал сквозь туман, как в кино."
];
const OPENINGS = [
  ["Появился на свет в скромной очереди в отделении.", "Достался владельцу, который просто пришёл за любым номером.", "Выдан без лишней суеты — обычный будний день.", "Его никто не выбирал, он выбрал владельца сам."],
  ["Владелец долго выбирал именно такие цифры.", "Выдан в день, когда оператор улыбнулся и сказал: «Красивые!»", "Повторяющиеся цифры сразу привлекли внимание.", "Его бережно хранили в сейфе как талисман."],
  ["Выпал по случайности, но владелец сразу понял: это знак.", "Достался только тому, кто пришёл ровно в 9:00 и не ушёл.", "Попал к владельцу после трёх неудачных попыток.", "О нём заранее шептались в очереди."],
  ["Этот номер не продаётся — он «находит» владельца сам.", "Говорят, ему предшествовала долгая тишина и важные звонки.", "Получить его удавалось только по знакомству… так говорят.", "Появился там, где его никто не ждал, и все замолчали."],
  ["Номер-миф: о нём слышали все, но видели немногие.", "Его владелец до сих пор отказывается называть цену.", "По легенде, ему не нужен был ни фонарь, ни сирена — достаточно было появиться.", "Говорят, один его вид останавливает споры на парковке."],
  ["Такие номера не выдают в обычном окне — их выдают по списку.", "Спецсерия «АМР» 97 региона: в очереди за ней не стоят.", "Номер из тех, перед которыми открывают шлагбаум без вопросов."]
];
const ENDINGS = [
  "С тех пор он ездит и не жалуется.", "Теперь у него новая жизнь и новый хозяин — это ты.", "Вся история уместилась на одной странице блокнота.",
  "Его ещё долго вспоминали во дворе.", "Говорят, он приносит удачу — но только если вовремя мыть машину.", "Теперь он твой, береги его.",
  "Кому-то он просто номер, а для тебя — часть коллекции.", "Он ещё напишет свою главу — в твоём гараже.", "Старожилы двора до сих пор вспоминают, как он проезжал мимо.", "Его можно узнать из тысячи — по характеру."
];
const RUMORS = [
  ["Говорят, он дружит со всеми парковочными местами.", "Ходит слух, что он пережил три кризиса и не потерял в цене.", "Люди шепчутся, что он заводится с полоборота даже в мороз."],
  ["Говорят, он приносит удачу в мелких делах.", "Ходят слухи, что рядом с ним не бывает проколов.", "Коллекционеры уверяют, что цены на такие растут по весне."],
  ["Утверждают, что его владельцы выигрывали в лотерею.", "Ходит молва, что он всегда находит место на парковке.", "Рассказывают, что рядом с ним любое такси приезжает быстрее."],
  ["Шепчутся, что рядом с ним даже светофоры работают лучше.", "Ходят слухи, что при его виде другие водители вежливее.", "Говорят, он знает короткие дороги, которых нет на картах."],
  ["Рассказывают, что у него есть свой водитель, свой гараж и своё мнение.", "Шепчутся, что в день его появления на улице сам собой убирается мусор.", "Ходят легенды, что он никогда не стоял в очереди на заправке."],
  ["Говорят, при его виде перекрывают полосу.", "Шепчутся, что его не останавливают даже на посту.", "Ходят слухи, что за ним всегда едет ещё одна машина."]
];
function hashSeed(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function plateInfo(p, canSell) {
  const r = seeded(hashSeed(p.l1 + p.d + p.l23 + p.reg)), pi = a => Math.floor(r() * a.length), pk = a => L(a[pi(a)]);
  const ser = seriesOf(p), regRu = REGION_NAME[p.reg], regName = regRu ? L(regRu) : L("регион {0}", p.reg), year = 2004 + Math.floor(r() * 20), t = p.tier;
  const yr = n => Math.min(2026, year + n);
  const own = pk(OWNERS[t]), own2 = pk(OWNERS[Math.min(TOP, t + (r() < 0.5 ? 0 : 1))]), car = pk(CARS[t]), nick = pk(NICK[t]);
  const facts = [];
  if (SERIES_STORY[ser]) { const st = SERIES_STORY[ser], a = pi(st); let b = pi(st); if (b === a) b = (a + 1) % st.length; facts.push(L(st[a]), L(st[b])); }
  if (DIGIT_STORY[p.d]) facts.push(pk(DIGIT_STORY[p.d]));
  if (ELITE_REG.includes(p.reg)) facts.push(L("Регион {0} — «столичный»: такие номера дают ощущение статуса, хотя сам регион ничего не значит.", p.reg));
  else facts.push(L("Регион {0} — {1}.", p.reg, regName) + (REGION_FACT[regRu] ? " " + L(REGION_FACT[regRu]) : ""));
  if (ser === GOV_SER && p.reg === GOV_REG) facts.push(L("«АМР» с 97 регионом — спецсерия: такие номера в народе считают государственными, поэтому в игре они всегда легендарные, а с особыми цифрами (001–009, 100 или три одинаковые) — суперлегендарные."));
  if (t === 1) facts.push(L("Красивые номера — повторяющиеся цифры и буквы или «зеркала» — продаются в разы дороже обычных."));
  if (t === 0) facts.push(L("Ничем не примечательный номер. Но у каждой цифры есть своя история."));
  const legend = pk(OPENINGS[t]) + " " + pk(EVENTS) + " " + pk(ENDINGS);
  const tl = [
    `<b>${year}</b> — ${L("выдан в регионе: {0}.", regName)}`,
    `<b>${yr(1 + Math.floor(r() * 3))}</b> — ${L("первый владелец: {0}. Ездил на {1}.", own, car)}`,
    `<b>${yr(3 + Math.floor(r() * 4))}</b> — ${pk(EVENTS)}`
  ];
  if (t >= 1) tl.push(`<b>${yr(6 + Math.floor(r() * 4))}</b> — ${L("перешёл к новому владельцу: {0}.", own2)}`);
  if (t >= 2) tl.push(`<b>${yr(8 + Math.floor(r() * 5))}</b> — ${L("продан через посредника за {0} ₽ (по слухам).", fmt(20000 + Math.floor(r() * 500000) * (t - 1)))}`);
  tl.push(`<b>${L("Сегодня")}</b> — ${p.got ? L("попал к тебе {0}.", new Date(p.got).toLocaleDateString(I18N.loc)) : L("у тебя в гараже.")}`);
  const pr = PACKS.basic.w[t], rum = [pk(RUMORS[t]), pk(RUMORS[t])];
  return `<h2 class="t${t}">${L(["Обычный номер", "Красивый номер", "Редкий номер", "Блатной номер", "Легендарный номер", "Суперлегендарный номер"][t])}</h2><div style="margin-bottom:4px"><b>${nick}</b></div>${plateHTML(p, "")}
    <p style="font-size:12px;color:#8d99b3;margin:10px 0">${L("Цена {0} 💰 · доход +{1}/сек · шанс из обычного бланка ≈ {2}%", fmt(sellVal(p)), plateInc(p).toFixed(2), pctStr(pr))}</p>
    <div class="card" style="text-align:left"><h3>${L("🧾 О номере")}</h3>${facts.map(f => `<p style="margin:0 0 6px;font-size:13px;color:#cfd6e6">${f}</p>`).join("")}</div>
    <div class="card" style="text-align:left"><h3>${L("📖 Легенда номера")}</h3><p style="margin:0;font-size:13px;color:#cfd6e6">${legend}</p></div>
    <div class="card" style="text-align:left"><h3>${L("📜 История")} <small>${L("(вымышленная)")}</small></h3>${tl.map(x => `<div class="tl">${x}</div>`).join("")}</div>
    <div class="card" style="text-align:left"><h3>${L("🗣 Слухи")}</h3>${rum.map(x => `<p style="margin:0 0 6px;font-size:13px;color:#cfd6e6">• ${x}</p>`).join("")}</div>
    ${Platform.canShare && t >= 2 ? `<button class="btn alt" data-act="brag" data-id="${p.id}">${L("📤 Похвастаться другу")}</button>` : ""}
    ${canSell ? `<button class="btn ${isLocked(p) ? "green" : "alt"}" data-act="lockPlate" data-id="${p.id}" data-info="1">${p.lock ? L("🔒 Под замком — не сливать и не продавать (снять)") : S.prof.pins.includes(p.id) ? L("🔒 Защищён: закреплён в профиле") : L("🔓 Поставить замок: не сливать и не продавать")}</button>` : ""}
    ${canSell ? `<button class="btn alt" data-act="pinPlate" data-id="${p.id}">${S.prof.pins.includes(p.id) ? L("📌 Открепить из профиля") : L("📌 Закрепить в профиле")}</button>` : ""}
    ${canSell && !isLocked(p) ? `<button class="btn green" data-act="sellFromInfo" data-id="${p.id}">${L("Продать за {0}", fmt(sellVal(p)))}</button>` : ""}
    <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`;
}
let lastRevealed = null;
function showInfo(id) {
  const p = S.plates.find(x => x.id === id) || (lastRevealed && lastRevealed.id === id ? lastRevealed : null);
  if (p) { openModal(plateInfo(p, S.plates.some(x => x.id === id))); Snd.click(); }
}

// ===================== МОДАЛКИ =====================
let modalLocked = false;
function openModal(html, locked) { $("mbox").innerHTML = html; $("modal").classList.remove("hidden"); modalLocked = !!locked; }
let dailyAfter = false;                                // ежедневный бонус ждёт, пока закроют окно офлайн-дохода
function closeModal() {
  $("modal").classList.add("hidden"); modalLocked = false; if (miniRun) { miniRun.run = false; miniRun = null; }
  if (dailyAfter) { dailyAfter = false; setTimeout(checkDaily, 400); }
}
$("modal").addEventListener("click", e => { if (e.target === $("modal") && !modalLocked) closeModal(); });

// ===================== ПЛАТФОРМЫ =====================
// Всё, что зависит от площадки (Яндекс Игры, VK, ...), — в platform.js; здесь только реакция игры.
function setPaused(p) {
  hidden = p;
  if (A.ctx) p ? A.ctx.suspend() : A.ctx.resume();
  if (!p) { lastTick = Date.now(); }
}
document.addEventListener("visibilitychange", () => setPaused(document.hidden));
document.addEventListener("contextmenu", e => { if (!e.target.closest("input, textarea")) e.preventDefault(); });   // в полях ввода (админка) — можно вставить текст   // ни правый клик, ни долгое нажатие не открывают меню браузера (Яндекс, п. 1.6.1.8 и 1.6.2.7)
Platform.init({
  pause: setPaused,
  mute: setMuted,
  busy: b => $("adwait").classList.toggle("hidden", !b),
  ads: () => { renderPacks(); renderHeader(); if (tab === "more") renderMore(); if (tab === "forge") renderForge(); },   // реклама стала недоступна — прячем её кнопки
  lang: l => { if (I18N.set(l)) { applyLang(); if (!$("menu").classList.contains("hidden")) showMenu(); } }
}).then(() => {
  renderSubs(); if (Platform.hasCloud) cloudLoad();
  // Telegram: игрок регистрируется на сервере; уже подписан на канал (например, подписался и закрыл игру) — бонус сразу
  if (Platform.name === "tg") Platform.hello().then(j => {
    Platform.track(j ? "srv_ok" : "srv_fail"); if (!j) return;
    srvOK = true;
    if (j.sub) setTimeout(() => subGrant("tg", 0), 2500);
    if (j.notify && !S.subs.notif) { S.subs.notif = 1; save(); }   // уже нажимал /start в боте — напоминания и так включены, не спрашиваем
    refs = { n: j.refs || 0, done: j.refsDone || 0, inviter: !!j.inviter, respect: j.respect || 0 }; myUid = j.uid || 0;
    tgName = j.name || ""; myCode = j.code || ""; reqsN = j.reqs || 0; updateMoreDot();
    if (reqsN) setTimeout(() => toast(L("📨 Заявки в друзья: {0} — загляни в «Ещё» → «Друзья»", reqsN)), 6000);
    if (j.profReset) { S.prof.nick = ""; S.prof.bio = ""; profAck = true; save(); setTimeout(() => toast(L("Ник и статус сброшены модератором — придумай новые в профиле")), 5000); }
    if (j.admin) { isAdmin = true; }                   // владелец игры — кнопка админки во вкладке «Ещё»
    if (refs.respect > S.soc.resp) { const d = refs.respect - S.soc.resp; S.soc.resp = refs.respect; save(); setTimeout(() => toast(L("👍 Твоему гаражу поставили респектов: +{0} (всего {1})", d, refs.respect)), 4000); }
    setEvent(j.ev);
    if (tab === "more") renderMore();
    sendState();
    claimPaid(1);                                      // покупки, оплаченные, когда игра была закрыта, и подарки (друзья, рейтинг)
  });
  renderPacks();                                       // кнопка магазина зависит от площадки
});
// ----- напоминания от бота (только Telegram): сервер знает, сколько копит гараж, и пишет игроку, когда тот давно не заходил
let srvOK = false;                                     // сервер ответил на hello — без него напоминания не работают, и спрашивать о них незачем
function sendState() { if (Platform.name === "tg") Platform.state({ full: Math.round(income() * 1800), streak: S.daily.streak, lvl: S.lvl, earned: Math.round(S.earned), garage: garageSnap(), prof: profOut(), profAck: profAck || undefined }); profAck = false; }   // garage — снимок для друзей и рейтинга   // earned — для рейтинга недели   // 1800 = офлайн-доход за час (половина обычного)
setInterval(sendState, 120000);
document.addEventListener("visibilitychange", () => { if (document.hidden) sendState(); });
setInterval(() => {                                   // один раз после обучения: «включить напоминания?», затем системный запрос Telegram
  if (!srvOK || S.subs.notif || S.tut !== -1 || S.playSec < 120 || !S.plates.length) return;
  if (!$("modal").classList.contains("hidden") || !$("menu").classList.contains("hidden") || jpState || Talk.cur || rolling || pending || cinemaQueue.length) return;
  S.subs.notif = 1; save(); Platform.track("notif_ask");
  openModal(`<h2>${L("🔔 Напоминания")}</h2><p>${L("Гараж копит деньги, пока тебя нет, но только час. Бот напишет, когда он заполнится и когда будет готов ежедневный бонус.")}</p>
    <button class="btn green" data-act="notifOn">${L("🔔 Включить")}</button><button class="btn alt" data-act="closeModal">${L("Не надо")}</button>`);
}, 10000);
// в ВК при каждом запуске — стартовое меню (каталог ВК Игр, п. 4.2.10); на других площадках оно открывается из «Ещё»
if (/[?&](vk_app_id|vk_user_id)=|[?&]platform=vk\b/.test(location.search)) showMenu();
// ----- облачное сохранение (если площадка его даёт). localStorage остаётся запасным вариантом.
function cloudLoad() {
  Platform.load().then(c => {
    cloudOK = true;
    const has = !RESET && c && c.v;
    // главное хранилище площадки (CrazyGames) — всегда источник истины;
    // иначе облако берём, если на этом устройстве сохранения нет или в облаке более свежее, а локальное заливаем наверх
    if (has && (Platform.primary || !hadLocal || (c.t || 0) > (S.t || 0))) applyCloud(c, Platform.primary); else cloudDirty = true;
  }).catch(() => {});
}
function applyCloud(c, silent) {
  S = normalize(c); albumBackfill(); pending = null; $("resolveRow").style.display = "none";
  dispCoins = S.coins; lastTick = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  if (S.forgePend) applyForge(true);
  refreshMarket(); ensureOrders(); renderAll(); renderGoal(); updatePity(); applyCity();
  if (!silent) toast(L("☁ Прогресс загружен"));
}
function cloudFlush(now) {
  if (!cloudOK || !cloudDirty || noSave) return;
  cloudDirty = false;
  try { Platform.save(S, now).catch(() => { cloudDirty = true; }); } catch (e) { cloudDirty = true; }
}
setInterval(() => cloudFlush(false), 15000);
document.addEventListener("visibilitychange", () => { if (document.hidden) cloudFlush(true); });
addEventListener("pagehide", () => cloudFlush(true));
function rewardedAd(cb) {                             // локально (без площадки) награда выдаётся сразу
  Platform.rewarded().then(ok => { if (ok) cb(); else toast(L("Реклама недоступна")); });
}
const interstitial = () => Platform.interstitial();
// ----- бонусы за подписку на паблики — только в Telegram (правила Яндекса запрещают внешние ссылки, у ВК бонусы за вступление под запретом)
const SUBS = [
  { k: "tg", url: "https://t.me/blatnoynomer_tg", ico: "✈️", name: "Telegram-канал" },
  { k: "vk", url: "https://vk.ru/nomer_blatnoy", ico: "💙", name: "группу ВКонтакте" }
];
const subsLeft = () => Platform.name === "tg" ? SUBS.filter(s => !S.subs[s.k]) : [];
const subReward = () => Math.max(500, Math.round(income() * 300 / 10) * 10);   // ~5 минут дохода гаража, но не меньше 500
const subsHTML = cls => subsLeft().map(s => `<button class="btn ${cls} subbtn" data-act="subGo" data-k="${s.k}">${s.ico} ${L("Подпишись на {0}", L(s.name))} <b>+${fmt(subReward())} 💰</b></button>`).join("");
function renderSubs() {                               // компактная полоска на главном экране (после обучения), пока есть неполученные бонусы
  const left = S.tut === -1 ? subsLeft() : [];
  $("subs").innerHTML = left.length ? `<div class="subbar"><span>🎁 ${L("За подписку")}</span>${left.map(s => `<button class="btn sm green" data-act="subGo" data-k="${s.k}">${s.ico} ${L(s.k === "tg" ? "Канал" : "ВК")} +${fmt(subReward())}</button>`).join("")}</div>` : "";
}
function subGrant(k, delay) {
  if (S.subs[k]) return;
  S.subs[k] = 1; save();
  const v = subReward();
  setTimeout(() => { gain(v); toast(L("Спасибо за подписку! +{0} 💰", fmt(v))); Snd.sell(); fx.confetti(40); save(); closeModal(); renderSubs(); renderHeader(); if (tab === "more") renderMore(); }, delay);
}
let subWait = 0, subBusy = false;
function subGo(k) {
  const s = SUBS.find(x => x.k === k); if (!s || S.subs[k]) return;
  Platform.openLink(s.url); Platform.track("sub_" + k);
  if (k === "tg") { subWait = Date.now(); closeModal(); return; }   // подписку на канал проверяет сервер (subPoll)
  subGrant(k, 2500);                                  // группу ВК проверить нельзя — бонус приходит, когда игрок возвращается
}
setInterval(function subPoll() {                      // ждём подписку на канал до 2 минут после нажатия; сервер недоступен — верим на слово
  if (!subWait || subBusy || document.hidden || S.subs.tg || Date.now() - subWait < 3000) return;
  subBusy = true;
  Platform.checkSub().then(ok => {
    subBusy = false; if (!subWait) return;
    if (ok !== false) { subWait = 0; Platform.track(ok ? "sub_tg_ok" : "sub_tg_nocheck"); subGrant("tg", 0); }
    else if (Date.now() - subWait > 120000) { subWait = 0; toast(L("Подписка на канал не найдена — подпишись и нажми кнопку ещё раз")); }
  });
}, 3000);
setInterval(() => {                                   // время от времени зовём подписаться: после обучения, раз в 4 минуты игры, не больше 6 раз
  if (!subsLeft().length || S.tut !== -1 || S.subs.n >= 6 || S.playSec - S.subs.at < 240) return;
  if (!$("modal").classList.contains("hidden") || !$("menu").classList.contains("hidden") || jpState || Talk.cur || rolling || pending || cinemaQueue.length) return;
  S.subs.at = S.playSec; S.subs.n++; save(); Platform.track("sub_popup");
  openModal(`<h2>${L("🎁 Бонус за подписку")}</h2><p>${L("Подпишись на наши паблики — там новые номера, конкурсы и секреты игры. За каждую подписку:")} <b style="color:var(--gold)">+${fmt(subReward())} 💰</b></p>
    ${subsHTML("green")}<button class="btn alt" data-act="closeModal">${L("Позже")}</button>`);
}, 10000);
// ----- магазин за звёзды (только Telegram). Цены и выдача товара — на сервере (server/src/worker.js, ITEMS), игра только показывает и выдаёт.
const SHOP = [
  { k: "starter", st: 15, ico: "🎁", n: "Набор новичка", d: () => L("+{0} 💰, блатной номер и доход ×2 на час", fmt(shopCash("starter"))) },
  { k: "cash_s", st: 25, ico: "💰", n: "Пачка денег", d: () => L("+{0} 💰 — 30 минут дохода", fmt(shopCash("cash_s"))) },
  { k: "blat", st: 49, ico: "🚘", n: "Блатной номер", d: () => L("Случайный блатной — сразу в гараж") },
  { k: "cash_l", st: 99, ico: "💼", n: "Чемодан денег", d: () => L("+{0} 💰 — 3 часа дохода", fmt(shopCash("cash_l"))) },
  { k: "legend", st: 149, ico: "👑", n: "Легенда", d: () => L("Случайный легендарный номер — сразу в гараж") },
  { k: "x2", st: 199, ico: "🔥", n: "Доход ×2 навсегда", d: () => L("Гараж приносит вдвое больше — навсегда, даже после переезда") }
];
const shopCash = k => k === "cash_l" ? Math.max(20000, Math.round(income() * 10800 / 10) * 10) : k === "starter" ? Math.max(5000, Math.round(income() * 3600 / 10) * 10) : Math.max(3000, Math.round(income() * 1800 / 10) * 10);
// набор новичка: одна покупка, предложение действует сутки с первого открытия магазина или всплывашки
const starterOn = () => Platform.canPay && !S.paid.starter && (!S.paid.starterUntil || Date.now() < S.paid.starterUntil);
function starterStart() { if (!S.paid.starterUntil) { S.paid.starterUntil = Date.now() + 864e5; save(); } }
function openShop() {
  Platform.track("shop_open"); if (starterOn()) starterStart();
  const items = SHOP.filter(s => !(s.k === "x2" && S.paid.x2) && (s.k !== "starter" || starterOn()));
  openModal(`<h2>${L("⭐ Магазин")}</h2><p>${L("Покупки за звёзды Telegram. Спасибо, что поддерживаешь игру!")}</p>
    ${items.map(s => `<button class="btn ${s.k === "x2" || s.k === "starter" ? "star" : "alt"} shopbtn" data-act="shopBuy" data-k="${s.k}"><span>${s.ico} ${L(s.n)}${s.k === "starter" ? ` <i class="sale">−70%</i>` : ""}<small>${s.d()}${s.k === "starter" ? " · " + L("осталось") + ` <span class="timer" data-until="${S.paid.starterUntil}"></span>` : ""}</small></span><b>⭐ ${s.st}</b></button>`).join("")}
    ${S.paid.x2 ? `<div class="hint">${L("🔥 Доход ×2 навсегда уже куплен")}</div>` : ""}
    <div class="hint">${L("Условия покупок — /terms, помощь с оплатой — /paysupport в боте.")}</div>
    <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`);
}
setInterval(() => {                                   // один раз: предложить набор новичка, когда игрок освоился (6+ минут игры после обучения)
  if (!starterOn() || S.paid.starterUntil || S.tut !== -1 || S.playSec < 360 || !srvOK) return;
  if (!$("modal").classList.contains("hidden") || !$("menu").classList.contains("hidden") || jpState || Talk.cur || rolling || pending || cinemaQueue.length) return;
  starterStart(); Platform.track("starter_show");
  openModal(`<h2>${L("🎁 Набор новичка")}</h2><p>${L("Только для новичков и только 24 часа — в 3 раза дешевле обычного:")}</p>
    <div class="card" style="text-align:left"><p>💰 <b>+${fmt(shopCash("starter"))}</b> ${L("— час дохода гаража")}</p><p>🚘 <b>${L("Блатной номер")}</b> ${L("— сразу в гараж")}</p><p>🔥 <b>${L("Доход ×2")}</b> ${L("— на целый час")}</p></div>
    <button class="btn star shopbtn" data-act="shopBuy" data-k="starter"><span>${L("Забрать набор")} <i class="sale">−70%</i></span><b>⭐ 15</b></button>
    <button class="btn alt" data-act="closeModal">${L("Не сейчас")}</button>`);
}, 10000);
// выдача: покупки и подарки (why — откуда подарок: друг, рейтинг)
function shopGrant(item, why) {
  if (why) toast(why);
  if (item === "cash_s" || item === "cash_l") { const v = shopCash(item); gain(v); toast(L("+{0} 💰", fmt(v))); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 20); fx.confetti(80); }
  else if (item === "blat" || item === "legend") { const p = makePlate(item === "blat" ? 3 : 4); markFound(p); keepPlate(p); jackpot(p); }
  else if (item === "x2") { S.paid.x2 = 1; toast(L("🔥 Доход ×2 навсегда!")); vignette("#ffd23f"); fx.confetti(120); Snd.level(); }
  else if (item === "starter") {
    S.paid.starter = 1; const v = shopCash("starter"); gain(v); S.buffUntil = Math.max(S.buffUntil, Date.now()) + 3600000;
    toast(L("🎁 Набор новичка: +{0} 💰 и доход ×2 на час", fmt(v))); renderPills();
    const p = makePlate(3); markFound(p); keepPlate(p); jackpot(p);
  }
  // подарки из админки: coins_N — ровно N монет (не идут в рейтинг), tier_N — номер редкости N, plate_А777АА_77 — конкретный номер,
  // pts_N — «связи», buff_N — доход ×2 на N часов
  else if (/^coins_\d+$/.test(item)) { const v = +item.slice(6); S.coins += v; toast(L("+{0} 💰", fmt(v))); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 20); fx.confetti(80); }
  else if (/^tier_[0-5]$/.test(item)) { const p = makePlate(+item[5]); markFound(p); keepPlate(p); if (p.tier >= 3) jackpot(p); else { toast(L("🎁 {0} номер {1} — в гараже", TIERS[p.tier].name, p.l1 + p.d + p.l23 + " " + p.reg)); fx.confetti(60); } }
  else if (/^plate_/.test(item)) {
    const [, s, reg] = item.split("_"), q = parsePlate(s + reg); if (!q) return;
    const p = customPlate(q); markFound(p); keepPlate(p); if (p.tier >= 3) jackpot(p); else { toast(L("🎁 Номер {0} — в гараже", p.l1 + p.d + p.l23 + " " + p.reg)); fx.confetti(60); }
  }
  else if (/^pts_\d+$/.test(item)) { S.pts += +item.slice(4); toast(L("⭐ +{0} связей: доход и удача выше навсегда", item.slice(4))); vignette("#ffd23f"); fx.confetti(60); }
  else if (/^buff_\d+$/.test(item)) { S.buffUntil = Math.max(S.buffUntil, Date.now()) + +item.slice(5) * 3600000; toast(L("🔥 Доход ×2 на {0} ч!", item.slice(5))); vignette("#ffd23f"); renderPills(); }
  else return;
  if (!why) S.paid.buys = (S.paid.buys || 0) + 1;      // для рамки «VIP» в профиле
  Platform.track((why ? "gift_" : "paid_") + item.split("_")[0]); Platform.happytime();
}
const GIFT_WHY = id => /^refnew_/.test(id) ? L("🎁 Подарок за то, что пришёл по приглашению друга!") : /^ref_/.test(id) ? L("🤝 Друг втянулся в игру — тебе награда!") : /^top_/.test(id) ? L("🏆 Награда за рейтинг недели!") : /^gift_/.test(id) ? L("🎁 Тебе подарок!") : "";
// забрать оплаченное и подарки: при запуске, раз в 1,5 минуты и сразу после оплаты — вебхук может прийти на секунду позже.
// Во время обучения не забираем — подарок дождётся на сервере.
let claimBusy = false;
function claimPaid(tries, afterPay) {
  if (claimBusy || !Platform.canShare || (S.tut !== -1 && !afterPay)) return; claimBusy = true;
  Platform.claim().then(items => {
    claimBusy = false;
    if (items) setEvent(items.ev);
    const got = (items || []).filter(x => !S.paid.got.includes(x.id));
    if (got.length) {
      got.forEach(x => { S.paid.got.push(x.id); shopGrant(x.item, GIFT_WHY(x.id)); });
      S.paid.got = S.paid.got.slice(-50); save(); cloudFlush(true); renderAll();
    } else if (tries > 1) setTimeout(() => claimPaid(tries - 1, afterPay), 2000);
    else if (afterPay) toast(L("Оплата получена — покупка зачислится при следующем запуске игры"));
  });
}
setInterval(() => { if (srvOK && !document.hidden) claimPaid(1); }, 90000);
let shopBusy = false;
function shopBuy(k) {
  if (shopBusy) return; shopBusy = true; Platform.track("shop_try_" + k);
  Platform.buy(k).then(st => {
    shopBusy = false;
    if (st === "paid") { closeModal(); claimPaid(8, true); }
    else if (st === "pending") { closeModal(); toast(L("Оплата обрабатывается — покупка придёт сама")); claimPaid(15, true); }
    else if (st === "noserver") toast(L("Магазин сейчас недоступен — проверь интернет и попробуй позже"));
    else if (st === "failed") toast(L("Оплата не прошла"));
  });
}

// ----- друзья и «похвастаться» (только Telegram): ссылка с startapp=ref_ID, подарки выдаёт сервер через claim
let refs = { n: 0, done: 0 };
function invite() {
  Platform.track("ref_share");
  Platform.share(L("🚘 Залетай в «Блатной номер» — выбивай блатные номера и собирай гараж! По моей ссылке сразу получишь блатной номер в подарок 🎁"));
}
function brag(p) {
  if (!p) return; Platform.track("brag_" + p.tier);
  const t = [L("обычный"), L("красивый"), L("редкий"), L("блатной"), L("ЛЕГЕНДАРНЫЙ"), L("СУПЕРЛЕГЕНДАРНЫЙ")][p.tier];
  Platform.share(L("🚘 Я выбил {0} номер {1} в «Блатном номере»! Стоит {2} 💰. Сможешь круче?", t, p.l1 + p.d + p.l23 + " " + p.reg, fmt(p.val)));
}

// ----- рейтинг недели (только Telegram)
function openTop() {
  Platform.track("top_open");
  openModal(`<h2>${L("🏆 Рейтинг недели")}</h2><p class="hint">${L("Загружаю…")}</p>`);
  Platform.top().then(j => {
    if ($("modal").classList.contains("hidden")) return;
    if (!j) { $("mbox").innerHTML = `<h2>${L("🏆 Рейтинг недели")}</h2><p>${L("Сервер не отвечает — попробуй позже")}</p><button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`; return; }
    const medal = i => ["🥇", "🥈", "🥉"][i] || (i + 1) + ".";
    $("mbox").innerHTML = `<h2>${L("🏆 Рейтинг недели")}</h2>
      <p style="font-size:13px;color:#8d99b3;margin-top:-4px">${L("Кто больше заработает с понедельника. Итоги — в понедельник днём.")} ${L("До конца:")} <span class="timer" data-until="${j.ends * 1000}"></span></p>
      <p style="font-size:13px">${L("🥇 1 место — легенда · 🥈🥉 2–3 — блатной · 4–10 — чемодан денег")}</p>
      <div class="card toplist">${j.top.length ? j.top.map((r, i) => `<div class="toprow ${r.me ? "me" : ""}" data-act="garageOf" data-top="${i}"><span>${medal(i)}</span><span class="fava" style="--f1:${frameOf(r.f).c1}">${escapeHTML(r.a || "😎")}</span><b>${escapeHTML(r.n)}</b><i>${fmt(r.s)} 💰</i><em>🏠</em></div>`).join("") : `<p>${L("Пока пусто — будь первым!")}</p>`}</div>
      ${j.top.length ? `<p class="hint" style="margin-top:-4px">${L("Нажми на игрока — посмотришь его гараж")}</p>` : ""}
      <p>${j.rank ? L("Ты на {0} месте: {1} 💰", j.rank, fmt(j.score)) : L("Ты пока не в рейтинге — заработай что-нибудь на этой неделе")}</p>
      <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`;
  });
}
// ----- профиль и друзья (Telegram; редактор профиля — на всех площадках, это просто украшение)
// Снимок гаража и профиля уходит на сервер вместе с состоянием (sendState). Смотреть чужой профиль можно у игроков
// из рейтинга недели, у друзей и у тех, кто прислал заявку. За чужой гараж — «👍 респект» раз в день.
const AVAS = ["😎", "🤠", "🧔", "👨‍💼", "👩‍💼", "🕵️", "👮", "🧑‍🔧", "👩", "👨", "🦁", "🐺", "🐯", "🦊", "🐻", "🦅", "🔥", "⚡", "🚘", "🏎️", "🚓", "🛻", "🏍️", "🎩",
  ["💰", () => S.earned >= 1e6, "заработать 1 млн"], ["👑", () => S.lvl >= 15, "15 уровень"], ["🐉", () => albumCount() >= 60, "60 клеток альбома"], ["💎", () => S.tc[5] >= 1 || S.mergeBest >= 5, "суперлегенда"]];
const FRAMES = [
  { id: "base", n: "Асфальт", c1: "#2a3350", c2: "#121726", ok: () => true },
  { id: "night", n: "Ночной город", c1: "#2b3f8f", c2: "#0b0e1f", ok: () => S.lvl >= 3, need: "3 уровень" },
  { id: "green", n: "Кэш", c1: "#1f7a43", c2: "#08180e", ok: () => S.earned >= 1e6, need: "заработать 1 млн" },
  { id: "gold", n: "Золото", c1: "#c9961a", c2: "#2a1f05", ok: () => S.lvl >= 10, need: "10 уровень" },
  { id: "neon", n: "Неон", c1: "#a020f0", c2: "#16072a", ok: () => albumCount() >= 40, need: "40 клеток альбома" },
  { id: "fire", n: "Огонь", c1: "#e0401e", c2: "#2a0905", ok: () => S.tc[4] + S.tc[5] >= 1 || S.mergeBest >= 4, need: "выбить легенду" },
  { id: "ice", n: "Лёд", c1: "#3ec8f0", c2: "#06202a", ok: () => S.tc[5] >= 1 || S.mergeBest >= 5, need: "суперлегенда" },
  { id: "resp", n: "Уважаемый", c1: "#43c76b", c2: "#0c2a18", ok: () => (refs.respect || 0) >= 10, need: "10 респектов" },
  { id: "vip", n: "VIP", c1: "#ffd23f", c2: "#5a3500", ok: () => !!(S.paid.x2 || S.paid.starter || S.paid.buys), need: "любая покупка в магазине" }
];
FRAMES.forEach(f => Lprops(f, "n"));
const frameOf = id => FRAMES.find(f => f.id === id) || FRAMES[0];
const avaOk = a => { const x = AVAS.find(v => (Array.isArray(v) ? v[0] : v) === a); return !!x && (!Array.isArray(x) || x[1]()); };
const pinPlates = () => S.prof.pins.map(id => S.plates.find(p => p.id === id)).filter(Boolean);
var tgName = "", myCode = "", reqsN = 0, profAck = false;   // var: updateMoreDot зовут и раньше этой строки
const myName = () => S.prof.nick || tgName || L("Игрок");
function profOut() { const f = frameOf(S.prof.frame); return { nick: S.prof.nick, ava: avaOk(S.prof.ava) ? S.prof.ava : "😎", frame: f.ok() ? f.id : "base", bio: S.prof.bio }; }
function garageSnap() {
  S.prof.pins = S.prof.pins.filter(id => S.plates.some(p => p.id === id));   // проданные и слитые номера сами открепляются
  const pk = p => [p.l1 + p.d + p.l23, p.reg, p.tier];
  const top = [...S.plates].sort((a, b) => b.val - a.val).slice(0, 15).map(pk);
  return { p: top, pin: pinPlates().map(pk), n: S.plates.length, v: Math.round(garageVal()), inc: Math.round(income() * 10) / 10, lvl: S.lvl, al: albumCount(), t: S.title || "", pts: S.pts, tc: S.tc.slice(3), sets: setsDone(), mb: S.mergeBest };
}
const snapPlate = a => ({ l1: a[0][0], d: a[0].slice(1, 4), l23: a[0].slice(4, 6), reg: a[1], tier: +a[2] || 0 });
// значки — считаются из снимка гаража, одинаково у себя и у других
function badgesOf(g, respect) {
  if (!g) return [];
  const tc = g.tc || [0, 0, 0], b = [];
  if (tc[2] || g.mb >= 5) b.push(["💎", L("Суперлегенда")]); else if (tc[1] || g.mb >= 4) b.push(["👑", L("Легенда")]); else if (tc[0] || g.mb >= 3) b.push(["🚘", L("Блатной")]);
  if (g.al >= 60) b.push(["🐉", L("Коллекционер")]); else if (g.al >= 30) b.push(["📒", L("Собиратель")]);
  if (g.pts) b.push(["🏛", L("Москвич ⭐{0}", g.pts)]);
  if (g.lvl >= 20) b.push(["🎖", L("Ветеран")]);
  if (g.v >= 1e6) b.push(["💰", L("Миллионер")]);
  if (respect >= 10) b.push(["👍", L("Уважаемый")]);
  return b;
}
// карточка профиля: o = { name, prof, lvl, g, respect, friends, since }
function profCardHTML(o, small) {
  const pr = o.prof || {}, f = frameOf(pr.frame), g = o.g, bd = badgesOf(g, o.respect || 0);
  const pins = g && g.pin && g.pin.length ? g.pin : null;
  return `<div class="pcard f-${f.id} ${small ? "sm" : ""}" style="--f1:${f.c1};--f2:${f.c2}">
    <div class="ptop"><div class="pava">${escapeHTML(pr.ava || "😎")}</div><div class="pname"><b>${escapeHTML(o.name)}</b>
      <small>${L("Ур. {0}", o.lvl || (g && g.lvl) || 1)}${g && g.t ? " · 🏷 " + escapeHTML(L(g.t)) : ""}</small>
      ${pr.bio ? `<i>«${escapeHTML(pr.bio)}»</i>` : ""}</div></div>
    ${bd.length ? `<div class="pbadges">${bd.map(([i, n]) => `<span>${i} ${n}</span>`).join("")}</div>` : ""}
    ${pins ? `<div class="ppins">${pins.map(a => plateHTML(snapPlate(a), "small")).join("")}</div>` : ""}
    ${!small && g ? `<div class="pstats"><span><b>${fmt(g.v)}</b>💰 ${L("гараж")}</span><span><b>${g.n}</b> ${L("номеров")}</span><span><b>${g.al}/${ALBUM_TOTAL}</b> ${L("альбом")}</span><span><b>👍 ${o.respect || 0}</b></span>${o.friends != null ? `<span><b>👥 ${o.friends}</b></span>` : ""}</div>` : ""}
  </div>`;
}
const myCard = small => profCardHTML({ name: myName(), prof: profOut(), lvl: S.lvl, g: garageSnap(), respect: refs.respect || 0, friends: null }, small);

// ----- редактор профиля
let pfDraft = null;
function pfSync() { if (!pfDraft) return; const n = $("pfNick"), b = $("pfBio"); if (n) pfDraft.nick = n.value; if (b) pfDraft.bio = b.value; }
function openProfile() {
  if (!pfDraft) pfDraft = JSON.parse(JSON.stringify(S.prof));
  const d = pfDraft, prev = profCardHTML({ name: d.nick.trim() || tgName || L("Игрок"), prof: d, lvl: S.lvl, g: Object.assign(garageSnap(), { pin: d.pins.map(id => S.plates.find(p => p.id === id)).filter(Boolean).map(p => [p.l1 + p.d + p.l23, p.reg, p.tier]) }), respect: refs.respect || 0 });
  const plates = [...S.plates].sort((a, b) => b.val - a.val).slice(0, 30), keep = [$("mbox").scrollTop, $("modal").scrollTop], again = !$("modal").classList.contains("hidden") && !!$("pfNick");
  setTimeout(() => { if (again) { $("mbox").scrollTop = keep[0]; $("modal").scrollTop = keep[1]; } }, 0);   // при выборе аватара/рамки окно не прыгает наверх
  openModal(`<h2>${L("👤 Мой профиль")}</h2>${prev}
    <div class="pfedit">
    <label>${L("Ник")}</label><input id="pfNick" maxlength="16" value="${escapeHTML(d.nick)}" placeholder="${escapeHTML(tgName || L("Как тебя называть"))}">
    <label>${L("Статус")}</label><input id="pfBio" maxlength="60" value="${escapeHTML(d.bio)}" placeholder="${L("Например: Собираю только блатные")}">
    <label>${L("Аватар")}</label><div class="pfavas">${AVAS.map(v => { const a = Array.isArray(v) ? v[0] : v, lock = Array.isArray(v) && !v[1]();
      return `<button class="${a === d.ava ? "on" : ""} ${lock ? "lock" : ""}" data-act="pfAva" data-v="${a}" ${lock ? `title="${L("Откроется: {0}", L(v[2]))}"` : ""}>${lock ? "🔒" : a}</button>`; }).join("")}</div>
    <label>${L("Рамка")}</label><div class="pfframes">${FRAMES.map(f => { const ok = f.ok();
      return `<button class="${f.id === d.frame ? "on" : ""} ${ok ? "" : "lock"}" data-act="pfFrame" data-v="${f.id}" style="--f1:${f.c1};--f2:${f.c2}"><b>${ok ? "" : "🔒 "}${f.n}</b>${ok ? "" : `<small>${L(f.need)}</small>`}</button>`; }).join("")}</div>
    <label>${L("📌 Закреплённые номера — до 3, их видят все")}</label>
    <div class="pfpins">${plates.length ? plates.map(p => `<button class="${d.pins.includes(p.id) ? "on" : ""}" data-act="pfPin" data-id="${p.id}">${plateHTML(p, "small")}</button>`).join("") : `<p class="hint">${L("Гараж пуст — купи номера, чтобы закрепить")}</p>`}</div>
    </div>
    <button class="btn green" data-act="pfSave">${L("💾 Сохранить")}</button>
    <button class="btn alt" data-act="pfCancel">${L("Отмена")}</button>`);
}
function pfSave() {
  pfSync(); const d = pfDraft; if (!d) return;
  const nick = [...d.nick.replace(/[<>]/g, "").replace(/\s+/g, " ").trim()].slice(0, 16).join("");
  if (nick && [...nick].length < 2) return toast(L("Ник — от 2 символов"));
  S.prof = { nick, bio: [...d.bio.replace(/[<>]/g, "").replace(/\s+/g, " ").trim()].slice(0, 60).join(""), ava: avaOk(d.ava) ? d.ava : "😎", frame: frameOf(d.frame).ok() ? d.frame : "base", pins: d.pins.slice(0, 3) };
  pfDraft = null; save(); sendState(); Platform.track("profile_save");
  toast(L("👤 Профиль сохранён")); fx.confetti(40); closeModal(); if (tab === "more") renderMore();
}
function pinPlate(id) {
  const i = S.prof.pins.indexOf(id);
  if (i >= 0) S.prof.pins.splice(i, 1);
  else { if (S.prof.pins.length >= 3) return toast(L("Закрепить можно до 3 номеров — открепи один в профиле")); S.prof.pins.push(id); }
  save(); sendState(); toast(i >= 0 ? L("📌 Номер откреплён") : L("📌 Номер закреплён в профиле — его видят друзья и рейтинг")); showInfo(id);
}

// ----- чужой профиль и гараж
let garageBack = null, garageWho = null, garageRel = null;   // куда вернуться: "top" | "friends" | "admin"
function openGarageOf(who, back) {
  garageBack = back || null; garageWho = who; Platform.track("garage_view");
  openModal(`<h2>${L("👤 Профиль")}</h2><p class="hint">${L("Загружаю…")}</p>`);
  Platform.garage(who).then(j => {
    if ($("modal").classList.contains("hidden")) return;
    const backBtn = garageBack ? `<button class="btn alt" data-act="garageBack">${garageBack === "top" ? L("← Рейтинг") : garageBack === "friends" ? L("← Друзья") : "← Админка"}</button>` : "";
    if (!j || !j.ok) { $("mbox").innerHTML = `<h2>${L("👤 Профиль")}</h2><p>${L("Не получилось открыть профиль — попробуй позже")}</p><div class="row">${backBtn}<button class="btn alt" data-act="closeModal">${L("Закрыть")}</button></div>`; return; }
    if (j.uid) garageWho = { uid: j.uid, top: who.top };
    garageRel = j;
    const g = j.g, prof = j.prof && !j.prof.reset ? j.prof : null;
    let h = profCardHTML({ name: j.name, prof, lvl: j.lvl, g, respect: j.respect, friends: j.friends });
    if (j.since) h += `<p class="hint" style="margin:6px 0">${L("В игре с {0}", new Date(j.since * 1000).toLocaleDateString(I18N.loc, { day: "numeric", month: "long", year: "numeric" }))}</p>`;
    if (!g) h += `<p>${L("Игрок ещё не показал гараж — он появится, когда игрок снова зайдёт в игру.")}</p>`;
    else {
      h += `<h3 style="margin:10px 0 0">${L("🏠 Гараж")}</h3>${g.tc ? `<p class="hint" style="margin:2px 0">${L("Выбито: блатных {0} · легенд {1} · суперлегенд {2}", g.tc[0] || 0, g.tc[1] || 0, g.tc[2] || 0)}</p>` : ""}
        <div class="ggrid">${(g.p || []).map(a => plateHTML(snapPlate(a), "small")).join("") || `<p class="hint">${L("Гараж пуст")}</p>`}</div>`;
      if (!j.me) { const mine = garageVal(); h += `<p class="hint">${mine >= g.v ? L("Твой гараж дороже: {0} 💰 💪", fmt(mine)) : L("Твой гараж: {0} 💰 — до этого игрока ещё {1}", fmt(mine), fmt(g.v - mine))}</p>`; }
    }
    if (!j.me) {
      h += `<button class="btn ${j.can ? "green" : "alt"}" data-act="respect" ${j.can ? "" : "disabled"}>${j.can ? L("👍 Респект гаражу") : L("👍 Респект уже поставлен сегодня")}</button>`;
      h += j.rel === "friend" ? `<div class="row"><button class="btn alt" disabled>${L("👥 Вы друзья")}</button>${j.ref ? "" : `<button class="btn alt" data-act="frRemove" data-uid="${j.uid}">${L("Удалить из друзей")}</button>`}</div>`
        : j.rel === "sent" ? `<div class="row"><button class="btn alt" disabled>${L("⏳ Заявка отправлена")}</button><button class="btn alt" data-act="frCancel" data-uid="${j.uid}">${L("Отменить")}</button></div>`
        : j.rel === "incoming" ? `<div class="row"><button class="btn green" data-act="frAccept" data-uid="${j.uid}">${L("✅ Принять в друзья")}</button><button class="btn alt" data-act="frDecline" data-uid="${j.uid}">${L("Отклонить")}</button></div>`
        : who.top != null ? `<button class="btn alt" data-act="frAddTop" data-top="${who.top}">${L("➕ Добавить в друзья")}</button>` : "";
    } else h += `<button class="btn green" data-act="profile">${L("✏️ Изменить профиль")}</button>`;
    h += `<div class="row">${backBtn}<button class="btn alt" data-act="closeModal">${L("Закрыть")}</button></div>`;
    $("mbox").innerHTML = h;
  });
}
function giveRespect(el) {
  if (!garageWho) return; el.disabled = true;
  Platform.respect(garageWho).then(j => {
    if (!j || !j.ok) { el.disabled = false; return toast(L("Не получилось — попробуй позже")); }
    el.textContent = L("👍 Респект поставлен! Всего: {0}", j.respect); fx.confetti(40); Snd.keep(); Platform.track("respect");
  });
}
// действия с дружбой: после ответа сервера — обновить то окно, где нажали
function friendAct(a, extra, el, after) {
  if (el) el.disabled = true;
  Platform.friend(a, extra).then(j => {
    if (!j) { if (el) el.disabled = false; return toast(L("Сервер не отвечает — попробуй позже")); }
    if (!j.ok) { if (el) el.disabled = false; return toast(j.error || L("Не получилось")); }
    Platform.track("friend_" + a);
    toast(j.st === "friend" ? L("🤝 Теперь вы друзья!") : j.st === "sent" ? L("📨 Заявка отправлена — друг увидит её в игре") : a === "remove" ? L("Удалён из друзей") : L("Готово"));
    if (j.st === "friend") { fx.confetti(60); Snd.keep(); }
    if (after) after(j);
  });
}
const reGarage = () => garageWho && openGarageOf(garageWho, garageBack);
function openFriends() {
  Platform.track("friends_open");
  openModal(`<h2>${L("👥 Друзья")}</h2><p class="hint">${L("Загружаю…")}</p>`);
  Platform.friends().then(j => {
    if ($("modal").classList.contains("hidden")) return;
    if (!j || !j.ok) { $("mbox").innerHTML = `<h2>${L("👥 Друзья")}</h2><p>${L("Сервер не отвечает — попробуй позже")}</p><button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`; return; }
    myCode = j.code || myCode; reqsN = j.inc.length; updateMoreDot();
    const ava = r => `<span class="fava" style="--f1:${frameOf(r.f).c1}">${escapeHTML(r.a || "😎")}</span>`;
    const inc = j.inc.map(r => `<div class="toprow"><span data-act="garageOf" data-uid="${r.uid}">${ava(r)}</span><b data-act="garageOf" data-uid="${r.uid}">${escapeHTML(r.n)}<small> · ${L("ур. {0}", r.lvl)}</small></b>
      <button class="btn sm green" data-act="frAccept" data-uid="${r.uid}" data-from="list">✅</button><button class="btn sm alt" data-act="frDecline" data-uid="${r.uid}" data-from="list">✖</button></div>`).join("");
    const rows = j.list.map(f => `<div class="toprow" data-act="garageOf" data-uid="${f.uid}">${ava(f)}<b>${escapeHTML(f.n)}<small> · ${L("ур. {0}", f.lvl)}${f.inv ? " · " + L("пригласил тебя") : f.mine ? " · " + L("по твоей ссылке") : ""}</small></b><i>${f.v ? fmt(f.v) + " 💰" : ""}</i><em>›</em></div>`).join("");
    $("mbox").innerHTML = `<h2>${L("👥 Друзья")} <small>${j.list.length}</small></h2>
      <div class="card fcode"><small>${L("Твой код друга")}</small><b>${escapeHTML(myCode)}</b>
        <div class="row"><button class="btn sm alt" data-act="frCopy">${L("📋 Копировать")}</button><button class="btn sm green" data-act="invite">${L("📤 Позвать")}</button></div>
        <small>${L("Друг вводит твой код — или просто открывает игру по твоей ссылке, и вы сразу друзья")}</small></div>
      <div class="admsearch"><input id="frCode" maxlength="8" placeholder="${L("Код друга")}" style="text-transform:uppercase"><button class="btn sm green" data-act="frAdd">${L("➕ Добавить")}</button></div>
      ${inc ? `<h3>${L("📨 Заявки в друзья")}</h3><div class="card toplist">${inc}</div>` : ""}
      ${j.out ? `<p class="hint">${L("Твоих заявок ждут ответа: {0}", j.out)}</p>` : ""}
      ${rows ? `<h3>${L("Мои друзья")}</h3><div class="card toplist">${rows}</div>` : `<p class="hint">${L("Пока никого. Добавь друга по коду или позови по ссылке — новичок сразу получит блатной номер.")}</p>`}
      <button class="btn alt" data-act="garageOf" data-me="1">${L("👤 Как мой профиль видят другие")}</button>
      <button class="btn alt" data-act="closeModal">${L("Закрыть")}</button>`;
  });
}
let myUid = 0;
// событие из админки: показываем плашку и сообщаем один раз
function setEvent(e) {
  const was = evOn() ? EV.until : 0; EV = e || null;
  if (evOn() && EV.until !== was) { toast("🎉 " + (EV.text || L("Событие!")) + " — " + evText()); vignette("#ffd23f"); }
  renderPills(); renderHeader();
}
const evText = () => [EV.inc > 1 ? L("доход ×{0}", EV.inc) : "", EV.luck > 1 ? L("удача ×{0}", EV.luck) : ""].filter(Boolean).join(" · ");
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ----- задания дня (все площадки): 3 задания из списка, прогресс — по счётчикам игры с начала дня, за все три — сундук с блатным
const QUESTS = [
  { k: "buy", n: [15, 25, 40], t: "Купи бланков: {0}", s: () => S.bought },
  { k: "merge", n: [2, 3, 5], t: "Сделай слияний: {0}", s: () => S.merges },
  { k: "taxi", n: [10, 20, 30], t: "Потаксуй {0} раз", s: () => S.taxis },
  { k: "sell", n: [5, 10, 20], t: "Продай номеров: {0}", s: () => S.sold },
  { k: "forge", n: [1, 2, 3], t: "Рискни в тюнинге {0} раз", s: () => S.forge.tries },
  { k: "order", n: [1, 2, 3], t: "Выполни заказов: {0}", s: () => S.ordersDone, ok: () => ordersOpen() },
  { k: "mini", n: [1, 2], t: "Сыграй в «Поймай номер» {0} раз", s: () => S.mini.plays, ok: () => S.lvl >= 4 }
];
const questsOn = () => S.tut === -1 && S.drawn > 0;
function ensureQuests() {
  if (S.quests.day === todayStr()) return;
  const pool = QUESTS.filter(q => !q.ok || q.ok()).sort(() => Math.random() - 0.5).slice(0, 3);
  S.quests = { day: todayStr(), chest: 0, list: pool.map(q => ({ k: q.k, n: q.n[Math.floor(Math.random() * q.n.length)], base: q.s(), got: 0, nt: 0 })) };
  save();
}
const qDef = q => QUESTS.find(x => x.k === q.k);
const qProg = q => Math.min(q.n, Math.max(0, qDef(q).s() - q.base));
const questReward = () => Math.max(300, Math.round(income() * 600 / 10) * 10);   // ~10 минут дохода
const questsReady = () => questsOn() && S.quests.day === todayStr() ? S.quests.list.filter(q => !q.got && qProg(q) >= q.n).length + (S.quests.list.length && S.quests.list.every(q => q.got) && !S.quests.chest ? 1 : 0) : 0;
function questsTick() {                               // раз в 5 секунд: новый день — новые задания; выполнено — одна подсказка
  if (!questsOn()) return;
  ensureQuests();
  for (const q of S.quests.list) if (!q.nt && !q.got && qProg(q) >= q.n) { q.nt = 1; toast(L("📅 Задание выполнено — награда во вкладке «Ещё»")); Platform.track("quest_done"); }
  updateMoreDot();
}
function questsHTML() {
  if (!questsOn()) return "";
  ensureQuests();
  const all = S.quests.list.every(q => q.got);
  return `<div class="card quests"><h3>${L("📅 Задания дня")} <small>${L("обновятся завтра")}</small></h3>` +
    S.quests.list.map((q, i) => { const p = qProg(q), done = p >= q.n;
      return `<div class="qrow"><div><b>${L(qDef(q).t, q.n)}</b><div class="bar"><i style="width:${p / q.n * 100}%"></i></div><small>${p}/${q.n}</small></div>
        ${q.got ? "✅" : `<button class="btn sm ${done ? "green ready" : "alt"}" data-act="questClaim" data-i="${i}" ${done ? "" : "disabled"}>+${fmt(questReward())}</button>`}</div>`; }).join("") +
    `<div class="qrow chest"><div><b>${L("🧰 Сундук за все три задания")}</b><small>${L("блатной номер в гараж")}</small></div>
      ${S.quests.chest ? "✅" : `<button class="btn sm ${all ? "green ready" : "alt"}" data-act="questChest" ${all ? "" : "disabled"}>${L("Открыть")}</button>`}</div></div>`;
}
function questClaim(i) {
  const q = S.quests.list[i]; if (!q || q.got || qProg(q) < q.n) return;
  q.got = 1; const v = questReward(); gain(v); toast(L("📅 Задание: +{0} 💰", fmt(v))); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 12);
  save(); renderMore(); renderHeader(); updateMoreDot();
}
function questChest() {
  if (S.quests.chest || !S.quests.list.length || !S.quests.list.every(q => q.got)) return;
  S.quests.chest = 1; const p = makePlate(3); markFound(p); keepPlate(p); jackpot(p); Platform.track("quest_chest");
  save(); renderMore(); updateMoreDot();
}

// ----- админка (только владелец): кнопка видна, если сервер в hello ответил admin; все данные отдаёт /api/admin, который проверяет ID.
// Тексты без L(): админка только для владельца, на русском.
let isAdmin = false, admTab = "stats";
const ADM_TABS = [["stats", "📊 Сводка"], ["ret", "📈 Удержание"], ["sales", "⭐ Покупки"], ["players", "👥 Игроки"], ["promo", "🎉 Акции"], ["mail", "📢 Рассылка"], ["cheats", "🧪 Читы"]];
let admQ = "";                                         // последний поиск игроков — чтобы вернуться к нему из чужого гаража
const ITEM_NAME = { starter: "Набор новичка", cash_s: "Пачка денег", blat: "Блатной номер", cash_l: "Чемодан денег", legend: "Легенда", x2: "Доход ×2 навсегда" };
const SRC_COLOR = ["#ffd23f", "#4fc3f7", "#43c76b", "#e0475b", "#b388ff", "#ff9a3c", "#8d99b3", "#f48fb1"];
const admDate = s => { const d = new Date(s * 1000); return d.toLocaleDateString("ru", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }); };
const admAgo = s => { const m = Math.floor((Date.now() / 1000 - s) / 60); return m < 2 ? "сейчас" : m < 60 ? m + " мин назад" : m < 1440 ? Math.floor(m / 60) + " ч назад" : Math.floor(m / 1440) + " д назад"; };
const admBody = h => { const el = $("admBody"); if (el) el.innerHTML = h; };
const admFail = j => admBody(`<p>❌ ${escapeHTML((j && j.error) || "Сервер не отвечает — попробуй ещё раз")}</p>`);
function openAdmin(t) {
  if (t) admTab = t;
  openModal(`<h2>🛠 Админка</h2><div class="admtabs">${ADM_TABS.map(([k, n]) => `<button class="btn sm ${k === admTab ? "green" : "alt"}" data-act="admTab" data-t="${k}">${n}</button>`).join("")}</div>
    <div id="admBody" class="adm"><p class="hint">Загружаю…</p></div><button class="btn alt" data-act="closeModal">Закрыть</button>`);
  if (admTab === "cheats") return admBody(admCheatsHTML());
  if (admTab === "mail") return admBody(admMailHTML());
  if (admTab === "players") return admPlayers(admQ);
  if (admTab === "promo") return admPromo();
  const want = admTab;
  Platform.admin(want).then(j => { if (admTab !== want) return; !j || !j.ok ? admFail(j) : admBody(want === "stats" ? admStatsHTML(j) : want === "ret" ? admRetHTML(j) : admSalesHTML(j.list)); });
}
function admStatsHTML(j) {
  const p = j.p, s = j.s, kpi = (v, n) => `<div class="kpi"><b>${fmt(v || 0)}</b><small>${n}</small></div>`;
  // новые игроки по дням (14 дней), столбики разбиты по источникам
  const srcs = [...new Set(j.days.map(r => r.s))], col = k => SRC_COLOR[srcs.indexOf(k) % SRC_COLOR.length];
  const days = []; for (let d = j.today - 13; d <= j.today; d++) days.push(d);
  const per = d => j.days.filter(r => r.d === d), tot = d => per(d).reduce((a, r) => a + r.c, 0), max = Math.max(1, ...days.map(tot));
  const st = d => (j.stars.find(r => r.d === d) || {}).st || 0;
  const label = d => new Date(d * 864e5).toLocaleDateString("ru", { day: "numeric", month: "numeric", timeZone: "UTC" });
  const chart = `<div class="chart">${days.map(d => `<div class="col" title="${label(d)}: ${tot(d)}"><i class="num">${tot(d) || ""}</i><div class="stack" style="height:${tot(d) / max * 100}%">${per(d).map(r => `<span style="flex:${r.c};background:${col(r.s)}"></span>`).join("")}</div><small>${label(d).split(".")[0]}</small>${st(d) ? `<em>⭐${st(d)}</em>` : ""}</div>`).join("")}</div>
    <div class="legend">${srcs.map(k => `<span><i style="background:${col(k)}"></i>${escapeHTML(k)}</span>`).join("") || "<small>новых игроков за 2 недели нет</small>"}</div>`;
  const totalSrc = j.src.reduce((a, r) => a + r.c, 0) || 1;
  return `<div class="kpis">${kpi(p.n, "игроков всего")}${kpi(p.fresh, "новых сегодня")}${kpi(p.act, "заходили сегодня")}${kpi(p.act7, "заходили за 7 дней")}${kpi(p.sub, "подписаны на канал")}${kpi(p.cw, "получают напоминания")}${kpi(s.st, "⭐ заработано")}${kpi(s.today, "⭐ сегодня")}${kpi(s.payers, "платящих игроков")}</div>
    <h3>Новые игроки за 2 недели</h3>${chart}
    <h3>Откуда пришли</h3>${j.src.map(r => `<div class="admrow"><span>${escapeHTML(r.s)}</span><b>${r.c}</b><small>${Math.round(r.c / totalSrc * 100)}%</small></div>`).join("")}
    <h3>Что покупают</h3>${j.items.map(r => `<div class="admrow"><span>${ITEM_NAME[r.item] || r.item}</span><b>${r.c} шт.</b><small>⭐ ${r.st}</small></div>`).join("") || "<p class='hint'>Покупок пока нет</p>"}
    <h3>🏆 Неделя</h3>${j.top.map((r, i) => `<div class="admrow"><span>${i + 1}. ${escapeHTML(r.name || "?")}</span><b>${fmt(r.sc)} 💰</b></div>`).join("") || "<p class='hint'>Пока пусто</p>"}
    <h3>🐋 Больше всех заплатили</h3>${(j.whales || []).map((r, i) => `<div class="admrow"><span>${i + 1}. ${escapeHTML(r.name || "?")}${r.username ? " @" + escapeHTML(r.username) : ""}</span><b>⭐ ${r.st}</b><small>${r.c} пок.</small></div>`).join("") || "<p class='hint'>Пока никого</p>"}
    <h3>💰 Богачи за всё время</h3>${(j.rich || []).map((r, i) => `<div class="admrow"><span>${i + 1}. ${escapeHTML(r.name || "?")}</span><b>${fmt(r.earned)} 💰</b><small>ур. ${r.lvl || 0}</small></div>`).join("")}
    ${j.ev ? `<p class="hint">🎉 Идёт событие «${escapeHTML(j.ev.text || "без названия")}»: доход ×${j.ev.inc}, удача ×${j.ev.luck}, до ${admDate(j.ev.until)}</p>` : ""}
    ${j.outbox ? `<p class="hint">📢 В очереди рассылки: ${j.outbox}</p>` : ""}`;
}
// удержание: когорты по дню прихода (D1/D3/D7), активные по дням, на каком уровне бросают, качество источников
function admRetHTML(j) {
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0, kpi = (v, n) => `<div class="kpi"><b>${v}</b><small>${n}</small></div>`;
  const heat = v => `background:rgba(67,199,107,${Math.min(0.85, v / 100 * 1.6 + 0.06).toFixed(2)})`;
  const label = d => new Date(d * 864e5).toLocaleDateString("ru", { day: "numeric", month: "numeric", timeZone: "UTC" });
  const a = j.avg || {}, K = [1, 3, 7], valid = (c, k) => c + k <= j.today && j.since != null && c + k >= j.since;
  const rn = (c, k) => (j.ret.find(x => x.c === c && x.k === k) || {}).n || 0;
  const avgK = k => { let s = 0, n = 0; j.coh.forEach(r => { if (valid(r.c, k) && r.c + k < j.today) { s += rn(r.c, k); n += r.n; } }); return n ? pct(s, n) + "%" : "—"; };
  let h = `<div class="kpis">${kpi(a.n || 0, "игроков")}${kpi(pct(a.back, a.n) + "%", "вернулись хоть раз")}${kpi(avgK(1), "D1 (на 2-й день)")}${kpi(avgK(3), "D3")}${kpi(avgK(7), "D7")}${kpi(a.v || 0, "заходов в среднем")}</div>`;
  const days = []; for (let c = j.today; c >= j.today - 13; c--) days.push(c);
  h += `<h3>Когорты: кто вернулся</h3><div class="rettable"><table><tr><th>Пришли</th><th>Новых</th><th>Вернулись</th>${K.map(k => `<th>D${k}</th>`).join("")}</tr>` +
    days.map(c => { const r = j.coh.find(x => x.c === c) || { n: 0, back: 0 }; if (!r.n) return `<tr class="na"><td>${label(c)}</td><td>0</td><td></td>${K.map(() => "<td></td>").join("")}</tr>`;
      const b = pct(r.back, r.n);
      return `<tr><td>${label(c)}</td><td>${r.n}</td><td style="${heat(b)}">${b}%</td>${K.map(k => valid(c, k) ? `<td style="${heat(pct(rn(c, k), r.n))}">${pct(rn(c, k), r.n)}%</td>` : `<td class="na">—</td>`).join("")}</tr>`; }).join("") + `</table></div>
    <p class="hint">D1 — зашли на следующий день после прихода, D3 — на 3-й, D7 — на 7-й. Точный учёт по дням идёт ${j.since != null ? "с " + label(j.since) : "с сегодняшнего дня"}, поэтому у старых дней там «—». «Вернулись» — заходили хоть раз позже дня прихода.</p>`;
  const dmax = Math.max(1, ...j.dau.map(r => r.n)), dd = []; for (let d = j.today - 13; d <= j.today; d++) dd.push(d);
  h += `<h3>Сколько игроков заходит в день</h3><div class="chart">${dd.map(d => { const n = (j.dau.find(r => r.d === d) || {}).n || 0;
    return `<div class="col" title="${label(d)}: ${n}"><i class="num">${n || ""}</i><div class="stack" style="height:${n / dmax * 100}%"><span style="flex:1;background:#4fc3f7"></span></div><small>${label(d).split(".")[0]}</small></div>`; }).join("")}</div>`;
  const lmax = Math.max(1, ...j.lv.map(r => r.n));
  h += `<h3>На каком уровне бросают</h3>${j.lv.map(r => `<div class="lvrow"><span>${r.l >= 15 ? "15+" : r.l}</span><div class="lvbar"><i style="width:${r.n / lmax * 100}%"></i><b style="width:${r.gone / lmax * 100}%"></b></div><small>${r.n} · ушли ${pct(r.gone, r.n)}%</small></div>`).join("")}
    <p class="hint">Синее — все игроки на этом уровне, красное — не заходили 3+ дня. Где красного больше всего — там игре не хватает интереса. Уровень 0 — игра ещё не прислала уровень (обычно ушли в первые минуты).</p>`;
  h += `<h3>Какие источники приводят живых игроков</h3><div class="rettable"><table><tr><th>Откуда</th><th>Игроков</th><th>Вернулись</th><th>Актив. 7 д</th><th>Ср. ур.</th><th>Платят</th></tr>` +
    j.bySrc.map(r => `<tr><td>${escapeHTML(r.s)}</td><td>${r.n}</td><td style="${heat(pct(r.back, r.n))}">${pct(r.back, r.n)}%</td><td>${r.act7 || 0}</td><td>${r.lvl || 0}</td><td>${r.pay || 0}</td></tr>`).join("") + `</table></div>`;
  return h;
}
function admSalesHTML(list) {
  if (!list.length) return `<p class="hint">Покупок пока нет</p>`;
  return list.map(r => `<div class="admrow sale"><div><b>${ITEM_NAME[r.item] || r.item} · ⭐ ${r.stars}</b><small>${admDate(r.at)} · ${escapeHTML(r.name || "?")}${r.username ? " @" + escapeHTML(r.username) : ""}</small></div>
    ${r.refunded ? `<small>возвращено</small>` : `<button class="btn sm alt" data-act="admRefund" data-id="${escapeHTML(r.id)}">Вернуть</button>`}</div>`).join("");
}
const ADM_QUICK = [["cash_s", "💵 Пачка"], ["cash_l", "💼 Чемодан"], ["tier_1", "Красивый"], ["tier_2", "Редкий"], ["blat", "🚘 Блатной"], ["legend", "👑 Легенда"], ["tier_5", "💎 Суперлегенда"], ["x2", "×2 навсегда"]];
function admPlayerPanel(r) {
  const id = r.id, btn = (act, txt, extra = "") => `<button class="btn sm alt" data-act="${act}" data-uid="${id}" ${extra}>${txt}</button>`;
  return `<div class="gifts hidden" id="gifts-${id}">
    <div class="admgift">${ADM_QUICK.map(([k, n]) => btn("admGift", n, `data-item="${k}"`)).join("")}</div>
    <div class="admline"><input id="gc-${id}" type="number" min="1" placeholder="Монеты, напр. 1000000">${btn("admGiftIn", "💰 Выдать", 'data-kind="coins"')}</div>
    <div class="admline"><input id="gp-${id}" placeholder="Номер, напр. А777АА 77">${btn("admGiftIn", "🚘 Выдать", 'data-kind="plate"')}</div>
    <div class="admline"><input id="gs-${id}" type="number" min="1" placeholder="Связи ⭐ (+10% дохода каждая)">${btn("admGiftIn", "⭐ Выдать", 'data-kind="pts"')}</div>
    <div class="admline"><input id="gb-${id}" type="number" min="1" placeholder="Доход ×2 — на сколько часов">${btn("admGiftIn", "🔥 Выдать", 'data-kind="buff"')}</div>
    <div class="admline"><span>Штук:</span><input id="gn-${id}" type="number" min="1" max="20" value="1" style="max-width:70px"><label class="chk"><input type="checkbox" id="gm-${id}" checked> сообщить в боте</label></div>
    <input id="gt-${id}" placeholder="Подпись к подарку (необязательно)">
    <textarea id="gw-${id}" rows="2" placeholder="Личное сообщение игроку от бота"></textarea>
    <div class="admgift">${btn("admMsg", "✉️ Написать")}${btn("garageOf", "🏠 Гараж", 'data-back="admin"')}${btn("admBan", r.banned ? "✅ Вернуть в рейтинг" : "🚫 Убрать из рейтинга", `data-on="${r.banned ? 0 : 1}"`)}${r.nick ? btn("admUnnick", "✏️ Сбросить ник") : ""}</div>
    <small>ID ${id}${r.fcode ? " · код " + escapeHTML(r.fcode) : ""} · друзей ${r.friends || 0} · с нами с ${admDate(r.first_seen)} · заработал ${fmt(r.earned || 0)} 💰 · 👍 ${r.respect || 0}${r.garage_at ? " · гараж обновлён " + admAgo(r.garage_at) : ""}</small></div>`;
}
// номер из текста админа: латиница → кириллица (A→А…), «А777АА 77», «а777аа77 rus» → { l1, d, l23, reg }
const LAT2CYR = { A: "А", B: "В", E: "Е", K: "К", M: "М", H: "Н", O: "О", P: "Р", C: "С", T: "Т", Y: "У", X: "Х" };
function parsePlate(s) {
  s = String(s || "").toUpperCase().replace(/[\s|_.-]/g, "").replace(/RUS$/, "").replace(/[ABEKMHOPCTYX]/g, c => LAT2CYR[c]);
  const m = /^([АВЕКМНОРСТУХ])(\d{3})([АВЕКМНОРСТУХ]{2})(\d{2,3})$/.exec(s);
  return m ? { l1: m[1], d: m[2], l23: m[3], reg: m[4] } : null;
}
function customPlate(p, tier) {                        // номер по заказу: редкость по правилам игры (или заданная)
  const t = tier >= 0 && tier <= TOP ? tier : classify(p);
  return { id: S.nid++, l1: p.l1, d: p.d, l23: p.l23, reg: p.reg, tier: t, val: TIERS[t].val, got: Date.now() };
}
function admGiftSend(uid, item, el) {
  const v = id => (($(id + uid) || {}).value || "").trim();
  el.disabled = true;
  Platform.admin("gift", { uid, item, n: +v("gn-") || 1, note: ($("gm-" + uid) || {}).checked ? 1 : 0, text: v("gt-") }).then(j => {
    toast(j && j.ok ? "🎁 " + j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); el.disabled = false;
  });
}
function admPromo() {
  const opt = (a, sel) => a.map(([v, n]) => `<option value="${v}" ${v === sel ? "selected" : ""}>${n}</option>`).join("");
  admBody(`<div id="admEv" class="card"><p class="hint">Загружаю…</p></div>
    <h3>🎉 Событие для всех игроков</h3>
    <div class="admline"><span>Доход ×</span><select id="evInc">${opt([["1", "1"], ["1.5", "1.5"], ["2", "2"], ["3", "3"], ["5", "5"]], "2")}</select><span>Удача ×</span><select id="evLuck">${opt([["1", "1"], ["1.5", "1.5"], ["2", "2"], ["3", "3"], ["5", "5"]], "1")}</select></div>
    <div class="admline"><span>Часов:</span><input id="evH" type="number" min="1" max="168" value="24" style="max-width:80px"><input id="evT" placeholder="Название: Выходные блатных"></div>
    <button class="btn green" data-act="admEvent">🎉 Включить событие</button>
    <button class="btn alt" data-act="admEventOff">⏹ Выключить событие</button>
    <p class="hint">Удача повышает шанс красивых, редких и блатных номеров. Игроки увидят плашку сверху в течение пары минут. Рассказать о событии всем можно во вкладке «📢 Рассылка».</p>
    <h3>🎁 Подарок всем игрокам</h3>
    <select id="gaItem">${opt([["cash_s", "💵 Пачка денег (30 мин дохода)"], ["cash_l", "💼 Чемодан денег (3 ч дохода)"], ["blat", "🚘 Блатной номер"], ["legend", "👑 Легенда"], ["tier_5", "💎 Суперлегенда"], ["x2", "×2 доход навсегда"], ["coins", "💰 Монеты — сколько укажешь"], ["buff", "🔥 Доход ×2 на N часов"], ["pts", "⭐ Связи — сколько укажешь"]], "cash_s")}</select>
    <input id="gaVal" type="number" min="1" placeholder="Сколько (для монет, часов, связей)">
    <div class="admline"><span>Кому:</span><select id="gaDays">${opt([["1", "заходили за сутки"], ["7", "за 7 дней"], ["30", "за 30 дней"], ["0", "всем игрокам"]], "7")}</select></div>
    <label class="admline chk"><input type="checkbox" id="gaNote" checked> написать от бота (тем, кто разрешил)</label>
    <input id="gaText" placeholder="Подпись (необязательно): Спасибо, что играете!">
    <button class="btn red" data-act="admGiftAll">🎁 Подарить всем</button>`);
  Platform.admin("ev").then(j => { const el = $("admEv"); if (!el) return;
    el.innerHTML = !j || !j.ok ? "<p>❌ Сервер не отвечает</p>" : j.ev ? `<b>🎉 Сейчас идёт: «${escapeHTML(j.ev.text || "без названия")}»</b><p>Доход ×${j.ev.inc} · удача ×${j.ev.luck} · до ${admDate(j.ev.until)}</p>` : "<p>Сейчас событий нет</p>"; });
}
function admPlayers(q) {
  admQ = q;
  admBody(`<div class="admsearch"><input id="admQ" placeholder="Имя, @ник или ID" value="${escapeHTML(q)}"><button class="btn sm green" data-act="admSearch">Найти</button></div><div id="admList"><p class="hint">Загружаю…</p></div>`);
  Platform.admin("players", { q }).then(j => {
    const el = $("admList"); if (!el) return;
    if (!j || !j.ok) { el.innerHTML = `<p>❌ ${escapeHTML((j && j.error) || "Сервер не отвечает")}</p>`; return; }
    el.innerHTML = j.list.length ? j.list.map(r => `<div class="admrow player" data-act="admPlayer" data-uid="${r.id}"><div><b>${r.nick ? "«" + escapeHTML(r.nick) + "» " : ""}${escapeHTML(r.name || "?")}${r.username ? ` <small>@${escapeHTML(r.username)}</small>` : ""}</b>
      <small>ур. ${r.lvl || 0} · ${escapeHTML(r.src)} · заходов ${r.visits} · ${admAgo(r.last_seen)}${r.paid ? ` · ⭐ ${r.paid}` : ""}${r.invited ? ` · позвал ${r.invited}` : ""}${r.sub_tg ? " · ✅ канал" : ""}${r.can_write ? " · 🔔" : ""}${r.banned ? " · 🚫 вне рейтинга" : ""}</small></div><span>⚙️</span></div>
      ${admPlayerPanel(r)}`).join("") : `<p class="hint">Никого не нашёл</p>`;
  });
}
function admMailHTML() {
  return `<p class="hint">Сообщение от бота всем, кто разрешил ему писать. С кнопкой, которая открывает игру. Сначала отправь себе и посмотри, как выглядит.</p>
    <textarea id="admText" rows="6" placeholder="Например: 🔥 В выходные шанс легенды ×2! Залетай 👇"></textarea>
    <input id="admBtn" value="🎮 Играть" placeholder="Текст кнопки">
    <button class="btn alt" data-act="admSend" data-mode="test">👀 Отправить себе</button>
    <button class="btn red" data-act="admSend" data-mode="broadcast">📢 Разослать всем</button>
    <p class="hint">Первые 40 сообщений уходят сразу, остальные — по 15 каждые 10 минут, с 10:00 до 22:00 по Москве.</p>`;
}
const CHEATS = [
  ["money", "💰 +1 млн (не идёт в рейтинг)"], ["income", "💰 +1 час дохода"], ["t2", "🎫 Редкий номер"], ["t3", "🚘 Блатной номер"], ["t4", "👑 Легенда"], ["t5", "💎 Суперлегенда"],
  ["lvl", "⭐ +1 уровень"], ["quests", "📅 Новые задания дня"], ["starter", "🎁 Снова показать набор новичка"], ["subs", "📢 Сбросить бонусы подписки"], ["mini", "🎣 Сбросить перезарядку мини-игры"],
  ["maxup", "📈 Все апгрейды на максимум"], ["noup", "📉 Сбросить апгрейды"], ["buff", "🔥 Доход ×2 на час"], ["x2", "⭐ ×2 навсегда: вкл/выкл"],
  ["album", "📒 Заполнить альбом (без наград)"], ["albumReset", "📒 Очистить альбом"], ["daily", "🎁 Снова дать ежедневный бонус"], ["clear", "🗑 Очистить гараж"]
];
function admCheatsHTML() {
  return `<p class="hint">Действуют только на твой прогресс — чтобы проверять игру. Деньги из читов не попадают в рейтинг недели.</p>
    <div class="admline"><input id="chC" type="number" min="1" placeholder="Сколько монет"><button class="btn sm green" data-act="admCheatIn" data-k="coins">💰 Добавить</button></div>
    <div class="admline"><input id="chP" placeholder="Номер, напр. А777АА 77"><select id="chT"><option value="-1">редкость сама</option>${TIERS.map((t, i) => `<option value="${i}">${t.name}</option>`).join("")}</select><button class="btn sm green" data-act="admCheatIn" data-k="plate">🚘</button></div>
    <div class="admline"><input id="chL" type="number" min="1" placeholder="Уровень"><button class="btn sm alt" data-act="admCheatIn" data-k="lvl">Поставить</button><input id="chS" type="number" min="0" placeholder="⭐ связей"><button class="btn sm alt" data-act="admCheatIn" data-k="pts">Поставить</button></div>
    <div class="cheats">${CHEATS.map(([k, n]) => `<button class="btn sm alt" data-act="admCheat" data-k="${k}">${n}</button>`).join("")}</div>
    <p class="hint">Подарить себе что-то «по-настоящему» (через сервер, как игроку) — найди себя во вкладке «👥 Игроки».</p>`;
}
function admCheatIn(k) {
  const v = id => (($(id) || {}).value || "").trim();
  if (k === "plate") {
    const p = parsePlate(v("chP")); if (!p) return toast("Номер не понял. Пример: А777АА 77 (буквы А В Е К М Н О Р С Т У Х)");
    const r = customPlate(p, +v("chT")); markFound(r); keepPlate(r); closeModal(); if (r.tier >= 3) jackpot(r); else toast(`🚘 ${r.l1}${r.d}${r.l23} ${r.reg} — ${TIERS[r.tier].name}`);
  } else {
    const n = Math.floor(+v({ coins: "chC", lvl: "chL", pts: "chS" }[k])); if (!(n >= 0) || (k !== "pts" && n < 1)) return toast("Введи число");
    if (k === "coins") S.coins += n; else if (k === "lvl") { S.lvl = Math.min(500, n); S.xp = 0; ensureOrders(); syncNav(); } else S.pts = Math.min(999, n);
    toast("🧪 Готово");
  }
  save(); renderAll();
}
function admCheat(k) {
  if (k === "maxup") UPS.forEach(u => S.up[u.id] = u.max);
  else if (k === "noup") S.up = {};
  else if (k === "buff") S.buffUntil = Math.max(S.buffUntil, Date.now()) + 3600000;
  else if (k === "x2") S.paid.x2 = S.paid.x2 ? 0 : 1;
  else if (k === "album") ALBUM.forEach(pg => pg.k.forEach(x => S.album.got[x] = 1));
  else if (k === "albumReset") S.album = fresh().album;
  else if (k === "daily") { S.daily.last = yesterdayStr(); setTimeout(checkDaily, 300); }
  else if (k === "clear") S.plates = [];
  else if (k === "money") S.coins += 1e6;
  else if (k === "income") S.coins += Math.max(1000, income() * 3600);
  else if (/^t\d$/.test(k)) { const p = makePlate(+k[1]); markFound(p); keepPlate(p); closeModal(); if (p.tier >= 3) jackpot(p); }
  else if (k === "lvl") { S.lvl++; S.xp = 0; }
  else if (k === "quests") S.quests.day = "";
  else if (k === "starter") { S.paid.starter = 0; S.paid.starterUntil = 0; }
  else if (k === "subs") S.subs = Object.assign(fresh().subs, { notif: S.subs.notif });
  else if (k === "mini") S.mini.next = 0;
  toast("🧪 Готово"); save(); renderAll();
}
// ===================== ДЕЛЕГИРОВАНИЕ КЛИКОВ =====================
const ACTS = {
  buy: d => buy(d.pack), buy10: d => buyMany(d.pack),
  sellPending: () => resolvePending(true), keepPending: () => resolvePending(false),
  subGo: d => subGo(d.k),
  shop: () => openShop(), shopBuy: d => shopBuy(d.k),
  admin: () => openAdmin(), admTab: d => openAdmin(d.t), admCheat: d => admCheat(d.k),
  admSearch: () => admPlayers(($("admQ") || {}).value || ""),
  admPlayer: d => { const g = $("gifts-" + d.uid); if (g) g.classList.toggle("hidden"); },
  admGift: (d, e, el) => admGiftSend(+d.uid, d.item, el),
  admGiftIn: (d, e, el) => {                           // подарок с полем ввода: монеты, номер, связи, часы ×2
    const uid = +d.uid, v = (($({ coins: "gc-", plate: "gp-", pts: "gs-", buff: "gb-" }[d.kind] + uid) || {}).value || "").trim();
    if (d.kind === "plate") { const p = parsePlate(v); if (!p) return toast("Номер не понял. Пример: А777АА 77"); return admGiftSend(uid, `plate_${p.l1}${p.d}${p.l23}_${p.reg}`, el); }
    const n = Math.floor(+v); if (!(n >= 1)) return toast("Введи число");
    admGiftSend(uid, d.kind + "_" + Math.min(n, d.kind === "coins" ? 1e15 : d.kind === "pts" ? 999 : 720), el);
  },
  admMsg: (d, e, el) => {
    const text = (($("gw-" + d.uid) || {}).value || "").trim(); if (!text) return toast("Напиши текст сообщения");
    el.disabled = true; Platform.admin("msg", { uid: +d.uid, text }).then(j => { toast(j && j.ok ? "✉️ " + j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); el.disabled = false; });
  },
  admBan: (d, e, el) => { el.disabled = true; Platform.admin("ban", { uid: +d.uid, on: +d.on }).then(j => { toast(j && j.ok ? j.msg : "❌ сервер не отвечает"); if (j && j.ok) admPlayers(admQ); }); },
  admCheatIn: d => admCheatIn(d.k),
  admUnnick: (d, e, el) => { el.disabled = true; Platform.admin("unnick", { uid: +d.uid }).then(j => { toast(j && j.ok ? j.msg : "❌ сервер не отвечает"); if (j && j.ok) admPlayers(admQ); }); },
  admEvent: (d, e, el) => {
    const v = id => ($(id) || {}).value;
    el.disabled = true; Platform.admin("event", { inc: +v("evInc"), luck: +v("evLuck"), hours: +v("evH"), text: (v("evT") || "").trim() }).then(j => { toast(j && j.ok ? "🎉 " + j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); el.disabled = false; if (j && j.ok) { claimPaid(1); admPromo(); } });
  },
  admEventOff: (d, e, el) => { el.disabled = true; Platform.admin("event", { off: 1 }).then(j => { toast(j && j.ok ? j.msg : "❌ сервер не отвечает"); EV = null; renderPills(); renderHeader(); admPromo(); }); },
  admGiftAll: (d, e, el) => {                          // подарок всем — со второго нажатия
    const v = id => (($(id) || {}).value || "").trim(); let item = v("gaItem");
    if (["coins", "buff", "pts"].includes(item)) { const n = Math.floor(+v("gaVal")); if (!(n >= 1)) return toast("Укажи, сколько"); item += "_" + Math.min(n, item === "coins" ? 1e15 : item === "pts" ? 999 : 720); }
    if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = "Точно подарить ВСЕМ? Нажми ещё раз"; return; }
    el.disabled = true; Platform.admin("giftall", { item, days: +v("gaDays"), note: ($("gaNote") || {}).checked ? 1 : 0, text: v("gaText") }).then(j => {
      toast(j && j.ok ? "🎁 " + j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); el.disabled = false; delete el.dataset.sure; el.textContent = "🎁 Подарить всем"; });
  },
  album: d => openAlbum(d.p), albumClaim: d => albumClaim(d.p, +d.s),
  garageOf: d => d.top != null ? openGarageOf({ top: +d.top }, "top") : d.me ? openGarageOf({ uid: myUid }, "friends") : openGarageOf({ uid: +d.uid }, d.back || "friends"),
  garageBack: () => garageBack === "top" ? openTop() : garageBack === "admin" ? openAdmin("players") : openFriends(),
  respect: (d, e, el) => giveRespect(el), friends: () => openFriends(),
  lockPlate: d => { const p = S.plates.find(x => x.id === +d.id); if (!p) return; if (!p.lock && S.prof.pins.includes(p.id)) return toast(L("Номер закреплён в профиле — он и так под защитой"));
    p.lock = !p.lock; if (!p.lock) delete p.wish; Snd.keep(); toast(p.lock ? L("🔒 Под замком: не сольётся и не продастся") : L("🔓 Замок снят")); save();
    if (d.info) showInfo(p.id); else if (tab === "garage") renderGarage(); renderMergeBar(); },
  botOpen: d => openBot(d.sec), botSet: d => { if (d.k === "on") S.bot.on = !S.bot.on; else S.bot[d.k] = d.v; save(); openBot(); },
  wishAdd: () => wishAdd(), wishDel: d => { S.bot.wish.splice(+d.i, 1); save(); openBot("wish"); },
  profile: () => { pfDraft = null; openProfile(); }, pfCancel: () => { pfDraft = null; closeModal(); }, pfSave: () => pfSave(),
  pfAva: d => { pfSync(); if (!avaOk(d.v)) { const x = AVAS.find(v => Array.isArray(v) && v[0] === d.v); return toast(L("🔒 Откроется: {0}", x ? L(x[2]) : "")); } pfDraft.ava = d.v; openProfile(); },
  pfFrame: d => { pfSync(); const f = frameOf(d.v); if (!f.ok()) return toast(L("🔒 Рамка «{0}» откроется: {1}", f.n, L(f.need))); pfDraft.frame = f.id; openProfile(); },
  pfPin: d => { pfSync(); const id = +d.id, i = pfDraft.pins.indexOf(id); if (i >= 0) pfDraft.pins.splice(i, 1); else if (pfDraft.pins.length >= 3) return toast(L("Не больше 3 номеров — сначала открепи один")); else pfDraft.pins.push(id); openProfile(); },
  pinPlate: d => pinPlate(+d.id),
  frAdd: (d, e, el) => { const c = (($("frCode") || {}).value || "").trim().toUpperCase(); if (c.length < 4) return toast(L("Введи код друга")); friendAct("add", { code: c }, el, () => openFriends()); },
  frAddTop: (d, e, el) => friendAct("add", { top: +d.top }, el, reGarage),
  frAccept: (d, e, el) => friendAct("accept", { uid: +d.uid }, el, d.from === "list" ? openFriends : reGarage),
  frDecline: (d, e, el) => friendAct("decline", { uid: +d.uid }, el, d.from === "list" ? openFriends : reGarage),
  frCancel: (d, e, el) => friendAct("cancel", { uid: +d.uid }, el, reGarage),
  frRemove: (d, e, el) => { if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = L("Точно удалить?"); el.classList.replace("alt", "red"); return; } friendAct("remove", { uid: +d.uid }, el, reGarage); },
  frCopy: () => { const done = () => toast(L("📋 Код {0} скопирован", myCode)); try { navigator.clipboard.writeText(myCode).then(done, () => toast(L("Твой код: {0}", myCode))); } catch (er) { toast(L("Твой код: {0}", myCode)); } },
  admRefund: (d, e, el) => {                           // возврат — только со второго нажатия
    if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = "Точно вернуть?"; el.classList.replace("alt", "red"); return; }
    el.disabled = true; Platform.admin("refund", { id: d.id }).then(j => { toast(j && j.ok ? j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); openAdmin("sales"); });
  },
  admSend: (d, e, el) => {                             // рассылка: себе — сразу, всем — со второго нажатия
    const text = (($("admText") || {}).value || "").trim(), btn = (($("admBtn") || {}).value || "").trim() || "🎮 Играть";
    if (!text) return toast("Напиши текст сообщения");
    if (d.mode === "broadcast" && !el.dataset.sure) { el.dataset.sure = 1; el.textContent = "Точно разослать ВСЕМ? Нажми ещё раз"; return; }
    el.disabled = true; Platform.admin(d.mode, { text, btn }).then(j => { toast(j && j.ok ? j.msg : "❌ " + ((j && j.error) || "сервер не отвечает")); el.disabled = false; delete el.dataset.sure; if (d.mode === "broadcast") el.textContent = "📢 Разослать всем"; });
  },
  invite: () => invite(), top: () => openTop(), questClaim: d => questClaim(+d.i), questChest: () => questChest(),
  brag: d => brag(S.plates.find(x => x.id === +d.id) || (lastRevealed && lastRevealed.id === +d.id ? lastRevealed : null)),
  notifOn: () => { closeModal(); Platform.askNotify().then(ok => { Platform.track(ok ? "notif_on" : "notif_off"); toast(ok ? L("🔔 Напоминания включены") : L("Напоминания выключены — их можно включить, нажав /start в боте")); if (ok) sendState(); }); },
  taxi: (d, e) => taxi(e),
  offlineDouble: (d, e, el) => {                      // удвоить офлайн-доход за рекламу (один раз на окно)
    if (el.dataset.used) return; el.dataset.used = 1; el.disabled = true;
    rewardedAd(() => { const v = +d.v; gain(v); toast(L("Удвоено! +{0} 💰", fmt(v))); Snd.sell(); fx.fly(innerWidth / 2, innerHeight / 2, 14); fx.confetti(40); save(); closeModal(); renderHeader(); });
    setTimeout(() => { if (!el.isConnected) return; el.disabled = false; delete el.dataset.used; }, 1500);   // реклама не показалась/закрыта без награды — можно повторить
  },
  buffAd: () => rewardedAd(() => {                    // доход ×2 на 5 минут за рекламу
    S.buffUntil = Math.max(S.buffUntil, Date.now()) + 300000;
    toast(L("🔥 Доход ×2 на 5 минут!")); fx.confetti(50); vignette("#ffd23f"); Snd.level(); renderPills(); renderHeader(); save();
  }),
  ad: () => { if (Date.now() < S.adNext) return; rewardedAd(() => { const v = adReward(); gain(v); S.adNext = Date.now() + AD_GAP; toast("+" + fmt(v) + " 💰"); Snd.sell(); fx.fly(innerWidth / 2, innerHeight - 140, 12); renderHeader(); save(); }); },
  sellPlate: d => sellPlate(+d.id), sellTier: d => sellTier(+d.t), merge: d => doMerge(+d.t),
  achClaim: d => claimAch([d.id]), achClaimAll: () => claimAch(Object.keys(S.achClaim)),
  storyReplay: () => { const C = STORY[S.story.ch]; if (C && C.intro.length && !Talk.cur && S.tut < 0) say(C.intro); },   // тап по заданию — ещё раз послушать главу
  forgeToggle: d => {
    if (forging) return; const id = +d.id, i = S.forge.sel.indexOf(id);
    if (i < 0 && isLocked(S.plates.find(p => p.id === id))) return toast(L("🔒 Номер под замком — в тюнинг не пойдёт"));
    if (i >= 0) S.forge.sel.splice(i, 1); else S.forge.sel.push(id);
    const el = document.querySelector(`.fcard[data-id="${id}"]`); if (el) el.classList.toggle("on", i < 0);
    renderForge();
  },
  forgeTarget: d => { if (forging) return; S.forge.target = +d.id; Snd.keep(); renderForge(); },
  forgeView: d => { forgeView = d.v; renderForge(); },
  forgeLots: () => { if (forging) return; genLots(); renderForge(); Snd.whoosh(); },
  forgeMult: d => {                                   // ×N: ближайшая цель, дороже входа в N раз
    if (forging) return; const inV = plateSum() + S.forge.coins; if (inV <= 0) return toast(L("Сначала выбери номера для входа"));
    const want = inV * +d.m, lot = S.forge.lots.find(l => l.val >= want) || S.forge.lots[S.forge.lots.length - 1];
    if (lot) S.forge.target = lot.id; renderForge();
  },
  forgePct: d => {                                    // N%: докинуть монет, чтобы получить нужный шанс
    if (forging) return; const lot = curLot(); if (!lot) return toast(L("Сначала выбери цель"));
    const need = +d.p / 100 * lot.val / forgeFactor(), ps = plateSum();
    if (need <= ps) return toast(L("Шанс уже выше {0}% — убери номера", d.p));
    if (need - ps > forgeMaxCoins()) toast(L("Не хватает монет — выставлен максимум"));
    S.forge.coins = Math.round(need - ps); forgeCalc();
  },
  forgeSpin: () => forgeSpin(),
  forgeBoost: () => rewardedAd(() => { S.forge.boost = true; toast(L("🔨 Мастер позван: шанс ×1.25")); if (tab === "forge") renderForge(); save(); }),
  plateInfo: d => showInfo(+d.id), sellFromInfo: d => { sellPlate(+d.id); closeModal(); },
  orderDo: d => orderDo(+d.id), orderReroll: () => orderReroll(),
  buyUp: d => buyUp(d.id),
  miniStart: () => { closeModal(); startMini(); },
  miniAd: () => rewardedAd(() => { S.mini.next = 0; renderMore(); save(); }),
  prestige: () => openModal(`<h2>${L("🏛 Переезд в Москву")}</h2><p style="font-size:14px;color:#cfd6e6">${L("Ты потеряешь деньги, гараж и апгрейды, но получишь {0} — они навсегда усиливают доход и удачу. Уровень, серии и достижения останутся.", `<b style="color:#ffb300">+${prestigeGain()} ⭐</b>`)}</p>
    <div class="row"><button class="btn alt" data-act="closeModal">${L("Отмена")}</button><button class="btn red" data-act="prestigeGo">${L("Переехать")}</button></div>`),
  prestigeGo: () => doPrestige(),
  claimDaily: () => claimDaily(),
  closeModal: () => closeModal(),
  menuOpen: () => showMenu(), menuPlay: () => hideMenu(),
  menuHow: () => { hideMenu(); showHowTo(); },
  menuBack: () => { closeModal(); showMenu(); },
  menuSettings: () => { hideMenu(); openTab("more"); setTimeout(() => { const r = $("btnReset"); if (r) r.closest(".card").scrollIntoView({ behavior: "smooth" }); }, 50); },
  toggle: (d, e, el) => {
    S.set[d.k] = !S.set[d.k]; el.classList.toggle("on", S.set[d.k]);
    if (d.k === "music") S.set.music ? Mus.start() : Mus.stop();
    if (d.k === "city") applyCity(); save();
  },
  resetSave: (d, e, el) => {
    if (!el.dataset.sure) { el.dataset.sure = 1; el.textContent = L("Точно сбросить? Нажми ещё раз"); el.classList.add("red"); return; }
    noSave = true; try { localStorage.removeItem(SAVE_KEY); } catch (er) {}
    const done = () => location.reload();
    if (cloudOK) { try { Platform.save({}, true).then(done, done); setTimeout(done, 2000); } catch (er) { done(); } } else done();   // очищаем и облако, иначе прогресс вернётся
  }
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (!el || el.disabled) return;
  ac(); if (el.dataset.act !== "taxi") Snd.click();
  const f = ACTS[el.dataset.act]; if (f) f(el.dataset, e, el);
});
$("nav").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  ac(); Snd.click(); Mus.start();
  tab = b.dataset.tab;
  document.querySelectorAll("nav button").forEach(x => x.classList.toggle("on", x === b));
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x.id === "tab-" + tab));
  renderTab();
});
function renderTab() {
  if (tab === "garage") renderGarage(); else if (tab === "forge") renderForge(); else if (tab === "orders") renderOrders(); else if (tab === "up") renderUps(); else if (tab === "more") renderMore(); else renderPacks();
  refreshDisabled();
}
function renderAll() { syncNav(); updateMoreDot(); renderHeader(); renderPills(); renderPacks(); renderSubs(); updatePity(); renderTab(); updateOrderDot(); }

// ===================== ГЛАВНЫЙ ЦИКЛ =====================
let lastTick = Date.now(), botT = 0, saveT = 0;
setInterval(() => {                                   // плавный счётчик монет
  const diff = S.coins - dispCoins;
  dispCoins = Math.abs(diff) < 1 ? S.coins : dispCoins + diff * 0.25;
  $("coins").textContent = fmt(dispCoins);
}, 50);
setInterval(() => {
  const now = Date.now(), dt = Math.min((now - lastTick) / 1000, 5); lastTick = now;
  if (hidden) return;
  S.playSec += dt; gain(income() * dt);
  // помощник покупает бланки сам
  if (up("bot") > 0 && S.bot.on) { botT += dt; if (botT >= botEvery()) { botT = 0; if (!rolling) botBuy(); } }
  refreshMarket();
  renderHeader(); refreshDisabled(); updateOrderDot();
  if ($("pills").children.length || S.market) renderPills();
  document.querySelectorAll("[data-until]").forEach(el => { const left = +el.dataset.until - now; if (left <= 0) { el.removeAttribute("data-until"); if (tab === "more") renderMore(); else if (tab === "orders") renderOrders(); } else el.textContent = mmss(left); });
  if (tab === "garage" && Math.floor(S.playSec) % 5 === 0) renderGarage();
  if (++saveT >= 5) { saveT = 0; checkAch(); questsTick(); save(); }
  if (tab === "buy" && !rolling) renderMergeBar();
}, 1000);
addEventListener("pagehide", save);
addEventListener("beforeunload", save);

// ===================== СТАРТ =====================
function startStage() {
  setStage(plateHTML({ l1: "А", d: "777", l23: "АА", reg: "77", tier: 0 }), 0, L("Бланк номера"),
    S.drawn === 0 ? L("Купи свой первый номер — тебя ждёт подарок! 🎁") : L("Купи бланк номера — повезёт, и выпадет «блатной»!"), 0);
  $("tier").classList.remove("in");
}
function translateStatic() {                          // тексты из index.html: ключ перевода — исходный русский текст в data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => { if (!el.dataset.i18n) el.dataset.i18n = el.textContent.trim(); el.textContent = L(el.dataset.i18n); });
  document.title = I18N.TITLE[I18N.lang];
}
function applyCity() { if (window.BgCity) S.set.city ? BgCity.start($("bg")) : BgCity.stop(); }   // живой фон «Ночной город» (bg-city.js)
function applyLang() {                                // язык определился (SDK) уже после первой отрисовки
  translateStatic(); renderAll(); renderGoal(); updatePity();
  if (!rolling && !pending && !lastRevealed) startStage();
}
(function start() {
  translateStatic(); albumBackfill();
  const off = Math.min((Date.now() - (S.t || Date.now())) / 1000, 3600);
  if (off > 30 && S.plates.length) {
    const g = income() * off * 0.5; gain(g);
    if (off > 120 && g >= 50) { dailyAfter = S.drawn >= 3; setTimeout(() => openModal(`<h2>${L("🌙 Пока тебя не было")}</h2><p style="font-size:14px;color:#8d99b3">${L("Твой гараж заработал")}</p>
      <div style="font-size:34px;font-weight:bold;color:#ffd23f;margin:8px 0">+${fmt(g)} 💰</div>
      ${Platform.adsOK ? `<button class="btn" data-act="offlineDouble" data-v="${Math.round(g)}">${L("🎁 ×2 за рекламу (+{0})", fmt(g))}</button>` : ""}<button class="btn" data-act="closeModal">${L("Забрать")}</button>`), 700); }
    else setTimeout(() => toast(L("Пока тебя не было: +{0} 💰", fmt(g))), 900);
  }
  dispCoins = S.coins; lastTick = Date.now();
  applyCity();
  startStage();
  if (S.forgePend) setTimeout(() => applyForge(true), 600);     // незавершённое улучшение после перезагрузки
  refreshMarket(); ensureOrders(); renderAll(); renderGoal(); scheduleBuyer();
  if (S.drawn >= 3 && !dailyAfter) setTimeout(checkDaily, 700);       // новичку бонус не мешает первому знакомству; после окна офлайн-дохода — по его закрытию
  // музыка стартует после первого касания (требование браузеров)
  document.addEventListener("pointerdown", function once() { ac(); Mus.start(); document.removeEventListener("pointerdown", once); });
})();
