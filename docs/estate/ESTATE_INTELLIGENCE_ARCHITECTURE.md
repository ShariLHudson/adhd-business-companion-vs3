# Estate Intelligence Architecture™

**Status:** **Binding architecture** · **Runtime (transitional):** `lib/estateBrain/` · `lib/estateIntelligence/` · **Member map:** `ESTATE_REGISTRY.md`

**Foundational principle:** **THE RELATIONSHIP OWNS THE WORK.**

**Full stack (2026-07-05):**

```
Relationship
    ↓
Conversation
    ↓
Estate Intelligence  ← this document
    ↓
Creating Together
    ↓
Studio (inside Estate Place)
    ↓
Artifact
    ↓
Member Journey
```

**Related:**

| Document | Role |
|----------|------|
| [MEMBER_JOURNEY_ARCHITECTURE.md](../MEMBER_JOURNEY_ARCHITECTURE.md) | Discovery · momentum · journey objects |
| [ESTATE_CREATION_EXPERIENCE.md](../ESTATE_CREATION_EXPERIENCE.md) | Places + Studio Registry |
| [ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md](../ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md) | Registry wiring |
| [INTENT_FIRST_ESTATE_NAVIGATION.md](./INTENT_FIRST_ESTATE_NAVIGATION.md) | Intent-first navigation |
| [SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md](./SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md) | Unified knowledge |

> The Estate is Spark's **world model** — not a collection of workspaces. **Places are emotional. Studios are capabilities inside places.**

---

## Binding decisions (2026-07-05)

| Decision | Estate Intelligence behavior |
|----------|------------------------------|
| **Two layers** | Recommend **Place** first (emotional fit); resolve **Studio** second (capability) |
| **Gentle Guidance** | Every recommendation includes **why** — never command |
| **Discovery** | Organic via relationship · growth · need · milestone — not feature catalog |
| **Registry authority** | Chat answers and menus read **Estate Knowledge Registry** — not static 3-room arrays |
| **Member Journey inputs** | Discovery Keys, momentum, visit history inform recommendations — not surveillance |

---

## Routing pipeline (target)

Every member message passes through **Conversation Intelligence** first, then Estate Intelligence when need involves place, atmosphere, or capability:

```
User Request
    ↓
Conversation Understanding + Priority Engine
    ↓
Need Classification
    ↓
[Estate Intelligence when need ∈ place · rest · focus · explore · create-atmosphere]
    ↓
Estate Judgment (evaluateEstateJudgment) — reads Estate Knowledge Registry
    ↓
Place recommendation (Layer 1 — emotional environment)
    ↓
Feature recommendation (breathe · audio · games · momentum · …) — unified catalog
    ↓
Studio Registry resolve (Layer 2 — when Creating Together needs surface)
    ↓
Gentle Guidance narrator (why · invitation · max 3 choices)
    ↓
Navigate (last — only when member accepts)
    ↓
Conversation continues
```

**Create intents** enter **Creating Together** — not a separate "Universal Creation" path in member experience.  
**Adaptive Intelligence** + **Member Journey** shape recommendations throughout.

**The room is not the first decision. The member's need is.**

---

## Two layers (Places vs Studios)

| Layer | Estate Intelligence selects | Member experiences |
|-------|----------------------------|-------------------|
| **Layer 1 — Place** | `estatePlaceId` from registry + judgment | *"The Library might be peaceful for this."* |
| **Layer 2 — Studio** | `studioId` from Studio Registry | Work surface inside place — rarely named |

Example: Create SOP → **Working Conference Room** + **process** Studio inside it.

See [ESTATE_CREATION_EXPERIENCE.md §3](../ESTATE_CREATION_EXPERIENCE.md).

---

## Discovery (organic Estate unfold)

Spark introduces new places and capabilities through **relationship**, not menus:

- *"I've been thinking about a place I'd like to show you."*  
- *"I think you're ready for another part of the Estate."*  
- *"I remembered somewhere that might help."*  

**Inputs:** Member Journey (Discovery Keys, milestones), adaptive prefs, need, judgment — **never** day-count or streak.

**Anti-patterns:** full estate map on arrival · achievement unlock pop-ups · "New feature available."

Detail: [MEMBER_JOURNEY_ARCHITECTURE.md §Discovery](../MEMBER_JOURNEY_ARCHITECTURE.md).

---

## Single source of truth

| Registry | Path | Purpose |
|----------|------|---------|
| **Estate Knowledge** | `lib/estateKnowledge/` | Places · features · groups · Q&A |
| **Estate Judgment** | `lib/estateIntelligence/judgment/` | Reasoning over registry |
| **Studio Registry** | `lib/studioRegistry/` (proposed) | Capability surfaces |
| **Capabilities** | `lib/estateBrain/capabilityRegistry.ts` | What Spark can do (transitional) |
| **Environments** | `lib/estateBrain/environmentRegistry.ts` | Rich metadata (transitional — merge toward Knowledge Registry) |
| **Intents** | `lib/estateBrain/intentCategories.ts` | Member goals |
| **Adaptive preferences** | `lib/estateBrain/adaptiveIntelligence/` | Learned patterns |
| **Member Journey** | `lib/memberJourney/` (proposed) | Longitudinal life in Estate |

**Migration:** Capabilities/environments **converge** on Estate Knowledge Registry + judgment — not parallel forever.

Conversation · navigation · menus · suggestions · research **must read from registry + judgment** — not hard-coded wander arrays.

---

## Unified feature catalog (Member Journey alignment)

These are **one recommendation surface** — not separate frictionless branches:

| Feature family | Examples | Recommendation style |
|----------------|----------|----------------------|
| Restoration | Breathe, meditations, Clear My Mind | Emotional need first |
| Audio | Focus Audio, Audio Library, pleasure places | Atmosphere + permission |
| Play | Games, refresh activities | Restoration Intelligence |
| Growth | Momentum, Spark Cards, Discovery Keys | Journey layer |
| Celebration | Gallery of Wins, Hall, Evidence Vault | Permission · quiet |
| Thinking | Decision Compass, Visual maps | Thinking Studio inside place |

---

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
