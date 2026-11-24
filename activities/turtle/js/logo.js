// Small Logo for kids. Pure logic, no DOM: parse → run → list of drawn lines.
// Words: fd/forward, bk/back, rt/right, lt/left, repeat N [ ... ], pu/penup, pd/pendown, home, cs/clearscreen.
// Turtle starts at (0, 0) facing up; y grows upward (like Logo Interpreter). 1 unit = 1 Logo step.

const WORDS = {
  fd: 'fd', forward: 'fd', bk: 'bk', back: 'bk', backward: 'bk',
  rt: 'rt', right: 'rt', lt: 'lt', left: 'lt',
  pu: 'pu', penup: 'pu', pd: 'pd', pendown: 'pd',
  home: 'home', cs: 'cs', clearscreen: 'cs', repeat: 'repeat',
};
const NEEDS_NUMBER = new Set(['fd', 'bk', 'rt', 'lt']);
export const LIMITS = { repeat: 1000, steps: 20000, depth: 20 };

export class LogoError extends Error {
  constructor(key, line, word = '') {
    super(key);
    this.key = key; // unknown | stray | number | blank | open | close | repeatNumber | tooMany
    this.line = line; // 1-based
    this.word = word;
  }
}

function tokenize(src) {
  const toks = [];
  src.split('\n').forEach((text, i) => {
    const clean = text.replace(/;.*$/, ''); // ; starts a comment
    const re = /\[|\]|[^\s\[\]]+/g;
    let m;
    while ((m = re.exec(clean))) toks.push({ t: m[0], line: i + 1 });
  });
  return toks;
}

const isNum = (t) => /^-?\d+(\.\d+)?$/.test(t);
// Arabic-Indic digits work too (٠١٢٣٤٥٦٧٨٩).
const normDigits = (s) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** Parse source into a tree of { op, n?, body?, line }. Throws LogoError. */
export function parse(src) {
  const toks = tokenize(normDigits(src));
  let pos = 0;
  function block(depth, openLine) {
    if (depth > LIMITS.depth) throw new LogoError('tooMany', openLine);
    const out = [];
    while (pos < toks.length) {
      const { t, line } = toks[pos];
      if (t === ']') {
        if (depth === 0) throw new LogoError('close', line);
        pos++;
        return out;
      }
      if (t === '[') throw new LogoError('unknown', line, '[');
      if (/^_+$/.test(t)) throw new LogoError('blank', line, t);
      const op = WORDS[t.toLowerCase()];
      if (!op) throw new LogoError(isNum(t) ? 'stray' : 'unknown', line, t);
      pos++;
      if (op === 'repeat') {
        const nTok = toks[pos];
        if (!nTok || !isNum(nTok.t)) throw new LogoError('repeatNumber', line, t);
        const n = Math.round(Number(nTok.t));
        if (n < 0 || n > LIMITS.repeat) throw new LogoError('repeatNumber', line, nTok.t);
        pos++;
        if (!toks[pos] || toks[pos].t !== '[') throw new LogoError('open', line, t);
        pos++;
        const body = block(depth + 1, line);
        out.push({ op, n, body, line });
      } else if (NEEDS_NUMBER.has(op)) {
        const nTok = toks[pos];
        if (nTok && /^_+$/.test(nTok.t)) throw new LogoError('blank', line, nTok.t);
        if (!nTok || !isNum(nTok.t)) throw new LogoError('number', line, t);
        pos++;
        out.push({ op, n: Number(nTok.t), line });
      } else {
        out.push({ op, line });
      }
    }
    if (depth > 0) throw new LogoError('close', openLine);
    return out;
  }
  return block(0, 1);
}

/**
 * Run source. Returns { steps } where each step is the turtle after one command:
 * { x, y, h, line, draw?: [x1, y1, x2, y2], clear?: true }. h = heading in degrees, 0 = up, clockwise.
 */
