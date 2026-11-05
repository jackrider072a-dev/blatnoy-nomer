// =====================================================================
// ПЛАТФОРМЫ: единый интерфейс к игровым площадкам (CrazyGames, Яндекс Игры, VK, ...).
// Игра обращается только к Platform.*, а всё, что зависит от площадки, живёт в адаптерах ниже.
//
// Новая площадка = новый объект-адаптер в ADAPTERS:
//   name           — короткое имя ("cg", "ya", "vk", ...), доступно игре как Platform.name
//   detect()       — true, если игра запущена на этой площадке (по адресу страницы или по уже загруженному SDK)
//   script         — адрес SDK площадки (необязательно); не загрузился — играем локально
//   init(ctx)      — Promise; ctx.pause(bool) — пауза игры и звука, ctx.mute(bool) — площадка просит выключить звук,
//                    ctx.lang(код) — язык игрока, ctx.ads() — реклама стала недоступна (спрятать её кнопки)
//   rewarded()     — Promise<boolean>: показать рекламу за награду, true — награду нужно выдать.
//                    Ставит игру на паузу сам — тогда, когда реклама реально началась
//   interstitial() — Promise: показать межстраничную рекламу (паузу тоже ставит сам)
//   adsOK          — false, если реклама сейчас невозможна (блокировщик, пробный запуск); по умолчанию true
//   load()         — Promise<сохранение|null> из облака площадки (необязательно)
//   save(obj, now) — Promise: записать сохранение в облако; now — сразу, без задержек площадки
//   primary        — true: облако площадки — главное хранилище, оно всегда важнее локального сохранения
//   happytime()    — площадка празднует большое достижение игрока (необязательно)
// Адаптеры проверяются по порядку, выбирается первый, чей detect() вернул true.
// =====================================================================

// Площадка не найдена или SDK недоступен: реклама сразу даёт награду, облака нет (сохранение только в localStorage)
const LOCAL_ADAPTER = {
  name: "",
  detect: () => true,
  init: () => Promise.resolve(),
  rewarded: () => Promise.resolve(true),
  interstitial: () => Promise.resolve()
};

// ----- CrazyGames: SDK подключается тегом <script> в index.html сборки для CrazyGames (см. build.ps1)
// Сохранение — через Data Module (работает и для гостей, и для вошедших игроков); реклама — через SDK.
// На пробном запуске (Basic Launch) реклама у CrazyGames выключена, а кнопки рекламы «без эффекта» запрещены,
// поэтому реклама включается только в сборке с флагом: build.ps1 -CrazyGamesAds (он ставит window.CG_ADS = true).
const CG_ADAPTER = (() => {
  let sdk = null, ctx = null, adsOff = window.CG_ADS !== true;
  const KEY = "save";
  const off = () => { if (!adsOff) { adsOff = true; ctx.ads(); } };
  const ad = type => new Promise(res => {
    let started = false;
    try {
      sdk.ad.requestAd(type, {
        adStarted: () => { started = true; ctx.pause(true); },   // звук глушим только когда реклама реально пошла
        adFinished: () => { if (started) ctx.pause(false); res(true); },
        adError: e => {
          if (started) ctx.pause(false);
          if (e && (e.code === "adblock" || e.code === "adsDisabledBasicLaunch")) off();
          res(false);
        }
      });
    } catch (e) { res(false); }
  });
  return {
    name: "cg",
    primary: true,
    detect: () => !!(window.CrazyGames && window.CrazyGames.SDK),
    init(c) {
      ctx = c; sdk = window.CrazyGames.SDK;
      return sdk.init().then(() => {
        // вне crazygames.com (и не на localhost) SDK отключён и бросает ошибки на любой вызов — играем локально
        if (sdk.environment !== "crazygames" && sdk.environment !== "local") throw new Error("CrazyGames SDK: " + sdk.environment);
        let locale = "";
        try { locale = sdk.user.systemInfo.locale; } catch (e) {}
        ctx.lang(locale || "en");                              // нет языка — английский (требование CrazyGames)
        const applyMute = s => ctx.mute(!!(s && s.muteAudio));
        try { applyMute(sdk.game.settings); sdk.game.addSettingsChangeListener(applyMute); } catch (e) {}
        try { sdk.game.gameplayStart(); } catch (e) {}          // игрок сразу попадает в игру — без меню и загрузок
        sdk.ad.hasAdblock().then(b => { if (b) off(); }).catch(() => {});
      });
    },
    get adsOK() { return !adsOff; },
    rewarded: () => ad("rewarded"),
    interstitial: () => ad("midgame"),
    happytime() { try { sdk.game.happytime(); } catch (e) {} },
    load() {
      try { const s = sdk.data.getItem(KEY); return Promise.resolve(s ? JSON.parse(s) : null); }
      catch (e) { return Promise.reject(e); }
    },
    save(obj) {
      try { sdk.data.setItem(KEY, JSON.stringify(obj)); return Promise.resolve(); }   // SDK сам копит изменения и отправляет раз в секунду
      catch (e) { return Promise.reject(e); }
    }
  };
})();

