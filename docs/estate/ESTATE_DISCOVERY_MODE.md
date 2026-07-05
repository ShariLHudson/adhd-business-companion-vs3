# Discovery Mode™

**Status:** BINDING · **Runtime:** `lib/estateBrain/discoveryMode.ts`  
**Layers:** Discovery → Coaching → Intent-First Navigation

## Philosophy

Spark should never feel like a menu system. It should feel like an intelligent companion.

**Do not immediately route every request.**

```
Understand goal
        ↓
Understand what prevents success
        ↓
Understand desired outcome
        ↓
Decide best Estate experience
        ↓
Prepare tools quietly
        ↓
Navigate (last)
        ↓
Continue naturally
```

Spark always asks: **"Do I know enough to help well?"**

- **Yes** → begin helping  
- **No** → one more thoughtful question (max 2–4)

## Confidence scoring

| Signal | Weight |
|--------|--------|
| Goal identified | +30% |
| Obstacle identified | +30% |
| Desired outcome identified | +30% |
| Context confirmed | +10% |

At **~90% confidence**, Discovery Mode ends.

## Discovery topics

| Topic | Example trigger | Questions |
|-------|-----------------|-----------|
| **create_sop** | Help me create an SOP | Business or client? · Scratch or existing? · Solo or team? |
| **focus** | I need to focus | What's making it hardest today? → coaching menu |
| **business_growth** | Grow my business | What feels most important? · What would success look like? |
| **research** | Research AI tools… | Quick comparison, landscape, deep report, or monitoring? |

## Examples

### SOP

Member: *Help me create an SOP.*

Spark does **not** open Create immediately. After 2–3 brief questions, Spark prepares template, checklist, screenshot placeholders — then opens Create Studio with SOP Builder ready.

### Focus

Member: *I need to focus.*

Spark asks what is making it hardest. Based on the answer (too many thoughts, can't get started, anxious, etc.), Spark presents a **tailored coaching menu** — then navigates only after the member chooses.

### Research

Member: *Research AI tools for accountants.*

Spark clarifies depth, then routes to Study Hall with the right research level — environment prepared before arrival.

## Rules

- Natural · conversational · brief · intelligent  
- Never unnecessary questions  
- Never questions Spark already knows from memory  
- Never form-filling — **understanding, not data collection**

## Full pipeline

```
User Request
    ↓
Intent
    ↓
Discovery Conversation
    ↓
Confidence Score
    ↓
Capability
    ↓
Expert(s) (invisible)
    ↓
Estate Experience
    ↓
Prepare Environment
    ↓
Navigate
    ↓
Continue Conversation
```

## Runtime API

```typescript
import {
  shouldEnterDiscoveryMode,
  resolveDiscoveryTurn,
  formatDiscoveryQuestion,
} from "@/lib/estateBrain";
```

Wired in `frictionlessActionLayer.ts` as `estate_discovery` — runs **before** coaching and immediate navigation.

## Success criteria

Members never feel like they are filling out forms.

They feel Spark understands them **before** taking action — like an experienced colleague who asks only what truly matters.

By arrival, Spark already knows what they want, what's in the way, and what should be waiting for them.
