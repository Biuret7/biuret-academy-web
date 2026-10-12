# Biuret CTF collection

The archive replaces the previous six browser CTF missions. Existing course exercises, path requirements, exams and credentials are separate and remain intact.

## Inventory

The catalog contains 40 distinct entries across five levels: 4 very easy, 10 easy, 13 medium, 11 hard and 2 advanced. Twelve have complete player packages: four Very Easy missions, six Easy missions from the supplied Easy player pack, and **Biuret Vault** and **Biuret CyberTrace** at Medium. The remaining 28 concepts are explicitly marked **Planned**, with no start or download action.

Easy includes XOR Mystery, Log Hunter, Username Hunter 2 (the existing `digital-footprint` concept), Broken Login, Secret Function and Data Recovery. Separate downloads and the combined Easy bundle contain identical player files. Evidence and Python code are unchanged. Added Arabic instructions/hints and aligned score text explain the platform's 25 CTF points, 100 XP and 10 coins for eligible accounts; the original pack's 10-point organizer scoring is not used by the platform. Hints do not deduct platform rewards.

Vault is displayed as Medium, consistent with its player README and catalog, although its original archive directory was named Easy.

## Player downloads

Public ZIPs preserve original code and evidence; enclosing folders match the website launch instructions. Documentation additions and scoring corrections are described above. Organizer solutions and solver scripts are not published. Normalized beginner and Easy player bundles are available alongside the separate downloads.

Each archive has a SHA-256 digest and a per-file manifest in `ctf-catalog.json`. Changes to a download must update these values. Original organizer material is retained outside this repository.

The Python entry points were reviewed and smoke-tested with help, evidence-listing and exit commands. Both use the standard library. Vault intentionally permits unrestricted note paths as part of its local training weakness. CyberTrace's command dispatcher is simulated, not an operating-system shell.

## Website behavior

The signed-in learning gate is retained. Catalog and briefing pages support Arabic/RTL and English/LTR, composable availability/specialty/difficulty filters, bilingual search and hash links for individual briefings.

Player ZIPs are public static training assets, not private authenticated storage. Ready challenges support authenticated server flag submissions and private achievement records. Local checks remain practice-only; server matching verifies possession of the correct flag, not independent mastery or competition integrity. Path credentials are separate. See [CTF rewards](ctf-rewards.md).

Generate the public module after editing catalog or briefing data:

```sh
node scripts/build-ctf-catalog.mjs
node scripts/build-learning-pages.mjs
node --test tests/*.test.mjs
```
