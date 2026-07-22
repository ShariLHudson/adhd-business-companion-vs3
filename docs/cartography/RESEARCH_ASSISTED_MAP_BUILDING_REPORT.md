# Research-Assisted Map Building — Implementation Report

**Date:** 2026-07-22
**Prompt archived:** `docs/cartography/SPARK_ESTATE_UNIVERSAL_RESEARCH_ASSISTED_MAP_BUILDING_CURSOR_PROMPT.md`
**Branch:** `deploy/companion-app-v3` (not committed)

## Summary

Added universal research-assisted building to every Cartography map type. A
member can now start a map without knowing the steps, structure, or framework.
Spark reads whether they are uncertain, offers three plain-language choices, and
— when they choose research — builds a first useful map at the detail level they
pick, preserving sources and per-branch confidence.

This extends the existing entry / guided-builder flow rather than adding a
parallel studio. `Begin My Map` still goes straight to the existing guided /
discovery builders (unchanged), so nothing regresses. Research is an additional,
opt-in path.

## Where it lives

New library: `lib/visualFocus/researchAssisted/`

| File | Responsibility |
|------|----------------|
| `types.ts` | `ResearchSource`, `MapNodeResearch`, `MapDetailLevel`, `MapKnowledgeState`, `ResearchEntryChoice`, `ResearchAssistedMapMeta`, `ResearchedDraftResult` |
| `detectResearchEntry.ts` | Reads a plain-language opening line → knowledge state + suggested choice + `shouldOfferResearch`. `extractTopic()` cleans the map title. |
| `researchModes.ts` | Three modes (overview / working / detailed), specialized per map type; `resolveDetailLevel()` maps natural language to a level. |
| `mapTypeFrameworks.ts` | Per-map-type research frameworks (honest scaffolds) with confidence + assumptions. Loom video is specialized for the primary example. |
| `buildResearchedDraft.ts` | Assembles a `VisualFocusNode` tree + `ResearchAssistedMapMeta` for any map type + detail level. |
| `index.ts` | Public API. |

Data model: `lib/visualFocus/types.ts` — `VisualFocusMap` gains optional
`detailLevel` and `research` (additive, intelligence-ready; existing maps
unaffected). Both added to `VisualFocusMapSnapshot` so version history and
save/reopen preserve research.

UI:
- `components/companion/cartographersStudio/MapResearchEntry.tsx` — new overlay:
  asks "What would you like to map?", detects uncertainty, offers the three
  choices, then one calm detail-level selection. One question at a time; primary
  action feedback on every button.
- `MapEntryPanel.tsx` — adds an opt-in "I'm not sure — research & build it with
  me" action (`onResearchBuild`). `Begin My Map` is unchanged.
- `VisualFocusWorkspacePanel.tsx` — `researchMapId` state, `openResearchEntry`,
  `handleResearchComplete` (builds → seeds map with `research` + `detailLevel` →
  `generateVisualFocusMap` → workspace). "Build from what I know" and "Help me
  think it through" route back to the existing guided / discovery builders.
- `app/companion/cartographers-studio.css` — styles for the stacked detail-level
  buttons.

## How research modes map per map type

Three modes are universal but the *result* adapts to the map type (not one
template). Node depth scales with detail: overview = primary nodes only; working
= primary + substeps; detailed = primary + substeps + tools/checks/warnings.

| Map type | Overview | Working | Detailed adds |
|----------|----------|---------|---------------|
| Process | Major stages in order | + action substeps | tools, quality checks, troubleshooting |
| Decision | Options + criteria | + tradeoffs | risks, reversibility, suggested next step (member decides) |
| Relationship | People + roles | + dependencies | communication paths, missing relationships |
| Journey | Stages | + goals/actions | emotions, friction, opportunities |
| Timeline | Phases | + milestones | durations, dependencies (dates → needs-confirmation) |
| Strategy | Goal + pillars | + initiatives | measures, assumptions, risks, sequencing |
| Opportunity | Needs + gaps | + potential offers | validation questions (hypotheses labelled) |
| System | Components | + flows | feedback loops, bottlenecks, boundaries |
| Priority | Items + criteria | + scoring logic | how each score was formed |
| Mind | Major concepts | + subtopics/examples | related questions to explore |

