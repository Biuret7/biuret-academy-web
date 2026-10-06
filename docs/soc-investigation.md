# SOC investigation workspace

The SOC path now includes a synthetic export investigation alongside its existing labs and operations room. The workspace is available from the path, Labs, and SOC practical assessment. It does not replace the course explanations, checkpoints or final examination.

## Learner sequence

1. Read the brief and objectives. Inspect six downloadable JSON evidence copies, their SHA-256 manifest, and optional derived CSV views.
2. Correlate 33 records across identity, application, network, endpoint, approvals and collection sources. Search and source/session filters preserve the underlying records. The table displays corrected UTC and exposes the original timestamp; endpoint clock metadata is retained in each file.
3. Select supporting and limiting evidence, reconstruct a timeline, calculate outbound volume against a baseline, and justify a narrowly scoped response and uncertainty. Server checks give formative feedback only.
4. Write evidence, reasoning, limits and retest fields. The existing private SOC report review workflow stores a copy only after explicit consent and the existing lesson/course prerequisites. Previous submissions are not overwritten.

Draft analysis is local to the verified account, case and version. Switching languages or reloading preserves it; changing case edition resets incompatible analysis. Report drafts and revisions reuse the existing SOC path history.

## Access and private data

- JWT account verification precedes every case read and check. Client-supplied identity, plan or admin fields do not grant access.
- The SOC course bundle requires Foundations and its current server-approved course access. Free remains restricted; configured admins retain access. Future path purchases are still disabled.
- The synthetic evidence, bilingual brief and method references are returned only to eligible accounts. Private grading keys are held in `soc-investigation-bank.private.json`, excluded from Git and the public Pages staging list.
- Checks are read-only: no XP, coins, lesson awards, practical passes, exam attempts or credentials are created. A 5/5 practice check does not grant a certificate or replace a reviewed report.
- SHA-256 checks compare the JSON bytes with this bundle. CSV is derived. Neither proves a real incident's authenticity; collection gaps and absent payloads limit conclusions.
- This is a bounded synthetic analysis exercise, not a running SIEM, real containment action or proof of independent tool operation. Its review is not professional accreditation.

## Verification

Eight new tests cover original/corrected time, combined filters, CSV escaping, SHA-256 mismatch detection, draft edition boundaries, catalog/server access consistency, private answer omission, independent arithmetic, bad conclusions, input validation and authenticated HTTP denial without writes.

Browser verification uses synthetic accounts and memory-only report storage. Arabic RTL, English LTR, language/reload persistence, source/session filtering, 4/5 and 5/5 formative feedback, pre-consent rejection and pending report submission were inspected. Anonymous and Free views remain locked. At 390px the evidence table scrolls internally without page overflow.

The download click and pre-download integrity status were verified. The in-app browser did not return a worksheet download event, so retrieval of the actual downloaded file was not verified through that interface; canonical bytes and digest mismatch behavior are covered by the automated tests.
