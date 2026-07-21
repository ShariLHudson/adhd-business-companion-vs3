# 316 — Governance and Registry Audit

**Date:** 2026-07-21  
**Governing constitution:** [315 Spark Estate Platform Governance Constitution](./315_SPARK_ESTATE_PLATFORM_GOVERNANCE_CONSTITUTION.md)  
**Related:** 300–314 · [305 Foundation Audit](./305_ARCHITECTURE_V2_FOUNDATION_AUDIT.md) · [311 Adaptive Plan](./311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN.md) · [312 Registry Architecture](./312_UNIVERSAL_REGISTRY_ARCHITECTURE.md) · [313 Lifecycle](./313_INTELLIGENCE_LIFECYCLE_VERSIONING_AND_MAINTENANCE.md) · [314 Testing & Certification](./314_UNIVERSAL_TESTING_AND_CERTIFICATION_FRAMEWORK.md)  
**Mode:** Audit only — no broad registry rewrite  
**Verdict:** Multiple live registries already work; governance must **kernel + adapters**, not a greenfield registry rewrite

---

## 1. Executive summary

Files **312–315** define the registry kernel, lifecycle, certification framework, and Platform Governance Constitution. Together with **300–311**, they close the Architecture v2 governance loop.

**Constitution (315) is active for this series** when stored, referenced, and used in review (ratification criteria in 315).

**Do not** implement a universal registry rewrite until this audit’s sequence is followed. Prefer adapters over existing SoTs (UWE Blueprints, Work Types, Chamber, Estate Brain).

---

## 2. Current registries

| Registry / catalog | Path | Role today |
|--------------------|------|------------|
| Estate Brain capabilities | `lib/estateBrain/capabilityRegistry.ts` | RoutingCapability (intent → place) |
| Estate Brain experts / environments / knowledge | `lib/estateBrain/*` | Navigation intelligence |
| Companion capability registry | `lib/companionCapabilityRegistry.ts` | Companion interventions |
| Estate Capability Registry | `lib/estateCapabilityRegistry/` | Concierge inventory (parallel) |
| Canonical places | `lib/estate/canonicalEstateRegistry.ts` | Place identity |
| Legacy rooms | `lib/estate/estateRoomRegistry.ts` | Deprecated |
| UWE Work Types | `lib/universalWorkEngine/registry/universalWorkTypeRegistry.ts` | Work Type packages |
| UWE Blueprints | `lib/universalWorkEngine/blueprints/registry.ts` | Blueprint SoT |
| Work Type schemas | `lib/workTypeSchema/registry.ts` | Schema bridge |
| Create Blueprint catalog | `lib/platformIntent/blueprintRegistry.ts` | Legacy `bp-*` |
| Creation ownership | `lib/creationOwnership/ownershipRegistry.ts` | Asset ownership |
| Chamber Members | `lib/chamber/chamberMemberRegistry.ts` | 24 Members |
| Board Directors | `lib/board/boardDirectorRegistry.ts` | 12 directors |
| Estate Room Collections | `lib/estate/collectionFramework/registry.ts` | Journal/Vault/etc. rooms |
| Events capabilities / assets | `lib/eventsIntelligence/event*Registry/` | Domain reference |
| Intelligence Registry (doc) | `lib/intelligence/INTELLIGENCE_REGISTRY.md` | Objects × engines |
| Workspace environments (091) | `lib/workspaceEnvironment/` | Work Type visual defaults |
| First-login welcome | `lib/firstLoginWelcome/` | Account welcome completion |

**Missing vs 312 kernel families:** unified registry kernel, Domain Capability Registry, Collection Registry (intelligence/business), Business Identity Registry, Certification Registry, Relationship Type Registry (Cartography has edges but not this kernel).

---

## 3. Authoritative owners

| Concern | Owner (must not displace) | 312 alignment |
|---------|---------------------------|---------------|
| Work identity / lifecycle | Universal Work Engine | Work Type Registry remains UWE |
| Blueprints | UWE Blueprint Framework | Blueprint Registry remains UWE |
| Places / intent routing | Estate Brain + Canonical Estate | Not a 312 “Member” registry |
| Chamber cards | Chamber registry | Adapt into Intelligence Member Registry |
| Board | Board registry | Separate — Constitution Art. IX |
| Business Estate storage | Existing profile key | Business Identity Registry is definitions, not a second profile |
| Domain Event capabilities | Events package until promoted | Adapter → Domain Capability Registry |

---

## 4. Duplicated registry behavior

| Collision | Risk | Governance rule |
|-----------|------|-----------------|
| “Capability” (Brain vs Companion vs Estate Capability vs Events vs future Domain) | **High** | Naming: RoutingCapability vs DomainCapability (305/311) |
| “Blueprint” (UWE vs Create `bp-*`) | Medium | UWE authoritative; Create = aliases/entry |
| “Collection” (Estate rooms vs v2 Collections) | **High** | Namespace in docs + IDs (`collection.business.*` vs room ids) |
| Expert vs Chamber vs Board | Medium | Brain experts invisible; Chamber = Members; Board = Round Table |
| Place catalogs | Medium | Canonical + Brain only; finish legacy retirement |

Article XI (315): search before create — not yet enforced as a platform gate.

---

## 5. Current certification patterns

