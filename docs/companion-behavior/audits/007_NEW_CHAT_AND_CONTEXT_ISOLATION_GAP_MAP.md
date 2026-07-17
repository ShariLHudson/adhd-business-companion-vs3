# CB-007 Gap Map — New Chat and Context Isolation

**Contract:** `docs/companion-behavior/contracts/007_NEW_CHAT_AND_CONTEXT_ISOLATION_BEHAVIOR_CONTRACT.md`  
**Method:** `docs/companion-behavior/standards/003_REVERSE_ENGINEERING_AND_IMPLEMENTATION_METHOD.md`  
**Date:** 2026-07-17  
**Scope:** Audit only — no application code changes in this pass.  
**Inventory supplement:** Merged findings from [Audit new-chat isolation code](67e3031b-9609-47e6-aa61-2afcb11126b6).

---

## Required behavior (from contract)

| # | Requirement |
|---|-------------|
| R1 | Create a new conversation identity |
| R2 | Clear pending answers and selections |
| R3 | Clear temporary workflow state |
| R4 | Clear unconfirmed turn-level inferences |
| R5 | Preserve appropriate long-term memory and saved work |
| R6 | Never import an unrelated active noun (proposal, client, project) |
| R7 | Allow explicit resume of saved work later |
| R8 | Current-turn / current-conversation outrank history |
| P1 | No old pending menu resolves in the new chat |
| P2 | No unrelated prior project appears |
| P3 | No “continue where we left off” without relevant evidence |
| P4 | Yesterday’s temporary emotion is not today’s assumption |
| P5 | New chat must not delete saved projects or confirmed long-term memory |

---

## Current entry points

| Entry | Path | Notes |
|-------|------|--------|
| Conversations → New Chat | Estate menu `start-new-conversation` → CPC `requestClearTodayContext` → `clearTodayContext({ mode: "new-chat" })` | Primary UI (`lib/estateMenu/menuConfig.ts`) |
| Nav / chip “New Chat” | CPC nav `case "reset-day"` → `requestClearTodayContext` | **Naming trap:** nav id `reset-day` is New Chat; dialog `requestResetDay` is Plan My Day |
| Clean conversation helpers | CPC `handleStartCleanConversation` | Calls `clearTodayContext()` |
| Confirm fresh-start dialog | CPC `confirmFreshStart` + `"clear-context"` | Confirm path |
| Other CPC callers | `clearTodayContext` (incl. Evidence Vault leave / preserveRoom) | Room-preserving variants |
| Shared reset core | `lib/conversationReset/resetActiveConversation.ts` → `resetActiveConversation` | Used by New Chat + New Day |
| New Day | Menu `start-new-day-conversation` → `runSharedNewDay` / CPC `beginNewDay` | Same clear core + daily extras |
| Soft same-day Welcome Card | CPC / daily opening when day already marked | Can show card **without** rotating conversation id — isolation bypass |
| Phrase knowledge | `lib/appFeatureKnowledge.ts` (“new chat” / “start fresh”) | Guidance text; not the reset owner |

---

## Conversation identity source

| Source | Location | Role |
|--------|----------|------|
| **Authoritative thread id** | `lib/conversationSession/store.ts` — `conversationId` via `getOrCreateConversationSession()` / `clearConversationSession()` | Rotated on reset |
| Session id | same store — `sessionId` | Rotated with session |
| CPC ref | `activeConversationIdRef` set from reset result | UI thread pointer |
| Estate memory thread | `lib/estateMemory/clearConversationThread.ts` — new `sessionId` on clear | Separate estate thread id |
| Message storage | `lib/companionStore.ts` — conversation messages key | Cleared via `clearConversation()` |
| Relationship id | conversation session `relationshipId` | Recreated with new session (not long-term profile) |

**Status R1:** **working** (new `conversationId` created; messages cleared).

---

## Temporary-state sources

| Store | Key / home | Cleared by `resetActiveConversation`? | Cleared by CPC `clearTodayContext`? |
|-------|------------|----------------------------------------|-------------------------------------|
| Pending choice | `spark:pending-choice:v1` sessionStorage — `lib/pendingChoice/manager.ts` | **No** | **No** |
| Companion conversation context | `COMPANION_CONTEXT_STORAGE_KEY` sessionStorage — `lib/companionConversationContext/store.ts` | **No** | **No** |
| Estate place pending menu | sessionStorage pending menu — `lib/estate/estatePlaceNavigation.ts` | Yes (`clearPendingEstatePlaceMenu`) | Via reset |
| Frictionless pending action | `companion-frictionless-pending-v1` localStorage | Yes (`clearFrictionlessPending`) | Via reset |
| Universal creation session | universal creation store | Yes | Via reset |
| Conversation owner / workflow | `lib/conversationContinuity` + estate capability conversation state | Yes | Via reset |
| Contextual help session | `companion-contextual-help-session-v1` | Yes | Via reset |
| Handoff stash | conversation handoff recovery | Yes | Via reset |
| Chamber temp member | chamber activation | Yes | CPC also dismisses chamber |
| Guided field help / expert prompt | profile helpers | Yes | Via reset |
| Create persistence / workspace session | CPC clearTodayContext | Partial (CPC) | Yes (CPC) |
| Discovery session | `estate-discovery-session-v1` — `clearDiscoverySession` | **No** | **No** |
| Implied-need session | `lib/intentAwareConversation/impliedNeedSession.ts` | **No** | **No** |
| Friction-first session | friction-first session | **No** | **No** |
| Outcome thread | `companion-outcome-thread-v1` — `lib/companionOutcomeThread.ts` → `clearOutcomeThread` | **No** | **No** (cleared on some topic-change sends only) |
| Last activity (continue cue) | `companion-last-activity-v1` — `clearLastActivity` in `companionStore` | **No** | **No** |
| Active task lock | `spark:estate:active-task:v1` — `clearActiveTaskLockState` | **No** | **No** |
| Collection pending offer | `spark:estate:collection-pending-offer:v1` | **No** | **No** |
| Turn decision store | `lib/conversationStabilization/turnDecisionStore.ts` (memory) | **No** explicit clear | **No** (new turn usually begins) |
| Governor chat refs | CPC refs | N/A | Yes (CPC clears refs) |
| Declined offers set | CPC ref | N/A | Yes |

---

## Long-term-memory sources (must preserve)

| Source | Preserved on New Chat? | Notes |
|--------|------------------------|--------|
| Prefs (`companionStore` prefs) | Yes | Asserted in reset tests |
| Estate `userProfile` / goals / room favorites / journeyEngine | Yes | `clearConversationThreadFromEstateMemory` keeps these |
| Reminders / rhythms / calendar | Yes (not touched by reset) | Contract P5 |
| Saved projects / create saved-for-later | Yes (`preserveSavedForLater` in CPC) | |
| Support style / tone prefs (localStorage) | Yes | Persist across new chat by design (Phase A voice note) |
| Auth session | Yes | |

**Status R5 / P5:** **working** for approved long-term stores covered by reset tests.

---

## Pending-answer and pending-choice stores

| Store | Path | Clear API | On new chat |
|-------|------|-----------|-------------|
| Pending choice (numbered menus) | `lib/pendingChoice/manager.ts` | `clearPendingChoice()` | **Missing** from reset / clearTodayContext |
| Companion pending action (affirmations) | companion conversation context `pendingAction` | `clearCompanionConversationState` only | **Missing** from reset |
| Conversation owner awaiting answer | `lib/conversationContinuity` | `clearConversationOwner()` | Cleared |
| Outcome-thread pending question | `companion-outcome-thread-v1` | `clearOutcomeThread()` | **Missing** from reset |
| Universal creation Q&A | universal creation session | `clearUniversalCreationSession()` | Cleared |
| Menu continuation | `lib/menuContinuationIntelligence` | `clearPendingMenuSelection()` | Cleared |
| Estate place menu | estate place navigation | `clearPendingEstatePlaceMenu()` | Cleared (also clears some pending nav) |

