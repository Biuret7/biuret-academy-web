export function mountLessonNotes(root, { owner, lessonId, language }) {
  if (!root || !owner) return;
  const tr = (ar, en) => language === 'ar' ? ar : en;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const key = `biuret-foundations-response-v1:${owner}:${lessonId}`;
  let response = '';
  try { response = localStorage.getItem(key) || ''; } catch {}
  root.innerHTML = `<h2>${tr('اكتب تطبيقك المستقل', 'Write your independent response')}</h2><label for="independent-response">${tr('إجابتك للمهمة: الدليل، الاستنتاج، المجهول والتحقق', 'Your task response: evidence, finding, unknowns and verification')}</label><textarea id="independent-response" rows="6" maxlength="6000" placeholder="${tr('استخدم عينات التدريب فقط؛ لا تكتب بيانات أو أسراراً حقيقية.', 'Use training samples only; do not enter real personal data or secrets.')}">${esc(response)}</textarea><small role="status">${tr('يحفظ تلقائياً لحسابك في هذا المتصفح. النص لا يُصحح آلياً ولا يمنح نقاطاً.', 'Automatically saved for your account in this browser. Written responses are not automatically graded and award no points.')}</small>`;
  root.querySelector('textarea').addEventListener('input', event => {
    try { localStorage.setItem(key, event.target.value); root.querySelector('small').textContent = tr('حُفظت الإجابة في هذا المتصفح؛ راجعها بمعايير المهمة.', 'Response saved in this browser; review it against the task criteria.'); }
    catch { root.querySelector('small').textContent = tr('تعذر حفظ الإجابة؛ انسخها قبل المغادرة.', 'Could not save; copy your response before leaving.'); }
  });
}
