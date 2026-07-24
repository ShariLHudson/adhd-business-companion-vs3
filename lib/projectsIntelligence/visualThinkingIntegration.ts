/**
 * Projects → Visual Thinking pilot integration.
 * Projects owns execution. Visual Thinking owns representation & workspace.
 * Routes through VisualThinkingService — never a Projects-local map engine.
 */

import {
  VisualThinkingService,
  requestVisualThinkingHandoff,
  shouldRecommendVisualThinking,
  type VisualThinkingCapability,
  type VisualThinkingRequestContext,
  type VisualThinkingServiceHandoff,
} from "@/lib/cartographersStudio/visualThinkingService";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  analyzeProjectStructure,
  assessProjectsPilotRecommendation,
  buildProjectsIntegrationRequest,
  buildProjectsReturn,
  buildWorkspaceProjectsContext,
  detectsExplicitProjectsVisualRequest,
  declineProjectsVisualRecommendation,
  loadProjectsIntegrationRequest,
  purposeToPresentation,
  purposeToSafePresentation,
  userFacingProjectsInvitation,
  visualOrganizationCreatesExecutionWriteback,
  type ProjectsVisualThinkingIntegrationRequest,
  type VisualThinkingProjectsReturn,
  type WorkspaceProjectsContext,
} from "@/lib/projectsIntelligence/projectsVisualThinkingPilot";
import type {
  ProjectPendingChange,
  ProjectsReturnContext,
  ProjectsSessionSnapshot,
  ProjectsVisualPurpose,
} from "@/lib/projectsIntelligence/types";

export type ProjectsVisualThinkingRecommendation = {
  recommended: boolean;
  confidence: "low" | "medium" | "high";
  reason: string;
  suggestedPurpose: ProjectsVisualPurpose | null;
  preferredPresentation: VisualThinkingPresentationType | null;
  alternativePresentations: VisualThinkingPresentationType[];
  recommendationTiming:
    | "after_project_context"
    | "on_blockers"
    | "on_complex_dependencies"
    | "on_progress_review"
    | "explicit_request"
    | "none";
  userFacingMessage: string;
  primaryActionLabel: "Show Me Visually";
  keepActionLabel: "Keep Working Here";
  suppressActionLabel: "Not During This Project";
  suppressForSession: boolean;
  factors: string[];
};

export type ProjectsToVisualThinkingAdapterResult = {
  integrationRequest: ProjectsVisualThinkingIntegrationRequest;
  workspaceContext: WorkspaceProjectsContext;
  handoff: VisualThinkingServiceHandoff;
  seedRequestText: string;
  analysis: ReturnType<typeof analyzeProjectStructure>;
};

export type ProjectsVtPilotEvent =
  | "recommendation_assessed"
  | "recommendation_shown"
  | "recommendation_accepted"
  | "recommendation_declined"
  | "visual_explicitly_requested"
  | "handoff_created"
  | "workspace_opened"
  | "workspace_failed"
  | "returned_to_projects"
  | "pending_change_offered"
  | "pending_change_approved"
  | "pending_change_rejected"
  | "repeated_recommendation_suppressed"
  | "project_suppress_visuals";

const RETURN_KEY = "companion-projects-vt-return-v1";
const OBS_KEY = "companion-projects-vt-observability-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function purposeToCapability(
  purpose: ProjectsVisualPurpose,
): VisualThinkingCapability {
  switch (purpose) {
    case "identify_dependencies":
    case "find_blockers":
    case "evaluate_risks":
      return "execution_visualization";
    case "see_project_flow":
    case "clarify_phases":
    case "understand_execution":
    case "plan_next_steps":
      return "process_visualization";
    case "review_progress":
    case "communicate_plan":
    case "prepare_for_meeting":
      return "visual_explanation";
    case "organize_complex_work":
    case "understand_responsibilities":
      return "relationship_visualization";
    default:
      return "execution_visualization";
  }
}

function noRecommend(
  reason: string,
  factors: string[],
): ProjectsVisualThinkingRecommendation {
  return {
    recommended: false,
    confidence: "low",
    reason,
    suggestedPurpose: null,
    preferredPresentation: null,
    alternativePresentations: [],
    recommendationTiming: "none",
    userFacingMessage: "",
    primaryActionLabel: "Show Me Visually",
    keepActionLabel: "Keep Working Here",
    suppressActionLabel: "Not During This Project",
    suppressForSession: false,
    factors,
  };
}

