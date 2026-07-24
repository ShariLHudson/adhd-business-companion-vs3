# Option and Decision Readiness

**Runtime:** `assessOptionReadiness.ts` · `assessDecisionReadiness.ts` · `generateOptions.ts` (`shouldOfferStrategicOptions`)

## Option readiness (internal only)

`OptionReadiness` is never shown to members.

Options are ready only when enough is known about:

- The actual strategic question
- The desired result (or enough conversation depth)
- Important constraints / capacity when relevant
- At least some evidence or present-tense context
- The main concern or opportunity

Until then: `too_early` / `needs_*` — withhold option generation.

## Decision readiness (existing union)

Uses the canonical `DecisionReadiness` values from `domainModel.ts`.

Refined rules:

- Readiness follows **actual evidence**, not AI confidence theater.
- AI recommendation is never the member’s decision.
- `decision_complete` only after the member confirms (`decisionRecordConfirmed`).
- Chosen direction without confirmation → at most `ready_for_decision`.

## User confirmation

Confirmation is an agency gate. Quiet drafts and suggested directions may exist; they do not complete the decision record until the member says the capture is right.
