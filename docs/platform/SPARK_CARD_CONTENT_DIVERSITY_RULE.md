# Spark Card Content Diversity Rule™

**Status:** Binding product law for Spark Card selection, authoring, and member-facing display  
**Surfaces:** Daily Spark / Spark Note (`lib/sparkNote/`) · Spark Card chrome · My Spark Collection  
**Related:** [SPARK_CARD_FRAMEWORK.md](../SPARK_CARD_FRAMEWORK.md) · Spark Cards redesign prompt (`spark-cards-redesign-cursor-prompt.md`)

---

## Purpose

Spark Cards exist to create **one small moment** of delight, curiosity, inspiration, or light learning each day.

They are **not** intended to become:

- daily lessons
- long educational articles
- predictable category streaks
- a holiday-only calendar feed

Every Spark Card should leave the member feeling one of:

> "That was interesting."  
> "I never knew that."  
> "That made me smile."

---

## Variety Is Required

Spark Cards must continuously rotate through many different categories.

- Never allow one category to dominate the experience.
- Members should never be able to predict tomorrow’s Spark from today’s.
- A healthy mix keeps Spark Cards fresh, memorable, and fun.

Holidays, National Days, International Days, seasonal observances, and weird/fun celebrations remain a **delight category** — never the only category.

---

## Approved Spark Categories

Member-facing ribbon labels use this catalog (short names preferred on the card):

| Id | Ribbon label | Includes / examples |
|----|--------------|---------------------|
| `fun_celebrations` | Fun & Celebrations | Weird holidays, National Days, International Days, seasonal observances, fun observances |
| `innovation` | Innovation | Accidental inventions, product breakthroughs, clever solutions |
| `remarkable_people` | Remarkable People | Inventors, entrepreneurs, artists, quiet heroes |
| `amazing_places` | Amazing Places | Cities, landscapes, hidden gems, wonder of place |
| `nature` | Nature | Animals, plants, weather, living world curiosities |
| `history` | History | Moments, firsts, cultural turning points |
| `fun_facts` | Fun Facts | Surprising truths worth smiling about |
| `kindness` | Kindness | Generosity, encouragement, human warmth |
| `curiosity` | Curiosity | Questions that open a door |
| `inspiration` | Inspiration | Hopeful sparks without preaching |
| `books_ideas` | Books & Ideas | Stories, ideas, and thinking worth carrying |
| `creativity` | Creativity | Making, play, imaginative leaps |
| `science_technology` | Science & Technology | Discovery, tools, how things work — lightly |

Authoring may use richer legacy library categories internally; runtime maps them into this approved catalog for **display ribbons** and **rotation**.

---

## Rotation Rules

Intelligent rotation — not a fixed weekly schedule.

1. Prefer variety across the approved catalog over repeating the same ribbon day after day.
2. Avoid the same diversity category appearing too frequently when alternatives exist.
3. Never make tomorrow’s category predictably the same as today’s.
4. Calendar / holiday sparks are welcome when the day truly matches — and must still yield to variety when holidays would otherwise dominate.
5. Personal meaningful moments (birthday, anniversary) may still take priority; they are relationship care, not category domination.

Weekly mix examples in briefs are **illustrative only**. Runtime chooses from available library depth with variety pressure, not a rigid Monday=Innovation calendar.

---

## Tone

Warm · positive · interesting · conversational · encouraging · memorable

Never:

- preachy
- overly educational
- overly technical
- overwhelming
- shame-based (“you should learn…”)

---

## Length

A Spark Card should be enjoyable in about **one to two minutes**.

Default view stays short:

- one story
- one takeaway (“Today’s Spark”)
- one tiny action (“Spark In Action”)

Additional facts, timelines, and related sparks stay behind **Tell Me More**.

---

## Experience Shape (with redesign)

Preserve collectible personality: parchment, gold frame, whimsical art, handcrafted feel.

Simplify content density. Artwork remains the hero.

Collection actions: Save · Favorite · Share · Print (optional).

---

## Final Principle

Spark Cards are **daily treasures**.

Curiosity about tomorrow’s Spark matters more than loyalty to any single category.

---

## Runtime

| Concern | Home |
|---------|------|
| Approved catalog + mapping | `lib/sparkNote/sparkCardDiversity.ts` |
| Variety filtering | `lib/sparkNote/librarySelection.ts` · `selectionIntelligence.ts` |
| Daily pick | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Simplified display | `lib/sparkNote/sparkCardCollectibleDisplay.ts` · `SparkNoteExpanded.tsx` |