function timingForPurpose(
  purpose: ProjectsVisualPurpose,
): ProjectsVisualThinkingRecommendation["recommendationTiming"] {
  switch (purpose) {
    case "find_blockers":
      return "on_blockers";
    case "identify_dependencies":
      return "on_complex_dependencies";
    case "review_progress":
      return "on_progress_review";
    default:
      return "after_project_context";
  }
}

export function recordProjectsVtObservability(input: {
  type: ProjectsVtPilotEvent;
  projectId: string;
  projectName?: string | null;
  meta?: Record<string, string | number | boolean | null>;
}): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    const list: Array<{
      type: ProjectsVtPilotEvent;
      projectId: string;
      projectName: string | null;
      at: string;
      meta?: Record<string, string | number | boolean | null>;
    }> = raw ? JSON.parse(raw) : [];
    list.push({
      type: input.type,
      projectId: input.projectId,
      projectName: input.projectName ?? null,
      at: nowIso(),
      meta: input.meta,
    });
    window.sessionStorage.setItem(OBS_KEY, JSON.stringify(list.slice(-80)));
  } catch {
    /* ignore */
  }
}

export function listProjectsVtObservabilityEvents(): Array<{
  type: ProjectsVtPilotEvent;
  projectId: string;
  at: string;
}> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReturnContext(
  returnContext: ProjectsReturnContext,
  integrationId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      RETURN_KEY,
      JSON.stringify({ returnContext, integrationId, at: nowIso() }),
    );
  } catch {
    /* ignore */
  }
}

export function loadProjectsReturnContext(): {
  returnContext: ProjectsReturnContext;
  integrationId: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    return raw
      ? (JSON.parse(raw) as {
          returnContext: ProjectsReturnContext;
          integrationId: string;
        })
      : null;
  } catch {
    return null;
  }
}

export function assessProjectsVisualThinkingRecommendation(input: {
  session: ProjectsSessionSnapshot;
  userRequest: string;
  hasProvidedInitialValue: boolean;
}): ProjectsVisualThinkingRecommendation {
  const { session, userRequest } = input;
  const pilot = assessProjectsPilotRecommendation(input);

  if (
    detectsExplicitProjectsVisualRequest(userRequest) ||
    pilot.shared.explicitlyRequested
  ) {
    const purpose = pilot.purpose;
    return {
      recommended: true,
      confidence: "high",
      reason: "Member explicitly asked for a visual of this project.",
      suggestedPurpose: purpose,
      preferredPresentation: purposeToSafePresentation(purpose),
      alternativePresentations: ["process_flow", "relationship_view", "timeline"],
      recommendationTiming: "explicit_request",
      userFacingMessage: "",
      primaryActionLabel: "Show Me Visually",
      keepActionLabel: "Keep Working Here",
      suppressActionLabel: "Not During This Project",
      suppressForSession: false,
      factors: ["explicit_visual_request", ...pilot.shared.factors],
    };
  }

  if (pilot.shared.factors.includes("session_suppress")) {
    recordProjectsVtObservability({
      type: "repeated_recommendation_suppressed",
      projectId: session.projectId,
      projectName: session.projectName,
      meta: { reason: "session_suppress" },
    });
    return noRecommend("Suppressed for this project session.", [
      "session_suppress",
    ]);
  }

  if (pilot.shared.factors.includes("topic_declined")) {
    recordProjectsVtObservability({
      type: "repeated_recommendation_suppressed",
      projectId: session.projectId,
      projectName: session.projectName,
      meta: { reason: "topic_declined" },
    });
    return noRecommend("Already declined for this project.", ["topic_declined"]);
  }

  if (!input.hasProvidedInitialValue) {
    return noRecommend(
      "Wait until Projects has given useful execution context.",
      ["timing_before_value"],
    );
  }

  const structural =
    session.tasks.length >= 3 ||
    session.phases.length >= 2 ||
    session.dependencySignals.length >= 1 ||
    session.blockerSignals.length >= 1 ||
    session.openTaskCount >= 4;

  if (!structural || !pilot.shared.readiness.structureSufficient) {
    return noRecommend(
      "Not enough project structure to make a visual helpful yet.",
      ["insufficient_structure", ...pilot.shared.factors],
    );
  }

  const platform = shouldRecommendVisualThinking({
    sourceExperience: "projects",
    primaryGoal: session.projectGoal,
    signalText: userRequest,
    conversationSummary: [
      session.currentFocus,
      session.nextStep,
      `${session.openTaskCount} open tasks`,
    ]
      .filter(Boolean)
      .join(". "),
    conceptCount: session.tasks.length,
    relationshipCount: session.dependencySignals.length,
    processStepCount: session.phases.length,
    reasonForRecommendation: userFacingProjectsInvitation(
      pilot.purpose,
      session.projectName,
    ),
  });

  const recommended =
    pilot.shared.recommended &&
    (pilot.shared.confidence === "high" ||
      pilot.shared.confidence === "medium") &&
    platform.shouldRecommend;

  recordProjectsVtObservability({
    type: "recommendation_assessed",
    projectId: session.projectId,
    projectName: session.projectName,
    meta: {
      recommended,
      purpose: pilot.purpose,
    },
  });

  if (!recommended) {
    return noRecommend(
      pilot.shared.reasons[0] ||
        platform.reason ||
        "A visual is optional here.",
      [...pilot.shared.factors, ...platform.factors],
    );
  }

  // Projects owns execution-facing invitation copy when purpose is clear.
  const message =
    userFacingProjectsInvitation(pilot.purpose, session.projectName) ||
    pilot.shared.userFacingMessage;

  const confidence: ProjectsVisualThinkingRecommendation["confidence"] =
    pilot.shared.confidence === "very_high" ||
    pilot.shared.confidence === "high"
      ? "high"
      : pilot.shared.confidence === "medium"
        ? "medium"
        : "low";

  return {
    recommended: true,
    confidence,
    reason:
      pilot.shared.reasons[0] || "Visual structure may clarify execution.",
    suggestedPurpose: pilot.purpose,
    preferredPresentation:
      pilot.shared.preferredPresentation ??
      purposeToSafePresentation(pilot.purpose),
    alternativePresentations:
      pilot.shared.eligibleAlternatePresentations.length > 0
        ? pilot.shared.eligibleAlternatePresentations
        : ["process_flow", "relationship_view", "timeline", "checklist"],
    recommendationTiming: timingForPurpose(pilot.purpose),
    userFacingMessage: message,
    primaryActionLabel: "Show Me Visually",
    keepActionLabel: "Keep Working Here",
    suppressActionLabel: "Not During This Project",
    suppressForSession: false,
    factors: [...pilot.shared.factors, ...platform.factors],
  };
}

