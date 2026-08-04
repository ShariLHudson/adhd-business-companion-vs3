# Conversation Quality & Context Routing Audit

**Status:** Audit COMPLETE (runtime paths traced with code proof). Remediation
NOT started — awaiting plan approval. No conversation code changed.

**Scope reminder:** audit-first. Do not weaken routing rules broadly, do not
remove explicit-create / awaiting-answer / destination safeguards unless proven
involved, do not redesign the conversation architecture.

---

## Verdict

Two **separate** root causes in two different layers, sharing one meta-pattern
(regex-only recognition with no semantic layer, over conflated turn state):

- **Example 1 (ordinary to-dos → Decision/Project/Create):** a *classification*
  defect — over-broad keyword matchers claim errand lists as build/decide work,
  and there is no "ordinary day-planning list" intent.
- **Example 2 (craft-show reply repeats the prior prioritization answer):** a
  *stale-state + response-regeneration* defect — active-topic state is not
  cleared on a non-explicit subject pivot, and a fallback regenerates the reply
  from the stored topic while ignoring the current message.

They can compound (Example 1 can be what first installed the stale prioritization
topic that Example 2 then replays), but each needs its own fix.

---

## State taxonomy (verified) and conflations

| # | Category | Backing state / key | Backend | Cleared by |
|---|---|---|---|---|
| 1 | Long-term memory | profile, `companion-prefs-v1`, `companion-rhythms-v1`, `companion-reminders-v1`, Board history | localStorage | never on reset (preserved) |
| 2 | Conversation context | spine `companion-conversation-session-v1` (transcript/stage/artifacts/answered-Qs), `companion-conversation-context-v1`, help/handoff, certified runtime | localStorage | full reset only (New Chat/Day) |
| 3 | Active topic | `spark-active-topic-v1` | sessionStorage | full reset **and** explicit topic-change in `activeTopicGate` |
| 4 | Active workflow | `spark-intent-workflow-v1` (strategy/create lock, `awaiting_user`, resume) | sessionStorage | full reset **and** conditional ownership-resolution — **not** on topic change |
| 5 | Immediate intent | `goalClassifier` output / `turnDecisionStore` (`let active` singleton) / arbitration | in-memory | per-turn consume + reset |

**Conflations to fix:**
- **(A)** Active topic and active workflow (both sessionStorage `spark-*`) clear
  together only on full reset; on an in-conversation topic change only the topic
  clears (`activeTopicGate` calls `clearActiveTopic` but never `clearIntentWorkflow`).
- **(B)** Active workflow carries `awaiting_user` + `explicit_continue` resume
  semantics, so a fresh message can be consumed as the prior workflow's answer.
- **(C)** No "soft turn boundary": the only trigger clearing topic + workflow +
  turn authority together is New Chat / New Day. A subject pivot has no teardown.

---

## Example 1 — ordinary to-do list misrouted

**Message:** "I have lots to do today: email the accountant, pick up supplies,
call the venue, finish the invoices."

**Intended:** ordinary day planning — stay in chat (at most offer Plan My Day).
**Actual:** claimed as build/decide → Create / Projects / Decision Compass.

**Exact branches (all verified):**
- `lib/workspaceMode.ts:191` `DOING_VERB_RE` (includes bare `need to|want to|have to|plan|prepare|schedule`) AND `:194` `CONCRETE_OBJECT_RE` (includes ordinary nouns `email|post|content|project|launch|workshop`); `hasDoingIntent` = both, `:339`. `matchWorkspaceTarget` (`:254-286`) picks Projects vs Create purely from the noun.
- `lib/intentRoutingIntelligence.ts:201` `DECIDE_RE` + `lib/decisionCompassRouting.ts:20` offer regex → `category==="decide"` → Decision Compass (`:628`). Trigger token `should i .+ or .+`.
- `lib/companionDecisionIntelligence/decisionComplexityScore.ts:72` escalates on `should i` / `launch|pricing|revenue` → `decisionCompassOfferGate.ts:19` opens Decision Compass whenever complexity ≠ low.
- Plan My Day is gated to explicit strings only (`intentRoutingIntelligence.ts:204` `PLAN_RE`), so a bare list never reaches it.
- Only guard keeping the example conversational: `lib/messageClassification.ts:357` `isPrioritizingConversation` — passes solely because ≥3 clauses + whitelisted verb "finish" (`TASK_DUMP_ACTION_RE:43` omits email/call/pick up/pay/schedule). Swap "finish" for "pay/submit" or shorten to 2 items → guard fails → misroute.

**Defect class:** over-broad keyword matching (primary) + missing day-planning
intent for enumerated lists + fragile whitelist guard. NOT a priority/tie-break bug.

## Example 2 — new subject replays the prior answer

**Message:** "I'm thinking about entering a craft show" (after a prior
prioritization answer, same chat).

**Intended:** treat as a new subject; respond to the craft show.
**Actual:** regenerates the prior prioritization framing.

**Exact branches (all verified):**
- `activeTopicGate.ts:29` `EXPLICIT_TOPIC_CHANGE_RE` matches only reminder /
  Clear-My-Mind / Plan-My-Day navigation phrases → craft-show = no match → topic
  not cleared (`:373`). No semantic topic-divergence detection exists.
- The message classifies as `direct_answer` (`lib/shariAnswerFirst/decideShariResponse.ts:177`),
  which is excluded from the answer-first clear list (`activeTopicGate.ts:463-471`),
  so the stale-topic clear (`:476`) never fires.
- Falls into follow-up-while-unresolved rebind (`activeTopicGate.ts:567`):
  `patchActiveTopic` keeps prior `domain`/`userGoal`, overwrites only
  `unresolvedNeed` — craft-show becomes a continuation of the prior topic.
- **Replay:** `lib/sparkConversation/coachingFallback.ts:328` calls
  `topicPreservingFallbackLine()` **with no `userText`**, gated on
  `shouldBlockGenericFallback()` (true while topic unresolved). Inside
  (`activeTopicGate.ts:194-313`) the reply is derived from stored
  `topic.unresolvedNeed || topic.userGoal` — the current message is never read.
- Reset never runs on a topic pivot: `resetActiveConversation` (the only caller
  of `clearActiveTopic` alongside `clearIntentWorkflow`) fires only from New Chat
  (`CompanionPageClient.tsx:7576`) / New Day (`runSharedNewDay.ts:74`).

**Defect class (ranked):** (1) stale active-topic not cleared / actively rebound;
(2) stored-topic-anchored regeneration in the argument-less fallback; (3) no
sessionStorage invalidation on pivot. Awaiting/create locks are NOT involved here.

## Structural note
`arbitrateConversationRouting` runs twice per turn — `buildConversationDecision`
(`CompanionPageClient.tsx:15070`) and `runConversationRoutingPipeline`
(`frictionlessActionLayer.ts:3988`); the second drives destination + fast path.
Not a direct cause of either example, but a divergence risk to track.

---

*Remediation plan is in the audit report; do not implement until approved.*
