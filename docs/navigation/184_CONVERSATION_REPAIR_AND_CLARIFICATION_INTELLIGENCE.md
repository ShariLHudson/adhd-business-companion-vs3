# 184 — Conversation Repair & Clarification Intelligence (CRCI)

**Source:** `184_CURSOR_CONVERSATION_REPAIR_AND_CLARIFICATION_INTELLIGENCE.md`  
**Status:** Implemented · **Do not deploy** until authenticated repair + Talk It Out UI meet 12/10 quality.

## Purpose

Recognize when communication broke down. Clarify before asking another reflective question.

| Layer | Owns |
|-------|------|
| RCI (182) | What to explore next |
| CI (183) | How Shari says it |
| **CRCI (184)** | When to pause exploration and repair understanding |

## Core principle

If the user is confused, answer the confusion before asking another question.

## Architecture

| Piece | Path |
|-------|------|
| Types | `lib/conversationRepairClarificationIntelligence/types.ts` |
| Trigger detection | `triggerDetection.ts` |
| Repair wording | `repairEngine.ts` |
| API | `api.ts` → `tryConversationRepair()` |
| Barrel | `index.ts` |

**First consumer:** Talk It Out — repair runs before RCI when triggers fire.

## Repair sequence

1. Acknowledge naturally  
2. Explain previous thought in plain language  
3. Check whether the explanation fits  
4. Continue only after understanding is restored  

## Talk It Out UI (package 184)

Initial surface:

- Title  
- One sentence  
- Composer (input + integrated Mic + Send)  

Progressive after conversation starts: **More…** reveals Pause / Save / End.

Removed: Keep Talking · separate Speak label · How Do I · extra instructional opening line.

## Tests

`lib/conversationRepairClarificationIntelligence/crci.test.ts`

## Deploy

**Do not deploy** until confused users get explanations before new questions, and the simplified UI feels calm in authenticated preview.
