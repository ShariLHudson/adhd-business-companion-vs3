# Chamber Activation V2 — Outcome/Deliverable Intent Layer & Strategy Over-Activation Analysis

| Field | Value |
|-------|-------|
| **Status** | **Analysis and architecture recommendation only — no code.** |
| **Date** | 2026-08-07 |
| **Trigger** | The baseline corpus's two "missed co-primary" findings (`CHAMBER_ACTIVATION_BASELINE_RESULTS.md` §3) |
| **Corrects** | An inconsistency this analysis found between `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §4 and `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` §2.2 — see §6 |

---

## 0. Headline finding

**The root cause is bigger than "Strategy's intent net is broad."** Diagnostic instrumentation (read-only — no scoring logic changed) run against the two failing corpus examples shows:

```
"...stuck on pricing and how to actually market it." (intentCategory: decide)
  STR: 45   CR: 45   FIN: 45   SALES: 45   AI: 45   DATA: 45   ← SIX experts tied, zero topic evidence, anywhere
  → Strategy wins only because it is first in that tied group by array position.

"...hire my first team member and I still haven't written down how we do the work." (intentCategory: build)
  STR: 45   SYS: 45   MKT: 45   CNT: 45   AI: 45   EVT: 45   ← SIX experts tied, zero topic evidence, anywhere
  → Strategy wins the same way.
