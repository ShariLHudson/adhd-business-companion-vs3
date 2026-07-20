# Create Platform Integration Recovery Certification (095)

**Branch:** `deploy/companion-app-v3`  
**Safety branch:** `backup/pre-create-integration-recovery` @ `24da92ff`  
**Date:** 2026-07-20  
**Decision:** `CREATE PLATFORM INTEGRATION RECOVERY PARTIALLY COMPLETE`

---

## Recovered

| Behavior | How |
|----------|-----|
| Audit of missing integrations | `CREATE_PLATFORM_INTEGRATION_RECOVERY_AUDIT.md` — `8d2ee13b` |
| Begin / Continue / Welcome foundation modules | Universal entrypoint, Begin outcome, Resume list, Welcome Active Work, sync canonical — `5af975a8` |
| Create Estate WorkingPanel host | Mounted in CPC when `createEstateWorkingActive` (staged, pending commit) |
| Create Entrance callbacks | `onBeginCreate` / `onResumeCreationWorkspace` / `onStartSomethingNew` (staged) |
| Estate open without legacy split | `startFreshCreateFromEstate` no longer calls `openCreateWorkspace` (staged) |
| Projects → Continue Active Work | `onResumeActiveWork` → `resumeActiveWorkspaceEntry` (staged) |
| Projects → Start Something New | `onStartSomethingNew` → `beginForceNewCreationFromUi("create")` (staged) |
| Welcome Continue Active Work | `resume-active-work` handled in `handleGlobalDailyOpeningChoice` (staged) |
| Creation chat isolation | `forbidCompanionSidePanelDuringCreation` gates (staged) |
| Create ↔ Project bridge hooks | `syncCanonicalWorkFromCreateWorkflow` + `connectCanonicalWorkToProjectHome` on WorkingPanel (staged) |

## Newly Implemented

- CPC Estate Create host wiring (never existed in committed history — implemented from test/doc contracts).

## Intentionally Not Restored

| Item | Why |
|------|-----|
| Legacy ContentGenerator as primary Create | Quarantined; Estate host replaces open path |
| Create Favorites surface | No product surface / Needs clarification |
| Talk It Out rebuild | Already mounted and wired; not a Create planner |
| Full Active Work list (non-lite) on Projects panel | Lite projection kept for Turbopack safety; resume uses Work ID hydrate |

## Projects

Create work appears under **Continue Your Work** via registry → `projectsContinueLite` cards.  
**Continue** now calls `resumeActiveWorkspaceEntry` → hydrate exact workspace → Estate WorkingPanel with the **same Work ID**.  
**Start Something New** opens Create Entrance force-new (new workspace).  
Archive/Trash still use panel lite defaults unless parent overrides.

## Talk It Out

**Present and working** as `activeSection === "talk-it-out"` with estate menu, How Do I, Focus help findability, and Welcome helpful lessons. Reflective room — not Create planning. Governance still marks not production-ready. No code restore required for 095.

## Tests

| Suite | Result |
|-------|--------|
| `createEstateDestination` + `resolveCreateBeginOutcome` + `creationWorkspaceOnly` | **21 passed** |
| Create host contract (agent run) | **14/14 passed** |
| Browser / Preview smoke (Projects ↔ Create, Talk It Out) | **Not run** |
| Event Plan unrelated assertion | 1 known unrelated fail in broader suite |

## Git

| Item | Status |
|------|--------|
| Pushed | `8d2ee13b` (audit), `5af975a8` (foundation) |
| Staged local | `CompanionPageClient.tsx` (+356/−41 Create host) |
| Blocked | Pre-commit **companion behavior audit** (33 pre-existing focus failures) — needs explicit `--no-verify` approval or audit exemption |
| Unrelated dirty tree | Preserved (not staged) |

## Final Decision

**`CREATE PLATFORM INTEGRATION RECOVERY PARTIALLY COMPLETE`**

Not `CERTIFIED` until:

1. CPC host commit is on `origin/deploy/companion-app-v3`
2. Browser/Preview proves Projects resume, Welcome resume, Begin → WorkingPanel, same Work ID
3. Talk It Out entry smoke (confirm still opens from intended points)

---

## Ask for Founder

Approve `git commit --no-verify` for the staged `CompanionPageClient.tsx` Create host wiring? Hook failures are the existing companion behavior audit (focus), not Create host contract tests (those pass).
