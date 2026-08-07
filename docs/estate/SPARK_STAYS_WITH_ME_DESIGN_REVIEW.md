# Spark Stays With Me — Design Review

| Field | Value |
|-------|-------|
| **Status** | **Design only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Goal** | Define how Spark preserves meaningful context when a conversation pauses, changes modes, or returns later — grounded in what this codebase already has, not a greenfield memory system. |
| **Requested next step (after this review)** | Implement the continuity/memory layer — explicitly **not** authorized by this document. |
| **Priority position** | Between "Work Recognition fixes" (done) and "expand remaining Chamber experts" (deferred until this exists) — per the instruction: *"without continuity, even excellent intelligence disappears when the user leaves the conversation."* |

---

## 0. The central finding this whole review is built on

**This is not a greenfield problem.** Before designing anything new, this review mapped what memory/continuity infrastructure already exists in this codebase — including pieces built and tested but never wired into a live trigger. The finding changes the shape of everything below:

| Layer | Status | Where |
|-------|--------|-------|
| **Conversation Session spine** — `activeArtifact`, `artifactStack` (multiple paused items!), `researchState` (`idle/in_progress/complete`), `answeredQuestions` (slot-based, already maps `who`→audience, `success`→goal) | **Built and tested. Never wired into a live pause/resume trigger.** | `lib/conversationSession/types.ts`, `pauseResume.ts` |
| **Universal Creation session** — document type, discovery answers, confidence, phase | **Fully live.** Persists in `localStorage` indefinitely, survives reloads, no expiry. Not cleared by an overwhelm pause — but also not resumed as named work. | `lib/universalCreation/orchestrator.ts` |
| **A separate, live artifact pause/resume** for leaving Create to another room, with a return greeting | **Live**, but scoped to room-to-room navigation only, not emotional-state pauses | `lib/artifactState/continuity.ts` |
| **Business Brain / Companion Memory (Spec 112/117)** | **Architecture and types only** — no live write/read path for "what a founder was building," same pattern already found for Spec 114's Support mode | `lib/sparkBusinessBrain/`, `lib/sparkCompanionMemory/` |
| **"Continue Where I Left Off"** | **Live**, local-only, already uses non-surveillance copy ("Pick up our conversation," never elapsed time) | `lib/companionLedContinue.ts` |
| **Multi-day chat history** | **Does not exist as a retrievable database.** `loadConversation()` is never called anywhere — a deliberate product choice, not an oversight (*"don't reopen past chats"*, `CompanionPageClient.tsx`) | — |
| **Multiple named parked ideas in one conversation** | **Does not exist.** Existing "parking" mechanisms (Brain Parking Lot, journey `pausedWork`, decision parking) are all single-purpose and don't apply to in-progress creative threads | — |
| **Research that hands back to prior work** | **Does not exist.** Research today either stays as an LLM prompt hint (no structured handback) or navigates away to Study Hall (loses the in-progress session) | `lib/researchIntelligence.ts`, `routeEstateIntelligence.ts` |

**The design principle this leads to**: wherever the Conversation Session spine's existing shape already fits, this review proposes wiring it up, not replacing it. Only two genuinely new pieces are proposed at all (§4's possibility roster, §3's research sub-phase) — everything else is "connect what's already built."

---

## 1. Scenario 1 — Support → Build transition

> "I'm overwhelmed creating a workshop for ADHD entrepreneurs." → Support. → "Okay, let's work on it." → Spark remembers workshop, ADHD entrepreneur audience, original goal.

**Current, traced behavior** (confirmed in `END_TO_END_FOUNDER_JOURNEYS_VALIDATION.md` §2): the Support Gate correctly blocks Create Fast Path on the overwhelm turn — but *because* it blocks before Universal Creation ever starts, nothing captures "workshop" or "ADHD entrepreneurs" anywhere. The later "let's work on it" starts a **fresh** discovery session with no memory of turn 1.

