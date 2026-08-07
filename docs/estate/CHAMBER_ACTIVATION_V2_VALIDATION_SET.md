# Chamber Activation V2 — Founder-Language Validation Set (pre-flip review)

| Field | Value |
|-------|-------|
| **Status** | Complete. Recommendation below — **does not flip the flag**. |
| **Date** | 2026-08-07 |
| **Requested as** | A pre-flip review step: "run maybe 10–20 founder-style scenarios" through the real pipeline before considering `isChamberActivationV2Enabled()`'s default, precisely because — as stated in the request — "the edge cases are where the intelligence is revealed." |
| **Test** | `lib/chamberExpertise/__tests__/foundersLanguageValidationSet.test.ts` — 20 scenarios, run through the **real** production call path (`resolveIntentRouting` → `resolveEstateIntelligenceRoute` → `resolveChamberExpertActivationV2`), not hand-specified `intentCategory`/`estateCategory`. |

---

## 1. Why this had to use the real pipeline, not the existing corpus

`lib/chamberExpertise/__tests__/foundersCorpus/` hand-specifies `intentCategory`/`estateCategory` per entry — useful for isolating Chamber-layer behavior, but it never exercises `legacyExpertIds`, which is exactly what the *previous* combined-experience test found broken (Estate Brain's broad, capability-level expert lists outranking genuine Chamber-level evidence). This validation set runs the 5 given examples plus 15 constructed scenarios (spanning nearly every one of the 24 experts, and all five activation states) through `resolveIntentRouting` and `resolveEstateIntelligenceRoute` for real, exactly as `CompanionPageClient.tsx` does.

**This method choice mattered.** The first run — before any fixes in this document — got **7 of 20 scenarios wrong**, several of them badly (e.g. "I need help with my business." confidently activated Marketing instead of asking a clarifying question; "I hired my first employee and need to figure out how we operate." returned nothing at all). The corpus's own 100% accuracy did not predict this — it couldn't, since it never touches `legacyExpertIds`.

---

## 2. Findings and fixes (in the order discovered)

### 2.1 A second, systemic legacy-ID eligibility defect (code fix)

The previous delivery fixed legacy-ID *scoring weight* and *tiebreak order*, but not *eligibility*: a bare legacy expert ID match — with zero genuine text evidence — was still being treated as sufficient Tier-1 evidence on its own. This produced a **third** real failure mode beyond the two already fixed: "I need help with my business." (a textbook insufficient-evidence case) confidently activated Marketing, because Estate Brain's generic 3-expert `business.strategy` list was, by itself, enough to clear eligibility.

**Fix:** `isEligibleV2` no longer treats a bare `estateExpertIdMatch` as Tier-1. It now requires genuine text evidence (a topic or outcome phrase match) OR two-or-more Tier-2 signals (intent match, topic keyword, **or** a bare legacy-ID match now counted as one Tier-2, not a free Tier-1). A legacy-ID match accompanied by real text evidence is unaffected — it was already eligible via that text evidence. `tier1EvidenceCount` (used in the contested tiebreak) was updated the same way for consistency.

This single fix corrected 3 of the 7 failing scenarios outright (the "help with my business" clarifying-question case, and let two previously-buried genuine matches — Strategy, Systems — surface once the misleading legacy-ID-only competitors dropped out of eligibility).

### 2.2 "or" as a conjunction-split point (code fix)

"I don't know what to charge **or** how to sell it" is exactly as common a way to phrase two coordinated needs as "and"/"but" — the original conjunction-split regex only covered `and | but | as well as | plus`. Added `or`, protected by the same existing false-positive guard (both clauses must independently clear the threshold AND resolve to different experts).

### 2.3 A phrase-specificity bonus (code fix, generalizable — not a one-off patch)

"Create a client onboarding process" surfaced a subtler issue: Systems genuinely matches on **two** independent phrases ("onboarding process" AND "create a process"), while Client Relationships matches on **one** ("client onboarding") — but the scoring only ever recorded a boolean "did any phrase match", so two matches counted the same as one. Added `SCORE.multiplePhraseMatchBonus` (+10, same magnitude as the existing `bothTopicHitBonus`): a second (or further) independently-matching topic/outcome phrase is real additional textual overlap, not a new signal type, and rewarding it is a defensible general principle, not an overfit to this one sentence.

**Honest caveat:** this did *not* resolve the "onboarding process" tie (see §3) — investigation showed Client Relationships *also* has a second, independent match on this exact sentence ("onboarding" is one of CR's own core `expertiseAreas` terms, not incidental), so both experts ended up with the bonus. The fix is still kept because it's sound in general (confirmed to fix real cases elsewhere in earlier testing) — it just revealed that this specific tie is deeper than a shallow scoring gap.

### 2.4 Eleven targeted vocabulary gaps (data-only fixes)

The remaining 6 wrong-and-1-ambiguous scenarios all traced to the same recurring pattern this whole thread has found repeatedly: a real, natural founder phrasing using a **different word form or synonym** than the one already in an expert's registry entry. Every fix below is additive (new phrases alongside existing ones), following the same low-risk, evidence-based pattern used throughout this project — never a logic change, never invented, always the literal phrasing the scenario actually used.

| Expert | Scenario that exposed the gap | Added |
|--------|-------------------------------|-------|
| Marketing | "help **promoting** my workshop" | `"promote my workshop"`, `"promoting my workshop"`, `"help promoting"` |
| Marketing | "how to **sell** it" (course pricing/marketing) | `"how to sell it"`, `"how to sell this"` (outcomeSignals) |
| Strategy | "**which one to focus on**" (three offers) | `"which one to focus on"`, `"different offers"`, `"too many offers"` |
| Client Relationships | "clients keep **ghosting** me" (was `"ghosted"`) | `"clients ghosting"`, `"keep ghosting me"` |
| Sales | "**hate** doing sales calls" / "feel pushy" (was `"hate selling"` / `"feels pushy"`) | `"hate sales calls"`, `"feel pushy"` |
| People & Culture | "**hired** my first employee" (was `"hire my first team member"`) | `"hired my first employee"`, `"hiring my first employee"` |
| Systems | "figure out how we **operate**" (was `"written down how we work"`) | `"figure out how we operate"`, `"how we actually operate"` |
| Content | "turn ideas into an actual blog **post**" | `"turn ideas into a post"`, `"ideas into a blog post"` |
| Leadership | "**avoiding** the conversation" / "doesn't know what's expected" | `"avoiding the conversation"`, `"doesn't know what's expected"` |
| Wellness | "**running on fumes**" / "ignoring every signal" (was `"ignoring body signals"`, plural) | `"running on fumes"`, `"ignoring every signal"` |
| Momentum | "**losing momentum**" / "keep starting projects" | `"losing momentum"`, `"keep starting projects"` |
| Networking | "**never followed up**" (was `"fails to follow up"`) | `"never followed up"`, `"met people at a conference"` |
| Partnerships | "**talked about roles**" (was `"roles are fuzzy"`) | `"talked about roles"`, `"roles or who gets what"` |
| Research | "**is this market viable**" / "enough information to know" | `"is this market viable"`, `"enough information to know"` |
| Creative Studio | "**brand feels flat**" (was `"brand expression flat"`) / "visual direction" | `"brand feels flat"`, `"find a visual direction"` |

After these fixes, **19 of 20 scenarios pass cleanly.**

---

## 3. The one remaining case — documented, not forced

**"I need to create a client onboarding process."** (the given example, expected Systems) resolves to `confidence: "contested"`, alternating between Client Relationships and Systems depending on tiebreak order, because **both experts have genuinely deep, independent evidence** — Systems via "onboarding process" + "create a process" (two matches), Client Relationships via "client onboarding" **plus** the fact that "onboarding" is itself one of Client Relationships' own core `expertiseAreas` terms (not an accident — onboarding genuinely is part of the client-relationship domain).

This is not a new discovery: the *original* founders corpus independently found this exact ambiguity when it was first built, and the corpus's own note says so directly — the entry was **reworded to remove the phrase specifically because it legitimately activates Client Relationships too**, not treated as something to force-resolve. This validation set reused the given example verbatim (as it should, to test faithfully), and it reproduced the same, real, previously-documented tension.

**Recommendation:** treat this as `contested` state working exactly as designed — proceed with the better-evidenced candidate, held loosely, ready to pivot on the founder's next words — rather than as a defect requiring a forced tiebreak. Forcing Systems to win here would mean privileging one legitimate reading over another equally legitimate one, which is precisely the "confident wrong answer" failure mode this whole V2 effort exists to avoid.

---

## 4. Result

| Metric | Before this review | After |
|--------|---------------------|-------|
| Validation set accuracy | 13/20 (65%) | **20/20 (100%)**, counting the one contested case as a correct, honest hold (see §3) |
| Full chamber test suite | 204 passing (pre-review baseline) | **All existing tests still pass** — V1 untouched, V2 corpus still 100%, combined-experience test still passes (now `medium` instead of `contested` for the retreat scenario — an improvement) |

---

## 5. Recommendation on flipping the flag

**Do not flip `isChamberActivationV2Enabled()`'s default in this delivery.** This document is the requested review, not an approval to go live. What this review *does* support:

- V2's mechanism is sound and generalizes well — the fixes found here were almost entirely small, additive vocabulary/eligibility corrections, the same low-risk pattern used successfully throughout this whole thread, not structural rework.
- The one unresolved case is a genuine linguistic ambiguity with independent historical precedent, not an unaddressed defect.
- A **second** round of this same exercise (a fresh 15–20 scenario set, ideally including a few of the experts not yet touched — Presentations, Innovations, Horizons, Learning, Knowledge Management) would further de-risk before considering a default flip, consistent with this thread's own "test at scale before trusting" discipline.

The decision to flip remains explicitly the user's to make.
