# Create Foundation Transition Map — Confirmed Understanding → Work Object

**Status:** Analysis only, per founder instruction — no code in this pass.
**As of:** 2026-08-07, after Phase C-1 (commit `9fed59fb`).
**Scenario:** a member has completed the understanding conversation for a Newsletter and confirms — "This is a Newsletter."
**Method:** two direct read-only traces (Subagent Safety Rule observed) against the current codebase, not reconstructed from memory.

---

## Headline answer: the handoff boundary is clean

Phase C-1's own scope claim — *"recognition + the understanding conversation only... never opens a workspace"* — is exactly true today, verified by tracing the actual code, not just the comment. `resolveCreateFoundationRecognition`'s "understood" outcome (`lib/estateBrain/workRecognitionFallthrough.ts`'s `applyStep`, `classify` branch) calls exactly one function beyond building a message string: `clearWorkRecognitionSession()` — a `localStorage` write to the chat module's own private conversation-session key, unrelated to anything below. It imports nothing from `CompanionPageClient.tsx`, calls none of the six save/create functions traced below, and touches none of their storage keys.

**This means C-2 has a well-defined, purely additive job**: take the chat path's confirmed answers (already gathered, already validated, already sitting in the same `EntranceUnderstandingSession` shape the catalog path uses) and drive them through the *same* functions the catalog path already calls — not invent new ones, not undo anything Phase C-1 built. Every mechanism below already exists, is already tested, and is already proven working for the catalog entry point.

---

## 1. Working Memory persistence

**Catalog path (works today):**

1. `CreateEstateEntrancePanel.tsx:636` — the moment the member confirms, `armEntranceUnderstandingHandoff(session)` stashes `{answers, skippedIds}` in a one-shot, module-level `pendingHandoff` (`entranceUnderstanding.ts:354-370`) — the `create-goal` answer is filtered out (identity, not discovery).
2. `CompanionPageClient.tsx:12581-12583` — `registerCreationDestinationWorkspace` runs *first*, minting the canonical work id.
3. `CompanionPageClient.tsx:12605` — `consumeEntranceUnderstandingHandoff()` reads and clears the stash.
4. `CompanionPageClient.tsx:12607-12622` — for each answer, `applyDiscoveryAnswerToRuntimeCreationRecord(recordId, questionId, answer)` — `recordId` is deliberately `activeEntry.runtimeCreationRecordId`, not the separate `workspaceId` variable (this exact distinction was this session's earlier guided/event-domain Working Memory bug fix).
5. `lib/currentFocus/creationRecord.ts:367-429` — maps each question to a `workingMemory` field (e.g. `existingAssetsFound`), recomputes `nextHelpfulStep`, and persists via `upsertRuntimeCreationRecord` → `localStorage["spark.runtimeCreationRecords.v1"]`.

**Chat path (Phase C-1):** stops at step 1's equivalent — `resolveCreateFoundationRecognition` never calls `armEntranceUnderstandingHandoff` at all (that call exists only inside `CreateEstateEntrancePanel.tsx`). Steps 2-5 never run. **Working Memory is gathered in chat but never written.**

---

## 2. Creation type handling

Three separate storage locations, all set from `startFreshCreateFromEstate` — worth naming individually since C-2 must keep them consistent (reuse the same call, not hand-roll a fourth):

| Location | Field | Written by |
|---|---|---|
| `RuntimeCreationRecord` | `typeLabel` | `ensureRuntimeCreationRecord` (`creationRecord.ts:268`), from `resolvedTypeLabel(workflow)` |
| `ActiveWorkspaceEntry` | `creationType` | `registerCreationDestinationWorkspace` (`registry.ts:220`) |
| `CreateBuilderSession` (in-memory only, React state) | `typeLabel` | `startFreshCreateFromEstate` (`CompanionPageClient.tsx:12557`), never itself persisted to `localStorage` — only its *derived* records above are durable |

The type itself ("Newsletter") traces back to `resolveCatalogCreateConfirm`'s `artifactType` (`resolveCreateBeginOutcome.ts:324,336`) — the member's explicit catalog choice, trusted verbatim, never re-classified.

**Chat path:** stops before all three. None of `registerCreationDestinationWorkspace`, `ensureRuntimeCreationRecord`, or `bootstrapWorkspaceV2Session` are called from `resolveCreateFoundationRecognition`. The classified label *is* computed (via `resolveCreateFoundationClassification`, reused from Phase C-1) and passed into the conversation as `catalogTypeLabel` — so C-2 has the value in hand, it just isn't written anywhere yet.

---

## 3. Title

- Derived by `createTitleFromIntent` (`lib/createEstate/createTitleFromIntent.ts:50-113`, itself using `deriveCreationIdentity(...).humanWorkspaceTitle`), then resolved against existing/draft/request candidates by `resolveHumanReadableTitle` (`lib/activeWorkspaceRegistry/humanReadableIdentity.ts:126-134`) — first "usable human title" wins.
- **Persisted twice**, both inside `registerCreationDestinationWorkspace` (`registry.ts:190-204, 221`): once via `upsertRuntimeCreationRecord` (if it changed from the record's initial title) and once as part of the `upsertActiveWorkspace` entry. A third, earlier title write happens inside `ensureRuntimeCreationRecord` itself (`creationRecord.ts:242-269`) — the record gets an initial title before the registry step's re-derivation.

**Chat path:** stops before this — no title derivation runs. This is folded into "creation type handling" above operationally, but worth calling out separately since it's a distinct field with its own resolution logic C-2 needs to trigger, not assume.

---

## 4. Current Focus creation (the work object *and* the UI surface)

Two things happen together here — the object, then the screen showing it.

**The work object**, minted inside `registerCreationDestinationWorkspace` → `ensureRuntimeCreationRecord`:
- `id = workflow.eventRecordId?.trim() || workflow.sessionId?.trim() || allocateCanonicalWorkId({origin:"create"})` (`creationRecord.ts:193-196`) — for a plain Newsletter, this is the `sessionId` minted earlier by `newCreateSessionId()`.
- Returned as `activeEntry.runtimeCreationRecordId` — the canonical id used everywhere downstream (Working Memory writes, title writes, resume state).

**The UI transition**, entirely inside `CompanionPageClient.tsx`:
- `setActiveSection("create")` + `setActiveNav("create")` (`:12623-12625`).
- `createBuilderSession.phase = "workspace"` (`:12573`), driving the *derived* boolean `createEstateWorkingActive` (`:4208-4211`, computed each render — not its own state).
- Render gate: `activeSection === "create" && createEstateWorkingActive && createBuilderSession` → `<CreateEstateWorkingPanel>` (`:27980-27982`), which mounts `<CurrentFocusInteraction>` inside it (`CreateEstateWorkingPanel.tsx:498`).
- `setEstateRoomChatVisible(false)` (`:12626`) hides the chat pane — this is the live, already-shipped instance of Standard 066's single-interaction-ownership behavior confirmed in the Phase C plan: Current Focus becomes the sole surface, chat goes dormant, automatically, for every type today.

**Chat path:** stops before both halves. No work object is minted (no `allocateCanonicalWorkId`/`ensureRuntimeCreationRecord` call), and none of `setActiveSection`/`setCreateBuilderSession`/`setEstateRoomChatVisible` are touched — chat's Phase C-1 "understood" result returns only a message string back through the normal chat-reply path. No UI transition happens; the member stays in chat.

---

## 5. Resume behavior

Three `localStorage` keys, all written inside this same confirm flow (not "persistence exists somewhere" — these specific calls run as part of `startFreshCreateFromEstate`):

| Key | Written by |
|---|---|
| `spark.runtimeCreationRecords.v1` | `ensureRuntimeCreationRecord` → `upsertRuntimeCreationRecord` (`creationRecord.ts:139-151`), and again per Working Memory answer |
| `spark.activeWorkspaceRegistry.v1` | `upsertActiveWorkspace` (`registryCore.ts:52-72`), called from `registerCreationDestinationWorkspace` |
| `spark.lastActiveWorkspaceId.v1` | `rememberLastActiveWorkspaceId(runtime.id)` (`registry.ts:243`) |

"Continue Where You Left Off" / Welcome Home (`lib/welcomeHome/resolveWelcomeActiveWork.ts`, `lib/dailyOpening/buildDailyOpeningWelcome.ts`) both read `listActiveWorkspaces`, which reads the second key directly — confirmed via import, not fully traced line-by-line beyond that (flagged as the one lighter-verified link in this whole map).

**Chat path:** stops before this — none of the three keys are written. `resolveCreateFoundationRecognition` does write to its *own* transient key (`estate-work-recognition-session-v1`, cleared on classify) — unrelated to resume state, purely the in-flight chat conversation's own bookkeeping.

---

## 6. Projects visibility

This one is structurally different from 1-5: it's not something the confirm flow writes *to* — it's a **read-time projection** of the same registry entry from #5.

- `components/companion/projectHomes/ProjectHomesPrototypePanel.tsx` (the live Projects surface — a legacy `ProjectsPanel.tsx` exists but the app explicitly routes around it, per its own code comments) reads `listLiteActiveWorkCards` (`lib/projects/projectsContinueLite.ts:89-152`), which filters the *exact same* `spark.activeWorkspaceRegistry.v1` entries for `status === "active"`.
- **No explicit "add to Projects" step is required.** Any `ActiveWorkspaceEntry` with `status: "active"` appears automatically, whether or not it has a `projectHomeId`.
- `projectHomeId` (a genuinely separate object — `ProjectHomeRecord`, a room/container) stays `null` unless the member takes an explicit "Connect Project Home" action (`onConnectProjectHome`, `CompanionPageClient.tsx:28038-28052`) — never set by a plain Newsletter confirm. Unlinked work still shows in Projects' Active Work list; it just isn't grouped under a named Project Home.

**Chat path:** since nothing is written to the registry (per #4/#5), the chat-confirmed Newsletter has nothing to show — it's invisible to Projects until C-2 performs the same registry write the catalog path already does. Once C-2 does that write, Projects visibility follows for free — no separate work needed for this item specifically.

**One pre-existing quirk, unrelated to C-2, worth flagging:** there's a second, "canonical" registry-projection path (`listActiveWorkCards`/`listActiveCreationWorkspaces` in `lib/projects/activeWork/listActiveWork.ts` and `projections.ts`) that appears to have zero live callers — the actually-rendered panel uses a hand-duplicated reader instead (comment: *"duplicated to avoid Create graph"*). This looks like an in-progress consolidation, not something introduced by this work — noted so it isn't mistaken for a C-2 side effect if it surfaces later.

---

## Handoff boundary validation — summary

| Mechanism | Catalog path | Chat path (Phase C-1) |
|---|---|---|
| Working Memory write | ✅ writes | ❌ gathered, never written |
| Creation type (3 locations) | ✅ writes all 3 | ❌ classified, never written |
| Title | ✅ derived + written twice | ❌ never derived |
| Work object minted | ✅ `ensureRuntimeCreationRecord` | ❌ no id ever allocated |
| Current Focus UI opens | ✅ `CreateEstateWorkingPanel` mounts | ❌ stays in chat |
| Resume state (3 keys) | ✅ all 3 written | ❌ none written |
| Projects visibility | ✅ automatic (reads registry) | ❌ nothing to read |

**Validation verdict:** the boundary is exactly where Phase C-1's own scope said it would be, confirmed by tracing the code rather than trusting the comment. Nothing leaks past "understood" on the chat path today. C-2's task is precisely and only: call the same functions listed in the left column, in the same order, from the chat confirm point — `armEntranceUnderstandingHandoff` → `registerCreationDestinationWorkspace` → `consumeEntranceUnderstandingHandoff` + `applyDiscoveryAnswerToRuntimeCreationRecord` → the four `CompanionPageClient.tsx` state setters that open Current Focus. No new persistence mechanism, no new object model, no new classifier — every piece already exists and is already exercised daily by the catalog path.

---

## Evidence Matrix

- **Sources:** two read-only Explore-agent traces (2026-08-07, Subagent Safety Rule observed) — the confirm-to-open chain (`CreateEstateEntrancePanel.tsx` → `CompanionPageClient.tsx`'s `startFreshCreateFromEstate` → `lib/activeWorkspaceRegistry/registry.ts` → `lib/currentFocus/creationRecord.ts`) and the Projects-surface trace (`lib/projects/projectsContinueLite.ts`, `ProjectHomesPrototypePanel.tsx`, `connectCanonicalWorkToProjectHome.ts`). Cross-referenced against `CREATE_FOUNDATION_PHASE_C_PLAN.md`'s §1 workspace-shell finding (still holds: every catalog-pick type funnels through the identical pipeline).
- **Confidence:** High on every write site (each cited to a specific file:line, several with the exact localStorage key named). One explicitly flagged lighter-verified link: Welcome Home's consumption of the registry (import confirmed, not traced line-by-line into the render).
- **Not done in this pass:** no code changed. This is a map of existing, already-shipped mechanisms — nothing here was built or modified to produce this document.

**Decision Owner:** Founder. Ready for C-2 scoping against this map when approved.
