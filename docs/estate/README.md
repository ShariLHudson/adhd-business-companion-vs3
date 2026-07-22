# Spark Estate — Documentation

## Architectural authority (binding)

**These four documents define Spark Estate. They supersede all prior design assumptions.**

| Authority | Document |
|-----------|----------|
| **Principles** | [01 — Spark Estate Constitution](./01%20-%20Spark%20Estate%20Constitution.md) |
| **Experience** | [Living in Spark Estate](./Living%20in%20Spark%20Estate.md) |
| **Canon** | [Spark Estate Bible](./Spark%20Estate%20Bible.md) |
| **Operational canon** | [Master World Bible](./SPARK_ESTATE_MASTER_WORLD_BIBLE.md) — timeline, lore, laws, guide standards, Spark knowledge |

**Manifest:** [ESTATE_ARCHITECTURAL_AUTHORITY.md](./ESTATE_ARCHITECTURAL_AUTHORITY.md)

Implementation must align. Legacy code and older docs are subordinate. If conflict → fix code, not canon.

---

## Restoration (active)

[ARCHITECTURAL_RESTORATION.md](./ARCHITECTURAL_RESTORATION.md) · [Estate Cleanup Roadmap](../ESTATE_CLEANUP_ROADMAP.md)

### Phase A — Canonical Estate Registry

**[SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)** — official source of truth for **every place** in the Estate (not code). Feeds routing, backgrounds, Guidebook, map, conversation, and image generation. Code registries converge here.

### Phase B — Runtime Estate Registry

**[PHASE_B_RUNTIME_REGISTRY_REPORT.md](./PHASE_B_RUNTIME_REGISTRY_REPORT.md)** — `lib/estate/canonicalEstateRegistry.ts` is the **runtime** authority (42 places). Legacy registries remain as adapters; not deleted yet.

### Phase C — goToPlace Navigation

**[PHASE_C_GOTOPLACE_REPORT.md](./PHASE_C_GOTOPLACE_REPORT.md)** — `lib/estate/goToPlace.ts` + `resolveEstatePlace.ts` are the approved navigation primitives. Legacy section routing is subordinate.

### Phase 1 — Estate Master Plan (naming · mounts · intent)

**[SPARK_ESTATE_MASTER_PLAN.md](./SPARK_ESTATE_MASTER_PLAN.md)** — **authoritative for naming, routing, mounts, and natural-language intent** on all new work. Code: `placeIdAliases.ts`, `estateMountRegistry.ts`, `estateMemberNeedIndex.ts`, `estateTurn.ts`. Additive only — legacy registries remain.

### Phase 2 — Turn orchestration (planning only)

**[ESTATE_TURN_ORCHESTRATION_PLAN.md](./ESTATE_TURN_ORCHESTRATION_PLAN.md)** — how `evaluateEstateTurn()` becomes the single routing orchestrator; active task lock; correction override; shadow mode wiring order. **No runtime changes until approved.**

### Companion DNA — The Friend We All Deserve

**[THE_FRIEND_WE_ALL_DESERVE.md](../THE_FRIEND_WE_ALL_DESERVE.md)** — **read first before conversation logic and prompts.** Sibling to the Estate Constitution: Estate governs places; Spark governs friendship.

### First 60 Days Welcome Experience (Welcome Home)

**[FIRST_60_DAYS_WELCOME_EXPERIENCE.md](./FIRST_60_DAYS_WELCOME_EXPERIENCE.md)** — four-section daily Welcome Home (welcome · optional discovery · three actions · encouragement); guided days 1–60, adaptive after. Runtime: `lib/dailyOpening/first60Days/`.

### Conversation & creation architecture (binding)

**[docs/README.md](../README.md)** — master index for the intelligence stack.

| Layer | Document |
|-------|----------|
| Conversation Intelligence | [SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md](../SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md) |
| Creation Guidance | [CREATION_GUIDANCE_INTELLIGENCE.md](../CREATION_GUIDANCE_INTELLIGENCE.md) |
| Creating Together | [ESTATE_CREATION_EXPERIENCE.md](../ESTATE_CREATION_EXPERIENCE.md) |

### Phase D — Unified Estate Shell

**[PHASE_D_UNIFIED_ESTATE_SHELL.md](./PHASE_D_UNIFIED_ESTATE_SHELL.md)** — one canonical `SparkEstateShell` architecture; inventory, migration strategy, conversation/object/scene layers. Documentation only — no room redesign in Phase D.

### Phase E — Remove Application Chrome

