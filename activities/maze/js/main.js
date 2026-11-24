// Maze page: level bar, Blockly workspace, run/reset, results.
import { LEVELS, getLevel } from './levels.js';
import { run, RESULT } from './engine.js';
import { defineBlocks, toolboxFor, readProgram } from './blocks.js';
import { MazeView } from './renderer.js';
import { isUnlocked } from '../../../assets/js/core/access.js';
import { askForCode, showMessage } from '../../../assets/js/core/ui.js';
import { load, save } from '../../../assets/js/core/storage.js';
import { getLang, isRtl, pick, applyStrings, wireLangButton } from '../../../assets/js/core/i18n.js';
import { STRINGS } from './strings.js';

const T = pick(STRINGS);

const ACTIVITY = 'maze';
const $ = (sel) => document.querySelector(sel);

const params = new URLSearchParams(location.search);
const requested = Number(params.get('level')) || 0;

function solvedSet() {
  return new Set(load(`${ACTIVITY}:solved`, []));
}
function markSolved(id) {
  const s = solvedSet();
  s.add(id);
  save(`${ACTIVITY}:solved`, [...s]);
}
function levelUrl(id) {
  return `?level=${id}`;
}

/** Pick the level to show: the one in the URL, else the first open unsolved one. */
function pickLevel() {
  if (getLevel(requested)) return getLevel(requested);
  const solved = solvedSet();
  const open = LEVELS.filter((l) => isUnlocked(ACTIVITY, l.id));
  return open.find((l) => !solved.has(l.id)) || open[open.length - 1] || LEVELS[0];
}

function renderLevelBar(current) {
  const bar = $('#level-bar');
  bar.innerHTML = '';
  const solved = solvedSet();
  for (const l of LEVELS) {
    const open = isUnlocked(ACTIVITY, l.id);
    const a = document.createElement('a');
    a.href = levelUrl(l.id);
    a.className = 'level-dot';
    if (l.id === current.id) a.classList.add('current');
    if (!open) a.classList.add('locked');
    if (solved.has(l.id)) a.classList.add('solved');
    a.textContent = open ? String(l.id) : '🔒';
    a.setAttribute('aria-label', open ? T.level(l.id) : T.lockedDot(l.id));
    bar.append(a);
  }
}

async function unlockFlow() {
  const entry = await askForCode();
  if (entry) location.reload();
}

function showLocked(level) {
  $('#locked').hidden = false;
  $('#game').hidden = true;
  $('#locked-title').textContent = T.locked(level.id);
  $('#unlock-btn').addEventListener('click', unlockFlow);
}

