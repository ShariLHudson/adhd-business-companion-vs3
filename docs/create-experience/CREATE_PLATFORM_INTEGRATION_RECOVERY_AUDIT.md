# Create Platform Integration Recovery Audit (095)

**Branch:** `deploy/companion-app-v3`  
**HEAD at audit:** `24da92ff`  
**Safety branch:** `backup/pre-create-integration-recovery` → `24da92ff`  
**Date:** 2026-07-20  
**Status:** Inventory complete — implementation in progress

---

## Phase 1 — Repository truth

| Fact | Value |
|------|--------|
| Current branch | `deploy/companion-app-v3` |
| HEAD | `24da92ff` — Project Homes sample/explore exports |
| Remote | `origin/deploy/companion-app-v3` (pushed through isolation fixes) |
| Safety branch | `backup/pre-create-integration-recovery` @ `24da92ff` |
| Worktrees | main repo; `.vercel-build-check` @ `66e690b8`; `companion-app-verify-c561639` @ `c5616393` |
| Stashes | 4 (oldest on `main` / `v4.0-development` — not Create Estate host wiring) |
| Certified runtime tip | `a940ad0b` — runtime consolidation (PARTIAL) |
| Event foundation | `de0af701` → consolidation sequence → `a940ad0b` |
| Recent Create commits | Turbopack isolation (`b50f0c5f`…`24da92ff`) — not platform host wiring |

### Where missing behavior lives

| Hypothesis | Finding |
|------------|---------|
| Committed history in CPC | **`CreateEstateWorkingPanel` never appears in any committed `CompanionPageClient.tsx`** |
| Another branch | Cursor create branches exist; none supply a full CPC WorkingPanel mount in history searched |
| Stash | No Create Estate host mount recovered from stash listing |
| Uncommitted WIP | Entrance panel / universal entrypoint / welcome Active Work **libs** are dirty or untracked; CPC itself is almost clean (+lazy Project Homes only) |
| Docs ahead of code | HARDENING_071 / quarantine docs **describe** resume + WorkingPanel as if present — **aspirational** |
| Tests as contract | Source-scanning tests encode the intended CPC wiring that was never committed |

**Conclusion:** Runtime libs were certified; **platform host integration in CPC was never shipped**. A pull cannot recover it.

---

## Phase 2 — Missing-change inventory

| Intended capability | Expected location | Current status | Code/history source | Missing reason | Recovery action | Risk |
|---|---|---|---|---|---|---|
| Create under Projects (Active Work list) | `ProjectHomesPrototypePanel` + registry | Present and working (lite LS projection) | `projectsContinueLite.ts` (committed) | N/A for list | Keep lite for Turbopack; optionally rejoin full projection later | Low |
| Create under Projects (open / same Work ID) | `onResumeActiveWork` → hydrate + Estate working | Present but disconnected | Panel prop exists; CPC never passes it | Left out of narrow commits / never implemented | Wire `onResumeActiveWork` → `resumeActiveWorkspaceEntry` | Med |
| Projects → Start Something New | `onStartSomethingNew` → force-new Create | Present but disconnected | Panel prop; CPC unwired | Never implemented | Wire to `beginForceNewCreationFromUi` | Med |
| Create → Project bridge UI | `CreateEstateWorkingPanel` project-bridge | Present but disconnected | Component committed; panel unmounted | CPC never mounts WorkingPanel | Mount WorkingPanel + connect handlers | High |
| Canonical Create↔Project sync | `lib/createProjects/*` | Present only in uncommitted WIP + committed connect | `syncCanonicalWorkFromCreate.ts` ?? | Not committed / not called from CPC | Commit leaf + call from Estate open/focus | Med |
| Create Estate entrance (Begin / Continue / New) | `CreateEstateEntrancePanel` | Present but disconnected | Panel requires callbacks; CPC only drafts + type pick → **legacy** `openCreateWorkspace` | Incomplete mount | Wire `onBeginCreate` / resume / force-new; stop legacy open | High |
| Create Estate working session | `CreateEstateWorkingPanel` + Current Focus | Missing entirely from CPC | Component + tests; **never in CPC history** | Never implemented | Implement host: session state, mount, Focus submit | High |
| Welcome Continue Active Work | `resume-active-work` choice | Present but disconnected | `resolveGlobalDailyOpening` emits; `handleGlobalDailyOpeningChoice` ignores | Handler omitted | Add branch → resume workspace | Med |
| Welcome Active Work card data | `resolveWelcomeActiveWork` | Present only in uncommitted WIP | `lib/welcomeHome/resolveWelcomeActiveWork.ts` ?? | Never committed | Commit + ensure opening consumes it | Med |
| Universal Creation Entrypoint | `lib/universalCreationEntrypoint/*` | Present only in uncommitted WIP | Package ?? | Used by Begin resolver; not on branch | Commit package (Begin depends on it) | High |
| Continue projections (data plane) | `activeWorkspaceRegistry/projections` | Present and working | Committed | N/A | Keep as SoT | Low |
| Legacy split Create | `openCreateWorkspace` + ContentGenerator | Conflicting duplicate (still live) | Quarantine doc; still called from entrance type pick | Dual shell not retired | Estate path must not call it | High |
| Talk It Out room | `TalkItOutPanel` + `openTalkItOutCore` | Present and working (mounted) | Section + estate menu + How Do I + Welcome lessons | User perception / governance `productionReady: false` | Verify findability; do not rebuild | Low |
| Talk It Out × Create Help Me Think | Focus / WorkingPanel optional | Present but disconnected | Assistance lives on WorkingPanel | WorkingPanel unmounted | Comes with WorkingPanel mount | Med |
| Chamber / Board Create entry | `enterCreationFromChamber/Board` | Present only in uncommitted WIP | Entrypoint helpers | Package untracked | Commit entrypoint; wire later if UI exists | Med |
| Search / Favorites Create | — | Missing entirely / Needs product clarification | No favorites API for Create | Spec future | Document; do not invent | Low |
| Recent Create UI (non-Projects) | `listRecentContinueProjection` | Present but disconnected | Lib only | No dedicated UI consumer | Optional; Projects Continue covers primary | Low |
| Business Estate Create deep links | Estate menu Create Studio | Partial — opens entrance only | `openCreateEstateCore` | Working session never opens on Estate shell | Fix via Estate working host | Med |

