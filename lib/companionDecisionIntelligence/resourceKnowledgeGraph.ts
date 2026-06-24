/**
 * Resource Knowledge Graph™ — which ecosystem resource beats conversation alone.
 */

import type { DecisionComplexityScore } from "./types";
import type { ResourceCandidate, SituationAtlasDecision } from "./types";

const RESOURCE_LABELS: Record<ResourceCandidate["id"], string> = {
  decision_compass: "Decision Compass",
  clear_my_mind: "Clear My Mind",
  plan_my_day: "Plan My Day",
  strategy: "Strategy",
  template: "Template",
  board_expertise: "Board Expertise",
  business_canvas: "Business Canvas",
  conversation: "Conversation",
};

const OFFER_THRESHOLD = 0.7;

function baseConfidence(
  id: ResourceCandidate["id"],
  situation: SituationAtlasDecision,
  complexity: DecisionComplexityScore,
): { confidence: number; reason: string } {
  const inAtlas = situation.ecosystemResources.includes(id);
  let confidence = inAtlas ? 0.45 : 0.2;
  const reasons: string[] = [];

  if (id === "decision_compass") {
    if (situation.decisionType === "business_expansion") {
      confidence += 0.25;
      reasons.push("Structured comparison fits expansion decisions.");
    }
    if (situation.riskLevel === "high") {
      confidence += 0.15;
      reasons.push("High downside warrants structured decision support.");
    }
    if (complexity.level === "high" && complexity.discoveryComplete) {
      confidence += 0.2;
      reasons.push("Discovery complete — ready for structured decision.");
    }
    if (complexity.level === "medium" && complexity.discoveryQuestionsAsked >= 2) {
      confidence += 0.1;
    }
  }

  if (id === "business_canvas" && situation.decisionType === "business_expansion") {
    confidence += 0.12;
    reasons.push("Canvas can map current vs proposed model.");
  }

  if (id === "clear_my_mind" && situation.decisionType === "prioritization") {
    confidence += 0.25;
    reasons.push("Mental clutter benefits from externalization.");
  }

  if (id === "plan_my_day" && situation.decisionType === "prioritization") {
    confidence += 0.15;
  }

  if (id === "conversation") {
    confidence = complexity.level === "low" ? 0.7 : 0.35;
    reasons.push(
      complexity.level === "low"
        ? "Low complexity — conversation is sufficient."
        : "Conversation alone may not structure the decision.",
    );
  }

  if (!complexity.discoveryComplete && id !== "conversation") {
    confidence -= 0.35;
    reasons.push("Discovery not complete — defer resource offer.");
  }

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    reason: reasons.join(" ") || (inAtlas ? "Listed in situation atlas." : "Low match."),
  };
}

export function evaluateResourceCandidates(input: {
  situation: SituationAtlasDecision;
  complexity: DecisionComplexityScore;
}): ResourceCandidate[] {
  const ids: ResourceCandidate["id"][] = [
    "decision_compass",
    "business_canvas",
    "clear_my_mind",
    "plan_my_day",
    "strategy",
    "template",
    "board_expertise",
    "conversation",
  ];

  return ids
    .map((id) => {
      const { confidence, reason } = baseConfidence(
        id,
        input.situation,
        input.complexity,
      );
      return {
        id,
        label: RESOURCE_LABELS[id],
        confidence,
        reason,
        offerReady: confidence >= OFFER_THRESHOLD && id !== "conversation",
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

export function topResourceCandidate(
  candidates: ResourceCandidate[],
): ResourceCandidate | null {
  const ready = candidates.find((c) => c.offerReady);
  return ready ?? candidates[0] ?? null;
}

export const RESOURCE_OFFER_CONFIDENCE_THRESHOLD = OFFER_THRESHOLD;
