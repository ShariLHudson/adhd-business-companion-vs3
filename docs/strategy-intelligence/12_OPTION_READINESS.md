# Option Readiness

**Runtime:** `lib/strategyChamber/intelligence/engine/assessOptionReadiness.ts`  
**Used by:** next-thinking-move selector · `shouldOfferStrategicOptions` · decision readiness

## Principle

Do not generate options simply because the member asked for help. Options wait until they would be useful.

## Values (internal only — never member-facing)

- `too_early`
- `needs_question_clarity`
- `needs_goal_clarity`
- `needs_constraints`
- `needs_capacity`
- `needs_evidence`
- `ready_for_initial_options`
- `ready_for_comparison`

## Ready when

Enough is known about:

- The actual strategic question
- The desired result (unless a light reversible path applies)
- Important constraints / capacity when relevant
- At least some evidence or present-tense context
- Main concern or opportunity (or light-path exception)

## Light path

Easily reversible experiments (e.g. weekly email pilot) may reach readiness with less information than a difficult-to-reverse decision (`lightPathAllowed`).

## Relationship to decision readiness

Option readiness gates **whether to show directions**.  
`DecisionReadiness` (canonical domain union) gates **whether judgment is complete**.  
Member confirmation is still required before `decision_complete`.
