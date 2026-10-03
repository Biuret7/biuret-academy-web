# Biuret Academy: platform implementation plan

## Published learning content

- The Foundations path has a visual roadmap with honest published and planned states.
- Three Foundations courses — **Understand URLs before you trust them**, **Identity and access**, and **Evidence and response** — contain nine Arabic/English lessons, quick checks, and links to practical challenges.
- Signed-in lesson completion is sequential and idempotent, with verified awards in the existing Biuret Appwrite project. Earlier preference history and challenge progress remain intact.
- Lesson completion is a learning aid. It awards XP to every signed-in learner and non-transferable Biuret Coins only to active Plus or Pro members. It does **not** issue credentials or paid access by itself.

## Learning contract

`path -> course -> lesson -> formative check -> practical challenge -> summative exam -> certificate`

- A lesson can be revisited. A correct formative answer marks it complete once.
- A course can show learning progress as lessons completed plus its challenge result. This is not a formal assessment.
- The Foundations final exam uses a private question bank and grades on the server. It requires all nine verified lesson awards, 8/10 to pass, at most three attempts per version, and a 24-hour pause after an unsuccessful attempt.
- An achievement credential is issued only after the server verifies all requirements. It has an opaque ID, issue date, issuer, achievement criteria, and revocation status. The learner chooses whether to share or withdraw the public URL. The displayed name is an account display name, not a verified legal identity.

## Milestone 2: server-owned progress and rewards

The live slice uses `Academy lesson awards` in the existing Biuret Appwrite database and a dedicated `academy-progress` function. Each learner and lesson has one deterministic award row. The function verifies the current account JWT, grades the lesson check, enforces order within each course, and writes the award once. The table has no direct client permissions. A completed lesson grants 100 verified XP; Plus and Pro also earn 10 non-transferable Biuret Coins. The level is derived from cumulative verified lesson XP; the coin balance is derived from private ledger events. Challenge XP remains clearly marked as practice XP and does not affect verified levels or coins. Existing preference-based lesson history is retained as unverified practice; learners retake the quick check to earn the server award.

Deployment: upload `functions/academy-progress` as a `.tar.gz` archive to Node 22 Appwrite Function `6ab8ae03001025f97f37`, entrypoint `src/main.js`, execute permission `users`, and scoped function key permissions `rows.read` and `rows.write` only. Include all five private question/task banks and both private bilingual desktop libraries in the archive; keep them out of GitHub Pages. The existing licensing function and its tables are unrelated.

The program now offers nine specialty paths. Application security and DevSecOps, mobile security, threat intelligence and OSINT, and malware analysis and reverse engineering use published Pro courses. Each requires all mapped lessons, each course exam, three server-graded practical decisions, and a distinct ten-question path exam (8/10 to pass). Passing issues a Biuret Academy credential with an ID, course and lesson counts, score, issuer and optional owner-enabled public status check. This proves in-platform completion, not third-party accreditation. Public roadmap metadata for the four added paths lives in `functions/academy-progress/src/additional-paths.js`; their exam and practical answers remain in ignored private banks.

Keep the existing Appwrite project and Biuret account. Add tables with row permissions and server functions for state-changing operations. Proposed records:

| Record | Core fields | Writer |
| --- | --- | --- |
| `paths` | id, slug, locales, status, version | admin |
| `courses` | id, pathId, order, prerequisites, locales, status | admin |
| `lessons` | id, courseId, order, contentVersion, locales, status | admin |
| `challenge_attempts` | id, userId, challengeId, answer digest, score, submittedAt | grading function |
| `lesson_completions` | userId, lessonId, contentVersion, completedAt | completion function |
| `exam_attempts` | id, userId, examVersion, status, score, submittedAt | exam function |
| `credentials` | opaqueId, userId, pathId, version, issuedAt, revokedAt | issuance function |

Read access is scoped to each learner, except published course content. No client is allowed to update scores, certificates, or credits. Migrate existing preference progress as **unverified legacy learning history**, preserving it visually but excluding it from credential eligibility. Do not silently turn past client-side completions into verified evidence.

## Milestone 3: one complete path

The Identity and Access and Evidence and Response courses are published with bilingual text lessons, examples, checks, and practice challenge links. Text is the primary medium, so no video transcript is needed. The public formative answers are suitable for learning rewards only. The final exam and achievement credential now use the private server path. Remaining gates before marketing this as a formal certification: editorial review with a subject-matter expert and a small-cohort pilot to inspect completion, errors, and question quality.

## Milestone 4: credentials and administration

The server-issued Foundations achievement credential has opt-in public verification and an active/revoked state. Owners can withdraw public access at any time. An administrator allowlist in the Appwrite function controls targeted credential lookup and permanent revocation; a private audit row records the actor, reason, and time before the credential state changes. The reason is never placed in the public credential payload. The admin interface is at `/admin.html` and has no public navigation link; access is enforced by the function, not by page visibility. Appwrite table `Academy credential audit` is `6ab93e390011ce106893`, with no client permissions. Its `payload` column is not encrypted at rest because the Free plan rejects encrypted columns; access is restricted by table permissions.

