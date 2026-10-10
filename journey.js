import { courses, lessonById } from './learning-content.js?v=20261010-guide6';

// The verified Academy library supplies the course, practical and exam steps.
// This overview points learners to those path requirements after Foundations.
export const specializations = [
  { id: 'web', pathId: 'path_appsec', title: { ar: 'أمن التطبيقات وDevSecOps', en: 'Application security and DevSecOps' }, summary: { ar: 'افهم HTTP والجلسات والصلاحيات، ثم حلّل تطبيقاً تدريبياً.', en: 'Understand HTTP, sessions and authorization, then inspect a training app.' }, topics: [{ ar: 'HTTP وأساسيات الويب', en: 'HTTP and web basics' }, { ar: 'الجلسات والتحكم بالوصول', en: 'Sessions and access control' }, { ar: 'فئات ثغرات OWASP', en: 'OWASP vulnerability classes' }, { ar: 'مختبر وتحليل وإصلاح', en: 'Lab, analysis and remediation' }], challengeTrack: 'web' },
  { id: 'soc', pathId: 'path_soc', title: { ar: 'العمليات الأمنية والاستجابة', en: 'Security operations and response' }, summary: { ar: 'ابدأ من السجلات والتنبيهات، ثم كوّن فرضية وقرار احتواء.', en: 'Start with logs and alerts, then build a hypothesis and containment decision.' }, topics: [{ ar: 'الشبكات ومصادر السجلات', en: 'Networks and log sources' }, { ar: 'فرز التنبيهات', en: 'Alert triage' }, { ar: 'الاستجابة للحوادث', en: 'Incident response' }, { ar: 'مختبر حالة وتحقيق', en: 'Case investigation lab' }], challengeTrack: 'forensics' },
  { id: 'pentest', pathId: 'path_pentest', title: { ar: 'اختبار الاختراق المصرّح', en: 'Authorized penetration testing' }, summary: { ar: 'من تحديد النطاق إلى التوثيق والإصلاح داخل بيئات تدريبية.', en: 'From scope to evidence and remediation in authorized training environments.' }, topics: [{ ar: 'النطاق والمنهجية', en: 'Scope and methodology' }, { ar: 'الشبكات والأدوات', en: 'Networks and tools' }, { ar: 'اختبار تطبيق تدريبي', en: 'Training app assessment' }, { ar: 'التقرير والإصلاح', en: 'Reporting and remediation' }] },
  { id: 'forensics', pathId: 'path_dfir', title: { ar: 'الأدلة الرقمية', en: 'Digital forensics' }, summary: { ar: 'احفظ سلامة الدليل، ابنِ خطاً زمنياً، وافصل الملاحظة عن الاستنتاج.', en: 'Preserve evidence, build a timeline and separate observations from conclusions.' }, topics: [{ ar: 'جمع الدليل وسلامته', en: 'Evidence collection and integrity' }, { ar: 'الخط الزمني والسجلات', en: 'Timelines and logs' }, { ar: 'تحليل الذاكرة', en: 'Memory analysis' }, { ar: 'تقرير التحقيق', en: 'Investigation report' }], challengeTrack: 'forensics' },
  { id: 'cloud', pathId: 'path_cloud', title: { ar: 'أمن السحابة', en: 'Cloud security' }, summary: { ar: 'تعلّم المسؤولية المشتركة وأقل صلاحية وضوابط البناء والنشر.', en: 'Learn shared responsibility, least privilege and secure delivery controls.' }, topics: [{ ar: 'مفاهيم السحابة والهوية', en: 'Cloud and identity basics' }, { ar: 'الإعدادات والصلاحيات', en: 'Configuration and permissions' }, { ar: 'الحاويات وسلسلة التوريد', en: 'Containers and supply chain' }, { ar: 'مختبر مراجعة إعدادات', en: 'Configuration review lab' }] },
  { id: 'malware', pathId: 'path_malware', title: { ar: 'تحليل البرمجيات والهندسة العكسية', en: 'Malware analysis and reverse engineering' }, summary: { ar: 'تحليل ساكن وآمن للملفات قبل الانتقال إلى سلوكها في بيئة معزولة.', en: 'Start with safe static file analysis before isolated behavior analysis.' }, topics: [{ ar: 'بنية الملفات', en: 'File structure' }, { ar: 'التحليل الثابت', en: 'Static analysis' }, { ar: 'مفاهيم الهندسة العكسية', en: 'Reverse engineering concepts' }, { ar: 'تقرير المؤشرات', en: 'Indicators report' }] },
  { id: 'grc', pathId: 'path_grc', title: { ar: 'الحوكمة والمخاطر والامتثال', en: 'Governance, risk and compliance' }, summary: { ar: 'اربط السياسات بتقييم المخاطر والاستمرارية والتدقيق.', en: 'Connect policy to risk assessment, continuity and audit.' }, topics: [{ ar: 'المفاهيم الأساسية', en: 'Security fundamentals' }, { ar: 'تقييم المخاطر', en: 'Risk assessment' }, { ar: 'سياسات الأمن', en: 'Security policy' }, { ar: 'التدقيق والتحسين', en: 'Audit and improvement' }] },
  { id: 'mobile', pathId: 'path_mobile', title: { ar: 'أمن تطبيقات الهاتف', en: 'Mobile application security' }, summary: { ar: 'احمِ التخزين والصلاحيات والاتصال وواجهات API في تطبيقات الهاتف.', en: 'Protect storage, permissions, transport and APIs in mobile apps.' }, topics: [{ ar: 'بنية تطبيق الهاتف', en: 'Mobile app architecture' }, { ar: 'التخزين والصلاحيات', en: 'Storage and permissions' }, { ar: 'الاتصال وواجهات API', en: 'Transport and APIs' }, { ar: 'تقرير الإصلاح', en: 'Remediation report' }] },
  { id: 'intel', pathId: 'path_threat_intel', title: { ar: 'استخبارات التهديدات وOSINT', en: 'Threat intelligence and OSINT' }, summary: { ar: 'اجمع إشارات مصرّحاً بها، قيّم الثقة، واربطها بالدليل والدفاع.', en: 'Collect authorized leads, assess confidence and connect them to evidence and defense.' }, topics: [{ ar: 'نطاق البحث', en: 'Research scope' }, { ar: 'تقييم المصادر', en: 'Source assessment' }, { ar: 'تحليل المؤشرات', en: 'Indicator analysis' }, { ar: 'تقرير الاستخبارات', en: 'Intelligence report' }] },
];

export function nextLearningStep(lessons = {}, passed = false) {
  for (const course of courses) {
    for (const id of course.lessonIds) {
      if (!lessons[id]) return { kind: 'lesson', courseId: course.id, lessonId: id, lesson: lessonById[id], href: `lesson.html?id=${encodeURIComponent(id)}` };
    }
  }
  if (!passed) return { kind: 'practical', href: 'practical.html?id=foundations' };
  return { kind: 'specialization', href: 'paths.html#specializations' };
}

export function foundationsCount(lessons = {}) {
  const ids = courses.flatMap((course) => course.lessonIds);
  return { completed: ids.filter((id) => Boolean(lessons[id])).length, total: ids.length };
}
