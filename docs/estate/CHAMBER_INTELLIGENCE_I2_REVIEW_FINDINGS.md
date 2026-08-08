# Chamber Intelligence I-2 Review Findings

| Field | Value |
|-------|-------|
| **Status** | Review complete. **Stopped per instruction — no I-4 (remaining 21 experts) started.** |
| **Date** | 2026-08-07 |
| **Scope** | Validate the I-2 pilot (Marketing, Systems, Events) before expanding the registry |
| **Depends on** | `CHAMBER_INTELLIGENCE_I1_I2_SUMMARY.md` |
| **Result** | **Two real activation defects found and fixed. Three design decisions reviewed and judged. One new acceptance test added (14 tests).** |

---

## 1. Method — how "real conversation simulations" were run

**Honest scope note, up front:** this environment has no live LLM API key. A genuine end-to-end "type into Create, read Shari's actual reply" test is not possible here (the earlier "Create UI response box" investigation established the same constraint). What *is* possible, and what was done:

1. Generate the **actual hint text** that would reach the model's system prompt (`chamberExpertiseHintForChat`, flag on vs off) for 9 realistic, varied phrasings — 3 per pilot expert, deliberately written as a founder would actually talk, not as trigger-matching keyword lists.
2. Read that hint text as a reviewer and ask: *if I were the model reading only this, would my recommendation actually differ between the "off" and "on" versions?*
3. Cross-check every framework/translation/question selected against the source markdown for fidelity.

This tests the real mechanism (the hint is 100% of what changes reaching the model) without needing to trust a live generation. It cannot verify the model *follows* the hint well — that remains a documented limitation, same as Phase C.5's contribution tests.

---

## 2. Finding #1 (critical): realistic phrasing broke activation for 5 of 9 scenarios — fixed

Running the 9 scenarios against the **existing, unmodified** activation registry (`chamberExpertRegistry.ts`, Phase A/B) before making any changes:

| Scenario | Expected primary | Actual primary (before fix) |
|----------|-------------------|-------------------------------|
| "Nobody knows I exist and I don't know what to post anymore." | Marketing | **Strategy** ❌ |
| "I keep launching things and it wipes me out every single time." | Marketing | **Strategy** ❌ |
| "I'm hosting a workshop next month and the agenda keeps growing." | Events | **Strategy** ❌ |
| "I always crash after events and forget to follow up with people." | Events | **Sales** ❌ |

**Root cause 1 — vocabulary drift between layers.** The I-2 intelligence modules (`experts/MKT.ts`, `EVT.ts`) were authored with rich, specific `whenToUse`/`appliesWhen` trigger phrases (e.g. "nobody knows i exist" already existed as a *framework* trigger). But the **activation-layer** registry (`chamberExpertRegistry.ts`, built in Phase A, before I-2 existed) was never updated with the same vocabulary. Result: the deep intelligence for the correct expert was fully built and correctly selectable — but the expert never got the chance, because Phase B's activation step chose a different primary entirely, defaulting to Strategy via tied-score array order.

**Root cause 2 — unrelated keyword collision.** "I always crash after events and forget to **follow up** with people" contains the literal phrase "follow up," which is a Sales activation trigger (`activationSignals: [..., "follow up", ...]`). Sales scored higher (topic match + estate category = 2 signal groups) than Events (which had no matching phrase at all for this wording, only intent + estate category = 2 groups but lower point total). The anti-keyword-only rule correctly prevented Sales from activating on "follow up" *alone*, but did not prevent it from **outscoring** a more conceptually correct expert that simply lacked any matching phrase.

**Fix applied (data only, no logic change, in scope — these are 2 of the 3 experts under review):**

```diff
  MKT activationSignals: + "nobody knows i exist", "what to post", "know what to post", "wipes me out", "launch fatigue"
  EVT activationSignals: + "hosting a workshop", "agenda keeps growing", "crash after events", "after the event"
```

