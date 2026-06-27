/**
 * Situation Atlas Decision — surface vs actual situation for business decisions.
 */

import type { ChatTurn } from "../companionIntelligence";
import { resolveSituation } from "../adhdEntrepreneurSituationAtlas";
import type {
  BusinessDecisionType,
  DecisionRiskLevel,
  EcosystemResourceId,
  SituationAtlasDecision,
} from "./types";

const PRODUCT_EXPANSION_RE =
  /\b(?:new product(?:\s+line)?|add(?:ing)? (?:a )?(?:new )?(?:product|offer|service|line)|second (?:product|offer)|expand(?:ing)? (?:my )?(?:product|offer|line)|group program|keep (?:both|current)|replace (?:my )?(?:current|existing))\b/i;

const PRODUCT_CHOICE_RE =
  /\b(?:which (?:product|offer)|pick (?:a )?(?:product|offer)|product a or b)\b/i;

function inferDecisionType(messages: ChatTurn[], userText: string): BusinessDecisionType {
  const thread = messages.map((m) => m.content).join("\n") + "\n" + userText;
  if (PRODUCT_EXPANSION_RE.test(thread)) return "business_expansion";
  if (PRODUCT_CHOICE_RE.test(thread)) return "product_choice";
  if (/\b(?:price|pricing)\b/i.test(thread)) return "pricing";
  if (/\bhir(?:e|ing)\b/i.test(thread)) return "hiring";
  if (/\b(?:strategy|positioning|niche)\b/i.test(thread)) return "strategy";
  if (/\b(?:prioriti[sz]e|too many|which first)\b/i.test(thread)) return "prioritization";
  return "general";
}

function inferRiskLevel(messages: ChatTurn[], userText: string): DecisionRiskLevel {
  const thread = messages.map((m) => m.content).join("\n") + "\n" + userText;
  if (
    /\b(?:worried|afraid|lose (?:clients|customers|revenue)|devalue|risk|revenue implications|market validation)\b/i.test(
      thread,
    )
  ) {
    return "high";
  }
  if (/\b(?:not sure|uncertain|pricing|customer)\b/i.test(thread)) return "medium";
  return "low";
}

function describeActualSituation(
  decisionType: BusinessDecisionType,
  surface: string,
): string {
  switch (decisionType) {
    case "business_expansion":
      return "Business expansion decision — weighing keep current, replace, or offer both with customer, pricing, and revenue implications.";
    case "product_choice":
      return "Product or offer selection — choosing between defined options.";
    case "pricing":
      return "Pricing decision with revenue and positioning impact.";
    case "hiring":
      return "Hiring or delegation decision with capacity and cost tradeoffs.";
    case "strategy":
      return "Strategic direction decision — positioning, niche, or growth path.";
    case "prioritization":
      return "Prioritization decision — what to focus on first.";
    default:
      return surface.length > 120 ? `${surface.slice(0, 117)}…` : surface;
  }
}

function resourcesForDecisionType(
  decisionType: BusinessDecisionType,
): EcosystemResourceId[] {
  switch (decisionType) {
    case "business_expansion":
      return ["decision_compass", "business_canvas", "conversation", "board_expertise"];
    case "product_choice":
    case "pricing":
      return ["decision_compass", "conversation", "strategy"];
    case "hiring":
      return ["decision_compass", "conversation", "board_expertise"];
    case "strategy":
      return ["strategy", "business_canvas", "decision_compass", "conversation"];
    case "prioritization":
      return ["clear_my_mind", "plan_my_day", "decision_compass", "conversation"];
    default:
      return ["conversation", "decision_compass"];
  }
}

export function resolveSituationAtlasDecision(input: {
  messages: ChatTurn[];
  userText: string;
  emotionalState?: "unclear" | "stuck" | "overwhelmed" | "emotional" | "focused" | "building";
}): SituationAtlasDecision {
  const surfaceQuestion = input.userText.trim();
  const atlas = resolveSituation({
    messages: input.messages,
    userText: input.userText,
  });

  const decisionType = inferDecisionType(input.messages, input.userText);
  const riskLevel = inferRiskLevel(input.messages, input.userText);
  const actualSituation = describeActualSituation(decisionType, surfaceQuestion);

  const ecosystemResources =
    decisionType === "business_expansion"
      ? resourcesForDecisionType(decisionType)
      : atlas.matched && atlas.primary
        ? (atlas.primary.entry.recommendedInterventions
            .filter((i) => i !== "conversation")
            .map((i) => i as EcosystemResourceId))
        : resourcesForDecisionType(decisionType);

  return {
    surfaceQuestion,
    actualSituation,
    decisionType,
    riskLevel,
    situationId:
      decisionType === "business_expansion"
        ? "product-expansion-uncertainty"
        : atlas.situationId,
    situationName:
      decisionType === "business_expansion"
        ? "Product Expansion Uncertainty"
        : atlas.situationName,
    ecosystemResources: ecosystemResources.length
      ? ecosystemResources
      : resourcesForDecisionType(decisionType),
  };
}