**Status R2 / P1:** **partially working / conflicting** — owner/workflow cleared, but `spark:pending-choice:v1` (and companion pending / outcome thread) can survive New Chat and resolve in the next thread.

---

## Active-workflow sources

| Workflow | Home | Cleared on new chat? |
|----------|------|----------------------|
| Conversation owner pointer | conversationContinuity | Yes |
| Estate capability conversation workflow | estateCapabilityRegistry conversationState | Yes |
| Universal creation | universalCreation | Yes |
| Frictionless pending open | frictionlessActionLayer storage | Yes |
| Create builder / workspace | CPC clearTodayContext | Yes (CPC path) |
| Discovery mode session | discovery session | **Missing** |
| Implied need | impliedNeedSession | **Missing** |
| Active task lock | `lib/estate/activeTaskLock.ts` | **Missing** |
| Continuity / UC sessions | conversationContinuity | Owner cleared; other sessions vary |

---

## New-chat clearing behavior (today)

**Working path:** `resetActiveConversation({ mode: "new-chat" })` then CPC UI wipe + `NEW_CONVERSATION_GREETING`.

Clears: messages, conversation session, owner, estate digest/activeTask/unfinishedLoops, UC, frictionless pending, chamber, guided help, estate place menu, handoff stash, contextual help, in-flight chat abort.

**Does not clear:** `clearPendingChoice`, `clearCompanionConversationState`, `clearOutcomeThread`, `clearLastActivity`, `clearActiveTaskLockState`, collection pending offer, discovery/implied-need/friction-first sessions, explicit `endTurnDecision`.

---

## New-day clearing behavior

Same `resetActiveConversation({ mode: "new-day" })` core via `runSharedNewDay` / CPC.  
Difference: welcome ownership (daily opening card; chat messages often empty).  
Same gaps as New Chat for pending-choice and companion-context session stores.

**Status new-day isolation:** **partially working** (same hole as New Chat for pending choice).

---

## Paths that can reintroduce prior context

| Path | Mechanism | Risk |
|------|-----------|------|
| Surviving pending choice | `hasActivePendingChoice` + `resolvePendingChoiceTurn` early in CPC / frictionless | Old menu numbers resolve after New Chat |
| Companion conversation context | `lastDiscussedEntity`, `lastUserGoal`, `activeSession`, `pendingAction` in sessionStorage | Stale nouns / session lock |
| Outcome thread hint | `outcomeThreadHintForChat` / trust engine | “Remember you were working on…” after New Chat |
| Last activity → Continue | `getLastActivity` / `resolveCompanionContinue` | Continue cue without new-chat clear (P3) |
| Active task lock | `activeTaskLock` | Can block/route as if prior task still active |
| Estate memory leftovers | Profile prefs intentionally kept; digest cleared | Low if clear ran; high if reset skipped |
| `companionLedContinue` / daily opening | Continue cards / prompts from unfinished work | Can surface “continue where left off” (CB-008 / P3) |
| Soft same-day Welcome Card | Shows card / clears messages **without** `resetActiveConversation` | Thread id + temp stores may not rotate |
| Continuity prompt supremacy | `GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK` in `companionPrompt.ts` | Model pressure to preserve “active task” after UI thread is fresh |
| `estateMemoryHintForChat` | Must show FRESH THREAD after clear | Working when reset runs; goals may still inject (long-term OK) |
| Compound overwhelm reply | Hard-coded “proposal” (pre-fix) / task language | Invented noun without history (**Phase A fixed invent path**; still not new-chat-specific) |
| Chat API history | If UI still sends old messages | Mitigated by `clearConversation` + CPC `setMessages` welcome-only |
| Handoff stash | Silent restore | Cleared on reset — **working** |
| Frictionless / discovery sessions | Session lock / navigation suppress | Can bias next turn if not cleared |
| `handleSend(..., fresh=true)` | Clears message storage only | Not full isolation |
| Prompt libraries | Generic “proposal” examples in `companionPrompt` | Soft bleed of wording, not member data |

---

## Early returns (relevant)

