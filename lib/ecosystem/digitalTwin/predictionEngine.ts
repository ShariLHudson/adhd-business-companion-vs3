// Founder Ecosystem — Phase 16 Prediction Engine.
// Estimates likelihoods from observed behavior. These are PROBABILITIES, not
// facts, and are always framed with a confidence + basis. Never certainty,
// never diagnosis.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import type {
  Confidence,
  Likelihood,
  TwinPredictions,
} from "./digitalTwinTypes";
import { confidenceFromEvidence, countType } from "./digitalTwinUtil";

const clamp01 = (n: number) => Math.max(0.05, Math.min(0.95, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

const like = (p: number, evidence: number, basis: string): Likelihood => ({
  probability: round2(clamp01(p)),
  confidence: confidenceFromEvidence(evidence),
  basis,
});

export type PredictionInputs = {
  now?: Date;
  intel?: FounderIntelligence;
};

export function buildPredictions(
  events: FounderEvent[],
  founderId: ID,
  inputs: PredictionInputs = {},
): TwinPredictions {
  const now = inputs.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = inputs.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());
  const os = getFounderOperatingState(mine, founderId, { now, intel });

  const created = countType(mine, "task.created");
  const completed = countType(mine, "task.completed");
  const completionRate = created > 0 ? completed / created : 0.5;
  const momentum = os.momentum.score / 100;
  const capacity = os.capacity.score / 100;

  const procrastination = intel.patterns.filter(
    (p) => p.type === "procrastination-language" || p.type === "unfinished-tasks",
  ).length;
  const switching = intel.patterns.filter((p) => p.type === "project-switching").length;
  const openDecisions =
    (os as { summary?: { openDecisions?: number } }).summary?.openDecisions ?? 0;
  const risks = intel.risks.length;

  // Recommendation acceptance from assisted-action behavior.
  const offered = countType(mine, "assisted_action.offered");
  const accepted = countType(mine, "assisted_action.accepted");
  const acceptRate = offered > 0 ? accepted / offered : 0.5;

  // Project success from health.
  const progresses = os.projectHealth.map((p) => p.progress).filter((x): x is number => x !== null);
  const avgProgress = progresses.length ? progresses.reduce((a, b) => a + b, 0) / progresses.length : 0.3;

  return {
    taskCompletion: like(
      0.3 + completionRate * 0.45 + momentum * 0.25,
      created + completed,
      "Based on your completed-vs-started tasks and current momentum.",
    ),
    procrastination: like(
      0.25 + procrastination * 0.12 + (1 - capacity) * 0.25,
      procrastination + (1 - capacity > 0.5 ? 2 : 0),
      "Based on avoidance signals and current capacity.",
    ),
    overwhelm: like(
      0.2 + (os.attention.loadScore / 100) * 0.4 + switching * 0.1 + Math.min(openDecisions, 4) * 0.05,
      os.attention.openPriorities + switching + openDecisions,
      "Based on attention load, open decisions, and context switching.",
    ),
    projectSuccess: like(
      0.3 + avgProgress * 0.4 + momentum * 0.2 - risks * 0.05,
      progresses.length + completed,
      "Based on project progress, momentum, and open risks.",
    ),
    recommendationAcceptance: like(
      0.35 + acceptRate * 0.5,
      offered + accepted,
      offered > 0
        ? "Based on how often you've acted on past suggestions."
        : "Default estimate — not enough history yet.",
    ),
  };
}

/** Maturity of the twin from how much behavioral evidence exists. */
export function twinMaturity(eventCount: number): Confidence {
  if (eventCount >= 120) return "high"; // ~60–90 days of activity
  if (eventCount >= 40) return "medium";
  return "low";
}
