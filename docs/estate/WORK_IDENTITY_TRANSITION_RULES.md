# Work Identity Transition Rules

| Field | Value |
|-------|-------|
| **Status** | **Design only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Purpose** | Define exactly when Spark creates, attaches, pauses, resumes, and closes a `workId` — the precise rulebook `WORK_IDENTITY_MODEL.md` left for a follow-up review. |
| **Depends on** | `WORK_IDENTITY_MODEL.md` (approved) — this document assumes that document's answer (a shared `workId`, never a merged object) and does not re-argue it. `SPARK_WORK_MEMORY_MODEL.md` and `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` — every "owning system" cited below is a mechanism those two documents already found to exist, built, or explicitly proposed; nothing here introduces a new owner. |
| **Precedes** | Exploration and Spark Stays With Me implementation — still not authorized by this document. |

---

## 0. The five verbs, defined once

Every scenario below is one or more of these five acts. Defining them once, precisely, is what makes the eight scenarios consistent rather than eight separate judgment calls:

| Verb | Means | Never means |
|------|-------|--------------|
| **Create** | Mint a brand-new `workId`, at the exact moment a founder crosses from *naming or musing* into *actually starting* one specific piece of work. | Mint one because a work-object noun appeared in the sentence. Mentioning "workshop" is not creating a workshop's identity. |
| **Attach** | Carry an *existing* `workId` onto a new record that touches the same work (a `SessionArtifact` mirror, a `SavedWorkItem`, a `projectId` link, a `researchState` entry). | Create a second `workId` for the same work because it's now visible in a different system. Attaching is always additive, never a second mint. |
| **Pause** | Move an *active* `workId`'s artifact to `paused` on the stack, preserving everything captured so far, because attention moved elsewhere. | Close it. A paused `workId` is not finished and is not abandoned — it is exactly where it was, waiting. |
| **Resume** | Reactivate a `workId` that already exists (`paused`, or a dormant Universal Creation session), continuing from what it already has. | Start a fresh `workId` "to be safe." If genuine ambiguity exists about which prior `workId` a founder means, that is a one-question clarification, never a silent new mint. |
| **Close** | End a `workId`'s active lifecycle — either by becoming durable (`SavedWorkItem`, optionally a `Project` link) or by explicit founder abandonment. | Happen automatically from elapsed time, an idle session, or a founder simply changing the subject. Closing (either direction) is always a founder-visible outcome of something the founder did or said. |

**One governing rule underneath all five, inherited unchanged from every prior document in this series**: every verb above fires because of something the founder said in this turn — never a timer, a turn count, or an idle-duration check.

---

## 1. Exploration → Work transition

