// 🤖 AI lab missions. Text mini-markup: [[Button]] = a button name in the tool (English, as on screen),
// {{word}} = a programming / AI term in English. Same order and words as the Course 1 slides.
export const TOOLS = {
  draw: 'https://quickdraw.withgoogle.com/',
  tm: 'https://teachablemachine.withgoogle.com/train/image',
  tmAudio: 'https://teachablemachine.withgoogle.com/train/audio',
  drawData: 'https://quickdraw.withgoogle.com/data',
};

export const STRINGS = {
  ar: {
    pageTitle: 'مختبر الـ AI 🤖', title: 'مختبر الـ AI 🤖', home: '🏠 الأكاديمية',
    done: '✓ خلّصت', notDone: 'خلّصت؟ دوس هنا', hint: '💡 تلميح', open: 'افتح', challenges: 'التحديات',
    safeT: '📷 قبل ما تبدأ', safe1: 'الكاميرا على الحاجة… مش على وشك.', safe2: 'الصور بتفضل على جهازك ومش بتطلع برّه. لما تخلص: اقفل التاب.',
    detective: ['▶️ شغّلناه', '👀 حصل إيه؟', '🎯 كنا عايزين إيه؟', '🖼️ شاف أمثلة كفاية؟'],
  },
  en: {
    pageTitle: 'AI Lab 🤖', title: 'AI Lab 🤖', home: '🏠 Academy',
    done: '✓ Done', notDone: 'Done? Tap here', hint: '💡 Hint', open: 'Open', challenges: 'Challenges',
    safeT: '📷 Before you start', safe1: 'Point the camera at the object… not at your face.', safe2: 'The pictures stay on your computer. When you finish: close the tab.',
    detective: ['▶️ We ran it', '👀 What happened?', '🎯 What did we want?', '🖼️ Enough examples?'],
  },
};

