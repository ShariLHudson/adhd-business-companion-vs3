# 317 — Architecture v2 Master Index

**Date:** 2026-07-21  
**Purpose:** Catalog constitutional, architecture, registry, certification, and implementation documents for Spark Estate Architecture v2  
**Governance:** [315 Platform Governance Constitution](./315_SPARK_ESTATE_PLATFORM_GOVERNANCE_CONSTITUTION.md)  
**Production readiness (docs vs runtime):** [SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md](./SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md)

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
| **128** | [Simplicity & Cognitive Load Constitution](../constitution/128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) | Binding release gates — hide complexity; simplicity / ADHD certification |
| **131** | [Create Intelligence & Intent Constitution](../constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md) | Binding Create intent — infer goals not keywords; confidence-based alternatives |
| **132** | [Experience Perfection & Momentum Protection](../constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md) | Binding momentum / polish — never surprise; intentional navigation; Ten-Second Rule |

**Conflict rule:** On Work identity and source-of-truth, **315 + UWE (112)** prevail for platform runtime. On companion voice and hospitality, **113–117** prevail. On mental load, architecture exposure, and ADHD/simplicity certification, **128** prevails over feature convenience. On Create Begin / intent understanding, **131** prevails (after **130** confirm-before-create). On momentum, intentional navigation, interface truthfulness, polish, and the Ten-Second Rule, **132** prevails. See [316 §9](./316_GOVERNANCE_AND_REGISTRY_AUDIT.md). *(Create Blueprint track `128_webinar_event` / `132_product_launch_event` is a different series.)*

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
| **335** | Platform Evolution Architecture | Grow without drift |
| **336** | Plugin & Extension Architecture | Extension contracts · no shadow stores |
| **337** | Automation & Agent Architecture | Agents via capabilities + approvals |
| **338** | Platform Performance & Scalability | Budgets without breaking integrity |
| **339** | Architecture Roadmap | Implementation waves (see 340 for repo order) |
| **340** | Evolution Audit | Principles vs repo · reconciled roadmap |
| **341** | Extension Implementation Plan | **E1** manifest types first |
| **342** | Agent Runtime Audit | No agent runner before R1 |

**Bundle READMEs:** `README_UPLOAD_ORDER.md` (300) · `306_310_ADAPTIVE_INTELLIGENCE_README.md` · `311_315_PLATFORM_GOVERNANCE_README.md` · `318_322_KNOWLEDGE_TRUST_OBSERVABILITY_README.md` · `327_331_RUNTIME_COMPOSITION_README.md` · `335_339_PLATFORM_EVOLUTION_README.md`  
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
| `business_plan` | handmade/service/creator/organizing/retail/commerce/hospitality packs · `business.contractor_construction` · `business.home_service` · `business.property_management` · `operations.mobile_field_service` |

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
| Architecture audits | `305`, `311`, `316`, `323`, `324`, `326`, `333`, `334`, `340`, `342` · plans `325`, `332`, `341` |

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
| 340 | Evolution audit · repo-ordered roadmap |
| 341 | Extension plan — **E1** manifest types (after/with R1) |
| 342 | Agent runtime audit — blocked until capability contracts |
| Create-experience hardening / reports | `docs/create-experience/` (096–106 era + Blueprint certs) |
| **233–236** Blueprint Createability | `docs/create-experience/standards/233_*`…`236_*` · runtime `lib/universalWorkEngine/blueprints/createability/` · masters `233_236_*` |
| **219–224** Professional Organizing Collection | `docs/create-experience/219_*`…`224_*` · runtime `organizingProfessionalCollectionDefinitions.ts` |
| **225–228** Retail Collection | `docs/create-experience/225_*`…`228_*` · runtime `retailCollectionDefinitions.ts` |
| **229–232** Product & Commerce | `docs/create-experience/229_*`…`232_*` · runtime `productCommerceCollectionDefinitions.ts` |
| **237–240** Hospitality & Travel | `docs/create-experience/237_*`…`240_*` · runtime `hospitalityTravelCollectionDefinitions.ts` |
| **241–244** Field Home Property | `docs/create-experience/241_*`…`244_*` · runtime `fieldHomePropertyCollectionDefinitions.ts` |
| **245–248** Wellness Personal Care Pet | `docs/create-experience/245_*`…`248_*` · runtime `wellnessPersonalCarePetCollectionDefinitions.ts` |
| **249–252** Education Nonprofit Public | `docs/create-experience/249_*`…`252_*` · runtime `educationCommunityOrgCollectionDefinitions.ts` |
| **253–256** Regulated Professional Services | `docs/create-experience/253_*`…`256_*` · runtime `regulatedProfessionalServicesCollectionDefinitions.ts` |
| **257–260** Manufacturing Logistics Agriculture | `docs/create-experience/257_*`…`260_*` · runtime `manufacturingLogisticsAgricultureCollectionDefinitions.ts` |
| **261–264** Tech Media Creative | `docs/create-experience/261_*`…`264_*` · runtime `techMediaCreativeCollectionDefinitions.ts` |
| **265–268** Scale Location Channel | `docs/create-experience/265_*`…`268_*` · runtime `scaleLocationChannelCollectionDefinitions.ts` |
| **269–272** Local Consumer Service | `docs/create-experience/269_*`…`272_*` · runtime `localConsumerServiceCollectionDefinitions.ts` |
| **279–282** Financial Investment Property | `docs/create-experience/279_*`…`282_*` · runtime `financialInvestmentPropertyCollectionDefinitions.ts` |

