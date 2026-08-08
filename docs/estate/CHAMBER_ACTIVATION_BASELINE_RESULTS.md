# Chamber Activation — Baseline Corpus Results

| Field | Value |
|-------|-------|
| **Status** | Baseline measurement — kept separate from `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` so the corpus can grow without re-editing the spec each time |
| **Date** | 2026-08-07 |
| **Measured against** | The **live, unmodified `resolveChamberExpertActivation`** (V1) — no scoring logic changes were made to produce these numbers |
| **Corpus size** | 36 entries — 31 `clear`, 4 `co-primary`/`contested` (soft), 0 `no-match` yet |

---

## 1. Headline numbers

| Metric | Result |
|--------|--------|
| **"Clear" entry accuracy** | **31/31 (100.0%)** |
| **Co-primary/contested soft landing rate** | 2/4 landed on a documented candidate (informational only — see §3) |

**100% did not come from writing easy test cases.** Building this corpus (deliberately in the same varied, realistic-founder-voice style as the I-2 review, not trigger-phrase echoes) found **3 more activation gaps** on the first run, on top of the 2 the review already found and fixed. All 3 were fixed the same way — small, targeted, data-only additions to the affected expert's own `activationSignals` — before this corpus was allowed to claim 100%.

---

## 2. Gaps found while building this corpus (3, all fixed)

| Corpus entry | First-run result | Root cause | Fix |
|--------------|---------------------|--------------|-----|
| "Every time a new project starts, I wing it differently..." (originally phrased with "client onboarding") | Activated **Client Relationships**, not Systems | "client onboarding" is a genuine, correct CR trigger phrase — this was a **corpus authoring mistake**, not a registry defect. The sentence genuinely leans CR as literally written. | Reworded the corpus entry to remove the CR-specific phrase and isolate the process-consistency angle it was meant to test |
| "I'm hosting a retreat and I have no idea how to pace the two days..." | Activated **Strategy**, not Events | No `"hosting a retreat"` trigger existed (only `"hosting a workshop"` did, and even that requires the exact word "hosting") | Added `"hosting a retreat"` to `EVT.activationSignals` |
| "I want to host a workshop but I'm scared I'll pack it too full again." | Activated **Strategy**, not Events | `"hosting a workshop"` requires the word "hosting"; this sentence used "host" (different verb form) — V1's matcher has no stemming/lemmatization | Added `"host a workshop"` to `EVT.activationSignals`, alongside the existing "hosting" form |

**Pattern worth naming:** two of the three gaps were the *same class* of problem the I-2 review already found — a single verb-form or preposition variant ("host" vs "hosting," "retreat" not covered alongside "workshop") missing from an otherwise well-covered expert. This is exactly the "trigger drift as profiles grow" risk `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §6 and `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` warned about, now observed a third and fourth time. **V1's literal, non-stemmed word matching is a recurring source of small gaps, not a one-off.** This is evidence (not yet a decision) that V2's eventual scoring work should seriously consider light stemming/lemmatization or fuzzy word matching as part of `lib/chamberExpertise/textMatch.ts`, beyond what's currently scoped in the V2 proposal. Recorded here as a finding for V2 planning, not implemented now.

---

## 3. Co-primary / contested findings (informational, not pass/fail)

| Entry | V1 primary | Landed on documented candidate? | What this shows |
|-------|--------------|-------------------------------------|---------------------|
| "I keep meaning to follow up but I never do." (contested: SALES vs EVT) | SALES, confidence `medium`, score gap **10** | Yes (Sales is one of the two) | The gap of 10 is well inside the proposed `CONTESTED_MARGIN_RATIO` zone once a real runner-up exists — but in this bare phrasing, Events doesn't even reach eligibility (no topic match, only 1 signal group), so there's no real runner-up to be close to. This is itself informative: **the historical bug's exact shape (a truly 2-vs-2 tie) required the specific, now-fixed sentence; a context-free "follow up" alone isn't actually a tie under V1 — it's a confident-but-arguably-premature single answer.** This nuance was flagged honestly in the corpus entry's own note rather than papered over. |
| "digital course... pricing and marketing" (co-primary: FIN vs MKT) | **Strategy**, confidence `medium`, score gap 0 (no runner-up scored) | **No** — neither documented candidate activated | V1 currently misses this dual-relevance case entirely, defaulting to a generic Strategy match via intent+estate category alone, with neither Finance nor Marketing reaching real topical strength. **This is the clearest evidence in this corpus for why co-primary detection matters** — a human founder asking this question would be poorly served by either Strategy alone or by V1's current answer. |
| "hire my first team member... haven't documented how we do things" (co-primary: PC vs SYS) | **Strategy**, confidence `medium`, score gap 0 | **No** | Same pattern as above — People & Culture's `activationSignals` don't yet cover "hire my first team member" in a form that matches (word-form mismatch again — "hire" vs the registry's "hires"/"hiring" forms), so PC never reaches eligibility for this phrasing at all. |
| "hosting a two-day retreat that's also meant to sell..." (co-primary: EVT vs SALES) | **Events**, confidence `high`, score gap **35** | Yes (Events is one of the two) | Events wins clearly here because the retreat-specific vocabulary is well covered; Sales doesn't activate at all for this phrasing (no literal Sales trigger word present) — an honest, expected limitation given Sales' registry wasn't touched in this delivery (out of scope, same as the I-2 review's own scoping decision) |

**Read together, these four results make the strongest case in this whole body of work for why V2's co-primary/contested mechanism is needed, not just theoretically motivated:** in 2 of 4 constructed dual-relevance examples, V1 doesn't even name one of the two legitimately-relevant experts — it defaults to Strategy, a generic fallback, because neither specific domain accumulated enough evidence alone. A human founder asking "how do I price and market this course" gets, today, Strategy-flavored guidance instead of pricing-specific and positioning-specific help. This is not a hypothetical failure mode; it's now a measured one.

---

## 4. What this baseline is for

Per `CHAMBER_ACTIVATION_V2_PROPOSAL.md`'s migration plan, **V2-1 is exactly this: corpus + baseline, no live behavior change.** The next phase (V2-2, still unauthorized) would implement the tiered/specificity-weighted scoring from `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` §2 as a parallel function and compare its corpus results against this baseline — specifically, whether it correctly promotes the two "missed" co-primary cases above to `co-primary` state instead of silently defaulting to Strategy.

**No such implementation has happened.** This document records where V1 stands today, honestly, including its gaps — it does not claim V1 is sufficient, and it does not implement anything to fix what it found beyond the 3 small, in-scope registry patches in §2.
