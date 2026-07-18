# 190 — Final report

## Root cause of missing created projects

`completeImmediateCreateProjectOpen` opened Project Homes without passing `initialView: "create-purpose"`, so members landed on an empty gallery while chat asked for a name. Secondary: `saveProject({ id })` no-op when id missing; archive only in memory; no persist confirmation.

## Source of truth

`companion-projects-v1` + `companion-project-items-v1` (localStorage). No Supabase project table.

## Persistence changes

- `saveProjectWithResult` — upsert, `safeLocalStorageSet`, `companion-projects-updated`
- `Project.archived`, `Project.projectHomeRoomId`
- Archive / restore / focus sync to store
- Create confirms persist before success UI

## Files modified (high level)

- `lib/companionStore.ts`, `lib/projectHomes/homeActions.ts`, `types.ts`, `index.ts`
- `lib/projects/projectPieces190.ts`, `projectCreation190.test.ts`
- `components/companion/ProjectsPanel.tsx`
- `components/companion/projectHomes/ProjectHomesPrototypePanel.tsx`, `ProjectHomeDetail.tsx`
- `app/companion/CompanionPageClient.tsx` (scoped)
- `lib/createExperience/createExperienceRouting.ts`
- `lib/conversationStabilization/*` (opener + continuation)
- `lib/projectGrouping.ts`
- `docs/navigation/190_*`

## Tests

`projectCreation190`, `projectHomesUsability`, `createExperienceRouting` — pass.  
Two unrelated conversationStabilization navigation/research cases still fail (pre-existing).

## Authenticated smoke

Not run in this session — required before deploy.

## Production readiness

**Not ready.** Do not deploy until authenticated smoke scenarios 1–16 pass.
