# Chamber Activation V2 — Design Proposal

| Field | Value |
|-------|-------|
| **Status** | **Design only — no code in this document, no implementation authorized.** |
| **Date** | 2026-08-07 |
| **Depends on** | `CHAMBER_INTELLIGENCE_I2_REVIEW_FINDINGS.md` (the "follow up" collision this proposal exists to fix) |
| **Scope** | Redesign the **activation layer** (`resolveChamberExpertActivation.ts`, Phase B) — not the intelligence/selection layer (I-2), which the review already validated and left untouched |
| **Explicitly deferred** | I-4 (remaining 21 experts) stays deferred, per the founder's own recommendation — this document is the "Chamber Intelligence Phase Review" handoff requested, focused on activation quality before expansion |

---

## 0. Why activation, not intelligence, is the next thing to fix

The I-2 review found two categories of problem. One was already fixed (adding missing trigger phrases — a data patch). The other is structural and is what this document addresses:

> **"follow up" triggered Sales, but Events was the real context.**

This didn't happen because Sales' trigger was wrong — "follow up" genuinely is Sales-relevant in general. It happened because the **scoring model has no concept of specificity or confidence margin** — it sums points and picks the highest total, even when that total comes from one generic phrase versus a competitor's zero phrase matches. The fix in the review patched *this instance*. V2 needs to fix the *mechanism* so the next instance doesn't require another hand patch.

**Design principle carried over from the review (the founder's own framing, and correct):** *the smallest useful intelligence wins.* This applies to activation exactly as it applied to the 550-token cap — V2 must resist the parallel trap of "more signals = better activation." Adding journey stage, Working Memory, and business context is tempting to over-weight; V2 treats all of them as **corroborating, not deciding**, signals, same as `estateCategory` already is today.

---

## 1. Should activation have primary / supporting / confidence / uncertainty handling?

| Element | Verdict | Reasoning |
|---------|---------|-----------|
| **Primary expert** | ✅ Keep | Already correct — one lens leads, matching "Spark is helping me think," not a panel |
| **Supporting experts** | ✅ Keep, refine selection (§4) | Already correct in concept; the *how* (curated list + relevance filter) is fine, but ranking among curated candidates should improve (§4) |
| **Confidence score** | ✅ Keep, extend | Today: `high`/`medium`/`low` derived from signal-group count alone. V2 should also expose the **margin to the runner-up**, not just the winner's own strength — a 90-vs-88 win is not the same confidence as a 90-vs-20 win, and today's model can't tell the two apart |
| **Uncertainty handling** | ❌ **Missing — add it** | Today there are exactly two outcomes: a primary is named, or nothing is (confidence `low`, `primary: null`). There is no middle state for "two experts are plausible and close" — the system currently *must* pick one, silently, even when the evidence doesn't clearly support picking one over the other. This is the direct mechanism behind the "follow up" bug: the scoring model was forced to output a single winner from a close, low-quality field |

**Recommendation:** add a fourth confidence tier — **`contested`** — for cases where the top two candidates are within a defined margin. This is not a new "ask a clarifying question" engine (out of scope, no new runtime); it's a **flag** the composer can use to soften language (e.g., omit the collaboration bridge's confident "lead with X" framing) or to treat both top candidates as co-equal supporting-tier content rather than committing to a single primary's deep intelligence. See §5 for the concrete mechanism.

---

## 2. How should conflicts resolve? (the "follow up" case, worked through)

### What happens today (V1)

```
score(Sales)  = topicPhrase(35, "follow up") + estateCategory(20, business)          = 55
score(Events) = intent(25, plan) + estateCategory(20, business)                       = 45
→ Sales wins. No signal that this was a close, low-specificity call.
```

### The structural problem

A **generic, short, high-value phrase match** (Sales: one 2-word phrase, "follow up") is scored identically in *kind* to a **specific, high-value phrase match** (e.g., Events: "plan a retreat" would score the same 35 points if it had matched). The scoring model cannot distinguish "this phrase strongly implies Sales and almost nothing else" from "this phrase is common vocabulary that happens to appear in Sales' trigger list." It also cannot see that Events, despite having *no* topic match at all here, is the conceptually correct answer once "crash after events" is read as a whole.

