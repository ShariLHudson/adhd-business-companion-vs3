/**
 * Single orchestrated per-turn companion hint — Decision Engine owns the turn.
 */

import {
  formatEmotionalContinuation,
  planEmotionalFirstResponse,
  shouldUseEmotionalFirstSequence,
} from "@/lib/conversation/emotionalFirstResponseSequence";
import {
  isDifficultClientCallRequest,
  SHARI_BANNED_PHRASE_LABELS,
  SHARI_CORE_LAW,
} from "@/lib/conversation/shariCompanionEngine";
import { sparkEstateConversationHint } from "@/lib/estate/sparkEstateConversationEngine";
import {
  buildSparkEstateIntelligenceRoutingCompanionHint,
} from "@/lib/estate/sparkEstateIntelligenceRoutingMap";
import { sparkEstateKnowledgeCompanionHint } from "@/lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture";
import { sparkEstateOnboardingCompanionHint } from "@/lib/estate/sparkEstateOnboardingAndFirst7DaysExperience";
import { sparkEstateRoomBlueprintCompanionHint } from "@/lib/estate/sparkEstateRoomBlueprintTemplate";
import { sparkEstateRoomIntelligenceCompanionHint } from "@/lib/estate/sparkEstateRoomIntelligenceArchitecture";
import { sparkEstateMasterOperatingDocumentCompanionHint } from "@/lib/estate/sparkEstateMasterOperatingDocument";
import { sparkEstateAiPromptLayerCompanionHint } from "@/lib/estate/sparkEstateAiPromptAndIntelligenceLayerArchitecture";
import { sparkEstateAnalyticsCompanionHint } from "@/lib/estate/sparkEstateAnalyticsAndLearningSystem";
import { sparkEstateFounderIntelligenceCompanionHint } from "@/lib/estate/sparkEstateFounderIntelligenceDashboard";
import { sparkEstateWorkspaceRecommendationCompanionHint } from "@/lib/estate/sparkEstateIntelligentWorkspaceRecommendationSystem";
import { sparkEstateProjectLifecycleCompanionHint } from "@/lib/estate/sparkEstateIntelligentProjectLifecycleEngine";
import { sparkCardVisualDesignCompanionHint } from "@/lib/sparkNote/sparkCardVisualDesignAndDailyGeneration";
import { sparkEstateExpertCollaborationCompanionHint } from "@/lib/estate/sparkEstateExpertTeamAndChamberMemberCollaborationArchitecture";
import { sparkEstateUniversalProjectWorkspaceCompanionHint } from "@/lib/estate/sparkEstateUniversalProjectWorkspaceArchitecture";
import { sparkEstateGovernanceCompanionHint } from "@/lib/estate/sparkEstateSystemGovernanceAndQualityStandards";
import { sparkEstateMemberLifecycleCompanionHint } from "@/lib/estate/sparkEstateUserJourneyAndMemberLifecycleArchitecture";
import { sparkEstateCompletionCompanionHint } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { buildSparkEstateMemberProfileCompanionHint } from "@/lib/estate/sparkEstateMemberProfileEngine";
import type { AppSection } from "@/lib/companionUi";
import { SPARK_LANDSCAPES } from "./sparkLandscapes/landscapes";
import { evaluateSparkDecisionEngine } from "./sparkDecisionEngine/evaluateDecisionEngine";
import { mapDecisionToRuntimeAction } from "./mapDecisionToRuntimeAction";
import { canonicalRoleLabel } from "./canonicalRole";
import type { SparkCompanionHintInput } from "./types";

const CONFLICT_DREAD_RE =
  /\b(?:conflict|confrontation|pushback|boundary conversation|hard conversation)\b/i;

const TASK_HELP_AFTER_EMOTION_RE =
  /\b(?:call|email|script|conversation with|talk to)\b/i;