```

This is not "Strategy specifically is too eager." It is: **`intentCategory` match + `estateCategory` match, with zero topical evidence from either expert, is currently sufficient to make an expert primary-eligible** — and because most `IntentCategory` values (`decide`, `build`, `plan`, etc.) and the single `estateCategory` value (`business`) are each shared by many experts' affinity lists, this produces a **wide, contentless tie-cluster** on a large fraction of business requests, resolved by nothing more principled than array order. Strategy happens to sit early in `CHAMBER_EXPERT_REGISTRY` and have broad affinities, so it wins disproportionately — but the underlying defect would produce the identical symptom with a different "winner" if the registry were reordered.

**This finding also surfaces a real inconsistency between two of this thread's own prior design documents**, corrected in §6.

---

## 1. Review: topic signals

**Current state:** `activationSignals` (Tier 1/2 depending on word count) mixes two different jobs — situational/emotional framing ("nobody knows i exist," "tools multiply") and bare topic nouns ("marketing," "pricing" — though FIN is missing the bare word). Both are legitimate but conflated.

**Finding:** topic-signal coverage gaps are real and recurring (this is now the **6th instance** found in this thread — Marketing ×2, Events ×3 in prior work, and implicitly here — FIN has no bare `"pricing"` trigger at all, only the compound `"offer pricing"`). This is a coverage problem, addressed by ordinary trigger authoring (§6's drift-prevention mechanisms already cover this) — not, by itself, what this analysis needs to solve. Even a fully-covered topic vocabulary would not fix the six-way tie shown above, because in both failing sentences, **the intent+estate tie forms independent of whether any topic phrase matches at all** — six *other* experts also reach the identical 45 via the same mechanism.

---

## 2. Review: outcome signals

**Definition adopted for this analysis:** an outcome signal names *the change the founder wants*, phrased as a result, not a topic — "know what to charge," "stop guessing on price," "feel confident naming a number" (Finance), versus the topic word "pricing" alone.

**Recommendation: add `outcomeSignals: readonly string[]` as a new per-expert field, weighted identically to Tier-1 topic phrase matches** (same `phraseMatches` mechanism, same score weight) — not a new tier, not a new engine, not a new matching algorithm. It is a second curated vocabulary list, scored the same way the first one already is.

**Why a separate field, not just "add more phrases to `activationSignals`":** outcome phrasing and situational phrasing serve different authoring intuitions and will drift at different rates as more experts are migrated (I-4). Keeping them separate makes the **collision audit and drift-prevention mechanisms** (`CHAMBER_ACTIVATION_V2_PROPOSAL.md` §6) easier to reason about — "does this expert's outcome vocabulary overlap another's" is a more precise question than mixing outcome and situational phrases in one undifferentiated list.

---

## 3. Review: deliverable signals

**Finding:** "deliverable" and "outcome" are not two different mechanisms — they are two flavors of the same underlying signal (*what the founder wants to walk away with*), one framed as a concrete artifact ("a price," "a documented process," "a job description") and one framed as a felt result ("know what to charge," "stop reinventing this every time"). **Recommendation: do not build three separate signal systems (topic / outcome / deliverable).** Fold "deliverable" phrasing into the same `outcomeSignals` field as artifact-shaped entries — the distinction is useful for *authors* deciding what to write, not for the *scoring mechanism*, which should treat them identically (Tier 1, phrase-weighted). Building three parallel vocabulary systems where one suffices would violate this thread's own repeated "smallest useful intelligence wins" principle.

---

## 4. Review: co-primary detection

**Finding from the diagnostic:** even with `outcomeSignals` added, getting *both* Finance and Marketing (or People & Culture and Systems) independently to the `STRONG_EVIDENCE_THRESHOLD = 70` bar is not guaranteed by vocabulary alone — a single phrase match (35) plus a demoted intent match plus estate category doesn't reliably clear 70 for *both* candidates in a short, casually-worded sentence. Relying purely on **score magnitude** to detect co-primary under-serves exactly the compound sentences this problem is about.

**Recommendation: add a second, structural path to co-primary detection — conjunction-aware sub-clause scoring.** Both failing examples share a grammatical shape a scoring-magnitude approach doesn't exploit: they are literally **"X and Y" compound requests** ("stuck on pricing **and** ... marketing"; "hire ... **and** ... haven't documented").

```
detectConjunctionSplit(text):
  1. Look for coordinating patterns: " and ", " but ", " as well as ", " plus ".
  2. If found, split into two candidate sub-clauses at that point.
  3. Return null if no clear split (the common case — most requests aren't compound).

Co-primary evaluation (proposed addition to the decision procedure in
CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §2.2):
  1. Run the existing whole-text scoring (unchanged).
  2. If whole-text scoring already finds a clean co-primary (both ≥ 70, margin < 15%,
     different categories) — done, use it.
  3. Else, if a conjunction split exists:
       Score each sub-clause independently against topic + outcome signals only
       (intent/estate stay whole-request signals — they don't split).
       If sub-clause A's best-matching expert ≠ sub-clause B's best-matching expert,
       AND each sub-clause match clears a lower SUB_CLAUSE_THRESHOLD (proposed: 35 —
       one genuine phrase match), treat this as a STRUCTURAL co-primary signal.
  4. A structural co-primary signal promotes both sub-clause winners to co-primary
     status even when neither's whole-text score alone would clear 70.
```

**Why this is safer than it sounds (guards against over-triggering):** the requirement that the two sub-clauses' best-matching experts *differ* is the key guard. "I need to write an email **and** send it" splits into two sub-clauses that both best-match Content — no structural signal fires, because step 3's "differ" condition fails. The mechanism only activates for genuinely compound, cross-domain requests, which is exactly the category of sentence this analysis is about.

**This is the piece of the recommendation most directly answering the outcome-layer question asked**: co-primary detection should consider not just "what topic is this" or even "what outcome is wanted," but **"is this one request or two coordinated requests wearing one sentence"** — a structural property neither the existing scoring nor a bigger vocabulary alone can see.

---

## 5. Review: Strategy over-activation prevention

Two complementary fixes, addressing two different sub-problems the diagnostic separated cleanly:

### 5.1 The eligibility bar itself (fixes the six-way tie, not just Strategy)

**Finding:** `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §4 already specified the correct fix — "Tier-1 OR two Tier-2 matches" for eligibility, explicitly designed to close "a theoretical gap in V1 where two purely-weak signals could combine to activate an expert with zero real topical or intent relevance." **This diagnostic proves that gap is not theoretical — it produced a six-expert tie on both failing examples.** Estate category (`business`) is Tier 3 in that same document's tiering; under the correctly-applied rule, `intent (Tier 2) + estateCategory (Tier 3)` is **one** Tier-2 match, not two — insufficient for eligibility. Applying this correctly would make **all six tied experts ineligible** for both examples (an honest `primary: null, confidence: low` instead of a confident wrong answer) — a strict improvement per Pillar 1's "no false confidence" rule, even before any vocabulary or conjunction work.

**This is a correction to `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md`, not a new decision** — see §6.

### 5.2 Generalist tiebreak deprioritization (a targeted backstop for Strategy specifically)

Even after 5.1 tightens eligibility, two experts *with genuine Tier-1 evidence* can still tie in score. For that narrower, residual case, add one more tiebreak criterion (inserted into `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` §2.3's ordered tiebreak, between "more Tier-1 evidence" and "more signal groups"):

```
tiebreak(a, b):
  1. Prefer legacyExpertIdMatch === true                (unchanged)
  2. Prefer more Tier-1 evidence                          (unchanged)
  3. Prefer "specialist" category over "generalist"       (NEW)
  4. Prefer more total signalGroupsMatched                (unchanged)
  5. Prefer higher raw score                              (unchanged)
  6. Array order NEVER used                                (unchanged)
```

`expertCategory: "specialist" | "generalist"` — proposed generalist set: **Strategy, Momentum, Horizons** (the three whose role is explicitly meta/direction-setting rather than a bounded domain, per their own Expert Thinking Patterns). This is a **tiebreak-only** input, never a scoring multiplier — verified against the existing corpus that this does *not* break the legitimate "I want to build a business strategy" case (STR wins that outright via a genuine phrase match on "business strategy," never entering the tiebreak path at all — confirmed by inspection, not yet by a new test, see §8 AT-12).

---

## 6. Correction: reconciling the two prior design documents

While diagnosing this, a genuine drift was found between this thread's own two design documents:

| Document | What it says about eligibility |
|----------|-----------------------------------|
| `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §4 | "Primary eligibility rule (V2): ... requires **at least one Tier-1 OR two Tier-2** matches — Tier-3-only combinations ... can no longer produce a primary" |
| `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` §2.2 | "`eligible = experts with signalGroupsMatched >= PRIMARY_MIN_SIGNAL_GROUPS` (unchanged from V1 — **any** 2 signal groups)" |

The finalization pass that produced the Model Specification document restated V1's original rule instead of carrying forward the earlier, correct tiered rule — an oversight, not a deliberate reversal. **This document's diagnostic is the evidence that the earlier rule was right and the restatement was wrong**: applying "any 2 signal groups" allowed the exact six-way, zero-topic-evidence tie shown in §0. `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` §2.2 should be corrected to read exactly as `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §4 always specified: **Tier-1 OR two Tier-2 matches**, with estate category remaining Tier 3 and therefore *never*, by itself or paired only with one Tier-2 match, sufficient for eligibility.

---

## 7. Architecture recommendation (summary)

```
Existing (unchanged): score all 24 experts via topic + intent + estate + legacyId

NEW eligibility gate:  Tier-1 evidence present, OR two-or-more Tier-2 matches
                       (corrects the Model Specification back to the V2 proposal's
                       original, correct rule — §6)

NEW signal source:     outcomeSignals per expert (Tier-1 weight, same mechanism
                       as topic phrases — §2/§3, "deliverable" folded in, not
                       a third system)

NEW tiebreak step:     prefer "specialist" over "generalist" category
                       (§5.2, narrow backstop, tiebreak-only)

NEW co-primary path:   conjunction-aware sub-clause scoring, as a STRUCTURAL
                       alternative to the existing score-magnitude path
                       (§4) — either path alone can trigger co-primary
```

Each piece is additive to the already-finalized `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` — none replaces it. This analysis does not propose a different architecture; it closes a gap the corpus's evidence exposed in the one already agreed.

---

## 8. Scoring changes (precise, pending empirical calibration)

| Change | Mechanism | Calibration note |
|--------|-----------|----------------------|
| Eligibility correction | `signalGroupsMatched` must distinguish Tier-2 from Tier-3 groups; require Tier-1 OR ≥2 Tier-2 | No new constant — this is a **bug fix** to the tier-counting logic itself, not a tunable value |
| `outcomeSignals` field | New array per expert, scored via the existing `phraseMatches`, same weight as `activationSignals` phrase matches (35) | Vocabulary content, not a constant — authored per expert, same authoring discipline as topic signals |
| Generalist tiebreak | `expertCategory` lookup, inserted as tiebreak step 3 | No numeric constant — a category lookup and an ordering decision |
| Conjunction split | `SUB_CLAUSE_THRESHOLD` (proposed: 35, one phrase match) | **This number is a placeholder, explicitly not finalized here.** Per this thread's own established practice (the corpus exists specifically so constants are tuned against evidence, not derived on paper — see `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md`'s own `STRONG_EVIDENCE_THRESHOLD` derivation), the exact sub-clause threshold must be calibrated against the corpus once conjunction-split scoring is actually implemented (V2-2), not fixed now |

**No implementation of any of the above has occurred.** This table specifies mechanisms and, where honest, flags which numbers are placeholders pending empirical tuning versus which changes are pure logic corrections with no tunable constant at all.

---

## 9. Acceptance tests (new, additive to `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §8's AT-1…AT-8)

| # | Acceptance test |
|---|--------------------|
| AT-9 | The corrected eligibility rule (§6) applied to both failing corpus examples produces `primary: null, confidence: low` — **not** a confident wrong answer — as an intermediate state, before `outcomeSignals`/conjunction-split work is added. This is a required, separately-observable milestone: honest uncertainty must be verified *before* claiming co-primary detection works, so a future reviewer can distinguish "we stopped being confidently wrong" from "we became correctly confident." |
| AT-10 | After `outcomeSignals` are authored for Finance and Marketing, the "digital course pricing/marketing" corpus entry (`cross-expert.json`) resolves to `co-primary: [MKT, FIN]` (order-independent) |
| AT-11 | After `outcomeSignals` are authored for People & Culture and Systems, the "hire team member/document process" corpus entry resolves to `co-primary: [PC, SYS]` |
| AT-12 | **Regression guard:** "I want to build a business strategy." (existing corpus entry) continues to resolve to `primary: STR`, confirming the generalist tiebreak does not suppress a genuinely well-evidenced Strategy activation |
| AT-13 | Conjunction-split false-positive guard: a corpus of same-domain compound sentences ("I need to write an email and send it," "I want to plan and host a workshop") must **not** trigger a structural co-primary signal — both sub-clauses resolving to the same expert must correctly suppress the mechanism |
| AT-14 | Conjunction-split true-positive guard: the two failing examples (and at least 3 more constructed compound sentences spanning different expert pairs) correctly trigger the structural co-primary path even when neither sub-clause's score alone would clear `STRONG_EVIDENCE_THRESHOLD` |
| AT-15 | Full corpus (`foundersCorpus/`) re-run after all changes shows no regression on any of the 31 currently-passing "clear" entries — the new eligibility rule, generalist tiebreak, and outcome vocabulary must not cause any currently-correct single-expert activation to become `null` or switch to a wrong expert |

**None of these tests have been written or run against new logic.** AT-9 could be verified today as a read-only diagnostic against the *existing* code's tier-counting (confirming the six-way tie is real, which §0 already did) — but correcting the eligibility logic itself is a code change, out of scope for this analysis per the explicit "no code yet" instruction.

---

## 10. What this analysis does not resolve (honest scope limits)

- **Exact `outcomeSignals` vocabulary content** is not authored here — that's implementation work (V2-2), informed by this analysis's framing (deliverable + felt-result phrasing) but not written out phrase-by-phrase.
- **The `SUB_CLAUSE_THRESHOLD` constant** is explicitly a placeholder (§8), not a finalized value.
- **Whether three generalists (Strategy/Momentum/Horizons) is the right, complete set** is a judgment call proposed here, not empirically validated against the corpus — the corpus doesn't yet contain enough Momentum/Horizons examples to check.
- **Conjunction-split's linguistic robustness** (handling of "but," "as well as," nested clauses, non-English phrasing patterns) is sketched at the level needed for this analysis, not fully specified — a real implementation would need a small, dedicated design pass of its own before coding, not assumed to be a two-line regex.

This analysis recommends direction and mechanism with evidence; it does not claim to have finished the design down to the last constant. That remains V2-2's job, informed by this document and tuned against the corpus this thread already built.
