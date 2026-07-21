# 317 — Architecture v2 Master Index

**Date:** 2026-07-21  
**Purpose:** Catalog constitutional, architecture, registry, certification, and implementation documents for Spark Estate Architecture v2  
**Governance:** [315 Platform Governance Constitution](./315_SPARK_ESTATE_PLATFORM_GOVERNANCE_CONSTITUTION.md)

---

## 1. Constitutional documents

### 1.1 Architecture v2 / Platform governance

| # | Document | Role |
|---|----------|------|
| **315** | [Platform Governance Constitution](./315_SPARK_ESTATE_PLATFORM_GOVERNANCE_CONSTITUTION.md) | Governs Architecture v2 intelligence, Work, Members, Collections, capabilities, Blueprints, adaptive behavior |
| **126** | [First-Time Welcome Experience Standard](../product-specifications/126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD.md) | One-time Welcome — constitutional product rule |
| **091** | [Workspace Environment Personalization](../create-experience/standards/091_WORKSPACE_ENVIRONMENT_PERSONALIZATION_STANDARD.md) | Work surfaces always in a place |

### 1.2 Product Constitution series (companion / experience)

| # | Document | Role |
|---|----------|------|
| **113** | [Spark Estate Product Constitution](../constitution/113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md) | Master product principles |
| **114** | [Shari Companion Constitution](../constitution/114_SHARI_COMPANION_CONSTITUTION.md) | Shari behavior |
| **115** | [Universal Conversation Architecture](../constitution/115_UNIVERSAL_CONVERSATION_ARCHITECTURE.md) | Conversation lifecycle |
| **116** | [Estate Navigation Constitution](../constitution/116_ESTATE_NAVIGATION_CONSTITUTION.md) | Intent-first navigation |
| **117** | [Trust, Memory & Relationship](../constitution/117_TRUST_MEMORY_AND_RELATIONSHIP_CONSTITUTION.md) | Trust / memory |

**Conflict rule:** On Work identity and source-of-truth, **315 + UWE (112)** prevail for platform runtime. On companion voice and hospitality, **113–117** prevail. See [316 §9](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md).

### 1.3 Estate place canon (places, not intelligence OS)

| Document | Role |
|----------|------|
| `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md` | Binding place canon manifest |
| Constitution / Living / Bible | Place experience authorities |
| `ESTATE_BRAIN.md` · `ESTATE_REGISTRY.md` · `ESTATE_INTELLIGENCE_ARCHITECTURE.md` | Brain / places / intent |

---

## 2. Architecture documents (Architecture v2 series)

| # | Document | Role |
|---|----------|------|
| **300** | Intelligence Architecture v2 | Governing platform layers |
| **301** | Universal Intelligence Object Model | Canonical objects |
| **302** | Chamber Member Canonical Architecture | Member file families |
| **303** | Capability Registry & Graph | Domain capabilities |
| **304** | Collection Ownership & Contributors | Collections |
| **305** | Foundation Audit | Map existing → v2 |
| **306** | Business DNA & Identity | Who the business is |
| **307** | Capability / Experience / Confidence Graph | User adaptation dimensions |
| **308** | Adaptive Context & Cognitive Load | Capacity adaptation |
| **309** | Next Best Action Engine | Recommendations |
| **310** | Universal Capability Routing | Orchestration |
| **311** | Adaptive Implementation Plan | **Authoritative** phased plan |
| **312** | Universal Registry Architecture | Registry kernel |
| **313** | Lifecycle, Versioning, Maintenance | Change safety |
| **314** | Testing & Certification Framework | Cert levels |
| **315** | Platform Governance Constitution | Series constitution |
| **316** | Governance & Registry Audit | Registry audit + slices |
| **317** | This Master Index | Catalog |
| **318** | Universal Knowledge, Retrieval & Provenance | Retrieval priority + contribution provenance |
| **319** | Shari Conversation Orchestration & Response | Orchestration locks / response architecture |
| **320** | Privacy, Trust, Consent & User Control | Data classes, consent, temporary vs durable |
| **321** | Intelligence Observability & Architecture Health | Health checks / quality signals |
| **322** | Platform Master Index & Documentation Graph | Machine-readable doc graph (extends 317) |
| **323** | Knowledge & Provenance Audit | Map retrieval / provenance / Shari locks |
| **324** | Privacy & Adaptation Audit | Profile fields · consent gaps · temp context |
| **325** | Observability Implementation Plan | Visibility-first slices (O1 health report) |
| **326** | Architecture Gap Analysis | Specs vs repo before runtime composition |
| **327** | Capability Execution & Contribution Runtime | Executable capability contract |
| **328** | Collection Composition & Orchestration Runtime | Collection as orchestrated experience |
| **329** | Universal Output Synthesis & Artifact Architecture | Canonical Output contract |
| **330** | Work / Collection / Blueprint / Project Bridge | Create SoT · Projects execute |
| **331** | Runtime Resilience, Recovery & Safe Degradation | Failure must not cost thinking |
| **332** | Runtime Composition Implementation Plan | **R1** vertical proof slice |
| **333** | Work / Project Bridge Audit | Handoff declared ≠ implemented |
| **334** | Resilience & Recovery Audit | Composition failure gaps |

