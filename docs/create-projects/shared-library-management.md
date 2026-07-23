# Shared Library Management — Create & Projects (Phase 1)

**Constitution:** [133 — Global Library & Collection Standard](../constitution/133_GLOBAL_LIBRARY_AND_COLLECTION_STANDARD.md)  
**Runtime:** `lib/sparkLibraryCollection/`  
**UI:** `components/companion/library/`  
**Date:** 2026-07-23  
**Phase:** **1 — foundation** (Create Continue Working + Projects)

---

## Mission

Scale Spark Estate collections without turning them into unmanageable lists. Members find, filter, sort, and maintain items from the card — opening is for content work.

---

## Architecture

```
lib/sparkLibraryCollection/
  types.ts                 — items, filters, sorts, capabilities, UI state
  capabilities.ts          — action menus from capability flags
  search.ts / filter.ts / sort.ts / paginate.ts
  applyLibraryQuery.ts     — compose search → filter → sort → page
  favorites.ts             — spark.libraryFavorites.v1
  persistLibraryState.ts   — spark.libraryUiState.v1 (per surface)
  relationships.ts         — linked project / source creation labels
  creationActions.ts       — rename, archive, trash, duplicate, turn into project
  projectActions.ts        — rename, archive, restore, duplicate, status
  adapters/
    creationAdapter.ts     — Active Workspace Registry → LibraryItem
    projectAdapter.ts      — Project Homes → LibraryItem

components/companion/library/
  LibraryShell · LibraryToolbar · LibrarySearch
  LibraryFilterControl · LibrarySortControl · LibraryViewControl
  LibraryFilterChips · LibraryItemActionMenu · LibraryCard
  LibraryRenameDialog · LibraryEditDetailsDialog
  CreationLibraryPanel · ProjectLibraryPanel
```

Adapters map domain records into a shared `LibraryItem`. UI components stay free of Create/Project conditionals except at the panel boundary.

---

## Phase implemented (1)

| Capability | Create | Projects |
|------------|--------|----------|
| Search | Yes | Yes |
| Filter (single control + chips) | Yes | Yes |
| Sort (persisted) | Yes | Yes |
| Comfortable / Compact view | Yes | Yes |
| Three-dot action menu (always visible) | Yes | Yes |
| Favorite + Favorites filter | Yes | Yes |
| Archive / Restore | Yes | Yes |
| Rename (dialog) | Yes | Yes |
| Edit Details (metadata dialog) | Yes | Yes |
| Relationship on card | Linked Project | Source Creation |
| Load More | Yes | Yes |
| State restore on return | Yes | Yes |
| Move to Trash | Yes (soft seam) | **No** (Phase 2) |
| Folders / tags / bulk select in library | Deferred | Deferred |

---

## Capability model

Each item carries `LibraryItemCapabilities`:

- `canRename` · `canEditDetails` · `canDuplicate` · `canArchive` · `canRestore`
- `canTrash` · `canFavorite` · `canCreateProject` · `canViewLinkedProject`
- `canViewSourceCreation` · `canChangeStatus` · `canContinue` · `canOpen`

Menus only render supported actions. Unsupported actions are omitted — never disabled mystery items.

---

## Creation actions (when valid)

- Continue Editing (primary)
- Rename · Edit Details · Duplicate
- Turn Into Project · View Linked Project
- Favorite / Remove Favorite
- Archive · Restore
- Move to Trash (confirm: `Move “[Item]” to Trash?`)

---

## Project actions (when valid)

- Open Project (primary)
- Rename · Edit Details · Duplicate Project
- View Source Creation · Change Status
- Favorite / Remove Favorite
- Archive · Restore
- Delete / Trash **hidden** in Phase 1 (no safe soft-delete seam for Project Homes)

---

## Search / filter / sort

**Search fields:** title, description, type, tags, linked item name, client/audience (when present). Debounced (~220ms).

**Create filters:** All · In Progress · Draft · Completed · Favorites · Archived  

**Project filters:** All · Active · Planning · Waiting · Completed · Favorites · Archived  

Active filters appear as removable chips + **Clear Filters**.

**Create sorts:** Recently Updated · Recently Created · Name A–Z · Name Z–A · Status · Creation Type  

**Project sorts:** Recently Updated · Recently Created · Name A–Z · Name Z–A · Status · Due Date  

Last sort (and search/filter/view/scroll) persist per surface in `spark.libraryUiState.v1`.

---

## Relationships

- Creation card: `Linked Project: [Name]` → navigates to Project Home  
- Project card: `Source Creation: [Name]` → resumes linked creation when available  
- Archiving one side does **not** archive or delete the other  
- Content is never duplicated from Create into Projects

---

## Archive behavior

- Removes item from default/active views  
- Preserves the record  
- Available under **Archived** filter  
- **Restore** returns it to active views  
- Linked peer remains intact

---

## Deferred (Phase 2+)

- Project Trash / soft-delete with recovery  
- Folders & member tags as first-class browse  
- Bulk multi-select inside the shared library toolbar  
- Journal, Evidence Vault, Spark Cards, Founder libraries adopting the shell  
- Server-side pagination when lists leave localStorage scale  

---

## Accessibility

- Menu trigger: `Actions for [Item Name]`  
- Keyboard open/close; Escape closes; focus returns to trigger  
- Menu panels avoid clipping (`z-index` + bounded width)  
- ≥48px targets on primary controls and menu items  
- No hover-only actions  
- Dialogs labeled (`role="dialog"` + `aria-labelledby`)  
- Menu clicks `stopPropagation` so the card does not open  

---

## State preservation

On return to Create or Projects library:

- search · filter · sort · view · visibleCount · scrollTop (best effort)

---

## Consumers

| Surface | Integration |
|---------|-------------|
| Create / Continue Working | `CreateWorkspaceResumeList` → `CreationLibraryPanel` |
| Projects | `ProjectHomesPrototypePanel` → `ProjectLibraryPanel` |

Manage My Work (bulk archive/trash) remains available beside the Create library for recoverable cleanup.
