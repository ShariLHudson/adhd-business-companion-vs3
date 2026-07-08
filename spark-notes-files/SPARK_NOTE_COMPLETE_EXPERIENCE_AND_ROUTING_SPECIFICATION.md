# Spark Note™ Complete Experience and Routing Specification

## Purpose

This document is the final implementation guide for Spark Note™.

It defines:

1.  The approved Spark Note™ visual experience
2.  The expanded and collapsed card behavior
3.  User interactions
4.  Where saved information goes
5.  How Spark connects to the rest of the app

This document exists to prevent design drift.

The goal:

Spark Note™ should feel like a small daily gift from a companion.

Not a dashboard. Not an article. Not another task.

The feeling should be:

"Spark left me a little note today."

------------------------------------------------------------------------

# PART 1 --- APPROVED SPARK NOTE™ DESIGN

## Identity

Spark Note™ is:

-   warm
-   curious
-   uplifting
-   simple
-   personal
-   ADHD-friendly

It delivers one meaningful discovery at a time.

------------------------------------------------------------------------

# COLLAPSED CARD

## Location

The collapsed Spark Note appears:

-   bottom-right corner of every page
-   opposite the Spark Estate Guide Book™
-   small and unobtrusive
-   always available but never distracting

It should feel like a small note sitting on the desk.

------------------------------------------------------------------------

## Collapsed Card Appearance

Required elements:

### Spark Flame Icon

Use the approved Spark flame.

Do not replace with:

-   stars
-   generic notification icons
-   unrelated symbols

------------------------------------------------------------------------

### Text

Display:

Today's Spark

Short title

One sentence teaser

Example:

Today's Spark

The Post-it Note

A tiny idea that changed the world.

------------------------------------------------------------------------

# EXPANDED CARD

When clicked:

The card expands.

It remains a Spark Note.

It does NOT become:

-   a webpage
-   an article
-   a large dashboard
-   a content feed

------------------------------------------------------------------------

# Expanded Layout

## Header

Contains:

-   Spark flame
-   Today's Spark
-   category
-   title

------------------------------------------------------------------------

## Main Story

Short section:

WHAT HAPPENED?

Purpose:

Tell the interesting story.

Keep concise.

------------------------------------------------------------------------

## Why It Matters

Purpose:

Explain the impact.

Connect to:

-   life
-   creativity
-   business
-   curiosity

------------------------------------------------------------------------

## Spark It Into Your Life

Purpose:

Help the user connect the idea personally.

Examples:

"What idea deserves another look?"

"What could you try differently?"

"What made you smile today?"

------------------------------------------------------------------------

# User Feedback Section

Label:

HOW DID THIS LAND?

Options:

❤️ Loved it

😊 Made me smile

💡 Gave me an idea

🤔 Made me think

🌱 Encouraged me

😐 Not for me today

These are learning signals.

------------------------------------------------------------------------

# Optional Actions

These are secondary.

## 💡 Capture an Idea

Destination:

Idea Vault

------------------------------------------------------------------------

## 📓 Add to Journal

Destination:

User Journal

------------------------------------------------------------------------

## ⭐ Save Spark

Destination:

My Sparks

------------------------------------------------------------------------

## 🔥 My Sparks

Opens saved Spark collection.

------------------------------------------------------------------------

# PART 2 --- DESTINATION ROUTING

## Save Spark

When user selects:

⭐ Save Spark

Create:

User Saved Spark Record

Contains:

-   user ID
-   spark ID
-   date saved
-   category

Destination:

My Sparks

------------------------------------------------------------------------

# My Sparks

Purpose:

A personal collection of meaningful discoveries.

Categories:

🔥 Favorites

💡 Ideas

📓 Reflections

🚀 Business

🌱 Growth

😂 Fun

📚 Learning

------------------------------------------------------------------------

# Add To Journal

When selected:

Create journal entry.

Store:

-   date
-   spark title
-   spark category
-   user reflection
-   source = Spark Note

Destination:

Journal

------------------------------------------------------------------------

# Capture Idea

When selected:

Create idea record.

Ask:

"Where would you like this idea to go?"

Options:

## Idea Vault

For:

"I want to remember this."

## Chamber of Momentum™

For:

"I want to make this happen."

## Journal

For:

"I want to reflect on this."

------------------------------------------------------------------------

# Gave Me An Idea Flow

Example:

Spark:

"The Post-it Note"

User clicks:

💡 Gave Me An Idea

System asks:

"What would you like to do with this idea?"

Options:

Capture Explore Create Project

------------------------------------------------------------------------

# PART 3 --- SPARK MEMORY

Reactions should help Spark learn the person.

Store:

-   favorite categories
-   favorite topics
-   saved Sparks
-   reactions
-   ignored topics

Use this to improve future selections.

Do not over-personalize too quickly.

Allow discovery.

------------------------------------------------------------------------

# PART 4 --- DAILY SELECTION CONNECTION

Spark Selection follows:

Priority 1:

Personal meaningful dates

Examples:

-   birthday
-   anniversary
-   remembrance
-   milestone

Priority 2:

Upcoming personal events

Examples:

-   trip
-   launch
-   presentation

Priority 3:

Calendar Sparks

Examples:

-   holidays
-   history
-   seasonal moments

Priority 4:

User interests

Priority 5:

General discovery

------------------------------------------------------------------------

# PART 5 --- Content Rules

Every Spark uses the same design.

Content changes.

Categories:

-   inventions
-   innovation
-   entrepreneurs
-   small business
-   inspiring people
-   creativity
-   fun facts
-   personal growth
-   gratitude
-   ADHD-friendly
-   quotes
-   personal moments

------------------------------------------------------------------------

# PART 6 --- Do Not Do Rules

Never:

-   create a different layout for each category
-   make Spark a long article
-   overwhelm with choices
-   create a productivity task feeling
-   replace the flame identity
-   show multiple Sparks at once

------------------------------------------------------------------------

# Final Experience Test

A user should think:

"What is today's little surprise?"

Not:

"What am I supposed to do here?"

Spark Note™ is successful when it feels like:

A thoughtful companion leaving a small note of curiosity, encouragement,
or inspiration.

------------------------------------------------------------------------

# System Architecture

Spark Library

↓

Selection Intelligence

↓

Spark Note Template

↓

User Interaction

↓

My Sparks / Journal / Idea Vault / Momentum

↓

Spark Learns The Person
