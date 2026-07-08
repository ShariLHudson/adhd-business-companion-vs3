# Spark Note™ Delight Experience Expansion Protocol

## Purpose

Transform Spark Note™ from a daily information card into a memorable companion experience.

The goal is not to create another feature users must manage.

The goal is to create a small daily moment that makes people feel:

"Spark knows what might interest me."

"Spark gave me something enjoyable today."

"Spark helped me see something differently."

---

# Core Experience Principle

Keep it simple.

ADHD-friendly means:

- one Spark at a time
- one idea at a time
- one small interaction at a time
- no overwhelming choices

The Spark Note should feel like a gift, not another responsibility.

---

# Spark Learns What Lights People Up

Over time, Spark should learn user preferences.

Track simple signals:

- Sparks opened
- Sparks saved
- Sparks reacted to
- categories enjoyed
- topics revisited

Use this information to personalize future Sparks.

Example:

User frequently saves:
- inventors
- business stories
- creativity stories

Future selection should include more of those topics.

The system should learn:

"What creates curiosity for this person?"

---

# Simple Reactions

After opening a Spark, provide optional one-tap reactions.

Options:

🔥 Loved it

😊 Made me smile

💡 Gave me an idea

⭐ Save for later

These reactions help personalize future Sparks without requiring written feedback.

---

# My Sparks Collection

Create a simple personal collection.

Purpose:

Allow users to keep Sparks that mattered to them.

Do not create a complicated library.

Show:

- saved Sparks
- favorite topics
- memorable discoveries

The feeling should be:

"My collection of things that inspired me."

---

# Spark Connections

After viewing a Spark, provide gentle next steps.

Do not force action.

Optional choices:

💡 Capture an idea

📓 Add to journal

⭐ Save Spark

📌 Connect to project

The Spark should open possibilities, not create pressure.

---

# Spark Types

Maintain variety.

## Quick Spark

A 10-second discovery.

Example:

"Did you know the microwave was discovered accidentally?"

---

## Story Spark

A short story.

Example:

"The surprising journey of the Post-it Note."

---

## Deep Spark

A longer exploration.

Example:

"How one entrepreneur changed an entire industry."

---

# Business Spark Mode

Support the entrepreneur audience.

Possible categories:

- Founder stories
- Business innovations
- Customer experience lessons
- Marketing ideas
- Leadership moments

Always include:

"What could this inspire in your business?"

---

# Personal Spark Mode

Support the human side.

Examples:

- encouragement
- reflection
- gratitude
- creativity
- curiosity

The user is more than their business.

---

# Seasonal Personality

Spark should feel alive throughout the year.

Examples:

Spring:
New beginnings and creativity

Summer:
Adventure and exploration

Fall:
Learning and reflection

Winter:
Traditions and inspiration

---

# Birthday and Celebration Sparks

Personal events receive special treatment.

Examples:

Birthday:

"Happy Birthday Spark"

Include:

- celebration
- encouragement
- reflection
- possibility

Business milestones:

- first customer
- anniversary
- launch
- accomplishment

Celebrate progress.

---

# Spark Shelf Concept

Future enhancement:

A visual collection of saved Sparks.

Not points.
Not badges.

A personal shelf of ideas.

Categories:

- Inventions
- People
- Business
- Creativity
- History
- Fun

---

# Content Quality Rules

Every Spark must answer:

1. What happened?
2. Why is it interesting?
3. Why does it matter?
4. How can this inspire the user?

Avoid:

- trivia without meaning
- random facts without connection
- long educational articles

Every Spark should create a connection.

---

# The Spark Test

Before adding a Spark, ask:

Would someone:

- smile?
- learn something?
- think differently?
- connect it to their own life?

If not, it is not a Spark.

---

# Long-Term Vision

Spark Note becomes a daily relationship builder.

Not:

"Here is information."

Instead:

"Here is something I thought you might enjoy."

The magic comes from combining:

- curiosity
- personalization
- encouragement
- learning
- imagination

Spark should feel like a companion who leaves little sparks of possibility throughout the day.

---

# Runtime Implementation (v1)

**Status: Implemented** — see [Daily Experience Protocol](SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md).

## Delight layer

| Protocol feature | Implementation | Status |
|------------------|----------------|--------|
| One Spark at a time | `evaluateDailySparkNote.ts` | **v1** |
| Reactions (loved, smile, idea, save) | `SparkNoteExpanded.tsx` + extended learning reactions | **v1** |
| Preference learning | `preferenceLearning.ts` — reactions, saves, views, passes | **v1** |
| My Sparks collection | `SparkNoteMyCollection.tsx`, `mySparksCollection.ts` | **v1** |
| Gentle connections | Capture, journal, save, connect to project | **v1** |
| Spark types (quick / story / deep) | `sparkType` on catalog + `delightExperience.ts` label | **v1** |
| Seasonal personality | `seasonalPersonality.ts` + `SPARK-SEA-*` sparks | **v1** |
| Birthday & celebration sparks | `personalSparks.ts` | **v1** |
| Visual Spark Shelf | Illustrated shelf UI | Future |

## Learning signals tracked

- Sparks opened → `recordSparkNoteViewed` → category affinity boost
- Sparks saved → `toggleSparkNoteFavorite` / save reaction
- Reactions → `recordSparkNoteReaction` → `categoryAffinity`, `ignoredCategories`
- Topics revisited → tag affinity + `topAffinityTopics()` in My Sparks

## My Sparks shelves (v1 labels)

Favorites · Ideas · Reflections · Business · Growth · Fun · Learning — via `MY_SPARKS_SHELF_BUCKETS` in `mySparksCollection.ts`.

## Verify

```bash
npx vitest run lib/sparkNote
```
