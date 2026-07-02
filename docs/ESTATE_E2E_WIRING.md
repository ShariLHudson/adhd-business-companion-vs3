# Spark Estate™ — End-to-End Wiring (V1)

| Field | Value |
|-------|-------|
| **Status** | Active — prove journeys before expanding |
| **Parent** | [WELCOME_HOME_ESTATE_CONCIERGE.md](./WELCOME_HOME_ESTATE_CONCIERGE.md) · [ESTATE_INTELLIGENCE_FRAMEWORK.md](./ESTATE_INTELLIGENCE_FRAMEWORK.md) · [ESTATE_BEHAVIORAL_CONSISTENCY.md](./ESTATE_BEHAVIORAL_CONSISTENCY.md) |

---

## What was wired

### Behavioral consistency (all rooms)

- `evaluateEstateConversationTurn()` — single pipeline for Welcome Home + all frosted-chat rooms (including Momentum Builder™).
- `estateConversationHintForChat()` — unified per-turn hint with behavioral rules, emotional alignment, estate-first mandate.
- See [ESTATE_BEHAVIORAL_CONSISTENCY.md](./ESTATE_BEHAVIORAL_CONSISTENCY.md).

### Welcome Home → Estate Intelligence

- `evaluateWelcomeHomeConcierge()` runs on every Welcome Home send (before LLM).
- `welcomeHomeConciergeHintForChat()` is **first** in the `intentHint` stack.
- `appFeatureKnowledgeHintForChat` / navigation hints **suppressed** when Estate match confidence is high.
- **Estate wins over stress routing** — high-confidence Estate matches no longer lose to `pendingStressOffer` or conflicting `stressReliefHintForChat`.
- **Spec 108 offer card** — `EstateWorkspaceOfferCard` on Welcome Home: **Yes · Stay here · Show map** (`components/companion/EstateWorkspaceOfferCard.tsx`).

### Room routing (WorkspaceOffer)

- `workspaceOfferFromEstateEvaluation()` converts high-confidence Estate matches into `WorkspaceOffer`.
- Estate offer takes priority over generic `intentRouting` workspace offers on Welcome Home.
- `acceptWorkspaceOfferCore()` routes to standalone rooms:
  - `momentum-builder` → Momentum Builder™ room (+ staged arrival even when conversation continues from Welcome Home)
  - `brain-dump` → Clear My Mind™
  - `focus-audio` → Peaceful Places™
  - `decision-compass` → Decision Compass™
  - `grow-observatory` → Observatory™
  - `growth-library` / `how-do-i` → Library™
  - `content-generator` → Creative Studio™

### Momentum Builder™

- Room shell + Today's Path™ from existing orchestrators (`runMomentumBuilderRoomCycle`, `buildTodaysPathDraft`).
- Coaching arrival (no room definitions) — **shows on estate accept** even when thread has Welcome Home messages.
- Arrival copy: *"Let's make today a little easier."* → *"What's making today difficult?"*
- Estate hints when already inside the room.

### Conversation continuity

- Messages persist in `CompanionPageClient` state when routing to standalone rooms.
- Estate match added to `businessContextForApi` for cross-room awareness.
- Returning home keeps the thread; no forced reset on room exit.

### Developer fast path

- `npm run dev` skips sign-in by default (`lib/companionAuthBypass.ts`).
- Welcome intro cinematic skipped in dev for faster chat entry.

---

## Routing proof matrix (automated matcher tests)

| User prompt | Primary match | Section |
|-------------|---------------|---------|
| What is a peaceful place? | Peaceful Places™ | `focus-audio` |
| I'm overwhelmed. | Momentum Builder™ | `momentum-builder` |
| I'm overwhelmed and don't know where to start. | Momentum Builder™ | `momentum-builder` |
| I need to clear my thoughts. | Clear My Mind™ | `brain-dump` |
| I can't decide what to do first. | Decision Compass™ | `decision-compass` |
| I want to research AI tools. | Observatory™ | `grow-observatory` |
| Help me create a workshop. | Creative Studio™ | `content-generator` |
| Teach me about pricing. | Library™ | `growth-library` |

---

## Primary journey to prove manually

1. Welcome Home → `"I'm overwhelmed and don't know where to start."`
2. Spark invites Momentum Builder™ (not a dictionary answer).
3. **Estate offer card** appears: Step into Momentum Builder™ · Stay here · Show map.
4. Accept → Momentum Builder™ room opens.
5. Arrival: *"Let's make today a little easier."* → *"What's making today difficult?"*
6. After sharing → Today's Path™ on planning table.
7. Navigate back → conversation still in thread.

---

## Known gaps

| Gap | Notes |
|-----|-------|
| LLM variance | Hints mandate estate-first; occasional generic reply possible — log in Conversation Learning Log if seen 3+ times |
| Business Mastery Minutes | Registry `planned` — routes to Library™ for now |
| Knowledge Cards | Registry `planned` — latent journey hint only |
| Estate OS lifecycle runtime | Types/docs only — not full 5-state engine |
| Full Journey Engine | Latent steps in hints; no multi-room automation |
| Coffee House™ | No `AppSection` — invitation copy only |
| Observatory / Library room UX | Nav works; full room experience incomplete |
| Show map on Welcome Home | Reveals homestead signpost sidebar; full folded-map UX not on Welcome Home yet |

## Still generic (expected)

- Low-confidence Estate matches → conversation-first, no forced routing
- Unregistered topics → normal LLM knowledge
- Teaching menus suppressed in Momentum Builder; may still appear elsewhere until wired

---

## Next recommended step

1. **Manual QA** — run the 7 test prompts on Welcome Home in dev; confirm offer card + routing + arrival.
2. Register Plan My Day, Gallery, Grow catalog entries in Estate Registry.
3. Session memory: `sessionStorage` last-room id for Return lifecycle.
4. Observatory / Library — complete room UX when journey proof is stable.

---

## Key files

```
lib/estateIntelligence/          — Registry, Matcher, Router, Offer
lib/welcomeHome/estateConcierge.ts
app/companion/CompanionPageClient.tsx  — hint stack + routing + precedence
components/companion/EstateWorkspaceOfferCard.tsx
components/companion/HomeChatInputFooter.tsx
components/companion/MomentumBuilderRoom*.tsx
lib/momentumBuilderRoom/         — arrival, Today's Path™, orchestration
```
