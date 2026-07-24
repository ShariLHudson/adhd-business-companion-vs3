import type { EvidenceStrength, StrategicInputClassification } from "../../domainModel";
import type {
  StatementAnalysisConfidence,
  StrategicStatementAnalysis,
  StrategicStatementNature,
} from "../statementAnalysis";
import {
  classifyStrategicInput,
  normalizeStrategicText,
} from "./classifyStrategicInput";

function uniqueRoles(
  roles: StrategicInputClassification[],
): StrategicInputClassification[] {
  return Array.from(new Set(roles));
}

/**
 * Quiet epistemic analysis — never ask the member to label.
 * Preserves original wording; separates nature from strategic role.
 */
export function analyzeStrategicStatement(
  text: string,
): StrategicStatementAnalysis {
  const originalText = text.trim();
  if (!originalText) {
    return {
      originalText: "",
      nature: "unknown",
      evidenceStrength: "unknown",
      confidence: "low",
      classifications: ["unknown"],
      safeToTreatAsFact: false,
      safeToPresentAsEvidence: false,
      needsClarification: true,
    };
  }

  const classified = classifyStrategicInput(originalText);
  const lower = normalizeStrategicText(originalText).toLowerCase();
  const roles = uniqueRoles(classified.classifications);

  let nature: StrategicStatementNature = "unknown";

  if (
    /\b(feels?|feeling|overwhelmed|anxious|scared|excited|relieved|exhausted|tangled|heavy)\b/.test(
      lower,
    )
  ) {
    nature = "feeling";
  } else if (
    roles.includes("assumption") ||
    /\b(i think|maybe|might|probably|assume|seems like|i guess|everyone will|always|never)\b/.test(
      lower,
    )
  ) {
    nature = "assumption";
  } else if (
    /\b(means|so that means|which means|therefore|because of that|the reason is)\b/.test(
      lower,
    )
  ) {
    nature = "interpretation";
  } else if (
    roles.includes("fact") &&
    /\b(data|numbers?|%|confirmed|revenue|cost[s]? (are|have|went)|measured)\b/.test(
      lower,
    )
  ) {
    nature = "fact";
  } else if (
    /\b(noticed|seeing|hearing|happening|customers? (are|say)|signal)\b/.test(
      lower,
    ) ||
    (roles.includes("evidence") && !roles.includes("fact"))
  ) {
    nature = "observation";
  } else if (roles.includes("fact")) {
    nature = "fact";
  } else if (roles.includes("unknown") || roles.length === 0) {
    nature = "unknown";
  } else if (roles.includes("concern") || roles.includes("risk")) {
    nature = "feeling";
  } else {
    nature = "observation";
  }

  let evidenceStrength: EvidenceStrength = classified.evidenceStrength;
  if (nature === "feeling") {
    evidenceStrength = "anecdotal";
  } else if (nature === "assumption") {
    evidenceStrength = "assumed";
  } else if (nature === "interpretation") {
    evidenceStrength =
      evidenceStrength === "confirmed" || evidenceStrength === "strong_signal"
        ? "limited_signal"
        : evidenceStrength === "unknown"
          ? "assumed"
          : evidenceStrength;
  } else if (nature === "observation") {
    if (evidenceStrength === "confirmed") evidenceStrength = "limited_signal";
  } else if (nature === "unknown") {
    evidenceStrength = "unknown";
  }

  const safeToTreatAsFact =
    nature === "fact" &&
    !roles.includes("assumption") &&
    evidenceStrength !== "assumed" &&
    evidenceStrength !== "anecdotal";

  const safeToPresentAsEvidence =
    (nature === "fact" || nature === "observation") &&
    nature !== "feeling" &&
    nature !== "assumption" &&
    evidenceStrength !== "assumed";

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
    safeToTreatAsFact,
    safeToPresentAsEvidence,
    needsClarification,
  };
}
