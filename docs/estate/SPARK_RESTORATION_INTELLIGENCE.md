# Spark Restoration Intelligence™

**Status:** BINDING · **Runtime:** `lib/sparkRestorationIntelligence/`  
**Parent:** [ESTATE_INTELLIGENCE_ARCHITECTURE.md](./ESTATE_INTELLIGENCE_ARCHITECTURE.md)  
**Sub-layer:** [ESTATE_RESTORATION_GUIDE.md](./ESTATE_RESTORATION_GUIDE.md) (Estate Guide stories for curiosity paths)

## The question

Spark does not ask: *Should they stop working?*

Spark asks: **What would give this person more energy right now?**

People do not always need to work harder. Sometimes they need to recover differently — through journaling, playing, learning, wandering, creating, listening, celebrating, or simply sitting somewhere beautiful.

## Seven energy types

| Energy | Signal | Estate paths |
|--------|--------|--------------|
| **Mental** | Overload, decision fatigue, frustration | Clear My Mind · Visual Thinking · Mind Dump · Prioritization · Decision Compass |
| **Emotional** | Discouraged, depleted | Journal · Evidence Vault · Celebration Hall · Coffee House · Prayer Journal |
| **Creative** | Stuck, revision loops | Art Studio · Gallery · Observatory · Inspiration stories |
| **Sensory** | Overstimulated, overwhelmed | Gardens · Pool · Hammock · Music Room · Soundscapes · Breathing · Conservatory |
| **Play** | Needs novelty after sustained focus | Today's Adventure (Spin the Wheel) · Quick Games · Mini Challenges · Momentum Challenges |
| **Curiosity** | Brain needs something different | Estate Guide · Great Thinkers · Hidden Stories · Estate History · Gallery |
| **Social** | Needs encouragement, witness | Coffee House · Companion Chat · Celebration Hall · Share a Win |

Registry: `lib/sparkRestorationIntelligence/energyRegistry.ts`

## Intentional Cognitive Refreshers

Games are **not distractions**. They are recovery tools.

**Today's Adventure** (Spin the Wheel) reinforces the Estate — visit somewhere new, read one story, journal one sentence, sit by the lake, breathe, watch butterflies. Never points. Never guilt.

Wheel entries: `lib/sparkRestorationIntelligence/adventureWheel.ts`

## Momentum reframe

Momentum is not only productivity. Momentum is **forward motion**.

Sometimes forward motion means writing. Sometimes it means Spin the Wheel for three minutes. Sometimes it means the Garden, two pages of the Estate Guide, or one journal sentence.

Future momentum surfaces (documented, not all built in V1): Tiny Wins · Daily Challenges · Random Acts of Progress · Momentum Chains · Celebrations · Habit Adventures · Weekly Quests.

## ADHD neuroscience (design rationale)

ADHD brains restore attention differently. Novelty, movement, curiosity, play, beauty, and conversation restore different parts of attention. The Estate naturally contains all of these — Spark matches **energy need** to **Estate affordance**.

## Runtime flow

```
Member signal (fatigue, stuck, discouraged, novelty need…)
    ↓
classifySparkEnergy() — seven energy types
    ↓
evaluateSparkRestoration() — top recommendations (max 3 internal, 1 primary offer)
    ↓
buildEnergyRestorationOffer() — Shari voice, one invitation
    ↓
Estate Guide story (curiosity sub-layer) when guide_story primary
    ↓
Member accepts · declines · returns to work
```

**Frictionless category:** `estate_restoration` (unchanged — umbrella layer)

## Conversation rules

- **One primary invitation** — max 3 choices (T-003); alternatives in LLM hint only
- **Permission always** — member chooses; decline is valid
- **Never:** "take a break" · "you should rest" · productivity lecture · feature tours
- **Games = refreshers** — never gamification language in restoration context
- **Return to work** — warm reconnect when member is ready; preserve task context quietly

## Detection

`lib/sparkRestorationIntelligence/detection.ts` maps estate restoration triggers and explicit language to energy types. Blocks forward-task messages (`help me write…`) from restoration offers.

## Storage

Reuses `estate-restoration-v1` session store — read stories, favorites, cooldown (8 turns), pending return context.

## Success test

> After 90 minutes of writing, does Spark offer novelty that feels like companionship — not interruption?

Member should feel: *Someone noticed what I need — not that I failed to keep working.*
