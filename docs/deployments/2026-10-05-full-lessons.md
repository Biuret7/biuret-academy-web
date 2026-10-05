# Full lesson explanations — 5 October 2026

## Ready for owner upload approval

Restore the original detailed explanation of every available program lesson instead of substituting the shorter applied guide. Keep the current lesson guide, evidence exercise and server-graded checkpoint as supplemental material after the original explanation. Both Arabic and English are restored with their reading direction.

- 105 lessons across 19 courses retain their complete source text. The original 99 lesson bodies in both languages are byte-for-text identical to the pre-quality backup `academy-quality-before-20261004.zip`. The six later applied GRC lessons retain their existing explanation.
- No course content or question bank is rewritten. No completion, exam attempt, credential or membership record is changed by the restoration.
- The nine Foundations lessons and active reviewed release remain unchanged: `foundations-2026-10-05`, digest prefix `cfc19ea9fa0c`.
- Public full explanations remain restricted by the existing server access checks. Answer indices and explanations remain absent from public checkpoint payloads.
- Changed entry module and stylesheet use cache identity `20261005-full-lessons1`; existing dependency cache identities remain intact.
- The unfinished SOC investigation from the previous task is preserved locally and excluded from this release.

## Private artifact

- Archive: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-full-lessons-20261005.tar.gz`
- Size: 534,751 bytes; 24 entries (package, fourteen server modules, nine private banks).
- SHA-256: `f6fff584ca74c8472983d2f3005709c8751b608c50a9edb54a45af089bfaedfc`
- Manifest: `C:/Users/Extreme/Desktop/Projects/tmp/academy-progress-full-lessons-20261005.manifest.json`
- All nine banks are byte-identical to the active report-review archive. The only server source change is the full-content serializer in `src/library.js`.
- Source baseline and rollback: report-review deployment `6ac403d658c4f37bf831`.

## Verification

- 114 tests pass, none skipped, in both the working tree and an isolated release assembled from the intended public files plus the exact private archive.
- The two added tests compare all 105 full explanations in both languages, validate retained server checkpoint behavior and confirm Free access restrictions still omit locked lesson text.
- Syntax checks and unchanged Foundations release checksum pass. The isolated Windows archive's generated module was normalized to LF for the same comparison performed by Linux Pages checkout.
- Synthetic browser session shows the full original explanation and its headings. A wrong checkpoint response is rejected; a correct response marks the local synthetic lesson complete. This does not write a real account's progress.
- Language switching preserves the completion indicator, Arabic RTL / English LTR, and restored content.
- Desktop and phone layouts have no page-level horizontal overflow in the inspected viewports.
- Preview: `C:/Users/Extreme/Desktop/Projects/tmp/academy-full-lessons-preview-20261005.png`; phone preview: `C:/Users/Extreme/Desktop/Projects/tmp/academy-full-lessons-mobile-20261005.png`.

## Publication sequence

1. Obtain confirmation to upload this exact archive to Biuret Academy Progress on Appwrite.
2. Upload and verify the new deployment is Active.
3. Push the prepared public commit to `Biuret7/biuret-academy-web`; confirm the Pages workflow succeeds.
4. Reload live original course lessons, inspect full text and existing checkpoint without completing a real lesson for the owner. Record deployment and run IDs here.

The earlier report-review Pages run `37367969023` failed on hosted runner assignment; authorized rerun attempt 2 was still queued at the last observation. Do not claim the restoration or that earlier public interface is live until Pages success and live QA are observed.
