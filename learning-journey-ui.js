import { pathJourney, lessonContinuation } from './learning-journey-model.js?v=20261013-learning2';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const trFor = language => (ar,en) => language === 'ar' ? ar : en;
const observers = new WeakMap();

export function mountPathJourney(root, options) {
  const hero = root.querySelector('.path-detail-hero'); if (!hero) return;
  root.querySelector('.learner-route')?.remove();
  const tr = trFor(options.language), model = pathJourney(options);
  const labels = {learn:tr('تعلّم الدورات','Learn the courses'),practical:tr('طبّق وأثبت فهمك','Demonstrate your skills'),exam:tr('اجتز امتحان المسار','Pass the path exam'),certificate:tr('شهادة إكمالك','Your completion certificate')};
  const notes = {learn:tr('دروس وأسئلة تحقق؛ وامتحان لكل دورة تخصص.','Lessons and checkpoints; an exam for each specialty course.'),practical:tr('بعد استيفاء متطلبات التعلّم.','After meeting the learning requirements.'),exam:tr('بعد اجتياز التقييم العملي.','After passing the practical assessment.'),certificate:tr('تُتاح بعد اجتياز الامتحان.','Available after passing the exam.')};
  const reason = {loading:tr('نتحقق من تقدمك قبل اقتراح الخطوة التالية.','Checking your progress before suggesting the next step.'),error:tr('لم نتمكن من التحقق من تقدمك. أعد المحاولة.','Your progress could not be verified. Please retry.'),signin:tr('سجّل دخولك لتبدأ وتحفظ إنجازك.','Sign in to begin and save your achievements.'),foundations:tr('خطوتك الأولى هي إكمال الأساسيات المجانية.','Your first step is to complete free Foundations.'),access:tr('يمكنك استكشاف الخطة. راجع شروط الوصول قبل البدء.','Explore the outline. Review access requirements before starting.')};
  const actionLabels = {learn:tr(options.path.free?'تابع درسك التالي':'ابدأ من الدورات',options.path.free?'Continue your next lesson':'Start with the courses'),practical:tr('انتقل للتقييم العملي','Open practical assessment'),exam:tr('راجع الامتحان ومتطلباته','Review exam requirements'),certificate:tr('افتح شهادة المسار','Open path certificate')};
  const action = model.action ? `<a class="button button-primary" href="${esc(model.action.href)}">${actionLabels[model.action.kind]} <span aria-hidden="true">${options.language === 'ar'?'←':'→'}</span></a>`
    : model.reason === 'signin' ? `<button class="button button-primary" type="button" data-journey-signin>${tr('سجّل وابدأ','Sign in and begin')}</button>`
    : model.reason === 'foundations' ? `<a class="button button-primary" href="path.html?id=foundations">${tr('ابدأ الأساسيات','Start Foundations')}</a>`
    : model.reason === 'error' ? `<button class="button button-outline" type="button" data-path-retry>${tr('أعد المحاولة','Retry')}</button>` : '';
  hero.insertAdjacentHTML('afterend',`<section class="learner-route" aria-label="${tr('رحلتك داخل المسار','Your path journey')}"><div class="learner-route-heading"><div><span class="section-kicker">${tr('خطتك في مكان واحد','YOUR ROUTE AT A GLANCE')}</span><h2>${model.reason ? tr('طريق واضح من البداية إلى الشهادة','A clear route from start to certificate') : labels[model.current]}</h2><p>${model.reason ? reason[model.reason] : model.admin ? tr('الوصول الإداري ليس إثبات إنجاز. النتائج الفعلية هي التي تحدد حالة التقييم والشهادة.','Administrator access is not proof of completion. Actual results determine assessment and certificate status.') : model.lessons === null ? tr('اتبع الدورات بالترتيب، ثم راجع شروط التقييم.','Follow the courses in order, then review assessment requirements.') : tr(`${model.lessons} من ${model.total} درساً موثّقاً. التدريب للمراجعة، والإكمال يتطلب أسئلة التحقق.`,`${model.lessons} of ${model.total} verified lessons. Practice supports review; completion requires checkpoints.`)}</p></div>${action}</div><ol class="learner-milestones">${model.steps.map((step,i)=>`<li class="is-${step.state}" ${step.state==='current'&&!model.reason?'aria-current="step"':''}><span class="milestone-number" aria-hidden="true">${step.state==='complete'?'✓':i+1}</span><div><strong>${labels[step.id]}</strong><small>${step.state==='complete'?tr('إنجاز موثّق','Verified completion'):notes[step.id]}</small></div></li>`).join('')}</ol><p class="learner-route-footnote">${tr('الكويزات والمختبرات والتحديات وغرف العمليات تدعم تعلّمك؛ فتحها أو زيارتها لا يُسجّل نجاحاً في الامتحان.','Quizzes, labs, challenges and operations rooms support learning; opening them does not record an exam pass.')}</p></section>`);
  if (model.action) hero.querySelector('.path-access-card .button-primary')?.remove();
  root.querySelector('[data-journey-signin]')?.addEventListener('click',()=>document.querySelector('#account-button')?.click());
}