function startGame(level) {
  $('#locked').hidden = true;
  $('#game').hidden = false;
  $('#level-title').textContent = T.level(level.id);

  const view = new MazeView($('#maze'));
  view.draw(level.map);

  defineBlocks(getLang());
  const ws = Blockly.inject($('#blockly'), {
    toolbox: toolboxFor(level),
    rtl: isRtl(),
    maxBlocks: level.maxBlocks,
    media: '../../vendor/blockly/13.5.0/media/',
    trashcan: true,
    sounds: true,
    zoom: { controls: true, wheel: false, startScale: window.innerWidth < 600 ? 0.8 : 1.05 },
    move: { scrollbars: true, drag: true, wheel: true },
  });

  // Restore the child's work on this level, or start with one "move" block.
  const saveKey = `${ACTIVITY}:program:${level.id}`;
  const saved = load(saveKey, null);
  let restored = false;
  if (saved) {
    try {
      Blockly.serialization.workspaces.load(saved, ws);
      restored = ws.getAllBlocks(false).length > 0;
    } catch {
      ws.clear();
    }
  }
  if (!restored) {
    Blockly.serialization.blocks.append(
      { type: 'maze_move', x: 0, y: 24 },
      ws,
    );
  }
  placeNextToToolbox(ws);

  const capacity = $('#capacity');
  const updateCapacity = () => {
    if (level.maxBlocks === Infinity) {
      capacity.hidden = true;
      return;
    }
    const left = ws.remainingCapacity();
    capacity.hidden = false;
    capacity.textContent = left === 1 ? T.left1 : T.leftN(left);
    capacity.classList.toggle('empty', left <= 0);
  };
  updateCapacity();

  let runId = 0; // bumps on every run/reset/edit so an old animation stops
  const runBtn = $('#run-btn');
  const resetBtn = $('#reset-btn');

  const stopRun = () => {
    runId++;
    ws.highlightBlock(null);
    runBtn.disabled = false;
  };

  ws.addChangeListener((e) => {
    if (e.isUiEvent) return;
    save(saveKey, Blockly.serialization.workspaces.save(ws));
    updateCapacity();
    if (runBtn.disabled) {
      stopRun();
      view.reset();
    }
  });

  resetBtn.addEventListener('click', () => {
    stopRun();
    view.reset();
  });

  runBtn.addEventListener('click', async () => {
    const read = readProgram(ws);
    if (!read.ok) {
      await showMessage(
        read.reason === 'split'
          ? { icon: '🧩', title: T.splitTitle, text: T.splitText }
          : { icon: '🧩', title: T.emptyTitle, text: T.emptyText },
      );
      return;
    }
    const outcome = run(level.map, read.program);
    const myRun = ++runId;
    runBtn.disabled = true;
    view.reset();
    const finished = await view.play(
      outcome.log,
      (entry) => ws.highlightBlock(entry.id),
      () => myRun !== runId,
    );
    if (!finished || myRun !== runId) return;
    ws.highlightBlock(null);
    runBtn.disabled = false;
    await showResult(level, outcome.result, view);
  });

  $('#hint-btn').addEventListener('click', () =>
    showMessage({ icon: '💡', title: T.hint, text: pick(level.hint) }),
  );

  const speed = $('#speed');
  speed.value = load('speed', 1);
  view.speed = Number(speed.value);
  speed.addEventListener('input', () => {
    view.speed = Number(speed.value);
    save('speed', view.speed);
  });

  window.addEventListener('resize', () => Blockly.svgResize(ws));
}

/** Move the program so it sits in view, just beside the toolbox (right side in Arabic, left in English). */
function placeNextToToolbox(ws) {
  const top = ws.getTopBlocks(true)[0];
  if (!top) return;
  const area = $('#blockly').getBoundingClientRect();
  const box = top.getSvgRoot().getBoundingClientRect();
  const flyout = ws.getFlyout().getWidth();
  const dx = isRtl()
    ? (area.right - flyout - 24 - box.right) / ws.scale
    : (area.left + flyout + 24 - box.left) / ws.scale;
  const dy = (area.top + 24 - box.top) / ws.scale;
  ws.getTopBlocks(true).forEach((b) => b.moveBy(dx, dy));
}

async function showResult(level, result, view) {
  if (result === RESULT.SUCCESS) {
    view.celebrate();
    markSolved(level.id);
    renderLevelBar(level);
    const next = getLevel(level.id + 1);
    const buttons = [{ label: T.ok, value: 'stay' }];
    if (next && isUnlocked(ACTIVITY, next.id)) {
      buttons.unshift({ label: T.nextBtn(next.id), value: 'next', kind: 'primary' });
    }
    const choice = await showMessage({
      icon: '🎉',
      title: T.winTitle,
      text: next && !isUnlocked(ACTIVITY, next.id) ? T.nextLocked(next.id) : '',
      buttons,
    });
    if (choice === 'next') location.href = levelUrl(next.id);
    return;
  }
  const msg = {
    [RESULT.CRASH]: { icon: '💥', title: T.crash },
    [RESULT.UNFINISHED]: { icon: '🤔', title: T.unfinished },
    [RESULT.TIMEOUT]: { icon: '🌀', title: T.timeout },
  }[result];
  await showMessage({ ...msg, text: T.detective, buttons: [{ label: T.fix, value: true, kind: 'primary' }] });
  view.reset();
}

function init() {
  applyStrings(STRINGS);
  wireLangButton($('#lang-btn'));
  $('#speed').setAttribute('aria-label', T.speed);
  $('#level-bar').setAttribute('aria-label', T.levels);
  const level = pickLevel();
  if (getLevel(requested) === null || requested !== level.id) {
    history.replaceState(null, '', levelUrl(level.id));
  }
  renderLevelBar(level);
  $('#code-btn').addEventListener('click', unlockFlow);
  if (isUnlocked(ACTIVITY, level.id)) startGame(level);
  else showLocked(level);
}

init();
