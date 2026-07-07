# Conversation Regression Audit

**Date:** 2026-07-05  
**Status:** Audit only — no code changes  
**Scope:** Ten regressions from the latest manual conversation transcript (Jul 4–5 reliability sprint + live stress-test paste)  
**Branch audited:** `main` @ `964e77a` (companion-app)

**Resolution architecture:** [SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md](./SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md)

---

## Executive summary

The regressions are **not ten unrelated bugs**. They cluster around **five architectural fractures**:

1. **Hard-coded 3-choice estate fallbacks** that bypass the 75-place canonical registry  
2. **`isLiveEstatePlace` filtering** that hides registered but `planned` places (Possibility House, Porch Swing, etc.)  
3. **Pending-choice ordinal false positives** (`"three"` in a sentence → option 3 → Observatory)  
4. **Parallel routers** (Decision Engine, frictionless, estate kernel, environment intelligence) **racing without a single continuation owner**  
5. **Emotional / meta-question turns** falling through to estate menus or generic chat instead of repair or direct answers  

Fix order should start with **pending-choice safety** and **meta-question guards** (low risk, high member impact), then **registry-driven menus** (medium risk), then **pipeline ownership** (higher risk).

---

## Source transcript (evidence)

| Regression | Observed in transcript / smoke test |
|---|---|
| 1, 2, 3, 10 | Estate wander / room-list behavior during exploration sessions |
| 4, 5, 6, 7, 8 | Jul 4 smoke test report: Music Room hijacked by stale coffee menu; marketing plan / SOP partial or wrong owner |
| 9 | User paste (Jul 4 11:29 AM): stress → environment menu → Porch Swing navigation → generic recovery |

Representative stress transcript:

> **User:** today i am really stressed  
> **Spark:** There's pressure here — I hear it…  
> **User:** i know, i can't seem to relax or catch my breath  
> **Spark:** A few easy places on the Estate to unwind: 1. Coffee House… 2. Peaceful Places… 3. Porch Swing…  
> **User:** 3  
> **Spark:** Let's go — porch swing.  
> *(Porch Swing is not live; should have stayed with emotional support.)*

---

## Hard-coded 3-room fallback inventory

These lists **override or shadow** the full estate map for member-facing menus. They are the direct source of regression **#1** (and partly **#3**).

### Primary wander fallback (Coffee House → Library → Observatory → Tea Room…)

**File:** `lib/estate/estateWanderNavigation.ts`

```ts
export const ESTATE_WANDER_PLACE_ORDER = [
  "coffee-house", "library", "observatory", "tea-room", "dining-room", ...
];
export function pickWanderPlaceIds(...) {
  return pool.slice(0, 3);  // always three
}
```

**Used by:**
- `formatEstateWanderMenu()` (same file)
- `evaluateMetaEstateNavigationTurn()` → `isAnotherRoomRequest` / `isEstateRoomListOrMapRequest`  
  (`lib/estate/estateMetaNavigation.ts` lines 126–132)
- `formatEstateRoomPickerLine()` → delegates to wander menu (line 80–84)

### Alternate exploratory fallback (different three)

**File:** `lib/estate/estateMetaNavigation.ts`

```ts
const DEFAULT_EXPLORATORY_PLACE_IDS = [
  "coffee-house", "music-room", "conservatory", ...
];
return pinQuietSuggestionOrder([...filtered]).slice(0, 3);
```

### Vague-intent clusters (includes Coffee House / Library / Observatory)

**File:** `lib/estate/estatePlaceClusters.ts`

| Pattern | placeIds (max 3) |
|---|---|
| Water | seat-at-pond, reflection-pond, lakeside-verandah |
| Gather / coffee | **coffee-house**, **tea-room**, dining-room |
| Study | **library**, discovery-room, evidence-vault |
| Outside | **observatory**, estate-gardens, summer-terrace |

Each cluster: `.slice(0, 3)` in `filterCluster()`.

