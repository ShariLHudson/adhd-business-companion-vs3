# 140_SHARED_CAPABILITY_LIBRARY_INDEX

# Spark Estate™
## Shared Capability Library Index (131–140)

**Status:** Architecture + runtime foundation  
**Runtime:** `lib/sparkSharedCapabilities/`  
**Law:** Do not implement GPTs. One companion. Composable skills.

---

## Document map

| # | Document | Focus |
|---|----------|-------|
| 131 | Shared Capability Library Overview | Vision — reusable skills, one companion |
| 132 | Shared Capability Model | Contract, anti-GPT law, registry relationships |
| 133 | Thinking Capabilities | Decision · Planning · Problem solving · Strategy |
| 134 | Creative Capabilities | Brainstorming · Content creation |
| 135 | Knowledge Capabilities | Research · Learning |
| 136 | Relational Capabilities | Reflection · Communication |
| 137 | Life Flow Capabilities | Organization · Celebration |
| 138 | Capability Composition Engine | Primary + supports, recipes, output contract |
| 139 | Companion Capability Facade | Hide skills behind Spark |
| 140 | This index | Catalog + implementation map |
| 140 | [Capability Library Build Order](./140_CAPABILITY_LIBRARY_BUILD_ORDER.md) | Ordered build steps for 131–140 |
| **151** | [Spark Companion Runtime Architecture](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) | Full companion turn pipeline (capabilities → composition → facade → response) |

**Build order:** [140_CAPABILITY_LIBRARY_BUILD_ORDER.md](./140_CAPABILITY_LIBRARY_BUILD_ORDER.md)  
**Runtime map:** [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md)

---

## Capability catalog (12)

| Id | Spec | Category |
|----|------|----------|
| `decision_making` | 133 | thinking |
| `planning` | 133 | thinking |
| `problem_solving` | 133 | thinking |
| `strategy` | 133 | thinking |
| `brainstorming` | 134 | creative |
| `content_creation` | 134 | creative |
| `research` | 135 | knowledge |
| `learning` | 135 | knowledge |
| `reflection` | 136 | relational |
| `communication` | 136 | relational |
| `organization` | 137 | life_flow |
| `celebration` | 137 | life_flow |

---

## Runtime modules

| File | Role |
|------|------|
| `types.ts` | Capability + composition types |
| `catalog.ts` | The 12 capabilities |
| `compose.ts` | Composition engine + recipes |
| `detect.ts` | Utterance → capability signals |
| `facade.ts` | Companion-facing API (no GPT exposure) |
| `index.ts` | Public exports |
| `*.test.ts` | Acceptance tests |

---

## Explicit non-goals

- Implementing ChatGPT / custom GPT products
- Exposing a capability picker UI as the primary experience
- Replacing `companionCapabilityRegistry` section routing (adapters remain)
- Rebuilding recognition rooms

---

## Namespace note

Estate `NNN_*` (this series) ≠ SIOS `SPARK-NNN_*`. Do not substitute SIOS 132–140 for these documents.
