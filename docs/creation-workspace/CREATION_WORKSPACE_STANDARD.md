# Creation Workspace Standard™

**Runtime:** `lib/creationWorkspace/` · **UI:** `components/companion/creationWorkspace/CreationWorkspacePanel.tsx`  
**Related:** [Universal Request-to-Outcome](../constitution/UNIVERSAL_REQUEST_TO_OUTCOME_INTELLIGENCE_STANDARD.md) · [Shari Answer-First General Help](../SHARI_ANSWER_FIRST_GENERAL_HELP_STANDARD.md) · [Research Library](../research/RESEARCH_LIBRARY_AND_USE_THIS_RESEARCH_STANDARD.md) · Create · Projects · Visual Thinking Studio · Strategic Planning · My Business Estate

**Answer-first:** Questions about creating (“How do I create…”, “What should a form include?”) receive a chat answer before Create opens. Explicit create commands still enter creation flows.

## Mission

A shared place to develop research, ideas, drafts, plans, and supporting materials **before** choosing Create, Projects, Visual Thinking Studio, Strategic Planning, or My Business Estate.

## Platform position

User Request → Universal Request Understanding → Research Collection (when needed) → Dynamic Creation Blueprint → Creation Package → **Creation Workspace** → Refine → Use This Work → Destination Handoff

## Responsibility separation

| Surface | Owns |
|---------|------|
| **Creation Workspace** | Developing unfinished work, section editing, research-on-selection, alternatives, versions, preparing handoffs |
| **Create** | Polished written assets, formatting, publication-ready packages |
| **Projects** | Execution records after proposal approval |
| **Visual Thinking Studio** | Visual/structural projection |
| **Strategic Planning** | Strategic review of candidates |
| **Research Library** | Research conversations and collections |
| **My Business Estate** | Approved authoritative business information |

## When to open / bypass

**Open** when a substantive Creation Package exists and the work is coordinated, multi-day, multi-deliverable, from research use, unknown/dynamic, or the user wants to keep developing.

**Bypass** for simple single items (e.g. short thank-you email), explicit Project-only or Visual-only requests, research-only continuation, or when another experience already owns the work.

Runtime: `decideCreationWorkspaceOpen()` · pipeline: `runRequestIntoCreationWorkspace()`.

## Models

- `CreationWorkspace` — session shell, views, versions, handoffs  
- `CreationWorkspaceItem` — stable reusable content objects  
- `CreationWorkspaceHandoff` — destination transfer with review flags  

## Projection and substance

`projectCreationPackageToWorkspace()` maps a Creation Package into a populated workspace.  
`validateCreationWorkspaceSubstance()` blocks empty, warning-only, request-echo, or collapsed multi-day packages from opening the standard UI.

## Editing and protection

Incremental section edits mark content `userEdited` + `protected`. Generated updates must not overwrite protected sections silently — they become suggestions.

## Research This

`researchSelectedWorkspaceArea()` researches one section, links a Research Collection, and proposes updates only for that scope.

## Missing pieces / alternatives / versions

Blueprint-driven `reviewMissingPieces()` (suggestions only). Alternatives store separately. Versions support restore without deleting later snapshots.

## Use This Work

`inferUseThisWorkOptions()` returns ~3–5 context-aware destinations. Handoffs are versioned JSON contracts consumed by destination-native code (not markdown shells):

- **Create** — `consumeCreationWorkspaceCreateHandoff()` hydrates native editor sections (no regenerate-from-prompt); conflict dialog if Create already has work  
- **Projects** — `consumeCreationWorkspaceProjectHandoff()` → Project Proposal Review; records only after approval  
- **Visual Thinking** — `consumeCreationWorkspaceVisualHandoff()` projects substantive Thinking Objects  
- **Strategic Planning** — candidates only (`autoApproved: false`)  
- **Business Estate** — field-level approval required (`silentWritebackAllowed: false`)  

**Full destination integration:** [CREATION_WORKSPACE_DESTINATION_INTEGRATION_STANDARD.md](./CREATION_WORKSPACE_DESTINATION_INTEGRATION_STANDARD.md) · runtime `lib/creationWorkspace/destination/`.

## Source of truth / sync

Workspace owns the developing package until intentional handoff. After handoff, destinations own their approved records. Later workspace edits offer update previews via `buildDestinationSyncPreview()` — never silent replace. Registry statuses prevent duplicate destination creation and stale reuse.

## Navigation

Contextual access (Create Begin for coordinated work, Research Library Use This Research → Create path, natural language: “open my creation workspace”, “keep working on this”). Not yet a permanent Welcome Home Build menu item — validate usage first.

## Persistence

`localStorage` keys in `types.ts`. Autosave on edit. Resume via Continue Previous Work groups.

## Accessibility

Keyboard navigation, semantic sections, visible focus, large targets, status text not color-only, narrow-screen drawer, focus after generation/handoff.

## Observability

Internal `trackCreationWorkspaceEvent` — never expose telemetry or store unnecessary sensitive content.

## Tests

`lib/creationWorkspace/creationWorkspace.test.ts` — projection, substance, five-day duration, unknown program, edit protection, Research This, missing pieces, alternatives/versions, Use This Work handoffs, simple-email bypass.

## Rollout

1. Ship workspace + Create Begin / Research handoff wiring.  
2. Deepen Create seed injection from handoff payload.  
3. Consume visual handoff key inside Visual Thinking Studio.  
4. Decide Welcome Home permanence from usage evidence.