> "I'm thinking about maybe doing a workshop sometime."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | No. Not before the transition, and not merely because a work-object noun ("workshop") appeared in the sentence. |
| **Why?** | `WORK_IDENTITY_MODEL.md` §5 named this exact gap: today, that keyword alone is enough to start a full `UniversalCreationSession`. This document's rule closes it structurally — a `workId` is minted only at the moment a founder's language crosses from *tentative* ("maybe," "thinking about," "sometime," "eventually," an idea named among several others) into *starting* (a direct request, or an explicit choice among named possibilities — Scenario 7 below). Until that crossing, at most a nameless `possibility`-status entry exists — which, by definition, carries no `workId` (§0's Create verb, restated: a name is not a mint). |
| **What system owns the transition?** | The same gate that already exists to decide "does this start Universal Creation" (`isSimpleCreateRequest` / `shouldEnterUniversalCreation`, `lib/universalCreation/createFastPath.ts`) — this document does not propose a new classifier system, it proposes that gate's *own* decision become the exact moment of minting, once (per the Work State Priority Model, already live) it has correctly distinguished tentative language from a real request. Getting that distinction right is a classifier question for its own future review, not this document's to re-litigate — this document only fixes *what happens once the distinction is made*: mint a `workId` on "starting," mint nothing at all on "musing." |
| **What must never happen?** | A `workId` must never be minted on the strength of a keyword alone, regardless of surrounding tentative language. A founder who was only musing must never later discover a half-finished discovery session exists that they didn't consciously start — that experience, named plainly, is what "exploration is temporary" exists to prevent. |

---

## 2. Create entry → Work identity creation

> A founder opens the Create panel (Content Generator) and begins working there directly, with no prior chat conversation about it.

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Not the moment the panel opens. It exists from the moment the panel begins producing real content tied to one specific document (a title, a document type, and genuine content taking shape) — the same threshold as the chat doorway, not a lower one. |
| **Why?** | This is the direct, mechanical test of "doorway should not determine destiny": if the Create panel minted identity merely on open, while chat requires an actual commitment signal, the two doorways would disagree about what counts as "real work" — recreating exactly the fragmentation `WORK_IDENTITY_MODEL.md` exists to close. Using the *same* criterion (genuine content taking shape, not merely a screen being visible) for both doorways is what makes them equivalent. |
| **What system owns the transition?** | The Create panel's own content-generation start (`createProjectFromDocument()` / the panel's document-session mechanism, per `SPARK_WORK_MEMORY_MODEL.md` §1.5) — an existing system, not a new one. It mints a `workId` at that point if, and only if, the work has no `workId` already attached (see §2's overlap with Scenario 3 below — a founder can arrive at the panel from a chat conversation that already minted one). |
| **What must never happen?** | The panel must never mint a *second* `workId` for work that already has one from an earlier chat conversation — it must check for and carry forward an existing identity before assuming it needs to create one. The panel must never treat "opening the tool" as equivalent to "starting the work" — an empty panel with nothing typed yet has no identity, exactly as an unstarted chat mention has none. |

---

## 3. Chat entry → Work identity creation

> A founder says, directly in conversation, "I want to create a client onboarding process."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Not before this turn. It is minted at this turn, the moment `startUniversalCreationTurn` actually begins a real discovery session for a real document type. |
| **Why?** | This is the "normal," most common doorway, and the one every other scenario in this document measures itself against. Direct, imperative language ("I want to create...") is unambiguous commitment — no tentative-language gate is needed here the way Scenario 1 requires one; the existing `isSimpleCreateRequest` check already correctly recognizes this as a start. |
| **What system owns the transition?** | `startUniversalCreationTurn` (`lib/universalCreation/orchestrator.ts`) is the single source of truth for chat-based commitment — the `workId` is minted there, once, and the `SessionArtifact` mirror (`universalCreationAdapter.ts`'s existing dual-write) **attaches** that same id rather than minting its own (§0's Attach verb — never a second Create). |
| **What must never happen?** | The `UniversalCreationSession` and its `SessionArtifact` mirror must never carry two different identity values for what is, underneath, one conversation about one piece of work — the adapter's dual-write is where this would silently go wrong if not made explicit, so it is named here precisely: the mirror always attaches, never mints. |

---

## 4. Project linking

> A founder explicitly attaches a finished (or in-progress) piece of work to a Project — "add this to the client onboarding initiative."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Almost always yes already, by the time linking happens — Project linking is an explicit, founder-initiated act that happens *to* a `SavedWorkItem`, which by definition only exists at or after Scenario 3/2's commitment point. The one exception: work that was built entirely inside the Create panel with no prior chat identity (`WORK_IDENTITY_MODEL.md` §2's "a panel-only creation with no prior chat identity — perfectly valid") — in that case, completion itself (§6 below) is the first moment a `workId` was ever needed, and it is fine for one to be minted exactly then, never earlier. |
| **Why?** | Project linking is additive by nature — a Project is a bigger, slower-moving, founder-declared container that can hold many pieces of work over time (`SPARK_WORK_MEMORY_MODEL.md` §1.7). Linking should never be the event that decides "does this work have an identity" — that decision was already made, earlier, at commitment or completion. |
| **What system owns the transition?** | Whatever mechanism already performs the explicit "attach to Project" action today — `SavedWorkItem.projectId`/`projectName` assignment. This document proposes no new owner: linking **attaches** a `projectId` alongside an already-existing `workId`, it does not touch or reissue the `workId` itself. |
| **What must never happen?** | Linking to a Project must never be read as changing *what the work is* — a `workId`'s `kind` and identity are fixed at creation (Scenario 1/2/3) and never mutated by which Project it later joins. Two separate pieces of work must never be silently merged into one identity just because they share a Project — a Project holding three `SavedWorkItem`s means three `workId`s, never one. Linking must never happen automatically or be inferred from proximity — this is already a correct, existing rule (`SPARK_WORK_MEMORY_MODEL.md` §1.7), restated here only to confirm `workId` doesn't change that. |

---

## 5. Research attachment

