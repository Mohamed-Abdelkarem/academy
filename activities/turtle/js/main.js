import { N, NEXT, run, toLogo } from './engine.js';
import { LEVELS, levelById } from './levels.js';
import { STRINGS } from './strings.js';
import { pick, applyStrings, wireLangButton, getLang } from '../../../assets/js/core/i18n.js';
import { load, save } from '../../../assets/js/core/storage.js';

const T = pick(STRINGS);
const L = getLang();
const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const M = 46, C = 90, SIZE = M * 2 + C * N; // 632
const SPEEDS = { slow: 850, normal: 550, fast: 300 };
const GLYPH = { F: '↑', L: '↺', R: '↻' };

const params = new URLSearchParams(location.search);
const level = levelById(params.get('level') ?? 'free');
let program = level.preset.slice();
let edited = false;
let speed = load('turtle:speed', 'normal');
let showCode = false;
let timer = null;
let status = level.preset.length ? 'idleBug' : 'idle';
let activeStep = -1;

const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
const px = (v) => M + v * C;

// ---------------------------------------------------------------- board
const svg = el('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'board-svg', role: 'img', 'aria-label': T.title });
el('rect', { x: 2, y: 2, width: SIZE - 4, height: SIZE - 4, rx: 36, class: 'board-bg' }, svg);
for (let x = 0; x <= N; x++) for (let y = 0; y <= N; y++) el('circle', { cx: px(x), cy: px(y), r: 6, class: 'board-dot' }, svg);
if (level.target) {
  const pts = level.target.map(([x, y]) => `${px(x)},${px(y)}`).join(' ');
  el('polyline', { points: pts, class: 'board-road' }, svg);
  const [gx, gy] = level.target[level.target.length - 1];
  el('circle', { cx: px(gx), cy: px(gy), r: 20, class: 'board-goal' }, svg);
}
const drawLayer = el('g', {}, svg);
const turtle = el('g', { class: 'turtle' }, svg);
const body = el('g', {}, turtle);
[[-20, -18], [20, -18], [-20, 18], [20, 18]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 10, class: 't-leg' }, body));
el('circle', { cx: 0, cy: -30, r: 13, class: 't-head' }, body);
el('circle', { cx: -5, cy: -34, r: 3, class: 't-eye' }, body);
el('circle', { cx: 5, cy: -34, r: 3, class: 't-eye' }, body);
el('circle', { cx: 0, cy: 0, r: 26, class: 't-shell' }, body);
el('circle', { cx: 0, cy: 0, r: 10, class: 't-spot' }, body);
$('#board').appendChild(svg);

function placeTurtle(x, y, rot, animate) {
  turtle.style.transition = animate ? `transform ${Math.round(SPEEDS[speed] * 0.8)}ms ease-in-out` : 'none';
  turtle.style.transform = `translate(${px(x)}px, ${px(y)}px) rotate(${rot}deg)`;
}
function drawSegs(segs, cls = 'board-line') {
  drawLayer.innerHTML = '';
  segs.forEach(([x1, y1, x2, y2]) => el('line', { x1: px(x1), y1: px(y1), x2: px(x2), y2: px(y2), class: cls }, drawLayer));
}
const start = () => ({ x: level.start[0], y: level.start[1], d: level.start[2] });

// ---------------------------------------------------------------- level bar
const bar = $('#level-bar');
const solved = new Set(load('turtle:solved', []));
LEVELS.forEach((lv) => {
  const a = document.createElement('a');
  a.href = `?level=${lv.id}`;
  a.className = 'level-dot' + (lv.id === level.id ? ' current' : '') + (solved.has(lv.id) ? ' solved' : '');
  a.textContent = lv.icon;
  a.title = pick(lv.title);
  a.setAttribute('aria-label', pick(lv.title));
  bar.appendChild(a);
});
$('#level-title').textContent = pick(level.title);
$('#level-task').textContent = pick(level.task);

