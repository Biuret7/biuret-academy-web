# Academy UI refresh

## Changes
- Shared presentation layer on all themed pages, including embedded workspace screens.
- Calm sidebar and header, compact home hierarchy, consistent cards and actions.
- Refined learning catalogs, paths, CTF, assessments, reading panels and account surfaces.
- Authored light palette with dark controls and readable Arabic/English text.
- Guide launcher sits inside the header; embedded pages keep it hidden.
- Small-screen profile controls retain their accessible names when displayed as avatars.
- Reading text retains its existing body size; course content and rewards are unchanged.

## Verification
- 165 existing tests pass, including the complete inventory and content audit.
- Theme generation and Guide syntax check pass.
- Core home, learning, paths, practice, CTF, account and library routes checked at 390px without horizontal overflow.
- Header checked at 320px with signed-in profile avatar and accessible label.
- Arabic/light and English/dark reviewed; RTL sidebar behavior retained.
- Guide popup and certificate viewer tested without sending an AI question or learner submission.
- Widget cache is independent of the ES module graph; module versions remain consistent.