export function declineProjectsVisualThinkingRecommendation(input: {
  projectId: string;
  projectName: string;
  notDuringProject?: boolean;
}): void {
  declineProjectsVisualRecommendation({
    projectId: input.projectId,
    topic: input.projectName,
    notDuringSession: input.notDuringProject,
  });
  VisualThinkingService.recordDismiss();
  recordProjectsVtObservability({
    type: input.notDuringProject
      ? "project_suppress_visuals"
      : "recommendation_declined",
    projectId: input.projectId,
    projectName: input.projectName,
  });
}

export function createVisualThinkingContextFromProjects(input: {
  session: ProjectsSessionSnapshot;
  userRequest: string;
  recommendation: ProjectsVisualThinkingRecommendation;
  explicitlyRequested: boolean;
  userAcceptedRecommendation: boolean;
}): ProjectsToVisualThinkingAdapterResult {
  const { session, recommendation } = input;
  const purpose =
    recommendation.suggestedPurpose ??
    (session.blockerSignals.length >= 1
      ? "find_blockers"
      : "understand_execution");

  const preferred =
    recommendation.preferredPresentation ?? purposeToPresentation(purpose);

  const integrationRequest = buildProjectsIntegrationRequest({
    session,
    userRequest: input.userRequest,
    purpose,
    preferredPresentation: preferred,
    eligibleAlternates: recommendation.alternativePresentations,
    explicitlyRequested: input.explicitlyRequested,
    userAcceptedRecommendation: input.userAcceptedRecommendation,
    recommendationId: null,
  });

  const analysis = analyzeProjectStructure(session);
  const seedRequestText = integrationRequest.projectSummaryForSeed;

  const visualThinkingContext: VisualThinkingRequestContext = {
    sourceExperience: "projects",
    sourceCompanion: "projects",
    conversationSummary: seedRequestText.slice(0, 1200),
    primaryGoal: session.projectGoal,
    currentTask: session.selectedTaskId ?? session.currentFocus,
    preferredPresentation: preferred,
    preferredCapability: purposeToCapability(purpose),
    reasonForRecommendation:
      recommendation.userFacingMessage || recommendation.reason,
    signalText: seedRequestText,
    conceptCount: session.tasks.length,
    relationshipCount: session.dependencySignals.length,
    processStepCount: session.phases.length,
  };

  const handoff = requestVisualThinkingHandoff(visualThinkingContext, {
    shouldRecommend: true,
    confidence: recommendation.confidence,
    capability: purposeToCapability(purpose),
    preferredPresentation: preferred,
    reason: recommendation.reason,
    invitation: recommendation.userFacingMessage,
    primaryActionLabel: "Open Visual Thinking",
    keepActionLabel: "Keep Working Here",
    optional: true,
    dismissible: true,
    factors: recommendation.factors,
  });

  const enrichedHandoff: VisualThinkingServiceHandoff = {
    ...handoff,
    seedRequestText,
  };

  const workspaceContext = buildWorkspaceProjectsContext(
    integrationRequest,
    session.selectedTaskId,
    session.tasks.find((t) => t.id === session.selectedTaskId)?.title ?? null,
    preferred,
  );

  saveReturnContext(integrationRequest.returnContext, integrationRequest.id);

  recordProjectsVtObservability({
    type: input.explicitlyRequested
      ? "visual_explicitly_requested"
      : "handoff_created",
    projectId: session.projectId,
    projectName: session.projectName,
    meta: { purpose, presentation: preferred },
  });

  return {
    integrationRequest,
    workspaceContext,
    handoff: enrichedHandoff,
    seedRequestText,
    analysis,
  };
}

