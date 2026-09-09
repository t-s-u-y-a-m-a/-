/* ============================================================
   てんのお世話ゲーム プロトタイプ v1
   「攻略するゲーム」ではなく「理解するゲーム」
   ============================================================ */

const SAVE_KEY = "tenBabyCareGame_v1";

/* ---------- データ定義 ---------- */

// 状態カテゴリ。care は対応するお世話アクション、memoEmoji はメモ画面の見出し。
const STATE_META = {
  sleepiness:  { category: "sleepy",     care: "sleep",       label: "眠い",         memoEmoji: "😴" },
  hunger:      { category: "hunger",     care: "milk",        label: "お腹がすいた", memoEmoji: "🍼" },
  diaper:      { category: "diaper",     care: "diaper",      label: "おむつ",       memoEmoji: "💩" },
  holdNeed:    { category: "hold",       care: "hold",        label: "抱っこしてほしい", memoEmoji: "🤗" },
  temperature: { category: "temperature",care: "environment", label: "暑い・寒い",   memoEmoji: "🌡️" },
  uncomfort:   { category: "uncomfort",  care: "play",        label: "なんとなく不快", memoEmoji: "🎈" },
};

// 観察の手がかり。あえて複数カテゴリに重複させ、単純な攻略を防ぐ。
const CLUE_LIBRARY = {
  sleepy: ["目をこする", "あくび", "顔をそむける", "まばたきが増える", "動きがゆっくり", "指をしゃぶる"],
  hunger: ["口をもぐもぐ", "指をしゃぶる", "手を口に近づける", "小さくぐずる"],
  hold: ["パパ・ママを見る", "手を伸ばすような動き", "抱っこすると落ち着く", "小さくぐずる"],
  diaper: ["もぞもぞする", "不機嫌そう", "足を動かす", "小さくぐずる"],
  temperature: ["落ち着かない", "身体をもぞもぞ", "不機嫌そう"],
  uncomfort: ["身体を少し反らす", "顔をそむける", "ぐずる", "落ち着かない", "指をしゃぶる"],
};

const RECENT_FLAVOR = [
  "さっきまで遊んでいた。",
  "少し前まで眠っていた。",
  "さっきミルクを飲んだところ。",
  "しばらく静かにしていた。",
  "さっきからずっと同じ様子。",
];

const CRY_LINES = [
  "ふぇ……", "ふぇ……ふぇ……", "うぇ……", "ん……ふぇ……", "ふぇー……",
  "えーん！えーん！", "うー……", "きゃー……（小さめ）", "ぐすん……", "むにゃ……（眠い）",
  "うっ……（お寝坊？）", "ひくっ……（驚き）",
];
const VOICE_LINES = ["あー", "うー", "んー", "あうー", "きゃっ", "あー！", "うー♪", "へっ……", "あはっ♡"];
const EXPRESSIONS = ["😊", "😆", "🥺", "😣", "😴", "😮", "🙂", "😲", "😟", "😢", "😑"];
const GESTURES = [
  "目をこする", "あくび", "手をパタパタ", "足をバタバタ", "顔をそむける",
  "指をしゃぶる", "パパ・ママを見る", "身体を少し動かす",
  "首をかしげる", "親を目で追う", "体をひねる", "笑いながら動く",
];

// カテゴリごとに「らしい」仕草を寄せておくと、観察と学びがつながりやすい
const GESTURE_BY_CATEGORY = {
  sleepy: ["目をこする", "あくび", "身体を少し動かす"],
  hunger: ["指をしゃぶる", "手をパタパタ"],
  hold: ["パパ・ママを見る", "親を目で追う", "手をパタパタ"],
  diaper: ["足をバタバタ", "身体を少し動かす", "体をひねる"],
  temperature: ["身体を少し動かす", "顔をそむける", "首をかしげる"],
  uncomfort: ["顔をそむける", "身体を少し動かす", "体をひねる"],
};

// パパ・ママとの関係が良好なことを表す写真（抱っこで落ち着いたときに登場）
const PARENT_PHOTOS = [
  { src: "assets/images/papa-baby.png", alt: "パパに抱っこされて安心するてん" },
  { src: "assets/images/mama-baby.png", alt: "ママに抱っこされて安心するてん" },
];

const CARE_ACTIONS = ["milk", "hold", "sleep", "diaper", "environment", "play"];

/* ---------- ゲーム全体の状態 ---------- */

let babyState = {};
let babyMemo = {};
let discoveredPreferences = []; // "sleepy::目をこする" のようなキーの配列
let careHistory = [];
let tutorialCompleted = false;
let hasObservedOnce = false;
let lastClueSources = []; // 直近の観察で見せた手がかりと、その出どころカテゴリ
let currentScreen = "screen-home";