### Global caps (intentional T-003, but compounds repetition)

| File | Constant |
|---|---|
| `lib/estate/estatePlaceNavigation.ts` | `ESTATE_PLACE_MAX_CHOICES = 3` |
| `lib/estate/estatePlaceIdentityLock.ts` | `ESTATE_PLACE_IDENTITY_MAX_CHOICES = 3`, `QUIET_PLACE_SUGGESTION_ORDER` |
| `lib/estate/canonicalPlaceSuggestions.ts` | `CANONICAL_PLACE_SUGGESTION_MAX = 3` |
| `lib/estate/directory/buildDirectory.ts` | `getEstateDirectoryEntriesForProfile(..., max = 3)` |

**Does the 3-room list override the full map?**  
**Yes, for conversational offers.** `resolveEstateRoutingDecision()` and `CANONICAL_ESTATE_REGISTRY` (75 places) exist, but **menu surfaces still call wander/cluster/meta helpers** that slice to three IDs from fixed arrays. The registry is authoritative for *navigation when a place is named*; it is **not** authoritative for *what gets offered* in wander/list flows.

---

## Regression-by-regression analysis

### 1. Estate room list repeats only 3 rooms

| Field | Detail |
|---|---|
| **Actual bad behavior** | Member asks for another room, a room list, or vague exploration; Spark repeatedly offers the same three names (often Coffee House, Library, Observatory or Coffee House, Peaceful Places, Porch Swing). |
| **Expected behavior** | Offer **three choices max** (T-003) but drawn from **canonical registry** by relevance, excluding current room, including subspaces when appropriate — not the same static trio every time. |
| **Likely files** | `lib/estate/estateWanderNavigation.ts`, `lib/estate/estateMetaNavigation.ts`, `lib/estate/estatePlaceClusters.ts`, `lib/estate/estatePlaceIdentityLock.ts` |
| **Failure type** | **Estate knowledge** + **prompt/menu formatting** |
| **Safest fix** | Add `pickRegistryPlaceIds({ intent, excludeId, limit: 3 })` in `canonicalEstateRegistry.ts`; make `formatEstateWanderMenu` / `pickExploratoryPlaceIds` call it instead of static arrays. Keep `slice(0,3)` — change the **source pool**. |
| **Fix risk** | **Low–medium.** Risk of surfacing `planned` places unless filtered through `isLiveEstatePlace`. |

---

### 2. “Somewhere near water” → system says it is unsure

| Field | Detail |
|---|---|
| **Actual bad behavior** | Vague water request gets “I’m not sure” / generic chat instead of a numbered water cluster. |
| **Expected behavior** | Match `VAGUE_WATER_RE` → offer seat-at-pond, reflection-pond, lakeside-verandah (Spec 108 invitation, three choices). |
| **Likely files** | `lib/estate/estatePlaceClusters.ts` (pattern exists), `lib/estate/estatePlaceNavigation.ts` (`evaluateEstatePlaceTurn` ~863–871), `app/companion/CompanionPageClient.tsx` (pipeline order — estate kernel may not run), `lib/environment-intelligence` (`evaluateEnvironmentOffer` ~12005) |
| **Failure type** | **Routing** — water cluster exists but **earlier layer** (chat API, frictionless, environment) answers first; or kernel blocked by `blockKernelNavigation` |
| **Safest fix** | Ensure `matchVaguePlaceCluster` runs in **early reliable sync layer** before companion API; add integration test `"somewhere near water"` → offer with ≥2 live water placeIds. |
| **Fix risk** | **Low** if scoped to vague-cluster routing only. |

---

### 3. Treehouse / Possibility House rooms are missing