### Classification legend (applied above)

- **Present and working** — mounted and usable  
- **Present but disconnected** — code exists, host props/handlers missing  
- **Present only in uncommitted WIP** — local dirty / untracked  
- **Missing entirely** — never in history  
- **Conflicting duplicate** — legacy path still owns UX  
- **Needs product clarification** — Favorites / Search Create surfaces  

### Talk It Out determination

Talk It Out **was implemented** and **is mounted** (`activeSection === "talk-it-out"`, estate menu, How Do I, Focus help paths, Welcome helpful lessons). It is a reflective thinking room — **not** Create planning. Governance still marks it not production-ready. No rebuild required for 095 unless browser proof shows a dead control.

### Projects determination

Create work **does** appear under Projects via registry → lite Continue cards. Failure mode: **Continue does not open the Creation Workspace** (no `onResumeActiveWork`), and Create does not stay on Estate shell when started from Create / Projects.

---

## Phase 3 — Certified runtime comparison

| Concern | Certified owner (`a940ad0b`) | Platform gap |
|---------|------------------------------|--------------|
| Schema-first bootstrap | `workTypeSchema` / `initializeWorkspaceV2Workflow` | CPC still opens legacy split via `openCreateWorkspace` |
| Section lifecycle | `createSectionLifecycle` | OK once WorkingPanel mounted |
| Continue | Registry projections | List OK; resume host missing |
| Durable save | `creationDurable/savePipeline` | OK behind Focus submit |
| Commands | `dispatchCreateWorkCommand` | Toolbar on WorkingPanel (unmounted) |
| Assistance | `createContextualAssistance` | On WorkingPanel (unmounted) |

**Recovery rule:** Keep certified libs; implement **host wiring** only. Do not restore old parallel stores.

---

## Ambiguities (stop vs guess)

1. **Favorites for Create** — no product surface found; leave unimplemented.  
2. **Talk It Out “missing”** — code is mounted; likely discoverability or governance flag — treat as present unless browser shows otherwise.  
3. **Full vs lite Projects Active Work** — lite is intentional for Turbopack; resume must hydrate by Work ID regardless of list source.

---

## Implementation sequence (next)

1. Commit this audit.  
2. Commit untracked Create deps Begin requires (`universalCreationEntrypoint`, welcome Active Work, `syncCanonicalWorkFromCreate`).  
3. `fix(projects)` + Create host: CPC Estate working mount, entrance callbacks, Projects resume, Welcome resume.  
4. Tests + browser smoke.  
5. Certification doc.

---

## Git note

Unrelated dirty tree (Boardroom, portraits, `.tmp-approved-upload`, intelligence uploads, etc.) must remain unstaged. CPC edits limited to Create / Projects / Welcome resume wiring (+ existing lazy Project Homes import already local).
