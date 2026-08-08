# Work Identity Model

| Field | Value |
|-------|-------|
| **Status** | **Design only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Purpose** | Define the canonical identity of meaningful work in Spark — not a new storage system, a thin identity layer that lets the systems already investigated (`SPARK_WORK_MEMORY_MODEL.md`) refer to the same piece of work without being merged or duplicated. |
| **Precedes** | Exploration and Spark Stays With Me implementation — explicitly not started by this document. |
| **Builds on** | `SPARK_WORK_MEMORY_MODEL.md` (object map), `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` (continuity scenarios) — this document answers the question those two left open: *what makes two representations "the same work" in the first place?* |

---

## 0. The answer, stated first

**A piece of work's canonical identity is a single, small, shared reference — not a bigger object, not a merged table, not a new system of record.** Every existing system keeps exactly what it already stores. What's missing is not a place to put more data; it's a way for a `UniversalCreationSession`, a `SessionArtifact`, a `SavedWorkItem`, and a `Project` to all say "we are talking about the same thing," using the codebase's own already-mandated `originatedFromId` / `originatedFromKind` lineage pattern (Intelligence-Ready Architecture rule) rather than inventing a new one.

This directly satisfies **"do not create duplicate systems"**: nothing proposed here stores content. It only proposes that the content already being stored, everywhere it already lives, carries one small, consistent pointer back to where the work began.

---

## 1. What is the canonical representation of a piece of work?

**A `WorkIdentity` is not a record you query — it's a value every existing record carries.**

```
WorkIdentity = {
  workId: string,              // stable, assigned once, at the moment real commitment begins
  kind: string,                // "workshop" | "newsletter" | "sop" | ... — the SAME vocabulary
                                // Universal Creation's own documentType already uses
  originatedFromId?: string,   // the codebase's own existing lineage field
  originatedFromKind?: string, // ditto — reused, not reinvented
}
```

This is deliberately almost nothing. `SessionArtifact` already has `documentType`; `SavedWorkItem` and `Project` already have ids; `originatedFromId`/`originatedFromKind` already exist elsewhere in the codebase as a general lineage mechanism. `WorkIdentity` is the *discipline* of putting the same `workId` on all of them, not a new schema to build and maintain in parallel.

**When is a `workId` assigned?** At the moment real commitment begins — the first turn `UniversalCreationSession` actually starts discovery (§5 addresses why this matters, given exploratory mentions today prematurely trigger this same moment — a gap this document names, not fixes). Never at a passing mention, never for a `possibility`-status entry (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4) — those remain nameless-but-named ideas until a founder actually starts one, at which point *that's* when a `workId` is minted.

---

## 2. How different entry points attach to the same work

Every entry point keeps doing exactly what it does today — the only addition is that each one, at the moment it touches a piece of work, checks for (and if absent, mints) a `workId`:

| Entry point | What it already produces | What it additionally carries |
|-------------|-----------------------------|----------------------------------|
| Chat-based creation (Universal Creation) | `UniversalCreationSession` | `workId` set on session start; `documentType` already matches `kind` |
| Conversation Session mirror | `SessionArtifact` | Same `workId`, copied when the UC adapter dual-writes (it already dual-writes today — this just adds one field to what it copies) |
| Create panel completion | `SavedWorkItem` | `originatedFromId = workId`, `originatedFromKind = "conversation"` if it came from a chat session that had one; otherwise unset (a panel-only creation with no prior chat identity — perfectly valid, not every piece of work needs to have started in conversation) |
| Explicit "attach to Project" | `Project` reference on `SavedWorkItem` | Unchanged — this link already exists (`projectId`); `workId` travels alongside it, not instead of it |
| Chamber activation | (nothing persisted today) | If ever attached to an artifact (`SPARK_WORK_MEMORY_MODEL.md` §1.9's proposed light note), it's keyed by the same `workId` — never its own parallel record |

**This is the direct, mechanical answer to "doorway should not determine destiny."** Today, finishing a newsletter via chat versus via the Create panel produces two disconnected records because *nothing* travels between them. With a `workId` assigned once and carried everywhere the work is touched, which door a founder walked through stops mattering — both doors write into records that share the same identity, even though the records themselves (rightly) stay different shapes for different purposes.

---

## 3. What becomes durable

Durability is **intentional, not automatic** — the fourth principle, made concrete:

| Becomes durable when... | Record | Why this, not automatic |
|--------------------------|--------|-----------------------------|
| A founder reaches Universal Creation's `"ready"`/completion state, **through either doorway** | `SavedWorkItem` (today: only via the Create panel — `SPARK_WORK_MEMORY_MODEL.md`'s named gap) | Completion is a real, founder-driven event — the discovery `"ready"` state already exists and already means "the founder answered enough for this to be real." Using *that* signal (not a timer, not an assumption) is what keeps durability intentional rather than eager. |
| A founder explicitly names a goal, in the Goals & Projects workspace | `Project` | Never auto-created from a single conversation — a Project is a bigger, longer-lived commitment than one piece of work, and should only ever be founder-declared. |
| A founder explicitly attaches a piece of work to a Project | `SavedWorkItem.projectId` | Already exactly this — one directional, explicit, never inferred. Correct as-is; not proposed to change. |

