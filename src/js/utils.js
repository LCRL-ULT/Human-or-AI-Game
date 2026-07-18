/* Small helper tools that the game uses to stay tidy. */

// Quick way to grab one thing on the page by its id.
export const $ = (id) => document.getElementById(id);

// Quick way to grab several things on the page at once.
export const $$ = (selector) => document.querySelectorAll(selector);

// Mixes a list into random order (used to shuffle the questions).
export function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Makes text safe to show on the page so it can't break the layout.
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
