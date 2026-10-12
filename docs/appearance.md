# Biuret appearance modes

All source pages include the early `theme.js` bootstrap and `theme.css`. Dark is the default; a user choice is saved as the local appearance preference `biuret-color-theme-v1`. Invalid or unavailable storage falls back safely to Dark; the control still works without storage. No account or learning state is changed.

The button has localized Arabic/English labels, a pressed state, keyboard support, animated sun/moon icons and reduced-motion support. Embedded Academy documents inherit the parent appearance through same-origin storage and a validated parent message; newly loaded frames receive the current theme.

`theme-sources.json` lists the site's stylesheet cascade. Run `node scripts/build-theme.mjs` after stylesheet changes; the public site builds also regenerate the light palette. The compiler changes scoped paint properties only, preserving layout and images. `theme-controls.css` adds the control and intentional contrast overrides, including dark certificate image mats and logo tiles.

QA: all three sites switched to Light; preference survived page navigation. Academy iframe switched with its parent. At 390px, the button was visible and no horizontal overflow occurred in Portfolio credentials, Academy learning and Playground JSON. Existing suites passed: Portfolio 41, Academy 163, Playground 45.

## Production release — 2026-10-12

Owner explicitly approved publication to all three public domains. Implementation: `a899596e5922492b6c294d6d27e1c9dbc8703963`. [Pages run 38284738947](https://github.com/Biuret7/biuret-academy-web/actions/runs/38284738947) completed successfully. The production button switched Dark to Light, the Light preference survived reload, and the button switched back to Dark after verification.

Proof screenshot: `C:/Users/Extreme/Desktop/Projects/tmp/biuret-academy-light-live-20261012.png`.
