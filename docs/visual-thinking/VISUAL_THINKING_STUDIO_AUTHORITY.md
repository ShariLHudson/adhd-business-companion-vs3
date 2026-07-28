# Visual Thinking Studio — Authority Record

| Field | Value |
|-------|-------|
| **Type** | Authority record (decisions only — not a specification, not a redesign) |
| **Scope** | The Visual Thinking Studio (VTS) subject |
| **Sits under** | Companion Constitution v1 → subject authorities, per [`docs/constitution/README.md`](../constitution/README.md) (Product Authority Hierarchy) |
| **User-facing name** | Visual Thinking Studio (legacy technical ids `cartographers-studio` / section `visual-focus` / env `visual-thinking-studio` remain for compatibility; `focus-studio` and `decision-compass` are **separate** features) |

## Authority Scope

This document records the authoritative ownership of the Visual Thinking Studio.

- It does not redefine product behavior.
- It does not replace implementation specifications.
- It does not replace engineering documentation.

Its purpose is to identify Primary Authority, Supporting Authorities, Historical References, the Current System of Record, Runtime Architecture, Research ownership, the Canonical map model, existing reusable systems, and Remaining Product Decisions. Where a genuine product choice is still open, it is listed under **Remaining Product Decisions** rather than decided here.

---

## Primary Authority

- **Visual Thinking Studio First Upload Package** — the redesign-direction package: `01_MASTER_EXPERIENCE_SPEC`, `02_DECISION_MAP_MODEL`, `03_EDITING_AND_CANVAS_REQUIREMENTS`, `05_ADHD_UX_RULES`, and `06_ACCEPTANCE_TESTS` (the 50-test acceptance contract). Owns *what the Studio must become* and the "one shared saved model" rule.
- The package is **audit-first and reuse-first** (its own first rule; Acceptance Tests 49–50 forbid duplicate Studios and require reusing shared research/conversation systems). Its canonical in-repo home is this `docs/visual-thinking/` folder, pending filing.

## Supporting Authorities

- **Platform capability:** `04_RESEARCH_EVERYWHERE_REQUIREMENTS` — a *shared platform* research capability VTS consumes (not a VTS-owned system).
- **Engineering (module) standards:** the `docs/cartography/VISUAL_THINKING_*_STANDARD.md` set (experience-orchestrator, generate-first, generation-engine, knowledge-intelligence, layout-engine, presentation-intelligence, recommendation-intelligence, request-and-output, research-acquisition, understanding-engine, workspace-foundation, workspace-editing) plus [`VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md`](../cartography/VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md), [`VISUAL_THINKING_INTEGRATION_STANDARD.md`](../cartography/VISUAL_THINKING_INTEGRATION_STANDARD.md), and [`VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md`](../cartography/VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md). These govern live modules and are implementation-facing **beneath** the experience package above.

## Implementation Reference

- Active redesign driver: [`CARTOGRAPHERS_STUDIO_PROGRESSIVE_DISCLOSURE_REDESIGN.md`](../cartography/CARTOGRAPHERS_STUDIO_PROGRESSIVE_DISCLOSURE_REDESIGN.md) ("Implemented, not committed" — the calm-down direction after the generated map "screamed").
- `docs/cartography/*_FIX.md` corrective notes.

## Historical References

- `docs/cartography/*_REPORT.md` (completion/build reports), all `*_CURSOR_*_PROMPT.md` build prompts, and the `140_*` cartography/visual-thinking prompt/report/results — point-in-time build lineage, not current authority.
- Stale markers to disregard: `atlas.ts` "only Mind Map in the MVP" (contradicted by all-active `mapDefinitions.ts`); the unreproducible "needs redesign / all map items editable" audit quote.

## Current System of Record

The live code is the system of record for actual VTS behavior:
- **System A — `lib/visualFocus/**`** (mature, production-wired): editable mind-map canvas, 13 map modes, business canvas, versions/lifecycle, analysis/summary derived from the saved model, print.
- **System B — `lib/cartographersStudio/**`** (request→generate pipeline + calm `ThinkingWorkspace`): the request-first entry; generation is deterministic (`deterministic_v1` / `research_placeholder` / `user_supplied`).
- **System C — Decision Compass** (`lib/decisionCanvasModel.ts`, `components/visual-thinking/VisualMindMap.tsx`): read-only decision-map visualization (separate feature).
- **Room/place:** `components/companion/cartographersStudio/CartographersStudioRoom.tsx` (place id `cartographers-studio`, section `visual-focus`).

