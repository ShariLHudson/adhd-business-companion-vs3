# Gap Map — Global Chamber Topic Ownership and Context Preservation (CB-022)

**Contract (CB):** `docs/companion-behavior/contracts/022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md`  
**Contract (CE copy):** `docs/conversation-engine/contracts/080_CB_022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md`  
**Audit prompt:** `docs/conversation-engine/prompts/081_CURSOR_AUDIT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP.md`  
**Implement prompt (not run):** `docs/conversation-engine/prompts/082_CURSOR_IMPLEMENT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GATE.md`  
**Live checklist:** `docs/conversation-engine/verification/083_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_LIVE_CHECKLIST.md`  
**Related:** CB-017 · CB-021 · CE-012 / CE-013 / CE-014 · `audits/CONVERSATION_ENGINE_GAP_MAP.md`  

**Audit status:** `gap_map_complete`  
**Implementation:** not started  
**Constraint honored:** one global fix — no member-specific patches · no knowledge-library edits · no production deploy  

---

## Confirmed failure pattern

| Step | Runtime behavior |
|------|------------------|
| 1. User asks a domain question | Text may contain Chamber alias tokens (`money`, `content`, `clients`, `ai`, …) |
| 2. Chamber member selected | `resolveChamberMemberFromText` → `detectChamberMemberCommand` → `resolveEstateAction` → `NAVIGATE` |
| 3. User supplies context / asks again | Alias rematches; same NAVIGATE path |
| 4. Generic / arrival / intro takeover | Arrival greeting + `activationOpener` + `estateCommandAckLine` |
| 5. Question unanswered | `kernelHandled` → `finishEarlyChatTurn` — companion-chat / Shari composer never runs |

**Shared path** for Finance, Content, Client Relationships, AI & Technology, and every future Chamber member. Do **not** patch specialists separately.

---

## Incident traces (same path)

| Incident | Example user language | Alias trigger | Visible writers before answer |
|----------|----------------------|---------------|-------------------------------|
| Client Relationships | Build relationships with new ADHD app members… | `clients` / relationship aliases | Arrival + opener + ack → early-exit / generic help if API later runs |
| Content (CB-021 INC-002) | Best type of **content** for Instagram… | `content` | Arrival + Content opener + `Of course — here's Content.` |
| Finance (CB-021 INC-001) | Subscriptions costing me **money**… | `money` | Arrival + Finance opener + `Of course — here's Finance.` |
| AI & Technology | Webinar equipment / **AI** tooling… | `ai` / technology aliases | May answer once, then re-intro / research noise on rematch |

---

## Current state owners

| Concern | Owner today | Path / symbols | Tracks user goal? |
|---------|-------------|----------------|-------------------|
| Pending numbered menus | PendingChoice | `lib/pendingChoice/manager.ts` | Optional `activeIntent` — menus only |
| Continuity pointer | Continuity | `lib/conversationContinuity/ownerStore.ts` · `resolveActiveOwner.ts` | Optional `topic` / `awaitingAnswer` — **not** goal |
| Active Chamber member | Chamber activation | `lib/chamber/chamberMemberActivation.ts` | Member id only |
| Turn decision (Phase A) | Stabilization | `lib/conversationStabilization/turnDecisionStore.ts` · `conversationDecision.ts` | **Per-turn only** — no topic |
| Outcome thread | Outcome | `lib/companionOutcomeThread.ts` | Optional `currentGoal` — **not wired for Chamber** |
| Workflow lock | Workflow | `lib/activeWorkflowContextLock.ts` · room awareness | Workspace resume — not Chamber topics |
| Chat history | CPC React | `app/companion/CompanionPageClient.tsx` | Messages only — not authoritative topic state |

### ActiveTopicState

| Contract requirement | Status |
|----------------------|--------|
| `ActiveTopicState` (`topicId`, `userGoal`, `status`, `responseOwner: "shari"`, …) | **Missing** |
| CB-017 `ActiveConversationStep` / `ProgressionDecision` | **Missing** |
| Closest equivalents | Continuity `chamber_specialist`; outcome `currentGoal`; pending `activeIntent` — none implement CB-022 |