// ----- VK: внутри VK в адресе есть vk_app_id/vk_user_id (или ?platform=vk для проверки)
// VK Storage хранит до 4096 байт на ключ, поэтому сохранение режется на куски bn_0..bn_N, а bn_n хранит их число.
const VK_ADAPTER = (() => {
  let q = Promise.resolve(), ctx = null;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const show = format => { ctx.pause(true); return vkBridge.send("VKWebAppShowNativeAds", { ad_format: format }).finally(() => ctx.pause(false)); };
  return {
    name: "vk",
    detect: () => /[?&](vk_app_id|vk_user_id)=/.test(location.search) || /[?&]platform=vk\b/.test(location.search),
    script: "vk-bridge.min.js",                          // лежит в сборке: сторонний CDN может не ответить, и ВК зависнет на загрузке
    noInterstitial: true,                                // межстраничная — только во время явной загрузки (правила VK, п. 5.1.5.1), у нас таких экранов нет
    init(c) {
      ctx = c;
      // язык — из настроек ВКонтакте (п. 3.1.2); нет параметра — русский
      const vl = new URLSearchParams(location.search).get("vk_language");
      ctx.lang(vl === "ua" ? "uk" : vl || "ru");
      if (!window.vkBridge) return Promise.reject();
      return vkBridge.send("VKWebAppInit").then(() => {
        try { vkBridge.subscribe(e => { const t = e && e.detail && e.detail.type; if (t === "VKWebAppViewHide") ctx.pause(true); if (t === "VKWebAppViewRestore") ctx.pause(false); }); } catch (e) {}
      });
    },
    rewarded: () => show("reward").then(r => !!(r && r.result), () => false),
    interstitial: () => show("interstitial").catch(() => {}),
    load() {
      return vkBridge.send("VKWebAppStorageGet", { keys: ["bn_n"] }).then(r => {
        const n = +(((r.keys || [])[0] || {}).value) || 0;
        if (!n) return null;
        const keys = []; for (let i = 0; i < n; i++) keys.push("bn_" + i);
        return vkBridge.send("VKWebAppStorageGet", { keys }).then(r2 => {
          const m = {}; (r2.keys || []).forEach(k => { m[k.key] = k.value; });
          let str = ""; for (let i = 0; i < n; i++) str += m["bn_" + i] || "";
          try { return JSON.parse(str); } catch (e) { return null; }
        });
      });
    },
    save(obj) {
      const str = JSON.stringify(obj), parts = [];
      for (let i = 0; i < str.length; i += 1500) parts.push(str.slice(i, i + 1500));
      const job = q.then(async () => {
        for (let i = 0; i < parts.length; i++) { await vkBridge.send("VKWebAppStorageSet", { key: "bn_" + i, value: parts[i] }); await wait(400); }
        await vkBridge.send("VKWebAppStorageSet", { key: "bn_n", value: String(parts.length) });
      });
      q = job.catch(() => {});
      return job;
    }
  };
})();

