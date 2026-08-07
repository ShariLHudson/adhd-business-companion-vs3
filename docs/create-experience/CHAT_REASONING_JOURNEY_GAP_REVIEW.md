# Chat as a Traditional Assistant — Gap Review

**Status:** Review only, per founder instruction — no code changes.
**Trigger:** live testing showing Create moving toward the Spark
experience while Chat still behaves like a traditional AI assistant, with
four concrete reproduction examples.
**Method:** every claim traced to file:line; two claims are explicitly
flagged as strong inference rather than runtime-confirmed (noted where
they occur).

---

## 1. Current Chat create routing — three disconnected paths, one genuine hole

Not one mechanism with a bug — **three separate things**, and the founder's
four examples each hit a different one:

| Path | What it is | Reaches a workspace? | Reaches Working Memory? |
|---|---|---|---|
| **A — `entranceUnderstanding.ts`** | The real five-question journey (outcome/why/audience/existing/constraints) | **Yes** — confirm → open | **Yes** — `RuntimeCreationRecord.workingMemory` |
| **B — `lib/universalCreation/orchestrator.ts`** | An older, separate, fixed-sequence conversation engine, per-document-type static question plugins | **Never** — its own comment: *"Exhaustiveness: all UC kinds are handled above. Never open Create workspace."* Every turn kind produces a chat reply, forever. | **Never** — its own parallel session (`universal-creation-session-v1`), zero references to `RuntimeCreationRecord` anywhere in `lib/universalCreation/` |
| **C — nothing** | For event/workshop-shaped requests specifically, both A and B explicitly exclude them (`isEventDomainCreationRequest` routes them away from B; A is only reachable via the entrance UI or Work Recognition's shape detection, which doesn't yet recognize this shape) | — | — |

**Concretely, per the founder's examples:**
- *"I want to create a 1 hr workshop"* → **Path C.** Traced exhaustively: this text fails every predicate in both A's and B's entry gates. It falls to plain chat with **no reasoning-journey code claiming the turn at all.** This is the sharpest finding in this review — it isn't that chat asks the *wrong* questions here, it's that nothing recognizes this as work in the first place.
- *"I need help writing a newsletter"* → **Path B.** `detectUniversalDocumentType` matches "newsletter" unconditionally; `shouldEnterUniversalCreation` returns true. This is the older orchestrator — not the journey Create's entrance uses.
- Anything typed with an explicit develop/build/improve verb, or one of the "I need to know how to X" / "I need help organizing X" / "I need a better way to X" shapes → **Path A**, via the Work Recognition seam shipped this session (`54623f4c`/`b77afcbe`).

---

## 2. "What's murky?" — a real, structural bug, and not where it looks

