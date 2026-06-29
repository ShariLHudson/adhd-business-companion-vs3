# Spark Core Intelligence v1.0 — Executive Discipline Orchestrator

**The right expertise behind one voice.**

| Implementation | `lib/sparkCoreIntelligence/disciplineOrchestrator/` |
| Status | v1.0 scaffold — not wired to companion UI |

## Disciplines (v1.0)

Marketing · Sales · Strategy · Wordsmith · Research · Finance · Operations · Leadership · Creative Direction · Customer Experience · AI & Automation · Product Development · Learning Coach

## Activation examples

| Scenario | Disciplines |
|----------|-------------|
| Marketing campaign | Marketing + Strategy + Wordsmith + Creative Direction |
| Pricing decision | Finance + Strategy + Marketing + Sales |
| Sales call | Sales + Research + Wordsmith + Customer Experience |
| Overwhelm | Conversation + Focus Support only |
| Launch | Strategy + Marketing + Sales + Wordsmith + Operations + Creative Direction |
| Research | Research + Observatory; Strategy if decision needed |

## Rules

- One unified recommendation — never a panel of experts
- Conflicts resolved internally; tradeoffs explained simply
- Raw discipline outputs hidden unless `exposeDisciplines: true`
- More disciplines ≠ better answer — hard caps per scenario

## API

```ts
import { runExecutiveDisciplineOrchestrator } from "@/lib/sparkCoreIntelligence/disciplineOrchestrator";

const result = runExecutiveDisciplineOrchestrator({
  turnId: "t1",
  threadId: "thread-1",
  memberMessage: "Help me plan a marketing campaign.",
});
```

**Status:** v1.0
