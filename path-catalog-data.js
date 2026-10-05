// Generated public path metadata; no assessment questions or answers.
export const academyPaths = [
  {
    "id": "foundations",
    "title": {
      "ar": "أساسيات الأمن السيبراني",
      "en": "Cybersecurity Foundations"
    },
    "summary": {
      "ar": "من قراءة الرابط إلى اتخاذ قرار أمني مبني على دليل.",
      "en": "From reading a URL to making a security decision based on evidence."
    },
    "free": true,
    "icon": "shield",
    "outcomes": {
      "ar": [
        "تحليل الروابط والتحويلات",
        "حماية الهوية والصلاحيات",
        "حفظ الأدلة واتخاذ قرار أمني"
      ],
      "en": [
        "Analyze URLs and redirects",
        "Protect identity and permissions",
        "Preserve evidence and make security decisions"
      ]
    },
    "courses": [
      {
        "id": "url-safety",
        "title": {
          "ar": "افهم الروابط قبل أن تثق بها",
          "en": "Understand URLs before you trust them"
        },
        "summary": {
          "ar": "تعلّم تركيب عنوان الويب، وحدد الموقع الحقيقي، ثم طبّق ما تعلمته على رابط مشبوه.",
          "en": "Learn the structure of a web address, find the real destination, then apply it to a suspicious link."
        },
        "lessonIds": [
          "url-parts",
          "url-traps",
          "url-decision"
        ],
        "href": "course.html?id=url-safety"
      },
      {
        "id": "identity-access",
        "title": {
          "ar": "الهوية والصلاحيات",
          "en": "Identity and access"
        },
        "summary": {
          "ar": "احمِ الهوية، افهم دورة الجلسة، وامنح كل حساب الحد الأدنى اللازم من الصلاحيات.",
          "en": "Protect identities, understand session lifecycles, and grant only the access each account needs."
        },
        "lessonIds": [
          "identity-passwords",
          "identity-sessions",
          "identity-least-privilege"
        ],
        "href": "course.html?id=identity-access"
      },
      {
        "id": "evidence-response",
        "title": {
          "ar": "الأدلة والاستجابة",
          "en": "Evidence and response"
        },
        "summary": {
          "ar": "اقرأ إشارة أمنية في سجل، احفظ الدليل، واتخذ خطوة استجابة متناسبة.",
          "en": "Read a security signal in a log, preserve evidence, and choose a proportionate response."
        },
        "lessonIds": [
          "evidence-logs",
          "evidence-integrity",
          "evidence-triage"
        ],
        "href": "course.html?id=evidence-response"
      }
    ],
    "quizzes": [
      {
        "id": "quiz-0",
        "index": 0,
        "title": {
          "ar": "المفاهيم الأساسية",
          "en": "Cybersecurity fundamentals"
        },
        "href": "practice-quiz.html?id=0"
      }
    ],
    "labs": [
      {
        "id": "http-basics",
        "title": {
          "ar": "مختبر: افهم الطلب قبل القرار",
          "en": "Lab: read the request before deciding"
        },
        "href": "lab.html?id=http-basics",
        "core": true
      },
      {
        "id": "log-triage",
        "title": {
          "ar": "مختبر: حقّق في إشارة دخول",
          "en": "Lab: investigate a sign-in signal"
        },
        "href": "lab.html?id=log-triage",
        "core": true
      }
    ],
    "challenges": [
      {
        "id": "f-domain",
        "title": {
          "ar": "اقرأ الرابط جيداً",
          "en": "Read the URL"
        },
        "href": "challenges.html?challenge=f-domain",
        "core": true
      },
      {
        "id": "f-permissions",
        "title": {
          "ar": "أذونات الملف",
          "en": "File permissions"
        },
        "href": "challenges.html?challenge=f-permissions",
        "core": true
      },
      {
        "id": "f-hash",
        "title": {
          "ar": "بصمة الملف",
          "en": "File fingerprint"
        },
        "href": "challenges.html?challenge=f-hash",
        "core": true
      },
      {
        "id": "f-redirect",
        "title": {
          "ar": "لغة الاستجابة",
          "en": "Response language"
        },
        "href": "challenges.html?challenge=f-redirect",
        "core": true
      },
      {
        "id": "f-sender",
        "title": {
          "ar": "اسم مرسل أم دليل؟",
          "en": "Display name or evidence?"
        },
        "href": "challenges.html?challenge=f-sender",
        "core": true
      }
    ],
    "operations": [
      {
        "id": "red_phantom",
        "index": 0,
        "title": {
          "ar": "الوثيقة المشبوهة",
          "en": "Suspicious document"
        },
        "href": "operation.html?id=0"
      }
    ],
    "practical": "practical.html?id=foundations",
    "exam": "exam.html",
    "certificate": "certificate.html"
  },
  {
    "id": "path_pentest",
    "title": {
      "ar": "اختبار الاختراق المصرّح",
      "en": "Authorized penetration testing"
    },
    "summary": {
      "ar": "من تحديد النطاق إلى التوثيق والإصلاح داخل بيئات تدريبية.",
      "en": "From scope to evidence and remediation in authorized training environments."
    },
    "free": false,
    "icon": "pentest",
    "outcomes": {
      "ar": [
        "النطاق والمنهجية",
        "الشبكات والأدوات",
        "اختبار تطبيق تدريبي",
        "التقرير والإصلاح"
      ],
      "en": [
        "Scope and methodology",
        "Networks and tools",
        "Training app assessment",
        "Reporting and remediation"
      ]
    },
    "courses": [
      {
        "id": "desktop-2",
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "summary": {
          "ar": "فهم حركة البيانات ثم تصميم شبكات مقسّمة وقابلة للرصد",
          "en": "Understand how data moves, then design segmented networks that you can monitor."
        },
        "lessonIds": [
          "desktop-topic-6",
          "desktop-topic-7",
          "desktop-topic-8",
          "desktop-topic-9",
          "desktop-topic-60",
          "desktop-topic-61",
          "desktop-v5-desktop-2-1"
        ],
        "order": 2,
        "href": "library-course.html?id=desktop-2"
      },
      {
        "id": "desktop-3",
        "title": {
          "ar": "اختبار الاختراق",
          "en": "Penetration testing"
        },
        "summary": {
          "ar": "اختبار مصرح قائم على الأدلة، من تحديد النطاق إلى التحقق من الإصلاح",
          "en": "Plan authorized, evidence-based tests from scope definition to remediation checks."
        },
        "lessonIds": [
          "desktop-topic-10",
          "desktop-topic-11",
          "desktop-topic-12",
          "desktop-topic-13",
          "desktop-topic-14",
          "desktop-topic-62",
          "desktop-topic-63",
          "desktop-v5-desktop-3-1"
        ],
        "order": 3,
        "href": "library-course.html?id=desktop-3"
      },
      {
        "id": "desktop-10",
        "title": {
          "ar": "أمن تطبيقات الويب",
          "en": "Web application security"
        },
        "summary": {
          "ar": "من فئات الثغرات إلى تصميم هوية وجلسات وضوابط قابلة للتحقق",
          "en": "Move from vulnerability classes to verifiable controls for identity and sessions."
        },
        "lessonIds": [
          "desktop-topic-37",
          "desktop-topic-38",
          "desktop-topic-39",
          "desktop-topic-69",
          "desktop-v5-desktop-10-1"
        ],
        "order": 10,
        "href": "library-course.html?id=desktop-10"
      },
      {
        "id": "desktop-11",
        "title": {
          "ar": "Active Directory",
          "en": "Active Directory"
        },
        "summary": {
          "ar": "فهم الهوية المؤسسية ثم تقويتها ومراقبة مسارات الامتياز",
          "en": "Understand enterprise identity, harden it and monitor privilege paths."
        },
        "lessonIds": [
          "desktop-topic-40",
          "desktop-topic-41",
          "desktop-topic-42",
          "desktop-topic-75",
          "desktop-v5-desktop-11-1"
        ],
        "order": 11,
        "href": "library-course.html?id=desktop-11"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-1",
        "index": 1,
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "href": "practice-quiz.html?id=1"
      },
      {
        "id": "quiz-2",
        "index": 2,
        "title": {
          "ar": "اختبار الاختراق",
          "en": "Penetration testing"
        },
        "href": "practice-quiz.html?id=2"
      },
      {
        "id": "quiz-8",
        "index": 8,
        "title": {
          "ar": "لينكس للأمن السيبراني",
          "en": "Linux for cybersecurity"
        },
        "href": "practice-quiz.html?id=8"
      },
      {
        "id": "quiz-9",
        "index": 9,
        "title": {
          "ar": "أمن تطبيقات الويب المتقدم",
          "en": "Web application security"
        },
        "href": "practice-quiz.html?id=9"
      }
    ],
    "labs": [
      {
        "id": "lab-0",
        "index": 0,
        "title": {
          "ar": "جرد الخدمات وحدود الاستنتاج",
          "en": "Service inventory and evidence limits"
        },
        "href": "practice-lab.html?id=0"
      },
      {
        "id": "lab-2",
        "index": 2,
        "title": {
          "ar": "تفويض الكائنات في API",
          "en": "Object authorization in an API"
        },
        "href": "practice-lab.html?id=2"
      },
      {
        "id": "lab-5",
        "index": 5,
        "title": {
          "ar": "صلاحيات Linux الفعلية",
          "en": "Effective Linux permissions"
        },
        "href": "practice-lab.html?id=5"
      }
    ],
    "challenges": [
      {
        "id": "challenge-0",
        "index": 0,
        "title": {
          "ar": "تحدي 01 — المبتدئ الأول",
          "en": "Challenge 01: Network discovery"
        },
        "href": "practice-challenge.html?id=0"
      },
      {
        "id": "challenge-2",
        "index": 2,
        "title": {
          "ar": "تحدي 03 — حقن SQL",
          "en": "Challenge 03: SQL injection"
        },
        "href": "practice-challenge.html?id=2"
      },
      {
        "id": "challenge-3",
        "index": 3,
        "title": {
          "ar": "تحدي 04 — XSS المخفي",
          "en": "Challenge 04: Cross-site scripting"
        },
        "href": "practice-challenge.html?id=3"
      },
      {
        "id": "challenge-5",
        "index": 5,
        "title": {
          "ar": "تحدي 06 — رفع الصلاحيات",
          "en": "Challenge 06: Privilege escalation"
        },
        "href": "practice-challenge.html?id=5"
      },
      {
        "id": "challenge-7",
        "index": 7,
        "title": {
          "ar": "تحدي 08 — اختراق Active Directory",
          "en": "Challenge 08: Active Directory compromise"
        },
        "href": "practice-challenge.html?id=7"
      }
    ],
    "operations": [
      {
        "id": "glass_harbor",
        "index": 2,
        "title": {
          "ar": "بوابة المستأجر",
          "en": "Tenant gateway"
        },
        "href": "operation.html?id=2"
      },
      {
        "id": "identity_echo",
        "index": 1,
        "title": {
          "ar": "صدى الهوية",
          "en": "Identity echo"
        },
        "href": "operation.html?id=1"
      }
    ],
    "practical": "practical.html?id=path_pentest",
    "exam": "path-exam.html?id=path_pentest",
    "certificate": "path-exam.html?id=path_pentest"
  },
  {
    "id": "path_soc",
    "title": {
      "ar": "العمليات الأمنية والاستجابة",
      "en": "Security operations and response"
    },
    "summary": {
      "ar": "ابدأ من السجلات والتنبيهات، ثم كوّن فرضية وقرار احتواء.",
      "en": "Start with logs and alerts, then build a hypothesis and containment decision."
    },
    "free": false,
    "icon": "soc",
    "outcomes": {
      "ar": [
        "الشبكات ومصادر السجلات",
        "فرز التنبيهات",
        "الاستجابة للحوادث",
        "مختبر حالة وتحقيق"
      ],
      "en": [
        "Networks and log sources",
        "Alert triage",
        "Incident response",
        "Case investigation lab"
      ]
    },
    "courses": [
      {
        "id": "desktop-2",
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "summary": {
          "ar": "فهم حركة البيانات ثم تصميم شبكات مقسّمة وقابلة للرصد",
          "en": "Understand how data moves, then design segmented networks that you can monitor."
        },
        "lessonIds": [
          "desktop-topic-6",
          "desktop-topic-7",
          "desktop-topic-8",
          "desktop-topic-9",
          "desktop-topic-60",
          "desktop-topic-61",
          "desktop-v5-desktop-2-1"
        ],
        "order": 2,
        "href": "library-course.html?id=desktop-2"
      },
      {
        "id": "desktop-4",
        "title": {
          "ar": "التشفير وحماية البيانات",
          "en": "Cryptography and data protection"
        },
        "summary": {
          "ar": "اختيار التشفير الصحيح وإدارة المفاتيح والأسرار طوال دورة حياتها",
          "en": "Choose appropriate encryption and manage keys and secrets throughout their lifecycle."
        },
        "lessonIds": [
          "desktop-topic-15",
          "desktop-topic-16",
          "desktop-topic-17",
          "desktop-topic-18",
          "desktop-topic-64",
          "desktop-v5-desktop-4-1"
        ],
        "order": 4,
        "href": "library-course.html?id=desktop-4"
      },
      {
        "id": "desktop-7",
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "summary": {
          "ar": "حفظ الدليل، بناء الخط الزمني، والتحقيق القابل للتدقيق",
          "en": "Preserve evidence, reconstruct timelines and conduct investigations that can be audited."
        },
        "lessonIds": [
          "desktop-topic-26",
          "desktop-topic-27",
          "desktop-topic-28",
          "desktop-topic-67",
          "desktop-v5-desktop-7-1"
        ],
        "order": 7,
        "href": "library-course.html?id=desktop-7"
      }
    ],
    "optionalCourses": [
      {
        "id": "desktop-v5-category-1",
        "title": {
          "ar": "عمليات الدفاع المتقدم",
          "en": "Advanced defense operations"
        },
        "summary": {
          "ar": "من هندسة السجلات وSIEM إلى قواعد الكشف وThreat Hunting والاستجابة المنظّمة",
          "en": "Build log and SIEM pipelines, detection rules, threat hunts and response playbooks."
        },
        "lessonIds": [
          "desktop-v5-1-1",
          "desktop-v5-1-2",
          "desktop-v5-1-3",
          "desktop-v5-1-4"
        ],
        "order": 17,
        "href": "library-course.html?id=desktop-v5-category-1"
      }
    ],
    "quizzes": [
      {
        "id": "quiz-1",
        "index": 1,
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "href": "practice-quiz.html?id=1"
      },
      {
        "id": "quiz-3",
        "index": 3,
        "title": {
          "ar": "التشفير وحماية البيانات",
          "en": "Cryptography and data protection"
        },
        "href": "practice-quiz.html?id=3"
      },
      {
        "id": "quiz-6",
        "index": 6,
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "href": "practice-quiz.html?id=6"
      }
    ],
    "labs": [
      {
        "id": "lab-1",
        "index": 1,
        "title": {
          "ar": "ربط الحزم بهوية العملية",
          "en": "Correlating packets and process identity"
        },
        "href": "practice-lab.html?id=1"
      },
      {
        "id": "lab-7",
        "index": 7,
        "title": {
          "ar": "قياس التغطية والاستجابة",
          "en": "Coverage and response validation"
        },
        "href": "practice-lab.html?id=7"
      }
    ],
    "challenges": [
      {
        "id": "challenge-1",
        "index": 1,
        "title": {
          "ar": "تحدي 02 — كسر الهاش",
          "en": "Challenge 02: Decode the message"
        },
        "href": "practice-challenge.html?id=1"
      },
      {
        "id": "challenge-4",
        "index": 4,
        "title": {
          "ar": "تحدي 05 — MITM الشبكة",
          "en": "Challenge 05: Network interception"
        },
        "href": "practice-challenge.html?id=4"
      },
      {
        "id": "challenge-6",
        "index": 6,
        "title": {
          "ar": "تحدي 07 — تحليل الذاكرة",
          "en": "Challenge 07: Memory forensics"
        },
        "href": "practice-challenge.html?id=6"
      }
    ],
    "operations": [
      {
        "id": "red_phantom",
        "index": 0,
        "title": {
          "ar": "الوثيقة المشبوهة",
          "en": "Suspicious document"
        },
        "href": "operation.html?id=0"
      },
      {
        "id": "black_ledger",
        "index": 3,
        "title": {
          "ar": "دفتر الاستعادة",
          "en": "Recovery ledger"
        },
        "href": "operation.html?id=3"
      },
      {
        "id": "insider_shade",
        "index": 4,
        "title": {
          "ar": "استثناء منتهي",
          "en": "Expired exception"
        },
        "href": "operation.html?id=4"
      },
      {
        "id": "frozen_beacon",
        "index": 5,
        "title": {
          "ar": "أثر سلسلة التسليم",
          "en": "Delivery chain trace"
        },
        "href": "operation.html?id=5"
      }
    ],
    "practical": "practical.html?id=path_soc",
    "exam": "path-exam.html?id=path_soc",
    "certificate": "path-exam.html?id=path_soc"
  },
  {
    "id": "path_dfir",
    "title": {
      "ar": "الأدلة الرقمية",
      "en": "Digital forensics"
    },
    "summary": {
      "ar": "احفظ سلامة الدليل، ابنِ خطاً زمنياً، وافصل الملاحظة عن الاستنتاج.",
      "en": "Preserve evidence, build a timeline and separate observations from conclusions."
    },
    "free": false,
    "icon": "dfir",
    "outcomes": {
      "ar": [
        "جمع الدليل وسلامته",
        "الخط الزمني والسجلات",
        "تحليل الذاكرة",
        "تقرير التحقيق"
      ],
      "en": [
        "Evidence collection and integrity",
        "Timelines and logs",
        "Memory analysis",
        "Investigation report"
      ]
    },
    "courses": [
      {
        "id": "desktop-7",
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "summary": {
          "ar": "حفظ الدليل، بناء الخط الزمني، والتحقيق القابل للتدقيق",
          "en": "Preserve evidence, reconstruct timelines and conduct investigations that can be audited."
        },
        "lessonIds": [
          "desktop-topic-26",
          "desktop-topic-27",
          "desktop-topic-28",
          "desktop-topic-67",
          "desktop-v5-desktop-7-1"
        ],
        "order": 7,
        "href": "library-course.html?id=desktop-7"
      },
      {
        "id": "desktop-12",
        "title": {
          "ar": "تحليل البرمجيات الخبيثة",
          "en": "Malware analysis"
        },
        "summary": {
          "ar": "تحليل آمن ومنهجي يحوّل المؤشرات إلى فرضيات وتقرير دفاعي",
          "en": "Analyze malware safely and turn indicators into defensible findings."
        },
        "lessonIds": [
          "desktop-topic-43",
          "desktop-topic-44",
          "desktop-topic-45",
          "desktop-topic-70",
          "desktop-v5-desktop-12-1"
        ],
        "order": 12,
        "href": "library-course.html?id=desktop-12"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-6",
        "index": 6,
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "href": "practice-quiz.html?id=6"
      },
      {
        "id": "quiz-10",
        "index": 10,
        "title": {
          "ar": "تحليل البرمجيات الخبيثة",
          "en": "Malware analysis"
        },
        "href": "practice-quiz.html?id=10"
      }
    ],
    "labs": [
      {
        "id": "lab-6",
        "index": 6,
        "title": {
          "ar": "نسخة الأدلة وسلسلة الحيازة",
          "en": "Evidence copies and chain of custody"
        },
        "href": "practice-lab.html?id=6"
      },
      {
        "id": "lab-7",
        "index": 7,
        "title": {
          "ar": "قياس التغطية والاستجابة",
          "en": "Coverage and response validation"
        },
        "href": "practice-lab.html?id=7"
      }
    ],
    "challenges": [
      {
        "id": "challenge-6",
        "index": 6,
        "title": {
          "ar": "تحدي 07 — تحليل الذاكرة",
          "en": "Challenge 07: Memory forensics"
        },
        "href": "practice-challenge.html?id=6"
      },
      {
        "id": "challenge-9",
        "index": 9,
        "title": {
          "ar": "تحدي 10 — تحليل برمجية خبيثة",
          "en": "Challenge 10: Malware analysis"
        },
        "href": "practice-challenge.html?id=9"
      }
    ],
    "operations": [
      {
        "id": "red_phantom",
        "index": 0,
        "title": {
          "ar": "الوثيقة المشبوهة",
          "en": "Suspicious document"
        },
        "href": "operation.html?id=0"
      },
      {
        "id": "black_ledger",
        "index": 3,
        "title": {
          "ar": "دفتر الاستعادة",
          "en": "Recovery ledger"
        },
        "href": "operation.html?id=3"
      }
    ],
    "practical": "practical.html?id=path_dfir",
    "exam": "path-exam.html?id=path_dfir",
    "certificate": "path-exam.html?id=path_dfir"
  },
  {
    "id": "path_cloud",
    "title": {
      "ar": "أمن السحابة",
      "en": "Cloud security"
    },
    "summary": {
      "ar": "تعلّم المسؤولية المشتركة وأقل صلاحية وضوابط البناء والنشر.",
      "en": "Learn shared responsibility, least privilege and secure delivery controls."
    },
    "free": false,
    "icon": "cloud",
    "outcomes": {
      "ar": [
        "مفاهيم السحابة والهوية",
        "الإعدادات والصلاحيات",
        "الحاويات وسلسلة التوريد",
        "مختبر مراجعة إعدادات"
      ],
      "en": [
        "Cloud and identity basics",
        "Configuration and permissions",
        "Containers and supply chain",
        "Configuration review lab"
      ]
    },
    "courses": [
      {
        "id": "desktop-13",
        "title": {
          "ar": "أمن الحوسبة السحابية",
          "en": "Cloud security"
        },
        "summary": {
          "ar": "المسؤولية المشتركة وIAM والبنية ككود وأمن الحاويات",
          "en": "Explore shared responsibility, IAM, infrastructure as code and container security."
        },
        "lessonIds": [
          "desktop-topic-46",
          "desktop-topic-47",
          "desktop-topic-48",
          "desktop-topic-71",
          "desktop-v5-desktop-13-1"
        ],
        "order": 13,
        "href": "library-course.html?id=desktop-13"
      },
      {
        "id": "desktop-2",
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "summary": {
          "ar": "فهم حركة البيانات ثم تصميم شبكات مقسّمة وقابلة للرصد",
          "en": "Understand how data moves, then design segmented networks that you can monitor."
        },
        "lessonIds": [
          "desktop-topic-6",
          "desktop-topic-7",
          "desktop-topic-8",
          "desktop-topic-9",
          "desktop-topic-60",
          "desktop-topic-61",
          "desktop-v5-desktop-2-1"
        ],
        "order": 2,
        "href": "library-course.html?id=desktop-2"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-11",
        "index": 11,
        "title": {
          "ar": "أمن الحوسبة السحابية",
          "en": "Cloud security"
        },
        "href": "practice-quiz.html?id=11"
      },
      {
        "id": "quiz-1",
        "index": 1,
        "title": {
          "ar": "الشبكات والبروتوكولات",
          "en": "Networks and protocols"
        },
        "href": "practice-quiz.html?id=1"
      }
    ],
    "labs": [
      {
        "id": "lab-1",
        "index": 1,
        "title": {
          "ar": "ربط الحزم بهوية العملية",
          "en": "Correlating packets and process identity"
        },
        "href": "practice-lab.html?id=1"
      },
      {
        "id": "lab-7",
        "index": 7,
        "title": {
          "ar": "تقييم صلاحيات السحابة والانحراف",
          "en": "Cloud access and drift evaluation"
        },
        "href": "practice-lab.html?id=7&context=cloud"
      }
    ],
    "challenges": [
      {
        "id": "challenge-10",
        "index": 10,
        "title": {
          "ar": "تحدي 11 — اختراق سحابي",
          "en": "Challenge 11: Cloud security"
        },
        "href": "practice-challenge.html?id=10"
      }
    ],
    "operations": [
      {
        "id": "identity_echo",
        "index": 1,
        "title": {
          "ar": "صدى الهوية",
          "en": "Identity echo"
        },
        "href": "operation.html?id=1"
      },
      {
        "id": "frozen_beacon",
        "index": 5,
        "title": {
          "ar": "أثر سلسلة التسليم",
          "en": "Delivery chain trace"
        },
        "href": "operation.html?id=5"
      }
    ],
    "practical": "practical.html?id=path_cloud",
    "exam": "path-exam.html?id=path_cloud",
    "certificate": "path-exam.html?id=path_cloud"
  },
  {
    "id": "path_grc",
    "title": {
      "ar": "الحوكمة والمخاطر والامتثال",
      "en": "Governance, risk and compliance"
    },
    "summary": {
      "ar": "اربط السياسات بتقييم المخاطر والاستمرارية والتدقيق.",
      "en": "Connect policy to risk assessment, continuity and audit."
    },
    "free": false,
    "icon": "grc",
    "outcomes": {
      "ar": [
        "المفاهيم الأساسية",
        "تقييم المخاطر",
        "سياسات الأمن",
        "التدقيق والتحسين"
      ],
      "en": [
        "Security fundamentals",
        "Risk assessment",
        "Security policy",
        "Audit and improvement"
      ]
    },
    "courses": [
      {
        "id": "desktop-1",
        "title": {
          "ar": "المفاهيم الأساسية",
          "en": "Cybersecurity fundamentals"
        },
        "summary": {
          "ar": "أساس متين يبدأ بالمفاهيم وينتهي بإدارة المخاطر وسطح الهجوم",
          "en": "Build a strong foundation in core concepts, risk management and attack surfaces."
        },
        "lessonIds": [
          "desktop-topic-1",
          "desktop-topic-2",
          "desktop-topic-3",
          "desktop-topic-4",
          "desktop-topic-5",
          "desktop-topic-58",
          "desktop-topic-59",
          "desktop-v5-desktop-1-1"
        ],
        "order": 1,
        "href": "library-course.html?id=desktop-1"
      },
      {
        "id": "desktop-8",
        "title": {
          "ar": "مسارات الاحتراف",
          "en": "Career pathways"
        },
        "summary": {
          "ar": "خطة مهنية عملية تُثبت المهارة بالمشروعات والأدلة لا بالشهادات فقط",
          "en": "Build a career plan that demonstrates skills through projects and evidence."
        },
        "lessonIds": [
          "desktop-topic-29",
          "desktop-topic-30",
          "desktop-topic-31",
          "desktop-topic-32",
          "desktop-topic-33",
          "desktop-v5-desktop-8-1"
        ],
        "order": 8,
        "href": "library-course.html?id=desktop-8"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-0",
        "index": 0,
        "title": {
          "ar": "المفاهيم الأساسية",
          "en": "Cybersecurity fundamentals"
        },
        "href": "practice-quiz.html?id=0"
      },
      {
        "id": "quiz-7",
        "index": 7,
        "title": {
          "ar": "مسارات الاحتراف",
          "en": "Career pathways"
        },
        "href": "practice-quiz.html?id=7"
      }
    ],
    "labs": [
      {
        "id": "lab-7",
        "index": 7,
        "title": {
          "ar": "أدلة الضوابط وقرارات المخاطر",
          "en": "Control evidence and risk decisions"
        },
        "href": "practice-lab.html?id=7&context=grc"
      }
    ],
    "challenges": [
      {
        "id": "f-permissions",
        "title": {
          "ar": "أذونات الملف",
          "en": "File permissions"
        },
        "href": "challenges.html?challenge=f-permissions",
        "core": true
      },
      {
        "id": "f-sender",
        "title": {
          "ar": "اسم مرسل أم دليل؟",
          "en": "Display name or evidence?"
        },
        "href": "challenges.html?challenge=f-sender",
        "core": true
      }
    ],
    "operations": [
      {
        "id": "insider_shade",
        "index": 4,
        "title": {
          "ar": "استثناء منتهي",
          "en": "Expired exception"
        },
        "href": "operation.html?id=4"
      },
      {
        "id": "identity_echo",
        "index": 1,
        "title": {
          "ar": "صدى الهوية",
          "en": "Identity echo"
        },
        "href": "operation.html?id=1"
      }
    ],
    "practical": "practical.html?id=path_grc",
    "exam": "path-exam.html?id=path_grc",
    "certificate": "path-exam.html?id=path_grc"
  },
  {
    "id": "path_appsec",
    "title": {
      "ar": "أمن التطبيقات وDevSecOps",
      "en": "Application security and DevSecOps"
    },
    "summary": {
      "ar": "افهم HTTP والجلسات والصلاحيات، ثم حلّل تطبيقاً تدريبياً.",
      "en": "Understand HTTP, sessions and authorization, then inspect a training app."
    },
    "free": false,
    "icon": "appsec",
    "outcomes": {
      "ar": [
        "HTTP وأساسيات الويب",
        "الجلسات والتحكم بالوصول",
        "فئات ثغرات OWASP",
        "مختبر وتحليل وإصلاح"
      ],
      "en": [
        "HTTP and web basics",
        "Sessions and access control",
        "OWASP vulnerability classes",
        "Lab, analysis and remediation"
      ]
    },
    "courses": [
      {
        "id": "desktop-9",
        "title": {
          "ar": "لينكس للأمن السيبراني",
          "en": "Linux for cybersecurity"
        },
        "summary": {
          "ar": "إدارة لينكس بأقل صلاحية وتقوية النظام واكتشاف الانحراف",
          "en": "Administer Linux with least privilege, harden systems and detect configuration drift."
        },
        "lessonIds": [
          "desktop-topic-34",
          "desktop-topic-35",
          "desktop-topic-36",
          "desktop-topic-68",
          "desktop-v5-desktop-9-1"
        ],
        "order": 9,
        "href": "library-course.html?id=desktop-9"
      },
      {
        "id": "desktop-10",
        "title": {
          "ar": "أمن تطبيقات الويب",
          "en": "Web application security"
        },
        "summary": {
          "ar": "من فئات الثغرات إلى تصميم هوية وجلسات وضوابط قابلة للتحقق",
          "en": "Move from vulnerability classes to verifiable controls for identity and sessions."
        },
        "lessonIds": [
          "desktop-topic-37",
          "desktop-topic-38",
          "desktop-topic-39",
          "desktop-topic-69",
          "desktop-v5-desktop-10-1"
        ],
        "order": 10,
        "href": "library-course.html?id=desktop-10"
      },
      {
        "id": "desktop-v5-category-2",
        "title": {
          "ar": "أمن البرمجيات وDevSecOps",
          "en": "Software security and DevSecOps"
        },
        "summary": {
          "ar": "بناء الأمن داخل التصميم والكود وخطوط CI/CD وسلسلة توريد البرمجيات",
          "en": "Build security into design, code, CI/CD pipelines and the software supply chain."
        },
        "lessonIds": [
          "desktop-v5-2-1",
          "desktop-v5-2-2",
          "desktop-v5-2-3",
          "desktop-v5-2-4"
        ],
        "order": 18,
        "href": "library-course.html?id=desktop-v5-category-2"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-8",
        "index": 8,
        "title": {
          "ar": "لينكس للأمن السيبراني",
          "en": "Linux for cybersecurity"
        },
        "href": "practice-quiz.html?id=8"
      },
      {
        "id": "quiz-9",
        "index": 9,
        "title": {
          "ar": "أمن تطبيقات الويب المتقدم",
          "en": "Web application security"
        },
        "href": "practice-quiz.html?id=9"
      }
    ],
    "labs": [
      {
        "id": "lab-2",
        "index": 2,
        "title": {
          "ar": "تفويض الكائنات في API",
          "en": "Object authorization in an API"
        },
        "href": "practice-lab.html?id=2"
      },
      {
        "id": "lab-5",
        "index": 5,
        "title": {
          "ar": "صلاحيات Linux الفعلية",
          "en": "Effective Linux permissions"
        },
        "href": "practice-lab.html?id=5"
      }
    ],
    "challenges": [
      {
        "id": "challenge-2",
        "index": 2,
        "title": {
          "ar": "تحدي 03 — حقن SQL",
          "en": "Challenge 03: SQL injection"
        },
        "href": "practice-challenge.html?id=2"
      },
      {
        "id": "challenge-3",
        "index": 3,
        "title": {
          "ar": "تحدي 04 — XSS المخفي",
          "en": "Challenge 04: Cross-site scripting"
        },
        "href": "practice-challenge.html?id=3"
      }
    ],
    "operations": [
      {
        "id": "glass_harbor",
        "index": 2,
        "title": {
          "ar": "بوابة المستأجر",
          "en": "Tenant gateway"
        },
        "href": "operation.html?id=2"
      },
      {
        "id": "frozen_beacon",
        "index": 5,
        "title": {
          "ar": "أثر سلسلة التسليم",
          "en": "Delivery chain trace"
        },
        "href": "operation.html?id=5"
      }
    ],
    "practical": "practical.html?id=path_appsec",
    "exam": "path-exam.html?id=path_appsec",
    "certificate": "path-exam.html?id=path_appsec"
  },
  {
    "id": "path_mobile",
    "title": {
      "ar": "أمن تطبيقات الهاتف",
      "en": "Mobile application security"
    },
    "summary": {
      "ar": "احمِ التخزين والصلاحيات والاتصال وواجهات API في تطبيقات الهاتف.",
      "en": "Protect storage, permissions, transport and APIs in mobile apps."
    },
    "free": false,
    "icon": "mobile",
    "outcomes": {
      "ar": [
        "بنية تطبيق الهاتف",
        "التخزين والصلاحيات",
        "الاتصال وواجهات API",
        "تقرير الإصلاح"
      ],
      "en": [
        "Mobile app architecture",
        "Storage and permissions",
        "Transport and APIs",
        "Remediation report"
      ]
    },
    "courses": [
      {
        "id": "desktop-14",
        "title": {
          "ar": "أمن الهواتف المحمولة",
          "en": "Mobile security"
        },
        "summary": {
          "ar": "اختبار الخصوصية والصلاحيات والتخزين والاتصال في تطبيقات الهاتف",
          "en": "Test privacy, permissions, storage and communications in mobile applications."
        },
        "lessonIds": [
          "desktop-topic-49",
          "desktop-topic-50",
          "desktop-topic-51",
          "desktop-topic-72",
          "desktop-v5-desktop-14-1"
        ],
        "order": 14,
        "href": "library-course.html?id=desktop-14"
      },
      {
        "id": "desktop-10",
        "title": {
          "ar": "أمن تطبيقات الويب",
          "en": "Web application security"
        },
        "summary": {
          "ar": "من فئات الثغرات إلى تصميم هوية وجلسات وضوابط قابلة للتحقق",
          "en": "Move from vulnerability classes to verifiable controls for identity and sessions."
        },
        "lessonIds": [
          "desktop-topic-37",
          "desktop-topic-38",
          "desktop-topic-39",
          "desktop-topic-69",
          "desktop-v5-desktop-10-1"
        ],
        "order": 10,
        "href": "library-course.html?id=desktop-10"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-9",
        "index": 9,
        "title": {
          "ar": "أمن تطبيقات الويب المتقدم",
          "en": "Web application security"
        },
        "href": "practice-quiz.html?id=9"
      }
    ],
    "labs": [
      {
        "id": "lab-2",
        "index": 2,
        "title": {
          "ar": "حدود تطبيق الهاتف وتفويض البيانات",
          "en": "Mobile boundaries and data authorization"
        },
        "href": "practice-lab.html?id=2&context=mobile"
      }
    ],
    "challenges": [
      {
        "id": "challenge-12",
        "index": 12,
        "title": {
          "ar": "تحدي 13 — أمن الهواتف",
          "en": "Challenge 13: Mobile security"
        },
        "href": "practice-challenge.html?id=12"
      }
    ],
    "operations": [
      {
        "id": "identity_echo",
        "index": 1,
        "title": {
          "ar": "صدى الهوية",
          "en": "Identity echo"
        },
        "href": "operation.html?id=1"
      },
      {
        "id": "glass_harbor",
        "index": 2,
        "title": {
          "ar": "بوابة المستأجر",
          "en": "Tenant gateway"
        },
        "href": "operation.html?id=2"
      }
    ],
    "practical": "practical.html?id=path_mobile",
    "exam": "path-exam.html?id=path_mobile",
    "certificate": "path-exam.html?id=path_mobile"
  },
  {
    "id": "path_threat_intel",
    "title": {
      "ar": "استخبارات التهديدات وOSINT",
      "en": "Threat intelligence and OSINT"
    },
    "summary": {
      "ar": "اجمع إشارات مصرّحاً بها، قيّم الثقة، واربطها بالدليل والدفاع.",
      "en": "Collect authorized leads, assess confidence and connect them to evidence and defense."
    },
    "free": false,
    "icon": "intel",
    "outcomes": {
      "ar": [
        "نطاق البحث",
        "تقييم المصادر",
        "تحليل المؤشرات",
        "تقرير الاستخبارات"
      ],
      "en": [
        "Research scope",
        "Source assessment",
        "Indicator analysis",
        "Intelligence report"
      ]
    },
    "courses": [
      {
        "id": "desktop-15",
        "title": {
          "ar": "OSINT واستخبارات المصادر",
          "en": "OSINT and source intelligence"
        },
        "summary": {
          "ar": "جمع قانوني، تحقق متعدد المصادر، وتقدير واضح للثقة",
          "en": "Collect information lawfully, corroborate sources and state your confidence clearly."
        },
        "lessonIds": [
          "desktop-topic-52",
          "desktop-topic-53",
          "desktop-topic-54",
          "desktop-topic-73",
          "desktop-v5-desktop-15-1"
        ],
        "order": 15,
        "href": "library-course.html?id=desktop-15"
      },
      {
        "id": "desktop-7",
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "summary": {
          "ar": "حفظ الدليل، بناء الخط الزمني، والتحقيق القابل للتدقيق",
          "en": "Preserve evidence, reconstruct timelines and conduct investigations that can be audited."
        },
        "lessonIds": [
          "desktop-topic-26",
          "desktop-topic-27",
          "desktop-topic-28",
          "desktop-topic-67",
          "desktop-v5-desktop-7-1"
        ],
        "order": 7,
        "href": "library-course.html?id=desktop-7"
      },
      {
        "id": "desktop-v5-category-1",
        "title": {
          "ar": "عمليات الدفاع المتقدم",
          "en": "Advanced defense operations"
        },
        "summary": {
          "ar": "من هندسة السجلات وSIEM إلى قواعد الكشف وThreat Hunting والاستجابة المنظّمة",
          "en": "Build log and SIEM pipelines, detection rules, threat hunts and response playbooks."
        },
        "lessonIds": [
          "desktop-v5-1-1",
          "desktop-v5-1-2",
          "desktop-v5-1-3",
          "desktop-v5-1-4"
        ],
        "order": 17,
        "href": "library-course.html?id=desktop-v5-category-1"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-6",
        "index": 6,
        "title": {
          "ar": "الطب الشرعي الرقمي",
          "en": "Digital forensics"
        },
        "href": "practice-quiz.html?id=6"
      }
    ],
    "labs": [
      {
        "id": "lab-6",
        "index": 6,
        "title": {
          "ar": "استقلال المصادر وحدود الإسناد",
          "en": "Source independence and attribution limits"
        },
        "href": "practice-lab.html?id=6&context=intel"
      },
      {
        "id": "lab-7",
        "index": 7,
        "title": {
          "ar": "قياس التغطية والاستجابة",
          "en": "Coverage and response validation"
        },
        "href": "practice-lab.html?id=7"
      }
    ],
    "challenges": [
      {
        "id": "challenge-8",
        "index": 8,
        "title": {
          "ar": "تحدي 09 — استخبارات OSINT",
          "en": "Challenge 09: OSINT investigation"
        },
        "href": "practice-challenge.html?id=8"
      },
      {
        "id": "challenge-6",
        "index": 6,
        "title": {
          "ar": "تحدي 07 — تحليل الذاكرة",
          "en": "Challenge 07: Memory forensics"
        },
        "href": "practice-challenge.html?id=6"
      }
    ],
    "operations": [
      {
        "id": "frozen_beacon",
        "index": 5,
        "title": {
          "ar": "أثر سلسلة التسليم",
          "en": "Delivery chain trace"
        },
        "href": "operation.html?id=5"
      },
      {
        "id": "red_phantom",
        "index": 0,
        "title": {
          "ar": "الوثيقة المشبوهة",
          "en": "Suspicious document"
        },
        "href": "operation.html?id=0"
      }
    ],
    "practical": "practical.html?id=path_threat_intel",
    "exam": "path-exam.html?id=path_threat_intel",
    "certificate": "path-exam.html?id=path_threat_intel"
  },
  {
    "id": "path_malware",
    "title": {
      "ar": "تحليل البرمجيات والهندسة العكسية",
      "en": "Malware analysis and reverse engineering"
    },
    "summary": {
      "ar": "تحليل ساكن وآمن للملفات قبل الانتقال إلى سلوكها في بيئة معزولة.",
      "en": "Start with safe static file analysis before isolated behavior analysis."
    },
    "free": false,
    "icon": "malware",
    "outcomes": {
      "ar": [
        "بنية الملفات",
        "التحليل الثابت",
        "مفاهيم الهندسة العكسية",
        "تقرير المؤشرات"
      ],
      "en": [
        "File structure",
        "Static analysis",
        "Reverse engineering concepts",
        "Indicators report"
      ]
    },
    "courses": [
      {
        "id": "desktop-9",
        "title": {
          "ar": "لينكس للأمن السيبراني",
          "en": "Linux for cybersecurity"
        },
        "summary": {
          "ar": "إدارة لينكس بأقل صلاحية وتقوية النظام واكتشاف الانحراف",
          "en": "Administer Linux with least privilege, harden systems and detect configuration drift."
        },
        "lessonIds": [
          "desktop-topic-34",
          "desktop-topic-35",
          "desktop-topic-36",
          "desktop-topic-68",
          "desktop-v5-desktop-9-1"
        ],
        "order": 9,
        "href": "library-course.html?id=desktop-9"
      },
      {
        "id": "desktop-12",
        "title": {
          "ar": "تحليل البرمجيات الخبيثة",
          "en": "Malware analysis"
        },
        "summary": {
          "ar": "تحليل آمن ومنهجي يحوّل المؤشرات إلى فرضيات وتقرير دفاعي",
          "en": "Analyze malware safely and turn indicators into defensible findings."
        },
        "lessonIds": [
          "desktop-topic-43",
          "desktop-topic-44",
          "desktop-topic-45",
          "desktop-topic-70",
          "desktop-v5-desktop-12-1"
        ],
        "order": 12,
        "href": "library-course.html?id=desktop-12"
      },
      {
        "id": "desktop-16",
        "title": {
          "ar": "الهندسة العكسية",
          "en": "Reverse engineering"
        },
        "summary": {
          "ar": "قراءة بنية البرامج وAssembly وفهم تدفق التنفيذ بصورة آمنة",
          "en": "Read program structure and assembly to understand execution flow safely."
        },
        "lessonIds": [
          "desktop-topic-55",
          "desktop-topic-56",
          "desktop-topic-57",
          "desktop-topic-74",
          "desktop-v5-desktop-16-1"
        ],
        "order": 16,
        "href": "library-course.html?id=desktop-16"
      }
    ],
    "optionalCourses": [],
    "quizzes": [
      {
        "id": "quiz-8",
        "index": 8,
        "title": {
          "ar": "لينكس للأمن السيبراني",
          "en": "Linux for cybersecurity"
        },
        "href": "practice-quiz.html?id=8"
      },
      {
        "id": "quiz-10",
        "index": 10,
        "title": {
          "ar": "تحليل البرمجيات الخبيثة",
          "en": "Malware analysis"
        },
        "href": "practice-quiz.html?id=10"
      }
    ],
    "labs": [
      {
        "id": "lab-6",
        "index": 6,
        "title": {
          "ar": "تتبع الفرع وتفسير signed وunsigned",
          "en": "Branch tracing: signed and unsigned interpretation"
        },
        "href": "practice-lab.html?id=6&context=reverse"
      }
    ],
    "challenges": [
      {
        "id": "challenge-9",
        "index": 9,
        "title": {
          "ar": "تحدي 10 — تحليل برمجية خبيثة",
          "en": "Challenge 10: Malware analysis"
        },
        "href": "practice-challenge.html?id=9"
      },
      {
        "id": "challenge-11",
        "index": 11,
        "title": {
          "ar": "تحدي 12 — الهندسة العكسية",
          "en": "Challenge 12: Reverse engineering"
        },
        "href": "practice-challenge.html?id=11"
      }
    ],
    "operations": [
      {
        "id": "red_phantom",
        "index": 0,
        "title": {
          "ar": "الوثيقة المشبوهة",
          "en": "Suspicious document"
        },
        "href": "operation.html?id=0"
      },
      {
        "id": "black_ledger",
        "index": 3,
        "title": {
          "ar": "دفتر الاستعادة",
          "en": "Recovery ledger"
        },
        "href": "operation.html?id=3"
      },
      {
        "id": "frozen_beacon",
        "index": 5,
        "title": {
          "ar": "أثر سلسلة التسليم",
          "en": "Delivery chain trace"
        },
        "href": "operation.html?id=5"
      }
    ],
    "practical": "practical.html?id=path_malware",
    "exam": "path-exam.html?id=path_malware",
    "certificate": "path-exam.html?id=path_malware"
  }
];
