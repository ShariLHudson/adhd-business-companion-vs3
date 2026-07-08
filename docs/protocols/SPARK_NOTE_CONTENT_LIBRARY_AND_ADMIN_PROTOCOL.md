# Spark Note™ Content Library and Administration Protocol

## Purpose

This document defines how Spark Note™ content is created, organized, managed, expanded, and maintained.

The Spark Note daily experience depends on having a high-quality library of Sparks that can educate, inspire, encourage, entertain, and create curiosity.

The goal:

Create a growing library of meaningful moments that Spark can share with users every day.

---

# Core Principle

Spark Note is not a random trivia generator.

Every Spark must create a connection.

A great Spark should make the user think:

- "I didn't know that."
- "That is interesting."
- "That reminds me of something in my own life."
- "That gives me an idea."

---

# Spark Content Structure

Every Spark Card must have a consistent structure.

Required fields:

```
spark_id

title

category

subcategory

audience

date_rules

image

thumbnail

short_teaser

story

impact

spark_application

tags

status
```

---

# Field Definitions

## Spark ID

Permanent unique identifier.

Examples:

SPARK-INV-001

SPARK-BIZ-001

SPARK-HIST-001

Never reuse IDs.

---

## Title

The main name of the Spark.

Examples:

The Post-it® Note

Walt Disney

The First Computer Mouse

National Donut Day

---

## Category

Primary classification.

Allowed categories:

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

## Subcategory

Additional organization.

Examples:

Invention:
- accidental discoveries
- technology
- household products

Business:
- customer experience
- leadership
- innovation

History:
- discoveries
- milestones
- firsts

---

## Audience

Who benefits most.

Examples:

- Everyone
- Entrepreneurs
- Creators
- Leaders
- Learners
- Personal Growth

---

## Date Rules

Defines when a Spark should appear.

Examples:

Always available:

```
date_rule:
evergreen
```

Specific date:

```
date_rule:
July 20
```

Seasonal:

```
date_rule:
December
```

---

# Content Requirements

Every Spark must include:

## Short Teaser

A sentence that creates curiosity.

Example:

"A failed experiment became one of the world's favorite productivity tools."

---

## Story

The story behind the Spark.

Include:

- what happened
- who was involved
- unexpected details
- why it matters

---

## Impact

Explain the larger meaning.

Connect to:

- business
- creativity
- innovation
- personal growth
- everyday life

---

## Spark Application

Every Spark must include a connection question or reflection.

Examples:

Business:

"What idea could you revisit with a different perspective?"

Creativity:

"What mistake might actually contain a new possibility?"

Growth:

"What lesson can you carry into today?"

---

# Content Quality Standards

Before adding a Spark, evaluate:

## Curiosity Test

Would someone want to know more?

## Connection Test

Can the user relate it to their own life?

## Simplicity Test

Can the idea be understood quickly?

## Inspiration Test

Does it create a positive thought, idea, or emotion?

---

# Content Balance

The library should maintain variety.

Recommended balance:

- 25% Inventions
- 20% Inspiring People
- 15% Business Sparks
- 15% History
- 10% Holidays
- 10% Fun Facts
- 5% Reflection Sparks

Do not allow one category to dominate.

---

# Image Standards

Every Spark should support visual storytelling.

Required:

- thumbnail image
- expanded image

Images should:

- match the topic
- feel warm and engaging
- support understanding
- fit Spark brand style

Avoid:

- generic stock images
- confusing visuals
- unrelated decoration

---

# Adding New Sparks

New Sparks should be added without changing application code.

Process:

```
Create Spark
      ↓
Assign category
      ↓
Add story
      ↓
Add images
      ↓
Add tags
      ↓
Set date rules
      ↓
Publish
```

The Daily Spark Engine automatically considers new active Sparks.

---

# Spark Status

Each Spark has a status:

Draft

Not available to users.

Review

Being checked.

Active

Available for selection.

Archived

No longer selected but preserved.

---

# Administration Rules

Administrators should be able to:

- add Sparks
- edit Sparks
- activate Sparks
- schedule Sparks
- retire Sparks
- view usage

without changing code.

---

# Future AI Spark Creation

The system should support future AI-assisted creation.

Example:

User/Admin:

"Create a Business Spark about Sara Blakely."

AI creates:

- title
- category
- story
- impact
- application question
- tags

Human review happens before publishing.

---

# Personalization Tags

Sparks may include tags:

Examples:

- creativity
- innovation
- entrepreneurship
- resilience
- leadership
- courage
- curiosity
- productivity

The system uses tags to learn user interests.

---

# Long-Term Vision

The Spark Library becomes a growing collection of:

- stories
- inventions
- people
- ideas
- lessons
- moments

Spark is not just delivering information.

Spark is creating daily opportunities for curiosity, reflection, and inspiration.

The library should grow into a resource that feels personal because it learns what creates a spark for each person.
