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
  basic: { name: "Обычный бланк",  icon: "📄", price: 120,  w: [70, 20, 7.6, 2.37, 0.03, 0.002], lvl: 1,  xp: 2 },
  prem:  { name: "Премиум-бланк",  icon: "💼", price: 700,  w: [0, 50, 32, 17.5, 0.5, 0.02],    lvl: 4,  xp: 8 },
  elite: { name: "Элитный бланк",  icon: "👑", price: 1500, w: [0, 0, 59, 40, 1, 0.08],          lvl: 12, xp: 30 }
};
const TOP = TIERS.length - 1;               // самая высокая редкость
const UPS = [
  { id: "luck",  name: "🍀 Удача",            base: 800,   mul: 2.0, max: 40, desc: "Шанс на красивые, редкие и блатные ×1.12 за уровень (легенды — слабее, они «прям редкие»)" },
  { id: "disc",  name: "🏷 Скидка на бланки",  base: 700,   mul: 2.4, max: 8,  desc: "Все бланки дешевле на 7% за уровень" },
  { id: "taxi",  name: "🚕 Таксопарк",         base: 200,   mul: 1.8, max: 60, desc: "+4 к заработку за тап «Таксовать»" },
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
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
const yesterdayStr = () => { const d = new Date(Date.now() - 864e5); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };

// ===================== СОСТОЯНИЕ =====================
const fresh = () => ({
  v: 3, coins: START_COINS, drawn: 0, goal: 0, forge: { sel: [], coins: 0, target: null, lots: [], lotsAt: 0, boost: false, tries: 0, wins: 0, legend: 0 }, forgePend: null, earned: 0, earnedRun: 0, plates: [], found: {}, up: {}, bought: 0, sold: 0,
  tc: [0, 0, 0, 0, 0, 0], pity: 0, xp: 0, lvl: 1, pts: 0, prest: 0, orders: [], ordAt: 0, ach: {},
  daily: { last: "", streak: 0 }, mini: { best: 0, next: 0, plays: 0 },
  set: { music: true, sfx: true, vib: true, auto: 0, city: true }, market: null, t: Date.now(), nid: 1,
  playSec: 0, ordersDone: 0, buffUntil: 0, buyers: 0, taxis: 0, botAcc: 0, adNext: 0
});
let S = fresh();
function normalize(r) {                              // сохранение (локальное или облачное) → полное состояние игры
  const s = Object.assign(fresh(), r); s.set = Object.assign(fresh().set, r.set); s.mini = Object.assign(fresh().mini, r.mini); s.daily = Object.assign(fresh().daily, r.daily);
  s.forge = Object.assign(fresh().forge, r.forge);                        // мастерская: старые сейвы с другим форматом
  if (!Array.isArray(s.forge.sel)) s.forge.sel = [];
  if (!Array.isArray(s.forge.lots)) s.forge.lots = [];
  if (s.forgePend && !s.forgePend.v2) s.forgePend = null;
  if (!Array.isArray(s.tc)) s.tc = [];
  while (s.tc.length < TIERS.length) s.tc.push(0);                       // старые сейвы: счётчик без суперлегенд
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
  while ($("toasts").children.length > 4) $("toasts").firstChild.remove();
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
const luckMult = () => Math.min(40, Math.pow(1.12, up("luck")) * Math.pow(1.03, S.pts));
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
  // подарки новичку: 1-й номер — редкий, 7-й — блатной (хук для первого знакомства)
  if (S.drawn === 1 && want < 2) { want = 2; gift = true; }
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
  const ser = seriesOf(p);
  if (SERIES_INFO[ser]) S.found["s:" + ser] = true;
  if (SPECIAL_DIGITS.includes(p.d)) S.found["d:" + p.d] = true;
  if (ELITE_REG.includes(p.reg)) S.found["r:" + p.reg] = true;
}

// ===================== ЭКОНОМИКА =====================
function gain(n) { S.coins += n; S.earned += n; S.earnedRun += n; }
const slots = () => 10 + 2 * up("slots");
function incMult() { return (1 + 0.25 * up("park")) * (1 + 0.1 * S.pts) * (1 + 0.02 * (S.lvl - 1)) * (Date.now() < S.buffUntil ? 2 : 1); }
function income() { let s = 0; for (const p of S.plates) s += p.val; return s / INC_DIV * incMult(); }
const plateInc = p => p.val / INC_DIV * incMult();
const packPrice = id => Math.max(60, Math.round(PACKS[id].price * Math.pow(0.93, up("disc"))));
const upCost = u => Math.round(u.base * Math.pow(u.mul, up(u.id)));
const taxiTap = () => (3 + 3 * up("taxi")) * (1 + 0.02 * (S.lvl - 1));
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
  const m = Math.random() < 0.5 ? { kind: "tier", key: 1 + rnd(3), mult: 1.5 } : { kind: "series", key: pick([...LEGEND_SER, ...BLAT_SER]), mult: 2 };
  m.until = Date.now() + 150000; S.market = m; renderPills();
}