| Pattern | Where |
|---------|-------|
| Blueprint PRODUCTION CERTIFIED docs | `docs/create-experience/*_CERTIFICATION.md` + evidence JSON |
| UWE foundation / Anywhere-Origin cert tests | `lib/universalWorkEngine/**/*.cert.test.ts` |
| Member package cert (Events reference) | Events bundles EI-K801/K802 |
| Chamber delivery cert state | `chamberCertifiedState` (conversation delivery — not package cert) |
| Client-Relationships library approval | docs/chamber-knowledge 075 gate |
| Welcome / constitutional checklists | `FIRST_TIME_WELCOME_CERTIFICATION_CHECKLIST` (126) |
| Conditional certification | Used in narrative docs; not a shared Certification Registry |

**Gap vs 314:** no single Certification Registry; verdict vocabulary varies; cognitive-load and expertise-adaptation certifications not standardized across packages.

---

## 6. Current versioning patterns

| Object | Versioning today |
|--------|------------------|
| UWE Blueprints / Work Type packages | Explicit `version` strings (e.g. `1.0.0`) |
| Chamber cards | No semantic package version on registry rows |
| Estate Brain entries | Mostly static catalogs |
| Business Estate | Schema via envelope sections; not semver |
| Docs | Numbered standards; not runtime versions |
| Deprecation | Ad hoc comments (`@deprecated`); no replacement ID graph |

**Gap vs 313:** lifecycle states (proposed → archived) and deprecation-with-replacement not platform-wide.

---

## 7. Missing maintenance ownership

| Object class | Accountable owner today | Gap |
|--------------|-------------------------|-----|
| UWE packages | Implied by package path / Create standards | No backup owner / review cadence field |
| Chamber Members | Specialty cards only | No maintenanceOwner on registry (302/313 require) |
| Estate Brain catalogs | Platform/docs | No review dates |
| Business Blueprints 201–206 | Create cert docs | Cert docs yes; maintenance register sparse |
| Events Intelligence | Deepest ownership model | Reference for others |

---

## 8. Migration risks

1. Building a new registry kernel that double-registers UWE Blueprint IDs.  
2. Renaming Chamber IDs to `member.marketing` without aliases.  
3. Treating Estate Room Collections as Intelligence Collections.  
4. Overwriting repo **311** with the weaker bundle plan (prevented — archived).  
5. Broad rewrite before Adaptive Context façade and Domain Capability naming land.  
6. Silent ownership reassignment (forbidden by 313 / 315 Art. II–IV).

---

## 9. Governance conflicts

| Conflict | Resolution |
|----------|------------|
| Zip 311 vs repo 311 | **Repo 311 wins**; Workshop pilot adopted from zip; registry-first delayed |
| Product Constitution 113–117 vs Platform Governance 315 | **Both active in their scopes** — 113–117 product/companion/nav/trust; 315 Architecture v2 platform/intelligence/Work governance. On Work/source-of-truth, 315 + 112/UWE align. Flag dual “constitution” naming in Master Index. |
| Estate Brain “capability” vs DomainCapability | Documented split; code façade pending |
| Certification “PRODUCTION CERTIFIED” (Blueprints) vs 314 levels | Map Blueprint cert → 314 Blueprint certification; keep existing docs as evidence |

---

## 10. Recommended smallest implementation slice

**Do not** start a universal registry rewrite.

### Slice G0 (this landing) — done when committed

- Specs 312–315 in repo  
- 311 reconciliation note  
- This audit (316) + Master Index (317)

### Slice G1 — Registry kernel types only

- `lib/architectureV2/registry/` (or similar): kernel types from 312 (`RegistryEntry`, statuses, ID helpers)  
- Unit tests: ID shape, reject missing owner, cycle stub  
- **No** migration of live registries yet

### Slice G2 — Adapters (read-only)

- Adapter wrapping UWE Blueprint list  
- Adapter wrapping Chamber Member list → `member.*` aliases without renaming runtime IDs  
- Health report: duplicate-risk candidates (doc + test)

### Slice G3 — Align with Adaptive Slice 1 (311)

- Adaptive Context façade (from 311) — still the smallest **member-facing** adaptive win  
- Runs in parallel with G1; does not depend on full registry rewrite

### Slice G4 — Domain Capability façade + Workshop Collection pilot

- Per zip 311 Phase 2–3 and repo 311 / 305  
- Events + Marketing + Finance + Learning + Execution seed capabilities  
- Workshop Collection owner = Events; contributors declared  

### Later

- Certification Registry  
- Lifecycle/deprecation tooling  
- Architecture health dashboard  

---

## 11. Recommended implementation sequence (summary)

1. G0 docs (this)  
2. G1 kernel types + G3 Adaptive Context façade (parallel)  
3. G2 read adapters + health report  
4. Domain Capability façade (305 B / G4 start)  
5. Workshop Collection pilot (zip 311 Phase 3)  
6. Business Identity Registry definitions  
7. Certification Registry + 314 checklists as code constants  
8. Deprecate parallel catalogs only after adapters prove compatibility  

**Blockers before broad rewrite:** naming standard signed; UWE/Chamber IDs aliased; Workshop pilot design; no WIP pollution in commits.

---

## 12. Audit deliverables checklist

| Required | Section |
|----------|---------|
| Current registries | §2 |
| Authoritative owners | §3 |
| Duplicated registry behavior | §4 |
| Current certification patterns | §5 |
| Current versioning patterns | §6 |
| Missing maintenance ownership | §7 |
| Migration risks | §8 |
| Governance conflicts | §9 |
| Smallest implementation slice | §10–11 |

---

## 13. Completion statement

Governance specs **312–315** are in-repo. Constitution **315** governs Architecture v2 platform behavior alongside Product Constitutions **113–117**.

No broad registry rewrite in this landing. Next code: kernel types (G1) and/or Adaptive Context façade (311 Slice 1).