export function run(src) {
  const tree = parse(src);
  const st = { x: 0, y: 0, h: 0, pen: true };
  const steps = [];
  const push = (s) => {
    if (steps.length >= LIMITS.steps) throw new LogoError('tooMany', s.line);
    steps.push(s);
  };
  const r2 = (v) => Math.round(v * 1000) / 1000;
  function exec(nodes) {
    for (const nd of nodes) {
      switch (nd.op) {
        case 'repeat':
          for (let i = 0; i < nd.n; i++) exec(nd.body);
          break;
        case 'fd':
        case 'bk': {
          const d = nd.op === 'fd' ? nd.n : -nd.n;
          const rad = (st.h * Math.PI) / 180;
          const nx = r2(st.x + d * Math.sin(rad)), ny = r2(st.y + d * Math.cos(rad));
          const s = { x: nx, y: ny, h: st.h, line: nd.line };
          if (st.pen) s.draw = [st.x, st.y, nx, ny];
          st.x = nx; st.y = ny;
          push(s);
          break;
        }
        case 'rt': st.h += nd.n; push({ x: st.x, y: st.y, h: st.h, line: nd.line }); break;
        case 'lt': st.h -= nd.n; push({ x: st.x, y: st.y, h: st.h, line: nd.line }); break;
        case 'pu': st.pen = false; break;
        case 'pd': st.pen = true; break;
        case 'home':
          if (st.pen) push({ x: 0, y: 0, h: 0, line: nd.line, draw: [st.x, st.y, 0, 0] });
          else push({ x: 0, y: 0, h: 0, line: nd.line });
          st.x = 0; st.y = 0; st.h = 0;
          break;
        case 'cs':
          st.x = 0; st.y = 0; st.h = 0;
          push({ x: 0, y: 0, h: 0, line: nd.line, clear: true });
          break;
      }
    }
  }
  exec(tree);
  return { steps };
}

/** Lines drawn at the end (after the last cs). */
export function drawing(steps) {
  let lines = [];
  for (const s of steps) {
    if (s.clear) lines = [];
    if (s.draw) lines.push(s.draw);
  }
  return lines;
}

/**
 * Compare two drawings by the points their lines pass through (every 4 units, snapped to 4),
 * so "fd 50 fd 50" and "fd 100" count as the same line. Returns true when they match.
 */
export function sameDrawing(a, b) {
  const pts = (lines) => {
    const set = new Set();
    for (const [x1, y1, x2, y2] of lines) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const n = Math.max(1, Math.ceil(len / 4));
      for (let i = 0; i <= n; i++) {
        const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n;
        set.add(`${Math.round(x / 4)},${Math.round(y / 4)}`);
      }
    }
    return set;
  };
  const A = pts(a), B = pts(b);
  if (!A.size || !B.size) return false;
  let miss = 0;
  for (const k of A) if (!B.has(k)) miss++;
  for (const k of B) if (!A.has(k)) miss++;
  return miss <= Math.max(2, 0.03 * (A.size + B.size));
}

/** Arrow program (S1 commands) → Logo text, one command per line. */
export const fromArrows = (prog) => prog.map((c) => ({ F: 'fd 100', L: 'lt 90', R: 'rt 90' })[c]).join('\n');

/**
 * Board box for a level: { cx, cy, half } in Logo units (y up). Fits the drawings given
 * (target, starter…) plus their left/right mirror (rt ↔ lt is the usual mistake), with room around.
 * No drawings → the default sheet -300..300.
 */
export function boardFor(drawings, min = 120) {
  let x0 = 0, x1 = 0, y0 = 0, y1 = 0; // the start point is always on the board
  for (const lines of drawings) {
    for (const [ax, ay, bx, by] of lines) {
      for (const [x, y] of [[ax, ay], [bx, by], [-ax, ay], [-bx, by]]) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  }
  if (x0 === x1 && y0 === y1) return { cx: 0, cy: 0, half: 300 };
  const dim = Math.max(x1 - x0, y1 - y0);
  const half = Math.max(min, Math.ceil((dim / 2 + Math.max(30, 0.15 * dim)) / 10) * 10);
  return { cx: Math.round((x0 + x1) / 2), cy: Math.round((y0 + y1) / 2), half };
}

/**
 * Stop the turtle at the edge of the board (like the walls in the arrows mode).
 * Returns { steps, wall }: the steps up to the edge, the last one cut at the edge.
 */
export function fence(steps, { cx, cy, half }) {
  const lo = [cx - half, cy - half], hi = [cx + half, cy + half];
  const inside = (x, y) => x >= lo[0] - 0.01 && x <= hi[0] + 0.01 && y >= lo[1] - 0.01 && y <= hi[1] + 0.01;
  const out = [];
  let px = 0, py = 0;
  for (const s of steps) {
    if (inside(s.x, s.y)) { out.push(s); px = s.x; py = s.y; continue; }
    // walk from (px, py) toward (s.x, s.y) and stop where it leaves the box
    let t = 1;
    const dx = s.x - px, dy = s.y - py;
    if (dx > 0) t = Math.min(t, (hi[0] - px) / dx);
    if (dx < 0) t = Math.min(t, (lo[0] - px) / dx);
    if (dy > 0) t = Math.min(t, (hi[1] - py) / dy);
    if (dy < 0) t = Math.min(t, (lo[1] - py) / dy);
    const rr = (v) => Math.round(v * 1000) / 1000;
    const x = rr(px + dx * Math.max(0, t)), y = rr(py + dy * Math.max(0, t));
    const cut = { ...s, x, y, wall: true };
    if (s.draw) cut.draw = [px, py, x, y];
    out.push(cut);
    return { steps: out, wall: true };
  }
  return { steps: out, wall: false };
}
