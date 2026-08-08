/**
 * Observe-only Commitment Gate connection — Slice 1A
 * (docs/estate/WORK_IDENTITY_SLICE_0_REVIEW.md §5, "smallest safe first
 * runtime connection").
 *
 * The single function `CompanionPageClient.tsx` calls at the existing
 * Support Gate checkpoint. It computes `resolveCommitmentGate`'s decision
 * from inputs the live turn already has on hand, and records it for
 * diagnostics only (`commitmentGateDiagnostics.ts`).
 *
 * Deliberately returns `void` — not the gate's result. This is not a
 * style choice; it is the contract itself: a caller cannot branch on a
 * result it never receives, which is what makes "observe-only" a
 * property enforced by the type signature, not just a comment a future
 * edit could quietly violate. No WorkId is created here, no storage is
 * written, and no routing or navigation function is called — this
 * function's only two effects are calling the already-pure
 * `resolveCommitmentGate` and appending to the in-memory diagnostic log.
 *
 * Wrapped in a try/catch so a diagnostic failure can never affect the
 * live conversation turn it is silently watching (`WORK_IDENTITY_
 * IMPLEMENTATION_PLAN.md`'s "smallest safe slice" discipline, applied to
 * runtime safety as well as behavioral safety).
 */

import { logCommitmentGateDecision } from "./commitmentGateDiagnostics";
import { resolveCommitmentGate } from "./resolveCommitmentGate";
import type { CommitmentRecognitionContext } from "./types";

export interface ObserveCommitmentGateInput extends CommitmentRecognitionContext {
  readonly turn?: number;
}

export function observeCommitmentGate(input: ObserveCommitmentGateInput): void {
  try {
    const result = resolveCommitmentGate(input);
    logCommitmentGateDecision({
      turn: input.turn,
      userText: input.userText,
      result,
    });
  } catch {
    // Observe-only: never let a diagnostic failure affect the live turn.
  }
}
