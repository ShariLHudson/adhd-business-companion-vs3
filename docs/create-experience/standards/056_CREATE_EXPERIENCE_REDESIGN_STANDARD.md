# 056 — Create Experience Redesign Standard

**Status:** Production Implementation Standard  
**Applies to:** My Work → Create (and every Create front door)  
**Extends:** [045](./045_PLATFORM_INTENT_ROUTING_AND_CREATION_STANDARD.md)–[055](./055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md)  
**Runtime:** `components/companion/CreateEstateEntrancePanel.tsx` · `lib/createEstate/` · `lib/universalCreationEntrypoint/`  
**Platform rule constant:** `lib/createEstate/platformCreationRule.ts`  
**Projects continues work:** [057 Projects Experience](./057_PROJECTS_EXPERIENCE_AND_AUTOMATIC_WORKSPACE_STANDARD.md)

## Mission

Transform Create from a category picker into a conversational creation entry point that uses the Universal Creation Engine and Universal Creation Entrypoint.

## Requirements

1. Remove category-first workflow as the primary path
2. Large natural-language input as the primary interaction
3. Categories become optional browse / inspiration — not required navigation
4. Every request routes through the Universal Creation Engine (via 055 Entrypoint)
5. Coordinate with Shari, Projects, Chamber, Board, Cartography, and the Relationship Registry
6. If existing work is found — resume it
7. If no work exists — create one canonical Creation Record
8. Never ask the user to decide where work belongs
9. Keep Create, Projects, Shari, Chamber, and Board synchronized through the same Creation Context
10. Continue Existing Work displays active Creation Workspaces — not only document drafts

## Global Platform Rule (binding)

Every Chamber member, Board member, Create, Projects, Visual Thinking, Shari, Search, Dashboard, and Cartography must use the same Universal Creation Engine and the same Creation Context.

There should never be separate logic for Create versus Events versus Marketing. They are different front doors to the same creation process.

## Create Entrance Layout

```text
Tell Shari what you want to create…   ← primary
[ Begin ]

Continue Existing Work                 ← Creation Workspaces
  · ADHD Workshop (Event) — Planning
  · …

Browse for inspiration (optional)      ← progressive disclosure
  Categories / types
```

## Platform Principle

> Users simply say what they want to create. Spark Estate takes care of everything else.

## Global Create Scroll & Reachability Rule (binding)

Applies to **all** Create surfaces (entrance, Event Workspace, every creation type) — not Event-only.

1. Create must never clip content.
2. The page must vertically scroll when content exceeds the viewport.
3. No button, recommendation, or section may become unreachable.
4. Keyboard navigation must work throughout the scrollable area.
5. The primary “I want to create…” input must be immediately visible on initial load.
6. On small screens and increased zoom, all controls remain accessible without layout breakage.

**Runtime:** one scrollport — `data-testid="create-estate-shared-scroll"` · `CREATE_SCROLL_AND_REACHABILITY_RULE` in `lib/createEstate/platformCreationRule.ts` · CSS under `[data-testid="create-estate-room"]` in `companion.css`.
