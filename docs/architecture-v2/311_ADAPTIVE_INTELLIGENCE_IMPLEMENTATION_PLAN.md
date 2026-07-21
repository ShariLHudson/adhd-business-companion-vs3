# 311 — Adaptive Intelligence Implementation Plan

**Date:** 2026-07-21  
**Governing specs:** 306–310 (`docs/architecture-v2/`)  
**Prerequisite audit:** [305 Architecture v2 Foundation Audit](./305_ARCHITECTURE_V2_FOUNDATION_AUDIT.md)  
**Governance series:** [315 Platform Governance Constitution](./315_SPARK_ESTATE_PLATFORM_GOVERNANCE_CONSTITUTION.md) · [316 Governance Audit](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md)  
**Mode:** Plan only — do **not** implement all five adaptive systems in one change  
**Verdict:** Extend existing Profile, Business Estate, DayState, Estate Brain, UWE, and recommendation services — never fork a second user-profile or shadow Work runtime

### Reconciliation note (311–315 governance bundle)

The Platform Governance Runtime zip also contained a shorter `311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN.md`.  
**This repository-grounded plan remains authoritative.** The shorter bundle draft is archived at  
`bundle-sources/311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN_GOVERNANCE_BUNDLE.md`.

| Topic | Repo 311 (this file) | Bundle 311 | Resolution |
|-------|----------------------|------------|------------|
| First code slice | Adaptive Context façade (308) | Registry foundation first | **Keep Adaptive Context first**; registries follow 312 + 316 |
| Pilot Collection | Handmade / Marketing / Events seeds | Workshop Collection | **Adopt Workshop as Collection pilot** after Domain Capability façade (aligns with Events strength) |
| Phases | Slices 1–5 mapped to 305 | Phases 0–9 including registry-first | Merge: Phase 0 = done via 305/311/316; registry = after Adaptive Context types |
| Completion verdicts | Implementation guidance | IMPLEMENTATION PLAN APPROVED / … | Use in 316/317 reviews |

---

## 1. Executive summary

Files **306–310** define how Spark Estate adapts: Business DNA, capability/confidence graphs, cognitive-load context, next-best-action, and capability routing/orchestration.

The platform already has **fragments** of each. The risk is building parallel engines. The opportunity is a thin **adaptive contract layer** that reads existing stores and feeds routing/recommendations without members learning internal structure.

| Spec | Theme | Existing seed | Gap |
|------|-------|---------------|-----|
| **306** | Business DNA & identity | Business Estate profile | No identity registry; no confirmed/inferred split; no multi-business switch |
| **307** | Capability / experience / confidence | Growth Profile + competency framework | Global-ish growth language; not per DomainCapability; confidence not separate |
| **308** | Adaptive context & cognitive load | DayState, Adapt My Day, Support Style, Arrival, overwhelm classifier | Fragmented; no Decision Fatigue Budget; energy≠motivation not enforced everywhere |
| **309** | Next best action | `intelligentRecommendation`, daily opening, UWE resume, Create next-best-step | Multiple recommenders; no shared scoring contract or decline memory |
| **310** | Capability routing & orchestration | Estate Brain intent-first, UWE launch, Chamber invite, Create locks | Routes to places/Members more than DomainCapabilities; no contribution approval graph |

**Smallest safe first implementation slice (recommended):**  
**Adaptive Context read façade (308)** — unify DayState + Adapt My Day + Support Style into one typed `AdaptiveContextState` adapter with choice-limit helpers. No new persistence. No routing rewrite. Unlocks safer recommendation behavior later.

---

## 2. Current-state inventory

### 2.1 Business profile / Business DNA (306)

