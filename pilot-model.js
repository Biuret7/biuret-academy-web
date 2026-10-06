// Self-reported usability observations are separate from assessed learning.
export const pilotTasks = [
  { id: 'route', group: 'foundations', title: ['اعثر على خطوتك التالية', 'Find your next step'], prompt: ['افتح الأساسيات من صفحة المسارات. هل عرفت من أين تبدأ، وما المطلوب بعد الدرس؟ جرّب دون مساعدة أولاً.', 'Open Foundations from the paths page. Can you tell where to start and what follows a lesson? Try without help first.'], href: 'path.html?id=foundations' },
  { id: 'lesson', group: 'foundations', title: ['تعلّم ثم اشرح بكلماتك', 'Learn, then explain in your own words'], prompt: ['اقرأ درس مكونات الرابط. حدّد المضيف في المثال، واشرح ما الذي لا يثبته HTTPS. اكتب تطبيقك المستقل قبل النظر إلى معايير التصحيح.', 'Read the URL parts lesson. Identify the example host and explain what HTTPS does not prove. Write your independent response before consulting the correction criteria.'], href: 'lesson.html?id=url-parts' },
  { id: 'practice', group: 'foundations', title: ['حلّل الأدلة في المختبر', 'Analyze lab evidence'], prompt: ['افتح مكتب التحليل، جرّب البحث وتصفية المصادر واختيار الأدلة. قدّم قراراً وسبباً ثم راجع التغذية الراجعة. سجّل إن فهمت سبب الخطأ، وليس النتيجة فقط.', 'Open the analyst desk. Try search, source filters and evidence selection. Make a decision, explain it, then review the feedback. Record whether you understood a mistake, not just the score.'], href: 'lab.html?id=log-triage' },
  { id: 'continuity', group: 'foundations', title: ['اختبر اللغة واستعادة عملك', 'Test language and saved work'], prompt: ['اكتب ملاحظة تدريبية، بدّل العربية والإنجليزية، ثم حدّث الصفحة في المتصفح نفسه. تحقق من اتجاه القائمة والنص واستعادة إجابتك. لا تستخدم بيانات شخصية.', 'Write a training note, switch Arabic/English, then reload in the same browser. Check navigation direction, text and restored answers. Do not use personal data.'], href: 'lab.html?id=log-triage' },
  { id: 'assessment', group: 'foundations', title: ['افهم متطلبات الإنجاز', 'Understand completion requirements'], prompt: ['اعثر على التقييم العملي والامتحان والشهادة من صفحة الأساسيات. هل ترتيبها وشروط فتحها واضحان؟ لا تحتاج إلى استهلاك محاولة امتحان لهذه التجربة.', 'Find the practical assessment, exam and credential from Foundations. Are their order and access rules clear? You do not need to consume an exam attempt for this trial.'], href: 'path.html?id=foundations#path-assessment' },
  { id: 'credential', group: 'foundations', title: ['راجع الشهادة وخياراتها', 'Review credential options'], prompt: ['إذا أنجزت المسار سابقاً، افتح شهادتك وتحقق من الاسم وتفاصيل الإنجاز وخيارات التنزيل والتحقق العام. إن لم تنجزه، راجع رسالة المتطلبات فقط؛ لا تبدأ امتحاناً للحصول على نتيجة هذه التجربة.', 'If you already completed the path, open your credential and inspect name, achievement details, download and public-verification options. Otherwise inspect the prerequisites message only; do not start an exam for this trial.'], href: 'certificate.html' },
  { id: 'soc-route', group: 'soc', title: ['تتبّع خطة SOC', 'Follow the SOC route'], prompt: ['افتح مسار SOC. ميّز الدورات المطلوبة والإضافية والمختبرات وغرفة العمليات. إذا كان المحتوى مقفلاً لحسابك، سجّل ذلك ولا تغيّر الخطة لتجاوز القفل.', 'Open SOC. Identify required and optional courses, labs and the operations room. If content is locked for your account, record that; do not change your plan to bypass it.'], href: 'path.html?id=path_soc' },
  { id: 'soc-evidence', group: 'soc', title: ['اربط الدرس بالتطبيق', 'Connect teaching to practice'], prompt: ['من مسار SOC افتح درساً متاحاً ثم المختبر المناسب. هل يعلّمك الدرس ما يحتاجه التمرين؟ اذكر المفهوم الناقص أو المصطلح غير المشروح، إن وجد.', 'From SOC, open an available lesson and its relevant lab. Does the lesson teach what the exercise needs? Name any missing concept or unexplained term.'], href: 'path.html?id=path_soc' },
  { id: 'soc-handover', group: 'soc', title: ['قيّم وضوح القرار والتقييم', 'Evaluate decisions and assessment clarity'], prompt: ['جرّب غرفة العمليات المناسبة من مسار SOC. هل تستطيع كتابة دليل، استنتاج، معلومة ناقصة وخطوة تحقق؟ راجع شروط امتحان المسار دون بدء محاولة، وسجّل أي مهارة لم تجد لها تدريباً.', 'Try the operations room linked from SOC. Can you document evidence, a finding, an unknown and verification? Read path exam rules without starting an attempt; record any skill without teaching or practice.'], href: 'path.html?id=path_soc' },
];
export const pilotResults = ['untried', 'independent', 'help', 'blocked', 'locked'];
export function cleanPilot(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return Object.fromEntries(pilotTasks.map(({ id }) => {
    const item = source[id] || {};
    const minutes = item.minutes === '' || item.minutes == null ? null : Number(item.minutes);
    const confidence = item.confidence === '' || item.confidence == null ? null : Number(item.confidence);
    return [id, { result: pilotResults.includes(item.result) ? item.result : 'untried', note: typeof item.note === 'string' ? item.note.slice(0, 2000) : '',
      minutes: Number.isFinite(minutes) && minutes >= 0 && minutes <= 240 ? minutes : null,
      confidence: Number.isInteger(confidence) && confidence >= 1 && confidence <= 5 ? confidence : null }];
  }));
}
export function pilotSummary(raw) {
  const entries = Object.values(cleanPilot(raw));
  return { recorded: entries.filter(x => x.result !== 'untried').length, total: entries.length, blockers: entries.filter(x => x.result === 'blocked').length, locks: entries.filter(x => x.result === 'locked').length };
}
export function pilotReport(raw, language, date = new Date()) {
  const observations = cleanPilot(raw);
  return { kind: 'biuret-learning-pilot', version: 2, reportedAt: date.toISOString(), language: language === 'en' ? 'en' : 'ar', selfReported: true, assessmentResult: false, observations: pilotTasks.map(({ id, group, href }) => ({ task: id, group, page: href, ...observations[id] })) };
}
