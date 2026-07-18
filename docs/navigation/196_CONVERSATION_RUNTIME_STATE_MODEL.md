# 196 — Conversation Runtime State Model

**Status:** Implemented · Stored on Talk It Out session as `cieState`

## Contract

`ConversationRuntimeState` in `lib/conversationIntelligenceEngine/types.ts`

Holds operational context only — never hidden chain-of-thought.

## Key fields

- `topicAnchor` / `currentFocus` — TCAI-aligned
- `knownFacts` — user-said only
- `userCorrections` / `rejectedInterpretations`
- `clarificationState`
- `retrievedExamples` / `previousAssistantMove`
- `qualityHistory` — pass / regenerated / fallback

## Migration

`runtimeStateFromThinkingMap()` bridges existing Talk It Out Thinking Maps into CIE state without requiring a cold start.
