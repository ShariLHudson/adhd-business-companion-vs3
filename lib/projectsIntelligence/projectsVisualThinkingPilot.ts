/**
 * Projects Intelligence Pilot Integration (Build 11)
 * Projects owns execution. Visual Thinking owns understanding / organization.
 * Never auto-mutates dates, owners, dependencies, priorities, or status.
 */

import type { Project, ProjectItem } from "@/lib/companionProjectsStore";
import {
  assessVisualThinkingRecommendation,
  detectsExplicitVisualThinkingIntent,
  type VisualThinkingRecommendationContext,
  type VisualThinkingRecommendationDecision,
  type VisualThinkingRecommendedPurpose,
} from "@/lib/cartographersStudio/visualThinkingRecommendationIntelligence";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import type { CoCreationActionId } from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";
import type {
  ProjectBlockerSignal,
  ProjectDependencySignal,
  ProjectPendingChange,
  ProjectExecutionWritebackKind,
  ProjectsReturnContext,
  ProjectsSessionSnapshot,
  ProjectsVisualPurpose,
  ProjectRiskSignal,
} from "@/lib/projectsIntelligence/types";

export type ProjectsVisualThinkingIntegrationRequest = {
  id: string;
  sourceExperience: "projects";
  sourceConversationId: string | null;
  sourceProjectId: string;
  originalUserRequest: string;
  projectName: string;
  projectGoal: string;
  currentFocus: string | null;
  nextStep: string | null;
  requestedVisualPurpose: ProjectsVisualPurpose;
  preferredPresentation: VisualThinkingPresentationType | null;
  eligibleAlternatePresentations: VisualThinkingPresentationType[];
  phaseIds: string[];
  milestoneLabels: string[];
  taskIds: string[];
  dependencySignals: ProjectDependencySignal[];
  blockerSignals: ProjectBlockerSignal[];
  riskSignals: ProjectRiskSignal[];
  openTaskCount: number;
  completedTaskCount: number;
  explicitlyRequested: boolean;
  recommendationId: string | null;
  userAcceptedRecommendation: boolean;
  pendingChanges: ProjectPendingChange[];
  returnContext: ProjectsReturnContext;
  projectSummaryForSeed: string;
  createdAt: string;
  updatedAt: string;
  integrationVersion: "projects-vt-pilot-1";
};

export type WorkspaceProjectsContext = {
  sourceProjectId: string;
  projectName: string;
  projectGoal: string;
  currentFocus: string | null;
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;
  openBlockers: string[];
  currentPresentation: string | null;
  returnContext: ProjectsReturnContext;
};

export type ProjectVisualAnalysis = {
  criticalPathItemIds: string[];
  dependencyChains: string[][];
  circularDependencyPairs: Array<{ fromItemId: string; toItemId: string }>;
  isolatedTaskIds: string[];
  overloadedMilestoneLabels: string[];
  missingDependencyHints: string[];
  largePhaseIds: string[];
  executionRiskNotes: string[];
  singlePointsOfFailure: string[];
  longChainIds: string[][];
  parallelOpportunities: Array<{ itemIds: string[]; reason: string }>;
};

export type ProjectsSelectedObjectAction = {
  id:
    | "explain"
    | "expand"
    | "find_dependencies"
    | "show_blockers"
    | "research"
    | "ask_board"
    | "generate_alternatives"
    | "simplify"
    | "add_notes"
    | "identify_risks"
    | "find_missing_tasks"
    | "suggest_next_steps"
    | "show_related_work";
  label: string;
  coCreationAction?: CoCreationActionId;
  createsPendingChange?: boolean;
};

export type VisualThinkingProjectsReturn = {
  id: string;
  sourceProjectId: string;
  visualThinkingWorkspaceId: string | null;
  activePresentation: string | null;
  pendingChangeIds: string[];
  approvedChangeIds: string[];
  userQuestionIds: string[];
  annotationIds: string[];
  resumeMessage: string;
  returnContext: ProjectsReturnContext;
  createdAt: string;
  returnVersion: "projects-vt-return-1";
};

const INTEGRATION_KEY = "companion-projects-vt-integration-v1";
const WORKSPACE_CTX_KEY = "companion-projects-vt-workspace-ctx-v1";
const PENDING_KEY = "companion-projects-vt-pending-v1";
const SESSION_SUPPRESS_KEY = "companion-projects-vt-suppress-v1";
const OBS_KEY = "companion-projects-vt-obs-v1";

