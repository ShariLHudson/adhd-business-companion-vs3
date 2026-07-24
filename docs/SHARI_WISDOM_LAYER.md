# Shari Wisdom Layer (Conversation Composition)

**Runtime SoT:** `lib/shariAnswerFirst/wisdomPlan.ts`  
**Entry:** `buildShariWisdomPlan(...)`  
**Related frozen specs:** Wisdom Layer 120–131 remain conversation philosophy — this module is the **cognitive composition** wisdom plan for ordinary chat quality.

## Contract

`ShariWisdomPlan` selects what should distinguish the answer from a generic AI reply:

- key judgment
- highest-leverage insight
- tradeoffs, blind spots, mistakes
- heuristics, shortcuts
- personalized implications (from known context only)
- confidence + uncertainty

## Rules

- Must **not** invent personal history, results, or unsupported expertise
- Personalization must change advice when context exists
- Uncertainty is stated, not hidden

## Inputs

User goal · professional role · relevant context · reasoning plan · active thread (corrections) · research flags

## Prompt integration

Wisdom fields are woven into `responseCompositionHintForChat`.
