# Gap Map — Global Intent-First Classification, Workflow-State Validation, and Strategy Library (CB-022 Addendum)

**Contract:** `docs/companion-behavior/contracts/085_CB_022_INTENT_FIRST_CLASSIFICATION_WORKFLOW_VALIDATION_AND_STRATEGY_LIBRARY_ADDENDUM.md`  
**CE copy:** `docs/conversation-engine/contracts/085_CB_022_INTENT_FIRST_CLASSIFICATION_WORKFLOW_VALIDATION_AND_STRATEGY_LIBRARY_ADDENDUM.md`  
**Audit prompt:** `docs/conversation-engine/prompts/086_CURSOR_AUDIT_GLOBAL_INTENT_WORKFLOW_AND_STRATEGY_LIBRARY.md`  
**Implement prompt (not run):** `docs/conversation-engine/prompts/087_CURSOR_IMPLEMENT_GLOBAL_INTENT_WORKFLOW_AND_STRATEGY_LIBRARY_GATE.md`  
**Live checklist:** `docs/conversation-engine/verification/088_GLOBAL_INTENT_WORKFLOW_AND_STRATEGY_LIBRARY_LIVE_CHECKLIST.md`  
**Nav manifest:** `docs/navigation/089_GLOBAL_STRATEGY_LIBRARY_NAVIGATION_AND_STATE_MANIFEST_UPDATE.md`  
**Related:** CB-022 Chamber topic ownership (`GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GAP_MAP.md`) · Continuity / UC · Strategy routing  

**Audit status:** `gap_map_complete`  
**Implementation:** `implemented_preview` — see `lib/conversationStabilization/intentClassificationGate.ts` + `workflowResumeDecision.ts`  
**Constraint honored:** no VA phrase patch · no Strategy Library deletion · **do not deploy production**

---

## Confirmed failure pattern (incident)

| Step | Runtime behavior |
|------|------------------|
| 1. User: “I need to create a new strategy for better communications with my VA.” | Loose CPC strategy regex fires **or** UC / create path competes; ADHD vs Business disambiguation can appear |
| 2. ADHD or Business classification | `strategyDisambiguationMessage()` + `strategyDisambiguationPending` |
| 3. User answers clearly (“Business” / “ADHD”) | Pending handler is **late** in `handleSend`; sticky UC owner / create fast path can win first |
| 4. Old Create Document resumes | Continuity `route_to_owner` → Universal Creation **or** `universalCreationContinuation` + CREATE fast path |
| 5. User corrects | `detectWorkflowCorrection` clears UC; early-return ack only |
| 6. Classification restarts | User repeats request → same loose regex; **no durable classification memory** |
| 7. Older strategy flow | `startBusinessStrategyBuilder` / Strategies panel coaching without clear browse/apply/create/resume ownership |

**Shared path** — not VA-specific. Any “create … strategy” + stale UC session + ADHD/Business pending state reproduces.

---

## Incident trace (exact owners)

```
User strategy create wording
  → [optional] isSimpleCreateRequest / UC owner (can claim turn first)
  → CPC loose regex (strateg + create) → strategyDisambiguationMessage
  → strategyDisambiguationPending = true (React only)
User: "Business"
  → resolveContinuityTurnGate: sticky guided_workflow|artifact → canOwnerHandleTurn = ALWAYS true
  → routeTurnToOwner → universal_creation reply ("We were creating your document…")
  → finishEarlyChatTurn  **before** strategyDisambiguationPending handler
OR (if continuity fall_through):
  → universalCreationContinuation (session phase / approvedDraft) → CREATE_FAST_PATH
  → strategyDisambiguationPending handler never runs
```

---

## A) ADHD vs Business classification — where emitted

