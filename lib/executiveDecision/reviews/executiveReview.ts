import type { ExecutiveDecision, ExecutiveReview } from "../types";

export function reviewDecision(decision: ExecutiveDecision): ExecutiveReview {
  if (decision.review) return decision.review;

  const outcome = decision.outcome;
  return {
    decisionId: decision.id,
    worked: outcome?.succeeded ?? "partial",
    surprised: outcome?.surprises ?? ["Review pending — no outcome recorded yet."],
    wouldDoAgain: outcome?.wouldDoAgain ?? "partial",
    changeNextTime: outcome?.changesNextTime ?? ["Complete monitoring before review."],
    narrative: [
      "Did it work? Pending full outcome data.",
      "What surprised us? Capture during review.",
      "Would we do it again? Decide after metrics.",
      "What should change next time? Document in Institutional Memory.",
    ],
    reviewedAt: new Date().toISOString(),
  };
}
