# Spark Core Intelligence v1.0 — Conversation Engine

**Implementation spec for `lib/sparkCoreIntelligence/conversationEngine/`.**

| Field | Value |
|-------|-------|
| **Goal** | Understand real objective, respond appropriately, stay on track, move forward without delay |
| **Integrates with** | Spark OS libs · [02-conversation-engine.md](./02-conversation-engine.md) foundation |
| **Status** | v1.0 scaffold — not wired to companion UI |

---

## State machine

`idle` → `understanding` → (`clarifying` | `responding` | `creating` | `researching` | `planning` | `supporting`) → `completed` | `handoff_to_room`

---

## Rules (enforced in code)

- One clarifying question when needed
- No questions when enough information exists
- Never wander from objective (locked after first respond)
- Never overload user (quality scoring + depth selection)
- Simple → simple · Complex → structured · Overwhelm → empathy first · Create → collaborate · Research → scope depth

---

## API

```ts
import { processConversationTurn, createInitialContext } from "@/lib/sparkCoreIntelligence/conversationEngine";

const result = processConversationTurn({
  turnId: "t1",
  memberMessage: "...",
  context: createInitialContext("thread-id"),
  history: [],
}, { draftText: "optional for quality score" });
```

---

## Quality dimensions

objectiveAlignment · clarity · speed · tone · helpfulness · focus · nextStep · overall (pass ≥ 0.72)

---

**Status:** v1.0
