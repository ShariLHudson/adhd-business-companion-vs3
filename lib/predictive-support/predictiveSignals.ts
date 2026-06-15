/**
 * Gather predictive signals from intelligence layers and app state.
 */

import { evaluateActivation } from "@/lib/activation/activationEngine";
import { getActivationStore } from "@/lib/activation/activationStore";
import { getBusinessOSStore } from "@/lib/business-os/businessStore";
import { getProjects } from "@/lib/companionStore";
import { evaluateCognitiveLoad } from "@/lib/cognitive-load/loadEngine";
import { getDecisionStore } from "@/lib/decision-intelligence/decisionStore";
import { evaluateDecision } from "@/lib/decision-intelligence/decisionEngine";
import { evaluateEnvironment } from "@/lib/environment-intelligence/environmentEngine";
import { evaluateFutureShari } from "@/lib/future-shari/futureEngine";
import { evaluateLoopIntelligence } from "@/lib/loop-intelligence/loopEngine";
import { getLoopStore } from "@/lib/loop-intelligence/loopStore";
import { evaluateMomentum } from "@/lib/momentum-intelligence/momentumEngine";
import { getMomentumStore } from "@/lib/momentum-intelligence/momentumStore";
import { evaluateRecovery } from "@/lib/recovery-intelligence/recoveryEngine";
import { getRecoveryStore } from "@/lib/recovery-intelligence/recoveryStore";
import { evaluateRelationshipOffer } from "@/lib/relationship-intelligence/relationshipEngine";
import { getRelationshipStore } from "@/lib/relationship-intelligence/relationshipStore";
import { evaluateUserHealth } from "@/lib/user-health/userHealthEngine";
import type { PredictiveSupportInput } from "./types";

const MS_DAY = 86_400_000;

export type PredictiveSignalContext = {
  now: Date;
  text: string;
  decliningEnergy: boolean;
  increasingLoad: boolean;
  decliningRecovery: boolean;
  stalledMomentum: boolean;
  repeatedStuck: boolean;
  decisionFatigue: boolean;
  overwhelmLoop: boolean;
  decliningActivation: boolean;
  avoidancePattern: boolean;
  stalledProjects: number;
  highCognitiveLoad: boolean;
  founderOverload: boolean;
  relationshipDrift: boolean;
  poorEnvironmentFit: boolean;
  futureFriction: boolean;
  signals: string[];
};

export function gatherPredictiveSignals(
  input: PredictiveSupportInput = {},
): PredictiveSignalContext {
  const now = input.now ?? new Date();
  const text = input.text?.trim() ?? "";
  const signals: string[] = [];

  const recovery = evaluateRecovery({ text, now });
  const health = evaluateUserHealth({ text, now });
  const load = evaluateCognitiveLoad({ recentText: text, now });
  const activation = evaluateActivation({ text, now });
  const momentum = evaluateMomentum({ text, now });
  const decision = evaluateDecision({ text, now });
  const loop = evaluateLoopIntelligence({ text, now });
  const environment = evaluateEnvironment({ text, now });
  const future = evaluateFutureShari({ text, now });
  const relOffer = evaluateRelationshipOffer({ text, now });

  const recoveryHistory = getRecoveryStore().history.slice(-8);
  const momentumHistory = getMomentumStore().history.slice(-8);
  const activationHistory = getActivationStore().history.slice(-8);
  const decisionHistory = getDecisionStore().history.slice(-8);
  const loopStore = getLoopStore();
  const businessOS = getBusinessOSStore().history.at(-1);

  const decliningEnergy =
    recovery.energyTrend === "declining" ||
    recoveryHistory.filter((s) => s.energyTrend === "declining").length >= 2;
  if (decliningEnergy) signals.push("declining energy");

  const increasingLoad =
    load.score.level === "heavy" ||
    load.score.level === "overloaded" ||
    /\b(too much|overwhelm|carrying a lot|piling up)\b/i.test(text);
  if (increasingLoad) signals.push("increasing cognitive load");

  const decliningRecovery =
    recovery.recoveryLevel === "depleted" ||
    recovery.recoveryLevel === "strained" ||
    recoveryHistory.some((s) => s.recoveryLevel === "depleted");
  if (decliningRecovery) signals.push("declining recovery");

  const stalledMomentum =
    momentum.momentumLevel === "stalled" ||
    momentum.momentumTrend === "falling" ||
    momentumHistory.filter((s) => s.momentumLevel === "stalled").length >= 2;
  if (stalledMomentum) signals.push("stalled momentum");

  const repeatedStuck =
    activation.state === "frozen" ||
    activation.state === "stuck" ||
    activationHistory.filter((s) => s.state === "frozen" || s.state === "stuck")
      .length >= 3;
  if (repeatedStuck) signals.push("repeated stuck states");

  const decisionFatigue =
    decision.decisionState === "stuck" ||
    decision.decisionState === "overloaded" ||
    getDecisionStore().parked.length > getDecisionStore().resolvedCount;
  if (decisionFatigue) signals.push("decision fatigue");

  const overwhelmLoop =
    loop?.loopType === "overwhelm_loop" ||
    loopStore.snapshots.some((s) => s.loopType === "overwhelm_loop");
  if (overwhelmLoop) signals.push("overwhelm loop");

  const decliningActivation =
    activation.state === "hesitant" ||
    activationHistory.filter((s) => s.state === "hesitant").length >= 2;
  if (decliningActivation) signals.push("declining activation");

  const avoidancePattern =
    /\b(avoid|avoiding|putting off|can't start|haven't started)\b/i.test(text) ||
    activation.state === "frozen";
  if (avoidancePattern) signals.push("avoidance pattern");

  const stalledProjects = getProjects().filter(
    (p) =>
      p.horizon === "now" &&
      p.status === "in-progress" &&
      (!p.nextAction?.trim() || p.nextAction.toLowerCase() === "tbd"),
  ).length;
  if (stalledProjects > 0) signals.push(`${stalledProjects} stalled project(s)`);

  const highCognitiveLoad = load.score.level === "overloaded";
  if (highCognitiveLoad) signals.push("high cognitive load");

  const founderOverload =
    businessOS?.founderLoad === "high" ||
    businessOS?.founderLoad === "critical" ||
    businessOS?.businessHealth === "overloaded";
  if (founderOverload) signals.push("founder overload");

  const relationshipDrift =
    Boolean(relOffer) ||
    getRelationshipStore().relationships.some((r) => {
      if (!r.lastInteraction) return false;
      const days =
        (now.getTime() - new Date(r.lastInteraction).getTime()) / MS_DAY;
      return days >= 21;
    });
  if (relationshipDrift) signals.push("relationship follow-up drift");

  const poorEnvironmentFit = environment?.focusFit === "poor";
  if (poorEnvironmentFit) signals.push("poor environment fit");

  const futureFriction =
    Boolean(future) && future?.opportunity !== "recovery";
  if (futureFriction) signals.push("future friction building");

  if (health.status === "overloaded" || health.status === "disengaging") {
    signals.push(`user health: ${health.status}`);
  }

  return {
    now,
    text,
    decliningEnergy,
    increasingLoad,
    decliningRecovery,
    stalledMomentum,
    repeatedStuck,
    decisionFatigue,
    overwhelmLoop,
    decliningActivation,
    avoidancePattern,
    stalledProjects,
    highCognitiveLoad,
    founderOverload,
    relationshipDrift,
    poorEnvironmentFit,
    futureFriction,
    signals,
  };
}