| Asset | Path | Notes |
|-------|------|-------|
| Legacy + Estate envelope | `companion-business-profile-v1` · `lib/companionStore.ts` · `lib/profile/businessEstateProfile.ts` | Identity, offers, brand, direction, work-style, tools |
| Redesign sections | `lib/profile/businessEstateRedesign/` | Identity Office / basics |
| Prompt snapshot | `lib/profile/businessSnapshot.ts` | Approved fields for prompts |
| UI | `components/companion/business-estate/` | Member-facing Business Estate |

**Missing vs 306:** multi-business IDs, Business Identity Registry, revenue-model set, stage-by-function, confirmed vs inferred facts, anti-assumption enforcement, Collection assembly from DNA.

### 2.2 User preferences

| Asset | Path |
|-------|------|
| Companion prefs | `lib/companionStore.ts` prefs |
| Support style | `lib/supportStyle/` |
| Create preferences standards | `docs/create-experience/standards/088_preferences/` |
| Workspace environment prefs (091) | `lib/workspaceEnvironment/` |
| Estate audio / ambience | `lib/estate/estateAudioSettings.ts` |

### 2.3 Daily context / energy / motivation (308)

| Asset | Path | Notes |
|-------|------|-------|
| DayState | `companion-day-state-v1` | energy, overwhelm, vibe, motivation, needs |
| Adapt My Day | `lib/dailyAdaptation/` · `AdaptMyDayCheckIn.tsx` | Temporary day check-in |
| Overwhelm classifier | `lib/conversation/overwhelmNeedClassifier.ts` | cognitive / task / calming |
| Stress routing | `lib/stressRouting.ts` | breathe / CMM / adjust day |
| Arrival Intelligence | `lib/arrivalIntelligence/` | Home greeting / continue |
| Cognitive load factors | `lib/cognitive-load/loadFactors.ts` | Uses day.overwhelm |
| Daily opening | `lib/dailyOpening/` | Today’s Welcome Card choices |
| Plan My Day energy | `lib/planMyDay/` | Uses energy/motivation in planning |

**Risk:** energy and motivation can blur in UI copy; 308 requires they remain separate.

### 2.4 Chamber routing

| Asset | Path |
|-------|------|
| Member registry | `lib/chamber/chamberMemberRegistry.ts` (24) |
| Invite / activation | `lib/chamber/chamberMemberActivation.ts` |
| Prompt policy | `lib/chamber/chamberMemberPrompt.ts` |
| Events domain capabilities | `lib/eventsIntelligence/eventCapabilityRegistry/` |

### 2.5 Blueprint / Work resolution

| Asset | Path |
|-------|------|
| UWE launch + NL | `lib/universalWorkEngine/launch/` |
| Work Types | `event_plan`, `marketing_plan`, `business_plan` |
| Anywhere-Origin locks | UWE launch certification |
| Create fast-path | `lib/universalCreation/createFastPath.ts` |
| Platform intent Create BPs | `lib/platformIntent/blueprintRegistry.ts` |

### 2.6 Recommendation behavior

| Asset | Path |
|-------|------|
| Workspace recommendations | `lib/intelligentRecommendation/` |
| Create next-best-step | `lib/universalCreationEngine/nextBestStepEngine` |
| Daily meaningful start | `lib/dailyOpening/recommendMeaningfulStart` |
| Board / director recommend | `lib/board/recommendBoardDirectors` |
| Project Home recommend | `lib/projectHomes/recommendProjectHome` |
| Calm / Rule of Three | `lib/calmIntelligence/` |

### 2.7 Duplicate-prevention / routing locks (310)

| Lock / behavior | Where it lives today |
|-----------------|----------------------|
| Explicit Create / document fast-path exit | `createFastPath.ts`, marketing/business plan detectors |
| UWE forceNew / resume existing Work | `launchFromCreate`, work identity store |
| Talk / conversation-first | Spec 105–108 · Estate Brain coaching |
| No auto-launch after mention | Estate coaching / discovery mode |
| Chamber dismiss on leave | Estate usability / Chamber isolation rules |
| Quiet hours / audio | Estate audio settings |
| Welcome once-only | First-Time Welcome (126) — separate from adaptive routing |

