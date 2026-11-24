// Turtle activity: one page, two playgrounds that share the same turtle.
//   🧩 arrows (Session 1): forward / left / right buttons on a dot grid.
//   ✍️ code (Session 2): type Logo (fd, rt, lt, repeat…) on an open board.
// The arrows mode can hand its program to the code mode ("✍️ write it yourself").
import { ALL_LEVELS, findLevel } from './levels.js';
import { STRINGS } from './strings.js';
import { pick, applyStrings, wireLangButton } from '../../../assets/js/core/i18n.js';
import { load, save } from '../../../assets/js/core/storage.js';

const T = pick(STRINGS);
applyStrings(STRINGS);
wireLangButton(document.getElementById('lang-btn'));

const level = findLevel(new URLSearchParams(location.search).get('level') ?? 'free');
const solved = new Set(load('turtle:solved', []));
const bar = document.getElementById('level-bar');

for (const mode of ['arrows', 'code']) {
  const group = document.createElement('div');
  group.className = 'level-group' + (level.mode === mode ? ' on' : '');
  const label = document.createElement('span');
  label.className = 'group-label';
  label.textContent = mode === 'arrows' ? T.groupArrows : T.groupCode;
  group.appendChild(label);
  for (const lv of ALL_LEVELS.filter((l) => l.mode === mode)) {
    const a = document.createElement('a');
    a.href = `?level=${lv.id}`;
    a.className = 'level-dot' + (lv.id === level.id ? ' current' : '') + (solved.has(lv.id) ? ' solved' : '');
    a.textContent = lv.icon;
    a.title = pick(lv.title);
    a.setAttribute('aria-label', pick(lv.title));
    group.appendChild(a);
  }
  bar.appendChild(group);
}

function onSolved(id) {
  if (solved.has(id)) return;
  solved.add(id);
  save('turtle:solved', [...solved]);
  bar.querySelector('.current')?.classList.add('solved');
}

const mod = level.mode === 'code' ? await import('./code.js') : await import('./grid.js');
mod.init(level, T, solved, onSolved);
