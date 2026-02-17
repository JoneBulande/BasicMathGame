/* ═══════════════════════════════════════════
   MathRush — game.js
   ═══════════════════════════════════════════ */

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

const DIFF = {
  easy:   { min: 1,  max: 12 },
  medium: { min: 5,  max: 50 },
  hard:   { min: 10, max: 100 },
};

const OP_COLORS = {
  add:  'var(--accent)',
  sub:  'var(--accent2)',
  mult: 'var(--accent3)',
  div:  'var(--accent4)',
};

const RESULT_MESSAGES = [
  [90, '🔥 Incrível! Você é um gênio!'],
  [70, '⚡ Excelente resultado!'],
  [50, '👍 Bom trabalho!'],
  [30, '💪 Continue praticando!'],
  [ 0, '📚 Vamos estudar mais?'],
];

const TIMER_CIRCUMFERENCE = 201; // 2 × π × 32

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════

const state = {
  op:             'add',
  diff:           'easy',
  timeLimit:      60,
  score:          0,
  correct:        0,
  wrong:          0,
  streak:         0,
  bestStreak:     0,
  questionIndex:  0,
  totalQuestions: 10,
  timeLeft:       60,
  timer:          null,
  locked:         false,
  currentAnswer:  0,
};

// ═══════════════════════════════════════════
//  SCREEN MANAGEMENT
// ═══════════════════════════════════════════

/**
 * Show the screen with the given id and hide all others.
 * @param {string} id - The element id of the target screen.
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ═══════════════════════════════════════════
//  START SCREEN — SELECTORS
// ═══════════════════════════════════════════

/**
 * Select an operation button and update state.
 * @param {HTMLElement} btn
 */
function selectOp(btn) {
  document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.op = btn.dataset.op;
}

/**
 * Select a difficulty button and update state.
 * @param {HTMLElement} btn
 */
function selectDiff(btn) {
  document.querySelectorAll('.diff-btn[data-diff]').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.diff = btn.dataset.diff;
}

/**
 * Select a time limit button and update state.
 * @param {HTMLElement} btn
 */
