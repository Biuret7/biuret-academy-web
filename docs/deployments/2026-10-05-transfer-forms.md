# Assessment transfer forms — 5 October 2026

## Prepared, not yet deployed

Revision `transfer-forms-20261005` adds 48 private cases for sixteen course finals/eight specialist paths, stable server-selected forms, stale-form rejection and optional local practical reports. Existing Foundation banks/lesson edition/libraries are byte-identical to the prior private archive. Existing passing records, score ratios, cooldowns, attempt limits, access rules and certificate-sharing settings remain.

103 local tests pass, none skipped; syntax and `foundations-2026-10-05` checksum `cfc19ea9fa0c` pass. Public syntax checks do not require private banks; private integration cases are skipped in GitHub where private files are intentionally absent.

## Exact archive

- `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-transfer-forms-20261005.tar.gz`.
- 532,920 bytes; 23 entries: package, thirteen server modules and nine private banks.
- SHA-256: `b1409f4fee0d0d156e1d60d45f9b3c0386853ec8da13b21b6990f97b10e492a5`.
- Manifest: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-transfer-forms-20261005.tar.manifest.json`.

## Local browser QA

- Course 19 opens with its six-question final rather than the prior route-limit error. Until private deployment, the preview receives the currently live bank, not the new server form protocol.
- Optional practical report shows four fields, remains outside the graded form and preserves text on Arabic/English switches and reload.
- RTL right sidebar/LTR left sidebar; no horizontal overflow in the inspected desktop viewport.
- Actual JSON download inspected at `C:/Users/Extreme/Downloads/biuret-practical-path_soc.json`: correct path, bounded synthetic notes, unreviewed status, no automatically included identity or answers.
- No graded answers, course/path attempts or credentials submitted during browser QA.
- Screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/academy-transfer-preview-20261005.png`.

## Publication gate

Owner approval for this new archive/public update is pending. Activate the private function first, then publish the matching public assets immediately. The public cache versions are synchronized so account state is shared by the updated modules. Old open exams need reload before submission; a missing/old form ID yields a conflict rather than an incorrectly graded attempt.

Record actual deployment and Pages run IDs after success and verify live course form stability without submitting a real graded attempt. Purchases stay closed. Manual report review is a documented future workflow, not an active certification gate.
