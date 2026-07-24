/**
 * Canonical Shari Cognitive Pipeline — one shared path for ordinary chat.
 * Extends answer-first; does not create a parallel engine.
 *
 * Phase 2 adds: wisdom plan → response composition → delight-ready hints.
 */

import { decideShariResponse } from "./decideShariResponse";
import {
  selectProfessionalRoles,
  roleInstructionForChat,
  type ShariProfessionalRole,
} from "./professionalRoles";
import {
  resolveRelevantUserContext,
  type ResolvedShariContext,
} from "./contextResolver";
import {
  evaluateQuestionPolicy,
  type ShariQuestionPolicy,
} from "./questionPolicy";
import {
  buildReasoningPlan,
  reasoningPlanHintForChat,
  type ShariReasoningPlan,
} from "./reasoningPlan";
import { buildShariWisdomPlan, type ShariWisdomPlan } from "./wisdomPlan";
import {
  composeShariResponseStrategy,
  responseCompositionHintForChat,
  type ShariResponseComposition,
} from "./responseComposer";
import {
  peekShariConversationThread,
  isShariConversationFollowUp,
  shariContinuityHintForChat,
  type ShariConversationThread,
} from "./conversationContinuity";
import { shariAnswerFirstHintForChat } from "./chatHint";
import { trackShariAnswerFirstEvent } from "./observability";
import type { ShariCognitiveDecision, ShariResponseDecision } from "./types";

export type ShariCognitiveTurn = {
  decision: ShariResponseDecision;
  cognitive: ShariCognitiveDecision;
  context: ResolvedShariContext;
  primaryProfessionalRole: ShariProfessionalRole;
  supportingProfessionalRoles: ShariProfessionalRole[];
  questionPolicy: ShariQuestionPolicy;
  reasoningPlan: ShariReasoningPlan;
  wisdom: ShariWisdomPlan;
  composition: ShariResponseComposition;
  thread: ShariConversationThread | null;
  isFollowUp: boolean;
  /** Combined system hints for companion-chat */
  promptHints: string;
};

export function buildShariCognitiveDecision(input: {
  decision: ShariResponseDecision;
  context: ResolvedShariContext;
  primaryProfessionalRole: ShariProfessionalRole;
  supportingProfessionalRoles: ShariProfessionalRole[];
  questionPolicy: ShariQuestionPolicy;
  reasoningPlan: ShariReasoningPlan;
  conversationId?: string | null;
}): ShariCognitiveDecision {
  const { decision, context, questionPolicy, reasoningPlan } = input;
  return {
    ...decision,
    conversationId: input.conversationId ?? null,
    userGoal: reasoningPlan.userGoal,
    immediateNeed: decision.primaryHelpMode,
    primaryProfessionalRole: input.primaryProfessionalRole,
    supportingProfessionalRoles: input.supportingProfessionalRoles,
    essentialClarificationRequired: questionPolicy.essentialClarificationRequired,
    knownContextAvailable: context.knownContextAvailable,
    relevantContextKeys: context.relevantContextKeys,
    contextConfidence: context.contextConfidence,
    staleContextKeys: context.staleContextKeys,
    assumptionsAllowed: true,
    assumptions: [
      ...context.assumptions,
      ...reasoningPlan.assumptions.filter(
        (a) => !context.assumptions.includes(a),
      ),
    ],
    answerBeforeQuestionRequired: questionPolicy.answerBeforeQuestionRequired,
    bestFollowUpQuestion: questionPolicy.bestFollowUpQuestion,
    reasoningPlanSummary: reasoningPlan.answerShape,
  };
}

/**
 * Run the shared cognitive pipeline for one user turn.
 */
