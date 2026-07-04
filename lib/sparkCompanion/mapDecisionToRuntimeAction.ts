/**
 * Decision Engine → runtime action (single source of truth for routing behavior).
 */

import { evaluateFrictionFirst } from "./frictionFirst";
import { evaluateEmotionalFirstActionSecond } from "./emotionalFirstActionSecond";
import { evaluateSparkSelfClarity } from "./sparkEstateSelfClarity/evaluateSelfClarity";
import { evaluateSparkWelcomeHome } from "./sparkEstateWelcomeHome/evaluateWelcomeHome";
import { evaluateSparkEstateFriend } from "./sparkEstateFriend/evaluateFriend";
import { FRICTION_RESPONSES } from "./sparkDecisionEngine/friction";
import { evaluateSparkDecisionEngine } from "./sparkDecisionEngine/evaluateDecisionEngine";
import { SPARK_LANDSCAPES } from "./sparkLandscapes/landscapes";
import {
  canonicalRoleInstruction,
  mapStyleRoleToCanonicalRole,
} from "./canonicalRole";
import type {
  MapDecisionToRuntimeActionInput,
  SparkConversationDepth,
  SparkRuntimeAction,
  SparkRuntimeMode,
} from "./types";

function resolveRuntimeMode(input: {
  intent: SparkRuntimeAction["primaryIntent"];
  friction: SparkRuntimeAction["decision"]["friction"];
  suppressEmotionalCoaching: boolean;
  pendingNavigationChoices?: boolean;
  pendingConciergeChoices?: boolean;
}): SparkRuntimeMode {
  if (input.pendingNavigationChoices) return "ask_clarify";
  if (input.pendingConciergeChoices) return "ask_clarify";

  switch (input.intent) {
    case "CREATE":
      return "build";
    case "LEARN":
      return "teach";
    case "EXPLORE":
      return "explore";
    case "SUPPORT":
      return input.friction === "emotional_weight" || input.friction === "capacity"
        ? "support"
        : "friction_menu";
    case "THINK":
      if (
        input.friction === "clarity" ||
        input.friction === "prioritization" ||
        input.friction === "confidence"
      ) {
        return "ask_clarify";
      }
      return "stay_chat";
    default:
      return "stay_chat";
  }
}

function resolveDepth(
  decision: SparkRuntimeAction["decision"],
  userText: string,
): SparkConversationDepth {
  const emotional = evaluateEmotionalFirstActionSecond({ userText });
  if (decision.suppressEmotionalCoaching) return "task_first";
  if (decision.intent === "SUPPORT") return "emotional_first";
  if (emotional.depth === "emotional_first") return "emotional_first";
  return "balanced";
}

function pickConstitutionSnippet(input: MapDecisionToRuntimeActionInput): string | null {
  const text = input.userText.trim();
  if (!text) return null;

  if (input.isReturning) {
    const welcome = evaluateSparkWelcomeHome({ userText: text, isReturning: true });
    if (welcome.isReturnMoment) {
      return "Welcome Home: I'm really glad you're here — no streaks, no guilt, no day-count.";
    }
  }

  const clarity = evaluateSparkSelfClarity({ userText: text, overwhelmed: input.overwhelmed });
  if (
    clarity.useCuriosityFirst ||
    clarity.signals.includes("discouraged_historian") ||
    clarity.signals.includes("identity_statement")
  ) {
    return "Self-clarity: evidence over empty praise — curiosity over identity labels.";
  }

  const friend = evaluateSparkEstateFriend({
    userText: text,
    overwhelmed: input.overwhelmed,
  });
  if (
    friend.deferAdvice ||
    friend.signals.includes("acceptance_before_advice") ||
    friend.signals.includes("inner_critic_challenge")
  ) {
    return "Friend: accept before advise — dignity always.";
  }

  return null;
}

function buildOperationalHint(
  decision: SparkRuntimeAction["decision"],
  canonicalRole: SparkRuntimeAction["canonicalRole"],
  runtimeMode: SparkRuntimeMode,
  depth: SparkConversationDepth,
  constitutionSnippet: string | null,
): string {
  const landscape = SPARK_LANDSCAPES[decision.landscape.primary];
  const frictionGuide = FRICTION_RESPONSES[decision.friction];
  const parts = [
    `Intent ${decision.intent} (${decision.intentConfidence}) · Role ${canonicalRole} · Mode ${runtimeMode}`,
    `Friction ${decision.friction}: ${frictionGuide.response}`,
    `Landscape ${landscape.name} — ${landscape.helpFocus}`,
    `Depth ${depth} · ${canonicalRoleInstruction(canonicalRole)}`,
  ];

  if (decision.suppressEmotionalCoaching) {
    parts.push("NO emotional coaching interruption this turn.");
  }

  if (decision.estateRoute) {
    parts.push(
      `Optional estate invite only: ${decision.estateRoute.placeId} — ${decision.estateRoute.reason}`,
    );
  } else {
    parts.push("Stay in conversation unless member asks to move.");
  }

  if (constitutionSnippet) {
    parts.push(constitutionSnippet);
  }

  if (decision.targetOutcomes.length) {
    parts.push(`Leave better: ${decision.targetOutcomes.slice(0, 3).join(", ")}`);
  }

  return parts.join(" · ");
}

export function mapDecisionToRuntimeAction(
  input: MapDecisionToRuntimeActionInput,
): SparkRuntimeAction {
  const decision =
    input.decision ??
    evaluateSparkDecisionEngine({
      userText: input.userText,
      overwhelmed: input.overwhelmed,
      momentumActive: input.momentumActive,
      placeId: input.placeId ?? input.currentRoom,
      trustEstablished: input.trustEstablished,
    });

  const canonicalRole = mapStyleRoleToCanonicalRole(
    decision.companionRole,
    decision.intent,
  );

  const suppressEmotionalCoaching =
    decision.suppressEmotionalCoaching ||
    canonicalRole === "BUILD" ||
    (canonicalRole === "TEACH" && decision.intentConfidence === "high");

  const suppressTaskLayer =
    canonicalRole === "SUPPORT" ||
    canonicalRole === "LISTEN" ||
    decision.intent === "SUPPORT";

  const suppressDiscoveryAutoRoute =
    decision.intent === "EXPLORE" || decision.intent === "LEARN";

  const frictionActive = evaluateFrictionFirst(input.userText).active;
  const allowFrictionFirst =
    frictionActive && !suppressEmotionalCoaching;

  const runtimeMode = resolveRuntimeMode({
    intent: decision.intent,
    friction: decision.friction,
    suppressEmotionalCoaching,
    pendingNavigationChoices: input.pendingNavigationChoices,
    pendingConciergeChoices: input.pendingConciergeChoices,
  });

  const depth = resolveDepth(decision, input.userText);
  const constitutionSnippet = pickConstitutionSnippet(input);

  const operationalHint = buildOperationalHint(
    decision,
    canonicalRole,
    runtimeMode,
    depth,
    constitutionSnippet,
  );

  return {
    decision,
    canonicalRole,
    primaryIntent: decision.intent,
    runtimeMode,
    depth,
    suppressEmotionalCoaching,
    suppressTaskLayer,
    suppressDiscoveryAutoRoute,
    allowFrictionFirst,
    constitutionSnippet,
    operationalHint,
  };
}
