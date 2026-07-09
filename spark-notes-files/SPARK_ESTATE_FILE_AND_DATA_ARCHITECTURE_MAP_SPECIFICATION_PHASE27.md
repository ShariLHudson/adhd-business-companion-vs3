# Spark Estate™ File and Data Architecture Map Specification - Phase 27

## Purpose

This document defines where Spark Estate™ information lives and how
different systems share information.

The goal:

Every piece of information has a clear home.

The system should be organized so:

-   data is not duplicated
-   information stays current
-   rooms can work together
-   cards show accurate information
-   memory improves the experience

------------------------------------------------------------------------

# Core Principle

One source of truth.

Information should have one primary owner.

Other areas may reference it, but should not create duplicate copies.

------------------------------------------------------------------------

# Data Architecture Layers

## Layer 1: Member Identity Data

Purpose:

Know who the member is.

Stores:

-   name
-   preferred name
-   language
-   timezone
-   basic profile information
-   business information

Used by:

-   greetings
-   personalization
-   communication

------------------------------------------------------------------------

# Layer 2: Member Preferences

Purpose:

Understand how the member works best.

Stores:

-   communication preferences
-   learning preferences
-   visual preferences
-   planning preferences
-   support preferences

Used by:

-   conversation engine
-   cards
-   workflows

------------------------------------------------------------------------

# Layer 3: Goals and Vision

Purpose:

Understand what matters.

Stores:

-   goals
-   priorities
-   desired outcomes
-   long-term direction

Used by:

-   recommendations
-   planning
-   progress support

------------------------------------------------------------------------

# Layer 4: Projects

Purpose:

Store active and completed work.

Stores:

-   project name
-   purpose
-   outcome
-   milestones
-   tasks
-   next actions
-   status
-   completion history

Primary owner:

Goals & Projects™

Connected to:

-   Momentum
-   wins
-   memory

------------------------------------------------------------------------

# Layer 5: Conversations

Purpose:

Maintain continuity.

Stores:

-   important discussions
-   decisions
-   context
-   member preferences discovered naturally

Do not store:

Every temporary conversation detail.

Store what improves future support.

------------------------------------------------------------------------

# Layer 6: Cards

Cards are generated from approved data sources.

## Spark Card™

Uses:

-   discovery library
-   member interests
-   meaningful dates
-   gratitude and meaning content

------------------------------------------------------------------------

## Momentum Card™

Uses:

-   active projects
-   next actions
-   progress
-   goals

------------------------------------------------------------------------

## Knowledge Card™

Uses:

-   knowledge library
-   learning needs
-   current context

------------------------------------------------------------------------

## Win Card™

Uses:

-   completed work
-   milestones
-   accomplishments

------------------------------------------------------------------------

# Layer 7: Knowledge Library

Stores:

-   frameworks
-   templates
-   strategies
-   examples
-   guides
-   reference materials

Used by:

-   rooms
-   workflows
-   conversations

------------------------------------------------------------------------

# Layer 8: Member-Created Assets

Stores:

Things created by the member:

-   emails
-   funnels
-   strategies
-   documents
-   templates
-   plans
-   projects

Each asset should have:

-   owner
-   creation date
-   related project
-   version history

------------------------------------------------------------------------

# Layer 9: Memory System

Purpose:

Help Spark improve over time.

Stores:

-   successful approaches
-   patterns
-   preferences
-   important wins
-   lessons learned

Memory should be:

-   useful
-   editable
-   purposeful

------------------------------------------------------------------------

# Layer 10: Analytics

Stores:

-   feature usage
-   workflow completion
-   friction points
-   improvement signals

Analytics should improve the experience.

------------------------------------------------------------------------

# Temporary vs Permanent Data

## Temporary

Examples:

-   current conversation state
-   unsaved drafts
-   session information

Purpose:

Support current activity.

------------------------------------------------------------------------

## Permanent

Examples:

-   profile
-   projects
-   saved assets
-   meaningful memories
-   preferences

Purpose:

Improve future experiences.

------------------------------------------------------------------------

# Room Data Rules

Each room owns:

-   room identity
-   expertise
-   workflows
-   room-specific settings

Each room can access:

-   member context
-   shared memory
-   approved knowledge

Rooms should not create duplicate member profiles or separate memories.

------------------------------------------------------------------------

# Data Flow Example

Member creates a funnel.

Marketing Room:

Creates funnel content.

↓

Saved as member asset.

↓

Connected to project if needed.

↓

Momentum tracks progress.

↓

Completion creates a win.

↓

Memory learns successful approaches.

------------------------------------------------------------------------

# Export and Save Rules

Created work should support:

-   save in Spark Estate™
-   export
-   print
-   share when available

The member should always know where their work lives.

------------------------------------------------------------------------

# Data Quality Rules

Before adding new data:

Ask:

1.  Who owns this information?
2.  Why is it stored?
3.  Who uses it?
4.  Does it improve the member experience?

------------------------------------------------------------------------

# Final Vision

Spark Estate™ information should behave like an organized ecosystem.

Every piece has a home.

Every room can access what it needs.

The member experiences one intelligent companion.
