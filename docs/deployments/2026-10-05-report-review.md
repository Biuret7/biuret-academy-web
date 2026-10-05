# Practical report review — 5 October 2026

## Approved and activated; public publication in progress

Owner explicitly approved creating the private table, connecting the function, uploading the archive and publishing the website. Optional private report submission, existing administrator queue/review, requested changes and immutable resubmission history are included.

- Appwrite active deployment: `6ac403d658c4f37bf831`, status Active, build 1s.
- Private table `academy_report_reviews` created in database `6aa56477002e28054068`; all six required columns and both indexes are Available. Verified index orders match the schema.
- Security UI confirms no table roles and row level security enabled.
- Created `ACADEMY_REPORTS_TABLE_ID=academy_report_reviews` in Academy Progress. Existing administrator and billing variables/scopes were not edited.
- Public implementation commit: `0e90cfb8935aba70127268343c7a6cd0facdc3b5`, pushed to main.
- Pages run: `37367969023`, queued waiting for a hosted runner. GitHub Status reports an active Actions incident on 5 October: delayed runner assignment across configurations (updates 19:15 and 19:50 UTC). Public publication and live review UI verification remain pending; do not describe the interface as published yet.

## Exact private archive

- Path: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-report-review-20261005.tar.gz`.
- Bytes: 534,583; 24 entries (package, fourteen server modules, nine private banks).
- SHA-256: `731bc46cc5dfa0c293a52d9424dae845ad17cc839585cfe925aaf5a7bb7a51ac`.
- All nine private banks are byte-identical to the active transfer-forms archive.
- Manifest: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-report-review-20261005.manifest.json`.
- Current rollback deployment: `6ac3fb646460cb16c3c4`.

The private archive is active; matching public assets use `20261005-reviews1`. Report acceptance is separate from exam/certificate eligibility. Purchases remain closed.

## Verification

- 112 local tests pass, none skipped; syntax and Foundations checksum `cfc19ea9fa0c` pass.
- Synthetic browser workflow: first submission → requested changes → second submission → accepted; both immutable copies and feedback remain.
- Reviewer scores/feedback survive language switching; Arabic/English labels and correct layout direction were inspected. No horizontal overflow in the inspected desktop viewport.
- Fixed a pre-existing language-event ordering bug: sidebar search/read-control labels update after the language toggle, rather than retaining the previous language.
- Preview: `C:/Users/Extreme/Desktop/Projects/tmp/academy-report-review-preview-20261005.png`.
- Temporary browser fixture outside repository uses memory-only synthetic accounts. It is not part of the deployment. No real learner report, graded attempt or certificate was submitted.

## Deployment checks and outstanding verification

- Console verified new function deployment Active, all columns/indexes Available, RLS enabled and no table roles.
- `ACADEMY_REPORTS_TABLE_ID` appears in the function variable list; the upload used the exact approved archive hash above.
- Public GitHub commit is pushed, and Pages run exists. Its job says it is waiting for a hosted runner to come online; the current public site still serves the previous release.
- Account initially opened on the public admin page was a learner and correctly received Restricted access. The owner switched to the configured administrator; its existing credential lookup then loaded successfully. No account permissions were changed.
- Screenshots: `C:/Users/Extreme/Desktop/Projects/tmp/academy-report-review-table-security-20261005.png` and `C:/Users/Extreme/Desktop/Projects/tmp/academy-report-review-deployment-active-20261005.png`.
- External incident: [GitHub Status](https://www.githubstatus.com/).

After the queued Pages run succeeds, reload the public admin and practical SOC tabs, verify the live empty queue and learner consent/status UI without submitting a real report or self-reviewing an administrator report. Inspect Arabic/English direction and overflow, save the live preview, then record the successful run and final QA here. Keep purchases closed and private banks outside GitHub.
