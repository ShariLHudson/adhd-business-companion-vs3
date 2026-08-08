# Work Recognition + Chamber Integration Validation

| Field | Value |
|-------|-------|
| **Status** | Complete. Narrow fixes applied; two structural findings documented, not fixed (see §4). |
| **Date** | 2026-08-07 |
| **Requested as** | Validation of the whole chain — *User thought → Work Recognition → Understanding → Relevant Chamber lenses → One Shari voice → Correct destination* — before expanding more Chamber experts, since expanding experts only has value once they're actually reachable. |
| **Test** | `lib/chamberExpertise/__tests__/workRecognitionChamberIntegration.test.ts` |

---

## 0. Why this exists as its own validation, separate from the Chamber-only rounds

Every prior validation round (`CHAMBER_ACTIVATION_V2_VALIDATION_SET.md`) tested Chamber activation against Work Recognition's *output* (`intentCategory`, `estateCategory`, `legacyExpertIds`). It never tested whether a message **reaches** Chamber at all, or which of several upstream systems actually decides what happens on a turn. This round tests the whole stack:

```
Create Fast Path (lib/universalCreation/createFastPath.ts)
  → if it fires, short-circuits BEFORE intent/estate/Chamber ever run
Intent Routing (lib/intentRoutingIntelligence.ts)
  → work-type classification, feature offers, tone
Estate Routing (lib/estateBrain/routeIntentFirstNavigation.ts)
  → destination room/capability
Chamber Activation (lib/chamberExpertise/resolveChamberExpertActivationV2.ts)
  → which expert lens(es) inform Shari's thinking
```

This is not one classifier. It's a stack, and the finding worth naming up front: **a message can be correctly understood by one layer and still never benefit from that understanding, because an earlier layer already decided what happens.**

---

## 1. The five scenarios — before and after

| # | Message | Layer | Before | After | Verdict |
|---|---------|-------|--------|-------|---------|
| **1** | "I want to create a newsletter." | Create Fast Path | Fires; enters Universal Creation discovery (asks *"What's the main reason you're creating this newsletter?"* — not a draft) | unchanged | ✅ Already correct — UC's own discovery-first design already does "understand before draft" |
| | | Chamber | primary `CNT`, supporting `[MKT, SALES]` | unchanged | ✅ Matches the request's own examples of what "newsletter" could mean (content, marketing, sales nurture) |
| **2** | "I want to develop a process for new clients." | Estate | `create.email` (!) — wrong, no email content anywhere in the request | `create.sop` | ✅ Fixed (§2.1) |
| | | Chamber | `primary: null` — no recognition at all | primary `SYS`, supporting `[CR]` | ✅ Fixed (§2.2) |
| **3** | "I want to plan a birthday party for a staff member." | Estate | `momentum.projects` (generic planning space) — not "Strategy Studio" (the specific wrong destination worried about), but not celebration-themed either | unchanged (see §3 for why) | 🟡 Acceptable, not ideal — documented, not forced |
| | | Chamber | `primary: null` — no recognition at all | primary `EVT` (contested with a tiebreak), supporting `[MKT, CR]` | ✅ Fixed (§2.3) |
| **4** | "I want to grow my ADHD coaching business." | Estate | `business.strategy` / Boardroom, generic 3-expert legacy list | unchanged (already reasonable) | ✅ Already correct |
| | | Chamber | `primary: null` — no recognition at all | `co-primary: [MKT, STR]`, supporting `[CR]` | ✅ Fixed (§2.4) — matches "Could involve: Strategy, Marketing, Client Relationships" exactly |
| **5** | "I'm overwhelmed trying to figure out my workshop." | Estate | `restore.calm` / Music Room — **correctly** recognizes overwhelm and offers a restore destination | unchanged | ✅ Estate layer already gets this right |
| | | Create Fast Path | `isSimpleCreateRequest === true` (matches bare `"workshop"`) — would override the correct Estate signal above and enter workshop-creation discovery instead | unchanged | 🔴 **Not fixed — see §4.1.** This is the most important finding in this validation. |

---

## 2. Fixes applied (narrow, additive, same low-risk pattern as every prior round)

