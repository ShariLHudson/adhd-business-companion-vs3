# 055 — Universal Creation Entrypoint Standard

**Status:** Production Implementation Standard  
**Applies to:** Every Creation Workspace in Spark Estate  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[054](./054_CONNECTED_ASSET_EDITOR_FRAMEWORK.md)  
**Member Create surface:** [056 Create Experience Redesign](./056_CREATE_EXPERIENCE_REDESIGN_STANDARD.md)  
**Runtime:** `lib/universalCreationEntrypoint/`

## Mission

Users should never have to decide where to start. Spark Estate accepts creation requests from anywhere and routes them into the correct canonical Creation Workspace.

## Core Principle

```text
Many Entry Points
  → Intent Resolution
  → Existing Creation Detection
  → Creation Resolution
  → Canonical Creation Workspace
  → Continue Working
```

The user chooses where to begin. Spark Estate chooses where the work belongs.

## Platform Principle

There is never a Create version, Projects version, Marketing version, Events version, or Shari version of the work.

There is only:

```text
One Creation → One Creation Record → One Workspace → One User Experience
```

## Supported Entry Points

Shari · Create · Projects · Chamber · Board · Cartography · Dashboard · Home · Search · Existing Conversations · Existing Assets · Notifications · Recommendations · Related Work

Future entry points inherit this rule automatically.

## Confidence Routing

| Confidence | Behavior |
|------------|----------|
| **High** | Open or resume workspace immediately |
| **Medium** | One clarifying question if required, then open |
| **Low** | Answer naturally — do not create a workspace |

## Existing Work Resolution

Before creating anything, search Creation Records, workspaces, projects, assets, conversations, aliases, and drafts. If found — **resume. Never duplicate.**

## Failure Conditions

Separate workspaces by entry source · disconnected assets by Chamber · repeated discovery · duplicate Creation Records · users manually linking assets.

## Platform Principle

> Users begin wherever is most natural. Spark Estate ensures every piece of work belongs to one connected Creation Workspace, one Creation Record, and one living Creation Ecosystem.
