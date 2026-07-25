# Phase 3 — Conversation Ownership Inventory

**Status:** Binding inventory for Phase 3.  
**Spine:** `ConversationSession.ownership` is the authoritative ownership record.  
**Mid-turn writes:** `claimTurnOwnership` only.

## Ownership signals (code)

| Signal | Files | Persistence | Role |
|---|---|---|---|
| Spine ownership | `ownership/*` | localStorage spine | **Authority** |
| Collection pending | `collectionPendingOffer.ts` | sessionStorage | Adapter → `collection_offer` |
| Win-save pending | `winSavePending.ts` | sessionStorage | Adapter → `collection_offer` |
| Awaiting confirmation | CPC ref | React ref | Expected-reply UX; not rival to Collection |
| Universal Creation | `universalCreation/*` | localStorage | Adapter → `create` |
| Continuity pointer | `conversationContinuity/*` | sessionStorage | Projection → chamber/board/create |
| Help thread | `shariAnswerFirst/conversationContinuity.ts` | sessionStorage | Projection → `help_thread` |
| Intent Workflow | `intentWorkflowStore.ts` | sessionStorage | Projection when `active` |
| Active Topic | `activeTopicStore.ts` | sessionStorage | **Metadata only** — never turn owner |
| Frictionless pending | `frictionlessActionLayer.ts` | localStorage | Soft confirmation adapter |
| Talk It Out | `talkItOut/sessionStore.ts` | localStorage | **Excluded** — see TALK_IT_OUT_OWNERSHIP_DECISION.md |
| Turn authority | `turnAuthority.ts` | ephemeral | Consumer |
| Transcript recovery | `recoverCollectionPendingFromAssistant` | derived | Guarded compatibility |

## Precedence

1. Interrupt (exit / task-change / correction / explicit revise)  
2. Create  
3. Collection / win-save (`collection_offer`) — confirmation is `expectedReply`  
4. Soft confirmation (no Collection family)  
5. Chamber / Board (intentional Continuity pointer)  
6. Intent Workflow (`active` only)  
7. Help Thread (stored thread only)  
8. Destination / discovery / onboarding  
9. Talk It Out (only if `talkItOutActive`)  
10. Companion  

## Collection vs confirmation

- Workflow owner: `collection_offer`  
- Expected reply: confirmation/choice on that owner  
- Decline clears both expected reply and Collection/win-save  

## Migrated

Collection · win-save · soft confirmation · Create · Continuity chamber/board claims · Help Thread claims · Intent Workflow (active) · Active Topic reclassified as metadata

## Explicitly excluded

Talk It Out — Option 2 separate domain