Confirmed: **not** in `universalCreation` (its own uncertainty check, `UNCERTAINTY_RE`, correctly requires the member's actual words — "I don't know," "not sure," etc.). It's in
`lib/conversationStabilization/activeTopicGate.ts:75`, a fixed per-Chamber-domain dictionary (`SPECIALTY_CLARIFY`), reached only as a **last-resort fallback** (`lib/sparkConversation/coachingFallback.ts:320-336`) when nothing else claims the turn.

**The actual defect:** it fires from *(the topic's stored domain matches a Chamber alias) + (that topic is marked unresolved)* — **with no check anywhere on whether the member's own words were actually vague.** "AI architect" plausibly resolves to the `ai-technology` Chamber domain via alias matching; if nothing upstream (including Path C's hole, above) claims the turn first, this fallback fires regardless of how specific and confident the member's request was. This is a direct, traceable violation of the founder's stated rule ("only ask uncertainty questions when the user expresses uncertainty") — and it's made *more* likely to fire precisely because Path C leaves workshop/event requests unclaimed.

---

## 3. Workspace opening logic — one real path, one dead end

Only `entranceUnderstanding.ts`'s confirm→open flow (Create's own entrance, and nothing else) ever calls into the actual workspace-open machinery. `universalCreation`'s orchestrator structurally cannot — there is no code path from it to `onBeginCreate` anywhere in the file, by design. **This is the literal cause of Problem 3** ("the conversation continues indefinitely"): Path B was never built to have an exit.

---

## 4. Working Memory capture — real in one place, entirely absent in the other

`entranceUnderstanding.ts` → `applyDiscoveryAnswerToRuntimeCreationRecord` → `RuntimeCreationRecord.workingMemory` — the same integrated system the Create Workspace Transition Review already examined.

`universalCreation` → its own `UniversalCreationSession` (`documentType`, `phase`, `confidence`, `answers`, `questionIndex`, …), stored under `"universal-creation-session-v1"`, **with zero connection to `RuntimeCreationRecord`.** Even if Problem 3 were fixed today by bolting a workspace-open onto the orchestrator, the workspace would open exactly as blank as the earlier review found — for a different reason: the data would be captured, just in the wrong place entirely, never mind whether it's *rendered*.

---

## 5. Chamber's inheritance — reconfirmed accurate on this branch

Still exactly as designed: `handleSend` calls `resolveFrictionlessAction` unconditionally regardless of active Chamber persona; `chamberMemberChatHint` is one entry among the full hint array passed to the same completion call. No separate pipeline. This part of the architecture is sound and needs no change.

---

## A genuinely good finding: my recent priority fix's blind spot is smaller than feared

I was concerned Example 4 (research mid-newsletter) wouldn't be protected by the priority fix I shipped (`b77afcbe`), since that fix only guards `entranceUnderstanding.ts`-backed sessions and "I need help writing a newsletter" hits Path B instead. Traced further: `goalClassifier.ts:159-170` has its own, **older, unconditional** rule — whenever a `universalCreationSession` is active, the turn's goal is forced to `"continue_session"` regardless of what the reply says, research-shaped or not. Static tracing through `arbitration.ts` and `executeEstateIntelligence.ts` shows this should already prevent the research-hijack for Path B sessions too — **this is a strong inference from code, not confirmed by running the pipeline**, and should be verified live before being relied on. If confirmed, Example 4 may already work correctly today, just via a different, older mechanism than the one I built.

---

## Recommended architecture

The guardrails are explicit — no separate Chat/Chamber engine, no duplicate Create logic, no keyword-only routing — and the evidence points at exactly one honest answer: **retire Path B's conversational role, converge chat's `create` goal onto Path A.** This isn't a new recommendation; it's the doorway map's already-proposed step 1, now with concrete evidence for why it's the actual root cause of every problem in this report, not just an inconsistency.

1. **Converge, don't duplicate.** `shouldEnterUniversalCreation`'s gate should stop routing conversational turns to the orchestrator's own question-asking; the goal should instead reach the shared Work Recognition / `entranceUnderstanding.ts` journey — the *one* engine, reused, exactly per the guardrail.
2. **Extend shape recognition to close Path C.** Work Recognition's detector needs a "plan an experience/event" shape (workshop, retreat, webinar — the founder's own Plan/Develop framing) so nothing typed about a workshop reaches zero handlers again.
3. **Fix the murky-fallback gate.** Require genuine uncertainty language (reuse the existing, already-correct `UNCERTAINTY_RE` pattern) before `topicPreservingFallbackLine` may fire — independent of everything else, smallest possible fix.
4. **Let the journey open a workspace, from chat.** Already the doorway map's load-bearing step 2 — without it, convergence has no finish line and Problem 3 persists regardless of which engine asks the questions.
5. **Refine the Loom-shaped disambiguation.** My current shape detector jumps straight to "develop" for "I need to know how to X" — the founder's example wants one clarifying question first ("are you trying to learn this yourself, or build a repeatable process someone else can follow?"). This is a real, small gap in what I already shipped, not a new capability.
6. **Retire `universalCreation`'s parallel session/memory** once 1 and 4 are stable — lowest urgency, pure cleanup, closes the two-Working-Memories problem.

---

## Smallest safe implementation phases

Ordered by risk, each independently shippable and checkpointed — no big-bang:

**Phase A — the murky-fallback fix.** Fully isolated to `activeTopicGate.ts`; touches no routing, no Create logic, zero cross-system risk. Ship and verify alone.

**Phase B — close Path C (workshop/event recognition).** Additive only — these requests currently reach nothing, so recognizing them can only add coverage, never regress an existing route. Same "last-chance, zero regression risk" argument as Work Recognition Step 1. Includes the Loom disambiguation-question refinement (also additive — one more question before committing to a verb).

**Phase C — converge chat's `create` goal onto the shared journey.** The real fix for Problem 1. Highest risk of the set — touches `shouldEnterUniversalCreation`, a gate shared across chat routing broadly. Needs the same `sourceExperience`-scoped safety discipline used for the ADR-013 fix, reviewed on its own before merging with anything else.

**Phase D — open the workspace from the journey, regardless of doorway.** Natural conclusion of C; the doorway map's step 2. Solves Problem 3 completely.

**Phase E — retire `universalCreation`'s parallel session.** Cleanup once C/D are proven stable in production use — not urgent, but the correct end state per the guardrails.

---

## Tests required

- Murky-fallback regression: `SPECIALTY_CLARIFY` never fires without the member's own uncertainty language present, across a representative set of confident, specific inputs (including the AI-architect example verbatim).
- "I want to create a 1 hr workshop" (and equivalent event/retreat/webinar phrasings) is recognized as Plan/Develop work and enters the journey — currently reaches nothing; this is a new-coverage test, not a regression guard.
- The AI-architect example: given purpose + audience already stated, the journey's next question is genuinely new information, never "what's murky" or a repeat of what was already said.
- Newsletter example: purpose/audience/outcome asked in the journey's own voice, never generic advice text.
- Loom example: the very first response is the disambiguating question, not an immediate "develop" commitment.
- Research-inside-newsletter (Example 4), run against **both** current mechanisms — confirm live whether `goalClassifier.ts`'s `continue_session` protection actually holds for Path B today, and again against the converged Path A behavior once Phase C ships.
- End-to-end: a chat-originated journey reaches an opened workspace with Working Memory intact — the same acceptance shape as the earlier Create Workspace Transition Review, now exercised from chat instead of the entrance.

---

## Evidence Matrix

- **Sources used:** direct trace of `lib/universalCreationPlatform/oneCreationPlatform.ts`, `lib/universalCreation/createFastPath.ts`, `lib/universalCreation/orchestrator.ts` (entry gate, turn loop, session storage), `lib/shariAnswerFirst/questionVersusAction.ts`, `lib/conversationStabilization/goalClassifier.ts` (the `continue_session` protection), `lib/conversationStabilization/activeTopicGate.ts` (`SPECIALTY_CLARIFY`, `topicPreservingFallbackLine`), `lib/sparkConversation/coachingFallback.ts`, `lib/chamber/chamberMemberAliases.ts`, `lib/estateIntelligenceRuntime/executeEstateIntelligence.ts`, `lib/conversationIntelligence/priorityEngine.ts`; cross-checked against `lib/universalCreationPlatform/oneCreationPlatform.test.ts`.
- **Sources missing / inference-only (flagged explicitly above):** whether `goalClassifier.ts`'s `continue_session` protection actually holds at runtime for a live research-mentioning reply during a Path B session; whether the AI-architect example actually reaches `activeTopicGate.ts`'s fallback in practice (depends on whether anything earlier in the turn claims it first).
- **Confidence:** High for the three-path structure, the workspace-opening dead end, and the two-memory split — all directly traced with citations. Moderate for the two flagged inference-only claims — recommend a live/integration check before Phase C relies on either.

**Approval Status:** Proposed — awaiting founder review of the phase order before any code.
**Decision Owner:** Founder.

```
Decision:   Retire universalCreation's conversational role; converge chat's
            "create" goal onto the shared Work Recognition / entranceUnderstanding
            journey. Close the workshop/event recognition hole. Fix the
            murky-fallback gate to require genuine uncertainty language.
            Let the journey open a workspace from any doorway. Retire the
            parallel UniversalCreationSession memory last, once convergence
            is proven stable.
Reason:     Three disconnected mechanisms, one of which (universalCreation)
            structurally cannot open a workspace and maintains its own
            disconnected memory; one category of request (workshop/event)
            reaches none of them; a last-resort fallback fires on domain
            match alone, not member uncertainty.
Date:       2026-08-06
Approved by:
Supersedes: —
Related systems: entranceUnderstanding.ts, lib/universalCreation/*,
            lib/estateBrain/workRecognitionFallthrough.ts,
            lib/conversationStabilization/{goalClassifier,activeTopicGate}.ts,
            docs/create-experience/UNIVERSAL_DOORWAY_CONVERGENCE_MAP.md (step 1)
Evidence used: see Evidence Matrix above
```
