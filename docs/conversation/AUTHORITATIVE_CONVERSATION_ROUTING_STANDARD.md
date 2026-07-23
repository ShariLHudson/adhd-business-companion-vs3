# Authoritative Conversation Routing Standard

**Status:** Binding contract · Phase 1–5 foundation live  
**Runtime:** `lib/conversationRouter/`  
**Related:** [Chat Scope & New Day](./CHAT_SCOPE_AND_NEW_DAY_BEHAVIOR.md) · [Entry Inventory](./ROUTING_ENTRY_INVENTORY.md) · [Conflict Matrix](./ROUTING_CONFLICT_MATRIX.md) · [Certification Plan](./ROUTING_CERTIFICATION_PLAN.md)

## Principle

Every user message passes through **one shared routing arbiter** before any experience-specific handler can claim it.

```
User turn → routeConversationTurn() → effects + Continuity gate + response policy
```

Do not solve routing by adding exact phrases. Use intent families, canonical registries, active scope, and confidence.

## Pipeline modules

| Module | Role |
|--------|------|
| `routeConversationTurn.ts` | Arbiter entry |
| `classifyTurnIntent.ts` | Intent families |
| `resolveTurnPriority.ts` | Global priority ladder |
| `resolveScopeOwnership.ts` | `ConversationScopeOwner` contract |
| `resolveNavigationTarget.ts` | Canonical destinations |
| `resolveWorkflowAction.ts` | Effects |
| `resolveClarification.ts` | Clarify policy |
| `validateResponseEnvelope.ts` | Stale-response gate |
| `routingTrace.ts` | Dev-only trace |

Existing Continuity (`resolveContinuityTurnGate`) and chatScope remain the executable engines — the arbiter consolidates them; it does not duplicate them.

## Global priority (highest → lowest)

1. Safety / account-critical  
2. Cancel / stop / exit  
3. Direct navigation  
4. Workflow management  
5. Create / open / start / find  
6. Resume saved work  
7. Answer pending question (same scope)  
8. Active-scope request  
9. General conversation  
10. Suggested routing  

Rules:

- Lower-priority owners cannot capture higher-priority intents.  
- Direct navigation **suspends** prior scope — does not delete saved work.  
- Awaiting-answer is **not** absolute.  
- General conversation must not stick to the last-used Board / Chamber / Create / Project.  
- Suggestions never auto-launch.

## Scope ownership contract

Every conversational experience implements `ConversationScopeOwner` (see `routingTypes.ts`).

An owner may claim a turn only when:

- scope is active  
- conversationId / daySessionId match  
- intent family is allowed  
- no higher-priority intent already resolved  
- pending question still valid  
- user has not navigated, canceled, or begun New Day  

Owners must **not** claim merely because a draft exists, they were recent, or they can somehow interpret the text.

## New Day

`resetActiveConversation({ mode: "new-day" })` remains authoritative:

- new `conversationId` + `daySessionId`  
- activate `new_day` / global companion scope  
- clear temporary awaiting-answer + Board intake seeds  
- supersede in-flight requests  
- preserve saved records and resumable history  

Only explicit Continue may reactivate an old conversation scope.

## Response envelope

Every async companion-chat path must carry `ChatRequestIdentity` and call `validateResponseEnvelope` (or `shouldAcceptAssistantResponse`) before appending assistant content.

## Certification

See [ROUTING_CERTIFICATION_PLAN.md](./ROUTING_CERTIFICATION_PLAN.md). Platform routing is not certified until entry paths, ownership, envelopes, registries, conflict matrix, paraphrase tests, New Day/resume, and founder browser journeys all pass.
