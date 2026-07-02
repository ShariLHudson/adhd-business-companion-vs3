# Spark Business Brain™

**Institutional Knowledge Operating System**  
**Version:** 1.1.0  
**Status:** Foundation complete — no lesson content  
**Module:** `lib/businessBrain/`

---

## What this is

The Spark Business Brain™ is the **permanent knowledge operating system** behind:

- Momentum Institute™
- Estate Intelligence™
- Make It Mine™
- Shari coaching
- Growth Profile™
- Future AI recommendations

It answers: **What does Spark know how to teach?** — organized, synthesized, and data-driven.

### What this is NOT

| Business Brain™ (`lib/businessBrain/`) | Business Brain™ Spec 003 (`spark-intelligence-foundation/003`) |
|----------------------------------------|----------------------------------------------------------------|
| **Institutional** knowledge architecture | **Member** business memory |
| What Spark teaches every entrepreneur | What Spark remembers about *your* business |
| Curriculum, council, competencies | Goals, offers, clients, context |
| Powers Institute + coaching synthesis | Powers context retrieval before re-asking |

Both are "Business Brain™" in Spark vocabulary — **different layers**. This document covers the **knowledge OS**.

---

## Core principle

> **Spark synthesizes many schools of thought into one consistent teaching voice.**
>
> The Spark Knowledge Council™ is **internal**. Members never see expert names or competing authorities.
> They experience Shari — calm, practical, timeless.

---

## Architecture

```
Spark Business Brain™
├── Spark Knowledge Council™ (internal)
│   ├── Research Disciplines
│   ├── Knowledge Sources
│   └── Schools of Thought
├── Pillars (4)
├── Departments (44)
│   ├── Purpose
│   ├── Knowledge Sources
│   ├── Schools of Thought
│   ├── Research Disciplines
│   ├── Core Competencies
│   ├── Drawers
│   └── Topics
├── Competencies
├── Knowledge Cards™
├── Curriculum Topics
└── Learning Experiences (planned archetypes)
    ├── Business Mastery Minute™
    ├── Business Lab™
    ├── Simulation™
    ├── Challenge™
    ├── Apprenticeship™
    └── …
```

**Data flows in from:**

- Spark Competency Framework™ (`lib/sparkCompetencyFramework/`) — pillars & departments  
- [Spark Curriculum Master Index™](./SPARK_CURRICULUM_MASTER_INDEX.md) — 181+ topics  
- Spark Knowledge Council™ — synthesis metadata per department  

**Nothing is hard-coded in engine logic.** Load via `setBusinessBrainProvider()`.

---

## Reusable models

| Model | Purpose |
|-------|---------|
| `KnowledgeSource` | Citable reference with verification metadata (internal) |
| `SchoolOfThought` | Synthesis lens — Spark's unified voice |
| `KnowledgeCouncil` | Council bundle: disciplines, sources, schools, departments |
| `ResearchDiscipline` | Academic/practical field |
| `Pillar` | Four Pillars of Entrepreneurial Mastery |
| `Department` | Institute department + council metadata |
| `Drawer` | Filing cabinet within department |
| `CurriculumTopic` | One teachable topic in the master curriculum |
| `KnowledgeCard` | Master canonical knowledge object with separated content layers |
| `Competency` | Capability the entrepreneur develops |
| `LearningExperience` | Planned experience archetype (no lesson body) |
| `BusinessMasteryMinute` | 5–8 minute experience type |
| `BusinessLab` | Hands-on lab experience type |
| `Simulation` | Practice scenario experience type |
| `Challenge` | Real-world challenge experience type |
| `Apprenticeship` | Multi-week guided development |

**Types:** `lib/businessBrain/types.ts` · **Council colleges & Spark Filter™:** [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md) · **Source integrity:** `lib/businessBrain/sourceIntegrity/`

---

## Source Integrity™

Every lesson must pass editorial rules before publication. No source may be invented.

### KnowledgeSource (required fields)

