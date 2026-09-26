# Biuret Academy: platform implementation plan

## What is live in milestone 1

- The Foundations path has a visual roadmap with honest published and planned states.
- The first course, **Understand URLs before you trust them**, contains three Arabic/English lessons, quick checks, and a link to the existing practical challenge.
- Lesson completion is sequential, is idempotent, and syncs through the existing Biuret account preferences. Existing challenge progress remains intact.
- Lesson completion is a learning aid. It does **not** issue credentials, credits, exam results, or paid access.

## Learning contract

`path -> course -> lesson -> formative check -> practical challenge -> summative exam -> certificate`

- A lesson can be revisited. A correct formative answer marks it complete once.
- A course can show learning progress as lessons completed plus its challenge result. This is not a formal assessment.
- A future final exam must use a private question bank and grade on the server. Passing criteria, attempt limit, cooldown, and version must be explicit before opening it.
- A certificate may be issued only after the server verifies all requirements. Its public verification page needs an opaque ID, issue date, issuer, achievement criteria, and revocation status. The learner chooses whether to share the public URL.

## Milestone 2: server-owned progress

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

Publish the Identity and Access and Evidence and Response courses, each with lessons, practice, accessible transcripts, and Arabic/English editorial review. Add an end-of-path exam only after server grading is deployed. Pilot with a small cohort and inspect completion, errors, and question quality before issuing credentials.

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