// ---------------------------------------------------------------- program UI
function setStatus(s) {
  status = s;
  const box = $('#status');
  box.textContent = T[s];
  box.className = 'status ' + s;
}
function renderProgram() {
  $('#count').textContent = T.steps(program.length);
  const chips = $('#chips');
  chips.innerHTML = '';
  if (showCode) {
    const lines = toLogo(program);
    chips.className = 'code-view';
    chips.dir = 'ltr';
    lines.forEach((t, i) => {
      const d = document.createElement('div');
      d.className = 'code-line' + (i === activeStep ? ' active' : '');
      d.textContent = `${String(i + 1).padStart(2, ' ')}  ${t}`;
      chips.appendChild(d);
    });
    const note = document.createElement('p');
    note.className = 'muted code-note';
    note.dir = getLang() === 'ar' ? 'rtl' : 'ltr';
    note.textContent = T.logoNote;
    chips.appendChild(note);
  } else {
    chips.className = 'chips';
    chips.dir = '';
    if (!program.length) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = T.empty;
      chips.appendChild(p);
    }
    program.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `chip chip-${c}` + (i === activeStep ? ' active' : '');
      b.innerHTML = `<span class="chip-n">${i + 1}</span><span class="chip-g">${GLYPH[c]}</span><span>${T[c]}</span>`;
      b.title = T.tip;
      b.addEventListener('click', () => { program[i] = NEXT[c]; edit(); });
      chips.appendChild(b);
    });
  }
  $('#toggle-code').textContent = showCode ? T.showBlocks : T.showCode;
  $('#restore-btn').hidden = !(level.preset.length && edited);
}
function edit() {
  stop();
  edited = true;
  activeStep = -1;
  const s = start();
  placeTurtle(s.x, s.y, s.d * 90, false);
  drawSegs([]);
  setStatus('idle');
  renderProgram();
}
function add(c) {
  if (program.length >= 24) return;
  program.push(c);
  edit();
}
function stop() { clearTimeout(timer); timer = null; }

function play() {
  stop();
  const s = start();
  placeTurtle(s.x, s.y, s.d * 90, false);
  drawSegs([]);
  activeStep = -1;
  renderProgram();
  const { steps, result } = run(program, s, level.target);
  setStatus('running');
  let k = 0;
  const tick = () => {
    if (k >= steps.length) {
      activeStep = -1;
      if (result === 'win' && !solved.has(level.id)) {
        solved.add(level.id);
        save('turtle:solved', [...solved]);
        bar.querySelector('.current')?.classList.add('solved');
      }
      setStatus(result);
      renderProgram();
      return;
    }
    const st = steps[k];
    activeStep = st.i;
    drawSegs(st.segs);
    if (st.wall) {
      turtle.classList.add('bump');
      setTimeout(() => turtle.classList.remove('bump'), 700);
      setStatus('wall');
      renderProgram();
      return;
    }
    placeTurtle(st.x, st.y, st.rot, true);
    renderProgram();
    k++;
    timer = setTimeout(tick, SPEEDS[speed]);
  };
  timer = setTimeout(tick, 250);
}

// ---------------------------------------------------------------- wiring
applyStrings(STRINGS);
wireLangButton($('#lang-btn'));
['F', 'L', 'R'].forEach((c) => {
  const b = $(`#add-${c}`);
  b.querySelector('.cmd-ar').textContent = T[c];
  b.querySelector('.cmd-en').hidden = L !== 'ar';
  b.addEventListener('click', () => add(c));
});
$('#run-btn').addEventListener('click', play);
$('#undo-btn').addEventListener('click', () => { program.pop(); edit(); });
$('#clear-btn').addEventListener('click', () => { program = []; edit(); });
$('#restore-btn').addEventListener('click', () => { program = level.preset.slice(); edit(); edited = false; renderProgram(); setStatus('idleBug'); });
$('#toggle-code').addEventListener('click', () => { showCode = !showCode; renderProgram(); });
document.querySelectorAll('[data-speed]').forEach((b) => {
  b.classList.toggle('on', b.dataset.speed === speed);
  b.addEventListener('click', () => {
    speed = b.dataset.speed;
    save('turtle:speed', speed);
    document.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
  });
});

const s0 = start();
placeTurtle(s0.x, s0.y, s0.d * 90, false);
setStatus(status);
renderProgram();
