# Path and lesson experience

## Changes
- Four path milestones: learning, practical assessment, final exam and certificate.
- One recommended action derived from the existing verified lesson and assessment state.
- Loading, access errors, guest state and Foundations prerequisites remain explicit.
- Administrator unlock counts are not presented as verified learning completion.
- Both lesson systems share read/apply/check navigation, collapsible contents and a next-step panel.
- The next lesson/course is offered in the new panel only after verified completion.
- Duplicate checkpoint continuation links are removed; notes, detailed explanations, references and knowledge checks remain.
- Responsive RTL/LTR layout, readable text and authored light/dark colors.
- Embedded HTML is keyed to the module release, preventing old inner pages after an outer-shell update. Path section changes reuse the loaded frame and preserve navigation guards.

## Verification
- 172 tests pass, including seven milestone and continuation state tests. Foundations use actual awards for administrators; only specialty bypass counts are treated as unknown.
- Local synthetic Free learner: wrong Foundations answer stayed incomplete; correct answer earned existing XP and unlocked the next-step action.
- Followed that action to the second Foundations lesson. Radio selection survived Arabic/English switching.
- Completed the first program library lesson through the local service; its panel offered the next library lesson.
- Local service uses an in-memory adapter; no production progress, coins, attempts or credentials changed.
- Reviewed both themes, both languages and a 390px embedded lesson without horizontal overflow.
- Public deployment includes the new UI/model modules; no private question banks or answer keys are published.

## Limits
- Specialty lesson/course progress is an aggregate from the existing service; no per-course completion is inferred from the count.
- Practice visits are not evidence of completion. The UI does not change server eligibility or purchase availability.
