/**
 * Response Composer — structured strategy that guides generation and repair.
 * Does not write the final answer.
 */

import type { ShariResponseDecision } from "./types";
import type { ShariProfessionalRole } from "./professionalRoles";
import type { ResolvedShariContext } from "./contextResolver";
import type { ShariQuestionPolicy } from "./questionPolicy";
import type { ShariReasoningPlan } from "./reasoningPlan";
import type { ShariWisdomPlan } from "./wisdomPlan";

export type ShariOpeningApproach =
  | "direct_answer"
  | "reassure_then_answer"
  | "principle_then_steps"
  | "recommendation_then_reasoning"
  | "diagnosis_then_actions"
  | "reflection_then_question"
  | "comparison_then_conclusion"
  | "contextual_observation_then_guidance";

export type ShariPrimaryResponseShape =
  | "natural_paragraphs"
  | "step_by_step"
  | "consulting_recommendation"
  | "decision_brief"
  | "comparison"
  | "troubleshooting_sequence"
  | "coaching_exchange"
  | "lightweight_plan"
  | "creation_preview";

export type ResponseSectionPlan = {
  id: string;
  purpose: string;
  required: boolean;
};

export type ShariResponseComposition = {
  id: string;
  conversationId: string | null;
  openingApproach: ShariOpeningApproach;
  primaryResponseShape: ShariPrimaryResponseShape;
  answerSequence: ResponseSectionPlan[];
  insightRequirement: boolean;
  practicalExampleRequirement: boolean;
  commonMistakeRequirement: boolean;
  shortcutRequirement: boolean;
  personalizedApplicationRequirement: boolean;
  recommendationRequirement: boolean;
  contextToUseExplicitly: string[];
  contextToUseSilently: string[];
  assumptionsToState: string[];
  detailLevel:
    | "brief"
    | "standard"
    | "detailed"
    | "step_by_step"
    | "comprehensive";
  toneBalance: {
    warmth: number;
    directness: number;
    encouragement: number;
    authority: number;
    reflection: number;
  };
  cognitiveLoadLimits: {
    maxPrimarySections: number;
    maxUnprioritizedItems: number;
    oneQuestionMaximum: boolean;
    oneCapabilityOfferMaximum: boolean;
  };
  endingApproach:
    | "complete_without_offer"
    | "one_high_value_question"
    | "one_capability_offer"
    | "clear_recommendation"
    | "next_immediate_step";
  forbiddenPatterns: string[];
};

function detailFromDecision(
  decision: ShariResponseDecision,
): ShariResponseComposition["detailLevel"] {
  if (decision.answerDepth === "comprehensive") return "comprehensive";
  if (decision.answerDepth === "detailed") return "detailed";
  if (decision.answerDepth === "brief") return "brief";
  if (decision.answerStructure === "numbered_steps") return "step_by_step";
  return "standard";
}

function sectionsForRole(
  role: ShariProfessionalRole,
  decision: ShariResponseDecision,
): ResponseSectionPlan[] {
  switch (role) {
    case "teacher":
      return [
        { id: "outcome", purpose: "Name the outcome they will achieve", required: true },
        { id: "orient", purpose: "Orient the beginner briefly", required: true },
        { id: "steps", purpose: "Ordered steps with what each accomplishes", required: true },
        { id: "mistake", purpose: "One likely mistake to avoid", required: true },
        { id: "check", purpose: "Simple completion check", required: false },
      ];
    case "consultant":
      return [
        { id: "principle", purpose: "Most important principle for their situation", required: true },
        { id: "recommendation", purpose: "Tailored recommendation", required: true },
        { id: "why", purpose: "Why this fits known context", required: true },
        { id: "implementation", purpose: "Major implementation areas", required: true },
        { id: "gap", purpose: "Likely gap or common miss", required: false },
      ];
    case "advisor":
      return [
        { id: "factors", purpose: "What factors matter most", required: true },
        { id: "tradeoffs", purpose: "Tradeoffs with known facts", required: true },
        { id: "recommendation", purpose: "Conditional recommendation", required: true },
        { id: "basis", purpose: "Basis and what would change the conclusion", required: true },
      ];
    case "coach":
      return [
        { id: "reflect", purpose: "Accurate reflection that reduces pressure", required: true },
        { id: "narrow", purpose: "Reduce the field to what matters now", required: true },
        { id: "question", purpose: "One useful question", required: true },
      ];
    case "troubleshooter":
      return [
        { id: "categories", purpose: "Likely problem categories", required: true },
        { id: "checks", purpose: "Ordered checks fastest-first", required: true },
        { id: "expected", purpose: "Expected results per check", required: true },
      ];
    case "creative_collaborator":
      return [
        { id: "direction", purpose: "Creative direction", required: true },
        { id: "draft", purpose: "Concrete draft or options", required: true },
        { id: "next", purpose: "One refinement path", required: false },
      ];
    case "planner":
    case "execution_partner":
      return [
        { id: "priority", purpose: "What to do first", required: true },
        { id: "sequence", purpose: "Lightweight sequence", required: true },
        { id: "next", purpose: "Immediate next step", required: true },
      ];
    default:
      if (decision.primaryHelpMode === "comparison") {
        return [
          { id: "criteria", purpose: "Comparison criteria", required: true },
          { id: "tradeoffs", purpose: "Tradeoffs", required: true },
          { id: "conclusion", purpose: "When each fits + lean", required: true },
        ];
      }
      return [
        { id: "answer", purpose: "Direct useful answer", required: true },
        { id: "next", purpose: "One next move", required: false },
      ];
  }
}