---

## 3. Authoritative owners (do not displace)

| Concern | Owner | Adaptive layer may… |
|---------|-------|---------------------|
| Work ID / save / resume | Universal Work Engine | Read Work state; never fork persistence |
| Place / intent → environment | Estate Brain + Canonical places | Suggest place; not invent places |
| Domain Work Blueprints | UWE blueprint registry | Recommend Blueprint IDs already registered |
| Business Estate storage key | Existing profile store | Adapter + gradual field extension |
| DayState key | Existing day store | Adapter + choice helpers |
| Chamber card IDs | Chamber registry | Route to Members after DomainCapability resolution |
| Board | Board registry | Contributor / review path only |

---

## 4. Reusable existing services

1. `businessEstateProfile` / redesign sections → Business DNA adapter  
2. `DayState` + `dailyAdaptation` + `supportStyle` → Adaptive Context façade  
3. `overwhelmNeedClassifier` + `stressRouting` → cognitive-load modes  
4. `growthProfileStore` + `sparkCompetencyFramework` → initial UserCapabilityState evidence  
5. `intelligentRecommendation` + daily opening → Next Best Action candidate generators  
6. UWE `inferWorkTypeAndBlueprint` + launch → Work resolution stage of 310  
7. Estate Brain `routeIntentFirstNavigation` / coaching → place routing stage (not DomainCapability SoT)  
8. Events `eventCapabilityRegistry` → reference DomainCapability shape  
9. Handmade Business Blueprints 201–206 → first Collection recommendation examples for crafter DNA  
10. CalmIntelligence Rule of Three → choice architecture defaults (308)

---

## 5. Schema changes (proposed — phased)

### Phase 1 (façade only — no migration)

Typed contracts under `lib/architectureV2/adaptive/` (or `lib/adaptiveIntelligence/contracts/`):

- `AdaptiveContextState` (308) — maps from DayState + Adapt My Day + Support Style  
- `BusinessDnaSnapshot` (306) — read-only view of Business Estate + optional inferred tags  
- `UserCapabilityState` (307) — optional rows keyed by future DomainCapabilityId  
- `NextBestActionCandidate` / `RecommendationFeedback` (309)  
- `CapabilityRoutePlan` (310) — intent → work → collection → capabilities → members → adaptation  

**No new localStorage keys** in Phase 1.

### Phase 2 (additive fields)

| Store | Additive fields |
|-------|-----------------|
| Business Estate | `confirmedFacts[]`, `inferredFacts[]`, `primaryIdentityId`, `secondaryIdentityIds[]`, `revenueModelIds[]`, `businessStageByFunction` |
| Companion prefs or Growth Profile | Per-capability knowledge/experience/confidence/independence (opt-in) |
| Recommendation feedback | Small store: declined/snoozed recommendation IDs + timestamps |

### Phase 3 (registries — after 305 Bundles B–C)

- Business Identity Registry (definitions only)  
- Domain Capability Registry façade (from 305)  
- Collection Registry seed (Handmade / Marketing / Events)

---

## 6. Registry changes

| Change | When | Rule |
|--------|------|------|
| Business Identity Registry | After Adaptive Context façade | Definitions + aliases; no auto-assumptions |
| Domain Capability Registry | Per 305 Bundle B | Distinct from Estate Brain RoutingCapability |
| Collection Registry | Per 305 Bundle C | Own/contribute Members; assets = UWE Blueprints |
| Do **not** add | Anytime | Second business profile store, second Work identity, third Blueprint registry |

Naming (from 305, binding here too):

- **RoutingCapability** — Estate Brain intent routing  
- **DomainCapability** — Member-owned certified expertise (307/310)  
- **Estate Room Collection** vs **Intelligence/Business Collection**

---

## 7. Migration sequence

