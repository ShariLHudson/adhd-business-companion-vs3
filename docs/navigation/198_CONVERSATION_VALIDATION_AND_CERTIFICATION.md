# 198 — Conversation Validation & Certification

**Status:** Implemented · `validateConversationResponse` + blocking regeneration policy

## Critical gates (runtime)

Topic continuity · Correction compliance · Clarification repair · Grounded acknowledgement · No hidden meaning · Question quality · Natural conversation · Role/mode · Anti-copy

## Blocking failures (force regenerate)

`TOPIC_DRIFT` · `STOP_WORD_AS_TOPIC` · `REPAIR_LOST_TOPIC` · `USER_CORRECTION_IGNORED` · `REJECTED_INTERPRETATION_REUSED` · `FAILED_CLARIFICATION_REPAIR` · `GENERIC_POST_CORRECTION_FALLBACK` · `UNSUPPORTED_HIDDEN_MEANING` · `INSUFFICIENT_INTERPRETATION_EVIDENCE` · `VERBATIM_GOLD_COPY` · `UNGROUNDED_FALLBACK` · `TOPIC_ANCHOR_MISSING`

Soft failures are logged in `qualityHistory` / telemetry without rewriting a already-polished turn.

## Regression anchors

- “Take your time with that.”
- “There may be a quieter question underneath.”
- “You are working through something around does.”
