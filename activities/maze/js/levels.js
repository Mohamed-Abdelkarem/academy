// Maze levels. Pure data, no DOM.
// Maps and block limits are the same as Blockly Games Maze (Apache-2.0, google/blockly-games),
// so the content docs and slides for Sessions 3–4 stay valid.
// Cell values: 0 wall · 1 path · 2 start · 3 finish. The panda always starts facing east.

export const DIR = { NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3 };

// Block types available in the toolbox (defined in blocks.js).
const MOVE = { type: 'maze_move' };
const LEFT = { type: 'maze_turn', fields: { DIR: 'left' } };
const RIGHT = { type: 'maze_turn', fields: { DIR: 'right' } };
const REPEAT = { type: 'maze_repeat_until' };
const IF_LEFT = { type: 'maze_if', fields: { DIR: 'left' } };
const IF = { type: 'maze_if' };
const IF_ELSE = { type: 'maze_if_else' };

const BASIC = [MOVE, LEFT, RIGHT];

export const LEVELS = [
  {
    id: 1,
    map: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 1, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: Infinity,
    toolbox: BASIC,
    startLocked: true, // the starting "move" block can't be moved or deleted
    hint: 'ركّب البلوكات تحت بعض عشان الباندا يوصل للعلم 🏁',
  },
  {
    id: 2,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 3, 0, 0, 0],
      [0, 0, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: Infinity,
    toolbox: BASIC,
    hint: 'الباندا محتاج يلف. فكّر: يلف شمال ولا يمين؟',
  },
  {
    id: 3,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 2,
    toolbox: [...BASIC, REPEAT],
    hint: 'عندك 2 بلوك بس! جرّب بلوك كرِّر حتى',
  },
  {
    id: 4,
    // The path continues past the start and the finish on purpose.
    map: [
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 3, 1, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 2, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 5,
    toolbox: [...BASIC, REPEAT],
    hint: 'تقدر تحط أكتر من بلوك جوه كرِّر حتى',
  },
  {
    id: 5,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 2, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 5,
    toolbox: [...BASIC, REPEAT],
    hint: 'مش لازم كل البلوكات تبقى جوه التكرار',
  },
  {
    id: 6,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 3, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 2, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 5,
    toolbox: [...BASIC, REPEAT, IF_LEFT],
    hint: 'بلوك إذا بيسأل سؤال: لو فيه طريق شمال… يلف شمال',
  },
  {
    id: 7,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0],
      [0, 2, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 3, 0, 1, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 5,
    toolbox: [...BASIC, REPEAT, IF],
    hint: 'اضغط على السهم الصغير جوه بلوك إذا وغيّر الاتجاه',
  },
  {
    id: 8,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 1, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 0],
      [0, 2, 1, 1, 0, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 10,
    toolbox: [...BASIC, REPEAT, IF],
    hint: 'الطريق بيلف ناحية واحدة ولا ناحيتين؟',
  },
  {
    id: 9,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0],
      [3, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 2, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 7,
    toolbox: [...BASIC, REPEAT, IF, IF_ELSE],
    hint: 'إذا-وإلا: لو قدامك طريق اعمل حاجة… وإلا اعمل حاجة تانية',
  },
  {
    id: 10,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 3, 0, 1, 0],
      [0, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 1, 0],
      [0, 2, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    maxBlocks: 10,
    toolbox: [...BASIC, REPEAT, IF, IF_ELSE],
    hint: 'للأبطال: امشي وإيدك على الحيطة اللي على شمالك',
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}
