/**
 * Estate Intelligence Check — probe Navigation, Feature, Object, Experience,
 * Discovery, Research, Create, Capture, and Retrieval without side effects.
 */

import {
  resolveImmediateCreateProjectAction,
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import { resolveImmediateResearchOpen } from "@/lib/estateBrain/routeEstateIntelligence";
import { isResearchIntent } from "@/lib/estateBrain/researchRouting";
import { classifyHelpDiscoveryIntent } from "@/lib/estateHelpDiscoveryIntelligence/classifyHelpDiscoveryIntent";
import { resolveLocationIntent } from "@/lib/estateKnowledgeBase/locationIntentResolution";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import {
  isResolvedObjectIntent,
  resolveObjectIntent,
} from "@/lib/estateObjectIntelligence";
import {
  isResolvedEstateRecommendation,
  resolveEstateRecommendation,
} from "@/lib/estateRecommendationIntelligence";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { shouldEnterUniversalCreation } from "@/lib/universalCreation";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import type { HelpDiscoveryContext } from "@/lib/estateHelpDiscoveryIntelligence";
import type { ArbitrationResult } from "./arbitration";
import { shouldBlockEstateSubsystem } from "./arbitration";
import {
  isCaptureIntent,
  isExplicitNavigationIntent,
  isProjectNamingContinuation,
  isRetrieveIntent,
  isTemplateIntent,
  TASK_GOALS_BLOCKING_ESTATE,
} from "./goalClassifier";
import { isSemanticNavigationRequest } from "@/lib/semanticIntentResolver/mapToRouting";
import type {
  CapabilityConfidence,
  CapabilityEvaluation,
  EstateCapability,
} from "./capabilityTypes";

export type EstateIntelligenceCheckInput = {
  userText: string;
  lastAssistantText?: string | null;
  activeWorkflow?: string | null;
  workspace?: string | null;
  arbitration: ArbitrationResult;
  helpDiscoveryContext?: HelpDiscoveryContext;
};

function evalCapability(
  capability: EstateCapability,
  eligible: boolean,
  confidence: CapabilityConfidence,
  reason: string,
): CapabilityEvaluation {
  return { capability, eligible, confidence, reason };
}

function isEstateBranchBlocked(
  arbitration: ArbitrationResult,
  capability: EstateCapability,
): boolean {
  if (!TASK_GOALS_BLOCKING_ESTATE.has(arbitration.goal)) {
    if (arbitration.goal === "explicit_navigation" && capability !== "navigation") {
      return (
        capability === "experience" ||
        capability === "discovery" ||
        capability === "room"
      );
    }
    return false;
  }
  if (capability === "navigation" && arbitration.goal === "explicit_navigation") {
    return false;
  }
  return ESTATE_BRANCH_CAPABILITIES.has(capability);
}

const ESTATE_BRANCH_CAPABILITIES = new Set<EstateCapability>([
  "navigation",
  "room",
  "feature",
  "object",
  "experience",
  "discovery",
  "help",
]);

export function evaluateEstateIntelligenceCandidates(
  input: EstateIntelligenceCheckInput,
): CapabilityEvaluation[] {
  const userText = input.userText.trim();
  const { arbitration } = input;
  const ctx = input.helpDiscoveryContext ?? {};
  const candidates: CapabilityEvaluation[] = [];

  const sessionActive =
    arbitration.activeSession !== "none" &&
    arbitration.activeSession !== "brain_dump";
  candidates.push(
    evalCapability(
      "session_continue",
      sessionActive ||
        isProjectNamingContinuation(input.lastAssistantText) ||
        arbitration.goal === "continue_session",
      sessionActive || isProjectNamingContinuation(input.lastAssistantText)
        ? "high"
        : arbitration.goal === "continue_session"
          ? "medium"
          : "low",
      sessionActive
        ? `active_session:${arbitration.activeSession}`
        : "no_active_session",
    ),
  );

  const semanticNavigate = isSemanticNavigationRequest(arbitration.semanticIntent);
  const navDecision = resolveEstateNavigationIntent(userText, {
    bypassIntentGate: semanticNavigate,
  });
  const navEligible =
    !isEstateBranchBlocked(arbitration, "navigation") &&
    (isExplicitNavigationIntent(userText) ||
      semanticNavigate ||
      navDecision.kind !== "unresolved");
  candidates.push(
    evalCapability(
      "navigation",
      navEligible,
      navDecision.kind === "navigate_direct"
        ? "high"
        : navEligible
          ? "medium"
          : "low",
      navDecision.kind === "unresolved" ? "not_navigation" : navDecision.kind,
    ),
  );

  const whereIsQuery = /\bwhere is\b/i.test(userText);
  const locationIntent = resolveLocationIntent(userText);
  const roomEligible =
    !isEstateBranchBlocked(arbitration, "room") &&
    whereIsQuery &&
    (navDecision.kind !== "unresolved" || locationIntent.kind !== "unresolved");
  candidates.push(
    evalCapability(
      "room",
      roomEligible,
      roomEligible ? "high" : "low",
      roomEligible ? "where_is_room" : "not_room",
    ),
  );

  const helpClass = classifyHelpDiscoveryIntent(userText);
  const featureEligible =
    !isEstateBranchBlocked(arbitration, "feature") &&
    (helpClass?.route === "feature_how_to" || arbitration.goal === "help_how_to");
  candidates.push(
    evalCapability(
      "feature",
      featureEligible,
      helpClass?.route === "feature_how_to" ? "high" : "medium",
      helpClass?.route === "feature_how_to"
        ? "feature_how_to"
        : "goal_help_how_to",
    ),
  );

  const objectDecision = resolveObjectIntent(userText, {
    currentLocationId: ctx.currentLocationId,
  });
  const objectEligible =
    !isEstateBranchBlocked(arbitration, "object") &&
    (helpClass?.route === "object" ||
      isResolvedObjectIntent(objectDecision) ||
      (arbitration.semanticIntent?.target.kind === "object" &&
        arbitration.semanticIntent.confidence !== "low"));
  candidates.push(
    evalCapability(
      "object",
      objectEligible,
      isResolvedObjectIntent(objectDecision) ? "high" : "low",
      objectDecision.kind === "unresolved" ? "not_object" : objectDecision.kind,
    ),
  );

  const recDecision = resolveEstateRecommendation(userText, {
    currentLocationId: ctx.currentLocationId,
  });
  const experienceBlocked =
    shouldBlockEstateSubsystem(arbitration, "recommendation") ||
    isEstateBranchBlocked(arbitration, "experience");
  const experienceEligible =
    !experienceBlocked &&
    (helpClass?.route === "experience" ||
      isResolvedEstateRecommendation(recDecision));
  candidates.push(
    evalCapability(
      "experience",
      experienceEligible,
      isResolvedEstateRecommendation(recDecision) ? "high" : "medium",
      experienceBlocked
        ? "blocked_by_arbitration"
        : isResolvedEstateRecommendation(recDecision)
          ? "recommendation_invitation"
          : helpClass?.route === "experience"
            ? "experience_question"
            : "not_experience",
    ),
  );

  const discoveryEligible =
    !isEstateBranchBlocked(arbitration, "discovery") &&
    (helpClass?.route === "discovery" || arbitration.goal === "discovery_estate");
  candidates.push(
    evalCapability(
      "discovery",
      discoveryEligible,
      helpClass?.route === "discovery" ? "high" : "medium",
      helpClass?.route ?? "not_discovery",
    ),
  );

  const helpEligible =
    !isEstateBranchBlocked(arbitration, "help") &&
    (isEstateGuideQuestion(userText, input.lastAssistantText) ||
      helpClass?.route === "capability_overview");
  candidates.push(
    evalCapability(
      "help",
      helpEligible,
      isEstateGuideQuestion(userText, input.lastAssistantText) ? "high" : "medium",
      helpEligible ? "estate_help" : "not_help",
    ),
  );

  const researchOpen = resolveImmediateResearchOpen(userText);
  const researchEligible =
    arbitration.goal === "research" ||
    (isResearchIntent(userText) && researchOpen != null);
  candidates.push(
    evalCapability(
      "research",
      researchEligible,
      researchOpen ? "high" : isResearchIntent(userText) ? "medium" : "low",
      researchOpen ? "immediate_research" : "research_intent",
    ),
  );

  const projectAction = isProjectCreationIntent(userText)
    ? resolveImmediateCreateProjectAction(userText)
    : null;
  const createEligible =
    arbitration.goal === "create" ||
    projectAction != null ||
    isTemplateIntent(userText) ||
    shouldEnterUniversalCreation(userText) ||
    isSimpleCreateRequest(userText);
  candidates.push(
    evalCapability(
      "create",
      createEligible,
      projectAction || isTemplateIntent(userText) ? "high" : "medium",
      projectAction
        ? "create_project"
        : createEligible
          ? "create_intent"
          : "not_create",
    ),
  );

  const captureEligible = isCaptureIntent(userText, {
    activeWorkflow: input.activeWorkflow,
    workspace: input.workspace,
  });
  candidates.push(
    evalCapability(
      "capture",
      captureEligible,
      captureEligible ? "high" : "low",
      captureEligible ? "brain_dump_capture" : "not_capture",
    ),
  );

  const retrieveEligible = isRetrieveIntent(userText);
  candidates.push(
    evalCapability(
      "retrieval",
      retrieveEligible,
      retrieveEligible ? "high" : "low",
      retrieveEligible ? "content_retrieve" : "not_retrieve",
    ),
  );

  return candidates;
}