**Result after fix:** all 9/9 scenarios now activate the correct primary expert. Verified with the full existing test suite (102/102 passing) to confirm no regression to previously-tested scenarios.

**Not fixed (explicitly out of scope for this review):** Sales' "follow up" trigger was not touched — that's a non-pilot expert, and touching it risks side effects on scenarios not under review here. Flagged for a future pass: **generic single-domain phrases with high point value (e.g. "follow up," "launch") can outscore a more topically-correct expert who has no matching phrase at all.** This is a scoring-robustness question for the activation layer (Phase B), not an I-2 selection-layer defect — recorded here because it was *discovered* by I-2 pilot validation.

---

## 3. Finding #2: does the activated intelligence change answer quality, not just the prompt?

**Yes — with two important qualifiers found during simulation (both handled honestly, not hidden).**

### Evidence of genuine differentiation (not templating)

| Scenario | Framework selected | Why it differs from the others |
|----------|----------------------|-----------------------------------|
| MKT "I need a marketing strategy" | Promise–Proof–Path + 30-Day Marketing Experiment | Broad ask → foundational positioning + planning frameworks |
| MKT "Nobody knows I exist..." | Trust Asset Ladder | Different framework — the module recognized this as a *trust/visibility* problem, not a planning problem |
| MKT "launches wipe me out" | *(none matched)* | Correctly selected nothing rather than forcing an irrelevant framework — see §4 |
| SYS "client onboarding process" | Minimum Viable Process + "Full SOP library first" translation | Matches the recurring-process framing directly |
| SYS "team doesn't know what to do without me" | "Full SOP library first" translation only, no framework | Bus-factor language matched the ADHD translation's trigger but not any framework's literal phrase — partial match, not full |
| EVT "two-day ADHD retreat" | Event Promise Anchor + Agenda Prune + 2 ADHD translations | Richest case — most concrete pain signals present |
| EVT "agenda keeps growing" | Event Promise Anchor only | Correctly lighter than the retreat case — "too many segments" (Agenda Prune's trigger) wasn't said |
| EVT "crash after events, forget to follow up" | "Follow up afterward" translation only | Matched the aftercare-specific translation, not the agenda frameworks — proportionate to what was actually said |

**This is the core positive finding:** three different phrasings of "I have a marketing problem" produced three genuinely different selections (one rich, one different-but-rich, one appropriately empty) — this is what "changes the answer, not just the prompt" looks like operationally. A generic system would produce the same "here's some marketing advice" regardless of phrasing; this one visibly doesn't.

### Qualifier A: "length is not a proxy for usefulness" (found while building the Expert Value Test, §5)

For the "launch fatigue" case where no framework/translation matched, the enriched render (facets + question only) was **shorter** than the old fallback (full thinking-pattern sentence + 5 themes) — 205 vs 229 tokens. A naive "is the new hint bigger/more" check would have failed this case even though the correct expert still activated and still contributed a targeted question. **Usefulness must be judged by content specificity, not length** — the Expert Value Test (§5) was corrected to reflect this.

### Qualifier B: the selection layer's own gating is honest, but incomplete coverage remains

Two scenarios (SYS "reinventing the same steps," MKT "launch fatigue") matched **no framework at all** despite being clearly on-topic to a human reader. This is the selection layer correctly refusing to force a mismatched framework — not a bug — but it does mean **framework/translation trigger coverage is narrower than natural language variation**, a known and expected v1 limitation of literal-phrase matching. Not fixed in this review (would require either more trigger phrases per framework across all pilots, or a fuzzier matcher — both are I-4+ scope decisions, not review-blocking defects).

---

## 4. Markdown-to-runtime mapping accuracy audit

Beyond the automated `profileDrift.test.ts` (which checks that runtime *strings* trace back to the markdown), this section manually audits *completeness* and *curation quality* — the drift test doesn't (and shouldn't) enforce 100% coverage, only that whatever *is* migrated is faithful.

