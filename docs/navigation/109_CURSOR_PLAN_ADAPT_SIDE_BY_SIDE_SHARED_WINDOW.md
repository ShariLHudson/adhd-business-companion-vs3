# Cursor Implementation Prompt — Side-by-Side Plan My Day / Adapt My Day Shared Window

## Purpose

Update the shared Plan My Day / Adapt My Day window so it visually and structurally matches the approved Reminders / Rhythms shared-window pattern.

The two choices must appear side by side in the same window.

Do not create separate destination windows.

---

# Required Layout

## Shared Window Title

**Plan My Day / Adapt My Day**

## Side-by-Side Choices

Display two equal-width cards or panels side by side on desktop:

### Plan My Day

Purpose:

> Build a realistic plan for your day from where you are starting now.

Supports:

- reviewing commitments
- choosing priorities
- estimating available time
- deciding what realistically fits
- placing tasks into the day
- creating a starting plan

Primary action:

**Open Plan My Day**

### Adapt My Day

Purpose:

> Adjust the plan you already have when your energy, motivation, time, or priorities change.

Supports:

- low energy
- low motivation
- interruptions
- changing priorities
- falling behind
- reduced time
- reshaping the current day without starting over

Primary action:

**Open Adapt My Day**

Energy and motivation must remain separate inputs.

---

# Responsive Behavior

Desktop and wide tablet:

- Plan My Day and Adapt My Day appear side by side
- equal visual weight
- matched card height where practical
- readable descriptions
- clear action on each card

Small screens:

- cards stack vertically
- Plan My Day first
- Adapt My Day second
- no horizontal scrolling
- full content remains reachable

---

# Shared Help

The shared window must contain exactly one:

**How Do I…**

This single collapsible section explains:

- when to use Plan My Day
- when to use Adapt My Day
- the difference between starting a plan and adjusting a plan
- how energy and motivation affect Adapt My Day
- how to switch between them

Do not create separate How Do I… controls for each card.

---

# Scrolling

The whole shared window must be vertically scrollable.

Required:

- both cards fully reachable
- one shared How Do I… reachable
- child content reachable after selection
- no clipped buttons
- no content hidden behind fixed headers or footers
- mouse wheel, trackpad, keyboard, and touch scrolling
- no nested scroll trap where avoidable

---

# Interaction

The parent menu item:

**Plan My Day / Adapt My Day**

opens this shared window.

Inside the window:

- clicking Plan My Day opens or displays Plan My Day content
- clicking Adapt My Day opens or displays Adapt My Day content
- selected state is visible
- no additional chooser appears
- no combined child workflow is created

---

# Visual Consistency

Match the visual pattern already used for:

**Reminders / Rhythms**

Match:

- card size
- spacing
- typography
- description placement
- action-button placement
- shared help placement
- scroll behavior
- selected-state treatment

Do not invent a different layout pattern.

---

# Regression Tests

Verify:

- parent opens one shared window
- two cards appear side by side on desktop
- cards stack on small screens
- Plan My Day opens the correct content
- Adapt My Day opens the correct content
- energy and motivation remain separate
- only one How Do I… appears
- full window scroll works
- no clipped content
- Calendar remains separate
- Back and Welcome Home work

---

# Constraints

- do not create separate windows
- do not merge Plan My Day and Adapt My Day
- do not alter Reminders / Rhythms
- do not redesign unrelated My Day navigation
- do not deploy production until preview verification passes

---

# Required Report

Return:

- exact files changed
- shared-window owner
- card-layout owner
- active-selection owner
- shared How Do I… owner
- scroll owner
- automated tests
- preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation
