# Mobile, intelligence and GRC learning iteration — 5 October 2026

## Scope

Twelve bilingual guides were developed: five Mobile Security lessons, five OSINT/source-intelligence lessons, and two shared risk/compliance lessons in Cybersecurity Fundamentals. IDs, 99-guide total, awards, course/path final banks and passing thresholds are preserved. The GRC work improves its existing shared foundational material; it does not create a new standalone GRC course. Private revision: `mobile-intel-grc-learning-20261005`, with the existing `learning-quality-20261004` runtime contract.

Each guide adds concrete synthetic evidence, topic-specific analysis, independent written work, objectives, rubric, original references and formative feedback. Correct answers and feedback keys stay on Appwrite. More development and independent practitioner/learner review are needed before paid-course activation. Purchases remain closed.

| Course | Updated lessons | Decisions practiced |
| --- | ---: | --- |
| Mobile Security (14) | 5 | Exported components versus server authorization; owner/non-owner/signed-out tests; scan coverage versus manual evidence; stale device posture; Keystore boundaries, plaintext logs and retention |
| OSINT and source intelligence (15) | 5 | Decision-scoped collection; duplicate lineage and undefined scores; historic DNS versus current ownership; remediation versus public removal; TLP sharing; corroboration and conflicts without actor attribution |
| Cybersecurity Fundamentals (1) | 2 | Risk ownership and residual-risk evidence; ordinal rankings; design versus deployment/effectiveness; current/target control evidence and scoped claims |

## Path-integrated practice desks

- Mobile: `practice-lab.html?id=2&context=mobile`. An authenticated API model exposes another owner's synthetic record before repair; after repair only the owner succeeds. Signed-out requests never return records. HTTP state and returned-data state are separate outputs. This is not an Android emulator or whole-app assessment.
- Threat intelligence: `practice-lab.html?id=6&context=intel`. Three source sets distinguish repeated origin, two independent supporting origins and conflicting origins. The given claim/time/scope match and origin independence are explicit training premises. No named actor is inferred, and no live collection occurs.
- GRC: `practice-lab.html?id=7&context=grc`. Written design alone, current tested evidence and stale evidence/expired acceptance yield different review decisions. Seven-day freshness is a declared scenario policy, not a universal standard. Review-ready applies to one control and is not certification or organization-wide security.

Each desk requires a prediction, presents feedback with limitations, saves account-scoped browser work and optionally exports a report with recomputed results. Export adds no automatic account identifiers; learners are told to omit personal details from notes. Written reports are not automatically graded and earn neither XP nor credentials.

Dedicated lab links appear in their path bundles and related course pages. They reuse existing lab access indices; account, name, membership and prerequisites run before mounting. Standard lab-2 authorization, lab-6 DFIR and lab-7 SOC/Cloud routes continue to work. Existing operations-room mappings remain linked in each path.

## Verification

All 84 local tests pass, including six new checks for cross-owner repair, source lineage/conflicts, GRC evidence/expiry, export privacy/recomputation, route index preservation and private guide/answer boundaries. Syntax checks and the Foundations release checksum pass.

Local browser QA confirmed Arabic/English controls, `rtl`/`ltr`, no horizontal overflow at the default viewport, 200-before/403-after non-owner behavior, retained notes and distinct before/after observations after reload. Wrong independent-corroboration predictions receive corrective feedback; contradictory sources remain unresolved. Current tested GRC evidence is review-ready; stale proof and expired acceptance leave a gap. This QA did not submit a graded course answer or issue a credential. Synthetic observations are implementation checks, not independent participant results.

## Release status

Public practice desks and path/course links are published. The owner approved the private archive upload, and Appwrite deployment `6ac3b9312602b32c3fcd` is active. Live checks confirmed the revised Mobile, source-intelligence and control-evidence guides. See the [deployment record](deployments/2026-10-05-specialist.md).

Next cohort: reverse engineering and remaining shared course material, followed by a complete mapping of teaching outcomes to practice, final assessment and credential requirements. Paid readiness also requires learner and practitioner review.
