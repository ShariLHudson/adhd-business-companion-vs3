# AI Capability Matrix — Spark V4 Internal Orchestration

| Field | Value |
|-------|-------|
| **Audience** | Engineering, founder — **never members** |
| **Status** | V4 foundation document |
| **Principle** | Members experience **Spark**. Not OpenAI, Claude, Gemini, or any provider. |
| **Parent** | [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md) · [006 Response Architecture](../spark-intelligence-foundation/006-spark-response-architecture.md) |

---

## Core rule

> **Spark remains one unified companion. Model choice is an implementation detail.**

Internal systems may route to different **capabilities**. Members see one voice, one relationship, one trust promise.

---

## Capability classes (model-agnostic)

Spark routes by **what the member needs**, not by vendor:

| Capability class | Description |
|------------------|-------------|
| `fast_dialogue` | Low-latency companion turns, clarifications, social warmth |
| `deep_reasoning` | Multi-step business decisions, tradeoffs, strategy |
| `long_context` | Project continuity, large Brain retrieval, document synthesis |
| `web_research` | Current facts, citations, competitor/market scan |
| `deep_research` | Multi-source reports, structured findings (background) |
| `vision` | Image/screenshot/PDF understanding |
| `audio_in` | Voice transcription, tone cues |
| `audio_out` | Founder welcome, TTS, voice companion |
| `code_generation` | Scripts, integrations, automation drafts |
| `structured_output` | JSON plans, tables, asset schemas |
| `creative_writing` | Marketing copy, narrative, warm human voice |
| `math_quant` | Pricing, forecasts, unit economics |
| `safety_review` | Second-pass on sensitive or high-stakes content |

---

## Provider strength matrix (research summary)

*Updated for V4 planning — June 2026. Revisit quarterly.*

### OpenAI (GPT-4o family, o-series reasoning, Whisper, TTS)

| Strength | Spark use |
|----------|-----------|
| Low-latency multimodal dialogue | Default `fast_dialogue`, vision-in-chat |
| Strong tool/function calling | Workspace actions, asset creation hooks |
| Mature reasoning models (o3/o4-class) | `deep_reasoning` when latency budget allows |
| Whisper + TTS | `audio_in` / `audio_out` (Welcome Home, voice input) |
| Broad ecosystem | Primary default when no specialty wins |

| Caution | Mitigation |
|---------|------------|
| Voice can sound generic | Spark Human Voice Rules + hospitality rewrite pass |
| Over-eager problem-solving | Guardrails 106 + Wisdom Layer before delivery |

### Anthropic Claude (Sonnet / Opus class)

| Strength | Spark use |
|----------|-----------|
| Long-context document work | Business Brain synthesis, project threads |
| Nuanced, careful prose | `creative_writing`, sensitive coaching copy |
| Strong instruction following | System prompt + constitution adherence |
| Helpful uncertainty | Low-confidence turns, ethical edges |

| Caution | Mitigation |
|---------|------------|
| Slower on some routes | Route only when `long_context` or quality > speed |
| — | Never surface "Claude said…" |

### Google Gemini

| Strength | Spark use |
|----------|-----------|
| Multimodal at scale | Vision, mixed media in Gallery/Create |
| Long context windows | Large asset review |
| Google workspace adjacency | Calendar/Docs/Sheets when member connected |

| Caution | Mitigation |
|---------|------------|
| Variable voice consistency | Always pass through Spark voice normalization |
| — | Workspace features optional — never required for core companion |

### Perplexity (search-native)

| Strength | Spark use |
|----------|-----------|
| Real-time web with citations | `web_research`, fact verification |
| Concise sourced answers | Hidden research prep (Iceberg 118) |

| Caution | Mitigation |
|---------|------------|
| Search-shaped tone | Rewrite to Shari voice before display |
| — | Research surfaces only with permission (106) |

### xAI Grok

| Strength | Spark use |
|----------|-----------|
| Real-time X/social signal | Niche: trending topics, social listening (if enabled) |

| Caution | Mitigation |
|---------|------------|
| Narrow sweet spot | Optional module — not default companion |
| Brand exposure | Internal only |

### Deep research systems (agentic multi-step)

| Strength | Spark use |
|----------|-----------|
| Multi-page synthesis | Background `deep_research` jobs |
| Structured reports | Momentum / strategy prep behind scenes |

| Caution | Mitigation |
|---------|------------|
| Slow, expensive | Never block conversation — Hidden Work only |
| Overwhelming output | Summarize to 3–5 findings in frosted panel |

### Open-source / self-hosted (Llama, Mistral, etc.)

| Strength | Spark use |
|----------|-----------|
| Cost control at scale | Batch classification, routing, eval |
| Data residency | Future enterprise tier |

| Caution | Mitigation |
|---------|------------|
| Quality variance | Not primary companion voice without eval gate |

---

## Spark capability → routing map

