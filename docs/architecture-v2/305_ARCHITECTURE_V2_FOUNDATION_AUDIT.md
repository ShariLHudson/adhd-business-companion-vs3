# 305 — Architecture v2 Foundation Audit

**Date:** 2026-07-21  
**Governing specs:** 300–304 (`docs/architecture-v2/`)  
**Mode:** Audit only — no new parallel registries, no Chamber Member rewrites, no UWE breakage  
**Verdict:** Foundation specs landed; implementation must proceed as **map-and-bridge**, not replace

---

## 1. Executive summary

Spark Estate already has strong certified pieces that Architecture v2 must **govern and connect**, not replace:

| Layer | Existing authority | v2 role |
|-------|-------------------|---------|
| Work identity / persistence | Universal Work Engine | Remains Work SoT |
| Place / intent routing | Estate Brain + Canonical Estate Registry | Remains navigation SoT |
| Domain expertise people | Chamber Member Registry (24) + Board (12) | Map to Intelligence Members / Round Table |
| Objects × engines map | `lib/intelligence/INTELLIGENCE_REGISTRY.md` | Keep; align naming |
| Business self-knowledge | Business Estate profile (`companion-business-profile-v1`) | Seed of Business DNA / UserBusinessProfile |
| Adaptive day state | `DayState` + Adapt My Day + Support Style + Arrival | Seed of Adaptive Context |
| Growth / skill language | Momentum Institute Growth Profile + competency framework | Seed of User Capability / Confidence Maps |
| Domain blueprints | UWE Event / Marketing / Business Plan packages | Map into Collections + Collection Assets |

**Primary risk:** multiple live catalogs already claim “capability,” “collection,” “blueprint,” or “registry.” Creating v2 registries without ownership bridges would deepen duplication.

**Primary opportunity:** Events Intelligence is the best reference Member for Capability Manifest + Asset Manifest + testing/certification. Client-Relationships is the best reference for thin-line knowledge libraries. Handmade Business Blueprints (201–206) are the best reference for a cross-asset “business collection” without a private runtime.

---

## 2. Existing authoritative owners

### 2.1 Must not be displaced

| Concern | Owner | Path |
|---------|-------|------|
| Canonical Work ID, save, resume, relationships | Universal Work Engine | `lib/universalWorkEngine/` |
| Work Type packages | UWE registry | `lib/universalWorkEngine/registry/universalWorkTypeRegistry.ts` |
| Universal Blueprints | UWE blueprint registry | `lib/universalWorkEngine/blueprints/registry.ts` |
| Estate place identity | Canonical Estate Registry | `lib/estate/canonicalEstateRegistry.ts` + `docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md` |
| Intent → experience routing knowledge | Estate Brain | `lib/estateBrain/` (`capabilityRegistry`, `expertRegistry`, `environmentRegistry`, …) |
| Estate place/experience canon (docs) | Estate authorities | `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md`, `ESTATE_BRAIN.md`, `ESTATE_REGISTRY.md`, `ESTATE_INTELLIGENCE_ARCHITECTURE.md` |
| Chamber roster cards | Chamber registry | `lib/chamber/chamberMemberRegistry.ts` |
| Board / Round Table | Board registry | `lib/board/boardDirectorRegistry.ts` |
| Cross-ecosystem object/engine blueprint | Intelligence Registry (doc) | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |

### 2.2 Valuable but not yet v2-shaped

| Concern | Current home | Notes |
|---------|--------------|-------|
| Create Blueprint catalog | `lib/platformIntent/blueprintRegistry.ts` | Legacy Create IDs; bridged into UWE via `inferWorkTypeAndBlueprint` |
| Estate Collection rooms (journal, vault, …) | `lib/estate/collectionFramework/` | Emotional memory rooms — **different** from v2 Intelligence/Business Collections |
| Business Estate profile | `lib/profile/businessEstateProfile.ts` | Closest to UserBusinessProfile / Business DNA |
| Growth Profile | `lib/momentumInstitute/growthProfileStore.ts` | Closest to UserCapabilityState (partial) |
| Day / adaptive state | `companion-day-state-v1`, `lib/dailyAdaptation/`, `lib/supportStyle/` | Fragmented AdaptiveContextState |

---

## 3. Registry inventory

### 3.1 Present (live code)