| Expert | Markdown §4 frameworks | Migrated | Markdown §7 ADHD adaptations | Migrated | Markdown §5 questions | Migrated |
|--------|--------------------------|----------|----------------------------------|----------|---------------------------|----------|
| Marketing | 5 | **5/5** ✅ | 5 | **2/5** | 7 | **2/7** |
| Systems | 5 | **5/5** ✅ | 5 | **2/5** | 7 | **2/7** |
| Events | 5 | **5/5** ✅ | 6 | **3/6** | 9 | **2/9** |

**Finding:** frameworks are fully migrated (all 5 per expert), but ADHD translations and signature questions are intentionally partial (~40% and ~25% coverage respectively). This was a deliberate curation choice during I-2 build (pick the most common ADHD pain points; ship 2 questions, only 1 ever surfaces per turn) — **appropriate for a pilot, but explicitly not "done."** Before I-4 scales this pattern to 21 more experts, the remaining ADHD translations (3 per expert, 9 total across the pilots) should be evaluated for inclusion — some may not be worth the token budget, but that's a decision, not an oversight, and it hasn't been made yet.

**Fidelity check (the "is it accurate" half of this task):** spot-checked every migrated framework's `purpose`/`sparkExplanation`/`adhdApplication` against its markdown source. All 15 (5×3 experts) read as faithful paraphrases or direct quotes of the source — no cases found where a migrated framework's *meaning* diverged from its markdown description. The `profileDrift.test.ts` failures encountered during original I-2 build (curly-quote mismatches, one genuinely paraphrased ADHD `traditional` phrase) were caught and fixed at that time; no new fidelity issues found in this review.

---

## 5. Expert Value Test — added

New file: `lib/chamberIntelligence/__tests__/expertValueTest.test.ts` (14 tests).

**What it measures:** *"Would removing this expert's intelligence materially reduce the usefulness of the response?"* — operationalized as: a "with intelligence" selection must contain at least one concrete, actionable **value marker** (a named framework, a named ADHD translation, or a targeted question) that the pre-pilot baseline (bare name + thinking-pattern summary) didn't have.

**Structure:**

| Group | What it proves |
|-------|-----------------|
| On-topic requests (8 cases, 2-3 per pilot) | Materiality — every genuinely relevant request gets ≥1 concrete marker beyond the baseline |
| Sensitivity (3 cases) | The test can correctly find **zero** gated value for off-topic requests — a test that always passes would be worthless. Uses a `countTopicGatedMarkers` metric (frameworks + translations only) that excludes the always-present question, per Finding in §6 |
| Situational differentiation (2 cases) | Value *content* differs by phrasing (Marketing selects different frameworks for different pain points); value *quantity* scales with how much concrete pain is described (Events) |
| Role scaling (1 case) | A supporting expert contributes real but proportionally smaller value than the same expert as primary |

**Why the sensitivity tests needed a fix mid-build (documented, not hidden):** the first version of this test asserted zero *total* markers for off-topic text, and failed — because the signature question is unconditionally included for `role: "primary"` regardless of topical relevance (see §6). This is itself a legitimate finding the test surfaced, not a bug in the test. The metric was split into `countValueMarkers` (total, used for materiality) and `countTopicGatedMarkers` (frameworks + translations only, used for sensitivity), and both are now documented in the test file itself.

---

## 6. The three V1 acceptability questions — judged

### Q1: Are deterministic signature questions acceptable for V1?

**Judgment: Acceptable for V1, with a documented consequence, not a blocker.**

Evidence: across all 3 Marketing scenarios (broad strategy / visibility overwhelm / launch fatigue), the **same** question ("If someone repeated your offer back to a friend...") appeared every time, regardless of which specific pain point was described. The question does not adapt; frameworks and translations do.

This is a real, now-quantified limitation — not a hidden one. It's acceptable for V1 because: (a) the question is still topically appropriate for Marketing work generally (never wrong, just non-adaptive), (b) it's the *smallest* piece of content in the hint (one line), and (c) it was a documented, deliberate scope cut in the original I-2 summary, not an oversight.

