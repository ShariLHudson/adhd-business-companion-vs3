import type {
  OvernightPriorityDimensions,
  PrioritizePhasePayload,
  PrioritizedItem,
  RecommendPhasePayload,
} from "../types";

function dimensionsForKind(kind: string): OvernightPriorityDimensions {
  const base = {
    priority: 70,
    urgency: 50,
    confidence: 72,
    strategicValue: 68,
    customerValue: 70,
    founderValue: 75,
    revenuePotential: 60,
    missionAlignment: 70,
  };

  switch (kind) {
    case "product":
      return { ...base, priority: 95, strategicValue: 94, customerValue: 92, missionAlignment: 98, confidence: 88 };
    case "executive-decision":
      return { ...base, priority: 88, urgency: 80, founderValue: 92, missionAlignment: 95, confidence: 86 };
    case "workshop":
      return { ...base, priority: 82, customerValue: 88, missionAlignment: 80, confidence: 80 };
    case "automation":
      return { ...base, priority: 70, founderValue: 85, urgency: 45, confidence: 74 };
    case "feature":
      return { ...base, priority: 76, customerValue: 82, missionAlignment: 78 };
    default:
      return base;
  }
}

function compositeScore(d: OvernightPriorityDimensions): number {
  const weights = [0.2, 0.1, 0.1, 0.15, 0.15, 0.1, 0.1, 0.1];
  const values = [
    d.priority,
    d.urgency,
    d.confidence,
    d.strategicValue,
    d.customerValue,
    d.founderValue,
    d.revenuePotential,
    d.missionAlignment,
  ];
  return Math.round(values.reduce((sum, v, i) => sum + v * weights[i], 0));
}

export function runPrioritizePhase(input: RecommendPhasePayload): PrioritizePhasePayload {
  const items: PrioritizedItem[] = input.recommendations.map((rec) => {
    const dimensions = dimensionsForKind(rec.kind);
    return {
      ...rec,
      dimensions,
      compositeScore: compositeScore(dimensions),
    };
  });

  items.sort((a, b) => b.compositeScore - a.compositeScore);
  return { items };
}
