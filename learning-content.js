// The first published course is intentionally small enough to finish in one sitting.
// Planned nodes describe the path without implying that lessons or exams are live.
export const learningPath = {
  id: 'foundations',
  title: { ar: 'أساسيات الأمن السيبراني', en: 'Cybersecurity Foundations' },
  summary: { ar: 'من قراءة الرابط إلى اتخاذ قرار أمني مبني على دليل.', en: 'From reading a URL to making a security decision based on evidence.' },
  nodes: [
    { id: 'url-safety', type: 'course', state: 'published', title: { ar: 'افهم الروابط قبل أن تثق بها', en: 'Understand URLs before you trust them' }, description: { ar: 'ثلاثة دروس قصيرة وتحدٍّ عملي.', en: 'Three short lessons and a practical challenge.' } },
    { id: 'identity-access', type: 'course', state: 'planned', title: { ar: 'الهوية والصلاحيات', en: 'Identity and access' }, description: { ar: 'كلمات المرور، الجلسات، وأقل صلاحية.', en: 'Passwords, sessions, and least privilege.' } },
    { id: 'evidence-response', type: 'course', state: 'planned', title: { ar: 'الأدلة والاستجابة', en: 'Evidence and response' }, description: { ar: 'اقرأ السجلات واحفظ سلامة الدليل.', en: 'Read logs and preserve evidence integrity.' } },
    { id: 'foundations-final', type: 'exam', state: 'planned', title: { ar: 'امتحان المسار وشهادة الإنجاز', en: 'Path exam and achievement certificate' }, description: { ar: 'سيُتاح بعد إطلاق التصحيح وإصدار الشهادات على الخادم.', en: 'Available after server-side grading and credential issuance launch.' } },
  ],
};

export const courses = [{
  id: 'url-safety', pathId: 'foundations', challengeId: 'f-domain', minutes: 18,
  title: learningPath.nodes[0].title,
  summary: { ar: 'تعلّم تركيب عنوان الويب، وحدد الموقع الحقيقي، ثم طبّق ما تعلمته على رابط مشبوه.', en: 'Learn the structure of a web address, find the real destination, then apply it to a suspicious link.' },
  outcomes: [
    { ar: 'تميّز اسم النطاق الحقيقي من النص الذي يسبقه.', en: 'Distinguish the real domain from the text before it.' },
    { ar: 'تفهم ما تثبته HTTPS وما لا تثبته.', en: 'Understand what HTTPS does and does not prove.' },
    { ar: 'تتخذ خطوة آمنة عند الشك في رابط.', en: 'Choose a safe next step when a link looks suspicious.' },
  ],
  lessonIds: ['url-parts', 'url-traps', 'url-decision'],
}];