// ----- Яндекс Игры: SDK отдаётся самой площадкой по адресу /sdk.js; вне Яндекса его нет — тогда играем локально
const YA_ADAPTER = (() => {
  let ysdk = null, player = null, ctx = null;
  const show = (method, extra) => new Promise(res => {
    let done = false; const end = v => { if (!done) { done = true; ctx.pause(false); res(v); } };
    const cb = Object.assign({ onOpen: () => ctx.pause(true), onClose: () => end(false), onError: () => end(false) }, extra && extra(end));
    try { ysdk.adv[method]({ callbacks: cb }); } catch (e) { end(false); }
  });
  return {
    name: "ya",
    detect: () => true,
    script: "/sdk.js",
    init(c) {
      ctx = c;
      if (!window.YaGames) return Promise.reject();
      return YaGames.init().then(y => {
        ysdk = y;
        try { ctx.lang(ysdk.environment.i18n.lang || "ru"); } catch (e) {}   // автоопределение языка (п. 2.14)
        try { ysdk.on("game_api_pause", () => ctx.pause(true)); ysdk.on("game_api_resume", () => ctx.pause(false)); } catch (e) {}
        try { ysdk.features.LoadingAPI && ysdk.features.LoadingAPI.ready(); } catch (e) {}
      });
    },
    rewarded: () => show("showRewardedVideo", end => { let ok = false; return { onRewarded: () => { ok = true; }, onClose: () => end(ok) }; }),
    interstitial: () => show("showFullscreenAdv"),
    load: () => ysdk.getPlayer().then(p => { player = p; return p.getData(["save"]); }).then(d => d && d.save),
    save: (obj, now) => player ? player.setData({ save: obj }, !!now) : Promise.reject()
  };
})();

