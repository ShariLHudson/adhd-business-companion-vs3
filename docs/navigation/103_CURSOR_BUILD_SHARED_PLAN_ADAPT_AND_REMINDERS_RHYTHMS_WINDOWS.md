# Cursor Implementation Prompt — Shared Windows for Plan/Adapt and Reminders/Rhythms

## Purpose

Restore the approved experience so each related pair opens in one shared window with two distinct choices.

Required structure:

- one shared Plan My Day / Adapt My Day window
- one shared Reminders / Rhythms window
- two separate items inside each window
- one shared How Do I… section per window
- clear explanations of what each item is for
- full vertical scrolling

Do not create four separate destination windows from Welcome Home.

---

# Window 1 — Plan My Day / Adapt My Day

## Entry

Welcome Home → My Day → Plan My Day / Adapt My Day

Opening the parent item opens one shared window.

## Items Inside the Window

### Plan My Day

Purpose:

Use Plan My Day when the user is beginning or intentionally organizing the day.

It helps the user:

- review commitments
- choose priorities
- estimate available time
- decide what realistically fits
- place tasks into the day
- create a starting plan

Suggested plain-language description:

> Build a realistic plan for your day from where you are starting now.

### Adapt My Day

Purpose:

Use Adapt My Day when the day already exists but circumstances have changed.

It helps the user:

- adjust for low energy
- adjust for low motivation
- respond to interruptions
- recover after falling behind
- change priorities
- reduce the day’s load
- reshape the current plan

Energy and motivation must remain separate inputs.

Suggested plain-language description:

> Adjust the plan you already have when your energy, motivation, time, or priorities change.

## Interaction

- Plan My Day and Adapt My Day are separate selectable items
- both appear in the same window
- selecting Plan My Day opens or displays Plan My Day content in that window
- selecting Adapt My Day opens or displays Adapt My Day content in that window
- do not open an additional combined chooser
- do not route the parent directly to one child
- make the selected item visually clear

---

# Window 2 — Reminders / Rhythms

## Entry

Welcome Home → My Day → Reminders / Rhythms

Opening the parent item opens one shared window.

## Items Inside the Window

### Reminders

Purpose:

A reminder is for a specific thing the user needs to remember.

Reminders are usually:

- one-time
- tied to a date or time
- completed when the specific action is done
- snoozed, skipped, rescheduled, paused, or stopped where supported

Suggested plain-language description:

> Use a reminder for one specific thing you need to remember at a certain time or on a certain day.

Examples:

- Call Sarah tomorrow at 10:00
- Send the proposal Friday
- Take medication at 8:00 tonight
- Follow up with a client next Tuesday

### Rhythms

Purpose:

A rhythm is recurring support for something the user wants to keep returning to.

Rhythms are usually:

- repeated
- flexible rather than rigid
- based on cadence, pattern, or routine
- responsive to quiet hours, schedule, and changing capacity
- paused, resumed, skipped, or adjusted without treating the whole rhythm as failed

Suggested plain-language description:

> Use a rhythm for something you want gentle, recurring support with over time.

Examples:

- Weekly business review
- Morning planning
- Friday client follow-up
- Monthly finances
- A regular movement or hydration check-in

## Required Difference Explanation

The shared window must clearly explain:

> A reminder helps you remember one specific action. A rhythm helps you return to something repeatedly over time.

Also explain:

- Reminder = specific event or task
- Rhythm = recurring pattern or practice
- Reminder asks: “What do I need to remember?”
- Rhythm asks: “What do I want support returning to?”

This explanation must be visible without requiring the user to open How Do I….

## Interaction

- Reminders and Rhythms are separate selectable items
- both appear in the same window
- selecting Reminders opens or displays Reminders content in that window
- selecting Rhythms opens or displays Rhythms content in that window
- the selected item must be visually clear
- do not route the parent directly to one child
- do not create a second unnecessary chooser

---

# One How Do I… per Window

Each shared window must contain exactly one How Do I… section.

## Plan My Day / Adapt My Day Window

The single How Do I… section may explain:

- when to use Plan My Day
- when to use Adapt My Day
- how to switch between them
- what happens to the current plan
- how energy and motivation affect Adapt My Day

Do not create:

- one How Do I… for Plan My Day
- another How Do I… for Adapt My Day

## Reminders / Rhythms Window

The single How Do I… section may explain:

- when to use a reminder
- when to use a rhythm
- how they differ
- how to create each
- how to pause, snooze, skip, resume, or complete them
- what happens when a recurring item is missed

Do not create:

- one How Do I… for Reminders
- another How Do I… for Rhythms

The How Do I… section should be collapsible and closed by default unless the approved design specifies otherwise.

---

# Scrolling Requirements

Both shared windows must be vertically scrollable.

Required:

- all explanatory text remains reachable
- all items remain reachable
- How Do I… remains reachable
- no buttons are clipped
- no content is hidden behind fixed headers or footers
- mouse-wheel scrolling works
- trackpad scrolling works
- keyboard scrolling works
- touch scrolling works where supported
- selected-item content can scroll
- avoid nested scroll traps

Use one primary scroll container per shared window wherever practical.

If child content is long, it should participate in the same window scroll rather than creating multiple competing scroll areas unless technically necessary.

---

# Navigation Structure

Expected:

My Day

- Plan My Day / Adapt My Day
  - opens one shared window
  - contains Plan My Day and Adapt My Day

- Calendar

- Reminders / Rhythms
  - opens one shared window
  - contains Reminders and Rhythms

Parent menu items open the shared windows.

The two choices inside each shared window control which content is displayed.

---

# Required State Behavior

For each shared window, preserve:

- active child selection
- one shared window open state
- one shared How Do I… open state
- child-specific working state
- clear return/back behavior

Do not allow:

- both child panels to mount as unrelated overlays
- duplicate How Do I… controls
- child state from one shared window leaking into the other
- stale selection forcing the wrong child on a fresh arrival unless deliberate persistence is approved

---

# Regression Tests

## Plan/Adapt Window

Verify:

- parent opens one window
- both items are visible
- Plan My Day description is visible
- Adapt My Day description is visible
- selecting each displays the correct content
- only one How Do I… appears
- energy and motivation remain separate
- full window scroll works

## Reminders/Rhythms Window

Verify:

- parent opens one window
- both items are visible
- Reminders description is visible
- Rhythms description is visible
- difference explanation is visible
- selecting each displays the correct content
- only one How Do I… appears
- full window scroll works

## General

Verify:

- Calendar remains separate
- Welcome Home menu structure remains correct
- no combined child chooser appears after selection
- no duplicate help sections
- no clipped content
- Back works
- Return to Estate works
- unrelated navigation is unchanged

---

# Constraints

- do not create four separate Welcome Home destination windows
- do not merge the functions themselves
- do not hide the differences between the two choices
- do not create duplicate How Do I… sections
- do not redesign unrelated My Day navigation
- do not remove existing Plan, Adapt, Reminder, or Rhythm functionality
- preview only until live verification passes

---

# Required Report

Return:

- exact files changed
- shared-window owner
- active-child-selection owner
- Plan/Adapt content owners
- Reminders/Rhythms content owners
- How Do I… owner for each window
- scroll-container owner
- explanation copy location
- automated tests
- preview URL
- screenshots or preview evidence
- remaining limitations
- deploy or do-not-deploy recommendation