| Location | Behavior | Isolation impact |
|----------|----------|------------------|
| CPC pending-choice block (~13524+) | Resolves pending before many other routes | If pending survives New Chat → **bypass** |
| Frictionless `tryPendingChoiceFlow` | Same | Same |
| Continuity / UC gates before turn decision | May continue prior workflow | Reduced if owner cleared; UC session cleared |
| `finishEarlyChatTurn` owners | Local replies without full reset awareness | Safe if state cleared; unsafe if pending/context remain |
| Estate intelligence runtime | Can offer menus from query alone | OK; should not carry prior project noun |

---

## Response owners (can speak with stale context)

| Owner | Risk if temp state survives |
|-------|-----------------------------|
| `pending_choice` | High — executes old menu |
| `frictionless:*` / estate_concierge / navigation | Medium — may use companion-context session or discovery |
| `universal:*` / create | Low after UC clear |
| `chat_api` | Medium — if digest/context/prompt still carries thread |
| Arrival / daily opening continue | Medium — P3 continue language |
| Compound / overwhelm local | Medium — invented or sticky task nouns |

---

## Known bypasses

1. **`clearPendingChoice` not in `resetActiveConversation` or `clearTodayContext`** — primary contract hole for P1.  
2. **`clearCompanionConversationState` not called on New Chat** — sticky `lastDiscussedEntity` / `pendingAction` / session.  
3. **`clearOutcomeThread` / `clearLastActivity` / `clearActiveTaskLockState` / collection pending offer** not in shared reset.  
4. **Discovery / implied-need / friction-first sessions** not in shared reset.  
5. **`GLOBAL_CONVERSATION_CONTINUITY_OVERRIDE_BLOCK`** still injected after New Chat (model-level continuity pressure).  
6. **Soft same-day Welcome Card** can skip full id rotation / reset.  
7. **Continue-where-left-off surfaces** (arrival/daily opening / last activity) may offer resume without new-chat isolation proof (CB-008).  
8. **Phase A harness / tests** that clear state manually can hide production reset gaps.  
9. **Priority engine off** (`NEXT_PUBLIC_CONVERSATION_PRIORITY_ENGINE=0`) → fewer mid-turn stale clears.

---

## Duplicated or conflicting logic

| Conflict | Detail |
|----------|--------|
| Dual reset surfaces | Shared `resetActiveConversation` vs large CPC `clearTodayContext` — CPC adds UI/workspace clears the lib does not |
| Pending place menu vs pending choice | `clearPendingEstatePlaceMenu` clears some pending; numbered `spark:pending-choice:v1` may remain |
| Production reset ≠ Phase A test isolation | Tests manually clear pending + companion context; production reset does not |
| Continuity Override vs Fresh Thread | Prompt supremacy fights estate fresh-thread hint after New Chat |
| Two thread ids | Conversation session `conversationId` vs estate memory `sessionId` — both rotate, but different owners |
| Message stores | `companionStore` conversation + CPC React `messages` — both cleared on happy path |
| Continue vs isolate | CB-007 vs CB-008 / companionLedContinue — intentional product tension; needs evidence gate |

---

## Behavior with no profile or setup

New Chat does not require profile completion. Greeting + empty thread work with prefs defaults.  
**Status:** **working** for no-setup competence on the reset path itself.

---

## Existing tests

| Suite | Coverage |
|-------|----------|
| `lib/conversationReset/resetActiveConversation.test.ts` | New chat/day id rotation, message clear, estate digest clear, prefs preserve, stash clear, contextual help |
| `lib/estateMenu/welcomeHomeMenuVerification.test.ts` | Source expects `resetActiveConversation` |
| `lib/conversationStabilization/phaseABlockerCorrection.test.ts` | Isolation of overwhelm after proposal — **manual clears**, not production New Chat button |
| Pending choice tests | Resolve/consume menus — do **not** assert New Chat clears pending |
| companionLedContinue tests | Continue labeling — not new-chat isolation |

---

## Missing tests

