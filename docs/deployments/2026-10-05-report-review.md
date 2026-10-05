# Practical report review — 5 October 2026

## Prepared; awaiting deployment approval

Owner requested the next phase after the active transfer-forms release. Prepared optional private report submission, configured administrator queue/review, requested changes and immutable resubmission history. No live reports, table, variables or deployments have been changed yet.

## Exact private archive

- Path: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-report-review-20261005.tar.gz`.
- Bytes: 534,583; 24 entries (package, fourteen server modules, nine private banks).
- SHA-256: `731bc46cc5dfa0c293a52d9424dae845ad17cc839585cfe925aaf5a7bb7a51ac`.
- All nine private banks are byte-identical to the active transfer-forms archive.
- Manifest: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-report-review-20261005.manifest.json`.
- Current rollback deployment: `6ac3fb646460cb16c3c4`.

Create the private `academy_report_reviews` table/columns/indexes from [the schema](../practical-report-review.md), then set `ACADEMY_REPORTS_TABLE_ID`. Activate the new private function and immediately publish matching public assets `20261005-reviews1`. Existing administrator accounts/scopes/execution permissions and billing variables must remain unchanged. Report acceptance is separate from exam/certificate eligibility. Purchases remain closed.

## Verification

- 112 local tests pass, none skipped; syntax and Foundations checksum `cfc19ea9fa0c` pass.
- Synthetic browser workflow: first submission → requested changes → second submission → accepted; both immutable copies and feedback remain.
- Reviewer scores/feedback survive language switching; Arabic/English labels and correct layout direction were inspected. No horizontal overflow in the inspected desktop viewport.
- Fixed a pre-existing language-event ordering bug: sidebar search/read-control labels update after the language toggle, rather than retaining the previous language.
- Preview: `C:/Users/Extreme/Desktop/Projects/tmp/academy-report-review-preview-20261005.png`.
- Temporary browser fixture outside repository uses memory-only synthetic accounts. It is not part of the deployment. No real learner report, graded attempt or certificate was submitted.

Record actual Appwrite deployment, public commit and successful Pages run after approval. Verify the live empty queue and learner consent/status UI without submitting a real report or self-reviewing an administrator report.
