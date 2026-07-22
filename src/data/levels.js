/* ============================================================
   LEVELS (the different cases players can pick)

   These map onto the dataset's three difficulty tiers:
   easy -> Case 1, medium -> Case 2, hard -> Case 3.
   Case 4 (Detective Mode) draws from ALL items.
   ============================================================ */

export const LEVELS = [
  { id: 1, name: 'Easy Lead',      desc: 'Obvious tells. Warm-up round.' },
  { id: 2, name: 'Mixed Signals',  desc: 'Convincing fakes. Look closer.' },
  { id: 3, name: 'Cold Case',      desc: 'Expert forgeries. Trust nothing.' },
  { id: 4, name: 'Detective Mode', desc: 'All difficulties. Write your reasoning first.' }
];

// How many seconds the player gets to answer each question.
// Videos need time to watch, so this is generous.
export const QUESTION_TIME = 45;

// How many questions to show in one round.
// The dataset guidelines specify 6 questions per round.
// Tip: set this to 0 to use ALL the questions in a round.
export const QUESTIONS_PER_ROUND = 6;

// Which case shows the "write your reasoning" notes box before answering.
export const DETECTIVE_LEVEL = 4;

// How many wrong calls before the case is "blown" (run ends early).
export const MAX_LIVES = 3;

// Which question pool Endless mode draws from. Level 4 = every item,
// so an endless run mixes easy, medium and hard evidence.
export const ENDLESS_LEVEL = 4;
