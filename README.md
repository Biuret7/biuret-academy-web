# Biuret Academy Web

An Arabic-first academy for `academy.biuret.dev`, with a complete English interface. The site uses the Biuret visual identity and offers 12 short challenges across Foundations, Web Security, and Digital Forensics. The first structured Foundations course is now live; see [the platform plan](docs/platform-plan.md) for the staged expansion.

## Features

- Sequential challenges in three independent tracks, with answer checks, hints, explanations, and next steps.
- A Foundations roadmap and a three-lesson course on safe URL reading, with bilingual self-checks and sequential lesson completion.
- Separate home, paths, challenges, and progress pages. A shared language control switches Arabic/RTL and English/LTR, including mission content.
- A daily mission, one-time daily bonus, XP, completion count, and seven-day activity view. After finishing the starter challenges, learners can revisit one as a daily drill to keep their streak.
- Guest progress in `localStorage`. Signing in with the existing Biuret Appwrite account merges local and cloud progress into account preferences.
- Email/password and Google/GitHub account buttons. OAuth requires `academy.biuret.dev` to be registered as a web platform in the existing Appwrite project.
- Responsive layout, keyboard-accessible dialogs, and reduced-motion support.

The challenges use synthetic examples and intentionally teach defensive judgment. Lesson completion, challenge progress, and XP are user-editable client-side values, suitable for personal learning but not certificates, paid entitlements, competitive leaderboards, or prizes. The roadmap labels upcoming exams and certificates as planned.

## Local development

Serve this directory over HTTP (ES modules do not work from `file://`):

```bash
python -m http.server 8080
```

Run logic tests with `node --test tests/*.test.mjs`. No build step or package installation is needed.
If the shared page shell changes, regenerate `course.html` and `lesson.html` with `node scripts/build-learning-pages.mjs`.

## Publishing

Publish this directory from a dedicated public GitHub Pages repository. Set its Pages custom domain to `academy.biuret.dev` first. Then add a `CNAME` record at the domain's DNS provider: host `academy`, target `Biuret7.github.io`. Register `academy.biuret.dev` as a web platform in Appwrite project `6aa55a88003959a536e9`. Never put Appwrite server keys, OAuth client secrets, or other private credentials in this repository.
