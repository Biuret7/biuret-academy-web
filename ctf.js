import {user,loadUser} from './auth.js?v=20261011-ui2';
import {fullName} from './full-name.js?v=20261011-ui2';
import {currentLanguage,setPageHeaderTitle} from './i18n.js?v=20261011-ui2';
import {ctfChallenges,ctfCategories,ctfLevels,ctfGuides,ctfBeginnerPack,ctfStats,filterCTFChallenges} from './ctf-model.js?v=20261011-ui2';
const root=document.getElementById('ctf-main');
const tr=(ar,en)=>currentLanguage()==='ar'?ar:en,localized=value=>value[currentLanguage()];
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
const number=value=>new Intl.NumberFormat(currentLanguage()).format(value);
const modes={cipher:['لغز تشفير','Cipher puzzle'], 'offline-sites':['تحقيق في مواقع محلية','Offline web investigation'],image:['تحليل صورة','Image analysis'],debugging:['إصلاح شيفرة واختبارها','Debug & test'],console:['غرفة تحقيق محلية','Local investigation console']};
const mode=c=>localized({ar:modes[c.package?.mode||'console'][0],en:modes[c.package?.mode||'console'][1]});
const symbols={cipher:'notes','offline-sites':'search',image:'labs',debugging:'tools',console:'operations'};
let owner=null,generation=0,availability='ready',category='all',level='all',query='',returnTo=null;
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
function badge(c){return el('span',c.status==='ready'?tr('جاهز الآن','Ready now'):tr('قيد التخطيط','Planned'),'ctf-status '+c.status);}
function download(pkg,text,cls='button button-primary'){const a=el('a',text,cls);a.href=pkg.url;a.download=pkg.url.split('/').pop();return a;}
function facts(c){
 const n=el('div',null,'ctf-facts');n.append(el('span',localized(ctfLevels[c.level])+' · '+c.level+'/5'));
 if(c.package?.minutes){const duration=el('span'),range=el('bdi',c.package.minutes);range.dir='ltr';duration.append(range,' '+tr('دقيقة','min'));n.append(duration);}
 return n;
}
function reset(){category=level='all';query='';render();}
function render(){
 if(!owned()){root.replaceChildren();return;}
 setPageHeaderTitle({ar:'Biuret CTF · التحديات',en:'Biuret CTF · Challenge collection'});root.replaceChildren();
 const challenge=ctfChallenges.find(c=>c.id===location.hash.slice(1));
 if(challenge){renderMission(challenge);return;}
 const hero=el('section',null,'section-frame ctf-hero'),intro=el('div'),title=el('h1',tr('خطوتك التالية: اكتشاف.','Your next move: discovery.'));title.tabIndex=-1;
 intro.append(el('span','BIURET / CAPTURE THE FLAG','section-kicker'),title,el('p',tr('اختر مهمة، افهم الأدلة، وابنِ حلك بنفسك. كل بطاقة توضح الصعوبة وطريقة العمل قبل أن تبدأ.','Choose a mission, understand the evidence, and build your own solution. Every card shows its difficulty and workflow before you begin.')));
 const stats=el('div',null,'ctf-stats');
 for(const [value,label]of [[ctfStats.ready,tr('حزم جاهزة','Ready packages')],[ctfStats.planned,tr('أفكار قادمة','Planned concepts')],[5,tr('مستويات صعوبة','Difficulty levels')]]){const stat=el('div');stat.append(el('strong',number(value)),el('span',label));stats.append(stat);}
 hero.append(intro,stats);root.append(hero);
 const beginner=el('section',null,'section-frame ctf-beginner'),copy=el('div');
 copy.append(el('span',tr('ابدأ هنا · سهل جداً','START HERE · VERY EASY'),'section-kicker'),el('h2',tr('أربع مهام. بداية واحدة واضحة.','Four missions. One clear starting point.')),el('p',tr('رسالة مشفرة ← تحقيق OSINT ← صورة مخفية ← إصلاح برنامج. اقرأ التعليمات، جرّب، ثم تحقق محلياً من إجابتك.','A cipher → an OSINT case → hidden image data → a broken program. Read the briefing, experiment, then check your answer locally.')));
 const actions=el('div',null,'ctf-beginner-actions');actions.append(button(tr('اعرض تحديات البداية','Explore beginner missions'),'button button-primary',()=>{availability='ready';category='all';level='1';query='';render();root.querySelector('.ctf-toolbar')?.scrollIntoView({block:'start'});}),download(ctfBeginnerPack,tr('تنزيل حزمة المبتدئين','Download beginner pack'),'button button-outline'));beginner.append(copy,actions);root.append(beginner);
 const note=el('details',null,'section-frame ctf-note');note.append(el('summary',tr('كيف ألعب؟ وما الذي يُحفظ في حسابي؟','How do I play, and what is saved to my account?')),el('p',tr('نزّل الملفات وشغّلها محلياً. Username Hunter يستخدم مواقع خيالية تفتح من مجلدك في المتصفح؛ بقية الحزم تستخدم Python. Hidden Pixel وحده يحتاج Pillow. التحديات قيد التخطيط ليس لها ملفات بعد. التحقق المحلي لا يُحفظ كتقدم موثق، ولا يمنح XP أو عملات أو شهادة. امتحانات وشهادات المسارات مستقلة.','Download the files and work locally. Username Hunter uses fictional sites opened from your folder in a browser; the other packages use Python. Only Hidden Pixel needs Pillow. Planned challenges have no files yet. Local checks do not save verified platform progress or award XP, coins or certificates. Path exams and credentials are separate.')));root.append(note);
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
   const footer=el('div',null,'ctf-card-footer');footer.append(el('span',c.package?tr('اقرأ المهمة وابدأ','Read briefing & begin'):tr('استكشف الفكرة','Explore the concept')),el('span',tr('←','→'),'ctf-arrow'));card.append(footer);list.append(card);
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
 const integrity=el('details',null,'ctf-integrity');integrity.append(el('summary',tr('فحص سلامة التنزيل','Verify your download')),el('p',tr('قارن SHA-256 للملف المنزّل بالقيمة أدناه.','Compare the downloaded file’s SHA-256 with the value below.')));const digest=el('code',c.package.sha256);digest.dir='ltr';integrity.append(digest);aside.append(integrity,el('p',tr('تحقق محلي من الإجابة · لا تُسجل نتائج CTF في الحساب حالياً.','Local answer checks · CTF results are not saved to your account yet.'),'ctf-download-note'));layout.append(content,aside);box.append(layout);root.append(box);
}
async function refresh(){const ticket=++generation;if(!user())try{await loadUser();}catch{}if(ticket!==generation)return;owner=user()?.$id||null;render();}
window.addEventListener('biuret-auth-changed',refresh);window.addEventListener('hashchange',render);window.addEventListener('popstate',render);new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});if(root)refresh();