/* ============================================================
   初期化
   ============================================================ */

function initializeBaby() {
  babyState = {
    hunger: 25,
    sleepiness: 75,
    diaper: 10,
    holdNeed: 20,
    temperature: 10,
    uncomfort: 10,
  };
}

function initializeMemo() {
  babyMemo = { sleepy: [], hunger: [], diaper: [], hold: [], temperature: [], uncomfort: [] };
}

function initializeGame() {
  const loaded = loadGame();
  if (!loaded) {
    initializeBaby();
    initializeMemo();
    discoveredPreferences = [];
    careHistory = [];
    tutorialCompleted = false;
  }
  bindEvents();
  showScreen("screen-home");
  renderBaby();
  if (!tutorialCompleted) {
    showTutorialBanner();
  }
}

/* ============================================================
   画面遷移
   ============================================================ */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  currentScreen = id;
  if (id === "screen-memo") renderBabyMemo();
  if (id === "screen-care") renderBaby();
}

function bindEvents() {
  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.goto));
  });

  document.getElementById("btn-observe").addEventListener("click", observeBaby);
  document.getElementById("close-observation").addEventListener("click", () => {
    document.getElementById("observation-panel").hidden = true;
  });

  document.querySelectorAll(".care-btn").forEach((btn) => {
    btn.addEventListener("click", () => performCare(btn.dataset.action));
  });
}

/* ============================================================
   観察システム
   ============================================================ */

function dominantCategories(count) {
  const entries = Object.keys(STATE_META).map((key) => ({
    key,
    category: STATE_META[key].category,
    value: babyState[key],
  }));
  entries.sort((a, b) => b.value - a.value);
  return entries.slice(0, count);
}

function pickClue(category, avoid) {
  const pool = CLUE_LIBRARY[category].filter((c) => !avoid.includes(c));
  const list = pool.length ? pool : CLUE_LIBRARY[category];
  return list[Math.floor(Math.random() * list.length)];
}

function observeBaby() {
  hasObservedOnce = true;
  const top = dominantCategories(2);
  const usedClues = [];
  lastClueSources = [];

  const lines = [];

  const voice = babyState[topStateKey(top[0])] > 55 ? pickFrom(CRY_LINES) : pickFrom(VOICE_LINES);
  lines.push({ label: "声", text: `「${voice}」` });

  const clue1 = pickClue(top[0].category, usedClues);
  usedClues.push(clue1);
  lastClueSources.push({ clue: clue1, category: top[0].category });

  let expressionNote = "少し眠そう。";
  if (top[0].category === "hunger") expressionNote = "何か欲しそうな顔。";
  else if (top[0].category === "hold") expressionNote = "誰かを探しているみたい。";
  else if (top[0].category === "diaper") expressionNote = "ちょっと不機嫌そう。";
  else if (top[0].category === "temperature") expressionNote = "落ち着かない顔。";
  else if (top[0].category === "uncomfort") expressionNote = "モヤモヤしているみたい。";
  else if (top[0].category === "sleepy") expressionNote = "少し眠そう。";

  lines.push({ label: "表情", text: expressionNote });
  lines.push({ label: "仕草", text: clue1 + "。" });

  if (top[1] && top[1].value >= 30) {
    const clue2 = pickClue(top[1].category, usedClues);
    usedClues.push(clue2);
    lastClueSources.push({ clue: clue2, category: top[1].category });
    lines.push({ label: "その他の様子", text: clue2 + "。" });
  }

  lines.push({ label: "最近の様子", text: pickFrom(RECENT_FLAVOR) });

  renderObservation(lines);

  if (!tutorialCompleted) {
    showTutorialBanner(true);
  }
}

function topStateKey(entry) { return entry.key; }
function pickFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function renderObservation(lines) {
  const panel = document.getElementById("observation-panel");
  const body = document.getElementById("observation-body");
  body.innerHTML = lines
    .map((l) => `<p><span class="obs-label">${l.label}</span>${l.text}</p>`)
    .join("");
  panel.hidden = false;
}

/* ============================================================
   お世話アクション
   ============================================================ */

const CARE_EFFECTS = {
  milk:        { primary: "hunger",      side: { uncomfort: -5 } },
  hold:        { primary: "holdNeed",    side: { uncomfort: -8, sleepiness: -3 } },
  sleep:       { primary: "sleepiness",  side: {} },
  diaper:      { primary: "diaper",      side: { uncomfort: -5 } },
  environment: { primary: "temperature", side: { uncomfort: -5 } },
  play:        { primary: "uncomfort",   side: { holdNeed: -8 } },
};

