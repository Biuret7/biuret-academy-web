import { currentLanguage } from './i18n.js?v=20261008-ux1';

// Navigation preferences contain no learning or membership authority.
const en = () => currentLanguage() === 'en';
const text = (ar, english) => en() ? english : ar;
const searchable = value => value.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').toLocaleLowerCase().trim();
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
    const query = searchable(search.value);
    let count = 0;
    for (const group of groups) {
      const links = [...group.querySelectorAll('a')];
      links.forEach(link => { link.hidden = Boolean(query) && !searchable(link.textContent).includes(query); if (!link.hidden) count++; });
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
if (['lesson', 'library-lesson', 'free-studio'].includes(document.querySelector('.site-shell')?.dataset.page)) {
  const controls = document.createElement('div'); controls.className = 'reading-controls';
  const focus = document.createElement('button'); focus.type = 'button'; focus.className = 'button button-text'; focus.setAttribute('aria-pressed', 'false');
  const size = document.createElement('button'); size.type = 'button'; size.className = 'button button-text'; size.setAttribute('aria-pressed', 'false');
  controls.append(focus, size); document.querySelector('main')?.prepend(controls);
  const labels = () => { focus.textContent = text('وضع التركيز', 'Focus mode'); size.textContent = text('نص أكبر', 'Larger text'); };
  focus.addEventListener('click', () => { const active = document.body.classList.toggle('reading-focus'); focus.setAttribute('aria-pressed', String(active)); });
  size.addEventListener('click', () => { const active = document.body.classList.toggle('reading-large'); size.setAttribute('aria-pressed', String(active)); });
  document.querySelector('#language-toggle')?.addEventListener('click', () => setTimeout(labels, 0)); labels();
}

// Discovery remains visible without repeating a second page-sized introduction.
const page = document.querySelector('.site-shell')?.dataset.page;
if (['home','paths','courses','labs','quizzes','challenges','tools','membership'].includes(page)) {
  const welcome=document.createElement('section');welcome.className='free-experience-entry';
  welcome.setAttribute('aria-label', text('بداية مجانية', 'Free starting point'));
  const localize=()=>{welcome.setAttribute('aria-label',text('بداية مجانية','Free starting point'));welcome.innerHTML=`<div><strong>${text('ابدأ مجاناً: ٩ دروس ← تطبيق عملي ← امتحان','Start free: 9 lessons → practical assessment → exam')}</strong><p>${text('هذا طريق شهادة الأساسيات. ٢٦ درساً إضافياً وتدريب المساحة للتعمق الاختياري.','This is the Foundations credential route. 26 additional lessons and studio practice offer optional depth.')}</p></div><div class="free-entry-actions"><a class="button button-primary" href="path.html?id=foundations">${text('ابدأ مسار الشهادة','Start the credential path')} <span aria-hidden="true">↗</span></a><a class="button button-outline" href="free-studio.html">${text('تدريب محلي اختياري','Optional local practice')} <span aria-hidden="true">↗</span></a></div>`;};
  const main=document.querySelector('main');
  if(page==='home') {const hero=main?.querySelector('.hero');if(hero)hero.after(welcome);else main?.prepend(welcome);}
  else main?.append(welcome);
  localize();document.querySelector('#language-toggle')?.addEventListener('click',()=>setTimeout(localize,0));
}

// A single filter spans Foundations and the full library. It never changes access.
if (['courses','labs','quizzes','tools','challenges','operations'].includes(page)) {
  const main = document.querySelector('main');
  const toolbar = document.createElement('form');
  toolbar.className = 'catalog-finder section-frame'; toolbar.setAttribute('role', 'search');
  const label = document.createElement('label');
  const input = document.createElement('input'); input.type = 'search'; input.id = 'catalog-find'; input.autocomplete = 'off';
  label.htmlFor = input.id;
  const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'catalog-reset';
  const result = document.createElement('p'); result.className = 'catalog-find-status'; result.setAttribute('role','status');
  const empty = document.createElement('div'); empty.className = 'catalog-find-empty'; empty.hidden = true;
  toolbar.append(label, input, reset, result, empty);
  const selectors = '.catalog-card,.library-card,.quiz-group,.tool-guide,.challenge-card';
  const update = () => {
    if (!main) return;
    const cards = [...main.querySelectorAll(selectors)];
    const hero = main.querySelector('.catalog-hero,.page-heading,.hero');
    if (hero && hero.nextElementSibling !== toolbar) hero.after(toolbar);
    else if (!toolbar.isConnected && cards.length) cards[0].parentElement.before(toolbar);
    const query = searchable(input.value);
    let found = 0;
    cards.forEach(card => { card.hidden = !!query && !searchable(card.textContent).includes(query); if (!card.hidden) found++; });
    main.classList.toggle('catalog-is-filtered', !!query);
    main.querySelectorAll('.library-section').forEach(section => {
      const items = [...section.querySelectorAll(selectors)];
      if (items.length) section.hidden = !!query && items.every(card => card.hidden);
    });
    const message = text(`${found} من ${cards.length} نتيجة`, `${found} of ${cards.length} results`);
    if (result.textContent !== message) result.textContent = message;
    reset.hidden = !input.value;
    empty.hidden = !query || found > 0;
  };
  const localize = () => {
    label.textContent = text('ابحث في محتوى هذه الصفحة', 'Find content on this page');
    input.placeholder = text('اسم، موضوع، أو مهارة…', 'Name, topic or skill…');
    reset.textContent = text('مسح البحث', 'Clear search');
    empty.textContent = text('لا توجد نتائج مطابقة. جرّب كلمة أقصر أو امسح البحث لعرض الكل.', 'No matching results. Try a shorter term or clear the search to show everything.');
    toolbar.setAttribute('aria-label', label.textContent); update();
  };
  toolbar.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('input', update);
  const clear = () => { input.value = ''; update(); input.focus(); };
  reset.addEventListener('click', clear);
  input.addEventListener('keydown', event => { if(event.key==='Escape') { event.preventDefault(); clear(); } });
  // Catalogs are populated asynchronously and translated without navigation.
  if (main) new MutationObserver(update).observe(main,{childList:true,subtree:true});
  document.querySelector('#language-toggle')?.addEventListener('click',()=>setTimeout(localize,0));
  localize();
}

// Anchor destinations remain visible below the header and receive keyboard focus.
const header = document.querySelector('.topbar');
if (header) new ResizeObserver(() => {
  document.documentElement.style.setProperty('--academy-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
}).observe(header);
document.querySelector('main')?.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]');
  const target = anchor && document.getElementById(anchor.getAttribute('href').slice(1));
  if (!target) return;
  target.tabIndex = -1;
  requestAnimationFrame(() => target.focus({preventScroll:true}));
});