**Bundle READMEs:** `README_UPLOAD_ORDER.md` (300) · `306_310_ADAPTIVE_INTELLIGENCE_README.md` · `311_315_PLATFORM_GOVERNANCE_README.md` · `318_322_KNOWLEDGE_TRUST_OBSERVABILITY_README.md` · `327_331_RUNTIME_COMPOSITION_README.md`  
**Archived alternate 311:** `bundle-sources/311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN_GOVERNANCE_BUNDLE.md`

---

## 3. Chamber Members

**Runtime roster (24):** `lib/chamber/chamberMemberRegistry.ts`

`ai-technology` · `client-relationships` · `content` · `creative-studio` · `data-analytics` · `events` · `finance` · `horizons` · `innovations` · `knowledge-management` · `leadership` · `learning` · `marketing` · `momentum` · `networking` · `partnerships` · `people-culture` · `presentations` · `project-management` · `research` · `sales` · `strategy` · `systems` · `wellness`

**Board (12 — separate):** `lib/board/boardDirectorRegistry.ts`

**Knowledge depth reference:** Events (deepest) · Client-Relationships (approved thin-line library) · Marketing (docs-strong)

**Canonical ID target (312):** `member.marketing` etc. — via aliases; do not rename runtime IDs until adapters exist.

---

## 4. Capabilities

| Kind | Status | Home |
|------|--------|------|
| RoutingCapability | Live | Estate Brain `capabilityRegistry` |
| Companion / concierge capabilities | Live (parallel) | `companionCapabilityRegistry` · `estateCapabilityRegistry` |
| Event DomainCapabilities | Live (domain) | `lib/eventsIntelligence/eventCapabilityRegistry/` |
| Platform Domain Capability Registry | **Missing** | Planned 303 / 305 B / 316 G4 |
| Example DomainCapability IDs (312) | Planned | `capability.marketing.positioning` |

---

## 5. Collections

| Kind | Status | Examples / home |
|------|--------|-----------------|
| Estate Room Collections | Live | Journal, Evidence Vault, Greenhouse — `collectionFramework` |
| Thought collections | Live | My Thoughts |
| Intelligence / Business Collections | **Missing registry** | Planned: Handmade Business, Marketing Plan, Event Planning, Workshop pilot |
| Informal UWE “collections” | Definition arrays | `handmadeBusinessCollectionDefinitions.ts` (203–206) |

**Target IDs (312):** `collection.business.speaker`, etc.

---

## 6. Blueprints

### 6.1 UWE (authoritative)

| Work Type | Blueprint IDs (representative) |
|-----------|--------------------------------|
| `event_plan` | Workshop, webinar, retreat, conference, summit, launches, challenge, masterclass, fundraiser/gala, networking, luncheon, … |
| `marketing_plan` | `marketing_plan.simple` |
| `business_plan` | `business.craft_show`, `business.handmade_online_store`, `business.etsy`, `business.product_photography`, `business.inventory_pricing`, `business.holiday_planner` |

**Registry:** `lib/universalWorkEngine/blueprints/registry.ts`  
**Target ID style (312):** `blueprint.event.workshop` (map via aliases; do not break current dotted IDs abruptly)

### 6.2 Legacy Create catalog

`lib/platformIntent/blueprintRegistry.ts` — `bp-*` aliases bridged in `inferWorkTypeAndBlueprint.ts`

