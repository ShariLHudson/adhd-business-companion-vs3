/**
 * 101 — Evidence Vault boundary enforcement.
 * Wins and accomplishments are never Evidence by default.
 */

import type { RecognitionCandidate } from "./contracts";
import {
  completionMayBecomeEvidenceWithoutDiscovery,
  NEVER_AUTO_EVIDENCE_COMPLETION_KINDS,
} from "./classifier";

export type EvidenceEligibility = {
  eligible: boolean;
  reason: string;
};

/**
 * Evidence requires a distinct discovery, lesson, solution, pattern, or help insight.
 */
export function evaluateEvidenceEligibility(input: {
  discoveryText?: string;
  problemSolved?: string;
  cause?: string;
  whatWorked?: string;
  whatDidNotWork?: string;
  pattern?: string;
  whoHelped?: readonly string[];
  futureGuidance?: string;
  /** If only a completion happened, Evidence is refused. */
  completionOnly?: boolean;
}): EvidenceEligibility {
  if (input.completionOnly) {
    return {
      eligible: false,
      reason:
        "Completing work alone is not Evidence. Capture a discovery or lesson separately.",
    };
  }

  const hasDiscovery = Boolean(
    input.discoveryText?.trim() ||
      input.problemSolved?.trim() ||
      input.cause?.trim() ||
      input.whatWorked?.trim() ||
      input.whatDidNotWork?.trim() ||
      input.pattern?.trim() ||
      input.futureGuidance?.trim() ||
      (input.whoHelped && input.whoHelped.length > 0),
  );

  if (!hasDiscovery) {
    return {
      eligible: false,
      reason:
        "Evidence needs a discovery, problem solved, pattern, or who helped — not a trophy for finishing.",
    };
  }

  return {
    eligible: true,
    reason: "Distinct discovery or lesson present.",
  };
}

export function assertCompletionKindsNeverAutoEvidence(): void {
  for (const kind of NEVER_AUTO_EVIDENCE_COMPLETION_KINDS) {
    if (completionMayBecomeEvidenceWithoutDiscovery(kind) !== false) {
      throw new Error(`Completion kind ${kind} must never auto-create Evidence`);
    }
  }
}

/** A win/accomplishment candidate must not be rewritten as Evidence. */
export function candidateIsNotEvidence(
  candidate: RecognitionCandidate,
): boolean {
  return candidate.kind !== "evidence";
}

export function winOrAccomplishmentMustStayDistinctFromEvidence(
  recognitionKind: "win" | "accomplishment",
  evidenceId: string | null | undefined,
): { distinct: true; mayLinkOptionally: boolean } {
  void recognitionKind;
  return {
    distinct: true,
    mayLinkOptionally: Boolean(evidenceId?.trim()),
  };
}
