# Biuret CTF rewards and achievements

## Rules

| Difficulty | CTF points | Verified XP | Eligible Biuret Coins |
| --- | ---: | ---: | ---: |
| Very easy | 10 | 50 | 5 |
| Easy | 25 | 100 | 10 |
| Medium | 50 | 200 | 20 |
| Hard | 100 | 350 | 35 |
| Advanced | 150 | 500 | 50 |

Points and XP are available to every signed-in learner with a real full name. Coins require current Plus/Pro eligibility or the existing administrator entitlement. Free completions earn no coins and cannot mint coins after an upgrade; previously earned coins survive a downgrade. All rewards are granted once per account and challenge. Planned concepts cannot be submitted. The six ready packages have private validators.

The browser displays the flag field, real server errors, a saved completion badge, account totals and a downloadable JSON achievement record. Completion records include the learner name at completion, challenge, difficulty, date, package fingerprint, fixed rewards and private record ID. Language changes preserve account progress. A downloadable record is a copy of an authenticated account record, not a signed offline certificate or a public verification link.

## Storage and grading

`ctfState` and `ctfSubmit` use the account verified from the Appwrite JWT. Submitted user IDs, plans, rewards and difficulty are ignored. The private bank contains the original validators' SHA-256 digests and their exact salt prefixes, without plaintext flags. Comparison is case-sensitive, ignores surrounding whitespace and uses a constant-time digest comparison. Flag text is never persisted or returned.

The existing private coin ledger table `6ab94864000f11a04188` stores CTF records as payloads with no client permissions. Deterministic `c_` row IDs make the completion proof and its rewards a single write. The same record supplies account coin totals, avoiding a partially written second coin event. Existing lesson ledger entries are unchanged. Verified CTF XP contributes to levels, while the Foundations lesson prerequisite array remains unchanged.

Ten persisted `r_` attempt slots per account/challenge/UTC day limit guesses across concurrent executions. Failed guesses do not affect XP or coins. Retries after uncertain writes recover the same saved record without duplicate rewards. No new table, variable, permission or public credential sharing is required.

## Release

Include `ctf-bank.private.json` and all `src/ctf*.js` in the Academy Progress archive alongside the existing private banks. Keep the bank and archives out of GitHub. Deploy the function before publishing the matching browser UI. The shared module cache revision is `20261011-ctf1` so all pages share one authentication singleton. `build-ctf-catalog.mjs` regenerates public reward rules and the server's ready metadata inventory; never copy private validators into the public model or staging folder.

Verification covers malformed/wrong flags, original ready inventory, every reward tier, Free eligibility, downgrade/upgrade behavior, concurrent submissions, ownership isolation, JWT/full-name gates, ignored client reward claims, UTC reset and storage failures. Browser QA uses an isolated local fake account and a synthetic flag, never a real learner reward.