### V2 conflict resolution mechanism

Three changes, ordered from smallest to largest:

**1. Specificity weighting (smallest change).** Give topic-phrase matches a weight proportional to their **word count and cross-expert uniqueness**, not a flat 35. A 2-word phrase that also appears (verbatim or by significant-word overlap) in another expert's trigger list is inherently less discriminating than a 3+ word phrase that appears nowhere else. Concretely:

```
phraseWeight(phrase, allExpertPhrases) =
  BASE_PHRASE_WEIGHT
  × wordCountMultiplier(significantWords(phrase).length)   // 2 words: 1.0×, 3 words: 1.3×, 4+: 1.6×
  × uniquenessMultiplier(phrase, allExpertPhrases)          // appears in N other experts' lists → 1/N penalty
```

This alone would have reduced Sales' "follow up" contribution (a 2-word phrase that, once V2's collision audit runs — §6 — will likely turn out to appear in near-identical form across Sales, Client Relationships, and Networking) relative to a hypothetical Events-specific 3+ word phrase.

**2. Margin-based contested state (the actual fix for this case).** After scoring, if the top two eligible candidates' scores are within a **contested margin** (proposed: scores within 15% of each other, or within a flat 10-point band, whichever is larger), do not silently commit to the higher one. Instead:

- Mark `confidence: "contested"` on the result.
- Still return a `primary` (the composer needs *something* to build a hint from — no new "ask the user" flow), but the primary selection additionally prefers the candidate with **more distinct signal groups**, then **more Tier-1/specific evidence** (see §4), before falling back to raw score — i.e., ties are broken by evidence *quality*, never by array position.
- In the worked example: Sales has 1 topic group + 1 estate group = 2 groups, both weak-to-moderate. Events has 1 intent group + 1 estate group = 2 groups. Tied on group count. The tiebreak then asks: does *either* have a Tier-1 (phrase) match? Sales does; Events doesn't. **Sales would still technically win this specific tiebreak** — which is the honest finding: **the deeper fix is closing the vocabulary gap (already done in the review), and V2's job is to make the NEXT such case visible and correctly flagged as contested, not to guarantee EVT always wins this exact sentence.** V2 does not claim to make every future collision resolve "correctly" by magic — it claims to make close calls *visible* (`contested`) instead of silent, and to make the tiebreak principled instead of array-order.

**3. Register the collision for review, don't silently resolve it forever (governance, §6).** When a `contested` result occurs in testing (via the corpus harness, §7) between two experts whose domains a human would consider clearly different, that's a signal the *vocabulary*, not just the scoring, needs a look — exactly like the review just did by hand. V2 makes this discoverable systematically instead of by manual simulation.

### What `contested` changes downstream (composer-level, not in this document's build scope)

Not implemented here, but the intended consumer behavior once V2 ships: `chamberExpertiseHintForChat` should treat `confidence: "contested"` similarly to today's `"medium"` (still produces a hint) but should **soften the collaboration bridge language** (§ Phase D) — e.g. omit "lead with X's read on Y" framing when the lead is contested, since Phase D's fusion language currently implies more certainty than a contested score actually has.

---

## 3. Should activation use journey stage, Working Memory, business context, in addition to user language?

