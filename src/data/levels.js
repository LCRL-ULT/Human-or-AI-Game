/* ============================================================
   LEVELS (the different cases players can pick)

   This file sets up the four cases and a few game settings.
   You can change the names, the timer, and how many questions
   each round has — just edit the values below.
   ============================================================ */

// The four cases shown on the "Choose Your Case" screen.
// id   = the case number (also used to pick which questions show up)
// name = the title players see
// desc = the little description under the title
export const LEVELS = [
  { id: 1, name: 'Easy Lead',     desc: 'Obvious tells. Warm-up round.' },
  { id: 2, name: 'Mixed Signals', desc: 'A blend of real and fake evidence.' },
  { id: 3, name: 'Cold Case',     desc: 'Very convincing fakes. Look closely.' },
  { id: 4, name: 'Detective Mode', desc: 'Write your reasoning before the reveal.' }
];

// How many seconds the player gets to answer each question.
export const QUESTION_TIME = 20;

// How many questions to show in one round.
// The game mixes up the available questions and picks this many.
// Tip: set this to 0 to use ALL the questions in a round.
export const QUESTIONS_PER_ROUND = 6;

// Which case shows the "write your reasoning" notes box before answering.
// Right now that's case 4 (Detective Mode).
export const DETECTIVE_LEVEL = 4;
