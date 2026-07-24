# Option Comparison and Recommendation

**Runtime:** `engine/compareOptions.ts` · `engine/recommendOption.ts` · `engine/buildDecisionRecord.ts`  
**Adaptive:** presentation only (`comparisonStyle`, `choiceLoad`, `structureLevel`)

## Comparison modes

- side_by_side
- one_at_a_time (when Adaptive choice load is one)
- summary_first / leading_plus_alternatives
- one_criterion / plain_tradeoffs

Reasoning quality is the same regardless of presentation mode.

Each comparison card includes: why it fits, main benefit, main trade-off, capacity demand, reversibility, main risk, smallest test, what would rule it out.

No giant scorecard by default.

## Recommendation ≠ decision

When enough context exists, Shari may recommend a leading option:

- explain why it currently appears strongest
- name the biggest uncertainty
- acknowledge the main trade-off
- avoid false certainty
- preserve user agency

`StrategicRecommendation.isDecision` is always `false` until the member confirms a direction on the work item.

### Help me choose

Identify the strongest option, explain the deciding distinction, name the main uncertainty, optionally ask one final feeling question, and preserve final authority.

## Decision Record integration

Phase 3 may add (only when meaningful):

- options considered
- why options differed
- trade-offs / opportunity costs
- reversibility note
- experiments considered
- companion recommendation (never copied into chosen direction)
- what would change the decision

Empty sections stay hidden. User language is preserved. Decision remains incomplete until confirmed.
