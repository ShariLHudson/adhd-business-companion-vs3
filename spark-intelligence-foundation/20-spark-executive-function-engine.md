# Spark Executive Function Engine™

**Quiet support — not a separate ADHD feature.**

| Implementation | `lib/sparkCoreIntelligence/executiveFunctionEngine/` |
| Status | v1.0 scaffold — integrates with Conversation Engine |

## Core rule

Spark reduces cognitive load **before** asking the user to do more cognitive work.

## Capabilities

- `executiveFunctionState` detection
- `cognitiveLoadScore`
- `nextStepSimplifier`
- `taskBreakdown`
- `restartRecovery`
- `decisionFatigue` reducer
- Integration bridges: Conversation, Memory, Momentum, Guild, Create, Strategy, Focus/Greenhouse

## API

```ts
import { runExecutiveFunction } from "@/lib/sparkCoreIntelligence/executiveFunctionEngine";

const result = runExecutiveFunction({
  turnId: "t1",
  threadId: "thread-1",
  memberMessage: "I'm overwhelmed.",
});
```

**Status:** v1.0
