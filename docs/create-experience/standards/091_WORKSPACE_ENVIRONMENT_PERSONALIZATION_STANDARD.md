# 091 — Workspace Environment Personalization Standard

**Status:** Binding Spark Estate™ Product Rule  
**Date:** 2026-07-21  
**Applies to:** Every major work experience and Work Type surface  
**Extends:** [058 Platform Workspace Experience](./058_PLATFORM_WORKSPACE_EXPERIENCE_STANDARD.md) · [088 Preferences](./088_preferences/088_000_PREFERENCES_CONSTITUTION.md) · Spec 108 · Spec 109  
**Runtime (foundation):** `lib/workspaceEnvironment/`  
**Current-state map:** [091_WORKSPACE_ENVIRONMENT_CURRENT_STATE_MAP.md](./091_WORKSPACE_ENVIRONMENT_CURRENT_STATE_MAP.md)

---

## Purpose

Every major work experience in Spark Estate should feel like working in a real place rather than inside generic software.

Workspace environments exist to create calm, improve orientation, reduce cognitive fatigue, and help users associate different kinds of thinking with different environments.

They are not decorative backgrounds.

They are part of the user experience.

---

## Core Rule

Every major work area shall always display a workspace environment behind the working window.

The workspace environment should remain partially visible around the work surface so the user always feels they are working within Spark Estate rather than inside a blank application window.

No primary work area should default to a plain white, gray, or empty background.

---

## Workspace Philosophy

Users should feel like they are entering an environment designed for the type of work they are about to perform.

The environment should support thinking rather than distract from it.

Spark Estate is a place.

Not a collection of screens.

---

## Default Workspace Assignment

Each Work Type should have a carefully selected default workspace.

| Work Type (intent) | Default environment |
|--------------------|---------------------|
| Marketing Plan | Creative Marketing Studio |
| Strategic Plan | Executive Strategy Office |
| Projects | Modern Project Studio |
| Writing | Author's Library |
| Course Creation | Teaching Studio |
| Podcast | Recording Studio |
| Finance | Executive Financial Office |
| Research | Innovation Lab |
| Learning | University Reading Room |
| Event Planning | Event Planning Studio |
| Client Planning | Professional Meeting Suite |
| Business Planning | Executive Planning Office |

The default should match the thinking style required for the work.

**Registered UWE Work Types (current map):** see `lib/workspaceEnvironment/defaultWorkTypeEnvironments.ts`.

---

## User Personalization

Users may choose their preferred workspace environment for each Work Type.

Examples:

- Modern Office
- Mountain Cabin
- Beach House
- Coffee Shop
- Library
- Creative Loft
- Garden Studio
- Minimal Workspace
- Executive Office
- Glass Conservatory
- Innovation Lab

The user's preference should be remembered automatically.

---

## Workspace Themes

Each workspace may offer optional visual themes without changing the workspace identity.

Examples:

- Morning Light
- Golden Hour
- Rainy Day
- Snowfall
- Autumn
- Spring
- Night
- Fireplace
- Ocean View
- Christmas

The workspace remains recognizable while its atmosphere changes.

---

## Intelligent Recommendations

Shari may occasionally recommend new workspace environments.

Example:

> I found a new Creative Studio that I think you'd enjoy. Would you like to preview it?

Recommendations should be:

- optional
- rare
- never interrupt work
- never automatically change a workspace

---

## Consistency Rules

Changing a workspace should never:

- change navigation
- move controls
- change layout
- change workflow
- change functionality

Only the environment should change.

Users should always know where everything is.

---

## Accessibility

Users must always be able to:

- disable workspace imagery
- reduce visual complexity
- increase background blur
- increase work surface opacity
- reduce motion
- maintain high contrast

Workspace personalization must never reduce readability or accessibility.

See also: [088_004 Accessibility and Energy Modes](./088_preferences/088_004_ACCESSIBILITY_AND_ENERGY_MODES.md).

---

## ADHD Design Principles

Workspace environments should:

- reduce blank-screen anxiety
- support contextual memory
- provide gentle environmental cues
- encourage focus
- avoid overstimulation
- help users mentally transition between types of work

Different environments help users recognize:

- "This is where I plan."
- "This is where I write."
- "This is where I create."
- "This is where I think strategically."

---

## Visual Standards

Workspace environments should be:

- beautiful
- professional
- warm
- welcoming
- high-resolution
- clean
- organized
- realistic
- timeless

They should never feel:

- cluttered
- cartoonish
- busy
- overly saturated
- distracting
- or gimmicky.

Aligns with Estate Photograph Test and Spec 103 visual standards.

---

## Estate Integration

Whenever possible, workspace environments should feel like natural extensions of Spark Estate.

Some may represent actual Estate locations.

Others may represent professional environments beyond the Estate while still maintaining Spark Estate's visual style and calm atmosphere.

The transition between rooms and workspaces should feel seamless.

**Boundary:** Estate place identity remains owned by the Canonical Estate Registry and Estate Brain. This standard owns **Work Type → environment defaults**, member preferences, themes, and accessibility for work surfaces — not a second place registry.

---

## Future Expansion

Future personalization may include:

- favorite workspace collections
- seasonal workspace packs
- profession-specific workspace collections
- business-style workspace collections
- lighting preferences
- weather preferences
- music or ambient sound pairings
- focus-mode workspace variants

These additions should enhance the experience without increasing complexity.

---

## Platform Principle

Spark Estate should never feel like software floating on top of a blank screen.

Users should always feel that they are working in a place designed to help them do their best thinking.

A workspace is more than a background.

It is part of the thinking environment.

---

## Implementation outcomes (required over time)

1. Default environment for every registered Work Type  
2. Per–Work Type member preference persistence  
3. Optional theme layer that never changes chrome/layout  
4. Accessibility controls for imagery, blur, opacity, motion, contrast  
5. Shari recommendation path (permission-only, rare)  
6. No plain white/gray/empty primary work area  

**Non-goals:** competing Work persistence · changing UWE identity · wallpaper that moves controls · auto-switching environments mid-flow without consent
