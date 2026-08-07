# Chamber Activation V2-2 — Implementation Summary

| Field | Value |
|-------|-------|
| **Status** | Implemented, behind `isChamberActivationV2Enabled()` (default OFF). |
| **Date** | 2026-08-07 |
| **Implements** | `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md`, `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md`, `CHAMBER_ACTIVATION_DECISION_TABLE.md` |
| **Does not touch** | `resolveChamberExpertActivation.ts` (V1) or any live behavior when the flag is off — verified by a parity test (flag off vs. flag on, identical output for an unambiguous request) and the full existing V1 test suite (unchanged, 100% passing). |

---

## 1. What shipped

1. **Corrected eligibility rule** (`resolveChamberExpertActivationV2.ts`, `isEligibleV2`) — Tier-1 evidence (a multi-word topic/outcome phrase match, or a legacy expert ID match) OR two-or-more Tier-2 matches (intent match, single-word topic keyword). Estate category (Tier 3) never counts alone or paired with only one Tier-2 match. This closes the six-way, zero-topic-evidence tie the outcome-layer analysis found in V1.
2. **`outcomeSignals`** — a new, optional per-expert field (`ChamberExpertRegistryEntry.outcomeSignals`), scored identically to a Tier-1 topic phrase match. Authored for Finance, Marketing, Systems, and People & Culture — the four experts where a real activation gap was found. The remaining 20 experts have an empty list; their deeper migration (I-4) remains deferred, per the explicit instruction to keep the 21 remaining experts' full intelligence work out of scope.
3. **Generalist tiebreak** — `expertCategory: "specialist" | "generalist"` added to all 24 registry entries (Strategy, Momentum, Horizons are the three generalists). Used only as tiebreak step 3 (between "more Tier-1 evidence" and "more signal groups") — never a scoring multiplier, verified not to suppress a genuine Strategy win (AT-12).
4. **`founderPlainLanguagePhrase`** — added to all 24 registry entries (a lightweight, one-line-per-expert addition, not the heavier per-expert intelligence migration). Used only when building an insufficient-evidence clarifying question.
5. **`contested` and `co-primary` confidence states** — new values on `ChamberExpertConfidence`, with `coPrimary` and `runnerUp` fields added to `ChamberExpertActivation` (both optional, always `null` under V1).
6. **Structural (conjunction-split) co-primary detection** — `splitOnConjunctions` (`textMatch.ts`) + `detectStructuralCoPrimary` (`resolveChamberExpertActivationV2.ts`): splits on "and"/"but"/"as well as"/"plus", scores each clause independently against topic + outcome signals only, and promotes two clauses' distinct best-matching experts to co-primary once each clears `SUB_CLAUSE_THRESHOLD` (35). Guarded against false positives (same-expert compound sentences never trigger it — AT-13).
7. **Insufficient-evidence clarifying question** — `buildClarifyingQuestion` builds one plain-language question from up to 3 weak candidates' `founderPlainLanguagePhrase`, never an expert name.
8. **Composer wiring** (`chamberExpertiseHintForChat.ts`) — behind the same flag:
   - **Co-primary** → `buildCoPrimaryHint`: both experts get full-depth contribution (new `"co-primary"` role in the Chamber Intelligence selection layer, 150-token budget each), joined by `chamberCoPrimaryBridgeLine` (fusion language, never lead/support).
   - **Contested** → the normal primary hint, with `chamberContestedFramingLine` replacing the confident collaboration bridge (softened framing, no confident bridge language, never announces uncertainty to the member).
   - **Insufficient evidence** → `buildInsufficientEvidenceHint`: a distinct, small hint instructing Shari to ask the one clarifying question instead of leaning on any expert framework.
9. **New Chamber Intelligence role** — `ChamberIntelligenceRole` gained `"co-primary"` (types.ts, selectExpertContribution.ts, renderSelectedContribution.ts), treated like `"primary"` for depth (facets, frameworks, question) but with its own smaller budget so two fit under the 550-token whole-hint cap.

---

## 2. Files changed

