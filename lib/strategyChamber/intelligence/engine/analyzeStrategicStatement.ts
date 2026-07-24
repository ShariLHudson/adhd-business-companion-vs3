import type {
  StatementAnalysisConfidence,
  StrategicStatementAnalysis,
} from "../statementAnalysis";
import { classifyStrategicInput, normalizeStrategicText } from "./classifyStrategicInput";

/**
 * Richer epistemic analysis built on ClassifiedStrategicInput.stance.
 * Preserves original wording; never asks the member to label.
 */
export function analyzeStrategicStatement(
  text: string,
): StrategicStatementAnalysis {
  const classified = classifyStrategicInput(text);
  const originalText = classified.originalText;
  const lower = normalizeStrategicText(originalText).toLowerCase();
  const nature = classified.stance;
  const roles = classified.classifications;
  const evidenceStrength = classified.evidenceStrength;

  const safeToPresentAsEvidence =
    (nature === "fact" || nature === "observation") &&
    evidenceStrength !== "assumed" &&
    evidenceStrength !== "anecdotal";

  let confidence: StatementAnalysisConfidence = "moderate";
  if (nature === "unknown" || nature === "feeling") confidence = "low";
  else if (nature === "assumption" || nature === "interpretation") {
    confidence = "low";
  } else if (
    nature === "fact" &&
    (evidenceStrength === "confirmed" || evidenceStrength === "strong_signal")
  ) {
    confidence = "high";
  }

  const needsClarification =
    nature === "unknown" ||
    nature === "interpretation" ||
    (nature === "assumption" && !roles.includes("fact")) ||
    /\b(not working|everyone|always|never)\b/.test(lower);

  return {
    originalText,
    nature,
    evidenceStrength,
    confidence,
    classifications: roles.length ? roles : ["unknown"],
    safeToTreatAsFact: classified.safeToTreatAsFact,
    safeToPresentAsEvidence,
    needsClarification,
  };
}