---

## Fallback owners (exact strings)

| Visible string | Symbol / source | Path |
|----------------|-----------------|------|
| `What would help you move forward today?` | `CHAMBER_ARRIVAL.shariGreeting` / `CHAMBER_ENTRY_PROMPT` | `lib/estate/estateArrivalExperience.ts` · `lib/estate/chamberOfMomentumRouting.ts` → `playPlaceFirstArrival` → `EstateArrivalHost` |
| `I'm here — tell me what you need and we'll take it from there.` | `GENERIC_RECOVERY_BRIDGE` | `lib/sparkConversation/coachingFallback.ts` |
| Settings / reminders / Clear My Mind help | `executeFeature` unmatched `localReply` | `lib/estateIntelligenceRuntime/executeEstateIntelligence.ts` |
| `Of course — here's ${label}.` | `estateCommandAckLine` | `lib/estateIntelligence/estateCommandRouter.ts` |
| Member intro | `activationOpener` → `inviteChamberMemberCore` | `lib/chamber/chamberMemberRegistry.ts` · `chamberMemberActivation.ts` · CPC |
| Help Me Choose stay-in-chat | Default cue in CPC | `navigateDailyOpeningDestination` / `helpMeChooseNeeds.ts` |

**None gated by unresolved ActiveTopicState** (state does not exist).

---

## Early-exit points

### Chamber NAVIGATE path (primary)

1. `findAliasHits` / `resolveChamberMemberFromText` — `lib/chamber/chamberMemberAliases.ts`  
2. `detectChamberMemberCommand` — `lib/estateIntelligence/estateCommandRouter.ts` (`executeImmediately: true`)  
3. `evaluateEstateCommand` Priority 1 — Chamber before rooms  
4. `resolveEstateAction` — returns `NAVIGATE` + `navigationLine: estateCommandAckLine(...)` — `lib/estate/decisionKernel/resolveEstateAction.ts`  
5. `classifyCompanionIntent` — Chamber **exempt** from Fix A chat-force when `planOpensChamberMember` — `lib/companionTurn/classifyCompanionIntent.ts`  
6. `executeCompanionIntent` → navigate → `runDirectEstateRoomNavigation` / `openChamberOfMomentumCore`  
7. `playPlaceFirstArrival("chamber-of-momentum")` → greeting  
8. `inviteChamberMemberCore` → appends `activationOpener` (again even for same member)  
9. `kernelHandled` → `finishEarlyChatTurn` — **no companion-chat API**

### Triple Chamber exemption (continuity cannot save the turn)

| Layer | Intended behavior | Actual |
|-------|-------------------|--------|
| Continuity | `continue_in_chat` + `blockKernelNavigation: true` for `chamber_specialist` | Set, but… |
| `classifyCompanionIntent` | Should respect chat lock | Keeps `NAVIGATE` for Chamber member plans |
| CPC `onNavigatePlace` | Should block kernel nav | Skips block when `chamberMemberId` present |

Result: continuity says stay-in-chat; Chamber NAVIGATE still wins.

### Secondary early-exits / diversions

- `GENERIC_RECOVERY_BRIDGE` when API path runs without progression state (CB-017 overlap)  
- Estate feature how-to generic (settings / reminders / CMM)  
- Help Me Choose stay-in-chat cues without awaiting-answer registration  
- Frictionless / scenic destination offers after kernel (when chat path runs)

---

## Topic-clear conditions (today)

| State | Cleared when |
|-------|--------------|
| Active Chamber member | Dismiss / leave Chamber / clear activation |
| Continuity pointer | Explicit exit / task change / workflow correction / stale owner |
| PendingChoice | Resolve / clear / timeout |
| Turn decision | End of turn |
| **User goal / unresolved need** | **Never stored — effectively cleared every turn** |

---

## Topic-replacement conditions (today)

| Should replace topic | Actual |
|----------------------|--------|
| Explicit user topic change | Not modeled |
| Weak alias / keyword collision | **Wins** — rematches and restarts activate/ack |
| Generic help trigger | Can replace unanswered domain goal |
| Clarification answer | Should advance `awaiting_clarification` → `ready_to_answer` — **instead rematches and restarts** |