| Registry / catalog | Path | Owns today |
|--------------------|------|------------|
| Estate Brain capabilities | `lib/estateBrain/capabilityRegistry.ts` | Intent→experience routing capabilities |
| Estate Brain experts | `lib/estateBrain/expertRegistry.ts` | Invisible expert advisors |
| Estate Brain environments | `lib/estateBrain/environmentRegistry.ts` | Navigable environments |
| Estate Brain knowledge | `lib/estateBrain/knowledgeRegistry.ts` | Experiences/spaces/triggers |
| Companion capability registry | `lib/companionCapabilityRegistry.ts` | Companion routing / interventions |
| Estate Capability Registry (parallel) | `lib/estateCapabilityRegistry/` | Concierge / inventory capabilities |
| Canonical places | `lib/estate/canonicalEstateRegistry.ts` | Place identity |
| Legacy rooms | `lib/estate/estateRoomRegistry.ts` | Deprecated 27-room catalog |
| UWE Work Types | `universalWorkTypeRegistry.ts` | Work Type packages |
| UWE Blueprints | `blueprints/registry.ts` | Certified Blueprint definitions |
| Work Type schemas | `lib/workTypeSchema/registry.ts` | Schema bridge |
| Platform Intent Create Blueprints | `lib/platformIntent/blueprintRegistry.ts` | Legacy Create catalog |
| Chamber Members | `chamberMemberRegistry.ts` | 24 intelligence cards |
| Board Directors | `boardDirectorRegistry.ts` | 12 Round Table seats |
| Estate Collection Framework | `lib/estate/collectionFramework/registry.ts` | Growth/memory rooms |
| Events capability / asset registries | `lib/eventsIntelligence/eventCapabilityRegistry/`, `eventAssetRegistry/` | Domain-only (Events Member reference) |
| Intelligence Registry (doc) | `lib/intelligence/INTELLIGENCE_REGISTRY.md` | Objects × storage × engines |

### 3.2 Missing relative to Architecture v2 (300–304)

| v2 registry / contract | Status |
|------------------------|--------|
| Intelligence Member Registry (canonical Member packages) | **Missing** as v2 object — Chamber cards exist |
| Capability Registry (atomic certified domain capabilities with owners) | **Missing** as platform SoT — Estate Brain + Events + companion catalogs are different meanings |
| Capability Graph | **Missing** |
| Collection Registry (intelligence / business-model / industry / …) | **Missing** — only Estate room collections + informal UWE “collections” |
| Business Identity Registry | **Missing** — Business Estate identity fields exist |
| User Capability Map | **Missing** — Growth Profile / competencies are partial |
| User Confidence Map | **Missing** as separate map |
| Adaptive Context contract | **Missing** as unified type — fragments exist |
| Collection Ownership / Contributor manifests | **Missing** |
| Provenance / IntelligenceContribution pipeline | **Missing** as platform contract |
| Architecture health reporting for v2 | **Missing** |

---

## 4. Chamber Member file-family inventory

### 4.1 Roster

24 Chamber IDs in `chamberMemberRegistry.ts`:  
`ai-technology`, `client-relationships`, `content`, `creative-studio`, `data-analytics`, `events`, `finance`, `horizons`, `innovations`, `knowledge-management`, `leadership`, `learning`, `marketing`, `momentum`, `networking`, `partnerships`, `people-culture`, `presentations`, `project-management`, `research`, `sales`, `strategy`, `systems`, `wellness`.

Board (12 directors) remains **separate** — do not merge with Chamber.

### 4.2 Required v2 families (302) vs reality

| v2 family | Uniform across 24? | Closest existing |
|-----------|--------------------|------------------|
| Charter | No | Identity packs (MKT-001, EVENT-001, CR 000) |
| Knowledge | Partial | `docs/chamber-knowledge/client-relationships/`; `docs/visual-spark-studios/*-Intelligence/` |
| Capability Manifest | Almost none | **Events only:** `lib/eventsIntelligence/eventCapabilityRegistry/` |
| Routing | Partial | Platform invite/aliases; Events/Marketing routing docs |
| Retrieval | Partial | CR `012`; Events `knowledgeManifest.ts` |
| Conversation | Shared platform | `lib/chamber/chamberMemberPrompt.ts` + some Member bundles |
| Implementation | Partial | Events `lib/eventsIntelligence/` strongest |
| Collection Ownership Manifest | No | Ownership / scope docs only |
| Blueprint / Asset Manifest | Partial | Events `eventAssetRegistry/`; UWE Create blueprints are Work-owned |
| Testing | Partial | Events certification bundles; chamber unit tests |
| Certification | Partial / different meaning | Package cert docs vs runtime `chamberCertifiedState` (delivery) |
| Maintenance | Partial | CR maintenance register; 075 gate |

