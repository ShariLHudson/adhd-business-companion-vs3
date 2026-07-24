# Next Thinking Move

**Runtime:** `lib/strategyChamber/intelligence/engine/selectNextThinkingMove.ts` · `selectNextQuestion.ts`

## Purpose

Every turn answers three internal questions:

1. What do we know?
2. What is still unclear?
3. What is the single best next thinking move?

## Not a second stage system

Moves map onto the existing `StrategicJudgmentStage` backbone. They do not replace it.

## Move selection inputs

- Current backbone stage
- Known vs missing information
- Statement analysis (nature)
- Evidence strength
- Option readiness
- Decision readiness
- Whether the last answer was “I don’t know”
- Whether options would be premature
- Whether another destination is more appropriate (handoff later)

Adaptive Companion preferences affect **presentation** (choice count, pacing), not which move is due.

## One-question rule

`selectNextQuestion` returns one primary question (or a reflection). Questions must be specific, justified, forward-moving, non-compound, jargon-light, and open-ended. Do not ask for known information. Do not ask merely to fill a record field.

## “I don’t know” behavior

Do not repeat the same question. Prefer: simpler rephrase, one example, up to three contextual choices, a smaller question, a tentative reflection, free talking, or temporary skip. When choices are shown, include paths like Something else / I’d rather explain it / Skip for now (subject to Adaptive choice limits).

## Priority order (ask only what is still needed)

Clarify question → what changed → desired result → what to protect → constraints → capacity → evidence vs assumption → concern/opportunity → options → trade-offs → risk/reversibility → decide/test/wait → handoff → review.
