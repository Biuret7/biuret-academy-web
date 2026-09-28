export const labs = [
  {
    id: 'http-basics', courseId: 'url-safety', minutes: 12,
    title: { ar: 'مختبر: افهم الطلب قبل القرار', en: 'Lab: read the request before deciding' },
    summary: { ar: 'حلّل طلب HTTP واستجابة مأخوذين من خدمة تدريبية صناعية. لا تحتاج أي أدوات أو اتصال بخادم حقيقي.', en: 'Analyze a synthetic HTTP request and response. No tools or live target are needed.' },
    artifact: 'POST /training/login HTTP/1.1\nHost: training.example\nContent-Type: application/x-www-form-urlencoded\n\nusername=student&password=DEMO_ONLY\n\nHTTP/1.1 302 Found\nLocation: /training/dashboard\nSet-Cookie: session=TRAINING_ONLY; HttpOnly; SameSite=Lax',
    steps: [
      { prompt: { ar: 'ما المضيف الذي استقبل الطلب؟', en: 'Which host received the request?' }, choices: [{ ar: 'training.example', en: 'training.example' }, { ar: '/training/login', en: '/training/login' }, { ar: '/training/dashboard', en: '/training/dashboard' }], answer: 0, explanation: { ar: 'ترويسة Host تحدد المضيف. المسار الظاهر بعد POST ليس اسم النطاق.', en: 'The Host header identifies the host. The path after POST is not the domain.' } },
      { prompt: { ar: 'ما الذي تعنيه الاستجابة 302 مع Location؟', en: 'What does 302 with Location mean?' }, choices: [{ ar: 'فشل الخادم نهائياً', en: 'Permanent server failure' }, { ar: 'إعادة توجيه إلى لوحة التدريب', en: 'Redirect to the training dashboard' }, { ar: 'تأكيد أن الاتصال مشفر', en: 'Proof that the connection is encrypted' }], answer: 1, explanation: { ar: '302 يطلب انتقالاً مؤقتاً، وترويسة Location تحدد الوجهة التالية.', en: '302 requests a temporary redirect, and Location specifies the next destination.' } },
      { prompt: { ar: 'ما الفحص الأمني الأهم قبل إرسال كلمة مرور حقيقية بهذا الشكل؟', en: 'What is the key security check before sending a real password this way?' }, choices: [{ ar: 'التأكد من HTTPS ووجهة موثوقة', en: 'Confirm HTTPS and a trusted destination' }, { ar: 'إزالة ترويسة Host', en: 'Remove the Host header' }, { ar: 'تغيير 302 إلى 200', en: 'Change 302 to 200' }], answer: 0, explanation: { ar: 'العينة لا تعرض طبقة النقل. عند بيانات اعتماد حقيقية تحقق من HTTPS والجهة المستقبلة؛ HttpOnly لا يشفر الطلب.', en: 'The sample does not show transport security. For real credentials, verify HTTPS and the recipient; HttpOnly does not encrypt the request.' } },
    ],
    takeaway: { ar: 'اقرأ المضيف والطريقة والاستجابة والترويسات معاً. أي استنتاج عن تشفير الاتصال يحتاج دليلاً من سياق الاتصال نفسه.', en: 'Read the host, method, response and headers together. Transport encryption needs separate evidence.' },
  },
  {
    id: 'log-triage', courseId: 'evidence-response', minutes: 12,
    title: { ar: 'مختبر: حقّق في إشارة دخول', en: 'Lab: investigate a sign-in signal' },
    summary: { ar: 'كوّن استنتاجاً محدوداً من سجل دخول صناعي، ثم اختر الخطوة التالية التي تحفظ الدليل.', en: 'Draw a careful conclusion from a synthetic sign-in log, then preserve the evidence.' },
    artifact: '09:11:02Z  192.0.2.14     LOGIN_OK    user=adam\n09:12:18Z  198.51.100.42  LOGIN_FAIL  user=adam\n09:12:21Z  198.51.100.42  LOGIN_FAIL  user=adam\n09:12:24Z  198.51.100.42  LOGIN_FAIL  user=adam\n09:15:09Z  203.0.113.7    LOGIN_OK    user=sara',
    steps: [
      { prompt: { ar: 'أي مصدر يرتبط بالمحاولات الفاشلة المتكررة؟', en: 'Which source has repeated failed attempts?' }, choices: [{ ar: '192.0.2.14', en: '192.0.2.14' }, { ar: '198.51.100.42', en: '198.51.100.42' }, { ar: '203.0.113.7', en: '203.0.113.7' }], answer: 1, explanation: { ar: 'تكرر العنوان 198.51.100.42 ثلاث مرات مع LOGIN_FAIL خلال ثوانٍ.', en: '198.51.100.42 appears three times with LOGIN_FAIL within seconds.' } },
      { prompt: { ar: 'ما الاستنتاج الذي تسمح به هذه العينة وحدها؟', en: 'Which conclusion is supported by this sample alone?' }, choices: [{ ar: 'اختراق حساب adam مؤكد', en: 'Adam’s account is definitely compromised' }, { ar: 'هناك نمط فشل يستحق التحقق', en: 'There is a failure pattern worth investigating' }, { ar: 'كل طلبات الدخول ضارة', en: 'Every sign-in is malicious' }], answer: 1, explanation: { ar: 'السجل يثبت تكرار الفشل فقط؛ لا يثبت اختراقاً أو نية المرسل.', en: 'The log proves repeated failures, not compromise or attacker intent.' } },
      { prompt: { ar: 'ما الخطوة التالية الأفضل للمحقق؟', en: 'What is the best next step for the analyst?' }, choices: [{ ar: 'حذف السجلات', en: 'Delete the logs' }, { ar: 'توثيق التوقيت والمصدر ومراجعة سجلات مرتبطة', en: 'Record time and source, then check related logs' }, { ar: 'نشر اسم الحساب والعنوان علناً', en: 'Publish the account and address publicly' }], answer: 1, explanation: { ar: 'احفظ السجل وسياقه، ثم اربطه بإشارات أخرى قبل قرار الاحتواء.', en: 'Preserve the log and context, then correlate with other signals before containment.' } },
    ],
    takeaway: { ar: 'ميّز بين ما يثبته الدليل وما يحتاج تحققاً إضافياً. دوّن افتراضاتك قبل إصدار حكم.', en: 'Separate what evidence proves from what needs further verification. Record assumptions before deciding.' },
  },
];

export const labById = Object.fromEntries(labs.map((lab) => [lab.id, lab]));
