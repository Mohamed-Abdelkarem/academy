// Run: node --test tests/
// Checks that every level is solvable within its block limit with the solutions
// written in the Session 3 and 4 content docs, and that the "planted bugs" used in
// class fail the way the docs say they do.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevel } from '../activities/maze/js/levels.js';
import { run, countBlocks, RESULT } from '../activities/maze/js/engine.js';

let n = 0;
const id = () => `b${++n}`;
const move = () => ({ id: id(), type: 'move' });
const left = () => ({ id: id(), type: 'turn', dir: 'left' });
const right = () => ({ id: id(), type: 'turn', dir: 'right' });
const until = (...body) => ({ id: id(), type: 'repeat_until', body });
const iff = (dir, ...body) => ({ id: id(), type: 'if', dir, body });
const ifElse = (dir, body, els) => ({ id: id(), type: 'if_else', dir, body, else: els });

const SOLUTIONS = {
  1: [move(), move()],
  2: [move(), left(), move(), right(), move()],
  3: [until(move())],
  4: [until(move(), left(), move(), right())],
  5: [move(), move(), left(), until(move())],
  6: [until(move(), iff('left', left()))],
  7: [until(move(), iff('right', right()))],
  8: [until(move(), iff('left', left()), iff('right', right()))],
  9: [until(ifElse('ahead', [move()], [left()]))],
  10: [until(ifElse('left', [left(), move()], [ifElse('ahead', [move()], [right()])]))],
};

for (const level of LEVELS) {
  test(`level ${level.id}: documented solution works within the block limit`, () => {
    const prog = SOLUTIONS[level.id];
    assert.ok(countBlocks(prog) <= level.maxBlocks, 'over block limit');
    const { result } = run(level.map, prog);
    assert.equal(result, RESULT.SUCCESS);
  });
}

test('S4 planted bugs fail as the content doc says', () => {
  // L6 with the S3 solution: crashes at the end of the corridor.
  assert.equal(run(getLevel(6).map, [until(move())]).result, RESULT.CRASH);
  // L7 with "if left: turn left": goes into the dead end and crashes.
  assert.equal(run(getLevel(7).map, [until(move(), iff('left', left()))]).result, RESULT.CRASH);
  // L9 with "else: turn right": loops forever.
  const r9 = run(getLevel(9).map, [until(ifElse('ahead', [move()], [right()]))]);
  assert.equal(r9.result, RESULT.TIMEOUT);
});

test('program that stops early is unfinished, not a crash', () => {
  assert.equal(run(getLevel(1).map, [move()]).result, RESULT.UNFINISHED);
});

test('walking past the finish into a wall is a crash (same as Blockly Games)', () => {
  assert.equal(run(getLevel(1).map, [move(), move(), move()]).result, RESULT.CRASH);
});

test('every map has exactly one start and one finish', () => {
  for (const level of LEVELS) {
    const flat = level.map.flat();
    assert.equal(flat.filter((c) => c === 2).length, 1, `level ${level.id} start`);
    assert.equal(flat.filter((c) => c === 3).length, 1, `level ${level.id} finish`);
  }
});
