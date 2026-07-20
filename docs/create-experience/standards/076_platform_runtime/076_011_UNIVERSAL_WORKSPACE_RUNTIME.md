# 076 — Universal Workspace Runtime

## 1. Purpose
Define the shared runtime behavior of every Spark Estate workspace that hosts meaningful work.

This document governs runtime behavior, not visual styling.

## 2. Workspace Role
The Universal Workspace is the authoritative working environment for a Work ID.

It must support:

- editing
- section management
- research
- ideas
- examples
- AI collaboration
- versioning
- review
- output
- Project linkage
- Chamber and Board contribution
- pause and resume

## 3. Workspace Lifecycle

```text
uninitialized
→ resolving
→ initializing
→ hydrating
→ ready
→ active
→ saving
→ paused
→ closed
```

Error and recovery states may occur at any stage.

## 4. Workspace Identity

```ts
type WorkspaceIdentity = {
  workspaceId: string;
  workId: string;
  workspaceType: string;
  classificationType: string;
  sourceSurface: string;
  createdAt: string;
  hydratedAt?: string;
};
```

Workspace ID may change between implementations or sessions.

Work ID may not.

## 5. Initialization Contract
Initialization must:

1. receive authoritative classification
2. resolve or create Work ID
3. select structure
4. initialize section records
5. establish permissions
6. open first useful view
7. persist authoritative workspace state
8. verify persistence
9. expose a truthful ready state

## 6. Hydration Contract
Hydration must restore:

- title
- work type
- status
- active section
- section order
- content
- unresolved decisions
- research state
- save state
- last useful next step
- linked Projects and outputs
- relevant collaboration notes

Hydration must not rely solely on localStorage.

## 7. Active Runtime State

```ts
type UniversalWorkspaceState = {
  workId: string;
  activeSectionId?: string;
  activeView: string;
  dirty: boolean;
  saving: boolean;
  saveError?: string;
  lastSavedAt?: string;
  selectedText?: string;
  openPanels: string[];
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
};
```

## 8. Section Runtime
Every section is a first-class runtime object.

A section must support:

- open
- edit
- add
- delete
- restore
- duplicate
- move
- split
- merge
- research
- rewrite
- comment
- review
- status change

## 9. View Runtime
Views are projections over the same authoritative work.

Changing views may not create duplicate content.

Supported projections may include:

- outline
- section focus
- full draft
- executive summary
- detailed appendix
- action view
- history
- output preview

## 10. Workspace Commands

```ts
type WorkspaceCommand =
  | { type: "EDIT_SECTION"; sectionId: string; content: string }
  | { type: "ADD_SECTION"; afterSectionId?: string }
  | { type: "DELETE_SECTION"; sectionId: string }
  | { type: "RESTORE_SECTION"; sectionId: string }
  | { type: "MOVE_SECTION"; sectionId: string; targetIndex: number }
  | { type: "RESEARCH_SECTION"; sectionId: string; depth: string }
  | { type: "GENERATE_IDEAS"; sectionId?: string }
  | { type: "SAVE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "EXPORT"; format: string }
  | { type: "TURN_INTO_PROJECT" };
```

## 11. Command Execution Rule
Every command follows:

```text
validate
→ authorize
→ mutate
→ persist
→ verify
→ refresh derived views
→ confirm
```

No command may update only the visible UI and skip durable mutation when the action is supposed to persist.

## 12. Workspace Recovery
On crash, timeout, or failed save:

- preserve the local unsaved buffer
- identify the last durable version
- explain what is safe
- offer restore, retry, compare, or duplicate as branch
- never silently overwrite newer data

## 13. Multi-Surface Behavior
The same Work ID may be opened from:

- Welcome Home
- Create
- Projects
- Chamber
- Board
- Search
- Knowledge
- recent work

All surfaces must resolve to the same authoritative workspace.

## 14. Workspace Closure
Closing the workspace must not imply completion.

The platform must distinguish:

- close view
- pause work
- complete work
- archive work
- delete work

## 15. Certification
Browser certification must prove:

- initialization
- hydration
- editing
- section actions
- autosave
- manual save
- refresh
- resume
- view switching
- recovery
- multi-surface identity
- no duplicated work
