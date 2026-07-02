# Spark Estate™ — Behavioral Consistency Layer

| Field | Value |
|-------|-------|
| **Status** | Active — enforce one Estate behavior across all rooms |
| **Parent** | [ESTATE_E2E_WIRING.md](./ESTATE_E2E_WIRING.md) · [ESTATE_INTELLIGENCE_FRAMEWORK.md](./ESTATE_INTELLIGENCE_FRAMEWORK.md) |

---

## Objective

One mind · one system · one memory · one conversation · many rooms.

Members never feel like they switched apps. Every frosted-chat destination uses the same pipeline.

---

## Single pipeline (all rooms)

```
Member message
  → evaluateEstateConversationTurn()     lib/estateIntelligence/estateConversationPipeline.ts
      → Memory / needs (Welcome Home concierge when applicable)
      → Estate Matcher™
      → Estate Router™
      → workspaceOfferFromEstateEvaluation()
  → estateConversationHintForChat()      unified LLM hint (behavioral rules + estate + in-room)
  → Estate offer card (Welcome Home)     Yes · Stay here · Show map
  → acceptWorkspaceOfferCore()           registry section → room open (context preserved)
```

**Estate Intelligence is the only routing brain.** Parallel matchers (`detectDoingIntent`, stress routing, decision compass offers) defer when `estateRoutingActive` is true.

---

## Non-negotiable rules (enforced in code)

| Rule | Enforcement |
|------|-------------|
| No room explanations first | `ESTATE_BEHAVIORAL_RULES_BLOCK` in system prompt + per-turn hints |
| Estate before general AI | `estateIntelligenceHintForChat` + suppressed `appFeatureKnowledge` when high confidence |
| One conversation | Messages never cleared on room transition |
| Room entry standard | `ESTATE_ROOM_ENTRY_HINT` in in-room hints |
| Room exit standard | `ESTATE_ROOM_EXIT_HINT` + registry invitations via `buildEstateInvitation` |
| Emotional alignment | `estateEmotionalAlignmentHint()` in pipeline |
| Consistent routing | `estateMatcher.ts` product rules — no room-specific regex trees |

---

## Rooms on the unified pipeline

| Context | Pipeline | In-room hint |
|---------|----------|--------------|
| Welcome Home | `evaluateEstateConversationTurn` + concierge | — |
| Momentum Builder™ | Same pipeline (`suppressed` when in-room) | `momentumBuilderRoomHintForChat` |
| Peaceful Places / focus-audio | Same pipeline | Estate hint only |
| Clear My Mind / brain-dump | Same pipeline | `clearMyMindTrustHintForChat` (trust, not routing) |
| Decision Compass panel | Workspace hints | `decisionCompassWorkspaceHint` |

---

## Removed / delegated duplicate logic

| Before | After |
|--------|-------|
| MB skipped `evaluateEstateIntelligence` | Always runs via pipeline |
| `MOMENTUM_BUILDER_ESTATE_CONNECTIONS` hard-coded copy | Registry + `buildEstateInvitation` |
| Global `focusToolDifferentiationHintForChat` | Per-turn Estate hints |
| Global `decisionCompassHintForChat` in system prompt | Panel/workspace hints only |
| Global `APP_FEATURE_KNOWLEDGE_COMPACT` in system prompt | Per-turn when estate confidence low |
| `detectDoingIntent` fallback | Skipped when `estateRoutingActive` |
| Inline Focus Audio lecture hint | Suppressed when estate active; Peaceful Places™ wording |

---

## Validation prompts (automated)

See `lib/estateIntelligence/estateConversationPipeline.test.ts`:

1. I'm overwhelmed → Momentum Builder™
2. What is a peaceful place? → Peaceful Places™
3. I need to focus → Momentum Builder™
4. I want to create a workshop → Creative Studio™
5. I can't decide what to do → Decision Compass™
6. I want to research AI tools → Observatory™

Manual: confirm warm tone, no dictionary openers, offer card on Welcome Home.

---

## Key files

```
lib/estateIntelligence/estateConversationPipeline.ts  — unified turn eval + hints
lib/estateIntelligence/estateRoomLifecycle.ts           — behavioral contract
lib/estateIntelligence/estateMatcher.ts                 — single routing source
lib/estateIntelligence/estateRouter.ts                    — single invitation copy
lib/companionPrompt.ts                                  — global behavioral rules only
app/companion/CompanionPageClient.tsx                   — wires pipeline per send
```

---

## Known remaining divergence (acceptable V1)

- Explicit UI navigation (sidebar, URL) still opens rooms directly — conversation context preserved
- Workspace panels (Create beside chat) use workspace-specific coach hints
- `stressRouting` / `decisionCompassRouting` modules remain for legacy cards but defer to estate on high confidence

---

## Next step

Manual QA across Welcome Home → Momentum Builder™ → return home; log any turn that still opens with a definition.
