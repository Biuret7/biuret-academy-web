# SOC investigation — 6 October 2026

## Approved publication — 6 October 2026

- Adds a dedicated four-step SOC case workspace with six evidence files, 33 records, timeline correction, volume analysis, feedback and the existing consent-based report review integration.
- Links it from the SOC path, Labs and practical assessment. Arabic and English, mobile table scrolling, focus states, hover and reduced motion are supported.
- Preserves the published full lesson explanations and checkpoints. All existing private banks are unchanged; Foundations remains `foundations-2026-10-05` (`cfc19ea9fa0c`).
- Shared public module cache identity: `20261006-soccase1`.
- 122 tests pass, none skipped in the private deployment verification. Syntax and content verification pass.
- No new table or permissions are needed. Purchases stay disabled, and practice checks do not change certificate eligibility.

## Exact function artifact

- Path: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-soc-investigation-20261006.tar.gz`
- Size: 540,550 bytes; 26 entries (package, fifteen server modules, ten private banks).
- SHA-256: `51a802ea27f82bbc350bd329dcf3eab4f98b5aa6a6c18976fd9fde06e60cb431`
- Manifest: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-soc-investigation-20261006.manifest.json`.
- Assembled from the active full-lessons artifact, replacing `src/main.js` and adding the SOC module and private case. The nine existing private banks remain byte-identical.
- Rollback: full-lessons Appwrite deployment `6ac4ab44c3120ed25ebc` and public implementation `0e3afb3150c0cd3b38d808b6314c5b747a4a2dd8`.

## Browser evidence

- Preview: `C:/Users/Extreme/Desktop/Projects/tmp/academy-soc-investigation-preview-20261006.png`.
- Synthetic report reached pending status only after consent; no real learner report was submitted.
- Arabic/English selected evidence and numeric fields persist across language changes and reload.
- Anonymous sees sign-in gate; Free sees access requirements without case evidence.
- JSON pre-download SHA-256 confirmation inspected. In-app download event retrieval was unavailable; see method document for that QA limit.

## Publication order

1. Obtain approval for this function archive upload to Biuret Appwrite and the matching site publication.
2. Upload to Academy Progress and verify its deployment becomes Active.
3. Push the public commit to GitHub and verify Pages succeeds. The private case is never staged for Pages or GitHub.
4. Inspect the live eligible account, case links, bilingual evidence and report drafting. Do not submit a real report or exam during QA.

## Publication record

- Owner requested continuation after the explicit upload/publication request.
- Exact archive uploaded through Appwrite Console; deployment `6ac4b9d3137e3aeb8bdf` verified Active, build 1s, size 1.19 MB.
- Public implementation `3dbf30b6b718132141c8fe1be1f31bc3ce3acd36` pushed to main.
- Pages run `37440601045` verified Success in 50s; its public artifact is 817 KB.
- Live URL: `https://academy.biuret.dev/soc-investigation.html`. The authenticated eligible account loaded the six evidence files and 33 records from the active function.
- The SOC path displays the case as its first learning lab; the Labs page displays a visible case workspace link after account loading.
- Arabic and English case content and report fields verified. Arabic uses RTL with the sidebar on the right; document width equals scroll width (no horizontal page overflow).
- First JSON file's pre-download integrity confirmation verified on the live site. Download retrieval remains subject to the in-app browser limitation documented above.
- Existing report review form displays no submitted report; no real report, exam, lesson completion or award was submitted during live QA.
- Live screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/academy-soc-investigation-live-20261006.png`.
- Active function screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/academy-soc-function-active-20261006.png`.