| Concern | Owner today | Path / symbols |
|---------|-------------|----------------|
| Intent classifier | Strategy routing | `lib/strategyRouting.ts` — `classifyStrategyIntent`, `StrategyIntentKind` |
| Visible prompt | Strategy routing | `strategyDisambiguationMessage()` — “Reply with **ADHD** or **Business**…” |
| Choice parser | Strategy routing | `parseStrategyDisambiguationChoice` |
| Emission + pending flag | CPC send path | `app/companion/CompanionPageClient.tsx` — `strategyDisambiguationPending` state; block ~14577–14634 |
| Trigger (CPC, looser than classifier) | CPC | `/\bstrateg/i` ∧ `/\b(?:create\|how\s+do)/i` — **does not** use `classifyStrategyIntent === "ambiguous"` |
| Classifier “ambiguous” | Strategy routing | `AMBIGUOUS_CREATE_RE` — misses “create a **new** strategy” (only optional `a `) |
| Business create detection | Strategy routing | `BUSINESS_CREATE_RE` — requires marketing/sales/launch/content/product/visibility/**business** strategy — **not** “communications with VA” |
| Copy elsewhere | Help / knowledge | `lib/appFeatureKnowledge.ts`, `lib/howDoIEcosystemGuide.ts`, `lib/howDoIHelpArticles.ts` — “Pick ADHD or Business” |

**Gap:** Classification is unnecessary when outcome is already “create a strategy” (possibly ADHD-aware). Answer is **not** persisted in `ActiveTopicState` or Continuity — only ephemeral React `strategyDisambiguationPending`.

---

## B) Create Document / Universal Creation / strategy session storage & resume

| State | Storage | Load / clear | Resume path |
|-------|---------|--------------|-------------|
| Universal Creation (Create Document) | `localStorage` key `universal-creation-session-v1` + memory | `loadUniversalCreationSession` / `saveUniversalCreationSession` / `clearUniversalCreationSession` — `lib/universalCreation/orchestrator.ts` | Continuity owner + CREATE fast path + `resolveUniversalCreationTurn` |
| Continuity owner pointer | Continuity store | `getActiveConversationOwner` ← `ownerFromUniversalCreation` — `lib/conversationContinuity/resolveActiveOwner.ts` | `resolveContinuityTurnGate` → `routeTurnToOwner` |
| Business strategy builder | React state in CPC (`businessStrategySession`) | `bootstrapBusinessStrategySession` — `lib/businessStrategyBuilder.ts`; **not** durable localStorage | Panel + chat when `workspacePanel === "playbook"` |
| ADHD strategy apply | `companion-strategy-apply-v1` | `lib/strategyApplySessionStore.ts` | `processStrategyApplyTurn` when playbook + session |
| Strategy Library UI | `StrategiesPanel` views | Component state + `openView` command | `components/companion/StrategiesPanel.tsx` |
| Active workflow lock | In-memory context | `resolveActiveWorkflowContext` — `lib/activeWorkflowContextLock.ts` | Concept-Q lock; **not** semantic resume validation |

### Create / UC resume (exact)

- Sticky owner: `canOwnerHandleTurn` for `guided_workflow` | `artifact` **returns true for any non-exit message** (`lib/conversationContinuity/canOwnerHandleTurn.ts` lines 24–28).
- Gate: `resolveContinuityTurnGate` → `route_to_owner` (`lib/conversationContinuity/resolveContinuityGate.ts`).
- Apply: CPC `continuityGate.action === "route_to_owner"` → append `routed.reply` + early return (`CompanionPageClient.tsx` ~13236–13274).
- Recovery copy: `describeOwnerForRecovery` — “We were creating your {documentType}…” (`lib/conversationContinuity/describeOwnerForRecovery.ts`).
- Fast path: `isSimpleCreateRequest` / `universalCreationContinuation` → `resolveCreateFastPathAction` (`lib/universalCreation/createFastPath.ts`, `lib/frictionlessActionLayer.ts`, CPC ~13826–13904).
- `SIMPLE_CREATE_VERB_RE` matches `create a` / `create new` — **incident phrase is a simple create request** → defaults `documentType` to `"document"` via `detectUniversalDocumentType` when no plugin matches.

### Strategy resume

- Disambiguation → `startBusinessStrategyBuilder("Business Strategy")` (CPC ~14580–14585, ~11272).
- Playbook panel + `classifyStrategyIntent === "business_create"` → builder (CPC ~14603–14618).
- Apply coach: `strategyApplySession` + `saveStrategyApplySession`.

---

## C) Workflow-state validation vs current intent (missing)

| Contract need (`WorkflowResumeDecision`) | Status |
|------------------------------------------|--------|
| `shouldResume` + reason (`stale_state` \| `new_intent` \| `workflow_conflict` \| …) | **Missing** |
| Compare current goal / topic / artifact type / destination vs prior workflow | **Missing** |
| Explicit continue only for conflicting workflows | Partial — exit/correction only; **not** new-intent vs stale UC |
| Block resume of Create Document when user asked for strategy | **Fail** — sticky owner always handles |
| Semantic compatibility before CREATE fast path | **Fail** — phase/session presence enough |

**Closest existing pieces (insufficient):**

| Piece | Why insufficient |
|-------|------------------|
| `detectWorkflowCorrection` | Phrase-based correction after harm; not proactive validation |
| `isExplicitTaskChange` | Narrow nav destinations; **strategy create is not a task change** |
| `isExplicitOwnerExit` | stop/cancel only |
| `ActiveTopicState` (Chamber CB-022) | Tracks domain goal for Chamber; **does not** gate UC resume or strategy classification |
| `activeWorkflowContextLock` | Mid-workflow concept questions; no artifact-type conflict |

---

## D) Strategy Library — existence, routes, menus, Get Advice

| Surface | Status | Path / symbols |
|---------|--------|----------------|
| Strategy Library UI (ADHD / Business / Recommended / Saved / custom) | **Exists** | `components/companion/StrategiesPanel.tsx` — home views `adhd` \| `business` \| `recommended` \| `saved` \| `new` |
| Catalog / intelligence | Exists | `lib/strategySystem.ts`, `lib/strategyCatalog.ts`, `lib/strategyIntelligence.ts` |
| App section / nav id | `playbook` | `lib/companionUi.ts`, `lib/companionRouting.ts` |
| Hard nav | “open strategies” → playbook | `lib/hardNavigationCommands` / `lib/pendingAction.ts` |
| Help articles | “Open Strategies” | `lib/howDoIContent.ts` (`create-strategy`, `use-strategies`), `lib/howDoIHelpArticles.ts` |
| Capability registry | Business Strategy → tool `playbook` | `lib/estateBrain/capabilityRegistry.ts` |
| **Get Advice** Welcome Home | Chamber + Boardroom **only** — **no Strategy Library** | `lib/estate/welcomeHomeNavigationStructure.ts` — `get-advice` destinations |
| Top nav Knowledge items | Same as Get Advice | `SPARK_ESTATE_ROOM_MENU_KNOWLEDGE_ITEMS` in `lib/estate/sparkEstateTopNavigationAndProfileMenu.ts` |

**Required placement:** Get Advice → Strategy Library — **not registered today**.

---

## E) Legacy / deleted marking (incorrect risk)

| Location | Disposition | Risk |
|----------|-------------|------|
| `lib/estateExperiences/legacyWorkspaceMap.ts` — `legacyId: "playbook"` | `disposition: "move"` → Business → Strategy; notes “Was standalone Strategies workspace” | **Not deleted**, but frames Strategies as legacy-to-Business, conflicting with **Get Advice → Strategy Library** |
| ESTATE_REGISTRY | Playbook / Strategies 🔄 Business; Strategy Builder 🔄 Business | Mixed / migration — not “deleted” |
| Docs / prompts | Explicitly forbid deleting Strategy Library | Preserve |

**Do not** treat `disposition: "move"` as license to remove StrategiesPanel or content. Re-home under Get Advice without deleting assets.

---

## F) Overlap with ActiveTopicState / CB-022 Chamber (just shipped)

| CB-022 Chamber (shipped) | This addendum |
|--------------------------|---------------|
| `ActiveTopicState` in `lib/conversationStabilization/activeTopicTypes.ts` | Needs intent / artifact / workflow resume fields **or** sibling gate |
| `processActiveTopicOnUserTurn` at start of CPC send (~13073) | Runs **before** continuity/create but **only** Chamber navigate / generic fallback gates |
| `activeTopicGate.ts` / `chamberNavigateGate.ts` | Does **not** block UC sticky resume or ADHD/Business restart |
| Gap map `GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GAP_MAP.md` still says ActiveTopicState “Missing” | **Stale** — store + tests exist (`activeTopicOwnership.test.ts`) |

**Overlap recommendation:** Extend the **same Conversation Engine owner** (`lib/conversationStabilization/`) with workflow-resume + intent-classification gates — do not invent a third topic store. Continuity remains executor of UC routing but must **ask** the gate before resume.

---

## G) Artifact-type distinctions (today)

| Artifact / experience | Owner | Treated as |
|----------------------|-------|------------|
| Generic create + “strategy” | UC `detectUniversalDocumentType` → often `"document"` | Create Document |
| Business strategy builder | `businessStrategyBuilder` + playbook | Separate coaching flow |
| ADHD apply | `strategyApplyCoach` + session store | Apply technique |
| Strategy Library browse | `StrategiesPanel` views | Browse / saved / recommended |
| Chamber specialist | Chamber + ActiveTopic | Advice conversation — not Strategy Library |
| Create builder (content-generator) | `createBuilderChat` | Another create path |

**Gap:** No shared `requestedArtifactType: "strategy" | "document" | …` before UC entry. Rule 7 fails: strategy create collapses to document.

---

## H) Early-exit / pending-choice / workflow lock overrides

| Path | Can override clear new strategy intent? | Symbol / path |
|------|----------------------------------------|---------------|
| Continuity sticky UC | **Yes — primary incident** | `canOwnerHandleTurn` always true; `route_to_owner` early return |
| CREATE fast path / `universalCreationContinuation` | **Yes** | CPC ~13826–13904; session phase / `approvedDraft` without intent match |
| Pending choice | Yes if menu active | `resolvePendingChoiceTurn` + `finishEarlyChatTurn("pending_choice")` |
| `strategyDisambiguationPending` | Late; skipped if earlier early-exit | CPC ~14577 |
| Workflow correction early return | Clears UC but does not advance strategy intent | CPC ~13167–13199 |
| Active workflow lock | Locks concept teaching mid-flow | `isActiveWorkflowLocked` |
| Chamber ActiveTopic / navigate | Separate; can still divert if alias hits | CB-022 Chamber path |
| `continuityLocksBroadRouting` | Blocks create fast path when continue_in_chat | Does not help when UC already claimed turn |

---

## Classification persistence

| Requirement | Status |
|-------------|--------|
| Once answered, stay resolved | **Fail** — React flag only; restart on repeat phrasing |
| Contradict / topic change clears | Not modeled for strategy |
| Intent-first: skip ask when clear | **Fail** — CPC always asks on strateg+create |

---

## Exact source of Create Document mismatch

1. **Artifact collapse:** `isSimpleCreateRequest` + `detectUniversalDocumentType` → `"document"` for “create a new strategy…”.  
2. **Sticky resume without semantic check:** `canOwnerHandleTurn` + Continuity `route_to_owner` resumes UC for any follow-up including “Business”.  
3. **Handler order:** Continuity + CREATE fast path **before** `strategyDisambiguationPending` resolution.  
4. **No `WorkflowResumeDecision`.**

---

## Requirement status (addendum)

| Requirement | Status |
|-------------|--------|
| Intent-first (skip ADHD/Business when clear) | **Fail** |
| Infer and continue | **Fail** |
| Workflow-state validation before resume | **Fail** |
| New intent beats stale state | **Fail** |
| Explicit resume for conflicting workflows | **Fail** (sticky always) |
| Classification must not restart | **Fail** |
| Artifact type match | **Fail** |
| Preserve Strategy Library | **Pass** (exists; not deleted) |
| Separate Library from stale strategy state | **Fail** |
| Get Advice → Strategy Library placement | **Fail** |
| Browse / apply / create / resume modes | Partial UI; **not** owned in turn pipeline |
| Shari response owner | Partial (Chamber gate); create/strategy early-exits still write local replies |

---

## Proposed authoritative owner

**One place:** Conversation Engine under `lib/conversationStabilization/` — extend with:

1. **`resolveIntentClassificationGate`** (or fold into `processActiveTopicOnUserTurn`) — intent-first: ask ADHD/Business **only** when two paths remain and distinction changes next action; persist resolution on ActiveTopic / session fields.  
2. **`resolveWorkflowResumeDecision`** — structured `WorkflowResumeDecision` before Continuity `route_to_owner` and before CREATE fast path.

**Called once** from CPC send path **immediately after** (or inside) `processActiveTopicOnUserTurn`, **before**:

- `resolveContinuityTurnGate` sticky UC resume  
- `resolveCreateFastPathAction` / `universalCreationContinuation`  
- `strategyDisambiguationPending` emission  
- `startBusinessStrategyBuilder` / apply coach  

**Continuity** remains the UC/board router but must respect `shouldResume === false` → clear or park stale work, fall through to new intent.

**Not sufficient alone:** only `strategyRouting.ts` phrase tweaks · only CPC order swap · VA-specific regex · deleting StrategiesPanel.

---

## Strategy Library preservation + Get Advice placement plan

1. **Keep** `StrategiesPanel`, catalogs, ADHD/Business/Recommended/Saved, apply coach, business builder.  
2. **Register** destination under Get Advice in `welcomeHomeNavigationStructure.ts` (and tests), e.g. `{ id: "strategy-library", label: "Strategy Library" }` → opens `playbook` / StrategiesPanel.  
3. **Update** `legacyWorkspaceMap` notes: preserve under Get Advice (not “delete as Business-only legacy”).  
4. **Alias** existing “Strategies” / `playbook` / hard-nav “open strategies” to the same destination.  
5. **Do not** merge Strategy Library into Create Document or Chamber.  
6. Chat entry: browse / apply / create / resume via shared gate — Library supplies data; Shari speaks.

---

## Smallest global implementation slice

1. **`WorkflowResumeDecision`** helper + unit tests — block UC resume when current intent artifact type ≠ stored `documentType` / user requests strategy|chamber|etc., unless explicit continue.  
2. **Wire gate** into Continuity `resolveContinuityTurnGate` (or CPC before it) + CREATE fast path entry.  
3. **Intent-first classification** — replace CPC loose regex with shared `classifyStrategyIntent` + skip-ask when confidence high; persist answer on ActiveTopic/session until contradict/restart.  
4. **Handler order** — resolve pending strategy classification **before** UC sticky resume when pending flag set; never re-ask if resolved.  
5. **Artifact type** — “create … strategy” → strategy experience (Library create / business builder), not UC `"document"`.  
6. **Nav** — Get Advice → Strategy Library registration only (no content deletion).

**Do not:** VA phrase patch · per-room forks · delete Strategy Library · production deploy.

---

## Tests required

| Test | Assert |
|------|--------|
| Incident phrase (generic VA wording) | No ADHD/Business ask when create-strategy clear; **or** ask once then never restart |
| ADHD-aware business strategy wording | Infer + continue; no classify |
| Stale UC document + new strategy intent | `shouldResume: false` / `new_intent`; no “We were creating your document” |
| Explicit “continue the document” | Resume UC |
| Classification answer “Business” | Starts strategy create; **not** UC; answer persists |
| After correction + repeat request | No second ADHD/Business ask if still same intent |
| Browse “strategies for procrastination” | Opens Strategy Library / ADHD path — not Create Document |
| Get Advice menu | Contains Strategy Library; opens same `playbook` panel |
| Legacy map | Strategies not disposition-delete |
| ActiveTopic coexistence | Chamber topic gate still works; strategy intent does not break Chamber CB-022 |
| Live | `088_GLOBAL_INTENT_WORKFLOW_AND_STRATEGY_LIBRARY_LIVE_CHECKLIST.md` |

Extend: `lib/strategyRouting.test.ts`, `lib/conversationContinuity/*.test.ts`, `lib/universalCreation/createFastPath` tests, `welcomeHomeNavigationStructure.test.ts`, new `workflowResumeDecision` tests.

---

## Migration / preview risks

| Risk | Mitigation |
|------|------------|
| Legitimate UC mid-draft short answers | Explicit continue + awaitingAnswer + artifact match |
| “Business” as domain word vs classification answer | Pending classification context wins when flag set |
| Business-hq placement of playbook vs Get Advice | Alias both; one panel |
| Sticky Chamber + strategy | ActiveTopic + resume gate compose; don’t drop Chamber fix |
| Tests expecting UC on any “create a …” | Update for strategy carve-out |

---

## Deploy recommendation

**Do not deploy.** Preview-only after `088` live checklist + regression of Chamber CB-022 (`083`) and Continuity create-correction tests.

---

## Code citation index

| Symbol | Path |
|--------|------|
| `classifyStrategyIntent`, `strategyDisambiguationMessage`, `parseStrategyDisambiguationChoice` | `lib/strategyRouting.ts` |
| `strategyDisambiguationPending`, create/strategy send blocks, `startBusinessStrategyBuilder` | `app/companion/CompanionPageClient.tsx` |
| `loadUniversalCreationSession`, `detectUniversalDocumentType`, `resolveUniversalCreationTurn` | `lib/universalCreation/orchestrator.ts` |
| `isSimpleCreateRequest`, `SIMPLE_CREATE_VERB_RE` | `lib/universalCreation/createFastPath.ts` |
| `resolveCreateFastPathAction`, `tryUniversalCreationFlow` | `lib/frictionlessActionLayer.ts` |
| `resolveContinuityTurnGate`, `canOwnerHandleTurn`, `routeTurnToOwner`, `ownerFromUniversalCreation` | `lib/conversationContinuity/*` |
| `detectWorkflowCorrection` | `lib/conversationContinuity/workflowCorrection.ts` |
| `resolveActiveWorkflowContext` | `lib/activeWorkflowContextLock.ts` |
| `StrategiesPanel` | `components/companion/StrategiesPanel.tsx` |
| `WELCOME_HOME_NAV_CATEGORIES` Get Advice | `lib/estate/welcomeHomeNavigationStructure.ts` |
| `legacyId: "playbook"` | `lib/estateExperiences/legacyWorkspaceMap.ts` |
| `ActiveTopicState`, `processActiveTopicOnUserTurn` | `lib/conversationStabilization/activeTopicTypes.ts`, `activeTopicGate.ts`, `activeTopicStore.ts` |
| Strategy apply persistence | `lib/strategyApplySessionStore.ts` |
| Business strategy session | `lib/businessStrategyBuilder.ts` |

---

## Bottom line

The incident is a **global ownership failure**: ADHD/Business classification is a late CPC side path; Create Document (Universal Creation) sticky continuity resumes **without** semantic intent/artifact validation; Strategy Library **exists** but is **absent from Get Advice** and partially framed as Business legacy.

**Authoritative owner:** extend Conversation Engine `lib/conversationStabilization/` with intent-first classification + `WorkflowResumeDecision`, called once before Continuity/UC/strategy emission.  
**Preserve** Strategy Library; place under **Get Advice → Strategy Library**.  
**Next:** implement prompt `087` only after this gap map is accepted — **no production deploy**.