| **273–278** Blueprint Profile Context Connection | `docs/create-experience/standards/273_*`…`278_*` · runtime `lib/universalWorkEngine/blueprints/profileContext/` · masters `273_278_*` |
| **295–300** Master Shared Object Library | `docs/create-experience/standards/295_*`…`300_*` · runtime `lib/universalWorkEngine/blueprints/sharedObjects/` · masters `295_300_*` (distinct from Architecture v2 `300_*`) |
| Navigation welcome docs | `docs/navigation/119–121` |

---

## 12. Related product / Create standards (pointers)

| # | Topic |
|---|-------|
| **112** | Universal Work & Relationship Platform |
| **058 / 077 / 079** | Workspace experience standards |
| **088** | Preferences (incl. workspace environment 088_007) |
| Spec 108 / 109 | Environment integration / frosted workspace |
| **136** | [Platform Polish Phase 1](../platform/136_PLATFORM_POLISH_PHASE_1_REPORT.md) — craftsmanship / trust / nav density (prompt [136_CURSOR…](../platform/136_CURSOR_PLATFORM_POLISH_PHASE_1.md)); binds 128 · 132; Create 127–135 unchanged |
| **139** | [Platform Final Polish & Release Certification](../platform/139_PLATFORM_FINAL_POLISH_AND_RELEASE_CERTIFICATION_REPORT.md) — craftsmanship release gate (prompt [139_CURSOR…](../platform/139_CURSOR_PLATFORM_FINAL_POLISH_AND_RELEASE_CERTIFICATION.md)); binds 128 · 131 · 132 · 137; **Provisional** (browser/a11y deferred) |

---

## 13. Recommended next actions (from 316 · 311 · 325 · 332 · 340)

1. **R1** — Runtime composition vertical proof (332)  
2. **Createability remediation** — pilot Blueprint manifests (233–236)  
3. **O1** — Architecture Health Report (325)  
4. **G1** — Registry kernel types (312)  
5. **Adaptive Context façade** — 311 Slice 1  
6. **E1** — Extension manifest types only (341) — after/with R1  
7. **Provenance contracts · G2 adapters · Doc graph** — then agents (342 A1+) last  

**Forbidden until audits say otherwise:** parallel runtime · agent runner · plugin marketplace · second Work engine · shadow Project SoT · new retrieval stack · second profile · broad registry rewrite · overwriting authoritative 311 with bundle draft

---

## 14. Index maintenance

Update this Master Index when:

- a new Architecture v2 numbered doc lands  
- a Work Type or Blueprint family is certified  
- a registry is adapted into the kernel  
- a Collection or DomainCapability is production-certified  

**Owner:** Platform architecture (with Create/UWE maintainers for Work/Blueprint rows)