// ----- Telegram Mini App: Telegram передаёт параметры запуска в адресе (#tgWebAppData=...), ?platform=tg — для проверки в обычном браузере.
// telegram-web-app.js лежит в сборке (telegram.org в РФ бывает недоступен) и грузится уже после старта игры, не задерживая страницу.
// CloudStorage хранит до 4096 символов на ключ, поэтому сохранение режется на куски, как в VK. Рекламы в Telegram нет — кнопки рекламы скрыты.
const TG_ADAPTER = (() => {
  let tg = null, q = Promise.resolve();
  const SERVER = "https://blatnoy-nomer.blatnoy.workers.dev";   // server/ — Cloudflare Worker: игроки и проверка подписки на канал
  // запрос к серверу с подписанными данными запуска; null — сервер недоступен (сеть, блокировка) или нет данных Telegram
  // raw — вернуть ответ как есть, даже с ошибкой (админке нужен текст ошибки)
  const api = (path, extra, raw) => !tg || !tg.initData ? Promise.resolve(null) :
    Promise.race([fetch(SERVER + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ initData: tg.initData }, extra)) })
      .then(r => r.json()).then(j => raw ? j : j && j.ok ? j : null), new Promise(r => setTimeout(() => r(null), raw ? 20000 : 8000))]).catch(() => null);
  const call = (fn, ...a) => new Promise((ok, fail) => tg.CloudStorage[fn](...a, (e, r) => e ? fail(e) : ok(r)));
  const has = v => tg.isVersionAtLeast && tg.isVersionAtLeast(v);
  return {
    name: "tg",
    detect: () => window.TG_BUILD === true || /tgWebAppData=|tgWebAppVersion=/.test(location.hash) || /[?&]platform=tg\b/.test(location.search),
    noInterstitial: true,
    adsOK: false,
    init(ctx) {
      if (window.Telegram && Telegram.WebApp) return this.start(ctx);
      const load = src => new Promise((ok, fail) => {
        const s = document.createElement("script");
        s.src = src; s.onload = ok; s.onerror = fail;
        document.head.appendChild(s);
      });
      return load("telegram-web-app.js").catch(() => load("https://telegram.org/js/telegram-web-app.js")).catch(() => {}).then(() => this.start(ctx));
    },
    start(ctx) {
      setTimeout(() => ctx.ads(), 0);                              // когда Platform уже переключится на этот адаптер — спрятать кнопки рекламы
      if (!window.Telegram || !Telegram.WebApp) {                  // SDK не загрузился: остаёмся Telegram-версией без рекламы, но без облака
        this.load = this.save = this.openLink = null; ctx.lang("ru"); return Promise.resolve();
      }
      tg = Telegram.WebApp;
      const u = tg.initDataUnsafe && tg.initDataUnsafe.user;
      ctx.lang((u && u.language_code) || "ru");
      try {
        tg.ready(); tg.expand();                                   // сразу на всю высоту, а не половину экрана
        if (has("7.7")) tg.disableVerticalSwipes();                // свайп вниз по списку не сворачивает и не закрывает игру
        if (has("6.1")) { tg.setHeaderColor("#1b2133"); tg.setBackgroundColor("#0b0e16"); }
        if (has("7.10")) tg.setBottomBarColor("#121726");
        if (has("8.0")) { tg.onEvent("deactivated", () => ctx.pause(true)); tg.onEvent("activated", () => ctx.pause(false)); }
        if (has("6.1")) document.addEventListener("click", e => { if (e.target.closest("button")) tg.HapticFeedback.impactOccurred("light"); }, true);
      } catch (e) {}
      if (!has("6.9")) this.load = this.save = null;               // старый клиент без облака — только localStorage
      return Promise.resolve();
    },
    rewarded: () => Promise.resolve(false),
    interstitial: () => Promise.resolve(),
    happytime() { try { tg.HapticFeedback.notificationOccurred("success"); } catch (e) {} },
    // t.me открывается внутри Telegram, остальные ссылки — во внешнем браузере (window.open в мини-аппе не работает)
    openLink(url) { try { /^https:\/\/t\.me\//.test(url) ? tg.openTelegramLink(url) : tg.openLink(url); } catch (e) { window.open(url, "_blank"); } },
    // hello → { sub: подписан на канал, notify: боту можно писать } или null; checkSub → true/false, null — проверить нельзя
    hello: () => api("/api/hello"),
    checkSub: () => api("/api/sub").then(j => j && j.sub),
    // состояние для напоминаний; text/plain + keepalive — дойдёт и при закрытии игры, без предварительного запроса CORS
    state(obj) {
      if (!tg || !tg.initData) return;
      try { fetch(SERVER + "/api/state", { method: "POST", keepalive: true, headers: { "Content-Type": "text/plain" }, body: JSON.stringify(Object.assign({ initData: tg.initData }, obj)) }).catch(() => {}); } catch (e) {}
    },
    // системный запрос Telegram «разрешить боту писать вам»; true — разрешил
    askNotify: () => new Promise(res => {
      if (!tg || !has("6.9")) return res(false);
      try { tg.requestWriteAccess(ok => { if (ok) api("/api/notify", { on: 1 }); res(!!ok); }); } catch (e) { res(false); }
    }),
    // ссылка-приглашение: друг попадает прямо в игру, сервер узнаёт, кто позвал (startapp=ref_ID)
    get refLink() { const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; return u ? `https://t.me/blatnoy_nomerbot/play?startapp=ref_${u.id}` : ""; },
    top: () => api("/api/top"),
    garage: who => api("/api/garage", who),                     // who: { top: место } или { uid: друг }
    respect: who => api("/api/respect", who),
    friends: () => api("/api/friends"),                         // { list, inc: заявки мне, out, code }
    friend: (a, extra) => api("/api/friend", Object.assign({ a }, extra), true),   // raw: текст ошибки («код не найден») — для игрока   // add (code | top) | accept | decline | cancel | remove
    admin: (a, extra) => api("/api/admin", Object.assign({ a }, extra), true),   // админка: сервер пускает только владельца (ADMIN_ID)
    // поделиться: красивое сообщение с кнопкой (Telegram 8.0+), иначе — обычное окно «переслать» со ссылкой
    share(text) {
      const plain = () => { try { tg.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(this.refLink) + "&text=" + encodeURIComponent(text)); return true; } catch (e) { return false; } };
      if (!tg) return Promise.resolve(false);
      if (!has("8.0")) return Promise.resolve(plain());
      return api("/api/share", { text }).then(j => !j || !j.id ? plain() :
        new Promise(res => { try { tg.shareMessage(j.id, ok => res(!!ok)); } catch (e) { res(plain()); } }));
    },
    // покупка за звёзды: счёт от сервера → окно оплаты Telegram → "paid" | "cancelled" | "failed" | "pending" | "noserver"
    get canPay() { return !!(tg && tg.initData && has("6.1")); },
    buy: item => api("/api/invoice", { item }).then(j => !j || !j.link ? "noserver" :
      new Promise(res => { try { tg.openInvoice(j.link, st => res(st)); } catch (e) { res("failed"); } })),
    // оплаченные, но ещё не выданные покупки: [{ id, item }]; null — сервер недоступен
    claim: () => api("/api/claim").then(j => j ? Object.assign(j.items || [], { ev: j.ev }) : null),   // ev — событие из админки (×доход/×удача)
    load() {
      return call("getItem", "bn_n").then(v => {
        const n = +v || 0;
        if (!n) return null;
        const keys = []; for (let i = 0; i < n; i++) keys.push("bn_" + i);
        return call("getItems", keys).then(m => {
          let str = ""; for (let i = 0; i < n; i++) str += m["bn_" + i] || "";
          try { return JSON.parse(str); } catch (e) { return null; }
        });
      });
    },
    save(obj) {
      const str = JSON.stringify(obj), parts = [];
      for (let i = 0; i < str.length; i += 4000) parts.push(str.slice(i, i + 4000));
      const job = q.then(async () => {
        for (let i = 0; i < parts.length; i++) await call("setItem", "bn_" + i, parts[i]);
        await call("setItem", "bn_n", String(parts.length));
      });
      q = job.catch(() => {});
      return job;
    }
  };
})();

