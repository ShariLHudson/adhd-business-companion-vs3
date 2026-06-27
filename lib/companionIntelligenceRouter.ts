/**
 * Companion Intelligence — unified turn router.
 *
 * Intelligence hierarchy (Sprint 4):
 * 1. ADHD Entrepreneur Intelligence (primary lens)
 * 2. Adaptive User Intelligence
 * 3. Board of Directors (advisory)
 * 4. Feature Intelligence
 * 5. Outcome Intelligence
 * Plus: conversation continuity, workflow tracking, state detection, routing.
 */

import type { EmotionalObstacle, EmotionalState } from "./companionEmotions";
import type { AppSection } from "./companionUi";
import {
  resolveCompanionIntelligence,
  resolveConversationIntelligence,
  type CompanionOrchestration,
  type ConversationIntelligenceVerdict,
} from "./companionConstitution";
import {
  buildCompanionIntelligence,
  intelligenceHintForChat,
  type ChatTurn,
  type CompanionIntelligence,
} from "./companionIntelligence";
import {
  isBusinessAdviceRequest,
  primaryBusinessAdviceDomain,
} from "./businessAdviceIntent";
import {
  businessIntelligenceConfidenceHintForChat,
  type BusinessIntelligenceConfidence,
} from "./businessIntelligenceConfidence";
import { loadBusinessIntelligenceConfidence } from "./businessIntelligenceConfidenceClient";
import {
  buildBusinessConfidenceOffer,
  type BusinessConfidenceOffer,
} from "./businessIntelligenceConfidenceOffer";
import {
  createConversationWorkflow,
  resolveConversationWorkflowAcceptance,
  resolveWorkflowFromLastAssistant,
  type ConversationWorkflow,
  type WorkflowContinuationResult,
} from "./conversationWorkflowContinuation";
import {
  isAcceptanceAttempt,
  resolvePendingAcceptance,
  type ResolvePendingAcceptanceInput,
  type ResolvePendingAcceptanceResult,
} from "./pendingAcceptanceAuthority";
import type { PendingAction } from "./pendingAction";
import type { OutcomeThread } from "./companionOutcomeThread";
import {
  adhdNativeHintForChat,
  analyzeAdhdNativeTurn,
  type AdhdNativeAnalysis,
} from "./adhdNativeIntelligence";
import {
  adhdEntrepreneurPrimaryHintForChat,
  analyzeAdhdEntrepreneurTurn,
  type AdhdEntrepreneurAnalysis,
} from "./adhdEntrepreneurIntelligence";
import { adaptiveUserIntelligenceSprint5HintForChat } from "./companionAdaptiveUserEngine";
import {
  actionBiasHintForChat,
  analyzeActionBias,
  discoveryOverrideForActionBias,
  type ActionBiasAnalysis,
} from "./companionActionBias";
import {
  analyzeIntuitiveAwareness,
  intuitiveAwarenessHintForChat,
  type IntuitiveAwarenessAnalysis,
} from "./companionIntuitiveAwareness";
import {
  buildSprint5Intelligence,
  type Sprint5IntelligenceBundle,
} from "./companionSprint5Intelligence";
import { resolveWorkspaceAdvisorRole } from "./workspaceContextLock";
import { capabilityRoutingHintForChat } from "./companionCapabilityRegistry";
import { strategyIntelligenceHintForChat } from "./strategyIntelligence";
import { interventionLearningHintForChat } from "./companionInterventionLearning";
import { effectivenessHintForChat } from "./companionEffectiveness";
import { mistakeRecoveryHintForChat } from "./companionMistakeRecovery";
import type { WorkspaceOffer } from "./workspaceMode";
import {
  buildCompanionDecisionIntelligence,
  companionDecisionIntelligenceHintForChat,
  type CompanionDecisionIntelligence,
} from "./companionDecisionIntelligence";
import {
  createConversationCommitment,
  resolveConversationCommitment,
  type CommitmentResolution,
  type PendingConversationCommitment,
} from "./conversationCommitmentEngine";