function performCare(action) {
  document.getElementById("observation-panel").hidden = true;
  const before = { ...babyState };
  const effect = CARE_EFFECTS[action];
  const primaryKey = effect.primary;
  const primaryBefore = before[primaryKey];

  // sleep はお腹がすいたままだとあまり効かない、というような相互作用
  let effectiveness = 1;
  if (action === "sleep" && before.hunger > 55) effectiveness = 0.4;
  if (action === "milk" && before.sleepiness > 85) effectiveness = 0.6;

  const primaryDrop = randRange(30, 55) * effectiveness;
  babyState[primaryKey] = clamp(before[primaryKey] - primaryDrop);

  Object.entries(effect.side).forEach(([key, base]) => {
    const delta = base + randRange(-3, 3);
    babyState[key] = clamp(babyState[key] + delta);
  });

  // 見当違いのお世話でも、ごく軽い自然な変化にとどめる（ゲームオーバーにはしない）
  Object.keys(babyState).forEach((key) => {
    if (key === primaryKey || key in effect.side) return;
    babyState[key] = clamp(babyState[key] + randRange(0, 4));
  });

  careHistory.push({ action, before, after: { ...babyState } });

  const result = evaluateCareResult(before, babyState, primaryKey, primaryDrop, effectiveness);
  const reaction = generateBabyReaction(babyState, action, result);

  playReactionSequence(reaction, result, () => {
    unlockMemo(primaryKey, result);
    saveGame();
  });
}

function evaluateCareResult(before, after, primaryKey, primaryDrop, effectiveness) {
  const meaningfulDrop = primaryDrop >= 25 && effectiveness >= 0.9;
  const partialDrop = primaryDrop >= 12;
  const stillHigh = after[primaryKey] > 55;

  let tier;
  if (meaningfulDrop && !stillHigh) tier = "success";
  else if (partialDrop) tier = "partial";
  else tier = "none";

  return { tier, primaryKey, stillHigh };
}

function generateBabyReaction(state, lastAction, result) {
  const worst = dominantCategories(1)[0];
  const worstValue = worst.value;

  let mood;
  if (result.tier === "success") mood = "calm";
  else if (worstValue > 70) mood = "crying";
  else if (worstValue > 40) mood = "fussy";
  else mood = "calm";

  const voice = mood === "crying" ? pickFrom(CRY_LINES) : pickFrom(VOICE_LINES);
  const expression =
    mood === "calm" ? pickFrom(["😊", "🙂", "😆"]) :
    mood === "fussy" ? pickFrom(["😣", "🥺", "😮"]) :
    pickFrom(["🥺", "😣"]);

  const gestureCategoryPool = GESTURE_BY_CATEGORY[worst.category] || GESTURES;
  const gesture = Math.random() < 0.7 ? pickFrom(gestureCategoryPool) : pickFrom(GESTURES);

  return { mood, voice, expression, gesture, category: worst.category };
}

/* ---------- 反応の演出（段階的に見せる） ---------- */

function playReactionSequence(reaction, result, onDone) {
  const face = document.getElementById("baby-face");
  const speech = document.getElementById("baby-speech");
  const gestureEl = document.getElementById("baby-gesture");
  const resultBox = document.getElementById("result-message");
  const parentPhoto = document.getElementById("parent-hold-photo");

  face.className = "baby-face";
  speech.hidden = true;
  gestureEl.hidden = true;
  resultBox.hidden = true;
  parentPhoto.hidden = true;

  const steps = [];

  steps.push(() => {
    speech.hidden = false;
    speech.textContent = `「${reaction.voice}」`;
    if (reaction.mood === "crying") face.classList.add("crying");
  });

  steps.push(() => {
    gestureEl.hidden = false;
    gestureEl.textContent = "👶 " + reaction.gesture;
    if (reaction.category === "hold" && result.tier !== "none") {
      const photo = pickFrom(PARENT_PHOTOS);
      parentPhoto.src = photo.src;
      parentPhoto.alt = photo.alt;
      parentPhoto.hidden = false;
    }
  });

  steps.push(() => {
    face.className = "baby-face happy-pop";
    face.textContent = reaction.expression;
  });

  steps.push(() => {
    resultBox.hidden = false;
    resultBox.textContent = resultMessageFor(result);
  });

  let i = 0;
  const stepInterval = 650;
  const timer = setInterval(() => {
    if (i < steps.length) {
      steps[i]();
      i++;
    } else {
      clearInterval(timer);
      onDone();
    }
  }, stepInterval);
  steps[0](); // 最初のステップはすぐ出す
  i = 1;
}

function resultMessageFor(result) {
  if (result.tier === "success") return "てん、少し落ち着いたみたい。";
  if (result.tier === "partial") return "少し変わった気がする……でも、まだ何か気になるみたい。";
  return "てんはまだ気になることがあるみたい……もう少し様子を見てみよう。";
}

