# Intent-First Estate Navigation™

**Status:** Active architecture layer  
**Code:** `lib/estateBrain/intentCategories.ts` · `environmentRegistry.ts` · `routeIntentFirstNavigation.ts`  
**Parent:** [Estate Intelligence Architecture](./ESTATE_INTELLIGENCE_ARCHITECTURE.md) · [Estate Brain](./ESTATE_BRAIN.md)

## Philosophy

People do **not** think in rooms. They think in **goals**.

The Estate is an intelligent environment. Spark understands what the member wants to accomplish and automatically chooses the best place, tools, and experience.

> The member should almost never need to know which room they need. **Spark should know.**

## Decision pipeline

```
User Request
    ↓
Intent Detection        (intentCategories.ts)
    ↓
Capability Selection    (capabilityRegistry.ts)
    ↓
Best Estate Environment (environmentRegistry.ts)
    ↓
Tools
    ↓
Conversation
```

**The Estate room is not the first decision. The capability is.**

## Intent categories

| Category | Natural signals |
|----------|-----------------|
| **Create** | write, draft, design, build, email, SOP, proposal |
| **Learn** | research, explain, compare, study, discover |
| **Plan** | plan, roadmap, goal, strategy, launch, quarter |
| **Reflect** | journal, gratitude, pray, reflect, capture |
| **Focus** | focus, concentrate, pomodoro, body double, deep work |
| **Restore** | relax, breathe, calm, meditate, reset, anxious |
| **Celebrate** | celebrate, win, milestone, accomplishment |
| **Business** | offer, pricing, client, marketing, CRM, funnel |
| **Visual Thinking** | too many ideas, mind map, scattered, brainstorm |

## Environment registry

Every environment defines:

- Name, purpose, best for
- Capabilities and tools
- Related and suggested next spaces
- Conversation style and ambient experience
- Canonical `spaceId` for navigation

**Single source of truth** for conversation routing, suggestions, menus, tool launch, and onboarding.

Registered environments include: Create Studio, Writing Room, Visual Thinking Studio, Study Hall, Momentum, Boardroom, Round Table, Art Studio, Journal Gazebo, Music Room, Coffee House, Focus Room, Sunroom, Clear My Mind.

## Automatic selection examples

| Member says | Capability | Environment | Tool |
|-------------|------------|-------------|------|
| Help me write an SOP | Create · SOP | Create Studio | SOP Builder |
| I have too many ideas | Mind Map | Visual Thinking Studio | Mind Map |
| Build my marketing strategy | Marketing Plan | Momentum | Marketing Planner |
| Research newest AI accounting software | Research | Study Hall | Research Assistant |
| I need to calm down | Restore | Sunroom | Breathing / soundscapes |

## Flexible suggestions

When multiple environments fit equally well, Spark offers choices — never forces:

> I can help with that in a couple of ways.
>
> • Create Studio — if you're ready to begin writing.
> • Writing Room — if you'd like to brainstorm and develop ideas first.
>
> Which sounds better?

Max **3 choices** (T-003).

## Legacy elimination

Do **not** route from:

- Workspace · Module · Builder · Feature · Tab · Launcher
- Legacy Create / Marketing workspace logic

Route from: **Capability → Environment → Tool**

## Success criteria

A member never thinks *"Which feature do I use?"*

They describe what they want. Spark immediately understands intent, capability, environment, tools, and what comes next.

The result feels like an intelligent companion — not software with menus.

## Runtime API

```typescript
import {
  detectEstateIntent,
  resolveIntentFirstRoute,
  resolveEstateIntelligenceRoute,
  ESTATE_ENVIRONMENTS,
} from "@/lib/estateBrain";
```

`resolveEstateIntelligenceRoute()` delegates to intent-first selection first, then falls back to capability-only scoring.

**Coaching layer:** [ESTATE_COACHING_ARCHITECTURE.md](./ESTATE_COACHING_ARCHITECTURE.md) — for focus, overwhelm, stress, and similar situations, Spark coaches with human prescriptions **before** navigating. Create/research fast paths still apply when intent is specific.

## Tests

`lib/estateBrain/routeIntentFirstNavigation.test.ts` — success-criteria examples from this spec.
