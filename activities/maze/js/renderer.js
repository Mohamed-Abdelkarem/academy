// Draws the maze as SVG and animates the panda from the engine log.
import { findCell } from './engine.js';

const SQ = 50; // cell size in SVG units
const NS = 'http://www.w3.org/2000/svg';
const ANGLE = [-90, 0, 90, 180]; // N E S W → rotation of the heading arrow

function svg(tag, attrs = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

export class MazeView {
  constructor(container) {
    this.container = container;
    this.root = null;
    this.panda = null;
    this.state = null;
    this.timer = null;
    this.speed = 1; // 0.5 slow … 2 fast
  }

  draw(map) {
    this.stop();
    this.map = map;
    const rows = map.length;
    const cols = map[0].length;
    this.container.innerHTML = '';
    const root = svg('svg', {
      viewBox: `0 0 ${cols * SQ} ${rows * SQ}`,
      class: 'maze-svg',
      role: 'img',
      'aria-label': 'المتاهة',
    });

    root.append(svg('rect', { x: 0, y: 0, width: cols * SQ, height: rows * SQ, class: 'maze-bg' }));
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (map[y][x] === 0) continue;
        root.append(svg('rect', { x: x * SQ + 2, y: y * SQ + 2, width: SQ - 4, height: SQ - 4, rx: 10, class: 'maze-path' }));
      }
    }

    const finish = findCell(map, 3);
    const flag = svg('text', { x: finish.x * SQ + SQ / 2, y: finish.y * SQ + SQ / 2, class: 'maze-emoji' });
    flag.textContent = '🏁';
    root.append(flag);

    // "Looking" marker for if-blocks: the cell being checked gets a dashed frame and ✓ / ✗
    // (same marks as the S4 slides).
    const look = svg('g', { class: 'maze-look', opacity: 0 });
    look.append(
      svg('rect', { x: -SQ / 2 + 4, y: -SQ / 2 + 4, width: SQ - 8, height: SQ - 8, rx: 8, class: 'maze-look-frame' }),
      svg('circle', { r: 12, class: 'maze-look-dot' }),
    );
    const mark = svg('text', { class: 'maze-look-mark' });
    look.append(mark);
    root.append(look);
    this.lookMark = look;
    this.lookText = mark;

    // Panda = emoji + an arrow that shows where it's facing.
    const panda = svg('g', { class: 'maze-panda' });
    const arrow = svg('g', { class: 'maze-heading' });
    arrow.append(svg('path', { d: 'M 25 0 L 15 -8 L 15 8 Z', class: 'maze-arrow' }));
    const body = svg('text', { x: 0, y: 0, class: 'maze-emoji maze-panda-body' });
    body.textContent = '🐼';
    panda.append(arrow, body);
    root.append(panda);

    this.root = root;
    this.panda = panda;
    this.arrow = arrow;
    this.container.append(root);
    this.reset();
  }

  reset() {
    this.stop();
    const start = findCell(this.map, 2);
    this.place({ x: start.x, y: start.y, d: 1 });
    this.panda.classList.remove('crash', 'win');
    this.lookMark.setAttribute('opacity', 0);
  }

  place(s) {
    this.state = { ...s };
    this.panda.setAttribute('transform', `translate(${s.x * SQ + SQ / 2} ${s.y * SQ + SQ / 2})`);
    this.arrow.setAttribute('transform', `rotate(${ANGLE[s.d]})`);
  }

  stop() {
    if (this.timer) cancelAnimationFrame(this.timer);
    this.timer = null;
  }

  stepMs() {
    return 420 / this.speed;
  }

  /** Smoothly go from the current state to `to`. */
  tween(to, ms) {
    return new Promise((resolve) => {
      const from = { ...this.state };
      let a0 = ANGLE[from.d];
      let a1 = ANGLE[to.d];
      if (a1 - a0 > 180) a1 -= 360;
      if (a0 - a1 > 180) a1 += 360;
      const t0 = performance.now();
      const frame = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const x = from.x + (to.x - from.x) * e;
        const y = from.y + (to.y - from.y) * e;
        this.panda.setAttribute('transform', `translate(${x * SQ + SQ / 2} ${y * SQ + SQ / 2})`);
        this.arrow.setAttribute('transform', `rotate(${a0 + (a1 - a0) * e})`);
        if (t < 1) this.timer = requestAnimationFrame(frame);
        else {
          this.place(to);
          resolve();
        }
      };
      this.timer = requestAnimationFrame(frame);
    });
  }

  wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async showLook(entry) {
    const { cell, ok } = entry;
    this.lookMark.setAttribute('transform', `translate(${cell.x * SQ + SQ / 2} ${cell.y * SQ + SQ / 2})`);
    this.lookMark.setAttribute('class', `maze-look ${ok ? 'yes' : 'no'}`);
    this.lookText.textContent = ok ? '✓' : '✗';
    this.lookMark.setAttribute('opacity', 1);
    await this.wait(this.stepMs() * 0.8);
    this.lookMark.setAttribute('opacity', 0);
  }

  /**
   * Play the engine log. onStep(entry) is called before each step (to highlight blocks).
   * Returns false if cancelled.
   */
  async play(log, onStep, isCancelled) {
    for (const entry of log) {
      if (isCancelled()) return false;
      onStep(entry);
      if (entry.op === 'move' || entry.op === 'turn') {
        await this.tween(entry, this.stepMs());
      } else if (entry.op === 'look') {
        await this.showLook(entry);
      } else if (entry.op === 'crash') {
        this.panda.classList.add('crash');
        await this.wait(700);
      }
    }
    return true;
  }

  celebrate() {
    this.panda.classList.add('win');
  }
}
