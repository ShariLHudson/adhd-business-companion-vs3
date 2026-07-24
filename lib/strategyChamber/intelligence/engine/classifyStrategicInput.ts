import type {
  ClassifiedStrategicInput,
  EvidenceStrength,
  StrategicInputClassification,
  StrategicStatementStance,
} from "../types";

export type { StrategicStatementStance };

/** Normalize curly quotes so member wording still matches analysis patterns. */
export function normalizeStrategicText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"');
}

function unique(
  classifications: StrategicInputClassification[],
): StrategicInputClassification[] {
  return Array.from(new Set(classifications));
}

function resolveStance(
  lower: string,
  classifications: StrategicInputClassification[],
): StrategicStatementStance {
  if (
    /\b(feels?|feeling|overwhelmed|anxious|scared|excited|relieved|exhausted|tangled|heavy)\b/.test(
      lower,
    ) ||
    /\bi feel\b/.test(lower)
  ) {
    return "feeling";
  }

  // Cause unknown — keep unresolved even when an effect is mentioned
  if (
    /\b(i don'?t know|not sure|unclear|can'?t tell|no idea)\b/.test(lower) &&
    /\b(why|cause|reason)\b/.test(lower)
  ) {
    return "unknown";
  }
  if (
    /\b(i don'?t know|not sure|unclear|can'?t tell|no idea)\b/.test(lower) &&
    !classifications.includes("fact")
  ) {
    return "unknown";
  }

  if (
    classifications.includes("assumption") ||
    /\b(i think|maybe|might|probably|assume|seems like|i guess|everyone will|would leave|will leave)\b/.test(
      lower,
    )
  ) {
    return "assumption";
  }

  if (
    /\b(means|so that means|which means|therefore|because of that|the reason is|must think|must be|must mean)\b/.test(
      lower,
    )
  ) {
    return "interpretation";
  }

  if (
    classifications.includes("fact") &&
    /\b(data|numbers?|%|confirmed|revenue|cost[s]? (are|have|went)|measured)\b/.test(
      lower,
    )
  ) {
    return "fact";
  }

  if (
    /\b(noticed|seeing|hearing|happening|fewer|inquir|this month|customers? (are|say)|signal|have had|i'?ve had)\b/.test(
      lower,
    ) ||
    (classifications.includes("evidence") && !classifications.includes("fact"))
  ) {
    return "observation";
  }

  if (classifications.includes("fact")) {
    return "fact";
  }

  if (classifications.includes("unknown") || classifications.length === 0) {
    return "unknown";
  }

  if (classifications.includes("concern") || classifications.includes("risk")) {
    return "feeling";
  }

  return "observation";
}

/**
 * Quiet classification — preserve original text; never ask the member to label.
 * Assigns strategic-role classifications and a separate epistemic stance.
 */