export function runShariCognitivePipeline(
  rawRequest: string,
  options?: {
    conversationId?: string | null;
    thread?: ShariConversationThread | null;
  },
): ShariCognitiveTurn {
  const decision = decideShariResponse(rawRequest);
  const thread =
    options?.thread !== undefined
      ? options.thread
      : peekShariConversationThread();
  const isFollowUp = isShariConversationFollowUp(rawRequest, thread);

  const roles = selectProfessionalRoles(
    decision.primaryHelpMode,
    rawRequest,
  );
  const primaryProfessionalRole =
    isFollowUp && thread?.primaryProfessionalRole
      ? thread.primaryProfessionalRole
      : roles.primaryProfessionalRole;
  const supportingProfessionalRoles =
    isFollowUp && thread?.supportingProfessionalRoles?.length
      ? thread.supportingProfessionalRoles
      : roles.supportingProfessionalRoles;

  const context = resolveRelevantUserContext({
    request: rawRequest,
    helpMode: decision.primaryHelpMode,
    professionalRole: primaryProfessionalRole,
  });

  if (thread?.corrections?.length) {
    for (const c of thread.corrections.slice(-4)) {
      context.assumptions.push(`Member correction: ${c}`);
    }
  }

  const questionPolicy = evaluateQuestionPolicy({
    rawRequest,
    primaryHelpMode: decision.primaryHelpMode,
    context,
    consequentialDecision: decision.consequentialDecision,
    currentResearchRequired: decision.currentResearchRequired,
  });

  const reasoningPlan = buildReasoningPlan({
    decision,
    primaryRole: primaryProfessionalRole,
    context,
    questionPolicy,
  });

  const wisdom = buildShariWisdomPlan({
    decision,
    primaryRole: primaryProfessionalRole,
    context,
    reasoningPlan,
    thread,
  });

  const composition = composeShariResponseStrategy({
    decision,
    primaryRole: primaryProfessionalRole,
    context,
    questionPolicy,
    reasoningPlan,
    wisdom,
    conversationId: options?.conversationId,
    isFollowUp,
  });

  const cognitive = buildShariCognitiveDecision({
    decision,
    context,
    primaryProfessionalRole,
    supportingProfessionalRoles,
    questionPolicy,
    reasoningPlan,
    conversationId: options?.conversationId,
  });

  trackShariAnswerFirstEvent("cognitive_decision", {
    mode: decision.primaryHelpMode,
    role: primaryProfessionalRole,
    knownContext: context.knownContextAvailable,
    contextKeys: context.relevantContextKeys.length,
    followUp: isFollowUp,
    answerBeforeQuestion: questionPolicy.answerBeforeQuestionRequired,
  });
  trackShariAnswerFirstEvent("professional_role_selected", {
    role: primaryProfessionalRole,
    support: supportingProfessionalRoles.join(",") || "none",
  });
  trackShariAnswerFirstEvent("wisdom_plan_created", {
    role: primaryProfessionalRole,
    confidence: Number(wisdom.confidence.toFixed(2)),
    hasInsight: Boolean(wisdom.highestLeverageInsight),
  });
  trackShariAnswerFirstEvent("response_composition_created", {
    opening: composition.openingApproach,
    shape: composition.primaryResponseShape,
    ending: composition.endingApproach,
  });
  if (composition.insightRequirement || composition.commonMistakeRequirement) {
    trackShariAnswerFirstEvent("practical_value_element_selected", {
      insight: composition.insightRequirement,
      mistake: composition.commonMistakeRequirement,
      personalized: composition.personalizedApplicationRequirement,
    });
  }
  if (context.knownContextAvailable) {
    trackShariAnswerFirstEvent("relevant_context_retrieved", {
      count: context.relevantContextKeys.length,
      confidence: Number(context.contextConfidence.toFixed(2)),
    });
  }

  const promptHints = [
    shariAnswerFirstHintForChat(decision),
    shariContinuityHintForChat(rawRequest, thread),
    roleInstructionForChat(
      primaryProfessionalRole,
      supportingProfessionalRoles,
    ),
    context.promptBlock,
    reasoningPlanHintForChat(reasoningPlan),
    responseCompositionHintForChat(composition, wisdom),
    questionPolicy.answerBeforeQuestionRequired
      ? [
          "QUESTION POLICY:",
          "Provide ~70–80% of useful guidance before any question.",
          "Do not ask for facts Spark already knows.",
          questionPolicy.bestFollowUpQuestion
            ? `At most one high-leverage follow-up after substance: "${questionPolicy.bestFollowUpQuestion}"`
            : "A soft capability offer is enough; a question is optional.",
        ].join("\n")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    decision,
    cognitive,
    context,
    primaryProfessionalRole,
    supportingProfessionalRoles,
    questionPolicy,
    reasoningPlan,
    wisdom,
    composition,
    thread,
    isFollowUp,
    promptHints,
  };
}