**Never durable automatically**: a `possibility` mention, an exploratory turn, a paused artifact that's never resumed, a research query. All of these can *become* durable later, only through an explicit founder action — never by existing long enough, never by accumulating enough turns.

---

## 4. What remains temporary

| Stays temporary | Record | Lifespan |
|-------------------|--------|-----------|
| In-progress discovery | `UniversalCreationSession` | Until `"ready"` (→ durable) or explicitly abandoned |
| The conversation's current focus | `SessionArtifact` / `activeArtifact` | For the life of the conversation session; a *mirror*, never itself the source of truth |
| Paused work | `artifactStack` entries (`status: paused`) | Resumable indefinitely, but never promoted to durable on their own — resuming and *finishing* is what earns durability, not merely being remembered |
| A factual detour | `researchState` | For the life of the session that asked the question — findings can inform a durable `SavedWorkItem` once finished, but the research *state itself* is never durable |
| A named-but-unstarted idea | `possibility`-status artifacts | Until chosen (→ becomes an active session, eventually durable) or explicitly dropped (§4 of the prior memory-model document: droppable, not archived forever) |
| **Exploration** | *(see §5 — this is the gap this document exists to name)* | Should be the lightest, most temporary thing in this entire model — today, it is not |

---

## 5. Exploration: the gap this document found, named plainly

**There is no genuine "just thinking, not committing" state today.** Investigated precisely for this document: Spec 107's "Exploring" conversation state is cataloged architecture the live conversation engine never actually transitions into. `ConversationSession.currentStage: "exploring"` is not a separate mode — it's a mirror of "Universal Creation discovery is incomplete," meaning it only ever fires *after* full commitment (a `UniversalCreationSession`) has already started. Estate "Discovery Mode" is real but narrow (SOP/focus/growth/research only) and never triggers for open musing.

**The consequence, verified directly**: *"I'm thinking about maybe doing a workshop sometime"* does not enter a lightweight exploration state — it triggers the exact same `isSimpleCreateRequest` → full `UniversalCreationSession` discovery flow as *"I want to create a workshop"*, because the bare word "workshop" is enough to qualify, regardless of how tentative the surrounding language is. **Doorway determines destiny here in the worst way**: a founder who was only musing gets asked "Who is the workshop for?" as if they'd committed.

**What this document proposes, at the identity level only (not the mechanism — that's implementation)**: exploratory language should be recognized as its own category *before* a `workId` is ever minted — resulting in, at most, a `possibility`-status entry (§1's "named but not started," already proposed in the prior review) or nothing persisted at all, never a full `UniversalCreationSession`. The test for "was this exploration or commitment" is not this document's to design (a Work State Priority Model-style classifier decision, for its own future review) — but the *identity* consequence is clear: **exploration should never be assigned a `workId` at all.** A `workId` marks the moment something becomes real work; musing, by definition, hasn't reached that moment yet. This is what makes "Exploration is temporary" true structurally rather than aspirationally — an idea that's still exploratory literally has no identity to persist beyond a possibility's name, so there's nothing heavy to clean up later.

---

## 6. Growth Greenhouse and Parking Lot — where they actually fit (and where they don't)

Investigated directly for this document, and worth being precise about, since both are easy to assume are more connected to creative work than they are:

