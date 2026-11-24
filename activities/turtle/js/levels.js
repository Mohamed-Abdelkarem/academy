// The Session 1 challenges (same as the slides). start: [x, y, dir] with dir 0 = facing up.
// target: polyline of grid points the drawing must cover exactly. preset: program loaded at start.
export const LEVELS = [
  {
    id: 'free', icon: '🎨',
    title: { ar: 'الملعب الحر', en: 'Free play' },
    task: { ar: 'جرّب أي أوامر… وشوف سُلحفى بيرسم إيه!', en: 'Try any commands and see what Sulhafa draws!' },
    start: [3, 3, 0], target: null, preset: [],
  },
  {
    id: '1', icon: '🎯',
    title: { ar: 'التحدي 1: امشي لحد الهدف', en: 'Challenge 1: Reach the goal' },
    task: { ar: 'خلّي سُلحفى يمشي على الطريق البرتقاني لحد الدايرة.', en: 'Walk Sulhafa along the orange road to the circle.' },
    start: [1, 5, 0], target: [[1, 5], [1, 2], [4, 2]], preset: [],
  },
  {
    id: '2', icon: '⬛',
    title: { ar: 'التحدي 2: ارسم مربع', en: 'Challenge 2: Draw a square' },
    task: { ar: 'كل ضلع خطوتين… وسُلحفى لازم يرجع لنفس مكانه.', en: 'Each side is 2 steps, and Sulhafa must end where he started.' },
    start: [2, 4, 0], target: [[2, 4], [2, 2], [4, 2], [4, 4], [2, 4]], preset: [],
  },
  {
    id: '3', icon: '🐞',
    title: { ar: 'التحدي 3: صلّح الغلطة', en: 'Challenge 3: Fix the bug' },
    task: { ar: 'سُلحفى عايز يطلع السلّم… بس في البرنامج غلطة (Bug). شغّله الأول!', en: 'Sulhafa wants to climb the stairs, but the program has a bug. Run it first!' },
    start: [2, 5, 0], target: [[2, 5], [2, 3], [4, 3], [4, 1], [6, 1]],
    preset: ['F', 'F', 'R', 'F', 'F', 'R', 'F', 'F', 'R', 'F', 'F'],
  },
];

export const levelById = (id) => LEVELS.find((l) => l.id === String(id)) ?? LEVELS[0];
