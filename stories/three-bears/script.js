/* ============================================================
   『三びきのくま』―― ぷにぷにふれあいゲーム
   赤ちゃんのお世話システムとは完全に独立したミニゲーム。
   ============================================================ */

// くまごとの個性。プレイヤーには数値も「好みの強さ」も明示しない。
// ideal: ちょうどいい強さ(1〜3)。tolerance: ずれに対する寛容さ(小さいほど敏感)。
// decay: 触れていない間に落ち着く速さ(大きいほど早く回復)。
const BEARS = {
  big:   { label: "おおきいくま", ideal: 3, tolerance: 0.6, decay: 5, sizeClass: "size-big" },
  mama:  { label: "おかあさんくま", ideal: 2, tolerance: 1.0, decay: 3.2, sizeClass: "size-mama" },
  chibi: { label: "ちびくま", ideal: 1, tolerance: 1.6, decay: 1.8, sizeClass: "size-chibi" },
};

const SPOT_WEIGHT = { cheek: 1, hand: 0.7, foot: 0.7, tummy: 0.85 };

// 触れる強さに応じた反応の目安（tier 0=ごきげん 〜 4=泣いてしまう）
const REACTION_TIERS = [
  { max: 14, phrases: ["あー♪", "うふ♪"], face: "happy", emoji: "😊" },
  { max: 34, phrases: ["うー♪", "にこっ"], face: "happy", emoji: "🙂" },
  { max: 54, phrases: ["……", "んー"], face: "neutral", emoji: "😐" },
  { max: 74, phrases: ["ふぇ……", "うぅ……"], face: "fussy", emoji: "😣" },
  { max: 100, phrases: ["えーん……", "ふぇーん……"], face: "crying", emoji: "😢" },
];

const PARENT_LINES = [
  "……ほっぺ、ぷにぷにしたい。",
  "やわらかい……たまらないなぁ。",
  "そぉっと、ね。",
  "うれしそうにしてる……かわいい。",
  "ちょっとだけ、様子を見てみようか。",
];

const HAPPY_STREAK_GOAL = 8;

let currentBearId = "big";
let bearStates = {};
let lastTouchAt = 0;
let comboStreak = 0;
let decayTimer = null;
let parentLineTimer = null;

function initBearState(id) {
  return { irritation: 10, happyStreak: 0, ended: false };
}

function initializeGame() {
  Object.keys(BEARS).forEach((id) => { bearStates[id] = initBearState(id); });
  bindEvents();
  applyBearVisual();
  startDecayLoop();
  startParentLineLoop();
}

function bindEvents() {
  document.querySelectorAll(".bear-tab").forEach((tab) => {
    tab.addEventListener("click", () => switchBear(tab.dataset.bear));
  });

  document.querySelectorAll(".touch-spot").forEach((spot) => {
    let downAt = 0;
    const onDown = (e) => { downAt = performance.now(); };
    const onUp = (e) => {
      if (!downAt) return;
      const holdMs = performance.now() - downAt;
      downAt = 0;
      handleTouch(spot.dataset.spot, holdMs);
    };
    spot.addEventListener("pointerdown", onDown);
    spot.addEventListener("pointerup", onUp);
    spot.addEventListener("pointercancel", () => { downAt = 0; });
  });

  document.getElementById("ending-restart").addEventListener("click", restartCurrentBear);
}

function switchBear(id) {
  currentBearId = id;
  document.querySelectorAll(".bear-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.bear === id);
  });
  document.getElementById("ending-panel").hidden = true;
  document.getElementById("bear-speech").hidden = true;
  applyBearVisual();
}

function applyBearVisual() {
  const meta = BEARS[currentBearId];
  const body = document.getElementById("bear-body");
  body.className = "bear-body " + meta.sizeClass;
  renderFace();
}

/* ---------- タッチ判定 ---------- */

function classifyStrength(holdMs) {
  if (holdMs < 130) return 1; // 軽く触る
  if (holdMs < 350) return 2; // ふつう
  return 3; // しっかり／強め
}

