# Estate Coaching Architecture™

**Status:** BINDING · **Runtime:** `lib/estateBrain/estateCoaching.ts`  
**Parent:** [Intent-First Navigation](./INTENT_FIRST_ESTATE_NAVIGATION.md) · [Estate Intelligence](./ESTATE_INTELLIGENCE_ARCHITECTURE.md)

## Philosophy

The Estate is not a map. It is a **living companion**.

Members should almost never be immediately transported to a room. Spark first determines what kind of help they actually need — then quietly prepares the right experience.

> Rooms are not destinations. They are **interventions**.

## Coaching before navigation

```
What is the member trying to accomplish?
        ↓
What is getting in the way?
        ↓
What experience would help most?
        ↓
Navigation (last)
```

## One request → several helpful paths

"I need to focus" does **not** assume Focus Room.

Spark recognizes evidence-based paths and offers them naturally:

- Reserve uninterrupted time
- Get everything out of your head first
- Put on something calming while you work
- Try a two-minute breathing reset
- Work beside me for accountability
- Move somewhere more peaceful
- Something else

The same pattern applies to overwhelmed, creative block, stress, decision-making, business growth, and motivation.

## Human language only

Never present technical features.

| Internal | Member hears |
|----------|----------------|
| Clear My Mind | Get everything out of your head first |
| Time Blocking | Reserve uninterrupted time for this |
| Soundscapes | Put on something calming while you work |
| Journal | Write your thoughts down first |

Spark maps choices internally to Estate experiences, tools, and ambience.

## Intelligent follow-up

When the member adds context:

> I'm trying to finish an SOP.

Spark understands:

- **Goal:** Finish SOP
- **Obstacle:** Difficulty focusing
- **Sequence:** Clear mind → breathing → focus window → Create with SOP waiting

## Coaching situations

| Situation | Triggers (examples) |
|-----------|---------------------|
| **Focus** | can't concentrate, distracted, procrastinating, interrupted |
| **Overwhelmed** | so overwhelmed, too much at once |
| **Creative block** | stuck creatively, need to be creative |
| **Stress** | stressed, wound up, on edge |
| **Decision** | can't decide, stuck between options |
| **Business growth** | grow my business, scale my company |
| **Motivation** | no motivation, can't get myself to start |

## When coaching does NOT apply

- Explicit room requests ("take me to…")
- Specific artifact creation ("write an email", "help me with an SOP")
- Research with clear intent
- New project creation (Create fast path)

## Runtime API

```typescript
import {
  shouldCoachBeforeNavigate,
  resolveEstateCoachingMenu,
  formatEstateCoachingMenu,
  resolveEstateCoachingContinuation,
} from "@/lib/estateBrain";
```

Wired in `frictionlessActionLayer.ts` as `estate_coaching` — before immediate navigation.

## Success criteria

Members never feel like they are navigating software.

They feel Spark understands what they are trying to accomplish, helps them choose the best next step, and quietly prepares the perfect environment.
