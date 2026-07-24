# Creation Workspace Destination Integration Standard™

**Runtime:** `lib/creationWorkspace/destination/`  
**UI consumers:** Create (CompanionPageClient) · Visual Thinking Request Panel · Project Proposal Review · Strategy / Estate review panels  
**Parent:** [CREATION_WORKSPACE_STANDARD.md](./CREATION_WORKSPACE_STANDARD.md)

## Mission

Destination handoffs transfer **the work itself** — not a title, summary, empty shell, or route instruction. Members continue the same package in Create, Projects, Visual Thinking Studio, Strategic Planning, or My Business Estate.

## Architecture

```
Request → URO → Research → Blueprint → Creation Package
  → Creation Workspace → Use This Work → Destination Handoff
  → Destination Consumer → Populated experience
```

## Handoff contracts (versioned)

| Destination | Contract | Storage key |
|-------------|----------|-------------|
| Create | `CreationWorkspaceCreateHandoff` | `companion-creation-workspace-create-handoff-v1` |
| Visual Thinking | `CreationWorkspaceVisualHandoff` | `companion-creation-workspace-visual-handoff-v1` |
| Projects | `CreationWorkspaceProjectHandoff` | `companion-creation-workspace-project-handoff-v1` |
| Strategy | `CreationWorkspaceStrategyHandoff` | `companion-creation-workspace-strategy-handoff-v1` |
| Business Estate | `CreationWorkspaceEstateHandoff` | `companion-creation-workspace-estate-handoff-v1` |

Section payloads include: stable id, title, body, order, hierarchy, item type, userEdited, protected, sources, notes, placeholder status.

Builders: `buildCreateHandoff` · `buildVisualHandoff` · `buildProjectHandoff` · `buildStrategyHandoff` · `buildEstateHandoff`  
Prepared via `prepareCreationWorkspaceHandoff()`.

## Create consumer

`consumeCreationWorkspaceCreateHandoff()` → `hydrateCreateWorkflowFromHandoff()` → `startFreshCreateFromEstate({ seededSession })`.

1. Validate version / substance / staleness  
2. Conflict-check active Create work  
3. Map sections → `templateSections` + `sectionContent` (preserve order, edits, sources)  
4. Persist Create session  
5. Clear handoff storage only after success  

**Conflict options:** Open as New Creation · Save Current and Open · Cancel  

Does **not** regenerate from the original prompt.

## Visual Thinking consumer

`consumeCreationWorkspaceVisualHandoff()` in Visual Thinking Request Panel mount.

1. Validate + substance gate (reject title-only / outline-only / warning-as-primary)  
2. Infer representation (campaign sequence, process flow, journey, hierarchy, comparison)  
3. Project via VT knowledge → generation → presentation → `createThinkingWorkspace`  
4. Persist bundles; clear handoff only after success  
5. Recovery UI if projection fails (handoff preserved; retry projection only)

Five-day plans require five distinct day groups or sequence objects.

## Projects proposal consumer

`consumeCreationWorkspaceProjectHandoff()` opens **Project Proposal Review** (no records yet).

`approveCreationWorkspaceProjectHandoff({ mode: "approve_all" | "approve_selected" })` creates only approved phases/tasks via `createPersistedProjectHomeWithResult`, with source provenance pieces.

Duplicate destination creation is blocked by the handoff registry.

## Strategic Planning consumer

`consumeCreationWorkspaceStrategyHandoff()` opens candidates (`autoApproved: false`).  
`approveSelectedStrategyCandidates()` requires explicit selection. Nothing becomes approved strategy silently.

## Business Estate consumer

`consumeCreationWorkspaceEstateHandoff()` opens field-level proposals.  
`applyApprovedEstateProposals()` applies only checked fields. `silentWritebackAllowed: false`.

## Handoff registry

`CreationWorkspaceHandoffRegistry` tracks: handoff id, workspace id, package id, destination, payload version, status, destination entity id, created/consumed dates, failure stage, retry action, last sync.

Statuses: prepared · opening · consumed · ready_for_review · approved · completed · failed · cancelled · superseded  

Prevents duplicate creation, stale reuse, and silent loss after navigation failure. Failed handoffs remain retryable.

## Return paths

Every destination handoff stores `returnContext`. Destinations offer:

- Return to Creation Workspace  
- View Source Research (when collections exist)  
- View Original Request (when useful)

Do not rely on browser back alone. Runtime: `resolveDestinationReturnActions()`.

## Synchronization preview

After handoff, further workspace edits call `buildDestinationSyncPreview()`. Actions require approval:

- Update Destination · Keep Destination As Is · Create New Version · Review Differences  

Never silent synchronize. Runtime: `applySyncPreviewDecision()`.

## Failure recovery

| Failure | Behavior |
|---------|----------|
| Create consumption | Preserve handoff + workspace; conflict/retry UI; do not clear storage early |
| Visual projection | Preserve handoff; show written package recovery; retry projection only |
| Project proposal | Preserve proposal; no partial records |
| Strategy | Preserve candidates; never mark approved |
| Navigation | Keep registry entry; return to Creation Workspace; retry destination |

## Persistence

Handoffs: `sessionStorage` (destination keys).  
Registry: `sessionStorage` (`companion-creation-workspace-handoff-registry-v1`).  
Create / VT / Projects destination entities: existing destination stores.

## Automated tests

`lib/creationWorkspace/destination/destinationHandoffs.test.ts` + updated `creationWorkspace.test.ts` cover hydration, order, edits, sources, no prompt regen, stale/consumed guards, conflict, visual substance, five-day groups, projects approval selection, strategy non-auto-approve, estate field approval, registry, return paths, sync approval, bypass, multi-destination unknown creation.

## Browser scenarios

See parent standard and build brief: five-day → Create / Visual / Projects; strategy candidates; mentoring multi-destination; simple thank-you email bypass.

## Related docs to keep aligned

- Create estate / workspace-first Create docs  
- Visual Thinking Studio request-first docs  
- Projects proposal / Project Homes docs  
- Strategy Chamber / playbook docs  
- Business Estate writeback docs  
- Shared navigation + persistence notes  
