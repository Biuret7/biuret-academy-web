// Public roadmap metadata. Exam answers and practical task keys stay in the private banks.
export const additionalPaths = {
  ar: [
    ['🛡️', 'أمن التطبيقات وDevSecOps', 'path_appsec', ['أساسيات لينكس وبيئة التطوير', 'التحقق من صلاحيات تطبيقات الويب', 'مراجعة الاعتماديات والأسرار', 'دمج الفحوص الأمنية في خط التسليم', 'توثيق الثغرات والإصلاحات'], 'الاعتمادات المهنية الخارجية مستقلة عن شهادة الأكاديمية', '#B9ED38', [9, 10, 18]],
    ['📱', 'أمن تطبيقات الهاتف', 'path_mobile', ['بنية تطبيق الهاتف وصلاحياته', 'تخزين البيانات والرموز بأمان', 'حماية الاتصال وواجهات API', 'تحليل السلوك في بيئة مصرّح بها', 'إعداد تقرير قابل للتنفيذ'], 'الاعتمادات المهنية الخارجية مستقلة عن شهادة الأكاديمية', '#F59E9E', [14, 10]],
    ['🧭', 'استخبارات التهديدات وOSINT', 'path_threat_intel', ['تحديد نطاق البحث المصرّح به', 'تقييم مصدر المعلومة وسياقها', 'ربط المؤشرات بالأدلة الرقمية', 'تحويل الملاحظات إلى فرضيات كشف', 'كتابة تقرير يوضح الثقة والحدود'], 'الاعتمادات المهنية الخارجية مستقلة عن شهادة الأكاديمية', '#75C6FF', [15, 7, 17]],
    ['🧬', 'تحليل البرمجيات الخبيثة والهندسة العكسية', 'path_malware', ['تهيئة بيئة تحليل معزولة', 'قراءة البنية والوظائف دون تنفيذ', 'مراقبة السلوك في عينة تدريبية', 'ربط المؤشرات بنتائج التحليل', 'صياغة توصيات دفاعية'], 'الاعتمادات المهنية الخارجية مستقلة عن شهادة الأكاديمية', '#C99BFF', [9, 12, 16]],
  ],
  en: [
    ['🛡️', 'Application security and DevSecOps', 'path_appsec', ['Linux and development environment basics', 'Validate web application authorization', 'Review dependencies and secrets', 'Integrate security checks into delivery', 'Document findings and fixes'], 'External professional credentials are separate from the Academy certificate', '#B9ED38', [9, 10, 18]],
    ['📱', 'Mobile application security', 'path_mobile', ['Mobile application architecture and permissions', 'Protect stored data and tokens', 'Secure communication and APIs', 'Analyze behavior in an authorized environment', 'Write an actionable report'], 'External professional credentials are separate from the Academy certificate', '#F59E9E', [14, 10]],
    ['🧭', 'Threat intelligence and OSINT', 'path_threat_intel', ['Define an authorized research scope', 'Assess sources and context', 'Connect indicators to digital evidence', 'Turn observations into detection hypotheses', 'Report confidence and limitations'], 'External professional credentials are separate from the Academy certificate', '#75C6FF', [15, 7, 17]],
    ['🧬', 'Malware analysis and reverse engineering', 'path_malware', ['Prepare an isolated analysis environment', 'Read structure and functions without execution', 'Observe a training sample safely', 'Connect indicators to findings', 'Write defensive recommendations'], 'External professional credentials are separate from the Academy certificate', '#C99BFF', [9, 12, 16]],
  ],
};

export const additionalPathIds = additionalPaths.en.map((path) => path[2]);
