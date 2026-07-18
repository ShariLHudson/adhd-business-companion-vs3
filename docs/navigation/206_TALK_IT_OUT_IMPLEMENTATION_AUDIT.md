# 206 — Talk It Out Implementation, Migration & Authenticated Audit

**Coordinated package:** 182–207 as one system · **Production not deployed**

## Repository

`c:\Users\Shari\spark-ecosystem-v4\companion-app`

## Phase 1 — Audit map (live code)

### Routes / openers
`CompanionPageClient.openTalkItOutCore` · Welcome Home · Focus Hub · How Do I · Estate menus · `TalkItOutPanel`

### Response generators (before cleanup)
| Generator | Status |
|-----------|--------|
| `runReflectiveTurn` + situation banks | LIVE → polish → CIE |
| `deliverConversationalResponse` (CI) | LIVE inside polish |
| `applyGroundedAcknowledgement` | LIVE inside polish |
| `replaceBlockedDraft` (gold) | LIVE inside polish |
| `applyTopicContinuityValidation` | LIVE inside polish |
| `runConversationQualityAndRhythm` | LIVE inside polish |
| `processConversationTurn` (CIE) | LIVE — sole final certifier |
| CQRI `BRIEF_ACKS` / `stripTrailingQuestion` | **Disabled legacy** — no longer emit “Take your time…” |
| RCI `buildInviteContinue` old lines | **Disabled legacy** |
| CI `CI_FALLBACKS` “I am with you…” | **Disabled legacy** |
| Help / completion / mode / topic-change | Now routed through CIE (`permanent_bans_only` or full) |

### State stores
| Store | Key / field |
|-------|-------------|
| Sessions | `spark.talkItOut.sessions.v1` |
| Active id | `spark.talkItOut.activeSessionId.v1` |
| Preferences | `spark.talkItOut.preferences.v1` |
| Per session | `thinkingMap`, `cieState`, `usefulSummary`, `usedStrategyMoves`, `needsReentry`, `title`, `topic` |

### Root causes of the three failures
| Phrase | Was produced by | Fix |
|--------|-----------------|-----|
| Take your time with that. | CQRI `stripTrailingQuestion` / `BRIEF_ACKS` | Removed; CIE blocks + regenerates |
| Quieter question underneath | RCI observation banks | NHM + CIE blocking regenerate |
| Something around does | Clarification topic extract | TCAI + CIE permanent ban |

## Phase 3–6 — Engine integration (done)

- Every `buildTalkItOutTurn` assistant path calls `polishTalkItOutDelivery` → CIE
- Blocking failures **regenerate** (not soft-log)
- Permanent ban scrub after polish
- Legacy pause shells / invite-continue / CI empathy fallbacks rewritten
- Abstract “What matters most to you here?” removed from live question bank

## Phase 4 — Gold Standard coverage

| Batch | Count | Focus |
|-------|-------|-------|
| 1 | 20 | Business decisions |
| 2 | 10 | Overwhelm, short-answer, topic change, repairs, confidence, clients, endings, creative |
| Featured | repair + correction | Structure demos |
| **Total** | **≥32** | Deduped registry |

## Phase 8 — Tests

- `lib/talkItOut/permanentFailureRegressions.test.ts` — exact three phrases + multi-turn
- Architecture / CIE / gold / CQRI / TCAI / NHM suites

## Phase 9 — Authenticated preview

**Status:** **PASS** (2026-07-18) — see `206_TALK_IT_OUT_AUTHENTICATED_PREVIEW_LIVE_RESULTS.md`.

Ran on signed-in local workspace (`?previewTest=1`). Multi-turn hire → clarify → cost → correction, pause/refresh/resume, zero permanent-failure phrases.

### Smoke script

1. Open Talk It Out  
2. “I need to decide whether to hire a marketing assistant.”  
3. “What do you mean?”  
4. “Cost.”  
5. “Nothing underneath.”  
6. Pause → refresh → resume  
7. Assert none of: Take your time with that · quieter question underneath · something around does  

Local permanent regressions: `permanentFailureRegressions.test.ts` (10/10).

## Phase 10 — Production readiness

| Item | Status |
|------|--------|
| CIE routes live Talk It Out | Yes |
| Conflicting legacy pause/invite paths disabled | Yes |
| Validators regenerate | Yes |
| Gold batch meaningful | Yes (≥32) |
| Permanent regressions | Yes |
| Authenticated preview transcripts | **Yes (local PASS)** |
| Production deployed | **No** |

**Recommendation:** Authenticated smoke is clear. Deploy only when you intentionally promote this branch — not blocked on TIO phrase/resume failures anymore.
