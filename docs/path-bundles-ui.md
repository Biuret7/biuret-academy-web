# Path bundles: UI phase

The directory unifies free Foundations and all nine specialties. Course origin is not a category. Each path opens a dedicated workspace showing real course sequences, related practice quizzes, safe learning labs, challenges, practical assessment, final exam and certificate status. Arabic and English use the shared shell and account gate.

Foundations contains three courses, nine verified lessons, two guided labs, five challenges and one practice quiz. Its assessment requirements remain unchanged. Specialty course and lesson sequences match the existing server certificate requirements. Related practice supports review; it does not silently become an additional verified certificate prerequisite.

The public metadata builder exports only an allowlist of titles, summaries, IDs and links. Private lesson bodies, questions and answers remain outside GitHub Pages. Run `node scripts/build-path-catalog.mjs` locally when the private source catalog changes; do not run it on public CI.

This release does not create purchases, assign prices or grant access from local storage. Existing server membership access remains valid during migration. Admin access remains unrestricted. A future authenticated `ownedPathIds` response can drive the new workspace, but the deployed server does not issue it yet. Existing resource endpoints remain the access authority.

## Next phase: server ownership and one-time payments

1. Set a price and content version for each specialty; Foundations stays free. Decide access duration and treatment of future content updates explicitly.
2. Create private path ownership and purchase records in Appwrite, with server-controlled permissions and an auditable purchase/refund history.
3. Derive access to shared courses, quizzes, labs and challenges from the learner's owned paths. Enforce the same rules in every server endpoint, including practical assessments and exams; preserve completed credentials and admin access.
4. Replace the monthly Sandbox checkout with one-time path checkout. Verify signed payment webhooks, match the purchased product to the authenticated learner, deduplicate events and reconcile refunds. Never accept browser claims as proof of purchase.
5. Test successful, failed, duplicate and refunded purchases, shared-course access, guest denial and certificate eligibility in Sandbox.
6. Enable public payment only after an eligible live merchant account is approved and learner-facing prices, access terms and refund terms are finalized.