type SuppressionState = {
  projectId: string;
  topicDeclines: string[];
  suppressSession: boolean;
  updatedAt: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildProjectsSessionSnapshot(input: {
  project: Project;
  items: ProjectItem[];
  dependencySignals?: ProjectDependencySignal[];
  blockerSignals?: ProjectBlockerSignal[];
  riskSignals?: ProjectRiskSignal[];
  milestones?: string[];
  conversationId?: string | null;
  selectedTaskId?: string | null;
  currentView?: string | null;
  scrollPosition?: number | null;
  activeFilters?: string[];
  searchQuery?: string | null;
}): ProjectsSessionSnapshot {
  const { project, items } = input;
  const projectItems = items.filter((i) => i.projectId === project.id);
  const sections = projectItems
    .filter((i) => i.kind === "section")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const tasks = projectItems
    .filter((i) => i.kind === "task" || i.kind === "subtask")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const phases =
    sections.length > 0
      ? sections.map((s) => ({
          id: s.id,
          title: s.title,
          itemIds: tasks
            .filter((t) => t.parentId === s.id)
            .map((t) => t.id),
        }))
      : [
          {
            id: `phase_all_${project.id}`,
            title: "Work",
            itemIds: tasks.map((t) => t.id),
          },
        ];

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const inferredBlockers: ProjectBlockerSignal[] =
    input.blockerSignals ??
    open.slice(0, 3).map((t) => ({
      itemId: t.id,
      title: t.title,
      reason: "Incomplete work that may be holding progress",
    }));

  return {
    projectId: project.id,
    projectName: project.name,
    projectGoal: project.goal || project.goals[0] || project.name,
    projectStatus: project.status,
    horizon: project.horizon,
    currentFocus: project.nextAction || null,
    nextStep: project.nextStepSuggestion || null,
    notes: project.notes ?? null,
    phases,
    milestones: input.milestones ?? [],
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      done: t.done,
      parentId: t.parentId ?? null,
      kind: t.kind,
      phaseId:
        phases.find((p) => p.itemIds.includes(t.id))?.id ??
        t.parentId ??
        null,
    })),
    dependencySignals: input.dependencySignals ?? [],
    blockerSignals: inferredBlockers,
    riskSignals: input.riskSignals ?? [],
    openTaskCount: open.length,
    completedTaskCount: done.length,
    conversationId: input.conversationId ?? null,
    selectedTaskId: input.selectedTaskId ?? null,
    currentView: input.currentView ?? null,
    scrollPosition: input.scrollPosition ?? null,
    activeFilters: input.activeFilters ?? [],
    searchQuery: input.searchQuery ?? null,
  };
}

export function inferProjectsVisualPurpose(
  session: ProjectsSessionSnapshot,
  userRequest: string,
): ProjectsVisualPurpose {
  const blob = `${userRequest} ${session.projectGoal} ${session.currentFocus ?? ""}`;
  if (/\b(block|stuck|blocker|waiting)\b/i.test(blob) || session.blockerSignals.length >= 2) {
    return "find_blockers";
  }
  if (/\b(depend|critical path|sequence|order)\b/i.test(blob) || session.dependencySignals.length >= 2) {
    return "identify_dependencies";
  }
  if (/\b(risk|failure|fragile)\b/i.test(blob) || session.riskSignals.length >= 1) {
    return "evaluate_risks";
  }
  if (/\b(progress|status|how far|review)\b/i.test(blob)) {
    return "review_progress";
  }
  if (/\b(phase|milestone|stage)\b/i.test(blob) || session.phases.length >= 3) {
    return "clarify_phases";
  }
  if (/\b(missing|what.?s next|gap)\b/i.test(blob)) {
    return "identify_missing_work";
  }
  if (/\b(owner|who|responsib)\b/i.test(blob)) {
    return "understand_responsibilities";
  }
  if (/\b(meeting|brief|explain to)\b/i.test(blob)) {
    return "prepare_for_meeting";
  }
  if (/\b(flow|workflow|process)\b/i.test(blob)) {
    return "see_project_flow";
  }
  if (session.openTaskCount >= 8) {
    return "organize_complex_work";
  }
  return "understand_execution";
}

