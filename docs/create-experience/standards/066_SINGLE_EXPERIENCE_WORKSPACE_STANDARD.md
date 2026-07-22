# 066 — Single Experience Workspace Standard

**Status:** Production Implementation Standard  
**Applies to:** Every Creation Workspace and living work object in Spark Estate  
**Extends:** [048 Creation Workspace](./048_CREATION_WORKSPACE_STANDARD.md) · [055 Universal Creation Entrypoint](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md) · [056 Create Experience](./056_CREATE_EXPERIENCE_REDESIGN_STANDARD.md) · [058 Platform Workspace Experience](./058_PLATFORM_WORKSPACE_EXPERIENCE_STANDARD.md)  
**Runtime:** `lib/singleExperienceWorkspace/` · Create estate shell · `ChatLayoutMode: "workspace-focus"` for Creation

## Mission

Spark Estate is a companion platform, not a chat application.

The member should never experience “chat” and “work” as two separate activities.

**The workspace is the experience. Shari exists inside that experience.**

## Permanent Rule

The legacy split-screen experience is **retired**.

There shall never again be a permanent interface showing:

```text
Chat          | Workspace
--------------|----------------
Conversation  | Document
Conversation  | Event
Conversation  | Project
Conversation  | Book
Conversation  | Course
```

This architecture is **deprecated**.

## New Experience Model

```text
Conversation
  → Understand Intent
  → Open Living Workspace
  → Everything happens inside the Workspace
```

- The Workspace is the primary interface.
- Conversation supports the Workspace.
- Conversation is not a second application.

## Shari’s Role

**Never say:**

- “I’ll open that in the workspace while we keep chatting.”
- “You’ll see the workspace beside our conversation.”
- “The split view lets us work together.”
- “Open beside chat” / “keep chatting while you work in the panel.”

**Instead (067 — only when evidence supports the claim):**

- “Let’s work on your workshop together.”
- “Your workshop is ready.” (workspace verified)
- “I’ve gathered what we’ve discussed so far.” (facts on the Creation Record)
- Never “I’ve created…” unless a Creation Record actually exists.

The member simply finds themselves inside the workspace.

## Workspace Behavior

When a workspace opens:

1. The workspace becomes the primary experience.
2. Shari remains available as a floating companion, contextual assistant, or integrated guidance — **not** as a separate parallel chat pane.
3. Attention stays on the work itself.

## Runtime Rules

When a Creation Workspace opens:

1. Close any legacy split view (`ChatLayoutMode: "split"` for Create).
2. Do not mount a persistent conversation panel beside the workspace.
3. Route guidance into the workspace’s contextual interaction model.
4. Preserve conversational context internally without exposing it as a second interface.
5. Prefer Estate Create / living workspace shell over `WorkspaceLayout` dual panes.

## Conversation Model

Conversation is no longer a destination. Conversation is a **capability**.

The member is always interacting with one living object:

Event · Book · Course · Project · Marketing Campaign · Research · Business Plan

Shari helps with that object. She does not compete with it for screen space.

## Failure Conditions

- Permanent chat | document columns
- “Beside chat” / “split view” member-facing copy
- Opening Create into `chatLayoutMode: "split"`
- Shari announcing UI mechanics instead of the work

## Platform Principle

One living object. One experience. Shari inside the work — never beside it as a second app.

## Single Interaction Ownership (066 completion)

Exactly one component may own interaction inside a Creation Destination: **Current Focus**.

Current Focus owns: asking · accepting responses · Reality updates · Trust verification · advancing workflow · next interaction.

All other components are presenters, guidance, navigation, or visualization. They must not ask competing questions, capture responses, reopen companion chat, restart discovery, or advance workflow independently.

While a Creation Destination owns interaction, global companion chat is **dormant** — never competes, never asks, never reopens automatically.

**Ownership registry:** `lib/singleExperienceWorkspace/interactionOwnership.ts`  
**Audit:** [HARDENING_066_SINGLE_OWNERSHIP.md](../HARDENING_066_SINGLE_OWNERSHIP.md)
