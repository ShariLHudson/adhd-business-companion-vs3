# 186 — Conversation Quality & Rhythm Intelligence (CQRI)

**Source:** `186_CURSOR_CONVERSATION_QUALITY_AND_RHYTHM_INTELLIGENCE.md`  
**Status:** Implemented · **Do not deploy** until authenticated scenarios meet 12/10.

## Purpose

Final shared layer after RCI / CI / CRCI:

1. Is the response good enough to send?  
2. How much should Shari say?  
3. Ask, observe, summarize, explain, or pause?

## Conversation phases (invisible)

| Phase | Pace |
|-------|------|
| **Opening** | One thoughtful question welcome |
| **Exploration** | Normal ask / observe rhythm |
| **Discovery** | Prefer observation + short summary of *their* insights |
| **Completion** | Brevity, invitation to continue, soft completion check — not a new interview |

Detected in `conversationPhase.ts`; shapes rhythm + telemetry.

## Turn order (Talk It Out)

1. Understand intent  
2. Explicit help  
3. CRCI repair  
4. RCI reflective reasoning  
5. Situation lead  
6. CI delivery  
7. **CQRI rhythm**  
8. **CQRI quality gate**  
9. Send only if approved (else regenerate → safe fallback)

## Architecture

| Piece | Path |
|-------|------|
| Types | `lib/conversationQualityRhythmIntelligence/types.ts` |
| Rhythm selector | `rhythmSelector.ts` |
| Length | `lengthSelector.ts` |
| Question frequency | `questionFrequency.ts` |
| Observation vs question | `observationVsQuestion.ts` |
| Completion rhythm | `completionRhythm.ts` |
| Quality gate | `qualityGate.ts` |
| Safe fallback | `safeFallback.ts` |
| Telemetry | `telemetry.ts` |
| API | `api.ts` → `runConversationQualityAndRhythm()` |

**First consumer:** `lib/talkItOut/reflectiveEngine.ts`

## Tests

`lib/conversationQualityRhythmIntelligence/cqri.test.ts`

## Deploy

**Do not deploy** until authenticated certification in the package passes.
