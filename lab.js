import { mountWorkbench } from './workbench.js?v=20261006-audit1';
import { user, loadUser } from './auth.js?v=20261006-audit1';
import { fullName } from './full-name.js?v=20261006-audit1';
import { labById } from './labs.js?v=20261006-audit1';
import { courseById, localized } from './learning-content.js?v=20261006-audit1';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261006-audit1';

const root = document.querySelector('#lab-main');
const lab = labById[new URLSearchParams(location.search).get('id')];
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const l = (value) => localized(value, currentLanguage());
const tr = (ar, en) => currentLanguage() === 'en' ? en : ar;
let step = 0;
let revealed = false;

function render() {
  if (!root) return;
  if (!lab) { root.innerHTML = `<section class="section-frame learning-empty"><h1>${tr('مختبر غير متاح', 'Lab unavailable')}</h1><a href="paths.html">${tr('العودة للمسارات', 'Back to paths')} ↗</a></section>`; return; }
  setPageHeaderTitle(lab.title);
  if (!user() || !fullName(user().name)) { root.replaceChildren(); return; }
  const item = lab.steps[step];
  root.innerHTML = `<section class="learning-hero section-frame"><a class="learning-back" href="course.html?id=${encodeURIComponent(lab.courseId)}">← ${esc(l(courseById[lab.courseId].title))}</a><span class="section-kicker">FOUNDATIONS / HANDS-ON LAB</span><h1>${esc(l(lab.title))}</h1><p>${esc(l(lab.summary))}</p><div class="learning-facts"><span>${lab.minutes} ${tr('دقيقة', 'min')}</span><span>${tr('محاكاة آمنة', 'Safe simulation')}</span><span>${tr('تدريب بلا نقاط موثقة', 'Practice without verified XP')}</span></div></section><section class="lab-layout section-frame"><div class="lab-artifact"><span class="section-kicker">SIMULATED EVIDENCE</span><pre dir="ltr">${esc(lab.artifact)}</pre><p>${tr('هذه عينة صناعية. لا تتصل بأي نظام حقيقي.', 'This is synthetic evidence. It does not connect to a live system.')}</p></div><div class="lab-workspace"><div class="lab-progress"><span>${tr('الخطوة', 'Step')} ${step + 1} / ${lab.steps.length}</span><div role="progressbar" aria-valuemin="0" aria-valuemax="${lab.steps.length}" aria-valuenow="${step + (revealed ? 1 : 0)}"><i style="width:${(step + (revealed ? 1 : 0)) / lab.steps.length * 100}%"></i></div></div><h2>${esc(l(item.prompt))}</h2>${revealed ? `<p class="lab-feedback success">✓ ${esc(l(item.explanation))}</p>${step < lab.steps.length - 1 ? `<button class="button button-primary" id="lab-next" type="button">${tr('الخطوة التالية', 'Next step')} ↗</button>` : `<div class="lab-complete"><strong>${tr('أنهيت المختبر', 'Lab complete')}</strong><p>${esc(l(lab.takeaway))}</p><a class="button button-primary" href="course.html?id=${encodeURIComponent(lab.courseId)}">${tr('عد إلى الكورس', 'Return to course')} ↗</a></div>`}` : `<form id="lab-form"><fieldset><legend class="sr-only">${esc(l(item.prompt))}</legend>${item.choices.map((choice, index) => `<label class="option-label"><input type="radio" name="answer" value="${index}" required><span>${esc(l(choice))}</span></label>`).join('')}</fieldset><button class="button button-primary" type="submit">${tr('تحقّق من الدليل', 'Check the evidence')} ↗</button><p class="lab-feedback error" id="lab-error" role="status" hidden></p></form>`}</div></section>`;
  if (lab.id === 'log-triage') {
    root.insertAdjacentHTML('beforeend', '<div class="section-frame" id="evidence-workbench"></div>');
    mountWorkbench(root.querySelector('#evidence-workbench'), { owner: user().$id, language: currentLanguage(), context: 'foundations' });
  }
}

root?.addEventListener('submit', (event) => {
  if (event.target.id !== 'lab-form') return;
  event.preventDefault();
  const answer = Number(new FormData(event.target).get('answer'));
  if (answer !== lab.steps[step].answer) { const feedback = root.querySelector('#lab-error'); feedback.textContent = tr('راجع العينة وحاول مرة أخرى. ابدأ بما يظهر في الدليل فقط.', 'Review the sample and try again. Start with what the evidence actually shows.'); feedback.hidden = false; return; }
  revealed = true; render();
});
root?.addEventListener('click', (event) => { if (event.target.closest('#lab-next')) { step += 1; revealed = false; render(); } });
document.querySelector('#language-toggle')?.addEventListener('click', render);
window.addEventListener('biuret-auth-changed', () => { step = 0; revealed = false; render(); });
loadUser().then(render).catch(() => { root.replaceChildren(); });
