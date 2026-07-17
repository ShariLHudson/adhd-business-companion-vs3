# Conversation Engine Gap Map

**Package:** 3 — Conversation Engine  
**Standard:** `standards/029_CONVERSATION_ENGINE_STANDARD.md`  
**Contracts:** `contracts/030_CONVERSATION_ENGINE_CONTRACT_INDEX.md`  
**Audit prompt:** `prompts/031_CURSOR_AUDIT_CONVERSATION_ENGINE.md`  
**Addendum prompt:** `prompts/053_CURSOR_ADD_CONTENT_INCIDENT_TO_CONVERSATION_ENGINE_AUDIT.md`  
**Audit status:** `in_progress` (failure corpus + advisory handoff path mapped; full path audit may deepen later)  
**Implementation:** not started  

Related: CB-017 · CB-021 · CE-002 / CE-003 / CE-012 / CE-013 / CE-014  
Incidents: `docs/companion-behavior/audits/021_…` · `docs/companion-behavior/audits/052_CB_021_CONTENT_INTELLIGENCE_HANDOFF_LOOP_INCIDENT.md`

---

## Required failure corpus (status)

| # | Failure | Code-path status |
|---|---------|------------------|
| 1 | Collaboration answer ignored → “tell me what you need” | Mapped in CB-017 gap map (`GENERIC_RECOVERY_BRIDGE` / no ActiveConversationStep) |
| 2 | Subscription procrastination → repeated Finance intro | Mapped in CB-021 INC-001 |
| 3 | Generic “tell me what you need” | `lib/sparkConversation/coachingFallback.ts` |
| 4 | Numbered choice after New Chat | CB-007 reset clears pending; soft Welcome risk remains |
| 5 | Unrelated prior noun bleed | Outcome thread / companion context (Package 2 knowledge map) |
| 6 | Repeated workflow prompts | Partial — continuity + owner stores |
| 7 | Topic change during active workflow | Partial — pending topic_change; open-Q weak |
| **8** | **Content Instagram question → Content intro loop (INC-002)** | **Mapped below — same path as Finance** |

---

## INC-002 / INC-001 shared advisory handoff path

### Trace (Content — identical architecture to Finance)

| Step | What runs |
|------|-----------|
| Alias | `"content"` in “best type of **content**…” → `ChamberMemberId = content` |
| Command | `detectChamberMemberCommand` → kernel `NAVIGATE` (no `isChamberMemberRequest` gate) |
| Writers | (A) Chamber arrival greeting · (B) `activationOpener` · (C) `estateCommandAckLine` → `Of course — here's Content.` |
| Early exit | `kernelHandled` → `finishEarlyChatTurn` — **chat API / Shari composer never run** |
| Specialist analysis | **None** — only startup copy |
| Repeat / clarify | Rematch alias → re-append opener + ack |

| Question | Answer |
|----------|--------|
| Exact source of “What would help you move forward today?” | Chamber arrival `shariGreeting` / `CHAMBER_ENTRY_PROMPT` |
| Exact source of Content introduction | `chamberMemberRegistry` `content.activationOpener` via `inviteChamberMemberCore` |
| Exact source of “Of course — here's Content.” | `estateCommandAckLine` + short label `"Content"` |
| Assistant messages per turn | Usually **2–3** |
| Does user message reach Content Intelligence? | Stored in chat history only — **not** as analysis input |
| Structured analysis vs startup copy? | **Startup copy only** |
| Does activation reset conversation state? | Effectively restarts intake; no answer preservation |
| Is Shari composer bypassed? | **Yes** |
| Same path as Finance? | **Yes** |
| One global fix for both? | **Yes — required** (do not patch specialists separately) |

---

## Competing owners (conversation path)

| Concern | Competing owners | Winner today (incident) |
|---------|------------------|-------------------------|
| Specialist selection | Chamber alias NLP · Continuity · Frictionless · Chat API | Chamber alias NAVIGATE |
| Final visible reply | Arrival host · inviteChamberMemberCore · estate ack · chat API · failsafe | Multiple writers; composer skipped |
| Open question / progression | Missing ActiveConversationStep (CB-017) | None — cue/answer not tracked |
| Generic fallback | coachingFallback · bridgeResponder · failsafe | Active when API path runs |
| Duplicate prevention | None enforced | 2–3 messages per turn |

---

## Single recommended authoritative boundary

**One advisory + conversation orchestration boundary** (shared by CB-021 CE-013/014 and Package 3):

Call once from `handleSend` **before** any Chamber/Board/advisory `setMessages`:

1. **Specialist selection** — explicit request (`isChamberMemberRequest`) vs topic keyword vs already-active; never auto-NAVIGATE on bare aliases inside help questions.  
2. **Active-context transfer** — pass latest user text, open question (CE-001/002), topic, prior answer, expected next move.  
3. **Structured specialist contribution** — `AdvisoryContribution[]` only; never final prose from `activationOpener`.  
4. **One final response owner** — `ResponseOwnershipDecision.finalOwner = "shari_composer"`, `visibleResponseCount: 1`.  
5. **Duplicate-response prevention** — hard-block arrival greeting + opener + ack as parallel chat writers on the same turn when the turn is advisory contribution.

Closest existing spines (insufficient alone): `buildConversationDecision` / turn decision store · `resolveContinuityTurnGate` · `resolveEstateAction` · `inviteChamberMemberCore`.

---

## Contract status (Package 3)

| Contract | Status vs incidents |
|----------|---------------------|
| CE-001 Awaiting Answer | Missing for open cues / talk-through |
| CE-002 Answer Recognition | Missing — Content/Finance questions not treated as answers to need |
| CE-003 Conversation Progression | Missing — activation replaces progression |
| CE-012 Generic Fallback Guard | Partial detect; still emits on failsafe |
| CE-013 Advisory Handoff Continuity | **Fail** — INC-001 + INC-002 |
| CE-014 Single Final Response Ownership | **Fail** — multiple writers |

---

## Smallest safe global implementation order

1. **Shared Chamber navigate gate** (explicit request only) — unblocks Finance + Content + all members.  
2. **Already-active specialist** → continue in chat, no re-intro.  
3. **CE-001/002/003** progression state for open questions (CB-017).  
4. **CE-014** single composer write + block opener/ack as chat on advisory turns.  
5. Regression: INC-001, INC-002, collaboration answer, New Chat pending.  

**Do not implement** until this map and CB-021 map are accepted as naming the **same** owner.

---

## Live verification

| Checklist | Path |
|-----------|------|
| Finance | `docs/companion-behavior/verification/023_CB_021_LIVE_REGRESSION_CHECKLIST.md` |
| Content | `docs/companion-behavior/verification/054_CONTENT_INTELLIGENCE_HANDOFF_LIVE_CHECKLIST.md` |

Status: **unverified**

---

## Definition of next step

Corpus item 8 recorded; shared owner identified with CB-021. **Stop** — no phrase patches, no per-specialist fixes, no production deploy.
