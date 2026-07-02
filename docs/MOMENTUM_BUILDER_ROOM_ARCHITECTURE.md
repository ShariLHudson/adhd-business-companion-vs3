# Momentum Builder™ — Estate Room Architecture

| Field | Value |
|-------|-------|
| **Spec** | T-012 Room Architecture (extends [MOMENTUM_BUILDER_FRAMEWORK.md](./MOMENTUM_BUILDER_FRAMEWORK.md)) |
| **Orchestration (full)** | [MOMENTUM_BUILDER_V1_ORCHESTRATION.md](./MOMENTUM_BUILDER_V1_ORCHESTRATION.md) |
| Status | V1 shell — conversation-first room wired; orchestration composer added |
| **Canonical section** | `momentum-builder` (`AppSection`) |
| **Route** | `/companion/momentum-builder` → `/companion?section=momentum-builder` |

---

## Mental model (read this first)

**Momentum Builder™ is not a replacement page for Strategies.**

It is the **execution room** of the Spark Estate™ — where entrepreneurs regain forward motion.

| Momentum Builder™ is **not** | Momentum Builder™ **is** |
|-------------------------------|--------------------------|
| Task manager | The room where uncertainty becomes confident action |
| Productivity dashboard | Conversation-first forward motion |
| Checklist | Hidden intelligence choosing the right approach |
| Strategy library | Today's Path™ — member knows what to do next |
| Framework browser | Optional guided practice when Spark believes it helps |

**Success metric:** The member leaves knowing exactly what to do next — not task completion counts.

**Hidden success:** The member never realizes Spark selected a productivity framework behind the scenes.

---

## Layered architecture (do not merge)

```
Momentum Builder™ (Estate room — public surface)
        ↓
Layer 1 — Conversation          (chooses direction)
        ↓
Layer 2 — Hidden Strategy Engine (invisible — strategyRouting, strategyIntelligence, strategyCatalog)
        ↓
Momentum Intelligence           (momentum-intelligence, generateMomentumAction)
        ↓
Layer 3 — Guided Practice       (optional T-012 builders — permission only)
        ↓
Today's Path™                   (member-facing outcome object)
```

| Layer | Responsibility | Member sees |
|-------|----------------|-------------|
| **Conversation** | Welcome, discover state, time, energy, priorities, roadblocks | Coaching — one question; **never** definitions or learning menus |

### Arrival (mandatory)

Members never see:

- "A momentum builder is…"
- "Would you like to learn about momentum builders?"
- Quick Answer · Example · Apply to My Business · Deep Dive
- Strategy or framework names (Brain Dump, Pomodoro, Eisenhower, etc.)

Arrival copy (`lib/momentumBuilderRoom/coachingEntry.ts`):

1. Welcome to Momentum Builder™.
2. Let's figure out the easiest way to move forward today.
3. **One** opening question — then Spark waits.

After the member answers, the hidden strategy engine runs invisibly. Spark responds like a coach beside them — not a teacher.

**Success:** "I already feel less overwhelmed." **Failure:** the member learns what the Two-Minute Rule is.

Aligns with [T-017 Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md) — **Do the thing — never explain the room.**

| **Hidden Strategy Engine** | Select approach from existing strategy systems | Nothing |
| **Momentum Intelligence** | Score momentum, wins, day context | Hospitality language only |
| **Guided Practice** | Offer T-012 practice when helpful | "Would you like to practice this skill?" |
| **Today's Path™** | Persist forward-motion plan | First Step™, Easy Wins™, Focus Sessions™ |

**Principle:** Conversation chooses · Strategy executes · Practice teaches.

Each layer is a **separate module** under `lib/momentumBuilderRoom/`. No monolithic room component.

---

## Vocabulary (canonical names)

Use these in all new development. Legacy code may still reference old names internally.

