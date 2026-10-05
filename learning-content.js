// Generated from a reviewed content release. Edit content/drafts and run the release workflow.
export const learningPath = {
  "id": "foundations",
  "title": {
    "ar": "أساسيات الأمن السيبراني",
    "en": "Cybersecurity Foundations"
  },
  "summary": {
    "ar": "من قراءة الرابط إلى اتخاذ قرار أمني مبني على دليل.",
    "en": "From reading a URL to making a security decision based on evidence."
  },
  "nodes": [
    {
      "id": "url-safety",
      "type": "course",
      "state": "published",
      "title": {
        "ar": "افهم الروابط قبل أن تثق بها",
        "en": "Understand URLs before you trust them"
      },
      "description": {
        "ar": "ثلاثة دروس قصيرة وتحدٍّ عملي.",
        "en": "Three short lessons and a practical challenge."
      }
    },
    {
      "id": "identity-access",
      "type": "course",
      "state": "published",
      "title": {
        "ar": "الهوية والصلاحيات",
        "en": "Identity and access"
      },
      "description": {
        "ar": "ثلاثة دروس عن كلمات المرور، الجلسات، وأقل صلاحية.",
        "en": "Three lessons on passwords, sessions, and least privilege."
      }
    },
    {
      "id": "evidence-response",
      "type": "course",
      "state": "published",
      "title": {
        "ar": "الأدلة والاستجابة",
        "en": "Evidence and response"
      },
      "description": {
        "ar": "ثلاثة دروس عن قراءة السجلات، سلامة الدليل، والاستجابة.",
        "en": "Three lessons on logs, evidence integrity, and response."
      }
    },
    {
      "id": "foundations-final",
      "type": "exam",
      "state": "published",
      "title": {
        "ar": "امتحان المسار وإثبات الإنجاز",
        "en": "Path exam and achievement credential"
      },
      "description": {
        "ar": "10 أسئلة تُصحح على الخادم بعد إكمال الدروس التسعة الموثقة.",
        "en": "10 server-graded questions after all nine verified lessons."
      }
    }
  ]
};

export const courses = [
  {
    "id": "url-safety",
    "pathId": "foundations",
    "challengeId": "f-domain",
    "minutes": 36,
    "title": {
      "ar": "افهم الروابط قبل أن تثق بها",
      "en": "Understand URLs before you trust them"
    },
    "summary": {
      "ar": "تعلّم تركيب عنوان الويب، وحدد الموقع الحقيقي، ثم طبّق ما تعلمته على رابط مشبوه.",
      "en": "Learn the structure of a web address, find the real destination, then apply it to a suspicious link."
    },
    "outcomes": [
      {
        "ar": "تميّز اسم النطاق الحقيقي من النص الذي يسبقه.",
        "en": "Distinguish the real domain from the text before it."
      },
      {
        "ar": "تفهم ما تثبته HTTPS وما لا تثبته.",
        "en": "Understand what HTTPS does and does not prove."
      },
      {
        "ar": "تتخذ خطوة آمنة عند الشك في رابط.",
        "en": "Choose a safe next step when a link looks suspicious."
      }
    ],
    "lessonIds": [
      "url-parts",
      "url-traps",
      "url-decision"
    ]
  },
  {
    "id": "identity-access",
    "pathId": "foundations",
    "challengeId": "f-permissions",
    "minutes": 36,
    "title": {
      "ar": "الهوية والصلاحيات",
      "en": "Identity and access"
    },
    "summary": {
      "ar": "احمِ الهوية، افهم دورة الجلسة، وامنح كل حساب الحد الأدنى اللازم من الصلاحيات.",
      "en": "Protect identities, understand session lifecycles, and grant only the access each account needs."
    },
    "outcomes": [
      {
        "ar": "تختار طريقة أقوى لحماية الحساب من إعادة استخدام كلمة المرور.",
        "en": "Choose stronger account protection than password reuse."
      },
      {
        "ar": "تشرح متى يجب إنهاء الجلسة وإبطالها.",
        "en": "Explain when a session must end or be revoked."
      },
      {
        "ar": "تميّز بين تسجيل الدخول وتفويض الوصول.",
        "en": "Distinguish authentication from authorization."
      }
    ],
    "lessonIds": [
      "identity-passwords",
      "identity-sessions",
      "identity-least-privilege"
    ]
  },
  {
    "id": "evidence-response",
    "pathId": "foundations",
    "challengeId": "d-log",
    "minutes": 36,
    "title": {
      "ar": "الأدلة والاستجابة",
      "en": "Evidence and response"
    },
    "summary": {
      "ar": "اقرأ إشارة أمنية في سجل، احفظ الدليل، واتخذ خطوة استجابة متناسبة.",
      "en": "Read a security signal in a log, preserve evidence, and choose a proportionate response."
    },
    "outcomes": [
      {
        "ar": "تفرّق بين حدث منفرد ونمط يستحق التحقيق.",
        "en": "Distinguish a single event from a pattern worth investigating."
      },
      {
        "ar": "توثّق وقت الدليل ومصدره وبصمته قبل التحليل.",
        "en": "Record evidence time, source, and hash before analysis."
      },
      {
        "ar": "تختار خطوة احتواء تحفظ السياق وتقلّل الضرر.",
        "en": "Choose a containment step that preserves context and limits harm."
      }
    ],
    "lessonIds": [
      "evidence-logs",
      "evidence-integrity",
      "evidence-triage"
    ]
  }
];

