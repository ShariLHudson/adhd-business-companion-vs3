# 061 — Universal Creation State Machine Standard

**Status:** Production Implementation Standard  
**Applies:** Platform-wide  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[055](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md) · [058 Workspace](./058_PLATFORM_WORKSPACE_EXPERIENCE_STANDARD.md) · [059 Discovery Transition](./059_DISCOVERY_TO_WORKSPACE_TRANSITION_STANDARD.md) · [060 Recommendation Engine](./060_INTELLIGENT_RECOMMENDATION_ENGINE_STANDARD.md)  
**Runtime:** `lib/universalCreationStateMachine/`  
**Note:** Document ID is **061**. Draft filename `059_UNIVERSAL_CREATION_STATE_MACHINE_…` redirects here (059 is Discovery → Workspace Transition).

## Mission

Every creation in Spark Estate follows one universal lifecycle. The platform always understands where the work is, what is complete, what remains, and what should happen next.

## Core Principle

Every creation moves through a living lifecycle — not a checklist, wizard, or document.

## Universal Lifecycle

```text
Idea → Discovery → Foundation → Planning → Building → Review
  → Ready → Executing → Completed → Growth → Archive → Reuse
```

Workspaces may rename stages for members. Internally these states remain consistent.

## Transition Rules

Spark determines transitions. Users do not manually move states.

Transitions occur when confidence, dependencies, readiness, completion, and user decisions indicate progression. Reverse movement updates recommendations, readiness, and relationships automatically.

## Relationships

| Layer | Behavior |
|-------|----------|
| Readiness | Not the same as lifecycle — can be 95% while still Planning |
| Recommendations | Adapt to current state profile (060) |
| Conversation | Never asks questions from the wrong phase |
| Projects | Active in Planning → Executing; not Discovery |
| Cartography | Visualizes state evolution |

## Universal Rule

No Creation Workspace may invent its own lifecycle. Events, Books, Courses, Products, Memberships, Marketing, Research, Learning, Client Programs, and Business Planning all inherit this State Machine.

## Platform Principle

Spark Estate understands not only *what* the user is creating — it understands *where* that creation is in its life.
