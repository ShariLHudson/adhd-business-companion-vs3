# Spark Work Memory Model

| Field | Value |
|-------|-------|
| **Status** | **Design only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Purpose** | Clarify how existing continuity systems connect with ideas, possibilities, projects, creations, research, and saved knowledge — as they actually exist today, not as they're assumed to exist. |
| **Depends on** | `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` (approved) — this document goes one layer deeper: not "how do we design continuity," but "what do all these object names actually mean, and how — if at all — do they relate to each other right now." |
| **Follow-up to** | Investigation done specifically for this document found the underlying reality is more fragmented than the prior review's scope required knowing. This document reports that honestly before proposing any unifying model. |

---

## 0. The honest starting fact

**A founder's creative work has no single canonical home today.** Building a newsletter through chat can simultaneously exist as a `UniversalCreationSession`, a `SessionArtifact` mirror, and — only if the founder happens to use a *different* entry point (the Create panel, not the chat conversation) — a `SavedWorkItem` and optionally a `Project`. These are not the same object with different names; they are genuinely separate records, in separate `localStorage` keys, with at most one soft, one-directional link (`SavedWorkItem.projectId`) and no shared lineage field connecting any of them back to where the work started.

This document maps that reality precisely first (§1), then defines the transitions, memory boundaries, and return-to-work model the request asked for (§2–§5) — designed to connect what exists via the **lightest possible addition**, not a rebuild of any of these systems.

---

## 1. What each object represents

### 1.1 `activeArtifact` / `artifactStack` (`lib/conversationSession/types.ts`)

**What it is**: the Conversation Session spine's own lightweight *mirror* of whatever creative work is currently in motion during a chat conversation. `activeArtifact` is the one thing being worked on right now; `artifactStack` holds everything else that's been paused (or, per the prior review's Scenario 4 proposal, named-but-not-started).

**What it represents conceptually**: "what is Shari's attention currently on, within this conversation" — not a durable save, not a finished product. A `SessionArtifact` is a *pointer and a small amount of state* (`itemType`, `documentType`, `title`, `draftContent`, `status`), not the work itself.

**Status values**: `active | paused | complete` today (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4 proposes adding `possibility` — not yet built).

### 1.2 `possibility` status (proposed, not built)

**What it would represent**: something *named* by the founder but never started — "a workshop, a newsletter, and a course" mentioned in one breath, none of them chosen yet. Distinct from `paused` (which implies real progress exists to resume) — a `possibility` has a name and nothing else. This is the one genuinely new concept in this whole model; everything else below already exists in some form.

### 1.3 `UniversalCreationSession` (`lib/universalCreation/types.ts`)

**What it is**: the actual, detailed engine state for an in-progress chat-based creation — document type, every discovery answer, confidence score per slot, current phase, draft content. This is the *real* record; `SessionArtifact` is its digest.

**What it represents conceptually**: "the live conversation about building this specific thing." It exists only while that conversation is active or recently paused — it is not, today, a durable "finished work" record (see §1.6).

### 1.4 `researchState` (`lib/conversationSession/types.ts`)

**What it is**: a small, already-shaped field (`idle | in_progress | complete`, plus `query`/`summary`/`findings`) sitting on the same Conversation Session spine as `activeArtifact`.

**What it represents conceptually**: research is not a place the founder goes — it's a *state a piece of work can be in*, the same way `activeArtifact` can be `active` or `paused`. This field already models exactly the relationship the request asks to preserve (§6.4 below) — it was simply never wired to anything live (per the prior review's finding).

### 1.5 "Create workspace" (Universal Creation + the Create panel — two related but distinct entry points)

There are, today, **two different paths into "creating something"**, and this distinction matters for this whole model:

| Path | Mechanism | Produces |
|------|-----------|----------|
| **Chat-based creation** | Universal Creation discovery, inside the conversation (`isSimpleCreateRequest` → `startUniversalCreationTurn`) | A `UniversalCreationSession` + `SessionArtifact` mirror. **Does not** produce a `SavedWorkItem` on its own. |
| **Create panel** | A dedicated workspace UI (Content Generator) | Can call `createProjectFromDocument()`, producing a `SavedWorkItem` **and optionally** a `Project`. |

