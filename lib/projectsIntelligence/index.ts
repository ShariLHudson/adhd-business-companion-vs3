/**
 * Projects Intelligence — pilot surface for Visual Thinking integration.
 */

export type {
  ProjectsVisualPurpose,
  ProjectDependencySignal,
  ProjectBlockerSignal,
  ProjectRiskSignal,
  ProjectsSessionSnapshot,
  ProjectsReturnContext,
  ProjectExecutionWritebackKind,
  ProjectPendingChange,
} from "./types";

export {
  assessProjectsVisualThinkingRecommendation,
  createVisualThinkingContextFromProjects,
  detectsExplicitProjectsVisualRequest,
  declineProjectsVisualThinkingRecommendation,
  buildProjectsReturnFromVisual,
  buildProjectsVisualFailureRecovery,
  visualMoveMutatesProjectsExecution,
  loadProjectsReturnContext,
  recordProjectsVtObservability,
  listProjectsVtObservabilityEvents,
  clearProjectsVtPilotSessionState,
  purposeToPresentation,
  purposeToCapability,
  PROJECTS_VT_RETURN_KEY,
  type ProjectsVisualThinkingRecommendation,
  type ProjectsToVisualThinkingAdapterResult,
  type ProjectsVtPilotEvent,
} from "./visualThinkingIntegration";

export {
  projectProjectsVisualInvitation,
  type ProjectsVisualInvitationProjection,
} from "./projectsVisualInvitation";

export {
  buildProjectsSessionSnapshot,
  inferProjectsVisualPurpose,
  buildProjectsRecommendationContext,
  assessProjectsPilotRecommendation,
  buildProjectsIntegrationRequest,
  buildWorkspaceProjectsContext,
  projectSelectedProjectsActions,
  proposeProjectPendingChange,
  approveProjectPendingChange,
  rejectProjectPendingChange,
  loadPendingChanges,
  analyzeProjectStructure,
  buildProjectsReturn,
  assertProjectsExecutionUnchanged,
  visualOrganizationCreatesExecutionWriteback,
  projectsPilotFailureRecovery,
  declineProjectsVisualRecommendation,
  loadProjectsIntegrationRequest,
  loadWorkspaceProjectsContext,
  clearProjectsVtPilotState,
  purposeToSafePresentation,
  userFacingProjectsInvitation,
  PROJECTS_VT_INTEGRATION_KEY,
  PROJECTS_VT_WORKSPACE_CTX_KEY,
  type ProjectsVisualThinkingIntegrationRequest,
  type WorkspaceProjectsContext,
  type ProjectVisualAnalysis,
  type ProjectsSelectedObjectAction,
  type VisualThinkingProjectsReturn,
} from "./projectsVisualThinkingPilot";