**Design**: capture happens at the exact point the Support Gate already fires — the same integration point built in Work State Priority Phase 2 (`CompanionPageClient.tsx`'s Create Fast Path condition). When the gate returns `"pause"` **and** the paused text also matches a real work object (`isSimpleCreateRequest` or `detectUniversalDocumentType` would have said yes), write a **paused artifact** to the Conversation Session spine using the *already-built, already-tested* `setActiveArtifact` → `pauseActiveArtifact` pair — no new storage shape needed:

```
SessionArtifact {
  itemType: "workshop",
  documentType: "workshop",
  status: "paused",
  pausedAt: <now>,
  title: "workshop for ADHD entrepreneurs",   // extracted from the paused text itself
}
```

The founder-supplied detail ("ADHD entrepreneurs") is not a new memory type — it's exactly what Universal Creation's own newsletter flow *already* extracts from an opening sentence to prefill the `who` slot (`documentCreationProfiles.ts`'s existing "business" → `who: true` pattern, confirmed live in this session's own end-to-end validation). The same extraction logic, applied to the *paused* sentence instead of a *starting* one, is the only new logic this scenario needs.

**On the resume turn**: when the Support Gate returns `"proceed"` and a paused artifact exists on the stack for a matching or unspecified document type, Universal Creation's `startUniversalCreationTurn` should check for a resumable paused artifact **before** starting a blank session — call `resumeArtifact(id)` (already built, already tested) instead of creating a new session from scratch, and seed the discovery `answers`/`confidence` from the paused artifact's captured detail exactly the way "business" already seeds `who` today.

**Resulting response** (matches the given example): *"Great. Let's work on the workshop. Since this is for ADHD entrepreneurs, let's first decide what transformation you want participants to experience."* — this is not new copy invented for this review; it's Universal Creation's own existing "why" opening question (*"What transformation do you want?"*, confirmed live for Events-flavored discovery) with the audience already filled in, exactly as newsletter already demonstrates today for a single turn.

---

## 2. Scenario 2 — Research interruption

> Build begins → "I need some statistics first." → Research becomes part of the same work → returns to "Now that we understand the audience, let's continue shaping the newsletter."

**Current, traced behavior**: `ConversationSession.researchState` already has exactly the right shape (`idle | in_progress | complete`, plus `query`/`summary`/`findings`) — but nothing writes to it from a live UC discovery turn. Today, a mid-discovery research need either (a) gets treated as a plain discovery answer with no real research happening, or (b) triggers navigation to Study Hall, which **leaves** the newsletter session behind entirely.

**Design**: add one new phase value to Universal Creation's own state machine — a `researching` sub-phase that sits *inside* an active session rather than replacing it (the session's `documentType`, `answers`, and `confidence` gathered so far are preserved untouched, not cleared). Trigger: the *existing* `UNCERTAINTY_RE` detection (already live, already distinguishes real uncertainty from an ordinary answer) combined with a factual-question shape ("statistics," "data," "numbers," "how many") rather than a pure decision-uncertainty shape ("I don't know," "whatever works") — these are two different needs already partially distinguished by the uncertainty menu's own three options (recommend / examples / **research**), just never actually executed as real research today.

Sequence:
1. `researchState.status` → `"in_progress"`, `query` set to the founder's actual question, session's discovery phase **paused, not cleared** (mirrors §1's paused-artifact pattern — this is the *same* pause/resume shape applied to research instead of emotional overwhelm).
2. Research resolves (via whatever the eventual research capability is — this review does not design or choose that mechanism, see §7 non-goals) → `researchState.status` → `"complete"`, `summary`/`findings` populated.
3. Universal Creation resumes **the exact next discovery question it was about to ask**, not a new opening question — the resume message names what was just learned before continuing: *"Now that we understand the audience, let's continue shaping the newsletter."*

**This is the finding worth stating plainly, exactly as flagged**: the flow is **Build → discover missing information → research → return → continue building** — one continuous arc, never **Build OR research** as two competing, mutually-exclusive modes. The design's job is to make research a *sub-step inside* the existing discovery phase, using the session's already-designed `researchState` field, not a separate destination the founder has to be routed to and back from.

---

## 3. Scenario 3 — Multi-day return

> Day 1: captures goal, audience, desired experience. Day 3: "Let's continue." → Spark knows what they were building, where they stopped, the next helpful step.

**Current, traced behavior**: Universal Creation's own session **already persists indefinitely** in `localStorage` with no expiry — a founder returning on Day 3 in the *same browser* would technically still have Day 1's `documentType`, `answers`, and `confidence` sitting there untouched. The gap is not storage; it's **recognition and quiet surfacing**: nothing today proactively tells the founder that dormant work exists, and it's untested whether a bare "Let's continue" on Day 3 (with no recent conversational context) correctly reconnects to that dormant session versus being treated as unrelated small talk.

**Design, reusing what's already live**: `lib/companionLedContinue.ts` already resolves a prioritized "what to offer to continue" decision using a **memory cue** abstraction (`conversationOption`/`memoryCueFromLastActivity`) — this is the *exact* mechanism this scenario needs, extended with one new option source: a dormant Universal Creation session. No new continuity engine — a new **input** to the one that already exists.

```
if a dormant UC session exists (not touched this browser session, not complete):
  offer a CompanionContinueOption:
    title: <documentType>,               // "client onboarding process"
    subtitle: "Pick up where we left off" // matches existing copy style, never elapsed time
    conversationCue: <built from session.answers + session.documentType>
```

The cue itself should be built directly from data **already captured** in the session's `answers` (keyed by discovery slot — `who`, `why`, `success`) — summarized in one sentence, not the raw Q&A transcript. This is where §5's "recoverable, not overwhelming" principle becomes concrete: the cue is a *sentence*, never a dump of every prior answer.

**On "Let's continue" itself**: this bare phrase should be recognized as a resume trigger whenever a dormant UC session exists and no other active conversational context claims it — this is a narrow, testable addition to Universal Creation's own continuation detection (`isCreateWorkflowContinuation`/`universalCreationContinuation`, already live), not a new system.

**Resulting response** (matches the given expectation, using only data already in the session): *"Picking up the client onboarding process — last time we said it's for new clients, and you wanted it to feel [captured `success` answer]. Want to keep going with [next unanswered slot]?"*

---

## 4. Scenario 4 — Multiple ideas, not blended

> "I have ideas for a workshop, a newsletter, and a course." → Spark separates ideas, active work, and parked possibilities — never blends them.

**Current, traced behavior**: Universal Creation supports exactly **one** active document type at a time. Chamber's own structural conjunction-split mechanism (built for Chamber Activation V2, `lib/chamberExpertise/textMatch.ts`'s `splitOnConjunctions`) already proves the *detection* half of this problem is solved territory — it already splits "X and Y and Z" into independent clauses and scores each one separately. Nothing today applies that same detection to **document-type/artifact intent** rather than expert-lens intent, and nothing turns three named ideas into three distinguishable, addressable things.