> Mid-discovery, a founder says, "I need some statistics first."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Yes — always. Research is only ever a state a piece of *already-identified* work passes through (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §2: `researchState` lives on the same `ConversationSession` as the active artifact). Research cannot occur before a `workId` exists, because there is no "the work" for the research to be about yet. |
| **Why?** | Research is explicitly *part of the same work*, never a separate thread with its own destiny (the "Build → research → return → continue building" arc, not "Build OR research"). Giving research its own identity would be the exact kind of duplicate-system creation this whole series of documents exists to prevent. |
| **What system owns the transition?** | `researchState`'s own existing state machine (`idle → in_progress → complete`) on `ConversationSession` — it is a field, not a record, and it is scoped implicitly to whichever `workId` is currently active. No new owner; this is `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §2's design, restated in identity terms. |
| **What must never happen?** | Research must never receive its own `workId`. Research findings must never persist as an orphaned identity if the work they belonged to is later closed by abandonment (§7 below) — they close with it, since they were never independent. A research detour must never cause a *second* `workId` to be minted for what is, underneath, still the same piece of work continuing. |

---

## 6. Resume behavior

> A founder says, "let's work on it" (after a Support-Gate pause) or "let's continue" (after a multi-day absence).

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Yes — necessarily. Resuming is, by definition, returning to something that already has identity. If nothing existing can be found to resume, this is not a resume at all — it falls back to Scenario 1 or 3 (a fresh Create). |
| **Why?** | Reusing the *same* `workId` across a pause, a research detour, or a multi-day gap is the entire point of this identity model — it's what lets "let's continue" reconnect to everything already known (discovery answers, whether research happened, why it paused) without the founder having to restate any of it, and without Spark needing to guess which of several disconnected records is the real one. |
| **What system owns the transition?** | `resumeArtifact(id)` (`lib/conversationSession/pauseResume.ts`, already built and tested) for within-conversation and Support-Gate resumes; `companionLedContinue.ts`'s existing continue-option resolver, extended with a dormant-session input source (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §3), for multi-day resumes. Both reactivate the *existing* `workId` — neither creates one. |
| **What must never happen?** | Resuming must never mint a new `workId` "to be safe" — doing so silently forks one piece of work into two identities, which is precisely the fragmentation this entire effort exists to close. If which prior `workId` a vague utterance refers to is genuinely ambiguous (more than one plausible paused or dormant candidate), the correct response is one brief clarifying question naming the candidates — never a guess, and never a fresh, unrelated mint used to avoid asking. |

---

## 7. Multiple ideas