| Field | Detail |
|---|---|
| **Actual bad behavior** | Possibility House / treehouse spaces never appear in menus; navigation may fail or feel “unknown.” |
| **Expected behavior** | Registered subspaces navigable by alias; menus include Possibility House when relevant. |
| **Likely files** | `lib/estate/canonicalEstateSubplaces.ts` (`status: "planned"`), `lib/estate/liveEstatePlace.ts`, `lib/pendingChoice/resolve.ts` (`placeChoicesFromIds` filters non-live), `lib/estate/estateRoutingRegistry.ts` (aliases exist), `lib/estate/estateRoomAliasCatalog.ts` (treehouse **not** in alias catalog) |
| **Failure type** | **Estate knowledge** — registry vs live gate mismatch |
| **Safest fix** | **Product decision first:** mark `house-possibility-outside` (+ key subspaces) `navigable` / `partial` in canon, OR expose “coming soon” copy instead of omission. Then sync `estateRoomAliasCatalog.ts` with `estateRoutingRegistry.ts`. |
| **Fix risk** | **Medium** — enabling live navigation without backgrounds/routes ships broken visits. |

---

### 4. “Yes” does not continue the prior task

| Field | Detail |
|---|---|
| **Actual bad behavior** | After Spark asks “Want me to…?” / offers a tool or next step, member says “yes” and Spark re-opens a menu, repeats options, or starts a new flow. |
| **Expected behavior** | Affirmation continues the **same pending action** (create, decision, sheet, navigation invite) with one warm ack. |
| **Likely files** | `lib/frictionlessActionLayer.ts` (`resolveFrictionlessContinuation`, `AFFIRMATION_RE`, `isFrictionlessPendingAlignedWithAssistant`), `lib/pendingChoice/resolve.ts` (bare `yes` → `unrecognized` replay, not continuation), `app/companion/CompanionPageClient.tsx` (pending choice **before** frictionless yes ~10295 vs ~10628) |
| **Failure type** | **Pending-action failure** |
| **Safest fix** | In `resolvePendingChoiceTurn`, if input is affirmation **and** last assistant was permission/offering context, delegate to `resolveFrictionlessContinuation` instead of menu replay. Unify pending stores or add cross-bridge. |
| **Fix risk** | **Medium** — wrong bridge could execute stale actions; require turn + assistant alignment tests. |

---

### 5. Numbered or option-based answers are not understood

