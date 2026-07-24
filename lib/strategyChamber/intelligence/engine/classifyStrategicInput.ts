import type {
  ClassifiedStrategicInput,
  EvidenceStrength,
  StrategicInputClassification,
} from "../types";

function unique(
  classifications: StrategicInputClassification[],
): StrategicInputClassification[] {
  return Array.from(new Set(classifications));
}

/**
 * Quiet classification — preserve original text; never ask the member to label.
 */
export function classifyStrategicInput(text: string): ClassifiedStrategicInput {
  const originalText = text.trim();
  if (!originalText) {
    return {
      originalText: "",
      classifications: ["unknown"],
      evidenceStrength: "unknown",
      safeToTreatAsFact: false,
    };
  }

  const classifications: StrategicInputClassification[] = [];
  const lower = originalText.toLowerCase();

  if (/\?|\b(should i|what if|how do i|which|do i)\b/.test(lower)) {
    classifications.push("question");
  }
  if (
    /\b(want|hope|wish|goal|would like|trying to|looking for|need more)\b/.test(
      lower,
    )
  ) {
    classifications.push("goal");
  }
  if (
    /\b(can'?t|cannot|have to|must|budget|cash|time|capacity|energy|only|limit)\b/.test(
      lower,
    )
  ) {
    classifications.push("constraint");
  }
  if (
    /\b(i think|maybe|might|probably|assume|seems like|i guess|everyone will)\b/.test(
      lower,
    )
  ) {
    classifications.push("assumption");
  }
  if (
    /\b(prefer|rather|important to me|care about|value|matters to me)\b/.test(
      lower,
    )
  ) {
    classifications.push("preference");
  }
  if (
    /\b(value|integrity|trust|fairness|quality over|won'?t compromise)\b/.test(
      lower,
    )
  ) {
    classifications.push("value");
  }
  if (
    /\b(worried|worry|afraid|fear|risk|leave|churn|lose|fail|concern)\b/.test(
      lower,
    )
  ) {
    classifications.push("risk");
    classifications.push("concern");
  }
  if (
    /\b(opportunity|opening|chance|could grow|new market|window)\b/.test(lower)
  ) {
    classifications.push("opportunity");
  }
  if (/\b(idea|what if we|brainstorm|concept)\b/.test(lower)) {
    classifications.push("idea");
  }
  if (
    /\b(option|path|either|instead|raise|keep|increase|pause|could)\b/.test(
      lower,
    )
  ) {
    classifications.push("option");
  }
  if (
    /\b(decided|i'?m choosing|going with|direction is|we will)\b/.test(lower)
  ) {
    classifications.push("decision");
  }
  if (
    /\b(noticed|seeing|hearing|customers? (are|say)|data|numbers?|revenue|churn|cost[s]? (are|have|went))\b/.test(
      lower,
    ) ||
    /\b\d+%|\b\d+\s*(members?|clients?|dollars?|weeks?)\b/.test(lower)
  ) {
    classifications.push("fact");
    classifications.push("evidence");
  } else if (
    /\b(noticed|seeing|happening|evidence|signal)\b/.test(lower)
  ) {
    classifications.push("evidence");
  }

  if (classifications.length === 0) {
    classifications.push("evidence");
  }

  let evidenceStrength: EvidenceStrength = "limited_signal";
  if (
    classifications.includes("assumption") &&
    !classifications.includes("fact")
  ) {
    evidenceStrength = "assumed";
  } else if (classifications.includes("fact")) {
    evidenceStrength = /\b(data|numbers?|%|confirmed)\b/.test(lower)
      ? "strong_signal"
      : "limited_signal";
  } else if (classifications.includes("concern")) {
    evidenceStrength = "anecdotal";
  } else if (classifications.includes("evidence")) {
    evidenceStrength = "limited_signal";
  }

  const safeToTreatAsFact =
    classifications.includes("fact") &&
    !classifications.includes("assumption") &&
    evidenceStrength !== "assumed";

  return {
    originalText,
    classifications: unique(classifications),
    evidenceStrength,
    safeToTreatAsFact,
  };
}

export function isIDontKnowResponse(text: string): boolean {
  return /\b(i don'?t know|im not sure|i'?m not sure|cannot tell|can'?t tell|too much|don'?t know how to answer|no idea)\b/i.test(
    text.trim(),
  );
}
