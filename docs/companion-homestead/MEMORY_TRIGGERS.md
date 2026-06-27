# Memory Triggers
## Awakening Memories Through Everyday Senses

**Version:** 1.0  
**Status:** Canonical — governs sensory storytelling in the Homestead  
**Code:** `lib/memoryTriggers/`  
**Sibling:** [SHARIS_EVERYDAY_LIFE.md](./SHARIS_EVERYDAY_LIFE.md) · [QUIET_MOMENTS.md](./QUIET_MOMENTS.md) · [WISDOM_OF_RESTRAINT.md](./WISDOM_OF_RESTRAINT.md)

---

## Mission

The Companion Homestead cannot produce smells. It does not need to.

The human brain completes sensory experiences from tiny cues. Our goal is not to describe a room. **Our goal is to awaken a memory.**

When someone reads:

> "A friend dropped off warm cinnamon rolls this morning. The house still smells wonderful."

They do not imagine words. They remember a Saturday morning. A grandmother. A holiday. Home.

---

## Core Principle

Never describe a room just to be descriptive.

Every sensory cue must answer:

> **What memory might this awaken?**

The Companion should feel familiar before it feels impressive.

---

## Environmental Storytelling

Never announce sensory details.

| Avoid | Prefer |
|-------|--------|
| "The room smells like coffee." | "I just poured another cup of coffee." |
| "It smells like cinnamon." | "A friend dropped off warm cinnamon rolls this morning. The house still smells wonderful." |
| "It smells like popcorn." | "I ended the day with a bowl of popcorn and a good mystery last night." |

**The story creates the sensory experience.**

Enforced in code: `MEMORY_TRIGGER_ANNOUNCEMENT_BANS` in `lib/memoryTriggers/rules.ts`

---

## The Five Senses

| Sense | Role |
|-------|------|
| **Sight** | Seasonal light, flowers, steam, candles, snow, birds, aquarium glow |
| **Sound** | Birdsong, rain, clock tick, Kinsey's footsteps, kettle whistle, wind chime — never loud |
| **Smell (evoked)** | Coffee, cinnamon rolls, herbs, rain-after-storm, evergreen — through life, not labels |
| **Touch (implied)** | Throw blanket, warm mug, cool breeze, sun-warmed chair, soft yarn |
| **Taste (occasional)** | Coffee, tea, cider, strawberries — part of life, not menu items |

Full library: `MEMORY_TRIGGER_CATALOG` in `lib/memoryTriggers/catalog.ts`

---

## Authentic To Shari

Only include what genuinely fits Shari's life:

- Coffee in the kitchen nook (`kitchen-table`)
- Watching birds from the window seat
- Crafting in the creative studio
- Crime show nights with popcorn
- Saturday cinnamon rolls from a friend — not from-scratch baking theater
- Fresh Iowa air through an open window

**Avoid pretending:** daily gourmet cooking, elaborate baking, perfect housekeeping, anything staged.

The Homestead is warm. Not perfect.

---

## Frequency Rules

Memory Triggers are special because they are **uncommon**.

- Do **not** mention them every visit
- Some visits contain **none** — silence is hospitality
- At most **one gentle cue** per visit (ADHD Comfort Rule)
- Eligible on roughly every fourth visit (`sessionVisitIndex % 4 === 0`)
- Per-trigger cooldown: 14–45 days (`cooldownDays` on each catalog entry)

Resolver: `evaluateMemoryTriggers()` in `lib/memoryTriggers/evaluateMemoryTriggers.ts`

---

## Relationship Rule

Memory Triggers are not scripted greetings.

They are tiny glimpses into everyday life. The guest should gradually feel like they know Shari — without Shari constantly talking about herself.

| `relationshipSuitability` | When |
|---------------------------|------|
| `any` | Early visits — universal domestic moments |
| `established` | After meaningful visits — Kinsey footsteps, shared pie, personal rituals |

---

## ADHD Comfort Rule

Many people with ADHD have strong sensory memories. Certain smells, sounds, textures, and seasons create calm and safety.

- **One cue is almost always enough**
- Never stack crowded sensory descriptions
- Suppress during flooded, grief, recovery, or first meeting

---

## Library Schema

Each `MemoryTriggerEntry` contains:

| Field | Purpose |
|-------|---------|
| `id` | Stable key + cooldown identity |
| `name` | Designer label |
| `sense` | sight · sound · smell · touch · taste |
| `seasons` | spring · summer · autumn · winter · all |
| `times` | morning · afternoon · evening · night · all |
| `emotionalPurpose` | Why this cue exists |
| `relatedRoom` | Canonical `CompanionPlaceId` or `any` |
| `relationshipSuitability` | early · established · any |
| `cooldownDays` | Minimum days before repeat |
| `authenticityNotes` | Builder guardrails |
| `storyLine` | Guest-facing story (when surfaced) |
| `memoryAwakened` | Designer-only — target memory |

---

## Integration

| Layer | Role |
|-------|------|
| `resolveMemoryTriggerChanges()` | Living Life Engine — optional `conversationHint` |
| `filterValidMemoryTriggerHints()` | Restraint pass on hints |
| `isMemoryTriggerOnCooldown()` | History via `memory-trigger:{id}` observation records |
| `recordLivingChangeApplication()` | Persists trigger cooldown on apply |

Memory Triggers share the `relationship` bucket with a cap of one per visit.

---

## Success Test

Imagine someone has visited the Companion for several months.

One Saturday morning they walk into a local bakery. They smell warm cinnamon rolls.

Without thinking, they smile and say:

> **"This reminds me of visiting Shari."**

That is the standard.

The Homestead should not merely show beautiful rooms. It should awaken beautiful memories.

Memory Triggers are another invisible thread that transforms the Companion from software into a place people genuinely feel connected to.

---

## Code Reference

```
lib/memoryTriggers/
├── types.ts
├── rules.ts
├── catalog.ts          # 50+ triggers, all senses, all seasons
├── evaluateMemoryTriggers.ts
├── index.ts
└── memoryTriggers.test.ts
```

Registered in `COMPANION_LIBRARY_CATALOG` as `memory-triggers`.