| Field | Detail |
|---|---|
| **Actual bad behavior** | `"1"`, `"3"`, `"the coffee one"`, or `"music room"` after a menu fails, replays menu, navigates wrong room, or clears pending state. Smoke test: stale coffee menu hijacked Music Room → tea room. |
| **Expected behavior** | Pending choice resolves reliably; stale menus expire on topic change; explicit room names override stale pending. |
| **Likely files** | `lib/pendingChoice/parseSelection.ts`, `lib/pendingChoice/resolve.ts` (`TOPIC_CHANGE_RE`, `hasHardEstateNavigationIntent`), `lib/pendingChoice/manager.ts` (10 min TTL), `app/companion/CompanionPageClient.tsx` (registration timing ~15039) |
| **Failure type** | **Pending-action failure** + **routing** |
| **Safest fix** | (a) Clear pending on **any** explicit place name match before parse; (b) tighten `parseNumberIndex` — require **standalone** ordinals/digits, not `"three"` inside a sentence (fixes #10 too); (c) register pending menu **before** async API returns. |
| **Fix risk** | **Low–medium.** Tighter parsing may require `"option 2"` for edge cases — acceptable per Spec 106 numbered choices. |

---

### 6. Email flow loses context after “yes add more”

| Field | Detail |
|---|---|
| **Actual bad behavior** | Mid-email discovery, member affirms wanting to add more detail; Spark restarts or jumps to unrelated flow. |
| **Expected behavior** | Continue `UniversalCreationSession` for `email` document type; next discovery question or draft step. |
| **Likely files** | `app/companion/CompanionPageClient.tsx` (`universalCreationContinuation` ~10385–10391), `lib/universalCreation/*` (session persistence), `lib/pendingChoice/resolve.ts` (`TOPIC_CHANGE_RE` may clear pending), `lib/frictionlessActionLayer.ts` (`shouldEnterUniversalCreation` bail in concierge ~1357) |
| **Failure type** | **Memory** (session) + **pending-action failure** |
| **Safest fix** | Treat `"yes add more"` / `"add more"` as **session continuation** when `loadUniversalCreationSession()` active — skip pending-choice and topic_change clearing; gate before `resolvePendingChoiceTurn`. |
| **Fix risk** | **Medium** — must not trap members in stale email sessions; honor “never mind / start over.” |

---

### 7. SOP flow restarts as generic creation

| Field | Detail |
|---|---|
| **Actual bad behavior** | “Help me write an SOP” starts generic Create or re-asks “what are you building?” instead of SOP-specific discovery. |
| **Expected behavior** | `documentType: sop` profile questions from `documentCreationProfiles.ts`; no generic funnel. |
| **Likely files** | `lib/universalCreation/orchestrator.ts`, `lib/universalCreation/documentCreationProfiles.ts`, `lib/universalCreation/createFastPath.ts`, `lib/sparkCompanion/intentAdapter.ts` (CREATE terminal override), `lib/conversation/primaryTurnClassifier.ts` (`shouldEnterUniversalCreation`) |
| **Failure type** | **Routing** + **prompt** |
| **Safest fix** | Ensure `detectUniversalDocumentType("SOP")` wins in fast path; regression test that SOP first question matches profile, not generic create opener. Smoke failure: SOP partial in Jul 4 report. |
| **Fix risk** | **Low** if limited to document-type detection + profile wiring. |

---

### 8. Decision request incorrectly routes to create flow

| Field | Detail |
|---|---|
| **Actual bad behavior** | “Help me decide…” opens universal creation / content generator instead of Decision Compass / coaching. |
| **Expected behavior** | Decision support → `buildDecisionSupportDecision` → Decision Compass invite (Spec 106 permission, max 3 choices). |
| **Likely files** | `lib/sparkCompanion/intentAdapter.ts` (`reconcilePrimaryTurnWithDecisionEngine` — **CREATE high confidence is terminal**), `lib/frictionlessActionLayer.ts` (~3044–3051 decision branch), `lib/sparkCompanion/sparkDecisionEngine/classifyIntent.ts` (no distinct DECISION intent — THINK vs CREATE) |
| **Failure type** | **Routing** |
| **Safest fix** | Add decision phrase guard **before** CREATE terminal reconcile: `help me decide`, `which option`, `decision compass` → never map to CREATE. Test: `"help me decide whether to hire"` → `decision_support`. |
| **Fix risk** | **Medium** — “decide on marketing copy” might legitimately be CREATE; use phrase + object classification. |

---

### 9. Frustrated/stressed user gets generic questions instead of repair

| Field | Detail |
|---|---|
| **Actual bad behavior** | Stress / breathlessness triggers estate unwind menu or “I'm listening — what's your question?” instead of emotional repair. |
| **Expected behavior** | Spec 108: understand first; Spec 111 hospitality; one caring question; environment invite **only after** confirming, optional, three choices. |
| **Likely files** | `lib/environment-intelligence` (`evaluateEnvironmentOffer`, `shouldSurfaceEnvironmentOffer`), `app/companion/CompanionPageClient.tsx` (~12005), `lib/conversation/primaryTurnClassifier.ts` (`EMOTIONAL_SUPPORT_RE` — **does not include** `stressed`, `relax`, `catch my breath`), `lib/frictionlessActionLayer.ts` (`EMOTIONAL_REGULATION_RE` exists but may run too late), `lib/chatFastPath/chatTurnGuarantee.ts` (generic fallback) |
| **Failure type** | **Routing** + **prompt** |
| **Safest fix** | Expand emotional gate in **primary turn** (stressed, can't relax, catch breath, too much on my brain); block `evaluateEnvironmentOffer` until confirming state; run emotional sync layer **before** estate kernel. |
| **Fix risk** | **Low** — aligns with existing Spec 106/108/111; watch for over-blocking legitimate “I need to relax” environment invites when calm. |

---

### 10. “Are these the only three places?” → chooses Observatory instead of answering

| Field | Detail |
|---|---|
| **Actual bad behavior** | Meta question about the menu navigates to Observatory (often option 3 on Coffee House / Library / Observatory menus). |
| **Expected behavior** | Answer conversationally: estate has many places; offer map or broader sample — **do not navigate**. |
| **Likely files** | `lib/pendingChoice/parseSelection.ts` — **`ORDINAL_WORDS.three` matches inside question** → index 2 → third menu item; `lib/estate/estateMetaNavigationPhrases.ts` (no pattern for “only three places”); `lib/sparkKnowledge/estateGuide.ts` (estate scope questions) |
| **Failure type** | **Pending-action failure** (false positive parse) |
| **Safest fix** | (1) `parseNumberIndex`: only match ordinals when `isLikelyMenuSelectionInput` is true **and** message length ≤ threshold OR starts with digit; (2) add meta pattern `only (?:three|3) places` → `tryEstateGuideFlow` / informational reply. |
| **Fix risk** | **Low** — high confidence root cause from code inspection. |

---

## Top 5 root causes

| Rank | Root cause | Regressions affected |
|---|---|---|
| **1** | **Static 3-place fallback arrays** (`estateWanderNavigation`, `estateMetaNavigation`, clusters) decoupled from canonical registry | 1, 2, 3, 10 |
| **2** | **Pending-choice parser treats ordinals in natural sentences as menu picks** (`"three"` → option 3) | 5, 10 |
| **3** | **No unified continuation owner** for yes / add more / numbered replies across `pendingChoice`, `frictionlessPending`, `universalCreationSession` | 4, 5, 6, 7 |
| **4** | **`isLiveEstatePlace` + `planned` canon** hides Possibility House / Porch Swing while still routing or mentioning them | 3, 9 |
| **5** | **Decision Engine CREATE terminal override** + emotional patterns missing from primary classifier → wrong owner | 8, 9 |

---

## Exact files to change (ordered)

| Priority | File | Change |
|---|---|---|
| P0 | `lib/pendingChoice/parseSelection.ts` | Standalone-only ordinal/digit matching; reject question-shaped input |
| P0 | `lib/pendingChoice/resolve.ts` | Affirmation bridge; don’t clear UC session on “add more” |
| P0 | `lib/estate/estateMetaNavigationPhrases.ts` | Meta patterns: “only three places”, “are these all”, “what else is there” |
| P1 | `lib/conversation/primaryTurnClassifier.ts` | Stress / breath / brain-overload → EMOTIONAL_SUPPORT before TASK |
| P1 | `lib/sparkCompanion/intentAdapter.ts` | Decision phrase guard before CREATE terminal |
| P1 | `app/companion/CompanionPageClient.tsx` | Pipeline order: emotional + vague-cluster + UC session before pending-choice topic_change |
| P2 | `lib/estate/estateWanderNavigation.ts` | Registry-driven `pickWanderPlaceIds` |
| P2 | `lib/estate/estateMetaNavigation.ts` | Registry-driven exploratory picks |
| P2 | `lib/estate/canonicalEstateRegistry.ts` | `pickSuggestionsForIntent({ limit: 3, liveOnly: true })` helper |
| P2 | `lib/estate/liveEstatePlace.ts` + `canonicalEstateSubplaces.ts` | Align live status for shippable treehouse spaces |
| P2 | `lib/estate/estateRoomAliasCatalog.ts` | Sync Possibility House / treehouse aliases from routing registry |
| P3 | `lib/frictionlessActionLayer.ts` | Consolidate yes-continuation; decision vs create ordering |
| P3 | `lib/environment-intelligence/*` | Gate environment offers behind confirming + non-distress |

---

## Safest fix order

1. **Pending-choice false positives** (`parseSelection.ts`, meta phrases) — fixes #5, #10 immediately, low blast radius  
2. **Yes / session continuation gates** (`resolve.ts`, `CompanionPageClient.tsx` handleSend) — fixes #4, #6  
3. **Decision-before-CREATE guard** (`intentAdapter.ts`) — fixes #8  
4. **Emotional-first routing** (`primaryTurnClassifier.ts`, environment gate) — fixes #9  
5. **Registry-driven 3-choice menus** (wander + meta + clusters) — fixes #1, #2  
6. **Possibility House live status + alias sync** — fixes #3 (requires content/UX sign-off)  
7. **SOP/email profile regression tests** — locks #6, #7  

---

## Tests to add before changing code

| Test file (proposed) | Cases |
|---|---|
| `lib/pendingChoice/pendingChoice.test.ts` | `"are these the only three places?"` → **not** resolved; `"3"` alone → resolved; stale menu + `"music room"` → topic_change + navigate music-room |
| `lib/estate/estateWanderNavigation.test.ts` | Wander picks rotate; exclude current; never return <2 live ids; **not always** coffee-library-observatory order |
| `lib/estate/estatePlaceClusters.test.ts` | `"somewhere near water"` → water cluster; `"somewhere near water?"` with kernel context |
| `lib/estate/estateRoutingRegistry.test.ts` | `"possibility house"` navigates when live; menu includes treehouse when status flipped |
| `lib/conversation/emotionalRouting.test.ts` | `"can't relax or catch my breath"` → no estate menu; blocks environment offer |
| `lib/sparkCompanion/intentAdapter.test.ts` | `"help me decide"` + CREATE engine → decision_support owner, not universal_creation |
| `lib/universalCreation/universalCreation.test.ts` | Email multi-turn + `"yes add more"` preserves session; SOP first question from profile |
| `lib/conversation/sparkV4Reliability.test.ts` | Golden path: menu → pick → navigate; menu → meta question → **no** navigate |
| `lib/conversation/conversationWatchdogSmoke.test.ts` | Extend: post-menu meta question does not leave `isLoading` true |

**Manual smoke (post-fix):**

1. Coffee → pick 2 → correct room (not stale menu)  
2. “Somewhere near water” → 3 water places  
3. “Show me another room” → different trio on repeat  
4. “Are these the only three places?” → conversational answer, no navigation  
5. Email discovery → “yes add more” → same session  
6. “Help me write an SOP” → SOP-specific first question  
7. “Help me decide” → Decision Compass invite, not Create  
8. Stress transcript replay → no environment menu on turn 2  

---

## Pipeline reference (current `handleSend` order)

For debugging, estate-related regressions often come from **which layer speaks first**:

```
classifyPrimaryConversationTurn + Decision Engine reconcile
  → early social / support exits
  → hasActivePendingChoice() → resolvePendingChoiceTurn   ← #5, #10
  → universal creation fast path                          ← #6, #7, #8
  → frictionless yes-continuation                         ← #4
  → estate kernel / frictionless / companion API
  → post-API: registerPendingEstatePlaceMenuFromAssistant
```

**Rule violated:** Spec 106 — one owner per turn; pending continuation and CREATE terminal override both claim ownership.

---

## Out of scope for this audit

- Welcome Home intro (separate deploy track)  
- New rooms or guidebook content  
- Prompt / wisdom layer changes (Observation Mode Rule of Three)  
- UI redesign  

---

## Sign-off checklist (before implementing)

- [ ] Product decision on Possibility House / Porch Swing live vs planned copy  
- [ ] Registry-driven menus approved (still max 3 choices)  
- [ ] Pending-choice parse changes reviewed against CT-01 / CT-11 gold paths  
- [ ] No new features — reliability fixes only  
