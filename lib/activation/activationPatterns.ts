/**
 * Map raw signals to ranked likely blockers with explainable confidence.
 */

import type {
  ActivationBlockerType,
  ActivationConfidence,
  LikelyBlocker,
} from "./types";
import type { ActivationSignalHit } from "./activationSignals";

const BLOCKER_LABELS: Record<ActivationBlockerType, string> = {
  overwhelm: "Overwhelm",
  clarity: "Clarity",
  fear_rsd: "Fear / RSD",
  perfectionism: "Perfectionism",
  energy: "Energy",
  decision: "Decision",
  task_friction: "Task friction",
};

export function rankLikelyBlockers(
  hits: ActivationSignalHit[],
): LikelyBlocker[] {
  const scores = new Map<
    ActivationBlockerType,
    { weight: number; reasons: string[] }
  >();

  for (const hit of hits) {
    const prev = scores.get(hit.blocker) ?? { weight: 0, reasons: [] };
    prev.weight += hit.weight;
    if (!prev.reasons.includes(hit.signal)) prev.reasons.push(hit.signal);
    scores.set(hit.blocker, prev);
  }

  const ranked = [...scores.entries()]
    .map(([type, data]) => ({
      type,
      label: BLOCKER_LABELS[type],
      reason: formatReason(data.reasons),
      confidence: confidenceForWeight(data.weight),
      weight: data.weight,
    }))
    .sort((a, b) => b.weight - a.weight);

  return ranked.slice(0, 3).map(({ type, label, reason, confidence }) => ({
    type,
    label,
    reason,
    confidence,
  }));
}

function formatReason(reasons: string[]): string {
  if (reasons.length === 1) return `Signal: ${reasons[0]}`;
  return `Signals: ${reasons.slice(0, 3).join(", ")}`;
}

function confidenceForWeight(weight: number): ActivationConfidence {
  if (weight >= 7) return "high";
  if (weight >= 4) return "medium";
  return "low";
}

export function overallConfidence(
  blockers: LikelyBlocker[],
): ActivationConfidence {
  if (!blockers.length) return "low";
  const top = blockers[0]!.confidence;
  if (blockers.length >= 2 && blockers[0]!.confidence !== "low") return top;
  return top;
}

export function pickPrimaryBlocker(
  blockers: LikelyBlocker[],
): LikelyBlocker | null {
  return blockers[0] ?? null;
}
