import { user } from './auth.js?v=20261007-stable1';
import { currentLanguage } from './i18n.js?v=20261007-stable1';

// Keep answers while switching languages or rerendering an assessment, scoped
// to the signed-in account and this page. Answers are never stored on disk.
let owner;
let formKey;
const answers = new Map();
const bound = new WeakSet();

export function attachAssessmentProgress(root, formId = '') {
  if (!root) return;
  if (owner !== user()?.$id) { owner = user()?.$id; answers.clear(); }
  const form = root.querySelector('form');
  if (!form || !owner) return;
  if (formKey !== formId) {formKey=formId;answers.clear();}
  const radios = [...form.querySelectorAll('input[type="radio"]')];
  if (!radios.length) return;
  const groups = new Set(radios.map((radio) => radio.name));
  for (const radio of radios) radio.checked = answers.get(radio.name) === radio.value;
  const bar = document.createElement('div');
  bar.className = 'assessment-progress';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');
  form.prepend(bar);
  const update = () => {
    const done = new Set([...form.querySelectorAll('input:checked')].map((radio) => radio.name)).size;
    const ar = currentLanguage() === 'ar';
    bar.textContent = ar ? `أجبت ${done} من ${groups.size} · يمكنك مراجعة إجاباتك قبل الإرسال` : `${done} of ${groups.size} answered · Review your answers before submitting`;
  };
  update();
  if (!bound.has(root)) {
    root.addEventListener('change', event => {
      if (event.target.matches('input[type="radio"]')) answers.set(event.target.name, event.target.value);
      const current = root.querySelector('.assessment-progress');
      const currentForm = root.querySelector('form');
      if (!current || !currentForm) return;
      const names = new Set([...currentForm.querySelectorAll('input[type="radio"]')].map(radio => radio.name));
      const done = new Set([...currentForm.querySelectorAll('input[type="radio"]:checked')].map(radio => radio.name)).size;
      current.textContent = currentLanguage() === 'ar' ? `أجبت ${done} من ${names.size} · يمكنك مراجعة إجاباتك قبل الإرسال` : `${done} of ${names.size} answered · Review your answers before submitting`;
    });
    bound.add(root);
  }
}
window.addEventListener('biuret-auth-changed', () => { answers.clear(); owner = user()?.$id; });
