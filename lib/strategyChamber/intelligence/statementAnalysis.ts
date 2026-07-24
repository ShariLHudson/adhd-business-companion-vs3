/**
 * Secondary epistemic layer — statement nature.
 * Distinct from StrategicInputClassification (strategic role).
 * Does not rename or replace domainModel.ts contracts.
 */

import type { EvidenceStrength, StrategicInputClassification } from "../domainModel";

/** Epistemic nature of a member statement — not its strategic role. */
export type StrategicStatementNature =
  | "fact"
  | "observation"
  | "interpretation"
  | "assumption"
  | "feeling"
  | "unknown";

export type StatementAnalysisConfidence = "low" | "moderate" | "high";

export type StrategicStatementAnalysis = {
  /** Exact member wording — never rewritten for storage. */
  originalText: string;
  nature: StrategicStatementNature;
  evidenceStrength: EvidenceStrength;
  confidence: StatementAnalysisConfidence;
  /** Strategic role tags from the primary classification union. */
  classifications: StrategicInputClassification[];
  /** Only true for confirmed/strong facts without assumption markers. */
  safeToTreatAsFact: boolean;
  /** False for feelings, pure assumptions, and unsupported interpretations. */
  safeToPresentAsEvidence: boolean;
  needsClarification: boolean;
};

export function natureMemberCopy(nature: StrategicStatementNature): string {
  switch (nature) {
    case "fact":
      return "Something we can treat as known";
    case "observation":
      return "Something you are noticing";
    case "interpretation":
      return "A possible meaning — still tentative";
    case "assumption":
      return "Something currently assumed";
    case "feeling":
      return "How this feels — not evidence by itself";
    default:
      return "Still unknown";
  }
}