**Reference Members for mapping (do not discard):**

1. **Events** — deepest docs + capability/asset runtime + testing/cert  
2. **Client Relationships** — approved thin-line knowledge library (`docs/chamber-knowledge/client-relationships/`)  
3. **Marketing** — strong MEM-style docs; weak capability/implementation runtime

**Rule confirmed:** Do **not** rewrite all Member files now. Map existing Identity / Knowledge / Routing / Events registries into the 12-family model over subsequent bundles.

---

## 5. Collection and Blueprint inventory

### 5.1 Distinct “Collection” meanings (collision risk)

| Meaning | Location | v2 alignment |
|---------|----------|--------------|
| Estate Collection rooms (Journal, Vault, Greenhouse, …) | `lib/estate/collectionFramework/` | Keep as **place/experience** collections — rename carefully in docs to avoid clashing with Intelligence Collections |
| Thought collections | Intelligence Registry / My Thoughts | Personal thought grouping — not v2 CollectionDefinition |
| Handmade Business Collection (203–206) | UWE `handmadeBusinessCollectionDefinitions.ts` | Informal **Business Collection** candidate — assets are UWE Blueprints |
| Momentum Institute strategy collections | Institute types | Learning collections — separate |

### 5.2 Certified / registered Work Blueprints (UWE)

| Work Type | Blueprints (examples) |
|-----------|----------------------|
| `event_plan` | Workshop, webinar, retreat, conference, summit, launches, challenge, masterclass, fundraiser/gala, networking, luncheon, … (16 Event Spark Blueprints as of recent certs) |
| `marketing_plan` | `marketing_plan.simple` |
| `business_plan` | `business.craft_show`, `business.handmade_online_store`, `business.etsy`, `business.product_photography`, `business.inventory_pricing`, `business.holiday_planner` |

All reuse UWE — no private runtimes. These are the strongest **CollectionAsset → Blueprint** candidates.

### 5.3 Legacy Create Blueprints

`lib/platformIntent/blueprintRegistry.ts` still catalogs `bp-*` Create intents. Bridge exists; do not create a third blueprint registry. Migration = finish alias mapping + retire unused Create-only paths over time.

---

## 6. Business-profile and adaptive-context data

### 6.1 Business profile → future Business DNA / UserBusinessProfile

| Store / type | Path |
|--------------|------|
| Legacy `BusinessProfile` + Business Estate envelope | `companion-business-profile-v1` via `lib/companionStore.ts`, `lib/profile/businessEstateProfile.ts` |
| Identity Office sections | `lib/profile/businessEstateRedesign/` |
| Prompt snapshot | `lib/profile/businessSnapshot.ts` |

**Gap:** No `BusinessIdentityDefinition` registry (speaker, coach, crafter, …). Identities are free-text / section fields today.

### 6.2 Capability / confidence → future maps

| Existing | Gap vs v2 |
|----------|-----------|
| `MemberGrowthProfile` + Spark Competency Framework | Institute-scoped; not per-capability owner Member graph |
| Estate Brain `capabilityRegistry` | Platform routing capabilities ≠ user skill state |
| Arrival `ConfidentValue` | Inference confidence, not member skill confidence |

### 6.3 Adaptive context fragments

| Fragment | Path |
|----------|------|
| Energy / overwhelm / vibe | `DayState` (`companion-day-state-v1`) |
| Adapt My Day check-in | `lib/dailyAdaptation/` |
| Support style prefs | `lib/supportStyle/` |
| Overwhelm classification | `lib/conversation/overwhelmNeedClassifier.ts` |
| Arrival orchestration | `lib/arrivalIntelligence/` |
| Stress routing | `lib/stressRouting.ts` |

**Gap:** No single `AdaptiveContextState` contract with capture provenance and confidence.

---

## 7. Duplicate-risk report

