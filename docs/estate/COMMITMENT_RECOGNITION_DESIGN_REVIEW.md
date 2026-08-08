# Commitment Recognition Design Review

| Field | Value |
|-------|-------|
| **Status** | **Design only. No code changes in this document or this delivery.** |
| **Date** | 2026-08-07 |
| **Question** | How does Spark know when a possibility becomes a commitment? |
| **Answers** | `WORK_IDENTITY_TRANSITION_RULES.md` §1 and §11 explicitly deferred this exact question — "does not design the classifier that distinguishes tentative language from direct commitment... only defines what happens once that distinction is made." This document is that classifier's design. |
| **Depends on** | `WORK_IDENTITY_MODEL.md` (the `workId` concept), `WORK_IDENTITY_TRANSITION_RULES.md` (the five verbs — this document is entirely about correctly triggering the **Create** verb), and the already-implemented Work State Priority Model / Support Gate (`resolveSupportGate`, `isGenuineConfusionSignal`, `detectEmotionalState`) — reused here, not redesigned. |

---

## 0. A naming collision worth resolving before anything else

This codebase already has a **"Conversation Commitment Engine"** (`lib/conversationCommitmentEngine/`) — `isCommitmentAffirmation`, `resolveConversationCommitment`. It answers a *different* question: whether a founder's short reply ("yes," "let's do it," "no thanks") **accepts or declines an invitation Spark itself just offered**. That system is correct as-is and this document does not touch it.

This document's "commitment" is the opposite direction: **not** "did the founder accept what Spark proposed," but **"did the founder's own, self-initiated language just cross into starting real work."** The two will sometimes look similar in isolated text ("let's build it" could be either), which is precisely why §6 below treats context — what the founder is replying *to* — as part of the signal, not just the words themselves. Where relevant, this document is explicit about which of the two "commitment" concepts is in play.

---

## 1. The four states, defined precisely (not just named)

