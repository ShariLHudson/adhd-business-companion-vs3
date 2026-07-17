# Cursor Implementation Prompt — Move Spark Estate Guide to Welcome Home Menu

## Purpose

Move the Spark Estate Guide out of automatic arrival behavior and into the Welcome Home menu as an explicitly opened destination.

The guide must no longer load when the user arrives at Welcome Home and must no longer appear in the bottom corner by default.

## Required Welcome Home Menu Change

Add a new submenu at the end of the Welcome Home menu:

### Spark Estate

This submenu contains:

- Wander the Grounds
- Spark Estate Guide

The new Spark Estate submenu must appear as the final submenu in the Welcome Home menu.

## Required Behavior

### Wander the Grounds

- remains a separate destination
- opens the existing estate exploration experience
- preserves current approved routing
- does not automatically open the Spark Estate Guide

### Spark Estate Guide

- opens only when the user explicitly clicks Spark Estate Guide
- preserves the approved two-page guide experience
- preserves existing history and guide content
- may load guide assets only after the user selects it
- closes or returns according to existing approved navigation behavior

## Remove Automatic Guide Loading

On arrival at Welcome Home:

- do not load the Spark Estate Guide
- do not mount the guide component
- do not preload heavy guide-only assets unless required for minimal route metadata
- do not show the guide automatically
- do not open it because of prior route state unless the user explicitly resumes it
- do not treat it as part of the default Welcome Home render

## Remove Bottom-Corner Guide UI

The Spark Estate Guide must not appear as:

- a bottom-corner button
- a floating card
- a floating guide tab
- an auto-open overlay
- a persistent corner launcher

Remove or disable the existing bottom-corner guide entry point.

The Welcome Home menu becomes the intentional entry point.

## Explicit Open Requirement

The guide may open only through one of these approved actions:

- user clicks Welcome Home → Spark Estate → Spark Estate Guide
- user uses an explicit valid navigation command for Spark Estate Guide
- user selects a valid current guide resume action

Do not open it from:

- arrival
- generic welcome state
- background preload completion
- stale overlay state
- unrelated navigation
- hover
- passive focus

## Menu Ordering

The new Spark Estate submenu must appear last.

Expected structure:

1. existing Welcome Home submenu groups
2. Spark Estate
   - Wander the Grounds
   - Spark Estate Guide

Do not reorder unrelated menu groups.

## Performance Requirement

Because the guide is no longer loaded on arrival:

- Welcome Home initial render should not include guide-only component work
- guide-only images, spreads, history panels, or heavy assets should be lazy-loaded where practical
- the menu label itself may remain lightweight
- no visible blank guide shell should mount in the background

## State Requirements

- entering Welcome Home must default to guide closed
- prior guide-open state must not leak into a fresh arrival
- explicit guide navigation must still work
- closing the guide must return to the appropriate prior location
- Return to Estate must still go to Welcome Home lobby
- Wander the Grounds and Spark Estate Guide must not share open-state flags

## Accessibility and Scrolling

- new submenu must be keyboard accessible
- submenu items must be readable
- submenu must scroll if needed
- focus states must be visible
- guide content must retain scrolling behavior
- no content may be clipped behind fixed headers or footers

## Regression Checks

Verify:

- Spark Estate submenu appears last
- Wander the Grounds appears inside it
- Spark Estate Guide appears inside it
- guide does not load on Welcome Home arrival
- guide does not appear in the bottom corner
- guide opens only after explicit click
- guide content still renders correctly
- Wander the Grounds still works
- no duplicate guide entry point remains
- Welcome Home loads without the guide mounted
- closing the guide works
- Back works
- Return to Estate works

## Constraints

- do not redesign the Spark Estate Guide itself
- do not change its approved two-page layout
- do not remove guide content
- do not rename Wander the Grounds
- do not alter unrelated Welcome Home menu items
- do not deploy production until preview verification passes

## Required Report

Return:

- exact files changed
- Welcome Home menu owner
- Spark Estate submenu owner
- Spark Estate Guide route owner
- removed bottom-corner entry point
- lazy-load or mount changes
- state flags changed
- automated tests added
- preview URL
- screenshots or preview evidence
- remaining limitations
- deploy or do-not-deploy recommendation
