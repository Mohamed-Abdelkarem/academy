// ✍️ Code mode (Session 2): the kid types Logo; sulhafa draws it on an open board.
import { run, drawing, sameDrawing, LogoError } from './logo.js';
import { pick } from '../../../assets/js/core/i18n.js';
import { load, save, remove } from '../../../assets/js/core/storage.js';

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const W = 300; // board shows -300..300 Logo steps each way (like a big sheet of paper)
const SPEEDS = { slow: 320, normal: 140, fast: 45 }; // ms per command
const CALM = 12; // first commands always at the chosen speed; long programs then speed up
const MAX_MS = 14000; // ...so a whole drawing takes at most ~14 s
const CHIPS = ['fd 100', 'rt 90', 'lt 90', 'repeat 4 [ ]', 'cs'];

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
    <div class="card editor-card">
      <div class="program-head">
        <strong data-t="yourCode"></strong>
        <span class="muted small-note" data-t="typeHere"></span>
        <button id="hint-btn" class="btn btn-ghost small" type="button" hidden>💡</button>
      </div>
      <div class="chips-insert" id="insert" dir="ltr"></div>
      <div class="editor" dir="ltr">
        <div id="gutter" class="gutter" aria-hidden="true"></div>
        <textarea id="code" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Logo"></textarea>
      </div>
      <p class="muted small-note" data-t="words"></p>
    </div>
    <div class="controls">
      <button id="run-btn" class="btn btn-primary" type="button" data-t="run"></button>
      <button id="stop-btn" class="btn" type="button" data-t="stop" hidden></button>
      <button id="reset-btn" class="btn" type="button" data-t="startOver"></button>
      <button id="clear-btn" class="btn" type="button" data-t="clearCode"></button>
    </div>
  </section>
