# 140_CAPABILITY_LIBRARY_BUILD_ORDER

# Spark Estate™
## Capability Library Build Order

**Series:** 131–140 (+ runtime 151)  
**Law:** Do not implement GPTs. Convert architecture into reusable capabilities behind one companion.

**Related:**
- [131_SHARED_CAPABILITY_LIBRARY_OVERVIEW.md](./131_SHARED_CAPABILITY_LIBRARY_OVERVIEW.md)
- [140_SHARED_CAPABILITY_LIBRARY_INDEX.md](./140_SHARED_CAPABILITY_LIBRARY_INDEX.md)
- [151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) — how capabilities sit in the full companion runtime
- [060_CURSOR_IMPLEMENTATION_ORDER.md](./060_CURSOR_IMPLEMENTATION_ORDER.md) — recognition room build order

---

## Build order

| Step | Document / work | Why this order |
|------|-----------------|----------------|
| 1 | 131 Overview | Vision — reusable skills, one companion |
| 2 | 132 Shared Capability Model | Contract + anti-GPT law |
| 3 | 133 Thinking Capabilities | Decision · Planning · Problem solving · Strategy |
| 4 | 134 Creative Capabilities | Brainstorming · Content creation |
| 5 | 135 Knowledge Capabilities | Research · Learning |
| 6 | 136 Relational Capabilities | Reflection · Communication |
| 7 | 137 Life Flow Capabilities | Organization · Celebration |
| 8 | 138 Capability Composition Engine | Primary + supports · recipes |
| 9 | 139 Companion Capability Facade | Hide skills behind Spark |
| 10 | 140 Shared Capability Library Index | Catalog + runtime module map |
| 11 | **151 Spark Companion Runtime Architecture** | Wire capabilities into Conversation → Intent → Recognition → Composition → Facade → Response |

---

## Runtime wiring (after 131–140)

Do **not** change capability contracts when wiring runtime. Follow [151](./151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md):

1. Detect capability signals from member utterance + room
2. Compose via Composition Engine
3. Speak only through Companion Facade
4. Never surface GPT / product names

**Runtime:** `lib/sparkSharedCapabilities/`  
**Integration hint:** `lib/sparkWisdom/buildWisdomPromptHint.ts`
