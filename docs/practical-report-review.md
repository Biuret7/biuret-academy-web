# Private practical report review

## Scope

Learners can explicitly send four report fields and their account name to existing configured Academy administrators. No email, avatar, exam answers, provider identity or client-supplied owner ID is stored. The local worksheet and download remain available. Server submission requires verified path lesson/course prerequisites and a real two/three-part account name; the draft may be prepared earlier.

States: not submitted → pending → changes requested → new pending revision → accepted. The learner sees every submitted copy and feedback; a copy is immutable after submission. Maximum twenty revisions per account/path prevents an unbounded history. Acceptance uses four 0–2 criteria, at least 6/8 and no zero; this is **report feedback only**, not a certificate gate or evidence of independent tool execution. Graded practical/exam and historical certificate rules are unchanged; purchases remain closed.

## Authorization and consistency

- Appwrite JWT resolves the account on the server; users cannot choose an owner or reviewer.
- Only existing `ACADEMY_ADMIN_USER_IDS` members can list, inspect or review reports. No new administrative account is added.
- Administrators cannot review their own report.
- Every submission and review is an append-only private row with empty permissions. No new browser permission to read/write this table is granted.
- Submission IDs are deterministic for account/path/revision. Base-revision checks and unique row IDs prevent concurrent writes from overwriting a copy. Identical retries are idempotent.
- A review has one unique ID for its submitted copy. Conflicting later decisions cannot replace it. Requests for changes allow a new submission with its own review; old reports and reviewer decisions remain.
- Queue reads ten entries with cursor pagination; history is bounded. Account/language changes do not carry unsent reviewer fields to another account. UI escapes report/feedback text.
- Without a configured table, learner draft/download stay available and remote submission stays unavailable.

## Deployment schema (applied 5 October 2026)

Database: `6aa56477002e28054068`. Table ID/name `academy_report_reviews` has **no table permissions**, row security enabled. All columns and indexes were verified Available in the console.

| Column | Type | Required | Constraint |
| --- | --- | --- | --- |
| userId | String | Yes | 36 characters |
| pathId | String | Yes | 40 characters |
| kind | String | Yes | 16 characters |
| revision | Integer | Yes | 1–20 |
| occurredAt | Datetime | Yes | server time |
| payload | String | Yes | 65535 characters |

Create indexes:

- `report_owner_history`: key, columns `userId`, `pathId`, `kind`, `revision`; last ordered DESC.
- `report_queue`: key, columns `kind`, `occurredAt`; last ordered DESC.

Set `ACADEMY_REPORTS_TABLE_ID=academy_report_reviews` in Academy Progress only after the table/columns/indexes are Available. Existing function scopes already support private table rows; do not widen execution permissions or change billing variables. Activate the private archive before publishing the matching client modules. Keep all private banks out of GitHub.

## Verification

112 local tests pass (none skipped), syntax and Foundations checksum `cfc19ea9fa0c` pass. Nine new tests exercise consent, prerequisites, ownership, configured administrators, self-review rejection, bounds, concurrent/duplicate writes, audit retention, revisions, score rules, cursor pages, anonymous requests and handler authorization.

Browser QA uses `http://localhost:8063` with synthetic accounts and memory-only records, not real Appwrite sessions. Verified first submission → requested changes → revision two → acceptance, saved reviewer inputs on Arabic/English switching, learner feedback/history and local drafts after refresh. No real exam, credential or report was submitted during this QA. The temporary fixture is outside GitHub and not deployed.

## Still needed before paid launch

Calibrate reviewers on example work, measure response time/workload, publish a retention policy and operational deletion/appeal process, and introduce controlled lab artifacts. Current reports are learner-authored text; review does not independently establish tool execution. No notification emails or file attachments are sent by this release.
