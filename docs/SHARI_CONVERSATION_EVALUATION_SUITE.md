# Shari Conversation Evaluation Suite

**Unit SoT:** `lib/shariAnswerFirst/evaluationSet.ts` · `goldenResponseSuite.ts` · `phase2Wisdom.test.ts` · `cognitivePipeline.test.ts` · `conversationContinuity.test.ts` · `shariAnswerFirst.test.ts`  
**Architecture:** [SHARI_COGNITIVE_INTELLIGENCE_ARCHITECTURE.md](./SHARI_COGNITIVE_INTELLIGENCE_ARCHITECTURE.md)  
**Composer / wisdom / delight:** [SHARI_RESPONSE_COMPOSER.md](./SHARI_RESPONSE_COMPOSER.md) · [SHARI_WISDOM_LAYER.md](./SHARI_WISDOM_LAYER.md) · [SHARI_CONVERSATION_DELIGHT_STANDARD.md](./SHARI_CONVERSATION_DELIGHT_STANDARD.md)

---

## Required scenarios (automated + browser)

| # | Scenario | Expect |
|---|---|---|
| 1 | Loom how-to | Immediate steps; teacher; no “what feels hardest?” |
| 2 | Loom follow-up “for Spark Estate” | Continuity; adapted advice |
| 3 | Craft booth how-to | Consultant/teacher; uses known products when present |
| 4 | “What should go on the table?” | Bound to booth thread |
| 5 | Product correction | Thread correction overrides prior note |
| 6 | $600 booth advice | Advisor judgment, not empty pros/cons |
| 7 | How to create strategic plan | Teach in chat |
| 8 | Create the strategic plan | Formal creation path still works |
| 9 | Facebook groups methodology | Stable method in chat |
| 10 | Current active groups | Research / honest sourcing |
| 11 | Overwhelm | Coach, not information dump |
| 12 | Then “step by step” | Shift to teach |
| 13 | QR won’t scan | Ordered troubleshooting |
| 14 | Weak menu/profiling reply | Excellence fails → repair |

## Browser checklist

If authenticated browser validation is not run in CI, use the manual checklist in the Cognitive Intelligence master prompt §26 and report each scenario Pass/Fail separately.

## Scoring

`validateConversationExcellence` → `score` 0–10, `excellent` when ≥8 with baseline match/beat and known-context respect.
