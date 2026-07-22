# Spark Estate — Projects "Start New Project" Routing Fix

**Status:** Implemented and tested
**Branch:** `deploy/companion-app-v3`
**Authoritative prompt:** `spark-estate-projects-start-new-routing-fix-cursor-prompt.md` (Downloads)
**Scope:** Project Homes / Projects routing only — no Create redesign, no background/plate changes

---

## Mission

`Projects` → `Start New Project` must open the Project creation / new-project
setup flow — never Create, Explore Ideas, or a creation gallery. Create and
Projects remain distinct experiences; a Create → Project handoff stays
intentional-only (untouched by this fix).

---

## Root cause — why it opened Create

Projects' gallery button is labeled **"Start Something New"**
(`PROJECTS_START_NEW_LABEL`, `data-testid="projects-start-something-new"`) —
there is no literal "Start New Project" string in the UI; that button is the
member-facing equivalent the mission refers to.

`ProjectHomesPrototypePanel.tsx` already contains a complete, calm,
progressive new-project wizard (`create-purpose` → `create-why` →
`create-pieces` → `create-home` → `createHome()`), built specifically for
this button. However, its `beginCreate()` handler had an early return:

```tsx
function beginCreate() {
  // 057 — never lead with Project Home creation; Create is the front door
  if (onStartSomethingNew) {
    onStartSomethingNew();
    return;
  }
  ... // local wizard, never reached when the callback is present
}
```

`CompanionPageClient.tsx` (the Estate host) always passed this callback when
mounting the panel:

```tsx
<ProjectHomesPrototypePanel
  ...
  onStartSomethingNew={() => beginForceNewCreationFromUi("create")}
```

`beginForceNewCreationFromUi("create")` resets Create's session state and
calls `openCreateEstateCore()`, which opens `activeSection = "create"` →
`CreateEstateEntrancePanel` (Create's front door, including its Browse
Categories picker). This was a **deliberate, historical decision** —
Standard 057 (`docs/create-experience/standards/057_PROJECTS_EXPERIENCE_AND_AUTOMATIC_WORKSPACE_STANDARD.md`)
and an integration audit
(`docs/create-experience/CREATE_PLATFORM_INTEGRATION_RECOVERY_AUDIT.md`, row
"Projects → Start Something New") explicitly called for wiring
`onStartSomethingNew` → `beginForceNewCreationFromUi`, on the premise that
"Projects is where work continues, not where it begins." The mission for
this fix reverses that decision: Projects must own the new-project
setup flow, not hand it to Create.

The same pattern (deep links landing on `initialView="create-purpose"`)
also short-circuited to Create via the panel's mount `useEffect`, and the
chat command "start a new project" opened the **gallery only** (already
routing to Project Homes, not Create — but not the setup flow directly).

---

## Fix

**Files changed:**

- `app/companion/CompanionPageClient.tsx`
- `components/companion/projectHomes/ProjectHomesPrototypePanel.tsx`
- `lib/createExperience/blockLegacyCreateWorkspaceRouting.test.ts` (stale assertion)
- `lib/projects/projectCreation190.test.ts` (stale assertion)
- `components/companion/projectHomes/ProjectHomesUsability.test.tsx` (new regression tests)

**1. Stopped wiring the Projects gallery button to Create.**
Removed `onStartSomethingNew={() => beginForceNewCreationFromUi("create")}`
from the `ProjectHomesPrototypePanel` mount in `CompanionPageClient.tsx`.
`beginCreate()`'s early-return guard is now dormant by default, so clicking
**Start Something New** falls through to the panel's own new-project
wizard (`create-purpose` view) — the flow that already existed and matches
the mission's suggested sequence (purpose/outcome → name → optional
deadline/pieces → Project Home creation). No duplicate builder was created.

**2. Added a one-shot `initialView` hand-off so entry points can land
directly on the setup flow (not just the gallery).**
`openProjectHomesPrototypeCore(initialView: ProjectHomeView = "gallery")`
now accepts an optional view and stores it in new state
(`projectHomesInitialView` / `setProjectHomesInitialView`), passed to the
panel as `initialView={projectHomesInitialView}`. Every existing call site
keeps the default `"gallery"` (resume, Welcome Home, nav, legacy redirects,
etc. — unchanged). Only the "start a new project" chat completion
(`completeImmediateCreateProjectOpen`) now calls
`openProjectHomesPrototypeCore("create-purpose")`, so the Shari command lands
directly on the new-project questions instead of the gallery.