export function classifyStrategicInput(text: string): ClassifiedStrategicInput {
  const originalText = text.trim();
  if (!originalText) {
    return {
      originalText: "",
      classifications: ["unknown"],
      evidenceStrength: "unknown",
      stance: "unknown",
      safeToTreatAsFact: false,
    };
  }

  const classifications: StrategicInputClassification[] = [];
  const lower = normalizeStrategicText(originalText).toLowerCase();

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
    /\b(i think|maybe|might|probably|assume|seems like|i guess|everyone will|would leave|will leave)\b/.test(
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
  // Measurable / confirmed → fact + evidence. Mere noticing → evidence only.
  if (
    /\b(data|numbers?|revenue|churn|cost[s]? (are|have|went)|confirmed|measured)\b/.test(
      lower,
    ) ||
    /\b\d+%|\b\d+\s*(members?|clients?|dollars?|weeks?)\b/.test(lower)
  ) {
    classifications.push("fact");
    classifications.push("evidence");
  } else if (
    /\b(noticed|seeing|hearing|happening|customers? (are|say)|evidence|signal|fewer|inquir|have had|i'?ve had)\b/.test(
      lower,
    )
  ) {
    classifications.push("evidence");
  }

  if (classifications.length === 0) {
    classifications.push("evidence");
  }

  const roles = unique(classifications);
  const stance = resolveStance(lower, roles);

  let evidenceStrength: EvidenceStrength = "limited_signal";
  if (stance === "feeling") {
    evidenceStrength = "anecdotal";
  } else if (stance === "assumption") {
    evidenceStrength = "assumed";
  } else if (stance === "unknown") {
    evidenceStrength = "unknown";
  } else if (stance === "interpretation") {
    evidenceStrength = "assumed";
  } else if (stance === "observation") {
    evidenceStrength = "limited_signal";
  } else if (stance === "fact") {
    evidenceStrength = /\b(data|numbers?|%|confirmed|measured)\b/.test(lower)
      ? "strong_signal"
      : "limited_signal";
  } else if (roles.includes("assumption") && !roles.includes("fact")) {
    evidenceStrength = "assumed";
  } else if (roles.includes("concern")) {
    evidenceStrength = "anecdotal";
  }

  // Feelings, assumptions, interpretations, observations, unknowns never as fact.
  // Facts only when evidence strength supports it.
  const safeToTreatAsFact =
    stance === "fact" &&
    (evidenceStrength === "confirmed" || evidenceStrength === "strong_signal") &&
    !roles.includes("assumption");

  return {
    originalText,
    classifications: roles,
    evidenceStrength,
    stance,
    safeToTreatAsFact,
  };
}

/**
 * Member-facing copy that reflects epistemic stance.
 * Preserves original wording; never silently converts tentative stances into facts.
 */
export function formatStanceAwareCopy(input: ClassifiedStrategicInput): string {
  const text = input.originalText.trim();
  if (!text) return "";

  switch (input.stance) {
    case "observation": {
      const core = text
        .replace(
          /^(i have had|i'?ve had|i noticed|i am seeing|i'?m seeing|i see)\s+/i,
          "",
        )
        .replace(/\.$/, "");
      return `You've noticed ${core}.`;
    }
    case "interpretation": {
      if (/\b(expensive|price|pricing|cost)\b/i.test(text)) {
        return "One possible interpretation is that price may be affecting interest.";
      }
      const core = text
        .replace(/^(people must think|this means|that means|so)\s+/i, "")
        .replace(/\.$/, "");
      return `One possible interpretation is that ${core}.`;
    }
    case "assumption": {
      if (/\bleave\b/i.test(text) && /\b(member|client|customer)/i.test(text)) {
        return "You're concerned members may leave, but that is still something we would need to test.";
      }
      const core = text
        .replace(/^(i think|i assume|maybe|probably)\s+/i, "")
        .replace(/\.$/, "");
      return `You're concerned ${core}, but that is still something we would need to test.`;
    }
    case "feeling": {
      const core = text
        .replace(/^(i feel like|i feel that|i feel|it feels like)\s+/i, "")
        .replace(/\.$/, "");
      return `It feels to you as though ${core}. We should separate that feeling from what the results are showing.`;
    }
    case "unknown": {
      const effect = text.match(
        /\b(?:why|cause of|reason)\s+(.+?)(?:\.|$)/i,
      )?.[1];
      if (effect) {
        const cleaned = effect.replace(/^(the\s+)?/i, "").replace(/\.$/, "");
        return `We know ${cleaned}, but the cause is still unclear.`;
      }
      if (/\bsales?\s+drop/i.test(text)) {
        return "We know sales dropped, but the cause is still unclear.";
      }
      return `This is still unclear: ${text}`;
    }
    case "fact": {
      if (input.safeToTreatAsFact) {
        return text;
      }
      // Inadequate evidence — do not elevate to confirmed fact in copy
      return `You've shared this: ${text}`;
    }
    default:
      return text;
  }
}

export function isIDontKnowResponse(text: string): boolean {
  return /\b(i don'?t know|im not sure|i'?m not sure|cannot tell|can'?t tell|too much|don'?t know how to answer|no idea)\b/i.test(
    normalizeStrategicText(text.trim()),
  );
}
