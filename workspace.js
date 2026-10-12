import { workspaces, parseWorkspace, workspaceHref, activeTab } from './workspace-model.js?v=20261012-easy1';
import { academyPaths } from './path-catalog-data.js?v=20261012-easy1';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261012-easy1';
import { user } from './auth.js?v=20261012-easy1';
import { fullName } from './full-name.js?v=20261012-easy1';

const root = document.querySelector('#workspace-main');
if (root) {
  root.innerHTML = '<div class="workspace-controls"><div class="workspace-trail"><button id="workspace-back" type="button"></button><a id="workspace-path"></a><span id="workspace-location" aria-live="polite"></span></div><div class="workspace-tabs" role="navigation"></div></div><div class="workspace-surface"><div class="workspace-loading" role="status"></div><iframe id="workspace-content" title="محتوى الأكاديمية"></iframe></div>';
  const frame = root.querySelector('iframe'), tabs = root.querySelector('.workspace-tabs'), busy = root.querySelector('.workspace-loading');
  const loadText = document.createElement('span'), retry = document.createElement('button');
  retry.type = 'button'; retry.className = 'button button-outline'; retry.hidden = true; busy.append(loadText, retry);
  const trail = root.querySelector('#workspace-path'), locationLabel = root.querySelector('#workspace-location'), back = root.querySelector('#workspace-back');
  let route = parseWorkspace(location.href), loaded = '', childTitle = '', owner = null, languageTimer, loadTimer;
  let depth = Number.isSafeInteger(history.state?.academyWorkspaceDepth) ? history.state.academyWorkspaceDepth : 0;
  const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
  const titleOf = value => value[currentLanguage() === 'en' ? 1 : 0];
  const pathOf = () => academyPaths.find(p => p.id === route.path);
  function controls() {
    const focusedHref = tabs.contains(document.activeElement) ? document.activeElement.href : null;
    const config = workspaces[route.workspace], path = pathOf();
    back.textContent = tr('رجوع', 'Back'); back.hidden = depth < 1;
    back.setAttribute('aria-label', tr('العودة إلى الخطوة السابقة', 'Return to the previous step'));
    trail.hidden = !path;
    if (path) { trail.textContent = path.title[currentLanguage()]; trail.href = `learn.html?path=${path.id}`; }
    locationLabel.textContent = childTitle || titleOf(config.title);
    locationLabel.hidden = Boolean(path && locationLabel.textContent === trail.textContent);
    frame.title = `${titleOf(config.title)} — ${childTitle || tr('محتوى الأكاديمية', 'Academy content')}`;
    if (retry.hidden) loadText.textContent = tr('جارٍ فتح المحتوى…', 'Opening content…');
    retry.textContent = tr('إعادة المحاولة', 'Try again');
    tabs.setAttribute('aria-label', tr('أقسام هذه المساحة', 'Sections of this workspace'));
    const items = path && route.workspace === 'learn' ? [['path', 'نظرة عامة', 'Overview', ''], ['path', 'الدورات', 'Courses', '#path-course'], ['path', 'التطبيقات', 'Practice', '#path-quiz'], ['path', 'الامتحان والشهادة', 'Exam & certificate', '#path-assessment']] : config.tabs;
    tabs.replaceChildren(...items.map(([screen, ar, en, hash = '']) => {
      const a = document.createElement('a'); a.textContent = tr(ar, en);
      a.href = path && route.workspace === 'learn' ? `learn.html?path=${path.id}${hash}` : `${route.workspace}.html?screen=${screen}`;
      const section = ['course', 'lesson', 'library-course', 'library-lesson'].includes(route.screen) ? '#path-course' : ['exam', 'path-exam', 'course-exam', 'practical', 'certificate'].includes(route.screen) ? '#path-assessment' : '#path-quiz';
      const selected = path ? route.screen === 'path' ? location.hash === hash : section === hash : activeTab(route.screen) === screen;
      if (selected) a.setAttribute('aria-current', 'page');
      return a;
    }));
    if (path) { const all = document.createElement('a'); all.textContent = tr('كل المسارات', 'All paths'); all.href = 'learn.html'; all.className = 'workspace-all'; tabs.append(all); }
    if (focusedHref) [...tabs.querySelectorAll('a')].find(a => a.href === focusedHref)?.focus({ preventScroll: true });
    setPageHeaderTitle({ ar: childTitle || config.title[0], en: childTitle || config.title[1] });
  }
  function mount(force = false) {
    const requested = new URL(route.child, location.href);
    if (requested.href.split('#')[0] !== loaded.split('#')[0] || force) childTitle = '';
    controls();
    const nextOwner = user()?.$id || null;
    if (!nextOwner || !fullName(user()?.name)) { clearTimeout(loadTimer); frame.removeAttribute('src'); loaded = ''; owner = null; return; }
    const childURL = new URL(route.child, location.href);
    if (!force && loaded && loaded.split('#')[0] === childURL.href.split('#')[0] && owner === nextOwner) {
      frame.contentWindow.postMessage({ channel: 'biuret-workspace', type: 'anchor', hash: childURL.hash || '#' }, location.origin);
      return;
    }
    const replacing = Boolean(loaded);
    owner = nextOwner; loaded = childURL.href; childTitle = ''; busy.hidden = false;
    root.dataset.state = 'loading';
    retry.hidden = true; frame.inert = true; frame.setAttribute('aria-busy', 'true'); clearTimeout(loadTimer);
    loadTimer = setTimeout(() => { root.dataset.state = 'error'; loadText.textContent = tr('لم يكتمل تحميل المحتوى. تحقّق من اتصالك ثم أعد المحاولة.', 'Content has not finished loading. Check your connection, then try again.'); retry.hidden = false; }, 25000);
    if (replacing) frame.contentWindow.location.replace(childURL.href);
    else frame.src = childURL.href;
  }
  function navigate(href, replace = false) {
    const url = new URL(href, location.href), next = parseWorkspace(url.href);
    if (!next || url.origin !== location.origin) return;
    if (next.workspace !== route.workspace) { location.assign(url.href); return; }
    if (url.href === location.href) return;
    if (!replace) depth++;
    history[replace ? 'replaceState' : 'pushState']({ academyWorkspaceDepth: depth }, '', url);
    route = next; mount();
  }
  root.querySelector('.workspace-controls').addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(a.href);
  });
  back.addEventListener('click', () => history.back());
  retry.addEventListener('click', () => mount(true));
  window.addEventListener('popstate', () => { depth = history.state?.academyWorkspaceDepth || 0; route = parseWorkspace(location.href); mount(); });
  frame.addEventListener('load', () => {
    if (!loaded) return;
    frame.contentWindow.postMessage({ channel: 'biuret-workspace', type: 'language', language: currentLanguage() }, location.origin);
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.channel !== 'biuret-workspace') return;
    const message = event.data;
    if (message.type === 'account-refresh') { location.reload(); return; }
    if (message.type === 'guide') { document.querySelector('.bg-launch')?.click(); return; }
    if (message.type === 'language-request') {
      if (['ar', 'en'].includes(message.language) && message.language !== currentLanguage()) document.querySelector('#language-toggle')?.click();
      return;
    }
    if (!loaded || !user()) return;
    const canonical = workspaceHref(message.href, route, location.href);
    if (message.type === 'navigate') { if (canonical) navigate(canonical); return; }
    if (message.type !== 'ready' || !canonical) return;
    const actual = new URL(message.href);
    // A late message from the previous document cannot overwrite current navigation.
    if (actual.pathname + actual.search !== new URL(loaded).pathname + new URL(loaded).search) {
      try { if (frame.contentWindow.location.href !== actual.href) return; } catch { return; }
      navigate(canonical, true); return;
    }
    if (message.language !== currentLanguage() && ['ar', 'en'].includes(message.language)) {
      frame.contentWindow.postMessage({ channel: 'biuret-workspace', type: 'language', language: currentLanguage() }, location.origin);
      return;
    }
    childTitle = typeof message.title === 'string' ? message.title.trim().slice(0, 180) : '';
    clearTimeout(loadTimer); busy.hidden = true; root.dataset.state = 'ready'; frame.inert = false; frame.removeAttribute('aria-busy'); controls();
  });
  document.querySelector('#language-toggle')?.addEventListener('click', () => {
    childTitle = ''; controls(); clearTimeout(languageTimer);
    languageTimer = setTimeout(() => frame.contentWindow?.postMessage({ channel: 'biuret-workspace', type: 'language', language: currentLanguage() }, location.origin), 0);
  });
  window.addEventListener('biuret-auth-changed', () => mount(true));
  // App's existing login gate is authoritative. Load only after that gate settles.
  new MutationObserver(() => { if (user()?.$id !== owner && document.documentElement.classList.contains('academy-auth-ready')) mount(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  controls();
  if (document.documentElement.classList.contains('academy-auth-ready')) mount();
  // App initially adds auth-ready for guests; its async load can change the gate.
  new MutationObserver(() => { if (!document.querySelector('#main')?.hidden && user() && user().$id !== owner) mount(); }).observe(document.querySelector('#main'), { attributes: true, attributeFilter: ['hidden'] });
}