export function buildSparkCompanionHint(
  input: SparkCompanionHintInput,
): string | null {
  const text = input.userText.trim();
  if (!text) return null;

  const decision = evaluateSparkDecisionEngine({
    userText: text,
    overwhelmed: input.overwhelmed,
    momentumActive: input.momentumActive,
    placeId: input.placeId ?? input.currentRoom ?? null,
    trustEstablished: input.trustEstablished,
  });

  const runtime = mapDecisionToRuntimeAction({
    userText: text,
    overwhelmed: input.overwhelmed,
    momentumActive: input.momentumActive,
    placeId: input.placeId ?? input.currentRoom ?? null,
    isReturning: input.isReturning,
    trustEstablished: input.trustEstablished,
    currentRoom: input.currentRoom,
    activeWorkflow: input.activeWorkflow,
    activeDocument: input.activeDocument,
    pendingNavigationChoices: input.pendingNavigationChoices,
    pendingConciergeChoices: input.pendingConciergeChoices,
    decision,
  });

  const landscape = SPARK_LANDSCAPES[decision.landscape.primary];
  const lines: string[] = [
    "SPARK COMPANION (one hint — orchestrate silently):",
    `Intent ${decision.intent} · Friction ${decision.friction} · Role ${canonicalRoleLabel(runtime.canonicalRole)} · Mode ${runtime.runtimeMode} · Depth ${runtime.depth}`,
    runtime.operationalHint,
  ];

  if (landscape && decision.landscape.confidence !== "low") {
    lines.push(`Landscape ${landscape.name} — ${landscape.helpFocus}`);
  }

  if (input.currentRoom) {
    lines.push(`Room ${input.currentRoom} — atmosphere only; capability unchanged.`);
  }
  if (input.activeWorkflow) {
    lines.push(`Active workflow ${input.activeWorkflow} — resume, do not restart.`);
  }
  if (input.activeDocument) {
    lines.push(`Active document ${input.activeDocument} — coach beside it.`);
  }
  if (input.pendingNavigationChoices) {
    lines.push("Pending estate destination choices — numbered menu only; resolve before new routing.");
  }
  if (input.pendingConciergeChoices) {
    lines.push("Pending concierge choices — resolve selection before new offers.");
  }

  lines.push(...SHARI_CORE_LAW.map((l) => `- ${l}`));

  const emotionalPlan = planEmotionalFirstResponse({
    text,
    hasSolutionReady: input.hasSolutionReady,
  });

  if (
    shouldUseEmotionalFirstSequence(text) &&
    !runtime.suppressEmotionalCoaching
  ) {
    lines.push("Emotional-first this turn — reflect before instruction.");
  }

  if (input.memberDislikesConflict && CONFLICT_DREAD_RE.test(text)) {
    lines.push(
      'MEMORY (once): conflict is hard for them — calm, clear, kind.',
    );
  }

  if (isDifficultClientCallRequest(text)) {
    lines.push(
      "DIFFICULT CLIENT CALL — weight first, then script/practice offer.",
    );
  } else if (
    emotionalPlan.requiresEmotionalFirstSequence &&
    TASK_HELP_AFTER_EMOTION_RE.test(text) &&
    !runtime.suppressEmotionalCoaching
  ) {
    lines.push("TASK HELP after grounding only — script/practice/stay.");
  }

  if (input.hasSolutionReady || input.taskHelpReady) {
    lines.push(
      `Continue: "${formatEmotionalContinuation(emotionalPlan)}"`,
    );
  }

  lines.push(
    `FORBIDDEN: ${SHARI_BANNED_PHRASE_LABELS.slice(0, 5).join(" · ")}`,
  );

  const estateConversation = sparkEstateConversationHint({
    text,
    section: input.placeId ?? input.currentRoom ?? undefined,
  });
  lines.push(estateConversation);

  const estateRouting = buildSparkEstateIntelligenceRoutingCompanionHint({
    text,
    currentSection: (input.placeId ?? input.currentRoom ?? undefined) as
      | AppSection
      | undefined,
  });
  if (estateRouting) {
    lines.push(estateRouting);
  }

  const estateKnowledge = sparkEstateKnowledgeCompanionHint({
    text,
    section: (input.placeId ?? input.currentRoom ?? undefined) as
      | AppSection
      | undefined,
  });
  if (estateKnowledge) {
    lines.push(estateKnowledge);
  }

  const memberProfile = buildSparkEstateMemberProfileCompanionHint({ text });
  if (memberProfile) {
    lines.push(memberProfile);
  }

  const onboarding = sparkEstateOnboardingCompanionHint();
  if (onboarding) {
    lines.push(onboarding);
  }

  const roomBlueprint = sparkEstateRoomBlueprintCompanionHint({
    text,
    roomId: input.currentRoom,
  });
  if (roomBlueprint) {
    lines.push(roomBlueprint);
  }

  const roomIntelligence = sparkEstateRoomIntelligenceCompanionHint({
    text,
    section: (input.placeId ?? input.currentRoom ?? undefined) as
      | AppSection
      | undefined,
  });
  if (roomIntelligence) {
    lines.push(roomIntelligence);
  }

  const governance = sparkEstateGovernanceCompanionHint({ text });
  if (governance) {
    lines.push(governance);
  }

  const analytics = sparkEstateAnalyticsCompanionHint({ text });
  if (analytics) {
    lines.push(analytics);
  }

  const founderIntelligence = sparkEstateFounderIntelligenceCompanionHint({ text });
  if (founderIntelligence) {
    lines.push(founderIntelligence);
  }

  const workspaceRecommendation = sparkEstateWorkspaceRecommendationCompanionHint({
    text,
    currentSection: (input.placeId ?? input.currentRoom ?? undefined) as
      | AppSection
      | undefined,
  });
  if (workspaceRecommendation) {
    lines.push(workspaceRecommendation);
  }

  const projectLifecycle = sparkEstateProjectLifecycleCompanionHint({
    text,
    currentSection: (input.placeId ?? input.currentRoom ?? undefined) as
      | AppSection
      | undefined,
  });
  if (projectLifecycle) {
    lines.push(projectLifecycle);
  }

  const expertCollaboration = sparkEstateExpertCollaborationCompanionHint({ text });
  if (expertCollaboration) {
    lines.push(expertCollaboration);
  }

  const universalProject = sparkEstateUniversalProjectWorkspaceCompanionHint({ text });
  if (universalProject) {
    lines.push(universalProject);
  }

  const sparkCard = sparkCardVisualDesignCompanionHint({ text });
  if (sparkCard) {
    lines.push(sparkCard);
  }

  const aiLayers = sparkEstateAiPromptLayerCompanionHint({ text });
  if (aiLayers) {
    lines.push(aiLayers);
  }

  const operating = sparkEstateMasterOperatingDocumentCompanionHint({ text });
  if (operating) {
    lines.push(operating);
  }

  const completion = sparkEstateCompletionCompanionHint({ text });
  if (completion) {
    lines.push(completion);
  }

  const lifecycle = sparkEstateMemberLifecycleCompanionHint({ text });
  if (lifecycle) {
    lines.push(lifecycle);
  }

  return lines.join("\n");
}