| Signal | Recommend for V2? | Weight class | Why |
|--------|---------------------|----------------|-----|
| **User language** (topic match) | ✅ Already used | Tier 1 (with specificity weighting, §2) | Unchanged — remains the primary evidence |
| **Journey stage** (`ConversationStage`: listening/understanding/clarifying/confirming/exploring/creating/…) | ✅ Add, Tier 2 (corroborating) | Same weight class as `intentCategory` today | A request in `"understanding"` stage genuinely differs from the same words in `"creating"` stage — e.g. "marketing" mentioned while still in `understanding` should bias toward *not* forcing framework-heavy Marketing intelligence yet (matches Spec 107's own confidence rule: Clarifying → one question, not a deep dive) |
| **Previous Working Memory** (Spec 112/117 — prior decisions, prior activated expert this conversation) | ⚠️ Add narrowly, Tier 3 (tie-break only, never a primary signal on its own) | Weakest tier | Two uses only: (a) **continuity bias** — if the same expert was primary last turn and this turn's signals are ambiguous/contested, mildly prefer continuing rather than whiplashing between experts turn-to-turn; (b) **question de-duplication** — if a signature question was already asked and (per Working Memory) not yet answered, suppress re-surfacing the identical deterministic question (directly addresses the I-2 review's Q1 finding that the same question repeats). **Must not** become a strong signal — stale memory should never override fresh, specific text evidence |
| **Business context** (Business Profile / Client Avatar / industry) | ❌ **Do not add as an activation signal in V2** | N/A | Highest risk, lowest evidence of need for deciding *who* activates. No pilot scenario in the review showed a case where business context would have resolved an ambiguity that language/intent/journey stage couldn't. Business Profile data can be stale (Spec 112's own "never assume observation = memory" rule), and using it to bias which *expert* activates risks a subtler failure mode than the one being fixed: quietly wrong activation the member can't see or correct, driven by profile data they may not remember providing. **This verdict is about `resolveChamberExpertActivation` only.** `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §4.3 identifies a separate, legitimate (but still unauthorized/undesigned) future home for business context in the *selection* layer — shaping which already-triggered framework fits this member's business, never deciding who activates. |

This directly follows the "smallest useful intelligence wins" principle the founder endorsed: two of four candidate signals are added (journey stage, narrow Working Memory use), one is explicitly rejected (business context) as unjustified complexity, and user language keeps its existing primacy.

---

## 4. Evidence tiers (replaces the flat point-sum model)

```
Tier 1 — Specific, hard to fake
  · Multi-word phrase match (specificity-weighted, §2)
  · Legacy expert ID match (already Tier-1-strength today, unchanged)

Tier 2 — Corroborating, moderate confidence
  · Intent category match
  · Journey stage match (NEW)
  · Single-word/generic keyword match (demoted from today's near-Tier-1 weight)

Tier 3 — Weak, near-universal, tie-break only
  · Estate category match (mostly "business" — already known to be weak, per Phase C review)
  · Working Memory continuity (NEW, narrow use only, §3)
```

**Primary eligibility rule (V2):** unchanged in spirit from V1's "at least 2 signal groups," but now requires **at least one Tier-1 OR two Tier-2** matches — Tier-3-only combinations (e.g. estate category + memory continuity alone) can no longer produce a primary, closing a theoretical gap in V1 where two purely-weak signals could combine to activate an expert with zero real topical or intent relevance.

**Supporting/possible selection:** unchanged mechanism (curated `supportingRelationships`/`possibleRelationships` + relevance filter), but the relevance filter's "any signal, score > 0" gate becomes "any Tier-1 or Tier-2 signal" — Tier-3-only relevance (today, mostly estate category, which is close to universal) is no longer sufficient to justify including a supporting expert, reducing padding in the `supporting` list.

---

## 5. Scoring / selection approach — summary of the mechanism

```
For each of 24 experts:
  1. Compute Tier-1/2/3 evidence (as above), with phrase specificity weighting.
  2. score = weighted sum (same additive shape as V1, new weights).
  3. eligible = Tier-1-OR-two-Tier-2 rule (not just "2 signal groups" of any kind).

Rank eligible by score.
top = eligible[0], runnerUp = eligible[1]

If no eligible candidate: unchanged from V1 (primary: null, weak "possible" hints, confidence: low).

If top exists:
  marginRatio = (top.score - runnerUp.score) / top.score   // undefined/1.0 if no runner-up
  contested = runnerUp exists AND marginRatio < CONTESTED_THRESHOLD (proposed 0.15)

  If contested:
    resolve tie-break by: (a) more Tier-1 evidence wins, (b) then more total signal groups,
    (c) then — only as a last resort — higher raw score (never array position)
    confidence = "contested"
  Else:
    confidence = existing high/medium logic, unchanged

primary = winner of the above
supporting/possible = existing curated-list mechanism, Tier-3-only relevance excluded (§4)
```

