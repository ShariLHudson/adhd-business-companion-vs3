# Momentum Institute™ — Spark Knowledge Architecture™

**Phase 3 · Entrepreneur Development Center**  
**Status:** Foundation complete — no lesson content in this layer  
**Mission:** *Help every member become a better entrepreneur.*

The Momentum Institute™ is **not** a course platform, LMS, or document library. It is an **intelligent entrepreneurial development system** — a permanent center inside the Spark Estate™ where every lesson, strategy, apprenticeship, simulation, and coaching conversation has a place, a lineage, and a path forward.

**Master blueprint:** [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md) — complete design document (what the Institute becomes).

---

## What this document covers

| Section | Purpose |
|---------|---------|
| [Philosophy](#philosophy) | What the Institute is — and is not |
| [Hierarchy](#knowledge-hierarchy) | University-style organization |
| [Data models](#data-models) | Types, catalog bundle, metadata |
| [Relationship engine](#relationship-engine) | Topics, paths, prerequisites |
| [Competency framework](#competency-framework) | Capability growth — not gamification |
| [Learning experiences](#learning-experiences) | Experience types and lifecycle |
| [Personal learning ecosystem](#personal-learning-ecosystem) | Where learning connects |
| [Folder structure](#folder-structure) | Code layout |
| [Scale strategy](#scale-strategy) | 500+ drawers · 5,000+ cards · 10,000+ assets |
| [Growth intelligence](#growth-intelligence) | What Spark eventually knows |
| [Expansion plan](#expansion-plan) | V1 → V2 → V3 |

**Rule:** This layer defines **structure only**. Lesson bodies, worksheets, video scripts, and coaching copy load from CMS / JSON / API via `setInstituteCatalogProvider()` — never hard-coded in engine logic.

---

## Philosophy

### The Institute is a place, not a room

The drawer interaction lives in the Estate UI. The **knowledge architecture** lives in `lib/momentumInstitute/` and powers everything behind it:

- Spark teaches timeless business principles.
- Shari helps members apply them (Make It Mine™, Coach With Shari™).
- Growth compounds quietly through Growth Profile™, Evidence Vault™, and Portfolio™.

### One master object per concept

Every concept has **one Knowledge Card™**. Business Mastery Minutes™, Deep Lessons™, Labs, Simulations, Apprenticeships, Challenges, Strategy Collections™, Reflections, Coaching Sessions™, and Apply To My Business™ experiences **reference** that card by id — they never duplicate it.

### References, not copies

My Institute Cabinet™, Journal™, and Evidence Vault™ store **references** and member outcomes — not duplicate lesson content.

---

## Knowledge hierarchy

Everything belongs somewhere. The canonical tree:

```
Momentum Institute™
└── Pillar (4 — Four Pillars of Entrepreneurial Mastery)
    └── Department (e.g. Marketing, Leadership, Executive Function)
        └── Drawer (e.g. Pricing, Delegation, Focus)
            └── Knowledge Card™ (e.g. Pricing Psychology)
                └── Learning Experience(s) (Minute, Lab, Simulation, …)
```

### Example path

```
Build Your Business
└── Marketing
    └── Pricing
        └── Pricing Psychology
            ├── Business Mastery Minute™
            ├── Deep Lesson™
            ├── Strategy Collection™
            ├── Reflection™
            └── Apply To My Business™
```

### Optional topic grouping

`InstituteTopicDefinition` is an **optional** grouping layer when a drawer contains multiple Knowledge Cards under one theme. The canonical leaf node is always the **Knowledge Card**. UI may collapse topic + card when the relationship is 1:1.

### Four pillars (current data scaffold)

| Pillar | Focus |
|--------|--------|
| **Build Yourself** | Mindset, EF, confidence, habits, resilience |
| **Build Your Business** | Strategy, marketing, sales, finance, operations, systems |
| **Build Your Thinking** | Critical, strategic, systems, creative thinking; decisions |
| **Build Your Legacy** | Leadership, coaching, teaching, community, legacy |

> **Blueprint v1.0** defines **five** pillars — adding **Build Your Influence™** between Thinking and Legacy. See [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](./MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md). Data migration pending.

Full pillar → department → drawer scaffold: `lib/sparkCompetencyFramework/competencyFrameworkV1.ts`

---

## Data models

### Catalog bundle (`MomentumInstituteCatalog`)

The single load target for all Institute knowledge:

| Collection | Description |
|------------|-------------|
| `institute` | Root Institute record |
| `pillars` | Four pillars |
| `departments` | Departments within pillars |
| `drawers` | Filing cabinets within departments |
| `topics` | Optional groupings within drawers |
| `knowledgeCards` | Master knowledge objects |
| `experiences` | Learning experience definitions |
| `competencies` | Growth competency definitions (tree via `parentCompetencyId`) |
| `relationships` | Explicit knowledge graph edges |
| `learningPaths` | Spark Suggested Learning Path™ sequences |
| `makeItMineTemplates` | Coaching intent templates |
| `returnClosings` | The Return™ copy keys |
| `evidenceOpportunityTemplates` | Evidence Vault™ prompt keys |
| `ecosystemLinks` | Optional per-experience-type ecosystem map |
| `timeSlotRecommendations` | Optional time → experience map |

**Types:** `lib/sparkMomentumInstitute/types.ts`  
**Runtime index:** `lib/momentumInstitute/knowledgeArchitecture/catalogIndex.ts`

### Knowledge Card™ metadata

Every card supports a structured envelope (no lesson body in architecture):

| Field | Purpose |
|-------|---------|
| `title` / `summary` / `description` | Identity and orientation |
| `metadata.difficulty` | `foundational` → `expert` |
| `metadata.estimatedMinutes` | Time-respecting offers |
| `metadata.businessStages` | `idea`, `launch`, `growth`, `scale`, `mature`, `all` |
| `metadata.adhdRelevance` | Quiet EF-aware filtering — never labels members |
| `metadata.aiRelevance` | AI-for-business relevance signal |
| `competencyIds` | Competencies this card develops |
| `perspectiveIds` | Spark Knowledge Perspectives™ (disciplines informing the topic) |
| `relatedKnowledgeCardIds` | Shortcut — also expressible in `relationships` |
| `prerequisiteKnowledgeCardIds` | Must complete / understand first |
| `advancedKnowledgeCardIds` | Deeper follow-on topics |
| `suggestedNextKnowledgeCardIds` | Recommended next steps |
| `experienceDefinitionIds` | Available learning experiences |
| `tags` | Search and filter facets |

### Indexed catalog (`InstituteCatalogIndex`)

For scale, the engine builds O(1) maps on catalog load:

- `byKnowledgeCardId`, `byKnowledgeCardSlug`
- `cardsByDrawerId`, `cardsByDepartmentId`, `cardsByPillarId`
- `experiencesByCardId`
- `relationshipsFromCard`, `relationshipsToCard`
- `learningPathsByCardId`

Access via `getCatalogIndex()` in `lib/momentumInstitute/catalog/provider.ts`.

---

## Relationship engine

**Module:** `lib/momentumInstitute/knowledgeArchitecture/relationshipEngine.ts`

Every topic participates in a **knowledge graph**:

| Relationship | Direction | Meaning |
|--------------|-----------|---------|
| `related` | Card → Card | Thematically connected |
| `prerequisite` | Prereq → Dependent | Complete prereq before dependent |
| `advanced` | Card → Card | Deeper extension of current topic |
| `recommended_next` | Card → Card | Natural next step in progression |

### APIs

| Function | Returns |
|----------|---------|
| `getRelatedKnowledgeCards` | Related topics |
| `getPrerequisiteKnowledgeCards` | What to learn first |
| `getAdvancedKnowledgeCards` | Deeper topics |
| `getRecommendedNextKnowledgeCards` | Suggested next |
| `getAllKnowledgeRelationships` | All four kinds |
| `canAccessKnowledgeCard` | Prerequisite gate (member-aware) |
| `sparkSuggestedNextCards` | Best next card(s) for this member |
| `resolveLearningPath` | Steps for a curated path |
| `sparkSuggestedLearningPath` | Primary path from current card |

Edges may live in `catalog.relationships` **or** as shortcut arrays on Knowledge Cards — the index merges both.

### Spark Suggested Learning Path™

`SuggestedLearningPathDefinition` — ordered `knowledgeCardIds` with pillar/department/drawer scope. Curated in data; personalized at runtime using completed cards and Growth Profile.

---

## Competency framework

**Scaffold:** `lib/sparkCompetencyFramework/`  
**Graph engine:** `lib/momentumInstitute/knowledgeArchitecture/competencyGraph.ts`

Competencies form a **tree**, not a point list:

```
Pricing
├── Business Strategy
├── Communication
├── Confidence
└── Sales

Leadership
├── Communication
├── Delegation
└── Decision Making

Executive Function
├── Planning
├── Prioritization
└── Focus
```

### Competency levels (capability — not points)

`Exploring` → `Understanding` → `Practicing` → `Applying` → `Confident` → `Mastering` → `Mentoring`

Growth Profile™ updates **automatically** on learning completion — no permission prompt.

### Graph APIs

| Function | Purpose |
|----------|---------|
| `buildCompetencyGraph` | Full tree from catalog |
| `getChildCompetencies` | Direct children |
| `getAncestorCompetencies` | Parent chain |
| `getCompetenciesForKnowledgeCard` | What a card develops |
| `findStrengtheningOpportunities` | Quiet “what still needs work” signal |
| `expandCompetencyTree` | Subtree from a root |

---

## Learning experiences

### Phase 3 core types

Not every Knowledge Card offers every type — availability is **data-driven**:

| Type | Typical use |
|------|-------------|
| Business Mastery Minute™ | 5–8 minute grounding |
| Deep Lesson™ | Longer concept exploration |
| Business Lab™ | Hands-on implementation |
| Simulation™ | Practice difficult situations |
| Apprenticeship™ | Multi-week guided development |
| Challenge™ | Real-world practice |
| Strategy Collection™ | Frameworks and methods |
| Reflection™ | Personal insight / journaling |
| Coaching Session™ | Apply with Shari |
| Apply To My Business™ | Personalized implementation |

**Extended types** (time-slot flexibility): Guided Lesson™, Deep Workshop™, Thinking Gym™

### Learning cycle (every topic)

```
Discover → Learn → Reflect → Make It Mine™ → Coach With Shari™
→ Apply In My Business → Return & Share Results → Evidence Vault™ → Growth Profile™
```

**Lifecycle:** `lib/momentumInstitute/lifecycle.ts`  
**Permission gates:** Make It Mine™, Coach With Shari™, Evidence Vault™  
**Automatic:** Growth Profile™

### Time-respecting offers

`lib/momentumInstitute/timeAvailability.ts` maps member-available time to experience types.

---

## Personal learning ecosystem

Every meaningful learning experience can connect to:

| Destination | Behavior |
|-------------|----------|
| My Institute Cabinet™ | Curated archive — references only |
| Journal™ | Reflections linked to lessons |
| Make It Mine™ | Personalized implementation with Shari |
| Evidence Vault™ | Real-world results — **permission required** |
| Growth Profile™ | Auto-updated competencies |
| Portfolio™ | Tangible business assets from learning |

**Module:** `lib/momentumInstitute/ecosystemLinks.ts`

---

## Folder structure

```
companion-app/
├── docs/
│   └── MOMENTUM_INSTITUTE_ARCHITECTURE.md     ← this document
├── lib/
│   ├── sparkCompetencyFramework/              ← Pillars, levels, perspectives (v1.0)
│   │   ├── types.ts
│   │   ├── competencyFrameworkV1.ts             ← 4 pillars, 44 depts, ~70 drawer seeds
│   │   └── index.ts
│   ├── sparkMomentumInstitute/                  ← Catalog type contracts (T-spec)
│   │   ├── types.ts                             ← Hierarchy, cards, experiences, metadata
│   │   └── index.ts
│   └── momentumInstitute/                       ← Runtime engine
│       ├── knowledgeArchitecture/               ← Phase 3 — Spark Knowledge Architecture™
│       │   ├── types.ts                         ← Runtime types, scale targets
│       │   ├── catalogIndex.ts                  ← O(1) indexed catalog
│       │   ├── relationshipEngine.ts            ← Graph + paths
│       │   ├── competencyGraph.ts               ← Competency tree
│       │   ├── placement.ts                     ← Breadcrumb / placement
│       │   └── index.ts
│       ├── catalog/
│       │   ├── provider.ts                      ← setInstituteCatalogProvider()
│       │   └── testCatalog.ts                   ← Structural test seed only
│       ├── experienceResolver.ts
│       ├── lifecycle.ts
│       ├── learningExperienceStore.ts
│       ├── growthProfileStore.ts
│       ├── cabinetStore.ts
│       ├── makeItMine.ts
│       ├── evidenceBridge.ts
│       ├── journalBridge.ts
│       ├── instituteOrchestrator.ts
│       ├── timeAvailability.ts
│       ├── ecosystemLinks.ts
│       ├── instituteRegistry.ts
│       ├── types.ts                             ← Member runtime state
│       └── index.ts                             ← Public API
```

---

## Scale strategy

### Targets (no redesign beyond)

| Asset | Target |
|-------|--------|
| Drawers | 500+ |
| Knowledge Cards | 5,000+ |
| Learning assets (experiences + worksheets + …) | 10,000+ |

### Design choices for scale

1. **Flat catalog arrays + indexed maps** — not nested JSON trees that require full reload per edit.
2. **Id references everywhere** — experiences, relationships, competencies link by id.
3. **Provider pattern** — `setInstituteCatalogProvider()` swaps CMS, JSON, or API without engine changes.
4. **No lesson bodies in engine** — content addressable by id + version; MVC retrieval later via Context Strategy.
5. **Intelligence-ready hooks** — every object carries `IntelligenceReadyHooks` (`originatedFromId`, `connectionIds`, etc.).

### Loading production catalog (future)

```typescript
import { setInstituteCatalogProvider } from "@/lib/momentumInstitute";

setInstituteCatalogProvider({
  load: () => fetchFromCmsOrApi(),
});
```

---

## Growth intelligence

The architecture enables Spark to eventually know — quietly, without surveillance:

| Question | Source |
|----------|--------|
| What has the member learned? | `MemberGrowthProfile.completedLearning` |
| What have they applied? | Evidence Vault™, Portfolio™ refs |
| What competencies have developed? | `MemberGrowthProfile.competencies` |
| What still needs strengthening? | `findStrengtheningOpportunities()` |
| What should come next? | `sparkSuggestedNextCards()`, learning paths, relationships |

**Not gamification:** no points, streaks, or collectible badges. Capability progression only.

---

## Expansion plan

### V1 — Foundation (current)

- [x] Hierarchy types and catalog bundle
- [x] Knowledge Card metadata envelope
- [x] Relationship engine + learning paths
- [x] Competency graph
- [x] Indexed catalog for scale
- [x] Experience resolver + lifecycle
- [x] Growth Profile, Cabinet, Evidence bridges
- [x] Pillar scaffold (44 departments, ~70 example drawers)
- [x] **Spark Curriculum Master Index™** (Phase 4) — [SPARK_CURRICULUM_MASTER_INDEX.md](./SPARK_CURRICULUM_MASTER_INDEX.md)
- [ ] Production CMS / JSON catalog loader
- [ ] Drawer UI wired to catalog provider

### V2 — Content pipeline

- Knowledge Card authoring tool / CMS integration
- Bulk import validation (schema + relationship integrity)
- Versioning and publish workflow per card
- Worksheet and asset types as first-class learning assets

### V3 — Personalization

- Business Brain™ retrieval before re-asking
- Quiet path personalization from Growth Profile + business stage
- Capability Graph integration
- Companion-led “what might help next” using relationship engine + strengthening opportunities

---

## Interfaces summary

### Catalog provider

```typescript
type InstituteCatalogProvider = {
  load(): MomentumInstituteCatalog;
  reload?(): MomentumInstituteCatalog;
};
```

### Public engine entry

```typescript
import {
  setInstituteCatalogProvider,
  getCatalogIndex,
  resolveKnowledgeCardPlacement,
  sparkSuggestedNextCards,
  sparkSuggestedLearningPath,
  getCompetencyGraph,
  beginInstituteExperience,
} from "@/lib/momentumInstitute";
```

### Intelligence registry

Registered in `lib/intelligence/INTELLIGENCE_REGISTRY.md`:

- `knowledge-card`
- `institute-learning-experience`
- `institute-cabinet-item`
- `institute-growth-profile`
- `institute-evidence-opportunity`
- `momentum-institute` engine

---

## Related specs

- Spark Competency Framework™ v1.0 — `lib/sparkCompetencyFramework/`
- Entrepreneurial Transformation Constitution™ — Spec 100
- Experience Patterns™ — T-005
- Ecosystem Connection Framework™ — T-014
- Intelligence-Ready Architecture — `lib/intelligence/intelligenceReadyTypes.ts`

---

*The room is complete. The drawers are opening. This architecture is the permanent foundation every future lesson will stand on.*
