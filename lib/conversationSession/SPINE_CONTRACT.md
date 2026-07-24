# ConversationSession Spine Contract (Phase 0–2)

**Status:** Binding for Companion / global Shari identity, reset, and transcript authority.  
**Phase 1 (done):** bind Companion turns to spine `conversationId`; shared reset; reject foreign projections.  
**Phase 2 (done):** `conversationHistory` is the authoritative transcript; Companion dual-writes; certification reads the spine.  
**Phases 3+ (not yet):** ownership migration, CIE persistence on spine, early-return cleanup, remove view dual-write.

## Sole durable authority

`ConversationSession` (`conversationId`, stage, artifacts, answered questions, **conversationHistory**) is the **only durable conversational authority**.

All other conversation-scoped stores are:

| Store | Classification | Role |
|---|---|---|
| `messages` / `messagesRef` | **View** | React display of the transcript — projection of spine history |
| Conversation Continuity owner pointer | **Projection** | Sticky workflow owner cache; must match spine `conversationId` |
| `ShariConversationThread` | **Projection** | Help-follow-up semantics; rejected when `conversationId` mismatches |
| `generalChatCertifiedRuntime` | **Projection** | In-memory CIE/TCAI continuity; cleared on reset; ignored on id mismatch |
| `UniversalCreationSession` | **Adapter state** | Create execution engine; dual-writes into spine; bound to spine id |
| `turnAuthority` / `turnDecisionStore` | **Consumers** | Ephemeral per-turn gates; must not outlive the spine turn |

## Public spine API

- `getOrCreateConversationSpine()` — load or create the active session
- `getConversationSpine()` — load or `null` (no create)
- `patchConversationSpine(patch)` — merge patch onto the spine
- `appendConversationSpineTurn({ conversationId, role, text, metadata })` — **canonical transcript write**
- `getSpineTranscriptMessages(conversationId?)` — authoritative transcript for cert/consumers
- `syncCompanionViewMessagesToSpine(prev, next)` — Companion dual-write choke point

## Transcript flow (Phase 2)

```
user / assistant commit
  → appendConversationSpineTurn()  (authority)
  → setMessages() view update      (projection; also syncs via choke point)
  → messagesRef                      (render cache)
  → certifyCompanionDelivery()       (reads spine conversationHistory)
```

## Reset contract

`resetActiveConversation({ mode: "new-chat" | "new-day" })` is the **only** teardown for conversation-scoped state. New Chat and New Day both invoke it (New Day via `runSharedNewDay`).

Must clear: Continuity owner, UC session, Shari help-thread, ActiveTopic, IntentWorkflow, turn decisions, `generalChatCertifiedRuntime`, frictionless/pending menus, ConversationSession (then recreate with **empty transcript**), day-session bind, and other temporary isolation vectors.

## Browser persistence

- Spine: `companion-conversation-session-v1`
- Legacy view: `companion-conversation-v1` — continues dual-write for compatibility (no stored-conversation migration yet)

## Non-goals (later phases)

- Do not move Continuity/UC ownership fields fully onto the spine yet  
- Do not persist CIE into ConversationSession yet  
- Do not force all early returns through certification yet  
- Do not remove `messagesRef` or stop dual-write yet  
