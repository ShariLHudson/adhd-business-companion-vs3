# Spark Note™ and Room Navigation Fix Request

## Purpose

Fix current interaction issues without redesigning existing features.

This document addresses two immediate demo-blocking issues:

1.  Spark Note™ card does not open when clicked.
2.  Welcome Home room navigation needs to be restored with a Wander
    option.

Do not add unrelated features.

Do not redesign approved experiences.

------------------------------------------------------------------------

# 1. Spark Note™ Card Click Fix

## Current Problem

The Spark Note™ card is visible, but clicking/tapping it does not open
the expanded Spark experience.

------------------------------------------------------------------------

## Required Fix

Make the entire Spark Note™ card interactive.

Clicking anywhere on the card should:

-   open the expanded Spark Note™ view
-   display the full Spark content
-   preserve the approved Spark Note™ design

The card should not require clicking only a small button area.

------------------------------------------------------------------------

## Expanded Spark Note™ Requirements

The expanded view should include:

-   Spark flame icon
-   Today's Spark label
-   category
-   title
-   image
-   short story
-   why it matters
-   Spark It reflection

Include:

## How Did This Land?

Options:

-   ❤️ Loved it
-   😊 Made me smile
-   💡 Gave me an idea
-   🤔 Made me think
-   🌱 Encouraged me
-   😐 Not for me today

------------------------------------------------------------------------

## Spark Actions

### ⭐ Save Spark

Destination:

My Sparks

------------------------------------------------------------------------

### 📓 Add to Journal

Destination:

User Journal

------------------------------------------------------------------------

### 💡 Gave Me An Idea

Destination:

Ask user where the idea should go:

-   Idea Vault
-   Chamber of Momentum™
-   Journal

------------------------------------------------------------------------

## Spark Debug Checklist

Check:

-   click handler exists
-   card is not blocked by another element
-   z-index allows interaction
-   pointer events are enabled
-   modal/open state works
-   desktop and mobile behavior work

Do not change the approved card design.

------------------------------------------------------------------------

# 2. Restore Welcome Home Room Navigation

## Current Problem

The Welcome Home button in the upper-right corner no longer works as the
main room navigation control.

------------------------------------------------------------------------

## Required Behavior

The Welcome Home button should open the room dropdown.

The dropdown should provide access to:

-   available rooms/spaces
-   current room indicator
-   Wander option

------------------------------------------------------------------------

# 3. Wander Feature

## Purpose

Wander allows users to explore Spark Estate™ spaces without choosing a
specific destination.

Wander is not a room.

It is an exploration mode.

------------------------------------------------------------------------

## Wander Behavior

When the user selects Wander:

The system should:

-   display a room/space chosen from available locations
-   avoid showing the same room repeatedly
-   avoid repeating the same room during the same session when possible
-   create a feeling of exploration

The experience should feel like:

"Take me somewhere interesting."

Not:

"Choose a destination."

------------------------------------------------------------------------

# 4. Room Dropdown Design

Example:

Welcome Home ▼

Options:

-   Welcome Home
-   Estate rooms
-   Creative spaces
-   Learning spaces
-   Reflection spaces
-   Chamber of Momentum™
-   Wander ✨

The exact room list should come from the current Estate manifest.

Do not maintain a separate hardcoded room list.

------------------------------------------------------------------------

# 5. Testing Requirements

## Spark Note™

Verify:

✓ Card opens when clicked\
✓ Expanded Spark Note appears\
✓ Actions respond correctly\
✓ Saved items route correctly

------------------------------------------------------------------------

## Navigation

Verify:

✓ Welcome Home button opens dropdown\
✓ Rooms navigate correctly\
✓ Current room is identified\
✓ Wander loads different rooms\
✓ Wander does not repeatedly show the same room

------------------------------------------------------------------------

# Final Goal

Restore the intended experience:

Spark Note™:

A small daily companion moment.

Welcome Home:

The doorway to explore Spark Estate™.

Wander:

A simple way to discover without making decisions.

Keep the experience simple, welcoming, and ADHD-friendly.
