# 183_UNIVERSAL_ACCESS_STANDARD

# Spark Estate™
## Universal Access Standard™

**Version:** 1  
**Status:** Binding product law  
**Date:** 2026-07-09  
**Series:** Access / routing (183)  
**Source:** `Downloads/183_UNIVERSAL_ACCESS_STANDARD.md`

**Related:**
- [182 Spark Estate Completion Roadmap](./182_SPARK_ESTATE_COMPLETION_ROADMAP.md)
- [151 Spark Companion Runtime Architecture](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md)
- [100 Spark Estate Master Manifest](./100_SPARK_ESTATE_MASTER_MANIFEST.md)
- Runtime — `lib/universalAccess/`
- [184 Spark Visual Engine Standard](./184_SPARK_VISUAL_ENGINE_STANDARD.md)

---

## Purpose

Define how members access capabilities throughout Spark Estate™.

Spark Estate™ is not a collection of isolated rooms or locked features. It is one intelligent companion experience.

Rooms provide context, atmosphere, and recommendations. They never restrict functionality.

---

## Core Principle

Members navigate by intent.

Spark navigates the architecture.

A member should never have to know which room contains a feature. They should simply be able to ask for what they need.

Examples:

- “Create a mind map.”
- “Start a timer.”
- “Save this to Google Docs.”
- “Show my projects.”
- “Schedule this.”
- “Open my journal.”
- “Make this visual.”

Spark should fulfill the request from wherever the member currently is.

---

## Universal Access Law

Every capability must be available from every room, page, experience, and conversation unless there is a true technical or permission limitation.

The current location may influence how the capability appears, but it may not block the capability.

---

## Rooms Are Context, Not Permission

A room may be optimized for certain activities.

Examples:

- Discovery Room™ may be optimized for Visual Thinking™.
- Journal Gazebo™ may be optimized for journaling and reflection.
- Estate Library™ may be optimized for reading and learning.
- Clear My Mind™ may be optimized for capture and organization.

However, the member can still request any supported capability from any of these spaces.

---

## Direct Requests Override Suggestions

If the member clearly asks for a specific capability, Spark should act immediately.

Examples:

Member says:

> “Create a mind map.”

Spark opens the Spark Visual Engine™ in Mind Map view.

Member says:

> “Start a focus timer.”

Spark starts or opens the Focus Timer.

Member says:

> “Save this to Drive.”

Spark sends the item to the Destination Gallery™ / Google Drive flow.

Do not ask unnecessary permission questions when the intent is clear.

---

## Recommendations Are Invitations

Spark may suggest a better workspace, but it must not require it.

Example:

> “I can build the mind map right here, or we can open the Discovery Room™ for a larger visual workspace.”

Both options should work.

---

## Never Block Language

Spark should not say:

- “You can’t do that here.”
- “This feature is not available in this room.”
- “Go to another page first.”
- “That only works in…”

Instead Spark should say:

- “I can do that.”
- “Let’s open that.”
- “I’ll bring that up.”
- “We can do that right here.”

---

## Universal Capability Categories

Every category below should be callable from anywhere.

### Thinking
- Clear My Mind™
- Spark Visual Engine™
- Decision Compass™

### Creation
- Writing
- Creative Studio™
- Canva / Create
- Content generation

### Organization
- Projects™
- Tasks
- Calendar
- Waiting
- Someday
- Reminders

### Saving and Sending
- Destination Gallery™
- Google Docs
- Google Drive
- Print / PDF
- Spark Social Media

### Reflection
- Journal
- Evidence Vault™
- Hall of Accomplishments™
- Celebration Garden™

### Audio and Environment
- Global Audio Player
- Soundscapes™
- Spark Music™
- Timer
- Breathing

---

## Routing Requirement

The routing order should be:

1. Member intent
2. Explicit command
3. Current active experience
4. Current room context
5. Recommended workspace
6. Default fallback

Intent always has priority over location.

---

## Implementation Notes

Every capability should expose a universal action that can be called from any context.

Examples:

- `openMindMap()`
- `openWorkflowMap()`
- `startFocusTimer()`
- `openProjects()`
- `openDestinationGallery()`
- `saveToGoogleDocs()`
- `saveToGoogleDrive()`
- `openJournal()`
- `openClearMyMind()`

Rooms may style or frame the capability differently, but they should not own exclusive access.

**Runtime:** `lib/universalAccess/` — `resolveExplicitCapabilityIntent` · `fulfillUniversalCapabilityRequest`

---

## Success Criteria

A member should never feel like they are in the wrong place.

Spark should feel like one companion that can help from anywhere.

The estate should feel like a home where every room supports the member, not software where every feature is hidden behind the right menu.
