# 199 — Gold Standard Conversation Runtime Integration

**Status:** Implemented inside CIE planning + anti-copy

## Principle

Retrieve patterns, not canned answers.

## Runtime behavior

1. `buildConversationPlan` calls `retrieveGoldStandardGuidance`
2. Plan stores `goldExampleIds`, `blockedFailurePatterns`, move, length
3. Talk It Out still uses `replaceBlockedDraft` during polish
4. CIE `isVerbatimGoldCopy` blocks near-exact library turns
5. On copy / blocked pattern → grounded repair, never script dump

## Guidance to generators

Compact block only (move, length, topic, blocked patterns) — see `buildGoldGuidanceBlock`.