---

## 7. Business identities

| Status | Notes |
|--------|-------|
| Live fields | Business Estate identity / basics (free text + sections) |
| Registry | **Missing** — 306 / 312 `identity.speaker` etc. |
| Examples (306) | speaker, coach, consultant, author, artist, crafter, maker, course creator, podcaster, solopreneur, agency owner, nonprofit leader, … |

---

## 8. Work Types

| Work Type ID | Package | Authority |
|--------------|---------|-----------|
| `event_plan` | `lib/universalWorkEngine/packages/eventPlan/` | UWE |
| `marketing_plan` | `packages/marketingPlan/` | UWE |
| `business_plan` | `packages/businessPlan/` | UWE |
| Schema bridge | `lib/workTypeSchema/` | Bridged |

---

## 9. Registries (runtime map)

See full table in [316 §2](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md).

**Kernel target (312):** shared entry contract — ID, version, certification, owner, deprecation, dependencies.

---

## 10. Certification reports (selected)

| Area | Location pattern |
|------|------------------|
| Event / Marketing / Business Blueprints | `docs/create-experience/*_CERTIFICATION.md` · `evidence/*.json` |
| UWE cert tests | `**/*.cert.test.ts` under `lib/universalWorkEngine` |
| Welcome (126) | `lib/firstLoginWelcome/welcomeExperienceConstitution.ts` |
| Client-Relationships library | `docs/chamber-knowledge/client-relationships/` + 075 gate |
| Events Member packages | `docs/visual-spark-studios/Events-Intelligence/` bundles |
| Architecture audits | `305`, `311`, `316`, `323`, `324`, `326`, `333`, `334` · plans `325`, `332` |

**Framework:** [314](./314_UNIVERSAL_TESTING_AND_CERTIFICATION_FRAMEWORK.md)

---

## 11. Implementation reports / plans

| Doc | Role |
|-----|------|
| 305 | Foundation audit |
| 311 | Adaptive implementation plan (authoritative) |
| 316 | Governance/registry audit + slices G0–G4 |
| 323 | Knowledge / provenance audit |
| 324 | Privacy / adaptation audit |
| 325 | Observability plan — **O1** architecture health report (no UX change) |
| 326 | Architecture gap analysis (pre–runtime composition) |
| 332 | Runtime composition plan — **R1** vertical proof |
| 333 | Work / Project bridge audit |
| 334 | Resilience / recovery audit |
| Create-experience hardening / reports | `docs/create-experience/` (096–106 era + Blueprint certs) |
| **233–236** Blueprint Createability | `docs/create-experience/standards/233_*`…`236_*` · runtime `lib/universalWorkEngine/blueprints/createability/` · masters `233_236_*` |
| Navigation welcome docs | `docs/navigation/119–121` |

---

## 12. Related product / Create standards (pointers)

| # | Topic |
|---|-------|
| **112** | Universal Work & Relationship Platform |
| **058 / 077 / 079** | Workspace experience standards |
| **088** | Preferences (incl. workspace environment 088_007) |
| Spec 108 / 109 | Environment integration / frosted workspace |

---

## 13. Recommended next actions (from 316 · 311 · 325 · 332)

1. **R1** — Runtime composition vertical proof (332) — one capability · Collection · Work · Output · Project handoff · recovery test  
2. **O1** — Architecture Health Report collectors (325) — visibility only  
3. **G1** — Registry kernel types (312) — no live migration  
4. **Adaptive Context façade** — 311 Slice 1 / 308 / 324  
5. **Provenance / retrieval-priority contract types** — 323 / 318 (types only)  
6. **Createability remediation** — hand-authored manifests for pilot Blueprint (233–236)  
7. **G2** — Read adapters · Domain Capability façade · Doc graph (322 / O2)  

**Forbidden until audits say otherwise:** parallel runtime · second Work engine · shadow Project SoT · new retrieval stack · second profile · new logging product · broad registry rewrite · overwriting authoritative 311 with bundle draft

---

## 14. Index maintenance

Update this Master Index when:

- a new Architecture v2 numbered doc lands  
- a Work Type or Blueprint family is certified  
- a registry is adapted into the kernel  
- a Collection or DomainCapability is production-certified  

**Owner:** Platform architecture (with Create/UWE maintainers for Work/Blueprint rows)
