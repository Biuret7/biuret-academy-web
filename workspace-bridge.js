import { workspaces, workspaceHref } from './workspace-model.js?v=20261011-ui2';

let embedded = false;
try { embedded = window.parent !== window && window.parent.location.origin === location.origin && Boolean(workspaces[window.parent.location.pathname.split('/').pop().replace(/\.html$/, '')]); } catch {}
if (embedded) {
  document.documentElement.classList.add('workspace-embedded');
  const pathView = document.querySelector('.site-shell')?.dataset.page === 'path';
  const selectPathSection = hash => {
    if (pathView) document.documentElement.dataset.workspaceSection = ({ '#path-course': 'courses', '#path-course-optional': 'courses', '#path-assessment': 'assessment', '#path-quiz': 'practice', '#path-lab': 'practice', '#path-operation': 'practice', '#path-challenge': 'practice' })[hash] || 'overview';
  };
  selectPathSection(location.hash);
  const send = (type, extra = {}) => window.parent.postMessage({ channel: 'biuret-workspace', type, ...extra }, location.origin);
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    if (a.getAttribute('href').startsWith('#') && !(pathView && /^#path-(course|quiz|lab|operation|challenge|assessment)/.test(a.getAttribute('href')))) return;
    const url = new URL(a.href);
    if (!workspaceHref(url.href, {}, location.href)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    send('navigate', { href: url.href });
  }, true);
  let timer;
  const announce = () => {
    clearTimeout(timer); timer = setTimeout(() => send('ready', { href: location.href, title: document.querySelector('main h1')?.textContent || document.title, language: document.documentElement.lang }), 80);
  };
  new MutationObserver(announce).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  new MutationObserver(announce).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('hashchange', announce);
  window.addEventListener('biuret-auth-changed', () => send('account-refresh'));
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); event.stopImmediatePropagation(); send('guide'); }
  }, true);
  window.addEventListener('biuret-workspace-navigate', event => {
    if (typeof event.detail?.href === 'string' && workspaceHref(event.detail.href, {}, location.href)) send('navigate', { href: new URL(event.detail.href, location.href).href });
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'language-select') setTimeout(() => send('language-request', { language: document.documentElement.lang }), 0);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('#settings-language')) setTimeout(() => send('language-request', { language: document.documentElement.lang }), 0);
  }, true);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent || event.data?.channel !== 'biuret-workspace') return;
    if (event.data.type === 'language' && ['ar', 'en'].includes(event.data.language) && document.documentElement.lang !== event.data.language) document.querySelector('#language-toggle')?.click();
    if (event.data.type === 'anchor' && /^#[a-zA-Z0-9_-]*$/.test(event.data.hash || '')) {
      const update = () => {
        selectPathSection(event.data.hash);
        const target = document.getElementById(event.data.hash.slice(1)) || (event.data.hash === '#' ? document.querySelector('main') : null);
        if (target) {
          history.replaceState(null, '', event.data.hash === '#' ? location.pathname + location.search : event.data.hash);
          // Path tabs select a new view. Start at its heading, without a long scroll.
          (pathView ? document.querySelector('main') : target).scrollIntoView({ block: 'start', behavior: 'instant' });
          target.tabIndex = -1; target.focus({ preventScroll: true }); announce();
        }
      };
      if (pathView && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update);
      else update();
    }
  });
  announce();
} else {
  // Previously shared links keep working, now opening the consolidated section.
  const canonical = workspaceHref(location.href, {}, location.href);
  if (canonical && !workspaces[location.pathname.split('/').pop().replace(/\.html$/, '')]) location.replace(canonical);
  const mapLinks = () => document.querySelectorAll('a[href]').forEach(a => {
    if (a.hasAttribute('download') || (a.target && a.target !== '_self') || a.getAttribute('href').startsWith('#')) return;
    const href = workspaceHref(a.href, {}, location.href);
    if (href && a.getAttribute('href') !== href) a.setAttribute('href', href);
  });
  mapLinks();
  new MutationObserver(mapLinks).observe(document.body, { childList: true, subtree: true });
}