| Spark capability | Primary capability class | Typical provider bias | Fallback |
|------------------|-------------------------|----------------------|----------|
| Companion chat (home) | `fast_dialogue` | OpenAI GPT-4o-class | Claude fast |
| Clarifying question | `fast_dialogue` | Same | Local template |
| Overwhelm / support | `fast_dialogue` + hospitality | Claude or OpenAI | Gold Standard rewrite |
| Marketing copy draft | `creative_writing` | Claude or OpenAI | — |
| Business strategy | `deep_reasoning` | OpenAI o-series or Claude Opus | Shorter dialogue route |
| "What is X?" teaching | `fast_dialogue` | OpenAI | — |
| Market / competitor research | `web_research` | Perplexity | OpenAI browsing |
| Deep market report | `deep_research` | Background agent | Short summary to member |
| Brain / project recall | `long_context` | Claude or Gemini | MVC retrieval only |
| Create™ asset structure | `structured_output` | OpenAI tools | — |
| Code / automation | `code_generation` | OpenAI or Claude | — |
| Image understanding | `vision` | GPT-4o / Gemini | Ask member to describe |
| Voice input | `audio_in` | Whisper | Browser STT |
| Founder welcome | `audio_out` | Pre-recorded + TTS | Text-only |
| Pre-delivery eval | `safety_review` | Fast classifier model | Rule-based lint |
| Routing classification | `fast_dialogue` (tiny) | Small model / local | Keyword router |

---

## Where Spark routes vs stays model-agnostic

### Route internally (provider selection allowed)

- Research depth (quick fact vs deep report)
- Reasoning depth (clarify vs strategic synthesis)
- Context window size (session vs full project)
- Vision/audio modalities
- Background jobs vs synchronous reply
- Evaluator second pass

### Stay model-agnostic (Spark-owned)

- All member-facing copy
- Conversation state machine (107)
- Guardrails (106)
- Hospitality (111)
- Memory permission (112)
- Discovery introductions
- Error messages
- Workspace transitions
- Shari voice (Human Voice Rules)

---

## Orchestration pipeline (V4 target)

Aligns with [006 Response Architecture](../spark-intelligence-foundation/006-spark-response-architecture.md):

```
Member message
    ↓
Performance & Routing (09) — route type + budget
    ↓
Capability selector — matrix lookup
    ↓
Provider adapter(s) — one or more capability calls
    ↓
Spark merge layer — single draft, Brain context injected
    ↓
Wisdom Loop (130) — invisible
    ↓
Response Evaluation (010 + V4) — score before delivery
    ↓
Human voice pass — banned phrase lint
    ↓
Member sees ONE Spark response
```

### Provider adapter contract

```ts
type CapabilityRequest = {
  capability: CapabilityClass;
  objective: string;
  contextMvc: SparkContextBundle;
  maxLatencyMs: number;
  allowTools: boolean;
};

type CapabilityResult = {
  draft: string;
  structured?: unknown;
  citations?: Citation[];
  confidence: "high" | "medium" | "low";
  providerId: string; // internal only — never logged to member UI
};
```

---

## Unified experience rules

1. **Never** name a model in member UI, copy, or errors.
2. **Never** ask members to choose a model.
3. **Never** show routing debug in production.
4. **Always** normalize tone through Spark voice layer.
5. **Always** evaluate before delivery ([CONVERSATION_TEST_FRAMEWORK.md](./CONVERSATION_TEST_FRAMEWORK.md)).
6. **Prefer** fast useful over slow perfect ([09 Routing](../spark-intelligence-foundation/09-spark-performance-routing-engine.md)).
7. **Background** deep work — Iceberg (118) — never block the reply.

---

## Cost & latency tiers

| Tier | Budget | Capability mix |
|------|--------|----------------|
| Instant | < 2s | `fast_dialogue` only |
| Guided | 2–8s | dialogue + light Brain retrieval |
| Strategic | 8–25s | + `deep_reasoning` or `web_research` |
| Background | async | `deep_research`, asset prep, eval |

Member sees calm progress only when necessary — never token counts or model names.

---

## Evaluation hooks

Every routed call logs internally (founder/dev only):

| Field | Purpose |
|-------|---------|
| `capability` | Matrix audit |
| `providerId` | Cost/quality tuning |
| `latencyMs` | Speed gate |
| `evalScore` | Pre-delivery pass/fail |
| `fallbackUsed` | Reliability |

---

## Implementation notes

| Milestone | Deliverable |
|-----------|-------------|
| M1 | `lib/aiOrchestration/types.ts` — capability enums |
| M2 | `lib/aiOrchestration/capabilityMatrix.ts` — static table |
| M3 | `lib/aiOrchestration/router.ts` — integrates OS 09 |
| M4 | Provider adapters behind interface |
| M5 | Eval gate refuses low-score drafts |

---

## Review cadence

- **Quarterly:** Re-score provider strengths; update matrix
- **After incidents:** Hallucination / voice failures → routing adjustment
- **Never:** Member-facing announcement of provider changes

---

## Related

- [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md)
- [09 Performance & Routing](../spark-intelligence-foundation/09-spark-performance-routing-engine.md)
- [10 Response Evaluation](../spark-intelligence-foundation/10-spark-response-evaluation-engine.md)
- [SPARK_HUMAN_VOICE_RULES.md](./SPARK_HUMAN_VOICE_RULES.md)
