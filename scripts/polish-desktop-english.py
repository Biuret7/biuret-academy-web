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

for category, description in zip(data["categories"], [
    "Build a strong foundation in core concepts, risk management and attack surfaces.",
    "Understand how data moves, then design segmented networks that you can monitor.",
    "Plan authorized, evidence-based tests from scope definition to remediation checks.",
    "Choose appropriate encryption and manage keys and secrets throughout their lifecycle.",
    "Use security tools as part of a careful workflow, verify findings and reduce mistakes.",
    "Recognize manipulation and build habits and cultures that resist social engineering.",
    "Preserve evidence, reconstruct timelines and conduct investigations that can be audited.",
    "Build a career plan that demonstrates skills through projects and evidence.",
    "Administer Linux with least privilege, harden systems and detect configuration drift.",
    "Move from vulnerability classes to verifiable controls for identity and sessions.",
    "Understand enterprise identity, harden it and monitor privilege paths.",
    "Analyze malware safely and turn indicators into defensible findings.",
    "Explore shared responsibility, IAM, infrastructure as code and container security.",
    "Test privacy, permissions, storage and communications in mobile applications.",
    "Collect information lawfully, corroborate sources and state your confidence clearly.",
    "Read program structure and assembly to understand execution flow safely.",
    "Build log and SIEM pipelines, detection rules, threat hunts and response playbooks.",
    "Build security into design, code, CI/CD pipelines and the software supply chain.",
]):
    category["description"] = description

for index, course_index in enumerate([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]):
    data["quizzes"][index]["name"] = titles[course_index][0]

for item, name in zip(data["labs"], ["Lab 01: Network discovery", "Lab 02: Packet analysis", "Lab 03: Initial access", "Lab 04: Password security", "Lab 05: Wireless security", "Lab 06: Post-exploitation", "Lab 07: Digital forensics", "Lab 08: Incident response"]):
    item["name"] = name

for item, description in zip(data["labs"], [
    "Use Nmap to identify hosts, ports and services in an authorized lab network.",
    "Capture and analyze network traffic to identify unencrypted data.",
    "Investigate SQL injection and XSS in a controlled DVWA practice environment.",
    "Practice dictionary attacks against sample MD5 and NTLM hashes.",
    "Study Wi-Fi security through a captured WPA2 handshake in a lab.",
    "Investigate Linux privilege escalation in an authorized environment.",
    "Analyze a memory image to identify suspicious activity.",
    "Work through an incident from detection to a documented report.",
]):
    item["desc"] = description

for item, name in zip(data["operations"], ["Red Ghost", "Identity Echo", "Glass Port", "Black Record", "Inner Shadow", "Frozen Lighthouse"]):
    item["title"] = name

for item, name in zip(data["challenges"], [
    "Challenge 01: Network discovery", "Challenge 02: Decode the message",
    "Challenge 03: SQL injection", "Challenge 04: Cross-site scripting",
    "Challenge 05: Network interception", "Challenge 06: Privilege escalation",
    "Challenge 07: Memory forensics", "Challenge 08: Active Directory compromise",
    "Challenge 09: OSINT investigation", "Challenge 10: Malware analysis",
    "Challenge 11: Cloud security", "Challenge 12: Reverse engineering",
    "Challenge 13: Mobile security",
]):
    item["name"] = name

for item, description in zip(data["challenges"], [
    "Inspect a training Linux host, identify open services and determine an initial access path.",
    "Identify the right approach to sample MD5, SHA-1 and bcrypt hashes.",
    "Investigate a SQL injection finding and explain its impact on sample data.",
    "Identify and document reflected, stored and DOM-based XSS in a training app.",
    "Analyze a simulated network interception and identify exposed plaintext data.",
    "Start with a limited Linux account and trace a privilege escalation path.",
    "Analyze a memory image to identify a malicious process and its network activity.",
    "Trace an Active Directory attack path from a standard user to domain privilege.",
    "Build an intelligence brief about a fictional target using public sources only.",
    "Analyze a malware sample safely and extract indicators of compromise.",
    "Find a cloud misconfiguration that could expose stored data.",
    "Reverse engineer a small training executable to find its hidden password.",
    "Inspect a training Android APK for embedded API keys and secrets.",
]):
    item["desc"] = description

for item, category in zip(data["tools"], [
    "Reconnaissance", "Exploitation", "Network analysis", "Web application security",
    "Password auditing", "Wireless security", "Web application security",
    "Password auditing", "Content discovery", "Password auditing",
    "Digital forensics", "Digital forensics", "OSINT", "Web scanning", "OSINT",
]):
    item["category"] = category

for item, (description, usage) in zip(data["tools"], [
    ("Discover hosts, open ports, services and operating systems on authorized networks.", "nmap [options] [target]"),
    ("Penetration testing framework with modules for validation in authorized labs.", "Open msfconsole, then search, select, configure and run a module."),
    ("Capture and inspect network packets through a graphical interface.", "Choose a network interface, capture traffic, then filter by protocol or IP."),
    ("Inspect and test web application requests with Proxy, Repeater and related tools.", "Configure the browser proxy at 127.0.0.1:8080 and inspect requests."),
    ("Audit password hashes with GPU acceleration and supported hash modes.", "hashcat -m [type] -a [mode] [hashfile] [wordlist]"),
    ("Tool suite for authorized Wi-Fi monitoring, capture and security assessment.", "Use airmon-ng, airodump-ng and related tools only in a lab you control."),
    ("Automate detection and validation of SQL injection in authorized web applications.", "sqlmap -u [URL] [options]"),
    ("Audit passwords against sample hashes in several formats.", "john [options] [hashfile]"),
    ("Discover paths, files and subdomains on systems you are authorized to test.", "gobuster [mode] -u [URL] -w [wordlist]"),
    ("Test authentication strength against authorized SSH, FTP, HTTP or RDP services.", "hydra -l [user] -P [wordlist] [target] [service]"),
    ("Analyze memory images as part of a digital forensics investigation.", "vol.py -f [memory.raw] [plugin]"),
    ("Open-source graphical platform for forensic analysis of disk images and files.", "Create a case, add an image, then inspect the extracted artifacts."),
    ("Collect publicly available domain, email, IP and URL information.", "theHarvester -d [domain] -b [source] -l [limit]"),
    ("Scan authorized web servers for unsafe configuration and outdated components.", "nikto -h [target] [options]"),
    ("Map relationships between domains, IP addresses, people and organizations.", "Create a graph, add entities, then run relevant transforms."),
]):
    item["description"] = description
    item["usage"] = usage
data["tools"][3]["example"] = "Proxy → Intercept → Repeater → review response"

for path, title in zip(data["roadmapPaths"], [
    "Penetration tester", "SOC analyst", "Digital forensics and incident response",
    "Cloud security specialist", "Governance, risk and compliance specialist",
]):
    path[1] = title

levels = {"Junior.": "Beginner", "Average": "Intermediate", "Advanced.": "Advanced"}
for category in data["categories"]:
    for lesson in category["lessons"]:
        lesson["difficulty"] = levels.get(lesson.get("difficulty"), lesson.get("difficulty"))
for group in ("quizzes", "labs", "challenges"):
    for item in data[group]:
        item["diff"] = levels.get(item.get("diff"), item.get("diff"))
for group in ("operations", "certifications"):
    for item in data[group]:
        item["difficulty"] = levels.get(item.get("difficulty"), item.get("difficulty"))

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
