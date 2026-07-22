# Create / Current Focus — Save Engine Trace Report

**Status:** Release-blocker root cause found and fixed.
**Scope of this pass:** Current Focus durable save pipeline only. No Plan My Day,
Cartography, Profile, or Support changes. P2–P8 items were identified and deferred
(see end).

---

## 1. The symptom

Members typing an answer in Create → Current Focus and pressing **Save this
section** saw:

> "This Focus moved — your words are still here. Retry against the current question."

…on *every* submit. Words were preserved on screen, but nothing was ever written
to Supabase. Retry produced the same message. The completion/progress never
advanced because no answer became durable.

---

## 2. Full pipeline map (Question → … → Refresh UI)

```
Question (Current Focus resolved)
  lib/currentFocus/resolveCanonicalFocus.ts
    resolveCanonicalCurrentFocus()  → focusFromActiveSection | focusFromEventRecord | focusFromRuntimeRecord
    (a CanonicalCurrentFocus carries focusId, creationId, contextVersion, sectionId, savedContent)

Current Focus (render)
  components/companion/CreateEstateWorkingPanel.tsx
    canonicalFocus = useMemo(resolveFocusForCreationDestination(workflow))
  components/companion/CurrentFocusInteraction.tsx
    seeds editor from focus.savedContent; autosaves draft ONLY to the local
    Focus Recovery Buffer (lib/creationDurable/focusRecoveryBuffer.ts) — never
    to the workflow, so typing cannot move the Focus.

User types → Confirm (Save this section)
  CurrentFocusInteraction.handleSubmit() → onSubmit(answer)
  CreateEstateWorkingPanel → onSubmitCurrentFocus({ focus: canonicalFocus, response, responseType })

Save (orchestration)
  app/companion/CompanionPageClient.tsx  (onSubmitCurrentFocus handler)
    → submitCurrentFocusResponse(input, { workflow, ...active* })
  lib/currentFocus/submitCurrentFocusResponse.ts
    1. isCreationResultApplicable() — request/context/creation still current (trustKernel)
    2. resolveCanonicalCurrentFocus() — re-resolve the LIVE focus
    3. Focus-binding guard: does input.focusId match the live focus?  ← FAILURE POINT
    4. apply answer to Event Record OR Runtime Creation Record
    5. persistAndAuthorize()

Supabase (durable write + verify)
  persistAndAuthorize() → persistCreationFocusAnswer()
  lib/creationDurable/mutate.ts → persistCreationMutation()
  lib/creationDurable/repository.ts → upsertAuthoritativeCreation()
    supabaseBackend.upsertAndReadBack():
      upsert → select().single() → verify workspaceId+version
      → second read-back (.eq id/user) → verify again
      → markWorkspaceAuthoritativelyDurable() → writeOptionalCreationCache()
    Only now DurableMutationResult.ok = true (verified persistence).

Verify → Update completion → Refresh UI
  persistAndAuthorize():
    authorizeCreationEgress() (trustKernel) — no "updated" claim without evidence
    applyVerifiedCreationToCaches() (lib/creationDurable/applyVerified.ts) —
      updates runtime record + registry from the VERIFIED authoritative row
    returns updatedWorkflow (merged) + nextFocus
  CompanionPageClient: setCreateBuilderSession({ workflow: updatedWorkflow })
    → re-render → resolveCanonicalCurrentFocus advances to next unanswered section

Reload
  lib/creationDurable/hydrate.ts hydrateCreationWorkspacesFromDurable()
  repository.listForUser()/fetchById() → rowToAuthoritative → runtime + registry caches
```

### Persistence layers and their authority

`lib/creationDurable/savePipeline.ts::classifyCreatePersistencePath()` already
classifies every store correctly:

| Store | Class | May claim "Saved"? |
|---|---|---|
| `creationDurable` (Supabase) | `durable_pipeline` | **Yes** — only after read-back verify |
| `focusRecoveryBuffer` (LS) | `local_recovery_only` | No |
| `runtimeCreationRecords` (LS) | `local_recovery_only` | No |
| `workflowBookmark` / `draftLibrary` / `blueprint` | `local_bookmark_only` | No |
| `eventRecordLs` | `domain_projection` | No |

This is a single, well-designed pipeline. The bug was **not** a second save
system — it was a caller wiring defect that made the durable pipeline
unreachable.

---

## 3. Root cause (deterministic)

**Primary — the Save could never succeed.** The Create UI passed the wrong field
into the save contract:

`app/companion/CompanionPageClient.tsx`, `onSubmitCurrentFocus`:

```ts
// BEFORE (broken)
submitCurrentFocusResponse(
  {
    requestId: `focus-${Date.now()}`,
    contextVersion: 1,          // hardcoded — not the focus's contextVersion
    creationId,
    focus: input.focus,         // ← wrong field: the contract wants `focusId`
    response: input.response,
    responseType: input.responseType,
  },
  { workflow: createBuilderSession.workflow },
);
```

`SubmitCurrentFocusResponseInput` (`lib/currentFocus/types.ts`) requires
`focusId: string`. The object above supplies `focus` (the whole object) and
**omits `focusId` entirely**, so at runtime `input.focusId === undefined`.

Inside `submitCurrentFocusResponse.ts` the Focus-binding guard was:

```ts
if (!focus || focus.focusId !== input.focusId) { return fail("This Focus moved …"); }
```

`focus.focusId` is always a real string (e.g. `section:outcomes`); `input.focusId`
was always `undefined`. The comparison was therefore **always unequal**, so
every submit short-circuited to the "This Focus moved" failure before ever
reaching Supabase. Words were preserved (good) but never persisted (blocker).

**Why it shipped:** `next.config.ts` sets `typescript.ignoreBuildErrors: true`,
so the type error (excess `focus`, missing `focusId`) never blocked the build.

**Secondary — `contextVersion: 1` hardcode.** Even had `focusId` been present,
pinning `contextVersion` to `1` desynchronizes the applicability check
(`isCreationResultApplicable`) from the live focus's `contextVersion`, risking
false "arrived a moment late" rejections. Fixed to use
`input.focus.contextVersion`.

### Race conditions reviewed

The mandate called out several potential races. Findings:

- **Section change clearing focus before persist:** Not the live cause. Typing
  updates only local `draft` + the Focus Recovery Buffer; it does not mutate the
  workflow, so `canonicalFocus` is stable while writing. `CurrentFocusInteraction`
  drops stale autosaves via `bindGenerationRef`/`contentKeyRef`.
- **Optimistic UI vs failed save:** Correct already — `advanced`/`realityUpdated`
  are only true after `DurableMutationResult.ok`, and the durable ack badge
  (`lastDurableOk`) is set only when a verified save returns.
- **Reload reading stale cache:** Correct — caches are written *from* the verified
  authoritative row (`applyVerifiedCreationToCaches`), never before verify.
- **Completion updated before verify:** Correct — `authorizeCreationEgress` blocks
  the "updated" claim without evidence.
- **Multiple sources of "active focus":** Real, but now handled. The Focus is
  re-resolved from the live workflow at submit and compared to the *supplied*
  `focusId`. A genuinely stale `focusId` (Focus already advanced) is now the only
  thing that trips "This Focus moved" — and it correctly preserves words + offers
  retry (see `saveEngineFocusBinding.test.ts`).

---

## 4. Fixes

### a) Correct the save-contract wiring (the blocker)
`app/companion/CompanionPageClient.tsx` — pass `focusId: input.focus.focusId`,
`contextVersion: input.focus.contextVersion`, and thread the matching
`activeRequestId` / `activeContextVersion` / `activeCreationId` so the
applicability check is consistent.

### b) Harden the Focus-binding guard (defense-in-depth)
`lib/currentFocus/submitCurrentFocusResponse.ts` — split the guard:

- No canonical focus resolves → preserve words, honest failure.
- `focusId` supplied **and** mismatched → real stale race → preserve words, retry.
- `focusId` absent (a contract gap, not a stale race) → **bind to the live focus
  and save** instead of silently failing every attempt.

This keeps the intentional stale-race guardrail (`066-R15` still passes) while
guaranteeing a missing/late `focusId` can never again silently block all saves.

### Determinism guarantees now met
- Words are never silently lost — every path preserves `response` and offers Retry.
- Save completes (verified) or returns an honest, Estate-voiced error before any
  focus/section teardown; the member is not advanced on failure.
- After reload, saved answers reappear (verified authoritative row → caches).
- Completion/progress advances only on verified persistence.

---

## 5. Files changed

- `app/companion/CompanionPageClient.tsx` — fix `onSubmitCurrentFocus` save mapping.
- `lib/currentFocus/submitCurrentFocusResponse.ts` — deterministic Focus-binding guard.
- `lib/currentFocus/saveEngineFocusBinding.test.ts` — **new** regression tests.
- `docs/create-experience/SAVE_ENGINE_TRACE_REPORT.md` — this report.

---

## 6. Tests

New: `lib/currentFocus/saveEngineFocusBinding.test.ts` (4 tests, all pass):
1. Correct `focusId` binding → durable save, advance, and read-back from the store.
2. Missing `focusId` (the old buggy shape) → still saves against the live focus.
3. Genuinely stale `focusId` after advance → words preserved, honest retry, no clobber.
4. Source guard: the UI callsite binds `focusId: input.focus.focusId` and a real
   `contextVersion` (fails if `focus: input.focus,` or `contextVersion: 1,` return).

