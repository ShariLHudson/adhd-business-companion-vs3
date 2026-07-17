# Cursor Implementation Prompt — Restore Two Dropdown Menus

## Purpose

Restore the approved menu structure as two separate dropdowns.

Do not place all four destinations in one dropdown.

## Required Structure

### Dropdown 1 — Plan My Day / Adapt My Day

Contains:

- Plan My Day
- Adapt My Day

### Dropdown 2 — Reminders / Rhythms

Contains:

- Reminders
- Rhythms

Each item remains a separate destination.

## Required Behavior

### Plan My Day

Owns:

- creating the day plan
- reviewing commitments
- choosing priorities
- estimating available time
- placing work into the day
- building a realistic starting plan

### Adapt My Day

Owns:

- changing the current day
- adjusting for low energy
- adjusting for low motivation
- handling interruptions
- changing priorities
- recovering after falling behind
- reshaping an existing plan

Energy and motivation must remain separate inputs.

### Reminders

Owns:

- one-time reminders
- scheduled reminders
- snooze
- skip
- complete
- reschedule
- pause or stop where supported

### Rhythms

Owns:

- recurring routines
- flexible recurring support
- adaptive cadence
- quiet-hour awareness
- recurring check-ins
- pause
- resume
- skip
- review

## Dropdown Requirements

- there must be exactly two related dropdown groups
- Plan My Day and Adapt My Day must be together
- Reminders and Rhythms must be together
- each child item must be independently clickable
- each child item must open its own view
- do not merge child items
- do not turn the two dropdown groups into one combined menu
- preserve the approved labels
- preserve existing ordering unless repository evidence shows another approved order

## Scrolling Requirements

Both dropdowns must support vertical scrolling when their content exceeds available height.

Required:

- all child items remain reachable
- no clipped final item
- no item hidden behind fixed headers or footers
- mouse wheel and trackpad scrolling work
- keyboard scrolling works
- touch scrolling works where supported
- avoid nested scroll traps

Each destination panel must also scroll when its content exceeds the available space.

## Regression Checks

Verify:

- first dropdown opens and closes correctly
- second dropdown opens and closes correctly
- Plan My Day opens Plan My Day
- Adapt My Day opens Adapt My Day
- Reminders opens Reminders
- Rhythms opens Rhythms
- no child item routes to the wrong view
- both dropdowns remain visible
- long dropdown content scrolls
- long destination content scrolls
- selected state is clear
- back navigation works
- Return to Estate behavior remains unchanged

## Constraints

- do not redesign the rest of the navigation
- do not change unrelated menu groups
- do not combine the two dropdowns
- do not merge the child destinations
- do not remove existing functionality
- preview only until verification passes

## Required Report

Return:

- exact files changed
- owner of each dropdown
- route owner for each child item
- scroll-container owner
- automated tests
- screenshots or preview evidence
- preview URL
- remaining limitations
- deploy or do-not-deploy recommendation
