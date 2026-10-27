// Модуль языка. Ключ перевода — исходный русский текст; L("Текст {0}", x) подставляет аргументы на место {0}, {1}, ...
// Языки: ru и en. Русскоязычным (ru/uk/be/kk/uz) — русский, всем остальным — английский (требование CrazyGames).
// Язык берётся из ?lang=xx или языка браузера, а площадка (Яндекс, CrazyGames) может уточнить его после загрузки SDK.
const I18N = {
  lang: "ru",
  loc: "ru-RU",
  LOCALES: { ru: "ru-RU", en: "en-US" },
  RU_LIKE: ["ru", "uk", "be", "kk", "uz"],
  TITLE: { ru: "Блатной номер", en: "Lucky Plates Tycoon" },   // название игры (на CrazyGames должно совпадать с названием в заявке)
  miss: new Set(),                       // ключи без перевода (для проверки: I18N.miss в консоли)
  set(l) {                               // true — язык изменился (нужна перерисовка)
    l = String(l || "en").slice(0, 2).toLowerCase();
    l = I18N.RU_LIKE.includes(l) ? "ru" : "en";
    if (I18N.lang === l) return false;
    I18N.lang = l; I18N.loc = I18N.LOCALES[l];
    document.documentElement.lang = l;
    return true;
  },
  en: {}
};
function L(s, ...a) {
  let r = s;
  if (I18N.lang !== "ru" && /[А-Яа-яЁё]/.test(s)) { const t = I18N.en[s]; if (t != null) r = t; else I18N.miss.add(s); }
  return a.length ? r.replace(/\{(\d+)\}/g, (m, i) => a[i]) : r;
}
// в ВК язык берётся из настроек ВКонтакте (vk_language), а без него — русский (правила VK Mini Apps, п. 3.1.2)
(() => { const q = new URLSearchParams(location.search), vk = q.has("vk_app_id") || q.has("vk_user_id"), vl = q.get("vk_language");
  I18N.set(q.get("lang") || (vk ? (vl === "ua" ? "uk" : vl || "ru") : navigator.language) || "ru"); })();   // площадка может уточнить позже
// поля объекта с данными (названия, описания) переводятся при каждом чтении
function Lprops(o, ...keys) {
  keys.forEach(k => { const ru = o[k]; Object.defineProperty(o, k, { get: () => L(ru), enumerable: true, configurable: true }); });
  return o;
}

