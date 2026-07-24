# Shari Cognitive Intelligence Architecture

**Status:** Binding runtime architecture  
**Module SoT:** `lib/shariAnswerFirst/`  
**Pipeline entry:** `runShariCognitivePipeline()` in `cognitivePipeline.ts`

This document maps the production cognitive path. It does **not** replace:

- [SHARI_ANSWER_FIRST_GENERAL_HELP_STANDARD.md](./SHARI_ANSWER_FIRST_GENERAL_HELP_STANDARD.md)
- [SHARI_CORE_CONVERSATION_INTELLIGENCE_STANDARD.md](./SHARI_CORE_CONVERSATION_INTELLIGENCE_STANDARD.md)

Those remain the product standards. This file is the **orchestration map**.

---

## Product standard

For business, planning, learning, decision-making, creation, and execution, Shari should usually provide a more valuable response than a fresh general-purpose AI — by combining strong general reasoning with Estate context, continuity, judgment, and the ability to help the member act.

She must never be weaker because she is inside Spark Estate.

---

## Canonical pipeline

```text
Incoming User Message
        ↓
Conversation Thread Binding   (conversationContinuity.ts)
        ↓
Request Understanding           (decideShariResponse.ts)
        ↓
Professional Role Selection     (professionalRoles.ts)
        ↓
Relevant Context Retrieval      (contextResolver.ts)
        ↓
Question Policy                 (questionPolicy.ts)
        ↓
Reasoning Plan                  (reasoningPlan.ts)
        ↓
Wisdom Plan                     (wisdomPlan.ts)
        ↓
Response Composition            (responseComposer.ts)
        ↓
Response Strategy + Hints       (chatHint + composition + wisdom → promptHints)
        ↓
Draft Response                  (/api/companion-chat)
        ↓
General-AI Baseline Review      (generalAiBaseline.ts)
        ↓
Substance + Excellence + Delight (conversationExcellence.ts · conversationDelight.ts)
        ↓
Model Repair (bounded) → local fail-safe last
        ↓
Final Response + Thread Store
        ↓
Optional One Capability Offer / Handoff
```

Phase 2 docs: [SHARI_RESPONSE_COMPOSER.md](./SHARI_RESPONSE_COMPOSER.md) · [SHARI_WISDOM_LAYER.md](./SHARI_WISDOM_LAYER.md) · [SHARI_CONVERSATION_DELIGHT_STANDARD.md](./SHARI_CONVERSATION_DELIGHT_STANDARD.md)

**Production wiring:** `app/companion/CompanionPageClient.tsx` `handleSend` calls `runShariCognitivePipeline` every send, injects `promptHints`, suppresses route-before-answer when required, then runs excellence evaluation after the API reply.

---

## Source of truth by responsibility

| Responsibility | Canonical SoT | Do not duplicate |
|---|---|---|
| Help mode / answer-first decision | `decideShariResponse` → `ShariResponseDecision` | Parallel routers that invent help modes |
| Cognitive extension | `ShariCognitiveDecision` via `buildShariCognitiveDecision` | Second decision engine |
| Help-thread continuity | `lib/shariAnswerFirst/conversationContinuity.ts` | Confusing with `lib/conversationContinuity/*` (workflow ownership) |
| Relevant context | `resolveRelevantUserContext` | Dumping full profile into every prompt |
| Professional roles | `selectProfessionalRoles` | Member-facing role pickers |
| Question policy | `evaluateQuestionPolicy` | Ad-hoc “ask first” prompts |
| Reasoning plan | `buildReasoningPlan` | Topic-specific mini-engines |
| Substance validation | `validateShariAnswerSubstance` | Per-destination validators for ordinary help |
| Excellence + baseline | `validateConversationExcellence` · `reviewAgainstGeneralAiBaseline` | Second scoring system |
| Capability offers / handoffs | `capabilityOffers.ts` · `conversationHandoff.ts` | Second handoff registry |
| Observability | `trackShariAnswerFirstEvent` | Member-visible classifications |

---

## Production message path (before → after)

**Before (route-first risk):** many early interceptors could open Create / Research / Projects / Strategy / estate menus, or ask profiling questions, before a substantive chat answer.

**After (cognitive):**

1. `runShariCognitivePipeline(trimmed)`
2. `answerFirstPreferChat` / block immediate open from decision + follow-up
3. Local follow-up adaptations only when API would restart
4. API with combined cognitive hints
5. Substance + excellence validation; repair if weaker than general AI or asks for known context
6. Store enriched thread (role, assumptions, corrections, context keys)

---

## Conversation isolation (binding)

Help-thread state (`companion-shari-conversation-thread-v1`) is **scoped by `conversationId`**.

| Reset path | Clears Shari help-thread | Clears ActiveTopic | Rotates conversationId |
|---|---|---|---|
| New Chat (`resetActiveConversation` mode `new-chat`) | Yes | Yes | Yes |
| New Day (`resetActiveConversation` mode `new-day`) | Yes | Yes | Yes |
| Hard conversation reset (same core) | Yes | Yes | Yes |

If `resolveShariConversationThread(currentId)` sees a stored thread with a different `conversationId`, it **rejects**, clears the stale key, and logs `stale_thread_rejected`.

Approved Business Estate / profile facts are **not** cleared — only active conversational continuity.

## Deprecation / consolidation notes

| Item | Status |
|---|---|
| Topic-only local how-to engines as primary architecture | Demoted — fail-safes / adapted follow-ups are safety nets only |
| Parallel “answer-first v2” packages | Forbidden — extend `lib/shariAnswerFirst/` |
| Full Business Estate dump in chat | Forbidden — ranked relevant context only |
| `lib/conversationContinuity/*` renamed | No — keep; document naming distinction |
| Global unscoped Shari thread (pre-isolation) | **Retired** — must include `conversationId` |

---

## Related docs

- [SHARI_CONSTITUTION.md](./SHARI_CONSTITUTION.md)
- [SHARI_PROFESSIONAL_ROLES.md](./SHARI_PROFESSIONAL_ROLES.md)
- [SHARI_CONTEXT_INTELLIGENCE.md](./SHARI_CONTEXT_INTELLIGENCE.md)
- [SHARI_CONVERSATION_EXCELLENCE_STANDARD.md](./SHARI_CONVERSATION_EXCELLENCE_STANDARD.md)
- [SHARI_PROMPT_HIERARCHY.md](./SHARI_PROMPT_HIERARCHY.md)
- [SHARI_CONVERSATION_EVALUATION_SUITE.md](./SHARI_CONVERSATION_EVALUATION_SUITE.md)

---

## Migration phases

See master prompt Phases 1–8. Current foundation covers Phases 1–5 in shared module form. Chamber specialist synthesis (Phase 6) and full browser excellence suite (Phase 8) continue on this same SoT — no parallel engines.
