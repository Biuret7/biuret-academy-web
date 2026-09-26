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
]) {
  const main = '    <main id="main"><div id="learning-main"><section class="section-frame learning-empty"><p>جارٍ تحميل المحتوى…</p></section></div></main>';
  const html = (template.slice(0, mainStart) + main + template.slice(mainEnd))
    .replace('data-page="paths"', `data-page="${page}"`)
    .replace(/  <link rel="canonical"[^>]+>\r?\n/, '')
    .replace(/  <meta property="og:url"[^>]+>\r?\n/, '')
    .replace('<title>المسارات — Biuret Academy</title>', `<title>${title}</title>`)
    .replace('Biuret Academy — تعلّم الأمن السيبراني بالتحدي', title)
    .replace('Biuret Academy: تحديات قصيرة وعملية لتعلّم أساسيات الأمن السيبراني، أمان الويب، والأدلة الرقمية، بخطوات تتقدم كل يوم.', description)
    .replace('ثلاثة مسارات، تحديات عملية قصيرة، ومهمة جديدة كل يوم.', description)
    .replace('aria-current="page"', '');
  writeFileSync(new URL(`../${page}.html`, import.meta.url), html);
}
