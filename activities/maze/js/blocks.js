// Maze blocks for Blockly (global `Blockly`, loaded by a <script> tag before this module)
// and the conversion from the workspace to an engine program.
// Text matches Blockly Games Maze in Arabic, so the S3–S4 slides still match what kids see.

const MOVEMENT_HUE = 290;
const LOOPS_HUE = 120;
const LOGIC_HUE = 210;

const PATH_OPTIONS = [
  ['إذا هناك مسار في الأمام', 'ahead'],
  ['إذا كان المسار إلى اليسار', 'left'],
  ['إذا كان المسار إلى اليمين', 'right'],
];

let defined = false;

export function defineBlocks() {
  if (defined) return;
  defined = true;
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'maze_move',
      message0: 'تحرّك إلى الأمام',
      previousStatement: null,
      nextStatement: null,
      colour: MOVEMENT_HUE,
      tooltip: 'الباندا يتحرك خطوة واحدة لقدام',
    },
    {
      type: 'maze_turn',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            ['استدر إلى اليسار ↺', 'left'],
            ['استدر إلى اليمين ↻', 'right'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: MOVEMENT_HUE,
      tooltip: 'الباندا يلف ربع لفة شمال أو يمين',
    },
    {
      type: 'maze_repeat_until',
      message0: 'كرِّر حتى 🏁 %1 افعل %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      colour: LOOPS_HUE,
      tooltip: 'كرّر البلوكات اللي جوه لحد ما الباندا يوصل للعلم',
    },
    {
      type: 'maze_if',
      message0: '%1 %2 افعل %3',
      args0: [
        { type: 'field_dropdown', name: 'DIR', options: PATH_OPTIONS },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC_HUE,
      tooltip: 'لو فيه طريق في الاتجاه ده، اعمل اللي جوه',
    },
    {
      type: 'maze_if_else',
      message0: '%1 %2 افعل %3 وإلا %4',
      args0: [
        { type: 'field_dropdown', name: 'DIR', options: PATH_OPTIONS },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC_HUE,
      tooltip: 'لو فيه طريق اعمل الأولاني، وإلا اعمل التاني',
    },
  ]);
}

/** Toolbox JSON from a level's block list. */
export function toolboxFor(level) {
  return {
    kind: 'flyoutToolbox',
    contents: level.toolbox.map((b) => ({ kind: 'block', type: b.type, fields: b.fields })),
  };
}

function chain(block) {
  const out = [];
  for (let b = block; b; b = b.getNextBlock()) {
    if (b.isInsertionMarker()) continue;
    out.push(toStatement(b));
  }
  return out;
}

function toStatement(b) {
  const id = b.id;
  switch (b.type) {
    case 'maze_move':
      return { id, type: 'move' };
    case 'maze_turn':
      return { id, type: 'turn', dir: b.getFieldValue('DIR') };
    case 'maze_repeat_until':
      return { id, type: 'repeat_until', body: chain(b.getInputTargetBlock('DO')) };
    case 'maze_if':
      return { id, type: 'if', dir: b.getFieldValue('DIR'), body: chain(b.getInputTargetBlock('DO')) };
    case 'maze_if_else':
      return {
        id,
        type: 'if_else',
        dir: b.getFieldValue('DIR'),
        body: chain(b.getInputTargetBlock('DO')),
        else: chain(b.getInputTargetBlock('ELSE')),
      };
    default:
      throw new Error(`Unknown block ${b.type}`);
  }
}

/**
 * Read the workspace as a program.
 * @returns {{ ok: true, program: Array } | { ok: false, reason: 'empty' | 'split' }}
 */
export function readProgram(workspace) {
  const tops = workspace.getTopBlocks(true).filter((b) => !b.isInsertionMarker());
  if (tops.length === 0) return { ok: false, reason: 'empty' };
  if (tops.length > 1) return { ok: false, reason: 'split' };
  return { ok: true, program: chain(tops[0]) };
}
