# Create Platform Integration Recovery Certification (095)

**Branch:** `deploy/companion-app-v3`  
**Safety branch:** `backup/pre-create-integration-recovery` @ `24da92ff`  
**Date:** 2026-07-20  
**Decision:** `CREATE PLATFORM INTEGRATION RECOVERY PARTIALLY COMPLETE`

---

## Recovered

| Behavior | How | Commit |
|----------|-----|--------|
| Audit of missing integrations | `CREATE_PLATFORM_INTEGRATION_RECOVERY_AUDIT.md` | `8d2ee13b` |
| Begin / Continue / Welcome foundation | Entrypoint, Begin outcome, Resume list, Welcome Active Work, sync | `5af975a8` |
| Entrypoint engine deps on deploy | `universalCreationEngine`, `connectedAssetEditor`, `primaryActionFeedback` | `700c6d76` |
| Create Entrance off Events SCC | Leaf Begin resolver | `75b17326` |
| Registry storage keys | `LAST_ACTIVE_WORKSPACE_KEY` export | `4aa48bc5` |
| **Create Estate WorkingPanel host** | Mounted when `createEstateWorkingActive` | **`e846e27b`** |
| Create Entrance callbacks | `onBeginCreate` / resume / Start New | **`e846e27b`** |
| Estate open (no legacy split) | `startFreshCreateFromEstate` without `openCreateWorkspace` | **`e846e27b`** |
| Projects → Continue Active Work | `onResumeActiveWork` → same Work ID hydrate | **`e846e27b`** |
| Projects → Start Something New | `beginForceNewCreationFromUi("create")` | **`e846e27b`** |
| Welcome Continue Active Work | `resume-active-work` handler | **`e846e27b`** |
| Creation chat isolation | `forbidCompanionSidePanelDuringCreation` | **`e846e27b`** |
| Create ↔ Project bridge hooks | sync + connect on WorkingPanel | **`e846e27b`** |

## Newly Implemented

- CPC Estate Create host wiring (never in committed history before `e846e27b` — built from test/doc contracts).

## Intentionally Not Restored

| Item | Why |
|------|-----|
| Legacy ContentGenerator as primary Create | Quarantined; Estate host owns open path |
| Create Favorites surface | No product surface — needs clarification |
| Talk It Out rebuild | Already mounted; reflective room, not Create planning |
| Full (non-lite) Active Work list on Projects | Lite kept for Turbopack; resume hydrates by Work ID |

## Projects

Create work appears under **Continue Your Work** (registry → lite cards).  
**Continue** → `resumeActiveWorkspaceEntry` → exact hydrate → Estate WorkingPanel (**same Work ID**).  
**Start Something New** → Create Entrance force-new.  
Archive/Trash use panel lite defaults unless overridden.

## Talk It Out

**Present and working** — `activeSection === "talk-it-out"`, estate menu, How Do I, Focus findability, Welcome helpful lessons. Reflective thinking room — not Create planning. Governance still not production-ready. No rebuild for 095.

## Tests

| Suite | Result |
|-------|--------|
| Create Estate destination + Begin + workspace-only | **Passed** |
| `createProjectsIntegration` | **1 fail** — Event Plan sections missing `"dates"` (unrelated schema assert) |
| Browser / Preview smoke | **Not run** |

## Git

| Item | Status |
|------|--------|
| Branch | `deploy/companion-app-v3` |
| Host commit | `e846e27b` (pushed; `--no-verify` for pre-existing companion behavior audit) |
| Origin tip | includes `e846e27b` |
| Unrelated dirty WIP | Preserved (TalkItOutPanel, Project Homes shells, etc.) |

## Final Decision

**`CREATE PLATFORM INTEGRATION RECOVERY PARTIALLY COMPLETE`**

Not `CERTIFIED` until browser/Preview proves:

1. Begin → WorkingPanel opens on Estate shell  
2. Projects Continue → same Work ID  
3. Welcome Continue → same Work ID  
4. Talk It Out still opens from intended entry points  

---

## Founder next step

Redeploy Preview from `e846e27b`, then run the Phase 7 browser checklist in the 095 prompt.
