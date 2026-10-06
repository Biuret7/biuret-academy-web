import { englishTracks, englishChallenges } from './content-en.js?v=20261006-soccase1';

const KEY = 'biuret-academy-language';
let language;
try { language = localStorage.getItem(KEY) === 'en' ? 'en' : 'ar'; } catch { language = 'ar'; }

export const currentLanguage = () => language;
export const isEnglish = () => language === 'en';

const ui = {
  account: ['حسابي', 'Account'], challenges: ['تحديات', 'challenges'], available: ['متاح الآن', 'Available'], locked: ['مغلق', 'Locked'], completed: ['مكتمل', 'Completed'],
  completeCount: ['تحديات مكتملة', 'challenges completed'], minutes: ['دقائق', 'min'], dailyComplete: ['مكتمل اليوم', 'Completed today'], reviewChallenge: ['راجع التحدّي ↗', 'Review challenge ↗'], openChallenge: ['افتح التحدّي ↗', 'Open challenge ↗'],
  oneDay: ['يوم', 'day'], manyDays: ['أيام', 'days'], inARow: ['متتالية', 'in a row'], startToday: ['ابدأ اليوم', 'Start today'], answer: ['إجابتك', 'Your answer'], mission: ['المهمة', 'Mission'], check: ['تحقّق من الإجابة', 'Check answer'], hint: ['أحتاج تلميحاً', 'I need a hint'],
  doneHeading: ['✓ تحدٍّ مكتمل', '✓ Challenge complete'], correctHeading: ['✓ أحسنت، إجابة صحيحة', '✓ Correct answer'], nextChallenge: ['التحدّي التالي', 'Next challenge'], wrong: ['ليست الإجابة الصحيحة بعد. راجع الدليل وحاول مرة أخرى.', 'Not quite. Review the evidence and try again.'],
  previousFirst: ['أكمل التحدّي السابق في هذا المسار لفتح هذا التحدّي.', 'Complete the previous challenge in this path to unlock this one.'], localError: ['تعذر حفظ التقدّم على هذا المتصفح.', 'Could not save progress in this browser.'], syncError: ['التقدّم محفوظ على جهازك، لكن تعذرت مزامنته الآن.', 'Progress is saved on this device, but cloud sync is unavailable right now.'],
  welcomeBack: ['أهلاً بعودتك.', 'Welcome back.'], saveProgress: ['احفظ تقدّمك.', 'Keep your progress.'], synced: ['إنجازاتك متزامنة مع حساب Biuret.', 'Your achievements are synced with your Biuret account.'], oneAccount: ['حساب واحد لموقع Biuret والأكاديمية.', 'One account for Biuret and the Academy.'], learner: ['متعلّم Biuret', 'Biuret learner'], signOut: ['تسجيل الخروج', 'Sign out'], signIn: ['تسجيل الدخول', 'Sign in'], signUp: ['إنشاء حساب', 'Create account'], signedOut: ['تم تسجيل الخروج. إنجازاتك محفوظة في حسابك.', 'Signed out. Your achievements remain in your account.'], signOutError: ['تعذر حفظ التقدّم أو تسجيل الخروج الآن. حاول مجدداً.', 'Could not save progress or sign out. Please try again.'], signedIn: ['أهلاً بك! تم ربط تقدّمك بحساب Biuret.', 'Welcome! Your progress is linked to your Biuret account.'], loginError: ['تعذر تسجيل الدخول. تحقق من البيانات وحاول مجدداً.', 'Could not sign in. Check your details and try again.'], oauthError: ['تعذر إكمال الدخول عبر المزود. حاول مرة أخرى.', 'Could not complete provider sign-in. Please try again.'], accountError: ['تعذر الاتصال بالحساب الآن. تقدّمك المحلي محفوظ.', 'Could not reach your account. Local progress is saved.'],
};
export function t(key) { return ui[key]?.[language === 'en' ? 1 : 0] || key; }
export function trackText(track) { return language === 'en' ? { ...track, ...englishTracks[track.id] } : track; }
export function challengeText(challenge) { return language === 'en' ? { ...challenge, ...englishChallenges[challenge.id] } : challenge; }

