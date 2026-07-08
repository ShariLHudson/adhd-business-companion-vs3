# Spark Note™ Daily Engine Implementation Specification

## Purpose

This document defines how Spark Note™ cards are created, selected, stored, displayed, and changed every day.

The Spark Note is the daily inspiration engine behind Spark Studio Companions™.

The experience goal:

The user opens Spark and finds one meaningful, interesting, or encouraging Spark waiting for them.

---

# System Responsibilities

The Spark Note system must:

1. Store Spark Card content
2. Select one Spark each day
3. Check personal dates and special events
4. Prevent repetitive content
5. Display the correct card
6. Support future expansion

---

# Daily Selection Process

Every day, the system runs the Spark selection process.

Order:

## Step 1 — Personal Check

Check the user's profile for:

- birthday
- anniversaries
- achievements
- milestones
- saved celebrations

If a personal event exists:

Create or select a Personal Spark.

Examples:

- Happy Birthday Spark
- Celebrate Your Business Anniversary
- Congratulations on a Milestone

Personal moments have priority.

---

## Step 2 — Date-Based Check

Check the current date.

Look for:

- holidays
- historical events
- invention anniversaries
- famous birthdays
- seasonal events

Only activate date-specific Sparks on appropriate dates.

Examples:

July 4:
- Independence Day Spark

February:
- Black History Month learning Spark

December:
- Holiday Spark

---

## Step 3 — Curated Spark Library

If no special date applies, select from the Spark Library.

Selection should consider:

- variety
- previous views
- user interests
- business relevance
- personal growth relevance

---

# Spark Card Content Model

Every Spark Card must contain:

## Identification

spark_id

Example:

SPARK-INV-001

---

## Category

Examples:

- Invention
- Inventor
- Entrepreneur
- Business Lesson
- History
- Holiday
- Fun Fact
- Quote
- Creativity
- Personal Growth

---

## Display Information

Required:

title

short_title

thumbnail_image

short_teaser

Example:

Title:

The Post-it® Note

Teaser:

A failed experiment became a worldwide productivity tool.

---

## Story Content

Every Spark needs a story.

Structure:

### What Happened?

Explain the background.

### Why Is It Interesting?

Explain the unusual or surprising part.

### Why Does It Matter?

Explain the impact.

---

## Spark Application

Every card connects to the user's life.

Examples:

Business:

"What idea deserves another chance?"

Creativity:

"What could you create if perfection was not required?"

Growth:

"What lesson can you carry forward?"

---

# Content Categories

## Inventions

Include:

- inventor
- invention process
- challenge
- discovery
- impact

---

## Inventors

Include:

- person background
- accomplishments
- obstacles
- contribution

---

## Entrepreneurs

Include:

- founder story
- company impact
- innovation
- business lesson

---

## History

Include:

- event
- people involved
- why it mattered
- connection today

---

## Holidays

Include:

- origin
- meaning
- traditions
- fun application

---

## Quotes

Include:

- quote
- speaker
- background
- lesson

---

## Fun Facts

Include:

- surprising information
- explanation
- connection

---

# Image Requirements

Each Spark Card supports:

- primary image
- thumbnail image
- illustration
- optional future media

Images should:

- match the story
- feel warm and inspiring
- support the card topic

---

# Repeat Prevention

The system tracks:

- viewed cards
- saved cards
- favorites

Rules:

Do not:

- show the same card two days in a row
- overuse the same category repeatedly

Prefer:

- variety
- curiosity
- seasonal relevance

---

# User Actions

Future-ready actions:

User can:

- open Spark Card
- save Spark
- share Spark
- create journal entry
- connect Spark to an idea
- connect Spark to a project

Do not require these for first release.

---

# Content Management

New Spark Cards should be added without changing application logic.

The system should support adding:

- new categories
- new cards
- new images
- date rules

The content library should grow over time.

---

# Example Spark Card

## Title

The Post-it® Note

## Category

Invention

## Story

A scientist attempting to create a strong adhesive accidentally created a reusable adhesive.

That discovery later became the Post-it® Note.

## Impact

A mistake became one of the world's most popular tools for organization and creativity.

## Spark Application

What idea have you dismissed that may simply need a different purpose?

---

# Technical Architecture

Separate:

Content:
Spark Card Library

Logic:
Daily Spark Engine

Display:
Spark Note Component

Personalization:
User Profile Integration

---

# Success Criteria

The system should create the feeling:

"Spark knows how to surprise and encourage me."

Every day:

- one Spark appears
- it is relevant
- it feels intentional
- it teaches something
- it connects back to the user's life

---

# Runtime Implementation (v1)

**Status: Implemented** — see also [Daily Experience Protocol](SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md).

## Architecture

| Spec layer | Module |
|------------|--------|
| Content — Spark Card Library | `lib/sparkNote/catalog.ts` ← `spark-library/manifest.json` |
| Logic — Daily Spark Engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Personal check (Step 1) | `lib/sparkNote/personalSparks.ts` |
| Date-based check (Step 2) | `evaluateDailySparkNote.ts` + `seasonalPersonality.ts` |
| Curated library (Step 3) | `librarySelection.ts` + `preferenceLearning.ts` |
| Repeat prevention | `persistence.ts`, `librarySelection.ts` |
| Display | `SparkNoteChrome`, `SparkNoteAnchor`, `SparkNoteExpanded` |

## Daily selection order

1. **Personal** — birthday; today's saved dates (celebration, reflection, remembrance, business milestones); membership anniversary; then major upcoming personal events within 7 days (trips, workshops, due dates)
2. **Date-based** — `monthDay` holidays/history, `months` seasonal months, `seasons` personality sparks
3. **Curated library** — affinity-weighted rotation with cooldowns, yesterday exclusion, and recent-category variety

## Content model mapping

| Spec field | Runtime field |
|------------|---------------|
| `spark_id` | `id` |
| `title` / `short_title` | `title` / `shortTitle` |
| `short_teaser` | `teaser` |
| What Happened | `whatHappened` |
| Why Is It Interesting | `whyInteresting` |
| Why Does It Matter | `whyItMatters` |
| Spark Application | `sparkApplication` |
| `thumbnail_image` / primary image | `thumbnailSrc` / `imageSrc` |

## Repeat prevention (v1)

- Same card not shown on consecutive days when alternatives exist
- Categories from the last two selections are avoided when alternatives exist
- Per-spark cooldown (`lastShownById`)
- Passed categories deprioritized via `ignoredCategories` affinity scoring
- Viewed, saved, and favorite tracking in `persistence.ts`

## Verify

```bash
npx vitest run lib/sparkNote
```
