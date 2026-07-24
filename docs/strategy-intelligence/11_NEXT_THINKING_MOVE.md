# Next Thinking Move Selector

**Runtime:** `lib/strategyChamber/intelligence/engine/selectNextThinkingMove.ts`  
**Question surface:** `selectNextQuestion.ts`  
**Canonical stages:** `lib/strategyChamber/domainModel.ts` (unchanged)

## Purpose

Every turn answers:

1. What is already known?
2. What is still unclear?
3. What matters most next?
4. Should Shari ask, reflect, offer choices, generate options, or recommend another destination?

Return **one** primary internal move. Technical move names are never shown to the member.

## Not a second stage system

Moves map onto the existing `StrategicJudgmentStage` backbone. They do not replace it.

## Selector inputs

- Current backbone stage
- Strategy Work Item state
- Latest `ClassifiedStrategicInput` (including `StrategicStatementStance`)
- Evidence strength and `safeToTreatAsFact`
- Previously answered / known goal, constraints, capacity, concerns, opportunities, unknowns
- Existing options
- Decision readiness and confirmation state
- Adaptive Companion presentation preferences (**presentation only**)
- Whether the prior question was unanswered / “I don’t know”
- Whether another destination is more appropriate

## Output contract (`NextThinkingMovePlan`)

- `move` — `StrategicThinkingMove`
- `reason` — internal (tests / debugging; not member-facing)
- `targetGap` / `questionKey`
- `shouldAskQuestion` / `shouldReflectFirst`
- `optionReadiness`
- `recommendedDestination` (optional; never auto-transfer)
- `confidence`
- `idontKnowSupport` (when relevant)
- `lastClassified`

## Priority order (skip steps that are already clear)

1. Clarify the actual strategic question  
2. Understand what changed  
3. Clarify the desired result  
4. Identify what must be protected  
5. Identify important constraints  
6. Check capacity  
7. Separate evidence from assumption  
8. Resolve a material unknown  
9. Explore the main concern or opportunity  
10. Generate meaningfully different options  
11. Compare trade-offs  
12. Assess proportionate risk  
13. Check reversibility  
14. Design a small experiment  
15. Confirm direction  
16. Recommend the next destination  
17. Review results  

## Stance-aware behavior

| Stance | Selector behavior |
|--------|-------------------|
| Fact | May advance when adequately supported |
| Observation | `identify_change` or `identify_unknown` — never treat as proof of cause |
| Interpretation | Evidence check / tentative handling |
| Assumption | `surface_assumption` or evidence discipline |
| Feeling | `reflect_understanding` — not evidence; optional Talk It Out recommendation |
| Unknown | Pursue only when material to direction |

## Known-information protection

Do not re-ask a clear goal, restated “why now,” capacity already checked, or a confirmed decision.

## Reflection versus question

Prefer a short reflection when the answer was substantial, the member is overwhelmed, understanding just clarified, or the next question would feel abrupt. One primary question still applies.

## “I don’t know” behavior

Do not repeat the same question. Support modes: rephrase, example, up to three choices, smaller question, tentative interpretation, free explanation, skip. Adaptive choice limits affect presentation of choices, not the need for a softer path.

## Routing boundaries

May set `recommendedDestination` (Talk It Out, Board, Create, Projects, Plan My Day, Calendar, Finance/Business Estate, etc.). Never auto-transfer — recommend one place and why.
