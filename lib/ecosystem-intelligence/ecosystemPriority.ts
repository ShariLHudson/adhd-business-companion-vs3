/**
 * Ecosystem priority selection and suppression rules.
 */

import { evaluateActivation } from "@/lib/activation/activationEngine";
import { getBusinessOSStore } from "@/lib/business-os/businessStore";
import { getChiefStore } from "@/lib/chief-of-staff/chiefStore";
import { evaluateCognitiveLoad } from "@/lib/cognitive-load/loadEngine";
import { evaluateRecovery } from "@/lib/recovery-intelligence/recoveryEngine";
import { recoveryOverridesProductivity } from "@/lib/recovery-intelligence/recoveryScoring";
import { evaluateUserHealth } from "@/lib/user-health/userHealthEngine";
import type { EcosystemSignalContext } from "./ecosystemSignals";
import { collectActiveLayers } from "./ecosystemSignals";
import type {
  EcosystemHealth,
  EcosystemPriority,
  EcosystemSnapshot,
  EcosystemSuppression,
  EcosystemSurface,
  FounderEcosystemState,
  LayerSignal,
  UserEcosystemState,
} from "./types";

const ALL_OFFERS: EcosystemSuppression[] = [
  "activation_offer",
  "loop_offer",
  "relationship_offer",
  "decision_offer",
  "environment_offer",
  "future_shari_offer",
  "momentum_offer",
  "opportunity_offer",
  "business_os_sort",
  "chief_of_staff",
  "day_designer",
  "predictive_support_offer",
];

const SURFACE_TO_SUPPRESSION: Partial<
  Record<EcosystemSurface, EcosystemSuppression>
> = {
  activation_offer: "activation_offer",
  loop_offer: "loop_offer",
  relationship_offer: "relationship_offer",
  decision_offer: "decision_offer",
  environment_offer: "environment_offer",
  future_shari_offer: "future_shari_offer",
  momentum_offer: "momentum_offer",
  opportunity_offer: "opportunity_offer",
  business_os_sort: "business_os_sort",
  chief_of_staff_offer: "chief_of_staff",
  day_designer: "day_designer",
  predictive_support_offer: "predictive_support_offer",
};

export function pickTopSignal(signals: LayerSignal[]): LayerSignal {
  return [...signals].sort((a, b) => b.weight - a.weight)[0]!;
}

export function buildSuppressions(
  context: EcosystemSignalContext,
  top: LayerSignal,
): EcosystemSuppression[] {
  const suppress = new Set<EcosystemSuppression>();
  const text = context.input.text?.trim() ?? "";
  const recovery = evaluateRecovery({ text, now: context.now });
  const load = evaluateCognitiveLoad({ recentText: text, now: context.now });
  const activation = evaluateActivation({ text, now: context.now });
  const health = evaluateUserHealth({ text, now: context.now });

  const winner = SURFACE_TO_SUPPRESSION[top.surface];
  for (const offer of ALL_OFFERS) {
    if (offer !== winner) suppress.add(offer);
  }

  if (recoveryOverridesProductivity(recovery)) {
    suppress.add("opportunity_offer");
    suppress.add("momentum_offer");
    suppress.add("business_os_sort");
    suppress.add("chief_of_staff");
    suppress.add("decision_offer");
    suppress.add("day_designer");
    suppress.add("productivity_nudges");
    suppress.add("founder_growth_nudges");
  }

  if (load.score.level === "overloaded" || load.score.level === "heavy") {
    suppress.add("day_designer");
    suppress.add("opportunity_offer");
    suppress.add("business_os_sort");
    suppress.add("chief_of_staff");
  }

  if (
    activation.state === "frozen" ||
    activation.state === "stuck" ||
    context.input.activationOfferActive
  ) {
    suppress.add("opportunity_offer");
    suppress.add("business_os_sort");
    suppress.add("chief_of_staff");
    suppress.add("day_designer");
  }

  if (context.input.recognitionActive) {
    suppress.add("opportunity_offer");
    suppress.add("business_os_sort");
    suppress.add("chief_of_staff");
    suppress.add("decision_offer");
    suppress.add("environment_offer");
    suppress.add("business_nudges");
  }

  if (health.status === "overloaded" || load.score.level === "overloaded") {
    suppress.add("opportunity_offer");
    suppress.add("future_shari_offer");
    suppress.add("momentum_offer");
    suppress.add("business_os_sort");
    suppress.add("chief_of_staff");
    suppress.add("founder_growth_nudges");
  }

  if (context.input.userRequestedAction && winner) {
    suppress.delete(winner);
  }

  return [...suppress];
}

