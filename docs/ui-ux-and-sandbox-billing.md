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

## Remaining service verification after installation

1. Administrator sees test checkout; a Free learner cannot call checkout or portal.
2. Complete one Sandbox checkout using an official test card.
3. Confirm the signed notification and subscription status on the membership page.
4. Test renewal failure/recovery and scheduled cancellation using Paddle simulations.
5. Confirm duplicate delivery and a delayed event keep the current provider status.
6. Verify existing Academy learning and actual membership access remain intact.

## Installed configuration

Active function deployment: `6ac2204692f2c6d1599e`.
Notification endpoint: `https://academy-progress.fra.appwrite.run`.
The scoped Sandbox API key expires November 3, 2026 and requires renewal
before further tests after that date. Secret values are stored only in Appwrite.
