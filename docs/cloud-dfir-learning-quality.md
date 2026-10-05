# Cloud Security and DFIR learning iteration — 5 October 2026

## Scope and status

Fifteen bilingual private guides in Digital Forensics (7), Malware Analysis (12) and Cloud Security (13) are published on Appwrite. This adds concrete evidence, interpretation, independent work and topic-specific checkpoint feedback. Public practice desks and the dedicated Cloud path link are published and verified. The owner approved the private upload; deployment `6ac3b1995d77e171f461` is active. Final exam banks, thresholds, previous awards and credentials are preserved; purchases stay closed. See the [release record](deployments/2026-10-05-cloud-dfir.md).

Digital Forensics is shared with SOC, and Malware Analysis with the Malware path. These are shared courses rather than duplicated curricula. The Windows lesson retains labeled/unresolved detection review so the earlier SOC outcome remains taught. Existing operations rooms remain mapped: DFIR uses suspicious-document and recovery scenarios; Cloud uses identity and delivery-chain scenarios.

| Course | Lessons | Independent work and assessed concepts |
| --- | ---: | --- |
| Digital forensics | 5 | Copy integrity versus source truth; recorded custody; PID reuse/live collection; incident handover and recovery checks; Windows audit coverage/session boundaries; UTC conversion and overlapping uncertainty |
| Malware analysis | 5 | Static observations versus behavior; isolated experiment conditions; tested recovery and exposed credentials; startup configuration versus observed execution; labeled versus unresolved rule matches |
| Cloud security | 5 | Service-specific responsibility; bounded effective-policy evaluation; distinct S3 public-access controls; Pod/host/identity boundaries; IaC intent versus runtime drift |

Guides estimate 25 minutes including practice. These are authored educational exercises, not a practitioner endorsement, provisioned VM curriculum or evidence of independent learner performance.

## Two interactive practice desks

### Cloud policy desk

The Cloud path links `practice-lab.html?id=7&context=cloud`, with a dedicated title and task. It uses the existing lab-7 access guard. The normal lab-7 SOC experience remains available from its usual link. This local simulator is deliberately restricted to a same-account identity grant, a permissions boundary and an explicit denial. It omits resource grants, session/organization policies, ACLs and cross-account complexities; it is not a full AWS policy emulator.

Learners predict four read/write requests under a drifted configuration and a repaired one. Identity grants cover reads. The repaired boundary allows only logs read, with explicit payroll denial. Required logs read survives while excess payroll read is rejected. A boundary alone never grants a write. Before/after sample records remain distinct, and optional exports recompute model outcomes.

### Evidence desk

The DFIR path's existing lab 6 includes browser-local Web Crypto SHA-256 comparisons on a synthetic original and three copies: documented, changed and custody-gap. A matching digest does not fill a missing handoff or prove source truth. No learner files are read, uploaded or executed.

The timeline task preserves source timestamps, normalizes +03:00 to UTC and exposes ±2-second uncertainty. E1/E2 intervals overlap, so timing alone cannot establish their order. E3 is later but has a different session; timing does not prove causation.

Both desks are account-scoped and browser-local, bilingual and direction-aware. They award no XP or credentials and do not bypass server assessments. Written reasoning is not automatically graded. Voluntary JSON export excludes automatic account ID, name and email; learner-entered free text is capped and should omit personal data.

## Owner review

1. From the Cloud path open the dedicated policy desk. Predict payroll read before/after repair; preserve logs read and reject writes. Explain which policy term determines each result.
2. From DFIR open evidence copies. Compare all three copies, explaining the difference between integrity, custody and source truth.
3. Review E1/E2 uncertainty and reject unsupported E3 session correlation.
4. Write a bounded report with an observation, unknown, action, allowed control and negative verification. Reload and switch languages; verify notes and sample records survive.
5. Trace the decisions to required lessons and the existing private final/integration assessment. No trial completion or certificate is inferred from the local tools.

Next cohort: Mobile, Threat Intelligence/OSINT and GRC, then remaining programming/reverse-engineering material and a full assessment-alignment review before sales.