function purposeToRecommended(
  purpose: ProjectsVisualPurpose,
): VisualThinkingRecommendedPurpose {
  switch (purpose) {
    case "identify_dependencies":
    case "find_blockers":
      return "clarify_dependencies";
    case "see_project_flow":
    case "clarify_phases":
    case "understand_execution":
      return "understand_sequence";
    case "review_progress":
      return "review_progress";
    case "evaluate_risks":
      return "identify_gaps";
    case "plan_next_steps":
      return "plan_execution";
    case "organize_complex_work":
      return "organize_complex_information";
    case "communicate_plan":
    case "prepare_for_meeting":
      return "communicate_to_others";
    default:
      return "see_the_whole";
  }
}

export function purposeToPresentation(
  purpose: ProjectsVisualPurpose,
): VisualThinkingPresentationType {
  switch (purpose) {
    case "identify_dependencies":
    case "find_blockers":
      return "relationship_view";
    case "see_project_flow":
    case "clarify_phases":
    case "understand_execution":
    case "plan_next_steps":
      return "process_flow";
    case "review_progress":
      return "checklist";
    case "evaluate_risks":
    case "identify_missing_work":
      return "grouped_ideas";
    case "prepare_for_meeting":
    case "communicate_plan":
      return "report";
    case "understand_responsibilities":
      return "grouped_ideas";
    default:
      return "process_flow";
  }
}

/** Alias kept for callers that want a guarded mapping. */
export function purposeToSafePresentation(
  purpose: ProjectsVisualPurpose,
): VisualThinkingPresentationType {
  return purposeToPresentation(purpose);
}

