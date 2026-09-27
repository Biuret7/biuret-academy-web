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
]) {
  const assessment = page === 'exam' || page === 'certificate';
  const main = page === 'admin' ? '    <main id="main"><div id="admin-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : assessment ? '    <main id="main"><div id="assessment-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>' : '    <main id="main"><div id="learning-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>';
  const html = (template.slice(0, mainStart) + main + template.slice(mainEnd))
    .replace('data-page="paths"', `data-page="${page}"`)
    .replace(/  <link rel="canonical"[^>]+>\r?\n/, '')
    .replace(/  <meta property="og:url"[^>]+>\r?\n/, '')
    .replace('<title>المسارات — Biuret Academy</title>', `<title>${title}</title>`)
    .replace('Biuret Academy — تعلّم الأمن السيبراني بالتحدي', title)
    .replace('Biuret Academy: تحديات قصيرة وعملية لتعلّم أساسيات الأمن السيبراني، أمان الويب، والأدلة الرقمية، بخطوات تتقدم كل يوم.', description)
    .replace('ثلاثة مسارات، تحديات عملية قصيرة، ومهمة جديدة كل يوم.', description)
    .replace('aria-current="page"', '')
    .replace('</head>', assessment ? '  <script type="module" src="assessment.js?v=20260927-7"></script>\n</head>' : page === 'admin' ? '  <meta name="robots" content="noindex, nofollow">\n  <script type="module" src="admin.js?v=20260927-7"></script>\n</head>' : '</head>');
  writeFileSync(new URL(`../${page}.html`, import.meta.url), html);
}
