/**
 * Confidence Intelligence — self-trust through evidence.
 * @see constitution.ts — selectConfidenceOpportunity
 */

import type {
  AssembledContext,
  ConfidenceOpportunity,
  MomentumAction,
} from "./types";

export function selectConfidenceOpportunity(
  ctx: AssembledContext,
  momentum: MomentumAction,
): ConfidenceOpportunity {
  if (ctx.cycleState === "protected") {
    return {
      candidateId: null,
      label: null,
      encouragement: null,
      evidenceRefs: [],
      reason: "Protected state — no confidence surface.",
    };
  }

  if (ctx.dayMode === "celebration") {
    const evidence = ctx.brainState.lastReflectedDayKey;
    return {
      candidateId: null,
      label: null,
      encouragement: ctx.milestoneEvidence?.length
        ? `You finished what you set out to do — that counts.`
        : null,
      evidenceRefs: ctx.milestoneEvidence ?? [],
      reason: "Evidence-based celebration — not generic hype.",
    };
  }

  if (ctx.dayMode === "recovery" || ctx.dayMode === "survival") {
    return {
      candidateId: null,
      label: null,
      encouragement: null,
      evidenceRefs: [],
      reason: "Orientation and boundaries build trust today.",
    };
  }

  if (ctx.dayMode === "health" || ctx.dayMode === "family") {
    return {
      candidateId: momentum.candidateId,
      label: momentum.label,
      encouragement: null,
      evidenceRefs: [],
      reason: "Honoring limits is confidence-building.",
    };
  }

  if (
    momentum.kind !== "none" &&
    momentum.candidateId &&
    momentum.label
  ) {
    return {
      candidateId: momentum.candidateId,
      label: momentum.label,
      encouragement: null,
      evidenceRefs: [],
      reason: "Paired with momentum — completable proof of follow-through.",
    };
  }

  const smallWin = ctx.candidates.find(
    (c) => (c.estimatedMinutes ?? 60) <= 15 && c.fitScore >= 0.6,
  );
  if (smallWin) {
    return {
      candidateId: smallWin.id,
      label: smallWin.label,
      encouragement: null,
      evidenceRefs: [],
      reason: "Small completable win for self-trust.",
    };
  }

  return {
    candidateId: null,
    label: null,
    encouragement: null,
    evidenceRefs: [],
    reason: "No separate confidence action today.",
  };
}
