import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, parse, drawing, sameDrawing, LogoError, fromArrows, boardFor, fence } from '../activities/turtle/js/logo.js';
import { CODE_LEVELS } from '../activities/turtle/js/levels.js';

const lines = (src) => drawing(run(src).steps);
const errKey = (src) => { try { parse(src); return null; } catch (e) { return e instanceof LogoError ? [e.key, e.line] : 'other'; } };

test('square: 8 commands = repeat = same drawing', () => {
  const long = 'fd 100 rt 90 fd 100 rt 90 fd 100 rt 90 fd 100 rt 90';
  assert.ok(sameDrawing(lines(long), lines('repeat 4 [fd 100 rt 90]')));
  assert.ok(sameDrawing(lines('repeat 4 [fd 50 fd 50 rt 90]'), lines('repeat 4 [fd 100 rt 90]')));
  assert.ok(!sameDrawing(lines('repeat 4 [fd 100 rt 60]'), lines('repeat 4 [fd 100 rt 90]')));
});
test('words: long names, case, Arabic digits, comments', () => {
  assert.ok(sameDrawing(lines('FORWARD ١٠٠ right 90 ; comment\nforward 100'), lines('fd 100 rt 90 fd 100')));
});
test('errors point at the line', () => {
  assert.deepEqual(errKey('repeat 4 [fd 100 rt 90'), ['close', 1]);
  assert.deepEqual(errKey('fd 100\nfdd 50'), ['unknown', 2]);
  assert.deepEqual(errKey('fd'), ['number', 1]);
  assert.deepEqual(errKey('repeat [fd 10]'), ['repeatNumber', 1]);
  assert.deepEqual(errKey('fd 10 ]'), ['close', 1]);
  assert.deepEqual(errKey('fd100'), ['unknown', 1]);
});
test('pen up draws nothing, cs clears', () => {
  assert.equal(lines('pu fd 100 pd').length, 0);
  assert.equal(lines('fd 100 cs fd 50').length, 1);
});
test('arrows become Logo', () => {
  assert.equal(fromArrows(['F', 'R', 'L']), 'fd 100\nrt 90\nlt 90');
});
test('every code level: its solution matches its target, its starter does not (unless free)', () => {
  for (const lv of CODE_LEVELS) {
    if (!lv.target) continue;
    assert.ok(sameDrawing(lines(lv.solution), lines(lv.target)), lv.id + ' solution');
    if (lv.starter && !lv.starter.includes('___')) {
      assert.ok(!sameDrawing(lines(lv.starter), lines(lv.target)), lv.id + ' starter should not already win');
    }
  }
});

test('every code level fits its board: target, solution and starter never hit the edge', () => {
  for (const l of CODE_LEVELS) {
    const srcs = [l.target, l.solution, l.starter].filter((t) => t && !t.includes('___'));
    const b = boardFor(srcs.map((t) => drawing(run(t).steps)));
    for (const t of srcs) assert.equal(fence(run(t).steps, b).wall, false, `${l.id}: ${t}`);
  }
});

test('the turtle stops at the edge of the board', () => {
  const { steps, wall } = fence(run('fd 1000\nrt 90\nfd 50').steps, { cx: 0, cy: 0, half: 300 });
  assert.equal(wall, true);
  assert.equal(steps.length, 1);
  assert.deepEqual([steps[0].x, steps[0].y], [0, 300]);
  assert.deepEqual(steps[0].draw, [0, 0, 0, 300]);
});
