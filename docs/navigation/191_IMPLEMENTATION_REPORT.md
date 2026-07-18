# 191 Implementation Report — Grounded Acknowledgement & Context Rule

## Root cause

CQRI (and some CI shells) invented ungrounded acknowledgement lines:

- `BRIEF_ACKS` included “That seems important.”
- `preferObservationOverQuestion` fell back to “That seems like an important part of this.”
- No gate required the draft to name the user’s subject before send.

## Files created

- `lib/conversationalIntelligence/groundedAcknowledgement.ts`
- `lib/conversationalIntelligence/groundedAcknowledgement.test.ts`
- `docs/navigation/191_GROUNDED_ACKNOWLEDGEMENT_AND_CONTEXT_RULE.md`
- `docs/navigation/191_IMPLEMENTATION_REPORT.md`

## Files modified

- `lib/conversationalIntelligence/index.ts` — exports
- `lib/talkItOut/reflectiveEngine.ts` — CI → grounded → CQRI
- `lib/createBuilderChat.ts` — same sandwich in `polishCreateReply`
- `lib/conversationQualityRhythmIntelligence/applyRhythm.ts` — grounded brief collapse
- `lib/conversationQualityRhythmIntelligence/observationVsQuestion.ts` — no vague shell
- `lib/conversationQualityRhythmIntelligence/safeFallback.ts` — scenario grounded fallbacks
- `lib/conversationQualityRhythmIntelligence/qualityGate.ts` — generic/vague backstop
- `lib/conversationQualityRhythmIntelligence/types.ts` — failure codes

## Validation rules

- Generic / copyable-anywhere acknowledgements blocked
- Vague pronoun opens blocked unless a concrete noun is present
- Topic reference required on substantive user turns
- Near-verbatim echo blocked
- Banned ungrounded next questions blocked
- Minimal yes/no turns skip forced topic re-naming

## Deployment

Do **not** deploy until authenticated smoke passes on hiring, overwhelm, creative block, and client scenarios.

## Production readiness

Code + unit tests ready. Authenticated smoke still required before production.
