# ARCH-010 — Presentation Layer Architecture

## Status

Approved architectural direction.

This document defines how Spark Estate™ should support multiple visual experiences without becoming multiple applications.

This is a future-proofing decision. It does **not** require building Focus Workspace now.

---

# 1. Purpose

Spark Estate™ must support different ways of working while preserving one unified product.

Some members may prefer the immersive estate experience most of the time.

Other members may sometimes want a simpler, distraction-free interface.

The same member may want different experiences at different times.

The application must therefore separate:

- feature logic
- user data
- companion intelligence
- presentation

This allows the interface to change without changing the underlying product.

---

# 2. One App

Spark Estate™ remains one application.

There will not be separate apps for immersive and minimal experiences.

All presentation modes share:

- one companion
- one memory system
- one conversation history
- one database
- one project system
- one intelligence layer
- one feature set
- one user profile
- one subscription
- one account

Only the presentation changes.

---

# 3. Presentation Modes

## 3.1 Spark Estate™

The immersive presentation.

Includes:

- estate rooms
- visual environments
- room-specific artwork
- animations
- interactive objects
- transitions
- soundscapes
- estate navigation
- Chamber Members
- storytelling and symbolism

This is the default and signature experience.

---

## 3.2 Focus Workspace

A future minimal presentation for members who want to work without estate visuals.

Includes:

- clean workspace
- reduced visual stimulation
- no room animations
- no immersive backgrounds
- faster transitions
- direct access to features
- task-focused layouts

The intelligence and functionality remain identical.

Example:

### Evidence Vault in Spark Estate™

- arrive at the vault
- click the key
- open the doors
- enter the journal room
- click the journal
- begin writing

### Evidence Vault in Focus Workspace

- open Evidence Vault
- see a clean evidence workspace
- begin writing

Both presentations use the same Evidence Vault data, logic, prompts, and records.

---

## 3.3 Adaptive Mode

A future optional mode.

Spark may suggest a presentation based on:

- user preference
- time of day
- current task
- energy
- sensory needs
- repeated behavior

Examples:

- suggest Focus Workspace during a short work session
- suggest Spark Estate during reflection
- suggest a peaceful place when the member feels overwhelmed

The user always remains in control.

Adaptive Mode must never switch presentation without clear user permission unless the member has explicitly enabled automatic switching.

---

# 4. Core Architectural Rule

Feature logic must not depend on estate visuals.

Every major capability should be implemented as two separate concerns:

## Feature Layer

Owns:

- data
- workflow
- actions
- prompts
- memory
- state
- validation
- saving
- retrieval
- intelligence
- permissions

## Presentation Layer

Owns:

- room artwork
- animations
- overlays
- transitions
- interactive objects
- workspace layouts
- mobile layouts
- visual styling

The presentation layer may call feature logic.

Feature logic must not require estate-specific visual components to function.

---

# 5. Feature Examples

This separation applies to:

- Evidence Vault™
- Hall of Accomplishments™
- Cartographer’s Studio™
- The Chamber
- Personal Library™
- Conservatory™
- Breathe
- Peaceful Places
- Estate Soundscapes
- Journal
- Discovery Engine
- Clear My Mind
- Decision Compass
- Project Intelligence
- Founder Intelligence
- Future tools and rooms

---

# 6. Routing

Routes should identify the feature or destination.

Presentation mode determines how that feature is rendered.

Example conceptual route:

`/evidence-vault`

Possible renderers:

- `EstateEvidenceVaultView`
- `FocusEvidenceVaultView`
- future mobile-specific view
- future voice-first view

The route should not contain separate business logic for each presentation.

---

# 7. Shared State

Switching presentation must preserve:

- current conversation
- unsaved work
- selected project
- current feature
- room or workspace context
- scroll position when practical
- audio settings
- active Chamber Member
- navigation history
- current draft
- user preferences

Changing presentation must never create a new session unless the member explicitly starts one.

---

# 8. User Preference

A future setting may be added:

## Workspace Experience

### Spark Estate™

Immersive rooms, visual environments, animations, and estate experiences.

### Focus Workspace

A clean, distraction-reduced interface for direct work.

### Adaptive

Spark suggests the presentation that may best fit the current moment.

The setting changes presentation only.

It must not change features, data, memory, permissions, or intelligence.

---

# 9. Current Development Rules

Do not build Focus Workspace now.

Beginning immediately:

1. Do not place critical feature logic only inside room-specific visual components.
2. Do not make data saving depend on an animation completing.
3. Do not make navigation depend on an estate object being visible.
4. Keep feature state independent from background images.
5. Keep overlays and modals separate from feature data.
6. Ensure workflows can be rendered in more than one visual shell.
7. Avoid duplicate logic for estate and future focus views.
8. Preserve shared state during presentation changes.
9. Document any unavoidable coupling.
10. Prefer reusable feature controllers, hooks, services, and state models.

---

# 10. Demo Priority

This architecture must not delay the current demo fixes.

Immediate work should remain focused on:

- Evidence Vault access
- Hall of Accomplishments access
- Chamber Member access
- Breathe overlay behavior
- closeable panels
- loading failures
- blank screens
- navigation separation
- readable text
- reliable room transitions

The only immediate requirement from this document is to avoid creating new unnecessary coupling between feature logic and estate visuals.

---

# 11. Future Expansion

This architecture may later support:

- Spark Estate™
- Focus Workspace
- mobile compact view
- voice-first view
- accessibility-optimized view
- low-motion view
- low-sensory view

These are presentations of the same application, not separate products.

---

# 12. Governing Principle

Spark Estate™ adapts to the member.

The member should be able to choose the experience that fits their brain, task, energy, and environment at that moment without losing continuity, intelligence, memory, or access to any feature.

One app.

One companion.

One memory.

Multiple ways to experience it.

**Runtime module:** `lib/presentation/`