**This is the single most important fragmentation this document found**: finishing a newsletter through the *conversation* leaves it as a draft inside `universal-creation-session-v1` and the conversation spine — genuinely real, genuinely persisted, but not retrievable later the way a `SavedWorkItem` is. Finishing the *same kind of document* through the Create *panel* produces something durable and linkable to a Project. Today, which path a founder took determines whether their finished work has a durable home — that should not be a distinction a founder ever has to know exists.

### 1.6 `SavedWorkItem` (`companion-saved-work-v1`)

**What it is**: the actual durable record of a completed piece of work — the closest thing this codebase has to "a finished creation the founder can find again." Has an optional, one-directional `projectId`/`projectName` link.

**What it represents conceptually**: this is the record §1.5's chat-based path *should* produce on completion, and currently does not.

### 1.7 `Project` (`lib/companionStore.ts`, "Goals & Projects")

**What it is**: a goal-oriented container — `name`, `goal`, `goals[]`, `horizon`, `status`, `nextAction`, `notes`. Lives in `companion-projects-v1`. This is a **live, chat-and-Chamber-wired** system — `lib/estate/chamberProjectEngine.ts` creates/updates real `Project` records.

**What it represents conceptually**: a *goal*, not a *piece of work*. A Project can contain many creative works, decisions, and conversations over time — it is the right container for "this is the client-onboarding initiative," while a `SavedWorkItem` or `SessionArtifact` is the right container for "this specific SOP document."

**Relationship to Create work**: only linked when a founder explicitly attaches a Saved Work item to a Project — never automatic, never inferred.

### 1.8 "Spark Cards" — two different things share this name, and neither is what this model needs

This needs to be stated plainly because it's easy to assume otherwise: **Spark Card™ (the architecture referenced in the Ecosystem Connection Framework's "Living cycle") is types-only — no catalog, no store, no chat wiring exists.** It represents curated entrepreneurial wisdom (a framework of questions and capability domains), not a saved piece of a founder's own work. There is a *separately named*, actually-live "SparkNote" daily-card feature with overlapping vocabulary in its own code comments, but it is unrelated — a daily delight/reflection surface, not a record of in-progress or completed creative work.

**Conclusion for this model**: Spark Cards are **not** part of the founder's work-continuity chain today, in either of their two existing meanings. If a card-like "here's what you made" surface is ever wanted, it would need to be built on top of `SavedWorkItem` (§1.6), not on the existing Spark Card or SparkNote systems, which serve different purposes entirely.

### 1.9 Chamber conversations (`lib/chamberExpertise/`, `lib/chamberIntelligence/`)

**What it is**: Chamber activation is **stateless by design** — it computes which expert lens(es) should inform Shari's thinking *for this turn*, as an internal LLM-prompt hint, and remembers nothing between turns on its own. It is not, and was never intended to be, a persistence layer.

**What it represents conceptually in this model**: Chamber conversations are the *reasoning that shapes a moment of work*, not a record of the work itself. The natural (and currently unbuilt) connection point is **light metadata on whichever object turns out to be canonical for a piece of work** (a `SessionArtifact`, eventually a `SavedWorkItem`) — e.g., "this SOP's discovery was informed by Systems + Client Relationships thinking." This is not required for Chamber to keep working correctly; it would only ever be a quiet enrichment, never a dependency Chamber relies on.

### 1.10 "Saved knowledge" (Business Assets / Gallery)

**Business Assets** (the concept referenced in the Business Brain memory rules as "where knowledge belongs") **do not exist as a runtime system** — architecture and vocabulary only, the same status as Spec 112/117's Business Brain memory found in the prior review. **Gallery** has a built estate-walk UI with seed content, but no path from a founder's own completed Create work into it. Neither is a candidate for "where finished work lives" today — that role, imperfectly, belongs to `SavedWorkItem` (§1.6).

---

## 2. When something moves from one state to another