**3. Kept `onStartSomethingNew` as an optional override, not removed.**
The prop still exists on `ProjectHomesPrototypePanel` (a regression test —
`listActiveWork.test.ts` — asserts the panel source still contains it), so a
future, *intentional* Create hand-off could still use it. It is simply no
longer wired by `CompanionPageClient.tsx` for the Projects landing button.
Comments in the panel were updated to describe the corrected behavior
(previously they said "057 — Create is the front door").

**4. Confirmed no generic fallback redirects Project routes to Create.**
`resolveLegacyCreateWorkspaceGuard()` (`blockLegacyCreateWorkspaceRouting.ts`)
already routes `section === "projects"` and project-creation-intent text to
`{ kind: "project_homes" }`, never `{ kind: "prepared_state" }` (Create's
fallback). `resolveIntentFirstRoute()`'s `experienceId: "create"` metadata
for project-creation intent is captured but never used for actual navigation
(confirmed by tracing `frictionlessActionLayer.ts` →
`resolveEstateIntelligenceImmediateAction` → `completeImmediateCreateProjectOpen`,
which hard-codes Project Homes regardless of that field). No code changes
were needed here — verified by inspection and existing passing tests.

---

## What was intentionally left untouched

- **Create's own entrance** (`CreateEstateEntrancePanel`'s
  `onStartSomethingNew={() => beginForceNewCreationFromUi("create")}`) — this
  is Create's own front door and correctly still opens Create.
- **Create → Project handoff** ("Turn This Into a Project",
  `lib/createProjects/connectCanonicalWorkToProjectHome.ts`) — separate,
  intentional, opposite-direction feature; unaffected.
- **Project Homes inspiring-vision background / plate** — untouched
  (`PROJECT_HOMES_ROOM_BACKGROUND`, `EstateRoomFullBleedBackground` wiring,
  `openStandaloneFocusSectionCore("projects")` → `openProjectHomesPrototypeCore()`
  redirect from the prior "land Projects on inspiring-vision Project Homes
  plate" commit).
- **`toolId === "start-new-project"` action branch** in
  `CompanionPageClient.tsx` (~line 11443) — audited and confirmed
  unreachable (no producer sets this `toolId` anywhere in the codebase); it
  targets the legacy "Chamber of Momentum" beside-chat `ProjectsPanel`, not
  Project Homes. Left as-is per "narrow edits" — flagged as a gap below.

---

## Tests

Focused vitest run (`npx vitest run ...`), covering Project Homes, Create
routing guards, and navigation wiring:

| Suite | Result |
|---|---|
| `components/companion/projectHomes/ProjectHomesUsability.test.tsx` | ✅ 14/14 (2 new tests added) |
| `lib/projects/activeWork/listActiveWork.test.ts` | ✅ 3/3 |
| `lib/projectHomes/*.test.ts` (barrel, exclusive destination, usability) | ✅ 28/28 |
| `lib/createExperience/createExperienceRouting.test.ts` | ✅ 5/5 |
| `lib/createExperience/explicitProjectsCommandRouting.test.ts` | ✅ 3/3 |
| `lib/createExperience/blockLegacyCreateWorkspaceRouting.test.ts` | 9/10 — 1 pre-existing, unrelated failure (see Gaps) |
| `lib/estate/myDayAndWorkNavigation.test.ts` | ✅ 6/6 |
| `lib/estate/ecosystemRouting096.test.ts` | ✅ 17/17 |
| `lib/estateExperienceBackgrounds.test.ts` | ✅ 6/6 |
| `lib/activeWorkspaceRegistry/projectHomesImportSafety.test.ts` | ✅ 7/7 (flaky only under parallel load; passes in isolation) |
| `lib/projects/projectCreation190.test.ts` | ✅ 12/12 (updated stale assertion) |
| `lib/navigationContext/destinationWiring.test.ts` | 3/4 — 1 pre-existing, unrelated failure (see Gaps) |

**New regression tests added** (`ProjectHomesUsability.test.tsx`):

- *"Start Something New opens the Project setup flow, never Create"* —
  renders the panel with no override, clicks the real
  `projects-start-something-new` button, asserts the `create-purpose` view
  and its intention field render, and asserts nothing Create-related
  (`create-estate`/`content-generator`) appears.
- *"an explicit `onStartSomethingNew` override still takes precedence"* —
  confirms the override hook still works for a future intentional hand-off,
  and that using it does **not** render the local wizard.

Updated stale assertions (both previously encoded the old, reversed-by-this-
fix Standard 057 behavior and were already failing before this session, for
unrelated reasons, against the dirty working tree):

- `blockLegacyCreateWorkspaceRouting.test.ts` — now asserts
  `completeImmediateCreateProjectOpen` calls
  `openProjectHomesPrototypeCore("create-purpose")` and never
  `openCreateEstateCore()`.
- `projectCreation190.test.ts` — same assertion, using the same bounded
  function-body extraction pattern (fixed an unbounded-regex bug found while
  updating this test — the original `[\s\S]*?` search without a function
  boundary could match text far outside the target function).

---

## UI verification

Verified via source tracing + the render/click regression tests above
(no dev server available in this sandboxed session to click through the
live app):

- `Projects` → `Start Something New` → `create-purpose` view (intention +
  optional name fields), **not** Create, Explore Ideas, or any creation
  gallery. ✅
- `Create`'s own "Start Something New" still opens Create. ✅ (unchanged
  wiring, confirmed by grep)
