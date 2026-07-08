# Spark Note™ Runtime Integration Protocol

## Purpose

This document defines how Spark Note™ connects to the Spark application so the daily companion experience works reliably.

This protocol converts the Spark Note intelligence design into a functioning application feature.

The goal:

The user sees one beautiful, relevant Spark every day without needing to manage the system.

---

# Runtime Architecture

Spark Note consists of:

1. Spark Note UI Component
2. Spark Content Library
3. Daily Spark Selection Engine
4. User Personalization Layer
5. Spark History Tracking

Flow:

```
User Opens App
        ↓
Load Spark Note Component
        ↓
Check Today's Spark
        ↓
Run Selection Rules
        ↓
Retrieve Spark Content
        ↓
Display Collapsed Spark Note
        ↓
User Opens Card
        ↓
Track Interaction
```

---

# Component Requirements

Create:

## SparkNoteWidget

Responsibilities:

- Display collapsed Spark Note
- Remain fixed on screen
- Open expanded Spark Card
- Show current daily Spark

Placement:

- bottom-right corner
- opposite Spark Estate Guide Book™
- fixed viewport position

---

## SparkCardExpanded

Responsibilities:

Display:

- image
- title
- category
- story
- impact
- Spark Application
- optional reactions

Allow:

- close/collapse
- save
- react

---

# Daily Refresh Logic

The Spark Note changes once per calendar day.

Rules:

- Use user's local timezone
- Keep the same Spark throughout the day
- Do not change every page refresh
- Do not randomly change during a session

Daily process:

```
Check date
      ↓
Check saved Today's Spark
      ↓
If current date matches:
       display existing Spark

If new date:
       select new Spark
       save selection
       display new Spark
```

---

# Spark Selection Logic

Selection priority:

## Priority 1

Personal events:

- birthday
- anniversary
- achievement
- milestone

## Priority 2

Date-based Sparks:

- holidays
- historical events
- invention anniversaries
- seasonal events

## Priority 3

General Spark Library:

Select based on:

- variety
- user interests
- previous reactions
- saved categories

---

# User Personalization

Spark should learn from simple interactions.

Track:

- opened Sparks
- saved Sparks
- reactions
- favorite categories
- ignored categories

Use this information to improve future selections.

Do not require users to complete preferences.

Spark learns naturally.

---

# Data Requirements

Spark records require:

```
spark_id

title

category

image

thumbnail

short_teaser

story

impact

spark_application

tags

date_rules

status
```

---

# User History Tracking

Track:

```
viewed_sparks[]

saved_sparks[]

favorite_categories[]

recent_categories[]

```

Purpose:

- prevent repetition
- personalize future Sparks
- understand interests

---

# Repeat Prevention Rules

The system should avoid:

- same Spark two days in a row
- same category repeatedly
- repeated content too frequently

Prefer:

- variety
- seasonal relevance
- user interests

---

# Error Handling

If no special Spark exists:

Use an active evergreen Spark.

If an image is missing:

Display the Spark without breaking the card.

If content fails:

Display a friendly fallback Spark.

Never show:

- blank cards
- broken images
- technical errors to the user

---

# Mobile Behavior

On mobile:

- keep Spark Note small
- avoid blocking buttons
- allow easy tapping
- expand into readable card format

---

# Future Expansion Support

The architecture should allow:

- more Spark categories
- user-created Sparks
- AI-assisted Spark creation
- sharing Sparks
- journaling from Sparks
- connecting Sparks to projects

Do not require these for initial release.

---

# Separation Rules

Spark Note must remain separate from:

- Estate navigation
- Chamber Member routing
- project management
- creation workflows
- chat routing

Spark Note is a companion layer.

---

# Success Criteria

The system is successful when:

A user opens Spark.

They notice a small flame.

They wonder:

"What is today's Spark?"

They click.

They learn something.

They smile.

They feel encouraged.

The experience feels personal without requiring effort from the user.

---

# Implementation mapping (v1)

| Protocol layer | Module |
|----------------|--------|
| SparkNoteWidget | `components/companion/SparkNoteAnchor.tsx` (alias: `SparkNoteWidget.tsx`) |
| SparkCardExpanded | `components/companion/SparkNoteExpanded.tsx` (alias: `SparkCardExpanded.tsx`) |
| App wiring + portal | `components/companion/SparkNoteChrome.tsx` |
| Companion mount | `app/companion/CompanionPageClient.tsx` |
| Daily selection engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Personal layer | `lib/sparkNote/personalSparks.ts` |
| Library rotation | `lib/sparkNote/librarySelection.ts` |
| Personalization | `lib/sparkNote/preferenceLearning.ts` |
| History + daily record | `lib/sparkNote/persistence.ts` |
| Content library | `spark-library/` → `lib/sparkNote/catalog.ts` |
| Fallback spark | `lib/sparkNote/runtimeIntegration.ts` |
| Destination routing (optional actions) | `lib/sparkNote/sparkNoteDestinations.ts` |
| Styles (mobile + desktop) | `app/companion/spark-note.css` |

## Verify

```bash
npx vitest run lib/sparkNote
```