Published Foundations lessons now have a versioned content release workflow in `scripts/content-release.mjs`. `content/active.json` points to a saved release and its checksum. Authors start a JSON draft, edit bilingual copy, record a separate reviewer, and publish a new immutable release. Publication regenerates `learning-content.js` from reviewed JSON. Rollback switches the active pointer to an earlier saved release and regenerates the module without deleting history. CI checks the checksum and generated module before publishing. The validator blocks changes to published lesson IDs, order, and formative answers because those are also enforced by the Appwrite function. GitHub PR approval by a separate editor remains the editorial gate; the reviewer name in metadata is an audit hint, not a substitute for a code-host approval rule. Consider Open Badges 3.0 export after the core flow is reliable.

Example content commands (use a reviewer different from the draft author):

```text
node scripts/content-release.mjs start url-copy-refresh Author
# Edit content/drafts/url-copy-refresh.json and submit for editorial review.
node scripts/content-release.mjs review url-copy-refresh Reviewer
node scripts/content-release.mjs publish url-copy-refresh foundations-2026-10-copy
node scripts/content-release.mjs verify
node scripts/content-release.mjs rollback foundations-2026-09-27
```

The private question bank is `functions/academy-progress/exam-bank.private.json`, ignored by Git and included only in the function deployment archive. A deployer can alternatively set `ACADEMY_EXAM_BANK` in Appwrite. Never add answers to the GitHub Pages bundle. Rebuild the function archive with `package.json`, `src/main.js`, `src/exam.js`, `src/admin.js`, and the private bank before each manual deployment. Set `ACADEMY_ADMIN_USER_IDS` to a comma-separated list of exact Appwrite user IDs; an empty value denies all admin actions. Appwrite tables: exam attempts `6ab933b6001be5900662` (private), credentials `6ab93416002801b57b3f` (row security on; no table permissions). Private credential rows start with no client permissions, and only the owner may grant or remove public read through the function.

Program practice quizzes now use `functions/academy-progress/practice-quiz-bank.private.json`, a separate ignored bank included in the same function archive. The original program quiz bank remains the graded course exam source. The function checks that all 12 bilingual practice sets are valid and do not repeat any course exam question. Practice attempts support review and local mistake cards; they do not award credentials or verified XP. Deploy the updated function and its private bank before publishing the revised Quizzes page.

## Milestone 5: subscription and internal credits

The Academy membership foundation is a separate private Appwrite table, `Academy memberships` (`6ab9848d000d14a9332f`), with a required `payload` column and no client permissions. The authenticated `membershipState` function action reads only the current account's deterministic row and grants Plus or Pro access only for an active Paddle membership with a future period end. Legacy active records without a `plan` field remain Pro. Missing, expired, paused, past-due, canceled, malformed, or cross-account records never grant paid access. The current Foundations path, exam, and achievement credential remain free. `/membership.html` shows bilingual Free, Plus, and Pro cards, current account state, and **planned** prices of $5 USD monthly for Plus and $10 USD monthly for Pro. It has no checkout or recurring charge. Additional paid features shown on the cards are planned, not published yet. Future paid content endpoints must enforce the server-side access result; a browser badge is informational only.

The first slice is a private Appwrite table, `Academy coin ledger` (`6ab94864000f11a04188`), with a required `payload` text column and no client permissions. Every verified lesson grants 100 XP. New Free awards store zero coins, while active Plus or Pro awards store 10 coins and create one deterministic `lesson-earned` event. Free state requests read existing events but never mint missing events, preserving previously earned balances. Free awards stay ineligible after an upgrade. Duplicate requests cannot create duplicate credit. The function derives the displayed balance from these events and returns the transaction history to that learner. XP remains a separate learning measure. Spending, transfers, withdrawals, and cash conversion are not enabled. The table's payload is not encrypted at rest on the current Free plan; table permissions prevent direct client access.

The business is currently in Palestine and intends to display prices in USD. As of 2026-09-27, [Stripe's supported business countries](https://stripe.com/global) do not include Palestine. [Paddle's supplier-country page](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle) does not list Palestine among its unsupported countries, but onboarding and payout eligibility still require confirmation with Paddle. The broader Biuret project has a Paddle integration for BiuLock; Academy subscriptions should be isolated from that product's entitlements. No Academy payment or recurring charge is active yet.

Before enabling subscriptions, confirm provider onboarding and payout route, taxes, refund policy, and recurring billing terms. Then verify signed provider events, deduplicate event IDs, and drive entitlements from server subscription state. Never grant access solely from a checkout return URL.

Keep `XP` (learning display) separate from `credits` (internal utility). Future debit events need an atomic balance guard to prevent concurrent overspending; until then, the ledger accepts earning events only. Potential uses are hints or cosmetic features, never exam passes or certificates. The user chose to defer spending until a later stage.

## Release gates

1. Content and localization review, including Arabic/English parity.
2. Keyboard/mobile/accessibility checks and reduced-motion behavior.
3. Permission tests for cross-account reads/writes and direct API calls, including the coin ledger.
4. Migration test for an existing Biuret learner account.
5. Backups, monitoring, and rollback for database and content releases.
