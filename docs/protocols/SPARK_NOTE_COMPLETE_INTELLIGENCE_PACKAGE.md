# Spark Note™ Complete Intelligence Package

> **Status: Implemented (v1)** — see [Daily Experience Protocol](SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md) for live tracking.  
> **Runtime:** `lib/sparkNote/` · **UI:** `components/companion/SparkNote*.tsx` · **Styles:** `app/companion/spark-note.css`  
> **Verify:** `npx vitest run lib/sparkNote`  
> **Related specs:** [Card Template](SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md) · [Experience & Routing](SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md)

## Implementation map (Parts 1–3)

| Package section | Spec requirement | Runtime | Status |
|-----------------|------------------|---------|--------|
| **Part 1 — Display** | Bottom-right, opposite Guide Book | `SparkNoteChrome.tsx` (portaled) | ✅ |
| | Collapsed: flame, Today's Spark, title, teaser | `SparkNoteAnchor.tsx` | ✅ |
| | Parchment / gold / teal styling | `spark-note.css` | ✅ |
| | Expanded: title, category, story, impact, application | `SparkNoteExpanded.tsx` | ✅ |
| **Part 2 — Engine** | Priority 1: personal (birthday, tone-adapted dates, upcoming events) | `personalSparks.ts` | ✅ |
| | Priority 2: date-based (holidays, history, seasons) | `evaluateDailySparkNote.ts`, `seasonalPersonality.ts` | ✅ |
| | Priority 3: curated library + affinity | `catalog.ts`, `preferenceLearning.ts` | ✅ |
| | One Spark per day | `persistence.ts` `dailySelection` | ✅ |
| | Repeat prevention / cooldowns | `librarySelection.ts`, `persistence.ts` | ✅ |
| | Content model (`spark_id`, story, impact, etc.) | `types.ts`, `catalog.ts` (29 cards) | ✅ v1 |
| | Primary / thumbnail images | `imageSrc`, `thumbnailSrc` fields | Partial — assets TBD |
| **Part 3 — Delight** | Reactions + learning signals | `SparkNoteExpanded.tsx`, `persistence.ts` | ✅ (6 reactions per routing spec) |
| | My Sparks collection | `SparkNoteMyCollection.tsx` | ✅ |
| | Capture idea / journal / save (optional) | `sparkNoteDestinations.ts` | ✅ v1 |
| | Connect to project | Idea flow → Momentum Builder | Partial |
| | Quick / Story / Deep spark types | `sparkType` on catalog entries | ✅ catalog; user depth picker future |
| | Seasonal personality | `seasonalPersonality.ts` | ✅ |
| | Business + personal spark modes | Category mix in `catalog.ts` | ✅ |
| | Admin CMS / visual shelf | — | Future |

Split detail protocols: [Intelligence System](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) · [Daily Engine](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) · [Delight Expansion](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md)

---

This document combines the complete Spark Note™ system specifications into one source-of-truth file.

Spark Note™ is a daily companion experience for Spark Studio Companions™.

The purpose is to provide users with one small daily moment of curiosity, encouragement, learning, humor, inspiration, or reflection.

The feeling:

"Spark left me a little surprise today."

Spark Note is not:
- a task
- a reminder
- a notification system
- a menu
- another productivity requirement

It is a companion moment.

---

# Part 1 — Daily Intelligence System

## Experience Architecture

The Spark Note system includes:

1. Spark Note Display Component
2. Daily Spark Selection Engine
3. Spark Content Library
4. Personalization Engine
5. Spark History / Repeat Prevention

Flow:

Spark Content Library
↓
Daily Spark Engine
↓
Personalization Check
↓
Today's Spark Selection
↓
Spark Note Display
↓
User Interaction

---

# Placement

The Spark Note appears on every page.

Location:

- bottom-right corner
- fixed to viewport
- opposite Spark Estate Guide Book™
- same approximate size as Guide Book
- always available
- does not block important content

Layout:

Bottom Left:
Spark Estate Guide Book™

Bottom Right:
Spark Note™

---

# Visual Design

The collapsed Spark Note should feel like:

- a little note left on a desk
- a daily surprise
- a tiny spark of inspiration

Visual style:

- parchment/cream background
- gold border
- teal accents
- Spark Studio Companions™ branding
- soft illustrated style
- rounded corners
- subtle shadow

Required:

- Spark flame icon
- Today's Spark label
- short title
- teaser sentence

Do not use:

- star icons
- notification badges
- dashboard appearance