## Runtime Architecture

Three parallel map/canvas implementations exist today (the central duplication): System A (`VisualFocusNode` tree), System B (`ThinkingObject` graph), System C (`VisualThinkingNode` decision graph); two editable canvases (`MindMapEditableCanvas`, `ThinkingWorkspace`); two routing/recommendation layers; a code guard `assertNoDuplicateVisualThinkingEngines`. Persistence: System A localStorage `companion-visual-focus-maps-v1`; System B sessionStorage (`companion-visual-thinking-*`, `companion-vt-*`). AI analysis is **deterministic/rule-based** today; real model interaction happens via the companion "Ask Shari" bridge. Exports: print/SVG only (`printMap.ts`). **No new engine is warranted — reconciliation converges these, it does not rebuild them.**

## Research ownership

Research is a **shared platform capability**, not a VTS-owned system: `lib/research/**` + `lib/researchLibrary/**` + the capability-registry `RESEARCH` group. VTS **consumes** it and attaches findings *additively* to the map model (handoff key `companion-research-library-visual-handoff-v1`). The two VTS-local research paths (`lib/visualFocus/researchAssisted/**`, `lib/cartographersStudio/visualThinkingResearchAcquisition.ts`) should become **thin adapters** over the shared engine — never a third research system (Acceptance Tests 39/49). Status contract per `04`: idle → queued → researching → organizing → completed → failed → timed_out → interrupted → cancelled.

## Canonical map model

**Recommended (pending Shari ratification — see below):** System A's **`VisualFocusMap`** (`lib/visualFocus/types.ts`) as the *one* persisted model that map, relationships, analysis, and summary all read from — satisfying `02_DECISION_MAP_MODEL`'s "one source of truth." System B generation output and System C decision maps converge onto it via adapters; the existing `decision-tree` mode already expresses decision maps. Internal node/map ids and storage stay stable to preserve saved work.

## Existing reusable systems

Reuse (do not rebuild): the `VisualFocusMap` model; editing + history (`mindMapEditing.ts`, `mindMapHistory.ts`); layout (`visualLayout.ts`); analysis/summary (`analysis.ts`, `decisionSummary.ts`); the request-first entry + generation pipeline (`lib/cartographersStudio/visualThinking*`); persistence (`store.ts`); print (`printMap.ts`); research-assisted metadata; the room (`CartographersStudioRoom.tsx`); the ~40 existing test files (map to the 50 acceptance tests).

## Remaining Product Decisions

*(Open — pending Shari; not decided here.)*

1. **Canonical map model** — ratify `VisualFocusMap` as the single persisted model that Systems B and C converge onto.
2. **Single canvas** — which interactive surface is primary (`MindMapEditableCanvas` vs the calm `ThinkingWorkspace`) and the merge target.
3. **Decision Compass** — fold into the `decision-tree` mode, or keep as a separate session that renders a VTS map.
4. **Research ownership** — confirm the shared `lib/research` capability as the one engine; VTS paths become adapters.
5. **Authority ratification** — this experience package sits above the existing `docs/cartography` "Binding" standards.
6. **Exports scope** — print only, or add image / markdown / JSON.

## Related Authorities

**Depends on:**
- Companion Constitution v1 — product-principle apex
- Product Authority Hierarchy — [`docs/constitution/README.md`](../constitution/README.md)

**Related subject authorities:**
- [Spark Card Authority](../spark-card/SPARK_CARD_AUTHORITY.md)
- Welcome Home / Resident Journey authorities — [`FIRST_60_DAYS_WELCOME_EXPERIENCE.md`](../estate/FIRST_60_DAYS_WELCOME_EXPERIENCE.md) · [`126 First-Time Welcome`](../product-specifications/126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD.md)
- Estate Place authorities (where applicable) — [`ESTATE_ARCHITECTURAL_AUTHORITY.md`](../estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) · [`ESTATE_PLACE_MASTER_MANIFEST.json`](../estate/ESTATE_PLACE_MASTER_MANIFEST.json) · [`ESTATE_REGISTRY.md`](../estate/ESTATE_REGISTRY.md)

**If guidance conflicts:**

Companion Constitution → Product Authority Hierarchy → This Authority → Engineering Standards → Implementation.

---

*This is a decision record. It records authority and does not modify code, models, research behavior, or the Studio experience. Open product choices remain with Shari.*
