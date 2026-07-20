# 079 — Workspace Navigation System

## Purpose

Define predictable movement within and between workspaces.

## Required Navigation Layers

### Global Navigation

Provides access to:

- Welcome Home;
- Create;
- Projects;
- Chamber of Momentum;
- Round Table Board;
- Founder Studio;
- Business Estate;
- Knowledge;
- Cartography;
- Settings.

### Work-Level Navigation

Provides:

- Work title;
- Work type;
- current status;
- Full Workshop Map;
- related Projects;
- related research;
- version history;
- output actions;
- return destination.

### Section-Level Navigation

Provides:

- section title;
- previous section;
- next section;
- return to map;
- section status;
- save state.

## Return-Path Contract

Every navigation action must preserve a return path.

Example:

```text
Projects
→ linked task
→ source work
→ Audience section
→ Return to Projects
```

The member must return to the originating context rather than being sent to a generic landing page.

## Start New Behavior

“Start New” must:

1. preserve the current work;
2. confirm only when unsaved risk exists;
3. create a new Work ID;
4. avoid replacing the current work record;
5. offer a way to return to the previous work.

## Switching Work

When switching work:

- autosave first;
- preserve active section;
- record stopping point;
- open the selected Work ID;
- provide a clear way back.

## Navigation Anti-Patterns

Prohibited:

- dead breadcrumbs;
- menus that change meaning by destination;
- “Back” actions that lose the Work ID;
- opening a new work item over the current one without preservation;
- routing a completed section to a read-only summary;
- forcing the member through the Full Workshop Map when they intentionally opened a direct section link.