---

# Expanded Spark Card

When clicked, the Spark Note expands.

The card contains:

## Title

## Category

## The Story

Explain:
- what happened
- who was involved
- background
- unexpected details

## Impact

Explain why it mattered.

Connect to:
- people
- business
- creativity
- culture
- daily life

## Spark Application

Every card connects back to the user.

Examples:

Business:
"What small idea could become something bigger?"

Creativity:
"What experiment could you try without worrying about perfection?"

Personal growth:
"What lesson can you carry forward today?"

---

# Part 2 — Daily Spark Engine

## Daily Selection Process

The system selects one Spark per day.

One day = one featured Spark.

Selection order:

## Priority 1 — Personal Sparks

Check:

- birthday
- anniversaries, milestones, launches, celebrations
- remembrance and gentle-tone dates
- business milestones (`category: business`)
- trips and due dates (`targetDate` today or within 7 days)

Examples:

- Happy Birthday Spark
- Adventure Ahead (upcoming trip)
- Look How Far You Have Come (business anniversary)
- A Meaningful Day (remembrance)

---

## Priority 2 — Date-Based Sparks

Check:

- holidays
- historical events
- invention anniversaries
- famous birthdays
- seasonal events

Only activate on the appropriate date.

---

## Priority 3 — Curated Spark Library

Select from:

- inventions
- innovators
- entrepreneurs
- business lessons
- quotes
- fun facts
- creativity
- unusual holidays

---

# Spark Content Standard

Every Spark entry contains:

- spark_id
- title
- category
- date_rules
- image
- short_teaser
- story
- impact
- spark_application
- tags

---

# Spark Categories

## Amazing Inventions

Include:

- inventor
- invention story
- challenge
- discovery
- impact

## Inspiring People

Include:

- background
- accomplishments
- contribution
- lesson

## Entrepreneurs

Include:

- founder story
- innovation
- company impact
- business lesson

## History

Include:

- event
- people involved
- importance today

## Holidays

Include:

- origin
- meaning
- traditions
- fun application

## Quotes

Include:

- quote
- person
- context
- lesson

## Fun Facts

Include:

- surprising fact
- explanation
- connection

---

# Image Requirements

Each Spark supports:

- primary image
- thumbnail image
- illustration
- future media support

Images should match the story and feel warm and inspiring.

---

# Repeat Prevention

Track:

- viewed Sparks
- saved Sparks
- favorites

Rules:

- do not show the same Spark immediately
- avoid repeated categories
- encourage variety

---

# Part 3 — Delight Experience Expansion

## Spark Learns What Lights People Up

Spark should learn preferences over time.

Track:

- Sparks opened
- Sparks saved
- reactions
- categories enjoyed
- topics revisited

Use this information to personalize future Sparks.

The system learns:

"What creates curiosity for this person?"

---

# Simple Reactions

After viewing:

Offer optional reactions:

🔥 Loved it

😊 Made me smile

💡 Gave me an idea

⭐ Save for later

These provide feedback without creating work.

---

# My Sparks

Create a simple saved collection.

Purpose:

A personal shelf of ideas and inspiration.

Not:

- points
- badges
- complicated gamification

---

# Spark Connections

After viewing, offer optional actions:

💡 Capture an idea

📓 Add to journal

⭐ Save Spark

📌 Connect to project

Never force action.

---

# Spark Depth Levels

## Quick Spark

A short discovery.

## Story Spark

A short story with meaning.

## Deep Spark

A longer exploration.

User chooses depth.

---

# Business Spark Mode

Support entrepreneurs.

Topics:

- founders
- innovation
- customer experience
- leadership
- marketing ideas
- business lessons

Always connect:

"What could this inspire in your business?"

---

# Personal Spark Mode

Support the whole person.

Examples:

- encouragement
- reflection
- creativity
- curiosity
- gratitude

---

# Seasonal Personality

Examples:

Spring:
New beginnings

Summer:
Adventure

Fall:
Learning and reflection

Winter:
Traditions and inspiration

---

# Birthday and Celebration Sparks

Personal moments receive special treatment.

Include:

- celebration
- encouragement
- reflection
- possibility

---

# Long-Term Vision

Spark Note becomes a daily relationship builder.

Not:

"Here is information."

Instead:

"Here is something I thought you might enjoy."

The magic combines:

- curiosity
- personalization
- encouragement
- learning
- imagination

Spark should feel like a companion who leaves little sparks of possibility throughout the day.
