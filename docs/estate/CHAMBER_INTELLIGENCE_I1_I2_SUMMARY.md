# Chamber Intelligence I-1 / I-2 — Implementation Summary

| Field | Value |
|-------|-------|
| **Status** | Implemented — **stopped after I-2 for review**, per instruction |
| **Date** | 2026-08-07 |
| **Depends on** | `CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md` (approved) |
| **Scope delivered** | I-1 (types, empty-safe selector, drift tests) + I-2 (3 pilot experts, feature flag, budget enforcement) |
| **Explicitly not done** | I-3 review gate (this doc + the tests below *are* that review input), I-4 (remaining 21 experts), I-5 (facet expansion for all 24), I-6 (CI enforcement, opt-in list removal) |

---

## What was built

### New files

| File | Purpose |
|------|---------|
| `lib/chamberExpertise/textMatch.ts` | Extracted shared tokenizer/matcher (was private to `resolveChamberExpertActivation.ts`) — reused by the selection layer instead of re-implemented |
| `lib/chamberIntelligence/types.ts` | I-1 data models: `ChamberExpertIntelligence`, `ExpertThinkingPattern`, `ExpertFramework`, `ExpertQuestion`, `AdhdTranslation`, `ExpertKnowledgeSources`, `SelectedExpertContribution` |
| `lib/chamberIntelligence/experts/MKT.ts` | Marketing deep intelligence — compiled from the markdown profile's §2/§4/§5/§7/§10 |
| `lib/chamberIntelligence/experts/SYS.ts` | Systems deep intelligence, same compilation |
| `lib/chamberIntelligence/experts/EVT.ts` | Events deep intelligence, same compilation |
| `lib/chamberIntelligence/intelligenceRegistry.ts` | Lookup table containing **only** the 3 pilot experts — everyone else returns `undefined` (graceful fallback) |
| `lib/chamberIntelligence/selectExpertContribution.ts` | The selection layer — I-2's core deliverable |
| `lib/chamberIntelligence/renderSelectedContribution.ts` | Pure renderer: selection → hint text |
| `lib/chamberIntelligence/index.ts` | Barrel export |
| `lib/chamberIntelligence/__tests__/selectExpertContribution.test.ts` | 16 tests |
| `lib/chamberIntelligence/__tests__/profileDrift.test.ts` | 18 tests |
| `lib/chamberIntelligence/__tests__/pilotIntegration.test.ts` | 6 tests |

### Modified files

| File | Change |
|------|--------|
| `lib/intelligence-layer/featureFlags.ts` | Added `isChamberIntelligencePilotEnabled()` — follows the existing `isXEnabled()` / localStorage-override / env-var pattern used by every other flag in this file. Default **false**. |
| `lib/chamberExpertise/resolveChamberExpertActivation.ts` | Refactored to import `phraseMatches`/`significantWords`/`tokenize` from the new `textMatch.ts` instead of defining them locally — **no behavior change** (same functions, same logic, verified by the full existing test suite passing unchanged) |
| `lib/chamberExpertise/chamberExpertiseHintForChat.ts` | Per-expert line now checks the flag + intelligence registry; falls back to the pre-existing format for any expert without a migrated module (or when the flag is off). Added composer-level hard-cap enforcement (see below). |

**Not touched:** `app/companion/CompanionPageClient.tsx`, `app/api/companion-chat/route.ts`, `chamberExpertRegistry.ts` (the activation registry stays exactly as it was — this pilot is a read-only consumer of it).