**This is the one scenario needing a genuinely new small concept**, not just wiring: `SessionArtifact.status` today only supports `"active" | "paused" | "complete"` — there is no `"possibility"` status for something *named but not yet started*. Proposed addition (a value, not a new type):

```
SessionArtifactStatus = "active" | "paused" | "possibility" | "complete"
```

**Design**:
1. Reuse `splitOnConjunctions` (already built, already tested against false positives) to detect a multi-idea message.
2. For each named idea, run the existing `inferDocumentTypeFromCreateText`/`detectUniversalDocumentType` against its own clause — reusing exactly the detection this codebase already has, the same way Chamber's own structural co-primary detection reuses topic/outcome matching per clause.
3. Push one `SessionArtifact` per named idea onto `artifactStack` with `status: "possibility"` — never `"active"`, so none of them silently starts a discovery session.
4. Spark's response names all three, distinguishably, and asks **one** question (never a menu of three): which one, if any, feels most alive to start with right now — leaving the response able to also say "or none of these yet, that's okay too," since naming ideas is not the same as committing to build one (a distinction this codebase's own Brain Parking Lot / Clear My Mind philosophy already protects for exactly this reason).
5. The two *not* chosen remain on the stack as `"possibility"` entries — addressable by name later ("what about that newsletter idea?") without having ever been silently dropped or force-started.

---

## 5. Scenario 5 — Founder changes direction

> "I started creating a workshop, but now I think I need to create a lead magnet first." → Spark adapts, does not force the old path.

**Current, traced behavior**: there is no existing test or wiring for this exact case, but the pieces line up cleanly: `pauseActiveArtifact` (already built, already tested) exists precisely to move a currently-`"active"` artifact to `"paused"` on the stack, and `setActiveArtifact` exists precisely to start a new one as the new active item.

**Design**: when a founder's message both (a) references an in-progress artifact from a different angle ("I started creating X") and (b) names a new, different document type as the new priority ("but now I need Y"), the correct sequence is exactly `pauseActiveArtifact("founder changed direction")` immediately followed by `setActiveArtifact({ itemType: newType, ... })` — two already-built functions, called in sequence, never invented. The workshop is not lost (`status: "paused"` on the stack, resumable later by name, matching §1's own resume mechanism), and the lead magnet starts cleanly without any artificial insistence on finishing the workshop first.

**The single new piece of judgment needed** (not new infrastructure): distinguishing "I need to pause X for Y" (this scenario) from "I'm frustrated with X and want to abandon it entirely" (a different, harder case this review does not attempt to solve) — a design detail for the eventual implementation phase to work out carefully, flagged here rather than glossed over.

---

## 6. The three added principles — and how they map onto rules this codebase already has

None of these are new to the codebase's own constitution; this review's job is to show precisely how "Spark Stays With Me" must comply with rules already binding elsewhere, not invent new ones.

### 6.1 "Context should be recoverable, not overwhelming"

Directly the **Hidden Work Engine's Iceberg Principle** already governing this whole codebase (`docs/SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md`): *"~10% visible... ~90% submerged."* Every design above keeps the *stored* context rich (full `answers`, full `documentType`, full `researchState`) while the *surfaced* cue is always one sentence — never a transcript, never a "here's everything I remember" dump. This is the same discipline already applied to Chamber's own hint construction (the member never sees the internal hint, only Shari's shaped response).

