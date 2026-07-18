# 190 — Project Creation Depth, Persistence & Workspace Correction

## Root cause (missing projects)

Primary: Create Project intent opened Project Homes on **gallery** because `completeImmediateCreateProjectOpen` ignored `initialView: "create-purpose"`.

Secondary: `saveProject({ id })` silently no-op’d when id was missing; localStorage writes swallowed errors; archive lived only in React memory; dual create UIs (Project Homes vs ProjectsPanel).

## Source of truth

| Store | Key |
|-------|-----|
| Projects | `companion-projects-v1` |
| Structure | `companion-project-items-v1` |

Optional fields on `Project`: `archived`, `projectHomeRoomId`.

## Fixes

1. Pass `initialView` into Project Homes open path.
2. `saveProjectWithResult` — upsert + persist confirmation + `companion-projects-updated`.
3. Flexible main pieces (Add another) on ProjectsPanel + Project Homes create.
4. Create flow: intention → why → pieces → room → Create Project → Project Home.
5. Archive/focus persist; ProjectBreakdown in Plan; Build With Shari propose → approve.

## Deployment

Do **not** deploy until authenticated smoke (package scenarios 1–16) passes.
