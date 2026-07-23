import type {
  ClassifiedStrategicInput,
  EvidenceQuality,
  StrategicInputKind,
} from "../types";

function uniqueKinds(kinds: StrategicInputKind[]): StrategicInputKind[] {
  return Array.from(new Set(kinds));
}

/**
 * Quiet classification — preserve original text; never ask the member to label.
 */
export function classifyStrategicInput(text: string): ClassifiedStrategicInput {
  const originalText = text.trim();
  if (!originalText) {
    return {
      originalText: "",
      kinds: ["unknown"],
      evidenceQuality: "unknown",
      safeToTreatAsFact: false,
    };
  }

  const kinds: StrategicInputKind[] = [];
  const lower = originalText.toLowerCase();

  if (
    /\b(feel|feeling|overwhelmed|anxious|scared|excited|stuck|relieved)\b/.test(
      lower,
    )
  ) {
    kinds.push("feeling");
  }
  if (
    /\b(i think|maybe|might|probably|assume|seems like|i guess|everyone will)\b/.test(
      lower,
    )
  ) {
    kinds.push("assumption");
  }
  if (
    /\b(means|so that means|which means|therefore)\b/.test(lower)
  ) {
    kinds.push("interpretation");
  }
  if (
    /\b(noticed|seeing|hearing|customers? (are|say)|data|numbers?|revenue|churn|cost[s]? (are|have|went))\b/.test(
      lower,
    ) ||
    /\b\d+%|\b\d+\s*(members?|clients?|dollars?|weeks?)\b/.test(lower)
  ) {
    kinds.push("fact");
  }
  if (kinds.length === 0 || /\b(noticed|seeing|happening)\b/.test(lower)) {
    if (!kinds.includes("fact") && !kinds.includes("assumption")) {
      kinds.push("observation");
    }
  }
  if (kinds.length === 0) kinds.push("observation");

  let evidenceQuality: EvidenceQuality = "limited_signal";
  if (kinds.includes("assumption") && !kinds.includes("fact")) {
    evidenceQuality = "assumed";
  } else if (kinds.includes("fact")) {
    evidenceQuality = /\b(data|numbers?|%|confirmed)\b/.test(lower)
      ? "strong_signal"
      : "limited_signal";
  } else if (kinds.includes("feeling")) {
    evidenceQuality = "anecdotal";
  } else if (kinds.includes("observation")) {
    evidenceQuality = "limited_signal";
  }

  const safeToTreatAsFact =
    kinds.includes("fact") &&
    !kinds.includes("assumption") &&
    evidenceQuality !== "assumed";

  return {
    originalText,
    kinds: uniqueKinds(kinds),
    evidenceQuality,
    safeToTreatAsFact,
  };
}

export function isIDontKnowResponse(text: string): boolean {
  return /\b(i don'?t know|im not sure|i'?m not sure|cannot tell|can'?t tell|too much|don'?t know how to answer|no idea)\b/i.test(
    text.trim(),
  );
}