`isChamberMemberRequest` (talk-to / ask Finance phrasing) exists in `chamberMemberAliases.ts` but is **not** required by `detectChamberMemberCommand` before NAVIGATE.

---

## Member activation path

```
alias hit → detectChamberMemberCommand → resolveEstateAction NAVIGATE
  → runDirectEstateRoomNavigation / openChamberOfMomentumCore
  → playPlaceFirstArrival (greeting)
  → inviteChamberMemberCore (activationOpener)
  → estateCommandAckLine written
  → finishEarlyChatTurn
```

Affected members: **all** with aliases in `CHAMBER_MEMBER_ALIASES` (Finance, Content, Client Relationships, AI & Technology, Marketing, …). Future members inherit the same bug unless the shared path is fixed.

---

## Response ownership path

| Layer | Owner today |
|-------|-------------|
| Contract `responseOwner: "shari"` | **Missing** |
| Visible writers on incident | Arrival + opener + ack |
| Chat API / Shari composer | **Skipped** on kernel early-exit |
| `chamberMemberHintForChat` | Can bind model identity to Chamber member when API eventually runs — CB-021 |
| Phase A `finalResponseOwner` | Annotation only — not a write gate |

---

## Requirement status (CB-022)

| Requirement | Status |
|-------------|--------|
| Preserve user goal across turns | **Fail** |
| Advance after clarification | **Fail** |
| Block generic fallbacks while unresolved | **Fail** |
| One response owner (Shari) | **Fail** |
| No restart discovery | **Fail** |
| Explicit topic change only replaces | **Fail** |
| Resolve before reroute | **Fail** |
| Continue normal reasoning (no early-exit) | **Fail** |

---

## Proposed authoritative owner

**One place:** Conversation Engine active-topic ownership in `lib/conversationStabilization/` (new thin module, e.g. `activeTopicStore` + `resolveActiveTopicGate`), with Continuity reading it — **not** owning competing copies.

**Called once** from the primary send path in `CompanionPageClient.tsx` / companion-turn pipeline **before**:

- Chamber `NAVIGATE` side effects  
- `inviteChamberMemberCore` / opener append  
- arrival greeting as chat writer  
- `GENERIC_RECOVERY_BRIDGE` / feature how-to generics  
- frictionless destination opens that would replace the topic  

**Not sufficient alone:**

- Only `resolveEstateAction` (too late; Chamber already wins)  
- Only Continuity (already sets `blockKernelNavigation`; Chamber is exempt)  
- Per-member opener edits (phrase patch; forbidden)

Aligns with CB-021 advisory orchestration + CB-017 progression + CE-012 / CE-013 / CE-014.

---

## Smallest global implementation slice

1. **ActiveTopicState** (session-scoped) — set when domain goal identified or Chamber contribution starts; clear only on answered / completed / cancelled / explicit topic change.  
2. **Shared Chamber navigate gate** — auto-NAVIGATE only if `isChamberMemberRequest` **or** explicit menu/gallery pick; bare aliases inside help questions → in-chat contribution, no navigate.  
3. **Remove Chamber exemptions** from Fix A + `onNavigatePlace` when active topic is unresolved or specialist already active.  
4. **Already-active specialist** → `continue_in_chat` only; never re-append `activationOpener` + ack.  
5. **Fallback guard** — if status ∈ `identified | awaiting_clarification | ready_to_answer`, hard-block listed generic strings + arrival greeting as chat writers.  
6. **Single Shari write** — structured contribution only; `responseOwner: "shari"`.

**Do not:**

- Patch Client Relationships, Finance, Content, AI & Technology separately  
- Phrase-router around individual openers  
- Edit Chamber knowledge libraries for this bug  
- Deploy before live verification  

---

## Tests required

