import { currentLanguage } from './i18n.js?v=20261006-quality1';

// Navigation preferences contain no learning or membership authority.
const en = () => currentLanguage() === 'en';
const text = (ar, english) => en() ? english : ar;
const sidebar = document.querySelector('.sidebar-nav');
const groups = [...document.querySelectorAll('.sidebar-group')];
let preference = {};
try { preference = JSON.parse(localStorage.getItem('academy-navigation') || '{}'); } catch {}
for (const [index, group] of groups.entries()) {
  const heading = group.querySelector('h2');
  const links = [...group.querySelectorAll('a')];
  const wrapper = document.createElement('div');
  wrapper.id = `navigation-group-${index}`;
  links.forEach(link => wrapper.append(link));
  group.append(wrapper);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'navigation-disclosure';
  toggle.setAttribute('aria-controls', wrapper.id);
  while (heading.firstChild) toggle.append(heading.firstChild);
  heading.append(toggle);
  const active = links.some(link => link.hasAttribute('aria-current'));
  let expanded = active || (preference[index] ?? index < 2);
  const update = () => { wrapper.hidden = !expanded; toggle.setAttribute('aria-expanded', String(expanded)); toggle.dataset.expanded = String(expanded); };
  toggle.addEventListener('click', () => {
    expanded = !expanded; preference[index] = expanded; update();
    try { localStorage.setItem('academy-navigation', JSON.stringify(preference)); } catch {}
  });
  update();
}
if (sidebar) {
  const search = document.createElement('input');
  search.type = 'search'; search.className = 'navigation-search';
  const status = document.createElement('p'); status.className = 'navigation-search-status'; status.setAttribute('role', 'status'); status.hidden = true;
  sidebar.before(search, status);
  const filter = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const group of groups) {
      const links = [...group.querySelectorAll('a')];
      links.forEach(link => { link.hidden = Boolean(query) && !link.textContent.toLocaleLowerCase().includes(query); if (!link.hidden) count++; });
      group.hidden = !links.some(link => !link.hidden);
      const toggle = group.querySelector('button');
      toggle.disabled = Boolean(query);
      toggle.setAttribute('aria-expanded', query ? 'true' : toggle.dataset.expanded);
      group.querySelector('[id^="navigation-group"]').hidden = query ? false : toggle.dataset.expanded !== 'true';
    }
    status.hidden = !query;
    status.textContent = count ? text(`${count} ${count === 1 ? 'صفحة' : 'صفحات'}`, `${count} ${count === 1 ? 'page' : 'pages'}`) : text('لا توجد صفحات مطابقة.', 'No matching pages.');
  };
  search.addEventListener('input', filter);
  search.addEventListener('keydown', event => { if (event.key === 'Escape') { search.value = ''; filter(); } });
  const localize = () => {
    search.placeholder = text('ابحث عن صفحة…', 'Find a page…');
    search.setAttribute('aria-label', text('البحث في قائمة الأكاديمية', 'Search Academy navigation'));
    filter();
  };
  document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(localize, 0));
  localize();
}

// Reading controls are available only within an actual lesson.
if (['lesson', 'library-lesson'].includes(document.querySelector('.site-shell')?.dataset.page)) {
  const controls = document.createElement('div'); controls.className = 'reading-controls';
  const focus = document.createElement('button'); focus.type = 'button'; focus.className = 'button button-text'; focus.setAttribute('aria-pressed', 'false');
  const size = document.createElement('button'); size.type = 'button'; size.className = 'button button-text'; size.setAttribute('aria-pressed', 'false');
  controls.append(focus, size); document.querySelector('main')?.prepend(controls);
  const labels = () => { focus.textContent = text('وضع التركيز', 'Focus mode'); size.textContent = text('نص أكبر', 'Larger text'); };
  focus.addEventListener('click', () => { const active = document.body.classList.toggle('reading-focus'); focus.setAttribute('aria-pressed', String(active)); });
  size.addEventListener('click', () => { const active = document.body.classList.toggle('reading-large'); size.setAttribute('aria-pressed', String(active)); });
  document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(labels, 0)); labels();
}
