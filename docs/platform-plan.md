# Biuret Academy: platform implementation plan

## Published learning content

- The Foundations path has a visual roadmap with honest published and planned states.
- Three Foundations courses — **Understand URLs before you trust them**, **Identity and access**, and **Evidence and response** — contain nine Arabic/English lessons, quick checks, and links to practical challenges.
- Signed-in lesson completion is sequential and idempotent, with verified awards in the existing Biuret Appwrite project. Earlier preference history and challenge progress remain intact.
- Lesson completion is a learning aid. It awards non-transferable Biuret Coins but does **not** issue credentials, exam results, or paid access.

## Learning contract

`path -> course -> lesson -> formative check -> practical challenge -> summative exam -> certificate`

- A lesson can be revisited. A correct formative answer marks it complete once.
- A course can show learning progress as lessons completed plus its challenge result. This is not a formal assessment.
- A future final exam must use a private question bank and grade on the server. Passing criteria, attempt limit, cooldown, and version must be explicit before opening it.
- A certificate may be issued only after the server verifies all requirements. Its public verification page needs an opaque ID, issue date, issuer, achievement criteria, and revocation status. The learner chooses whether to share the public URL.

## Milestone 2: server-owned progress and rewards

The live slice uses `Academy lesson awards` in the existing Biuret Appwrite database and a dedicated `academy-progress` function. Each learner and lesson has one deterministic award row. The function verifies the current account JWT, grades the lesson check, enforces order within each course, and writes the award once. The table has no direct client permissions. A completed lesson grants 100 verified XP and 10 non-transferable Biuret Coins. The level is derived from cumulative verified lesson XP; the coin balance is derived from award rows. Challenge XP remains clearly marked as practice XP and does not affect verified levels or coins. Existing preference-based lesson history is retained as unverified practice; learners retake the quick check to earn the server award.

Deployment: upload `functions/academy-progress` as a `.tar.gz` archive to Node 22 Appwrite Function `6ab8ae03001025f97f37`, entrypoint `src/main.js`, execute permission `users`, and scoped function key permissions `rows.read` and `rows.write` only. The existing licensing function and its tables are unrelated.

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

The Identity and Access and Evidence and Response courses are published with bilingual text lessons, examples, checks, and practice challenge links. Text is the primary medium, so no video transcript is needed. The public formative answers are suitable for learning rewards only. Remaining gates: editorial review with a subject-matter expert; a private, server-graded end-of-path exam with attempt policy; and a small-cohort pilot to inspect completion, errors, and question quality before credentials are issued.

## Milestone 4: credentials and administration

Create a content admin workflow with draft, review, publish, version, and rollback. Add server-issued credentials with public verification and revocation. Consider Open Badges 3.0 export after the core certificate flow is reliable.

## Milestone 5: subscription and internal credits

Choose a payment provider after confirming business country, supported markets, taxes, refund policy, and recurring billing terms. Verify signed provider events, deduplicate event IDs, and drive entitlements from the server's subscription state. Never grant access solely from a checkout return URL.

Keep `XP` (learning display) separate from `credits` (internal utility). Credits require a server-owned append-only ledger, event ID, reason, and balance derived from transactions. Start with non-transferable, non-withdrawable credits for hints or cosmetic features. Credits cannot buy exam passes or certificates.

## Release gates

1. Content and localization review, including Arabic/English parity.
2. Keyboard/mobile/accessibility checks and reduced-motion behavior.
3. Permission tests for cross-account reads/writes and direct API calls.
4. Migration test for an existing Biuret learner account.
5. Backups, monitoring, and rollback for database and content releases.