export function buildProjectsRecommendationContext(input: {
  session: ProjectsSessionSnapshot;
  userRequest: string;
  hasProvidedInitialValue: boolean;
}): VisualThinkingRecommendationContext {
  const { session, userRequest } = input;
  const dependencyLabels = session.dependencySignals.map(
    (d) => `${d.fromItemId}→${d.toItemId}`,
  );
  const blockerLabels = session.blockerSignals.map((b) => b.title);

  return {
    sourceExperience: "projects",
    sourceConversationId: session.conversationId,
    sourceSessionId: session.projectId,
    sourceEntityId: session.projectId,
    userRequest,
    requestSummary: session.projectName,
    primaryGoal: session.projectGoal,
    cognitiveTask: purposeToRecommended(
      inferProjectsVisualPurpose(session, userRequest),
    ),
    currentResponseSummary: [
      session.currentFocus ? `Focus: ${session.currentFocus}` : null,
      session.nextStep ? `Next: ${session.nextStep}` : null,
      `${session.openTaskCount} open · ${session.completedTaskCount} done`,
      blockerLabels.length ? `Blockers: ${blockerLabels.slice(0, 4).join("; ")}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    hasProvidedInitialValue: input.hasProvidedInitialValue,
    conceptCount: Math.max(session.tasks.length, session.phases.length),
    relationshipSignals: dependencyLabels.slice(0, 12),
    sequenceSignals: session.phases.map((p) => p.title).slice(0, 12),
    chronologySignals: session.milestones.slice(0, 8),
    comparisonSignals: [],
    decisionSignals: [],
    dependencySignals: [
      ...dependencyLabels.slice(0, 12),
      ...blockerLabels.slice(0, 8),
    ],
    informationVolume:
      session.openTaskCount >= 12
        ? "high"
        : session.openTaskCount >= 5
          ? "medium"
          : "low",
    userConfusionSignals: /\b(stuck|confused|overwhelm|block)\b/i.test(
      userRequest,
    ),
    currentInteractionState: "planning",
    availableVisualPresentations: [
      "process_flow",
      "relationship_view",
      "timeline",
      "checklist",
      "grouped_ideas",
      "training_guide",
    ],
    resultReadiness: {
      eligible: session.tasks.length >= 2 || session.phases.length >= 2,
      substantiveContentAvailable:
        session.tasks.length >= 2 || Boolean(session.currentFocus),
      knowledgeSufficient:
        session.tasks.length >= 2 || session.phases.length >= 1,
      structureSufficient:
        session.dependencySignals.length >= 1 ||
        session.phases.length >= 2 ||
        session.openTaskCount >= 4 ||
        session.blockerSignals.length >= 1,
      researchNeeded: false,
      safePartialAvailable: Boolean(session.projectGoal),
      likelyPresentation: purposeToSafePresentation(
        inferProjectsVisualPurpose(session, userRequest),
      ),
      blockedReasons: [],
    },
    returnContext: {
      sourceExperience: "projects",
      sourceConversationId: session.conversationId,
      sourceSessionId: session.projectId,
      sourceEntityId: session.selectedTaskId,
      resumePrompt: session.nextStep ?? session.currentFocus,
      lessonOrStepPosition: session.selectedTaskId,
      returnRoute: "project-homes",
    },
  };
}

export function analyzeProjectStructure(
  session: ProjectsSessionSnapshot,
): ProjectVisualAnalysis {
  const openIds = new Set(
    session.tasks.filter((t) => !t.done).map((t) => t.id),
  );
  const deps = session.dependencySignals;
  const chains: string[][] = [];
  for (const d of deps.slice(0, 20)) {
    chains.push([d.fromItemId, d.toItemId]);
  }

  const linked = new Set<string>();
  for (const d of deps) {
    linked.add(d.fromItemId);
    linked.add(d.toItemId);
  }
  const isolatedTaskIds = session.tasks
    .filter((t) => !t.done && !linked.has(t.id) && deps.length > 0)
    .map((t) => t.id)
    .slice(0, 12);

  const reverse = new Map<string, string[]>();
  const forward = new Map<string, string[]>();
  for (const d of deps) {
    forward.set(d.fromItemId, [...(forward.get(d.fromItemId) ?? []), d.toItemId]);
    reverse.set(d.toItemId, [...(reverse.get(d.toItemId) ?? []), d.fromItemId]);
  }

  const circularDependencyPairs: Array<{ fromItemId: string; toItemId: string }> =
    [];
  for (const d of deps) {
    const back = forward.get(d.toItemId) ?? [];
    if (back.includes(d.fromItemId)) {
      circularDependencyPairs.push({
        fromItemId: d.fromItemId,
        toItemId: d.toItemId,
      });
    }
  }

  const largePhaseIds = session.phases
    .filter((p) => p.itemIds.length >= 8)
    .map((p) => p.id);

  const singlePointsOfFailure = [...forward.entries()]
    .filter(([, outs]) => outs.length >= 3)
    .map(([id]) => id)
    .slice(0, 8);

  const longChainIds = chains.filter((c) => c.length >= 2).slice(0, 8);

  const parallelOpportunities = session.phases
    .filter((p) => {
      const openInPhase = p.itemIds.filter((id) => openIds.has(id));
      return openInPhase.length >= 2;
    })
    .slice(0, 4)
    .map((p) => ({
      itemIds: p.itemIds.filter((id) => openIds.has(id)).slice(0, 4),
      reason: `Open work in “${p.title}” may be able to move in parallel if there are no hard dependencies.`,
    }));

  const missingDependencyHints: string[] = [];
  if (deps.length === 0 && session.openTaskCount >= 4) {
    missingDependencyHints.push(
      "Several open tasks exist without recorded dependencies — worth checking what must finish first.",
    );
  }

  const overloadedMilestoneLabels = session.milestones.slice(0, 3);

  const executionRiskNotes: string[] = [];
  if (session.blockerSignals.length >= 2) {
    executionRiskNotes.push("Multiple blockers are active.");
  }
  if (circularDependencyPairs.length > 0) {
    executionRiskNotes.push("Circular dependencies were detected.");
  }
  if (singlePointsOfFailure.length > 0) {
    executionRiskNotes.push(
      "Some items sit under many dependents — single points of failure.",
    );
  }

  // Critical path approximation: longest dependency chain among open work
  let criticalPathItemIds: string[] = [];
  for (const chain of longChainIds) {
    if (chain.length > criticalPathItemIds.length) {
      criticalPathItemIds = chain;
    }
  }
  if (criticalPathItemIds.length === 0 && session.blockerSignals[0]) {
    criticalPathItemIds = [session.blockerSignals[0].itemId];
  }

  return {
    criticalPathItemIds,
    dependencyChains: chains,
    circularDependencyPairs,
    isolatedTaskIds,
    overloadedMilestoneLabels,
    missingDependencyHints,
    largePhaseIds,
    executionRiskNotes,
    singlePointsOfFailure,
    longChainIds,
    parallelOpportunities,
  };
}

type SuppressState = SuppressionState;

function loadSuppression(projectId: string): SuppressState {
  if (typeof window === "undefined") {
    return {
      projectId,
      topicDeclines: [],
      suppressSession: false,
      updatedAt: nowIso(),
    };
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_SUPPRESS_KEY);
    const parsed = raw ? (JSON.parse(raw) as SuppressState) : null;
    if (parsed?.projectId === projectId) return parsed;
  } catch {
    /* ignore */
  }
  return {
    projectId,
    topicDeclines: [],
    suppressSession: false,
    updatedAt: nowIso(),
  };
}

function saveSuppression(state: SuppressState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_SUPPRESS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function declineProjectsVisualRecommendation(input: {
  projectId: string;
  topic: string;
  notDuringSession?: boolean;
}): SuppressState {
  const prev = loadSuppression(input.projectId);
  const topicKey = input.topic.trim().toLowerCase();
  const next: SuppressState = {
    ...prev,
    projectId: input.projectId,
    topicDeclines: topicKey
      ? Array.from(new Set([...prev.topicDeclines, topicKey]))
      : prev.topicDeclines,
    suppressSession: input.notDuringSession ? true : prev.suppressSession,
    updatedAt: nowIso(),
  };
  saveSuppression(next);
  recordProjectsVtEvent("recommendation_declined", input.projectId, {
    topic: input.topic,
  });
  return next;
}

export function assessProjectsPilotRecommendation(input: {
  session: ProjectsSessionSnapshot;
  userRequest: string;
  hasProvidedInitialValue: boolean;
}): {
  shared: VisualThinkingRecommendationDecision;
  purpose: ProjectsVisualPurpose;
  invitationVisible: boolean;
} {
  const purpose = inferProjectsVisualPurpose(input.session, input.userRequest);
  const suppression = loadSuppression(input.session.projectId);
  const topicKey = input.session.projectName.trim().toLowerCase();
  const explicit =
    detectsExplicitVisualThinkingIntent(input.userRequest) ||
    /\b(take this to visual thinking|open visual thinking studio|show (me )?the (blockers?|dependencies|critical path))\b/i.test(
      input.userRequest,
    );

  if (suppression.suppressSession && !explicit) {
    const ctx = buildProjectsRecommendationContext(input);
    const shared = assessVisualThinkingRecommendation(ctx);
    return {
      shared: {
        ...shared,
        recommended: false,
        status: "suppressed",
        factors: [...shared.factors, "session_suppress"],
        userFacingMessage: "",
        timing: "do_not_offer",
      },
      purpose,
      invitationVisible: false,
    };
  }

  if (topicKey && suppression.topicDeclines.includes(topicKey) && !explicit) {
    const ctx = buildProjectsRecommendationContext(input);
    const shared = assessVisualThinkingRecommendation(ctx);
    return {
      shared: {
        ...shared,
        recommended: false,
        status: "suppressed",
        factors: [...shared.factors, "topic_declined"],
        userFacingMessage: "",
        timing: "do_not_offer",
      },
      purpose,
      invitationVisible: false,
    };
  }

  const ctx = buildProjectsRecommendationContext(input);
  const shared = assessVisualThinkingRecommendation({
    ...ctx,
    cognitiveTask: purposeToRecommended(purpose),
  });

  const invitationVisible =
    shared.recommended &&
    !shared.explicitlyRequested &&
    Boolean(shared.userFacingMessage) &&
    shared.timing !== "do_not_offer" &&
    shared.timing !== "immediate_explicit";

  return { shared, purpose, invitationVisible };
}

export function userFacingProjectsInvitation(
  purpose: ProjectsVisualPurpose,
  projectName: string,
): string {
  switch (purpose) {
    case "find_blockers":
      return `A visual view may help show what is blocking “${projectName || "this project"}.”`;
    case "identify_dependencies":
      return `Several pieces appear to depend on one another. Seeing those connections may make the path clearer.`;
    case "clarify_phases":
      return `This work unfolds in phases. I can lay out the path so you can see the whole flow.`;
    case "review_progress":
      return `A progress overview may make it easier to see what is finished and what still needs attention.`;
    case "evaluate_risks":
      return `A few risks stand out. Seeing them beside the work may help you decide what to protect first.`;
    default:
      return `A visual view of “${projectName || "this project"}” may make the structure easier to understand.`;
  }
}

export function buildProjectsIntegrationRequest(input: {
  session: ProjectsSessionSnapshot;
  userRequest: string;
  purpose: ProjectsVisualPurpose;
  preferredPresentation: VisualThinkingPresentationType | null;
  eligibleAlternates: VisualThinkingPresentationType[];
  explicitlyRequested: boolean;
  userAcceptedRecommendation: boolean;
  recommendationId: string | null;
}): ProjectsVisualThinkingIntegrationRequest {
  const { session } = input;
  const returnContext: ProjectsReturnContext = {
    projectId: session.projectId,
    projectName: session.projectName,
    selectedTaskId: session.selectedTaskId,
    currentView: session.currentView,
    scrollPosition: session.scrollPosition,
    activeFilters: [...session.activeFilters],
    searchQuery: session.searchQuery,
    conversationId: session.conversationId,
    resumePrompt:
      session.nextStep ??
      session.currentFocus ??
      `Continue with ${session.projectName}`,
    returnRoute: "project-homes",
  };

  const analysis = analyzeProjectStructure(session);
  const projectSummaryForSeed = [
    `Project: ${session.projectName}`,
    `Goal: ${session.projectGoal}`,
    session.currentFocus ? `Current focus: ${session.currentFocus}` : null,
    session.nextStep ? `Next step: ${session.nextStep}` : null,
    `Phases:\n${session.phases.map((p) => `- ${p.title} (${p.itemIds.length} items)`).join("\n")}`,
    `Open tasks:\n${session.tasks
      .filter((t) => !t.done)
      .slice(0, 16)
      .map((t) => `- ${t.title}`)
      .join("\n")}`,
    session.blockerSignals.length
      ? `Blockers:\n${session.blockerSignals
          .slice(0, 6)
          .map((b) => `- ${b.title}: ${b.reason}`)
          .join("\n")}`
      : null,
    analysis.executionRiskNotes.length
      ? `Analysis notes:\n${analysis.executionRiskNotes.map((n) => `- ${n}`).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const request: ProjectsVisualThinkingIntegrationRequest = {
    id: newId("pvt"),
    sourceExperience: "projects",
    sourceConversationId: session.conversationId,
    sourceProjectId: session.projectId,
    originalUserRequest: input.userRequest,
    projectName: session.projectName,
    projectGoal: session.projectGoal,
    currentFocus: session.currentFocus,
    nextStep: session.nextStep,
    requestedVisualPurpose: input.purpose,
    preferredPresentation: input.preferredPresentation,
    eligibleAlternatePresentations: input.eligibleAlternates,
    phaseIds: session.phases.map((p) => p.id),
    milestoneLabels: [...session.milestones],
    taskIds: session.tasks.map((t) => t.id),
    dependencySignals: [...session.dependencySignals],
    blockerSignals: [...session.blockerSignals],
    riskSignals: [...session.riskSignals],
    openTaskCount: session.openTaskCount,
    completedTaskCount: session.completedTaskCount,
    explicitlyRequested: input.explicitlyRequested,
    recommendationId: input.recommendationId,
    userAcceptedRecommendation: input.userAcceptedRecommendation,
    pendingChanges: loadPendingChanges(session.projectId),
    returnContext,
    projectSummaryForSeed,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    integrationVersion: "projects-vt-pilot-1",
  };

  persistProjectsIntegrationRequest(request);
  return request;
}

export function buildWorkspaceProjectsContext(
  request: ProjectsVisualThinkingIntegrationRequest,
  selectedTaskId: string | null = null,
  selectedTaskTitle: string | null = null,
  currentPresentation: string | null = null,
): WorkspaceProjectsContext {
  const ctx: WorkspaceProjectsContext = {
    sourceProjectId: request.sourceProjectId,
    projectName: request.projectName,
    projectGoal: request.projectGoal,
    currentFocus: request.currentFocus,
    selectedTaskId,
    selectedTaskTitle,
    openBlockers: request.blockerSignals.map((b) => b.title),
    currentPresentation,
    returnContext: request.returnContext,
  };
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(WORKSPACE_CTX_KEY, JSON.stringify(ctx));
    } catch {
      /* ignore */
    }
  }
  return ctx;
}

export function projectSelectedProjectsActions(): ProjectsSelectedObjectAction[] {
  return [
    { id: "explain", label: "Explain", coCreationAction: "explain" },
    { id: "expand", label: "Expand", coCreationAction: "expand" },
    {
      id: "find_dependencies",
      label: "Find Dependencies",
      coCreationAction: "expand",
    },
    {
      id: "show_blockers",
      label: "Show Blockers",
      coCreationAction: "find_missing_pieces",
    },
    { id: "research", label: "Research", coCreationAction: "research" },
    { id: "ask_board", label: "Ask Board", coCreationAction: "ask_board" },
    {
      id: "generate_alternatives",
      label: "Generate Alternatives",
      coCreationAction: "generate_alternatives",
    },
    { id: "simplify", label: "Simplify", coCreationAction: "simplify" },
    { id: "add_notes", label: "Add Notes", coCreationAction: "annotate" },
    {
      id: "identify_risks",
      label: "Identify Risks",
      coCreationAction: "find_missing_pieces",
    },
    {
      id: "find_missing_tasks",
      label: "Find Missing Tasks",
      coCreationAction: "find_missing_pieces",
      createsPendingChange: true,
    },
    {
      id: "suggest_next_steps",
      label: "Suggest Next Steps",
      createsPendingChange: true,
    },
    { id: "show_related_work", label: "Show Related Work" },
  ];
}

/**
 * Create a pending execution suggestion — NEVER applied automatically.
 */
export function proposeProjectPendingChange(input: {
  projectId: string;
  kind: ProjectExecutionWritebackKind;
  summary: string;
  affectedItemIds: string[];
  proposedPayload: Record<string, unknown>;
  provenance?: ProjectPendingChange["provenance"];
}): ProjectPendingChange {
  const change: ProjectPendingChange = {
    id: newId("ppc"),
    kind: input.kind,
    summary: input.summary,
    affectedItemIds: input.affectedItemIds,
    proposedPayload: input.proposedPayload,
    status: "pending",
    createdAt: nowIso(),
    provenance: input.provenance ?? "visual_suggestion",
  };
  const list = loadPendingChanges(input.projectId);
  list.push(change);
  savePendingChanges(input.projectId, list);
  recordProjectsVtEvent("pending_change_created", input.projectId, {
    kind: input.kind,
  });
  return change;
}

/**
 * Visual moves / layout experiments must never silently become execution writes.
 */
export function visualOrganizationCreatesExecutionWriteback(): false {
  return false;
}

export function approveProjectPendingChange(input: {
  projectId: string;
  changeId: string;
}): {
  approved: boolean;
  change: ProjectPendingChange | null;
  requiresProjectsApply: true;
} {
  const list = loadPendingChanges(input.projectId);
  const idx = list.findIndex((c) => c.id === input.changeId);
  if (idx < 0) {
    return { approved: false, change: null, requiresProjectsApply: true };
  }
  const change = { ...list[idx]!, status: "approved" as const };
  list[idx] = change;
  savePendingChanges(input.projectId, list);
  recordProjectsVtEvent("pending_change_approved", input.projectId, {
    changeId: input.changeId,
  });
  // Caller (Projects) must apply — this module never mutates Project/ProjectItem stores.
  return { approved: true, change, requiresProjectsApply: true };
}

export function rejectProjectPendingChange(input: {
  projectId: string;
  changeId: string;
}): boolean {
  const list = loadPendingChanges(input.projectId);
  const idx = list.findIndex((c) => c.id === input.changeId);
  if (idx < 0) return false;
  list[idx] = { ...list[idx]!, status: "rejected" };
  savePendingChanges(input.projectId, list);
  return true;
}

export function loadPendingChanges(projectId: string): ProjectPendingChange[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, ProjectPendingChange[]>;
    return all[projectId] ?? [];
  } catch {
    return [];
  }
}

