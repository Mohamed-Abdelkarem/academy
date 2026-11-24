// 🧩 Arrows mode (Session 1): grid challenges with forward / left / right buttons.
import { N, NEXT, run } from './engine.js';
import { fromArrows } from './logo.js';
import { pick, getLang } from '../../../assets/js/core/i18n.js';
import { load, save } from '../../../assets/js/core/storage.js';

const $ = (s) => document.querySelector(s);
const HTML = `
<main class="game">
  <section class="stage">
    <div class="stage-head"><h2 id="level-title"></h2><p id="level-task" class="muted"></p></div>
    <div id="board" class="board"></div>
    <div id="status" class="status" role="status" aria-live="polite"></div>
  </section>
  <section class="panel">
    <div class="speed-row">
      <span data-t="speed"></span>
      <button class="btn speed-btn" type="button" data-speed="slow" data-t="slow"></button>
      <button class="btn speed-btn" type="button" data-speed="normal" data-t="normal"></button>
      <button class="btn speed-btn" type="button" data-speed="fast" data-t="fast"></button>
    </div>
    <div class="cmd-row">
      <button id="add-F" class="cmd cmd-F" type="button"><span class="cmd-g">↑</span><span class="cmd-t"><span class="cmd-ar"></span><span class="cmd-en" dir="ltr">forward</span></span></button>
      <button id="add-L" class="cmd cmd-L" type="button"><span class="cmd-g">↺</span><span class="cmd-t"><span class="cmd-ar"></span><span class="cmd-en" dir="ltr">left</span></span></button>
      <button id="add-R" class="cmd cmd-R" type="button"><span class="cmd-g">↻</span><span class="cmd-t"><span class="cmd-ar"></span><span class="cmd-en" dir="ltr">right</span></span></button>
    </div>
    <div class="program card">
      <div class="program-head">
        <strong data-t="program"></strong>
        <span id="count" class="muted"></span>
      </div>
      <div id="chips" class="chips"></div>
    </div>
    <div class="controls">
      <button id="run-btn" class="btn btn-primary" type="button" data-t="run"></button>
      <button id="undo-btn" class="btn" type="button" data-t="undo"></button>
      <button id="clear-btn" class="btn" type="button" data-t="clear"></button>
      <button id="restore-btn" class="btn btn-accent" type="button" data-t="restore" hidden></button>
      <button id="write-btn" class="btn btn-write" type="button" data-t="writeIt"></button>
    </div>
  </section>
</main>`;

export function init(level, T, solved, onSolved) {
const L = getLang();
document.getElementById('app').innerHTML = HTML;
document.querySelectorAll('#app [data-t]').forEach((n) => { n.textContent = T[n.dataset.t]; });
const SVGNS = 'http://www.w3.org/2000/svg';
const M = 46, C = 90, SIZE = M * 2 + C * N; // 632
const SPEEDS = { slow: 850, normal: 550, fast: 300 };
const GLYPH = { F: '↑', L: '↺', R: '↻' };

let program = level.preset.slice();
let edited = false;
let speed = load('turtle:speed', 'normal');
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
  {
    chips.className = 'chips';
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
      if (result === 'win') onSolved(level.id);
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
$('#write-btn').addEventListener('click', () => {
  save('turtle:draft', fromArrows(program));
  location.href = '?level=write&from=arrows';
});
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
}
