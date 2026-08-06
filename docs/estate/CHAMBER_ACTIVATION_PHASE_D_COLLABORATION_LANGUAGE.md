# Chamber Activation Phase D — Multi-Expert Collaboration Language

| Field | Value |
|-------|-------|
| **Status** | Implemented |
| **Date** | 2026-08-06 |
| **Depends on** | Phase A–C.5 (all live) |
| **File** | `lib/chamberExpertise/chamberCollaborationLanguage.ts` |

---

## What changed from the original Phase D plan

The Phase A/B architecture doc (`CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md` §7 Phase D) originally proposed reusing Phase 33's `buildSparkEstateExpertHandoffLanguage`, which produces sentences like:

> "I think bringing in some marketing strategy support would help us here."

Between that doc and Phase D's implementation, the **Phase C preflight review** established a hard rule (tested directly): the hint must never suggest "bringing in" an expert or a handoff of any kind. Reusing that builder verbatim would have reintroduced exactly the pattern Phase C/C.5 exist to prevent.

**Resolution:** Phase D uses **fusion language, not handoff language** — a new, small function (`chamberCollaborationBridgeLine`) that produces one sentence describing how the primary and supporting experts' lenses combine into a single answer, never a sequence.

---

## What it does

When `resolveChamberExpertActivation` returns a primary **and at least one supporting expert**, `chamberExpertiseHintForChat` now appends one integrating sentence after the per-expert contribution lines (Phase C.5):

```
Weave these into one answer, not separate sections: lead with Systems Intelligence's
read on repeatable steps and process design, while Client Relationships Intelligence
quietly protects trust building — as one integrated recommendation, never as
sequential handoffs, a panel of experts, or separate voices.
```

For 3+ supporting experts, the clause list joins naturally ("X, Y, and Z") rather than as a bulleted list.

**When there's no supporting expert** (single-lens activation), no bridge line is produced — nothing to weave.

---

## Why this satisfies "multi-expert collaboration language"

| Requirement | How it's met |
|-------------|----------------|
| Experts should feel woven into one answer | Explicit instruction: "not separate sections," "one integrated recommendation" |
| No handoff experience | Explicit instruction: "never as sequential handoffs, a panel of experts, or separate voices" — tested directly (never matches `/bringing in/i`) |
| Grounded in real content, not just names | Uses each expert's top `expertiseAreas` focus phrase (same field Phase C.5 introduced), not a generic template |
| Scales to 2+ supporting experts | Natural-language joining, not a bullet list |

---

## Tests (`lib/chamberExpertise/chamberCollaborationLanguage.test.ts`)

- No primary → undefined
- Primary with no supporting → undefined (nothing to weave)
- One supporting expert → single integrating sentence naming both
- Three supporting experts → natural "X, Y, and Z" joining
- Never matches `/bringing in/i` or `/i think bringing in some/i`
- Explicitly contains "never as sequential handoffs" and "separate voices"
- Integration test: the bridge line appears verbatim inside the full `chamberExpertiseHintForChat` output for the client-onboarding worked example

**8/8 passing.** Combined suite total: **48/48** across all of `lib/chamberExpertise/`.

---

## Explicitly not reused

`buildSparkEstateExpertHandoffLanguage` and `SPARK_ESTATE_EXPERT_HANDOFF_LANGUAGE_USE` (Phase 33) remain untouched — they still exist and still run for Phase 33's own 6-member keyword-gated hint, which is a separate, pre-existing, unconsolidated system (documented as an accepted interim overlap in the Phase C preflight review §7, deferred to Phase E).
