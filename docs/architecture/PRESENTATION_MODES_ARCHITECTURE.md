# Presentation Modes Architecture

**Status:** Accepted — foundational ADR (not a feature build)  
**Effective:** Immediately for all new development  
**Runtime module:** `lib/presentation/`

## Purpose

Spark has one companion, one memory, one intelligence, one conversation, one database, and one feature set. **The presentation layer is interchangeable.**

This document records the architectural decision so future presentation modes (Focus Workspace, Adaptive) can ship without rewriting business logic, routing intelligence, or data layers.

**We are not building Focus Workspace now.** We are designing so it can be added later.

## Core principle

Changing presentation must **never** change:

- conversations
- memory
- projects
- routing intelligence (intent → capability → feature)
- tools and workflows
- user data (history, evidence, preferences)

Only the **visual experience** changes.

## Presentation modes (roadmap)

| Mode | Status | Character |
|------|--------|-----------|
| **Spark Estate** | Default (today) | Immersive rooms, ambient environments, estate storytelling, animated transitions |
| **Focus Workspace** | Future | Minimal UI, workspace-first layout, faster transitions; same features, different shell |
| **Adaptive** | Future | Learns preferred presentation (e.g. Focus during business hours, Estate for reflection); user always in control |

### Example: Evidence Vault

| Mode | Presentation | Feature logic |
|------|----------------|---------------|
| Spark Estate | Entrance doors → key → doors open → journal room | Evidence capture, retrieval, vault intelligence |
| Focus Workspace | Clean workspace panel | **Same** Evidence Vault functionality |

## Architectural separation

### Feature logic (stable)

Business rules, data access, intelligence hooks, activation flows, and companion behavior live in **feature modules** — never in estate room components.

Examples:

- Evidence Vault → `lib/evidence/`, evidence-bank section logic
- Hall of Accomplishments → portfolio / growth intelligence
- Discovery Engine → discovery and observatory intelligence
- Cartographer → visual-focus / cartographers-studio logic
- Breathe → breathe session logic
- Journal → journal / growth-journal logic
- Chamber → `lib/chamber/` (member registry, activation)
- Personal Library → growth-library logic

### Presentation (interchangeable)

How a feature **looks** and **feels**:

- Estate room shell
- Workspace panel
- Mobile layout
- Voice-only layout

**Rule:** Feature logic must never import estate visuals, room backgrounds, arrival animations, or immersive layout CSS to make decisions.

## Routing

**Routes open features. Presentation determines how they appear.**

1. Resolve **which feature** the member needs (intent, capability, companion routing).
2. Open the feature via `openSparkFeature()` or equivalent — uses canonical feature route.
3. **Presentation mode** selects which shell component mounts around the same feature surface.

Today all features render through Spark Estate. The registry already maps future Focus Workspace surfaces as `null` (not built) with safe fallback to Estate.

## Data

User data is shared across all presentation modes. Switching presentation never changes:

- history
- conversations
- evidence
- projects
- memory
- preferences (except the presentation preference itself)

## User setting (future)

Settings → Workspace Experience:

- Spark Estate
- Focus Workspace
- Adaptive

This is a **presentation preference only** — stored separately from feature data. Stub: `lib/presentation/presentationModePreference.ts`.

## Development rules (effective now)

Before merging feature work, ask:

1. **Could this logic run in Focus Workspace without estate assets?** If no → move logic out of the room component.
2. **Does routing depend on a room name or background?** If yes → route on `SparkFeatureId` / capability, not visual place copy.
3. **Does switching presentation require a data migration?** If yes → redesign; data must be mode-agnostic.
4. **Is this import from `app/companion/*estate*.css` or immersive layout in a `lib/` module?** If yes → violation.

### Do

- Put business rules in `lib/<feature>/`
- Register features in `lib/presentation/sparkFeatureRegistry.ts`
- Navigate via `openSparkFeature(featureId)` when opening a named capability
- Keep estate arrival / animation in presentation components only

### Do not

- Couple intelligence or storage to `estatePlaceId` visuals
- Branch feature behavior on `presentationMode` until Focus Workspace exists (except presentation shell selection)
- Build Focus Workspace UI in this phase

## Related documents

| Document | Relationship |
|----------|----------------|
| `AGENTS.md` (presentation-modes-architecture) | Binding agent rule |
| `.cursor/rules/presentation-modes-architecture.mdc` | Cursor enforcement |
| `lib/workspaceMode.ts` | **Different concern** — chat vs doing layout beside conversation |
| `docs/estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md` | Intent → capability routing (unchanged by presentation) |

## Registry

Canonical feature IDs and per-mode surfaces: `lib/presentation/sparkFeatureRegistry.ts`
