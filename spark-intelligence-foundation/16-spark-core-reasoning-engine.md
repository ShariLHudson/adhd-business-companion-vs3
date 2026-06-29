# Spark Core Intelligence v1.0 — Reasoning Engine

**Think clearly. Simplest path. Correct useful answer.**

| Implementation | `lib/sparkCoreIntelligence/reasoningEngine/` |
| Status | v1.0 scaffold — not wired to companion UI |

## Reasoning modes

quick_answer · coaching · planning · creative_reasoning · strategic_reasoning · decision_support · research_reasoning · executive_board_reasoning · reflective_reasoning · teaching_reasoning

## Pre-response analysis (9 questions)

Encoded in `ReasoningPlan`: accomplishing, success, known, missing, problem nature, research, disciplines, confidence, best next step.

## API

```ts
import { processReasoning } from "@/lib/sparkCoreIntelligence/reasoningEngine";

const { plan, readyToCompose } = processReasoning({
  turnId: "t1",
  memberMessage: "...",
  knownFacts: [],
});
```

**Status:** v1.0