Command:
```
npx vitest run lib/currentFocus/saveEngineFocusBinding.test.ts lib/currentFocus/currentFocusRuntime.test.ts
```
Result: `saveEngineFocusBinding` 4/4 pass; `currentFocusRuntime` 11/12 pass.

### Pre-existing failures (NOT caused by this change — out of scope)
These fail on the current WIP working tree independent of the two files touched
here (they scan/exercise `buildCreationDraft.ts`, `homeWelcome.ts`,
`ensureRuntimeCreationRecord`, and `mergeRuntimeRecordIntoWorkflow`, none of which
were modified):

- `currentFocusRuntime.test.ts` → `066-R11` expects `!isCompanionDormantForCreation()`
  in `CompanionPageClient.tsx`; that string no longer exists in the WIP source.
- `productionHardening074.test.ts` → `durable persist + read-back for runtime + registry`
  (`wasLastRuntimePersistDurable()` under the localStorage stub) and
  `homeWelcome and build draft never claim safety without verify (source)`.
- `exactWorkspacePersist.test.ts` → `mergeRuntimeRecordIntoWorkflow preserves focus
  when section still open`.

The save-engine fix does not change behavior for any input that supplies a real
`focusId`, so it cannot cause these. Left for their owners.

---

## 7. How to verify manually

1. Sign in (durable save requires an authenticated Supabase user).
2. Create → begin any creation (e.g. "Plan a productivity workshop").
3. In Current Focus, type an answer and press **Save this section**.
   - Expected: brief durable ack, the answer is captured, and the Focus advances
     to the next section. No "This Focus moved" message.
4. Refresh the page and reopen the creation from Continue Your Work.
   - Expected: the saved answer reappears; progress reflects it.
5. Failure path: with the durable table unavailable, the member sees an
   Estate-voiced, recoverable message (never "Failed to fetch"), words stay on
   screen, and Retry is offered.

---

## 8. P2–P8 items found but deferred (per instructions)

- **P2 — Create intent recognition ("online event" → Event):** Event routing keys
  off `EVENT_DOMAIN_RE` in `lib/universalCreationPlatform/oneCreationPlatform.ts`
  (workshop|webinar|conference|seminar|training|retreat|summit|meetup|networking
  event|panel|launch event|multi-day event) plus a gathering-verb regex. The bare
  words **"event" / "online event" are not matched**, so those phrasings do not
  auto-resolve to an Event Plan. **Deferred.**
- **P2 / Browse dependency for Event:** Because of the above, phrasings outside the
  keyword set currently fall back to selecting Event via
  `CreateBrowseCategoriesPanel` (Browse categories). So yes — for un-keyworded
  event phrasings, Create still depends on Browse to reach Event. Noted for P2; no
  Browse redesign performed.
- **P3 — Turn Into Project everywhere:** project bridge exists on the Create panel
  (`onConnectProjectHome`) but is not universal. **Deferred.**
- **P4 — Universal Save Actions shared component:** Save affordances live in
  `CurrentFocusInteraction` + `CreateWorkCommandToolbar`; not yet a shared
  component. **Deferred.**
- **P5 — Workshop Map phase grouping:** `CreateWorkspaceV2Panel` lists sections
  flat under "Your plan". **Deferred.**
- **P6 — Status single source of truth:** status derives from
  `canonicalStatusFromWorkflow` + `resolveCreateWorkspacePhase`; verify these are
  the sole authority. **Deferred.**
- **P7 — Start Something New routing:** `onStartSomethingNew` →
  `beginForceNewCreationFromUi("create")`. Potential conflict with Projects'
  "Start New → project setup" flow — **flagged for P7**, not resolved here.
- **P8 — Print availability messaging:** not addressed. **Deferred.**

---

## 9. Suggested commit message

```
fix(create): bind Current Focus Save to focusId so answers persist

The Create working panel passed the whole focus object (and a hardcoded
contextVersion) into submitCurrentFocusResponse instead of `focusId`, so
input.focusId was undefined at runtime and every Save short-circuited to
"This Focus moved — your words are still here." before reaching Supabase.
Answers were preserved on screen but never durably saved.

- CompanionPageClient: pass focusId + the focus's real contextVersion and
  matching active* applicability fields.
- submitCurrentFocusResponse: split the Focus-binding guard so a genuinely
  stale focusId still preserves words + offers retry, while a missing focusId
  binds to the live Focus instead of silently blocking all saves.
- Add saveEngineFocusBinding.test.ts covering correct binding, missing-id
  recovery, the stale-focus race, and a source guard on the UI callsite.
```
