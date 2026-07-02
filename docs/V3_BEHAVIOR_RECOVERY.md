# V3 Behavior Recovery — spark-ecosystem-v4

| Field | Value |
|-------|-------|
| **Status** | Active — restore known-good v3 chat/routing in v4 shell |
| **v3 reference** | Git branch `v3.0-conversation-frozen` (same repo) |
| **v4 branch** | `v4.0-development` |

---

## What worked in v3 (`v3.0-conversation-frozen`)

| Behavior | v3 mechanism | File(s) |
|----------|--------------|---------|
| Intent → workspace offer | `resolveIntentRouting()` → `workspaceOffer` | `lib/intentRoutingIntelligence.ts` |
| Early local reply (no LLM lecture first) | `buildWorkspaceOfferChatReply` + `setMessages` before API | `app/companion/CompanionPageClient.tsx` `handleSend` |
| Overwhelm routing | `detectOverwhelmTodayRoute` + `buildOverwhelmTodayOffers` | `lib/overwhelmTodayRouting.ts` |
| Capability registry hints | `companionEcosystemRoutingHintForChat` | `lib/companionEcosystemIntent.ts` |
| Stress / decision parallel offers | `stressRouting`, `decisionCompassRouting` | (still in v4, defer to estate when high confidence) |
| Homestead frosted chat | `HomesteadChatScene` on home (no Welcome Home cinematic) | v3 only — v4 added Welcome Home page |
| Conversation tests | CT-01…CT-11, gold standards | `docs/conversation-tests/` |
| Spark Alpha prototype | `/spark-alpha` | unchanged v3→v4 |

**Note:** Welcome Home™, Estate Intelligence™, and `WelcomeHomeFirstLaunch` are **v4-only** — they do not exist on `v3.0-conversation-frozen`. Recovery means wiring v4 UI to v3 routing semantics, not reverting architecture.

---

## What was broken in v4 (found)

| Issue | Cause |
|-------|-------|
| Overwhelm / “can't decide what to do first” lost offers | `shouldStayInConversation()` blocked `rawWorkspaceOffer` even when Estate matched |
| Stress routing ate estate offers | Fixed prior pass — `estateRoutingActive` precedence |
| Offer UI hidden on Welcome Home | Fixed prior pass — `EstateWorkspaceOfferCard` |
| v3 `turnIntentRouting.workspaceOffer` skipped when estate flag set | `estateRoutingActive ? null` blocked v3 fallback too aggressively |
| Autofocus delay on returning visitors | 450ms focus delay even when intro cinematic skipped |
| Momentum Builder skipped estate eval | Fixed in behavioral consistency pass |

---

## Files compared (v3 frozen ↔ v4)

```
git diff v3.0-conversation-frozen..v4.0-development --stat
  app/companion/CompanionPageClient.tsx   (large — estate + welcome home)
  components/companion/WelcomeHomeFirstLaunch.tsx   (v4 only)
  lib/estateIntelligence/*                  (v4 only)
  lib/intentRoutingIntelligence.ts          (mostly shared)
  lib/workspaceMode.ts                      (shared)
  lib/conversationGating.ts                 (shared — gating blocked estate)
```

---

## Code restored / bridged in v4

| Change | File |
|--------|------|
| V3 intent routing fallback after estate | `lib/estateIntelligence/v3BehaviorRecovery.ts` |
| `stayInConversation` does not block estate offers | `resolveEstateAwareWorkspaceOffer()` + `CompanionPageClient` |
| Estate invitation in early local reply | `workspaceOfferReplyLine()` |
| v3 secondary offer (e.g. Clear My Mind on overwhelm) | `mergeWorkspaceOfferSecondary()` |
| Autofocus immediate when intro skipped | `WelcomeHomeFirstLaunch.tsx` `useLayoutEffect` |
| Unified estate pipeline (kept) | `estateConversationPipeline.ts` |
| Dev login skip (kept) | `lib/companionAuthBypass.ts` |

---

## Regression tests added

```
lib/estateIntelligence/v3BehaviorRecovery.test.ts
lib/estateIntelligence/estateConversationPipeline.test.ts
lib/estateIntelligence/estateIntelligence.test.ts
lib/welcomeHome/estateConcierge.test.ts
```

Run:

```bash
npx vitest run lib/estateIntelligence
```

---

## Manual checklist (repeat after changes)

| # | Prompt | Expected |
|---|--------|----------|
| 1 | What is a peaceful place? | Peaceful Places™ invitation — not dictionary |
| 2 | I'm overwhelmed. | Momentum Builder™ (or Clear My Mind™ secondary) |
| 3 | I need to clear my thoughts. | Clear My Mind™ |
| 4 | I can't decide what to do first. | Momentum Builder™ and/or Decision Compass™ offer |
| 5 | I want to research AI tools. | Observatory™ |
| 6 | Help me create a workshop. | Creative Studio™ |
| 7 | Welcome Home input | Type immediately when chat visible (no click) |
| 8 | Accept any offer | Thread continues in destination room |

---

## Remaining gaps

| Gap | Notes |
|-----|-------|
| LLM variance | Hints + early local reply reduce but do not eliminate generic answers |
| v3 homestead chat UX | v4 Welcome Home cinematic differs from v3 homestead scene — intentional |
| `companionCapabilityRegistry` not in main offer path | Still used via `companionEcosystemRoutingHintForChat` |
| Sidebar navigation | Direct opens bypass conversation offer flow (context preserved) |
| Full browser E2E | Automated matcher tests only — manual Welcome Home pass still required |

---

## Rule going forward

**Working behavior beats newer architecture.** When v4 architecture conflicts with proven v3 routing:

1. Estate high confidence wins.
2. Else restore v3 `resolveIntentRouting` / `detectDoingIntent` path.
3. Never let `stayInConversation` block a high-confidence Estate match.
4. Add a regression test in `v3BehaviorRecovery.test.ts`.