| Concept | Overlapping homes | Risk | Recommended owner (v2) |
|---------|-------------------|------|------------------------|
| “Capability” | Estate Brain · Companion Capability · Estate Capability Registry · Events capability registry · future v2 Capability Registry | **High** — same word, different meanings | Split naming: **RoutingCapability** (Brain) vs **DomainCapability** (Member-owned, v2) vs **EventCapability** (domain package until promoted) |
| “Blueprint” | UWE Blueprints · Create `bp-*` registry · Member asset lists | Medium | UWE remains Work Blueprint SoT; Create catalog becomes alias/entry index only |
| “Collection” | Estate Collection rooms · Thought collections · Handmade “collection” docs · v2 Collections | **High** | Namespace: Estate Room Collections vs Intelligence/Business Collections |
| “Expert / Member” | Estate Brain experts · Chamber Members · Board Directors | Medium | Chamber = Intelligence Members; Board = Round Table; Brain experts = invisible routing advisors (document boundary) |
| Place registries | Canonical · Legacy rooms · estateIntelligence · homestead · ESTATE_REGISTRY.md | Medium (legacy already deprecated) | Continue Phase B: Canonical + Brain only |
| Work Type dual surface | UWE package registry · workTypeSchema registry | Low (bridged) | Keep bridge; no third registry |

**Do not create parallel registries.** Any new v2 registry must either:

1. Become the sole SoT with adapters from existing catalogs, or  
2. Be a thin typed façade over an existing SoT until cutover.

---

## 8. Migration risks and compatibility risks

### 8.1 Migration risks

1. Renaming “capability” without adapters breaks Estate intent-first navigation.  
2. Treating Estate Collection rooms as v2 Collections breaks Journal/Vault emotional model.  
3. Rewriting Chamber knowledge packages (especially Events + Client Relationships) loses certified work.  
4. Introducing a second Work persistence path violates UWE invariants and undoes Event/Marketing/Business Blueprint certification.  
5. Collapsing Board into Chamber breaks Round Table product boundary.

### 8.2 Compatibility risks

| Certified surface | Compatibility rule |
|-------------------|--------------------|
| Universal Work Engine | No competing Work ID / save / resume |
| Event Work Type + Event Blueprints | Keep `event_plan` + definitions; Collections may *reference* them as assets |
| Marketing Plan Work Type | Keep `marketing_plan` |
| Business Plan Work Type + 201–206 | Keep `business_plan`; candidate first Business Collection |
| Blueprint Framework / Anywhere-Origin certs | Must remain green after any registry façade |
| Chamber conversation / invite | Card IDs and prompt hooks stay stable while packages map underneath |

### 8.3 Cognitive / member experience risks

Architecture v2 must stay invisible. Members should not learn registries, owners, or graphs. Progressive disclosure and Shari orchestration remain non-negotiable (300).

---

## 9. Mapping sketch (existing → v2 objects)

| v2 object (301) | Map from |
|-----------------|----------|
| IntelligenceMember | Chamber Member ID + Identity/Knowledge packs + (later) Capability Manifest |
| CapabilityDefinition | Start from Events capability catalog; invent platform IDs carefully; do not clone Brain routing IDs |
| CollectionDefinition | First candidates: Handmade Business Collection; Marketing Plan package; Event Blueprint family as work-type collection |
| CollectionAsset | UWE BlueprintDefinition rows (+ later frameworks/playbooks) |
| BusinessIdentityDefinition | Derive from Business Estate + curated identity list (crafter, coach, …) |
| UserBusinessProfile | Business Estate envelope + confirmed/inferred fact split |
| UserCapabilityState | Extend Growth Profile / competency toward per-capability rows |
| AdaptiveContextState | Unify DayState + Adapt My Day + Support Style (+ arrival signals) |
| CapabilityRequest / IntelligenceContribution | New orchestration contract — **after** Capability Registry façade exists; wire to Chamber/Board contribution with approval |

---

## 10. Blockers

| ID | Blocker | Severity | Resolution |
|----|---------|----------|------------|
| B1 | Ambiguous “capability” word across Estate Brain and domain expertise | High | Naming standard + dual-track docs before code |
| B2 | No Collection Registry; informal collections only | High | Design Collection Registry as façade; seed with Handmade + Marketing + Events |
| B3 | No uniform Member Capability Manifests (23/24 missing) | High | Template + Events reference migration; do not mass-rewrite |
| B4 | Adaptive context fragmented across stores | Medium | Contract first; adapters second; no data loss |
| B5 | Business Identity Registry absent | Medium | Curate identities from Business Estate + Create audiences |
| B6 | Dirty WIP tree elsewhere in companion-app | Process | Architecture-v2 commits must stay narrowly staged |

**Non-blockers (explicitly preserved):** UWE, Event/Marketing/Business Blueprints, Chamber roster, Board roster, Estate Brain routing, Client-Relationships approved library.