/* ============================================================
   赤ちゃんメモ / 発見システム
   ============================================================ */

function unlockMemo(primaryKey, result) {
  if (result.tier === "none") return;
  const category = STATE_META[primaryKey].category;

  const relevantClues = lastClueSources.filter((c) => c.category === category);
  if (relevantClues.length === 0) return;

  let newlyUnlocked = null;
  relevantClues.forEach(({ clue }) => {
    const key = category + "::" + clue;
    if (!discoveredPreferences.includes(key)) {
      discoveredPreferences.push(key);
      babyMemo[category].push(clue);
      if (!newlyUnlocked) newlyUnlocked = { category, clue };
    }
  });

  if (newlyUnlocked) {
    showDiscoveryToast(newlyUnlocked);
  }
  if (currentScreen === "screen-memo") renderBabyMemo();
}

function showDiscoveryToast(entry) {
  const toast = document.getElementById("discovery-toast");
  const label = STATE_META_BY_CATEGORY(entry.category);
  toast.innerHTML = `✨ 新しい発見！<br>てんは${label}とき、<br>「${entry.clue}」ことがあるみたい。`;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3200);
}

function STATE_META_BY_CATEGORY(category) {
  const found = Object.values(STATE_META).find((m) => m.category === category);
  return found ? found.label : "";
}

function renderBabyMemo() {
  const list = document.getElementById("memo-list");
  list.innerHTML = "";

  Object.entries(STATE_META).forEach(([, meta]) => {
    const category = meta.category;
    const unlocked = babyMemo[category] || [];
    const totalClues = CLUE_LIBRARY[category].length;

    const card = document.createElement("div");
    card.className = "memo-card";

    const header = unlocked.length ? `${meta.memoEmoji} ${meta.label}` : `🔒 ${meta.label}`;
    let itemsHtml = "";

    if (unlocked.length === 0) {
      itemsHtml = `<li class="locked">🔒 まだ発見していない</li>`;
    } else {
      itemsHtml = unlocked
        .map((clue) => `<li>⭐ てんは${meta.label}とき、「${clue}」ことがある</li>`)
        .join("");
      const lockedCount = totalClues - unlocked.length;
      if (lockedCount > 0) {
        itemsHtml += `<li class="locked">🔒 まだ発見していないことがある (${lockedCount})</li>`;
      }
    }

    card.innerHTML = `<h4>${header}</h4><ul>${itemsHtml}</ul>`;
    list.appendChild(card);
  });
}

/* ============================================================
   てんの表示（お世話画面）
   ============================================================ */

function renderBaby() {
  const face = document.getElementById("baby-face");
  document.getElementById("parent-hold-photo").hidden = true;
  const worst = dominantCategories(1)[0];
  face.className = "baby-face";
  if (worst.value > 70) {
    face.textContent = "🥺";
    face.classList.add("crying");
  } else if (worst.category === "sleepy" && worst.value > 55) {
    face.textContent = "😴";
    face.classList.add("sleeping");
  } else {
    face.textContent = "😊";
  }
}

/* ============================================================
   チュートリアル
   ============================================================ */

function showTutorialBanner(afterObserve) {
  const banner = document.getElementById("tutorial-banner");
  banner.hidden = false;
  if (!afterObserve) {
    banner.innerHTML =
      "👶 てんが泣いているみたい。<br>まずは「観察する」を押して、てんの様子を見てみよう。";
  } else {
    banner.innerHTML = "何が必要なのか、考えてみよう。";
    tutorialCompleted = true;
    saveGame();
    setTimeout(() => { banner.hidden = true; }, 4000);
  }
}

/* ============================================================
   ユーティリティ
   ============================================================ */

function clamp(v) { return Math.max(0, Math.min(100, v)); }
function randRange(min, max) { return min + Math.random() * (max - min); }

/* ============================================================
   セーブ / ロード
   ============================================================ */

function saveGame() {
  const data = { babyState, babyMemo, careHistory, discoveredPreferences, tutorialCompleted };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage が使えない環境でもゲームは継続できるようにする
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    babyState = data.babyState || {};
    babyMemo = data.babyMemo || {};
    careHistory = data.careHistory || [];
    discoveredPreferences = data.discoveredPreferences || [];
    tutorialCompleted = !!data.tutorialCompleted;
    initializeMemoDefaults();
    return true;
  } catch (e) {
    return false;
  }
}

function initializeMemoDefaults() {
  Object.keys(STATE_META).forEach((key) => {
    const category = STATE_META[key].category;
    if (!babyMemo[category]) babyMemo[category] = [];
  });
  Object.keys(babyState).length === 0 && initializeBaby();
}

/* ============================================================
   起動
   ============================================================ */

document.addEventListener("DOMContentLoaded", initializeGame);