I18N.en = {
  // ----- интерфейс
  "доход с гаража": "garage income", "В гараж": "Keep", "Шансы выпадения": "Drop chances",
  "Номера": "Plates", "Гараж": "Garage", "Тюнинг": "Tuning", "Заказы": "Orders", "Апгрейды": "Upgrades", "Ещё": "More",
  "Ур. {0}": "Lv. {0}", "{0}/сек": "{0}/sec", "+{0}/сек": "+{0}/sec", "{0} мин": "{0} min",
  "Бланк номера": "Blank plate",
  "Купи свой первый номер — тебя ждёт подарок! 🎁": "Buy your first plate — a gift is waiting for you! 🎁",
  "Купи бланк номера — повезёт, и выпадет «блатной»!": "Buy a plate pack — with luck you'll get a VIP one!",
  "Печатаем номер…": "Printing your plate…", "Что же выпадет?": "What will it be?", "(тапни по табло, чтобы пропустить)": "(tap the plate to skip)",
  "До гарантированного блатного номера: {0}": "Guaranteed VIP plate in: {0}",
  "Откроется на уровне {0}": "Unlocks at level {0}", "🔒 Откроется на уровне {0}": "🔒 Unlocks at level {0}",
  "Не хватает денег — таксуй или посмотри рекламу": "Not enough cash — drive a taxi or watch an ad",
  "Не хватает денег — таксуй": "Not enough cash — drive a taxi",
  "Нужно {0}": "You need {0}",
  "Продать (+{0})": "Sell (+{0})", "{0} — продан за {1}": "{0} — sold for {1}",
  "🎁 Подарок новичку! {0}": "🎁 Welcome gift! {0}", "🎁 Подарок новичку — повезло!": "🎁 Welcome gift — lucky you!",
  "Гараж полон: продан самый дешёвый номер": "Garage full: the cheapest plate was sold",
  "Гараж полон: номер продан. Купи места в улучшениях!": "Garage full: plate sold. Buy more spots in Upgrades!",
  "Десяток бланков!": "Ten packs!", "Продано: {0} шт. (+{1}) · В гараж: {2}": "Sold: {0} (+{1}) · Kept: {2}", "Класс!": "Awesome!",
  "Шанс блатного+: {0}%": "VIP+ chance: {0}%", "продажа {0}": "sells for {0}",
  "🚕 Таксовать +{0}": "🚕 Taxi +{0}",
  "🎁 +{0} (📺 реклама)": "🎁 +{0} (📺 ad)", "🎁 Бонус · {0}": "🎁 Bonus · {0}",
  "🔥 Доход ×2 на 5 мин (📺 реклама)": "🔥 Income ×2 for 5 min (📺 ad)", "🔥 Доход ×2 · {0}": "🔥 Income ×2 · {0}",
  "🔥 Ажиотаж ×2 · {0}": "🔥 Hype ×2 · {0}", "{0} номера": "{0} plates", "серия «{0}»": "«{0}» series",
  "📈 В тренде: {0} ×{1} · {2}": "📈 Trending: {0} ×{1} · {2}",
  "Реклама недоступна": "Ad not available", "☁ Прогресс загружен": "☁ Progress loaded",
  "Забрать": "Collect", "Отлично": "Great", "Закрыть": "Close", "Отмена": "Cancel", "Ещё раз": "Try again", "Награда:": "Reward:",

  // ----- номера: подсказки к выпавшему номеру
  "Серия «{0}»: {1}": "«{0}» series: {1}",
  "Красивая комбинация цифр «{0}»": "Lucky digit combo «{0}»",
  "Престижный регион {0}": "Prestigious region {0}",
  "Красивый номер — повторы или «зеркало»": "Nice plate — repeats or a «mirror»",
  "Обычный номер. Повезёт в следующий раз!": "A common plate. Better luck next time!",

  // ----- редкости, бланки, серии
  "Обычный": "Common", "Красивый": "Nice", "Редкий": "Rare", "Блатной": "VIP", "Легенда": "Legend",
  "Обычный бланк": "Basic pack", "Премиум-бланк": "Premium pack", "Элитный бланк": "Elite pack",
  "Легендарная серия — по слухам, для «самых важных» водителей": "A legendary series — rumored to be for the «most important» drivers",
  "Серия-легенда автофорумов, о ней ходит больше всего слухов": "A legend of car forums, the subject of endless rumors",
  "Тройная «О» — серия солидных деловых людей": "Triple «O» — the series of serious business people",
  "«Столичная» по звучанию серия больших кабинетов": "Sounds like «Moscow» — the series of big offices",
  "Серия «с характером», её уважают в автоклубах": "A series with character, respected in car clubs",
  "Три первые буквы алфавита — VIP-серия": "The first letter three times — a VIP series",
  "Загадочная серия «больших людей»": "A mysterious series of «big people»",

  // ----- уровни и разблокировки
  "Новый уровень": "Level up", "УРОВЕНЬ {0}": "LEVEL {0}", "НАГРАДА": "REWARD", "Так держать!": "Keep it up!",
  "⭐ Уровень {0}! +{1} 💰": "⭐ Level {0}! +{1} 💰",
  "Открыты заказы!": "Orders unlocked!", "Мастерская тюнинга!": "Tuning workshop unlocked!", "Премиум-бланк и мини-игра!": "Premium pack and mini-game unlocked!",
  "Престиж!": "Prestige unlocked!", "Элитный бланк!": "Elite pack unlocked!",

  // ----- сцена джекпота
  "Шанс выпадения: {0}% — в среднем 1 из {1}": "Drop chance: {0}% — about 1 in {1}",
  "Что-то невероятное…": "Something incredible…", "Что же там внутри…": "What's inside…",
  "ЛЕГЕНДА!": "LEGEND!", "БЛАТНОЙ!": "VIP!", "СТОИМОСТЬ": "VALUE",
  // суперлегенда — спецсерия «АМР» 97 региона
  "Суперлегенда": "Super Legend", "СУПЕРЛЕГЕНДА!": "SUPER LEGEND!", "Такого не бывает…": "This never happens…",
  "Суперлегендарный номер": "Super Legend plate", "Выпало: суперлегенд": "Super Legends dropped",
  "Спецсерия": "Special Series", "Выбей суперлегендарный номер": "Get a Super Legend plate",
  "Спецсерия «АМР» 97 региона с цифрами «{0}» — таких номеров единицы": "Special series «АМР», region 97, digits «{0}» — only a handful exist",
  "Спецсерия «АМР» 97 региона — всегда легенда": "Special series «АМР», region 97 — always a Legend",
  "«АМР» с 97 регионом — спецсерия: такие номера в народе считают государственными, поэтому в игре они всегда легендарные, а с особыми цифрами (001–009, 100 или три одинаковые) — суперлегендарные.": "«АМР» with region 97 is a special series: people consider these government plates, so in the game they are always Legends, and with special digits (001–009, 100 or three of a kind) — Super Legends.",
  "«Госномер»": "«State Plate»", "«Спецсерия»": "«Special Series»", "«Первое лицо трассы»": "«First on the Road»", "«Номер вне очереди»": "«No Queue Needed»",
  "специальный гараж": "a special motor pool", "«очень важное ведомство»": "«a very important agency»", "водитель, которому не задают вопросов": "a driver no one asks questions", "кортеж, о котором не пишут в новостях": "a motorcade the news never mentions",
  "бронированный седан": "an armored sedan", "головная машина кортежа": "the lead car of a motorcade",
  "Такие номера не выдают в обычном окне — их выдают по списку.": "Plates like this aren't issued at the counter — they're issued from a list.",
  "Спецсерия «АМР» 97 региона: в очереди за ней не стоят.": "Special series «АМР», region 97: nobody queues for it.",
  "Номер из тех, перед которыми открывают шлагбаум без вопросов.": "The kind of plate that gets the barrier raised without a word.",
  "Говорят, при его виде перекрывают полосу.": "They say a lane gets closed when it shows up.",
  "Шепчутся, что его не останавливают даже на посту.": "Rumor has it it's never stopped, not even at checkpoints.",
  "Ходят слухи, что за ним всегда едет ещё одна машина.": "Word is there's always another car following it.",
  "в {0} раз дороже обычного номера": "{0}× more valuable than a common plate",

  // ----- гараж
  "🏠 Гараж": "🏠 Garage", "{0}/{1} мест · доход {2}/сек": "{0}/{1} spots · income {2}/sec", "Продать всё ниже:": "Sell all up to:",
  "Гараж пуст. Купи номер и нажми «В гараж» — номера приносят доход, даже когда тебя нет.": "Your garage is empty. Buy a plate and tap «Keep» — plates earn money even while you're away.",
  "нажми — история номера": "tap for the plate's story", "Продать {0}": "Sell {0}",
  "Нечего продавать": "Nothing to sell", "Продано {0} шт. на {1}": "Sold {0} plates for {1}",

  // ----- заказы
  "Номер не ниже «{0}»": "A plate of «{0}» or better", "Номер с цифрами «{0}»": "A plate with digits «{0}»", "Номер серии «{0}»": "A plate from the «{0}» series",
  "📋 Заказы": "📋 Orders", "Откроются на уровне 2": "Unlocks at level 2", "📋 Заказы клиентов": "📋 Customer orders",
  "Отдай подходящий номер из гаража — получишь больше, чем при продаже.": "Hand over a matching plate from your garage — you'll get more than selling it.",
  "+15 опыта": "+15 XP", "Отдать номер": "Hand over", "Нет подходящего номера": "No matching plate",
  "🔄 Обновить заказы": "🔄 New orders", "(бесплатно)": "(free)", "Заказ выполнен! +{0}": "Order complete! +{0}",

  // ----- улучшения
  "⚙ Улучшения": "⚙ Upgrades", "ур. {0}": "lv. {0}", " (макс.)": " (max)", "МАКСИМУМ": "MAXED", "Улучшить — {0} 💰": "Upgrade — {0} 💰",
  "🍀 Удача": "🍀 Luck", "Шанс на красивые, редкие и блатные ×1.12 за уровень (легенды — слабее, они «прям редкие»)": "Nice, Rare and VIP chance ×1.12 per level (Legends a bit less — they're «really» rare)",
  "🏷 Скидка на бланки": "🏷 Pack discount", "Все бланки дешевле на 7% за уровень": "All packs 7% cheaper per level",
  "🚕 Таксопарк": "🚕 Taxi fleet", "+4 к заработку за тап «Таксовать»": "+4 earnings per «Taxi» tap",
  "💥 Чаевые": "💥 Tips", "+5% шанс, что тап в такси даст ×10": "+5% chance that a taxi tap pays ×10",
  "🏠 Парковочные места": "🏠 Parking spots", "+2 места в гараже": "+2 garage spots",
  "📈 Сдача в аренду": "📈 Rentals", "+25% дохода с гаража за уровень": "+25% garage income per level",
  "🤖 Помощник": "🤖 Assistant", "Сам покупает обычные бланки: раз в 25с÷(1+0.5×ур.)": "Buys basic packs for you: every 25s÷(1+0.5×lv.)",
  "🔨 Золотые руки мастера": "🔨 Master's golden hands", "+5% к шансу успеха в мастерской за уровень (от текущего шанса)": "+5% workshop success chance per level (of the current chance)",
  "🎯 Гарантия": "🎯 Guarantee", "Гарантированный блатной номер на 10 покупок раньше": "Guaranteed VIP plate 10 purchases sooner",
  "🤖 Помощник купил: {0} ({1})": "🤖 Assistant bought: {0} ({1})",

  // ----- стартовое меню и «Как играть»
  "Выбивай блатные номера и собирай гараж с доходом": "Roll VIP plates and build a garage that earns money",
  "▶ Играть": "▶ Play", "📖 Как играть": "📖 How to play", "☰ Главное меню": "☰ Main menu", "← В меню": "← Menu", "Играть": "Play",
  "Игра вымышленная: номера генерируются случайно, монеты нельзя обменять на реальные деньги.": "The game is fictional: plates are random, and coins can't be exchanged for real money.",
  "🚘 Покупай бланки номеров. Табло крутится — и выпадает номер одной из 6 редкостей: обычный, красивый, редкий, блатной, легенда или суперлегенда.": "🚘 Buy plate packs. The board spins and you get a plate of one of 6 rarities: Common, Nice, Rare, VIP, Legend or Super Legend.",
  "💰 Продай номер сразу или поставь в 🏠 гараж — там он приносит доход каждую секунду, даже когда ты не в игре.": "💰 Sell the plate right away or put it in the 🏠 garage — it earns money every second, even while you're away.",
  "🚕 Не хватает денег — жми «Таксовать».": "🚕 Short on money? Tap «Taxi».",
  "📋 Со 2-го уровня открываются заказы: отдай подходящий номер и получи больше, чем при продаже.": "📋 From level 2, orders unlock: hand over a matching plate and earn more than by selling it.",
  "🔨 В тюнинге можно обменять несколько номеров на один более редкий.": "🔨 In the tuning shop you can trade several plates for one rarer plate.",
  "⚙ Апгрейды повышают шанс редких номеров, дают скидки на бланки и места в гараже.": "⚙ Upgrades raise the chance of rare plates and give pack discounts and garage slots.",
  "🎣 С 4-го уровня — мини-игра «Поймай номер», с 10-го — «Переезд в Москву»: начни заново с вечным бонусом.": "🎣 From level 4 — the «Catch a Plate» mini-game, from level 10 — «Move to Moscow»: start over with a permanent bonus.",
  "📖 Шансы выпадения смотри под бланками, коллекцию серий и достижения — во вкладке «Ещё».": "📖 Drop chances are under the packs; the series collection and achievements are in the «More» tab.",

  // ----- вкладка «Ещё»
  "☰ Ещё": "☰ More", "🎣 Поймай номер": "🎣 Catch a Plate",
  "Мини-игра на 25 секунд: лови падающие номера тапом — блатные дороже! Но не трогай 🚔.": "A 25-second mini-game: tap falling plates to catch them — VIP ones are worth more! Don't touch the 🚔.",
  "Рекорд:": "Best:", "Перезарядка": "Cooldown", "ИГРАТЬ": "PLAY", "🎁 Сбросить перезарядку (📺 реклама)": "🎁 Skip cooldown (📺 ad)",
  "🏛 Переезд в Москву": "🏛 Move to Moscow", "(престиж)": "(prestige)",
  "Сбрось деньги, гараж и апгрейды — и получи ⭐ «Связи»: каждая даёт навсегда +10% дохода и +3% к удаче.": "Reset your cash, garage and upgrades to earn ⭐ Connections: each one permanently gives +10% income and +3% luck.",
  "Сейчас ⭐ {0}. За этот забег:": "You have ⭐ {0}. This run gives:",
  "Переехать (+{0} ⭐)": "Move (+{0} ⭐)", "Нужно заработать ещё (от {0} за забег)": "Earn more first ({0}+ per run)",
  "📖 Блатные серии": "📖 VIP series", "Ещё не выпадала": "Not found yet", "Красивые цифры": "Lucky digits", "рег. {0}": "reg. {0}", "Престижный регион": "Prestigious region",
  "🏆 Достижения": "🏆 Achievements", "📊 Статистика": "📊 Statistics",
  "Куплено номеров": "Plates bought", "Продано": "Sold", "Всего заработано": "Total earned",
  "Выпало: обычных": "Common found", "Выпало: красивых": "Nice found", "Выпало: редких": "Rare found", "Выпало: блатных": "VIP found", "Выпало: легенд": "Legends found",
  "Заказов выполнено": "Orders completed", "Попыток в мастерской": "Workshop attempts", "Удачных улучшений": "Successful upgrades", "Переездов": "Moves", "Время в игре": "Time played",
  "🔧 Настройки": "🔧 Settings", "🎵 Музыка": "🎵 Music", "🔊 Звуки": "🔊 Sounds", "📳 Вибрация": "📳 Vibration", "🌃 Живой фон (город)": "🌃 Live background (city)",
  "Авто-продажа": "Auto-sell", "Выкл": "Off", "Обычные": "Common", "До красивых": "Up to Nice", "До редких": "Up to Rare",
  "Сбросить прогресс": "Reset progress", "Точно сбросить? Нажми ещё раз": "Are you sure? Tap again",
  "Игра вымышленная: все истории, владельцы и слухи придуманы, любые совпадения случайны. «Блатными» в народе называют номера, которые считают статусными. Внутриигровые монеты нельзя обменять на реальные деньги и призы.": "This game is fiction: all stories, owners and rumors are made up, and any resemblance is coincidental. In Russia, «blatnoy» (VIP) plates are the ones people consider a status symbol. In-game coins cannot be exchanged for real money or prizes.",

  // ----- престиж
  "Переезд в Москву": "Move to Moscow", "НОВАЯ ЖИЗНЬ": "A NEW LIFE", "СВЯЗИ ПОЛУЧЕНО": "CONNECTIONS EARNED", "Переехать": "Move",
  "Всего ⭐ {0}: +{1}% к доходу и ×{2} к удаче": "Total ⭐ {0}: +{1}% income and ×{2} luck",
  "Деньги, гараж и апгрейды обнулены — зато теперь всё идёт быстрее": "Cash, garage and upgrades were reset — but now everything goes faster",
  "Ты потеряешь деньги, гараж и апгрейды, но получишь {0} — они навсегда усиливают доход и удачу. Уровень, серии и достижения останутся.": "You'll lose your cash, garage and upgrades, but get {0} — they permanently boost income and luck. Your level, series and achievements stay.",

  // ----- мини-игра
  "🎣 Поймай номер!": "🎣 Catch a Plate!", "Тапай номера · 🚔 = −3 сек": "Tap the plates · 🚔 = −3 sec", "−3 сек": "−3 sec",
  "Время вышло!": "Time's up!", "Очки: {0} × бонус уровня. Рекорд: {1}": "Score: {0} × level bonus. Best: {1}",

  // ----- покупатель, бонусы
  "🚘 Богатый покупатель дал {0}!": "🚘 A rich buyer paid {0}!", "🔥 Ажиотаж! Доход ×2 на 20 секунд": "🔥 Hype! Income ×2 for 20 seconds",
  "День {0}": "Day {0}", "🎁 Ежедневный бонус": "🎁 Daily bonus",
  "Заходи каждый день — на 7-й день ждёт номер из премиум-бланка!": "Come back every day — on day 7 you get a plate from a premium pack!",
  "💼 Номер в гараже: {0}": "💼 Plate added to garage: {0}",
  "Удвоено! +{0} 💰": "Doubled! +{0} 💰", "🔥 Доход ×2 на 5 минут!": "🔥 Income ×2 for 5 minutes!",
  "🌙 Пока тебя не было": "🌙 While you were away", "Твой гараж заработал": "Your garage earned",
  "🎁 ×2 за рекламу (+{0})": "🎁 ×2 for an ad (+{0})", "Пока тебя не было: +{0} 💰": "While you were away: +{0} 💰",

  // ----- достижения
  "Достижение разблокировано": "Achievement unlocked",
  "Первый номер": "First plate", "Купи номер": "Buy a plate",
  "Постоянный клиент": "Regular customer", "Купи 50 номеров": "Buy 50 plates",
  "Оптовик": "Wholesaler", "Купи 500 номеров": "Buy 500 plates",
  "Редкая находка": "Rare find", "Выбей редкий номер": "Get a Rare plate",
  "Блатной!": "VIP!", "Выбей блатной номер": "Get a VIP plate",
  "Выбей легендарный номер": "Get a Legend plate",
  "Коллекционер": "Collector", "Найди 4 блатные серии": "Find 4 VIP series",
  "Все серии": "All series", "Найди все 7 серий": "Find all 7 series",
  "Полный гараж": "Full garage", "Заполни все места в гараже": "Fill every garage spot",
  "Миллионер": "Millionaire", "Заработай 1 млн за всё время": "Earn 1M in total",
  "Миллиардер": "Billionaire", "Заработай 1 млрд за всё время": "Earn 1B in total",
  "Исполнитель": "Reliable dealer", "Выполни 10 заказов": "Complete 10 orders",
  "Ловец номеров": "Plate catcher", "Набери 2000 очков в мини-игре": "Score 2000 in the mini-game",
  "Опытный": "Experienced", "Достигни 10 уровня": "Reach level 10",
  "Новая жизнь": "A new life", "Переедь в Москву": "Move to Moscow",
  "Таксист": "Cabbie", "Тапни «Таксовать» 500 раз": "Tap «Taxi» 500 times",
  "Мастер тюнинга": "Tuning master", "Удачно улучши номер в мастерской": "Successfully upgrade a plate in the workshop",
  "Рискованный": "Risk taker", "Сделай легенду в мастерской": "Make a Legend in the workshop",
  "Упорство": "Persistence", "Сделай 20 попыток в мастерской": "Make 20 workshop attempts",
  "Лови покупателя": "Catch the buyer", "Поймай 5 богатых покупателей": "Catch 5 rich buyers",

  // ----- мастерская тюнинга
  "очень низкий": "very low", "низкий": "low", "средний": "medium", "высокий": "high", "очень высокий": "very high",
  "🔨 Мастерская тюнинга": "🔨 Tuning workshop",
  "Нет подходящих номеров. Оставляй номера в гараже, чтобы улучшать их здесь.": "No suitable plates. Keep plates in your garage to upgrade them here.",
  "+{0} ещё": "+{0} more", "Выбери номера<br>из гаража ⬇": "Pick plates<br>from your garage ⬇", "Выбери цель ⬇": "Pick a target ⬇",
  "Вход": "Input", "Награда": "Reward", "Добавить монет": "Add coins", "Прокачать": "Upgrade",
  "✅ Мастер позван: шанс ×1.25": "✅ Master called: chance ×1.25", "🎁 Позвать мастера: шанс ×1.25 (📺 реклама)": "🎁 Call the master: chance ×1.25 (📺 ad)",
  "🏠 Мои номера": "🏠 My plates", "🎯 Выбери цель": "🎯 Pick a target",
  "добавь номера": "add plates", "выбери цель": "pick a target", "Выбери цель": "Pick a target", "Выбери номера": "Pick plates",
  "Шанс меньше 1%": "Chance below 1%", "Прокачать · {0}%": "Upgrade · {0}%",
  "Шанс меньше 1% — добавь номеров или монет": "Chance below 1% — add plates or coins",
  "Сначала выбери номера для входа": "Pick input plates first", "Сначала выбери цель": "Pick a target first",
  "Шанс уже выше {0}% — убери номера": "Chance is already above {0}% — remove some plates",
  "Не хватает монет — выставлен максимум": "Not enough coins — set to the maximum",
  "🔨 Мастер позван: шанс ×1.25": "🔨 Master called: chance ×1.25",
  "✅ Прокачка удалась!": "✅ Upgrade succeeded!", "Вложено {0} → награда {1} · шанс был {2}%": "Invested {0} → reward {1} · chance was {2}%",
  "📖 История номера": "📖 Plate story", "УСПЕХ!": "SUCCESS!", "🔥 Не повезло": "🔥 No luck",
  "Шанс был {0}% — стрелка упала мимо дуги. Вложенное сгорело.": "The chance was {0}% — the needle missed the arc. The input is lost.",
  "Мастер вернул {0} за труды.": "The master refunded {0} for your trouble.",

  // ----- цели новичка
  "🎯 Цель выполнена: +{0} 💰": "🎯 Goal complete: +{0} 💰",
  "Купи свой первый номер": "Buy your first plate", "Оставь номер в гараже": "Keep a plate in your garage", "Купи 10 номеров": "Buy 10 plates",
  "Достигни 2 уровня": "Reach level 2", "Выполни первый заказ (вкладка «Заказы»)": "Complete your first order (the «Orders» tab)",
  "Купи 3 улучшения": "Buy 3 upgrades", "Заполни гараж": "Fill your garage", "Достигни 4 уровня": "Reach level 4",
  "Улучши номер в мастерской (с 5 уровня)": "Upgrade a plate in the workshop (from level 5)",
  "Достигни 10 уровня и открой престиж": "Reach level 10 and unlock prestige",

  // ----- карточка «История номера»
  "Обычный номер": "Common plate", "Красивый номер": "Nice plate", "Редкий номер": "Rare plate", "Блатной номер": "VIP plate", "Легендарный номер": "Legendary plate",
  "Цена {0} 💰 · доход +{1}/сек · шанс из обычного бланка ≈ {2}%": "Value {0} 💰 · income +{1}/sec · basic pack chance ≈ {2}%",
  "🧾 О номере": "🧾 About the plate", "📖 Легенда номера": "📖 Plate legend", "📜 История": "📜 History", "(вымышленная)": "(fictional)", "🗣 Слухи": "🗣 Rumors",
  "Продать за {0}": "Sell for {0}", "Сегодня": "Today", "попал к тебе {0}.": "came to you on {0}.", "у тебя в гараже.": "in your garage.",
  "регион {0}": "region {0}", "выдан в регионе: {0}.": "issued in: {0}.", "первый владелец: {0}. Ездил на {1}.": "first owner: {0}. Drove a {1}.",
  "перешёл к новому владельцу: {0}.": "passed to a new owner: {0}.", "продан через посредника за {0} ₽ (по слухам).": "sold through a middleman for {0} ₽ (rumor has it).",
  "Регион {0} — «столичный»: такие номера дают ощущение статуса, хотя сам регион ничего не значит.": "Region {0} is a «capital» one: such plates feel like a status symbol, even though the region itself means nothing.",
  "Регион {0} — {1}.": "Region {0} — {1}.",
  "Красивые номера — повторяющиеся цифры и буквы или «зеркала» — продаются в разы дороже обычных.": "Nice plates — repeating digits and letters or «mirrors» — sell for many times more than common ones.",
  "Ничем не примечательный номер. Но у каждой цифры есть своя история.": "An unremarkable plate. But every digit has its own story.",

  // регионы
  "Москва": "Moscow", "Башкортостан": "Bashkortostan", "Татарстан": "Tatarstan", "Московская область": "Moscow Oblast", "Нижегородская область": "Nizhny Novgorod Oblast",
  "Самарская область": "Samara Oblast", "Свердловская область": "Sverdlovsk Oblast", "Челябинская область": "Chelyabinsk Oblast", "Санкт-Петербург": "Saint Petersburg",
  "Ханты-Мансийский округ": "Khanty-Mansi Okrug", "Краснодарский край": "Krasnodar Krai", "Ростовская область": "Rostov Oblast", "Чечня": "Chechnya",
  "Новосибирская область": "Novosibirsk Oblast", "Красноярский край": "Krasnoyarsk Krai",
  "Столичный регион: в пробках здесь номер видят чаще, чем где-либо.": "The capital region: in its traffic jams this plate gets seen more than anywhere else.",
  "Номер видел столько разводных мостов, что мог бы вести экскурсии.": "This plate has seen so many drawbridges it could give guided tours.",
  "Здесь любят хорошие машины и красивые номера — в регионе целая культура «номерного» тюнинга.": "People here love good cars and nice plates — the region has a whole plate-tuning culture.",
  "Номер много раз ездил к морю и знает все курортные пробки.": "This plate has driven to the sea many times and knows every resort traffic jam.",
  "Номер зимовал на Урале и не боится никаких морозов.": "This plate wintered in the Urals and fears no frost.",
  "Для этого номера −35 — это «лёгкая прохлада».": "For this plate, −35° is just «a bit chilly».",
  "Номер знает все дачные дороги и каждую яму на трассе.": "This plate knows every country road and every pothole on the highway.",
  "Номер пробовал настоящий башкирский мёд — и теперь гордится этим.": "This plate has tasted real Bashkir honey — and is proud of it.",
  "Номер вырос рядом с заводами и любит всё железное.": "This plate grew up next to factories and loves anything made of steel.",
  "Номер ездил вдоль Волги и обожает закаты.": "This plate has driven along the Volga and adores sunsets.",
  "Номер знает вкус настоящего донского арбуза.": "This plate knows the taste of a real Don watermelon.",
  "Номер помнит, как выглядит Волга с высокого берега.": "This plate remembers how the Volga looks from the high bank.",
  "Номер пережил зиму, от которой замёрзли бы даже пингвины.": "This plate survived a winter that would freeze even penguins.",
  "Номер возил вахтовиков и знает цену тёплой печке.": "This plate carried shift workers and knows the value of a warm stove.",
  "Номер видел горные серпантины и не боится крутых поворотов.": "This plate has seen mountain serpentines and isn't afraid of sharp turns.",

  // серии
  "Среди автолюбителей — номер-легенда: говорят, его узнают с первого взгляда.": "A legend among car fans: they say people recognize it at first glance.",
  "Про серию «АМР» в интернете больше мифов, чем фактов — в этом её шарм.": "There are more myths than facts online about the «АМР» series — that's its charm.",
  "Коллекционеры готовы часами спорить, кто и когда ездил с такими номерами.": "Collectors can argue for hours about who drove with these plates and when.",
  "Считается самой «громкой» серией в игре: другие водители на дороге невольно уступают.": "Considered the «loudest» series in the game: other drivers make way without thinking.",
  "Три буквы, о которых ходит больше всего слухов на автофорумах.": "Three letters that spark more rumors on car forums than any others.",
  "Серия стала нарицательной: «как с ЕКХ» говорят про машину, которой все уступают.": "The series became a byword: «like an ЕКХ» means a car everyone makes way for.",
  "Старые номера этой серии считаются раритетом, их показывают на выставках.": "Old plates of this series are considered rarities and shown at exhibitions.",
  "Владельцы шутят, что у них не номер, а пропуск в любую пробку.": "Owners joke it's not a plate but a pass through any traffic jam.",
  "Тройная «О» — любимая серия солидных деловых людей.": "Triple «O» — the favorite series of serious business people.",
  "Среди водителей ходит шутка: «ООО» — «Обгоняю Охотно Окружающих».": "Drivers joke that «ООО» stands for «Overtaking Others, Obviously».",
  "Такие номера любят ставить на чёрные седаны с тонировкой.": "These plates love to be put on black sedans with tinted windows.",
  "В коллекционных кругах «ООО» ценят за красоту: три круглые буквы смотрятся как бусы.": "Collectors value «ООО» for its looks: three round letters like a string of beads.",
  "Серия «МОС» — «столичная» по звучанию: в ней слышится название города.": "The «МОС» series sounds like the capital: you can hear the city's name in it.",
  "Машины с ней часто можно увидеть в центре города у больших кабинетов.": "Cars with it are often seen downtown near big offices.",
  "Коллекционеры любят, что слово читается целиком: М-О-С.": "Collectors love that it reads as a word: M-O-S.",
  "Владельцы шутят, что у них номер «московского разлива».": "Owners joke their plate is «Moscow vintage».",
  "«ВОС» — серия с характером: коротко, звучно и запоминается.": "«ВОС» is a series with character: short, sonorous and memorable.",
  "Говорят, такой номер выбирают те, кто любит спокойную и уверенную езду.": "They say this plate is chosen by those who like calm, confident driving.",
  "В автомобильных клубах серию «ВОС» уважают за редкость.": "Car clubs respect the «ВОС» series for its rarity.",
  "Некоторые читают «ВОС» как «Вот Он Сам».": "Some read «ВОС» as «Very Own Self».",
  "Три первые буквы алфавита — как «пятёрка с плюсом» для номера.": "The first letter three times — like an «A+» for a plate.",
  "«ААА» — VIP-серия: такие номера мгновенно привлекают внимание.": "«ААА» is a VIP series: these plates grab attention instantly.",
  "Есть байка, что номер «ААА» никогда не стоит в очереди.": "There's a tale that an «ААА» plate never waits in line.",
  "Коллекционеры называют «ААА» тройной «пятёркой» среди номеров.": "Collectors call «ААА» the triple «A+» of plates.",
  "«ММР» — загадочная серия «больших людей»: точно никто ничего не знает.": "«ММР» is a mysterious series of «big people»: nobody knows anything for sure.",
  "На автофорумах споры об этой серии идут годами и никогда не заканчиваются.": "Forum debates about this series have gone on for years and never end.",
  "Читают как «Мур-мур»: владелец-кошатник уверен, что это знак судьбы.": "It reads like «purr-purr»: the cat-loving owner is sure it's a sign of fate.",
  "Номер из тех, что запоминают, даже если видели секунду.": "One of those plates you remember even after a one-second glance.",

  // цифры
  "«Три топора» — цифры удачи; такой номер стоит дороже обычного.": "Triple sevens — lucky digits; such a plate costs more than usual.",
  "Владельцы «777» уверяют, что светофор для них всегда зелёный.": "«777» owners swear traffic lights are always green for them.",
  "Номер агента: «лицензия на обгон».": "An agent's plate: «licence to overtake».",
  "Владелец «007» обязательно говорит: «Меня зовут… Номер».": "The «007» owner always says: «The name's… Plate».",
  "Первый номер в серии — мечта коллекционеров.": "The first plate in a series — a collector's dream.",
  "Из-за «001» владелец чувствует себя капитаном всей улицы.": "Thanks to «001» the owner feels like captain of the whole street.",
  "Три девятки — максимум по цифрам, выше уже не бывает.": "Triple nines — the highest digits possible.",
  "Девятки — любимые цифры тех, кто не признаёт полумер.": "Nines are the favorite digits of those who never do things by halves.",
  "Восьмёрки — любимое число многих бизнесменов: они символизируют достаток.": "Eights are many businesspeople's favorite number: they symbolize wealth.",
  "С такими цифрами парковщики здороваются первыми.": "With these digits, parking attendants greet you first.",
  "Три пятёрки: идеальная оценка в дневнике автолюбителя.": "Triple fives: a perfect grade in a car lover's report card.",
  "Номер «555» хорошо ложится в память и в рекламу.": "«555» sticks in memory — and in commercials.",
  "Число зверя — берут те, кто не боится суеверий.": "The number of the beast — taken by those who aren't superstitious.",
  "Владелец «666» говорит, что никто не подрезает — боятся.": "The «666» owner says nobody ever cuts him off — they're scared.",
  "Круглая сотня — запоминается с первого раза.": "A round hundred — you remember it the first time.",
  "«100» — как отличная оценка в школьном аттестате.": "«100» — like a perfect score on a school exam.",

  // прозвища
  "«Тихий работяга»": "«Quiet Worker»", "«Серая мышка»": "«Gray Mouse»", "«Дачный рассвет»": "«Country Sunrise»", "«Колёсный трудяга»": "«Wheeled Workhorse»", "«Дорожный скромник»": "«Modest Roadster»", "«Старожил»": "«Old-Timer»",
  "«Зеркальце»": "«Little Mirror»", "«Ровный»": "«Smooth One»", "«Счастливая тройка»": "«Lucky Three»", "«Красавчик»": "«Handsome»", "«Симметричный»": "«Symmetric»", "«Номер-открытка»": "«Postcard Plate»",
  "«Золотая рыбка»": "«Goldfish»", "«Фиолетовый гость»": "«Purple Guest»", "«Редкая птица»": "«Rare Bird»", "«Находка года»": "«Find of the Year»", "«Тот самый»": "«The One»", "«Вот это повезло»": "«What Luck»",
  "«Главный по трассе»": "«Boss of the Highway»", "«Тяжёлая артиллерия»": "«Heavy Artillery»", "«Дорогой гость»": "«Honored Guest»", "«Громкое имя»": "«Big Name»", "«Мэтр»": "«Maestro»", "«Красная дорожка»": "«Red Carpet»",
  "«Легенда»": "«Legend»", "«Король дороги»": "«King of the Road»", "«Тот, кому уступают»": "«The One Who Gets Way»", "«Номер из учебника»": "«Textbook Plate»", "«Живой миф»": "«Living Myth»", "«Император трассы»": "«Emperor of the Highway»",

  // владельцы
  "водитель маршрутки": "a minibus driver", "студент-заочник": "a part-time student", "пенсионер-дачник": "a retiree with a country house", "курьер": "a courier",
  "дядя Ашот-таксист": "Uncle Ashot the cab driver", "продавец шаурмы": "a shawarma seller", "школьный учитель физкультуры": "a school PE teacher", "наладчик станков": "a machine-tool technician",
  "автолюбитель-коллекционер": "a car-loving collector", "владелец автомойки": "a car wash owner", "блогер про тачки": "a car blogger", "фермер из пригорода": "a farmer from the suburbs",
  "молодой предприниматель": "a young entrepreneur", "дизайнер интерьеров": "an interior designer", "тренер по рыбалке": "a fishing coach", "хозяин пекарни": "a bakery owner",
  "бизнесмен средней руки": "a mid-level businessman", "директор рынка": "a market director", "известный тренер": "a famous coach", "владелец сети шиномонтажей": "the owner of a tire shop chain",
  "хозяин ресторана грузинской кухни": "the owner of a Georgian restaurant", "руководитель строительной фирмы": "the head of a construction company", "ювелир с Арбата": "a jeweler from the Arbat", "продюсер местных звёзд": "a producer of local stars",
  "директор крупного холдинга": "the director of a big holding", "владелец сети заправок": "the owner of a gas station chain", "«друг одного очень занятого человека»": "«a friend of a very busy person»",
  "основатель логистической империи": "the founder of a logistics empire", "хозяин горнолыжного курорта": "the owner of a ski resort", "дама из высшего общества": "a high-society lady", "коллекционер с тремя гаражами": "a collector with three garages",
  "«человек, которого лучше не обгонять»": "«a man you'd better not overtake»", "миллиардер-затворник": "a reclusive billionaire", "бывший чемпион, ставший магнатом": "a former champion turned tycoon",
  "«тот, кого всегда пропускают»": "«the one everyone lets through»", "владелец острова и автопарка": "the owner of an island and a car fleet", "анонимный коллекционер из Швейцарии": "an anonymous collector from Switzerland",

  // машины
  "потрёпанный хэтчбек": "a battered hatchback", "бюджетный седан": "a budget sedan", "старенькая «семёрка»": "an old Soviet sedan", "маленький городской седан": "a small city sedan", "универсал «для дачи»": "a «country house» wagon", "недорогой кроссовер": "an affordable crossover",
  "семейный седан": "a family sedan", "городской кроссовер": "a city crossover", "аккуратный лифтбек": "a tidy liftback", "японский седан": "a Japanese sedan", "компактный хэтчбек": "a compact hatchback", "минивэн для большой семьи": "a minivan for a big family",
  "седан бизнес-класса": "a business sedan", "немецкий седан": "a German sedan", "премиальный кроссовер": "a premium crossover", "универсал с полным приводом": "an AWD wagon", "шведский внедорожник": "a Swedish SUV", "большой японский внедорожник": "a big Japanese SUV",
  "представительский седан": "an executive sedan", "британский внедорожник": "a British SUV", "спортивный кроссовер": "a sport crossover", "гран-туризмо": "a grand tourer", "огромный внедорожник": "a huge SUV", "американский внедорожник": "an American SUV",
  "чёрный лимузин": "a black limousine", "отечественный лимузин": "a domestic limousine", "седан с тонировкой": "a sedan with tinted windows", "кортеж из трёх одинаковых машин": "motorcade of three identical cars", "английский лимузин": "an English limousine", "лимузин на заказ": "custom limousine",
  "лимузин с мигалкой": "a limousine with a flashing light", "чёрный внедорожник сопровождения": "a black escort SUV",

  // события
  "Трижды попадал в ДТП и ни разу не был виноват.": "Was in three accidents and was never at fault.",
  "Шесть часов простоял в пробке на Садовом.": "Spent six hours in a traffic jam on the Garden Ring.",
  "Сменил четырёх владельцев через «Авито».": "Changed four owners through online classifieds.",
  "Был выигран в карты, о чём владелец до сих пор молчит.": "Was won in a card game, which the owner still keeps quiet about.",
  "Его угоняли, но нашли через неделю на соседней улице.": "Was stolen once, but found a week later on the next street.",
  "Участвовал в свадебном кортеже и украсил капот лентами.": "Took part in a wedding motorcade with ribbons on the hood.",
  "Попал в кадр дорожной камеры — штраф так и не пришёл.": "Got caught on a traffic camera — the fine never arrived.",
  "Простоял в гараже 5 лет, пока владелец был «в командировке».": "Sat in a garage for 5 years while the owner was «on a business trip».",
  "Проехал через всю страну по трассе «Байкал» и обратно.": "Drove across the whole country on the «Baikal» highway and back.",
  "Был снят в кино, но вырезали на монтаже.": "Was filmed for a movie but got cut in editing.",
  "Когда-то его перепутали с другим номером, и владельцу пришла чужая квитанция.": "Was once mixed up with another plate, and the owner got someone else's ticket.",
  "Однажды замёрз в −40 и завёлся только на третий день.": "Once froze at −40° and only started on the third day.",
  "Участвовал в дрэге на пустыре и занял второе место.": "Raced in a drag race on a vacant lot and came second.",
  "Побывал на выставке «Гаражные сокровища» и получил диплом.": "Visited the «Garage Treasures» exhibition and got a diploma.",
  "Его фотографировали туристы — и выложили в соцсети.": "Tourists took photos of it — and posted them online.",
  "Прошёл ТО без единого замечания (в это никто не поверил).": "Passed inspection without a single remark (nobody believed it).",
  "Был потерян в «Авито» и найден по объявлению через полгода.": "Got lost in the classifieds and was found through an ad six months later.",
  "Съездил на дачу и вернулся с ведром огурцов на заднем сиденье.": "Went to the country house and came back with a bucket of cucumbers on the back seat.",
  "Побывал на заправках всех цветов радуги.": "Has visited gas stations of every color of the rainbow.",
  "Ездил с прицепом на дачу тридцать раз и ни разу не застрял.": "Pulled a trailer to the country house thirty times and never got stuck.",
  "Попал под ливень, и владелец клялся, что видел на капоте радугу.": "Got caught in a downpour, and the owner swore he saw a rainbow on the hood.",
  "Однажды хозяин забыл его на парковке торгового центра на неделю.": "Its owner once forgot it in a mall parking lot for a week.",
  "Стал героем местной газеты: «Номер, который все запомнили».": "Made the local paper: «The plate everyone remembers».",
  "Был подарен на юбилей в красивой коробке.": "Was given as an anniversary gift in a fancy box.",
  "Однажды ночью проехал сквозь туман, как в кино.": "Once drove through the fog at night, just like in a movie.",

  // начало легенды
  "Появился на свет в скромной очереди в отделении.": "Was born in a modest line at the DMV.",
  "Достался владельцу, который просто пришёл за любым номером.": "Went to an owner who just came for any plate.",
  "Выдан без лишней суеты — обычный будний день.": "Issued without any fuss on an ordinary weekday.",
  "Его никто не выбирал, он выбрал владельца сам.": "Nobody chose it — it chose its owner.",
  "Владелец долго выбирал именно такие цифры.": "The owner spent a long time choosing these exact digits.",
  "Выдан в день, когда оператор улыбнулся и сказал: «Красивые!»": "Issued on the day the clerk smiled and said: «Nice ones!»",
  "Повторяющиеся цифры сразу привлекли внимание.": "The repeating digits caught everyone's eye.",
  "Его бережно хранили в сейфе как талисман.": "It was kept in a safe like a lucky charm.",
  "Выпал по случайности, но владелец сразу понял: это знак.": "It came by chance, but the owner knew right away: it's a sign.",
  "Достался только тому, кто пришёл ровно в 9:00 и не ушёл.": "Went only to the one who came at 9:00 sharp and didn't leave.",
  "Попал к владельцу после трёх неудачных попыток.": "Reached its owner after three failed attempts.",
  "О нём заранее шептались в очереди.": "People in line were whispering about it in advance.",
  "Этот номер не продаётся — он «находит» владельца сам.": "This plate isn't sold — it «finds» its owner.",
  "Говорят, ему предшествовала долгая тишина и важные звонки.": "They say it was preceded by a long silence and important phone calls.",
  "Получить его удавалось только по знакомству… так говорят.": "You could only get it through connections… or so they say.",
  "Появился там, где его никто не ждал, и все замолчали.": "It appeared where nobody expected it, and everyone went quiet.",
  "Номер-миф: о нём слышали все, но видели немногие.": "A mythical plate: everyone has heard of it, few have seen it.",
  "Его владелец до сих пор отказывается называть цену.": "Its owner still refuses to name the price.",
  "По легенде, ему не нужен был ни фонарь, ни сирена — достаточно было появиться.": "Legend has it, it needed no flashing lights or siren — just showing up was enough.",
  "Говорят, один его вид останавливает споры на парковке.": "They say just the sight of it ends parking-lot arguments.",

  // концовки
  "С тех пор он ездит и не жалуется.": "It has been driving ever since without complaint.",
  "Теперь у него новая жизнь и новый хозяин — это ты.": "Now it has a new life and a new owner — you.",
  "Вся история уместилась на одной странице блокнота.": "The whole story fits on one page of a notebook.",
  "Его ещё долго вспоминали во дворе.": "The neighbors talked about it for a long time.",
  "Говорят, он приносит удачу — но только если вовремя мыть машину.": "They say it brings luck — but only if you wash the car on time.",
  "Теперь он твой, береги его.": "Now it's yours — take good care of it.",
  "Кому-то он просто номер, а для тебя — часть коллекции.": "To some it's just a plate, to you it's part of a collection.",
  "Он ещё напишет свою главу — в твоём гараже.": "It will write its next chapter — in your garage.",
  "Старожилы двора до сих пор вспоминают, как он проезжал мимо.": "Old-timers in the neighborhood still remember it driving by.",
  "Его можно узнать из тысячи — по характеру.": "You can pick it out of a thousand — by its character.",

  // слухи
  "Говорят, он дружит со всеми парковочными местами.": "They say it's friends with every parking spot.",
  "Ходит слух, что он пережил три кризиса и не потерял в цене.": "Rumor has it it survived three crises without losing value.",
  "Люди шепчутся, что он заводится с полоборота даже в мороз.": "People whisper it starts instantly even in the frost.",
  "Говорят, он приносит удачу в мелких делах.": "They say it brings luck in small matters.",
  "Ходят слухи, что рядом с ним не бывает проколов.": "Rumor has it you never get a flat tire near it.",
  "Коллекционеры уверяют, что цены на такие растут по весне.": "Collectors claim prices for these go up every spring.",
  "Утверждают, что его владельцы выигрывали в лотерею.": "They claim its owners have won the lottery.",
  "Ходит молва, что он всегда находит место на парковке.": "Word is it always finds a parking spot.",
  "Рассказывают, что рядом с ним любое такси приезжает быстрее.": "They say any taxi arrives faster near it.",
  "Шепчутся, что рядом с ним даже светофоры работают лучше.": "Whispers say even traffic lights work better near it.",
  "Ходят слухи, что при его виде другие водители вежливее.": "Rumor has it other drivers get more polite at the sight of it.",
  "Говорят, он знает короткие дороги, которых нет на картах.": "They say it knows shortcuts that aren't on any map.",
  "Рассказывают, что у него есть свой водитель, свой гараж и своё мнение.": "They say it has its own driver, its own garage and its own opinion.",
  "Шепчутся, что в день его появления на улице сам собой убирается мусор.": "Whispers say the streets clean themselves on the day it appears.",
  "Ходят легенды, что он никогда не стоял в очереди на заправке.": "Legends say it has never waited in line at a gas station."
};