const ADAPTERS = [CG_ADAPTER, TG_ADAPTER, VK_ADAPTER, YA_ADAPTER];

const Platform = (() => {
  const INTERSTITIAL_GAP = 120000;   // межстраничная реклама не чаще раза в 2 минуты после любой рекламы
  let a = LOCAL_ADAPTER, lastAd = 0;
  const ctx = { pause() {}, mute() {}, lang() {}, ads() {}, busy() {} };
  const loadScript = src => new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = src; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  });
  // пока реклама ищется и показывается, игра не принимает нажатий (ctx.busy)
  const blocking = show => { ctx.busy(true); return show().finally(() => { ctx.busy(false); lastAd = Date.now(); }); };

  return {
    get name() { return a.name; },                        // "cg" | "ya" | "vk" | "tg" | "" (локально)
    get hasCloud() { return !!(a.load && a.save); },
    get primary() { return !!a.primary; },
    get adsOK() { return a.adsOK !== false; },
    // hooks: { pause(bool), mute(bool), lang(код), ads(), busy(bool) }; Promise выполняется, когда площадка готова (или выбран локальный режим)
    init(hooks) {
      Object.assign(ctx, hooks);
      const cand = ADAPTERS.find(x => x.detect()) || LOCAL_ADAPTER;
      return (cand.script ? loadScript(cand.script) : Promise.resolve())
        .then(() => cand.init(ctx))
        .then(() => { a = cand; }, () => {});             // SDK не загрузился или не инициализировался — локальный режим
    },
    rewarded() {
      if (!a.name) return a.rewarded();                   // локально награда сразу, без паузы и блокировки
      if (!this.adsOK) return Promise.resolve(false);
      return blocking(() => a.rewarded().catch(() => false));
    },
    interstitial() {
      if (!a.name || a.noInterstitial || !this.adsOK || Date.now() - lastAd < INTERSTITIAL_GAP) return;
      lastAd = Date.now();
      blocking(() => a.interstitial().catch(() => {}));
    },
    happytime() { if (a.happytime) a.happytime(); },
    openLink(url) { if (a.openLink) a.openLink(url); else window.open(url, "_blank"); },
    hello: () => a.hello ? a.hello() : Promise.resolve(null),
    checkSub: () => a.checkSub ? a.checkSub() : Promise.resolve(null),
    state(obj) { if (a.state) a.state(obj); },
    askNotify: () => a.askNotify ? a.askNotify() : Promise.resolve(false),
    get canPay() { return !!a.canPay; },                  // покупки за звёзды — только в Telegram
    buy: item => a.buy ? a.buy(item) : Promise.resolve("noserver"),
    claim: () => a.claim ? a.claim() : Promise.resolve(null),
    get canShare() { return !!a.refLink; },               // приглашения и «похвастаться» — только в Telegram
    get refLink() { return a.refLink || ""; },
    share: text => a.share ? a.share(text) : Promise.resolve(false),
    top: () => a.top ? a.top() : Promise.resolve(null),
    garage: who => a.garage ? a.garage(who) : Promise.resolve(null),
    respect: who => a.respect ? a.respect(who) : Promise.resolve(null),
    friends: () => a.friends ? a.friends() : Promise.resolve(null),
    friend: (act, extra) => a.friend ? a.friend(act, extra) : Promise.resolve(null),
    admin: (act, extra) => a.admin ? a.admin(act, extra) : Promise.resolve(null),
    // цель в Яндекс Метрике — счётчик есть только в сборке tg (metrika-tg.html), на других площадках ничего не делает
    track(goal, params) { try { if (window.ym && window.YM_ID) ym(YM_ID, "reachGoal", goal, params); } catch (e) {} },
    load: () => a.load ? a.load() : Promise.resolve(null),
    save: (obj, now) => a.save ? a.save(obj, now) : Promise.resolve()
  };
})();
