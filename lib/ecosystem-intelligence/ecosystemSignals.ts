/**
 * Gather signals from all intelligence layers.
 */

import { evaluateAdaptiveCompanion } from "@/lib/adaptive-companion/adaptiveEngine";
import { evaluateActivation } from "@/lib/activation/activationEngine";
import { getBusinessOSStore } from "@/lib/business-os/businessStore";
import type { BusinessOSSnapshot } from "@/lib/business-os/types";
import { getChiefStore } from "@/lib/chief-of-staff/chiefStore";
import type { ChiefOfStaffSnapshot } from "@/lib/chief-of-staff/types";
import { evaluateCognitiveLoad } from "@/lib/cognitive-load/loadEngine";
import { evaluateDecision } from "@/lib/decision-intelligence/decisionEngine";
import { evaluateEnvironment } from "@/lib/environment-intelligence/environmentEngine";
import { evaluateFutureShari } from "@/lib/future-shari/futureEngine";
import { shouldStartDayDesigner } from "@/lib/day-designer";
import { evaluateLoopIntelligence } from "@/lib/loop-intelligence/loopEngine";
import { evaluateMomentum } from "@/lib/momentum-intelligence/momentumEngine";
import { evaluateOpportunities } from "@/lib/opportunity-intelligence/opportunityEngine";
import { evaluateRecovery } from "@/lib/recovery-intelligence/recoveryEngine";
import { recoveryOverridesProductivity } from "@/lib/recovery-intelligence/recoveryScoring";
import { evaluateRelationshipOffer } from "@/lib/relationship-intelligence/relationshipEngine";
import { evaluateUserHealth } from "@/lib/user-health/userHealthEngine";
import { evaluatePredictiveSupport } from "@/lib/predictive-support/predictiveEngine";
import { riskTypeLabel } from "@/lib/predictive-support/predictiveInsights";
import type {
  EcosystemInput,
  EcosystemSurface,
  IntelligenceLayer,
  LayerSignal,
} from "./types";

export type EcosystemSignalContext = {
  now: Date;
  input: EcosystemInput;
  signals: LayerSignal[];
};

