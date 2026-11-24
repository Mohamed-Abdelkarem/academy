// Which code opens what. Only hashes live here; the codes themselves are kept by the teacher.
// To add or change a code:  node tools/hash-code.mjs <new-code>  → paste the hash below.
// Change the codes for every new group.
//
// grants: { <activity id>: [level ids] }  ·  all: true opens everything (teacher).

export const ACCESS_CODES = [
  {
    label: { ar: 'حصة 3 — المتاهة 1–5', en: 'Class 3 — Maze 1–5' },
    hash: '674ee49743342ec666851e15d846b292cc0aac54dd88ff1b1ba7e729d8be9396',
    grants: { maze: [1, 2, 3, 4, 5] },
  },
  {
    label: { ar: 'حصة 4 — المتاهة 6–9', en: 'Class 4 — Maze 6–9' },
    hash: '87bf4b2eda821c1a401c3d1dcc96aad98282fa8c897cc1d4a9b096863912839d',
    grants: { maze: [6, 7, 8, 9] },
  },
  {
    label: { ar: 'تحدي الأبطال — المتاهة 10', en: 'Heroes challenge — Maze 10' },
    hash: '61520e7f43b89400ea17b2bff81c655d49393aef1338ab9fedf446bb04928050',
    grants: { maze: [10] },
  },
  {
    label: { ar: 'المدرس — كل حاجة', en: 'Teacher — everything' },
    hash: '6a2ec97ebb977a57c055a82646a4808f64dddc17783784ba72110f4b9b29ce4b',
    all: true,
  },
];
