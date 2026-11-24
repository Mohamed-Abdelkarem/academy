// 🧩 Arrows challenges (same as the Course 1 slides). start: [x, y, dir] with dir 0 = facing up.
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

// ✍️ Code levels (same as the Course 1 slides). The kid types Logo.
// starter: text in the editor at the start (___ = blank to fill). target: what the drawing must match.
// solution: one right answer (tests check it). runOnly: no checking, just run it and look.
export const CODE_LEVELS = [
  {
    id: 'write', icon: '✍️',
    title: { ar: 'اكتب بإيدك', en: 'Write your own' },
    task: { ar: 'اكتب أي أوامر… وشوف سُلحفى بيرسم إيه!', en: 'Type any commands and see what Sulhafa draws!' },
    starter: '', target: null,
  },
  {
    id: 'square', icon: '⬛',
    title: { ar: 'المربع', en: 'The square' },
    task: { ar: 'ارسم مربع كل ضلع فيه 100.', en: 'Draw a square with sides of 100.' },
    hint: { ar: 'fd 100 rt 90 … كام مرة؟', en: 'fd 100 rt 90 … how many times?' },
    starter: '', target: 'repeat 4 [fd 100 rt 90]', solution: 'fd 100 rt 90 fd 100 rt 90 fd 100 rt 90 fd 100 rt 90',
  },
  {
    id: 'triangle', icon: '🔺',
    title: { ar: 'المثلث', en: 'The triangle' },
    task: { ar: 'كمّل الفراغ: سُلحفى بيلف لفّة كاملة = 360… على 3 لفّات.', en: 'Fill the blank: a full turn is 360… in 3 turns.' },
    hint: { ar: '360 ÷ 3 = ؟', en: '360 ÷ 3 = ?' },
    starter: 'repeat 3 [fd 100 rt ___]', target: 'repeat 3 [fd 100 rt 120]', solution: 'repeat 3 [fd 100 rt 120]',
  },
  {
    id: 'hexagon', icon: '⬡',
    title: { ar: 'السداسي', en: 'The hexagon' },
    task: { ar: 'كمّل الفراغ: 6 أضلاع… واللفّة الكاملة 360.', en: 'Fill the blank: 6 sides, and a full turn is 360.' },
    hint: { ar: '360 ÷ 6 = ؟', en: '360 ÷ 6 = ?' },
    starter: 'repeat 6 [fd 60 rt ___]', target: 'repeat 6 [fd 60 rt 60]', solution: 'repeat 6 [fd 60 rt 60]',
  },
  {
    id: 'stairs', icon: '🪜',
    title: { ar: 'التحدي 1: السُلّم', en: 'Challenge 1: The stairs' },
    task: { ar: 'ارسم سُلّم من 4 سلالم (كل حتة 30) بسطر repeat واحد.', en: 'Draw 4 stairs (each piece 30) with one repeat line.' },
    hint: { ar: 'إيه اللي بيتكرر في السلمة الواحدة؟ اطلع، لف يمين، امشي، لف شمال.', en: 'What repeats in one stair? Up, turn right, forward, turn left.' },
    starter: '', target: 'repeat 4 [fd 30 rt 90 fd 30 lt 90]', solution: 'repeat 4 [fd 30 rt 90 fd 30 lt 90]',
  },
  {
    id: 'bug', icon: '🐞',
    title: { ar: 'التحدي 2: صلّح الـ Bug', en: 'Challenge 2: Fix the bug' },
    task: { ar: 'الكود ده المفروض يرسم مربع… شغّله الأول وشوف رسم إيه، وبعدين صلّحه.', en: 'This should draw a square. Run it first, see what it draws, then fix it.' },
    hint: { ar: 'المربع محتاج يلف كام درجة؟', en: 'How many degrees does a square turn?' },
    starter: 'repeat 4 [fd 100 rt 60]', target: 'repeat 4 [fd 100 rt 90]', solution: 'repeat 4 [fd 100 rt 90]',
  },
  {
    id: 'circle', icon: '⭕', runOnly: true,
    title: { ar: 'التحدي 3: الشكل السحري', en: 'Challenge 3: The magic shape' },
    task: { ar: 'شغّل الكود ده… وشوف هيحصل إيه! 👀', en: 'Run this code and see what happens! 👀' },
    starter: 'repeat 36 [fd 10 rt 10]', target: null,
  },
  {
    id: 'flower', icon: '🌸',
    title: { ar: '⭐ الأبطال: الوردة', en: '⭐ Heroes: the flower' },
    task: { ar: 'repeat جوه repeat: المربع بيتكرر 36 مرة، وكل مرة سُلحفى يلف 10.', en: 'repeat inside repeat: the square repeats 36 times, turning 10 each time.' },
    hint: { ar: 'repeat 36 [ repeat 4 [fd 60 rt 90] rt 10 ]', en: 'repeat 36 [ repeat 4 [fd 60 rt 90] rt 10 ]' },
    starter: '', target: 'repeat 36 [repeat 4 [fd 60 rt 90] rt 10]', solution: 'repeat 36 [repeat 4 [fd 60 rt 90] rt 10]',
  },
  {
    id: 'star', icon: '⭐', home: true,
    title: { ar: '🏠 تحدي البيت: النجمة', en: '🏠 Home challenge: the star' },
    task: { ar: 'ارسم نجمة: repeat 5 [fd 100 rt 144] … وبعدين غيّر 144 وشوف هيحصل إيه!', en: 'Draw a star: repeat 5 [fd 100 rt 144], then change 144 and see!' },
    starter: '', target: 'repeat 5 [fd 100 rt 144]', solution: 'repeat 5 [fd 100 rt 144]',
  },
];

export const ALL_LEVELS = [...LEVELS.map((l) => ({ ...l, mode: 'arrows' })), ...CODE_LEVELS.map((l) => ({ ...l, mode: 'code' }))];
export const findLevel = (id) => ALL_LEVELS.find((l) => l.id === String(id)) ?? ALL_LEVELS[0];