const SAFETY_RE =
  /\b(can'?t cope|hopeless|panic|crisis|emergency|hurt myself|want to die|suicidal)\b/i;

const USER_ACTION_RE =
  /\b(help me|show me|open |create |write |send |draft |plan my day|remember |follow up)\b/i;

export function gatherEcosystemSignals(
  input: EcosystemInput = {},
): EcosystemSignalContext {
  const now = input.now ?? new Date();
  const text = input.text?.trim() ?? "";
  const signals: LayerSignal[] = [];

  const recovery = evaluateRecovery({ text, now });
  const health = evaluateUserHealth({ text, now });
  const load = evaluateCognitiveLoad({ recentText: text, now });
  const activation = evaluateActivation({ text, now });
  const loop = evaluateLoopIntelligence({ text, now });
  const momentum = evaluateMomentum({ text, now });
  const decision = evaluateDecision({ text, now });
  const environment = evaluateEnvironment({ text, now });
  const future = evaluateFutureShari({ text, now });
  const adaptive = evaluateAdaptiveCompanion({ text, now });
  const businessOS = latestBusinessOS();
  const chief = latestChiefOfStaff();
  const opportunities = evaluateOpportunities({ text, now });
  const relOffer = evaluateRelationshipOffer({ text, now });

  if (SAFETY_RE.test(text) || health.status === "disengaging") {
    signals.push(sig(
      "user_health",
      "safety_support",
      100,
      "Safety / support need",
      "User may need calm, present support first",
      "companion_chat",
    ));
  }

  if (
    recovery.recoveryLevel === "burnout_risk" ||
    recovery.recoveryLevel === "depleted" ||
    recovery.riskLevel === "high"
  ) {
    signals.push(sig(
      "recovery",
      "recovery_support",
      92,
      "Recovery support",
      `Recovery level: ${recovery.recoveryLevel}, energy ${recovery.energyTrend}`,
      "companion_chat",
    ));
  }

  if (load.score.level === "overloaded" || load.score.level === "heavy") {
    signals.push(sig(
      "cognitive_load",
      "cognitive_load_support",
      82,
      "Cognitive load support",
      `Load level: ${load.score.level}`,
      "companion_chat",
    ));
  }

  if (
    activation.state === "frozen" ||
    activation.state === "stuck" ||
    activation.state === "hesitant"
  ) {
    signals.push(sig(
      "activation",
      "activation_support",
      74,
      "Activation support",
      `Activation state: ${activation.state}`,
      "activation_offer",
    ));
  }

  if (input.recognitionActive) {
    signals.push(sig(
      "recognition",
      "recognition_celebration",
      68,
      "Recognition moment",
      "Celebrate before business nudges",
      "recognition_card",
    ));
  }

  if (loop && loop.confidence !== "low") {
    signals.push(sig(
      "loop",
      "loop_support",
      62,
      "Loop support",
      `${loop.loopType} loop detected`,
      "loop_offer",
    ));
  }

  if (health.status === "overloaded" || health.status === "needs_support") {
    signals.push(sig(
      "user_health",
      "user_health_support",
      58,
      "User health support",
      `Health status: ${health.status}`,
      "companion_chat",
    ));
  }

  if (relOffer) {
    signals.push(sig(
      "relationship",
      "relationship_support",
      52,
      "Relationship follow-up",
      relOffer.companionOffer || relOffer.signal.contextSnippet || "Warm connection worth remembering",
      "relationship_offer",
    ));
  }

  if (
    decision.decisionState === "stuck" ||
    decision.decisionState === "overloaded"
  ) {
    signals.push(sig(
      "decision",
      "decision_support",
      50,
      "Decision support",
      `Decision state: ${decision.decisionState}`,
      "decision_offer",
    ));
  }

  if (environment && environment.focusFit === "poor") {
    signals.push(sig(
      "environment",
      "environment_support",
      46,
      "Environment adjustment",
      "Focus fit is poor — tiny environment win may help",
      "environment_offer",
    ));
  }

  if (future && future.confidence !== "low") {
    signals.push(sig(
      "future_shari",
      "future_shari_support",
      44,
      "Future Shari",
      future.futureBenefit,
      "future_shari_offer",
    ));
  }

  if (
    ["restarting", "building", "steady"].includes(momentum.momentumLevel) &&
    momentum.confidence !== "low"
  ) {
    signals.push(sig(
      "momentum",
      "momentum_acknowledgment",
      42,
      "Momentum acknowledgment",
      `Momentum: ${momentum.momentumLevel}`,
      "momentum_offer",
    ));
  }

  if (shouldStartDayDesigner(text) && !input.dayPlanActive) {
    signals.push(sig(
      "day_designer",
      "day_planning",
      40,
      "Day planning",
      "User asked for gentle day structure",
      "day_designer",
    ));
  }

  if (adaptive.confidence !== "low") {
    signals.push(sig(
      "adaptive_companion",
      "adaptive_guidance",
      36,
      "Adaptive companion mode",
      `Mode: ${adaptive.mode}`,
      "companion_chat",
    ));
  }

  const predictive = predictiveLayerSignal({ text, now });
  if (predictive) {
    signals.push(predictive);
  }

  if (opportunities.length > 0 && !recoveryOverridesProductivity(recovery)) {
    const top = opportunities[0]!;
    signals.push(sig(
      "opportunity",
      "opportunity_explore",
      30,
      top.title,
      top.reason,
      "opportunity_offer",
    ));
  }

  if (
    businessOS &&
    (businessOS.businessHealth === "needs_attention" ||
      businessOS.businessHealth === "overloaded")
  ) {
    signals.push(sig(
      "business_os",
      "business_sort",
      26,
      "Business sorting",
      businessOS.activeRisks[0]?.reason || "Several business pieces moving",
      "business_os_sort",
    ));
  }

  if (
    chief &&
    ["stretched", "overloaded", "critical"].includes(chief.overallAssessment)
  ) {
    signals.push(sig(
      "chief_of_staff",
      "chief_of_staff",
      22,
      "Chief of Staff perspective",
      chief.recommendedFocus,
      "chief_of_staff_offer",
    ));
  }

  if (USER_ACTION_RE.test(text) || input.userRequestedAction) {
    const match = signals.find((s) => surfaceMatchesIntent(text, s.surface));
    if (match) match.weight += 15;
  }

  if (!signals.length) {
    signals.push(sig(
      "adaptive_companion",
      "calm_presence",
      10,
      "Calm presence",
      "No urgent intelligence layer — keep companion simple",
      "companion_chat",
    ));
  }

  return { now, input, signals };
}

function sig(
  layer: IntelligenceLayer,
  priority: LayerSignal["priority"],
  weight: number,
  label: string,
  reason: string,
  surface: EcosystemSurface,
): LayerSignal {
  return { layer, priority, weight, label, reason, surface };
}

function predictiveLayerSignal(input: {
  text: string;
  now: Date;
}): LayerSignal | null {
  const snapshot = evaluatePredictiveSupport(input);
  if (!snapshot || snapshot.riskLevel === "low") return null;

  const weight =
    snapshot.riskLevel === "high"
      ? 40
      : snapshot.riskLevel === "elevated"
        ? 36
        : 32;

  return sig(
    "predictive_support",
    "predictive_support",
    weight,
    riskTypeLabel(snapshot.riskType),
    snapshot.predictedOutcome,
    snapshot.riskLevel === "elevated" || snapshot.riskLevel === "high"
      ? "predictive_support_offer"
      : "companion_chat",
  );
}

function surfaceMatchesIntent(text: string, surface: EcosystemSurface): boolean {
  if (/plan my day|design my day/i.test(text)) return surface === "day_designer";
  if (/follow up|remember them/i.test(text)) return surface === "relationship_offer";
  if (/decide|decision/i.test(text)) return surface === "decision_offer";
  if (/opportunity|idea/i.test(text)) return surface === "opportunity_offer";
  return surface === "companion_chat";
}

export function collectActiveLayers(signals: LayerSignal[]): IntelligenceLayer[] {
  return [...new Set(signals.map((s) => s.layer))];
}

function latestBusinessOS(): BusinessOSSnapshot | null {
  const store = getBusinessOSStore();
  return store.history[store.history.length - 1] ?? null;
}

function latestChiefOfStaff(): ChiefOfStaffSnapshot | null {
  const store = getChiefStore();
  return store.history[store.history.length - 1] ?? null;
}
