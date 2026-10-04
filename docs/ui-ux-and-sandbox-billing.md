# UI/UX and monthly subscription release

## User journeys

These needs are inferred from the user's requests and inspection of the existing
interfaces; they are not findings from interviews or a usability study.

- Portfolio visitor: understand the owner, distinguish future concepts from a
  working Academy pilot, inspect credential documents, and find contact details.
- New learner: sign in with a real two or three part name, complete the nine
  Foundations lessons in order, practice, pass the final exam, then pick a specialty.
- Returning learner: see the next verified step immediately; find a page without
  scanning the whole sidebar; read comfortably; distinguish review quizzes from
  course and path assessments.
- Member: compare actual access limits and prices, understand their current plan,
  and manage billing without losing saved learning progress.

## Implemented interface changes

Compact home hero with an explicit next-step card and verified progress;
correct current/completed route stages; searchable collapsible navigation on every
page; larger text and focus controls on lessons; keyboard focus and reduced motion;
plan comparison and questions; portfolio route cards and consistent responsive styling.

## Billing scope

This release implements **Paddle Sandbox only**, restricted on the server to the
configured Academy administrator. It does not enable live payments or sell access
to visitors. Sandbox records are separate from actual membership and do not grant
paid learner entitlements. Free remains the default; existing paid records and
administrator access continue unchanged. Live billing needs a separately approved
merchant account, product eligibility review, live prices/credentials and a reviewed
entitlement integration before checkout becomes public.

Sandbox prices observed in the dashboard:

| Plan | Monthly USD | Paddle price |
| --- | --- | --- |
| Plus | 5 | pri_01m432yr013mtf2p2119nxv41m |
| Pro | 10 | pri_01m2ghckg48x6e9vg26tds4q7w |

No trial. No coin redemption or cash conversion is implemented.

## Private Appwrite setup

Created table `academy_billing` (`6ac21d52000f32688dc7`) in database `6aa56477002e28054068`.
Table/row permissions: empty; no client reads, writes, updates or deletes.
Enable row security. Columns:

| Column | Type | Size | Required |
| --- | --- | --- | --- |
| userId | string | 36 | yes |
| kind | string | 24 | yes |
| occurredAt | datetime | — | yes |
| payload | Text | 16383 | yes |

Create a key index on `userId ASC, kind ASC, occurredAt DESC` for latest
subscription lookup. Wait for columns and index to be available before enabling.

Set these **server-only** function variables:

- `ACADEMY_BILLING_TABLE_ID`: generated table ID
- `ACADEMY_PADDLE_PLUS_PRICE`: price above
- `ACADEMY_PADDLE_PRO_PRICE`: price above
- `ACADEMY_PADDLE_CLIENT_TOKEN`: the Sandbox public client token
- `ACADEMY_PADDLE_API_KEY`: secret Sandbox key, limited to `transaction.write`,
  `subscription.read`, `customer_portal_session.write`
- `ACADEMY_PADDLE_WEBHOOK_SECRET`: secret for the Academy notification destination
- `ACADEMY_BILLING_ENABLED`: `sandbox` (set last)

Configure the Paddle default payment link to the Academy membership page if needed.
Create a Sandbox notification destination using the Academy Progress function's
HTTP domain. Subscribe to subscription created, activated, updated, resumed,
past_due, paused, canceled and trialing events. Requests must retain `bodyText`
exactly; signature validation happens before parsing or authentication.

## Ownership and failure handling

Checkout prices are selected on the server. Private deterministic daily intents
reuse the same provider transaction on retries. A failed or uncertain transaction
response locks that day's checkout for manual reconciliation instead of retrying
the creation operation. Examine the Paddle transactions dashboard and matching
intent before reconciliation; do not blindly delete it.

The first subscription notification must match the original transaction ID. An
immutable binding prevents another subscription from borrowing an intent ID.
Notifications are signed, time checked, deduplicated and stored as private events.
Current state is fetched from Paddle; delayed notifications cannot reactivate a
canceled subscription. Provider failures return an error instead of stale access.
Customer portal links are generated for the authenticated owner, restricted to
Paddle's Sandbox hostname, and never stored.

## Verified service behavior on October 4, 2026

- Administrator opened Plus Sandbox checkout at USD 5/month using Paddle's
  official test card and a synthetic example.com email; checkout completed.
- The initial notification was rejected by Appwrite's execution router (403).
  With explicit user approval, the function's execute roles now include Any.
  The handler still authenticates learning requests with a JWT and verifies the
  exact webhook body with the Paddle signing secret before processing an event.
- Retried subscription.created notification delivered successfully. Membership
  showed PLUS active with a period ending November 4, 2026.
- Owner portal opened, showed the test payment and monthly subscription, and
  successfully scheduled cancellation for November 4. Membership renders that
  date separately from the active status.
- Fifty-two Academy tests and twelve portfolio tests pass. Signature tampering,
  ownership isolation, duplicate delivery, delayed events, provider failures and
  renewal/scheduled cancellation states are covered by automated tests.
- Arabic and English desktop home/navigation and reading controls were reviewed.
  Browser viewport override did not change Academy's measured 1280px viewport;
  a visual mobile-width check remains unverified.

## Further testing before live billing

Paddle renewal failure/recovery simulations and a full live entitlement review
remain for the next integration stage. Sandbox access is intentionally isolated
from actual learner plan access; test payments do not activate paid learner plans.

## Installed configuration

Active function deployment: `6ac27c8f7cbe75a89d54`.
Notification endpoint: `https://academy-progress.fra.appwrite.run`.
The scoped Sandbox API key expires November 3, 2026 and requires renewal
before further tests after that date. Secret values are stored only in Appwrite.