function handleTouch(spot, holdMs) {
  const now = performance.now();
  const rapid = now - lastTouchAt < 280;
  comboStreak = rapid ? Math.min(comboStreak + 1, 3) : 0;
  lastTouchAt = now;

  const meta = BEARS[currentBearId];
  const state = bearStates[currentBearId];
  if (state.ended) return;

  const baseStrength = classifyStrength(holdMs);
  const comboBonus = rapid ? Math.min(comboStreak, 2) : 0;
  const effectiveStrength = Math.min(baseStrength + comboBonus, 4);
  const weight = SPOT_WEIGHT[spot] ?? 1;

  const diff = effectiveStrength - meta.ideal;
  let delta;
  if (diff <= 0) {
    delta = -randRange(4, 10);
  } else if (diff === 1) {
    delta = randRange(2, 8) * meta.tolerance;
  } else {
    delta = randRange(15, 30) * meta.tolerance;
  }
  delta *= weight;

  state.irritation = clamp(state.irritation + delta);

  const tier = tierFor(state.irritation);
  if (tier <= 1) {
    state.happyStreak++;
  } else {
    state.happyStreak = 0;
  }

  showReaction(tier);
  renderFace();

  if (state.happyStreak >= HAPPY_STREAK_GOAL) {
    showEnding();
  }
}

function tierFor(irritation) {
  return REACTION_TIERS.findIndex((t) => irritation <= t.max);
}

/* ---------- 反応の演出 ---------- */

function showReaction(tierIndex) {
  const tier = REACTION_TIERS[tierIndex];
  const speech = document.getElementById("bear-speech");
  const hint = document.getElementById("mood-hint");

  speech.hidden = false;
  speech.textContent = "「" + pickFrom(tier.phrases) + "」";

  if (tierIndex === 4) {
    hint.textContent = "あっ……ちょっとやりすぎちゃったみたい。";
  } else if (tierIndex === 3) {
    hint.textContent = "少し休んだ方がよさそう。";
  } else {
    hint.textContent = "";
  }

  clearTimeout(showReaction._t);
  showReaction._t = setTimeout(() => { speech.hidden = true; }, 1400);
}

function renderFace() {
  const state = bearStates[currentBearId];
  const tier = REACTION_TIERS[tierFor(state.irritation)];
  const face = document.getElementById("bear-face");
  face.textContent = tier.emoji;
  face.className = "bear-face " + tier.face;
}

/* ---------- 時間経過による回復 ---------- */

function startDecayLoop() {
  clearInterval(decayTimer);
  decayTimer = setInterval(() => {
    const now = performance.now();
    if (now - lastTouchAt < 700) return; // 触れた直後は変化させない
    Object.entries(bearStates).forEach(([id, state]) => {
      if (state.ended) return;
      const decay = BEARS[id].decay;
      state.irritation = clamp(state.irritation - decay);
    });
    renderFace();
  }, 900);
}

/* ---------- 親のつぶやき ---------- */

function startParentLineLoop() {
  const el = document.getElementById("parent-line");
  const show = () => {
    el.hidden = false;
    el.textContent = pickFrom(PARENT_LINES);
  };
  show();
  clearInterval(parentLineTimer);
  parentLineTimer = setInterval(show, 7000);
}

/* ---------- ふれあいの締めくくり ---------- */

function showEnding() {
  const state = bearStates[currentBearId];
  state.ended = true;
  const meta = BEARS[currentBearId];
  const panel = document.getElementById("ending-panel");
  const msg = document.getElementById("ending-message");
  msg.textContent =
    `🐻💛👶\n${meta.label}と、てんが一緒に笑った。\nてんとの距離が、少し近づいた気がする。`;
  panel.hidden = false;
}

function restartCurrentBear() {
  bearStates[currentBearId] = initBearState(currentBearId);
  document.getElementById("ending-panel").hidden = true;
  renderFace();
}

/* ---------- ユーティリティ ---------- */

function clamp(v) { return Math.max(0, Math.min(100, v)); }
function randRange(min, max) { return min + Math.random() * (max - min); }
function pickFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

document.addEventListener("DOMContentLoaded", initializeGame);