function addXp(n) {
  S.xp += n;
  while (S.xp >= xpNeed(S.lvl)) {
    S.xp -= xpNeed(S.lvl); S.lvl++;
    const r = 60 * S.lvl; gain(r);
    const ut = unlockText(S.lvl);
    if (ut || S.lvl % 5 === 0) {                     // важные уровни — полноэкранная сцена (покажется, когда игрок не занят)
      enqueueCinema({ color: "#4fc3f7", bg: "#0d2238", icon: "⭐", top: L("Новый уровень"), title: L("УРОВЕНЬ {0}", S.lvl), value: r, valueLabel: L("НАГРАДА"), valueIcon: "💰", sub: ut || L("Так держать!"), coinRain: false, confetti: 70 });
    } else { Snd.level(); vignette("#4fc3f7"); fx.confetti(40); toast(L("⭐ Уровень {0}! +{1} 💰", S.lvl, fmt(r))); }
    renderPacks(); if (tab === "orders") renderOrders();
  }
}
function unlockText(l) { const t = { 2: "Открыты заказы!", 5: "Мастерская тюнинга!", 4: "Премиум-бланк и мини-игра!", 10: "Престиж!", 12: "Элитный бланк!" }[l]; return t ? L(t) : ""; }

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
  if (r.tier <= S.set.auto) {                       // авто-продажа по порогу
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
function keepPlate(p) {   // кладём в гараж; если полон — вытесняем самый дешёвый
  if (S.plates.length < slots()) { S.plates.push(p); return "kept"; }
  const worst = S.plates.reduce((a, b) => a.val <= b.val ? a : b);
  if (worst.val < p.val) { S.plates = S.plates.filter(x => x.id !== worst.id); gain(sellVal(worst)); S.sold++; S.plates.push(p); toast(L("Гараж полон: продан самый дешёвый номер")); return "swapped"; }
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
    if (r.tier <= S.set.auto) { const v = sellVal(r); gain(v); S.sold++; soldSum += v; soldN++; } else { keepPlate(r); kept++; }
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
  if (legend) Platform.happytime();
  if (legend && window.BgCity) BgCity.event("legend");     // на фоне по дороге проносится кортеж с мигалками
  cinema({
    color: TIERS[t].color, big: legend, bg: sup ? "#06243a" : undefined, cls: sup ? "super" : "",
    top: sup ? L("Такого не бывает…") : legend ? L("Что-то невероятное…") : L("Что же там внутри…"),
    title: sup ? L("СУПЕРЛЕГЕНДА!") : legend ? L("ЛЕГЕНДА!") : L("БЛАТНОЙ!"),
    plate: plateHTML(r, ""), value: r.val, valueLabel: L("СТОИМОСТЬ"), valueIcon: "💰",
    x: L("в {0} раз дороже обычного номера", fmt(Math.round(r.val / TIERS[0].val))), sub: tierChanceText(r), then: opts.then
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
  const title = String(cfg.title).split("").map((c, i) => `<span style="animation-delay:${i * 0.07}s">${c === " " ? "&nbsp;" : c}</span>`).join("");
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
    <button class="btn" id="jpBtn">${L("Забрать")}</button>`;
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
    $("jpSub").classList.add("on"); $("jpBtn").classList.add("on");
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
  el.onclick = e => { if (e.target.id === "jpBtn" || (finished && e.target === el)) close(); else skip(); };
}

// ===================== ВЕРХНЯЯ ПАНЕЛЬ =====================
function renderPills() {
  let h = "";
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
  $("ptsLabel").textContent = S.pts ? "⭐ " + S.pts : "";
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
  syncAdButtons();
}
// кнопки рекламы прячем, если площадка её не даёт (блокировщик, пробный запуск) — пустых кнопок быть не должно
function syncAdButtons() { document.querySelectorAll("#btnAd, #btnBuff").forEach(b => b.style.display = Platform.adsOK ? "" : "none"); }
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
  if (!list.length) h += `<div class="hint">${L("Гараж пуст. Купи номер и нажми «В гараж» — номера приносят доход, даже когда тебя нет.")}</div>`;
  list.slice(0, 100).forEach(p => {
    const mm = marketMult(p);
    h += `<div class="item"><span data-act="plateInfo" data-id="${p.id}" style="cursor:pointer">${plateHTML(p, "small")}</span><div class="info" data-act="plateInfo" data-id="${p.id}" style="cursor:pointer"><b style="color:${TIERS[p.tier].color}">${TIERS[p.tier].name}</b>${mm > 1 ? " 📈" : ""} ℹ<br>${L("+{0}/сек", plateInc(p).toFixed(2))}<br><small>${L("нажми — история номера")}</small></div>
      <button data-act="sellPlate" data-id="${p.id}">${L("Продать {0}", fmt(sellVal(p)))}</button></div>`;
  });
  $("tab-garage").innerHTML = h;
}
function sellPlate(id) {
  const p = S.plates.find(x => x.id === id); if (!p) return;
  S.plates = S.plates.filter(x => x.id !== id); gain(sellVal(p)); S.sold++; Snd.sell();
  fx.fly(innerWidth / 2, innerHeight / 2, 4); renderGarage(); renderHeader(); save();
}
function sellTier(t) {
  let sum = 0, n = 0; const keep = [];
  S.plates.forEach(p => { if (p.tier <= t) { sum += sellVal(p); n++; } else keep.push(p); });
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
  o.reward = Math.round(base * (1 + 0.06 * L)); o.id = S.nid++; return o;
}
function orderMatch(o, p) { return o.k === "tier" ? p.tier >= o.t : o.k === "digits" ? p.d === o.d : seriesOf(p) === o.s; }
function orderText(o) { return o.k === "tier" ? L("Номер не ниже «{0}»", TIERS[o.t].name) : o.k === "digits" ? L("Номер с цифрами «{0}»", o.d) : L("Номер серии «{0}»", o.s); }
function orderPlate(o) { return S.plates.filter(p => orderMatch(o, p)).sort((a, b) => a.val - b.val)[0]; }
function ensureOrders() { if (S.lvl < 2) return; while (S.orders.length < 3) S.orders.push(genOrder()); }
function renderOrders() {
  if (S.lvl < 2) { $("tab-orders").innerHTML = `<h2>${L("📋 Заказы")}</h2><div class="hint">${L("Откроются на уровне 2")}</div>`; return; }
  ensureOrders();
  let h = `<h2>${L("📋 Заказы клиентов")}</h2><p style="font-size:12px;color:#8d99b3;margin-top:-4px">${L("Отдай подходящий номер из гаража — получишь больше, чем при продаже.")}</p>`;
  S.orders.forEach(o => {
    const p = orderPlate(o);
    h += `<div class="card ${p ? "done" : ""}"><h3>${orderText(o)}</h3><p>${L("Награда:")} <b style="color:#ffd23f">${fmt(o.reward)} 💰</b> · ${L("+15 опыта")}</p>
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
function updateOrderDot() { $("orderDot").classList.toggle("on", S.lvl >= 2 && S.orders.some(o => orderPlate(o))); }

// ===================== УЛУЧШЕНИЯ =====================
function renderUps() {
  let h = `<h2>${L("⚙ Улучшения")}</h2>`;
  UPS.forEach(u => {
    const lvl = up(u.id), maxed = lvl >= u.max, cost = upCost(u);
    h += `<div class="card"><h3>${u.name} <small>${L("ур. {0}", lvl)}${maxed ? L(" (макс.)") : "/" + u.max}</small></h3><p>${u.desc}</p>
      <button class="btn" data-act="buyUp" data-id="${u.id}" data-cost="${maxed ? 1e300 : cost}" ${maxed ? "disabled" : ""}>${maxed ? L("МАКСИМУМ") : L("Улучшить — {0} 💰", fmt(cost))}</button></div>`;
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
    "💰 Продай номер сразу или поставь в 🏠 гараж — там он приносит доход каждую секунду, даже когда ты не в игре.",
    "🚕 Не хватает денег — жми «Таксовать».",
    "📋 Со 2-го уровня открываются заказы: отдай подходящий номер и получи больше, чем при продаже.",
    "🔨 В тюнинге можно обменять несколько номеров на один более редкий.",
    "⚙ Апгрейды повышают шанс редких номеров, дают скидки на бланки и места в гараже.",
    "🎣 С 4-го уровня — мини-игра «Поймай номер», с 10-го — «Переезд в Москву»: начни заново с вечным бонусом.",
    "📖 Шансы выпадения смотри под бланками, коллекцию серий и достижения — во вкладке «Ещё»."
  ];
  openModal(`<h2>${L("📖 Как играть")}</h2><div class="howto">${P.map(p => `<p>${L(p)}</p>`).join("")}</div>
    <div class="row"><button class="btn alt" data-act="menuBack">${L("← В меню")}</button><button class="btn green" data-act="closeModal">${L("Играть")}</button></div>`);
}
function openTab(t) { const b = document.querySelector(`nav button[data-tab="${t}"]`); if (b) b.click(); }

function renderMore() {
  const miniWait = S.mini.next - Date.now(), canMini = S.lvl >= 4 && miniWait <= 0;
  let h = `<h2>${L("☰ Ещё")}</h2>
  <div class="row"><button class="btn alt" data-act="menuOpen">${L("☰ Главное меню")}</button><button class="btn alt" data-act="menuHow">${L("📖 Как играть")}</button></div>
  <div class="card"><h3>${L("🎣 Поймай номер")}</h3><p>${L("Мини-игра на 25 секунд: лови падающие номера тапом — блатные дороже! Но не трогай 🚔.")} ${L("Рекорд:")} <b>${fmt(S.mini.best)}</b></p>
    <button class="btn ${canMini ? "green ready" : "alt"}" data-act="miniStart" ${canMini ? "" : "disabled"}>${S.lvl < 4 ? L("🔒 Откроется на уровне {0}", 4) : miniWait > 0 ? L("Перезарядка") + ' <span class="timer" data-until="' + S.mini.next + '"></span>' : L("ИГРАТЬ")}</button>
    ${S.lvl >= 4 && miniWait > 0 && Platform.adsOK ? `<button class="btn alt" data-act="miniAd">${L("🎁 Сбросить перезарядку (📺 реклама)")}</button>` : ""}</div>`;
  const gain_ = prestigeGain();
  h += `<div class="card"><h3>${L("🏛 Переезд в Москву")} <small>${L("(престиж)")}</small></h3><p>${L("Сбрось деньги, гараж и апгрейды — и получи ⭐ «Связи»: каждая даёт навсегда +10% дохода и +3% к удаче.")} ${L("Сейчас ⭐ {0}. За этот забег:", S.pts)} <b style="color:#ffb300">+${gain_} ⭐</b></p>
    <button class="btn ${gain_ > 0 ? "red" : "alt"}" data-act="prestige" ${S.lvl >= 10 && gain_ > 0 ? "" : "disabled"}>${S.lvl < 10 ? L("🔒 Откроется на уровне {0}", 10) : gain_ > 0 ? L("Переехать (+{0} ⭐)", gain_) : L("Нужно заработать ещё (от {0} за забег)", fmt(1500000))}</button></div>`;
  h += `<div class="card"><h3>${L("📖 Блатные серии")}</h3>`;
  [...LEGEND_SER, ...BLAT_SER].forEach(s => { const ok = S.found["s:" + s]; h += `<div class="ser ${ok ? "" : "lock"}"><div class="nm t${LEGEND_SER.includes(s) ? 4 : 3}">${s}</div><div class="ds">${ok ? SERIES_INFO[s] : L("Ещё не выпадала")}</div><div>${ok ? "✅" : "🔒"}</div></div>`; });
  SPECIAL_DIGITS.forEach(d => { const ok = S.found["d:" + d]; h += `<div class="ser ${ok ? "" : "lock"}"><div class="nm t2">${d}</div><div class="ds">${L("Красивые цифры")}</div><div>${ok ? "✅" : "🔒"}</div></div>`; });
  ELITE_REG.forEach(r => { const ok = S.found["r:" + r]; h += `<div class="ser ${ok ? "" : "lock"}"><div class="nm t2">${L("рег. {0}", r)}</div><div class="ds">${L("Престижный регион")}</div><div>${ok ? "✅" : "🔒"}</div></div>`; });
  h += `</div><div class="card"><h3>${L("🏆 Достижения")} <small>${Object.keys(S.ach).length}/${ACH.length}</small></h3>`;
  ACH.forEach(a => { const ok = S.ach[a.id]; h += `<div class="ach ${ok ? "" : "lock"}"><div class="ai">${a.i}</div><div><b>${a.n}</b><small>${a.d}</small></div><div>${ok ? "✅" : "+" + fmt(achReward(a))}</div></div>`; });
  h += `</div><div class="card"><h3>${L("📊 Статистика")}</h3>
    ${[["Куплено номеров", S.bought], ["Продано", S.sold], ["Всего заработано", fmt(S.earned)], ["Выпало: обычных", S.tc[0]], ["Выпало: красивых", S.tc[1]], ["Выпало: редких", S.tc[2]], ["Выпало: блатных", S.tc[3]], ["Выпало: легенд", S.tc[4]], ["Выпало: суперлегенд", S.tc[5]], ["Заказов выполнено", S.ordersDone], ["Попыток в мастерской", S.forge.tries], ["Удачных улучшений", S.forge.wins], ["Переездов", S.prest], ["Время в игре", L("{0} мин", Math.floor(S.playSec / 60))]]
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
  const keep = { drawn: S.drawn, goal: S.goal, forge: Object.assign({}, S.forge, { sel: [], coins: 0, target: null, lots: [], boost: false }), found: S.found, ach: S.ach, lvl: S.lvl, xp: S.xp, set: S.set, mini: S.mini, daily: S.daily, tc: S.tc, bought: S.bought, sold: S.sold, earned: S.earned, ordersDone: S.ordersDone, playSec: S.playSec, taxis: S.taxis, buyers: S.buyers };
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
  { id: "b1", i: "🛒", n: "Первый номер", d: "Купи номер", c: () => S.bought >= 1, r: 200 },
  { id: "b2", i: "🧾", n: "Постоянный клиент", d: "Купи 50 номеров", c: () => S.bought >= 50, r: 1500 },
  { id: "b3", i: "🏭", n: "Оптовик", d: "Купи 500 номеров", c: () => S.bought >= 500, r: 25000 },
  { id: "t2", i: "💜", n: "Редкая находка", d: "Выбей редкий номер", c: () => S.tc[2] + S.tc[3] + S.tc[4] + S.tc[5] >= 1, r: 2000 },
  { id: "t3", i: "⭐", n: "Блатной!", d: "Выбей блатной номер", c: () => S.tc[3] + S.tc[4] + S.tc[5] >= 1, r: 10000 },
  { id: "t4", i: "🔥", n: "Легенда", d: "Выбей легендарный номер", c: () => S.tc[4] + S.tc[5] >= 1, r: 200000 },
  { id: "t5", i: "🦅", n: "Спецсерия", d: "Выбей суперлегендарный номер", c: () => S.tc[5] >= 1, r: 2000000 },
  { id: "s4", i: "📖", n: "Коллекционер", d: "Найди 4 блатные серии", c: () => found("s:") >= 4, r: 20000 },
  { id: "s7", i: "📚", n: "Все серии", d: "Найди все 7 серий", c: () => found("s:") >= 7, r: 500000 },
  { id: "g1", i: "🏠", n: "Полный гараж", d: "Заполни все места в гараже", c: () => S.plates.length >= slots(), r: 5000 },
  { id: "e1", i: "💵", n: "Миллионер", d: "Заработай 1 млн за всё время", c: () => S.earned >= 1e6, r: 50000 },
  { id: "e2", i: "💎", n: "Миллиардер", d: "Заработай 1 млрд за всё время", c: () => S.earned >= 1e9, r: 5e6 },
  { id: "o1", i: "📋", n: "Исполнитель", d: "Выполни 10 заказов", c: () => S.ordersDone >= 10, r: 8000 },
  { id: "m1", i: "🎣", n: "Ловец номеров", d: "Набери 2000 очков в мини-игре", c: () => S.mini.best >= 2000, r: 5000 },
  { id: "l1", i: "🎖", n: "Опытный", d: "Достигни 10 уровня", c: () => S.lvl >= 10, r: 15000 },
  { id: "p1", i: "🏛", n: "Новая жизнь", d: "Переедь в Москву", c: () => S.prest >= 1, r: 20000 },
  { id: "x1", i: "🚕", n: "Таксист", d: "Тапни «Таксовать» 500 раз", c: () => S.taxis >= 500, r: 3000 },
  { id: "f1", i: "🔨", n: "Мастер тюнинга", d: "Удачно улучши номер в мастерской", c: () => S.forge.wins >= 1, r: 4000 },
  { id: "f2", i: "🎲", n: "Рискованный", d: "Сделай легенду в мастерской", c: () => S.forge.legend >= 1, r: 100000 },
  { id: "f3", i: "🧯", n: "Упорство", d: "Сделай 20 попыток в мастерской", c: () => S.forge.tries >= 20, r: 8000 },
  { id: "y1", i: "🚘", n: "Лови покупателя", d: "Поймай 5 богатых покупателей", c: () => S.buyers >= 5, r: 5000 }
];
ACH.forEach(a => Lprops(a, "n", "d"));
const achReward = a => Math.round(a.r * 0.4);
function checkAch() {
  checkGoal();
  ACH.forEach(a => {
    if (!S.ach[a.id] && a.c()) { const rw = achReward(a); S.ach[a.id] = true; gain(rw);
      if (a.r >= 10000) enqueueCinema({ color: "#ffd23f", bg: "#2a2005", icon: a.i, top: L("Достижение разблокировано"), title: a.n.toUpperCase(), value: rw, valueLabel: L("НАГРАДА"), valueIcon: "💰", sub: a.d, big: a.r >= 100000 });
      else { Snd.level(); toast("🏆 " + a.n + " · +" + fmt(rw) + " 💰"); fx.burst(innerWidth / 2, 120, 24, ["#ffd23f", "#fff"]); }
      if (tab === "more") renderMore(); }
  });
}

// ===================== МАСТЕРСКАЯ ТЮНИНГА («апгрейдер») =====================
// Выбираешь номера (и можешь добавить монеты), выбираешь цель. Шанс = стоимость входа / стоимость цели × 0.9.
// Чем дороже цель относительно входа — тем ниже шанс и выше награда. Стрелка падает в дугу — успех, иначе входные номера сгорают.
const FORGE_EDGE = 0.9, FORGE_CAP = 0.85, FORGE_MIN = 0.01, GAUGE_C = 703.72;
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
  [[1, 3], [2, 3], [3, 3], [4, 2]].forEach(([tier, n]) => {
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
  return S.forge.lots.map(l => { const on = S.forge.target === l.id;
    return `<div class="fcard t${l.plate.tier}b ${on ? "on" : ""}" data-act="forgeTarget" data-id="${l.id}"><div class="fv">${fmt(l.val)} <i>●</i></div>${plateHTML(l.plate, "mini")}<div class="fn">${TIERS[l.plate.tier].name}</div><div class="fb" data-lotv="${l.val}">0%</div><div class="fchk">✓</div></div>`; }).join("");
}
function renderForge() {
  if (forging) return;
  if (S.lvl < 5) { $("tab-forge").innerHTML = `<h2>${L("🔨 Мастерская тюнинга")}</h2><div class="hint">${L("Откроется на уровне {0}", 5)}</div>`; return; }
  if (!S.forge.lots.length || Date.now() > S.forge.lotsAt) genLots();
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
  const win = Math.random() < ch;
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
    markFound(p); S.tc[p.tier]++; lastRevealed = p; keepPlate(p); addXp(XP_TIER[p.tier] * 2);
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

// ===================== ЦЕЛИ (подсказки для новичка) =====================
const upSum = () => UPS.reduce((a, u) => a + up(u.id), 0);
const GOALS = [
  { t: "Купи свой первый номер",         c: () => S.drawn >= 1, r: 50 },
  { t: "Оставь номер в гараже",          c: () => S.plates.length >= 1, r: 50 },
  { t: "Купи 10 номеров",                c: () => S.bought >= 10, r: 100, p: () => S.bought + "/10" },
  { t: "Достигни 2 уровня",              c: () => S.lvl >= 2, r: 100 },
  { t: "Выполни первый заказ (вкладка «Заказы»)", c: () => S.ordersDone >= 1, r: 150 },
  { t: "Выбей блатной номер",            c: () => S.tc[3] + S.tc[4] + S.tc[5] >= 1, r: 300 },
  { t: "Купи 3 улучшения",               c: () => upSum() >= 3, r: 300, p: () => upSum() + "/3" },
  { t: "Заполни гараж",                  c: () => S.plates.length >= slots(), r: 500, p: () => S.plates.length + "/" + slots() },
  { t: "Достигни 4 уровня",              c: () => S.lvl >= 4, r: 500 },
  { t: "Улучши номер в мастерской (с 5 уровня)", c: () => S.forge.wins >= 1, r: 700 },
  { t: "Найди 4 блатные серии",          c: () => found("s:") >= 4, r: 1500, p: () => found("s:") + "/4" },
  { t: "Достигни 10 уровня и открой престиж", c: () => S.lvl >= 10, r: 3000 },
  { t: "Выбей легендарный номер",        c: () => S.tc[4] + S.tc[5] >= 1, r: 10000 }
];
GOALS.forEach(g => Lprops(g, "t"));
function renderGoal() {
  const g = GOALS[S.goal], el = $("goal");
  if (!g) { el.style.display = "none"; return; }
  el.style.display = "flex";
  el.innerHTML = `<span>🎯</span><div><b>${g.t}</b>${g.p ? " <small>(" + g.p() + ")</small>" : ""}<br><small>${L("Награда:")} ${fmt(g.r)} 💰</small></div>`;
}
function checkGoal() {
  let moved = false;
  while (GOALS[S.goal] && GOALS[S.goal].c()) {
    const g = GOALS[S.goal]; gain(g.r); S.goal++; moved = true;
    Snd.level(); toast(L("🎯 Цель выполнена: +{0} 💰", fmt(g.r))); fx.fly(innerWidth / 2, 160, 6);
  }
  if (moved || GOALS[S.goal]) renderGoal();
}

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
    ${canSell ? `<button class="btn green" data-act="sellFromInfo" data-id="${p.id}">${L("Продать за {0}", fmt(sellVal(p)))}</button>` : ""}
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
document.addEventListener("contextmenu", e => e.preventDefault());   // ни правый клик, ни долгое нажатие не открывают меню браузера (Яндекс, п. 1.6.1.8 и 1.6.2.7)
Platform.init({
  pause: setPaused,
  mute: setMuted,
  busy: b => $("adwait").classList.toggle("hidden", !b),
  ads: () => { renderPacks(); renderHeader(); if (tab === "more") renderMore(); if (tab === "forge") renderForge(); },   // реклама стала недоступна — прячем её кнопки
  lang: l => { if (I18N.set(l)) { applyLang(); if (!$("menu").classList.contains("hidden")) showMenu(); } }
}).then(() => { if (Platform.hasCloud) cloudLoad(); });
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
  S = normalize(c); pending = null; $("resolveRow").style.display = "none";
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
// ===================== ДЕЛЕГИРОВАНИЕ КЛИКОВ =====================
const ACTS = {
  buy: d => buy(d.pack), buy10: d => buyMany(d.pack),
  sellPending: () => resolvePending(true), keepPending: () => resolvePending(false),
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
  sellPlate: d => sellPlate(+d.id), sellTier: d => sellTier(+d.t),
  forgeToggle: d => {
    if (forging) return; const id = +d.id, i = S.forge.sel.indexOf(id);
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
function renderAll() { renderHeader(); renderPills(); renderPacks(); updatePity(); renderTab(); updateOrderDot(); }

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
  if (up("bot") > 0) {
    botT += dt;
    if (botT >= 25 / (1 + 0.5 * up("bot"))) {
      botT = 0; const c = packPrice("basic");
      if (S.coins >= c * 3 && !rolling) {
        S.coins -= c; S.bought++; const r = drawPlate("basic"); markFound(r); S.tc[r.tier]++; addXp(3);
        if (r.tier <= Math.max(S.set.auto, 0)) { gain(sellVal(r)); S.sold++; } else { keepPlate(r); toast(L("🤖 Помощник купил: {0} ({1})", r.l1 + r.d + r.l23 + " " + r.reg, TIERS[r.tier].name)); }
        updatePity(); renderPacks();
      }
    }
  }
  refreshMarket();
  renderHeader(); refreshDisabled(); updateOrderDot();
  if ($("pills").children.length || S.market) renderPills();
  document.querySelectorAll("[data-until]").forEach(el => { const left = +el.dataset.until - now; if (left <= 0) { el.removeAttribute("data-until"); if (tab === "more") renderMore(); else if (tab === "orders") renderOrders(); } else el.textContent = mmss(left); });
  if (tab === "garage" && Math.floor(S.playSec) % 5 === 0) renderGarage();
  if (++saveT >= 5) { saveT = 0; checkAch(); save(); }
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
  translateStatic();
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
