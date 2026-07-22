import { LEVELS, QUESTION_TIME, DETECTIVE_LEVEL, QUESTIONS_PER_ROUND, MAX_LIVES, ENDLESS_LEVEL } from '../data/levels.js';
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

/* ============================================================
   Small helpers for the new features. Kept local so they don't
   touch utils.js.
   ============================================================ */

// A short date label (e.g. 2026-07-21) used on the shareable result.
function dateLabel() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Confidence tiers the player bets with. Multiplier scales points
// on a correct call, and lifeCost is how many lives a wrong call
// at that confidence burns.
const CONFIDENCE = [
  { id: 'hunch',   label: 'Hunch',       mult: 1,   lifeCost: 1 },
  { id: 'fairly',  label: 'Fairly Sure', mult: 1.5, lifeCost: 1 },
  { id: 'certain', label: 'Certain',     mult: 2.5, lifeCost: 2 }
];

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
    locked: false,
    lives: MAX_LIVES, // case integrity - run ends at 0
    confidence: 'fairly', // current confidence bet
    endless: false,   // NEW: is this an endless run?
    cleared: 0        // NEW: how many exhibits survived (endless score)
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

    // NEW: Endless Files card - survive on integrity, chase a high score.
    const endless = document.createElement('div');
    endless.className = 'level-card endless-card';
    endless.innerHTML = `<div class="level-num">Endless Files</div>
      <div class="level-name">The Backlog</div>
      <div class="level-desc">Cases never stop. Survive on your integrity. How far can you get?</div>`;
    endless.onclick = () => this.startEndless();
    grid.appendChild(endless);
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

  // Shared reset for the run-level state.
  resetRun() {
    this.state.index = 0;
    this.state.score = 0;
    this.state.combo = 0;
    this.state.answers = [];
    this.state.lives = MAX_LIVES;
    this.state.confidence = 'fairly';
    this.state.cleared = 0;
  },

  startLevel(levelId) {
    this.state.level = levelId;
    this.state.endless = false;
    const shuffled = shuffle(this.poolForLevel(levelId));
    // Keep only as many questions as one round needs.
    this.state.order = (QUESTIONS_PER_ROUND > 0)
      ? shuffled.slice(0, QUESTIONS_PER_ROUND)
      : shuffled;
    this.resetRun();
    this.goTo('qa');
    this.renderQuestion();
  },

  // NEW: Endless mode - a shuffled queue that refills forever. The run
  // only ends when integrity hits zero. Steady difficulty by design.
  startEndless() {
    this.state.level = ENDLESS_LEVEL;
    this.state.endless = true;
    this.state.pool = this.poolForLevel(ENDLESS_LEVEL);
    this.state.order = shuffle(this.state.pool);
    this.resetRun();
    this.goTo('qa');
    this.renderQuestion();
  },

  // NEW: in endless mode, top up the queue so we never run dry. We
  // reshuffle the whole pool and append it, avoiding an immediate repeat
  // of the exhibit the player just saw when possible.
  refillEndless() {
    const lastSeen = this.state.order[this.state.index];
    let next = shuffle(this.state.pool);
    if (next.length > 1 && next[0] === lastSeen) {
      // swap the first two so we don't repeat back-to-back
      [next[0], next[1]] = [next[1], next[0]];
    }
    this.state.order = this.state.order.concat(next);
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
        `<div class="placeholder-note">Sample placeholder - swap in your real ${escapeHtml(q.category)} asset here.</div>`;
    }
  },

  // Builds (once) and updates the lives display in the HUD.
  renderLives() {
    let el = $('hud-lives');
    if (!el) {
      el = document.createElement('span');
      el.id = 'hud-lives';
      el.className = 'hud-lives';
      // sit it next to the score in the HUD
      const score = $('hud-score');
      if (score && score.parentNode) score.parentNode.insertBefore(el, score.nextSibling);
      else return;
    }
    const hearts = '\u25C6'.repeat(this.state.lives) + '\u25C7'.repeat(Math.max(0, MAX_LIVES - this.state.lives));
    el.textContent = `Integrity: ${hearts}`;
  },

  // Builds (once) the confidence selector and wires it up.
  renderConfidence() {
    let box = $('confidence-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'confidence-box';
      box.className = 'confidence-box';
      box.innerHTML = `<label>How sure are you?</label>
        <div class="confidence-row">${CONFIDENCE.map((c) =>
          `<button type="button" class="conf-btn" data-conf="${c.id}">${escapeHtml(c.label)}
             <span class="conf-mult">${c.mult}\u00D7</span></button>`).join('')}</div>`;
      // place it just above the choice row
      const choiceRow = $('choice-row');
      if (choiceRow && choiceRow.parentNode) {
        choiceRow.parentNode.insertBefore(box, choiceRow);
      }
      box.querySelectorAll('.conf-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.state.confidence = btn.dataset.conf;
          this.updateConfidenceUI();
        });
      });
    }
    box.style.display = 'block';
    this.updateConfidenceUI();
  },

  updateConfidenceUI() {
    const box = $('confidence-box');
    if (!box) return;
    box.querySelectorAll('.conf-btn').forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.conf === this.state.confidence);
    });
  },

  renderQuestion() {
    clearInterval(this.state.timer);
    this.state.locked = false;
    this.state.timeLeft = QUESTION_TIME;
    this.state.confidence = 'fairly'; // reset each question

    // Endless: make sure there's always another exhibit queued up.
    if (this.state.endless && this.state.index >= this.state.order.length - 1) {
      this.refillEndless();
    }

    const q = EXHIBITS[this.state.order[this.state.index]];

    // Progress readout: a running "cleared" count in endless, else N / total.
    $('hud-progress').textContent = this.state.endless
      ? `Cleared: ${this.state.cleared}`
      : `Question ${this.state.index + 1} / ${this.state.order.length}`;
    $('hud-score').textContent = `Score: ${this.state.score}`;
    this.renderLives();
    $('evidence-tag').textContent = q.tag;

    this.renderExhibitContent(q);
    this.renderConfidence();

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
    const conf = CONFIDENCE.find((c) => c.id === this.state.confidence) || CONFIDENCE[1];

    $('btn-human').disabled = true;
    $('btn-ai').disabled = true;
    const confBox = $('confidence-box');
    if (confBox) confBox.style.display = 'none';

    let points = 0;
    let lifeLost = 0;
    if (correct) {
      this.state.combo++;
      if (this.state.endless) this.state.cleared++;
      const multiplier = Math.min(1 + (this.state.combo - 1) * 0.25, 2);
      const timeBonus = Math.max(0, Math.round(this.state.timeLeft / 2));
      // confidence multiplier layered on top of the combo multiplier
      points = Math.round((10 + timeBonus) * multiplier * conf.mult);
      this.state.score += points;
    } else {
      this.state.combo = 0;
      // a wrong (or timed-out) call costs integrity; bolder bets cost more.
      // a timeout always costs a single life regardless of confidence.
      lifeLost = (picked === null) ? 1 : conf.lifeCost;
      this.state.lives = Math.max(0, this.state.lives - lifeLost);
    }

    $('hud-score').textContent = `Score: ${this.state.score}`;
    if (this.state.endless) $('hud-progress').textContent = `Cleared: ${this.state.cleared}`;
    this.renderLives();

    const stamp = $('verdict-stamp');
    stamp.textContent = q.isAI ? 'A.I.' : 'HUMAN';
    stamp.classList.add(correct ? 'correct' : 'wrong', 'show');

    let heading;
    if (correct) {
      heading = `Correct${points ? ' (+' + points + ' pts, ' + conf.label + ' ' + conf.mult + '\u00D7)' : ''}`;
    } else if (picked === null) {
      heading = "Time's up - here's the truth" + (lifeLost ? ` (-${lifeLost} integrity)` : '');
    } else {
      heading = `Not quite (-${lifeLost} integrity)`;
    }
    $('reveal-heading').textContent = heading;
    // Explanations are multi-line (paragraph + bulleted "what to look for"),
    // so escape the text but keep the line breaks readable.
    $('reveal-explanation').innerHTML = escapeHtml(q.explanation).replace(/\n/g, '<br>');
    $('reveal-panel').classList.add('show');

    $('btn-next').style.display = 'inline-block';
    // if integrity is gone, the next button ends the case early
    if (this.state.lives <= 0) {
      $('btn-next').textContent = this.state.endless ? 'Game over \u2192' : 'Case blown \u2192';
    } else {
      $('btn-next').textContent = 'Next \u2192';
    }

    this.state.answers.push({
      category: q.category,
      tag: q.tag,
      isAI: q.isAI,
      picked: picked === null ? null : picked,
      correct,
      confidence: conf.id
    });
  },

  next() {
    // out of integrity? the case is blown / run is over - end it now.
    if (this.state.lives <= 0) {
      this.showScore(true);
      return;
    }
    this.state.index++;
    // Endless never ends on running out of questions (refill handles that);
    // fixed cases end when the round's questions are done.
    if (!this.state.endless && this.state.index >= this.state.order.length) {
      this.showScore(false);
    } else {
      this.renderQuestion();
    }
  },

  /* ---------- final score and answer review ---------- */
  showScore(blown) {
    $('final-score').textContent = this.state.score;
    const total = this.state.answers.length;
    const rightCount = this.state.answers.filter((a) => a.correct).length;

    let line;
    if (this.state.endless) {
      // endless always ends on a blown run; celebrate the survival count.
      if (this.state.cleared === 0) line = 'GAME OVER - the backlog got you on the first file.';
      else if (this.state.cleared >= 20) line = `GAME OVER - ${this.state.cleared} cleared. Elite instincts, detective.`;
      else if (this.state.cleared >= 10) line = `GAME OVER - ${this.state.cleared} cleared. Sharp eye.`;
      else line = `GAME OVER - ${this.state.cleared} cleared. The backlog wins... this time.`;
    } else if (blown) {
      line = 'CASE BLOWN - you ran out of integrity. The suspect walks.';
    } else if (rightCount === total) {
      line = 'PERFECT CASE - you missed nothing.';
    } else if (rightCount <= total / 2) {
      line = 'CASE PARTIALLY SOLVED - the trail went cold a few times.';
    } else {
      line = 'CASE SOLVED - nice eye, detective.';
    }
    $('congrats-line').textContent = line;

    this.renderShare(blown);
    this.goTo('score');
  },

  // Builds a spoiler-free emoji result grid + copy button.
  renderShare(blown) {
    let wrap = $('share-box');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'share-box';
      wrap.className = 'share-box';
      wrap.innerHTML = `<pre id="share-grid" class="share-grid"></pre>
        <button type="button" id="share-copy" class="btn btn-ghost share-copy">Copy result</button>
        <span id="share-copied" class="share-copied"></span>`;
      const actions = $('score-actions') || ($('final-score') && $('final-score').parentNode);
      if (actions && actions.parentNode) actions.parentNode.insertBefore(wrap, actions);
      else return;
      $('share-copy').addEventListener('click', () => this.copyShare());
    }

    // Build the grid. Green correct, red wrong, black not reached.
    // In endless we cap the grid so a long run doesn't produce a wall of squares.
    const total = this.state.endless ? this.state.answers.length : this.state.order.length;
    const CAP = 30;
    const shown = Math.min(total, CAP);
    const marks = [];
    for (let i = 0; i < shown; i++) {
      const a = this.state.answers[i];
      if (!a) marks.push('\u2B1B');
      else if (a.correct) marks.push('\uD83D\uDFE9');
      else marks.push('\uD83D\uDFE5');
    }
    if (total > CAP) marks.push('\u2026');

    let title;
    let scoreLine;
    if (this.state.endless) {
      title = `HUMAN or A.I.? - Endless ${dateLabel()}`;
      scoreLine = `${this.state.cleared} cleared - ${this.state.score} pts`;
    } else {
      title = `HUMAN or A.I.? - ${(LEVELS.find((l) => l.id === this.state.level) || {}).name || 'Case'} ${dateLabel()}`;
      const rightCount = this.state.answers.filter((a) => a.correct).length;
      scoreLine = blown
        ? `Case blown at ${this.state.answers.length}/${total} - ${this.state.score} pts`
        : `${rightCount}/${total} calls - ${this.state.score} pts`;
    }

    const text = `${title}\n${marks.join('')}\n${scoreLine}`;
    this._shareText = text;
    $('share-grid').textContent = text;
    $('share-copied').textContent = '';
  },

  async copyShare() {
    const text = this._shareText || '';
    try {
      await navigator.clipboard.writeText(text);
      $('share-copied').textContent = 'Copied!';
    } catch (e) {
      // clipboard blocked (e.g. insecure context) - fall back to select
      const grid = $('share-grid');
      const range = document.createRange();
      range.selectNodeContents(grid);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      $('share-copied').textContent = 'Select + copy the text above';
    }
  },

  renderResultList() {
    const list = $('result-list');
    list.innerHTML = '';
    this.state.answers.forEach((a) => {
      const li = document.createElement('li');
      li.className = 'result-item';
      const verdict = a.isAI ? 'A.I.' : 'Human';
      const pickedLabel = a.picked === null ? 'No answer (time out)' : (a.picked ? 'A.I.' : 'Human');
      const confLabel = (CONFIDENCE.find((c) => c.id === a.confidence) || {}).label || '';
      li.innerHTML = `<div class="result-icon ${a.correct ? 'correct' : 'wrong'}">${a.correct ? '\u2713' : '\u2715'}</div>
        <div class="result-text"><span class="cat">${escapeHtml(a.category)} \u00B7 ${escapeHtml(a.tag)}${confLabel ? ' \u00B7 ' + escapeHtml(confLabel) : ''}</span>
        Your answer: <strong>${pickedLabel}</strong> - Actual: <strong>${verdict}</strong></div>`;
      list.appendChild(li);
    });
  }
};
