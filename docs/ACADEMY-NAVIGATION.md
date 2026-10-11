# Consolidated Academy navigation

The learner sees seven primary destinations: Home, Learning, Practice, Biuret CTF,
Resources, Learning notebook, and Your account. Learning groups path outlines,
courses, lessons, related practice, assessments, and credentials. Practice groups
labs, independent quizzes, challenges, and operations rooms. Resources groups
tools and career references. The notebook groups notes, saved lessons, and review.
Account groups profile, progress, the Foundations credential, access, and settings.
Specialty credentials stay with their path's assessment.

## Routes and compatibility

`learn.html?path=foundations` opens the path overview. Its Courses, Practice, and
Exam & certificate tabs show only the selected portion of the outline. Following
a course, lesson, lab, quiz, challenge, operation, or assessment retains the
`learn.html` pathname and `path` context. Query parameters identify the current
document; refresh, copy-link, Back, and Forward retain that selection.

The persistent shell hosts one same-origin learning document at a time. This
keeps existing lesson and assessment modules isolated, rather than sharing stale
attempts or accumulating event handlers. Subsequent document loads replace the
child history entry; the parent manages section history. Messages require both
the expected origin and source, and destinations come from a public allowlist.
The existing account/name gate and server checks are still required in both host
and learning document. Navigation never grants access, completion, or awards.

Old HTML files are compatibility documents, not extra primary destinations.
Previously shared links open their consolidated section and preserve item IDs.
Public certificate verification URLs remain standalone public views. Downloads,
external links, admin pages, and the CTF hash router are not rewritten.

## Removed repetition

- Repeated free-start panels across catalogs and access pages.
- Home's duplicate journey, lab/challenge promotions, and final start prompt;
  the personal next step remains in the hero.
- Course-card lesson lists; full lesson lists stay inside their course.
- Lesson-check listings in Quizzes; checks stay inside each lesson, and the
  independent practice quiz banks remain available.
- Repeated catalog learning notices and duplicated path navigation/instructions.
- Shop and trial/admin destinations from primary navigation. Existing balances,
  drafts, teaching content, assessments, and CTF player files are preserved.

## Build and verification

Sidebar source: `index.html`. Run `node scripts/sync-sidebar.mjs`, then
`node scripts/build-learning-pages.mjs` to regenerate compatibility and workspace
shells. The deployment explicitly stages public files; no `functions` files are
served. Run `node --test tests/*.test.mjs`,
`node scripts/audit-academy.mjs --strict`, and
`node scripts/content-release.mjs verify` before deployment. Preview only the
staged public artifact, never the repository root containing private banks.