| File | Change |
|------|--------|
| `lib/chamberExpertise/types.ts` | `outcomeSignals?`, `expertCategory?`, `founderPlainLanguagePhrase?` on the registry entry type; `"contested"`/`"co-primary"` on `ChamberExpertConfidence`; `topicPhraseMatch?`/`outcomeMatch?` on the signal result; `coPrimary?`/`runnerUp?`/`clarifyingQuestion?` on the activation result. |
| `lib/chamberExpertise/textMatch.ts` | Extracted `computeTopicMatch` (shared by V1 and V2); added `splitOnConjunctions`. |
| `lib/chamberExpertise/chamberExpertRegistry.ts` | `expertCategory` + `founderPlainLanguagePhrase` for all 24 experts; `outcomeSignals` for FIN/MKT/SYS/PC; closed 5 real vocabulary gaps in SYS (`tools talk to each other`, `wing it differently every time`, `same steps every time`, `explain the process`, `hand off a task`) that the corrected eligibility rule exposed as previously passing only via the same contentless-tie mechanism this delivery fixes. |
| `lib/chamberExpertise/resolveChamberExpertActivation.ts` | Refactored to use the shared `computeTopicMatch` — no behavior change (verified by the untouched V1 test suite and corpus baseline, still 100%). |
| `lib/chamberExpertise/resolveChamberExpertActivationV2.ts` | **New.** The full V2-2 decision procedure. |
| `lib/chamberExpertise/chamberCollaborationLanguage.ts` | Added `chamberCoPrimaryBridgeLine`, `chamberContestedFramingLine`. |
| `lib/chamberExpertise/chamberExpertiseHintForChat.ts` | Wired V2 behind `isChamberActivationV2Enabled()`; added co-primary/contested/insufficient-evidence branches. |
| `lib/chamberIntelligence/types.ts`, `selectExpertContribution.ts`, `renderSelectedContribution.ts` | Added `"co-primary"` role, its budget (150 tokens), and its render label. |
| `lib/intelligence-layer/featureFlags.ts` | Added `isChamberActivationV2Enabled()` / `NEXT_PUBLIC_CHAMBER_ACTIVATION_V2`. |

## 3. New tests

| File | Covers |
|------|--------|
| `lib/chamberExpertise/__tests__/resolveChamberExpertActivationV2.test.ts` | AT-9 through AT-15 + all five decision-table states as direct unit tests against constructed inputs. |
| `lib/chamberExpertise/__tests__/foundersCorpus/runCorpusV2.test.ts` | Same corpus as the V1 baseline, run against V2: 100% clear-entry accuracy (no regression), both AT-10/AT-11 co-primary cases now correctly detected, the contested entry's eligibility-fix nuance documented honestly. `runCorpus.test.ts` (V1's permanent baseline) is untouched. |
| `lib/chamberExpertise/__tests__/activationV2PilotIntegration.test.ts` | Composer-level: flag-off/flag-on parity, co-primary/contested/insufficient-evidence hint shapes, token budgets. |
| `lib/chamberExpertise/chamberExpertRegistry.test.ts` (extended) | Every entry has `expertCategory` + `founderPlainLanguagePhrase`; exactly 3 generalists; `outcomeSignals` are always genuine multi-word phrases. |

## 4. Results

- **V1**: unchanged, 100% clear-entry corpus accuracy (31/31), full existing suite passing.
- **V2**: 100% clear-entry corpus accuracy (31/31, no regression), both previously-missed co-primary cases (FIN/MKT, PC/SYS) now correctly detected, contested case's known eligibility-fix nuance documented rather than forced.
- Full project test suite: no new failures attributable to this change (one pre-existing, unrelated failure in `estateArrivalExperience.test.ts` confirmed via `git stash` to predate this work).
- `tsc --noEmit` and `eslint` clean on all changed files.

## 5. Still deferred (unchanged from the model specification)

- The remaining 20 experts' `outcomeSignals` and deep intelligence modules (I-4).
- Journey stage and Working Memory continuity as activation signals (flagged, not built, in the V2 proposal).
- Sales' vocabulary gap for the Events/Sales co-primary corpus entry (documented, known limitation — out of scope for this delivery, same as the I-2 review's own scoping decision).
