# Spark Core Intelligence v1.0 — Memory & Personalization Engine

**Remember the right things — not everything.**

| Implementation | `lib/sparkCoreIntelligence/memoryEngine/` |
| Status | v1.0 scaffold — not wired to companion UI |

## Memory types

| Type | Purpose |
|------|---------|
| `short_term_conversation` | Recent thread context — expires |
| `long_term_business` | Business name, industry, offers, brand voice, decisions |
| `communication_preference` | Tone, response length |
| `project` | Active projects |
| `goal` | Goals and milestones |
| `relationship` | Clients, partners (only when intentionally shared) |
| `learning` | Learning style |
| `estate` | Preferred rooms, favorite workflows |
| `founder` | Operator scope — never mixed with member memory |

## Rules

- User controls memory (review, edit, delete, export)
- Never creepy — confirm important changes
- Never infer too much — block speculation and unsupported assumptions
- Use memory to reduce repeated questions, not to overpersonalize

## API

```ts
import { runCoreMemory } from "@/lib/sparkCoreIntelligence/memoryEngine";

const result = runCoreMemory({
  turnId: "t1",
  threadId: "thread-1",
  userId: "user-1",
  memberMessage: "My audience is women entrepreneurs.",
});
```

**Status:** v1.0
