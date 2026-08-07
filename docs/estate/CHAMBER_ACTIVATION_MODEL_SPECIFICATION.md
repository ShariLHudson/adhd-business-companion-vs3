# Chamber Activation Model — Final Specification

| Field | Value |
|-------|-------|
| **Status** | **Finalized design specification.** Precise enough to implement from directly. Implementation of the scoring/state-machine changes (V2-2 onward) remains unauthorized until this spec is reviewed. |
| **Date** | 2026-08-07 |
| **Supersedes (precision-wise)** | `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §5's "conceptual, not final formula" and `CHAMBER_EXPERT_ACTIVATION_QUALITY_STANDARD.md` §6's "conceptual, not final formula" — both are now made exact here. Neither prior document is wrong; this one removes their remaining ambiguity. |
| **Built alongside** | The acceptance corpus (`lib/chamberExpertise/__tests__/foundersCorpus/`) — real data files, tested against the **current, unmodified, live** `resolveChamberExpertActivation` (V1) to establish the baseline this spec's eventual implementation must not regress below. **No production activation logic changes in this delivery** — see §6. |

---

## 1. The five states — at a glance

| State | One-line trigger | What Spark does |
|-------|---------------------|----------------------|
| **Primary** | An expert clears eligibility with a clear score lead | Leads the hint; full-depth intelligence contribution |
| **Supporting** | A curated collaborator of the primary has any real signal | Lighter-depth contribution, framed as enriching the primary's answer |
| **Co-primary** | Two experts both clear a *strong* bar, from different domains, with no clear lead | Both get full-depth contribution; no "lead/support" framing — two equally central lenses |
| **Contested** | Two experts are close, but *neither* clears the strong bar | One is still named primary (evidence-quality tiebreak), but the hint's confidence framing is softened |
| **Confidence** *(cross-cutting property, not a separate branch)* | Derived from the same scoring pass as the above | Governs how certain the internal hint sounds — never member-facing, never a separate mechanism from the states above |

---

## 2. Exact trigger conditions

### 2.1 Constants (finalized values)

```
STRONG_EVIDENCE_THRESHOLD = 70        // score at/above this = "strong" evidence alone
CONTESTED_MARGIN_RATIO    = 0.15      // (top.score - runnerUp.score) / top.score
PRIMARY_MIN_SIGNAL_GROUPS = 2          // unchanged from V1 (Phase B)
```

`STRONG_EVIDENCE_THRESHOLD = 70` is not arbitrary: under the **existing V1 point values** (`topicPhrase: 35`, `intent: 25`, `estateCategory: 20`, `bothTopicHitBonus: 10`, `legacyExpertId: 40`), every genuinely clear single-domain match observed in both the I-2 review's 9 scenarios and the original Phase B worked examples scored **80–90**. Every weak/generic collision observed (the "follow up" case: Sales 55, Events 45) scored **well under 70**. The threshold sits in the gap actually observed between "real match" and "coincidental match" — it is calibrated to existing evidence, not chosen a priori.

### 2.2 Decision procedure (exact, in order)

```
1. Score all 24 experts (V1's existing computeSignal — unchanged).
2. eligible = experts with signalGroupsMatched >= PRIMARY_MIN_SIGNAL_GROUPS,
   sorted by score descending.

3. If eligible is empty:
     → state = LOW.  primary = null.  (unchanged from V1)

4. top = eligible[0]
   runnerUp = eligible[1]  (may not exist)

5. If runnerUp does not exist:
     marginRatio = 1.0   (i.e., "definitely clear" — no one to be close to)
   Else:
     marginRatio = (top.score - runnerUp.score) / top.score

6. If marginRatio >= CONTESTED_MARGIN_RATIO:
     → clear separation. state = (top.score >= STRONG_EVIDENCE_THRESHOLD) ? HIGH : MEDIUM
     primary = top.id

7. If marginRatio < CONTESTED_MARGIN_RATIO:            // close race
     If top.score >= STRONG_EVIDENCE_THRESHOLD
        AND runnerUp.score >= STRONG_EVIDENCE_THRESHOLD
        AND top.category !== runnerUp.category:         // different domains, both strong
          → state = CO_PRIMARY
          primary = top.id  (kept for backward compatibility with any primary-only consumer)
          coPrimary = [top.id, runnerUp.id]
     Else:                                                // close AND at least one is weak
          → state = CONTESTED
          primary = tiebreak(top, runnerUp)   // see 2.3
          runnerUpExposed = runnerUp.id
```

### 2.3 Contested tiebreak (exact, replaces "raw score wins" and replaces array order entirely)

```
tiebreak(a, b):
  1. Prefer the one with a legacyExpertIdMatch === true (strongest possible evidence type).
  2. Else prefer the one with more Tier-1 evidence (topicMatch specifically from a
     multi-word phrase — phraseMatch, not keywordMatch).
  3. Else prefer the one with more total signalGroupsMatched.
  4. Else prefer the higher raw score (only reached if 1–3 are fully tied).
  5. Array order is NEVER a tiebreak input, at any step.
```

Applying this to the worked "follow up" case (post-fix, hypothetically re-run pre-fix to illustrate the mechanism): Sales had a phrase match (Tier-1) and Events did not (intent-only) — step 2 would have selected Sales as the tiebreak-primary even under V2, with `state = CONTESTED` making the uncertainty *visible* instead of silent. **This confirms the V2 proposal's honest caveat: the mechanism does not guarantee the "right" expert wins a contested tie — it guarantees the tie is never hidden.** The actual correctness fix for this exact sentence was, and remains, the vocabulary patch already shipped in the I-2 review.

### 2.4 Supporting/possible (unchanged trigger logic, restated for completeness)

```
supporting = primaryEntry.supportingRelationships
             filtered to (score > 0), i.e. any Tier-1/2/3 signal at all
             capped at MAX_SUPPORTING (3)
possible   = primaryEntry.possibleRelationships, same filter, capped at MAX_POSSIBLE (2)
```

No change from V1 in this delivery. (The Quality Standard's proposal to require Tier-1/2-only relevance for `supporting`, excluding Tier-3-only matches, remains a **separate, not-yet-authorized** refinement — tracked, not implemented, in this delivery.)

---

## 3. Exactly what Spark does in each state

| State | Hint content shape | Collaboration bridge (Phase D) | Guardrail tone |
|-------|----------------------|-----------------------------------|-------------------|
| **High** | Full-depth primary line (framework/translation/question when available) + normal supporting lines | Normal: "lead with X's read on Y, while Z quietly protects..." | Standard — unchanged from today |
| **Medium** | Same shape as High | Same as High | Same as High — **no behavior difference from High today**; the distinction exists for telemetry/corpus accuracy tracking (§7), not for different member-facing behavior. This is intentional, not an oversight: today's system already treats High/Medium identically at the composer level, and this spec does not add new complexity where the review found no evidence it's needed. |
| **Co-primary** | **Both** experts get the depth today's single `primary` gets — full framework/translation/question selection for each, not one full + one light | **New framing:** "These are equally central, not sequential — weave X and Y together as one answer with two lenses, not a lead and a support." Never says "lead with X." | Same no-handoff/no-announcement rules as today, extended: also never say "these are the two experts helping" — still one voice, two lenses is an internal reasoning frame, not a member-facing structure |
| **Contested** | Same shape as a normal primary (still needs *something* concrete to say) | **Softened framing:** omit the confident "lead with X's read on Y" phrase; replace with something like "this reads as [X]-shaped, though it could also be a [Y] question — stay open to that if the founder's next words point there" | Adds one line: acknowledge internally that this is a close call, so Shari can hold the recommendation a little more loosely and follow the founder's correction naturally, without ever saying "I wasn't sure" to the member |
| **Low** | No hint at all (unchanged from V1) | N/A | N/A |

**Nothing above is member-facing.** Every row describes internal hint content inside `CHAMBER EXPERTISE (internal — shapes Shari's thinking, never announced)`, exactly as today's live hint already frames itself. This spec does not add any new member-visible behavior, room, or interaction — only richer internal guidance for existing, already-shipped hint machinery.

---

## 4. Exactly how each state is tested

| State | Unit test (function-level) | Corpus test (realistic-language, §6) |
|-------|-------------------------------|------------------------------------------|
| **High** | `resolveChamberExpertActivation` returns `confidence: "high"` for a strong, unambiguous input (e.g. legacy expert ID + phrase match + intent match) | Corpus entries `classification: "clear"` with large expected margins |
| **Medium** | Same function, an input with 2 signal groups but score < 70 | Corpus entries `classification: "clear"` with moderate margins |
| **Co-primary** | New unit tests (once implemented): construct inputs where two experts of different categories both score ≥70 with marginRatio < 0.15 (e.g. a synthetic case combining a Finance phrase match with a Marketing phrase match at equal strength) | Corpus entries `classification: "co-primary"` (§6.3) — for the 3 worked examples in the Quality Standard §5 |
| **Contested** | New unit tests: construct inputs where two experts are close but both score < 70 (reproduce the "follow up" shape deliberately, not just by accident) | Corpus entries `classification: "contested"` (§6.3) |
| **Confidence overall** | Existing `resolveChamberExpertActivation.test.ts` suite, extended with explicit confidence-value assertions per case (today mostly asserts `primary`/`supporting`, not `confidence` directly) | Corpus-wide accuracy metric (§7): confidence must correlate with correctness — a `high`-confidence wrong answer is worse than a `contested` wrong answer, and the corpus harness reports both separately |

**Everything in the "Corpus test" column above is built in this delivery for the `resolveChamberExpertActivation` function that exists TODAY (V1)** — since `co-primary`/`contested` as formal states don't exist in V1's type yet, those corpus entries are present now (so they seed the eventual V2 test suite) but are scored today against a **relaxed, honest bar**: does V1's `primary` land on one of the two legitimate candidates? (See §6.4.) This is intentionally weaker than the eventual V2 bar and is documented as such in the corpus harness itself, not silently treated as a full pass.

---

## 5. What is and is not being built in this delivery

| Item | Built now? |
|------|------------|
| This specification document | ✅ Yes |
| Acceptance corpus data files (`foundersCorpus/*.json`) | ✅ Yes — real entries, not placeholders |
| Corpus test harness (`runCorpus.test.ts`) | ✅ Yes — runs against **live, unmodified** `resolveChamberExpertActivation` |
| Baseline accuracy measurement | ✅ Yes — recorded in §7 |
| Any registry data fixes the corpus reveals | ✅ Yes, if found — same low-risk, data-only pattern used twice already in this thread (never a logic change) |
| `resolveChamberExpertActivation`'s scoring logic (tiers, specificity weighting, margin/contested/co-primary detection) | ❌ **Not built** — this is V2-2, still unauthorized |
| `ChamberExpertActivation` type's `coPrimary`/`runnerUp` fields | ❌ **Not built** — depends on V2-2 |
| Composer changes (co-primary/contested framing in `chamberExpertiseHintForChat`) | ❌ **Not built** — depends on the type change above |
| Remaining 21 experts (I-4) | ❌ **Not built**, per explicit repeated instruction |

This mirrors the V2 proposal's own migration plan: **V2-1 is corpus-and-baseline work, explicitly scoped as "no live behavior change."** This delivery is exactly V2-1, nothing more.

---

*(§6 corpus contents and §7 baseline results are recorded in this same document after the corpus and harness are built — see the sections below, added once the data exists.)*

## 6. Acceptance corpus — structure and contents

### 6.1 Location

```
lib/chamberExpertise/__tests__/foundersCorpus/
  MKT.json
  SYS.json
  EVT.json
  cross-expert.json
  runCorpus.test.ts
```

### 6.2 Entry schema (as shipped)

```ts
type CorpusEntry = {
  text: string;
  expectedPrimary?: ChamberExpertId;                 // required for "clear"
  expectedCoPrimaryCandidates?: [ChamberExpertId, ChamberExpertId]; // for "co-primary"
  expectedContestedCandidates?: [ChamberExpertId, ChamberExpertId]; // for "contested"
  intentCategory?: IntentCategory;
  estateCategory?: EstateCapabilityCategory;
  classification: "clear" | "contested" | "co-primary" | "no-match";
  note: string;        // mandatory rationale, per the Quality Standard §9
  source: "review-simulation" | "quality-standard-example" | "constructed";
};
```

### 6.3 What the corpus contains

- **All 9 scenarios from the I-2 review** (`source: "review-simulation"`), already fixed, now permanently regression-locked.
- **The 3 co-primary worked examples from the Quality Standard §5** (`source: "quality-standard-example"`, `classification: "co-primary"`): course pricing/marketing, hiring/training, retreat-that-sells.
- **The "follow up" contested example**, reconstructed deliberately (`source: "quality-standard-example"`, `classification: "contested"`) — the exact sentence that started this whole investigation, now a permanent corpus entry so it can never silently regress again.
- **Additional constructed "clear" entries** per pilot expert, written in the same varied, realistic-founder-voice style as the review's original 9 — not trigger-phrase echoes.

### 6.4 Scoring bar applied today (honest, V1-appropriate)

- `classification: "clear"` → hard assertion: `primary === expectedPrimary`. A failure here is a real activation defect, fixed the same way the review's findings were fixed.
- `classification: "contested"` / `"co-primary"` → soft assertion: `primary` is one of the two named candidates (V1 cannot yet detect the state itself, so this is the honest bar available today), plus the computed score gap between the two is logged for future comparison once V2's exact scoring lands.
- `classification: "no-match"` → hard assertion: `primary === null`.

---

## 7. Baseline results

*(Filled in after the corpus and harness are built and run — see the accompanying commit and `docs/estate/CHAMBER_ACTIVATION_BASELINE_RESULTS.md` for the numbers, kept separate so this specification document doesn't need to be re-edited every time the corpus grows.)*
