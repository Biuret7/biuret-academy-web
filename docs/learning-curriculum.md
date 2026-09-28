# Biuret Academy web learning sequence

The desktop Biuret Academy curriculum is the subject inventory. Its lessons are not automatically web courses: each release needs an edited Arabic and English lesson, a guided exercise, a reviewed check, and a clear place in the roadmap. The web edition currently has one complete verified path (Foundations), two guided practice labs, and introductory challenges. Specialization cards are previews until their reviewed content is published.

## Learner route

1. **Foundations:** URL safety → identity and access → evidence and response. Nine published lessons, two guided labs, five optional Foundations challenges, and a server graded final exam with an achievement credential.
2. **Choose a specialization:** explore web security, SOC and incident response, authorized penetration testing, digital forensics, cloud and DevSecOps, or malware analysis and reverse engineering. Show the expected outcomes and sequence before asking the learner to choose.
3. **Specialization loop:** short course → guided tool explanation → safe lab → challenge → formative check → final assessment → verified credential. Each part should point to the next relevant activity. Review exercises should be suggested when a learner struggles.

## Content release order

| Release | Desktop subjects to adapt | First web deliverable |
| --- | --- | --- |
| Foundations extension | Cybersecurity concepts, networking, Linux, cryptography | Add reviewed lessons on network traffic, least privilege and hashing with one lab each. |
| Web security | HTTP, OWASP classes, APIs, Burp Suite | Build a complete web application security path in a synthetic training environment. |
| SOC and forensics | Logs, incident response, Windows forensics, memory analysis | Build case based labs with evidence notes and defensible conclusions. |
| Authorized testing | Methodology, Nmap, reports, wireless security | Keep activities scoped to local training assets and grade the report as well as the answer. |
| Cloud and DevSecOps | Cloud identity, configuration, containers, supply chain | Use synthetic policies and deployment artifacts for safe review labs. |
| Advanced specialties | Mobile, OSINT, Active Directory, malware and reverse engineering | Add individual paths after foundational prerequisites and lab review. |

## Release contract

- State prerequisites, outcomes, expected time, and the next activity on every course.
- Publish Arabic and English content together. Check RTL/LTR rendering of code and evidence.
- Use synthetic or explicitly authorized lab assets. Explain both the observation and the limits of the conclusion.
- Keep verified XP, Biuret Coins, exam answers, and credentials on the server. Browser only labs are labeled as practice.
- Review each lesson and assessment before publishing through `content/drafts` and the existing release workflow. Do not edit the generated `learning-content.js` directly.
- Add real specialization enrollment and progress only when courses, labs, assessment and server records are ready; roadmap previews must remain explicit until then.
