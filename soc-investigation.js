import { user, loadUser, loadSocInvestigation, checkSocFindings, loadPractical } from './auth.js?v=20261008-ux1';
import { currentLanguage, setPageHeaderTitle } from './i18n.js?v=20261008-ux1';
import { fullName } from './full-name.js?v=20261008-ux1';
import { attachPracticalReport } from './practical-report.js?v=20261008-ux1';
import { investigationRows, cleanInvestigation, investigationFindings, evidenceFileText, evidenceCsv, verifyEvidenceFile } from './soc-investigation-model.js?v=20261008-ux1';

const root = document.querySelector('#soc-investigation-main');
const tr = (ar, en) => currentLanguage() === 'ar' ? ar : en;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const labels = { identity:['الهوية','Identity'], application:['التطبيق','Application'], proxy:['الشبكة','Network'], endpoint:['الجهاز','Endpoint'], changes:['الاعتمادات','Approvals'], collection:['الجمع','Collection'] };
let bundle, state, owner, key, generation = 0, busy = false, feedback;
const owned = () => owner && user()?.$id === owner;
const download = (name, text, type) => { const url = URL.createObjectURL(new Blob([text], {type})); const a = document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); };
function save() {
  if (!owned()) return;
  try { localStorage.setItem(key, JSON.stringify(state)); root.querySelector('[data-soc-save]').textContent=tr('حُفظ عملك في هذا المتصفح','Your work is saved in this browser'); }
  catch { root.querySelector('[data-soc-save]').textContent=tr('تعذر الحفظ؛ نزّل عملك قبل المغادرة','Saving unavailable; download your work before leaving'); }
}
function records() {
  const rows = investigationRows(bundle, state), ar = currentLanguage()==='ar';
  root.querySelector('[data-soc-count]').textContent=tr(`${rows.length} سجلاً معروضاً · ${state.evidenceIds.length} محدداً`,`${rows.length} records shown · ${state.evidenceIds.length} selected`);
  root.querySelector('[data-soc-rows]').innerHTML=rows.length ? rows.map(row=>`<tr><td><input type="checkbox" data-soc-evidence="${row.id}" aria-label="${tr('حدد الدليل','Select evidence')} ${row.id}" ${state.evidenceIds.includes(row.id)?'checked':''}></td><td dir="ltr"><strong>${row.id}</strong><br>${row.correctedTime.slice(11,19)}Z<details><summary>${tr('الوقت الأصلي','Original time')}</summary>${row.timestamp}</details></td><td><span>${labels[row.source][ar?0:1]}</span><small dir="ltr">${esc(row.file)}</small></td><td dir="ltr">${esc(row.host)}<br>${esc(row.actor)}<br>${esc(row.session)}</td><td dir="ltr"><strong>${esc(row.event)}</strong><br>${esc(row.detail)}${row.bytes?`<br>${row.bytes.toLocaleString('en-US')} bytes`:''}</td></tr>`).join('') : `<tr><td colspan="5">${tr('لا توجد نتائج. غيّر الفلاتر أو ألغها.','No matching records. Adjust or clear the filters.')}</td></tr>`;
}
function result() {
  const box=root.querySelector('[data-soc-result]');
  if(!feedback){box.replaceChildren();return;}
  const names={evidence:tr('ربط الأدلة','Evidence correlation'),timeline:tr('الخط الزمني','Timeline'),volume:tr('حجم النقل','Transfer volume'),scope:tr('نطاق الاحتواء','Containment scope'),conclusion:tr('حدود الاستنتاج','Finding limits')};
  box.innerHTML=`<h3>${tr('تحقق تدريبي','Practice check')} · ${feedback.checked}/${feedback.total}</h3><ul>${Object.entries(feedback.checks).map(([id,pass])=>`<li><strong>${pass?'✓':'↻'} ${names[id]}</strong><p>${esc(feedback.feedback[id])}</p></li>`).join('')}</ul><p>${tr('هذه مراجعة للحسابات والقرارات فقط. تقريرك النصي يُراجع منفصلاً؛ النتيجة لا تسجل اجتيازاً أو تفتح شهادة.','This checks calculations and decisions only. Your written report is reviewed separately; this result does not record a pass or unlock a certificate.')}</p>`;
}
function form() {
  const select=(name,label,options)=>`<label>${label}<select name="${name}" required><option value="">${tr('اختر نطاق قرارك','Choose your decision')}</option>${options.map(([v,ar,en])=>`<option value="${v}" ${state[name]===v?'selected':''}>${tr(ar,en)}</option>`).join('')}</select></label>`;
  return `<form id="soc-findings" class="soc-findings"><label>${tr('تسلسل السجلات P05، I04، E03، A03، P04 بعد تصحيح الوقت','Order P05, I04, E03, A03, P04 after correcting time')}<input name="timeline" dir="ltr" maxlength="120" value="${esc(state.timeline)}" placeholder="ID, ID, ID, ID, ID" required></label><div class="soc-calculations"><label>${tr('مجموع بايتات الرفع لـ S-402 في نافذة التنبيه','S-402 upload bytes during the alert window')}<input name="outboundBytes" type="number" min="0" max="1000000000000" step="1" value="${esc(state.outboundBytes)}" required></label><label>${tr('كم مرة يتجاوز الخط الأساسي؟','How many times the baseline?')}<input name="baselineMultiple" type="number" min="0" max="1000000" step="any" value="${esc(state.baselineMultiple)}" required></label></div>${select('scope',tr('نطاق الاحتواء الأول بعد حفظ الأدلة وموافقة المسؤول','Initial containment after preservation and response authorization'),[['session','الجلسة S-402 والرمز T402 على WS-17','S-402 / T402 on WS-17'],['nat','كل الأنشطة على IP المشترك','All activity sharing the IP'],['organization','كل حسابات المؤسسة','Every organization account'],['none','لا تحقيق أو احتواء مطلوب','No investigation or containment needed']])}${select('conclusion',tr('ما مستوى الاستنتاج؟ وثّق مبرراته في التقرير','Finding level — justify it in your report'),[['needs-validation','اشتباه يتطلب تحققاً إضافياً','Suspicion requiring further validation'],['confirmed-theft','سرقة محتوى مؤكدة','Confirmed theft of contents'],['benign','نشاط سليم مثبت','Established benign activity']])}<button class="button button-primary" ${busy?'disabled':''}>${tr('تحقق من تحليلك','Check your analysis')} ↗</button></form><div data-soc-result role="status" tabindex="-1"></div>`;
}
function render(eligible) {
  const ar=currentLanguage()==='ar';
  const steps=[tr('افهم المهمة','Read the brief'),tr('افحص الأدلة','Inspect evidence'),tr('ابنِ التحليل','Build findings'),tr('وثّق وسلم','Report and submit')];
  setPageHeaderTitle({ar:'مختبر تحقيق SOC',en:'SOC investigation lab'});
  document.title=`${bundle.title} — Biuret Academy`;
  root.innerHTML=`<section class="section-frame assessment-hero soc-hero"><a class="learning-back" href="path.html?id=path_soc">${tr('مسار SOC','SOC path')} ↗</a><span class="section-kicker">${tr('SOC / مساحة التحقيق','SOC / CASE WORKSPACE')}</span><h1>${esc(bundle.title)}</h1><p>${esc(bundle.brief)}</p><div class="soc-facts"><span>${tr('٦ ملفات · ٣٣ سجلاً','6 files · 33 records')}</span><span>${tr('٤ خطوات','4 steps')}</span><span>${tr('٤٥–٦٠ دقيقة تقديرية','Estimated 45–60 minutes')}</span><span>${tr('حالة صناعية','Synthetic case')}</span></div></section><nav class="soc-step-nav section-frame" aria-label="${tr('خطوات التحقيق','Investigation steps')}">${steps.map((s,i)=>`<a href="#soc-step-${i+1}"><b>${String(i+1).padStart(2,'0')}</b>${s}</a>`).join('')}</nav><div class="assessment-body section-frame soc-body"><section class="assessment-card" id="soc-step-1"><span class="section-kicker">01 / ${tr('المهمة','BRIEF')}</span><h2>${steps[0]}</h2><ul>${bundle.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${tr('تعمل على نسخ تدريبية فقط؛ لا تتصل بالوجهات ولا تنفّذ حظراً فعلياً. أرفق معرف الحالة والنسخة ومصادر الدليل في تقريرك.','Work on training copies only. Do not contact destinations or apply real blocks. Cite the case ID, version and evidence sources in your report.')}</p><p dir="ltr"><code>${bundle.id} / ${bundle.version}</code></p><div class="soc-files">${bundle.files.map((f,i)=>`<article><strong dir="ltr">${f.name}</strong><p>${esc(f.description)}</p><small>${f.rows.length} ${tr('سجلات','records')} · ${tr('انحراف الساعة','Clock offset')}: <b dir="ltr">${f.clockOffsetSeconds}s</b></small><div><button type="button" class="button button-outline" data-soc-download="${i}" data-format="json">JSON ↓</button><button type="button" class="button button-outline" data-soc-download="${i}" data-format="csv">CSV ↓</button></div><details><summary>SHA-256</summary><code class="soc-hash" dir="ltr">${f.sha256}</code></details></article>`).join('')}</div><button type="button" class="button button-outline" data-soc-manifest>${tr('تنزيل قائمة سلامة الأدلة','Download evidence integrity manifest')} ↓</button><p class="muted">${tr('البصمات تؤكد تطابق نسخة JSON مع الحزمة فقط. CSV نسخة مشتقة، وليست البصمة دليلاً على أصالة حادث حقيقي.','Hashes check the JSON copy against this bundle only. CSV is a derived view; a hash does not establish authenticity of a real incident.')}</p><p data-soc-download-status role="status"></p></section><section class="assessment-card" id="soc-step-2"><span class="section-kicker">02 / ${tr('الأدلة','EVIDENCE')}</span><h2>${steps[1]}</h2><p>${tr('الجدول يعرض وقت UTC المصحح؛ افتح الوقت الأصلي وقارنه ببيانات الملف. اختر الأدلة الأساسية والقيود التي يعتمد عليها تقريرك، ولا تجمع النشاط السليم مع المشتبه به.','The table shows corrected UTC. Inspect original times against file metadata. Select your core supporting and limiting evidence; keep legitimate and suspicious activity separate.')}</p><div class="soc-filters"><label>${tr('بحث في الأدلة','Search evidence')}<input type="search" data-soc-filter="query" value="${esc(state.query)}" placeholder="WS-17 / T402 / EXPORT"></label><label>${tr('المصدر','Source')}<select data-soc-filter="source"><option value="all">${tr('كل المصادر','All sources')}</option>${Object.entries(labels).map(([s,l])=>`<option value="${s}" ${state.source===s?'selected':''}>${l[ar?0:1]}</option>`).join('')}</select></label><label>${tr('الجلسة','Session')}<input data-soc-filter="session" dir="ltr" value="${esc(state.session)}" placeholder="S-402"></label><button class="button button-outline" type="button" data-soc-clear>${tr('مسح الفلاتر','Clear filters')}</button></div><p data-soc-count role="status"></p><div class="workbench-table-scroll" tabindex="0" role="region" aria-label="${tr('جدول الأدلة؛ مرّر أفقياً عند الحاجة','Evidence table; scroll horizontally when needed')}"><table class="soc-table"><caption>${tr('سجلات الحالة — وقت UTC المصحح','Case records — corrected UTC time')}</caption><thead><tr><th>${tr('حدد','Select')}</th><th>ID / UTC</th><th>${tr('المصدر','Source')}</th><th>${tr('الجهاز والهوية والجلسة','Host, identity, session')}</th><th>${tr('الحدث والتفاصيل','Event and details')}</th></tr></thead><tbody data-soc-rows></tbody></table></div></section><section class="assessment-card" id="soc-step-3"><span class="section-kicker">03 / ${tr('التحليل','FINDINGS')}</span><h2>${steps[2]}</h2><p>${tr('نافذة حساب الرفع والخط الأساسي بالبايت:','Upload calculation window and baseline bytes:')} <b dir="ltr">${bundle.window} · ${bundle.baselineBytes}</b></p>${form()}<details class="soc-hints"><summary>${tr('أحتاج تلميحاً للمنهج','Show method hints')}</summary><ol>${bundle.hints.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details></section><section class="assessment-card" id="soc-step-4"><span class="section-kicker">04 / ${tr('التقرير','HANDOFF')}</span><h2>${steps[3]}</h2><p>${tr('اكتب تقريرك بألفاظك في الحقول التالية. اذكر حساب النقل والخط الزمني ومعرفات الأدلة، ثم خطة تحقق تحفظ العمل السليم. التقرير يستخدم سجل مراجعة مسار SOC نفسه؛ النسخة المرسلة سابقاً تبقى ثابتة.','Write your report in your own words below. Include arithmetic, timeline, evidence IDs and a retest plan preserving legitimate work. This uses the same SOC path review history; earlier submissions stay immutable.')}</p><ul>${bundle.rubric.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${tr('يفتح التسليم بعد إكمال دروس المسار وامتحانات دوراته. يمكنك تجهيز المسودة الآن؛ اجتياز فحص التدريب لا يحل محل تلك المتطلبات.','Submission opens after path lessons and course exams. You can draft now; passing this practice check does not replace those requirements.')}</p><button class="button button-outline" type="button" data-soc-work>${tr('تنزيل ورقة التحليل','Download analysis worksheet')} ↓</button><p class="muted" data-soc-save></p></section></div><section class="section-frame soc-references"><h2>${tr('مراجع المنهج','Method references')}</h2>${bundle.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join('')}<a href="practical.html?id=path_soc">${tr('التقييم العملي وامتحان المسار','Path practical and final exam')} ↗</a></section>`;
  records();result();attachPracticalReport(root,'path_soc',eligible);
  const report=root.querySelector('.practical-report'); if(report)root.querySelector('#soc-step-4').append(report);
}
async function refresh() {
  const ticket=++generation; feedback=undefined; busy=false;
  if(!user()){try{await loadUser();}catch{ /* The sign-in panel remains available after an expired session. */ }} if(ticket!==generation)return;
  owner=user()?.$id;
  if(!owner){root.innerHTML=`<section class="section-frame assessment-card"><h1>${tr('سجّل الدخول لبدء التحقيق','Sign in to begin the investigation')}</h1><button class="button button-primary" data-soc-signin>${tr('تسجيل الدخول','Sign in')}</button></section>`;return;}
  if(!fullName(user().name)){root.innerHTML=`<section class="section-frame assessment-card"><h1>${tr('أكمل اسمك الحقيقي أولاً','Set your real full name first')}</h1><a class="button button-primary" href="profile.html">${tr('الملف الشخصي','Profile')} ↗</a></section>`;return;}
  root.innerHTML=`<section class="section-frame assessment-card"><p role="status">${tr('جارٍ تجهيز مساحة التحقيق…','Preparing your investigation workspace…')}</p></section>`;
  try {
    const [caseResult, practicalResult]=await Promise.allSettled([loadSocInvestigation(currentLanguage()),loadPractical('path_soc',currentLanguage())]);
    if(ticket!==generation||!owned())return;
    if(caseResult.status==='rejected')throw caseResult.reason;
    bundle=caseResult.value;
    key=`biuret-soc-investigation-v1:${owner}:${bundle.id}`;
    try{state=cleanInvestigation(JSON.parse(localStorage.getItem(key)||'{}'),bundle.version);}catch{state=cleanInvestigation({},bundle.version);}
    state.evidenceIds=state.evidenceIds.filter(id=>bundle.files.some(f=>f.rows.some(r=>r.id===id)));
    render(practicalResult.status==='fulfilled'&&(practicalResult.value.ready||practicalResult.value.passed));
    if(practicalResult.status==='rejected')root.querySelector('#soc-step-4').insertAdjacentHTML('beforeend',`<p class="muted">${tr('تعذر التحقق من متطلبات التسليم. المسودة متاحة؛ أعد تحميل الصفحة قبل التسليم.','Submission prerequisites could not be checked. Drafting remains available; reload before submitting.')}</p>`);
  }catch(error){if(ticket!==generation)return;root.innerHTML=`<section class="section-frame assessment-card"><h1>${tr('تعذر فتح مختبر SOC','SOC lab unavailable')}</h1><p>${error.code===403?tr('أكمل الأساسيات وتحقق من وصول حسابك إلى مسار SOC.','Complete Foundations and check your SOC path access.'):tr('تعذر تحميل الحالة. أعد المحاولة بعد قليل.','The case could not be loaded. Please retry shortly.')}</p><a class="button button-outline" href="path.html?id=path_soc">${tr('عرض المسار','View path')} ↗</a><button class="button button-outline" data-soc-retry>${tr('أعد المحاولة','Retry')}</button></section>`;}
}
root?.addEventListener('input',event=>{
  if(!owned()||!state)return;
  const target=event.target;
  if(target.dataset.socFilter){state[target.dataset.socFilter]=target.value;records();}
  else if(target.dataset.socEvidence){const id=target.dataset.socEvidence;state.evidenceIds=state.evidenceIds.filter(x=>x!==id);if(target.checked)state.evidenceIds.push(id);records();root.querySelector(`[data-soc-evidence="${id}"]`)?.focus({preventScroll:true});feedback=undefined;result();}
  else if(target.closest('#soc-findings')){state[target.name]=target.value;feedback=undefined;result();}
  else return;
  save();
});
root?.addEventListener('submit',async event=>{
  if(event.target.id!=='soc-findings')return;
  event.preventDefault();if(busy||!owned())return;
  const ticket=generation,submitted=JSON.stringify(investigationFindings(state)),button=event.submitter||event.target.querySelector('button');
  busy=true;button.disabled=true;
  try{const checked=await checkSocFindings(bundle.id,bundle.version,JSON.parse(submitted),currentLanguage());
    if(ticket!==generation||!owned())return;
    if(submitted!==JSON.stringify(investigationFindings(state))){root.querySelector('[data-soc-result]').textContent=tr('عدّلت تحليلك أثناء التحقق؛ أعد الفحص لنسختك الحالية.','Your findings changed during checking; check your current version again.');return;}
    feedback=checked;result();root.querySelector('[data-soc-result]').focus();save();
  }catch{if(ticket===generation&&owned())root.querySelector('[data-soc-result]').textContent=tr('تعذر التحقق. راجع اكتمال الحقول وترتيب المعرفات ثم أعد المحاولة.','Checking failed. Review the fields and record IDs, then retry.');}
  finally{if(ticket===generation){busy=false;if(button.isConnected)button.disabled=false;}}
});
root?.addEventListener('click',async event=>{
  if(event.target.closest('[data-soc-signin]'))document.querySelector('#account-button')?.click();
  if(event.target.closest('[data-soc-retry]'))refresh();
  if(!owned()||!bundle||!state)return;
  if(event.target.closest('[data-soc-clear]')){state.query='';state.source='all';state.session='';for(const el of root.querySelectorAll('[data-soc-filter]'))el.value=state[el.dataset.socFilter];records();save();}
  const button=event.target.closest('[data-soc-download]');
  if(button){const ticket=generation,file=bundle.files[Number(button.dataset.socDownload)];
    try{const valid=await verifyEvidenceFile(file);if(ticket!==generation||!owned())return;if(!valid)throw new Error();
      download(button.dataset.format==='csv'?file.name.replace('.json','.csv'):file.name,button.dataset.format==='csv'?evidenceCsv(file):evidenceFileText(file),button.dataset.format==='csv'?'text/csv;charset=utf-8':'application/json');
      root.querySelector('[data-soc-download-status]').textContent=tr('تحققت بصمة JSON قبل تنزيل النسخة.','JSON integrity verified before downloading the copy.');
    }catch{if(ticket===generation)root.querySelector('[data-soc-download-status]').textContent=tr('تعذر التحقق من الملف؛ لم يُنزّل. أعد تحميل الحالة.','File integrity could not be verified; nothing was downloaded. Reload the case.');}}
  if(event.target.closest('[data-soc-manifest]'))download('soc-export-manifest.json',JSON.stringify({caseId:bundle.id,version:bundle.version,synthetic:true,files:bundle.files.map(({name,sha256,clockOffsetSeconds})=>({name,sha256,clockOffsetSeconds}))},null,2),'application/json');
  if(event.target.closest('[data-soc-work]'))download('soc-export-worksheet.json',JSON.stringify({caseId:bundle.id,version:bundle.version,practiceOnly:true,findings:investigationFindings(state),recordedCertificatePass:false},null,2),'application/json');
});
document.querySelector('#language-toggle')?.addEventListener('click',()=>setTimeout(refresh,0));
window.addEventListener('biuret-auth-changed',refresh);
refresh();