> "I have ideas for a workshop, a newsletter, and a course."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | No — for any of the three, at the moment they're named. All three remain `possibility`-status entries (per `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4), each with a name and a detected document type, but none with a `workId`. Only once the founder chooses one to actually start does *that one* cross into Scenario 1's transition and mint an identity — the other two remain exactly as they were, named but identity-less. |
| **Why?** | This is Scenario 1's exploration rule applied at scale: naming three things in one breath, even three specific nouns, is still exploration for all three — the presence of a work-object keyword was never the test (§1). Committing to exactly one is the actual transition; the fact that two other names were mentioned in the same sentence changes nothing about that rule. |
| **What system owns the transition?** | Detection of the multi-idea message reuses the already-built, already-tested conjunction-split mechanism (`splitOnConjunctions`, built for Chamber Activation V2) applied per-clause to document-type detection (`SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4) — producing three `possibility` entries, no `workId`s. Whichever mechanism later handles "the founder picked one" is the *same* Scenario 1/3 commitment gate, not a new owner. |
| **What must never happen?** | A `workId` must never be minted for all three at once. The two not chosen must never be silently dropped from memory, nor silently and automatically started later without the founder naming one of them again. None of the three should ever have their content blended together into one combined response — they are three separate, addressable names, not one composite idea. |

---

## 8. Direction changes

> "I started creating a workshop, but now I think I need to create a lead magnet first."

| Question | Answer |
|----------|--------|
| **Does a `workId` exist?** | Two, handled differently: the workshop's `workId` already exists (it was active) and is preserved unchanged; the lead magnet has none yet, and mints a fresh one the moment it, too, crosses Scenario 1/3's commitment threshold — which a direct statement like this one does immediately, without needing a separate turn. |
| **Why?** | A workshop paused for a lead magnet are two different pieces of work, not one work that "became" another. Preserving two distinct identities — rather than overwriting or repurposing the first — is what lets the founder return to the workshop later exactly as they left it, with none of the lead magnet's answers mixed into it. |
| **What system owns the transition?** | The same already-built, already-tested pair `pauseActiveArtifact` (keeps the workshop's `workId` intact, moved to the stack) immediately followed by `setActiveArtifact`/a fresh Universal Creation start (mints the lead magnet's new `workId`) — `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §5's sequence, unchanged, read here in identity terms. |
| **What must never happen?** | The workshop's `workId` must never be reused for the lead magnet — doing so would corrupt both records, with lead-magnet answers appearing to belong to the workshop's history. The workshop must never be marked `complete` or discarded simply because attention moved elsewhere — pausing, not closing, is the only correct verb here (§0), and it is a real distinction: pausing means the identity is exactly preserved; closing means its active lifecycle has ended. |

---

## 9. Closing a `workId` — stated once, directly (the fifth verb in full)

Not one of the eight named scenarios on its own, but implied by several of them and worth stating with the same precision:

| How a `workId` closes | Trigger | What happens to it |
|--------------------------|---------|------------------------|
| **Completion** | The founder reaches Universal Creation's own `"ready"` discovery state, through either doorway (§2/§3) | The `workId` transitions from "temporary, tracked across sessions" to durable — attached to a `SavedWorkItem` (`WORK_IDENTITY_MODEL.md` §3), optionally a `Project` (§4 above). The temporary records that tracked it while active (`UniversalCreationSession`, `SessionArtifact`) can be cleared, because the identity now lives on in the durable record — not lost, relocated. |
| **Explicit abandonment** | The founder says, plainly, they no longer want to pursue it — never inferred from silence, absence, or a topic change | The `workId` closes without producing a `SavedWorkItem`. Its paused artifact and any associated `researchState` close with it (§5's rule: research was never independent). This must always be visible and confirmable to the founder in the moment ("okay, setting that aside" or similarly plain), never a silent deletion the founder only discovers later by its absence. |

**What must never happen, for closing specifically**: a `workId` must never close itself from elapsed time, an idle session, or a founder simply not mentioning it for a while — an untouched paused or dormant `workId` stays exactly as open as the day it was paused, for as long as it takes the founder to return to it, per the same rule already governing every other verb in this document.

---

## 10. Principles — verified against every scenario, not just asserted

- **Exploration is temporary** — verified structurally in Scenarios 1 and 7: exploration and named-but-unstarted possibilities never receive a `workId` at all. There is nothing heavy to expire, because nothing heavy was ever created.
- **Doorway does not determine destiny** — verified in Scenarios 2 and 3 using the identical commitment threshold for the Create panel and chat, and in Scenario 4's rule that Project linking never treats a workId differently based on which doorway produced the `SavedWorkItem` it's attached to.
- **Founder controls commitment** — verified across all eight scenarios' "why" column: every Create, Attach, Pause, Resume, and Close is traceable to something the founder explicitly said or did in that turn — §9 states this most sharply for Close, the verb most at risk of silently happening on its own.
- **Do not create duplicate systems** — verified in every "owns the transition" row: no scenario introduces a new owning system. Every transition is performed by a mechanism `WORK_IDENTITY_MODEL.md`, `SPARK_WORK_MEMORY_MODEL.md`, or `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` already found to exist, be built-but-unwired, or already explicitly proposed — this document only adds the precise rule for *when* each one fires with respect to `workId`, never a new piece of infrastructure.

---

## 11. Non-goals

- No code implemented by this document.
- Does not design the classifier that distinguishes tentative language ("maybe," "thinking about") from direct commitment — Scenario 1 names this as the load-bearing decision and explicitly defers it to its own future review, exactly as `WORK_IDENTITY_MODEL.md` §5 already did.
- Does not resolve Scenario 8's harder cousin — distinguishing "pause X for Y" from "abandon X entirely, disguised as a redirect" — flagged, not solved, consistent with `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §5's own explicit deferral of the same question.
- Does not specify the exact confirmable copy for §9's abandonment close beyond "must be plain and visible" — a copywriting detail for implementation, not an identity rule.
- Does not change any existing type, store, or function. Every citation above is descriptive of a decision point that already exists or was already proposed; this document only assigns the `workId` verb that applies at each one.

Stopping here, per the request — no implementation, no further design artifacts, until this is reviewed.
