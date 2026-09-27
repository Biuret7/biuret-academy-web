# Biuret Academy Web

An Arabic-first academy for `academy.biuret.dev`, with a complete English interface. The site uses the Biuret visual identity and offers 12 short challenges across Foundations, Web Security, and Digital Forensics. Three structured Foundations courses are live; see [the platform plan](docs/platform-plan.md) for the staged expansion.

## Features

- Sequential challenges in three independent tracks, with answer checks, hints, explanations, and next steps.
- A Foundations roadmap with nine bilingual lessons across URL safety, identity and access, and evidence and response. Each course has ordered self-checks and a practical challenge link.
- A server-graded Foundations final exam with a private question bank, three-attempt policy, and a shareable achievement credential after a passing result.
- Reviewed, versioned Foundations content releases with checksum verification and rollback, plus a restricted credential revocation page with a private audit trail.
- A private, server-owned Biuret Coins ledger: each verified lesson creates one idempotent earning event, and the progress page shows the resulting transaction history. Coins are not spendable yet.
- Separate home, paths, challenges, and progress pages. A shared language control switches Arabic/RTL and English/LTR, including mission content.
- A daily mission, one-time daily bonus, XP, completion count, and seven-day activity view. After finishing the starter challenges, learners can revisit one as a daily drill to keep their streak.
- Guest progress in `localStorage`. Signing in with the existing Biuret Appwrite account merges local and cloud progress into account preferences.
- Email/password and Google/GitHub account buttons. OAuth requires `academy.biuret.dev` to be registered as a web platform in the existing Appwrite project.
- Responsive layout, keyboard-accessible dialogs, and reduced-motion support.

The challenges use synthetic examples and intentionally teach defensive judgment. Signed-in lesson completions, verified XP, and Biuret Coins are server-owned in Appwrite; public formative answers alone do not qualify for the final exam. The coin balance is derived from private ledger events, including events backfilled from existing verified lesson awards. Challenge progress and practice XP are user-editable client-side values and do not count toward the credential. The achievement credential verifies course and exam completion, not a legal identity or professional certification.

## Local development

Serve this directory over HTTP (ES modules do not work from `file://`):

```bash
python -m http.server 8080
```

Run logic tests with `node --test tests/*.test.mjs`. No build step or package installation is needed.
If the shared page shell changes, regenerate `course.html`, `lesson.html`, `exam.html`, `certificate.html`, and `admin.html` with `node scripts/build-learning-pages.mjs`. Use `node scripts/content-release.mjs verify` to check the active reviewed content bundle; see [the platform plan](docs/platform-plan.md) for authoring and rollback commands.

## Publishing

Publish this directory from a dedicated public GitHub Pages repository. Set its Pages custom domain to `academy.biuret.dev` first. Then add a `CNAME` record at the domain's DNS provider: host `academy`, target `Biuret7.github.io`. Register `academy.biuret.dev` as a web platform in Appwrite project `6aa55a88003959a536e9`. Never put Appwrite server keys, OAuth client secrets, or other private credentials in this repository.
