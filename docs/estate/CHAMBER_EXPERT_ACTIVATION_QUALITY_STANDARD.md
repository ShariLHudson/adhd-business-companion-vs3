# Chamber Expert Activation Quality Standard

| Field | Value |
|-------|-------|
| **Status** | **Design standard — no code in this document, no implementation authorized.** |
| **Date** | 2026-08-07 |
| **Authority** | Governs what "good" means for `CHAMBER_ACTIVATION_V2_PROPOSAL.md`'s implementation — any V2 phase (V2-1…V2-6) must be evaluated against this standard, not just against passing tests |
| **Depends on** | `CHAMBER_INTELLIGENCE_I2_REVIEW_FINDINGS.md` (evidence base) · `CHAMBER_ACTIVATION_V2_PROPOSAL.md` (mechanism this standard evaluates) |
| **Refines** | V2 proposal §3's business-context verdict — narrowed, not reversed (see §4.3) |

---

## Purpose

The I-2 review found defects by simulation; the V2 proposal designed a mechanism to fix and prevent them. Neither answers a standing question: **what does "good" activation actually mean, as an ongoing bar — not just "did this one bug get fixed"?**

This document is that bar. It exists so that every future activation change (V2's six phases, and eventually the same rigor applied when I-4 migrates 21 more experts) can be checked against a fixed standard instead of re-litigated from scratch each time.

---

## The Four Pillars

### Pillar 1 — Recognition Accuracy

**Definition:** the activation layer names the expert(s) a thoughtful human would name, given the same request and no more context than Spark has.

| Criterion | Standard |
|-----------|----------|
| **Primary precision** | On an unambiguous, single-domain request, the correct expert is `primary` — not merely present in `supporting`/`possible` |
| **Realistic-language robustness** | Accuracy must hold across natural phrasing variation, not only exact trigger phrases — the review's finding (44% failure on 9 realistic-but-varied phrasings) is the anti-example this pillar exists to prevent recurring |
| **No false confidence** | `high`/`medium` confidence must correlate with actual correctness on the corpus (§7) — a system that is "high confidence" and wrong is worse than one that is honestly `contested` |
| **Graceful non-recognition** | When no expert clearly applies, `primary: null` with `confidence: "low"` remains correct — recognition accuracy includes correctly recognizing *absence* of a clear domain match, not just presence |

**Anti-pattern this pillar forbids:** tuning trigger phrases until hand-picked test cases pass, without corpus-level accuracy tracking (exactly the trap the review avoided by simulating *realistic* language instead of writing tests to match existing triggers).

---

### Pillar 2 — Contribution Value

**Definition:** once an expert activates, its contribution must be able to survive an Expert Value Test (established in the I-2 review) — removing the expert's intelligence would materially reduce the usefulness of the response.

| Criterion | Standard |
|-----------|----------|
| **Materiality** | At least one concrete, actionable element (framework, ADHD translation, or targeted question) beyond the bare name + thinking-pattern baseline, for genuinely on-topic requests |
| **Honest absence** | Zero concrete elements is *correct*, not a failure, when nothing in the request matches a real trigger — the review's "no knowledge dumping" principle extends into this standard as "no forced value" |
| **Specificity over length** | Value is measured by concrete, situation-specific content, never by hint length (the review's "length is not a proxy for usefulness" finding is now a standing rule, not a one-off observation) |
| **Situational differentiation** | Different phrasings of a similar need should be able to produce different concrete selections (different frameworks/translations) — a system that always surfaces the same content regardless of wording has degraded into a template, which this pillar forbids |

**Every expert migrated in I-4 must pass an Expert Value Test (same pattern as `expertValueTest.test.ts`) before being considered production-ready** — this is now a standing gate, not a one-time pilot exercise.

---

### Pillar 3 — Contested / Conflict Handling

**Definition:** when the evidence doesn't clearly support a single winner, the system must say so — internally — rather than silently commit to one candidate with the same confidence language it would use for a clear case.

This pillar has two distinct sub-cases, which the V2 proposal's `contested` tier alone does not yet separate cleanly (see §5, and the new **co-primary** state defined below):

| Sub-case | What it means | Wrong to treat as the other |
|----------|-----------------|-------------------------------|
| **Genuine ambiguity** ("contested") | The evidence is weak-to-moderate for *both* top candidates, and it's unclear which one is more relevant — e.g. the "follow up" case, where neither Sales nor Events had strong evidence, one just had slightly more | Treating this as co-primary would force full-depth intelligence for two candidates neither of which is clearly warranted |
| **Genuine dual relevance** ("co-primary") | Both top candidates independently clear a *strong* evidence bar — the request legitimately needs both lenses, not because the system is unsure, but because a thoughtful human would also say "this needs both" | Treating this as ordinary primary/supporting under-serves the second expert; treating it as contested (uncertainty language) misrepresents genuine confidence in both |

**Standard:** the activation layer must distinguish these two states, not collapse them into one "close scores" bucket. §6 defines the mechanism.

---

### Pillar 4 — Appropriate Context Usage

**Definition:** each available signal is used at the layer where it belongs, and never smuggled into a layer where its use would be invisible or unaccountable.

This is the formal statement of the separation requested for this standard:

| Signal | Governs | Must never |
|--------|---------|------------|
| **User language** (this turn's text) | **Who activates** — the primary evidence for the activation decision | Be overridden by a stale or generic signal from another layer |
| **Working Memory** (prior turns, prior activation, open questions) | **Continuity of who activates**, and de-duplication of what's already been asked — a narrow, tie-break-only role | Become strong enough to keep activating the same expert once fresh language clearly points elsewhere |
| **Business context** (Business Profile, Client Avatar, industry) | **How the already-activated expert responds** — which framework fits a service vs. product business, which example lands, which ADHD translation is most relevant to this member's specific business shape | **Ever appear inside `resolveChamberExpertActivation`'s scoring** — it must not be able to change *who* activates, even as a tie-break, even silently |

**This is a refinement of `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §3, not a reversal.** That document rejected business context as an *activation* signal — correct, and unchanged here. This standard adds the missing other half: business context has a legitimate home, just not in activation. It belongs in the **selection layer** (`selectExpertContribution`, I-2), where it could someday help choose *which* framework or ADHD translation fits this specific business — a separate, future proposal, not authorized by this document. See §4.3 for the precise boundary.

#### 4.1 Why this separation matters (not just organizationally — architecturally)

If business context could shift *who* activates, a stale profile field could silently redirect a member's request to the wrong expert with no way for anyone — member, founder, or reviewer — to see why. If business context only shapes *what an already-correctly-activated expert says*, the worst failure mode shrinks from "wrong expert, invisible cause" to "right expert, slightly less-tailored answer" — a much safer failure surface.

#### 4.2 Working Memory's boundary, precisely

Working Memory may:
- Mildly prefer continuing with the same primary expert **when today's signals are themselves ambiguous** (contested) — never when today's language clearly points elsewhere.
- Suppress re-surfacing an identical deterministic question already asked and not yet answered.

Working Memory may never:
- Contribute points toward Tier-1 or Tier-2 evidence (V2 proposal §4) — it stays Tier-3, tie-break-only, exactly as already specified.
- Be the deciding factor when fresh language and Working Memory disagree — fresh language always wins outright disagreements; Working Memory only breaks ties among otherwise-equal candidates.

#### 4.3 Business context's boundary, precisely

Business context:
- **Is not an input to `resolveChamberExpertActivation`** at all — not Tier 1, 2, or 3. It does not appear in the activation scoring function's signature.
- **May be an input to `selectExpertContribution`** (I-2's selection layer) once an expert is already primary/supporting — e.g. to prefer a framework whose `whenToUse` context matches the member's business type over an equally-triggered alternative.
- Any such selection-layer use must remain a **preference among already-triggered candidates**, never a way to surface a framework/translation that didn't already pass its own trigger match — i.e., business context can help *choose among* matched options, never *force in* an unmatched one. This preserves Pillar 2's "no forced value" rule.
- This is **explicitly deferred, not designed here** — a future proposal, scoped only to the selection layer, would be required before any implementation.

---

## 5. Multi-Expert Legitimacy — worked examples

The founder's framing is the standard: *the goal is not always selecting one winner; sometimes the best answer requires a primary plus supporting perspectives* — and sometimes, this section argues, it requires **two experts at genuinely equal weight**, which today's `supporting` tier (deliberately lighter-touch, per I-2's per-role token budgets) under-serves.

| Request | Naive single-winner read | Why it's actually dual-relevant | Correct shape |
|---------|-----------------------------|-----------------------------------|----------------|
| "I want to launch a digital course and I don't know how to price it or market it." | Marketing (louder keyword: "market") | Pricing (Finance) and positioning (Marketing) are independently load-bearing — neither is a footnote to the other; a founder who only gets pricing help still can't launch, and vice versa | **Co-primary: Marketing + Finance**, both with full framework-level depth, not one primary + one lightly-touched supporting |
| "I need to hire my first team member and train them on how we do things." | People & Culture (hiring is the louder verb) | Hiring readiness (People & Culture) and process documentation for training (Systems) are two separate, equally necessary jobs — a great hire with no documented process fails the same way a documented process with no hiring plan does | **Co-primary: People & Culture + Systems** |
| "I'm hosting a retreat that's also meant to sell my high-ticket program." | Events (the noun in the sentence) | The event *is* the sales mechanism here — Events' experience design and Sales' conversion architecture are not sequential, they're the same event designed from two angles at once | **Co-primary: Events + Sales** |
| "I need to create a client onboarding process." *(contrast case — genuinely single-primary + supporting)* | Systems | Systems (the process) clearly leads; Client Relationships (trust/communication) supports and enriches it, but the request is fundamentally a process request, not equally a relationship request | **Primary: Systems, Supporting: Client Relationships** — today's existing shape is correct here; not every multi-expert case is co-primary |

**The distinguishing test (not a formula, a judgment aid):** *if you removed the second expert entirely, would the first expert's answer still be a genuinely complete response to what was asked?* If yes (onboarding case — Systems alone still answers "create a process"), it's primary + supporting. If no (course pricing/marketing case — Marketing alone cannot answer "how do I price it"), it's co-primary.

---

## 6. Confidence States (formal)

Extends `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §8's addition of `contested` with the distinction Pillar 3 requires.

| State | Meaning | Trigger condition (conceptual, not final formula) | Composer consumption |
|-------|---------|------------------------------------------------------|------------------------|
| **high** | Clear, strong primary evidence | Tier-1 evidence present; large margin to runner-up | Full confidence language; collaboration bridge (Phase D) framed normally |
| **medium** | Eligible, but evidence is Tier-2-heavy or margin is moderate | Eligible per V2's tiered rule; margin above the contested threshold but below "large" | Same shape as high, no softening needed — this tier already exists and works |
| **contested** | Genuine ambiguity between top two — both weak-to-moderate | Margin below threshold AND *neither* top candidate independently clears a "strong" bar | Composer should soften the collaboration bridge's confident framing (V2 proposal §2); still produces a usable hint, humbly |
| **co-primary** *(new)* | Genuine dual relevance — both top two are independently strong | Margin below threshold AND *both* top candidates independently clear the "strong" bar (i.e., each would qualify as `high` alone) AND they come from meaningfully different domains (different `category`) | Composer treats both as full-depth primaries (Pillar 3/§7 mechanism), never "lead with X, while Y quietly supports" |
| **low** | No eligible candidate | No expert clears the eligibility bar at all | Unchanged from V1 — `primary: null`, weak `possible` hints only |

**The key formula distinguishing `contested` from `co-primary`:** it is not just "margin is small." It is margin-is-small **combined with** whether the absolute evidence strength of both candidates is high (co-primary) or mediocre (contested). Two experts tied at 40 points each is a different situation from two experts tied at 90 points each, even though the *margin* looks identical — this standard requires the mechanism to check both.

---

## 7. Contested and Co-Primary Behavior — mechanism

### Contested

1. Activation still returns a single `primary` (needed for the composer's existing shape) — chosen by the evidence-quality tiebreak already specified in V2 proposal §5 (more Tier-1 evidence wins, then more signal groups, raw score only as a last resort).
2. `confidence: "contested"` and `runnerUp` are both exposed on the result.
3. The composer (`chamberExpertiseHintForChat`) treats this like `medium` for content selection, but **removes or softens** the Phase D collaboration bridge's confident "lead with X's read on Y" framing — the internal hint should reflect the actual uncertainty, not manufacture false confidence for the model.

### Co-Primary

1. Activation returns **both** top candidates as equally weighted — this requires a **shape change** the current `ChamberExpertActivation` type doesn't yet support cleanly (today, `primary` is a single `ChamberExpertId`). Proposed (design only): a `coPrimary: readonly ChamberExpertId[] | null` field, populated only in this state, leaving `primary` set to the higher-scoring of the two for backward compatibility with any consumer that only reads `primary`.
2. `confidence: "co-primary"`.
3. The composer, when it sees `coPrimary` populated, gives **both** experts the same depth budget the single primary currently gets (V2 proposal's per-role token budget, revisited: two co-primaries might each get a reduced-but-still-substantial budget — e.g. 150/150 instead of 220/90 — rather than one full and one starved) and frames the collaboration bridge as two equal voices woven together, not a lead-and-support relationship.

**Both mechanisms are proposed here at the design level only** — the exact budget numbers, the `coPrimary` field shape, and the composer's rendering changes are implementation decisions for a future, explicitly-authorized coding phase, not this document.

---

## 8. Acceptance Tests

Before any V2 phase (per `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §9) can be considered complete, it must pass these gates — a formal Definition of Done for activation quality, referenced by V2-4's "review gate" phase.

| # | Acceptance test | Pillar |
|---|-------------------|--------|
| AT-1 | Corpus primary accuracy does not regress below the last-recorded baseline (§9's ratchet) | Recognition Accuracy |
| AT-2 | Every `ambiguous`-tagged corpus entry is correctly flagged `contested` OR `co-primary` (not silently resolved to a single confident winner) | Contested/Conflict Handling |
| AT-3 | Every `coPrimary`-tagged corpus entry (§9) produces `confidence: "co-primary"` with the correct pair of experts | Contested/Conflict Handling |
| AT-4 | The cross-expert collision audit (V2 proposal §6) reports zero *new* high-severity collisions introduced by any registry change in the same PR | Recognition Accuracy |
| AT-5 | Every expert with a migrated intelligence module passes an Expert Value Test (materiality + honest-absence + specificity, per Pillar 2) | Contribution Value |
| AT-6 | No corpus entry shows `resolveChamberExpertActivation`'s output changing when only business-context fields are varied with language/intent/journey/memory held constant — i.e. business context has zero measurable effect on `primary`/`coPrimary`/`confidence` | Appropriate Context Usage |
| AT-7 | No corpus entry shows Working Memory alone (with language ambiguous or absent) selecting a primary that Tier-1/Tier-2 evidence doesn't independently support | Appropriate Context Usage |
| AT-8 | The whole-hint token budget (550, established in I-2) still holds for at least one constructed co-primary scenario, once co-primary rendering is implemented | Contribution Value (carries the "smallest useful intelligence wins" principle into the new state) |

**None of these are implemented yet.** They are the bar V2's eventual implementation must clear, written now so "done" isn't renegotiated after the fact.

---

## 9. Corpus Strategy

Expands `CHAMBER_ACTIVATION_V2_PROPOSAL.md` §7 into an operational plan.

### Structure

```
lib/chamberExpertise/__tests__/foundersCorpus/
  MKT.json
  SYS.json
  EVT.json
  cross-expert.json      ← co-primary and contested cases, not owned by one expert
  runCorpus.test.ts
```

### Entry schema (design, not final TypeScript)

```
{
  text: string
  expectedPrimary?: ChamberExpertId          // omit for ambiguous/co-primary cases
  expectedCoPrimary?: [ChamberExpertId, ChamberExpertId]
  expectedSupporting?: ChamberExpertId[]
  classification: "clear" | "contested" | "co-primary" | "no-match"
  note: string                                // why a human reviewer classified it this way — required, not optional
  source: "review-simulation" | "profile-typical-language" | "founder-provided" | "observed-pattern"
}
```

**`note` is mandatory** because the corpus's long-term value depends on *why* a case is classified a certain way being legible to whoever grows it later — an entry with no rationale is a trap for future drift, the same failure mode the collision audit exists to catch at the registry level.

### Seeding sources (in priority order)

1. **The I-2 review's 9 scenarios** — already classified, already fixed, become the first corpus entries with `source: "review-simulation"`.
2. **Each profile's own "Typical User Language" section** — several Expert Intelligence Profiles (e.g. the Offer, Marketing Plan Build Type specs) already list example phrasings; these are free, already-authored corpus seeds, not new writing.
3. **Founder-provided examples** — real phrasings the founder has heard from actual ADHD business owners, tagged `source: "founder-provided"` and weighted more heavily in review (these are ground truth, not synthetic).
4. **Observed patterns** *(later, once live)* — anonymized, aggregated phrasing patterns from real usage, added only through the existing Business Brain / memory governance rules (Spec 112's consent and never-single-utterance principles apply here too — this is explicitly a *future* source, not authorized for this design phase).

### Growth targets

| Milestone | Corpus size | Purpose |
|-----------|--------------|---------|
| Before V2-1 begins | 9 (seeded from the review) | Establish V1 baseline |
| Before V2-4 review gate | 15–20 per pilot expert (45–60 total) + 10 cross-expert co-primary/contested cases | Enough volume that a single lucky/unlucky phrasing can't swing the accuracy number |
| Before I-4 begins (any of the 21 remaining experts) | Each newly-migrated expert ships with its own 10+ corpus entries as part of its migration PR, not added later | Prevents the exact gap this review found — an expert's activation signals should be corpus-tested *before* it's declared ready, not discovered wrong by a later review |

### Review cadence

- Corpus accuracy is checked on every PR touching `chamberExpertRegistry.ts` or `resolveChamberExpertActivation.ts` (AT-1, AT-4).
- A quarterly (or founder-triggered) manual read-through of `contested`/`co-primary` classified entries, to catch cases where the human judgment itself may have drifted as the product's understanding of ADHD founder needs deepens.

---

## 10. Non-goals (unchanged, restated for this document)

- No code implemented by this document.
- No new engine, agent, or runtime.
- No change to the remaining-21-experts deferral.
- No implementation of `coPrimary` field, budget rebalancing, or composer rendering changes — proposed at the design level only (§7), pending explicit authorization.
- No selection-layer business-context feature is designed or authorized here — §4.3 states only that it has a *legitimate future home*, not a design for building it.

---

## 11. Governing principle: Expertise follows purpose, not keywords

**Added 2026-08-07**, from `WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md` — surfaced by testing the full Work Recognition → Chamber chain, not just Chamber activation in isolation.

**The object named in a request does not, by itself, determine which expert helps. The intended outcome does.**

The same object routinely serves entirely different purposes:

| Object named | Could mean (purpose-dependent) |
|---------------|----------------------------------|
| "Newsletter" | Marketing (visibility) · Client education · Community building · Sales nurture · Relationship building |
| "Process" | Systems (repeatability) · Client experience · Employee training · Quality control |
| "Workshop" | Events (experience design) · Marketing (a launch vehicle) · pure content delivery |

**What this means in practice, already demonstrated by this thread's own fixes:**

- Client Relationships correctly joined the "develop a process for new clients" council not because "clients" alone is a trigger, but because the *purpose* of that process is a client-facing outcome — Systems' own curated collaboration structure already knew this (`supportingRelationships: ["CR"]`), once Systems itself became reachable.
- Client Relationships correctly does **not** insert itself into "I need to create a workshop" (no client context stated) but correctly **does** once client context is present ("...for my existing clients") — see `CHAMBER_ACTIVATION_V2_VALIDATION_SET.md` §7. The lens activates on evidence of purpose, never on the presence of a keyword alone.
- "Grow my business" needed no separate Client Relationships trigger authored at all — once Marketing became reachable via its own outcome vocabulary, Marketing's *existing* curated relationship to Client Relationships and Strategy did the rest. Purpose-based collaboration structures, authored once, generalize; keyword lists alone do not.

**The test this pillar adds, alongside the existing four:** before authoring a new activation signal, ask *what outcome is this phrase evidence of* — not *what noun does it contain*. A signal that only matches because a word is present, with no bearing on what the founder is trying to accomplish, is exactly the "collection of keyword-matched personas" failure mode this whole Chamber effort exists to avoid.

**Recommended promotion:** this principle applies beyond Chamber — the same "array-order default, no purpose signal" failure mode was found in Estate's own capability routing during the same validation (`WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md` §4.2). It is proposed here as a candidate for the Universal Experience Standards (Spec 103) or Relationship Constitution level; this document does not unilaterally amend either — that promotion remains an explicit decision for the constitution's own owners.
