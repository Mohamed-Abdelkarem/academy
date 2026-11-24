// ✍️ Code mode: the kid types Logo; sulhafa draws it on a board that fits the level.
import { run, drawing, sameDrawing, boardFor, fence, LogoError } from './logo.js';
import { pick } from '../../../assets/js/core/i18n.js';
import { load, save, remove } from '../../../assets/js/core/storage.js';

const $ = (s) => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const SPEEDS = { slow: 850, normal: 550, fast: 300 }; // ms for "fd 100" or "rt 90": same as the arrows mode
const CALM = 8; // first commands always at the chosen speed; long programs then speed up…
const MAX_MS = 25000; // …so a whole drawing at "normal" takes at most ~25 s
const REF = 632; // the arrows board size: lines and turtle look the same size in both modes
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
  // the board fits the level's shape; on "write" it is the big sheet (bigger if the arrows sent a long program)
  const tryDraw = (t) => { try { return drawing(run(t).steps); } catch { return []; } };
  let B;
  if (level.target || level.starter) {
    B = boardFor([level.target, level.solution, level.starter].filter(Boolean).map(tryDraw));
  } else {
    // the normal sheet: -300..300, so "fd 100" is a real step. Only a program sent from the arrows
    // may move the sheet (never grow it past 350): it fits in a 600×600 grid, so the sheet is centred on it.
    B = { cx: 0, cy: 0, half: 300 };
    const fromArrows = level.id === 'write' && params.get('from') === 'arrows' ? tryDraw(text) : [];
    if (fromArrows.length) {
      const xs = fromArrows.flatMap(([a, , c]) => [a, c]), ys = fromArrows.flatMap(([, b, , d]) => [b, d]);
      const x0 = Math.min(0, ...xs), x1 = Math.max(0, ...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
      const half = Math.min(350, Math.max(300, Math.ceil((Math.max(x1 - x0, y1 - y0) / 2 + 40) / 50) * 50));
      if (Math.max(-x0, x1, -y0, y1) + 40 > 300) B = { cx: Math.round((x0 + x1) / 100) * 50, cy: Math.round((y0 + y1) / 100) * 50, half };
    }
  }
  const S = 2 * B.half, k = S / REF;
  const svg = el('svg', { viewBox: `${B.cx - B.half} ${-B.cy - B.half} ${S} ${S}`, class: 'board-svg', role: 'img', 'aria-label': T.title });
  el('rect', { x: B.cx - B.half + 2 * k, y: -B.cy - B.half + 2 * k, width: S - 4 * k, height: S - 4 * k, rx: 36 * k, class: 'board-bg', style: `stroke-width:${4 * k}px` }, svg);
  const gap = S >= 400 ? 100 : 50; // a dot every 100 steps (every 50 on a zoomed board)
  for (let x = Math.ceil((B.cx - B.half + gap * 0.3) / gap) * gap; x < B.cx + B.half - gap * 0.3; x += gap) {
    for (let y = Math.ceil((B.cy - B.half + gap * 0.3) / gap) * gap; y < B.cy + B.half - gap * 0.3; y += gap) {
      el('circle', { cx: x, cy: -y, r: (x || y ? 6 : 9) * k, class: 'board-dot' }, svg);
    }
  }
  const ghost = el('g', { class: 'ghost' }, svg);
  const layer = el('g', {}, svg);
  const turtle = el('g', { class: 'turtle' }, svg);
  const body = el('g', { transform: `scale(${k})` }, turtle);
  [[-20, -18], [20, -18], [-20, 18], [20, 18]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 10, class: 't-leg' }, body));
  el('circle', { cx: 0, cy: -30, r: 13, class: 't-head' }, body);
  el('circle', { cx: -5, cy: -34, r: 3, class: 't-eye' }, body);
  el('circle', { cx: 5, cy: -34, r: 3, class: 't-eye' }, body);
  el('circle', { cx: 0, cy: 0, r: 26, class: 't-shell' }, body);
  el('circle', { cx: 0, cy: 0, r: 10, class: 't-spot' }, body);
  $('#board').appendChild(svg);

  // the target, faint, so the kid sees what to draw (not for "run and see" levels)
  if (level.target && !level.runOnly) {
    const lines = drawing(run(level.target).steps);
    const w = (lines.length > 40 ? 7 : 26) * k; // a busy shape (the flower) gets a thin outline, not a blob
    for (const [x1, y1, x2, y2] of lines) {
      el('line', { x1, y1: -y1, x2, y2: -y2, class: 'ghost-line', style: `stroke-width:${w}px` }, ghost);
    }
  }
  const ease = (ms) => (ms >= 200 ? 'ease-in-out' : 'linear');
  const place = (x, y, h, ms) => {
    turtle.style.transition = ms ? `transform ${ms}ms ${ease(ms)}` : 'none';
    turtle.style.transform = `translate(${x}px, ${-y}px) rotate(${h}deg)`;
  };
  // the line grows behind sulhafa while he walks
  const line = ([x1, y1, x2, y2], ms) => {
    const n = el('line', { x1, y1: -y1, x2, y2: -y2, class: 'board-line', style: `stroke-width:${12 * k}px`, pathLength: 1 }, layer);
    if (!ms) return;
    n.style.strokeDasharray = '1 1';
    n.style.strokeDashoffset = '1';
    n.getBoundingClientRect();
    n.style.transition = `stroke-dashoffset ${ms}ms ${ease(ms)}`;
    n.style.strokeDashoffset = '0';
  };

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
    let steps, wall;
    try {
      ({ steps, wall } = fence(run(ta.value).steps, B));
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
    const times = stepTimes(steps, SPEEDS[speed]);
    let i = 0;
    const tick = () => {
      if (i >= steps.length) return finish(steps, wall);
      const s = steps[i];
      const ms = times[i];
      if (s.clear) layer.innerHTML = '';
      if (s.draw) line(s.draw, Math.round(ms * 0.85));
      place(s.x, s.y, s.h, Math.round(ms * 0.85));
      renderGutter(s.line);
      i++;
      timer = setTimeout(tick, ms);
    };
    timer = setTimeout(tick, 200);
  }
  // how long each step takes: "fd 100" or "rt 90" = one arrows step; long programs speed up after CALM
  function stepTimes(steps, base) {
    let px = 0, py = 0, ph = 0;
    const raw = steps.map((s) => {
      const d = Math.hypot(s.x - px, s.y - py), t = Math.abs(s.h - ph);
      px = s.x; py = s.y; ph = s.h;
      if (s.clear) return base * 0.5;
      if (d > 0.01) return base * Math.min(1.5, Math.max(0.35, d / 100));
      return base * Math.min(1, Math.max(0.35, t / 90));
    });
    const cap = MAX_MS * (base / SPEEDS.normal);
    const calm = raw.slice(0, CALM).reduce((a, b) => a + b, 0);
    const rest = raw.slice(CALM).reduce((a, b) => a + b, 0);
    if (calm + rest <= cap || !rest) return raw;
    const f = Math.max(0, cap - calm) / rest;
    return raw.map((ms, i) => (i < CALM ? ms : Math.max(12, ms * f)));
  }
  function finish(steps, wall) {
    stop();
    renderGutter();
    if (wall) {
      turtle.classList.add('bump');
      setTimeout(() => turtle.classList.remove('bump'), 700);
      renderGutter(0, steps[steps.length - 1].line);
      return setStatus('wall', T.wallCode);
    }
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