| Test | Assert |
|------|--------|
| Finance money/subscriptions | No ack/opener loop; question reaches answer path |
| Content Instagram / vs FB/LinkedIn | Same |
| Client Relationships ADHD members goal | Goal preserved; no settings/CMM generic |
| AI & Technology domain Q | No re-intro mid-answer; no early-exit on rematch |
| Already-active Chamber + same alias | `continue_in_chat`; no second opener/ack |
| Explicit `isChamberMemberRequest` | Talk-to / Take me to still opens Chamber |
| Active topic blocks | `GENERIC_RECOVERY_BRIDGE` · arrival greeting · feature settings string |
| Clarification → `ready_to_answer` | No rediscovery |
| Explicit topic change | Replaces ActiveTopicState |
| Alias unit negatives | “best type of **content**…” / “costing me **money**” do **not** auto-NAVIGATE |
| Live | `verification/083_…` (+ CB-021 `023` / `054`) |

Extend (do not only affirm) `lib/chamber/chamberMemberAliases.test.ts`, `lib/companionTurn/companionTurnPipeline.test.ts`.

---

## Preview risks

| Risk | Mitigation |
|------|------------|
| Explicit “Talk to Finance” / bare “Finance” | Keep `isChamberMemberRequest` / menu path |
| Ambiguous “more clients” clarify | Keep existing Sales vs CR clarify |
| True DIRECT_COMMAND (Clear My Mind, etc.) | Keep kernel exemptions only for explicit capture/nav |
| Board Meet openers | Separate surface — do not over-gate |
| `chamberMemberHintForChat` identity | Coordinate with CB-021 ownership |
| Arrival animation vs chat greeting | Visual arrival OK; chat greeting must be gated |
| Tests that treat keyword NAVIGATE as success | Update expectations |

---

## Deploy recommendation

**Do not deploy** until authenticated preview passes `083_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_LIVE_CHECKLIST.md` and CB-021 Finance/Content checklists.

Ship as **one** shared Conversation Engine + Chamber navigate-gate change with CB-017/CB-021 spirit — not as member knowledge or opener text edits.

---

## Code citation index

| Symbol | Path |
|--------|------|
| `resolveChamberMemberFromText`, `isChamberMemberRequest`, `CHAMBER_MEMBER_ALIASES` | `lib/chamber/chamberMemberAliases.ts` |
| `detectChamberMemberCommand`, `estateCommandAckLine` | `lib/estateIntelligence/estateCommandRouter.ts` |
| `resolveEstateAction` | `lib/estate/decisionKernel/resolveEstateAction.ts` |
| `planOpensChamberMember`, `classifyCompanionIntent` | `lib/companionTurn/classifyCompanionIntent.ts` |
| `executeCompanionIntent` | `lib/companionTurn/executeCompanionIntent.ts` |
| `inviteChamberMemberCore`, `openChamberOfMomentumCore`, `finishEarlyChatTurn` | `app/companion/CompanionPageClient.tsx` |
| `activateChamberMember`, `buildChamberMemberInviteMessages` | `lib/chamber/chamberMemberActivation.ts` |
| `activationOpener` | `lib/chamber/chamberMemberRegistry.ts` |
| `chamberMemberHintForChat` | `lib/chamber/chamberMemberPrompt.ts` |
| `playPlaceFirstArrival` | `lib/estate/estatePlaceFirstArrival.ts` |
| `GENERIC_RECOVERY_BRIDGE` | `lib/sparkConversation/coachingFallback.ts` |
| `executeFeature` settings string | `lib/estateIntelligenceRuntime/executeEstateIntelligence.ts` |
| Continuity gate | `lib/conversationContinuity/resolveContinuityGate.ts` · `routeTurnToOwner.ts` |
| Phase A decision | `lib/conversationStabilization/conversationDecision.ts` |

---

## Bottom line

CB-022 fails because **ActiveTopicState does not exist**, and Chamber alias **NAVIGATE is triple-exempt** from continuity/kernel chat locks. Domain questions are replaced by arrival + opener + ack; the turn exits before Shari can answer.

**Authoritative owner:** Conversation Engine active-topic module under `lib/conversationStabilization/`, gated once on the send path.  
**Smallest slice:** ActiveTopicState + shared Chamber navigate gate + remove exemptions + fallback guard + single Shari write.  
**Next:** run implement prompt `082` only after this gap map is accepted — still no production deploy until `083` passes.