function selectTime(btn) {
  document.querySelectorAll('.diff-btn[data-time]').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.timeLimit = parseInt(btn.dataset.time);
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════

/**
 * Return a random integer between min and max (inclusive).
 */
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array in place using Fisher-Yates and return it.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════
//  QUESTION GENERATION
// ═══════════════════════════════════════════

/**
 * Generate a question string and correct answer based on
 * the current operation and difficulty settings.
 * @returns {{ questionStr: string, answer: number }}
 */
function generateQuestion() {
  const { min, max } = DIFF[state.diff];
  let a, b, answer, questionStr;

  switch (state.op) {
    case 'add':
      a = rnd(min, max);
      b = rnd(min, max);
      answer      = a + b;
      questionStr = `${a} + ${b}`;
      break;

    case 'sub':
      a = rnd(min, max);
      b = rnd(min, a);           // ensure result ≥ 0
      answer      = a - b;
      questionStr = `${a} − ${b}`;
      break;

    case 'mult':
      a = rnd(min, Math.min(max, 25));
      b = rnd(1,   Math.min(12, max));
      answer      = a * b;
      questionStr = `${a} × ${b}`;
      break;

    case 'div':
      b      = rnd(1,   Math.min(12, max));
      answer = rnd(min, Math.min(max, 20));
      a      = answer * b;       // guarantee integer result
      questionStr = `${a} ÷ ${b}`;
      break;
  }

  return { questionStr, answer };
}

/**
 * Generate 4 answer options (1 correct + 3 plausible wrong).
 * @param {number} answer - The correct answer.
 * @returns {number[]} Shuffled array of 4 options.
 */
function generateOptions(answer) {
  const opts = new Set([answer]);

  while (opts.size < 4) {
    const offset = rnd(1, Math.max(5, Math.abs(answer) * 0.3 + 3));
    const sign   = Math.random() > 0.5 ? 1 : -1;
    const wrong  = answer + offset * sign;
    if (wrong !== answer && wrong >= 0) opts.add(wrong);
  }

  return shuffle([...opts]);
}

// ═══════════════════════════════════════════
//  GAME FLOW
// ═══════════════════════════════════════════

/**
 * Reset state and launch a new game session.
 */
function startGame() {
  state.score         = 0;
  state.correct       = 0;
  state.wrong         = 0;
  state.streak        = 0;
  state.bestStreak    = 0;
  state.questionIndex = 0;
  state.timeLeft      = state.timeLimit;
  state.locked        = false;

  // Apply the operation's accent colour to the question card top border
  document.getElementById('question-card')
    .style.setProperty('--op-accent', OP_COLORS[state.op]);

  updateHUD();
  renderStreakDots();
  showScreen('screen-game');
  nextQuestion();
  startTimer();
}

/**
 * Render the next question, or end the game if all questions are done.
 */
function nextQuestion() {
  if (state.questionIndex >= state.totalQuestions) {
    endGame();
    return;
  }

  state.locked = false;

  const { questionStr, answer } = generateQuestion();
  state.currentAnswer = answer;

  // Update question card
  document.getElementById('question-num').textContent =
    `PERGUNTA ${state.questionIndex + 1} / ${state.totalQuestions}`;
  document.getElementById('question-text').innerHTML = questionStr;

  // Update progress bar
  document.getElementById('progress-bar').style.width =
    `${(state.questionIndex / state.totalQuestions) * 100}%`;

  // Render answer buttons
  const grid = document.getElementById('answers-grid');
  grid.innerHTML = '';

  generateOptions(answer).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.innerHTML = `<span>${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, opt, answer));
    grid.appendChild(btn);
  });
}

/**
 * Handle a player's answer selection.
 * @param {HTMLElement} btn     - The clicked button.
 * @param {number}      chosen  - The value the player selected.
 * @param {number}      correct - The correct answer.
 */
function handleAnswer(btn, chosen, correct) {
  if (state.locked) return;
  state.locked = true;

  const isCorrect = chosen === correct;
  const card      = document.getElementById('question-card');
  const allBtns   = document.querySelectorAll('.ans-btn');

  // Reveal correct answer and disable all buttons
  allBtns.forEach(b => {
    const val = parseInt(b.querySelector('span').textContent);
    if (val === correct) b.classList.add('correct');
    b.disabled = true;
  });

  if (isCorrect) {
    state.correct++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    // Streak multiplier: +10 pts × streak (capped at 5×)
    const multiplier = Math.min(state.streak, 5);
    state.score += 10 * multiplier;

    card.classList.add('flash-correct');
    setTimeout(() => card.classList.remove('flash-correct'), 600);
  } else {
    state.wrong++;
    state.streak = 0;
    btn.classList.add('wrong');
    card.classList.add('flash-wrong');
    setTimeout(() => card.classList.remove('flash-wrong'), 600);
  }

  updateHUD();
  updateStreakDots();

  state.questionIndex++;
  setTimeout(nextQuestion, 700);
}

// ═══════════════════════════════════════════
//  TIMER
// ═══════════════════════════════════════════

/**
 * Start the countdown timer and update the circular SVG ring.
 */
function startTimer() {
  clearInterval(state.timer);

  state.timer = setInterval(() => {
    state.timeLeft--;

    const numEl = document.getElementById('timer-num');
    const ring  = document.getElementById('timer-ring');
    const ratio = state.timeLeft / state.timeLimit;
    const offset = TIMER_CIRCUMFERENCE * (1 - ratio);

    ring.style.strokeDashoffset = offset;
    numEl.textContent = state.timeLeft;

    // Colour the ring based on remaining time
    if (ratio < 0.25) {
      ring.style.stroke  = 'var(--wrong)';
      numEl.style.color  = 'var(--wrong)';
    } else if (ratio < 0.5) {
      ring.style.stroke  = 'var(--accent2)';
      numEl.style.color  = 'var(--accent2)';
    } else {
      ring.style.stroke  = 'var(--accent)';
      numEl.style.color  = 'var(--accent)';
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      endGame();
    }
  }, 1000);
}

// ═══════════════════════════════════════════
//  HUD UPDATES
// ═══════════════════════════════════════════

/** Refresh score and correct-answer counters in the top bar. */
function updateHUD() {
  document.getElementById('score-display').textContent   = state.score;
  document.getElementById('correct-display').textContent = state.correct;
}

/** Build the 5 streak indicator dots. */
function renderStreakDots() {
  const bar = document.getElementById('streak-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const dot    = document.createElement('div');
    dot.className = 'streak-dot';
    dot.id        = `streak-dot-${i}`;
    bar.appendChild(dot);
  }
}

/** Light up streak dots up to the current streak count. */
function updateStreakDots() {
  for (let i = 0; i < 5; i++) {
    const dot = document.getElementById(`streak-dot-${i}`);
    if (dot) dot.classList.toggle('lit', i < state.streak);
  }
}

// ═══════════════════════════════════════════
//  END GAME
// ═══════════════════════════════════════════

/** Stop the timer, calculate results, and show the result screen. */
function endGame() {
  clearInterval(state.timer);

  const total    = state.correct + state.wrong;
  const accuracy = total > 0 ? Math.round((state.correct / total) * 100) : 0;

  // Populate result screen
  document.getElementById('result-score').textContent = state.score;
  document.getElementById('res-correct').textContent  = state.correct;
  document.getElementById('res-wrong').textContent    = state.wrong;
  document.getElementById('res-streak').textContent   = `${state.bestStreak}x`;

  const [, message] = RESULT_MESSAGES.find(([min]) => accuracy >= min);
  document.getElementById('result-message').textContent = message;

  showScreen('screen-result');

  // Trigger confetti for great performance
  if (accuracy >= 70) spawnConfetti();
}

// ═══════════════════════════════════════════
//  CONFETTI
// ═══════════════════════════════════════════

/** Spawn animated confetti pieces across the screen. */
function spawnConfetti() {
  const colors = [
    'var(--accent)',
    'var(--accent2)',
    'var(--accent3)',
    'var(--accent4)',
    '#ffffff',
  ];

  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:               ${Math.random() * 100}vw;
      top:                0;
      background:         ${colors[i % colors.length]};
      width:              ${rnd(6, 12)}px;
      height:             ${rnd(6, 12)}px;
      border-radius:      ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${rnd(12, 22) * 0.1}s;
      animation-delay:    ${rnd(0, 10) * 0.1}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ═══════════════════════════════════════════
//  NAVIGATION HELPERS
// ═══════════════════════════════════════════

/** Return to the start screen and reset the timer UI. */
function goHome() {
  clearInterval(state.timer);
  showScreen('screen-start');

  // Reset timer ring visual
  const ring = document.getElementById('timer-ring');
  if (ring) {
    ring.style.strokeDashoffset = 0;
    ring.style.stroke           = 'var(--accent)';
  }
  document.getElementById('timer-num').style.color = 'var(--accent)';
}

/** Restart the game with the same settings. */
function restartGame() {
  startGame();
}