</main>`;

export function init(level, T, solved, onSolved) {
  document.getElementById('app').innerHTML = HTML;
  document.querySelectorAll('#app [data-t]').forEach((n) => { n.textContent = T[n.dataset.t]; });
  $('#level-title').textContent = pick(level.title);
  $('#level-task').textContent = pick(level.task);

  const params = new URLSearchParams(location.search);
  const key = 'turtle:code:' + level.id;
  const ta = $('#code');
  let text = load(key, level.starter ?? '');
  if (level.id === 'write' && params.get('from') === 'arrows') {
    text = load('turtle:draft', text);
    remove('turtle:draft');
    history.replaceState(null, '', '?level=write');
  }
  ta.value = text;
  let speed = load('turtle:codeSpeed', 'normal');
  let timer = null;

  // ------------------------------------------------------------- board
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  };
  const svg = el('svg', { viewBox: `${-W} ${-W} ${2 * W} ${2 * W}`, class: 'board-svg', role: 'img', 'aria-label': T.title });
  el('rect', { x: -W + 3, y: -W + 3, width: 2 * W - 6, height: 2 * W - 6, rx: 34, class: 'board-bg' }, svg);
  for (let x = -200; x <= 200; x += 100) for (let y = -200; y <= 200; y += 100) el('circle', { cx: x, cy: y, r: x || y ? 5 : 8, class: 'board-dot' }, svg);
  const ghost = el('g', { class: 'ghost' }, svg);
  const layer = el('g', {}, svg);
  const turtle = el('g', { class: 'turtle' }, svg);
  const body = el('g', { transform: 'scale(0.75)' }, turtle);
  [[-20, -18], [20, -18], [-20, 18], [20, 18]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 10, class: 't-leg' }, body));
  el('circle', { cx: 0, cy: -30, r: 13, class: 't-head' }, body);
  el('circle', { cx: -5, cy: -34, r: 3, class: 't-eye' }, body);
  el('circle', { cx: 5, cy: -34, r: 3, class: 't-eye' }, body);
  el('circle', { cx: 0, cy: 0, r: 26, class: 't-shell' }, body);
  el('circle', { cx: 0, cy: 0, r: 10, class: 't-spot' }, body);
  $('#board').appendChild(svg);

  // the target, faint, so the kid sees what to draw (not for "run and see" levels)
  if (level.target && !level.runOnly) {
    for (const [x1, y1, x2, y2] of drawing(run(level.target).steps)) {
      el('line', { x1, y1: -y1, x2, y2: -y2, class: 'ghost-line' }, ghost);
    }
  }
  const place = (x, y, h, ms) => {
    turtle.style.transition = ms ? `transform ${ms}ms linear` : 'none';
    turtle.style.transform = `translate(${x}px, ${-y}px) rotate(${h}deg)`;
  };
  const line = ([x1, y1, x2, y2]) => el('line', { x1, y1: -y1, x2, y2: -y2, class: 'code-line-draw' }, layer);

  // ------------------------------------------------------------- editor
  const gutter = $('#gutter');
  function renderGutter(active = 0, bad = 0) {
    const n = ta.value.split('\n').length;
    gutter.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      const d = document.createElement('div');
      d.textContent = i;
      if (i === active) d.className = 'on';
      if (i === bad) d.className = 'bad';
      gutter.appendChild(d);
    }
    gutter.scrollTop = ta.scrollTop;
  }
  ta.addEventListener('input', () => { save(key, ta.value); renderGutter(); setStatus('idle'); });
  ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); play(); }
  });

  // chips type real text at the cursor
  const ins = $('#insert');
  CHIPS.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ins';
    b.textContent = c;
    b.addEventListener('click', () => {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      const before = v.slice(0, s), after = v.slice(e);
      const sep = before && !/[\s\[]$/.test(before) ? ' ' : '';
      const add = sep + c + (after && !/^\s/.test(after) ? ' ' : '');
      ta.value = before + add + after;
      // inside "repeat 4 [ ]" put the cursor between the brackets
      const caret = c.endsWith('[ ]') ? before.length + add.lastIndexOf(']') - 1 : before.length + add.length;
      ta.focus();
      ta.setSelectionRange(caret, caret);
      save(key, ta.value);
      renderGutter();
    });
    ins.appendChild(b);
  });

  if (level.hint) {
    const hb = $('#hint-btn');
    hb.hidden = false;
    hb.addEventListener('click', () => setStatus('hint', pick(level.hint)));
  }

  // ------------------------------------------------------------- run
  function setStatus(s, msg) {
    const box = $('#status');
    box.textContent = msg ?? T[s] ?? '';
    box.className = 'status ' + s;
  }
  function errorText(e) {
    const w = e.word;
    if (e.key === 'unknown' && /^(fd|bk|rt|lt|forward|back|right|left)\d+$/i.test(w)) return T.err.space(e.line, w);
    return (T.err[e.key] ?? T.err.unknown)(e.line, w);
  }
  function stop() {
    clearTimeout(timer);
    timer = null;
    $('#stop-btn').hidden = true;
    $('#run-btn').hidden = false;
  }
  function resetBoard() {
    stop();
    layer.innerHTML = '';
    place(0, 0, 0, 0);
    renderGutter();
  }
  function play() {
    resetBoard();
    let steps;
    try {
      steps = run(ta.value).steps;
    } catch (e) {
      if (!(e instanceof LogoError)) throw e;
      renderGutter(0, e.line);
      setStatus('wall', errorText(e));
      return;
    }
    if (!steps.length) { setStatus('idle', T.emptyCode); return; }
    $('#run-btn').hidden = true;
    $('#stop-btn').hidden = false;
    setStatus('running');
    const base = SPEEDS[speed];
    const rest = Math.max(0, steps.length - CALM);
    const fastMs = rest ? Math.min(base, Math.max(8, (MAX_MS - CALM * base) / rest)) : base;
    let i = 0;
    const tick = () => {
      if (i >= steps.length) return finish(steps);
      const s = steps[i];
      const ms = i < CALM ? base : fastMs;
      if (s.clear) layer.innerHTML = '';
      if (s.draw) line(s.draw);
      place(s.x, s.y, s.h, Math.round(ms * 0.85));
      renderGutter(s.line);
      i++;
      timer = setTimeout(tick, ms);
    };
    timer = setTimeout(tick, 200);
  }
  function finish(steps) {
    stop();
    renderGutter();
    if (!level.target || level.runOnly) return setStatus('done');
    if (sameDrawing(drawing(steps), drawing(run(level.target).steps))) {
      onSolved(level.id);
      setStatus('win', level.home ? T.winStar : T.win);
    } else {
      setStatus('wrong', T.wrongCode);
    }
  }

  $('#run-btn').addEventListener('click', play);
  $('#stop-btn').addEventListener('click', () => { stop(); setStatus('idle'); });
  $('#reset-btn').addEventListener('click', () => {
    ta.value = level.starter ?? '';
    save(key, ta.value);
    resetBoard();
    setStatus(level.starter ? 'idleBug' : 'idle', level.starter ? T.idleCode : undefined);
  });
  $('#clear-btn').addEventListener('click', () => { ta.value = ''; save(key, ''); resetBoard(); setStatus('idle'); ta.focus(); });
  document.querySelectorAll('[data-speed]').forEach((b) => {
    b.classList.toggle('on', b.dataset.speed === speed);
    b.addEventListener('click', () => {
      speed = b.dataset.speed;
      save('turtle:codeSpeed', speed);
      document.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
    });
  });

  place(0, 0, 0, 0);
  renderGutter();
  setStatus('idle', level.runOnly || level.starter ? T.idleCode : T.idleWrite);
}
