# Spark Core Intelligence v1.0 — Trust & Performance Engine

**Correct · Fast · Trustworthy · Focused**

| Implementation | `lib/sparkCoreIntelligence/trustPerformanceEngine/` |
| Status | v1.0 scaffold — not wired to companion UI |

## Core Four

1. Correctness  
2. Speed  
3. Trust  
4. Focus  

## Performance targets

| Stage | Target |
|-------|--------|
| Intent detection | &lt; 100 ms |
| First visible | &lt; 750 ms |
| Simple (L1) | ~1 s |
| Standard (L2–3) | 2–4 s |
| Deep (L4–5) | Stream immediately; research may background |

## API

```ts
import { runCoreTrustPerformance } from "@/lib/sparkCoreIntelligence/trustPerformanceEngine";

const result = runCoreTrustPerformance({
  turnId: "t1",
  threadId: "thread-1",
  memberMessage: "What is churn rate?",
}, { draftText: "optional for egress" });
```

**Status:** v1.0
