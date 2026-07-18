import { Game, loadQuestions } from './game.js';

// This makes the game work with the buttons in the HTML page.
window.Game = Game;

// Load the questions from the data file first, then get the game ready.
loadQuestions()
  .then(() => {
    Game.renderLevels();
  })
  .catch((err) => {
    // If the questions file can't load, tell the player instead of
    // showing a blank screen. (Most common cause: opening index.html
    // directly instead of running it through the local server.)
    console.error(err);
    document.getElementById('app').innerHTML =
      '<p style="font-family:monospace;color:#B23A2E;text-align:center;margin-top:40px;">' +
      "Couldn't load the questions. Please run the game with a local server " +
      '(see the README — try "npm start").</p>';
  });