function savePendingChanges(
  projectId: string,
  changes: ProjectPendingChange[],
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    const all = raw
      ? (JSON.parse(raw) as Record<string, ProjectPendingChange[]>)
      : {};
    all[projectId] = changes.slice(-40);
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function buildProjectsReturn(input: {
  request: ProjectsVisualThinkingIntegrationRequest;
  visualThinkingWorkspaceId: string | null;
  activePresentation?: string | null;
  pendingChangeIds?: string[];
  approvedChangeIds?: string[];
  userQuestionIds?: string[];
  annotationIds?: string[];
}): VisualThinkingProjectsReturn {
  const name = input.request.projectName;
  const focus =
    input.request.returnContext.selectedTaskId ??
    input.request.currentFocus ??
    "where you left off";
  return {
    id: newId("pvtr"),
    sourceProjectId: input.request.sourceProjectId,
    visualThinkingWorkspaceId: input.visualThinkingWorkspaceId,
    activePresentation: input.activePresentation ?? null,
    pendingChangeIds: input.pendingChangeIds ?? [],
    approvedChangeIds: input.approvedChangeIds ?? [],
    userQuestionIds: input.userQuestionIds ?? [],
    annotationIds: input.annotationIds ?? [],
    resumeMessage: `Welcome back to “${name}.” You can continue from ${focus}. Pending visual suggestions stay pending until you approve them.`,
    returnContext: input.request.returnContext,
    createdAt: nowIso(),
    returnVersion: "projects-vt-return-1",
  };
}

export function assertProjectsExecutionUnchanged(
  beforeTaskIds: string[],
  afterTaskIds: string[],
  beforeDeps: ProjectDependencySignal[],
  afterDeps: ProjectDependencySignal[],
): boolean {
  if (beforeTaskIds.length !== afterTaskIds.length) return false;
  if (beforeTaskIds.join("|") !== afterTaskIds.join("|")) return false;
  return JSON.stringify(beforeDeps) === JSON.stringify(afterDeps);
}

export function projectsPilotFailureRecovery(projectName: string): {
  stayInProjects: true;
  message: string;
  retryAvailable: true;
} {
  return {
    stayInProjects: true,
    message: `I wasn’t able to open the visual view, but “${projectName || "your project"}” is still here. We can keep working from Projects.`,
    retryAvailable: true,
  };
}

export function persistProjectsIntegrationRequest(
  request: ProjectsVisualThinkingIntegrationRequest,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTEGRATION_KEY, JSON.stringify(request));
  } catch {
    /* ignore */
  }
}