- New Chat → `hasActivePendingChoice()` is false  
- New Chat → companion conversation context empty  
- New Chat → outcome thread / last activity / active-task lock empty  
- New Chat → discovery / implied-need / friction-first sessions empty  
- After New Chat, input `3` does not navigate prior menu destination  
- After New Chat, first user message contains no prior project/proposal noun from temp state  
- Refresh after New Chat does not restore pending choice  
- Soft Welcome Card path: either full reset or documented as non-isolating  
- Live preview: Conversations → New Chat → visible isolation (SSO-gated today)

---

## Live verification status

**unverified** on authenticated preview UI.  
Unit/path evidence exists for partial reset; pending-choice gap not live-proven.

---

## Requirement status matrix

| ID | Requirement | Status |
|----|-------------|--------|
| R1 | New conversation identity | **working** |
| R2 | Clear pending answers/selections | **partially working** (owner yes; pending-choice store **missing**) |
| R3 | Clear temporary workflow state | **partially working** (UC/frictionless/owner yes; discovery/implied-need/companion-context/outcome/last-activity/task-lock **missing**) |
| R4 | Clear unconfirmed turn inferences | **partially working** / **unverified** (turn store ephemeral; companion-context inferences can stick) |
| R5 | Preserve long-term memory / saved work | **working** |
| R6 | No unrelated active noun import | **partially working** (Phase A invent fixed; sticky context/pending still **bypassed**) |
| R7 | Explicit resume of saved work later | **working** / **unverified** (continue surfaces exist; evidence gate is CB-008) |
| R8 | Current turn outranks history | **partially working** (decision layer improves; stale pending/context **bypass**) |
| P1 | Old pending menu must not resolve | **bypassed** / **conflicting** |
| P2 | Unrelated prior project must not appear | **partially working** / **unverified** |
| P3 | No continue-without-evidence | **unverified** / possible **conflict** with continue UX |
| P4 | No sticky prior emotion assumption | **partially working** (emotional history kept in estate memory; current cleared) |
| P5 | Must not delete saved LT memory | **working** |

---

## Recommended authoritative implementation boundary

**Single owner for New Chat / New Day isolation:**  
`lib/conversationReset/resetActiveConversation.ts`

CPC `clearTodayContext` remains the UI adapter (messages, room, workspace chrome) but must not own a second incomplete clear list.

Reset must clear **all** temporary conversation vectors, including at minimum:

- `clearPendingChoice()`
- `clearCompanionConversationState()`
- `clearOutcomeThread()`
- `clearLastActivity()` (conversation continue cue only — not saved projects)
- `clearActiveTaskLockState()`
- collection pending offer clear (if exposed)
- discovery / implied-need / friction-first session clears
- `endTurnDecision()` (safe no-op if none)

Separately evaluate: whether Continuity Override prompt should be suppressed on a fresh thread (prompt-layer, not store clear).

Long-term prefs, projects, rhythms, profile stay out of this function.

---

## Recommended next implementation step

1. Extend `resetActiveConversation` to clear pending-choice, companion conversation context, outcome thread, last-activity continue cue, active-task lock, collection pending, and remaining temp sessions (minimal, listed).  
2. Add regression tests: pending menu does not survive New Chat; `3` after New Chat does not navigate; outcome/last-activity/continue cues empty after reset.  
3. Wire CPC only if any UI-only state remains; ensure soft Welcome Card path either calls full reset or is documented as non-isolating.  
4. Preview-verify Conversations → New Chat with an active numbered menu beforehand.  
5. Do **not** start Phase B response-composer migration.  
6. Do **not** deploy production until CB-007 live gate passes.

---

## Risks to existing working behavior

| Risk | Mitigation |
|------|------------|
| Over-clearing destroys intentional continue (CB-008) | Only clear *temporary* stores; keep prefs/projects; continue stays explicit/evidence-gated |
| Clearing pending mid-thread if reset mis-invoked | Reset only on New Chat / New Day entry points |
| Estate digest vs profile | Keep current `clearConversationThreadFromEstateMemory` profile preserve |
| Double-clear / import cycles | Centralize in `resetActiveConversation`; CPC calls it once |
| Breaking Phase A pending tests | Update tests to use production reset rather than ad-hoc clears |
