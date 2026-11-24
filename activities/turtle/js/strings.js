// Page text in Arabic and English.
export const STRINGS = {
  ar: {
    pageTitle: 'سُلحفى الرسّام 🐢', title: 'سُلحفى الرسّام 🐢', home: '🏠 الأكاديمية',
    F: 'اتقدّم', L: 'شمال', R: 'يمين',
    program: 'برنامجك', steps: (n) => (n === 1 ? 'أمر واحد' : `${n} أوامر`),
    empty: 'دوس على الأوامر اللي فوق عشان تضيفها هنا',
    run: '▶ شغّل', undo: '↩ رجوع', clear: '🗑 امسح الكل', restore: '🐞 رجّع برنامج سُلحفى',
    showCode: '</> Logo', showBlocks: 'الأوامر', speed: 'السرعة', slow: 'بطيء', normal: 'عادي', fast: 'سريع',
    tip: 'دوس على أي أمر في برنامجك عشان تغيّره',
    idle: 'رتّب الأوامر ودوس ▶ شغّل', idleBug: 'شغّل البرنامج الأول… سُلحفى هيرسم إيه؟',
    running: 'سُلحفى بينفّذ الأوامر… خطوة خطوة', win: 'برافو! برنامجك صح 🎉',
    wrong: 'قرّبت! راجع ترتيب الأوامر وجرّب تاني', wall: 'أوبس! سُلحفى خبط في الحيطة 💥', done: 'جامد! جرّب أوامر جديدة ✨',
    logoNote: 'نفس البرنامج بلغة Logo — تقدر تكتبه في Logo Interpreter',
  },
  en: {
    pageTitle: 'Turtle Artist 🐢', title: 'Turtle Artist 🐢', home: '🏠 Academy',
    F: 'forward', L: 'left', R: 'right',
    program: 'Your program', steps: (n) => (n === 1 ? '1 step' : `${n} steps`),
    empty: 'Tap the commands above to add them here',
    run: '▶ Run', undo: '↩ Undo', clear: '🗑 Clear', restore: "🐞 Bring back Sulhafa's program",
    showCode: '</> Logo', showBlocks: 'Commands', speed: 'Speed', slow: 'Slow', normal: 'Normal', fast: 'Fast',
    tip: 'Tap a command in your program to change it',
    idle: 'Build your program, then press ▶ Run', idleBug: 'Run it first. What does Sulhafa draw?',
    running: 'Sulhafa follows the commands… step by step', win: 'You did it! 🎉',
    wrong: 'Almost! Check the order and try again', wall: 'Oops! Sulhafa hit the wall 💥', done: 'Nice! Try new commands ✨',
    logoNote: 'The same program in Logo — you can type it in Logo Interpreter',
  },
};