| State | What it is | Persisted as |
|-------|------------|----------------|
| **Exploration** | The *mode* of a conversation when a work object is being discussed without a decision having been made yet — hedged, hypothetical, or musing language. | Nothing durable required. If specific enough to be worth remembering (§1's "possibility," below), a name is captured — but exploration itself is not an artifact, it's a linguistic quality of the turn. |
| **Possibility** | The *optional artifact* of exploration — something named clearly enough to address again later, deliberately holding no `workId` (`WORK_IDENTITY_TRANSITION_RULES.md` §7). Not every exploratory mention needs one; a single passing musing needs no bookkeeping. Multiple named ideas in one message are the clearest case that does. | `SessionArtifact` with `status: "possibility"` (proposed in `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4) — a name and a detected type, nothing more. |
| **Commitment** | Not a state at all — an **event**. The specific turn where a founder's own language crosses from tentative to decided. This document's entire subject. | Nothing on its own — it is the *trigger* that performs `WORK_IDENTITY_TRANSITION_RULES.md`'s Create verb. |
| **Active work** | What exists immediately after a commitment event fires: a `workId`, a live `UniversalCreationSession`, discovery under way. | `UniversalCreationSession` + `SessionArtifact` with `status: "active"`. |

Treating commitment as an **event**, not a status, matters: it means this document is designing a per-turn decision (the same shape as `resolveSupportGate`'s per-turn PAUSE/SOFTEN/PROCEED decision), not a new field that sits on a record waiting to be toggled.

---

## 2. What already exists that this reuses (nothing here is greenfield)

| Existing mechanism | What it already does | How this document uses it |
|----------------------|--------------------------|-------------------------------|
| `SIMPLE_CREATE_VERB_RE` (`lib/universalCreation/createFastPath.ts`) | Matches unhedged imperative creation verbs ("write/create/build/draft/design/develop/make/generate" + "a/an/my/the/new/our") | The strongest existing positive commitment signal — §4 |
| `inferDocumentTypeFromCreateText` / `ARTIFACT_INFERENCE` | Matches a bare work-object noun ("workshop," "newsletter," "sop") with **no** requirement for surrounding commitment language | The exact mechanism `WORK_IDENTITY_MODEL.md` §5 and `WORK_IDENTITY_TRANSITION_RULES.md` §1 named as **too permissive today** — it fires on the noun alone. This document's central proposal (§5) is what should gate it. |
| `isGenuineConfusionSignal` / `GENUINE_CONFUSION_RE` (`lib/companionEmotions.ts`) | Distinguishes real confusion ("not sure what I need," "no idea") from a missing-vocabulary catch-all | Reused directly for exploration's hedging signals — deliberate uncertainty about *whether to proceed* overlaps with, but is not identical to, this existing confusion detector (§4) |
| `detectObstacle` (`self_doubt`, `scarcity_fear`, `rejection_fear`, …) | Names the emotional obstacle behind a founder's hesitation | Used in §6 to distinguish *viability doubt* ("will anyone attend") from *decision doubt* ("should I even try") — two different things this document's mixed-case analysis depends on telling apart |
| `resolveSupportGate` (Work State Priority Model, already implemented) | Decides `PAUSE`/`SOFTEN`/`PROCEED` for a turn containing both a work object and a human state | Runs **before** commitment recognition, every time — §7's gate design treats this as a strict precondition, never something commitment recognition second-guesses |

---

## 3. Walking through the five given examples

### Clear commitment — "I want to create a workshop."

Unhedged volitional statement ("I want to"), a direct verb-object pairing matching `SIMPLE_CREATE_VERB_RE`, no modal hedging, no competing named alternatives, no distress signal. **Commitment fires. `workId` minted.**

### Tentative — "I might create a workshop someday."

Same verb, same object — but wrapped in two independent hedging markers ("might," "someday"). This is the case `inferDocumentTypeFromCreateText` alone cannot distinguish from the clear-commitment example above, because both contain "workshop" and a creation verb. **This is precisely why lexical detection of the object is not sufficient — the hedge, not the noun, is the signal that decides the outcome here. Exploration. No `workId`.** At most, a `possibility` entry: "workshop," unstarted.

### Mixed — "I want to create a workshop, but I don't know if anyone would attend."

The hardest of the five, and treated at full depth in §6 below because it is not resolvable from the sentence alone — it depends on *what kind* of doubt is present and what the Support Gate already decided about the founder's emotional state this turn. Short version: the uncertainty here is about **outcome** (will it succeed), not about **decision** (should I start) — those are different questions, and only the second kind of doubt should count as exploration-level hedging.

### Founder transition — "I've thought about it. Let's build it."

No work-object noun appears in this sentence at all — "it" is a pronoun. Lexical detection alone would find nothing to infer a document type from. **This case's entire signal is: (a) an explicit transition phrase naming that a decision has been reached ("I've thought about it"), plus (b) an unhedged imperative ("let's build it"), resolved against (c) whatever possibility or exploration topic the current conversation was already discussing.** Commitment fires, and the referent — not a fresh document-type guess — supplies what "it" means. Detailed in §8.

### Multiple possibilities, one chosen — "I have ideas for a retreat, newsletter, and course. Let's start with the retreat."

Two clauses doing two different jobs: the first names three possibilities (none committed — `WORK_IDENTITY_TRANSITION_RULES.md` §7's rule applies to all three), the second selects exactly one **by name**. **Only the retreat crosses into commitment. The newsletter and course remain possibilities, untouched, still addressable later.**

---

## 4. Signals of commitment

1. **An unhedged volitional or imperative statement about one specific, named thing** — "I want to create X," "I'm going to build X," "let's create X," "I need to create X." (`SIMPLE_CREATE_VERB_RE`'s existing pattern family, correctly a commitment signal *when nothing else in the turn hedges it* — see §5 for what "nothing else hedges it" excludes.)
2. **"I need help [doing] X"** — already, correctly, treated as build-guidance rather than a separate ambiguous case (Work State Priority Model's own worked example: *"I need help planning a workshop." → Build guidance*). Asking for help is not lower-commitment than a bare statement; it's a founder already oriented toward action, asking how, not whether.
3. **A named selection among previously stated possibilities** — "let's start with X," "the retreat first," "I'll do the newsletter." The selection itself is the commitment signal; the earlier list is not (§3's fifth example, §8).
4. **An explicit transition phrase** acknowledging a decision has been reached, independent of whether a work-object noun is present in that same sentence — "I've decided," "I've thought about it," "okay, let's do this," "let's build it." (§3's fourth example, §8's referent-resolution requirement.)
5. **A reaffirmation following Spark's own clarifying question** (§7's `clarify` branch) — once asked directly and the founder answers without re-introducing a hedge, that answer is itself the commitment event, even if the original utterance was ambiguous.

## 5. Signals that should remain exploration

1. **Modal hedging on the decision itself** — "might," "may," "could," "someday," "eventually," "thinking about," "considering," "toying with the idea of," "not sure if I want to." These hedge *whether to proceed at all* — the decision-level uncertainty, not an outcome-level one (§6's distinction).
2. **Naming without volition** — "I have an idea for X," "I've been thinking about X" with no accompanying decision language. This is naming, not starting (a preserved principle, §9) — it should produce, at most, a `possibility`, never a `workId`.
3. **Plural/list framing with no selection** — "ideas for X, Y, and Z" alone, with nothing chosen. All named items stay possibilities (§3's fifth example, first clause).
4. **Genuine confusion, per the already-existing detector** — `isGenuineConfusionSignal` firing ("not sure what I need," "no idea where to start") should count as exploration-level uncertainty even if a work-object noun is also present in the same message — a founder who doesn't know what they need cannot simultaneously be treated as having decided to build a specific thing.
5. **A `PAUSE` outcome from the Support Gate** — this is not a new signal this document invents; it's the existing Work State Priority Model's own decision, and §7 makes it a strict precondition: if the Support Gate has already decided the human state must be addressed before anything else, commitment recognition does not run at all this turn, regardless of what the work-object language alone would have suggested.

---

## 6. The mixed case, resolved properly

> "I want to create a workshop, but I don't know if anyone would attend."

This sentence contains two different kinds of uncertainty, and conflating them is the mistake to avoid:

- **Decision-level doubt** — "should I even try this?" — this is exploration (§5.1).
- **Outcome-level doubt** — "will this succeed once I do it?" — this is not exploration. It is normal, healthy uncertainty about a venture's outcome, and it is *exactly* the kind of question Universal Creation's own discovery phase already exists to work through (the `who`/audience slot is precisely "will this land with someone"). Treating outcome-level doubt as a reason to withhold commitment would mean no founder could ever commit to *anything* they weren't already certain would succeed — which would make "commitment" indistinguishable from "guaranteed outcome," an impossible bar that contradicts the founder's own stated want in the same sentence.

**The rule**: when a sentence pairs an unhedged commitment clause (§4.1) with a doubt clause about a *downstream outcome* (attendance, sales, reception — not the decision itself), **the commitment clause governs.** The doubt is not discarded — it becomes the first thing discovery addresses, not a reason to defer discovery.

**This is why the request's own phrasing is a hedge, not a single verdict** — *"likely Exploration/support depending on emotional state"* — and this document keeps that hedge intact rather than forcing one answer, by making the outcome depend on the Support Gate's already-existing tier, computed first, every time (§2, §7):

| Support Gate tier (already computed, unchanged) | What happens to this sentence |
|---|---|
| **PAUSE** — the doubt reads as genuine distress, not ordinary uncertainty (`isGenuineConfusionSignal` or overwhelm signals fire) | Exploration/support wins. No `workId`. The venture idea can be captured as a `possibility` if named clearly, but nothing more happens until the founder returns calmer. |
| **SOFTEN** — mild, ordinary doubt, not distress | **Commitment fires.** The response acknowledges the doubt in the same breath it proceeds — "That's a fair thing to wonder — let's start by getting clear on who this is actually for, since that's what will tell us." The doubt becomes the opening discovery question, not a blocker. |
| **PROCEED** — no meaningful human-state signal at all, just ordinary hedge-free phrasing with an incidental "I don't know if" | Commitment fires plainly, same as the clear-commitment example. |

Commitment recognition never overrides the Support Gate's tier — it reads it. This is the same precedence discipline `WORK_IDENTITY_TRANSITION_RULES.md` §0 already requires ("every verb fires because of something the founder said"), applied here to mean: the *feeling* behind the doubt (already correctly classified elsewhere) decides which of two valid readings applies — not a second, competing classifier guessing at emotion on its own.

---

## 7. When a `workId` may be created — the gate, precisely

A single per-turn decision, in the same shape and spirit as `resolveSupportGate` — not a new architecture pattern, the same one applied one layer further:

```
CommitmentGateOutcome = "commit" | "explore" | "clarify"

resolveCommitmentGate(input: {
  userText: string,
  supportGateTier: "pause" | "soften" | "proceed",   // computed first, unchanged, from the existing Support Gate
  activePossibilities: { name: string; type: string }[], // whatever is already named on the stack, if any
}): CommitmentGateOutcome
```

**Precedence, strict, top to bottom:**

1. If `supportGateTier === "pause"` → always `"explore"`. Commitment recognition does not run its own language analysis at all this turn — this is not a tie-breaker, it is a full stop, consistent with §5.5.
2. Else, if the utterance matches an unhedged commitment signal (§4) with no competing hedge (§5) in the same utterance → `"commit"`.
3. Else, if the utterance matches an unhedged commitment signal but with a *decision-level* hedge present (§5.1, not §6's outcome-level kind) → `"explore"`.
4. Else, if the utterance is ambiguous — contains real work-object language but the classifier cannot confidently place it in either #2 or #3 (genuinely borderline phrasing, not the sentence-structure cases already resolved above) → `"clarify"`.
5. Else (no work-object language at all, no possibility referenced) → not this gate's concern; ordinary conversation continues untouched.

**`workId` is minted if, and only if, the outcome is `"commit"`.** `"explore"` never mints one (§5's whole point). `"clarify"` never mints one either — it waits for the founder's answer, which then re-enters this same gate as a fresh turn (§4.5).

---

## 8. Resolving pronoun- and selection-based commitment (the two harder examples)

Both the "founder transition" and "multiple possibilities" examples share a requirement lexical detection alone cannot satisfy: **knowing what "it" or "the retreat" refers to.** This is not a new subsystem — it is the existing `activePossibilities`/`artifactStack` list (already designed in `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4, already an input to the gate signature in §7) used as a lookup, not a new intelligence:

- **Pronoun case** ("let's build it"): if exactly one possibility or exploration topic exists in the current conversational context, "it" resolves to that one, unambiguously. If more than one exists and none was just named, this is `"clarify"` (§7.4) — "Which one — the workshop, or the newsletter?" — never a guess between two plausible referents.
- **Named-selection case** ("let's start with the retreat"): the name in the commitment clause is matched directly against the named possibilities already on the stack. No ambiguity is possible here by construction, since the founder used the specific name.

**What must never happen**: a `workId` must never be minted for a *guessed* referent when genuine ambiguity exists. Guessing wrong here is worse than asking, because it would silently start the wrong piece of work — exactly the kind of silent, system-decided outcome every document in this series has ruled out.

---

## 9. What Spark should ask when unclear

The `"clarify"` outcome (§7.4) should produce exactly one plain question, never a menu of possibilities dressed as a checklist and never an assumption in either direction — matching the same discipline already established for Chamber Activation V2's insufficient-evidence clarifying questions and the Support Gate's "ask once, then wait":

- When the ambiguity is *whether* the founder has decided at all: **"Is this something you're ready to start, or still something you're turning over?"** — a question that takes neither a `"commit"` nor an `"explore"` reading for granted, and gives the founder an easy, dignified way to say either.
- When the ambiguity is *which* possibility a pronoun refers to (§8): name the candidates plainly — **"Which one — the workshop, or the newsletter?"**
- **What this question must never do**: presume progress ("Great, let's dive into your workshop!") or presume triviality ("Just let me know if you ever want to explore that") — either presumption already picks a side before the founder has.

---

## 10. Acceptance scenarios

| # | Utterance | Support Gate tier (assumed) | Expected gate outcome | Why |
|---|-----------|-------------------------------|--------------------------|-----|
| 1 | "I want to create a workshop." | proceed | `commit` | §3, clear commitment |
| 2 | "I might create a workshop someday." | proceed | `explore` | §3, decision-level hedge |
| 3 | "I want to create a workshop, but I don't know if anyone would attend." | proceed | `commit` (doubt becomes first discovery question) | §6 |
| 4 | Same words as #3, but the founder's tone/prior turns show real distress | pause | `explore` | §6, tier governs |
| 5 | "I've thought about it. Let's build it." (workshop was the only thing discussed earlier) | proceed | `commit`, referent = workshop | §8, single unambiguous referent |
| 6 | "Let's build it." with two open possibilities and neither just named | proceed | `clarify` | §8, genuine referent ambiguity |
| 7 | "I have ideas for a retreat, newsletter, and course. Let's start with the retreat." | proceed | `commit` for retreat only; newsletter/course remain possibilities | §3, §7 |
| 8 | "I have ideas for a retreat, newsletter, and course." (no selection) | proceed | `explore` for all three; three possibilities recorded, zero `workId`s | `WORK_IDENTITY_TRANSITION_RULES.md` §7 |
| 9 | "I'm not sure what I even need help with, but maybe a workshop?" | proceed | `explore` | §5.4, `isGenuineConfusionSignal` fires alongside a hedge |
| 10 | "I need help planning a workshop." | proceed | `commit` | §4.2 — asking for help is not lower commitment |
| 11 | Founder answers a `clarify` question ("Ready to start.") with no new hedge | proceed | `commit` | §4.5, §7.4's re-entry |
| 12 | Founder answers a `clarify` question ("No, still just thinking.") | proceed | `explore` | §4.5's re-entry, resolved the other direction |

---

## 11. Principles — verified, not just asserted

- **Founder controls the transition** — every `"commit"` outcome in §10 is traceable to the founder's own words in that turn or the immediately preceding clarify exchange (§4.5) — never inferred from elapsed time, repetition, or Spark's own judgment about what "seems ready."
- **No forced commitment** — the `"clarify"` branch (§7.4, §9) exists specifically so that genuine ambiguity never gets resolved by picking the reading that's more convenient to act on; asking is always available as a third option, not just commit-or-explore.
- **Naming is not starting** — §5.2 and every possibility-only row in §10 (rows 2, 8, 9) confirm that naming a thing, even specifically, never by itself produces a `workId` — a decision-level signal (§4) is always additionally required.
- **Ideas do not become work until chosen** — §3's fifth example and §10 row 7/8 show the mechanism precisely: a list of names produces a list of possibilities; only an explicit selection (by name or by unambiguous pronoun, §8) promotes exactly one.

---

## 12. Non-goals

- No code implemented by this document. `resolveCommitmentGate`'s signature (§7) is a design shape, not an implementation.
- Does not modify `resolveSupportGate`, `isGenuineConfusionSignal`, `SIMPLE_CREATE_VERB_RE`, or `inferDocumentTypeFromCreateText` — this document only defines the additional decision layered on top of what they already correctly detect.
- Does not specify the exact regex/lexicon for every hedging word listed in §5 — those are illustrative signal categories for the eventual implementation to enumerate precisely and test against real founder phrasing, the same discipline used for every prior classifier in this series (Chamber Activation V2's founder-language validation set, the Work State Priority Model's golden conversations).
- Does not resolve how long a `possibility` should remain addressable before it's reasonable to consider it dropped — an existing open question from `SPARK_STAYS_WITH_ME_DESIGN_REVIEW.md` §4, not reopened here.
- Does not change the Conversation Commitment Engine (§0) in any way — confirmed to be a separate, correctly-functioning system answering a different question.

Stopping here, per the request — no implementation, no further design artifacts, until this is reviewed.
