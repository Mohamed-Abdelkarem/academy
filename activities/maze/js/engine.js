// Maze engine: pure logic, no DOM, runs in the browser and in Node tests.
// Same rules as Blockly Games Maze:
//  - "repeat until" checks "am I at the finish?" before each round.
//  - Walking into a wall is a crash and stops the program.
//  - The level is solved only if the panda is on the finish when the program ends.
//  - A program that runs too long (endless loop) times out.
//
// A program is a list of statements:
//   { id, type: 'move' }
//   { id, type: 'turn', dir: 'left' | 'right' }
//   { id, type: 'repeat_until', body: [...] }
//   { id, type: 'if', dir: 'ahead' | 'left' | 'right', body: [...] }
//   { id, type: 'if_else', dir, body: [...], else: [...] }

import { DIR } from './levels.js';

export const RESULT = {
  SUCCESS: 'success',
  CRASH: 'crash',
  UNFINISHED: 'unfinished',
  TIMEOUT: 'timeout',
};

export const MAX_TICKS = 10000;

const DELTA = {
  [DIR.NORTH]: [0, -1],
  [DIR.EAST]: [1, 0],
  [DIR.SOUTH]: [0, 1],
  [DIR.WEST]: [-1, 0],
};
const LOOK_OFFSET = { ahead: 0, right: 1, left: 3 };

export function findCell(map, value) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === value) return { x, y };
    }
  }
  return null;
}

function isOpen(map, x, y) {
  const row = map[y];
  if (!row) return false;
  const cell = row[x];
  return cell !== undefined && cell !== 0;
}

class Halt {
  constructor(result) {
    this.result = result;
  }
}

/**
 * Run a program on a level map.
 * @returns {{ result: string, log: Array<object>, end: {x:number,y:number,d:number} }}
 *   log entries: { op: 'move'|'turn'|'look'|'crash', id, x, y, d, ok?, cell? }
 *   (x, y, d) is the panda state after the step.
 */
export function run(map, program) {
  const start = findCell(map, 2);
  const finish = findCell(map, 3);
  if (!start || !finish) throw new Error('Level map needs a start (2) and a finish (3).');

  const s = { x: start.x, y: start.y, d: DIR.EAST };
  const log = [];
  let ticks = 0;

  const tick = () => {
    if (++ticks > MAX_TICKS) throw new Halt(RESULT.TIMEOUT);
  };
  const atFinish = () => s.x === finish.x && s.y === finish.y;

  const look = (rel, id) => {
    const d = (s.d + LOOK_OFFSET[rel]) % 4;
    const [dx, dy] = DELTA[d];
    const cell = { x: s.x + dx, y: s.y + dy };
    const ok = isOpen(map, cell.x, cell.y);
    log.push({ op: 'look', id, x: s.x, y: s.y, d: s.d, ok, cell });
    return ok;
  };

  const exec = (stmts) => {
    for (const st of stmts) {
      tick();
      switch (st.type) {
        case 'move': {
          const [dx, dy] = DELTA[s.d];
          if (!isOpen(map, s.x + dx, s.y + dy)) {
            log.push({ op: 'crash', id: st.id, x: s.x, y: s.y, d: s.d });
            throw new Halt(RESULT.CRASH);
          }
          s.x += dx;
          s.y += dy;
          log.push({ op: 'move', id: st.id, x: s.x, y: s.y, d: s.d });
          break;
        }
        case 'turn':
          s.d = (s.d + (st.dir === 'right' ? 1 : 3)) % 4;
          log.push({ op: 'turn', id: st.id, x: s.x, y: s.y, d: s.d, dir: st.dir });
          break;
        case 'repeat_until':
          while (!atFinish()) {
            tick();
            exec(st.body || []);
          }
          break;
        case 'if':
          if (look(st.dir, st.id)) exec(st.body || []);
          break;
        case 'if_else':
          if (look(st.dir, st.id)) exec(st.body || []);
          else exec(st.else || []);
          break;
        default:
          throw new Error(`Unknown statement type: ${st.type}`);
      }
    }
  };

  let result;
  try {
    exec(program);
    result = atFinish() ? RESULT.SUCCESS : RESULT.UNFINISHED;
  } catch (e) {
    if (e instanceof Halt) result = e.result;
    else throw e;
  }
  return { result, log, end: { ...s } };
}

/** Count blocks in a program (each statement = one block). */
export function countBlocks(program) {
  let n = 0;
  for (const st of program) {
    n += 1;
    if (st.body) n += countBlocks(st.body);
    if (st.else) n += countBlocks(st.else);
  }
  return n;
}