---

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| Intelligence layer types | ✅ `lib/chamberIntelligence/types.ts` |
| Selection layer architecture | ✅ `selectExpertContribution.ts` — trigger-matched, budget-aware, deterministic |
| Read-only retrieval from existing expert knowledge | ✅ Modules are compiled digests of the markdown; selection only *reads* `ChamberExpertIntelligence` records, never copies a whole profile into the hint |
| Token budget enforcement | ✅ Per-role budgets (primary 220 / supporting 90) in the selector **and** a composer-level hard cap (550 total) that trims optional segments — see "the 588-token bug" below |
| Pilot activation behind feature flag | ✅ `isChamberIntelligencePilotEnabled()`, default off |
| Pilot experts: Marketing, Systems, Events | ✅ Exactly these 3 in `intelligenceRegistry.ts` |
| No separate agents | ✅ Same conversation, same model call, same hint stack |
| No new runtime | ✅ Everything runs inside the existing `chamberExpertiseHintForChat` → `intentHint` → `buildCompanionSystemPrompt` path |
| No parallel Knowledge Finger system | ✅ Finger concepts (reasoning pattern, questions, research triggers) are fields on `ChamberExpertIntelligence`, not a separate registry, activation path, or engine |
| Markdown remains human source of truth | ✅ Enforced by `profileDrift.test.ts` (18 tests) — every framework name, Spark explanation, ADHD "traditional" phrase, signature question, and thinking-pattern summary is checked against the actual `.md` file |
| Runtime selectively retrieves, doesn't copy entire profiles | ✅ Each expert module carries only §2/§4/§5/§7/§10 essentials, not §3/§6/§8/§9/§11/§12/§13 (deep specialty knowledge, decision model, mistakes, collaboration prose, conversation style, "so what" test all stay markdown-only) |
| Hard cap 550 tokens | ✅ Enforced and tested — see below |

---

## The 588-token bug (found and fixed during implementation)

The architecture doc's own per-role budget table (primary ≤220, each supporting ≤90, bridge ≤60, footer ≤90) does not mathematically guarantee the 550 total on its own: `resolveChamberExpertActivation` can return **3** supporting experts (e.g. Strategy → Systems + Finance + Marketing), and 220 + 3×90 + 60 + 90 = 640 > 550 in the worst case.

**Found by the test suite, not by inspection** — `pilotIntegration.test.ts`'s budget test failed at 588 tokens for the "build a business strategy" case before a fix was in place.

**Fix:** `chamberExpertiseHintForChat` now enforces the cap at the composer level, not just per-role: mandatory content (header, primary line, guardrail footer) is always included; optional content (supporting expert lines, the "possible" mention, the collaboration bridge) is added in priority order and **stops** the moment the next segment would exceed the remaining budget. This is a hard, tested guarantee — not a best-effort target.

---

## Design decisions worth flagging for review

1. **Only the primary expert's role is eligible for a signature question.** Supporting experts never surface a question. This trivially satisfies "one question at a time" (Spec 106) without needing cross-expert coordination logic — a deliberate v1 simplification, not an oversight.
2. **Question selection is deterministic (first authored question), not trigger-matched.** Frameworks and ADHD translations are trigger-matched against the request; questions are not, in I-2. Matching questions to situations is a reasonable I-4+ refinement once the pilot's simpler approach is validated.
3. **Thinking-pattern facet selection is fixed-order** (first `notices`, then `creates`, then `finds`), not trigger-matched against the request. Same rationale — the facets are cheap and always relevant; the frameworks/translations are the parts that need real selection because they're specific and voluminous.
4. **ADHD translation `traditional` phrases were tightened to match each profile's §7 table exactly** (e.g. "12-month marketing plan" instead of an invented longer sentence) after the drift tests caught the mismatch during implementation — a live example of the drift-detection mechanism doing its job on day one.

---

## Test results

```
lib/chamberIntelligence/__tests__/selectExpertContribution.test.ts   16 passed
lib/chamberIntelligence/__tests__/profileDrift.test.ts               18 passed
lib/chamberIntelligence/__tests__/pilotIntegration.test.ts            6 passed
lib/chamberExpertise/* (all existing suites, unchanged)              54 passed
```

**88/88 in the Chamber area.** Broader regression sweep (`lib/intelligence-layer`, `lib/estateBrain`, `lib/intentRoutingIntelligence.test.ts`) — **323/323 passed.**

`tsc --noEmit`: 69 pre-existing errors, unchanged (confirmed identical before/after). `eslint`: clean on all touched files.

---

## What I-3 (the requested review) should evaluate

1. Read the 3 pilot modules (`experts/MKT.ts`, `SYS.ts`, `EVT.ts`) against their source markdown — is the compiled digest faithful and well-chosen (right frameworks prioritized, right ADHD translations)?
2. Toggle the flag locally (`NEXT_PUBLIC_CHAMBER_INTELLIGENCE_PILOT=true` or the `companion-flag-chamber-intelligence-pilot` localStorage key) and read real hint output for a handful of requests — does the enriched hint read as genuinely more specific, or does it feel padded?
3. Confirm the 550-token cap and the question/facet simplifications (above) are acceptable before they're applied to 21 more experts in I-4.

**No further implementation until that review completes**, per the original instruction.
