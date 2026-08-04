# Future Architecture Note — duplicated `arbitrateConversationRouting` passes

**Status:** Documented for future work. **Do NOT change this behavior** as part
of the current conversation-quality remediation (Stage 1A/1B). Filed so the
duplication is tracked and can be consolidated deliberately later.

**Not a defect in either reported example.** The two conversation-quality
failures (ordinary-to-dos misroute; craft-show replay) are caused elsewhere
(classification breadth; stale-topic lifecycle). This note records a structural
smell surfaced during the audit, not a live bug fix.

## What happens today

`arbitrateConversationRouting` is computed **twice per user turn**, on the same
input, in two independent places:

1. `app/companion/CompanionPageClient.tsx:15070` — inside
   `beginTurnDecision(turnId, buildConversationDecision({...}))`.
   `buildConversationDecision` (`lib/conversationStabilization/conversationDecision.ts`)
   calls `arbitrateConversationRouting` to produce the immutable per-turn
   ConversationDecision, permissions, response mode, and logging.

2. `lib/frictionlessActionLayer.ts:3988` — inside
   `runConversationRoutingPipeline(input, routing)`
   (`lib/conversationStabilization/routingPipeline.ts:44`), reached from
   `resolveFrictionlessAction(...)` at `CompanionPageClient.tsx:18519`. This copy
   runs goal classification → estate-capability candidates →
   `selectWinningCapability` → `tryStabilizationFastPath` → routing trace, and is
   the copy that actually **drives destination selection and the fast path**.

The two invocations are not shared: the decision copy (#1) and the destination
copy (#2) each recompute goal classification and arbitration from the message.

## Why it matters (risk, not yet realized)

- **Divergence risk:** any input the two passes read slightly differently (e.g.
  state mutated between `:15070` and `:18519`, or one path seeing a topic the
  other cleared) can make the recorded decision disagree with the destination
  actually taken. Debuggability suffers because the logged ConversationDecision
  may not be the routing that fired.
- **Cost:** goal classification + candidate evaluation runs twice per turn.
- **Maintenance:** future routing-rule changes must be kept consistent across two
  call sites or they silently drift.

## Suggested future direction (for a later, dedicated stage)

Compute arbitration once per turn and thread the single result through both the
decision record and the frictionless/destination pipeline — e.g. have
`runConversationRoutingPipeline` consume the `ConversationDecision`/arbitration
already produced by `buildConversationDecision` at turn start, rather than
recomputing. Requires care around ordering (the destination pass runs after
several gates that can mutate topic/workflow state) and must preserve the
existing routing trace.

## Guardrail

This is a consolidation/observability improvement, **not** part of Example 1
(classification) or Example 2 (stale-topic) fixes. Schedule it separately, after
the conversation-quality stages, with its own regression pass over the
`conversationStabilization` routing suite.