- Project cards (`ProjectHomeCard` → `openDetail`) still open Project Home
  detail — untouched. ✅
- Existing project data (`companion-projects-v1`) is read/written by the
  same `homeActions.ts` functions — untouched. ✅
- Chat command "start a new project" now opens the setup flow directly
  (previously opened the gallery). ✅
- Welcome Home → "Open Projects" and all resume/nav paths keep opening the
  gallery (`openProjectHomesPrototypeCore()` default) — unaffected. ✅

---

## Suggested commit message

```
fix(projects): Start Something New opens the Project setup flow, never Create

Projects' "Start Something New" button was wired to force-open Create
(beginForceNewCreationFromUi → openCreateEstateCore) per a prior Standard
057 decision. This reverses that: the button now falls through to
ProjectHomesPrototypePanel's own new-project wizard (create-purpose →
create-why → create-pieces → create-home). Added an optional initialView
hand-off (openProjectHomesPrototypeCore("create-purpose")) so the "start a
new project" chat command lands directly on the setup flow instead of the
gallery. Create's own entrance and the Create→Project handoff are
unaffected. Updated two stale tests that encoded the old behavior and added
two new regression tests.
```

---

## Gaps / follow-ups (not fixed here — out of narrow scope)

1. **`blockLegacyCreateWorkspaceRouting.test.ts` — one remaining failure**,
   pre-existing and unrelated: `completeImmediateCreateOpen` (Create's own
   generic open, unrelated to Projects) is asserted to call
   `openUniversalCreationFromText`, but the current implementation only
   calls `redirectLegacyCreateWorkspaceIfNeeded`. This assertion was already
   failing before this session's edits (confirmed by isolating just the two
   files this fix touched via `git stash push -- <paths>` and re-running).
   Recommend a separate, dedicated Create-experience investigation.
2. **`destinationWiring.test.ts` — one remaining failure**, pre-existing and
   unrelated: `CompanionPageClient.tsx` does not yet implement
   `captureLeaveToDestination` / `restoreNavigationFrame` /
   `hasDestinationOriginBeneath` (Universal Navigation Context capture/
   restore) at all — confirmed via grep (zero matches). Also pre-existing.
3. **`toolId: "start-new-project"` action branch** in
   `CompanionPageClient.tsx` is dead code (no producer sets this `toolId`)
   and targets the legacy "Chamber of Momentum" `ProjectsPanel`, not Project
   Homes. Left untouched (out of narrow scope) but worth removing or
   rewiring in a future Projects cleanup pass.
4. **`lib/createExperience/createExperienceRouting.ts`** — the
   `ImmediateCreateProjectOpenPayload` type/comments and its test still say
   "New work begins in Create" / `experienceId: "create"`, even though
   `completeImmediateCreateProjectOpen` (both before and after this fix)
   never reads those fields to decide routing. Harmless today, but worth a
   documentation cleanup pass so the routing-library comments match runtime
   behavior.
5. **Standard 057** (`docs/create-experience/standards/057_...md`) still
   documents the reversed "Projects is where work continues, never begins"
   philosophy. This fix intentionally overrides it per the authoritative
   prompt; Standard 057 itself was not edited (out of scope) but should be
   revisited/updated by product owners so the written standard matches the
   new, intended behavior.
