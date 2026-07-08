# Spark Note™ Daily Intelligence System Protocol

## Purpose

Create the Spark Note™ daily companion experience for Spark Studio Companions™.

The Spark Note is a small daily moment of curiosity, encouragement, learning, humor, and inspiration.

The goal:

"Spark leaves a little idea waiting for me each day."

The Spark Note is not:
- a task
- a reminder
- a notification system
- a menu
- a productivity requirement

It is a daily companion moment.

---

# Experience Architecture

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
- never blocks important content

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

The expanded card contains:

- Title
- Category
- Story
- Impact
- Spark Application

Every card should connect the idea back to the user's life, creativity, business, or growth.

---

# Daily Spark Selection Engine

The system selects one Spark per day.

Priority order:

1. Personal Sparks
- birthday
- anniversary
- achievements
- milestones

2. Date-Based Sparks
- holidays
- historical events
- invention anniversaries

3. Curated Spark Library
- inventions
- innovators
- entrepreneurs
- business lessons
- quotes
- fun facts
- creativity

---

# Spark Categories

## Amazing Inventions
Include:
- inventor
- invention story
- unexpected moment
- world impact
- application

## Inspiring People
Include:
- background
- accomplishments
- impact
- lesson

## Business Sparks
Include:
- person/company
- innovation
- challenge
- impact
- business lesson

## Fun Holidays
Include:
- origin
- meaning
- fun application

## Quotes
Include:
- quote
- person
- context
- application

## Fun Facts
Include:
- interesting fact
- explanation
- why it matters

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

# Repeat Prevention

Track:
- last viewed Sparks
- favorites
- completed Sparks

Rules:
- Do not repeat immediately
- Avoid frequent repeats
- Prefer variety

---

# Personalization

If today matches a personal date:

Birthday:
Show Happy Birthday Spark.

Include:
- celebration
- encouragement
- reflection
- future possibilities

Support future milestones:
- business launches
- completed projects
- customer wins
- achievements

---

# Technical Requirements

Create:

Components:
- SparkNoteWidget
- SparkCardExpanded

Support:
- daily content changes
- date-based content
- user personalization
- image support
- expanded/collapsed states

Keep separate from:
- Estate navigation
- Chamber Members
- Projects
- Creation workflows
- Chat routing

---

# Success Criteria

The user opens Spark.

They see a small flame in the corner.

They think:

"What little surprise does Spark have for me today?"

They click.

They learn something.

They smile.

They find a connection to their own life or business.

The experience feels personal, curious, and uniquely Spark.

---

# Runtime Implementation (v1)

**Status: Implemented** — see [Daily Experience Protocol](SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md) and [Daily Engine Spec](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md).

## Experience architecture

| Protocol layer | Implementation |
|----------------|----------------|
| Spark Note Display | `SparkNoteChrome.tsx` (portaled to `document.body`) |
| Collapsed widget | `SparkNoteAnchor.tsx` / `SparkNoteWidget.tsx` |
| Expanded card | `SparkNoteExpanded.tsx` / `SparkCardExpanded.tsx` |
| Daily Spark Engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Spark Content Library | `spark-library/` → `lib/sparkNote/catalog.ts` |
| Personalization | `lib/sparkNote/personalSparks.ts` + recognition store |
| History / repeat prevention | `lib/sparkNote/persistence.ts`, `librarySelection.ts` |

## Placement (companion)

- Fixed **bottom-right** viewport chrome — opposite Spark Estate Guide Book™ (bottom-left)
- Visible whenever `SparkNoteChrome` is shown (`overlay !== signin"`, not in Just Be Here)
- Wired in `CompanionPageClient.tsx` with birthday, personal dates, and member-since
- Separate from estate navigation, chat routing, and creation workflows

## Visual design (collapsed)

| Spec | Implementation |
|------|----------------|
| Parchment / cream background | `app/companion/spark-note.css` (`--spark-note-parchment`) |
| Gold border | `--spark-note-gold` |
| Teal accents | `--spark-note-teal` |
| Spark flame icon | `SparkFlameIcon.tsx` |
| Today's Spark label | `SparkNoteAnchor` |
| Short title + teaser | `shortTitle`, `teaser` |
| No notification badges | No badge UI on anchor |

## Expanded card sections

| Spec | Section |
|------|---------|
| Title | `SparkNoteExpanded` hero |
| Category | `categoryLabel` pill |
| Story | What Happened? (+ optional Why Interesting) |
| Impact | Why It Matters |
| Spark Application | Spark It Into Your Life |

## What Spark Note is not (enforced by design)

- Not a task list, reminder, or notification — no badges, counts, or urgency copy on the anchor
- Not a menu — single daily card; optional gentle actions only after expand
- Not required — user chooses to open; no push prompts

## Verify

```bash
npx vitest run lib/sparkNote components/companion/SparkNoteAnchor.test.tsx
```