### 2.1 Estate: `create.sop` was missing a "process" trigger

`bestCapabilityForRoute` (`lib/estateBrain/routeIntentFirstNavigation.ts`) scores every `create.*` capability in Create Studio; with no trigger match, several capabilities (email, newsletter, SOP, proposal, …) tie at the same base score, and ties are broken by **array position** — `create.email` happens to be first in the registry, so any untriggered "develop/create/build X" sentence silently defaults to "Email." Added `"process"` and `"develop a process"` to `create.sop`'s triggers (`lib/estateBrain/capabilityRegistry.ts`) — a trigger match adds enough score to clear the tie honestly instead of relying on registry order. Verified: 43/43 `lib/estateBrain` tests still pass.

**Not fixed, flagged for its own review:** the underlying array-order tiebreak in `bestCapabilityForRoute` is the exact same anti-pattern this whole Chamber Activation V2 effort existed to eliminate (see `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md` §0) — except here it governs *all* Estate capability routing, not just Chamber. This single-trigger fix closes today's *specific* symptom; it does not close the general defect, which would affect any other untriggered create-ish phrasing. See §4.2.

### 2.2 Systems needed "develop a process"; Client Relationships needed to surface for it

Systems' `outcomeSignals` had `"create a process"`/`"document a process"` but not `"develop a process"` — the exact verb this request used (the same word-form-mismatch pattern found in every prior validation round). Added it. Client Relationships already had a bare `"clients"` keyword (added in the previous round) — combined with Systems' curated `supportingRelationships: ["CR"]`, Client Relationships now correctly surfaces as supporting once Systems activates.

### 2.3 Events and People & Culture had no vocabulary for a staff celebration

Neither expert had ever been tested against "birthday party"/"staff member" language. Added `"birthday party"`, `"staff celebration"`, `"celebrate a team member"`, `"surprise party"` to Events, and `"celebrate a team member"`, `"staff member"`, `"recognize an employee"` to People & Culture (also added to Events' `possibleRelationships`, so it can surface when relevant, capped by the existing `MAX_POSSIBLE`).

### 2.4 Strategy and Marketing had no vocabulary for "grow my business"

An extremely common, natural founder phrasing with zero coverage anywhere. Added `"grow my business"` / `"grow the business"` to both Strategy's and Marketing's `outcomeSignals`. Because Marketing's own curated `supportingRelationships` already includes Strategy and Client Relationships, this single addition alone was enough to produce the full three-lens result the request describes — no invented Client Relationships trigger was needed; the curated collaboration structure already did that work once Marketing became reachable.

---

## 3. Scenario 3's estate destination — documented, not forced

`momentum.projects` is not celebration-themed, but it is also not the specific wrong outcome worried about ("Strategy Studio"). Investigated whether to add `"birthday"`/`"party"` to Estate's existing `"celebrate"` intent category (`lib/estateBrain/intentCategories.ts`) — **decided against it**: that category's existing triggers (`celebrate`, `win`, `achievement`, `milestone`, `accomplishment`, `reward`, `finished`) are about the *founder* celebrating their *own* progress (a reflection/growth moment), not about *planning an event for someone else*. Conflating these would risk misrouting genuine self-celebration language into an event-planning flow. This is a real gap (Estate has no "plan a celebration for someone else" category at all), but closing it properly needs its own small design pass — this document flags it rather than reaching for the nearest existing bucket.

---

## 4. Two structural findings — documented, not fixed

Both are outside Chamber's scope (companion orchestration and Estate's shared routing algorithm, not `lib/chamberExpertise/`), both have a blast radius wider than the scenario that surfaced them, and both would need their own review before touching — consistent with how every other structural change in this body of work (the Chamber Activation V2 ranking fixes) was proposed with evidence before being authorized, never patched ad hoc mid-validation.

### 4.1 Create Fast Path can override a correctly-detected overwhelm signal (the most important finding here)

**Evidence:** For *"I'm overwhelmed trying to figure out my workshop,"* three independent things happen, in this order, in `app/companion/CompanionPageClient.tsx`:

1. `isSimpleCreateRequest(userText)` (`lib/universalCreation/createFastPath.ts`) runs **first**, before intent routing or estate routing. It returns `true` — `inferDocumentTypeFromCreateText` matches the bare word `"workshop"` anywhere in the sentence via `ARTIFACT_INFERENCE`, with no check for surrounding emotional framing.
2. If it fires, the turn short-circuits into Universal Creation's discovery flow — Shari would ask something like *"Who is the workshop for?"* — and intent routing, estate routing, and the Chamber hint **never run**.
3. Yet `detectEmotionalState` (`lib/companionEmotions.ts`) correctly returns `"overwhelmed"`, `resolveIntentRouting`'s `goal.tags` correctly include `"overwhelm"`, and — most tellingly — `resolveEstateIntelligenceRoute` independently and correctly resolves this exact sentence to `restore.calm` / Music Room. **Every downstream layer gets this right. The earliest layer never asks them.**

**Why this isn't a quick fix:** `isSimpleCreateRequest` is a broad, general-purpose gate used across every creation request in the app, not something scoped to Chamber or even to this one artifact type. A fix needs to decide, deliberately: should Create Fast Path check emotional/overwhelm signal before firing at all? Should `ARTIFACT_INFERENCE` require the artifact word to be the sentence's actual subject rather than matching anywhere? Either answer has effects far beyond this one sentence, across every "I'm trying to figure out my `<document type>`" phrasing in the app. That is a companion-orchestration decision, not a Chamber one — flagged here with full evidence for its own review.

### 4.2 The array-order tiebreak in `bestCapabilityForRoute` is general, not scenario-specific

Per §2.1: this function scores every candidate capability with **no tiebreak at all** beyond `score > best.score` (strict inequality — first-registered wins every tie). §2.1's fix closes the *specific* symptom (SOP now has a trigger for "process"), but the *mechanism* — any untriggered create-ish phrasing silently defaulting to whichever `create.*` capability happens to be registered first — remains. This is the exact anti-pattern `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md` diagnosed and fixed inside Chamber's own scoring; the same fix (evidence-quality tiebreak instead of array position) would apply here too, but this function is shared across all of Estate routing, not owned by Chamber — flagged, not touched.

---

## 5. New principle worth stating explicitly (see `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §11 for the full write-up)

**Expertise follows purpose, not keywords.** The object named in a request ("newsletter," "process," "workshop") does not by itself determine which expert helps — the same object serves entirely different purposes depending on what the founder is actually trying to accomplish. Every fix in §2 above followed this precisely: Client Relationships joined the newsletter's supporting cast not because "newsletter" is a CR keyword, but because a newsletter's *purpose* often includes client education and relationship nurture; Systems and Client Relationships both joined "develop a process for new clients" because the *outcome* needed both a repeatable system and a client-facing experience, not because either word appears in isolation.

---

## 6. Verification

- All 5 scenarios: full chamber suite (Chamber layer only) now correct or contested-but-defensible — see §1.
- Full chamber test suite: 274/274 passing, no regression (V1 baseline unchanged at 100%).
- Estate test suite (`lib/estateBrain`): 43/43 passing, no regression from the `create.sop` trigger addition.
- `tsc --noEmit` and `eslint`: clean.
- Permanent regression test: `lib/chamberExpertise/__tests__/workRecognitionChamberIntegration.test.ts`, exercising the real `isSimpleCreateRequest` + `resolveIntentRouting` + `resolveEstateIntelligenceRoute` + `resolveChamberExpertActivationV2` chain for all 5 scenarios, including an explicit, non-hidden failing assertion documenting §4.1's Create Fast Path defect (so it can never silently be considered "already fixed" until it actually is).

## 7. Recommendation

Both §4 findings deserve their own review before implementation, the same way `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md` was written and reviewed before `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` was implemented. §4.1 in particular is worth prioritizing: it means a member expressing overwhelm can be routed into a creation task instead of support, which cuts directly against the "recovery before productivity" principle already established elsewhere in this codebase's own rules.

Once §4.1 is resolved, the remaining Chamber expert expansion (per `CHAMBER_ACTIVATION_V2_NEXT_BATCH.md`) will reach real conversations more reliably than it does today — which was the whole point of running this validation before continuing that expansion.