```
Founder names or starts something
        │
        ▼
┌─────────────────┐   founder chooses to start it   ┌──────────────────┐
│   possibility    │ ───────────────────────────────▶│      active       │
│ (named, nothing  │                                  │ (UniversalCreation │
│  started yet)    │◀─── founder names it, doesn't ───│  session live,     │
└─────────────────┘        start it yet               │  SessionArtifact   │
                                                        │  mirrors it)       │
                                                        └─────────┬─────────┘
                                                                  │
                            ┌─────────────────────────────────────┼─────────────────────────┐
                            │                                     │                         │
                 founder expresses distress               founder needs a fact      founder finishes
                 (Support Gate → pause)                    mid-discovery                    │
                            │                                     │                         ▼
                            ▼                                     ▼                ┌──────────────────┐
                  ┌──────────────────┐                 ┌──────────────────┐        │     complete      │
                  │      paused       │                 │  researchState:   │        │ (SHOULD become a  │
                  │ (on artifactStack,│                 │   in_progress     │        │  SavedWorkItem —   │
                  │  resumable by     │                 │ (same session,    │        │  today, does NOT,  │
                  │  founder utterance│                 │  not left)        │        │  chat-path gap)   │
                  │  only — never a   │                 └────────┬─────────┘        └──────────────────┘
                  │  timer)           │                          │
                  └─────────┬─────────┘                 research resolves
                            │                                     │
                 founder returns, calm                            ▼
                 language, names it again                ┌──────────────────┐
                            │                             │ active (resumed  │
                            └────────────────────────────▶│  at the exact    │
                                                           │  next question)  │
                                                           └──────────────────┘
```

**Governing rule for every arrow above**: every transition is triggered by something the founder said in this turn — never a turn count, a timer, or an elapsed-time check. This is not a new rule invented for this diagram; it is the same structural guarantee already proven for `resolveSupportGate` (Work State Priority Model) and restated here because it applies identically to every object in this document, not just the Support Gate's own decision.

**Separately, at the Project layer** (a slower-moving, less frequent transition): a `Project`'s `status` changes only through explicit founder action inside the Goals & Projects workspace — it is not touched by anything in the diagram above, because a Project is a goal container, not a piece of in-progress work (§1.7).

---

## 3. What Spark remembers

| Layer | What's remembered | How long |
|-------|---------------------|----------|
| `UniversalCreationSession` | Full discovery answers, confidence, phase, draft content | Indefinitely, until explicitly cleared (no expiry today) |
| `SessionArtifact` / `artifactStack` | A digest — type, title, draft pointer, status, when paused | As long as the Conversation Session persists |
| `researchState` | The question asked and what was found | For the life of the session that asked it |
| `Project` | Goal, sub-goals, horizon, status, next action | Indefinitely — explicit founder-owned record |
| `SavedWorkItem` (when the Create panel path is used) | The finished content itself | Indefinitely — the durable record |