export function mountLessonExperience(root, options) {
  const article = root.querySelector('.lesson-article,.library-reading');
  if (!article) return;
  observers.get(root)?.disconnect();
  const tr = trFor(options.language), checkpoint = root.querySelector(`#${options.checkpointId}`);
  if (!checkpoint) return;
  const originalNav = root.querySelector('.lesson-study-nav');
  if (originalNav) {
    const details=document.createElement('details');details.className='lesson-contents';
    const summary=document.createElement('summary');summary.textContent=tr('محتويات هذا الدرس','Inside this lesson');details.append(summary);
    originalNav.before(details);details.append(originalNav);
  }
  const apply = root.querySelector('#lesson-application') || root.querySelector('#foundation-response') || root.querySelector('.learning-practice-output') || root.querySelector('.lesson-example');
  if (apply && !apply.id) apply.id='lesson-apply';
  const steps=[{id:options.readId,label:tr('اقرأ وافهم','Read and understand')},...(apply?[{id:apply.id,label:tr('طبّق الفكرة','Apply the idea')}]:[]),{id:options.checkpointId,label:tr('تحقق من فهمك','Check understanding')}];
  const bar=document.createElement('section');bar.className='lesson-route-bar';
  bar.setAttribute('aria-label',tr('خطوات الدرس','Lesson steps'));
  bar.innerHTML=`<div class="lesson-route-meta"><span>${tr(`الدرس ${options.position} من ${options.total}`,`Lesson ${options.position} of ${options.total}`)}</span><strong>${options.complete?tr('إكمال موثّق في حسابك','Verified completion in your account'):tr('قراءة · تطبيق · تحقق','Read · apply · check')}</strong>${options.minutes?`<span>${options.minutes} ${tr('دقيقة تقريباً','estimated min')}</span>`:''}</div><nav aria-label="${tr('انتقل داخل الدرس','Navigate this lesson')}">${steps.map((step,i)=>`<a href="#${esc(step.id)}"><b aria-hidden="true">${i+1}</b>${step.label}</a>`).join('')}</nav>`;
  const hero=root.querySelector('.learning-hero,.catalog-hero');
  if(hero) hero.after(bar);else article.before(bar);
  const continuation=lessonContinuation(options);
  const footer=document.createElement('section');footer.className='lesson-next-step';
  footer.innerHTML=`<div><span class="section-kicker">${tr('خطوتك التالية','YOUR NEXT STEP')}</span><h2>${options.complete?tr('الدرس مكتمل. واصل رحلتك.','Lesson complete. Keep going.'):options.ready===false?tr('أكمل متطلبات الدرس أولاً','Complete the previous requirements first'):tr('حوّل فهمك إلى إنجاز موثّق','Turn understanding into verified progress')}</h2><p>${options.complete?tr('إكمالك محفوظ في حسابك؛ يمكنك مراجعة هذا الدرس في أي وقت.','Completion is saved to your account; revisit this lesson at any time.'):tr('قراءة الصفحة وحدها لا تكمل الدرس. أجب عن سؤال التحقق واحصل على نتيجة صحيحة.','Reading alone does not complete the lesson. Submit the checkpoint and receive a correct result.')}</p></div><div class="lesson-next-actions"><a class="button button-primary" href="${esc(continuation.href)}">${continuation.kind==='next'?esc(options.nextLabel||tr('تابع تعلّمك','Continue learning')):continuation.kind==='previous'?tr('راجع ترتيب الدروس','Review lesson order'):tr('انتقل لسؤال التحقق','Go to the checkpoint')} <span aria-hidden="true">${options.language==='ar'?'←':'→'}</span></a><a class="lesson-course-return" href="${esc(options.courseHref)}">${tr('ارجع إلى الدورة','Back to the course')}</a></div>`;
  root.querySelector('.library-next')?.remove();
  if (options.complete) checkpoint.querySelectorAll(':scope > a').forEach(link=>link.remove());
  const sources=root.querySelector('.learning-source-links');
  if(sources)sources.before(footer);else root.append(footer);
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(!visible)return;
    for(const link of bar.querySelectorAll('nav a')){if(link.hash===`#${visible.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  },{rootMargin:'-10% 0px -60% 0px'});
  for(const step of steps){const target=root.querySelector(`#${step.id}`);if(target)observer.observe(target);}
  observers.set(root,observer);
}
