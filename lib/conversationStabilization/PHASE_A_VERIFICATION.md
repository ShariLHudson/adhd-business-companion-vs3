# Phase A Verification — Single Conversation Decision Process

**Status:** Unit/regression verified · Preview/production live checks required before Phase A sign-off  
**Do not begin Phase B until production results are reviewed.**

## 1. Remaining bypasses

| Path | Reads decision? | Obeys permissions? | Can bypass? | Notes |
|------|-----------------|--------------------|-------------|--------|
| Continuity gate (before decision) | No | N/A | Yes — returns before `beginTurnDecision` | Workflow correction / destination ownership. Phase B: build minimal decision first. |
| `finishEarlyChatTurn` callers after begin | Yes (log/end) | Via authorize helpers when gated | Partial | Many early owners still compose their own copy. |
| Frictionless estate nav / scenic menus | Yes via `authorizeScenic*` | Yes (gated) | No (when turn active) | `tryEstateNavigationIntelligence`, `tryEstateGuideFlow`, `tryEstateRecommendationInvitation`. |
| Universal breathe | Yes `authorizeBreatheAutoOpen` | Yes | No | Store-aware. |
| Estate guide in CPC | Yes `authorizeScenicPlaceMenu` | Yes | No | Double-gated with overwhelm classifier. |
| Kernel `place-menu` (named-place disambiguation) | Partial | Scenic gate in classifier for overwhelm | Soft bypass | Reading Nook still may show place-menu from kernel; navigation intelligence returns `navigate_direct`. |
| Chat API / LLM | Logs owner `chat_api` | Does not re-check scenic mid-stream | Soft | Model could mention places; no auto-launch without handlers. |
| Pending selection | Prefixed `pending_selection` | Denies new scenic/breathe | No | Completing a choice may navigate. |
| Emotion classifiers alone | No longer finish scenic | Blocked by authorize | Was bypass; fixed for gated paths | |

**Hard remaining bypasses for Phase B:** continuity-before-decision; competing final response composers; kernel place-menu vs nav intelligence dual path.

## 2. Files modified

- `lib/conversationStabilization/conversationDecision.ts`
- `lib/conversationStabilization/turnDecisionStore.ts` (new)
- `lib/conversationStabilization/turnDecisionStore.test.ts` (new)
- `lib/conversationStabilization/index.ts`
- `lib/conversationStabilization/conversationDecision301.regression.test.ts`
- `lib/conversationStabilization/PHASE_A_VERIFICATION.md` (this file)
- `lib/frictionlessActionLayer.ts`
- `lib/universalAccess/breatheUniversalAccess.ts`
- `app/companion/CompanionPageClient.tsx`

## 3. Decision enforcement changes

- Decision created once per turn via `beginTurnDecision(turnId, buildConversationDecision(...))`.
- `authorizeScenicPlaceMenu` / `authorizeBreatheAutoOpen` / `authorizeDirectNavigation` prefer the active turn store.
- Permissions may only tighten (`restrictTurnPermission`).
- Pending selection sets `primaryIntent: pending_selection` and denies new scenic/breathe.
- Frictionless scenic/nav paths check authorize helpers.
- Structured turn log includes turnId, permissions, route, owner, action, bypassDetected.
- `finishEarlyChatTurn` re-logs and `endTurnDecision`.

## 4. Pending-selection tests

Suite asserts Library / Observatory / Tea Room menu:

- `3` → Tea Room, pending consumed  
- `Tea Room` → Tea Room, pending consumed  
- `the third one` → Tea Room, pending consumed  

## 5. Final response-owner map

| Owner | Role today | Phase B |
|-------|------------|---------|
| `pending_choice` | Final reply + action | Keep |
| `universal:*` / breathe | Final ack + open | Keep |
| `my_day_opener` | Opens My Day | Keep |
| `frictionless:*` | Local reply / navigate | Convert toward composer |
| `estate_guide` | Local guide reply | Convert |
| `estate_kernel` / in-room | Kernel plans | Convert |
| `chat_api` | LLM final text | Primary composer target |
| Continuity correction | Pre-decision reply | Wire decision first |

**Target:** intelligence + routers contribute structure; one composer owns member-facing text. No broad composer migration in Phase A.

## 6–7. Preview / production test set

Automated regression covers decision/permissions/pending for scripts 1–10.  
**Live preview/production** must still record exact member-facing responses:

1. Cognitive overload  
2. Bare overwhelm  
3. Project overwhelm  
4. Open breathing exercise  
5. Take me to the Reading Nook  
6. Take me somewhere peaceful  
7. Choose `3`  
8. Choose by name  
9. Should I switch CRMs?  
10. Casual update  

| # | Expected (decision layer) | Unit | Preview | Production |
|---|---------------------------|------|---------|------------|
| 1 | scenic denied, breathe denied, offer_optional_help | PASS | pending | pending |
| 2 | natural_conversation, no auto action | PASS | pending | pending |
| 3 | task_breakdown, ask_one_needed_question | PASS | pending | pending |
| 4 | breathe allowed | PASS | pending | pending |
| 5 | navigate_explicitly + navigate_direct | PASS | pending | pending |
| 6 | scenic allowed, offer_choices | PASS | pending | pending |
| 7–8 | pending resolves Tea Room | PASS | pending | pending |
| 9 | TF thin hint, no scenic | PASS | pending | pending |
| 10 | natural_conversation | PASS | pending | pending |

## 8. Deployed commit hash

Not deployed from this session. After preview passes: deploy, record `git rev-parse HEAD`, re-run live scripts.

## 9. Phase B limitations

- Single response composer migration  
- Continuity gate before decision  
- Kernel place-menu vs navigation intelligence unification  
- Emotion must never re-enter scenic after restrict  
- Full live logging of exact responses in preview/prod

## 10. Rollback

1. Set `NEXT_PUBLIC_CONVERSATION_DECISION_GATE=0` (authorize helpers still text-gate scenic/breathe for reliability).  
2. Or revert the files listed in §2.  
3. Do not `git clean` / broad reset on this dirty tree — path-scoped revert only.