**[PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md](./PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md)** — hide sidebar, top bar, invitation grids, and title plaques in Estate mode; `estateChromePolicy.ts` enforces Living Place law.

### Phase F — Shari Companion Behavior Engine

**[PHASE_F_SHARI_COMPANION_ENGINE.md](./PHASE_F_SHARI_COMPANION_ENGINE.md)** — behavioral blueprint: companion principles, conversation/memory/celebration laws, 50 example dialogues. Documentation only — no code.

### Phase G — Spark Estate Memory Architecture

**[SPARK_ESTATE_MEMORY_ARCHITECTURE.md](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md)** — official Estate memory model: stories not data, memory levels, books, collections, recall & privacy rules. Documentation only — no code.

### Phase H — Architecture Validation

**[SPARK_ESTATE_ARCHITECTURE_VALIDATION.md](./SPARK_ESTATE_ARCHITECTURE_VALIDATION.md)** — seven authorities read as one system: strengths, conflicts, risks, simplifications, and recommended first build phase (D.1). Documentation only — no code.

### Phase H.1 — Estate Intent Bridge

**[PHASE_H1_INTENT_BRIDGE.md](./PHASE_H1_INTENT_BRIDGE.md)** — natural language + emotional intent → canonical place understanding (`lib/estate/estateIntentBridge.ts`). Understanding only — no UI or routing changes.

### Phase H.2 — Estate Expansion & Ingestion

**[PHASE_H2_EXPANSION_ENGINE.md](./PHASE_H2_EXPANSION_ENGINE.md)** — classify new concepts before canon adoption (`lib/estate/estateExpansionEngine.ts`). Governance only — no new rooms.

### Multilingual architecture (foundation)

**[SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md](./SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md)** — translation rules, language files, Spark Card / Guide localization, user content boundaries, room names, navigation terms, and future AI translation workflow. **Binding for all new member-facing work** — prevents English hardcoding in components.

### Shari Companion Engine Rewrite

**[SHARI_COMPANION_ENGINE_REWRITE.md](./SHARI_COMPANION_ENGINE_REWRITE.md)** — Emotion Before Instruction; runtime in `lib/conversation/shariCompanionEngine.ts`. Binding for all Shari responses.

### P0 — Canon errata (pre–Phase D.1)

**[P0_CANON_ERRATA.md](./P0_CANON_ERRATA.md)** — Celebration Room id, Reading Nook ≠ Library, wins routing, Guidebook object, My Thoughts retired from canon, Catalog 03 historical. Minimal registry sync.

---

## Operational detail (subordinate to authority)

| Doc | Role |
|-----|------|
| [02 — Master Plan](./02%20-%20Spark%20Estate%20Master%20Plan.md) | Strategy sequence |
| [03–10 series](./03%20-%20Estate%20Room%20Catalog.md) | Catalog, objects, navigation, UI detail |
| [bible/](./bible/) | Room pages, grounds index, appendix |
| [08 — UI Philosophy](../SPARK_ESTATE_UI_PHILOSOPHY.md) | UI gates — Bible Ch 8 wins on conflict |

---

## Room knowledge (Spark-facing hints)

Synced hints for matched places — must align with Bible place types and Constitution.

| Place | Document | Registry ID |
|-------|----------|-------------|
| Momentum Institute | [momentum-institute.md](./momentum-institute.md) | `momentum-institute` |
| Welcome Home | [welcome-home.md](./welcome-home.md) | `welcome-home` |
| Creative Studio | [creative-studio.md](./creative-studio.md) | `creative-studio` |
| Observatory | [observatory.md](./observatory.md) | `observatory` |
| Coffee House | [coffee-house.md](./coffee-house.md) | `coffee-house` |
| Peaceful Places | [peaceful-places.md](./peaceful-places.md) | `peaceful-places` |
| Decision Compass | [decision-compass.md](./decision-compass.md) | `decision-compass` |
| Clear My Mind | [clear-my-mind.md](./clear-my-mind.md) | `clear-my-mind` |
| Momentum Builder | [momentum-builder.md](./momentum-builder.md) | `momentum-builder` |
| Growth Journal | [growth-journal.md](./growth-journal.md) | `growth-journal` |

**Sync rule:** When room knowledge changes → update `lib/estateKnowledge/` and verify against Bible + Constitution.

**Deprecated as authority:** `ESTATE_EXPERIENCE_MASTER_PLAN.md`, `ESTATE_INTELLIGENCE_FRAMEWORK.md` (mechanics only; vocabulary from Bible).
