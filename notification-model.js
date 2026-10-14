import {academyPaths} from './path-catalog-data.js?v=20261014-notify1';
export function notificationCopy(item,language='ar') {
  const en=language==='en',path=academyPaths.find(x=>x.id===item.pathId),title=path?.title[en?'en':'ar'];
  if(!/^n_[a-f0-9]{32}$/.test(item.id || '') || !Number.isFinite(Date.parse(item.occurredAt)))return null;
  if(item.type==='credential-ready' && path && /^c_[a-f0-9]{32}$/.test(item.reference || ''))return {
    title:en?'Your certificate is ready':'شهادتك جاهزة',
    description:en?`You completed ${title}. View and download your certificate from your account.`:`أكملت مسار ${title}. اعرض شهادتك ونزّلها من حسابك.`,
    action:en?'View certificate':'عرض الشهادة',icon:'certificate',
    href:item.pathId==='foundations'?'account.html?screen=certificate':`learn.html?screen=path-exam&path=${item.pathId}&id=${item.pathId}`};
  if(item.type==='report-reviewed' && path && /^s_[a-f0-9]{32}$/.test(item.reference || '') && ['accepted','changes_requested'].includes(item.decision))return {
    title:item.decision==='accepted'?(en?'Your report was accepted':'تم قبول تقريرك'):(en?'Your report needs changes':'تقريرك يحتاج تعديلات'),
    description:en?`Your practical report for ${title} has been reviewed. Read the feedback and follow the next step.`:`تمت مراجعة تقريرك العملي لمسار ${title}. اقرأ الملاحظات وتابع الخطوة المطلوبة.`,
    action:en?'Read feedback':'قراءة الملاحظات',icon:'report',href:`learn.html?screen=practical&path=${item.pathId}&id=${item.pathId}`};
  if(item.type==='weekly-summary' && /^week_\d{4}-\d{2}-\d{2}$/.test(item.reference || '') && ['lessons','ctf','xp'].every(k=>Number.isSafeInteger(item[k]) && item[k]>=0 && item[k]<=1000000))return {
    title:en?'Your learning week':'أسبوعك في التعلّم',description:en?`${item.lessons} verified lessons · ${item.ctf} CTF challenges · ${item.xp} XP earned.`:`${item.lessons} دروس موثقة · ${item.ctf} تحديات CTF · ${item.xp} XP مكتسبة.`,
    action:en?'View progress':'عرض التقدّم',icon:'progress',href:'account.html?screen=progress'};
  return null;
}
export const notificationIcons={
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  certificate:'<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M8 7h8M8 11h4M12 14l-2 7 4-2 4 2-2-7"/>',
  report:'<path d="M8 3h8l4 4v14H4V3h4M15 3v5h5M8 12h8M8 16h5"/>',
  progress:'<path d="M4 20h16M6 16v-4M12 16V8M18 16V4"/>'};
