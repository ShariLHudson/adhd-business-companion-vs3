# Spark Note™ Content Library Master Standard

## Purpose

This document defines how Spark Note™ content is created, organized, stored, and expanded.

The Spark Note Card is the consistent experience.

The Content Library is the intelligence behind it.

The system should be able to grow from a small launch library into thousands of Sparks without changing the card design or application logic.

---

# Core Principle

Spark Note is not a random fact generator.

Every Spark must provide:

1. Curiosity
2. Learning
3. Meaning
4. Connection

A successful Spark makes the user think:

- "I did not know that."
- "That is interesting."
- "That connects to my life."
- "That gave me an idea."

---

# Library Architecture

Organize Sparks by category.

Example:

```
Spark Library

├── Inventions
├── Inspiring People
├── Entrepreneurs
├── Business Lessons
├── History
├── Holidays
├── Creativity
├── Fun Facts
├── Personal Growth
└── Seasonal Sparks
```

---

# Spark ID System

Every Spark receives a permanent ID.

Format:

```
SPARK-[CATEGORY]-[NUMBER]
```

Examples:

```
SPARK-INV-001
SPARK-PER-001
SPARK-BIZ-001
SPARK-HOL-001
```

Never reuse IDs.

Archived Sparks remain in the system.

---

# Spark Content Record

Every Spark must contain:

```
spark_id

title

category

subcategory

image

thumbnail

short_teaser

story

impact

spark_application

tags

date_rules

audience

status
```

---

# Field Definitions

## Title

Short, interesting, and curiosity-driven.

Examples:

- The Accidental Invention of the Post-it Note
- The Woman Who Changed Computing
- The Small Company That Changed Coffee

---

## Category

Primary classification.

Allowed categories:

### Inventions

Stories about:
- inventions
- discoveries
- accidental breakthroughs
- technology

### Inspiring People

Stories about:
- innovators
- creators
- leaders
- change makers

### Entrepreneurs

Stories about:
- founders
- businesses
- turning points
- innovation

### Business Lessons

Stories about:
- customer experience
- leadership
- marketing
- strategy
- creativity

### History

Stories about:
- important moments
- discoveries
- firsts
- cultural events

### Holidays

Stories about:
- unusual holidays
- traditions
- celebrations

### Creativity

Stories about:
- artists
- creative thinking
- imagination
- problem solving

### Fun Facts

Stories about:
- surprising information
- unusual discoveries
- interesting connections

### Personal Growth

Stories about:
- courage
- resilience
- learning
- possibility

---

# Spark Writing Structure

Every Spark follows the same storytelling format.

## The Spark

The interesting idea.

Example:

"A failed experiment became one of the world's most popular office tools."

---

## The Story

Explain:

- who
- what
- when
- how
- unexpected details

The story should feel conversational.

Avoid textbook writing.

---

## Why It Matters

Explain the impact.

Connect to:

- everyday life
- business
- creativity
- personal growth
- innovation

---

## Spark It

Every Spark ends with a connection.

Examples:

Business:

"What problem in your business might have another solution?"

Creativity:

"What idea deserves another chance?"

Growth:

"What lesson can you carry into today?"

---

# Content Quality Standards

Before adding a Spark, ask:

## Curiosity Test

Would someone want to open this card?

## Story Test

Is there an interesting story?

## Connection Test

Can the user apply it?

## Simplicity Test

Can someone understand it quickly?

## Spark Test

Does it create a positive feeling or idea?

---

# Image Standards

Every Spark should support visuals.

Required:

- primary image
- thumbnail image

Images should:

- match the story
- create interest
- support understanding
- fit Spark brand style

Avoid:

- unrelated images
- clutter
- confusing visuals

---

# Date Rules

Some Sparks are always available.

Example:

```
date_rule:
evergreen
```

Some Sparks appear on specific dates.

Examples:

```
date_rule:
December 25
```

or:

```
date_rule:
first_day_of_spring
```

---

# Status System

Every Spark has a status.

## Draft

Created but unavailable.

## Review

Being checked.

## Active

Available for users.

## Archived

Removed from rotation but preserved.

---

# User Personalization Tags

Add tags to help Spark learn preferences.

Examples:

```
innovation
creativity
business
leadership
humor
history
technology
entrepreneurship
resilience
curiosity
```

The system uses tags to improve future selections.

---

# Library Balance

Maintain variety.

Recommended balance:

25% Inventions

20% Inspiring People

15% Entrepreneurs

15% Business Lessons

10% History

5% Holidays

5% Fun Facts

5% Personal Growth

Adjust based on user engagement.

---

# Adding New Sparks

New content should not require code changes.

Process:

```
Create Spark
      ↓
Assign ID
      ↓
Choose Category
      ↓
Write Story
      ↓
Add Images
      ↓
Add Tags
      ↓
Set Date Rules
      ↓
Publish
```

The Daily Spark Engine automatically considers active Sparks.

---

# Future Expansion

The library should support:

- AI-assisted Spark creation
- user-created Sparks
- community Sparks
- saved Sparks
- favorite categories
- business-specific Sparks
- personalized learning paths

---

# Final Goal

The Spark Library should become a growing collection of:

- stories
- ideas
- inventions
- people
- lessons
- moments

The goal is not to provide more information.

The goal is to create more moments where people feel:

"I learned something."
"I got an idea."
"I feel inspired."