This is a **refinement of the existing pure function's internals**, not a new engine — same shape (`resolveChamberExpertActivation(input) → ChamberExpertActivation`), same call site (`chamberExpertiseHintForChat.ts`), same "no new runtime" constraint the founder has held throughout this whole thread.

---

## 6. Preventing trigger drift as profiles grow

The review found drift had **already happened between two layers that were both authored correctly, just at different times** (activation registry vs I-2 intelligence modules). This will get worse, not better, as I-4 migrates 21 more experts unless addressed structurally, not by another one-off patch.

### Proposed mechanisms

1. **Cross-expert collision audit (automated, new test).** A test that, for every pair of the 24 experts, computes the intersection of their `activationSignals` (after normalization) and flags any shared phrase where the two experts' `category` fields differ meaningfully. This would have caught "follow up" living in Sales while conceptually also belonging to Events/Client Relationships/Networking, *before* it caused a wrong activation — the same way `profileDrift.test.ts` catches markdown/runtime divergence today.
2. **Vocabulary sync check between activation and intelligence layers (automated, new test, pilot-scoped for now).** For the 3 (eventually 24) experts with a deep intelligence module, check that every `whenToUse`/`appliesWhen` trigger phrase in the intelligence module has *at least one* activation-registry signal that shares a significant word — not requiring identical phrases, just flagging when the two layers have completely disjoint vocabulary for the same expert (exactly the condition that caused Finding #1 in the review).
3. **Trigger-authoring checklist (process, not code).** Before adding a new `activationSignal`, a required review question: *"Does this phrase already appear, or closely overlap, in another expert's list?"* — enforced by running mechanism #1 above as part of any PR that touches `chamberExpertRegistry.ts`.
4. **Prefer specific phrases at authoring time (policy, reinforced by §2's weighting).** Once specificity weighting exists, short/generic phrases are naturally worth less — this is a structural disincentive against the pattern that caused the bug, not just a rule to remember.

---

## 7. Testing realistic founder language at scale

The review's 9 hand-picked scenarios found 4 defects — a **44% failure rate on a tiny, deliberately-realistic sample**. That ratio, more than any individual finding, is the argument for systematic testing before I-4, not more hand-picked examples.

### Proposed: founder-language corpus harness

```
lib/chamberExpertise/__tests__/foundersCorpus/
  MKT.json   SYS.json   EVT.json   … (per expert, grows over time)
  runCorpus.test.ts
```

Each corpus file: an array of `{ text, expectedPrimary, expectedSupporting?, note?, ambiguous?: boolean }` entries — realistic phrasings, not trigger-matching keyword soup (the review's 9 examples become the first 9 corpus entries). `ambiguous: true` entries are ones a human reviewer judges genuinely ambiguous between two experts — these should assert `confidence: "contested"` **containing** either acceptable expert, not a single forced-correct answer (this is the corpus's way of encoding "it's fine to be uncertain here, it's not fine to be silently wrong").

`runCorpus.test.ts` runs the whole corpus and reports:

- **Primary accuracy** — % where `primary` matches `expectedPrimary` (excluding `ambiguous` entries)
- **Contested-detection recall** — % of `ambiguous`-tagged entries that V2 actually flags `contested` (validates §2's mechanism is working, not just scoring differently)
- **Regression gate** — the test fails if accuracy *drops* below the last-recorded baseline (a ratchet, not a fixed 100% requirement — some phrasings will always be genuinely hard)

This scales far beyond 9 examples over time (aim: 15-20 per pilot expert before I-4 begins, then per-expert as each of the 21 remaining experts is migrated) without needing a live LLM — it's testing the deterministic activation function directly, same technique the review itself used.

---

## 8. Data changes

All additive to existing types — no breaking changes to `ChamberExpertActivationInput`'s current shape.

```ts
// lib/chamberExpertise/types.ts — additions only

export type ChamberExpertConfidence = "high" | "medium" | "low" | "contested"; // +contested

export type ChamberExpertActivationInput = {
  // ...existing fields unchanged...
  journeyStage?: ConversationStage | null;           // NEW — was string, now typed to the real Spec 107 enum
  previousPrimaryExpertId?: ChamberExpertId | null;   // NEW — narrow Working Memory continuity signal (§3)
  pendingSignatureQuestionId?: string | null;         // NEW — suppresses re-asking the same question (§3)
};

export type ChamberExpertSignalResult = {
  // ...existing fields unchanged...
  tier1Count: number;   // NEW — for tie-break logic (§5)
  tier2Count: number;   // NEW
  tier3Count: number;   // NEW
};

export type ChamberExpertActivation = {
  // ...existing fields unchanged...
  marginToRunnerUp?: number;   // NEW — exposes how close the call was, for composer-level language softening
  runnerUp?: ChamberExpertId | null;  // NEW — the second-place candidate, when contested
};
```

**Registry data change:** `chamberExpertRegistry.ts` entries gain no new required fields — specificity weighting (§2) is computed at scoring time from existing `activationSignals`, not authored per-phrase. This keeps the registry authoring experience unchanged for the eventual 21-expert migration.

---

## 9. Migration plan

Mirrors the phased, flag-gated pattern that worked for the Chamber Intelligence pilot (I-1/I-2) rather than a risky in-place rewrite of a function already live in production chat.

| Phase | Work | Live behavior change? |
|-------|------|--------------------------|
| **V2-1** | Add data types (§8), build the founders corpus (§7) with the review's 9 scenarios as the seed, run it against **today's unmodified V1 scoring** to establish a baseline accuracy number | None — pure measurement |
| **V2-2** | Implement specificity weighting + tiered eligibility (§2, §4) as a **parallel pure function** (`resolveChamberExpertActivationV2`), not yet wired to chat. Run the corpus against both V1 and V2, compare | None — V2 exists only in tests |
| **V2-3** | Run the cross-expert collision audit (§6) across all 24 experts' existing `activationSignals`; fix any high-severity collisions found (data-only patches, same style as the review's fix) | Registry data patches only — same low-risk category as the review's own fix |
| **V2-4** | **Review gate.** Compare V1 vs V2 corpus accuracy + contested-detection recall. Approve or send back for tuning before touching the live path | None — review only |
| **V2-5** | Swap `chamberExpertiseHintForChat.ts` to call V2 instead of V1, behind the **same feature-flag pattern** already used for the intelligence pilot (`isChamberActivationV2Enabled()`, default off) — so this, too, ships dark first | None until explicitly enabled |
| **V2-6** | Enable for internal review, expand the corpus with real usage-informed phrasings, then flip the flag default once corpus accuracy and contested-recall are judged acceptable | Opt-in only until this phase |

**Not in this migration:** business context integration (rejected, §3), a new "ask a clarifying question" runtime path for `contested` cases (composer-level language softening only, §2), and any work on the remaining 21 experts (still deferred, per the founder's explicit instruction).

---

## 10. Summary — direct answers to the questions asked

| Question | Answer |
|----------|--------|
| Primary/supporting/confidence/uncertainty? | Keep primary + supporting. Extend confidence with a new `contested` tier. Add uncertainty handling via margin detection — this was the actual gap. |
| How should conflicts resolve? | Specificity-weighted scoring + margin-based `contested` flag + evidence-quality tiebreak (never array order). The "follow up" case specifically is fixed at the *data* layer (already done in the review) and made *systematically detectable* going forward (§6, §7) — V2 does not claim every future collision auto-resolves correctly. |
| User language / journey stage / Working Memory / business context? | Language: unchanged primacy. Journey stage: add as Tier 2. Working Memory: add narrowly (continuity + question de-dup) as Tier 3 only. Business context: reject for now — no evidence it's needed yet. |
| Prevent trigger drift? | Automated cross-expert collision audit + activation↔intelligence vocabulary sync check + an authoring checklist, backed by the specificity-weighting disincentive. |
| Test realistic language at scale? | A growing founders-language corpus (seeded from the review's 9 scenarios) with an accuracy-ratchet test, not more one-off hand-picked examples. |

**No code has been written for this proposal.** Per instruction, awaiting review before V2-1 begins.
