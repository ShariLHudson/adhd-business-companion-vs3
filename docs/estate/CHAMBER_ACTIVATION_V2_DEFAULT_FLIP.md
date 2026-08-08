# Chamber Activation V2 — Default Flip

| Field | Value |
|-------|-------|
| **Status** | **Flipped.** `isChamberActivationV2Enabled()` now defaults to `true`. |
| **Date** | 2026-08-07 |
| **Authorized by** | Explicit instruction, after: Round 1 validation (20 scenarios) → Round 2 validation (20 more, untested experts + collisions) → Spark Council Reality Test → full review of every remaining `contested` outcome. See `docs/estate/CHAMBER_ACTIVATION_V2_VALIDATION_SET.md` for the complete narrative. |
| **Rollback** | Set `NEXT_PUBLIC_CHAMBER_ACTIVATION_V2=false` (or `"0"`), or the equivalent `localStorage` override. Instantly restores `resolveChamberExpertActivation` (V1) behavior — the function has never been modified. |

---

## 1. What changed

**Code:** `lib/intelligence-layer/featureFlags.ts` — `isChamberActivationV2Enabled()`'s fallback changed from `envTrue(...)` (default `false`, opt-in) to `raw !== "false" && raw !== "0"` (default `true`, opt-out). This is the *only* code change this flip required — everything V2 needed was already built, tested, and reviewed across the preceding validation work.

**Nothing else changed.** `resolveChamberExpertActivation` (V1) is untouched — it remains available, byte-for-byte, as the rollback path. `chamberExpertiseHintForChat` still calls whichever function the flag selects; only which one is selected by default has changed.

## 2. Tests updated for the new default

A small number of existing tests asserted V1 behavior by relying on the *ambient* default being off, rather than stubbing the environment variable explicitly. These were updated to make their intent explicit rather than accidental:

| File | Change |
|------|--------|
| `lib/chamberExpertise/chamberExpertiseHintForChat.test.ts` | The "system" (single weak keyword) case now has two tests: V2's default behavior (asks a clarifying question, per the decision table) and V1's explicit-rollback behavior (stays silent, `undefined`) — both intentional, both tested. |
| `lib/chamberExpertise/__tests__/activationV2PilotIntegration.test.ts` | "Defaults OFF" test renamed and inverted to "defaults ON"; a new explicit-rollback test covers what stubbing `false` restores. |
| `lib/chamberExpertise/__tests__/combinedExperienceEndToEnd.test.ts` | The "V1 today's production default" test now explicitly stubs `false` (it was implicitly relying on the old default) and a new test confirms V2 is reachable with zero env var set. |

No other test needed changes — everything else already explicitly stubbed the flag to whichever value it was testing (a defensive pattern that paid off here: only 3 of the ~15 chamber test files touched the ambient default at all).

## 3. Full verification after the flip

- Full chamber test suite: **402/402 passing** (up from 246 before this flip's test updates — the increase is from Round 2, the Reality Test, and the contested-case fixes landing in the same session).
- V1's own corpus baseline: **unchanged, 31/31 (100%)** — confirms the flip did not, and could not, alter V1's behavior; only which function is called by default changed.
- V2's corpus: **31/31 clear, both co-primary cases correctly detected.**
- Both founder-language validation rounds: **20/20 each.**
- Spark Council Reality Test: **7/7.**
- `tsc --noEmit` and `eslint`: clean on all changed files.
- Full project test suite: no new failures attributable to this change (one pre-existing, unrelated failure, confirmed via `git stash` to predate this entire body of work).

## 4. What member-facing behavior actually changes

Everything already described across the V2-2 implementation summary and validation set documents — summarized here for completeness now that it's live by default:

- Chamber expert activation now uses the corrected eligibility rule, outcome vocabulary, generalist tiebreak, and the evidence-tier ranking fix — closing the "confident wrong answer from a coincidental legacy-ID/intent/estate combination" failure mode found repeatedly during validation.
- Two new internal states are reachable: **co-primary** (two experts, both full-depth, fused language) and **contested** (a close call, held loosely, softened internal framing).
- **Insufficient evidence** now asks one grounded, plain-language clarifying question instead of silently saying nothing, when there's real-but-weak signal to build one from.
- None of this is member-visible as a new UI, room, or feature — it is entirely internal hint construction feeding the existing chat prompt stack, governed by the same "never announce, never a handoff, one voice" guardrails as before.

## 5. What is still deferred

Per the explicit instruction accompanying this flip: **do not add all 24 experts' deep intelligence at once.** The remaining 20 experts' full I-4 migration (frameworks, ADHD translations, signature questions compiled into `lib/chamberIntelligence/experts/`) stays deferred, expanded in small, evidence-driven batches — see `docs/estate/CHAMBER_ACTIVATION_V2_NEXT_BATCH.md` for the first such batch (Strategy, Client Relationships), chosen by activation frequency across the validation corpora, not arbitrarily.
