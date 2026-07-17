# Cursor Implementation Prompt — Reformat Strategy Library into Spark Estate Format

## Purpose

Replace the old workspace-style Strategy Library presentation with a Spark Estate visual experience.

The current screen shown in the reference image is the old format.

Preserve the Strategy Library's content, data, modes, search, filters, saved strategies, and Shari integration.

Change the presentation and surrounding experience so it belongs visually and behaviorally inside Spark Estate.

---

# Preserve Existing Strategy Functionality

Do not remove or reduce:

- ADHD Strategies
- Business Strategies
- Recommended
- Saved
- search
- topic/problem browsing
- popular strategies
- browse mode
- apply mode
- create mode
- resume mode
- Apply With Shari
- existing strategy records
- existing strategy counts
- saved-state behavior
- strategy detail content
- strategy creation flow
- strategy resume flow

The work is a visual and navigational reformat, not a strategy-engine rewrite.

---

# Remove Old Workspace Presentation

The reference image shows the old format, including:

- split chat/workspace layout
- left chat column
- top workspace view toggles
- Back to Chat Strategies
- Workspace Focus / Chat Focus controls
- plain lavender workspace background
- old white list cards
- floating bottom-corner Daily Spark card
- old page header treatment

Do not carry those elements into the new estate presentation unless a feature is still genuinely required and is deliberately restyled for Spark Estate.

The Strategy Library must not feel like a separate legacy application embedded inside Spark Estate.

---

# New Spark Estate Experience

## Entry

Welcome Home → Get Advice → Strategy Library

Opening Strategy Library should enter a dedicated Spark Estate destination.

Recommended visual concept:

**Strategy Study** or **Strategy Library Room**

Use the approved estate-room visual language:

- warm, immersive room background
- calm professional atmosphere
- bookshelves, planning table, strategy cards, or estate-study details
- clear central content area
- readable foreground panels
- large accessible text
- uncluttered layout
- no unrelated floating widgets

Do not rename the user-facing destination without approval.

The visible title should remain:

**ADHD Entrepreneur Strategy Library**

---

# Header and Navigation

Use estate navigation rather than the old workspace toolbar.

Required:

- persistent top-left Welcome Home control
- clear Strategy Library title
- one optional short subtitle
- no Back to Chat Strategies label
- no Workspace Focus / Chat Focus / Balanced toolbar
- no Chamber dropdown floating over the Strategy Library unless it is part of the approved global top navigation
- no duplicate navigation bars

Shari remains available through the approved estate chat behavior, not through the legacy split-pane workspace.

---

# Suggested Estate Layout

## Main Room Content

Use one scrollable central estate panel.

Recommended order:

1. title and short explanation
2. one shared How Do I… section
3. mode choices
4. search
5. topic or category filters
6. recommended/popular strategies
7. saved strategies access
8. strategy details or active strategy content

## Mode Choices

Display estate-style choices for:

- Browse Strategies
- Apply a Strategy
- Create a Strategy
- Resume a Strategy

These may be cards, doors, tabs, or segmented choices consistent with other estate destinations.

Do not expose internal mode names as technical labels.

## Category Choices

Preserve:

- ADHD Strategies
- Business Strategies
- Recommended
- Saved

Restyle them as clear estate-compatible filters or category cards.

## Strategy Cards

Restyle strategy entries as readable Spark Estate cards.

Each card should include:

- strategy name
- one-sentence purpose
- category or topic
- clear open/apply action
- saved state where relevant

Avoid tiny text and compressed legacy list rows.

---

# Shari Integration

Shari remains the only visible conversational response owner.

When the user chooses:

- Apply
- Create
- Resume

Shari should continue the strategy work naturally.

Do not automatically show an old-style split chat column.

Use the approved estate conversation surface, drawer, or panel already used elsewhere.

Do not add duplicate Shari prompts.

The old automatic message:

> I see you've opened Strategies. What challenge are you trying to solve?

should not appear automatically unless it is still appropriate under current conversation rules.

Opening the library should not force a discovery question before the user chooses a mode.

---

# One How Do I…

The Strategy Library should contain one shared:

**How Do I…**

It may explain:

- how to browse
- how to search by problem
- how to apply a strategy
- how to create a custom strategy
- how saved strategies work
- how resume works

Do not create a separate help control for every section.

---

# Scrolling

The entire Strategy Library destination must be scrollable.

Required:

- title remains readable
- categories reachable
- search reachable
- all strategy cards reachable
- saved content reachable
- active strategy content reachable
- no cards hidden behind fixed chrome
- no clipped bottom content
- mouse, trackpad, keyboard, and touch scrolling
- no competing nested scroll traps where avoidable

---

# Accessibility and Readability

Use Spark Estate readability standards.

Minimum expectations:

- large title
- readable body copy
- large filter labels
- large strategy names
- large actionable buttons
- visible focus states
- sufficient contrast
- keyboard navigation
- screen-reader labels
- no tiny legacy toolbar text

Follow existing approved accessibility tokens where available.

---

# State and Routing

Preserve current owners:

- strategy route
- strategy modes
- strategy store
- saved strategies
- active strategy
- resume behavior
- Shari response ownership

Change the view layer and route shell only where required.

Ensure:

- browse remains browse
- apply remains apply
- create remains create
- resume remains resume
- fresh entry does not accidentally resume stale work
- explicit resume still works
- stale Create Document state does not take over
- Welcome Home always returns to the estate lobby

---

# Remove Legacy Elements

Verify removal or replacement of:

- split left chat column
- old workspace toolbar
- Back to Chat Strategies
- Balanced
- Chat Focus
- Workspace Focus
- Focus on Strategies
- floating Daily Spark card in bottom corner
- old lavender workspace shell
- duplicate strategy navigation

Do not remove the underlying capabilities attached to these controls unless they are obsolete and already superseded.

---

# Regression Tests

Verify:

- Strategy Library opens from Get Advice
- estate-format destination loads
- no legacy split-pane layout appears
- no old workspace toolbar appears
- no bottom-corner Daily Spark card appears
- browse works
- apply works
- create works
- resume works
- search works
- filters work
- saved strategies work
- strategy cards open correctly
- Shari remains one visible response owner
- no automatic unwanted discovery message
- one How Do I… appears
- full scrolling works
- Welcome Home works
- Escape and outside-click behavior follow the global window contract

---

# Reference Image

Use the supplied screenshot only as evidence of the old presentation that must be replaced.

Do not reproduce its layout.

The screenshot demonstrates the legacy:

- split chat/workspace shell
- old top controls
- old card list
- old lavender background
- old floating corner widget

---

# Constraints

- do not rewrite strategy content
- do not delete the Strategy Library
- do not merge strategy modes
- do not change the Strategy Library's authoritative data owner
- do not introduce a second chat owner
- do not redesign unrelated Get Advice destinations
- do not deploy production until authenticated preview verification passes

---

# Required Report

Return:

- exact files changed
- route owner
- view-shell owner
- strategy mode owner
- strategy-card owner
- Shari integration owner
- removed legacy components
- preserved functionality
- automated tests
- preview URL
- screenshots
- remaining limitations
- deploy or do-not-deploy recommendation
