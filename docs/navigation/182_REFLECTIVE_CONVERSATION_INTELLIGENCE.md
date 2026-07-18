# 182 — Reflective Conversation Intelligence (RCI)

**Source package:** `182_CURSOR_REFLECTIVE_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md`  
**Status:** Implemented in code · **Do not deploy** until authenticated Talk It Out feels human, not scripted.

## Purpose

Shared platform layer that improves the member’s own thinking — not coaching, therapy, advice, or decision-making for them.

**First consumer:** Talk It Out  
**Future:** Journal Gazebo, Decision Compass, founder / board / client debriefs, discovery

## Core principle

Better thinking — not better answers. Shari is a thinking companion.

**Golden rule:** Never ask a question simply because it is next.

## Architecture

| Piece | Path |
|-------|------|
| Types / Thinking Map | `lib/reflectiveConversationIntelligence/types.ts` |
| Thinking Map engine | `thinkingMap.ts` |
| Archetype classifier | `archetype.ts` |
| Reflection engine | `reflection.ts` |
| Question quality filter | `questionQuality.ts` |
| Repetition guard | `repetitionGuard.ts` |
| Response selection | `responseSelection.ts` |
| Shared API | `api.ts` → `runReflectiveTurn()` |
| Barrel | `index.ts` |

Talk It Out wires through `lib/talkItOut/reflectiveEngine.ts` (situation candidates + explicit-help boundary stay local). Hidden map persists on `TalkItOutSession.thinkingMap`.

## Reflective cycle

Listen → Thinking Map → archetype → known vs unexplored → **one** deepening move → wait → update map → repeat only while valuable.

## Response kinds (one per turn)

Thoughtful question · gentle observation · tentative pattern · connection · clarification · summary · invite continue · future-feeling (occasional) · completion check

## Advice boundary

No solutions. No Estate experience routing unless the member explicitly asks for more help (Talk It Out owns that offer).

## Tests

- `lib/reflectiveConversationIntelligence/rci.test.ts` — five scenario shapes + map/archetype
- `lib/talkItOut/talkItOut.test.ts` — voice, help boundary, findability

## Deploy gate

Do **not** deploy production until authenticated conversations (business, planning, overwhelm, creative block, relationship) consistently feel like a thoughtful human companion rather than a scripted AI.
