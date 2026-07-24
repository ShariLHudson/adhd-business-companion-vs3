# Shari Response Composer

**Runtime SoT:** `lib/shariAnswerFirst/responseComposer.ts`  
**Entry:** `composeShariResponseStrategy(...)`  
**Pipeline:** after wisdom plan, before API generation (`runShariCognitivePipeline`)

The composer does **not** write the final answer. It produces `ShariResponseComposition` that guides generation and repair.

## Contract highlights

- `openingApproach` — begin with value (principle, recommendation, diagnosis, reflection…)
- `primaryResponseShape` — step-by-step, decision brief, consulting recommendation, coaching exchange…
- `answerSequence` — required section purposes by role
- Practical-value flags — insight, example, mistake, shortcut, personalized application, recommendation
- Cognitive-load limits — max sections, one question, one capability offer
- `endingApproach` + `forbiddenPatterns`

## Role-specific behavior

See [SHARI_PROFESSIONAL_ROLES.md](./SHARI_PROFESSIONAL_ROLES.md). Composer maps role → opening/shape/sections.

## Prompt integration

`responseCompositionHintForChat(composition, wisdom)` is included in `promptHints`.

## Deprecation

Topic-specific hardcoded answers are **not** the composition layer. Local fail-safes remain last-resort only after model repair.