**Growth Greenhouse** is a real, live estate room — but for a genuinely different identity category: personal growth (habits, skills, goals, relationships, character, and *one* category literally named `business-idea`). It is not a project incubator and has no path into Universal Creation today. **This document does not propose connecting it** — a `business-idea` placed there is closer to a diary entry about a possibility than a `possibility`-status work artifact, and conflating the two would blur a room whose entire value (per this codebase's own Estate canon) is being a *reflective*, non-productive space. If a founder later decides to actually build that idea, the natural bridge is the founder saying so in conversation — which mints a `workId` the normal way — not an automatic promotion out of the Greenhouse.

**"Parking Lot" is not one system** — it's at least four unrelated ones (Brain Parking Lot, journey `pausedWork`, Plan My Day's deferred items, Decision Intelligence parking), none of which reference each other or any creative-work identity today. This document does not propose merging them (that would itself violate "do not create duplicate systems" in reverse — collapsing genuinely different concerns into one). The one already closely related to this model is journey `pausedWork`, which already points at an `artifactId` — that pointer is exactly where a `workId` would attach, with zero new mechanism, when that work exists.

---

## 7. How a founder returns later without rebuilding context

This is where §1–§4's identity discipline pays off, restated from the founder's side rather than the system's:

1. The founder never needs to know or say a `workId` — they say "let's work on the workshop," "what about that newsletter idea," or "let's continue."
2. Whatever recognizes that utterance (Support Gate resume, `companionLedContinue`, a possibility being named) looks up **by `kind` and recency**, not by asking the founder for an identifier — the same way `resumeArtifact(id)` already works internally today, just found via natural language instead of a UI click.
3. Because every touchpoint on the same piece of work shares one `workId`, whatever comes back can draw from *all* of it — the original discovery answers, whether research happened, whether it was ever paused for overwhelm — without the founder needing to have kept any of that straight themselves, and without Spark needing to guess which of several disconnected records is the "real" one.
4. This is the direct fix for `SPARK_WORK_MEMORY_MODEL.md`'s named gap: once a `workId` exists from the moment of first commitment, *whichever* doorway eventually finishes the work can write the durable `SavedWorkItem` with that same id already attached — there's no reconciliation step needed later, because the identity was never lost in the first place.

---

## 8. Full classification (every system named in the request)

| System | Identity role | Durable? |
|--------|-----------------|----------|
| `UniversalCreationSession` | Holds the live discovery state for one `workId` | No — temporary, until `"ready"` |
| `SessionArtifact` | Conversation-local mirror of the same `workId` | No |
| `SavedWorkItem` | The durable record once real commitment completes | **Yes** |
| `Project` links | A separate, longer-lived container a `workId`'s finished output can be attached to | **Yes** (the link is explicit, not automatic) |
| `activeArtifact` | Which `workId`, if any, has the conversation's current attention | No |
| `artifactStack` | Other `workId`s paused or possible, not currently active | No (until they complete) |
| `ResearchState` | A temporary detour belonging to whichever `workId` is active | No |
| Exploration state | **Should never reach identity at all** — the gap named in §5 | N/A — that's the point |
| Parking Lot (×4 systems) | Currently disconnected from `workId` entirely; only journey `pausedWork` has a natural attachment point (`artifactId`) | No, and not proposed to become so |
| Growth Greenhouse | A different identity category (personal growth) — deliberately not connected | **Yes**, but not as work identity |

---

## 9. Principles — how each is structurally satisfied, not just stated

- **Doorway should not determine destiny** — §2's shared `workId` is the entire mechanism; both the chat and panel doorways write into it, so the founder's finished work looks the same regardless of which one they used.
- **Work should have one identity** — a `workId`, not a merged object. One small value threading through several already-correct systems, not a new canonical table replacing them.
- **Exploration is temporary** — made structural in §5 by proposing exploration never receive a `workId` at all, rather than receiving one that's simply cleaned up later. Nothing to forget if nothing was ever assigned.
- **Durable state should be intentional** — §3's table: every durability trigger is a founder action or an explicit, already-existing "ready" signal — never elapsed time, never accumulated turns.
- **Do not create duplicate systems** — the whole document is written against this constraint: no new storage, no new store, no merged schema. `WorkIdentity` is a convention (one shared field) layered onto systems that already exist and already work, exactly as they are.

---

## 10. Non-goals

- No code implemented by this document.
- Does not design the classifier that would distinguish exploratory language from real commitment (§5) — names the identity consequence, defers the mechanism to its own future review.
- Does not propose connecting Growth Greenhouse or the four Parking Lot systems to `workId` — explicitly recommends against forcing that connection (§6).
- Does not change `SavedWorkItem`, `Project`, `UniversalCreationSession`, or `SessionArtifact`'s existing shapes beyond proposing they each carry one additional, optional identity field.
- Does not resolve exactly *when* research findings should be summarized into the eventual `SavedWorkItem` — flagged as an implementation-time detail, not an identity question.

Stopping here, per the request — no implementation, no further design artifacts, until this is reviewed.
