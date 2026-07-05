# Estate Intelligence Architecture™

**Status:** BINDING (internal) · **Runtime:** `lib/estateBrain/` · **Member map:** `ESTATE_REGISTRY.md`

**Intent-first navigation:** [INTENT_FIRST_ESTATE_NAVIGATION.md](./INTENT_FIRST_ESTATE_NAVIGATION.md) — members think in goals; Spark chooses environment automatically.

**Discovery Mode:** [ESTATE_DISCOVERY_MODE.md](./ESTATE_DISCOVERY_MODE.md) — understand before routing.

**Adaptive Intelligence:** [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md) — learn preferences that change future decisions.

**Universal Creation:** [UNIVERSAL_CREATION_FRAMEWORK.md](./UNIVERSAL_CREATION_FRAMEWORK.md) — one journey for every document type.

**Shari Knowledge:** [SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md](./SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md) — unified Estate knowledge for conversation, guide, and recommendations.

**Intentional Restoration:** [ESTATE_RESTORATION_GUIDE.md](./ESTATE_RESTORATION_GUIDE.md) — Estate Guide as restorative experience, not documentation.

**Spark Restoration Intelligence:** [SPARK_RESTORATION_INTELLIGENCE.md](./SPARK_RESTORATION_INTELLIGENCE.md) — seven energy types; what would give this person more energy?

**Intent-Aware Conversation:** [INTENT_AWARE_CONVERSATION_FRAMEWORK.md](./INTENT_AWARE_CONVERSATION_FRAMEWORK.md) — member sets depth; Spark follows intent.

> The Estate is Spark's **world model** — not a collection of workspaces.

## Routing pipeline

Every member message passes through:

```
User Request
    ↓
Intent Detection (intentCategories.ts)
    ↓
Spark Restoration Intelligence (energy type → Estate path — play, curiosity, sensory…)
    ↓
Estate Guide stories (curiosity sub-layer — optional flipbook / inline)
    ↓
Estate Guide (orientation — what can Spark do, room stories)
    ↓
Universal Creation (create intents — Discover → Prepare → Create)
    ↓
Estate Discovery Mode (focus, business growth, research — confidence ≥ 90%)
    ↓
Coaching Menu (when situation needs a human prescription)
    ↓
Capability Selection (capabilityRegistry.ts)
    ↓
Best Estate Environment (environmentRegistry.ts)
    ↓
Expert Selection (invisible) + quiet preparation
    ↓
Navigate (last)
    ↓
Conversation continues
```

**Create intents** (email, SOP, newsletter, funnel, …) enter **Universal Creation** first — not Estate Discovery.  
**Adaptive Intelligence** shapes questions, preparation, and anticipation throughout both flows.

**The room is not the first decision. The capability is.**

## Single source of truth

| Registry | Path | Purpose |
|----------|------|---------|
| **Capabilities** | `lib/estateBrain/capabilityRegistry.ts` | What Spark can do |
| **Environments** | `lib/estateBrain/environmentRegistry.ts` | Where work happens (rich metadata) |
| **Intents** | `lib/estateBrain/intentCategories.ts` | Member goals in natural language |
| **Experts** | `lib/estateBrain/expertRegistry.ts` | Who advises (internal) |
| **Experiences & spaces** | `lib/estateBrain/knowledgeRegistry.ts` | Estate Brain knowledge |
| **Adaptive preferences** | `lib/estateBrain/adaptiveIntelligence/` | Learned working/creative/decision patterns |
| **Router** | `lib/estateBrain/routeIntentFirstNavigation.ts` + `routeEstateIntelligence.ts` | Decision tree |

Conversation · navigation · menus · suggestions · research · expert selection **read from here**.

## Research levels

| Level | Meaning | Behavior |
|-------|---------|----------|
| **1** | Known knowledge | Answer in conversation (Explain SWOT, What is ADHD?) |
| **2** | Current research | Navigate Study Hall · live research |
| **3** | Deep research | Study Hall · structured report |
| **4** | Monitoring | Set up in conversation (future: alerts) |

Detection: `lib/estateBrain/researchRouting.ts`

## Success criteria (examples)

| Member says | Capability | Expert(s) | Experience | Tool |
|-------------|------------|-----------|------------|------|
| "Write an email" | Create → Email | Copywriter | Create | Email |
| "Research newest AI tools" | Research L2 | Research Analyst | Study Hall | Institute |
| "Build my business" | Business | Strategist + Marketing + Sales | Boardroom / Momentum | — |
| "I need to focus" | Focus | ADHD Coach | Focus | Focus Session |

Members never choose room, tool, expert, or menu.

## API

```typescript
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain";

const route = resolveEstateIntelligenceRoute(userText);
// route.capabilityId, route.expertNames, route.experienceId, route.toolId
```

## Wiring

- **Frictionless layer:** `tryImmediateEstateExperienceAction` → `resolveEstateIntelligenceImmediateAction`
- **Create/Momentum:** capability registry delegates to `createExperienceRouting`
- **Research L2+:** `immediateResearchOpen` → Study Hall navigation

## Related

- `docs/estate/ESTATE_BRAIN.md`
- `docs/estate/ESTATE_REGISTRY.md`
- `lib/estateExperiences/legacyWorkspaceMap.ts` — migration audit
