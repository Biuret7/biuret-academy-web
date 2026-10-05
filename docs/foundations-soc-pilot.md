# Foundations and SOC pilot — 5 October 2026

## Scope and status

This is an authored learning-quality iteration, not an independent expert review or a completed human usability study. Purchases remain closed. Existing lesson IDs, server reward rules, course/path prerequisites, final examination thresholds and earned credentials are preserved.

- Foundations: all nine lessons now include concept boundaries, a worked example, an independent task and correction criteria. The original formative questions and answer indices remain compatible with the server contract.
- SOC required courses: Networks (2), Cryptography (4), Digital Forensics (7). Eighteen lesson guides have topic-specific evidence, analysis, exercises and feedback. These are still guided evidence exercises, not provisioned machines.
- SOC optional extension: Advanced Defense Operations (17), four lessons. Visible inside SOC but excluded from required lesson counts and current certificate prerequisites.
- Analyst desk: embedded in the Foundations sign-in lab and SOC labs 1 and 7. Search and filter eight synthetic records, select evidence, identify the failure count, decide what can be inferred, and choose next steps. Feedback explains correlation and uncertainty. Browser-local outcomes award no XP and cannot satisfy server assessments. Written reasoning is not automatically graded.
- Account-scoped local persistence and optional JSON export of practice reports and learner feedback. Nothing is automatically submitted, and account IDs, names and email are not added to exports. Learner-entered free text can contain personal data; the interface asks learners not to include it.

## Learning → practice → assessment alignment

| Outcome | Required teaching | Independent practice | Existing assessment coverage |
| --- | --- | --- | --- |
| Find the actual URL destination; distinguish TLS from trust | url-parts, url-traps, url-decision | Host decomposition, redirect comparison, HTTP lab | Foundations host/verification case |
| Distinguish authentication, authorization and session revocation | identity-passwords, identity-sessions, identity-least-privilege | Role matrix; positive and negative session tests | Foundations session case |
| Normalize timestamps and preserve originals | evidence-logs, evidence-integrity | UTC examples, handling record, analyst desk | Foundations evidence case |
| Separate evidence from inference; proportionate containment | evidence-triage, desktop-topic-27, desktop-topic-28 | Competing hypotheses and incident handover | SOC process/network case and integration report |
| Correlate host, session and identity without trusting shared NAT | desktop-topic-6, desktop-topic-61, desktop-v5-desktop-7-1 | Negative correlation tests and analyst desk | SOC time/session correlation case |
| Evaluate detection without counting unresolved cases as benign | desktop-topic-67 | Adjudicated/unresolved table; narrow exception tests | SOC detection-quality case |
| Engineer log pipelines and bounded hunts | optional course 17 | Parser/replay plans and hypothesis scope | Extension; no new certification prerequisite |

The final exams remain privately graded scenario multiple-choice assessments. They do not independently demonstrate sustained practical skill or supervised performance. More difficult questions alone do not justify a paid quality claim.

## Pilot protocol — proposed, not yet performed

The owner chose to try the journey personally first. The account-gated [learning trial](https://academy.biuret.dev/pilot.html) now provides eight bilingual tasks, self-reported outcomes, account-scoped browser persistence and voluntary JSON export. See [Arabic trial and independent review instructions](pilot-review-checklist.md) and the initially empty [issue tracker](pilot-issues.csv). Synthetic browser QA is not a participant result. The private SOC guide revision was approved and activated on Appwrite on 5 October 2026; see the [deployment record](deployments/2026-10-05-soc.md).

Recruit 3–5 consenting beginners and at least one practitioner for editorial review. Recruitment and messages have not been sent. Ask participants to use their own accounts; do not collect passwords, tokens or payment data.

1. Sign in and locate free Foundations without assistance. Record confusion about account names or prerequisites.
2. Find the next lesson; describe the worked example in their own words.
3. Open the HTTP or sign-in lab and complete the analyst desk. Observe whether filters, selection, evidence limits and feedback are understood.
4. Save reasoning, switch Arabic/English, reload and confirm the browser-local work survives.
5. Locate the practical assessment, exam rules and credential status. Follow real prerequisites; never bypass them for a pilot learner.
6. Participants may export clarity/friction feedback and share it voluntarily. A reviewer assesses written reasoning against the rubric rather than treating the local 4/4 score as mastery.

Suggested acceptance criteria: each participant finds the next step unaided; all critical access/RTL/navigation blockers are fixed; a reviewer can trace each assessed skill to required teaching and an independent exercise; unresolved cases remain explicitly uncertain. These are proposed gates, not observed metrics.

After the pilot: prioritize issues by task failure and confusion, revise Foundations/SOC, then apply the same structure to remaining specialties. Before paid sales, obtain independent subject-matter review and add stronger practical assessment where warranted.

## References used for curriculum checking

- [MDN URL structure](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL)
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

References support teaching concepts; they do not endorse or accredit Biuret credentials.
