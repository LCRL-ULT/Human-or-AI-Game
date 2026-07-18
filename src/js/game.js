import { LEVELS, QUESTION_TIME, DETECTIVE_LEVEL, QUESTIONS_PER_ROUND } from '../data/levels.js';
import { SVGS } from '../data/assets.js';
import { $, $$, shuffle, escapeHtml } from './utils.js';

// The questions now live in a separate data file: data/questions.json.
// We load them here when the game starts. Until they finish loading,
// this list is empty.
let EXHIBITS = [];

// Fetches questions.json and fills in EXHIBITS. Called once at startup.
export async function loadQuestions() {
  const res = await fetch('src/data/questions.json');
  if (!res.ok) throw new Error('Could not load questions.json (' + res.status + ')');
  EXHIBITS = await res.json();
  return EXHIBITS;
}

export const Game = {
  state: {
    level: 1,
    order: [],        // the questions for this round, in order
    index: 0,
    score: 0,
    combo: 0,
    answers: [],      // what the player answered for each question
    timer: null,
    timeLeft: QUESTION_TIME,
    locked: false
  },

  /* ---------- moving between screens ---------- */
  goTo(screen) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    $('screen-' + screen).classList.add('active');
    if (screen === 'levels') this.renderLevels();
    if (screen === 'result') this.renderResultList();
  },

  toggleAbout(open) {
    $('about-modal').classList.toggle('active', open);
  },

  /* ---------- the case-picking screen ---------- */
  renderLevels() {
    const grid = $('level-grid');
    grid.innerHTML = '';
    LEVELS.forEach((lv) => {
      const el = document.createElement('div');
      el.className = 'level-card';
      el.innerHTML = `<div class="level-num">Case 0${lv.id}</div>
        <div class="level-name">${escapeHtml(lv.name)}</div>
        <div class="level-desc">${escapeHtml(lv.desc)}</div>`;
      el.onclick = () => this.startLevel(lv.id);
      grid.appendChild(el);
    });
  },

  // Gets the questions that are allowed to show up in a given case.
  poolForLevel(levelId) {
    const indices = EXHIBITS
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => !q.levels || q.levels.length === 0 || q.levels.includes(levelId))
      .map(({ i }) => i);
    // if a case has no questions of its own, just use all of them
    return indices.length ? indices : EXHIBITS.map((_, i) => i);
  },

  startLevel(levelId) {
    this.state.level = levelId;
    const shuffled = shuffle(this.poolForLevel(levelId));
    // Keep only as many questions as one round needs.
    this.state.order = (QUESTIONS_PER_ROUND > 0)
      ? shuffled.slice(0, QUESTIONS_PER_ROUND)
      : shuffled;
    this.state.index = 0;
    this.state.score = 0;
    this.state.combo = 0;
    this.state.answers = [];
    this.goTo('qa');
    this.renderQuestion();
  },

  /* ---------- showing a question ---------- */
  renderExhibitContent(q) {
    const el = $('evidence-content');
    if (q.contentType === 'text') {
      el.className = 'evidence-content';
      el.innerHTML = `&ldquo;${escapeHtml(q.content)}&rdquo;`;
      return;
    }
    el.className = 'evidence-content center';
    if (q.contentType === 'image') {
      el.innerHTML = `<img src="${encodeURI(q.content)}" alt="Image evidence" />`;
    } else if (q.contentType === 'video') {
      el.innerHTML = `<video src="${encodeURI(q.content)}" controls playsinline></video>`;
    } else {
      // it's a placeholder drawing, so find it in assets.js
      const svg = SVGS[q.content] || '';
      el.innerHTML = svg +
        `<div class="placeholder-note">Sample placeholder — swap in your real ${escapeHtml(q.category)} asset here.</div>`;
    }
  },

  renderQuestion() {
    clearInterval(this.state.timer);
    this.state.locked = false;
    this.state.timeLeft = QUESTION_TIME;

    const q = EXHIBITS[this.state.order[this.state.index]];

    $('hud-progress').textContent = `Question ${this.state.index + 1} / ${this.state.order.length}`;
    $('hud-score').textContent = `Score: ${this.state.score}`;
    $('evidence-tag').textContent = q.tag;

    this.renderExhibitContent(q);

    const stamp = $('verdict-stamp');
    stamp.className = 'verdict-stamp';
    stamp.textContent = '';

    $('reveal-panel').classList.remove('show');
    $('btn-next').style.display = 'none';
    $('btn-human').disabled = false;
    $('btn-ai').disabled = false;
    $('choice-row').style.display = 'grid';

    const detBox = $('detective-box');
    if (this.state.level === DETECTIVE_LEVEL) {
      detBox.style.display = 'block';
      $('detective-note').value = '';
    } else {
      detBox.style.display = 'none';
    }

    const fill = $('timer-fill');
    fill.style.width = '100%';

    this.state.timer = setInterval(() => {
      this.state.timeLeft--;
      fill.style.width = Math.max(0, (this.state.timeLeft / QUESTION_TIME) * 100) + '%';
      if (this.state.timeLeft <= 0) {
        clearInterval(this.state.timer);
        if (!this.state.locked) this.answer(null); // time ran out
      }
    }, 1000);
  },

  /* ---------- when the player answers ---------- */
  answer(picked) {
    if (this.state.locked) return;
    this.state.locked = true;
    clearInterval(this.state.timer);

    const q = EXHIBITS[this.state.order[this.state.index]];
    const correct = picked === q.isAI;

    $('btn-human').disabled = true;
    $('btn-ai').disabled = true;

    let points = 0;
    if (correct) {
      this.state.combo++;
      const multiplier = Math.min(1 + (this.state.combo - 1) * 0.25, 2);
      const timeBonus = Math.max(0, Math.round(this.state.timeLeft / 2));
      points = Math.round((10 + timeBonus) * multiplier);
      this.state.score += points;
    } else {
      this.state.combo = 0;
    }

    $('hud-score').textContent = `Score: ${this.state.score}`;

    const stamp = $('verdict-stamp');
    stamp.textContent = q.isAI ? 'A.I.' : 'HUMAN';
    stamp.classList.add(correct ? 'correct' : 'wrong', 'show');

    $('reveal-heading').textContent = correct
      ? `Correct ${points ? '(+' + points + ' pts)' : ''}`
      : (picked === null ? "Time's up — here's the truth" : 'Not quite');
    $('reveal-explanation').textContent = q.explanation;
    $('reveal-panel').classList.add('show');

    $('btn-next').style.display = 'inline-block';

    this.state.answers.push({
      category: q.category,
      tag: q.tag,
      isAI: q.isAI,
      picked: picked === null ? null : picked,
      correct
    });
  },

  next() {
    this.state.index++;
    if (this.state.index >= this.state.order.length) {
      this.showScore();
    } else {
      this.renderQuestion();
    }
  },

  /* ---------- final score and answer review ---------- */
  showScore() {
    $('final-score').textContent = this.state.score;
    const total = this.state.answers.length;
    const rightCount = this.state.answers.filter((a) => a.correct).length;
    let line = 'CASE SOLVED — nice eye, detective.';
    if (rightCount === total) line = 'PERFECT CASE — you missed nothing.';
    else if (rightCount <= total / 2) line = 'CASE PARTIALLY SOLVED — the trail went cold a few times.';
    $('congrats-line').textContent = line;
    this.goTo('score');
  },

  renderResultList() {
    const list = $('result-list');
    list.innerHTML = '';
    this.state.answers.forEach((a) => {
      const li = document.createElement('li');
      li.className = 'result-item';
      const verdict = a.isAI ? 'A.I.' : 'Human';
      const pickedLabel = a.picked === null ? 'No answer (time out)' : (a.picked ? 'A.I.' : 'Human');
      li.innerHTML = `<div class="result-icon ${a.correct ? 'correct' : 'wrong'}">${a.correct ? '✓' : '✕'}</div>
        <div class="result-text"><span class="cat">${escapeHtml(a.category)} · ${escapeHtml(a.tag)}</span>
        Your answer: <strong>${pickedLabel}</strong> — Actual: <strong>${verdict}</strong></div>`;
      list.appendChild(li);
    });
  }
};
