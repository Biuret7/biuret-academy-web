import {user,loadUser,loadCTFState,submitCTFFlag} from './auth.js?v=20261013-learning3';
import {ctfRewards,CTF_MAX_ATTEMPTS} from './ctf-rewards.js?v=20261013-learning3';
import {fullName} from './full-name.js?v=20261013-learning3';
import {currentLanguage,setPageHeaderTitle} from './i18n.js?v=20261013-learning3';
import {ctfChallenges,ctfCategories,ctfLevels,ctfGuides,ctfBeginnerPack,ctfEasyPack,ctfStats,filterCTFChallenges} from './ctf-model.js?v=20261013-learning3';
const root=document.getElementById('ctf-main');
const tr=(ar,en)=>currentLanguage()==='ar'?ar:en,localized=value=>value[currentLanguage()];
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const number=value=>new Intl.NumberFormat(currentLanguage()).format(value);
const modes={cipher:['لغز تشفير','Cipher puzzle'], 'offline-sites':['تحقيق في مواقع محلية','Offline web investigation'],image:['تحليل صورة','Image analysis'],debugging:['تحليل شيفرة وبيانات','Code & data analysis'],console:['تحقيق محلي','Local investigation'],'local-web':['تطبيق ويب محلي','Local web application']};
const mode=c=>localized({ar:modes[c.package?.mode||'console'][0],en:modes[c.package?.mode||'console'][1]});
const symbols={cipher:'notes','offline-sites':'search',image:'labs',debugging:'tools',console:'operations','local-web':'labs'};
let owner=null,generation=0,availability='ready',category='all',level='all',query='',returnTo=null;
let verified=null,verifiedStatus='loading',submitting=false;
const completion=c=>verified?.completions?.find(p=>p.challengeId===c.id);
const owned=()=>owner&&user()?.$id===owner&&fullName(user()?.name);
function button(text,cls,action){const n=el('button',text,cls);n.type='button';n.addEventListener('click',action);return n;}
function navigate(id){
 if(id)returnTo=id;
 history.pushState(null,'',location.pathname+location.search+(id?'#'+id:''));render();
 if(id){root.querySelector('h1')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else root.querySelector('[data-challenge="'+returnTo+'"] .ctf-card-link')?.focus();
}
function icon(c){
 const n=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS(n.namespaceURI,'use');
 n.setAttribute('viewBox','0 0 24 24');n.setAttribute('aria-hidden','true');
 use.setAttribute('href','assets/sidebar-icons.svg#'+symbols[c.package?.mode||'console']);n.append(use);return n;
}
function badge(c){return el('span',completion(c)?tr('✓ إنجاز موثق','✓ Verified completion'):c.status==='ready'?tr('جاهز الآن','Ready now'):tr('قيد التخطيط','Planned'),'ctf-status '+(completion(c)?'completed':c.status));}
function download(pkg,text,cls='button button-primary'){const a=el('a',text,cls);a.href=pkg.url;a.download=pkg.url.split('/').pop();return a;}
function facts(c){
 const n=el('div',null,'ctf-facts');n.append(el('span',localized(ctfLevels[c.level])+' · '+c.level+'/5'));
 if(c.package?.minutes){const duration=el('span'),range=el('bdi',c.package.minutes);range.dir='ltr';duration.append(range,' '+tr('دقيقة','min'));n.append(duration);}
 if(c.package){const reward=ctfRewards[c.level],xp=el('bdi','+'+reward.xp+' XP');xp.dir='ltr';n.append(xp,el('span',number(reward.points)+' '+tr('نقطة CTF','CTF points')));}
 return n;
}
function reset(){category=level='all';query='';render();}
function render(){
 if(!owned()){root.replaceChildren();return;}
 setPageHeaderTitle({ar:'Biuret CTF · التحديات',en:'Biuret CTF · Challenge collection'});root.replaceChildren();
 const challenge=ctfChallenges.find(c=>c.id===location.hash.slice(1));
 if(challenge){renderMission(challenge);return;}
 const progress=el('section',null,'section-frame ctf-progress');progress.setAttribute('aria-live','polite');
 if(verifiedStatus==='ready'){progress.append(el('strong',tr('إنجازك في Biuret CTF','Your Biuret CTF achievements')),el('span',number(verified.completions.length)+' / '+number(ctfStats.ready)+' '+tr('تحديات موثقة','verified challenges')),el('bdi',verified.points+' CTF · '+verified.xp+' XP · '+verified.coins+' BC'));}
 else {progress.append(el('span',verifiedStatus==='loading'?tr('جارٍ تحميل إنجازاتك…','Loading your achievements…'):tr('تعذّر تحميل الإنجازات. أعد المحاولة قبل تسليم الإجابة.','Achievements could not load. Retry before submitting.')));if(verifiedStatus==='error')progress.append(button(tr('إعادة المحاولة','Retry'),'button button-outline',refresh));}
 root.append(progress);
 const hero=el('section',null,'section-frame ctf-hero'),intro=el('div'),title=el('h1',tr('خطوتك التالية: اكتشاف.','Your next move: discovery.'));title.tabIndex=-1;
 intro.append(el('span','BIURET / CAPTURE THE FLAG','section-kicker'),title,el('p',tr('اختر مهمة، افهم الأدلة، وابنِ حلك بنفسك. كل بطاقة توضح الصعوبة وطريقة العمل قبل أن تبدأ.','Choose a mission, understand the evidence, and build your own solution. Every card shows its difficulty and workflow before you begin.')));
 const stats=el('div',null,'ctf-stats');
 for(const [value,label]of [[ctfStats.ready,tr('حزم جاهزة','Ready packages')],[ctfStats.planned,tr('أفكار قادمة','Planned concepts')],[5,tr('مستويات صعوبة','Difficulty levels')]]){const stat=el('div');stat.append(el('strong',number(value)),el('span',label));stats.append(stat);}
 hero.append(intro,stats);root.append(hero);
 const beginner=el('section',null,'section-frame ctf-beginner'),copy=el('div');
 copy.append(el('span',tr('ابدأ هنا · سهل جداً','START HERE · VERY EASY'),'section-kicker'),el('h2',tr('أربع مهام. بداية واحدة واضحة.','Four missions. One clear starting point.')),el('p',tr('رسالة مشفرة ← تحقيق OSINT ← صورة مخفية ← إصلاح برنامج. اقرأ التعليمات، جرّب، ثم تحقق محلياً من إجابتك.','A cipher → an OSINT case → hidden image data → a broken program. Read the briefing, experiment, then check your answer locally.')));
 const actions=el('div',null,'ctf-beginner-actions');actions.append(button(tr('اعرض تحديات البداية','Explore beginner missions'),'button button-primary',()=>{availability='ready';category='all';level='1';query='';render();root.querySelector('.ctf-toolbar')?.scrollIntoView({block:'start'});}),download(ctfBeginnerPack,tr('تنزيل حزمة المبتدئين','Download beginner pack'),'button button-outline'));beginner.append(copy,actions);root.append(beginner);
 const easy=el('section',null,'section-frame ctf-beginner'),easyCopy=el('div');
 easyCopy.append(el('span',tr('خطوتك التالية · Easy · ٢/٥','NEXT STEP · EASY · 2/5'),'section-kicker'),el('h2',tr('ست مهام. مهارات أعمق.','Six missions. Deeper skills.')),el('p',tr('تشفير، سجلات، OSINT، أمن ويب، تحليل شيفرة واستعادة بيانات. كلها محلية؛ ابدأ بعد تحديات البداية، ثم سلّم الـflag أسفل صفحة المهمة.','Cryptography, logs, OSINT, web security, code analysis and data recovery. All run locally. Continue after the beginner missions, then submit the flag at the bottom of the briefing.')));
 const easyActions=el('div',null,'ctf-beginner-actions');easyActions.append(button(tr('اعرض تحديات Easy','Explore Easy missions'),'button button-outline',()=>{availability='ready';category='all';level='2';query='';render();root.querySelector('.ctf-toolbar')?.scrollIntoView({block:'start'});}),download(ctfEasyPack,tr('تنزيل حزمة Easy','Download Easy pack'),'button button-outline'));easy.append(easyCopy,easyActions);root.append(easy);
 const note=el('details',null,'section-frame ctf-note');note.append(el('summary',tr('كيف ألعب؟ وما الذي يُحفظ في حسابي؟','How do I play, and what is saved to my account?')),el('p',tr('نزّل الملفات وشغّلها محلياً. Username Hunter يستخدم مواقع خيالية تفتح من مجلدك في المتصفح؛ بقية الحزم تستخدم Python. Hidden Pixel وحده يحتاج Pillow. التحديات قيد التخطيط ليس لها ملفات بعد. أدخل الـflag في صفحة المهمة ليحفظ الخادم إنجازك ويمنحك نقاط CTF وXP مرة واحدة. العملات لـPlus وPro فقط. التحقق المحلي وحده لا يحفظ التقدم، وشهادات المسارات مستقلة.','Download the files and work locally. Username Hunter uses fictional sites opened from your folder in a browser; the other packages use Python. Only Hidden Pixel needs Pillow. Planned challenges have no files yet. Submit the flag on the mission page to save a server-verified completion and earn CTF points and XP once. Coins require Plus or Pro. Local checks alone do not save progress; path credentials remain separate.')));root.append(note);
 const toolbar=el('section',null,'section-frame ctf-toolbar'),tabs=el('div',null,'ctf-filters');tabs.setAttribute('role','group');tabs.setAttribute('aria-label',tr('توفر التحديات','Challenge availability'));const tabButtons=[];
 for(const [value,label]of [['ready',tr('جاهز الآن','Ready now')],['all',tr('المجموعة كاملة','All challenges')],['planned',tr('قيد التخطيط','Planned')]]){const count=value==='all'?ctfStats.total:ctfStats[value];const b=button(label+' ('+number(count)+')','button button-outline',()=>{availability=value;cards();});b.dataset.availability=value;tabs.append(b);tabButtons.push(b);}
 const fields=el('div',null,'ctf-search-fields'),searchLabel=el('label',tr('البحث','Search')),search=el('input');search.type='search';search.value=query;search.placeholder=tr('اسم التحدي أو موضوعه…','Challenge name or topic…');search.maxLength=100;searchLabel.append(search);
 function select(label,options,value,onchange){const wrapper=el('label',label),node=el('select');for(const [id,text]of options){const option=el('option',text);option.value=id;node.append(option);}node.value=value;node.addEventListener('change',()=>onchange(node.value));wrapper.append(node);return wrapper;}
 fields.append(searchLabel,select(tr('التخصص','Specialty'),[['all',tr('جميع التخصصات','All specialties')],...Object.entries(ctfCategories).map(([id,label])=>[id,localized(label)])],category,value=>{category=value;cards();}),select(tr('الصعوبة','Difficulty'),[['all',tr('جميع المستويات','All levels')],...Object.entries(ctfLevels).map(([id,label])=>[id,localized(label)+' · '+id+'/5'])],level,value=>{level=value;cards();}));
 const resultRow=el('div',null,'ctf-result-row'),results=el('p',null,'ctf-results');results.setAttribute('role','status');results.setAttribute('aria-live','polite');const clear=button(tr('مسح المرشحات','Clear filters'),'button button-text',()=>reset());resultRow.append(results,clear);const list=el('div',null,'ctf-grid');
 function cards(){
  list.replaceChildren();for(const b of tabButtons)b.setAttribute('aria-pressed',String(b.dataset.availability===availability));
  clear.hidden=category==='all'&&level==='all'&&!query;
  const match=filterCTFChallenges({availability,category,level,query});results.textContent=tr(number(match.length)+' من التحديات · اضغط البطاقة لقراءة المهمة',number(match.length)+' challenges · select a card for its briefing');
  for(const c of match){
   const card=el('article',null,'section-frame ctf-card '+c.status);card.dataset.challenge=c.id;
   const top=el('div',null,'ctf-card-top'),emblem=el('span',null,'ctf-emblem');emblem.append(icon(c));top.append(emblem,badge(c));card.append(top,el('span',localized(ctfCategories[c.category]),'section-kicker'));
   const heading=el('h2'),link=el('a',localized(c.title),'ctf-card-link');link.href='#'+c.id;
   link.addEventListener('click',event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(c.id);}});heading.append(link);card.append(heading,el('p',localized(c.brief)),facts(c));
   if(c.package){const requirements=el('p',null,'ctf-requirements'),python=el('bdi','Python '+c.package.python);python.dir='ltr';requirements.append(python,' · '+(c.package.dependencies?.length?'Pillow':tr('دون مكتبات إضافية','No extra packages')));card.append(el('span',mode(c),'ctf-workflow'),requirements);}
   const footer=el('div',null,'ctf-card-footer');footer.append(el('span',completion(c)?tr('عرض سجل الإنجاز','View achievement record'):c.package?tr('اقرأ المهمة وابدأ','Read briefing & begin'):tr('استكشف الفكرة','Explore the concept')),el('span',tr('←','→'),'ctf-arrow'));card.append(footer);list.append(card);
  }
  if(!match.length){const empty=el('div',null,'section-frame ctf-empty');empty.append(el('h2',tr('لا توجد تحديات مطابقة','No matching challenges')),el('p',tr('جرّب كلمة أخرى أو أعد ضبط المرشحات.','Try another search or reset your filters.')),button(tr('إعادة ضبط المرشحات','Reset filters'),'button button-outline',()=>reset()));list.append(empty);}
 }
 search.addEventListener('input',()=>{query=search.value;cards();});toolbar.append(tabs,fields,resultRow);root.append(toolbar,list);cards();
}
function renderMission(c){
 setPageHeaderTitle({ar:'Biuret CTF · '+c.title.ar,en:'Biuret CTF · '+c.title.en});
 const box=el('article',null,'section-frame ctf-mission');box.append(button(tr('→ مجموعة التحديات','← Challenge collection'),'button button-text',()=>navigate(null)),badge(c));const title=el('h1',localized(c.title));title.tabIndex=-1;box.append(el('span',localized(ctfCategories[c.category]),'section-kicker'),title,el('p',localized(c.brief)),facts(c));
 if(!c.package){box.append(el('h2',tr('فكرة ضمن خطة المجموعة','Part of the collection roadmap')),el('p',tr('هذه فكرة تحدٍّ من المجموعة الأصلية؛ ملفات اللاعب والأدلة لم تُجهّز بعد.','This concept comes from the original collection; its player files and evidence are not yet prepared.')),button(tr('اعرض الحزم الجاهزة','Browse ready packages'),'button button-primary',()=>{availability='ready';category=level='all';query='';navigate(null);}));root.append(box);return;}
 const guide=ctfGuides[c.id],layout=el('div',null,'ctf-mission-layout'),content=el('div');
 function section(title,items){const s=el('section',null,'ctf-section');s.append(el('h2',title));const list=el('ol');for(const item of items)list.append(el('li',localized(item)));s.append(list);content.append(s);}
 section(tr('١ · افهم المهمة','1 · Understand the mission'),guide.objectives);section(tr('٢ · جهّز بيئتك','2 · Prepare your environment'),guide.setup);
 const commands=el('section',null,'ctf-section');commands.append(el('h2',tr('٣ · جرّب وتحقق','3 · Experiment & check')));
 for(const command of guide.commands){commands.append(el('h3',localized(command.title)));const code=el('pre','# Windows\n'+(command.windows||'py -3 -X utf8 '+command.file)+'\n\n# macOS / Linux\n'+(command.unix||'python3 '+command.file),'ctf-evidence');code.dir='ltr';commands.append(code,el('p',localized(command.note)));}content.append(commands);
 section(tr('قواعد المهمة','Mission rules'),guide.rules);
 const help=el('details',null,'ctf-help');help.append(el('summary',tr('عالِق؟ جرّب هذه الخطوات قبل طلب المساعدة','Stuck? Try these steps before asking for help')),el('p',tr('تأكد من فتح الطرفية داخل المجلد الصحيح وقراءة README. للحزم الأولى افتح HINTS.md واقرأ تلميحاً واحداً فقط، ثم اكتب فرضية وجربها. وثّق ما جربته وما تعلّمته في تقريرك.','Check that your terminal is in the correct folder and read the README. For beginner packages, open HINTS.md and read one hint, then form and test a hypothesis. Record your attempts and learning in your report.')));content.append(help);
 const aside=el('aside',null,'ctf-download');aside.append(el('span',mode(c),'section-kicker'),el('h2',tr('ملفات المهمة','Mission files')),el('p',tr('نزّل، استخرج، ثم اتبع الخطوات بالترتيب. لا يتضمن التنزيل دليل حلول المنظم.','Download, extract, and follow the steps in order. The organizer solution guide is excluded.')),download(c.package,tr('تنزيل التحدي ZIP','Download challenge ZIP')));
 const details=el('dl');for(const [label,value]of [[tr('المتطلبات','Requirements'),'Python '+c.package.python],[tr('المكتبات الإضافية','Extra dependencies'),c.package.dependencies?.join(', ')||tr('لا يوجد','None')],[tr('حجم التنزيل','Download size'),(c.package.bytes/1024).toFixed(1)+' KB'],[tr('ملفات الحزمة','Package files'),number(c.package.files.length)],...(c.package.minutes?[[tr('الوقت التقديري','Estimated time'),tr(c.package.minutes+' دقيقة',c.package.minutes+' min')]]:[])])details.append(el('dt',label),el('dd',value));aside.append(details);
 const integrity=el('details',null,'ctf-integrity');integrity.append(el('summary',tr('فحص سلامة التنزيل','Verify your download')),el('p',tr('قارن SHA-256 للملف المنزّل بالقيمة أدناه.','Compare the downloaded file’s SHA-256 with the value below.')));const digest=el('code',c.package.sha256);digest.dir='ltr';integrity.append(digest);aside.append(integrity,el('p',tr('تحقق محلياً أثناء التعلم، ثم سلّم الـflag في هذه الصفحة لحفظ الإنجاز.','Check locally while learning, then submit your flag on this page to save the achievement.'),'ctf-download-note'));layout.append(content,aside);box.append(layout,submissionPanel(c));root.append(box);
}
function submissionPanel(c){
 const panel=el('section',null,'ctf-submit-panel'),reward=ctfRewards[c.level],done=completion(c);
 panel.append(el('span',tr('التسليم والإنجاز','SUBMIT & ACHIEVE'),'section-kicker'),el('h2',done?tr('أتممت هذه المهمة','You completed this mission'):tr('وجدت الـflag؟ أثبت إنجازك هنا','Found the flag? Verify your achievement here')));
 if(done){
  const list=el('dl',null,'ctf-proof');
  for(const [label,value]of [[tr('المتعلم','Learner'),done.learnerName],[tr('تاريخ الإنجاز','Completed'),new Date(done.completedAt).toLocaleString(currentLanguage())],[tr('المكافأة المحفوظة','Saved reward'),done.points+' CTF · '+done.xp+' XP · '+done.coins+' BC'],[tr('معرّف الإثبات','Record ID'),done.id]]){const dd=el('dd',value);if(value===done.id||label===tr('المكافأة المحفوظة','Saved reward'))dd.dir='ltr';else dd.dir='auto';list.append(el('dt',label),dd);}
  panel.append(list,el('p',tr('تحقّق الخادم من مطابقة الـflag وحفظ الإنجاز في حسابك. هذا سجل إنجاز لتحدٍّ، وليس شهادة إكمال مسار أو اعتماداً مهنياً. المكافأة لا تتكرر.','The server matched your flag and saved this achievement to your account. This is a challenge achievement record, not a path certificate or professional accreditation. Rewards are granted once.')),
   button(tr('تنزيل سجل الإنجاز','Download achievement record'),'button button-outline',()=>{
    const blob=new Blob([JSON.stringify({issuer:'Biuret Academy',type:'CTF achievement record',...done},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='biuret-ctf-'+c.id+'-achievement.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   }));return panel;
 }
 panel.append(el('p',tr('المكافأة: '+reward.points+' نقطة CTF و'+reward.xp+' XP. '+(verified?.coinEarning?reward.coins+' Biuret Coins.':'عملات Biuret متاحة لـPlus وPro فقط.'),'Reward: '+reward.points+' CTF points and '+reward.xp+' XP. '+(verified?.coinEarning?reward.coins+' Biuret Coins.':'Biuret Coins are available to Plus and Pro only.'))));
 if(verifiedStatus!=='ready'){panel.append(el('p',verifiedStatus==='loading'?tr('جارٍ تحميل سجل الإنجاز…','Loading achievement records…'):tr('تعذّر الاتصال بخدمة التحقق؛ لن نعرض إنجازاً قبل حفظه.','The verification service is unavailable; completion is shown only after saving.')));if(verifiedStatus==='error')panel.append(button(tr('إعادة المحاولة','Retry'),'button button-outline',refresh));return panel;}
 const form=el('form',null,'ctf-flag-form'),label=el('label',tr('أدخل الـflag الكامل كما وجدته','Enter the complete flag exactly as found')),input=el('input');
 input.type='text';input.name='flag';input.dir='ltr';input.autocomplete='off';input.spellcheck=false;input.required=true;input.maxLength=256;input.minLength=3;input.placeholder='FLAG{…}';label.append(input);
 const submit=el('button',submitting?tr('جارٍ التحقق…','Verifying…'):tr('تحقق واحفظ الإنجاز','Verify & save achievement'),'button button-primary');submit.type='submit';input.disabled=submit.disabled=submitting;
 const feedback=el('p',null,'ctf-submit-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 form.append(label,submit,feedback);panel.append(form,el('small',tr('محاولات محدودة: '+CTF_MAX_ATTEMPTS+' يومياً لكل تحدٍّ (UTC). حساسية الأحرف مهمة. لا يُحفظ نص الـflag.','Limited to '+CTF_MAX_ATTEMPTS+' attempts per challenge per UTC day. Flags are case-sensitive. Flag text is not stored.')));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||!owned())return;
  const accountId=owner;submitting=true;input.disabled=submit.disabled=true;submit.textContent=tr('جارٍ التحقق…','Verifying…');feedback.textContent='';
  try{
   const result=await submitCTFFlag(c.id,input.value);
   if(!owned()||owner!==accountId)return;
   verified=result;verifiedStatus='ready';input.value='';render();window.dispatchEvent(new Event('biuret-rewards-changed'));
  }catch(error){
   if(!owned()||owner!==accountId)return;
   const code=error.details?.error;
   feedback.textContent=code==='CTF_WRONG_FLAG'?tr('الـflag غير صحيح. راجع الأدلة؛ بقي '+error.details.remaining+' محاولات اليوم.','Incorrect flag. Review your evidence; '+error.details.remaining+' attempts remain today.')
    :code==='CTF_ATTEMPT_LIMIT'?tr('وصلت لحد محاولات اليوم. يمكنك المحاولة بعد ','Daily attempt limit reached. Try again after ')+new Date(error.details.retryAt).toLocaleString(currentLanguage())
    :code==='CTF_INVALID_FLAG'?tr('اكتب الـflag الكامل دون أسطر إضافية.','Enter the complete flag without extra lines.')
    :tr('تعذّر حفظ النتيجة. أعد المحاولة؛ لن تتكرر المكافأة إذا كان الإنجاز قد حُفظ.','Could not save the result. Retry; a saved achievement cannot award twice.');
   feedback.dataset.state='error';
  }finally{submitting=false;input.disabled=submit.disabled=false;submit.textContent=tr('تحقق واحفظ الإنجاز','Verify & save achievement');if(owned()&&!root.contains(form))render();}
 });return panel;
}
async function refresh(){
 const ticket=++generation;if(!user())try{await loadUser();}catch{}
 if(ticket!==generation)return;owner=user()?.$id||null;verified=null;verifiedStatus='loading';render();
 if(!owned())return;const accountId=owner;
 try{const result=await loadCTFState();if(ticket!==generation||user()?.$id!==accountId)return;verified=result;verifiedStatus='ready';}
 catch{if(ticket!==generation||user()?.$id!==accountId)return;verifiedStatus='error';}
 render();
}
window.addEventListener('biuret-auth-changed',refresh);window.addEventListener('hashchange',render);window.addEventListener('popstate',render);new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});if(root)refresh();
