# HUMAN or A.I.? — The Case Files

A detective-style quiz where players inspect evidence — text, images, video —
and decide whether each piece was made by a **human** or an **AI**. Every reveal
teaches a real tell (six-fingered hands, generic marketing copy, laggy lip-sync).

Built with plain HTML, CSS, and JavaScript (ES modules) — no framework, no build step.

## Run it

The game uses ES modules, so it must be served over HTTP (opening `index.html`
directly with `file://` will not work). From the project folder:

```bash
npm start
```

Then open the URL it prints (default http://localhost:5173).

No Node? Any static server works, e.g.:

```bash
python3 -m http.server 5173
```

## Project structure

```
human-or-ai/
├── index.html            # markup + screens
├── package.json          # dev-server script
├── assets/               # real image/video evidence goes here
└── src/
    ├── css/
    │   └── styles.css     # all styling
    ├── data/              # <-- edit these to change the game
    │   ├── questions.json # the questions (your dataset)
    │   ├── levels.js      # cases + timer + settings
    │   └── assets.js      # placeholder SVG graphics
    └── js/
        ├── game.js        # game logic
        ├── utils.js       # helpers (shuffle, escaping)
        └── main.js        # entry point
```

## Adding your own questions

The questions live in a plain data file: `src/data/questions.json`.
Open it in any text editor and add an entry to the list.

**Text question:**

```json
{
  "category": "text",
  "tag": "EXHIBIT — TEXT",
  "contentType": "text",
  "content": "The paragraph the player reads...",
  "isAI": true,
  "explanation": "Why it is AI / human — shown after answering.",
  "levels": [2, 3]
}
```

**Real image or video:** drop the file in `assets/`, then:

```json
{
  "category": "image",
  "tag": "EXHIBIT — IMAGE",
  "contentType": "image",
  "content": "assets/fake-hands.jpg",
  "isAI": true,
  "explanation": "...",
  "levels": [1]
}
```

A few rules when editing `questions.json`:
- Keep the `[` and `]` at the very top and bottom of the file.
- Put a comma after each `}` — except the last one.
- Use straight double quotes `"..."`, not single quotes.

The top of `src/data/questions.json` follows this same shape for every
question. Cases, the timer, and questions-per-round live in
`src/data/levels.js`.

## Notes

- Scoring rewards speed (time bonus) and streaks (combo multiplier, capped at 2×).
- Questions are shuffled each play.
- Level 4 ("Detective Mode") shows a notes box before you answer.
