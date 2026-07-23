# Chat Scope and New Day Behavior

## Purpose

Spark Estate chat is one companion surface with **scoped ownership** behind the scenes. Members never see scope IDs. Behavior must feel continuous and calm while preventing stale Board / Create / destination workflows from capturing unrelated turns (especially after New Day or direct navigation).

**Authoritative turn arbiter:** [`AUTHORITATIVE_CONVERSATION_ROUTING_STANDARD.md`](./AUTHORITATIVE_CONVERSATION_ROUTING_STANDARD.md) · runtime `lib/conversationRouter/routeConversationTurn.ts`. This document remains the New Day / scope behavior contract; the arbiter consolidates Continuity + chatScope rather than replacing them.

## Active-scope model

Suggested scopes (`lib/chatScope/types.ts`):

| Scope | Role |
|-------|------|
| `global_companion` | Default Estate chat |
| `estate_destination` | Chat while visiting a place |
| `guided_creation` | Create / document workflows |
| `project` | Project-home conversation |
| `chamber_member` | Chamber specialist |
| `board_discussion` | Board intake / Round Table |
| `reflective` | Journal / reflective experiences |
| `new_day` | Fresh day session after New Day |

Each scope record has: `scopeId`, `sourceId`, `active`, timestamps, `resumable`, `pendingQuestion`, `navigationOwner`.

**Only one primary scope** should control the active chat at a time (`getActiveChatScope` / `setActiveChatScope`).

## Intent priority (binding)

Highest → lowest (`CHAT_INTENT_PRIORITY`):

1. Safety or account action  
2. **Direct navigation command**  
3. Explicit workflow-management command  
4. Direct create / open / start  
5. Current awaiting-answer (same scope only)  
6. Current destination conversation  
7. General conversation  
8. Suggested routing  

Direct navigation outranks sticky Board, unfinished Create, prior destination context, and old suggestions.

Runtime helper: `isDirectNavigationPriorityTurn()` in `lib/chatScope/directNavigationPriority.ts`.  
It requires an **explicit navigation verb** and resolves places through `detectDirectCommand` (Estate registry) or hard-nav — not a second hard-coded destination list.

## New Day behavior

`resetActiveConversation({ mode: "new-day" })` (`lib/conversationReset/resetActiveConversation.ts`):

**Clears / deactivates**

- Active messages and conversation session (new `conversationId`)
- Conversation owner pointer
- Universal Creation session
- Chamber activation, frictionless pending, discovery / implied-need / outcome threads
- Board **intake draft** (`spark.board.director-intake-draft.v1`)
- Call-the-Board seed (`spark.board.call-the-board.v1`)
- Day session id (rotated via `startNewDaySession`)
- Active chat scope → `new_day`

**Preserves**

- Profile, preferences, long-term memory  
- Saved creations, projects, rhythms, reminders  
- Evidence Vault, journal entries  
- Board **discussion history** (`spark.board.director-discussions.v1`)  
- Prior conversation history records (not the active thread)

New Day is **not** “Continue Previous Conversation.” Continue is an explicit member choice (e.g. Review Where You Left Off on the daily opening card).

## Continue behavior

Only when the member deliberately chooses continue / reopens Boardroom intake should a prior scope become active again.

- Suspended Board intake: `conversationSuspended` on the draft  
- Boardroom load via `resolveInitialBoardIntakeDraft` may unsuspend for deliberate reopen  
- New Day **clears** intake (no automatic Board resume in chat)

## Destination navigation

1. Continuity gate checks `isDirectNavigationPriorityTurn` **before** sticky Board / Create routing.  
2. On match: suspend Board intake chat ownership, clear owner pointer, fall through (or stored-content `destination` action).  
3. Estate kernel / place router / hard-nav execute navigation immediately.  
4. Music Room resolves to canonical `music-room` (not Peaceful Moments).

Ambiguous multi-match places still ask one clarification via Estate place resolution. Unknown places do not fabricate a route.

## Awaiting-answer ownership

Awaiting-answer locks belong to their **owning scope**.

- An unanswered Board intake question must not capture “go to the music room.”  
- Navigation suspends Board chat ownership (`suspendBoardIntakeConversation`) without deleting saved discussion history.  
- Create sticky document answers remain owned until exit / correction / navigation.

## Stale-response suppression

`shouldAcceptAssistantResponse` (`lib/chatScope/staleResponseGuard.ts`) validates:

- `conversationId`  
- `daySessionId`  
- `scopeId`  
- optional `destinationId`  

Delayed responses from a superseded New Day session, conversation, scope, or destination must be discarded. In-flight API turns are also aborted via `supersedeInFlightChatRequest` on reset.

## Board scope rules

Board becomes active only when the member:

- Enters the Round Table Boardroom and continues intake  
- Selects Board discussion  
- Resumes a saved discussion  
- Explicitly asks the Board for input  

Board must **not** activate because:

- An old Board reply was the last assistant message  
- New Day began  
- An unrelated navigation command was issued  
- The member entered another Estate room  

## Persistence boundaries

| Key | Cleared on New Day? |
|-----|---------------------|
| `companion-conversation-v1` | Yes |
| `companion-conversation-session-v1` | Cleared → new session |
| `spark:conversation-owner:v1` | Yes |
| `spark.board.director-intake-draft.v1` | Yes |
| `spark.board.call-the-board.v1` | Yes |
| `spark.board.director-discussions.v1` | **No** (history) |
| `spark.chat.day-session.v1` | Rotated |
| `spark.chat.active-scope.v1` | Replaced with `new_day` |

## Testing requirements

See `lib/chatScope/chatScope.behavior.test.ts` for New Day, navigation-over-Board, stale response, and registry alias coverage. Continuity slice tests must still allow Create content answers that are not navigation verbs.
