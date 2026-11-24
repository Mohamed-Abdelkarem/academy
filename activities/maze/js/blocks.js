// Maze blocks for Blockly (global `Blockly`, loaded by a <script> tag before this module)
// and the conversion from the workspace to an engine program.
// Arabic text matches the S3–S4 slides: Blockly Games' Arabic wording + the English term for
// programming concepts (repeat until · if · else), as the deck checklist requires.

const MOVEMENT_HUE = 290;
const LOOPS_HUE = 120;
const LOGIC_HUE = 210;

const TEXT = {
  ar: {
    move: 'تحرّك إلى الأمام ⬆️',
    left: 'استدر إلى اليسار ↺',
    right: 'استدر إلى اليمين ↻',
    repeat: 'كرِّر حتى (repeat until) 🏁 %1 افعل %2',
    ifAhead: 'إذا (if) هناك مسار في الأمام',
    ifLeft: 'إذا (if) كان المسار إلى اليسار',
    ifRight: 'إذا (if) كان المسار إلى اليمين',
    do: 'افعل',
    else: 'وإلا (else)',
    tipMove: 'الباندا يتحرك خطوة واحدة لقدام',
    tipTurn: 'الباندا يلف ربع لفة شمال أو يمين',
    tipRepeat: 'كرّر البلوكات اللي جوه لحد ما الباندا يوصل للعلم',
    tipIf: 'لو فيه طريق في الاتجاه ده، اعمل اللي جوه',
    tipIfElse: 'لو فيه طريق اعمل الأولاني، وإلا اعمل التاني',
  },
  en: {
    move: 'move forward ⬆️',
    left: 'turn left ↺',
    right: 'turn right ↻',
    repeat: 'repeat until 🏁 %1 do %2',
    ifAhead: 'if path ahead',
    ifLeft: 'if path to the left',
    ifRight: 'if path to the right',
    do: 'do',
    else: 'else',
    tipMove: 'Moves the panda one step forward',
    tipTurn: 'Turns the panda left or right by 90 degrees',
    tipRepeat: 'Repeats the blocks inside until the panda reaches the flag',
    tipIf: 'If there is a path that way, do the blocks inside',
    tipIfElse: 'If there is a path, do the first part, else do the second',
  },
};

let defined = false;

export function defineBlocks(lang = 'ar') {
  if (defined) return;
  defined = true;
  const t = TEXT[lang] || TEXT.ar;
  const PATH_OPTIONS = [
    [t.ifAhead, 'ahead'],
    [t.ifLeft, 'left'],
    [t.ifRight, 'right'],
  ];
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'maze_move',
      message0: t.move,
      previousStatement: null,
      nextStatement: null,
      colour: MOVEMENT_HUE,
      tooltip: t.tipMove,
    },
    {
      type: 'maze_turn',
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'DIR',
          options: [
            [t.left, 'left'],
            [t.right, 'right'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: MOVEMENT_HUE,
      tooltip: t.tipTurn,
    },
    {
      type: 'maze_repeat_until',
      message0: t.repeat,
      args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
      previousStatement: null,
      colour: LOOPS_HUE,
      tooltip: t.tipRepeat,
    },
    {
      type: 'maze_if',
      message0: `%1 %2 ${t.do} %3`,
      args0: [
        { type: 'field_dropdown', name: 'DIR', options: PATH_OPTIONS },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC_HUE,
      tooltip: t.tipIf,
    },
    {
      type: 'maze_if_else',
      message0: `%1 %2 ${t.do} %3 ${t.else} %4`,
      args0: [
        { type: 'field_dropdown', name: 'DIR', options: PATH_OPTIONS },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: LOGIC_HUE,
      tooltip: t.tipIfElse,
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