**Recommendation for I-4+:** before scaling to 21 more experts, consider making question selection trigger-matched like frameworks (each expert already has 2 candidate questions post-migration; matching by situation is a bounded follow-up, not a redesign).

### Q2: Is fixed thinking-pattern facet ordering acceptable for V1?

**Judgment: Acceptable for V1, no reservation.**

Facets are fixed-order by design (first `notices`, then `creates`) and this showed up consistently in simulation (e.g. Marketing always led with "notices invisible offer"). Unlike the question, this is judged fully acceptable because the Expert Thinking Pattern is explicitly meant to be a **stable identity signature** ("what does this expert always notice") rather than a per-situation selection — the founder-given calibration examples (Systems: "notices friction... reduces decisions... creates paths") describe a consistent character trait, not a dynamic response. Fixed ordering is the correct behavior here, not a limitation.

### Q3: Is the 550-token budget maintained after composition?

**Judgment: Yes, verified — with one caveat about coverage growth.**

- Composer-level hard cap (added during I-2 build after a 588-token violation was caught by tests) held across all 9 new realistic scenarios plus the original 4 architecture-doc scenarios. Worst observed: 539/550 (Events retreat, richest case).
- **Caveat:** no combination currently exists where all 3 pilots are simultaneously primary + supporting + supporting, because none of the 3 pilots list *each other* as a full triangle in their `supportingRelationships` (Marketing↔Strategy/CR, Systems↔CR/PM/KMG, Events↔Marketing/CR — Events↔Marketing is the only pilot-to-pilot link that exists today). **This means the current test coverage cannot yet exercise the theoretical worst case of 3 simultaneously-enriched pilot experts.** As I-4 migrates more experts, the number of possible dense combinations grows, and budget testing will need to be revisited — not urgent now, but should not be assumed proven for combinations that don't yet exist.

---

## 7. Summary verdict

| Item | Verdict |
|------|---------|
| Real conversation simulations run for all 3 pilots | ✅ 9 scenarios, 3 per expert |
| Activated intelligence changes answer substance, not just naming | ✅ demonstrated with genuine per-scenario differentiation; 2 caveats documented (§3) |
| Markdown-to-runtime mapping reviewed for accuracy | ✅ frameworks 100% faithful and complete; ADHD translations/questions faithful but intentionally partial (§4) |
| Deterministic questions acceptable for V1 | ✅ Yes, with a recommendation for I-4 |
| Fixed facet ordering acceptable for V1 | ✅ Yes, no reservation — correct by design |
| 550-token budget maintained | ✅ Yes, verified; caveat about untested 3-pilot-simultaneous combinations |
| Expert Value Test added | ✅ 14 tests, `lib/chamberIntelligence/__tests__/expertValueTest.test.ts` |
| Activation defects found during review | ✅ 2 found, both fixed (data-only, no logic changes) |

**Test totals:** 102/102 passing in the Chamber area (88 existing + 14 new Expert Value Test); 235/235 across the broader regression sweep (`intelligence-layer`, `estateBrain`, `intentRoutingIntelligence`). `tsc`/`eslint` baseline unchanged.

---

## 8. Stopping point

Per instruction: **no expansion to the remaining 21 experts.** Before that work begins, the recommendations worth carrying into I-4 planning are:

1. Decide the target ADHD-translation/question coverage percentage per expert *before* migrating 21 more (currently ~40%/~25% for the pilots — was that intentional as a permanent target, or should it move toward higher coverage?).
2. Consider trigger-matching signature questions, not just frameworks, given the documented consequence in §6 Q1.
3. When more experts are migrated, re-run budget stress tests against the *new* set of possible 3+-expert combinations, since today's pilots don't yet exercise that path.
4. The "generic phrase outscores topically-correct expert" pattern (§2, Sales' "follow up") is worth a small, separate audit of high-point-value single-phrase triggers across the full 24-expert registry — out of scope here, but the mechanism by which it happens is now understood and documented.