export type UserStateSnapshot = {
  emotionalState: EmotionalState;
  obstacle: EmotionalObstacle | null;
  somatic: boolean;
};

export type CompanionTurnIntelligence = {
  userState: UserStateSnapshot;
  intelligence: CompanionIntelligence;
  /** Constitutional conductor — sole orchestration authority for active intelligences */
  conversation: ConversationIntelligenceVerdict;
  orchestration: CompanionOrchestration;
  intelligenceHint?: string;
  sprint5?: Sprint5IntelligenceBundle;
  actionBias?: ActionBiasAnalysis;
  actionBiasHint?: string;
  intuitiveAwareness?: IntuitiveAwarenessAnalysis;
  intuitiveAwarenessHint?: string;
  adhdNative?: AdhdNativeAnalysis;
  adhdNativeHint?: string;
  adhdEntrepreneur?: AdhdEntrepreneurAnalysis;
  adhdEntrepreneurHint?: string;
  adaptiveUserHint?: string | null;
  businessConfidence?: BusinessIntelligenceConfidence;
  businessConfidenceHint?: string;
  businessAdviceGate?: BusinessConfidenceOffer | null;
  decisionIntelligence?: CompanionDecisionIntelligence;
  decisionIntelligenceHint?: string;
};

export type CompanionAcceptanceResolution =
  | { kind: "commitment"; resolution: CommitmentResolution }
  | { kind: "workflow"; continuation: WorkflowContinuationResult }
  | { kind: "pending"; result: ResolvePendingAcceptanceResult }
  | { kind: "none" };

