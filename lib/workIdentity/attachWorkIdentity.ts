/**
 * Work Identity — attaching a `WorkId` at the exact, single moment a new
 * Universal Creation session is genuinely kept.
 *
 * `buildInitialSession` (`lib/universalCreation/orchestrator.ts`) is the
 * sole constructor of a fresh `UniversalCreationSession`, but it has two
 * kinds of caller — the retained entry (`startUniversalCreationTurn` and
 * `resolveUniversalCreationTurn`'s recovery path) and a discarded
 * feasibility probe (`shouldEnterUniversalCreation`, called from many
 * other files just to check "would this be complete"). This function is
 * called only from the retained callers
 * (`attachRetainedWorkIdentity` in `orchestrator.ts`) — never from
 * inside `buildInitialSession` itself, and never for a probe whose
 * result is thrown away (Slice 1B Remediation,
 * docs/estate/WORK_IDENTITY_SLICE_1B_REMEDIATION.md §1–§2).
 *
 * Takes the Support Gate tier as an explicit parameter rather than
 * recomputing it — Slice 1B Remediation's other fix. Previously this
 * module imported `detectEmotionalState` (`lib/companionEmotions.ts`)
 * and `resolveSupportGate`
 * (`lib/workStatePriority/resolveSupportGate.ts`) to recompute the tier
 * internally; those are real, value-level imports, and — because this
 * function is now called from `orchestrator.ts`, a module already
 * transitively reachable *from* `companionEmotions.ts` via an unrelated,
 * pre-existing chain — that recompute closed a genuine circular import
 * (confirmed empirically in
 * docs/estate/WORK_IDENTITY_SLICE_1B_REVIEW.md §5.1). The Work Identity
 * layer must not import into the orchestration / emotion-detection
 * layers at all; the caller already has (or can cheaply default) this
 * value.
 */

import { isWorkIdentityV1Enabled } from "../intelligence-layer/featureFlags";
import { mintWorkId } from "./mintWorkId";
import { resolveCommitmentGate } from "./resolveCommitmentGate";
import type { CommitmentSupportGateTier, WorkId } from "./types";

/**
 * Returns a freshly minted `WorkId` only when the founder's own language
 * crosses the commitment boundary (COMMITMENT_RECOGNITION_DESIGN_REVIEW.md
 * §7) — `undefined` for exploration, for a Support Gate pause, or when
 * the flag is off.
 *
 * `supportGateTier` defaults to `"proceed"` when the caller does not
 * supply one — `orchestrator.ts`'s retained call sites do not currently
 * have the live turn's real, already-computed tier on hand without
 * threading it through several public function signatures used by many
 * other callers across the codebase (out of scope for this narrow
 * remediation; see docs/estate/WORK_IDENTITY_SLICE_1B_REMEDIATION.md §5
 * for the honest trade-off this default accepts). This is a literal
 * default value, never a recompute — it introduces no import at all.
 * The live conversation's own Support Gate check
 * (`CompanionPageClient.tsx`) already blocks a genuinely overwhelmed
 * turn from reaching Create Fast Path — and therefore this function —
 * in the first place; this default only governs what happens for a
 * caller that reaches this function directly, bypassing that check.
 */
export function attachWorkIdentityAtCreation(
  userText: string,
  supportGateTier: CommitmentSupportGateTier = "proceed",
): WorkId | undefined {
  if (!isWorkIdentityV1Enabled()) return undefined;

  const decision = resolveCommitmentGate({ userText, supportGateTier });
  if (decision.outcome !== "commit") return undefined;

  return mintWorkId();
}
