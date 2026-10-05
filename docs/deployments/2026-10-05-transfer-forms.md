# Assessment transfer forms — 5 October 2026

## Deployed and verified

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

Owner explicitly approved the exact archive and public publication. Appwrite deployment `6ac3fb646460cb16c3c4` is Active (1.17 MB, 1-second build), replacing `6ac3db6e9f0419bab9b2`. Public commit `96bb9c7cf2258d3a734006e243865a146212593d` was pushed; Pages run `37364154258` completed successfully (5m 28s overall, 19s job). Screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/academy-transfer-active-20261005.png`. The public cache versions are synchronized so account state is shared by the updated modules. Old open exams need reload before submission; a missing/old form ID yields a conflict rather than an incorrectly graded attempt.

Purchases stay closed. Manual report review is a documented future workflow, not an active certification gate.

## Active-function smoke check

Course 17 returned six questions, including both new transfer cases. Read-only browser inspection confirmed identical question IDs/order across Arabic/English and byte-identical English question/option text after refresh. No graded submissions were made. Matching public client `20261005-forms1` is now deployed.

## Live public QA

- Course 19 opens with six questions; its script uses `20261005-forms1`.
- SOC practical report is present in both languages, preserves synthetic notes across language and refresh, remains outside the graded form and has no horizontal overflow in the inspected desktop viewport. Arabic sidebar x=1013; English sidebar is on the left.
- Actual live JSON download `C:/Users/Extreme/Downloads/biuret-practical-path_soc (1).json`: 461 bytes, Arabic, `not-reviewed`, no automatically included account identifiers or graded answers. Synthetic notes were cleared through the UI afterward.
- Live screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/academy-transfer-live-20261005.png`.
- No graded exam/practical submission or certificate issuance took place during QA.
