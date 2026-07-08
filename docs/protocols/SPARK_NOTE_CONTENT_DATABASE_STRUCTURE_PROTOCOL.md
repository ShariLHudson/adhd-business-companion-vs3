# Spark Note™ Content Database Structure Protocol

## Purpose

This document defines how Spark Note™ content is stored so the
application can load, select, personalize, and display daily Sparks.

This is the bridge between:

Spark Intelligence + Spark Content Libraries + Spark Runtime

The goal:

Create a scalable content system where new Sparks can be added without
changing application code.

------------------------------------------------------------------------

# Core Principle

The Spark Card design stays the same.

The database content changes.

The system should be able to grow from:

-   50 Sparks to
-   thousands of Sparks

without rebuilding the feature.

------------------------------------------------------------------------

# Storage Structure

Recommended organization:

    spark-library/

    ├── inventions/
    ├── innovation/
    ├── entrepreneurs/
    ├── small-business/
    ├── inspiring-people/
    ├── creativity/
    ├── fun-facts/
    ├── personal-growth/
    ├── gratitude/
    ├── adhd-friendly/
    ├── holidays/
    ├── personal-events/
    └── quotes/

------------------------------------------------------------------------

# Spark Record Format

Every Spark record should contain:

``` json
{
  "spark_id": "SPARK-INV-001",
  "title": "The Post-it Note",
  "category": "Invention",
  "subcategory": "Accidental Discovery",
  "audience": [
    "Everyone",
    "Entrepreneurs"
  ],
  "image": "post-it-note.png",
  "thumbnail": "post-it-note-thumb.png",
  "short_teaser": "A failed experiment became a worldwide invention.",
  "story": "Story content here.",
  "impact": "Why it matters.",
  "spark_application": "Reflection question.",
  "tags": [
    "innovation",
    "creativity"
  ],
  "date_rules": {
    "type": "evergreen"
  },
  "tone": "curious",
  "status": "active"
}
```

------------------------------------------------------------------------

# Required Fields

## spark_id

Permanent identifier.

Never reuse IDs.

Examples:

SPARK-INV-001

SPARK-BIZ-001

SPARK-GROW-001

------------------------------------------------------------------------

## Title

Short and curiosity-based.

The title appears on the card.

------------------------------------------------------------------------

## Category

Used by the selection engine.

Examples:

-   Invention
-   Business
-   Creativity
-   History
-   Gratitude
-   Personal Growth

------------------------------------------------------------------------

## Audience

Allows future personalization.

Examples:

-   Entrepreneurs
-   Creators
-   Everyone
-   Leaders
-   Learners

------------------------------------------------------------------------

## Images

Each Spark supports:

-   thumbnail
-   expanded image

If no image exists:

Use a branded fallback image.

Never show broken images.

------------------------------------------------------------------------

## Story Fields

Every Spark contains:

### Story

What happened?

### Impact

Why does it matter?

### Spark Application

How does it connect to the user?

------------------------------------------------------------------------

# Date Rules

Date-based Sparks include rules.

Examples:

Evergreen:

``` json
{
"type":"evergreen"
}
```

Specific date:

``` json
{
"type":"specific_date",
"date":"01-09"
}
```

Season:

``` json
{
"type":"season",
"value":"spring"
}
```

Personal:

``` json
{
"type":"personal_event"
}
```

------------------------------------------------------------------------

# Tone Field

Every Spark has a tone.

Examples:

    curious

    playful

    celebratory

    reflective

    encouraging

    supportive

Tone helps the system match the user's day.

------------------------------------------------------------------------

# Personalization Data

The system tracks:

    viewed_sparks

    saved_sparks

    favorite_categories

    favorite_tags

    reactions

    ignored_categories

Use this to improve future selection.

------------------------------------------------------------------------

# Daily Spark Record

The selected daily Spark should be stored.

Example:

    user_id

    date

    spark_id

    selected_reason

    viewed

    saved

    reaction

Purpose:

-   prevent repeats
-   analyze engagement
-   improve recommendations

------------------------------------------------------------------------

# Admin Content Workflow

Adding a new Spark:

    Create Spark Record

            ↓

    Add Category

            ↓

    Add Story

            ↓

    Add Images

            ↓

    Add Tags

            ↓

    Set Date Rules

            ↓

    Set Status Active

            ↓

    Available to Selection Engine

------------------------------------------------------------------------

# Launch Requirements

Initial launch library:

Minimum:

-   5 inventions
-   5 business Sparks
-   5 inspiring people
-   5 fun facts
-   5 creativity Sparks
-   5 personal growth Sparks
-   5 gratitude Sparks
-   5 ADHD-friendly Sparks

Recommended:

35-50 quality Sparks.

------------------------------------------------------------------------

# Future Expansion

The database should support:

-   AI-generated drafts
-   human review
-   user-created Sparks
-   shared Sparks
-   community libraries
-   seasonal collections
-   business-specific collections

------------------------------------------------------------------------

# Final Architecture

    Spark Content Database

            ↓

    Selection Intelligence

            ↓

    Daily Spark Choice

            ↓

    Spark Card Template

            ↓

    User Experience

The content library is the memory.

The selection engine is the brain.

The card is the experience.

Together they create Spark Note™.