/** Bundle state + advisor routing + optional business-awareness hints for the API. */
export function buildCompanionTurnIntelligence(input: {
  messages: ChatTurn[];
  userText: string;
  lastAssistantText: string;
  userState: UserStateSnapshot;
  workspaceOpen: boolean;
  activeSection?: AppSection | null;
  checkBusinessAdvice?: boolean;
  hasEcosystemFeatureMatch?: boolean;
  boardDomain?: ReturnType<typeof resolveWorkspaceAdvisorRole>;
  outcomeThread?: OutcomeThread | null;
}): CompanionTurnIntelligence {
  const conversation = resolveConversationIntelligence({
    activeSection: input.activeSection ?? undefined,
    workspaceBesideChat: input.workspaceOpen,
    messageCount: input.messages.length,
    userText: input.userText,
  });

  const orchestration = resolveCompanionIntelligence({
    conversation,
    emotionalState: input.userState.emotionalState,
    overwhelmed: input.userState.emotionalState === "overwhelmed",
    userText: input.userText,
    activeSection: input.activeSection ?? undefined,
    workspaceId: undefined,
  });

  const intelligence = buildCompanionIntelligence({
    messages: input.messages,
    text: input.userText,
    lastAssistantText: input.lastAssistantText,
    state: input.userState.emotionalState,
    obstacle: input.userState.obstacle,
    somatic: input.userState.somatic,
    askingHow: false,
    workspaceOpen: input.workspaceOpen,
  });

  const adhdNative = analyzeAdhdNativeTurn({
    text: input.userText,
    messages: input.messages,
    emotionalState: input.userState.emotionalState,
    obstacle: input.userState.obstacle,
    discoveryPhase: intelligence.discoveryPhase,
    shouldDeferTools: intelligence.shouldDeferTools,
    hasEcosystemFeatureMatch: input.hasEcosystemFeatureMatch ?? false,
  });
  const adhdNativeHint = adhdNativeHintForChat(adhdNative);

  const boardDomain =
    input.boardDomain ??
    resolveWorkspaceAdvisorRole(input.userText);
  const adhdEntrepreneur = analyzeAdhdEntrepreneurTurn({
    userText: input.userText,
    adhdNative,
    multiTurn: adhdNative.multiTurn,
    boardDomain,
  });
  const adhdEntrepreneurHint = adhdEntrepreneurPrimaryHintForChat({
    analysis: adhdEntrepreneur,
    adhdNative,
  });
  const sprint5 = buildSprint5Intelligence({
    multiTurn: adhdNative.multiTurn,
    featureLabel: input.hasEcosystemFeatureMatch ? "ecosystem feature" : null,
    frictionLabel: adhdNative.primaryFriction?.replace(/_/g, " ") ?? null,
  });
  const adaptiveUserHint = adaptiveUserIntelligenceSprint5HintForChat({
    multiTurn: adhdNative.multiTurn,
  });
  const actionBias = analyzeActionBias({
    messages: input.messages,
    userText: input.userText,
    emotionalState: input.userState.emotionalState,
    adhdNative,
    multiTurn: adhdNative.multiTurn,
  });
  const actionBiasHint = actionBiasHintForChat(actionBias);
  const discoveryOverride = discoveryOverrideForActionBias(actionBias);
  const intuitiveAwareness = analyzeIntuitiveAwareness({
    messages: input.messages,
    userText: input.userText,
    emotionalState: input.userState.emotionalState,
    adhdNative,
    multiTurn: adhdNative.multiTurn,
    actionBias,
  });
  const intuitiveAwarenessHint =
    intuitiveAwarenessHintForChat(intuitiveAwareness);
  const capabilityHint = [
    capabilityRoutingHintForChat(input.userText),
    strategyIntelligenceHintForChat(input.userText),
    interventionLearningHintForChat(),
    effectivenessHintForChat(),
    mistakeRecoveryHintForChat(),
  ]
    .filter(Boolean)
    .join("\n\n");
  const intelligenceHint = [
    intelligenceHintForChat(intelligence, input.userText),
    discoveryOverride,
    capabilityHint,
  ]
    .filter(Boolean)
    .join("\n\n");

  let businessConfidence: BusinessIntelligenceConfidence | undefined;
  let businessConfidenceHint: string | undefined;
  let businessAdviceGate: BusinessConfidenceOffer | null | undefined;

  if (input.checkBusinessAdvice && isBusinessAdviceRequest(input.userText)) {
    businessConfidence = loadBusinessIntelligenceConfidence();
    businessConfidenceHint =
      businessIntelligenceConfidenceHintForChat(businessConfidence) ?? undefined;
    if (businessConfidence.level === "low") {
      businessAdviceGate = buildBusinessConfidenceOffer(
        businessConfidence,
        primaryBusinessAdviceDomain(input.userText),
      );
    }
  }

  const decisionIntelligence = buildCompanionDecisionIntelligence({
    messages: input.messages,
    userText: input.userText,
    lastAssistantText: input.lastAssistantText,
    outcomeThread: input.outcomeThread,
  });
  const decisionIntelligenceHint =
    companionDecisionIntelligenceHintForChat(decisionIntelligence);

  return {
    userState: input.userState,
    intelligence,
    conversation,
    orchestration,
    intelligenceHint,
    sprint5,
    actionBias,
    actionBiasHint,
    intuitiveAwareness,
    intuitiveAwarenessHint,
    adhdNative,
    adhdNativeHint,
    adhdEntrepreneur,
    adhdEntrepreneurHint,
    adaptiveUserHint,
    businessConfidence,
    businessConfidenceHint,
    businessAdviceGate,
    decisionIntelligence,
    decisionIntelligenceHint,
  };
}

/** Track both workflow state and pending acceptance when the app shows an offer. */
export function trackConversationOffer(input: {
  offerLine: string;
  offeredAtTurn: number;
  workspaceOffer?: WorkspaceOffer | null;
}): {
  workflow: ConversationWorkflow | null;
  commitment: PendingConversationCommitment | null;
} {
  const commitment =
    createConversationCommitment(input.offerLine, input.offeredAtTurn) ??
    (input.workspaceOffer?.line
      ? createConversationCommitment(
          input.workspaceOffer.line,
          input.offeredAtTurn,
        )
      : null);

  const fromLine = createConversationWorkflow(
    input.offerLine,
    input.offeredAtTurn,
  );
  if (fromLine) return { workflow: fromLine, commitment };

  if (input.workspaceOffer) {
    const workflow = createConversationWorkflow(
      input.workspaceOffer.line,
      input.offeredAtTurn,
    );
    return { workflow, commitment };
  }

  return { workflow: null, commitment };
}

