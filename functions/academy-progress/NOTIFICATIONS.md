# Academy notifications

## Current release

Private in-account inbox, unread bell, read state and explicit email preferences.
Certificate issuance and report-review decisions produce minimal notifications.
All notification actions use the account verified by Appwrite JWT; client user IDs
are never accepted. Events are unique per account/type/reference. No raw report,
review feedback, email address, learner name, exam answer or flag is stored here.

### Private Appwrite table

Database: `6aa56477002e28054068`. Table: `academy_notifications`.
Row security enabled; **no table permissions**, all server-created rows have `[]`.
Only the existing server function reads and writes rows.

| Column | Type | Required | Size/default |
|---|---|---|---|
| userId | string | yes | 36 |
| kind | string | yes | 20 |
| occurredAt | string | yes | 35, ISO UTC |
| read | boolean | no | false |
| payload | string | yes | 8192 |

Indexes:

1. `notification_feed`: key, `[userId, kind, occurredAt]`, `[ASC, ASC, DESC]`.
2. `notification_unread`: key, `[userId, kind, read]`, `[ASC, ASC, ASC]`.

Set `ACADEMY_NOTIFICATIONS_TABLE_ID=academy_notifications` and
`ACADEMY_NOTIFICATIONS_STARTED_AT=<activation ISO UTC>` on Academy Progress.
Set `ACADEMY_EMAIL_ENABLED=false`. Redeploy after setting environment values.
Do not move the activation timestamp forward on future deployments.

The table and timestamp are both required to enable the inbox. Disabled setup
returns an honest empty/configuring state. Learning and report-review results
remain successful if an inbox write fails. Opening the inbox reconciles the
newest 40 passed attempts and 40 report reviews since activation. This bounded
repair is for recent failed writes, not historic bulk notification backfill.

Preferences occupy separate deterministic private rows, so account photo,
learning settings and progression are not overwritten. All email switches start
off. Per-type consent timestamps prevent old achievements being emailed when a
learner later opts in. Revoked credentials are not recovered as new events.

## Email connection prepared, sending inactive

`src/notification-email.js` contains bilingual HTML templates and a provider-
independent adapter for Appwrite Messaging. It is **not called by any public
Progress action**, and does no network work with its default settings.

The adapter requires explicit delivery activation, provider readiness, current
per-type consent, a verified active account and an email target matching the
account's current verified email. It rechecks consent before queueing. Messages
use a deterministic ID on retries. A conflicting existing target fails closed.
`processing`/`scheduled` is not described as delivered, and a failed message is
not silently resent under a new ID. Events older than seven days are skipped.
Templates link to authenticated Academy pages; they have no tracking images or
private report/credential attachments.

### Next phase after choosing a provider

1. Connect an email provider and verify the sender domain using the provider's
   required DNS records. Keep its key in Appwrite's provider settings.
2. Create a **separate private scheduled worker**, execution roles `[]`, rather
   than extending the public `Any` Progress endpoint. Add minimum server scopes
   `rows.read`, `rows.write`, `users.read`, `messages.read`, `messages.write` only
   to that worker, with explicit approval.
3. Implement bounded preference/event batches with a persisted private cursor,
   delivery audit/status polling and reconciliation of authoritative results.
   Resolve target pagination for each account; never create an alternate recipient
   from client input. Do not log email addresses or provider raw responses.
4. Add verified lesson/CTF aggregation from server awards. Use `weeklyWindow()`
   for Monday after 09:00 Asia/Jerusalem, covering the previous local Monday to
   Monday (DST-aware). Skip inactive learners and empty weeks, and use one
   `week_YYYY-MM-DD` reference per account/week. This aggregation and scheduled
   worker are intentionally not active or deployed in the current release.
5. Test delivery with the owner's explicit consent. Check actual message status,
   opt-out, duplicate retries, target changes and failure handling before enabling
   general sending. Delivery preferences are available to edit now, but no
   emails are sent until this phase is complete.

API references: [Messaging REST](https://appwrite.io/docs/references/cloud/server-rest/messaging),
[Users REST](https://appwrite.io/docs/references/cloud/server-rest/users).
