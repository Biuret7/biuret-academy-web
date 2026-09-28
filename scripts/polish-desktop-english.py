"""Apply reviewed cybersecurity terminology to the Argos draft translation."""

import json
from pathlib import Path

FILE = Path(__file__).resolve().parents[1] / "content" / "desktop-library.en.json"
data = json.loads(FILE.read_text(encoding="utf-8"))

titles = [
    ("Cybersecurity fundamentals", ["What is cybersecurity?", "Types of cyber threats", "Ethical and malicious hackers", "Defense in depth", "Security risk management", "Compliance and security standards", "Security operations centers (SOC)", "Attack surface and threat modeling"]),
    ("Networks and protocols", ["Networking fundamentals for cybersecurity", "The TCP/IP protocol suite", "ARP and DNS attacks", "Firewalls and intrusion detection", "VPNs and secure communications", "Network forensics and traffic analysis", "Network engineering and Zero Trust"]),
    ("Penetration testing", ["Penetration testing methodology", "Web attacks: SQL injection", "XSS and CSRF attacks", "Privilege escalation", "Wireless network security", "Buffer overflows and exploitation basics", "Writing professional penetration test reports", "Validating vulnerabilities and remediation"]),
    ("Cryptography and data protection", ["Introduction to cryptography", "Symmetric encryption: AES and DES", "Asymmetric encryption: RSA and ECC", "Hashing and TLS", "PKI and digital certificates", "Key and secret lifecycle management"]),
    ("Security tools", ["Nmap: complete guide", "Metasploit Framework", "Burp Suite for professionals", "Advanced OSINT tools", "CrackMapExec and Hydra: password attacks", "Building a multi-tool analysis workflow"]),
    ("Social engineering", ["Introduction to social engineering", "Recognizing phishing", "Defending against social engineering", "Physical security", "Security behavior and awareness culture"]),
    ("Digital forensics", ["Introduction to digital forensics", "Live memory analysis", "Security incident response", "Windows forensics", "Building incident timelines from logs"]),
    ("Career pathways", ["CompTIA Security+", "CEH: Certified Ethical Hacker", "OSCP: Offensive Security Certified Professional", "Cybersecurity career map", "Preparing for your first security job", "Building an evidence-based portfolio"]),
    ("Linux for cybersecurity", ["Essential Linux commands", "Linux permissions", "Kali Linux: setup and tools", "Security shell scripting", "Linux hardening and configuration drift"]),
    ("Web application security", ["OWASP Top 10 (2021)", "Advanced vulnerabilities: SSRF, XXE and SSTI", "API security: attacks and defense", "File upload attacks and path traversal", "Identity, sessions, OAuth 2.0 and OIDC"]),
    ("Active Directory", ["Introduction to Active Directory", "Kerberoasting and Pass-the-Hash", "BloodHound and attack path analysis", "Azure AD and cloud identity", "Active Directory hardening and tiering"]),
    ("Malware analysis", ["Static malware analysis", "Dynamic malware analysis", "Ransomware analysis", "Advanced malware analysis", "YARA rules and analysis reports"]),
    ("Cloud security", ["Introduction to cloud security", "Common AWS attack paths", "Cloud misconfigurations", "Docker and Kubernetes security", "Cloud IAM and infrastructure as code"]),
    ("Mobile security", ["Android architecture and weaknesses", "Android penetration testing", "OWASP Mobile Top 10", "MDM and enterprise mobile security", "Privacy and secure storage in mobile apps"]),
    ("OSINT and source intelligence", ["Professional OSINT methodology", "Advanced OSINT tools", "Corporate and infrastructure OSINT", "Defensive OSINT and information protection", "Evaluating sources and resisting misinformation"]),
    ("Reverse engineering", ["Introduction to reverse engineering", "Analyzing PE and ELF files", "Ghidra and x64dbg: practical analysis", "CTF reverse engineering challenges", "x86-64 assembly and execution flow"]),
    ("Advanced defense operations", ["Log engineering and SIEM pipelines", "Detection rules and MITRE ATT&CK", "Hypothesis-driven threat hunting", "Incident triage and response playbooks"]),
    ("Software security and DevSecOps", ["Secure development lifecycle and threat modeling", "SAST, DAST, SCA and secret scanning", "CI/CD security, software supply chain and SBOM", "Policy as code, containers and IaC security"]),
]

