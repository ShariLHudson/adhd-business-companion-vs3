# Spark Note™ Selection Intelligence Rules Protocol

## Purpose

This document defines how Spark Note™ decides which Spark to show each
day.

The goal is not to choose the most interesting information.

The goal is to choose the most meaningful moment for this person today.

Spark should answer:

"What would make today's Spark feel thoughtful, relevant, and valuable?"

------------------------------------------------------------------------

# Core Selection Principle

Spark balances four things:

1.  Meaning
2.  Timing
3.  Personal relevance
4.  Variety

The system should not simply pick randomly.

It should choose intentionally.

------------------------------------------------------------------------

# Daily Selection Priority

The system evaluates Sparks in this order:

    Priority 1:
    Personal Meaningful Moments

    Priority 2:
    Personal Upcoming Events

    Priority 3:
    Special Calendar Events

    Priority 4:
    User Interests

    Priority 5:
    General Discovery Sparks

------------------------------------------------------------------------

# Priority 1 --- Personal Meaningful Moments

These always receive the highest priority.

Examples:

-   birthday
-   anniversary
-   remembrance date
-   important milestone
-   personal achievement
-   meaningful life event

Reason:

A personal moment matters more than a general fact.

Example:

If today is someone's birthday, do not show:

"Interesting invention from history"

Show:

"Happy Birthday Spark"

------------------------------------------------------------------------

# Priority 2 --- Upcoming Personal Events

Examples:

-   upcoming trip
-   presentation
-   launch
-   appointment
-   family event
-   goal date

The tone depends on the event.

Examples:

Trip: Excitement and anticipation

Important meeting: Encouragement and confidence

New beginning: Possibility and support

------------------------------------------------------------------------

# Priority 3 --- Calendar-Based Sparks

If no personal event exists, check:

-   holidays
-   historical events
-   invention anniversaries
-   seasonal moments
-   famous birthdays

Examples:

Holiday: Fun and informative

Historical event: Story and meaning

Seasonal: Reflection or inspiration

------------------------------------------------------------------------

# Priority 4 --- User Personalization

If no date-based Spark applies, use what Spark has learned.

Consider:

-   categories opened
-   Sparks saved
-   reactions
-   favorite topics
-   ignored topics

Example:

User frequently enjoys:

-   inventions
-   founders
-   creativity

Increase those categories.

------------------------------------------------------------------------

# Priority 5 --- General Discovery

When no stronger match exists:

Select from the full Spark library.

Maintain variety.

Possible categories:

-   invention
-   inspiring person
-   business
-   creativity
-   fun fact
-   history
-   gratitude
-   innovation

------------------------------------------------------------------------

# Conflict Resolution

Sometimes multiple Sparks qualify.

Example:

A user's birthday is also a national holiday.

Selection order:

    Personal event
    beats
    Holiday

    Holiday
    beats
    General Spark

Personal meaning always wins.

------------------------------------------------------------------------

# Tone Selection Rules

The same topic can require different tones.

The system considers:

## Celebration

Use:

-   joyful
-   warm
-   encouraging

Examples:

Birthday Achievement

------------------------------------------------------------------------

## Curiosity

Use:

-   interesting
-   playful
-   surprising

Examples:

Fun facts Inventions

------------------------------------------------------------------------

## Reflection

Use:

-   thoughtful
-   calm
-   meaningful

Examples:

Anniversaries Life transitions

------------------------------------------------------------------------

## Support

Use:

-   gentle
-   compassionate
-   respectful

Examples:

Difficult dates Loss reminders

------------------------------------------------------------------------

# Variety Rules

Avoid:

-   same category repeatedly
-   same topic too often
-   similar Sparks back-to-back

Balance:

Example:

Monday: Business

Tuesday: Fun Fact

Wednesday: Invention

Thursday: Personal Growth

Friday: Inspiring Person

------------------------------------------------------------------------

# User Learning Rules

Spark learns gradually.

Strong signals:

1.  Saved Spark
2.  "Loved it"
3.  "Gave me an idea"
4.  Repeated viewing

Weak signals:

-   opening once
-   scrolling past

Do not over-personalize too quickly.

Allow discovery.

------------------------------------------------------------------------

# Never Do Rules

Spark should never:

-   overwhelm with choices
-   show multiple cards at once
-   repeat the same Spark constantly
-   force interaction
-   make every Spark about productivity
-   assume what a user needs emotionally

------------------------------------------------------------------------

# The Final Daily Decision

The engine asks:

    Is there something meaningful happening today?
            |
            Yes
            |
    Create personal Spark

            No

    Is there something interesting about today?
            |
            Yes
            |
    Create date-based Spark

            No

    What would this person enjoy discovering today?
            |
    Create personalized Spark

------------------------------------------------------------------------

# Success Definition

The perfect Spark feels like:

"I did not expect that."

or

"That was exactly what I needed today."

The user should never think:

"The app randomly picked this."

The experience should feel thoughtful, personal, and alive.