| Field | Required |
|-------|----------|
| `sourceTitle` | Yes |
| `authorOrOrganization` | Yes when `verificationStatus: verified` |
| `sourceType` | Yes |
| `publicationDate` | When known |
| `reference` / `referenceKind` | When URL or file exists |
| `confidenceLevel` | Yes |
| `verificationStatus` | Yes |
| `limitationNotes` | Yes |

**Verification statuses:** `verified` · `unverified_candidate` · `rejected` · `stale`

- **`unverified_candidate`** — discipline placeholders awaiting real citations. **Cannot support final lessons** until reviewed and verified.
- Use `buildVerifiedKnowledgeSource()` only with real metadata — throws if author is missing or type is `curatorial_placeholder`.

### Knowledge Card content layers

Every `BrainKnowledgeCard` carries `contentLayers` separating:

| Layer | Purpose |
|-------|---------|
| `facts` | Verifiable claims — require verified `sourceIds` to publish |
| `principles` | Durable truths Spark teaches |
| `sparkSynthesis` | Spark's unified voice — **never** presented as a direct quote |
| `recommendations` | Action guidance |
| `examples` | Illustrations (quotes allowed when exact + sourced) |
| `opinions` | Editorial perspective — clearly labeled |

**Rule:** Spark synthesis must never be presented as a direct quote or exact claim from a source.

### Source Integrity Checklist (every lesson)

1. Are all factual claims sourced?
2. Are quotes exact?
3. Is the source real?
4. Is the source current enough?
5. Is this fact, opinion, or Spark synthesis?
6. Are limitations noted?
7. Is anything speculative clearly labeled?

Runtime: `evaluateSourceIntegrityChecklist()` · `canPublishLesson()` · `validateKnowledgeCardContentLayers()`

Teaching-eligible sources only: `listTeachingSourcesForDepartment()` · `filterSourcesEligibleForTeaching()`

---

## Spark Knowledge Council™

**Full document:** [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md)

**INTERNAL ONLY** — defines how Spark thinks about each department.

### Per department

Every `BrainDepartment` includes:

| Field | Description |
|-------|-------------|
| `name` | Department name |
| `purpose` | Why this department exists |
| `knowledgeSourceIds` | Which sources inform teaching |
| `schoolOfThoughtIds` | Which synthesis lenses apply |
| `researchDisciplineIds` | Underlying research fields |
| `coreCompetencyIds` | Capabilities developed here |
| `drawerIds` | Drawers in this department |
| `topicIds` | Curriculum topics |

### Council inventory (v2.0 blueprint)

| Asset | Blueprint | Runtime (v1.1.0) |
|-------|-----------|-------------------|
| **Colleges** | 8 | Documented — [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md) |
| Research disciplines | Mapped per college | 25 in `disciplines.ts` |
| Knowledge sources | Curated per college | 22 placeholders |
| Schools of thought | Synthesis lenses | 20 |
| Department mappings | Per Institute dept | 44 |
| **Spark Filter™** | 5 questions — mandatory | Editorial gate |

**Full council design:** [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md)

### Example — Marketing department

- **Purpose:** Reach, message, and grow demand ethically  
- **Schools:** Value-based pricing, Strategic positioning  
- **Sources:** Pricing traditions, Brand lineages *(curation placeholders — not yet verified for lesson attribution)*
- **Disciplines:** Marketing science, Behavioral economics  
- **Competencies:** marketing, pricing, messaging, positioning, copywriting, storytelling  

Members experience unified Spark teaching on pricing — not a list of economists or marketers.

---

## Data-driven loading

```typescript
import {
  loadBusinessBrainCatalog,
  getBusinessBrainIndex,
  getBrainDepartment,
  departmentSynthesisContext,
  listTeachingSourcesForDepartment,
  canPublishLesson,
  SOURCE_INTEGRITY_CHECKLIST,
  setBusinessBrainProvider,
} from "@/lib/businessBrain";

// Default: built from Curriculum Master Index + Knowledge Council
const catalog = loadBusinessBrainCatalog();

// Internal synthesis context for coaching / Make It Mine / Estate Intelligence
const ctx = departmentSynthesisContext("dept-marketing");
// { schoolSlugs, sourceSlugs, disciplineSlugs, competencyIds, … }

// Custom CMS / database provider
setBusinessBrainProvider({ load: () => yourCatalog });
```