assert len(data["categories"]) == len(titles)
for category, (name, lessons) in zip(data["categories"], titles):
    assert len(category["lessons"]) == len(lessons), category["id"]
    category["title"] = name
    for lesson, title in zip(category["lessons"], lessons):
        lesson["title"] = title

for index, course_index in enumerate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]):
    data["quizzes"][index]["name"] = titles[course_index][0]

for item, name in zip(data["labs"], ["Lab 01: Network discovery", "Lab 02: Packet analysis", "Lab 03: Initial access", "Lab 04: Password security", "Lab 05: Wireless security", "Lab 06: Post-exploitation", "Lab 07: Digital forensics", "Lab 08: Incident response"]):
    item["name"] = name

for item, name in zip(data["operations"], ["Red Ghost", "Identity Echo", "Glass Port", "Black Record", "Inner Shadow", "Frozen Lighthouse"]):
    item["title"] = name

replacements = {
    "Terms of Reference (ACLs)": "access control lists (ACLs)",
    "No denial (Non-Repudiation)": "Non-repudiation",
    "data penetration": "data breach",
    "Don't feel suspicious — threats evolve daily": "The field continues to evolve as threats change",
    "Terms of reference after ratification": "Permissions granted after authentication",
    "programme": "program", "Programme": "Program", "programmes": "programs",
    "Lennox": "Linux", "Blinks": "Linux", "Active Dire ctory": "Active Directory",
    "Kubern etes": "Kubernetes", "Kubern etes": "Kubernetes",
    "Moral Hacker": "Ethical Hacker", "moral hacker": "ethical hacker",
    "infiltration test": "penetration test", "Intrusion testing": "Penetration testing",
    "Anthropology analysis": "Malware analysis", "anthropology analysis": "malware analysis",
    "الن Integrity": "Integrity", "ال Available": "Availability", "ة Certification": "Authentication",
    "التفويض Delegation": "Authorization", "نة Trojans": "Trojans", "ال Spyware": "Spyware",
    "ال Avoidance": "Avoidance", "المخترق الضار": "malicious hacker",
    "العمل عن بُعد متاح في معظم الأدوار": "Remote work is available in many roles",
    '💡 نصيحة عملية: افهم "لماذا" قبل "كيف" — كل هجوم يستغل خللاً في أحد أضلاع CIA الثلاثة.': '💡 Practical tip: Understand why before how; each attack exploits a weakness in confidentiality, integrity, or availability.',
    "✅ تحقق من التدقيق الإملائي والنحوي": "✅ Check spelling and grammar",
    '"مرحباً بالأمن السيبراني"': '"Hello, cybersecurity"',
    "🧩 جسر الفهم — اختر الآلية بالسؤال الصحيح:": "🧩 Bridge to understanding: Choose the mechanism by asking the right question:",
    "🧩 جسر الفهم — ابنِ المسار من مخرجات العمل:": "🧩 Bridge to understanding: Build your route around practical outcomes:",
    "🧩 جسر الفهم — اقرأ قبل أن تغيّر:": "🧩 Bridge to understanding: Read before you change:",
    "✅ مفاتيح أصغر بكثير → أسرع في الحساب والنقل": "✅ Much smaller keys → faster computation and transfer",
    "مالك": "owner", "أسرع (أقل دقة)": "faster (less accurate)",
    "أجهزة بكلمات مرور افتراضية": "devices with default passwords",
    "SSH قديم": "outdated SSH", "Redis مكشوف": "exposed Redis",
    "/api/v1 لا تزال تعمل بعد إطلاق v2 (وأمانها أضعف!)": "/api/v1 still works after v2 launches (with weaker security!)",
    "🧩 جسر الفهم — ارسم الثقة قبل التفاصيل:": "🧩 Bridge to understanding: Map trust boundaries before details:",
    "← خطر جداً!": "← Very dangerous!", "# أنظمة ويب": "# web systems",
    "حُذفت الـ Symbols": "symbols were removed",
}


def polish(value):
    if isinstance(value, str):
        for old, new in replacements.items():
            value = value.replace(old, new)
        return value
    if isinstance(value, list):
        return [polish(item) for item in value]
    if isinstance(value, dict):
        return {key: polish(item) for key, item in value.items()}
    return value


data = polish(data)
for cert, note in zip(data["certifications"], [None, "Recommended first penetration testing certification", None, "Complements Security+", "Industry benchmark for penetration testing", None, "Strong practical Red Team certification", "A strong starting point for Blue Team roles"]):
    if note:
        cert["note"] = note

FILE.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("Polished 18 course titles and 99 lesson titles")