## Honesty / trust guarantees

- **No fabricated citations.** The recorded source is Spark Estate's built-in
  guidance (`authorityLevel: "authoritative"`), not invented URLs. When live web
  research is wired in later, `ResearchSource` already carries `url`,
  `organization`, `accessedAt`, `authorityLevel`.
- **Uncertainty is never hidden.** Branches that depend on the member's account,
  plan, or context are marked `needs-confirmation` (e.g. Loom sharing
  permissions). Assumptions and unresolved questions are stored separately from
  researched facts, and member-known facts are never mixed with researched ones.
- **Freshness.** Tool/market/time-sensitive topics are tagged `time-sensitive`
  with a refresh recommendation.

## Verification

- `node ./node_modules/vitest/vitest.mjs run lib/visualFocus/researchAssisted/researchAssisted.test.ts --pool=forks` → **33 passed**
- Regression: `VisualFocusWorkspacePanel.wallMapClick.test.tsx`,
  `CartographersStudioRoom.clickWiring.test.tsx`, `lib/cartographersStudio` →
  **50 passed** (onSelectWallMap wiring intact).
- `tsc --noEmit` → no new errors in any touched file (pre-existing WIP-branch
  errors elsewhere are unrelated).

Manual browser check (suggested):
1. Cartographer's Studio → click any wall map → entry panel.
2. Click "I'm not sure — research & build it with me" → topic prompt.
3. Type "how to make a Loom video" → "Research it for me" → choose detail level
   → a first Process Map opens in the workspace.
4. Confirm "Build from what I know" and "Help me think it through" still open the
   existing guided / discovery builders.

## Acceptance criteria status

- [x] Every map type supports research-assisted creation.
- [x] Users can begin without knowing the steps.
- [x] The system detects uncertainty and offers help.
- [x] Research builds a usable first map (no placeholder/empty branches).
- [x] Map structure adapts to map type (not one template).
- [x] Users can request more or less detail (three modes; changeable later).
- [x] Sources and confidence preserved on the map record + snapshot.
- [x] Assumptions clearly separated from facts.
- [x] Research does not overwhelm the default interface (opt-in, progressive).
- [x] Maps remain editable after research (standard edit/print/duplicate/etc.).
- [x] Research survives save/refresh/reopen (persisted on `VisualFocusMap`).
- [x] No step invented when evidence is insufficient (marked needs-confirmation).

## Coordination with parallel progressive-disclosure work

This change is **building** (constructing the map + research metadata). It does
not touch the intelligence/insight panels, `companionIntelligence/pipeline.ts`,
Business Canvas impact analysis, `IntelligenceViewModeToggle`, or `canvasSync.ts`
where a parallel agent may be adding earned-insight progressive disclosure. The
new `research` metadata is available for those panels to surface later
("Research Used", confidence, unresolved questions) without rework.

## Gaps / deferred (V2)

- **Live web research** — current frameworks are deterministic offline scaffolds.
  `ResearchSource` and freshness fields are ready for a real research provider.
- **Branch-level "Research This" / "Add More Detail"** actions on individual
  nodes (the map-level detail selection exists; per-branch expansion is a natural
  next step using `buildMapFramework` on a single branch).
- **In-place detail-level switching** on an existing researched map (the field is
  stored; a control to rebuild at a new level is deferred).
- **"Research Used" disclosure panel** and node-level source indicators in the
  workspace (data is persisted; surfacing UI deferred to align with the parallel
  progressive-disclosure work).
- **Convert to Tasks / SOP / Project** from a researched map reuses existing
  conversion paths; no new conversion added here.
- **Audience adaptation** field exists on the meta but the entry UI does not yet
  ask for audience (deferred to keep the entry to one question at a time).