export function buildUserState(
  context: EcosystemSignalContext,
): UserEcosystemState {
  const text = context.input.text ?? "";
  const recovery = evaluateRecovery({ text, now: context.now });
  const health = evaluateUserHealth({ text, now: context.now });
  const load = evaluateCognitiveLoad({ recentText: text, now: context.now });
  const activation = evaluateActivation({ text, now: context.now });

  let healthLevel: EcosystemHealth = "healthy";
  if (
    recovery.recoveryLevel === "burnout_risk" ||
    health.status === "overloaded" ||
    load.score.level === "overloaded"
  ) {
    healthLevel = "strained";
  } else if (
    recovery.recoveryLevel === "depleted" ||
    health.status === "needs_support" ||
    load.score.level === "heavy"
  ) {
    healthLevel = "needs_support";
  } else if (
    activation.state === "stuck" ||
    activation.state === "frozen" ||
    health.status === "disengaging"
  ) {
    healthLevel = "watch";
  }

  return {
    health: healthLevel,
    summary: userSummary(healthLevel, recovery, load, activation),
    cognitiveLoadLevel: load.score.level,
    activationState: activation.state,
    recoveryLevel: recovery.recoveryLevel,
    userHealthStatus: health.status,
  };
}

export function buildFounderState(
  context: EcosystemSignalContext,
): FounderEcosystemState {
  const business = getBusinessOSStore().history.at(-1);
  const chief = getChiefStore().history.at(-1);

  let health: EcosystemHealth = "healthy";
  if (
    business?.businessHealth === "overloaded" ||
    chief?.overallAssessment === "critical"
  ) {
    health = "strained";
  } else if (
    business?.businessHealth === "needs_attention" ||
    (chief && ["overloaded", "stretched"].includes(chief.overallAssessment))
  ) {
    health = "needs_support";
  } else if (business && business.activeRisks.length > 0) {
    health = "watch";
  }

  return {
    health,
    summary: founderSummary(
      health,
      business?.businessHealth ?? "unknown",
      chief?.overallAssessment ?? "focused",
    ),
    businessHealth: business?.businessHealth ?? null,
    chiefAssessment: chief?.overallAssessment ?? null,
    topRisk: business?.activeRisks[0]?.label ?? chief?.biggestRisk ?? null,
    topOpportunity:
      business?.activeOpportunities[0]?.label ?? chief?.biggestOpportunity ?? null,
  };
}

export function buildEcosystemSnapshot(
  context: EcosystemSignalContext,
): EcosystemSnapshot {
  const top = pickTopSignal(context.signals);
  const suppressions = buildSuppressions(context, top);

  return {
    userState: buildUserState(context),
    founderState: buildFounderState(context),
    topSignal: top.priority,
    activeIntelligenceLayers: collectActiveLayers(context.signals),
    recommendedSurface: top.surface,
    priorityReason: top.reason,
    suppressions,
    suggestedTone: toneForPriority(top.priority),
    avoidGuidance: avoidForPriority(top.priority),
    createdAt: context.now.toISOString(),
  };
}

function userSummary(
  health: EcosystemHealth,
  recovery: ReturnType<typeof evaluateRecovery>,
  load: ReturnType<typeof evaluateCognitiveLoad>,
  activation: ReturnType<typeof evaluateActivation>,
): string {
  if (health === "strained") {
    return "User may need recovery and reduced load before any productivity framing.";
  }
  if (health === "needs_support") {
    return "Support-first — cognitive load or recovery needs attention.";
  }
  if (activation.state === "stuck" || activation.state === "frozen") {
    return "Activation support may help more than new tasks.";
  }
  return `Steady — load ${load.score.level}, activation ${activation.state}.`;
}

function founderSummary(
  health: EcosystemHealth,
  businessHealth: string,
  chiefAssessment: string,
): string {
  if (health === "strained") {
    return "Founder capacity strained — protect before growth.";
  }
  return `Business ${businessHealth}, chief assessment ${chiefAssessment}.`;
}

function toneForPriority(priority: EcosystemPriority): string {
  switch (priority) {
    case "safety_support":
    case "recovery_support":
      return "calm, short, supportive";
    case "cognitive_load_support":
      return "gentle, simplifying, no lists";
    case "activation_support":
      return "warm, tiny-step, no pressure";
    case "recognition_celebration":
      return "celebratory, brief, human";
    case "opportunity_explore":
    case "business_sort":
    case "chief_of_staff":
      return "curious, optional, never pushy";
    default:
      return "clear, calm, one thing at a time";
  }
}

function avoidForPriority(priority: EcosystemPriority): string[] {
  switch (priority) {
    case "recovery_support":
      return [
        "long plan",
        "productivity push",
        "new opportunities",
        "hustle framing",
      ];
    case "cognitive_load_support":
      return ["packed schedule", "multiple options", "business strategy"];
    case "activation_support":
      return ["opportunity cards", "new projects", "guilt"];
    case "recognition_celebration":
      return ["unrelated nudges", "business sorting", "to-do lists"];
    case "calm_presence":
      return ["proactive offers", "feature suggestions", "engagement bait"];
    default:
      return ["pressure", "fear-based urgency", "you're behind"];
  }
}

export function isSuppressed(
  snapshot: EcosystemSnapshot,
  suppression: EcosystemSuppression,
): boolean {
  return snapshot.suppressions.includes(suppression);
}

export function priorityLabel(priority: EcosystemPriority): string {
  return priority.replace(/_/g, " ");
}