| Old | New |
|-----|-----|
| Strategies (public room) | **Momentum Builder™** |
| Daily Momentum Plan | **Today's Path™** |
| Next Tiny Step | **First Step™** |
| Quick Win | **Easy Win™** |
| Deep Work | **Focus Session™** |
| Obstacles | **Roadblocks™** |
| Tomorrow's First Step | **Tomorrow Starts Here™** |

`playbook` / `StrategiesPanel` remain as **legacy internal surfaces** until migration completes. Do not extend them for new estate UX.

---

## Estate position

Momentum Builder™ owns **forward motion** in the estate journey:

```
Welcome Home → Observatory™ → Library → Conservatory → Momentum Builder™ → Creative Studio → Coffee House
     (arrive)    (learn)      (understand)  (think)      (decide & act)      (create)        (reflect)
```

**Homestead room id:** `momentum-builder`  
**Runtime registry:** `lib/momentumBuilderRoom/roomRegistry.ts`  
**Homestead catalog:** `lib/companionHomestead/homesteadRoomRegistry.ts`

**Separate from Game Room:** `game-room` / `quick-recharge` remains EF Quick Recharge (short resets). T-012 Grow catalog (`grow-momentum-builders`) becomes **guided practice** behind Layer 3 — not the public room.

---

## V1 deliverable (this shell)

| Delivered | Path |
|-----------|------|
| Architecture doc | This file |
| Room route | `app/companion/momentum-builder/page.tsx` |
| Room registration | `lib/momentumBuilderRoom/roomRegistry.ts` |
| Conversation entry | `lib/momentumBuilderRoom/conversationEntry.ts` |
| Hidden orchestration | `lib/momentumBuilderRoom/hiddenStrategyOrchestrator.ts` |
| Today's Path™ object | `lib/momentumBuilderRoom/todaysPath.ts` |
| Estate hooks | `lib/momentumBuilderRoom/estateIntegration.ts` |
| Minimal room shell UI | `components/companion/MomentumBuilderRoomPanel.tsx` |
| Intelligence registry | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |

**Not in V1:** Today's Path™ persistence UI, strategy migration, complete room art, guided practice runners.

**In V1:** Frosted coaching conversation, arrival copy, teaching-mode suppression, hidden strategy hints to chat API.

---

## Existing assets (reuse — do not duplicate)

| System | Path | Role in room |
|--------|------|--------------|
| Strategy routing | `lib/strategyRouting.ts` | Intent classification (internal) |
| Strategy intelligence | `lib/strategyIntelligence.ts` | Situation → strategy selection (internal) |
| Strategy catalog | `lib/strategyCatalog.ts` | Engine fuel (internal) |
| Plan-day momentum | `lib/companionBrain/generateMomentumAction.ts` | First Step / Focus Session candidates |
| Member momentum | `lib/momentum-intelligence/` | Offers, snapshots, scoring |
| Day Designer | `lib/day-designer/` | Conversational day shaping (optional bridge) |
| T-012 practice specs | `lib/sparkMomentumBuilders/types.ts` | Guided practice definitions |
| EF catalog | `lib/momentumBuilders/` | Quick Recharge only — not this room |
| Recovery | T-007 / `ENTREPRENEURIAL_RESILIENCE.md` | Roadblock + overwhelm paths |

---

## Implementation rules

1. **No strategy menus, framework browsers, or productivity dashboards** in the Momentum Builder™ room.
2. **Never surface** `strategyId`, category names, or method labels to members.
3. **Permission before** guided practice or Today's Path™ persistence.
4. **One question at a time** — Spec 105–106, Relationship Constitution, Hospitality.
5. **Register objects** in Intelligence Registry before persisting new shapes.
6. **Extend** `lib/momentumBuilderRoom/` — do not grow `StrategiesPanel` for estate UX.

---

## Related

- [T-012 Momentum Builder Framework](./MOMENTUM_BUILDER_FRAMEWORK.md) — guided practice philosophy
- [T-017 Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md) — room psychology
- [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) — natural next steps
- [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md)
- Types: `lib/momentumBuilderRoom/types.ts`
