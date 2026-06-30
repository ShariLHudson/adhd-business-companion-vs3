# SPEC 108 — Environment Integration™

## How the Spark Estate™ Participates in Conversations

| Field | Value |
|-------|-------|
| **Spec ID** | 108 |
| **Title** | Environment Integration™ |
| **Version** | 1.0 |
| **Status** | Foundational Specification |
| **Priority** | Critical |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Every conversation inside Spark — environment suggestions, transitions, map, restoration places |
| **Related** | [T-017 — Estate Rooms](./ESTATE_ROOMS_FRAMEWORK.md) · **[Spec 105 — Conversation Engine](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md)** · **[Spec 106 — Conversation Guardrails](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md)** · **[Spec 107 — Conversation State Machine](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)** · [Spec 103 — Universal Experience](./UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) · [07 – Estate Navigation](../spark-intelligence-foundation/07-estate-navigation.md) · `lib/estateMap/` · `lib/companionHomestead/homesteadRoomRegistry.ts` |

---

## Purpose

This specification defines how the Spark Estate™ participates in conversations.

The Estate is **not** navigation.

The Estate is **not** a workflow.

The Estate is **not** a feature.

The Estate provides **emotional context** that supports the conversation without ever interrupting it.

**Types:** `lib/sparkEnvironmentIntegration/types.ts`

---

## Core Philosophy

- Conversation is primary.
- The environment is supportive.
- The member is always in control.

Spark may invite.

Spark **never** moves the member without permission.

**Type:** `SPARK_ENVIRONMENT_INTEGRATION_PHILOSOPHY`

---

## Design Principle

### The Estate should feel like changing rooms, not changing software.

When a member changes environments:

- The conversation continues.
- The work continues.
- The Companion continues.

Only the surroundings change. Nothing else.

**Type:** `SPARK_ENVIRONMENT_INTEGRATION_DESIGN_PRINCIPLE`

---

## The Fourteen Rules

**Type:** `SparkEnvironmentIntegrationRuleId` · `SPARK_ENVIRONMENT_INTEGRATION_RULES`

---

### Rule 1 — Begin Where the Member Is

Every session begins exactly where the member left off unless they choose otherwise.

Spark should **not** ask:

> Where would you like to work today?

Spark already remembers.

Reducing unnecessary decisions reduces cognitive load.

---

### Rule 2 — The Conversation Comes First

The first priority is understanding the member.

Spark should **never** begin with:

- Choose a room.
- Choose an environment.
- Choose a workspace.

Instead:

> What would you like help with today?

Only after understanding the conversation may Spark suggest an environment.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 2 — Never Invent Context · [Spec 107](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md) — environment never before Confirming.

---

### Rule 3 — Suggest Only When Helpful

Spark should recommend an environment only when it could genuinely improve the experience.

Examples:

- Planning
- Writing
- Reflecting
- Deep thinking
- Creative brainstorming
- Mental fatigue
- Decision making

Not every conversation requires an environment change.

**Type:** `SPARK_ENVIRONMENT_SUGGESTION_CONTEXTS`

---

### Rule 4 — Recommendations Are Invitations

Spark never says:

> Opening the Conservatory...

Instead:

> This feels like a conversation that might be especially nice in the Conservatory. Would you like to go there?

Choices:

1. Yes
2. Stay Here
3. Show Me the Estate Map

The member always decides.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 11 — Environment Is Optional.

**Type:** `SparkEnvironmentIntegrationInvitationChoice`

---

### Rule 5 — Staying Is Always Valid

Remaining in the current environment should never feel like the wrong choice.

Spark supports the member wherever they are.

The Estate adapts to the conversation. Not the other way around.

---

### Rule 6 — The Estate Is Optional

Members may:

- stay in one favorite environment forever
- change several times a day
- never open the map
- explore often

All are equally valid.

Spark never encourages movement for its own sake.

---

### Rule 7 — Environment Never Changes Capability

Every work-capable environment provides **identical functionality**.

The only differences are:

- atmosphere
- lighting
- soundscape
- architecture
- scenery
- mood

The tools never change. The member never relearns how to work.

---

### Rule 8 — Some Places Exist Only for Restoration

Not every location hosts the Spark Workspace™.

Examples:

- Reflection Garden
- Walking Trail
- Butterfly Garden
- Pond
- Stable Meadow
- Fire Circle

These environments support:

- conversation
- reflection
- thinking
- journaling
- quiet moments

Their purpose is **restoration**, not productivity.

**Type:** `SPARK_ENVIRONMENT_RESTORATION_PLACES`

See [T-017](./ESTATE_ROOMS_FRAMEWORK.md) for room purpose definitions.

---

### Rule 9 — The Map Is Always Available

The folded Estate Map™ quietly remains available in every environment.

It never interrupts. It never demands attention.

Members may:

- click the folded map
- or simply say: *"Show me the Estate."*

Both actions produce the same experience.

---

### Rule 10 — The Estate Never Feels Like Navigation

Members should naturally say:

- "I'm going to the Library."
- "I'm going to the Orchard."
- "I'm heading to the Conservatory."

Not:

- "I'm opening the planning module."

The Estate is remembered as **places**. Not features.

Aligns with [Spec 105](./SPARK_CONVERSATION_ENGINE_FRAMEWORK.md) Relationship Rule™.

---

### Rule 11 — Spark Observes Without Assuming

Spark may notice patterns that improve support.

Example:

> You've done some wonderful thinking in the Conservatory lately. Would you like to stay here today?

Spark never implies surveillance.

Spark never references detailed tracking.

Recommendations should always feel thoughtful, never intrusive.

---

### Rule 12 — The Conversation Travels

Changing environments should **never** restart, summarize, or interrupt the conversation.

The member simply arrives somewhere new.

Everything else continues naturally.

The transition should feel like walking into another room while continuing the same conversation.

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md) Rule 12 — The Conversation Continues Everywhere.

---

### Rule 13 — The Estate Should Never Become a Distraction

The purpose of the Estate is not exploration.

The purpose is **support**.

Members should spend most of their time:

- thinking
- creating
- learning
- building

The Estate quietly provides the setting in which that work happens.

---

### Rule 14 — Discovery Happens Naturally

Members should occasionally discover new places.

Not through announcements. Not through tutorials.

Simply through curiosity.

The Estate rewards exploration without requiring it.

---

## Final Design Test

Before Spark suggests an environment, it should silently ask:

> Will changing the setting genuinely help this person think, feel, or work better right now?

If the answer is uncertain… Spark stays where it is.

**Type:** `SPARK_ENVIRONMENT_INTEGRATION_FINAL_TEST`

The Estate exists to support the entrepreneur, never to compete for their attention.

When implemented correctly, members won't think about "using environments."

They'll simply feel that Spark always seems to meet them in the right place.

---

## Relationship to T-017 and Conversation Specs

| Layer | Document | Governs |
|-------|----------|---------|
| **Room design** | T-017 Estate Rooms | What each room is — purpose, psychology, atmosphere |
| **Conversation integration** | Spec 108 (this) | When and how the Estate participates in conversation |
| **Member-facing flow** | Spec 105 | Stage 4 — Environment (Optional) |
| **Enforceable rules** | Spec 106 | Rules 8, 11, 12, 13 — permission, optional, continuity |
| **Internal timing** | Spec 107 | Environment never before Confirming |

| **108** | Environment Integration | When/how Estate participates |
| **109** | Frosted Conversation Workspace | Universal surface in every room |

**Spec 106 wins on conflict** with features. **Spec 108** defines environment-specific behavior within those guardrails.

**Spec 109** defines the frosted panel every room shares — same behavior, room changes feeling only.

**Spec 110** defines completion behavior for State 9 Complete and workspace State 6.

---

## Forbidden Language

Spark must never use feature-navigation language when suggesting environments.

**Type:** `SPARK_ENVIRONMENT_INTEGRATION_FORBIDDEN` · `SPARK_ENVIRONMENT_INTEGRATION_PREFERRED`

| Never | Instead |
|-------|---------|
| "Opening the Conservatory..." | "Would you like to go to the Conservatory?" |
| "Choose a room" | "What would you like help with today?" |
| "Navigate to..." | "I'm going to the Library." (member voice) |

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/environment-integration.mdc` (**always apply**)

**Types:** `lib/sparkEnvironmentIntegration/types.ts`

Before suggesting any environment change: pass the Final Design Test, offer invitation choices, and preserve conversation continuity.
