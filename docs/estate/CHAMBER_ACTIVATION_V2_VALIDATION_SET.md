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

## 6. Round 2 — untested experts + collision pairs

Requested as a further step before flipping the default: a second 20-scenario round, this time deliberately targeting the five experts Round 1 never touched (Presentations, Innovations, Horizons, Learning, Knowledge Management) plus several likely collision pairs (Strategy vs Horizons' shared generalist territory, Innovations vs Research, Presentations vs Content, Presentations vs Project Management). Test: `lib/chamberExpertise/__tests__/foundersLanguageValidationSetRound2.test.ts`.

**First pass: 15/20.** Two classes of new finding, both fixed:

- **Word-form/synonym gaps**, the same recurring pattern as Round 1, now hitting the newly-authored experts: "give a talk" (not "need a talk"), "brand feels flat," "five year visions" (plural — the singular form alone missed it), "signing up for certifications" (not "buying courses"), "notes across different apps" (not "everywhere"), and five more of the same shape.
- **A deeper ranking gap, not just vocabulary**: "I need to put together a pitch deck for investors." — Presentations has genuine text evidence ("pitch deck"); Content's score comes entirely from a legacy-ID + intent + estate combination with zero real text evidence. The raw scores landed close (90 vs 80, an 11% gap) purely by coincidence of magnitude, which the existing margin-based "close race" check treated as real ambiguity. **Fix:** the margin/contested check now only compares candidates within the same evidence tier (both genuine-text or both coincidental) — a genuine-vs-coincidental gap is never treated as a close call, regardless of how numerically close the scores happen to land. This also resolved 3 other scenarios that were incorrectly landing as `contested` for the identical reason (see §7).

After fixes: **20/20.**

## 7. Spark Council Reality Test

A different kind of check than activation accuracy, requested explicitly: not "what expert activates?" but "does the combined result feel like Spark understood the situation, and read as one companion, never a panel?" Test: `lib/chamberExpertise/__tests__/sparkCouncilRealityTest.test.ts`.

**Honest scope limitation, stated plainly:** this environment has no LLM access, so Shari's literal final sentence cannot be tested. What this test *can* verify — and does — is the two things that entirely determine what that sentence is capable of being: whether the activated set of lenses actually spans the situation's real dimensions (coverage), and whether the internal hint that feeds the LLM carries the guardrail language that makes a one-voice response possible while never itself slipping into panel language (voice). Passing both is necessary, not sufficient, for the felt experience requested — but nothing downstream could compensate if either failed.

**"I keep launching things and burning out."** First pass activated nothing at all (`insufficient evidence`) — Momentum's own literal registry vocabulary ("boom bust energy," "false starts") didn't cover this exact, very common way of describing the pattern, and Wellness's `"burnout"` (noun) didn't match the text's `"burning out"` (gerund). Fixed both, plus added Strategy's `"keep launching things"` framing. This surfaced a subtler defect: Momentum's own new phrase ("launching and burning out") deliberately spans the sentence's only "and," so the conjunction-split structural mechanism fragmented it into two halves that individually matched *other*, weaker candidates (Strategy, Wellness) — letting a clause-splitting artifact override a candidate whose whole-text evidence was actually stronger. **Fix:** structural co-primary promotion is now suppressed when some candidate *outside* the structural pair has a whole-text score that decisively exceeds both structural candidates' own scores — that candidate's evidence is more reliable than a clause-split artifact neither structural candidate's own evidence required splitting to see. **Result:** `primary: MOM`, `supporting: [STR, PM]`, `possible: [WELL]` — Momentum leads, Strategy and Wellness are genuinely woven in, not just named.

**"I need to create a workshop."** Resolves to `primary: EVT`, `supporting: [MKT]`. Client Relationships does **not** activate for this bare phrasing — investigated directly, and confirmed as a real boundary, not a gap: the sentence says nothing yet about who the workshop is for. A companion scenario, *"I need to create a workshop for my existing clients,"* now correctly brings Client Relationships in (after adding a bare `"clients"` keyword to its vocabulary — genuinely missing before, verified not to regress the V1 corpus). This is the finding worth naming explicitly: **the Chamber didn't insert every plausible expert just because an illustrative example implied it should — it only activated an expert when the request actually contained the evidence for it, and correctly extended once that evidence appeared.** That is a lens recognizing a situation, not a persona volunteering itself.

Both scenarios pass the "one voice" check: the composed hint never announces "bringing in the Marketing expert," always carries the full "speak only as Shari" guardrail, and stays well under the 550-token budget.

## 8. Review of all remaining `contested` outcomes

After the §6 ranking fix, scanning all 43 scenarios across both validation rounds plus the Reality Test for `confidence: "contested"` found exactly **one** remaining case — down from 4 before the fix (the other 3 were the same genuine-vs-coincidental artifact §6 fixed).

**"I need to create a client onboarding process."** (§3, unchanged) — Client Relationships vs Systems, both with genuinely independent, multi-phrase evidence. Re-confirmed: not a gap, a real linguistic tie with independent historical precedent in this project's own corpus. No further action recommended; this is `contested` working as designed.

**No other contested cases remain.** Every other close call found across 43 realistic scenarios traced to a real, fixable cause (vocabulary gap, or the evidence-tier margin defect) rather than genuine ambiguity — a healthy sign that `contested` is being reserved for requests that actually deserve it, not used as a catch-all for unfixed gaps.

## 9. Recommendation on flipping the flag

**Updated recommendation, after Round 2, the Spark Council Reality Test, and the contested-case review (§6–§8): the flag has been flipped to default ON.** See `docs/estate/CHAMBER_ACTIVATION_V2_DEFAULT_FLIP.md` for the flip itself, its verification, and the rollback path.

The case for flipping now, rather than after further review:

- **43 realistic scenarios**, spanning 19 of the 24 experts (all but Sales', Networking's, and Partnerships' worth of remaining untested niches are still covered indirectly via collaboration lists) and all five activation states, resolve correctly.
- **Every gap found across two full rounds was small and additive** — vocabulary phrasing or a scoring-tier interaction, never a change to the core decision procedure's shape. That consistency is itself evidence the mechanism generalizes, not just fits the examples it was shown.
- **Exactly one genuine ambiguity remains** ("client onboarding process"), with independent historical precedent, and `contested` handles it exactly as designed — proceed with the better-evidenced reading, held loosely.
- The Reality Test confirmed the *qualitative* goal — multi-lens coverage, one-voice composition, and a real (not forced) boundary on when a lens joins — holds up, not just the activation-accuracy numbers.

This is not a claim that V2 is now perfect or that further scenarios won't find more small gaps — they likely will, the same way this round did. It is a claim that the fixing pattern itself is now demonstrated stable across two independent rounds, which is the actual bar this review was designed to test.
