import { readFileSync, writeFileSync } from 'node:fs';

// Reuse the existing account and navigation shell until the static pages move
// to a shared component system. The generated pages are committed for Pages.
const template = readFileSync(new URL('../paths.html', import.meta.url), 'utf8');
const mainStart = template.indexOf('    <main id="main">');
const mainEnd = template.indexOf('    </main>', mainStart) + '    </main>'.length;
if (mainStart < 0 || mainEnd < mainStart) throw new Error('Could not find page main area');

for (const [page, title, description] of [
  ['course', 'الكورس — Biuret Academy', 'تعلّم أساسيات الأمن السيبراني خطوة بخطوة في كورسات Biuret Academy.'],
  ['lesson', 'الدرس — Biuret Academy', 'دروس تفاعلية قصيرة لتعلّم الأمن السيبراني في Biuret Academy.'],
  ['exam', 'امتحان المسار — Biuret Academy', 'امتحان أساسيات الأمن السيبراني بعد إكمال الدروس الموثقة.'],
  ['certificate', 'إثبات الإنجاز — Biuret Academy', 'عرض إثبات الإنجاز والتحقق منه عبر Biuret Academy.'],
  ['admin', 'إدارة الإنجازات — Biuret Academy', 'إدارة إثباتات الإنجاز بحساب Biuret المصرح له.'],
  ['membership', 'العضوية — Biuret Academy', 'خطط عضوية Biuret Academy ومزايا التعلّم المتاحة والمخطط لها.'],
  ['lab', 'مختبر عملي — Biuret Academy', 'مختبرات آمنة وموجّهة لتطبيق دروس أساسيات الأمن السيبراني.'],
  ['courses', 'الكورسات — Biuret Academy', 'كورسات أساسيات الأمن السيبراني مرتبة بخطوات واضحة.'],
  ['labs', 'المختبرات — Biuret Academy', 'مختبرات تفاعلية آمنة لتطبيق مهارات الأمن السيبراني.'],
  ['quizzes', 'الاختبارات — Biuret Academy', 'اختبارات فهم قصيرة وامتحان أساسيات الأمن السيبراني.'],
  ['tools', 'الأدوات — Biuret Academy', 'دليل مبسط لأدوات الأمن السيبراني وتطبيقها في بيئة تدريبية.'],
  ['shop', 'المتجر — Biuret Academy', 'استكشف الاستخدامات المخطط لها لعملات Biuret داخل الأكاديمية.'],
]) {
  const assessment = page === 'exam' || page === 'certificate';
  const catalog = ['courses', 'labs', 'quizzes', 'tools', 'shop'].includes(page);
  const main = catalog ? '    <main id="main"><div id="catalog-main"></div></main>' : page === 'lab' ? '    <main id="main"><div id="lab-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : page === 'membership' ? '    <main id="main"><div id="membership-main" class="membership-main section-frame" aria-live="polite"></div></main>' : page === 'admin' ? '    <main id="main"><div id="admin-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : assessment ? '    <main id="main"><div id="assessment-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : '    <main id="main"><div id="learning-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>';
  const activeResource = ({ course: 'courses', lesson: 'courses', lab: 'labs', exam: 'quizzes' })[page] || page;
  const html = (template.slice(0, mainStart) + main + template.slice(mainEnd))
    .replace('data-page="paths"', `data-page="${page}"`)
    .replace(/  <link rel="canonical"[^>]+>\r?\n/, catalog ? `  <link rel="canonical" href="https://academy.biuret.dev/${page}.html">\n` : '')
    .replace(/  <meta property="og:url"[^>]+>\r?\n/, catalog ? `  <meta property="og:url" content="https://academy.biuret.dev/${page}.html">\n` : '')
    .replace('<title>المسارات — Biuret Academy</title>', `<title>${title}</title>`)
    .replace('Biuret Academy — تعلّم الأمن السيبراني بالتحدي', title)
    .replace('Biuret Academy: تحديات قصيرة وعملية لتعلّم أساسيات الأمن السيبراني، أمان الويب، والأدلة الرقمية، بخطوات تتقدم كل يوم.', description)
    .replace('ثلاثة مسارات، تحديات عملية قصيرة، ومهمة جديدة كل يوم.', description)
    .replace('aria-current="page"', '')
    .replace(`data-resource="${activeResource}"`, `data-resource="${activeResource}" aria-current="page"`)
    .replace('href="membership.html">العضوية</a>', page === 'membership' ? 'href="membership.html" aria-current="page">العضوية</a>' : 'href="membership.html">العضوية</a>')
    .replace('</head>', catalog ? '  <script type="module" src="catalog.js?v=20260928-5"></script>\n</head>' : assessment ? '  <script type="module" src="assessment.js?v=20260928-5"></script>\n</head>' : page === 'admin' ? '  <meta name="robots" content="noindex, nofollow">\n  <script type="module" src="admin.js?v=20260928-5"></script>\n</head>' : page === 'membership' ? '  <script type="module" src="membership.js?v=20260928-5"></script>\n</head>' : page === 'lab' ? '  <script type="module" src="lab.js?v=20260928-5"></script>\n</head>' : '</head>');
  writeFileSync(new URL(`../${page}.html`, import.meta.url), html);
}