const staticEnglish = {
  'قائمة الأكاديمية': 'Academy navigation', 'إغلاق القائمة': 'Close menu', 'الرئيسية': 'Home', 'ابدأ هنا': 'Start here', 'التعلّم والتطبيق': 'Learn and practice', 'إنجازاتك': 'Your achievements', 'المزايا': 'Benefits', 'الامتحان النهائي': 'Final exam', 'إثبات الإنجاز': 'Achievement credential',
  'المراجعة الذكية': 'Smart review', 'غرفة العمليات': 'Operations room', 'الشهادات والمسارات المهنية': 'Certifications and career paths', 'المركز الاحترافي': 'Professional hub', 'ملاحظاتي': 'My notes', 'المفضلة': 'Favorites', 'البحث': 'Search', 'الإعدادات': 'Settings', 'الملف الشخصي': 'Profile',
  'كل ما تحتاجه للتعلّم، بخطوات واضحة.': 'Everything you need to learn, one clear step at a time.', 'طريقك في الأكاديمية يبدأ هنا.': 'Your Academy journey starts here.', 'رحلة التعلّم تبدأ هنا.': 'Your learning journey starts here.',
  'أقسام الأكاديمية': 'Academy sections', 'الكورسات': 'Courses', 'المختبرات': 'Labs', 'الاختبارات': 'Quizzes', 'الأدوات': 'Tools', 'المتجر': 'Shop',
  'أساس قوي.': 'Strong foundations.', 'طريق واضح.': 'A clear route.', 'تخصصك القادم.': 'Your next specialty.',
  'تعلم الأمن السيبراني خطوة بخطوة: دروس الأساسيات، تطبيقات عملية، امتحان موثق، ثم استكشف المجال الذي تريد التعمق فيه.': 'Learn cybersecurity step by step: foundations lessons, guided practice, a verified exam, then explore the field you want to pursue.',
  'ابدأ الأساسيات': 'Start Foundations', 'شاهد خطة التعلّم': 'View the learning route', 'دروس أساسية': 'foundation lessons', 'امتحان وإثبات إنجاز': 'Exam and credential', 'تخصصات بعد الأساسيات': 'Specialties after Foundations',
  'جرّب مختبراً آمناً بعد الدرس.': 'Try a safe lab after the lesson.', 'افحص طلباً واستجابة HTTP داخل محاكاة قصيرة، ثم اشرح الدليل والقرار المناسب.': 'Inspect a synthetic HTTP request and response, then explain the evidence and the right decision.', 'افتح المختبر ↗': 'Open the lab ↗',
  'تعلّم بالترتيب. اختر تخصصك بثقة.': 'Learn in order. Choose your specialty with confidence.',
  'ابدأ بأساسيات الأمن السيبراني، وثبّت فهمك بامتحان، ثم استكشف المجال الذي يناسبك. كل مرحلة تخبرك بما تتعلمه وما تطبقه بعدها.': 'Start with cybersecurity foundations, verify your understanding in an exam, then explore the field that fits you. Each stage shows what to learn and practice next.',
  'تخصصاتك': 'Your next', 'التالية.': 'specialties.',
  'هذه خرائط المجالات المستمدة من برنامج Biuret Academy. التدريب التمهيدي المتاح واضح، أما الكورسات والمختبرات والامتحانات المتخصصة فسننشرها تدريجياً بعد مراجعتها.': 'These field roadmaps come from the Biuret Academy desktop curriculum. Available introductory practice is marked; specialized courses, labs and exams will be released after review.',
  'بعد إكمال الأساسيات وامتحانها، اختر تخصصك وافتح كورسات برنامج Biuret Academy وتحدياته ومختبراته المتاحة حسب عضويتك. ابدأ بالكورس، ثم طبّق وراجع قبل الانتقال للمرحلة التالية.': 'After Foundations and its exam, choose a specialty and open the Biuret Academy program courses, challenges and labs available to your membership. Start with the course, then practice and review before moving on.',
  'تحديات': 'Practice', 'تدريبية.': 'challenges.', 'هذه التمارين القصيرة لتثبيت الفكرة. اتبع درسَك التالي أولاً، ثم عد إلى التدريب عندما تحتاج تطبيقاً إضافياً.': 'These short exercises reinforce ideas. Follow your next lesson first, then return when you want extra practice.',
  'مختبرات آمنة وموجّهة لتطبيق دروس أساسيات الأمن السيبراني.': 'Safe guided labs for applying the Foundations lessons.',
  'ابدأ بخارطة الأساسيات، ثم انظر إلى خرائط التخصصات بعد إتمام الامتحان.': 'Start with the Foundations roadmap, then explore specializations after the exam.',
  'خمسة عشر تمريناً قصيراً بأدلة وتلميحات وشرح بعد كل إجابة.': 'Fifteen short exercises with evidence, hints and feedback after every answer.',
  'تدريب اليوم الاختياري': 'Optional daily practice', 'بعد درسك الأساسي، جرّب تدريباً قصيراً لتثبيت الفكرة.': 'After your core lesson, try a short exercise to reinforce the idea.',
  'خصص بضع دقائق. أكمل خطوتك التالية. تعلّم شيئاً يبقى معك.': 'Set aside a few minutes. Complete your next step and learn something that stays with you.', 'تابع طريق التعلّم': 'Continue learning',
  'انتقل إلى المحتوى': 'Skip to content', 'القائمة': 'Menu', 'المسارات': 'Paths', 'التحديات': 'Challenges', 'تقدّمك': 'Your progress', 'العضوية': 'Membership', 'الوصول والمشتريات': 'Access & purchases', 'موقع Biuret ↗': 'Biuret site ↗', 'Biuret Academy - الرئيسية': 'Biuret Academy - home', 'تحدي اليوم': 'Daily challenge',
  'كل يوم،': 'Every day,', 'مهارة أمنية': 'sharpen your', 'جديدة.': 'security skills.',
  'تعلّم الأمن السيبراني بالطريقة التي تُشبه العمل الحقيقي: دليل صغير، قرار واضح، وتحدٍّ يأخذ دقائق من يومك.': 'Learn cybersecurity through the kind of decisions real work calls for: a small clue, a clear choice, and a challenge that fits your day.',
  'ابدأ أول تحدٍّ': 'Start the first challenge', 'استكشف المسارات': 'Explore paths', 'مسارات': 'paths', 'تحدّياً عملياً': 'hands-on challenges', 'مناسب للبداية': 'Made for beginners',
  'تحدّي اليوم': 'Daily challenge', 'خطوة صغيرة اليوم. معرفة أقوى غداً.': 'A small step today. Stronger skills tomorrow.', 'المهمة المقترحة لك': 'Your suggested mission', 'افتح التحدّي': 'Open challenge',
  'رحلتك،': 'Your journey,', 'بخطوات واضحة.': 'one clear step at a time.', 'لكل جزء مساحة مستقلة، لتتعلم وتجرّب وتتابع تقدّمك براحة.': 'Each part has its own space to learn, practice, and follow your progress.',
  'ثلاث خرائط تعلّم مرتبة تبدأ من الأساسيات وتصل إلى قرارات أمنية واقعية.': 'A clear Foundations route, followed by specialty roadmaps.',
  'استكشف المسارات ↗': 'Explore paths ↗', 'اثنا عشر تمريناً قصيراً بأدلة وتلميحات وشرح بعد كل إجابة.': 'Twelve short exercises with evidence, hints, and explanations after each answer.',
  'افتح التحديات ↗': 'Open challenges ↗', 'اعرف ما أنجزته، واستمر في بناء عادة تعلّم يومية.': 'See what you have completed and keep building a daily learning habit.', 'تابع تقدّمك ↗': 'View progress ↗',
  'الفضول هو أول': 'Curiosity is your first', 'أداة أمنية.': 'security tool.', 'خصص بضع دقائق. افتح تحدياً. تعلّم شيئاً يبقى معك.': 'Set aside a few minutes. Open a challenge. Learn something that stays with you.', 'ابدأ التعلّم الآن': 'Start learning now',
  'مسارات تعلّم، بخطوات مفهومة.': 'Learning paths, made clear.', 'اختر المجال الذي يثير فضولك. كل مسار يربط المعرفة بقرار عملي قصير.': 'Choose what sparks your curiosity. Each path connects knowledge to a short practical decision.',
  'اختر نقطة': 'Choose your', 'البداية.': 'starting point.', 'ثلاثة مسارات قصيرة. ابدأ من أي مسار، وسيفتح كل تحدٍّ الباب للذي يليه.': 'Three focused paths. Begin anywhere; each challenge opens the next.',
  'من الفكرة إلى': 'From concept to', 'الممارسة.': 'practice.', 'كل مسار يتدرج في أربع خطوات قصيرة، مع شرح واضح وتغذية راجعة بعد المحاولة.': 'Each path moves through four short steps, with clear guidance and feedback after you try.',
  'تعلّم بالمحاولة.': 'Learn by doing.', 'اقرأ الدليل، جرّب إجابتك، ثم افهم السبب. التقدّم يأتي خطوة بخطوة.': 'Read the evidence, try your answer, and understand why. Progress comes one step at a time.',
  'المعرفة تبدأ': 'Knowledge starts', 'بالمحاولة.': 'with practice.', 'اختر تحدّياً، افحص الدليل، ثم اتخذ قرارك. كل تمرين يبني على سابقه.': 'Choose a challenge, inspect the evidence, then make a decision. Each exercise builds on the last.',
  'الكل': 'All', 'الأساسيات': 'Foundations', 'أمان الويب': 'Web security', 'الأدلة الرقمية': 'Digital forensics',
  'تقدّمك، أمام عينيك.': 'See how far you’ve come.', 'كل خطوة تُحسب.': 'Every step counts.', 'تقدّمك اليوم يصنع عادة تعلّم تدوم. شاهد إنجازاتك وحدّد الخطوة التالية.': 'Today’s progress builds a lasting learning habit. See your achievements and choose what is next.',
  'كل خطوة': 'Every step', 'تُحسب.': 'counts.', 'تتبّع رحلتك، وارجع غداً لتكمل ما بدأته.': 'Follow your journey and come back tomorrow to build on it.', 'استمرارية التعلّم': 'Learning streak', 'نقاط الخبرة': 'Experience points', 'تحديات مكتملة': 'Challenges completed', 'سلسلة الأيام': 'Day streak',
  'رحلتك تستحق أن تبقى معك.': 'Your journey is worth keeping.', 'أنشئ حساب Biuret لتزامن إنجازاتك وتكمل من أي جهاز.': 'Create a Biuret account to sync achievements and continue on any device.', 'احفظ تقدّمك بحساب': 'Save progress with an account',
  'خطوتك التالية جاهزة.': 'Your next step is ready.', 'ابدأ بالتحدي التالي المتاح، أو عد إلى المسارات لتختار مجالاً جديداً.': 'Take the next available challenge, or return to paths to explore a new subject.', 'افتح التحدّي التالي ↗': 'Open the next challenge ↗',
  'مساحة صغيرة للتعلّم الكبير.': 'A small space for big learning.', 'موقع Biuret': 'Biuret site', 'سياسة الخصوصية': 'Privacy policy', 'شروط الاستخدام': 'Terms of use',
  'احفظ تقدّمك.': 'Keep your progress.', 'حساب واحد لموقع Biuret والأكاديمية.': 'One account for Biuret and the Academy.', 'تسجيل الدخول': 'Sign in', 'إنشاء حساب': 'Create account', 'الاسم': 'Name', 'البريد الإلكتروني': 'Email address', 'كلمة المرور': 'Password', 'أو أكمل باستخدام': 'Or continue with',
  'باستخدامك للأكاديمية، فإنك توافق على': 'By using the Academy, you agree to the', 'و': 'and',
  'ابدأ بكورس، وتقدّم بخطوات واضحة.': 'Start with a course. Grow one clear step at a time.', 'تسعة دروس في الروابط والهوية والأدلة الرقمية، مع تمارين قصيرة ومكافآت موثقة.': 'Nine lessons on URLs, identity, and digital evidence, with short exercises and verified rewards.', 'استكشف الكورسات ↗': 'Explore courses ↗', 'خارطة مسار أساسيات الأمن السيبراني': 'Cybersecurity Foundations roadmap', 'جارٍ تحميل المحتوى…': 'Loading content…',
  'إغلاق التحدي': 'Close challenge', 'إغلاق نافذة الحساب': 'Close account dialog', 'التنقل الرئيسي': 'Main navigation', 'تصفية التحديات': 'Filter challenges', 'نوع الحساب': 'Account mode', 'تصميم يوضح رحلة التعلم في الأكاديمية': 'Academy learning illustration',
};

