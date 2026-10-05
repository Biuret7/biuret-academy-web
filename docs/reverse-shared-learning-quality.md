# Reverse engineering and shared curriculum — 5 October 2026

## Teaching changes

Twenty-eight guides with generic four-point exercises now have authored, bilingual teaching, synthetic artifacts, analysis, independent tasks, topic-specific checkpoints and original references. The existing 99-guide total, IDs, answer positions and runtime version remain unchanged. Private revision: `reverse-shared-learning-20261005`.

| Course | New guides | Practice outcomes |
| --- | ---: | --- |
| Cybersecurity Fundamentals (1) | 6 | CIA requirements/recovery; event versus incident; scope; control dependencies; SOC handover; trust boundaries |
| Security Tools (5) | 6 | Port-state uncertainty; module prerequisites; HTTP owner controls; OSINT lineage; lockout stopping; cross-tool evidence |
| Social Engineering (6) | 5 | Independent verification; URL hosts; session response; area permissions; reporting metrics |
| Career Pathways (8) | 6 | Skill-gap planning; issuer-rule verification; course completion versus professional certification; role experiments; accurate portfolios |
| Reverse Engineering (16) | 5 | Instruction versus intent; PE/ELF layout and RVA; tool-type errors; byte constraints; signed/unsigned branch boundaries |

Seven existing guides received targeted supporting teaching after assessment review: Mobile components (49), Mobile testing (50), compliance (58), pentest methodology (10), intelligence tools (53), firewall/detection (9) and traffic analysis (61). These cover confirmation versus API authorization, release TLS/token validation, population/exception and supplier evidence, stopping before lockout, stale indicators/business impact, parser changes and detection evaluation. These are additions to existing guides, not seven newly created lessons.

No guide retains the generic English exercise prefix `Write four points:`. This mechanical result does **not** mean every course is equally deep or independently validated. Networking and cryptography still need fuller conceptual teaching and additional worked examples; dedicated GRC content remains a gap. Sources are linked, but some official sites restrict automated access; mutable certification version/fees/eligibility are deliberately not asserted.

## Reverse practice desk

`practice-lab.html?id=6&context=reverse` is linked from Malware Analysis and Reverse Engineering course 16. Existing lab-6 access rules apply before mounting. Standard DFIR lab-6 and intelligence lab-6 remain available.

Learners predict `jl` or `jb` at 32-bit values 3, 4, `0x80000000` and `0xFFFFFFFF`, then inspect signed and unsigned representations and comparison results. The model calculates these fixed comparisons only; it does not execute binaries, emulate flags/CPU/memory or run Ghidra/x64dbg. Notes are stored per account locally. Export recomputes results, excludes automatic identity fields and clearly states that written reasoning is not graded. No XP, award or credential is minted by practice.

## Assessment alignment review

The public [coverage map](../content/assessment-coverage.json) contains lesson IDs and group mappings only, with no questions, options or answer keys. Author review mapped all 88 final course items, all 100 path final items (three analytical case groups plus integration per path), and all 30 practical items to teaching within the required course bundle. Structural tests detect missing mappings and accidental reliance on optional or unrelated courses.

This is a curriculum mapping, not a psychometric difficulty study. The final banks, passing thresholds, cooldowns and existing credentials are unchanged. Several newly worked lesson examples resemble final scenarios; unseen variants and external review remain necessary to test transfer rather than recognition. Written exercises and browser desks are self-review work; selected-response practical items do not prove independent tool execution.

Remaining work before paid activation:

1. Deepen Networking/Cryptography and create a dedicated GRC sequence, including supplier review.
2. Author unseen exam variants with a documented outcome blueprint and explanations held privately.
3. Run learner/practitioner review of ambiguous choices, transfer, workload and accessibility.
4. Revisit assessment coverage, curriculum promises and completion-certificate wording using that evidence.

Purchases remain closed.

## Verification and release

All 90 local tests pass with no skipped cases. New tests cover numerical boundaries, invalid inputs, export privacy/recomputation, route preservation, private checkpoints/access, and coverage completeness. Syntax and the Foundations release checksum pass. Browser verification and deployment status are recorded separately in [the deployment record](deployments/2026-10-05-reverse.md).