/**
 * Resolve yes / sure / let's do it — pending commitment first, then workflow, then pending acceptance.
 * Reduces generic "what would you like help with next?" when Shari asked a question.
 */
export function resolveCompanionAcceptanceTurn(input: {
  userText: string;
  lastAssistantText: string;
  currentTurn: number;
  workflow: ConversationWorkflow | null;
  commitment?: PendingConversationCommitment | null;
  lastConsumedCommitmentId?: string | null;
  hasRealArtifactDraft?: boolean;
  pendingInput: Omit<
    ResolvePendingAcceptanceInput,
    "userText" | "lastAssistantText" | "currentTurn"
  >;
  outcomeThread?: OutcomeThread | null;
}): CompanionAcceptanceResolution {
  const t = input.userText.trim();
  if (!t) return { kind: "none" };

  const commitmentResolution = resolveConversationCommitment({
    userText: t,
    commitment: input.commitment ?? null,
    lastConsumedId: input.lastConsumedCommitmentId,
    currentTurn: input.currentTurn,
    outcomeThread: input.outcomeThread,
    hasRealArtifactDraft: input.hasRealArtifactDraft,
  });

  if (input.commitment) {
    if (
      commitmentResolution.outcome !== "not_commitment_reply" &&
      commitmentResolution.outcome !== "expired"
    ) {
      return { kind: "commitment", resolution: commitmentResolution };
    }
  } else if (commitmentResolution.outcome === "duplicate") {
    return { kind: "commitment", resolution: commitmentResolution };
  }

  if (!isAcceptanceAttempt(t)) return { kind: "none" };

  const fromState = input.workflow
    ? resolveConversationWorkflowAcceptance({
        userText: t,
        lastAssistantText: input.lastAssistantText,
        workflow: input.workflow,
        currentTurn: input.currentTurn,
        outcomeThread: input.outcomeThread,
      })
    : null;

  const workflowHit =
    fromState ??
    resolveWorkflowFromLastAssistant(
      t,
      input.lastAssistantText,
      input.currentTurn,
      input.outcomeThread,
    );

  if (workflowHit) {
    return { kind: "workflow", continuation: workflowHit };
  }

  const pending = resolvePendingAcceptance({
    userText: t,
    lastAssistantText: input.lastAssistantText,
    currentTurn: input.currentTurn,
    outcomeThread: input.outcomeThread,
    ...input.pendingInput,
  });

  if (pending.outcome === "accept" || pending.outcome === "expired") {
    return { kind: "pending", result: pending };
  }

  if (pending.outcome === "conversation") {
    const retryWorkflow = resolveWorkflowFromLastAssistant(
      t,
      input.lastAssistantText,
      input.currentTurn,
      input.outcomeThread,
    );
    if (retryWorkflow) {
      return { kind: "workflow", continuation: retryWorkflow };
    }
    return { kind: "pending", result: pending };
  }

  return { kind: "none" };
}

/** Whether an active workflow should clear on topic change. */
export function shouldClearWorkflowOnTopicChange(
  userText: string,
  workflow: ConversationWorkflow,
  topicInvalidates: (
    text: string,
    record: {
      id: string;
      kind: string;
      createdAt: number;
      offeredAtTurn: number;
      workspacePanelAtOffer: null;
      offerSummary: string;
    },
  ) => boolean,
): boolean {
  if (isAcceptanceAttempt(userText.trim())) return false;
  return topicInvalidates(userText, {
    id: workflow.kind,
    kind: "assisted",
    createdAt: 0,
    offeredAtTurn: workflow.offeredAtTurn,
    workspacePanelAtOffer: null,
    offerSummary: workflow.offerSummary,
  });
}

export type { PendingAction, WorkflowContinuationResult, ConversationWorkflow };