export const MISSIONS = [
  {
    id: 'draw', icon: '✏️',
    ar: {
      name: 'ارسم', title: 'ارسم… والكمبيوتر يخمّن', story: 'الكمبيوتر هيحاول يعرف إنت بترسم إيه وإنت لسه بترسم!',
      go: 'افتح Quick, Draw! ↗',
      steps: [
        'دوس الزرار البرتقاني فوق.',
        'من قايمة اللغات اختار «العربية».',
        'دوس زرار البداية — هتطلعلك كلمة، ارسمها في 20 ثانية.',
        '6 رسومات… والكمبيوتر بيقول تخميناته بصوت عالي.',
        'في الآخر: دوس على رسمتك وشوف رسومات ناس تانية لنفس الكلمة. 🤔 عرف منين؟',
        '🖼️ عايز تشوف الكمبيوتر اتعلم من إيه؟ دوس الزرار الأخضر تحت واختار كلمة (cat = قطة) — آلاف الرسومات، كل واحدة شكل! ({{Data}})',
      ],
      links: [['drawData', '🖼️ شوف رسومات الناس ↗']],
    },
    en: {
      name: 'Draw', title: 'Draw… and the computer guesses', story: 'The computer tries to guess your drawing while you are still drawing!',
      go: 'Open Quick, Draw! ↗',
      steps: [
        'Tap the orange button above.',
        "Press [[Let's Draw!]] — you get a word, draw it in 20 seconds.",
        '6 drawings… and the computer says its guesses out loud.',
        'At the end: tap your drawing and see other people\'s drawings of the same word. 🤔 How did it know?',
        '🖼️ Want to see what the computer learned from? Tap the green button and pick a word (cat) — thousands of drawings, all different! ({{Data}})',
      ],
      links: [['drawData', '🖼️ See everyone\'s drawings ↗']],
    },
    tool: 'draw',
  },
  {
    id: 'see', icon: '👀', safe: true,
    ar: {
      name: 'عيون سُلحفى', title: 'عيون سُلحفى: علّم الكمبيوتر يشوف', story: 'إنت المدرّب: هتدّي الكمبيوتر أمثلة ({{Data}})… وهو يتعلم منها ({{Training}})… ويخمّن ({{Prediction}}).',
      go: 'افتح Teachable Machine ↗',
      steps: [
        'دوس الزرار البرتقاني فوق ← لو سألك عن الكاميرا: [[Allow]].',
        'دوس على القلم ✏️ جنب [[Class 1]] واكتب اسم الحاجة الأولى (مثلًا: قلم).',
        'دوس [[Webcam]] ← امسك الحاجة قدام الكاميرا ← دوس وسيب صباعك على [[Hold to Record]]. لفّها وقرّبها وبعّدها — 100 صورة على الأقل.',
        'نفس الكلام في [[Class 2]] بحاجة تانية (مثلًا: محّاية).',
        'دوس [[Train Model]] واستنّى. ماتقفلش التاب وهو بيتدرّب!',
        'في [[Preview]]: وري الكاميرا الحاجة… الشريط بيقولك الكمبيوتر خمّن إيه.',
      ],
      challenges: [
        { kind: 'ch', t: 'التحدي 1: حاجتين من شنطتك 🎒', p: 'خلّي الموديل يفرّق بين حاجتين.', tips: ['100 صورة لكل حاجة', 'لفّها وغيّر مكانها', 'قرّبها لحد ما تملا الكاميرا'] },
        { kind: 'bug', t: '🐞 التحدي 2: شيل الحاجة من قدام الكاميرا', p: 'الموديل بيقول إيه دلوقتي؟ ليه؟ صلّحه!', det: true, hint: 'الموديل لازم يختار من اللي يعرفه بس — مفيش «مش عارف». علّمه Class جديد: [[Add a class]] واسمه «مفيش حاجة 🫥» (صور للكاميرا فاضية) ← [[Train Model]] تاني.' },
        { kind: 'ch', t: 'التحدي 3: Class تالت 3️⃣', p: 'زوّد حاجة تالتة. الموديل لسه شاطر؟', tips: ['[[Add a class]]', 'نفس عدد الصور تقريبًا لكل Class'] },
        { kind: 'star', t: '⭐ للأبطال: حاجتين شبه بعض', p: 'قلمين بلونين مختلفين… الموديل هيعرف يفرّق باللون بس؟', tips: ['محتاج أمثلة أكتر وأنضف'] },
      ],
    },
    en: {
      name: "Sulhafa's eyes", title: "Sulhafa's eyes: teach the computer to see", story: "You're the trainer: you give the computer examples ({{Data}})… it learns from them ({{Training}})… and it guesses ({{Prediction}}).",
      go: 'Open Teachable Machine ↗',
      steps: [
        'Tap the orange button above ← if it asks about the camera: [[Allow]].',
        'Tap the pencil ✏️ next to [[Class 1]] and type the name of the first object (e.g. pen).',
        'Press [[Webcam]] ← hold the object in front of the camera ← press and hold [[Hold to Record]]. Turn it, move it closer and farther — at least 100 pictures.',
        'Same in [[Class 2]] with another object (e.g. eraser).',
        "Press [[Train Model]] and wait. Don't close the tab while it trains!",
        'In [[Preview]]: show the camera an object… the bar shows what the computer guessed.',
      ],
      challenges: [
        { kind: 'ch', t: 'Challenge 1: two things from your bag 🎒', p: 'Make the model tell two objects apart.', tips: ['100 pictures for each', 'turn it and move it', 'bring it close so it fills the camera'] },
        { kind: 'bug', t: '🐞 Challenge 2: take the object away', p: 'What does the model say now? Why? Fix it!', det: true, hint: "The model must pick one of the things it knows — there is no \"I don't know\". Teach it a new class: [[Add a class]] called \"nothing 🫥\" (pictures of the empty camera) ← [[Train Model]] again." },
        { kind: 'ch', t: 'Challenge 3: a third class 3️⃣', p: 'Add a third object. Is the model still smart?', tips: ['[[Add a class]]', 'about the same number of pictures for each class'] },
        { kind: 'star', t: '⭐ Heroes: two look-alike things', p: 'Two pens of different colours… can the model tell them apart by colour only?', tips: ['needs more and cleaner examples'] },
      ],
    },
    tool: 'tm',
  },
  {
    id: 'fool', icon: '🕵️', safe: true,
    ar: {
      name: 'اخدع زميلك', title: 'اخدع موديل زميلك 🕵️', story: 'بدّلوا الأجهزة: حاول تخلّي موديل زميلك يغلط… وهو يحاول يصلّحه.',
      steps: [
        'مسموح: الحاجة بعيدة · مقلوبة · حاجة تانية لونها شبهها.',
        'ممنوع: تغطي الكاميرا.',
        'الموديل غلط؟ صاحبه يقول ليه غلط: «ماشافش أمثلة كفاية لـ…».',
        'يزوّد أمثلة جديدة ← [[Train Model]] تاني ← جرّبوا تاني.',
        'بدّلوا الأدوار!',
      ],
      challenges: [
        { kind: 'ch', t: 'خدعت الموديل… وقلت ليه غلط', p: 'الموديل مش فاهم — بيخمّن من الأمثلة اللي شافها.', det: true },
        { kind: 'ch', t: 'صلّحت موديلي بأمثلة أكتر 🔧', p: 'نفس الخدعة ماعادتش بتنفع؟ برافو!' },
      ],
    },
    en: {
      name: 'Fool a friend', title: "Fool your friend's model 🕵️", story: "Swap computers: try to make your friend's model wrong… and they try to fix it.",
      steps: [
        'Allowed: far away · upside down · another object with a similar colour.',
        'Not allowed: covering the camera.',
        'The model was wrong? Its owner says why: "it did not see enough examples of…".',
        'Add new examples ← [[Train Model]] again ← try again.',
        'Swap roles!',
      ],
      challenges: [
        { kind: 'ch', t: 'I fooled the model… and said why', p: "The model doesn't understand — it guesses from the examples it saw.", det: true },
        { kind: 'ch', t: 'I fixed my model with more examples 🔧', p: "The same trick doesn't work any more? Well done!" },
      ],
    },
  },
  {
    id: 'home', icon: '🏠',
    ar: {
      name: 'في البيت', title: 'في البيت (اختياري) 🏠', story: 'وري أهلك اللي اتعلمته.',
      steps: [
        '🔎 صيّاد الـ AI: لاقي حاجتين في البيت فيهم AI (الموبايل بيفتح بالوش · YouTube بيقترح فيديوهات · المساعد الصوتي…).',
        'اسأل أهلك: «ده اتعلم من أمثلة ولا حد كتبله قاعدة؟»',
        '✏️ العب Quick, Draw! مع حد من أهلك: الكمبيوتر بيعرف رسم مين أكتر؟',
        '⭐ للأبطال: علّم الكمبيوتر يسمع — فرّق بين تصقيفة 👏 وصفارة 🎵.',
      ],
      links: [['draw', 'Quick, Draw! ↗'], ['tmAudio', '⭐ Teachable Machine — صوت ↗']],
    },
    en: {
      name: 'At home', title: 'At home (optional) 🏠', story: 'Show your family what you learned.',
      steps: [
        '🔎 AI hunter: find two things at home that use AI (face unlock · YouTube suggestions · voice assistant…).',
        'Ask your family: "Did it learn from examples, or did someone write a rule?"',
        "✏️ Play Quick, Draw! with someone at home: whose drawings does the computer guess more?",
        '⭐ Heroes: teach the computer to hear — clap 👏 or whistle 🎵.',
      ],
      links: [['draw', 'Quick, Draw! ↗'], ['tmAudio', '⭐ Teachable Machine — sound ↗']],
    },
  },
];
