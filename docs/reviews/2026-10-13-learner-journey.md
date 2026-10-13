# Learner journey review — 2026-10-13

## Scope and method

Reviewed Academy source and completed the Foundations browser journey with a synthetic local Free learner. The real Academy handler ran against an in-memory Appwrite adapter. No production account, reward, exam attempt, credential, sharing permission or payment was changed. Preview files and the synthetic SDK remain outside the public repository. This is an engineering review, not independent learner research or specialist accreditation.

## Reproduced issues and fixes

| Issue | Result |
| --- | --- |
| Home/path recommendation returned to the practical assessment after it was passed | Uses server assessment state: unfinished lesson → practical → final exam. Completed path leads to the credential. |
| Changing language discarded a Foundations checkpoint selection | Uses the existing account and form scoped answer retention; no checkpoint answers are written to storage. |
| Certificate downloads were not delivered from the consolidated iframe in the in-app browser | Structured-clones the certificate Blob to the authenticated parent, which creates its own download URL. Validates allowed filename, matching MIME and 8 MiB limit; existing origin/source checks remain. |
| Progress service failure left the start button disabled and misleadingly suggested no completion | Provides a retry action and unknown count; retries recover without a full reload. |
| Late progress requests could overwrite a newer account/request state | Checks account owner and request revision before applying asynchronous results. |
| Selected assessment tab was clipped on a small screen; assessment heading used excessive space | Brings the selected tab into view and applies the course typography scale to assessment headings. |
| Content release verification falsely failed on Windows line endings | Normalizes CRLF only; modified content still fails verification. |

## Verification

- Guest learning gate blocks the content. Synthetic signup rejected a single name and accepted two name parts.
- Completed all nine lessons through the UI, following course/lesson links. Later lessons remained locked until preceding verified checks were completed.
- A checkpoint selection survived Arabic/English switching. Practical and final exam retained 2/3 and 10/10 selections respectively across language changes.
- Passed all three practical decisions and the 10-question exam in memory. The browser issued a private credential to the synthetic full name, including 3 courses, 9 lessons and the exam result.
- PNG, PDF and JPEG downloaded successfully from the consolidated workspace after the transport fix. Files were approximately 772 kB, 155 kB and 186 kB. No public sharing was enabled.
- A simulated one-time progress outage recovered using the homepage retry button.
- An incorrect CTF flag was rejected with the remaining attempt count; signing out restored the learning gate.
- At 390px: outer page and embedded credential document had no horizontal overflow. Arabic and English directions were reviewed in Dark and Light.
- Existing synthetic service tests cover failed exams, cooldown, lesson/assessment prerequisites, private credentials and all ten paths. Security tests reject invalid exported filenames, MIME mismatches and excessive file size.

## Limits

OAuth provider handshakes were not repeated against real Google/GitHub accounts. Existing production configuration was unchanged. Real-user usability research and independent cybersecurity content review remain separate work. No purchase flow was opened.
