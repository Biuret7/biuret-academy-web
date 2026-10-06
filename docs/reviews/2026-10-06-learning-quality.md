# Learning quality update — 6 October 2026

Status: owner-approved function and public UI are published; human trial and specialist validation remain pending. See [the deployment record](../deployments/2026-10-06-learning-quality.md).
Asset revision: `20261006-quality1`.

## Four workstreams

| Workstream | Implemented | Verification and limits |
| --- | --- | --- |
| Assessment decisions | Reauthored 10 Foundations, 94 course and 90 specialty questions; revised 48 transfer cases and 30 practical tasks. Choices require interpreting evidence, selecting a bounded action or checking its outcome. Course questions have private lesson/topic references. | Same IDs/history keys retained. Course/path forms remain identical across language switches. Foundations now rejects an absent/stale content fingerprint without recording an attempt. Editorial improvement is not psychometric calibration. |
| Teaching and language | Expanded six GRC lesson explanations with worked examples, measurement boundaries, steps and deliverables. Corrected mistranslated English concepts and applied bridges. Added consistent bilingual terminology to all 105 course lessons. | Full explanations remain, supplemented by their existing checkpoints. This is targeted language editing; it does not claim independent expert validation of every sentence or replacement of all 105 lesson bodies. |
| Practice and decisions | All eight evidence labs and 13 challenges have specific goals, deliverables, criteria, choices and feedback. Fixed mismatched challenge names/stems. Six operations rooms have distinct decisions and consequences. | Follow-up is enabled after a first decision. Both outcomes remain visible on reload/language change; changing the first decision resets its follow-up. Consequences are educational simulations, not observations from real systems. These evidence exercises do not run a VM or live security tools. |
| Complete learner journey | Added a memory-only journey test through actual private banks: all 105 course checkpoints, 19 course exams, 10 practical assessments, failed/final exams and private credentials for all ten paths. Extended the owner trial to nine tasks including credential inspection, with optional minutes and confidence. | Synthetic entitlement and records only; no production results or billing changed. Human usability observations are separate from assessment evidence. Owner testing and independent specialist review remain to be collected. |

Forty practice-quiz questions use their own stems/evidence and remain distinct from completion exams. Together the assessment/training banks above contain 312 revised questions/tasks; the 21 lab/challenge checks were also revised. No answer keys enter GitHub or Pages.

## Verification

- 128 automated tests passed locally, with no skips.
- Syntax checks from `package.json` passed using Node directly; npm is unavailable in this shell.
- Active public Foundations lesson release verified unchanged: `foundations-2026-10-05` / `cfc19ea9fa0c`.
- Inventory: 37 pages, 10 paths, 19 courses, 105 program lessons, 13 practice-quiz sets, eight evidence labs, 13 challenges and six operations rooms.
- Structural audit: zero errors and zero currently flagged editorial heuristics. This covers locale structure, encoding, references, explanation-length and repeated answer-length cues. It is not a claim of guaranteed difficulty or information accuracy.
- Browser checks used a local SDK stand-in with real public library serialization and real practice grading. Arabic/English switching, saved operations choices/notes, first-decision changes, mobile width 390, pilot duration/confidence restoration, lab feedback and guest access gate were inspected. No horizontal overflow observed in these views.

Quiz practice history/review cards are refreshed for the changed quiz edition; learner notes, verified progress, earned results and existing credentials are retained. Existing operations selections from older decision editions are cleared, while their notes remain.

## Reference basis

Authentication and authorization terminology follows [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) and the [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). The distinction between hash consistency, identity, session state and access decisions is preserved in the examples.

GRC scope, control evidence and supplier examples were checked against [NIST CSF 2.0](https://csrc.nist.gov/pubs/cswp/29/the-nist-cybersecurity-framework-csf-20/final), [NIST SP 800-37 Rev. 2](https://csrc.nist.gov/pubs/sp/800/37/r2/final) and the [CSF supply-chain quick-start guide](https://www.nist.gov/publications/nist-cybersecurity-framework-20-quick-start-guide-cybersecurity-supply-chain-risk). A framework mapping is educational context, not a legal-compliance or accreditation claim.

Recovery examples distinguish service-restoration and time-based data-loss objectives using [NIST SP 800-34 Rev. 1](https://csrc.nist.gov/pubs/sp/800/34/r1/final). Incident decisions use scoped evidence, coordination and verification consistent with [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final). Numeric evidence and exercises are authored synthetic cases.

## Deployment order and next evidence

Deploy the private function archive first, then the public UI. Refresh previously open examination tabs after deployment. Roll back function/UI together if necessary; retain existing historical records.

Purchases remain closed. After publishing, run the owner trial with Foundations and SOC, inspect time/confidence/blockers, and obtain a specialist review. Use those observations and later suitably aggregated attempt data to calibrate weak distractors, unclear teaching and practical difficulty before paid launch.