/**
 * Compose the response strategy for this turn.
 */
export function composeShariResponseStrategy(input: {
  decision: ShariResponseDecision;
  primaryRole: ShariProfessionalRole;
  context: ResolvedShariContext;
  questionPolicy: ShariQuestionPolicy;
  reasoningPlan: ShariReasoningPlan;
  wisdom: ShariWisdomPlan;
  conversationId?: string | null;
  isFollowUp?: boolean;
}): ShariResponseComposition {
  const { decision, primaryRole, context, questionPolicy, wisdom } = input;
  const t = decision.rawRequest.toLowerCase();

  let openingApproach: ShariOpeningApproach = "direct_answer";
  let primaryResponseShape: ShariPrimaryResponseShape = "natural_paragraphs";

  if (primaryRole === "teacher") {
    openingApproach = "principle_then_steps";
    primaryResponseShape = "step_by_step";
  } else if (primaryRole === "consultant") {
    openingApproach = context.knownContextAvailable
      ? "contextual_observation_then_guidance"
      : "principle_then_steps";
    primaryResponseShape = "consulting_recommendation";
  } else if (primaryRole === "advisor") {
    openingApproach = "recommendation_then_reasoning";
    primaryResponseShape = "decision_brief";
  } else if (primaryRole === "coach") {
    openingApproach = "reflection_then_question";
    primaryResponseShape = "coaching_exchange";
  } else if (primaryRole === "troubleshooter") {
    openingApproach = "diagnosis_then_actions";
    primaryResponseShape = "troubleshooting_sequence";
  } else if (decision.primaryHelpMode === "comparison") {
    openingApproach = "comparison_then_conclusion";
    primaryResponseShape = "comparison";
  } else if (decision.primaryHelpMode === "simple_planning") {
    openingApproach = "reassure_then_answer";
    primaryResponseShape = "lightweight_plan";
  } else if (
    decision.primaryHelpMode === "simple_creation" ||
    decision.primaryHelpMode === "formal_creation"
  ) {
    openingApproach = "direct_answer";
    primaryResponseShape = "creation_preview";
  }

  if (input.isFollowUp) {
    openingApproach = "contextual_observation_then_guidance";
  }

  const personalizedApplicationRequirement =
    context.knownContextAvailable &&
    (primaryRole === "consultant" ||
      primaryRole === "advisor" ||
      /\b(?:booth|vendor|craft|business|webinar|podcast)\b/.test(t));

  const insightRequirement =
    primaryRole === "consultant" ||
    primaryRole === "advisor" ||
    primaryRole === "teacher" ||
    wisdom.highestLeverageInsight != null;

  const commonMistakeRequirement =
    primaryRole === "teacher" ||
    primaryRole === "consultant" ||
    primaryRole === "troubleshooter";

  const recommendationRequirement =
    primaryRole === "advisor" ||
    primaryRole === "consultant" ||
    decision.primaryHelpMode === "advice" ||
    decision.primaryHelpMode === "comparison";

  const practicalExampleRequirement =
    primaryRole === "teacher" ||
    primaryRole === "consultant" ||
    personalizedApplicationRequirement;

  const shortcutRequirement =
    primaryRole === "teacher" || primaryRole === "troubleshooter";

  const explicitKeys = context.relevantContextKeys
    .filter((k) =>
      /sell|offer|product|peopleIHelp|businessName|priority/i.test(k),
    )
    .slice(0, 6);
  const silentKeys = context.relevantContextKeys
    .filter((k) => !explicitKeys.includes(k))
    .slice(0, 6);

  let endingApproach: ShariResponseComposition["endingApproach"] =
    "next_immediate_step";
  if (primaryRole === "coach") endingApproach = "one_high_value_question";
  else if (primaryRole === "advisor") endingApproach = "clear_recommendation";
  else if (
    decision.optionalCapabilityOffer !== "none" &&
    questionPolicy.questionAllowedAfterAnswer
  ) {
    endingApproach = questionPolicy.bestFollowUpQuestion
      ? "one_high_value_question"
      : "one_capability_offer";
  } else if (!questionPolicy.bestFollowUpQuestion) {
    endingApproach = "complete_without_offer";
  } else {
    endingApproach = "one_high_value_question";
  }

  const toneBalance = {
    warmth: primaryRole === "coach" || primaryRole === "encourager" ? 0.85 : 0.65,
    directness: primaryRole === "coach" ? 0.45 : 0.8,
    encouragement: primaryRole === "encourager" || primaryRole === "coach" ? 0.75 : 0.45,
    authority:
      primaryRole === "advisor" || primaryRole === "consultant" ? 0.75 : 0.55,
    reflection: primaryRole === "coach" ? 0.85 : 0.25,
  };

  return {
    id: `compose-${decision.id}`,
    conversationId: input.conversationId ?? null,
    openingApproach,
    primaryResponseShape,
    answerSequence: sectionsForRole(primaryRole, decision),
    insightRequirement,
    practicalExampleRequirement,
    commonMistakeRequirement,
    shortcutRequirement,
    personalizedApplicationRequirement,
    recommendationRequirement,
    contextToUseExplicitly: explicitKeys,
    contextToUseSilently: silentKeys,
    assumptionsToState: [
      ...context.assumptions,
      ...wisdom.uncertainty.slice(0, 2),
    ].slice(0, 4),
    detailLevel: detailFromDecision(decision),
    toneBalance,
    cognitiveLoadLimits: {
      maxPrimarySections: primaryRole === "coach" ? 3 : 6,
      maxUnprioritizedItems: 5,
      oneQuestionMaximum: true,
      oneCapabilityOfferMaximum: true,
    },
    endingApproach,
    forbiddenPatterns: [
      "That's a great question",
      "Did I hear that right?",
      "Which area would you like to explore?",
      "What feels hardest?" /* when instruction requested */,
      "You mentioned wanting to…",
      "I'd love to help you create this" /* as opener */,
      "destination / room menus before substance",
      "generic category list without recommendation",
      "asking for known products or audience",
    ],
  };
}