---

## Folder structure

```
lib/businessBrain/
├── types.ts                    # All OS models
├── index.ts                    # Public API
├── businessBrain.test.ts
├── sourceIntegrity/
│   ├── types.ts                # Verification, layers, checklist
│   ├── validators.ts           # Publish gates + claim validation
│   └── index.ts
├── knowledgeCouncil/
│   ├── disciplines.ts          # 25 research disciplines
│   ├── sources.ts              # 22 placeholders + verified builder
│   ├── schoolsOfThought.ts     # 20 schools of thought
│   ├── departmentCouncil.ts    # 44 department mappings
│   └── index.ts
└── catalog/
    ├── buildCatalog.ts         # Merge curriculum + council
    ├── catalogIndex.ts         # O(1) lookups
    └── provider.ts             # Provider + synthesis helpers
```

---

## Scale (v1.0.0 assembled catalog)

| Asset | Count |
|-------|-------|
| Pillars | 4 |
| Departments | 44 |
| Drawers | ~120+ (derived from curriculum) |
| Curriculum topics | 181 |
| Knowledge cards | 181 |
| Planned learning experiences | 1,000+ (archetypes, no bodies) |
| Competencies | 70+ |

Designed for **decades** — add topics in Curriculum Master Index; council mappings in `departmentCouncil.ts`; reload provider.

---

## Integration map

| Consumer | Uses Brain for |
|----------|----------------|
| **Momentum Institute™** | Catalog seeds, drawer contents, experience planning |
| **Estate Intelligence™** | Department/topic relevance, stage, ADHD/AI signals |
| **Make It Mine™** | `departmentSynthesisContext()` — how to coach this topic |
| **Shari coaching** | Schools + competencies — never expert names |
| **Growth Profile™** | `BrainCompetency` linkage |
| **Future AI recommendations** | Indexed topics, competencies, relationships |

### Related docs

- [MOMENTUM_INSTITUTE_ARCHITECTURE.md](./MOMENTUM_INSTITUTE_ARCHITECTURE.md) — Phase 3 knowledge architecture  
- [SPARK_KNOWLEDGE_COUNCIL.md](./SPARK_KNOWLEDGE_COUNCIL.md) — internal synthesis registry  
- [SPARK_CURRICULUM_MASTER_INDEX.md](./SPARK_CURRICULUM_MASTER_INDEX.md) — Phase 4 curriculum map  
- [SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md](./SPARK_BUSINESS_BRAIN_MEMORY_RETRIEVAL_FRAMEWORK.md) — Spec 117 member memory (separate layer)

---

## Expansion protocol

1. Add curriculum topic in `lib/sparkCurriculumMasterIndex/`
2. Update department council mapping if new department
3. Add knowledge sources/schools only when synthesis truly changes
4. Rebuild catalog (automatic via `buildBusinessBrainCatalog()`)
5. **Do not** add lesson bodies here — only structure

---

## Invariants

1. **Council is internal** — `visibility: "internal"` on sources, schools, disciplines  
2. **No expert names** in member-facing paths  
3. **Capability over information** — every topic has `capabilityFocus`  
4. **One Knowledge Card per concept** — experiences reference cards  
5. **Provider pattern** — production data from CMS/JSON, not engine code  
6. **Lessons later** — experiences are `status: "planned"` until content pipeline ships  
7. **Source integrity** — no invented sources; unverified placeholders cannot teach final lessons; synthesis never quoted as source fact  

---

*The Business Brain™ is Spark's teaching memory — the foundation every future lesson, lab, simulation, and coaching conversation will stand on.*