const originals = new WeakMap();
const attributes = new WeakMap();
function translateStatic() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest('script,style')) continue;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const original = originals.get(node);
    const value = original.trim();
    const translated = language === 'en' ? staticEnglish[value] : null;
    node.nodeValue = translated ? original.replace(value, translated) : original;
  }
  for (const element of document.querySelectorAll('[aria-label],[placeholder]')) {
    if (!attributes.has(element)) attributes.set(element, { aria: element.getAttribute('aria-label'), placeholder: element.getAttribute('placeholder') });
    const original = attributes.get(element);
    for (const [name, value] of [['aria-label', original.aria], ['placeholder', original.placeholder]]) {
      if (value == null) continue;
      element.setAttribute(name, language === 'en' ? staticEnglish[value] || value : value);
    }
  }
  for (const element of document.querySelectorAll('.page-header-context strong[data-ar][data-en]')) {
    element.textContent = element.dataset[language];
  }
  const page = document.querySelector('.site-shell')?.dataset.page || 'home';
  const pageTitles = language === 'en' ? { home: 'Biuret Academy — A clear cybersecurity learning route', paths: 'Learning paths', path: 'Learning path', challenges: 'Challenges', progress: 'Your progress', course: 'Course', lesson: 'Lesson', lab: 'Guided lab', courses: 'Courses', labs: 'Labs', quizzes: 'Quizzes', tools: 'Tools', shop: 'Shop', membership: 'Access & purchases', exam: 'Foundations exam', 'path-exam': 'Specialty exam', certificate: 'Achievement credential', admin: 'Credential operations', pilot: 'Learning journey trial', review: 'Smart review', operations: 'Operations room', operation: 'Operation scenario', certifications: 'Certifications', professional: 'Professional hub', notes: 'My notes', favorites: 'Favorites', search: 'Search', settings: 'Settings', profile: 'Profile', 'library-course': 'Program course', 'library-lesson': 'Program lesson', 'practice-quiz': 'Practice quiz', 'practice-lab': 'Practice lab', 'practice-challenge': 'Practice challenge', 'soc-investigation': 'SOC investigation lab' } : { home: 'Biuret Academy — طريق واضح لتعلّم الأمن السيبراني', paths: 'المسارات', path: 'مسار التعلم', challenges: 'التحديات', progress: 'تقدّمك', course: 'الكورس', lesson: 'الدرس', lab: 'مختبر عملي', courses: 'الكورسات', labs: 'المختبرات', quizzes: 'الاختبارات', tools: 'الأدوات', shop: 'المتجر', membership: 'الوصول والمشتريات', exam: 'امتحان الأساسيات', 'path-exam': 'امتحان التخصص', certificate: 'إثبات الإنجاز', admin: 'إدارة الإنجازات', pilot: 'تجربة رحلة التعلم', review: 'المراجعة الذكية', operations: 'غرفة العمليات', operation: 'سيناريو العمليات', certifications: 'الشهادات', professional: 'المركز الاحترافي', notes: 'ملاحظاتي', favorites: 'المفضلة', search: 'البحث', settings: 'الإعدادات', profile: 'الملف الشخصي', 'library-course': 'كورس البرنامج', 'library-lesson': 'درس البرنامج', 'practice-quiz': 'اختبار تدريبي', 'practice-lab': 'مختبر تدريبي', 'practice-challenge': 'تحدي تدريبي', 'soc-investigation': 'مختبر تحقيق SOC' };
  document.title = page === 'home' ? pageTitles.home : `${pageTitles[page] || page} — Biuret Academy`;
  const learningTitle = document.querySelector('#learning-main h1')?.textContent;
  if ((page === 'course' || page === 'lesson') && learningTitle) document.title = `${learningTitle} — Biuret Academy`;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  const toggle = document.querySelector('#language-toggle');
  if (toggle) { toggle.textContent = language === 'ar' ? 'EN' : 'عربي'; toggle.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); toggle.setAttribute('aria-pressed', String(language === 'en')); }
}

export function applyLanguage() { translateStatic(); }
export function setPageHeaderTitle(title) {
  const heading = document.querySelector('.page-header-context strong');
  if (!heading || !title?.ar || !title?.en) return;
  heading.dataset.ar = title.ar;
  heading.dataset.en = title.en;
  heading.textContent = title[language];
  document.title = `${title[language]} — Biuret Academy`;
}
export function toggleLanguage() {
  language = language === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem(KEY, language); } catch {}
  translateStatic();
}