export function responseCompositionHintForChat(
  composition: ShariResponseComposition,
  wisdom: ShariWisdomPlan,
): string {
  const requiredBits = [
    composition.insightRequirement && "one practical insight or principle",
    composition.practicalExampleRequirement && "one concrete example",
    composition.commonMistakeRequirement && "one common mistake",
    composition.shortcutRequirement && "one shortcut or rule of thumb when natural",
    composition.personalizedApplicationRequirement &&
      "apply known context so the advice changes (not name-drop only)",
    composition.recommendationRequirement && "a clear recommendation or lean",
  ].filter(Boolean);

  return [
    "RESPONSE COMPOSITION (mandatory — do not expose this structure):",
    `Opening: ${composition.openingApproach}. Begin with value — never with echo, profiling, or category menus.`,
    `Shape: ${composition.primaryResponseShape}. Detail: ${composition.detailLevel}.`,
    `Sequence: ${composition.answerSequence.map((s) => s.purpose).join(" → ")}`,
    requiredBits.length
      ? `Include: ${requiredBits.join("; ")}.`
      : "Include enough substance to act today.",
    wisdom.highestLeverageInsight
      ? `Highest-leverage insight to weave in: ${wisdom.highestLeverageInsight}`
      : "",
    wisdom.keyJudgment ? `Key judgment: ${wisdom.keyJudgment}` : "",
    wisdom.likelyMistakes[0]
      ? `Likely mistake to name: ${wisdom.likelyMistakes[0]}`
      : "",
    wisdom.practicalShortcuts[0]
      ? `Useful shortcut: ${wisdom.practicalShortcuts[0]}`
      : "",
    wisdom.personalizedImplications[0]
      ? `Personalized implication: ${wisdom.personalizedImplications[0]}`
      : "",
    composition.contextToUseExplicitly.length
      ? `Use explicitly when it improves advice: ${composition.contextToUseExplicitly.join(", ")}`
      : "",
    composition.assumptionsToState.length
      ? `State assumptions naturally: ${composition.assumptionsToState.join(" ")}`
      : "",
    `Cognitive load: ≤${composition.cognitiveLoadLimits.maxPrimarySections} primary sections; prioritize; no unranked dumps.`,
    `Ending: ${composition.endingApproach}. At most one question and one capability offer.`,
    `Forbidden: ${composition.forbiddenPatterns.slice(0, 6).join(" · ")}`,
    "Tone: warm, calm, practical, experienced — encouragement supplements substance, never replaces it.",
  ]
    .filter(Boolean)
    .join("\n");
}
