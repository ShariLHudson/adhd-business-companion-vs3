# Shared Capability Library — Implementation (131–140)

**Status:** Foundation complete  
**Law:** Do not implement GPTs. Capabilities are composable, reusable, and hidden behind one Spark companion.

---

## What shipped

### Architecture docs (Estate `NNN_*`)

| Doc | Path |
|-----|------|
| 131 Overview | `library/131_SHARED_CAPABILITY_LIBRARY_OVERVIEW.md` |
| 132 Model | `library/132_SHARED_CAPABILITY_MODEL.md` |
| 133 Thinking | `library/133_THINKING_CAPABILITIES.md` |
| 134 Creative | `library/134_CREATIVE_CAPABILITIES.md` |
| 135 Knowledge | `library/135_KNOWLEDGE_CAPABILITIES.md` |
| 136 Relational | `library/136_RELATIONAL_CAPABILITIES.md` |
| 137 Life flow | `library/137_LIFE_FLOW_CAPABILITIES.md` |
| 138 Composition | `library/138_CAPABILITY_COMPOSITION_ENGINE.md` |
| 139 Facade | `library/139_COMPANION_CAPABILITY_FACADE.md` |
| 140 Index | `library/140_SHARED_CAPABILITY_LIBRARY_INDEX.md` |
| 140 Build order | `library/140_CAPABILITY_LIBRARY_BUILD_ORDER.md` |
| 151 Runtime architecture | `library/151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md` |

> Note: Estate 132–140 were **missing** on disk (SIOS `SPARK-132`–`140` are different). This series was authored from 131’s capability list + Companion Over Features (093).

### Runtime — `lib/sparkSharedCapabilities/`

| Module | Role |
|--------|------|
| `types.ts` | Capability + composition contracts |
| `catalog.ts` | 12 shared capabilities |
| `detect.ts` | Utterance + room → signals |
| `compose.ts` | Recipes + composition engine |
| `facade.ts` | One-companion API · anti-GPT guards |
| `index.ts` | Public exports |
| `sparkSharedCapabilities.test.ts` | Acceptance tests |

### Companion entry point

```ts
import { resolveCompanionCapabilityHelp } from "@/lib/sparkSharedCapabilities";

const help = resolveCompanionCapabilityHelp({
  userText,
  visualRoom,
  activeRecognitionFlowKind,
});
// help.speak / help.promptHint — never GPT names
```

---

## Capability catalog

decision_making · planning · problem_solving · strategy · brainstorming · content_creation · research · learning · reflection · communication · organization · celebration

---

## Explicit non-goals (honored)

- No GPT products or GPT navigation
- No capability marketplace UI
- No recognition room rebuilds
- Does not replace `companionCapabilityRegistry` (section adapters remain)

---

## Relationship to other systems

| System | Relationship |
|--------|--------------|
| Wisdom Layer 120–131 (SIOS-style specs in app) | Orthogonal — wisdom is judgment; shared capabilities are skills |
| `companionCapabilityRegistry` | Optional soft adapters (Create, Decision Compass, …) |
| `sparkRecognitionEngine` | Celebration / reflection compose with recognition flows |
