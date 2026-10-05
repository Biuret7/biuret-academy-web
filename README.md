# Biuret Academy Web

An Arabic-first academy for `academy.biuret.dev`. The site uses the Biuret visual identity, a bilingual interface, and a verified Foundations route. It also includes the Arabic source curriculum from the Biuret Academy desktop program as a separate self-study library.

## Features

- An account-gated [learning journey trial](https://academy.biuret.dev/pilot.html): eight bilingual Foundations/SOC tasks, browser-local observations and voluntary JSON export. [Arabic review instructions](docs/pilot-review-checklist.md) explain how observations become tracked fixes; no human pilot results are claimed yet.

- Sequential challenges in three independent tracks, with answer checks, hints, explanations, and next steps.
- A Foundations roadmap with nine bilingual lessons across URL safety, identity and access, and evidence and response. Each course has ordered self-checks and a practical challenge link.
- A Foundations practical assessment using three synthetic evidence tasks, followed by a server-graded final exam with a private question bank, three-attempt policy, and a shareable achievement credential.
- Eighteen imported program courses with a recorded reading sequence and an exam for each course. Five specialty paths require the included course exams, a path practical assessment, and a private final exam before issuing a credential. Existing Foundations and specialty credentials retain their original IDs and validity.
- Reviewed, versioned Foundations content releases with checksum verification and rollback, plus a restricted credential revocation page with a private audit trail.
- A private, server-owned Biuret Coins ledger: Plus and Pro earn 10 coins per newly verified lesson; Free earns XP without new coins. Previously earned events remain visible. Coins are not spendable yet.
- A bilingual three-tier membership page: Free Foundations, planned $5/month Plus, and planned $10/month Pro. A private Appwrite record determines account access; checkout and the additional paid features are not open yet.
- Separate home, paths, challenges, and progress pages. A shared language control switches Arabic/RTL and English/LTR, including mission content.
- A daily mission, one-time daily bonus, XP, completion count, and seven-day activity view. After finishing the starter challenges, learners can revisit one as a daily drill to keep their streak.
- Guest progress in `localStorage`. Signing in with the existing Biuret Appwrite account merges local and cloud progress into account preferences.
- Email/password and Google/GitHub account buttons. OAuth requires `academy.biuret.dev` to be registered as a web platform in the existing Appwrite project.
- Responsive layout, keyboard-accessible dialogs, and reduced-motion support.
- The desktop program library: 18 courses and 99 bilingual lessons with objectives, exercises and references; 9 specialty roadmaps, 15 tool guides, 12 practice quizzes, 13 practice challenges, 8 synthetic labs, 6 operations simulations, and 8 external certification references. The desktop sidebar's review, operations, certifications, professional hub, notes, favorites, search, settings and profile all have web pages.

The challenges use synthetic examples and intentionally teach defensive judgment. Signed-in lesson completions, verified XP, and eligible Biuret Coins are server-owned in Appwrite; public formative answers alone do not qualify for the final exam. The coin balance is derived from private ledger events. Free state reads preserve older ledger events without creating new ones; Free lesson awards now store zero coins and never backfill on upgrade. Challenge progress and practice XP are user-editable client-side values and do not count toward the credential. The achievement credential verifies course and exam completion, not a legal identity or professional certification.

Imported desktop lessons and program content have Arabic and English versions. Program lesson reading and course exam results are recorded on the server for specialty eligibility; notes, favorites, practice results, and review cards remain browser-local. Program reading currently does not award XP or Coins. Store purchases and redemption remain disabled. The public export excludes lesson bodies, private exam banks, desktop user progress, account databases, private keys, and server secrets.

## Local development

Serve this directory over HTTP (ES modules do not work from `file://`):

```bash
python -m http.server 8080
```

Run logic tests with `node --test tests/*.test.mjs`. No build step or package installation is needed.
If the shared page shell changes, run `node scripts/sync-sidebar.mjs` followed by `node scripts/build-learning-pages.mjs`. The generated pages and sitemap are committed for GitHub Pages. To refresh the desktop curriculum from the sibling `Biuret_Academy` folder, run `python scripts/import-desktop-library.py` first. That exporter reads `academy.db` in read-only mode and parses curriculum literals without executing the desktop app. Use `node scripts/content-release.mjs verify` to check the active reviewed content bundle; see [the platform plan](docs/platform-plan.md) for authoring and rollback commands.

Learners enter a self-declared two or three part full name before verified learning. Existing credential owners can correct the certificate name after updating their Appwrite account name; the credential ID and exam result remain unchanged. Active certificates download as PDF, PNG, or JPEG. Name format checks do not verify legal identity.

The Appwrite function deployment must include `exam-bank.private.json`, `path-exam-bank.private.json`, `course-exam-bank.private.json`, `practical-bank.private.json`, `practice-quiz-bank.private.json`, `learning-edition.private.json`, and both `desktop-library.*.private.json` files. These files are ignored by Git and must never be included in the public Pages artifact. New credentials use `foundations-v2` or `program-path-v2` to record the practical requirement; older credentials stay verifiable. Biuret Academy certificates verify completion inside this platform; they are not external professional accreditation. Owners choose whether to enable a public verification link.

## Learning quality edition — October 2026

The private edition supplies 99 bilingual lesson guides with evidence, an output exercise, review criteria and a server-graded checkpoint. A new mark-read request without a correct answer is rejected; already recorded lessons remain intact. Course exams use a separate private bank for all 18 courses. The 10 path exams each use 10 four-option case questions spanning interpretation, response and validation, with a new passing threshold of 9/10. The practical bank contains 30 distinct evidence tasks. Earlier successful attempts and credentials retain their validity and original threshold.

Eight evidence labs, 13 practice challenges and six operations scenarios are bilingual guided simulations. They do not execute tools or connect to external targets, and their browser-local practice results are not credential evidence. Operations rooms are linked within each appropriate path. Purchases remain closed. The Foundations release was authored by Codex and validated with automated schema checks; that metadata is not an independent subject-matter review. Expert editorial review and pilot learner feedback should precede paid sales.

The October 5 Foundations/SOC iteration expands nine Foundations lessons and improves 22 SOC-related lesson guides. An analyst desk adds synthetic evidence filtering, correlation, explanatory feedback, account-scoped browser notes and optional feedback export. SOC exposes course 17 as an optional extension without changing earned-credential prerequisites. See [the alignment map and proposed human pilot](docs/foundations-soc-pilot.md); no human pilot or independent expert review has been completed.

## Publishing

Publish this directory from a dedicated public GitHub Pages repository. Set its Pages custom domain to `academy.biuret.dev` first. Then add a `CNAME` record at the domain's DNS provider: host `academy`, target `Biuret7.github.io`. Register `academy.biuret.dev` as a web platform in Appwrite project `6aa55a88003959a536e9`. Never put Appwrite server keys, OAuth client secrets, or other private credentials in this repository.
