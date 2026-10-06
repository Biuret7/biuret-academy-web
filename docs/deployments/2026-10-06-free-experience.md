# Free experience deployment — 2026-10-06

The owner approved uploading the Academy Progress archive to Biuret Appwrite and publishing the matching Academy website. Both publications completed successfully.

## Released code

- Public code commit: `c69c0554f351476be5a2a9ea31a3b46f5ae2d70d`.
- Shared asset revision: `20261006-free1`.
- [GitHub Pages run 37492886168](https://github.com/Biuret7/biuret-academy-web/actions/runs/37492886168): Success, total duration 1m 8s.
- Pages artifact: `11425978045`, 845 KB; digest `66beb36ba913fd9edcdb0dbf8bf5a5120f42bd5af7c565d608156968459f6c8b`.
- Live entry: [Free learning studio](https://academy.biuret.dev/free-studio.html).

## Function

- Academy Progress deployment `6ac51c1043abb979f47c`: Active.
- Previous deployment `6ac508387a2d7f4beb01`: Ready, retained for rollback.
- Archive: `academy-progress-free-experience-20261006.tar.gz`, 593,476 bytes, 26 files.
- Archive SHA-256: `30a8ec51121ee92429ee702c543bffed9838bbe14aae55da2e5a4f816758a99d`.
- Existing private content and question banks stay on Appwrite and are excluded from the public repository and Pages artifact. No tables, credentials, or execution permissions changed in this release.

## Verification after publishing

- The live studio loads the released asset revision and all six Arabic and English learning units.
- Arabic uses RTL with navigation on the right; English uses LTR.
- Logo images loaded successfully after refreshing the newly published page.
- The linked networking course loads all seven lesson links from Appwrite.
- These production checks were read-only with the existing signed-in account. They did not submit answers, lessons, reports, or notebook entries. Free access enforcement was verified in the local server/client tests; opening a course with the existing account alone is not evidence of Free enforcement.
- Local release checks: 138 passing tests, no skipped tests, 75 module syntax checks, and 38 structurally valid pages. See [the review](../reviews/2026-10-06-free-experience.md).

## Boundaries

Free includes 26 full library lessons and the existing nine verified Foundations lessons. Studio notes and formative practice remain in this browser under the signed-in account and are not cloud synchronized. Local studio checks do not mint XP, coins, or credentials. Verified progress continues through the existing server-backed lessons and assessments. Purchases remain closed; existing balances and certificates are preserved.
