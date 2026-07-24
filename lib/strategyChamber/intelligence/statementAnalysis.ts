/**
 * Secondary epistemic layer — statement nature / stance.
 * Distinct from StrategicInputClassification (strategic role).
 * Does not rename or replace domainModel.ts contracts.
 *
 * Canonical stance lives on ClassifiedStrategicInput.stance
 * (`StrategicStatementStance` in types.ts). Nature is the same union
 * for richer StrategicStatementAnalysis metadata.
 */

import type { EvidenceStrength, StrategicInputClassification } from "../domainModel";
import type { StrategicStatementStance } from "./types";

/** @deprecated Prefer StrategicStatementStance — same epistemic union. */
export type StrategicStatementNature = StrategicStatementStance;

export type StatementAnalysisConfidence = "low" | "moderate" | "high";

export type StrategicStatementAnalysis = {
  /** Exact member wording — never rewritten for storage. */
  originalText: string;
  nature: StrategicStatementNature;
  evidenceStrength: EvidenceStrength;
  confidence: StatementAnalysisConfidence;
  /** Strategic role tags from the primary classification union. */
  classifications: StrategicInputClassification[];
  /** Only true for facts with supporting evidence strength. */
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