export function buildProjectsReturnFromVisual(input: {
  request?: ProjectsVisualThinkingIntegrationRequest | null;
  sourceProjectId: string;
  visualThinkingWorkspaceId: string | null;
  activePresentation?: string | null;
  pendingChangeIds?: string[];
  approvedChangeIds?: string[];
  userQuestionIds?: string[];
  annotationIds?: string[];
}): VisualThinkingProjectsReturn {
  const request =
    input.request ??
    loadProjectsIntegrationRequest() ??
    ({
      id: newId("pvt_fallback"),
      sourceExperience: "projects" as const,
      sourceConversationId: null,
      sourceProjectId: input.sourceProjectId,
      originalUserRequest: "",
      projectName: "your project",
      projectGoal: "",
      currentFocus: null,
      nextStep: null,
      requestedVisualPurpose: "understand_execution" as const,
      preferredPresentation: null,
      eligibleAlternatePresentations: [],
      phaseIds: [],
      milestoneLabels: [],
      taskIds: [],
      dependencySignals: [],
      blockerSignals: [],
      riskSignals: [],
      openTaskCount: 0,
      completedTaskCount: 0,
      explicitlyRequested: false,
      recommendationId: null,
      userAcceptedRecommendation: false,
      pendingChanges: [] as ProjectPendingChange[],
      returnContext: {
        projectId: input.sourceProjectId,
        projectName: "your project",
        selectedTaskId: null,
        currentView: null,
        scrollPosition: null,
        activeFilters: [],
        searchQuery: null,
        conversationId: null,
        resumePrompt: null,
        returnRoute: "project-homes" as const,
      },
      projectSummaryForSeed: "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      integrationVersion: "projects-vt-pilot-1" as const,
    } satisfies ProjectsVisualThinkingIntegrationRequest);

  const result = buildProjectsReturn({
    request,
    visualThinkingWorkspaceId: input.visualThinkingWorkspaceId,
    activePresentation: input.activePresentation,
    pendingChangeIds: input.pendingChangeIds,
    approvedChangeIds: input.approvedChangeIds,
    userQuestionIds: input.userQuestionIds,
    annotationIds: input.annotationIds,
  });

  recordProjectsVtObservability({
    type: "returned_to_projects",
    projectId: input.sourceProjectId,
    projectName: request.projectName,
  });

  return result;
}

export function buildProjectsVisualFailureRecovery(projectName: string): {
  stayInProjects: true;
  message: string;
  retryAvailable: true;
} {
  recordProjectsVtObservability({
    type: "workspace_failed",
    projectId: "unknown",
    projectName,
  });
  return {
    stayInProjects: true,
    message: `I wasn’t able to open the visual view, but “${projectName || "your project"}” is still here. We can keep working from Projects.`,
    retryAvailable: true,
  };
}

/**
 * Hard rule: visual organization never mutates Projects execution.
 */
export function visualMoveMutatesProjectsExecution(): false {
  return visualOrganizationCreatesExecutionWriteback();
}

export function clearProjectsVtPilotSessionState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RETURN_KEY);
    window.sessionStorage.removeItem(OBS_KEY);
  } catch {
    /* ignore */
  }
}

export {
  detectsExplicitProjectsVisualRequest,
  purposeToPresentation,
  RETURN_KEY as PROJECTS_VT_RETURN_KEY,
};
