export const pageContexts = {
  home: ['HOME', 'رحلة التعلّم تبدأ هنا.', 'Your learning journey starts here.'],
  paths: ['PATHS', 'طريقك من الأساسيات إلى التخصص.', 'Your route from foundations to a specialty.'],
  courses: ['COURSES', 'كورسات مرتبة تبني معرفتك.', 'Courses that build your knowledge in order.'],
  course: ['COURSE', 'تعلّم موضوعاً واحداً خطوة بخطوة.', 'Learn one topic, step by step.'],
  lesson: ['LESSON', 'ركّز على خطوتك التالية.', 'Focus on your next learning step.'],
  labs: ['LABS', 'طبّق ما تعلّمته بأمان.', 'Practice what you learned safely.'],
  lab: ['LAB', 'مختبر عملي موجّه وآمن.', 'A safe, guided hands-on lab.'],
  quizzes: ['QUIZZES', 'اختبر فهمك بعد كل خطوة.', 'Check your understanding after each step.'],
  challenges: ['CHALLENGES', 'تحديات قصيرة تثبّت مهاراتك.', 'Short challenges to strengthen your skills.'],
  tools: ['TOOLS', 'تعرّف إلى الأدوات وطريقة استخدامها.', 'Explore tools and how to use them.'],
  progress: ['PROGRESS', 'تابع ما أنجزته والخطوة القادمة.', 'Track what you completed and what comes next.'],
  exam: ['EXAM', 'اختبر أساسياتك بعد إكمال الدروس.', 'Test your foundations after the lessons.'],
  certificate: ['CREDENTIAL', 'اعرض إثبات إنجازك وتحقّق منه.', 'View and verify your achievement.'],
  membership: ['MEMBERSHIP', 'اختر مزايا التعلّم المناسبة لك.', 'Explore the learning benefits that fit you.'],
  shop: ['SHOP', 'استكشف مزايا عملات Biuret.', 'Explore Biuret Coins benefits.'],
  admin: ['ADMIN', 'إدارة إثباتات الإنجاز.', 'Manage achievement credentials.'],
};

export function pageContext(page) {
  const [label, arabic, english] = pageContexts[page];
  return `<div class="page-header-context"><span>ACADEMY / ${label}</span><strong data-ar="${arabic}" data-en="${english}">${arabic}</strong></div>`;
}