export const lessons = [
  {
    id: 'url-parts', courseId: 'url-safety', order: 1, minutes: 5,
    title: { ar: 'تشريح عنوان الويب', en: 'Anatomy of a web address' },
    summary: { ar: 'تعرف على البروتوكول واسم النطاق والمسار.', en: 'Identify the protocol, domain, and path.' },
    sections: [
      { title: { ar: 'العنوان له أجزاء', en: 'An address has parts' }, body: { ar: 'في https://learn.biuret.dev/lesson يبدأ العنوان بالبروتوكول، ثم اسم المضيف، ثم المسار. اقرأه من دون أن تنخدع بالكلمات المألوفة في بدايته.', en: 'In https://learn.biuret.dev/lesson, the address starts with a protocol, followed by a host and a path. Familiar words at the start do not guarantee a familiar destination.' } },
      { title: { ar: 'أين النطاق الحقيقي؟', en: 'Where is the real domain?' }, body: { ar: 'في learn.biuret.dev النطاق المسجل هو biuret.dev، وlearn نطاق فرعي. أما biuret.dev.example.com فموقعه الحقيقي ضمن example.com.', en: 'In learn.biuret.dev, the registered domain is biuret.dev and learn is a subdomain. In biuret.dev.example.com, the actual site is under example.com.' } },
    ],
    example: 'https://account.biuret.dev.example.com/login',
    check: { question: { ar: 'ما النطاق الحقيقي في المثال أعلاه؟', en: 'What is the actual domain in the example above?' }, options: [{ ar: 'biuret.dev', en: 'biuret.dev' }, { ar: 'example.com', en: 'example.com' }, { ar: 'account.biuret.dev', en: 'account.biuret.dev' }], answer: 1, explanation: { ar: 'كل ما يسبق example.com هنا أسماء نطاقات فرعية، حتى لو بدا كأنه عنوان Biuret.', en: 'Everything before example.com is a subdomain here, even though it resembles a Biuret address.' } },
  },
  {
    id: 'url-traps', courseId: 'url-safety', order: 2, minutes: 6,
    title: { ar: 'إشارات التصيد في الرابط', en: 'Phishing signals in a URL' },
    summary: { ar: 'انظر وراء النص الظاهر والرموز التي توحي بالثقة.', en: 'Look beyond display text and familiar trust cues.' },
    sections: [
      { title: { ar: 'النص الظاهر ليس الوجهة', en: 'The label is not the destination' }, body: { ar: 'قد تعرض رسالة كلمة «بوابة الجامعة» بينما يقود الرابط إلى عنوان آخر. افحص العنوان الفعلي قبل إدخال بياناتك، خاصة عند طلب تسجيل دخول عاجل.', en: 'A message may display “university portal” while the link leads elsewhere. Inspect the actual address before entering credentials, especially when the message creates urgency.' } },
      { title: { ar: 'HTTPS يحمي الاتصال فقط', en: 'HTTPS protects the connection only' }, body: { ar: 'القفل يعني أن الاتصال بالموقع مشفر. لا يعني أن الجهة التي تدير الموقع جديرة بالثقة؛ مواقع التصيد قد تستخدم HTTPS أيضًا.', en: 'The lock means the connection is encrypted. It does not establish that the site operator is trustworthy; phishing sites can use HTTPS too.' } },
    ],
    example: 'https://secure-login.example.net/biuret',
    check: { question: { ar: 'ما الذي يثبته HTTPS لهذا الرابط؟', en: 'What does HTTPS establish for this link?' }, options: [{ ar: 'أنه الموقع الرسمي لـ Biuret', en: 'It is the official Biuret site' }, { ar: 'أن الاتصال بالموقع مشفر', en: 'The connection to the site is encrypted' }, { ar: 'أن الرسالة التي أرسلته صحيحة', en: 'The message containing it is genuine' }], answer: 1, explanation: { ar: 'التشفير لا يؤكد هوية الجهة أو صدق الرسالة.', en: 'Encryption does not verify the organization or the message.' } },
  },
  {
    id: 'url-decision', courseId: 'url-safety', order: 3, minutes: 7,
    title: { ar: 'قرار آمن عند الشك', en: 'A safe decision when in doubt' },
    summary: { ar: 'حوّل الشك إلى خطوات بسيطة وقابلة للتكرار.', en: 'Turn suspicion into a repeatable set of steps.' },
    sections: [
      { title: { ar: 'توقف، ثم تحقق', en: 'Pause, then verify' }, body: { ar: 'إذا وصلتك رسالة تطلب كلمة مرور أو رمز تحقق فورًا، لا تدخل من رابطها. افتح الموقع المعروف بكتابته بنفسك أو من تطبيقك المعتاد.', en: 'If a message urgently asks for a password or verification code, avoid its link. Open the known site by typing its address yourself or using your usual app.' } },
      { title: { ar: 'بلّغ من قناة موثوقة', en: 'Report through a trusted channel' }, body: { ar: 'إن كان الرابط متعلقًا بعمل أو دراسة، أرسل بلاغًا لفريق الدعم عبر القناة الرسمية. احتفظ بنص الرسالة والرابط للتحليل، ولا تعِد إرسال بياناتك الحساسة.', en: 'If the link concerns work or school, report it through the official support channel. Preserve the message and URL for analysis without forwarding sensitive information.' } },
    ],
    example: 'https://biuret.dev.example.net/reset-now',
    check: { question: { ar: 'ما الخطوة الأنسب قبل إدخال كلمة المرور؟', en: 'What is the best step before entering your password?' }, options: [{ ar: 'أفتح الرابط لأن بدايته تحتوي على biuret.dev', en: 'Open it because it starts with biuret.dev' }, { ar: 'أرسل كلمة المرور للتأكد من الحساب', en: 'Send my password to confirm the account' }, { ar: 'أفتح الموقع المعروف بنفسي وأتحقق من الطلب', en: 'Open the known site myself and verify the request' }], answer: 2, explanation: { ar: 'الوصول المستقل للموقع يزيل اعتمادك على الرابط المشبوه.', en: 'Navigating independently avoids relying on the suspicious link.' } },
  },
];

export const courseById = Object.fromEntries(courses.map((course) => [course.id, course]));
export const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
export const localized = (value, language) => value?.[language] || value?.ar || '';