export const lessons = [
  {
    "id": "url-parts",
    "courseId": "url-safety",
    "order": 1,
    "minutes": 12,
    "title": {
      "ar": "تشريح عنوان الويب",
      "en": "Anatomy of a web address"
    },
    "summary": {
      "ar": "تعرف على البروتوكول واسم النطاق والمسار.",
      "en": "Identify the protocol, domain, and path."
    },
    "sections": [
      {
        "title": {
          "ar": "العنوان له أجزاء",
          "en": "An address has parts"
        },
        "body": {
          "ar": "في https://learn.biuret.dev/lesson يبدأ العنوان بالبروتوكول، ثم اسم المضيف، ثم المسار. اقرأه من دون أن تنخدع بالكلمات المألوفة في بدايته.",
          "en": "In https://learn.biuret.dev/lesson, the address starts with a protocol, followed by a host and a path. Familiar words at the start do not guarantee a familiar destination."
        }
      },
      {
        "title": {
          "ar": "أين النطاق الحقيقي؟",
          "en": "Where is the real domain?"
        },
        "body": {
          "ar": "في learn.biuret.dev النطاق المسجل هو biuret.dev، وlearn نطاق فرعي. أما biuret.dev.example.com فموقعه الحقيقي ضمن example.com.",
          "en": "In learn.biuret.dev, the registered domain is biuret.dev and learn is a subdomain. In biuret.dev.example.com, the actual site is under example.com."
        }
      },
      {
        "title": {
          "ar": "المضيف هو الحد الفاصل",
          "en": "The host is the boundary"
        },
        "body": {
          "ar": "في https://accounts.example.test@help.training.test/login تكون الوجهة help.training.test. النص قبل @ ليس المضيف. قارن المضيف الحقيقي بعنوان معروف مستقلاً، ولا تعتمد على أول اسم يظهر في النص.",
          "en": "In https://accounts.example.test@help.training.test/login the destination is help.training.test. Text before @ is not the host. Compare the actual host with an independently known address rather than the first familiar name in the string."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "المضيف لا يشمل اسم المستخدم أو المسار. في https://student@portal.example.test:443/export?next=/home البروتوكول https والمضيف portal.example.test والمنفذ 443 والمسار /export. وجود student قبل @ لا يحدد المؤسسة التي تستقبل الطلب. ولا توجد قاعدة صحيحة تقول إن آخر جزأين دائماً هما النطاق المسجل؛ بعض اللواحق مثل co.uk تحتاج معرفة قائمة اللواحق العامة.",
          "en": "The host excludes user information and the path. In https://student@portal.example.test:443/export?next=/home the scheme is https, host portal.example.test, port 443 and path /export. The student text before @ does not identify the receiving organization. Taking the last two labels is not a universal registered-domain rule: suffixes such as co.uk require public-suffix knowledge."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "قارن https://portal.example.test/help مع https://portal.example.test.help.invalid/help. الأول يستقبل الطلب عند portal.example.test؛ الثاني عند portal.example.test.help.invalid. ابدأ بعزل المضيف، ثم قارنه بعنوان موثوق حصلت عليه مستقلاً. لا تفتح الروابط أثناء هذا التدريب؛ جميع العناوين عينات نصية.",
          "en": "Compare https://portal.example.test/help with https://portal.example.test.help.invalid/help. The first host is portal.example.test; the second is portal.example.test.help.invalid. Isolate the host, then compare it with an independently trusted address. Do not open these examples; they are text-only training samples."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "حلل https://support.example.test@verify.training.invalid:8443/reset?account=demo. اكتب خمسة حقول: البروتوكول، المضيف، المنفذ، المسار، وما لا تستطيع إثباته. صحح زميلاً قال إن الوجهة support.example.test: الخطأ أنه قرأ النص قبل @. تحقق من عملك بمقارنة اسم المضيف كاملاً، لا بالكلمات المألوفة أو لون الصفحة.",
          "en": "Analyze https://support.example.test@verify.training.invalid:8443/reset?account=demo. Record five fields: scheme, host, port, path and what cannot be established. Correct a colleague who says the destination is support.example.test: they read the text before @. Check your work using the complete host, not familiar words or page colors."
        }
      }
    ],
    "example": "https://account.biuret.dev.example.com/login",
    "check": {
      "question": {
        "ar": "ما النطاق الحقيقي في المثال أعلاه؟",
        "en": "What is the actual domain in the example above?"
      },
      "options": [
        {
          "ar": "biuret.dev",
          "en": "biuret.dev"
        },
        {
          "ar": "example.com",
          "en": "example.com"
        },
        {
          "ar": "account.biuret.dev",
          "en": "account.biuret.dev"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "كل ما يسبق example.com هنا أسماء نطاقات فرعية، حتى لو بدا كأنه عنوان Biuret.",
        "en": "Everything before example.com is a subdomain here, even though it resembles a Biuret address."
      }
    }
  },
  {
    "id": "url-traps",
    "courseId": "url-safety",
    "order": 2,
    "minutes": 12,
    "title": {
      "ar": "إشارات التصيد في الرابط",
      "en": "Phishing signals in a URL"
    },
    "summary": {
      "ar": "انظر وراء النص الظاهر والرموز التي توحي بالثقة.",
      "en": "Look beyond display text and familiar trust cues."
    },
    "sections": [
      {
        "title": {
          "ar": "النص الظاهر ليس الوجهة",
          "en": "The label is not the destination"
        },
        "body": {
          "ar": "قد تعرض رسالة كلمة «بوابة الجامعة» بينما يقود الرابط إلى عنوان آخر. افحص العنوان الفعلي قبل إدخال بياناتك، خاصة عند طلب تسجيل دخول عاجل.",
          "en": "A message may display “university portal” while the link leads elsewhere. Inspect the actual address before entering credentials, especially when the message creates urgency."
        }
      },
      {
        "title": {
          "ar": "HTTPS يحمي الاتصال فقط",
          "en": "HTTPS protects the connection only"
        },
        "body": {
          "ar": "القفل يعني أن الاتصال بالموقع مشفر. لا يعني أن الجهة التي تدير الموقع جديرة بالثقة؛ مواقع التصيد قد تستخدم HTTPS أيضًا.",
          "en": "The lock means the connection is encrypted. It does not establish that the site operator is trustworthy; phishing sites can use HTTPS too."
        }
      },
      {
        "title": {
          "ar": "قارن ما يظهر بما يُفتح",
          "en": "Compare the display with the destination"
        },
        "body": {
          "ar": "قد يعرض زر اسم المؤسسة بينما يفتح نطاقاً مختلفاً. HTTPS يحمي الاتصال إلى تلك الوجهة ولا يثبت أنها المؤسسة المقصودة. اكتب الاسم المتوقع والوجهة الفعلية والاختلاف بينهما قبل الحكم.",
          "en": "A button can display an organization’s name while opening a different domain. HTTPS protects the connection to that destination; it does not prove it is the intended organization. Write the expected host, actual destination and difference before judging."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "TLS يحمي الاتصال بينك وبين الطرف الذي اتصلت به ويساعد على التحقق من شهادة مضيفه؛ لا يحكم على صدق محتواه أو حقه في طلب كلمة مرورك. تستطيع جهة خبيثة الحصول على شهادة صحيحة لنطاق تملكه. النص الظاهر في زر أو رسالة قد يختلف عن عنوان الرابط، وقد تنتهي إعادة التوجيه عند مضيف مختلف.",
          "en": "TLS protects the connection to the endpoint and helps validate its host certificate; it does not judge the honesty of its content or its right to request your password. A malicious operator can obtain a valid certificate for a domain they own. Link labels can differ from destinations, and redirects can end at a different host."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "رسالة تعرض «بوابة التدريب» لكن عنوانها https://portal-training.invalid/login، ثم يعيدك الرد إلى https://identity-training.invalid/auth. لدينا مضيفان، ولا يثبت القفل أن أياً منهما تابع لمؤسستك. قارن العنوانين مع بوابة محفوظة لديك قبل إدخال بياناتك. الرابط المختصر يزيد الحاجة للتحقق ولا يجعله ضاراً تلقائياً.",
          "en": "A message labeled “Training portal” points to https://portal-training.invalid/login, which redirects to https://identity-training.invalid/auth. There are two hosts; a padlock does not establish that either belongs to your organization. Compare both with your saved portal before entering credentials. A shortened link needs verification but is not automatically malicious."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "اكتب ردك على عبارة «الموقع يستخدم HTTPS إذن تسجيل الدخول آمن». اذكر ما يحميه TLS، وما يجب التحقق منه عن المضيف، وكيف تتعامل مع إعادة التوجيه. معيار النجاح: لا تعتبر التشفير إثبات شرعية، ولا تعتبر اختلاف المضيف وحده إثبات احتيال؛ تطلب دليلاً مستقلاً.",
          "en": "Respond to “This site uses HTTPS, so signing in is safe.” Explain what TLS protects, what needs checking about the host and how to handle redirects. Success means treating neither encryption as proof of legitimacy nor a changed host alone as proof of fraud: request independent evidence."
        }
      }
    ],
    "example": "https://secure-login.example.net/biuret",
    "check": {
      "question": {
        "ar": "ما الذي يثبته HTTPS لهذا الرابط؟",
        "en": "What does HTTPS establish for this link?"
      },
      "options": [
        {
          "ar": "أنه الموقع الرسمي لـ Biuret",
          "en": "It is the official Biuret site"
        },
        {
          "ar": "أن الاتصال بالموقع مشفر",
          "en": "The connection to the site is encrypted"
        },
        {
          "ar": "أن الرسالة التي أرسلته صحيحة",
          "en": "The message containing it is genuine"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "التشفير لا يؤكد هوية الجهة أو صدق الرسالة.",
        "en": "Encryption does not verify the organization or the message."
      }
    }
  },
  {
    "id": "url-decision",
    "courseId": "url-safety",
    "order": 3,
    "minutes": 12,
    "title": {
      "ar": "قرار آمن عند الشك",
      "en": "A safe decision when in doubt"
    },
    "summary": {
      "ar": "حوّل الشك إلى خطوات بسيطة وقابلة للتكرار.",
      "en": "Turn suspicion into a repeatable set of steps."
    },
    "sections": [
      {
        "title": {
          "ar": "توقف، ثم تحقق",
          "en": "Pause, then verify"
        },
        "body": {
          "ar": "إذا وصلتك رسالة تطلب كلمة مرور أو رمز تحقق فورًا، لا تدخل من رابطها. افتح الموقع المعروف بكتابته بنفسك أو من تطبيقك المعتاد.",
          "en": "If a message urgently asks for a password or verification code, avoid its link. Open the known site by typing its address yourself or using your usual app."
        }
      },
      {
        "title": {
          "ar": "بلّغ من قناة موثوقة",
          "en": "Report through a trusted channel"
        },
        "body": {
          "ar": "إن كان الرابط متعلقًا بعمل أو دراسة، أرسل بلاغًا لفريق الدعم عبر القناة الرسمية. احتفظ بنص الرسالة والرابط للتحليل، ولا تعِد إرسال بياناتك الحساسة.",
          "en": "If the link concerns work or school, report it through the official support channel. Preserve the message and URL for analysis without forwarding sensitive information."
        }
      },
      {
        "title": {
          "ar": "تحقق عبر طريق مستقل",
          "en": "Verify through an independent route"
        },
        "body": {
          "ar": "إذا طلبت رسالة عاجلة تغيير كلمة المرور، افتح العنوان المعروف من إشارتك أو اكتبه بنفسك وتحقق من وجود طلب مطابق. لا تختبر الرابط ببيانات اعتماد ولا تنقله لزميل ليجربه. سجل ما جعلك تتوقف وما الذي قد يغير القرار.",
          "en": "If an urgent message asks for a password change, open the known bookmarked address or type it independently and check for a matching request. Do not test the link with credentials or ask a colleague to try it. Record why you paused and what evidence could change the decision."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "القرار الآمن يبدأ بالسياق: هل توقعت الرسالة؟ ماذا تطلب؟ وما تكلفة الخطأ؟ الطلب العاجل لإدخال كلمة مرور أو رمز MFA يستحق توقفاً وفحصاً مستقلاً. يمكنك الوصول للخدمة من عنوان محفوظ أو تطبيق معروف بدل متابعة رابط الرسالة. لا ترسل رمزاً إلى شخص يدعي الدعم.",
          "en": "A safe decision starts with context: did you expect the message, what does it request and what is the cost of being wrong? An urgent request for a password or MFA code warrants a pause and independent checks. Reach the service through a saved address or known app rather than following the message. Do not send a code to someone claiming to be support."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "وصل تنبيه «حسابك سيغلق خلال عشر دقائق». لم تطلب استعادة كلمة المرور. احتفظ بالرسالة دون إدخال بيانات، وافتح بوابتك المعتادة للتحقق من التنبيهات، ثم تواصل مع الدعم عبر دليل مستقل. إذا أدخلت بيانات بالفعل، وثق التوقيت وأبلغ الجهة واتبع إجراءات استعادة الحساب وإبطال الجلسات؛ لا تكتفِ بحذف الرسالة.",
          "en": "An unexpected alert says “Your account closes in ten minutes.” Preserve the message without entering data, check alerts through your normal portal and contact support using an independent directory. If you already entered credentials, record the time, report it and follow account-recovery and session-revocation procedures; deleting the message is insufficient."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "اكتب خطة من ثلاثة فروع: لم تضغط الرابط؛ ضغطته دون إدخال بيانات؛ أدخلت بياناتك. حدد خطوة متناسبة لكل فرع، ودليلاً تحفظه، وسلوكاً تتجنبه. لا تساوِ بين الحالات الثلاث ولا تجزم بوجود اختراق قبل التحقق. استخدم عينة صناعية فقط.",
          "en": "Write a three-branch plan: you never clicked; you clicked without entering data; you entered credentials. For each, choose a proportionate action, evidence to preserve and an action to avoid. Do not treat all three cases alike or assert compromise before investigation. Use synthetic examples only."
        }
      }
    ],
    "example": "https://biuret.dev.example.net/reset-now",
    "check": {
      "question": {
        "ar": "ما الخطوة الأنسب قبل إدخال كلمة المرور؟",
        "en": "What is the best step before entering your password?"
      },
      "options": [
        {
          "ar": "أفتح الرابط لأن بدايته تحتوي على biuret.dev",
          "en": "Open it because it starts with biuret.dev"
        },
        {
          "ar": "أرسل كلمة المرور للتأكد من الحساب",
          "en": "Send my password to confirm the account"
        },
        {
          "ar": "أفتح الموقع المعروف بنفسي وأتحقق من الطلب",
          "en": "Open the known site myself and verify the request"
        }
      ],
      "answer": 2,
      "explanation": {
        "ar": "الوصول المستقل للموقع يزيل اعتمادك على الرابط المشبوه.",
        "en": "Navigating independently avoids relying on the suspicious link."
      }
    }
  },
  {
    "id": "identity-passwords",
    "courseId": "identity-access",
    "order": 1,
    "minutes": 12,
    "title": {
      "ar": "هوية قوية لكل حساب",
      "en": "A strong identity for every account"
    },
    "summary": {
      "ar": "تعلّم لماذا تضر إعادة استخدام كلمة المرور وكيف يساعد العامل الثاني.",
      "en": "Learn why password reuse is risky and how a second factor helps."
    },
    "sections": [
      {
        "title": {
          "ar": "كلمة فريدة لكل خدمة",
          "en": "A unique password per service"
        },
        "body": {
          "ar": "إذا تسرّبت كلمة مرور من خدمة واحدة، سيجرّبها المهاجمون في خدمات أخرى. استخدم مدير كلمات مرور لإنشاء كلمة طويلة وفريدة لكل حساب، ولا تشاركها في الرسائل أو التذاكر.",
          "en": "When a password leaks from one service, attackers try it elsewhere. Use a password manager to create a long, unique password for each account. Never share it in messages or support tickets."
        }
      },
      {
        "title": {
          "ar": "عامل إضافي يقلّل الخطر",
          "en": "A second factor reduces risk"
        },
        "body": {
          "ar": "فعّل المصادقة متعددة العوامل، وفضّل مفتاح مرور أو تطبيق مصادقة عندما يتاح. لا توافق على طلب دخول لم تبدأه أنت، واحتفظ برموز الاسترداد في مكان آمن منفصل.",
          "en": "Enable multifactor authentication. Prefer a passkey or authenticator app when available. Reject sign-in prompts you did not initiate and store recovery codes separately in a safe place."
        }
      },
      {
        "title": {
          "ar": "كلمة المرور ليست كل الهوية",
          "en": "A password is not the whole identity"
        },
        "body": {
          "ar": "استخدم كلمات فريدة ومدير كلمات مرور مناسباً ومصادقة إضافية حيث تتاح. إذا ثبت التسريب فغيّر الاعتماد وأبطل الجلسات المتأثرة وراجع النشاط؛ لا تفترض أن التغيير وحده يلغي كل رمز سابق.",
          "en": "Use unique passwords, a suitable password manager and additional authentication where available. When exposure is confirmed, change the credential, revoke affected sessions and review activity; do not assume a password change alone invalidates every prior token."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "إعادة استخدام كلمة المرور تجعل تسريب خدمة واحدة خطراً على خدمات أخرى. استخدم كلمة طويلة وفريدة لكل حساب ومدير كلمات مرور مناسباً، وأضف مصادقة متعددة العوامل. مدير كلمات المرور لا يغني عن حماية جهازك وحساب الاستعادة. بعض أساليب MFA قابلة للتصيد؛ مفاتيح الأمان والمفاتيح المرورية المرتبطة بالموقع توفر مقاومة أفضل لذلك.",
          "en": "Password reuse lets a breach of one service threaten others. Use a long, unique password per account, an appropriate password manager and multifactor authentication. A password manager does not replace device or recovery-account protection. Some MFA methods can be phished; origin-bound security keys and passkeys offer stronger resistance."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "نستخدم كلمة تدريبية واحدة للبريد والمتجر. بعد تسريب المتجر لا يكفي تغييرها هناك: نغيرها في كل حساب أعاد استخدامها، نراجع الجلسات وطرق الاستعادة، ونفعّل وسيلة MFA مناسبة. نجاح تغيير كلمة المرور لا يعني أن جلسة مسروقة أُبطلت تلقائياً؛ ذلك يعتمد على سياسة الخدمة.",
          "en": "A training password was reused for email and a shop. After a shop breach, changing it only there is insufficient: replace it wherever reused, review sessions and recovery methods, and enable suitable MFA. A successful password change does not mean a stolen session was automatically revoked; that depends on service policy."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "صمم خطة لحساب تدريبي: طريقة حفظ كلمة فريدة، وسيلة MFA، وخطة استعادة عند فقد الجهاز. اشرح لماذا إضافة رقم إلى نفس كلمة المرور لا تعالج إعادة الاستخدام. لا تكتب كلمات مرور أو رموز حقيقية في الملاحظات؛ اكتب خصائص الحماية فقط.",
          "en": "Design a plan for a training account: unique-password storage, MFA and recovery after device loss. Explain why adding a number to the same password does not fix reuse. Never enter real passwords or recovery codes in notes; document protection properties only."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / حسابان",
      "en": "Example / two accounts"
    },
    "example": "Account A: unique password + passkey\nAccount B: reused password only",
    "check": {
      "question": {
        "ar": "ما الذي يحدّ من أثر تسرّب كلمة مرور خدمة واحدة؟",
        "en": "What limits the impact of a password leak from one service?"
      },
      "options": [
        {
          "ar": "استخدام كلمة المرور نفسها في كل الحسابات",
          "en": "Reusing the same password everywhere"
        },
        {
          "ar": "كلمة فريدة لكل حساب مع عامل إضافي",
          "en": "A unique password for each account plus a second factor"
        },
        {
          "ar": "مشاركة رمز الدخول مع فريق الدعم",
          "en": "Sharing the sign-in code with support"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "التفرّد يمنع إعادة استخدام الكلمة المسربة، والعامل الإضافي يضيف حاجزاً آخر.",
        "en": "A unique password stops reuse of the leaked secret, while a second factor adds another barrier."
      }
    }
  },
  {
    "id": "identity-sessions",
    "courseId": "identity-access",
    "order": 2,
    "minutes": 12,
    "title": {
      "ar": "الجلسة ليست كلمة المرور",
      "en": "A session is not a password"
    },
    "summary": {
      "ar": "افهم كيف يظل الحساب مفتوحاً ومتى يجب إبطال جلساته.",
      "en": "Understand how an account stays signed in and when to revoke sessions."
    },
    "sections": [
      {
        "title": {
          "ar": "ما الذي تبقيه الجلسة؟",
          "en": "What keeps a session alive?"
        },
        "body": {
          "ar": "بعد تسجيل الدخول يمنحك الخادم جلسة أو رمزاً مؤقتاً لتجنب إرسال كلمة المرور مع كل طلب. امتلاك هذا الرمز قد يسمح باستخدام الحساب حتى من دون معرفة كلمة المرور.",
          "en": "After sign-in, the server grants a temporary session or token so you do not send the password on every request. Anyone who gets that token may use the account without knowing the password."
        }
      },
      {
        "title": {
          "ar": "إنهاء الوصول فعلياً",
          "en": "Actually ending access"
        },
        "body": {
          "ar": "إذا فُقد جهاز أو ظهر دخول غير معروف، راجع الأجهزة والجلسات من إعدادات الخدمة، وأبطل الجلسات المشبوهة. تغيير كلمة المرور وحده لا يضمن إبطال كل جلسة في كل خدمة.",
          "en": "If a device is lost or an unfamiliar sign-in appears, inspect active devices and revoke suspicious sessions in the service settings. Changing a password alone does not guarantee every service revokes every session."
        }
      },
      {
        "title": {
          "ar": "اختبر الإبطال فعلياً",
          "en": "Test revocation explicitly"
        },
        "body": {
          "ar": "تخيل أن جلسة S1 صدرت 09:00 وتغيرت كلمة المرور 10:00 ثم نجح طلب S1 الساعة 10:05. هذا يثبت بقاء الجلسة صالحة ولا يثبت انكشاف الكلمة الجديدة. بعد الإبطال ينبغي أن يُرفض الرمز القديم وتعمل جلسة جديدة لمستخدم مخول.",
          "en": "Imagine S1 was issued at 09:00, the password changed at 10:00 and S1 succeeded at 10:05. This establishes that the session remained valid, not that the new password leaked. After revocation the old token should fail while a new authorized session works."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "بعد تسجيل الدخول تحتفظ الجلسة بسياق الهوية، وغالباً يكفي امتلاك رمزها لاستخدامها. HttpOnly يحد وصول JavaScript إلى ملف الارتباط، وSecure يقصر إرساله على HTTPS، وSameSite يقلل بعض الطلبات العابرة للمواقع؛ هذه خصائص مختلفة ولا تثبت سلامة الجلسة. يجب إدارة الانتهاء والإبطال على الخادم.",
          "en": "A session carries identity context after sign-in; possession of its token is often enough to use it. HttpOnly limits JavaScript access to a cookie, Secure restricts sending it to HTTPS and SameSite reduces some cross-site requests. These are different properties, not proof of session safety. Expiry and revocation need server-side management."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "في محاكاة جهاز مشترك، أغلق المستخدم التبويب دون تسجيل خروج. يعود زميله فيجد الجلسة فعالة. إغلاق النافذة ليس دليلاً على إبطالها. الحل: تسجيل خروج ينهي الجلسة على الخادم، ثم محاولة استخدام رمز التدريب القديم للتأكد من رفضه. لا تستخدم رمزاً حقيقياً أو حساب شخص آخر.",
          "en": "In a shared-device simulation, a user closes the tab without signing out; a colleague later finds the session active. Closing a window does not prove revocation. Use sign-out that ends the server session, then check that the old training token is rejected. Never use real tokens or another person’s account."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "اكتب اختبارين: بعد انتهاء المهلة تُرفض الجلسة القديمة؛ بعد إبطال جلسة واحدة تبقى جلسة أخرى معتمدة فعالة إذا كانت السياسة تسمح بذلك. اشرح الفرق بين تغيير كلمة المرور وإبطال الجلسة، وحدد النتيجة المتوقعة قبل الاختبار.",
          "en": "Write two tests: the old session is rejected after expiry; revoking one session leaves another approved session active if policy allows. Explain the difference between password changes and session revocation. State expected outcomes before testing."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / جلسات",
      "en": "Example / sessions"
    },
    "example": "Laptop — active today\nUnknown device — active yesterday",
    "check": {
      "question": {
        "ar": "وجدت جلسة نشطة لجهاز لا تعرفه. ما الخطوة الأنسب؟",
        "en": "You find an active session on an unknown device. What should you do?"
      },
      "options": [
        {
          "ar": "أتركها لأنها لا تعرف كلمة مروري",
          "en": "Leave it because the device does not know my password"
        },
        {
          "ar": "أبطل الجلسة وأراجع نشاط الحساب",
          "en": "Revoke the session and review account activity"
        },
        {
          "ar": "أنشر رمز الجلسة في المنتدى لطلب المساعدة",
          "en": "Post the session token to ask for help"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "إبطال الجلسة يقطع الوصول الحالي، ثم يساعدك فحص النشاط على تقدير ما حدث.",
        "en": "Revoking the session cuts off current access; reviewing activity helps assess what happened."
      }
    }
  },
  {
    "id": "identity-least-privilege",
    "courseId": "identity-access",
    "order": 3,
    "minutes": 12,
    "title": {
      "ar": "أقل صلاحية تكفي",
      "en": "Only the access needed"
    },
    "summary": {
      "ar": "ميّز إثبات الهوية من السماح بالفعل، وقلّل الصلاحيات.",
      "en": "Separate identity verification from permission to act, and limit privileges."
    },
    "sections": [
      {
        "title": {
          "ar": "الدخول لا يعني التفويض",
          "en": "Signed in does not mean authorized"
        },
        "body": {
          "ar": "المصادقة تجيب: من أنت؟ التفويض يجيب: هل يحق لك تنفيذ هذا الفعل على هذا المورد؟ يجب فحص التفويض على الخادم عند كل عملية حساسة، حتى لو أخفى التطبيق الزر من الواجهة.",
          "en": "Authentication answers who you are. Authorization answers whether you may perform this action on this resource. The server must check authorization for every sensitive action, even if the interface hides a button."
        }
      },
      {
        "title": {
          "ar": "قلّل الامتياز والمدة",
          "en": "Limit privilege and duration"
        },
        "body": {
          "ar": "امنح الحساب حق القراءة إذا كانت مهمته القراءة فقط. قيّد حسابات الإدارة، وراجع الصلاحيات عند تغيير الأدوار أو انتهاء المهمة. بذلك تقل مساحة الضرر إن اختُرق حساب.",
          "en": "Grant read access when a role only needs to read. Restrict administrator accounts and review permissions when roles change or work ends. This reduces the harm from a compromised account."
        }
      },
      {
        "title": {
          "ar": "افصل المالك عن الفعل المسموح",
          "en": "Separate ownership from permitted action"
        },
        "body": {
          "ar": "قد يحق لدور القارئ عرض سجله دون تعديله. اختبر هوية مخولة ومالكاً آخر وفعلاً غير مسموح على الخادم؛ إخفاء زر التعديل لا يمنع طلباً مباشراً. صنف كل نتيجة وفق متطلب واضح بدلاً من الاكتفاء بنجاح الدخول.",
          "en": "A reader may view its record without permission to edit it. Test an authorized identity, another owner and a disallowed action on the server; hiding an edit button does not stop a direct request. Classify each result against an explicit requirement rather than successful sign-in."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "المصادقة تحدد من أنت، والتفويض يحدد ما يسمح لك به. إخفاء زر الحذف لا يفرض التفويض لأن المستخدم قد يرسل الطلب مباشرة. افحص الوصول على الخادم لكل عملية ولكل مورد. امنح صلاحيات محددة للمهمة والمدة المطلوبة، وراجعها عند تغير الدور.",
          "en": "Authentication establishes who you are; authorization determines what you may do. Hiding a delete button does not enforce authorization because a user can send the request directly. Check access on the server for every action and resource. Grant permissions for the task and duration needed, and review them when roles change."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "حساب tutor يحتاج قراءة نتائج مجموعته فقط. منحه صلاحية إدارة كل المستخدمين يزيد الأثر الممكن للخطأ أو الاختراق. نحدد النطاق group-A والعملية read-results، ونرفض طلب نتائج group-B حتى لو كان الحساب مسجلاً. صلاحية المسؤول هنا متعمدة ويجب أن تكون مقيدة ومدققة.",
          "en": "A tutor needs to read results for their group only. Granting user-wide administration increases the impact of mistakes or compromise. Scope access to group-A and read-results; reject a group-B request even from an authenticated tutor. Administrator authority is intentional and should be restricted and audited."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "أنشئ جدولاً لثلاثة أدوار: متعلم ومدرس ومدير. لكل دور اكتب موردين وعمليتين مسموحتين أو مرفوضتين. أضف اختباراً سلبياً يطلب فيه المتعلم نتيجة غيره، واختباراً إيجابياً لنتيجته. راجع أن التفويض لا يعتمد على معرف يرسله المتصفح وحده.",
          "en": "Create a matrix for learner, tutor and administrator. For each, list two resources and allowed or denied actions. Add a negative test where a learner requests someone else’s result, and a positive test for their own. Check that authorization does not trust a browser-supplied identity alone."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / صلاحيات",
      "en": "Example / permissions"
    },
    "example": "Analyst: read reports\nAdministrator: manage users and settings",
    "check": {
      "question": {
        "ar": "محلل يحتاج قراءة التقارير فقط. أي صلاحية تمنحه؟",
        "en": "An analyst only needs to read reports. Which permission should they get?"
      },
      "options": [
        {
          "ar": "صلاحية مدير كاملة للاحتياط",
          "en": "Full administrator access just in case"
        },
        {
          "ar": "القراءة فقط على التقارير المطلوبة",
          "en": "Read-only access to the required reports"
        },
        {
          "ar": "حساباً مشتركاً مع كل المحللين",
          "en": "A shared account for all analysts"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "أقل صلاحية تحقق المهمة وتحدّ من أثر الخطأ أو اختراق الحساب.",
        "en": "The least privilege that completes the task limits damage from mistakes or compromise."
      }
    }
  },
  {
    "id": "evidence-logs",
    "courseId": "evidence-response",
    "order": 1,
    "minutes": 12,
    "title": {
      "ar": "اقرأ السجل ضمن سياقه",
      "en": "Read logs in context"
    },
    "summary": {
      "ar": "ابحث عن نمط واحتفظ بالوقت والمصدر قبل الحكم.",
      "en": "Look for patterns and retain time and source before judging."
    },
    "sections": [
      {
        "title": {
          "ar": "الحدث الواحد ليس القصة كلها",
          "en": "One event is not the whole story"
        },
        "body": {
          "ar": "فشل دخول واحد قد يكون خطأ كتابة. عشرات المحاولات المتتابعة على حساب واحد أو حسابات كثيرة تستحق الفحص. قارن الوقت والحساب والمصدر ونوع الحدث، ولا تعتبر عنوان IP وحده دليلاً قاطعاً على شخص.",
          "en": "One failed sign-in may be a typo. Repeated attempts against one or many accounts deserve investigation. Compare time, account, source, and event type. An IP address alone does not identify a person."
        }
      },
      {
        "title": {
          "ar": "وحّد معنى الوقت",
          "en": "Normalize the clock"
        },
        "body": {
          "ar": "قد تسجّل الأنظمة أوقاتاً بمناطق زمنية مختلفة. دوّن المنطقة الزمنية وحوّل إلى UTC عند بناء خط زمني، ثم ابحث عن نجاح الدخول أو تغيير إعدادات بعد موجة الفشل.",
          "en": "Systems may log in different time zones. Record the zone and convert to UTC for a timeline, then look for a successful sign-in or settings change after a burst of failures."
        }
      },
      {
        "title": {
          "ar": "وقت الحدث غير وقت وصوله",
          "en": "Event time is not ingestion time"
        },
        "body": {
          "ar": "حدث 10:00Z وحدث 12:02+02:00 يفصل بينهما دقيقتان بعد توحيد المنطقة الزمنية. احتفظ بالوقت الأصلي ومصدره وسجل التحويل، ثم اربط الهوية والجلسة والجهاز. لا تجعل ترتيب وصول السجلات وحده خطاً زمنياً للحادث.",
          "en": "An event at 10:00Z and one at 12:02+02:00 are two minutes apart after time-zone normalization. Keep original time and source and record the transformation, then correlate identity, session and device. Ingestion order alone should not become the incident timeline."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "السجل ملاحظة من مصدر محدد، وليس قصة كاملة. احفظ وقت الحدث والمنطقة الزمنية ومصدره والهوية والجلسة والنتيجة. وقت وصول الحدث للمجمّع قد يتأخر عن وقت حدوثه. العنوان المشترك عبر NAT لا يحدد مستخدماً واحداً، ولذلك تحتاج ربط الهوية والجلسة والمضيف.",
          "en": "A log is an observation from a particular source, not a complete story. Preserve event time, timezone, source, identity, session and result. Collector arrival may lag behind event time. A shared NAT address does not identify a unique user; correlate identity, session and host instead."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "سجل A يعرض 10:05Z والجلسة S9؛ سجل B يعرض 12:04+02:00 والجلسة S8. بعد التطبيع B عند 10:04Z ويسبق A بدقيقة رغم ظهوره متأخراً في قائمة الجمع. اشتراك المستخدم لا يثبت أن الجلسة واحدة. احتفظ بالوقت الأصلي والتطبيع معاً وأضف هامش عدم يقين إذا كانت الساعات غير متزامنة.",
          "en": "Record A shows 10:05Z and session S9; record B shows 12:04+02:00 and session S8. Normalized, B is 10:04Z and precedes A by one minute despite arriving later. A shared username does not establish one session. Retain original and normalized times, and uncertainty when clocks are not synchronized."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "في مختبر تحليل الدخول اختر السجلات المرتبطة فقط، وعد محاولات الفشل، ثم ابحث عن نجاح لاحق وتصدير بالجلسة نفسها. اكتب استنتاجاً لا يتجاوز الدليل: تتابع يستحق التحقيق لا «اختراق مؤكد». تحقق من أحداث غير مرتبطة حتى لا تجعل كل ما وقع في الدقيقة نفسها جزءاً من الحادث.",
          "en": "In the sign-in lab, select related records only, count failures and look for later success and export in the same session. State a bounded finding: a sequence worth investigating, not “confirmed compromise.” Check unrelated events so everything in one minute is not treated as one incident."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / سجل",
      "en": "Example / log"
    },
    "example": "10:02Z login_failed user=adam source=192.0.2.10\n10:03Z login_failed user=adam source=192.0.2.10\n10:04Z login_success user=adam source=192.0.2.10",
    "check": {
      "question": {
        "ar": "ما المعلومة التالية الأكثر فائدة لفهم هذا التسلسل؟",
        "en": "What is most useful to check next for this sequence?"
      },
      "options": [
        {
          "ar": "لون شعار صفحة الدخول",
          "en": "The sign-in page logo color"
        },
        {
          "ar": "نشاط الحساب والجهاز بعد نجاح الدخول",
          "en": "Account and device activity after the successful sign-in"
        },
        {
          "ar": "حذف السجلات القديمة فوراً",
          "en": "Immediately delete older logs"
        }
      ],
      "answer": 1,
      "explanation": {
        "ar": "النجاح بعد محاولات فاشلة يستدعي ربط الأحداث بما حدث في الحساب بعدها.",
        "en": "A success after failed attempts calls for correlating what happened in the account afterward."
      }
    }
  },
  {
    "id": "evidence-integrity",
    "courseId": "evidence-response",
    "order": 2,
    "minutes": 12,
    "title": {
      "ar": "احفظ سلامة الدليل",
      "en": "Preserve evidence integrity"
    },
    "summary": {
      "ar": "وثّق المصدر والوقت والبصمة وسلسلة التعامل.",
      "en": "Record source, time, hash, and handling history."
    },
    "sections": [
      {
        "title": {
          "ar": "ثبّت النسخة الأصلية",
          "en": "Protect the original copy"
        },
        "body": {
          "ar": "احفظ نسخة من السجل أو الملف في مكان محدود الوصول، وسجّل مصدرها ووقت جمعها ومن جمعها. حلّل نسخة عمل منفصلة حتى لا تغيّر الأصل دون قصد.",
          "en": "Store a copy of the log or file in a restricted location and record its source, collection time, and collector. Analyze a separate working copy so you do not accidentally change the original."
        }
      },
      {
        "title": {
          "ar": "البصمة تكشف التغيير",
          "en": "A hash reveals change"
        },
        "body": {
          "ar": "احسب بصمة مثل SHA-256 وقت الجمع وأعد حسابها لاحقاً للمقارنة. تطابق البصمتين يدعم سلامة المحتوى، لكنه لا يثبت وحده من أنشأ الملف أو صحة سياقه.",
          "en": "Calculate a hash such as SHA-256 at collection and compare it later. Matching hashes support content integrity, but alone do not prove who created the file or that its context is authentic."
        }
      },
      {
        "title": {
          "ar": "البصمة تثبت مقارنة محددة",
          "en": "A hash establishes a specific comparison"
        },
        "body": {
          "ar": "إذا تطابقت بصمة الأصل ونسخة العمل، فهذا يدعم سلامة النسخ نسبةً لذلك المرجع. لا يثبت هوية المؤلف أو أن الأصل سليم. احفظ الأصل واطبق التحليل على نسخة وسجل الأدوات والتحويلات. إذا عدلت نسخة العمل فتوقع تغير بصمتها ووثق السبب.",
          "en": "Matching original and working-copy hashes support copying integrity relative to that reference. They do not establish author identity or a benign original. Preserve the original, analyze a copy and record tools and transformations. If the working copy changes, expect its hash to change and document why."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "تساعد التجزئة على اكتشاف اختلاف البايتات بين نسختين، لكنها لا تثبت صحة محتوى السجل أو هوية من جمعه. احفظ الأصل للقراءة فقط، وأنشئ نسخة للعمل، وسجل مصدر العينة وطريقة الجمع والوقت ومن تعامل معها. حفظ السياق وسلسلة التعامل مهم مثل مقارنة التجزئة.",
          "en": "A hash helps detect different bytes between copies; it does not prove that a log’s contents are truthful or identify its collector. Preserve a read-only original, create a working copy and record source, acquisition method, time and handlers. Context and handling history matter alongside hash comparison."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "نسخة سجل لها SHA-256=A والأخرى B. لا ندمجهما ولا نختار الأصغر: نسجل الاختلاف ونفحص هل تغيرت نهاية السطر أو ترتيب الحقول أو أداة التصدير. حتى تغيير التنسيق يمكن أن يغير التجزئة. إذا تطابقت التجزئة نثبت اتساق البايتات في النسختين فقط، لا أن الجهاز لم يُخترق.",
          "en": "One log copy has SHA-256=A and another B. Do not merge them or pick the smaller one: document the difference and investigate line endings, field ordering or export tools. Formatting changes can change a hash. Matching hashes support byte consistency between copies, not a finding that the host was uncompromised."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "صمم سجل تعامل لعينة صناعية: معرف، مصدر، وقت UTC، أداة الجمع، تجزئة، مكان الأصل، واسم دور المستلم. اذكر كيف تتصرف عند اختلاف تجزئة نسخة العمل. معيار النجاح: يمكن لشخص آخر إعادة بناء كيفية وصول العينة إليك دون تعديل الأصل.",
          "en": "Design a handling record for synthetic evidence: ID, source, UTC time, collection tool, hash, original location and recipient role. Explain your response to a changed working-copy hash. Success means another analyst can reconstruct acquisition and handling without modifying the original."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / سجل دليل",
      "en": "Example / evidence record"
    },
    "example": "source=auth.log | collected=2026-09-27T10:00:00Z\nsha256=<recorded digest> | analyst=case-operator",
    "check": {
      "question": {
        "ar": "ما الذي يثبته تطابق بصمتي SHA-256 لنسختين من ملف؟",
        "en": "What does a matching SHA-256 digest for two file copies support?"
      },
      "options": [
        {
          "ar": "أن الملفين لهما المحتوى نفسه بدرجة ثقة عالية",
          "en": "The two files have the same content with high confidence"
        },
        {
          "ar": "هوية الشخص الذي أنشأ الملف",
          "en": "The identity of the person who created the file"
        },
        {
          "ar": "أن كل ما في السجل حدث فعلاً",
          "en": "That every log entry describes a real event"
        }
      ],
      "answer": 0,
      "explanation": {
        "ar": "البصمة تقارن المحتوى؛ المصدر والسياق يحتاجان أدلة إضافية.",
        "en": "A hash compares content; provenance and context require additional evidence."
      }
    }
  },
  {
    "id": "evidence-triage",
    "courseId": "evidence-response",
    "order": 3,
    "minutes": 12,
    "title": {
      "ar": "استجابة هادئة ومتناسبة",
      "en": "A calm, proportionate response"
    },
    "summary": {
      "ar": "قيّم أثر الإشارة، احفظ السياق، ثم احتوِ عبر القنوات المعتمدة.",
      "en": "Assess the signal, preserve context, then contain through approved channels."
    },
    "sections": [
      {
        "title": {
          "ar": "تحقق قبل أن توسّع الأثر",
          "en": "Verify before broad action"
        },
        "body": {
          "ar": "ابدأ بما تعرفه: الأصول المتأثرة، الوقت، الحسابات، ومصدر التنبيه. دوّن درجة الثقة وما لا تعرفه. لا توقف خدمة كاملة بناءً على حدث منفرد بلا تقدير للأثر.",
          "en": "Start with what you know: affected assets, time, accounts, and alert source. Record confidence and unknowns. Do not take down an entire service based on a single event without assessing impact."
        }
      },
      {
        "title": {
          "ar": "احتوِ وبلّغ",
          "en": "Contain and report"
        },
        "body": {
          "ar": "إذا ظهرت أدلة موثوقة على إساءة استخدام حساب، أبطل جلسته أو قيّد وصوله حسب السياسة، واحفظ السجلات ثم بلّغ الفريق المسؤول. وثّق القرار والوقت لتكون المراجعة اللاحقة ممكنة.",
          "en": "If credible evidence points to account misuse, revoke its session or limit access under policy, preserve logs, and notify the responsible team. Record the decision and time for later review."
        }
      },
      {
        "title": {
          "ar": "تقرير قرار يمكن مراجعته",
          "en": "A reviewable decision report"
        },
        "body": {
          "ar": "ابنِ ملخصك من خمس نقاط: ما حدث، الدليل ومصدره، ما لم تعرفه، الإجراء ومالكه، وكيف ستقيس نجاحه. فرّق بين احتواء نشاط حالي وإزالة سببه والتعافي. لا تعتبر اختفاء تنبيه واحد دليلاً كافياً على سلامة أصول لم تجمع عنها بيانات.",
          "en": "Build a five-part summary: what happened, evidence and source, unknowns, action and owner, and how success will be measured. Distinguish containing current activity, removing its cause and recovery. One disappearing alert is insufficient evidence that unmonitored assets are safe."
        }
      },
      {
        "title": {
          "ar": "افهم حدود الفكرة",
          "en": "Understand the boundaries"
        },
        "body": {
          "ar": "الفرز يوازن قوة الدليل وأثر الأصل وسرعة الضرر. لا تجعل تنبيهاً واحداً حكم اختراق، ولا تعتبر غياب التنبيه دليلاً على الأمان إذا كانت التغطية ناقصة. حدد من يملك صلاحية الاحتواء، وما ينبغي حفظه، وكيف ستتأكد من توقف النشاط وعودة الخدمة.",
          "en": "Triage balances evidence strength, asset impact and urgency. One alert is not a compromise verdict; no alert is not proof of safety when coverage is incomplete. Identify containment authority, evidence to preserve and checks for activity stopping and service recovery."
        }
      },
      {
        "title": {
          "ar": "مثال محلول: من الدليل إلى القرار",
          "en": "Worked example: evidence to decision"
        },
        "body": {
          "ar": "برنامج Office يشغل مفسراً، تتبعه اتصالات دورية، ولا يوجد سجل تغيير معتمد. هذه فرضية نشاط غير متوقع تحتاج تحققاً من شجرة العمليات والمستخدم والسياق. نرفع الحالة حسب الأثر، ونحفظ الأدلة، ونعزل المضيف فقط وفق الصلاحية وخطة الاستجابة. إغلاق التنبيه لا يتحقق من الإبطال أو استمرار الاتصال.",
          "en": "An Office process launches an interpreter, followed by periodic connections with no matching approved change. This supports a hypothesis of unexpected activity needing process-tree, user and context checks. Escalate based on impact, preserve evidence and isolate only under authorized response procedures. Closing the alert does not verify revocation or whether connections persist."
        }
      },
      {
        "title": {
          "ar": "جرّب بنفسك وصحح الأخطاء",
          "en": "Try independently and correct mistakes"
        },
        "body": {
          "ar": "اكتب تقرير تسليم: ملاحظتان مع المعرف والوقت، فرضية ومستوى ثقة، أثر محتمل، معلومة ناقصة، إجراء مصرح، ومقياس مراجعة. أضف حالة بديلة قد تكون فيها العملية معتمدة. اختبر نجاح الاحتواء بإشارة متوقعة وبفحص أن خدمة معتمدة ما زالت تعمل.",
          "en": "Write a handover: two observations with IDs and time, hypothesis and confidence, potential impact, missing information, authorized action and a review check. Include an alternative where the process is approved. Validate containment with an expected signal and a check that an approved service still works."
        }
      }
    ],
    "exampleLabel": {
      "ar": "مثال / تسلسل",
      "en": "Example / sequence"
    },
    "example": "Signal → verify scope → preserve logs → contain account → report",
    "check": {
      "question": {
        "ar": "رصدت دخولاً مريباً مع دليل داعم. ما الاستجابة الأفضل؟",
        "en": "You find a suspicious sign-in with supporting evidence. What is the best response?"
      },
      "options": [
        {
          "ar": "أحذف السجلات ثم أنتظر",
          "en": "Delete the logs and wait"
        },
        {
          "ar": "أعلن هوية المهاجم من عنوان IP فقط",
          "en": "Name the attacker from an IP address alone"
        },
        {
          "ar": "أحفظ الدليل وأقيّد الجلسة وفق السياسة وأبلّغ الفريق",
          "en": "Preserve evidence, restrict the session under policy, and notify the team"
        }
      ],
      "answer": 2,
      "explanation": {
        "ar": "الاحتواء المتناسب مع حفظ الدليل يحدّ من الضرر ويحافظ على قابلية التحقيق.",
        "en": "Proportionate containment with preserved evidence limits harm and supports investigation."
      }
    }
  }
];

export const courseById = Object.fromEntries(courses.map((course) => [course.id, course]));
export const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
export const localized = (value, language) => value?.[language] || value?.ar || '';