### 6.2 "Founder controls the transition" (an extension of Founder-led, never system-timed)

Every trigger designed above is a **founder utterance**, never a timer, turn-count, or elapsed-time check — exactly the structural guarantee already proven for the Support Gate (`resolveSupportGate` takes no time-based input at all, confirmed in `END_TO_END_FOUNDER_JOURNEYS_VALIDATION.md` §5). This review extends the *same* guarantee to memory specifically: nothing above ever fires because "enough time has passed" — only because the founder said something ("let's work on it," "let's continue," a new idea, a research question).

### 6.3 "Spark should not interrupt... it should be 'when you return, here's where we left off'"

This is **already a binding rule**, not a new one: Entrepreneurial Resilience (T-007) explicitly states *"Long absence — never: 'Welcome back' · 'We missed you' · day-count surveillance"* and prescribes *"I'm glad you're here"* framing instead. `companionLedContinue.ts`'s existing copy ("Pick up our conversation") already complies. **The one thing this review adds to that existing rule**: it must extend explicitly to Universal Creation sessions and Chamber-informed work, not just the general "last activity" cues already covered — §3's design is written to use the *same* non-surveillance copy pattern already proven, not a new one.

---

## 7. Non-goals (explicit, per "do not build yet")

- No code implemented by this document.
- No new memory engine, Business Brain wiring, or database schema — every design above deliberately reuses `ConversationSession`'s existing shape, adding at most one enum value (§4's `"possibility"` status).
- Does not choose or design the actual research *mechanism* invoked in §2 (whether that's the existing LLM-hint path, a future structured research capability, or something else) — only the state-machine shape that lets research happen *without leaving* the session, regardless of which mechanism eventually fills it.
- Does not resolve §5's "pause vs. abandon" distinction — flagged as a real design question for the implementation phase, not solved here.
- Does not implement multi-day chat *history* (the deliberate "don't reopen past chats" product choice is treated as a constraint to design around, not a decision this review revisits).
- Does not specify exact UI/copy beyond the response examples already given in the original request (reused verbatim where provided) and the existing `companionLedContinue.ts` copy style (reused, not rewritten).

## 8. Recommended acceptance tests (design-level, for the eventual implementation)

| # | Scenario | Asserts |
|---|----------|---------|
| AT-1 | Support → Build | A paused-during-overwhelm artifact captures document type + one extracted detail; the resume turn's first UC question already reflects that detail without asking for it again |
| AT-2 | Support → Build (negative) | A founder who never returns to the topic never gets an unprompted "want to work on the workshop?" — no proactive re-offer exists anywhere in this design |
| AT-3 | Research interruption | `researchState` transitions idle → in_progress → complete without `answers`/`confidence` being reset; the resume message names what was learned before continuing |
| AT-4 | Multi-day return | A dormant UC session (no session-storage clear, `updatedAt` old) produces exactly one, single-sentence continue cue built from `answers` — never the raw Q&A list |
| AT-5 | Multi-day return (negative) | The cue never states elapsed time or day count in any form |
| AT-6 | Multiple ideas | Three named ideas in one message produce three distinct `"possibility"` artifacts, zero of which become `"active"` automatically; exactly one clarifying question is asked |
| AT-7 | Multiple ideas (negative) | None of the three ideas' content is blended into a single combined response |
| AT-8 | Direction change | The original artifact's status becomes `"paused"` (never `"complete"`, never deleted) the moment a new one becomes `"active"` |
| AT-9 | Cross-cutting | Every trigger across AT-1–AT-8 is traceable to a founder utterance in a test's input text — none can be triggered by advancing a clock or a turn counter alone |

## 9. Suggested implementation sequencing (once authorized — not started here)

Mirroring how every other phase in this body of work was sequenced — smallest, most reusable piece first:

1. Wire `pauseActiveArtifact`/`resumeArtifact`/`setActiveArtifact` (already built, already tested) into the Support Gate's PAUSE branch and Universal Creation's own start/continuation logic — closes Scenario 1 and most of Scenario 5 using zero new types.
2. Add the `researching` UC sub-phase and wire `researchState` transitions around the existing uncertainty detection — closes Scenario 2.
3. Extend `companionLedContinue.ts` with a dormant-UC-session cue source, reusing its existing memory-cue shape — closes Scenario 3.
4. Add the single new `"possibility"` status value and the clause-per-idea detection reusing `splitOnConjunctions` — closes Scenario 4, the only piece needing genuinely new (if small) infrastructure.

Each step should get its own founder-language validation round before the next begins, the same discipline used throughout Chamber Activation V2 and the Work State Priority Model.
