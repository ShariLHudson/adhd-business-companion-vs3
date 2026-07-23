# Routing Entry Inventory

**Date:** 2026-07-23  
**Arbiter:** `lib/conversationRouter/routeConversationTurn.ts`  
**Primary funnel:** `CompanionPageClient.handleSend`

## Production entry paths

| Source | Handler | Current stack | Uses arbiter | Notes |
|--------|---------|---------------|--------------|-------|
| Typed chat (`ChatInputBar`) | `handleSend` | Arbiter → Continuity → hard-nav → frictionless → API | **Yes** | Primary |
| Voice transcription | `handleSend` | Same | **Yes** | Same text path |
| Synthetic quick actions / Welcome choices that call `handleSend` | `handleSend` | Same | **Yes** | |
| New Day reset | `resetActiveConversation` | Clears owner + day session | N/A (boundary) | Subsequent turns use arbiter |
| Board intake in global chat | Continuity `board_intake` via arbiter | Arbiter | **Yes** | |
| Chamber member chat | `handleSend` + chamber hint | Arbiter | **Yes** | Scope activation still section-ref based |
| Create UC sticky in chat | Continuity guided_workflow | Arbiter | **Yes** | |
| Project Ask Shari | `handleProjectAsk` → `handleSend` | Arbiter | **Yes** | |

## Documented bypasses (exceptions)

| Source | Handler | Uses arbiter | Status |
|--------|---------|--------------|--------|
| Talk It Out panel | TIO → `/api/companion-chat` | **No** | Approved exception — isolated CIE; hard-nav *into* TIO still via `handleSend` |
| Create Estate Begin / Start Creating | `resolveCreateBeginOutcome` | **No** | Approved exception — Create begin contract (130/131); chat nav still via companion when chat is used |
| Create draft review | `/api/create-draft-review` | **No** | Approved exception — review surface |
| Boardroom UI forms | Boardroom panel | **No** | Approved exception — destination UI; Past Discussions resume is deliberate |
| Project-brain next-action | `/api/project-brain` | **No** | Not conversational chat |
| Spark Alpha / hospitality prototypes | Direct API | **No** | Non-production |
| CMM capture panel | Thought persist | **No** | Not chat roles; chat-while-CMM still hits `handleSend` |

## Active scope sources

| Mechanism | Storage | Wired to arbiter |
|-----------|---------|------------------|
| Continuity `ConversationOwner` | sessionStorage `spark:conversation-owner:v1` | Yes |
| chatScope `ChatScopeRecord` | sessionStorage `spark.chat.active-scope.v1` | Partial (New Day; more kinds pending) |
| daySessionId | sessionStorage `spark.chat.day-session.v1` | Yes (envelope) |
| Board intake draft | localStorage | Via Continuity |
| Chamber sticky member | sessionStorage | Via Continuity when in Chamber |

## Async response mechanism

| Path | Guard |
|------|-------|
| CPC companion-chat | Generation abort + **`validateResponseEnvelope`** (wired 2026-07-23) |
| Talk It Out | Session-local (exception) |
| Local Continuity replies | Synchronous — no envelope |

## Follow-ups

1. Wire Talk It Out interrupt phrases through arbiter for Estate navigation.  
2. Create composer: route direct-nav phrases through `resolveNavigationTarget` before create intent.  
3. `setActiveChatScope` on Chamber / Board / Create / Project activation.  
4. Chamber destination change must always follow navigate effects from the arbiter.
