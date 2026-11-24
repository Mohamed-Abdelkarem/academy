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
    hint: { ar: 'ركّب البلوكات تحت بعض عشان الباندا يوصل للعلم 🏁', en: 'Stack the blocks so the panda reaches the flag 🏁' },
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
    hint: { ar: 'الباندا محتاج يلف. فكّر: يلف شمال ولا يمين؟', en: 'The panda needs to turn. Left or right?' },
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
    hint: { ar: 'عندك 2 بلوك بس! جرّب بلوك كرِّر حتى', en: 'Only 2 blocks! Try the repeat until block' },
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
    hint: { ar: 'تقدر تحط أكتر من بلوك جوه كرِّر حتى', en: 'You can put more than one block inside repeat until' },
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
    hint: { ar: 'مش لازم كل البلوكات تبقى جوه التكرار', en: 'Not every block has to go inside the loop' },
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
    hint: { ar: 'بلوك إذا بيسأل سؤال: لو فيه طريق شمال… يلف شمال', en: 'The if block asks a question: if there\'s a path to the left… turn left' },
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
    hint: { ar: 'اضغط على السهم الصغير جوه بلوك إذا وغيّر الاتجاه', en: 'Click the small arrow inside the if block and change the direction' },
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
    hint: { ar: 'الطريق بيلف ناحية واحدة ولا ناحيتين؟', en: 'Does the path turn one way or both ways?' },
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
    hint: { ar: 'إذا-وإلا: لو قدامك طريق اعمل حاجة… وإلا اعمل حاجة تانية', en: 'if-else: if there\'s a path ahead do one thing… else do another' },
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
    hint: { ar: 'للأبطال: امشي وإيدك على الحيطة اللي على شمالك', en: 'For heroes: walk with your hand on the left wall' },
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}