**What Spark remembers is always the *shape* of the work — document type, key answers, what was learned — never a transcript.** This is the direct, structural expression of "recoverable, not overwhelming" (§6.1): the stored data is rich enough to resume from, but a founder is never shown "here is everything you told me" as a wall of prior text — only a single-sentence cue built from it (per `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §3's proposed cue design).

---

## 4. What Spark intentionally does not remember

- **Full chat transcripts across days.** Confirmed in the prior review: `loadConversation()` is never called anywhere — a deliberate product choice ("don't reopen past chats"), not a gap. This model does not revisit that choice; it works around it by remembering *structured* state (discovery answers, artifact status) rather than *conversational* history.
- **Elapsed time or day counts, in any stored or surfaced form**, for the purpose of prompting a founder about absence. (Timestamps like `pausedAt` exist for internal ordering — they are never meant to be surfaced as "it's been 3 days.")
- **Emotional state history.** `emotionalState` is read per-turn (from `detectEmotionalState`) and can be attached to a session snapshot, but this model does not propose tracking a founder's emotional pattern over time — only using the *current* turn's state to decide the *current* transition, exactly as `resolveSupportGate` already does.
- **Which specific Chamber experts activated, as a permanent log.** Per §1.9, Chamber's per-turn reasoning is not something this model proposes recording as history — at most, a light, current-state note on an active artifact ("this SOP is being shaped with Systems + Client Relationships thinking"), overwritten each time it's recomputed, never accumulated into a log a founder would need to review.
- **Ideas the founder explicitly abandons.** A `possibility` that a founder says they're no longer interested in should be removable from the stack entirely, not archived indefinitely — remembering everything forever is its own form of overwhelm.

---

## 5. How a founder returns to unfinished work without reconstructing context

This draws directly on `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §3, restated here in terms of this document's fuller object map:

1. **Within one active conversation**: the founder never has to ask "where were we" — the `SessionArtifact`'s `status` and the `UniversalCreationSession`'s own `answers`/`phase` already carry everything forward turn to turn. This already works today for a single continuous conversation.
2. **After a pause (support, research, or a direction change)**: resuming is triggered by the founder's own returning language, using the already-built `resumeArtifact(id)` — the founder says something like "let's work on it," and the specific paused artifact (not a generic "what were you doing") is what resumes, because it was captured with enough shape (`documentType`, a key extracted detail) to be named back to them.
3. **After leaving the app entirely** (§1.5's Universal Creation session, which persists indefinitely): `companionLedContinue.ts`'s existing "what should I offer to continue" resolver is the right, already-live place to surface a dormant session — extended (not replaced) with one new input source, as the prior review proposed, using its already-proven non-surveillance copy style.
4. **Across multiple named possibilities**: the founder can return to any one of several `possibility`-status items by naming it ("what about that newsletter idea?") — they are never asked to remember an internal list; Spark holds the list, the founder only ever needs to remember what they called something.
5. **Once work is actually finished**: this is the one place this document identifies a real fix needed, not just a connection to design — chat-based Universal Creation completion should produce a `SavedWorkItem` the same way the Create panel path already does, so "finished" work has the same durable, findable home regardless of which door the founder walked through to build it.

---

## 6. How the five principles are preserved

### 6.1 Recoverable, not overwhelming

Every object in §1 stores rich, structured state — but §3/§5 are explicit that what's ever *surfaced* to a founder is a single sentence built from that state, never the raw record. This is true uniformly across every object type in this document, not just conversation cues — a returning-to-a-Project experience should follow the identical discipline (one sentence: goal + next action, never the full task history dumped at once).

### 6.2 Founder-led transitions

Every arrow in §2's diagram is labeled with what the founder said or did — none are labeled with a duration, a count, or a system-side judgment call. This applies identically whether the transition is Support→Build, a research detour, or a Project status change: all are founder-initiated, none are system-timed.

### 6.3 No surveillance behavior

§4 makes this an explicit *non-memory*: elapsed time, absence duration, and emotional-state history are named as things this model does not track for the purpose of commenting on them. Where a timestamp exists at all (`pausedAt`, `updatedAt`), its only legitimate use is internal ordering (which artifact was paused most recently, for the founder's own convenience when several exist) — never member-facing framing.

### 6.4 Research is part of the journey, not a separate path

§1.4 and §2's diagram place `researchState` as a *state a piece of work passes through*, structurally on the same object (`ConversationSession`) as the artifact itself — not a different room, not a different session, not a hop the founder has to be routed through and back from. The object model itself enforces "part of the same work," because there is only one record, with a field that changes, rather than two records the founder has to be shuttled between.

### 6.5 Expertise follows purpose, not keywords

This principle governs §1.9's Chamber relationship specifically: Chamber conversations are never proposed as a *stored history* keyed by which keyword matched — if attached to an artifact at all, the note describes *what the work needed* ("Systems + Client Relationships thinking," a purpose-shaped description) never *which triggers fired*. This keeps the same discipline `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §11 already established, applied to memory instead of activation.

---

## 7. Non-goals (explicit)

- No code implemented by this document.
- Does not propose consolidating `UniversalCreationSession`, `SessionArtifact`, `SavedWorkItem`, and `Project` into one unified data model — that would be a much larger, riskier undertaking than this request's scope. This document proposes *connecting* them (lightly, via the codebase's own existing `originatedFromId`/`originatedFromKind` lineage pattern, already mandated by this codebase's Intelligence-Ready Architecture rule for exactly this situation) rather than replacing any of them.
- Does not design the mechanics of the one real gap this document found (chat-based Universal Creation completion not producing a `SavedWorkItem`) — names it precisely as a needed future fix, does not spec the implementation.
- Does not revisit the "no chat history database" product decision.
- Does not propose building Spark Cards, Business Assets, or Gallery write-paths — clarifies that none of them are part of this continuity model today, without proposing to make them so.
- Does not change anything about how Chamber activation itself works — only describes the (currently nonexistent) connection point between Chamber's reasoning and a persisted work object.

Stopping here, per the request — no implementation, no further design artifacts, until this is reviewed.
