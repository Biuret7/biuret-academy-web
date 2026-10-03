import { readFileSync, writeFileSync } from 'node:fs';
import { pageContext } from './page-context.mjs';

// Reuse the existing account and navigation shell until the static pages move
// to a shared component system. The generated pages are committed for Pages.
const template = readFileSync(new URL('../paths.html', import.meta.url), 'utf8')
  .replace(/^  <script type="module" src="desktop\.js[^\n]+\n/m, '');
const mainStart = template.indexOf('    <main id="main">');
const mainEnd = template.indexOf('    </main>', mainStart) + '    </main>'.length;
if (mainStart < 0 || mainEnd < mainStart) throw new Error('Could not find page main area');

for (const [page, title, description] of [
  ['course', 'الكورس — Biuret Academy', 'تعلّم أساسيات الأمن السيبراني خطوة بخطوة في كورسات Biuret Academy.'],
  ['lesson', 'الدرس — Biuret Academy', 'دروس تفاعلية قصيرة لتعلّم الأمن السيبراني في Biuret Academy.'],
  ['exam', 'امتحان المسار — Biuret Academy', 'امتحان أساسيات الأمن السيبراني بعد إكمال الدروس الموثقة.'],
  ['path-exam', 'امتحان التخصص — Biuret Academy', 'امتحان مسار تخصصي وإثبات إنجازه بعد إكمال دروسه.'],
  ['course-exam', 'امتحان الدورة — Biuret Academy', 'امتحان الدورة بعد إكمال دروسها.'],
  ['practical', 'التقييم العملي — Biuret Academy', 'تقييم عملي آمن لمسار التعلم.'],
  ['certificate', 'إثبات الإنجاز — Biuret Academy', 'عرض إثبات الإنجاز والتحقق منه عبر Biuret Academy.'],
  ['admin', 'إدارة الإنجازات — Biuret Academy', 'إدارة إثباتات الإنجاز بحساب Biuret المصرح له.'],
  ['membership', 'العضوية — Biuret Academy', 'خطط عضوية Biuret Academy ومزايا التعلّم المتاحة والمخطط لها.'],
  ['lab', 'مختبر عملي — Biuret Academy', 'مختبرات آمنة وموجّهة لتطبيق دروس أساسيات الأمن السيبراني.'],
  ['courses', 'الكورسات — Biuret Academy', 'كورسات أساسيات الأمن السيبراني مرتبة بخطوات واضحة.'],
  ['labs', 'المختبرات — Biuret Academy', 'مختبرات تفاعلية آمنة لتطبيق مهارات الأمن السيبراني.'],
  ['quizzes', 'الاختبارات التدريبية — Biuret Academy', 'اختبارات تدريبية مستقلة عن امتحانات إكمال الدورات في Biuret Academy.'],
  ['tools', 'الأدوات — Biuret Academy', 'دليل مبسط لأدوات الأمن السيبراني وتطبيقها في بيئة تدريبية.'],
  ['shop', 'المتجر — Biuret Academy', 'استكشف الاستخدامات المخطط لها لعملات Biuret داخل الأكاديمية.'],
  ['review', 'المراجعة الذكية — Biuret Academy', 'راجع دروسك ومفاهيمك الأساسية بانتظام.'],
  ['operations', 'غرفة العمليات — Biuret Academy', 'ستة سيناريوهات تدريبية لتحليل الحوادث الأمنية.'],
  ['operation', 'سيناريو العمليات — Biuret Academy', 'حلل الأدلة واتخذ القرار في سيناريو أمني تدريبي.'],
  ['certifications', 'الشهادات — Biuret Academy', 'خارطة الشهادات والمسارات المهنية في الأمن السيبراني.'],
  ['professional', 'المركز الاحترافي — Biuret Academy', 'مشاريع ومهارات وخطوات مهنية عملية.'],
  ['notes', 'ملاحظاتي — Biuret Academy', 'احفظ ملاحظاتك الخاصة أثناء التعلم.'],
  ['favorites', 'المفضلة — Biuret Academy', 'ارجع إلى الدروس التي حفظتها.'],
  ['search', 'البحث — Biuret Academy', 'ابحث في كورسات ودروس برنامج Biuret Academy.'],
  ['settings', 'الإعدادات — Biuret Academy', 'خصص تجربة التعلم واللغة.'],
  ['profile', 'الملف الشخصي — Biuret Academy', 'ملفك وتقدمك في Biuret Academy.'],
  ['library-course', 'كورس البرنامج — Biuret Academy', 'دروس الكورس المستوردة من برنامج Biuret Academy.'],
  ['library-lesson', 'درس البرنامج — Biuret Academy', 'محتوى الدرس المستورد من برنامج Biuret Academy.'],
  ['practice-quiz', 'اختبار تدريبي — Biuret Academy', 'اختبر فهمك في مكتبة التدريب.'],
  ['practice-lab', 'مختبر تدريبي — Biuret Academy', 'حلل عينة صناعية في مختبر تدريبي.'],
  ['practice-challenge', 'تحدي تدريبي — Biuret Academy', 'تحدي فهم إضافي من برنامج الأكاديمية.'],
]) {
  const assessment = page === 'exam' || page === 'certificate';
  const catalog = ['courses', 'labs', 'quizzes', 'tools', 'shop'].includes(page);
  const desktop = ['review', 'operations', 'operation', 'certifications', 'professional', 'notes', 'favorites', 'search', 'settings', 'profile', 'library-course', 'library-lesson', 'practice-quiz', 'practice-lab', 'practice-challenge'].includes(page);
  const main = desktop ? '    <main id="main"><div id="desktop-main" aria-live="polite"></div></main>' : catalog ? '    <main id="main"><div id="catalog-main"></div></main>' : page === 'path-exam' ? '    <main id="main"><div id="path-assessment-main" aria-live="polite"></div></main>' : page === 'course-exam' ? '    <main id="main"><div id="course-assessment-main" aria-live="polite"></div></main>' : page === 'practical' ? '    <main id="main"><div id="practical-main" aria-live="polite"></div></main>' : page === 'lab' ? '    <main id="main"><div id="lab-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : page === 'membership' ? '    <main id="main"><div id="membership-main" class="membership-main section-frame" aria-live="polite"></div></main>' : page === 'admin' ? '    <main id="main"><div id="admin-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : assessment ? '    <main id="main"><div id="assessment-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : '    <main id="main"><div id="learning-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>';
  const activeSection = ({ course: 'courses', lesson: 'courses', lab: 'labs', 'library-course': 'courses', 'library-lesson': 'courses', 'course-exam': 'courses', practical: 'paths', 'practice-quiz': 'quizzes', 'practice-lab': 'labs', 'practice-challenge': 'challenges', operation: 'operations', 'path-exam': 'paths' })[page] || page;
  const catalogAssetVersion = page === 'quizzes' ? '20261003-2' : '20261003-1';
  const html = (template.slice(0, mainStart) + main + template.slice(mainEnd))
    .replace('data-page="paths"', `data-page="${page}"`)
    .replace(/<div class="page-header-context">[\s\S]*?<\/div>/, pageContext(page))
    .replace(/  <link rel="canonical"[^>]+>\r?\n/, catalog ? `  <link rel="canonical" href="https://academy.biuret.dev/${page}.html">\n` : '')
    .replace(/  <meta property="og:url"[^>]+>\r?\n/, catalog ? `  <meta property="og:url" content="https://academy.biuret.dev/${page}.html">\n` : '')
    .replace('<title>المسارات — Biuret Academy</title>', `<title>${title}</title>`)
    .replace('Biuret Academy — تعلّم الأمن السيبراني بالتحدي', title)
    .replace('Biuret Academy: تحديات قصيرة وعملية لتعلّم أساسيات الأمن السيبراني، أمان الويب، والأدلة الرقمية، بخطوات تتقدم كل يوم.', description)
    .replace('ثلاثة مسارات، تحديات عملية قصيرة، ومهمة جديدة كل يوم.', description)
    .replace('href="paths.html" aria-current="page"', 'href="paths.html"')
    .replace(`href="${activeSection}.html"`, `href="${activeSection}.html" aria-current="page"`)
    .replace('</head>', desktop ? '  <script type="module" src="desktop.js?v=20261004-1"></script>\n</head>' : catalog ? `  <script type="module" src="catalog.js?v=${catalogAssetVersion}"></script>\n${page === 'shop' ? '' : `  <script type="module" src="desktop.js?v=20261004-1"></script>\n`}</head>` : page === 'path-exam' ? '  <script type="module" src="path-assessment.js?v=20261004-1"></script>\n</head>' : page === 'course-exam' ? '  <script type="module" src="course-assessment.js?v=20261003-2"></script>\n</head>' : page === 'practical' ? '  <script type="module" src="practical-assessment.js?v=20261004-1"></script>\n</head>' : assessment ? '  <script type="module" src="assessment.js?v=20261004-1"></script>\n</head>' : page === 'admin' ? '  <meta name="robots" content="noindex, nofollow">\n  <script type="module" src="admin.js?v=20260929-1"></script>\n</head>' : page === 'membership' ? '  <script type="module" src="membership.js?v=20260929-1"></script>\n</head>' : page === 'lab' ? '  <script type="module" src="lab.js?v=20260929-1"></script>\n</head>' : '</head>');
  writeFileSync(new URL(`../${page}.html`, import.meta.url), html);
}

const desktop = JSON.parse(readFileSync(new URL('../content/desktop-catalog.json', import.meta.url), 'utf8'));
const oldSitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const urls = new Set([...oldSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
for (const page of ['review', 'operations', 'certifications', 'professional', 'notes', 'favorites', 'search', 'settings', 'profile']) {
  urls.add(`https://academy.biuret.dev/${page}.html`);
}
for (const path of ['path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc', 'path_appsec', 'path_mobile', 'path_threat_intel', 'path_malware']) {
  urls.add(`https://academy.biuret.dev/path-exam.html?id=${path}`);
  urls.add(`https://academy.biuret.dev/practical.html?id=${path}`);
}
urls.add('https://academy.biuret.dev/practical.html?id=foundations');
for (const course of desktop.categories) {
  urls.add(`https://academy.biuret.dev/library-course.html?id=${course.id}`);
  urls.add(`https://academy.biuret.dev/course-exam.html?order=${course.order}`);
  for (const lesson of course.lessons) urls.add(`https://academy.biuret.dev/library-lesson.html?id=${lesson.id}`);
}
writeFileSync(new URL('../sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((url) => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`);