export function loadProjectsIntegrationRequest(): ProjectsVisualThinkingIntegrationRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(INTEGRATION_KEY);
    return raw
      ? (JSON.parse(raw) as ProjectsVisualThinkingIntegrationRequest)
      : null;
  } catch {
    return null;
  }
}

export function loadWorkspaceProjectsContext(): WorkspaceProjectsContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WORKSPACE_CTX_KEY);
    return raw ? (JSON.parse(raw) as WorkspaceProjectsContext) : null;
  } catch {
    return null;
  }
}

export function clearProjectsVtPilotState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(INTEGRATION_KEY);
    window.sessionStorage.removeItem(WORKSPACE_CTX_KEY);
    window.sessionStorage.removeItem(SESSION_SUPPRESS_KEY);
    window.sessionStorage.removeItem(OBS_KEY);
  } catch {
    /* ignore */
  }
}

export function recordProjectsVtEvent(
  type: string,
  projectId: string,
  meta?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    const list: Array<{ type: string; projectId: string; at: string; meta?: typeof meta }> =
      raw ? JSON.parse(raw) : [];
    list.push({ type, projectId, at: nowIso(), meta });
    window.sessionStorage.setItem(OBS_KEY, JSON.stringify(list.slice(-80)));
  } catch {
    /* ignore */
  }
}

export function detectsExplicitProjectsVisualRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (detectsExplicitVisualThinkingIntent(t)) return true;
  if (
    /\b(show (me )?(the )?(blockers?|dependencies|critical path|project (map|flow|overview))|map this project|visualize (this )?project)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

export {
  INTEGRATION_KEY as PROJECTS_VT_INTEGRATION_KEY,
  WORKSPACE_CTX_KEY as PROJECTS_VT_WORKSPACE_CTX_KEY,
};
