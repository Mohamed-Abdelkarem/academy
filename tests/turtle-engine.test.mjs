import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../activities/turtle/js/engine.js';
import { LEVELS } from '../activities/turtle/js/levels.js';

const lv = (id) => LEVELS.find((l) => l.id === id);
const go = (id, prog) => {
  const l = lv(id);
  return run(prog.split(' '), { x: l.start[0], y: l.start[1], d: l.start[2] }, l.target).result;
};

test('challenge 1: 3 up, right, 3 forward wins', () => {
  assert.equal(go('1', 'F F F R F F F'), 'win');
  assert.equal(go('1', 'F F F L F F F'), 'wall');
});
test('challenge 2: square of side 2 (11 commands) wins', () => {
  assert.equal(go('2', 'F F R F F R F F R F F'), 'win');
  assert.equal(go('2', 'F F R F F R F F'), 'wrong');
});
test('challenge 3: the preset is a bug, fixing command 6 wins', () => {
  assert.equal(go('3', lv('3').preset.join(' ')), 'wrong');
  assert.equal(go('3', 'F F R F F L F F R F F'), 'win');
});
test('free play never fails', () => {
  const r = run(['F', 'R', 'F'], { x: 3, y: 3, d: 0 }, null);
  assert.equal(r.result, 'done');
  assert.equal(r.steps.length, 3);
});