1. Land 306–310 docs + this plan (**done in this landing**).  
2. **Slice 1:** Adaptive Context read façade + unit tests (energy ≠ motivation; choice limits).  
3. **Slice 2:** Business DNA read snapshot + anti-assumption helpers (no forced intake).  
4. **Slice 3:** UserCapabilityState seed from Growth Profile (no global beginner label).  
5. Complete 305 Domain Capability + Collection façades.  
6. **Slice 4:** Next Best Action scoring interface wrapping existing recommenders + decline memory.  
7. **Slice 5:** Capability routing orchestration (310) using DomainCapabilities + UWE Work resolution + approval.  
8. Only then: write-path migrations for confirmed/inferred Business DNA fields.

---

## 8. Compatibility plan

| Surface | Rule |
|---------|------|
| UWE Event / Marketing / Business Blueprints | Remain certified; adaptive layer only recommends / resumes |
| Estate Brain navigation | Remains place/intent SoT; 310 adds capability stage **after** Work resolution |
| Chamber / Board | IDs stable; orchestration adds contributors without merging registries |
| First-Time Welcome (126) | Unrelated; never re-triggered by adaptive engines |
| Workspace Environment (091) | Environment prefs stay separate from adaptive recommendation engine |
| Daily Opening | May consume Adaptive Context choice limits; not replaced |

Regression suites to keep green after each slice:

- `lib/universalWorkEngine` foundation / Anywhere-Origin  
- `lib/firstLoginWelcome`  
- `lib/arrivalIntelligence` / daily opening where touched  
- Estate Brain routing unit tests if adapters call them  

---

## 9. Privacy rules

1. Accessibility / health context only when member shares or safe adaptation requires it (308).  
2. Inferred Business DNA and capability growth must be reviewable and correctable.  
3. Material inferences shown before consequential recommendations (306).  
4. Adaptive profiling must not expose sensitive internal scores in member UI.  
5. Multi-business: no cross-business assumption bleed; keep confidential data separate.  
6. Temporary context inferences **decay quickly** — not durable identity.  
7. Observability logs for routing must avoid storing clinical judgments or shame metrics.  
8. Decision Fatigue Budget is interface adaptation only — never presented as diagnosis.

---

## 10. Testing plan

### Contract / unit

- Adaptive Context: energy ≠ motivation; choice limits by load; temporary inference decay  
- Business DNA: multi-identity helpers; anti-assumptions; confirmed vs inferred  
- Capability state: no global label API; dimension independence; user correction updates support mode  
- NBA: prefer existing Work; suppress declined; explainability fields present  
- Routing: resume Work; one Work ID; locks respected; failure preserves message  

### Integration

- Adapt My Day → Adaptive Context → recommendation choice count  
- Business Estate identity → Collection candidate list (Handmade for crafter)  
- UWE launch + adaptive depth (quick_start vs guided)  

### Certification checklists

Encode as constants (pattern from 126 / 091):

- `ADAPTIVE_CONTEXT_CERTIFICATION_CHECKLIST` (308 required tests)  
- Later: DNA / capability / NBA / routing checklists from each spec’s Required tests section  

---

## 11. Browser verification plan

| Scenario | Expect |
|----------|--------|
| New day, Adapt My Day low energy | At most 1–2 primary choices on Welcome Card / next action |
| Crafter Business Estate + “plan holiday products” | Prefer existing `business_plan` / holiday Blueprint; no blank Create fork |
| Returning to incomplete Marketing Plan | Resume Work; do not spawn duplicate |
| Chamber leave → Create | No Chamber stream leak; adaptive state still available |
| Decline a recommendation | Not immediately re-shown |
| Strong capacity day | Deeper options available via progressive disclosure, not dump |
| Skip / quiet hours | No forced audio or heavy tours |

Manual preview checklist file (future): `docs/architecture-v2/evidence/311_ADAPTIVE_BROWSER_CHECKLIST.md` — create when Slice 1 ships UI consumers.

