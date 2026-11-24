// Turtle on a dot grid (Course 1, Session 1). Pure logic, no DOM, so it can be tested in Node.
// Grid points 0..N on both axes. Directions: 0 up, 1 right, 2 down, 3 left (screen coordinates).
export const N = 6;
const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const NEXT = { F: 'L', L: 'R', R: 'F' };

const edgeKey = (a, b, c, d) => [Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d)].join(',');

/** Every unit edge along a polyline of grid points [[x,y], ...]. */
export function pathEdges(points) {
  const keys = new Set();
  for (let i = 1; i < points.length; i++) {
    let [x, y] = points[i - 1];
    const [tx, ty] = points[i];
    while (x !== tx || y !== ty) {
      const nx = x + Math.sign(tx - x), ny = y + Math.sign(ty - y);
      keys.add(edgeKey(x, y, nx, ny));
      x = nx; y = ny;
    }
  }
  return keys;
}

/**
 * Run a program (array of 'F' | 'L' | 'R') from start {x, y, d}.
 * Returns { steps, result }: steps = state after each command (for animation);
 * result = 'wall' | 'win' | 'wrong' | 'done' (no target).
 */
export function run(program, start, target = null) {
  let { x, y, d } = start;
  let rot = d * 90;
  const segs = [];
  const steps = [];
  for (let i = 0; i < program.length; i++) {
    const c = program[i];
    if (c === 'F') {
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (nx < 0 || ny < 0 || nx > N || ny > N) {
        steps.push({ i, x, y, d, rot, segs: segs.slice(), wall: true });
        return { steps, result: 'wall' };
      }
      segs.push([x, y, nx, ny]);
      x = nx; y = ny;
    } else if (c === 'L') {
      d = (d + 3) % 4; rot -= 90;
    } else if (c === 'R') {
      d = (d + 1) % 4; rot += 90;
    }
    steps.push({ i, x, y, d, rot, segs: segs.slice() });
  }
  if (!target) return { steps, result: 'done' };
  const want = pathEdges(target);
  const got = new Set(segs.map((s) => edgeKey(...s)));
  const same = want.size === got.size && [...want].every((k) => got.has(k));
  return { steps, result: same ? 'win' : 'wrong' };
}

/** Logo text for a program, as typed in Logo Interpreter. */
export const LOGO = { F: 'forward 100', L: 'left 90', R: 'right 90' };
export const toLogo = (program) => program.map((c) => LOGO[c]);
