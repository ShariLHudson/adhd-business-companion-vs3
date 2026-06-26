# Conductor Integration Report

Sprint: wire the live app through `resolveCompanionRenderContext()` / `buildCompanionPageRenderContext()` without adding rooms, UI, or parallel intelligence systems.

## Wired to constitutional conductor

| Path | Entry point | Notes |
|------|-------------|-------|
| `app/companion/CompanionPageClient.tsx` | `buildCompanionPageRenderContext()` | Scene family, seed, clear-my-mind, environment + presence data attrs |
| `lib/companionIntelligenceRouter.ts` | `resolveConversationIntelligence()` + `resolveCompanionIntelligence()` | Turn bundle exposes `conversation` + `orchestration` from conductor |
| `lib/sceneRenderContract/sceneResolver.ts` | `resolveCompanionRenderContext()` | Scene Render Contract receives environment/presence from pipeline |
| `lib/sceneRenderContract/sceneLayoutEngine.ts` | `environment.placeId` | Layout uses constitutional place; no presence/place in room engine attrs |
| `components/companion/scene/SceneRenderer.tsx` | `environment.motionProfile` | Living Border place from Environment Intelligence |
| `lib/mapWorkspaceToRoom.ts` / `placeForSection()` | `resolvePlace()` | Section → place delegates to Environment Intelligence |
| `lib/focusLandscape/evaluateFocusLandscape.ts` | constitutional presence removal | No `data-sharis-presence` / `data-homestead-place` overrides |
| `lib/planningTable/evaluatePlanningTableRoom.ts` | constitutional presence removal | Same guardrail as focus landscape |

## Still legacy (intentionally deferred)

| Path | Why deferred |
|------|----------------|
| `lib/companionIntelligence.ts` (`buildCompanionIntelligence`) | Chat hints and discovery phase; not render authority. Next pass: align hints with `orchestration.activeIntelligences` |
| `lib/intentRoutingIntelligence.ts` | API/chat intent routing; separate from render pipeline |
| `lib/companionEnvironmentIntelligence/` | Welcome living-room path; documented exception to constitutional environment for arrival chrome |
| `lib/presenceIntelligence/` (hospitality) | Arrival hospitality layer; distinct from constitutional `presenceIntelligence/` |
| Section open / nav handlers in `CompanionPageClient` | User actions and shell state; must *feed* conductor, not replace it |
| `effectiveViewSize` / chat layout mode | Shell-owned UX preferences; not environment authority |
| Focus category selection in `FocusAreaPanel` | Panel owns user selection; scene resolver receives `focusCategoryId` as input |

## Must never be used again (render authority)

- **Independent room/scene choice in page client** — use `buildCompanionPageRenderContext()` / `resolveCompanionRenderContext()`.
- **`data-homestead-place` / `data-sharis-presence` from room engines** — Environment + Presence Intelligence only.
- **Parallel `sceneForContext` in UI components** — canonical copy lives in `lib/companionConstitution/companionPageRenderContext.ts`.
- **Living Border choosing its own place** — use `environment.motionProfile.livingBorderPlaceId`.
- **Workspace panels overriding constitutional place** — panels pass inputs; conductor resolves place.

## Guardrail tests

- `lib/companionConstitution/companionPageRenderContext.test.ts` — page bridge + layer order + place override warning
- `lib/companionConstitution/companionConstitution.test.ts` — full pipeline
- `lib/companionIntelligenceRouter.test.ts` — orchestration delegation
- `lib/sceneRenderContract/sceneRenderContract.test.ts` — scene contract integration

## Visible behavior

No intentional visible changes in this sprint. Global background mapping (`sceneForContext`, brain-dump recovery, home first-message emotion) was moved into `companionPageRenderContext.ts` with parity preserved.