---

## 12. Blockers

| ID | Blocker | Severity | Unblock |
|----|---------|----------|---------|
| A1 | Domain Capability Registry not built (305 B) | High for 307/310 | Complete naming + façade before orchestration |
| A2 | Collection Registry not built (305 C) | High for DNA→Collection assembly | Seed Handmade / Marketing / Events |
| A3 | Multiple recommenders without shared feedback store | Medium for 309 | NBA interface + decline memory |
| A4 | Business Estate single-business mental model | Medium for 306 multi-business | Design multi-business IDs before write migration |
| A5 | Dirty WIP tree | Process | Narrow commits for adaptive work only |

**Non-blockers:** DayState, Business Estate, UWE, Estate Brain, Chamber — all reusable.

---

## 13. Phased implementation recommendation

### This landing (no engines)

- Specs **306–310** in `docs/architecture-v2/`  
- This plan **311**  
- Cross-link from 305  

### Slice 1 — Adaptive Context façade (smallest safe code)

**Build:**

- `lib/adaptiveIntelligence/adaptiveContext/` (or `lib/architectureV2/adaptiveContext/`)  
  - types from 308  
  - `readAdaptiveContext()` from DayState + Adapt My Day + Support Style  
  - `maxVisibleChoices(context)`  
  - unit tests for energy/motivation separation and choice limits  

**Do not build yet:** new UI, new stores, orchestration, DNA writes.

**Success:** other packages can import choice limits without knowing DayState shape.

### Slice 2 — Business DNA read snapshot

- Map Business Estate → `BusinessDnaSnapshot`  
- Curated identity ID list (speaker, crafter, coach, …) as constants — not full registry UI  
- Anti-assumption helper  

### Slice 3 — Capability state seed

- Read-only projection from Growth Profile  
- Explicit ban on global beginner/intermediate/advanced API  

### Slice 4 — Next Best Action interface

- Wrap `intelligentRecommendation` + UWE resume  
- Decline/snooze memory  
- Explainability fields  

### Slice 5 — Routing orchestration (310)

- Only after Domain Capability + Collection façades exist  
- Stages 1–8 from 310 as a planner object; Shari/Estate Brain remain member-facing  

---

## 14. Mapping: 306–310 → existing code (quick reference)

| Spec requirement | Prefer existing | Avoid |
|------------------|-----------------|-------|
| Business DNA | Business Estate envelope | New `business-dna-v1` parallel profile |
| Identities | Curated constants → later Identity Registry | Hard-coding Chamber as identity |
| Capability graph | Growth Profile + future DomainCapability | Estate Brain RoutingCapability IDs as skill state |
| Adaptive context | DayState + Adapt My Day + Support Style | Clinical scoring UI |
| Next best action | intelligentRecommendation + UWE resume | Always “create new” |
| Routing | Estate Brain + UWE launch + Chamber | Shadow workspaces / menu dumps |
| Collections for crafter | UWE business blueprints 201–206 | Duplicate blueprint definitions |

---

## 15. Relationship to Architecture v2 foundation (300–305)

| 305 bundle | Adaptive dependency |
|------------|---------------------|
| A Contracts / naming | Required before DomainCapability-linked 307/310 |
| B Domain Capability façade | Required before full 307 graph and 310 Member resolution |
| C Collection Registry seed | Required before DNA Collection assembly (306) |
| E Business DNA + Adaptive Context | **Aligned** — Slice 1–2 here are the start of 305 Bundle E |
| F Orchestration | Same as Slice 5 here |

Do not start 305 Bundle F or Adaptive Slice 5 until B–C exist.

---

## 16. Completion statement

Adaptive Intelligence specs **306–310** are in-repo. Implementation must proceed as **adapters over existing systems**, with **Adaptive Context façade** as the first code slice.

No second profile system. No blind routing replace. No unreviewed five-engine mega-PR.