---

## 11. Recommended implementation sequence

### Bundle A — Contracts without parallel SoTs (next)

1. Land typed contracts for 301 objects under something like `lib/architectureV2/types/` (types + validators only).  
2. Publish naming standard: RoutingCapability vs DomainCapability vs Collection kinds.  
3. Architecture health checklist (doc + light tests): “no new private Work runtime,” “no third blueprint registry.”

### Bundle B — Capability Registry façade

1. Define Domain Capability Registry API that **Events can register into** without deleting `eventCapabilityRegistry`.  
2. Map 5–10 seed Domain Capabilities (marketing / finance / events / learning / execution examples from 303).  
3. Graph stubs: owner Member, dependencies, conflicts — no full orchestration yet.

### Bundle C — Collection Registry seed

1. Register first Collections as definitions pointing at existing UWE assets:  
   - Handmade Business Collection (201–206)  
   - Marketing Plan Collection  
   - Event Planning Collection (Event Blueprints)  
2. Owner Member + contributor Member IDs required.  
3. No new Blueprint runtime.

### Bundle D — Member package mapping (reference first)

1. Produce Capability Manifest + Collection Ownership Manifest for **Events** and **Marketing** by mapping existing files (no content rewrite).  
2. Template the 12-family index for remaining Members.  
3. Client-Relationships remains knowledge SoT until Capability Manifest is derived carefully.

### Bundle E — Business DNA + Adaptive Context contracts

1. `UserBusinessProfile` adapter over Business Estate.  
2. `AdaptiveContextState` adapter over DayState + Adapt My Day + Support Style.  
3. User Capability / Confidence maps — start read-only from Growth Profile evidence.

### Bundle F — Orchestration

1. CapabilityRequest → contribution depth → approval → UWE Work apply.  
2. Provenance on contributions.  
3. Certification harness for Collections and Domain Capabilities.

**Do not start Bundle F before B–C.**

---

## 12. Recommended next implementation bundle

**Next upload / build target:**  
**Architecture v2 Bundle A+B (contracts + Domain Capability Registry façade + naming standard)**  
with a seed Collection definition document for Handmade Business Collection ownership (Marketing + Events + Finance as contributors; Systems optional).

**Explicitly out of scope for next bundle:**

- Rewriting all Chamber Member knowledge packs  
- New Work Types  
- Parallel Blueprint registries  
- Replacing Estate Brain routing  
- Merging Board into Chamber  

---

## 13. Audit deliverables checklist (README)

| Required section | Status |
|------------------|--------|
| Architecture ownership audit | §2 |
| Registry inventory | §3 |
| Current Chamber Member file-family inventory | §4 |
| Existing collection/blueprint inventory | §5 |
| Duplicate-risk report | §7 |
| Migration plan | §9–11 |
| Blockers | §10 |
| Recommended implementation sequence | §11–12 |
| Current business-profile data | §6.1 |
| Current adaptive context data | §6.3 |
| Missing registries | §3.2 |
| Compatibility risks | §8.2 |

---

## 14. Foundation files landed

| Spec | Path |
|------|------|
| 300 | `docs/architecture-v2/300_SPARK_ESTATE_INTELLIGENCE_ARCHITECTURE_V2.md` |
| 301 | `docs/architecture-v2/301_UNIVERSAL_INTELLIGENCE_OBJECT_MODEL.md` |
| 302 | `docs/architecture-v2/302_CHAMBER_MEMBER_CANONICAL_ARCHITECTURE.md` |
| 303 | `docs/architecture-v2/303_CAPABILITY_REGISTRY_AND_GRAPH_ARCHITECTURE.md` |
| 304 | `docs/architecture-v2/304_COLLECTION_OWNERSHIP_AND_CONTRIBUTOR_ARCHITECTURE.md` |
| Upload order | `docs/architecture-v2/README_UPLOAD_ORDER.md` |
| This audit | `docs/architecture-v2/305_ARCHITECTURE_V2_FOUNDATION_AUDIT.md` |

---

## 15. Completion statement

Architecture v2 foundation specs are in-repo. The platform is **not** ready to declare Collections/Capabilities production-certified under 300–304, because Domain Capability Registry, Collection Registry, and uniform Member manifests do not yet exist.

Existing UWE, Event/Marketing/Business Blueprints, Chamber, Board, and Estate Brain remain authoritative for their current domains. Next work must map and façade — not fork.
