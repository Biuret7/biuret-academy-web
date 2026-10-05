# Transfer forms — 5 October 2026

## Prepared scope

48 new private bilingual cases: two for each of the sixteen remaining program courses and two for each of eight specialist paths. Existing Network/Cryptography/Applied GRC course cases and GRC final cases remain. Native Foundations is unchanged.

New cases involve constrained authorization, incomplete evidence, time normalization, source independence, legitimate/rejected tests, sample identity, ratios and signed comparisons. They are authored cases, not independently validated difficulty. Different facts and question text are used from formative quizzes and worked lesson examples. Questions, options, answers and rationales remain in the private function archive.

Course forms preserve **all original final questions**, adding their two new transfer items (normally seven questions; courses 17/18 have six). The 80% course policy remains; passed historical scores/totals remain stored. Path forms retain ten questions: both new items and eight selected old items. Original three case groups each retain at least one item. Different retry slots rotate the old-case subset and option order, while Arabic/English and refresh retain identical IDs and answer semantics for the same user/slot. GRC has no added pool, so its question set is retained with reordered presentation.

Forms are selected and graded on the server using account, assessment scope, slot, revision and bank fingerprint. The client must submit the exact current form ID. Missing/stale forms return a conflict rather than grading answers against a changed form. Form IDs, selected question IDs and versions are recorded with new completion records. These measures reduce option-position memorization; they are not proctoring or an anti-cheating guarantee. Alternate-form equivalence and item difficulty still require learner/practitioner evidence.

## UI and practical review

- Course 19's exam now passes the client route check (the old maximum was 18).
- Path instructions use the server's actual pass score, fixing the incorrect 8/10 copy for new 9/10 attempts.
- Question evidence keeps line breaks. A changed form clears in-memory choices; language changes within a form keep them.
- Local practical worksheets include evidence, reasoning, limits and positive/negative retest planning, with bounded notes and a JSON download.
- Worksheets do not transmit account identifiers, submit to an administrator, grade themselves or unlock a credential. Their optional notes remain unreviewed.
- A [draft reviewer rubric](practical-review-rubric.md) defines what a future manual review needs; manual workflow is not implemented in this release.

Purchases stay closed; no billing, account access or certificate-sharing settings change. Existing passing records and historical certificate facts are preserved.

## Sources and verification

Case guidance was checked against [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), [mobile sensitive logging](https://mas.owasp.org/MASWE/MASVS-STORAGE/MASWE-0005/) and [Microsoft nested groups](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-authsod/d3ca79c3-0386-42f8-979b-4376977dcd5e). Numeric data are synthetic Academy scenarios.

103 local tests pass with private banks present, none skipped; syntax and unchanged Foundations checksum pass. Tests cover pool coverage, prerequisites, cross-language semantics, form changes, server grading, stale submission rejection, historical counts and bounded report privacy. Browser and deployment evidence will be recorded in the release entry before claiming publication.
