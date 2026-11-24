# Academy

Interactive coding activities for the academy's kids' courses (Arabic, RTL).
Live site: https://mohamed-abdelkarem.github.io/academy/

## What's here
| Path | What it is |
|---|---|
| `index.html` | Hub page: list of activities |
| `activities/maze/` | Panda maze with Blockly blocks (Course 1, Sessions 3–4) |
| `assets/css/base.css` | Shared look (colors, fonts, buttons, dialogs) |
| `assets/js/core/` | Shared code: `storage.js` (localStorage), `access.js` (session codes), `ui.js` (dialogs), `code-format.js` |
| `config/access-codes.js` | Which code opens which levels (hashes only) |
| `vendor/blockly/13.5.0/` | Blockly library (Apache-2.0), pinned version |
| `tools/hash-code.mjs` | Makes the hash for a new code |
| `tests/` | Engine tests (`npm test`, Node 18+) |
| `docs/TEACHER.md` | Teacher guide (Arabic) |

## How it's built
- Plain static site: HTML + ES modules, no build step. GitHub Pages serves the `main` branch as is.
- Each activity is a folder under `activities/<id>/` with its own `index.html`, CSS and `js/`.
  Game logic is kept DOM-free (`engine.js`, `levels.js`) so it can be tested in Node.
- Shared code lives in `assets/js/core/` and is imported with relative paths.

## Session codes
- A code unlocks a set of levels on that device (saved in `localStorage`). The teacher code opens everything.
- Only SHA-256 hashes of the codes are in the repo. This is a "drawer lock", not security:
  it stops kids from opening next week's levels early. There is no personal data on the site.
- New code: `node tools/hash-code.mjs <code>` → put the hash in `config/access-codes.js`. Change codes for each new group.

## Adding an activity
1. `activities/<id>/index.html` + `js/main.js` (copy the maze page structure: header, level bar, locked panel).
2. Use `isUnlocked('<id>', level)` from `assets/js/core/access.js` and add grants for `<id>` in `config/access-codes.js`.
3. Add a card to `index.html`.
4. Put pure logic in its own module and add tests in `tests/`.

## Develop locally
```
python3 -m http.server 8000   # then open http://localhost:8000/
npm test
```
(Open through a server, not `file://`: ES modules and `crypto.subtle` need it.)

## Credits
Maze levels follow Blockly Games Maze (google/blockly-games, Apache-2.0). Blockly © Google, Apache-2.0.
