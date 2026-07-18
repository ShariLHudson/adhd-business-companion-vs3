# 192 Implementation Report — No Hidden Meaning & Direct Repair

## Root cause

1. Short hire lines (“If I should hire…”) classified as archetype `other`.
2. RCI `gentle-observation` bank included “quieter question underneath.”
3. “Nothing underneath.” was treated as a brief user turn → CQRI collapsed to “Take your time.”
4. No correction path overrode interpretation before RCI/CRCI.

## Pipeline changes

Direct correction runs **before** explicit help, CRCI, and RCI. Interpretation requires ≥2 evidence signals.

## Thinking Map

Added: `rejectedInterpretations`, `userCorrections`, `literalTopic`, `interpretationEvidenceCount`, `interpretationAllowed`.

## Failure codes

`UNSUPPORTED_HIDDEN_MEANING` · `USER_CORRECTION_IGNORED` · `FAILED_TOPIC_RETURN` · `GENERIC_POST_CORRECTION_FALLBACK` · `INSUFFICIENT_INTERPRETATION_EVIDENCE` · `REJECTED_INTERPRETATION_REUSED`

## Deployment

Do **not** deploy until authenticated smoke passes (hire open, Nothing underneath, That is not what I mean, multi-turn evidence).
