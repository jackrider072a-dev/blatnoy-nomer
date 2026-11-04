// Анимированный фон «Ночной город»: небо со звёздами и самолётом, два слоя домов с параллаксом (город медленно «едет»),
// фонари, мокрая дорога с отражениями и поток машин в обе стороны. Иногда — кортеж с мигалкой (BgCity.event("legend")).
// Машины — браузерная копия Витрина/исходники/cars.js (те же модели и пропорции), заранее отрисованные в спрайты.
// Подключение: <script src="bg-city.js"></script>, затем BgCity.start(document.getElementById("bg")).
(function () {
  // ===================== МАШИНЫ (из cars.js) =====================
  const M = {
    granta: { kind: 'sedan', rw: 217, fw: 798, r: 70, ys: -45, yh: -176, yBf: -218, yBr: -232, yt: -246, yr: -352, rx0: 345, rx1: 598, wsx: 716, rwx: 195,
      xC0: 292, xC1: 360, xA1: 588, xA0: 694, xB: 488, rim: { n: 5, dbl: false, col: '#c9ccd0' } },
    camry: { kind: 'sedan', rw: 220, fw: 799, r: 71, ys: -42, yh: -160, yBf: -200, yBr: -216, yt: -224, yr: -297, rx0: 362, rx1: 592, wsx: 738, rwx: 205,
      xC0: 298, xC1: 382, xA1: 582, xA0: 712, xB: 492, rim: { n: 5, dbl: true, col: '#d4d7db' } },
    sclass: { kind: 'sedan', rw: 219, fw: 812, r: 71, ys: -40, yh: -150, yBf: -196, yBr: -212, yt: -216, yr: -290, rx0: 352, rx1: 602, wsx: 758, rwx: 200,
      xC0: 300, xC1: 382, xA1: 592, xA0: 738, xB: 502, chrome: true, rim: { n: 10, dbl: false, col: '#d9dcdf' } },
    aurus: { kind: 'sedan', formal: true, rw: 228, fw: 814, r: 70, ys: -40, yh: -168, yBf: -202, yBr: -206, yt: -218, yr: -293, rx0: 318, rx1: 622, wsx: 762, rwx: 232,
      xC0: 290, xC1: 336, xA1: 612, xA0: 742, xB: 505, chrome: true, rim: { n: 6, dbl: true, col: '#cfd2d6' } },
    cruiser: { kind: 'suv', rw: 236, fw: 812, r: 81, ys: -62, yh: -236, yBf: -266, yBr: -272, yr: -384, rx0: 30, rx1: 640, wsx: 780, lean: 14,
      xC0: 62, xC1: 70, xA1: 630, xA0: 762, pil: [248, 472], chrome: true, rails: true, rim: { n: 6, dbl: true, col: '#cfd2d6' } },
    gelik: { kind: 'box', rw: 232, fw: 832, r: 81, ys: -70, yh: -260, yBf: -276, yBr: -276, yr: -405, rx0: 8, rx1: 655, wsx: 692, lean: 2,
      xC0: 40, xC1: 40, xA1: 648, xA0: 684, pil: [232, 456], spare: true, flares: true, rim: { n: 5, dbl: true, col: '#2a2c30', dark: true } },
  };
  const ARCH = 1.13;
  function archPts(c) { const ra = c.r * ARCH, dy = c.r + c.ys, th = Math.asin(Math.max(-0.95, Math.min(0.95, dy / ra))); return { ra, th }; }
  function bodyPath(c) {
    const p = new Path2D(), { ra, th } = archPts(c), yb = c.ys - 4;
    if (c.kind === 'sedan') {
      p.moveTo(34, yb); p.bezierCurveTo(10, yb - 2, 1, yb - 30, 0, yb - 62); p.lineTo(1, c.yt + 44);
      p.bezierCurveTo(1, c.yt + 18, 6, c.yt + 3, 26, c.yt); p.bezierCurveTo(100, c.yt - 5, c.rwx - 60, c.yt - 9, c.rwx, c.yt - 11);
      if (c.formal) p.bezierCurveTo(c.rwx + 40, c.yt - 30, c.rx0 - 40, c.yr + 6, c.rx0, c.yr);
      else p.bezierCurveTo(c.rwx + 70, c.yt - 34, c.rx0 - 70, c.yr + 10, c.rx0, c.yr);
      p.bezierCurveTo(c.rx0 + (c.rx1 - c.rx0) * 0.3, c.yr - 7, c.rx1 - (c.rx1 - c.rx0) * 0.3, c.yr - 7, c.rx1, c.yr);
      p.bezierCurveTo(c.rx1 + 50, c.yr + 8, c.wsx - 70, c.yBf - 38, c.wsx, c.yBf - 8);
      p.bezierCurveTo(c.wsx + 110, c.yBf + 4, 905, c.yh - 6, 972, c.yh);
      if (c.formal) { p.bezierCurveTo(990, c.yh + 2, 998, c.yh + 10, 999, c.yh + 30); p.lineTo(1000, yb - 30); }
      else { p.bezierCurveTo(991, c.yh + 4, 1000, c.yh + 22, 1000, c.yh + 48); p.lineTo(997, yb - 32); }
      p.bezierCurveTo(995, yb - 8, 985, yb, 958, yb);
    } else {
      const L = c.lean || 0, sharp = c.kind === 'box';
      p.moveTo(30, yb); p.bezierCurveTo(8, yb - 2, 0, yb - 26, 0, yb - 52); p.lineTo(L * 0.4, c.yr + (sharp ? 14 : 50));
      if (sharp) p.bezierCurveTo(L * 0.5, c.yr + 3, L + 2, c.yr, L + 14, c.yr);
      else p.bezierCurveTo(L * 0.6, c.yr + 16, L + 8, c.yr, L + 46, c.yr - 1);
      p.bezierCurveTo(250, c.yr - (sharp ? 1 : 5), c.rx1 - 150, c.yr - (sharp ? 1 : 5), c.rx1, c.yr);
      if (sharp) { p.bezierCurveTo(c.rx1 + 10, c.yr + 2, c.wsx - 4, c.yBf - 40, c.wsx, c.yBf - 4); p.lineTo(c.wsx + 14, c.yBf + 6); p.bezierCurveTo(800, c.yh - 4, 960, c.yh - 2, 990, c.yh); p.lineTo(1000, c.yh + 14); p.lineTo(1000, yb - 26); }
      else { p.bezierCurveTo(c.rx1 + 50, c.yr + 10, c.wsx - 60, c.yBf - 50, c.wsx, c.yBf - 6); p.bezierCurveTo(c.wsx + 80, c.yBf + 4, 930, c.yh - 6, 978, c.yh); p.bezierCurveTo(993, c.yh + 4, 1000, c.yh + 22, 1000, c.yh + 50); p.lineTo(999, yb - 30); }
      p.bezierCurveTo(997, yb - 8, 985, yb, 960, yb);
    }
    p.lineTo(c.fw + ra * Math.cos(th), c.ys); p.arc(c.fw, -c.r, ra, th, Math.PI - th, true);
    p.lineTo(c.rw + ra * Math.cos(th), c.ys); p.arc(c.rw, -c.r, ra, th, Math.PI - th, true);
    p.closePath(); return p;
  }
  function glassPath(c) {
    const p = new Path2D(), top = c.yr + (c.kind === 'sedan' ? 22 : 18);
    p.moveTo(c.xC0, c.yBr);
    if (c.kind === 'sedan') p.bezierCurveTo(c.xC0 + 20, c.yBr - 40, c.xC1 - 20, top + 10, c.xC1, top); else p.lineTo(c.xC1, top);
    p.quadraticCurveTo((c.xC1 + c.xA1) / 2, top - (c.kind === 'sedan' ? 9 : 2), c.xA1, top);
    p.bezierCurveTo(c.xA1 + 15, top + 4, c.xA0 - 10, c.yBf - 20, c.xA0, c.yBf);
    p.closePath(); return p;
  }
  function wheel(g, x, y, r, rot, rim) {
    const tg = g.createRadialGradient(x, y, r * 0.66, x, y, r); tg.addColorStop(0, '#2c2c2c'); tg.addColorStop(0.55, '#1b1b1b'); tg.addColorStop(1, '#0b0b0b');
    g.fillStyle = tg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    const R = r * 0.68;
    g.fillStyle = '#121214'; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
    const dg = g.createRadialGradient(x - R * 0.2, y - R * 0.2, 0, x, y, R * 0.8); dg.addColorStop(0, '#8a8a8a'); dg.addColorStop(1, '#4a4a4a');
    g.fillStyle = dg; g.beginPath(); g.arc(x, y, R * 0.78, 0, 7); g.fill();
    const n = rim.n * (rim.dbl ? 2 : 1), base = rim.col;
    for (let k = 0; k < n; k++) {
      const a = rot + (rim.dbl ? Math.floor(k / 2) * Math.PI * 2 / rim.n + (k % 2 ? 0.16 : -0.16) : k * Math.PI * 2 / n);
      const w0 = R * (rim.dbl ? 0.07 : 0.13), w1 = R * (rim.dbl ? 0.09 : 0.2), r0 = R * 0.2, r1 = R * 0.97;
      const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      g.beginPath(); g.moveTo(x + ca * r0 + px * w0, y + sa * r0 + py * w0); g.lineTo(x + ca * r1 + px * w1, y + sa * r1 + py * w1);
      g.lineTo(x + ca * r1 - px * w1, y + sa * r1 - py * w1); g.lineTo(x + ca * r0 - px * w0, y + sa * r0 - py * w0); g.closePath();
      const sg = g.createLinearGradient(x + px * w1, y + py * w1, x - px * w1, y - py * w1);
      if (rim.dark) { sg.addColorStop(0, '#4a4d52'); sg.addColorStop(1, '#1d1f22'); } else { sg.addColorStop(0, '#f4f5f6'); sg.addColorStop(0.5, base); sg.addColorStop(1, '#7d8287'); }
      g.fillStyle = sg; g.fill();
    }
    g.lineWidth = R * 0.09; g.strokeStyle = rim.dark ? '#3a3d42' : '#e2e4e6'; g.beginPath(); g.arc(x, y, R * 0.97, 0, 7); g.stroke();
    const hg = g.createRadialGradient(x - R * 0.06, y - R * 0.06, 0, x, y, R * 0.24); hg.addColorStop(0, rim.dark ? '#5a5d62' : '#ffffff'); hg.addColorStop(1, rim.dark ? '#202226' : '#8f9499');
    g.fillStyle = hg; g.beginPath(); g.arc(x, y, R * 0.22, 0, 7); g.fill();
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function lum(hex) { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))); return `rgb(${c.join(',')})`; }

  // кузов без колёс (колёса крутятся отдельно); o: { color, tint, taxi }
  function drawBody(g, type, o) {
    const c = M[type], body = bodyPath(c), glass = glassPath(c), col = o.color, dark = lum(col) < 0.25, { ra } = archPts(c);
    g.save(); g.beginPath(); g.rect(-50, -2000, 1100, 2000 + c.ys + 6); g.clip();
    for (const wx of [c.rw, c.fw]) { g.fillStyle = '#060606'; g.beginPath(); g.arc(wx, -c.r, ra - 1, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = col; g.fill(body);
    g.save(); g.clip(body);
    const top = c.yr, belt = c.yBf, f = v => Math.max(0, Math.min(1, (v - top) / (0 - top)));
    const vg = g.createLinearGradient(0, top, 0, 0), hi = dark ? 0.34 : 0.45;
    vg.addColorStop(0, `rgba(255,255,255,${hi * 0.7})`); vg.addColorStop(f(belt - 6), 'rgba(255,255,255,0.04)');
    vg.addColorStop(f(belt + 16), `rgba(255,255,255,${hi})`); vg.addColorStop(f(belt + 48), 'rgba(255,255,255,0.03)');
    vg.addColorStop(f((belt + c.ys) / 2 + 10), 'rgba(0,0,0,0.10)'); vg.addColorStop(f(c.ys - 40), `rgba(0,0,0,${dark ? 0.5 : 0.32})`);
    vg.addColorStop(f(c.ys - 22), 'rgba(255,255,255,0.10)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = vg; g.fillRect(-50, top - 20, 1100, -top + 40);
    const sy0 = (c.kind === 'sedan' ? c.yt : c.yBr) + 34, sy1 = c.yh + 28;
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(10, sy0); g.bezierCurveTo(300, sy0, 700, sy1 - 2, 995, sy1); g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(c.rw, c.ys - 26, c.fw - c.rw, 30);
    if (c.chrome) { const cy = c.ys - 34; g.fillStyle = '#c9ced3'; g.fillRect(c.rw + ra + 10, cy - 3, c.fw - c.rw - 2 * ra - 20, 6); }
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = c.flares ? 18 : 4;
    for (const wx of [c.rw, c.fw]) { g.beginPath(); g.arc(wx, -c.r, ra + (c.flares ? 6 : 1), Math.PI, 0); g.stroke(); }
    const pil = c.pil || [c.xB];
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2.5;
    for (const px of pil) { g.beginPath(); g.moveTo(px, c.yBr + 4); g.lineTo(px + 3, c.ys - 8); g.stroke(); }
    g.beginPath(); g.moveTo(c.xA0 - 4, c.yBf + 4); g.quadraticCurveTo(c.xA0 - 12, (c.yBf + c.ys) / 2, c.fw - ra - 14, c.ys - 8); g.stroke();
    g.restore();
    const gg = g.createLinearGradient(0, c.yr, 0, c.yBf);
    if (o.tint) { gg.addColorStop(0, '#2a3138'); gg.addColorStop(1, '#07090b'); } else { gg.addColorStop(0, '#5d7080'); gg.addColorStop(0.5, '#2b3844'); gg.addColorStop(1, '#141b22'); }
    g.fillStyle = gg; g.fill(glass);
    g.save(); g.clip(glass); g.fillStyle = 'rgba(255,255,255,0.14)'; const gx = c.xC1 + 40; g.beginPath(); g.moveTo(gx, c.yBr); g.lineTo(gx + 120, c.yr); g.lineTo(gx + 210, c.yr); g.lineTo(gx + 90, c.yBr); g.fill();
    g.fillStyle = '#0d0e10'; for (const px of pil) g.fillRect(px - 15, c.yr, 30, c.yBf - c.yr + 10);
    g.restore();
    g.strokeStyle = c.chrome ? '#c9ced3' : 'rgba(0,0,0,0.7)'; g.lineWidth = c.chrome ? 5 : 3; g.stroke(glass);
    // фары и фонари (сами огни — отдельно, при отрисовке кадра)
    g.fillStyle = '#e9eef2'; if (c.kind === 'box') { rr(g, 980, c.yh + 8, 20, 48, 6); g.fill(); } else { rr(g, 918, c.yh + 8, 80, 26, 10); g.fill(); }
    g.fillStyle = '#c2161d'; const ty = (c.kind === 'sedan' ? c.yt : c.yBr) + 8; rr(g, 1, ty, c.kind === 'sedan' ? 54 : 18, c.kind === 'sedan' ? 32 : 64, 5); g.fill();
    if (c.rails) { g.fillStyle = '#1b1c1e'; rr(g, 70, c.yr - 14, 560, 14, 6); g.fill(); }
    if (c.spare) { g.fillStyle = '#121212'; g.beginPath(); g.arc(-12, -238, 80, 0, 7); g.fill(); g.fillStyle = shade(col, -0.1); g.beginPath(); g.arc(-12, -238, 66, 0, 7); g.fill(); }
    if (o.taxi) {   // «шашечки» на крыше
      const x0 = (c.rx0 + c.rx1) / 2 - 70, y0 = c.yr - 34; g.fillStyle = '#ffd23f'; rr(g, x0, y0, 140, 32, 6); g.fill();
      g.fillStyle = '#111'; for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) g.fillRect(x0 + 7 + i * 18, y0 + 4 + j * 12, 18, 12);
      g.fillStyle = '#111'; g.fillRect(c.rw + 120, (c.yBf + c.ys) / 2 - 12, c.fw - c.rw - 240, 24);
      g.fillStyle = '#ffd23f'; for (let i = 0; i < 14; i++) g.fillRect(c.rw + 120 + i * 24 + ((i % 2) ? 12 : 0), (c.yBf + c.ys) / 2 - 12 + ((i % 2) ? 12 : 0), 12, 12);
    }
    // ночная тонировка: всё чуть синее и темнее
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8,12,40,0.38)'; g.fillRect(-100, -600, 1300, 700); g.globalCompositeOperation = 'source-over';
  }
  // спрайты: K пикселей на единицу модели (длина машины = 1000 единиц)
  const K = 0.42, sprites = new Map(), wheels = new Map();
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function carSprite(type, o) {
    const key = type + o.color + (o.taxi ? 't' : '') + (o.tint ? 'd' : '');
    if (!sprites.has(key)) { const cv = canvas(1140 * K, 480 * K), g = cv.getContext('2d'); g.scale(K, K); g.translate(110, 450); drawBody(g, type, o); sprites.set(key, cv); }
    return sprites.get(key);
  }
  function wheelSprite(type) {
    if (!wheels.has(type)) { const c = M[type], s = (c.r * 2 + 6) * K, cv = canvas(s, s), g = cv.getContext('2d'); g.scale(K, K); wheel(g, c.r + 3, c.r + 3, c.r, 0, c.rim);
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(8,12,40,0.35)'; g.fillRect(0, 0, 400, 400); wheels.set(type, cv); }
    return wheels.get(type);
  }

  // ===================== СЦЕНА =====================
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, R = (a, b) => a + rnd() * (b - a);
  const rand = (a, b) => a + Math.random() * (b - a), pickW = list => { let s = 0; list.forEach(i => s += i[1]); let r = Math.random() * s; for (const i of list) if ((r -= i[1]) < 0) return i[0]; return list[0][0]; };
  const VH = 1080, RT = 772;                 // высота сцены в «единицах»; верх тротуара
  const FAR_Y = 905, NEAR_Y = 1052, FAR_L = 236, NEAR_L = 318, MID_LINE = 948;
  const PAN = 34;                            // скорость «камеры» по улице, ед/с
  let cv, g, W = 0, sc = 1, VW = 0, raf = 0, last = 0, T = 0, pan = 0, el = null;
  let sky, far, mid, glowY, glowR, stars = [], beacons = [], signs = [], dynWin = [], plane = null, nextPlane = 6;
  const lanes = { far: { y: FAR_Y, L: FAR_L, dir: -1, cars: [], next: 0.5 }, near: { y: NEAR_Y, L: NEAR_L, dir: 1, cars: [], next: 1.5 } };
  let nextConvoy = rand(35, 60);
  const TRAFFIC = [[['granta', ['#d6d6d6', '#7a1a1a', '#2b3a55', '#b9b19a']], 3], [['camry', ['#101215', '#e8e8ea', '#5a5f66']], 3], [['taxi', ['#e8b81a']], 2],
    [['sclass', ['#0c0d10', '#3a3f48', '#e6e6e8']], 2], [['cruiser', ['#0e0f12', '#e6e6e6', '#3b3f2e']], 2], [['gelik', ['#0d0d0f', '#2b3b2a', '#e9e9e9']], 1.4], [['aurus', ['#0b0b0d']], 0.5]];

  function buildStatic() {
    const H = cv.height; sc = H / VH; VW = cv.width / sc;
    // небо
    sky = canvas(cv.width, H); let s = sky.getContext('2d'); s.scale(sc, sc);
    const sg = s.createLinearGradient(0, 0, 0, RT); sg.addColorStop(0, '#060919'); sg.addColorStop(0.55, '#161236'); sg.addColorStop(0.85, '#38194a'); sg.addColorStop(1, '#4a1f52');
    s.fillStyle = sg; s.fillRect(0, 0, VW, VH);
    const mx = VW * 0.78, my = 150, mg = s.createRadialGradient(mx, my, 0, mx, my, 170); mg.addColorStop(0, 'rgba(255,236,190,0.35)'); mg.addColorStop(1, 'rgba(255,236,190,0)');
    s.fillStyle = mg; s.fillRect(mx - 170, my - 170, 340, 340); s.fillStyle = '#fff1cf'; s.beginPath(); s.arc(mx, my, 42, 0, 7); s.fill();
    s.fillStyle = 'rgba(200,190,160,0.25)'; s.beginPath(); s.arc(mx - 12, my - 8, 9, 0, 7); s.arc(mx + 14, my + 10, 6, 0, 7); s.fill();
    seed = 3; stars = []; for (let i = 0; i < Math.round(VW / 9); i++) stars.push([R(0, VW), R(0, 560), R(0.7, 2), R(0, 6.28), R(0.6, 2.2)]);
    // дальние дома (плитка шириной 2400 с повтором)
    far = tile(2400, 2400 * sc, layerFar); mid = tile(1900, 1900 * sc, layerMid);
    glowY = glowSprite(160, '255,214,140'); glowR = glowSprite(60, '255,40,60');
  }
  function glowSprite(r, rgb) { const c = canvas(r * 2 * sc, r * 2 * sc), x = c.getContext('2d'), gr = x.createRadialGradient(r * sc, r * sc, 0, r * sc, r * sc, r * sc);
    gr.addColorStop(0, `rgba(${rgb},0.6)`); gr.addColorStop(0.35, `rgba(${rgb},0.22)`); gr.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height); return c; }
  function tile(tw, pw, draw) { const c = canvas(pw, RT * sc + 2), x = c.getContext('2d'); x.scale(sc, sc); draw(x, tw); return { cv: c, tw }; }
  function building(x, g2, bx, top, w, h, base, fill, winP, winA, ww, wh, sx, sy, tw, push) {
    for (const ox of (bx + w > tw ? [0, -tw] : [0])) {
      const X = bx + ox, gr = g2.createLinearGradient(0, top, 0, base); gr.addColorStop(0, shade(fill, 0.08)); gr.addColorStop(1, fill);
      g2.fillStyle = gr; g2.fillRect(X, top, w, h);
      for (let wy = top + 14; wy < base - 18; wy += sy) for (let wx = X + 9; wx < X + w - ww - 6; wx += sx) {
        const r = x();
        if (r < winP) { g2.fillStyle = x() < 0.82 ? '#ffcf7a' : '#a8dcff'; g2.globalAlpha = winA * (0.4 + 0.6 * x()); g2.fillRect(wx, wy, ww, wh); g2.globalAlpha = 1; }
        else if (push && ox === 0 && r < winP + 0.012) push(wx, wy, ww, wh);
      }
    }
  }
  function layerFar(x, tw) {
    seed = 17; beacons = []; let bx = 0, n = 0;
    while (bx < tw) {
      n++; const city = bx > 1000 && bx < 1450, w = city ? R(70, 110) : R(60, 140), h = city ? R(470, 640) : R(190, 420), base = RT - 6, top = base - h;
      if (city) {   // «Москва-Сити»: стеклянные башни с вертикальными полосами света
        const gr = x.createLinearGradient(bx, 0, bx + w, 0); gr.addColorStop(0, '#1a2550'); gr.addColorStop(0.5, '#243266'); gr.addColorStop(1, '#141c40');
        x.fillStyle = gr; x.beginPath(); x.moveTo(bx, base); x.lineTo(bx, top + 30); x.lineTo(bx + w * 0.5, top); x.lineTo(bx + w, top + 18); x.lineTo(bx + w, base); x.fill();
        x.fillStyle = 'rgba(140,190,255,0.22)'; for (let k = bx + 8; k < bx + w - 4; k += 12) x.fillRect(k, top + 40, 2, h - 50);
        for (let wy = top + 50; wy < base - 20; wy += 16) if (rnd() < 0.5) { x.fillStyle = 'rgba(160,210,255,0.35)'; x.fillRect(bx + 6, wy, w - 12, 2); }
        beacons.push([bx + w * 0.5, top - 4, R(0, 6)]);
      } else {
        building(rnd, x, bx, top, w, h, base, '#131938', 0.2, 0.55, 7, 9, 15, 19, tw);
        if (h > 360 && rnd() < 0.6) { x.fillStyle = '#131938'; x.fillRect(bx + w / 2 - 2, top - 50, 4, 50); beacons.push([bx + w / 2, top - 52, R(0, 6)]); }
      }
      bx += w + R(2, 14);
    }
    const hz = x.createLinearGradient(0, RT - 280, 0, RT); hz.addColorStop(0, 'rgba(110,45,120,0)'); hz.addColorStop(1, 'rgba(110,45,120,0.38)'); x.fillStyle = hz; x.fillRect(0, RT - 280, tw, 280);
  }
  function layerMid(x, tw) {
    seed = 29; signs = []; dynWin = []; let bx = 0;
    const SIGNS = [['АВТОСАЛОН', '#46e6ff'], ['24 ЧАСА', '#ff4fa3'], ['ШИНОМОНТАЖ', '#ffd23f'], ['КАФЕ', '#ff4fa3'], ['НОМЕРА', '#46e6ff'], ['АПТЕКА', '#43f08a']];
    let si = 0;
    while (bx < tw) {
      const w = R(120, 230), h = R(130, 330), base = RT, top = base - h;
      building(rnd, x, bx, top, w, h, base, '#0b0f24', 0.28, 0.95, 10, 13, 20, 25, tw, (wx, wy, ww, wh) => dynWin.push([wx, wy, ww, wh, Math.random() < 0.5, rand(2, 14)]));
      x.fillStyle = '#080b1a'; x.fillRect(bx - 4, top - 6, w + 8, 8);   // карниз
      if (rnd() < 0.55 && w > 150) {   // витрина первого этажа и вывеска
        const sg = x.createLinearGradient(0, base - 46, 0, base); sg.addColorStop(0, 'rgba(255,190,110,0.45)'); sg.addColorStop(1, 'rgba(255,190,110,0.1)');
        x.fillStyle = sg; x.fillRect(bx + 10, base - 46, w - 20, 40);
        const sn = SIGNS[si++ % SIGNS.length]; signs.push([bx + w / 2, base - 62, sn[0], sn[1], Math.random() < 0.3]);
      }
      bx += w + R(6, 30);
    }
  }

  function spawn(lane, type, color, speed, extra) {
    const taxi = type === 'taxi', t = taxi ? 'camry' : type, o = { color, taxi, tint: t === 'aurus' || t === 'gelik' || (extra && extra.tint) };
    const car = { type: t, o, sp: carSprite(t, o), wh: wheelSprite(t), L: lane.L * (t === 'gelik' || t === 'cruiser' ? 1.02 : t === 'granta' ? 0.93 : 1), speed, rot: 0, mig: extra && extra.mig };
    car.x = lane.dir > 0 ? -car.L - 40 - (extra && extra.back || 0) : VW + 40 + (extra && extra.back || 0);
    lane.cars.push(car); return car;
  }
  function spawnTraffic(lane) {
    const [type, cols] = pickW(TRAFFIC);
    spawn(lane, type, cols[Math.floor(Math.random() * cols.length)], lane.dir > 0 ? rand(170, 300) : rand(130, 240));
  }
  function convoy() {   // кортеж: чёрный Гелик, Aurus с мигалкой, Гелик
    const lane = lanes.near, sp = 360, gap = lane.L * 1.18;
    lane.cars = lane.cars.filter(c => c.x > VW * 0.35);   // освобождаем полосу позади
    spawn(lane, 'gelik', '#2a2d35', sp, { mig: true });   // чёрный «с блеском»: чистый #000 ночью сливается с дорогой
    spawn(lane, 'aurus', '#262932', sp, { mig: true, back: gap });
    spawn(lane, 'gelik', '#2a2d35', sp, { mig: true, back: gap * 2 });
  }

  function drawCar(car, gy) {
    const c = M[car.type], f = car.L / 1000, dir = car.dir;
    g.save(); g.translate(car.x, gy);
    if (dir < 0) { g.translate(car.L, 0); g.scale(-f, f); } else g.scale(f, f);
    // тень
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.beginPath(); g.ellipse(500, 4, 520, 22, 0, 0, 7); g.fill();
    g.drawImage(car.sp, -110, -450, car.sp.width / K, car.sp.height / K);
    const ws = car.wh, d = ws.width / K;
    for (const wx of [c.rw, c.fw]) { g.save(); g.translate(wx, -c.r); g.rotate(car.rot); g.drawImage(ws, -d / 2, -d / 2, d, d); g.restore(); }
    if (car.mig) {   // мигалка: синий/красный попеременно
      const mx = (c.rx0 + c.rx1) / 2 + 40, my = c.yr - 10, ph = Math.floor((T + car.L * 0.01) * 7) % 4, col = ph < 2 ? '60,120,255' : '255,40,60';
      g.fillStyle = '#151515'; rr(g, mx - 30, my - 6, 60, 12, 4); g.fill();
      g.fillStyle = ph % 2 ? `rgb(${col})` : '#1a2440'; g.beginPath(); g.ellipse(mx, my - 6, 22, 20, 0, Math.PI, 0); g.fill();
      if (ph % 2) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(mx, my - 12, 0, mx, my - 12, 420); gr.addColorStop(0, `rgba(${col},0.75)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(mx - 420, my - 432, 840, 840); g.globalCompositeOperation = 'source-over'; }
    }
    g.restore();
  }
  function carLights(car, gy) {   // фары, фонари и их отражения на мокром асфальте (поверх всех машин, режим «lighter»)
    const c = M[car.type], f = car.L / 1000, dir = car.dir;
    const ux = u => dir > 0 ? car.x + u * f : car.x + (1000 - u) * f, vy = v => gy + v * f;
    const hx = ux(998), hy = vy(c.yh + 20), tx = ux(4), ty = vy((c.kind === 'sedan' ? c.yt : c.yBr) + 26), reach = car.L * 2.1;
    const bg = g.createLinearGradient(hx, 0, hx + dir * reach, 0); bg.addColorStop(0, 'rgba(255,240,205,0.34)'); bg.addColorStop(1, 'rgba(255,240,205,0)');
    g.fillStyle = bg; g.beginPath(); g.moveTo(hx, hy - 6 * f * 10); g.lineTo(hx + dir * reach, hy - car.L * 0.16); g.lineTo(hx + dir * reach, gy + car.L * 0.06); g.lineTo(hx, hy + 6 * f * 10); g.closePath(); g.fill();
    const s1 = car.L * 0.22; g.drawImage(glowY, hx - s1, hy - s1, s1 * 2, s1 * 2);
    const s2 = car.L * 0.14; g.drawImage(glowR, tx - s2, ty - s2, s2 * 2, s2 * 2);
    // отражения: вертикальные блики под огнями
    const rf = (x, y, rgb, a, w) => { const gr = g.createLinearGradient(0, gy, 0, gy + car.L * 0.32); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - w / 2, gy, w, car.L * 0.32); };
    rf(hx, hy, '255,235,190', 0.22, car.L * 0.06); rf(tx, ty, '255,50,60', 0.2, car.L * 0.05);
  }

  let dprCap = 2, slow = 0, slowT = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const raw = (now - (last || now)) / 1000, dt = Math.min(0.05, raw); last = now; if (document.hidden) return;
    if (!sky) { resize(); if (!sky) return; for (let i = 0; i < 160; i++) step(0.05); }
    // слабое устройство: если кадры долго идут медленнее ~25 к/с, рисуем фон в меньшем разрешении
    if (raw > 0 && raw < 0.5 && dprCap > 1) { slowT += raw; if (raw > 0.04) slow += raw; if (slowT > 4) { if (slow / slowT > 0.5) { dprCap = 1; resize(); } slow = slowT = 0; } }
    step(dt);
  }
  function step(dt) {
    T += dt; pan += PAN * dt;
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(sky, 0, 0); g.setTransform(sc, 0, 0, sc, 0, 0);
    // звёзды мерцают
    for (const s of stars) { g.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(T * s[4] + s[3])); g.fillStyle = '#fff'; g.fillRect(s[0], s[1], s[2], s[2]); } g.globalAlpha = 1;
    // самолёт
    if ((nextPlane -= dt) < 0 && !plane) { plane = { x: -40, y: rand(70, 240), v: rand(45, 70) }; nextPlane = rand(22, 40); }
    if (plane) { plane.x += plane.v * dt; const on = Math.floor(T * 1.6) % 2; g.fillStyle = '#ff3d5a'; g.fillRect(plane.x, plane.y, 3, 3); if (on) { g.fillStyle = '#fff'; g.fillRect(plane.x + 14, plane.y + 1, 3, 3); g.drawImage(glowY, plane.x + 5, plane.y - 9, 20, 20); } if (plane.x > VW + 40) plane = null; }
    // дальний слой
    const fo = -((pan * 0.18) % far.tw);
    for (let x = fo; x < VW; x += far.tw) g.drawImage(far.cv, x, 0, far.tw, far.cv.height / sc);
    for (const b of beacons) { const a = 0.5 + 0.5 * Math.sin(T * 2.4 + b[2]); if (a < 0.35) continue; for (let x = fo; x < VW + far.tw; x += far.tw) { const bx = b[0] + x; if (bx < -20 || bx > VW + 20) continue; g.globalAlpha = a; g.fillStyle = '#ff3d5a'; g.fillRect(bx - 2, b[1] - 2, 4, 4); g.drawImage(glowR, bx - 14, b[1] - 14, 28, 28); g.globalAlpha = 1; } }
    // ближний слой домов, окна включаются/гаснут, вывески мерцают
    const mo = -((pan * 0.45) % mid.tw);
    for (let x = mo; x < VW; x += mid.tw) {
      g.drawImage(mid.cv, x, 0, mid.tw, mid.cv.height / sc);
      for (const w of dynWin) { if ((w[5] -= dt / 2) < 0) { w[4] = !w[4]; w[5] = rand(3, 16); } if (w[4]) { g.fillStyle = 'rgba(255,207,122,0.85)'; g.fillRect(w[0] + x, w[1], w[2], w[3]); } }
      g.textAlign = 'center'; g.font = 'bold 22px Arial';
      for (const s of signs) { const sx = s[0] + x; if (sx < -200 || sx > VW + 200) continue; const flick = s[4] && Math.sin(T * 23) > 0.6 && Math.sin(T * 3.1) > 0.3; g.globalAlpha = flick ? 0.25 : 1; g.shadowColor = s[3]; g.shadowBlur = 16; g.fillStyle = s[3]; g.fillText(s[2], sx, s[1]); g.shadowBlur = 0; g.globalAlpha = 1; }
    }
    // тротуар и дорога
    g.fillStyle = '#171c34'; g.fillRect(0, RT, VW, 22); g.fillStyle = '#262d4d'; g.fillRect(0, RT, VW, 3);
    const rg = g.createLinearGradient(0, RT + 22, 0, VH); rg.addColorStop(0, '#0e1122'); rg.addColorStop(1, '#06070e'); g.fillStyle = rg; g.fillRect(0, RT + 22, VW, VH - RT - 22);
    const dash = 110, dofs = -(pan % dash); g.fillStyle = 'rgba(225,230,245,0.5)'; for (let x = dofs; x < VW; x += dash) g.fillRect(x, MID_LINE, 62, 5);
    g.fillStyle = 'rgba(225,230,245,0.22)'; g.fillRect(0, VH - 12, VW, 4);
    // фонари на тротуаре и их отражения
    const lsp = 430, lofs = -(pan % lsp) + 60;
    for (let x = lofs; x < VW + 60; x += lsp) {
      g.fillStyle = '#151a30'; g.fillRect(x, RT - 236, 7, 250); g.fillRect(x, RT - 240, 46, 7);
      g.globalCompositeOperation = 'lighter'; g.drawImage(glowY, x + 40 - 150, RT - 236 - 150, 300, 300);
      g.save(); g.translate(x + 40, RT + 22); g.scale(1, 5.5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 34); gr.addColorStop(0, 'rgba(255,205,130,0.13)'); gr.addColorStop(1, 'rgba(255,205,130,0)');
      g.fillStyle = gr; g.fillRect(-34, 0, 68, 34); g.restore();   // размытый блик на мокром асфальте
      g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffe9b8'; g.fillRect(x + 32, RT - 234, 16, 5);
    }
    // машины
    if ((nextConvoy -= dt) < 0) { convoy(); nextConvoy = rand(45, 75); }
    for (const key of ['far', 'near']) {
      const lane = lanes[key];
      if ((lane.next -= dt) < 0) { const lastCar = lane.cars[lane.cars.length - 1], room = !lastCar || (lane.dir > 0 ? lastCar.x > lane.L * 0.6 : lastCar.x < VW - lane.L * 1.6); if (room) spawnTraffic(lane); lane.next = rand(1.1, 3.2); }
      lane.cars.forEach((c, i) => {
        c.dir = lane.dir; const lead = lane.cars[i - 1];
        if (lead) { const gap = lane.dir > 0 ? lead.x - (c.x + c.L) : c.x - (lead.x + lead.L); if (gap < lane.L * 0.35) c.speed = Math.min(c.speed, lead.speed); }
        c.x += (lane.dir > 0 ? c.speed - PAN : -c.speed - PAN) * dt;
        c.rot += c.speed * dt / (M[c.type].r * c.L / 1000);
      });
      lane.cars = lane.cars.filter(c => lane.dir > 0 ? c.x < VW + 60 : c.x > -c.L * 3.2);
      for (const c of lane.cars) drawCar(c, lane.y);
      g.globalCompositeOperation = 'lighter'; for (const c of lane.cars) carLights(c, lane.y); g.globalCompositeOperation = 'source-over';
    }
    // затемнение к краям, чтобы центр с интерфейсом читался
    const vg = g.createRadialGradient(VW / 2, VH * 0.5, VH * 0.35, VW / 2, VH * 0.5, Math.max(VW, VH) * 0.8); vg.addColorStop(0, 'rgba(4,5,12,0)'); vg.addColorStop(1, 'rgba(4,5,12,0.55)');
    g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
  }
  function resize() {
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap), w = Math.round(el.clientWidth * dpr), h = Math.round(el.clientHeight * dpr);
    if (!w || !h) return;                       // окно ещё без размера (фоновая вкладка) — повторим в следующем кадре
    if (sky && w === cv.width && h === cv.height) return; cv.width = w; cv.height = h; buildStatic();
  }
  window.BgCity = {
    start(target) {
      if (cv) return;
      el = target; el.style.animation = 'none'; el.style.background = '#06070e';
      cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
      el.appendChild(cv); g = cv.getContext('2d');
      resize(); addEventListener('resize', resize);
      lanes.far.cars = []; lanes.near.cars = [];
      if (sky) for (let i = 0; i < 160; i++) step(0.05);   // «прогрев» 8 с: на старте на дороге уже есть машины
      last = 0; raf = requestAnimationFrame(frame);
    },
    stop() {   // выключить: вернуть обычный фон из style.css
      if (!cv) return; cancelAnimationFrame(raf); removeEventListener('resize', resize);
      cv.remove(); cv = g = sky = null; el.style.animation = ''; el.style.background = '';
    },
    event(name) { if (name === 'legend' && cv) convoy(); }
  };
})();
