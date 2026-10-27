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

const ADAPTERS = [CG_ADAPTER, VK_ADAPTER, YA_ADAPTER];

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
    get name() { return a.name; },                        // "cg" | "ya" | "vk" | "" (локально)
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
    load: () => a.load ? a.load() : Promise.resolve(null),
    save: (obj, now) => a.save ? a.save(obj, now) : Promise.resolve()
  };
})();
