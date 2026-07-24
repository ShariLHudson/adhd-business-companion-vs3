/**
 * Projects Intelligence Pilot Integration (Build 11) tests.
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Project, ProjectItem } from "@/lib/companionProjectsStore";
import {
  analyzeProjectStructure,
  approveProjectPendingChange,
  assertProjectsExecutionUnchanged,
  assessProjectsVisualThinkingRecommendation,
  buildProjectsRecommendationContext,
  buildProjectsReturnFromVisual,
  buildProjectsSessionSnapshot,
  clearProjectsVtPilotSessionState,
  clearProjectsVtPilotState,
  createVisualThinkingContextFromProjects,
  declineProjectsVisualThinkingRecommendation,
  detectsExplicitProjectsVisualRequest,
  inferProjectsVisualPurpose,
  loadPendingChanges,
  projectProjectsVisualInvitation,
  projectSelectedProjectsActions,
  proposeProjectPendingChange,
  visualMoveMutatesProjectsExecution,
  visualOrganizationCreatesExecutionWriteback,
  type ProjectsSessionSnapshot,
} from "@/lib/projectsIntelligence";

function sampleProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj_launch",
    name: "Product Launch",
    goal: "Ship the spring launch without dropping critical path work",
    goals: ["Ship spring launch"],
    horizon: "now",
    status: "in-progress",
    nextAction: "Unstick the blocked creative review",
    nextStepSuggestion: "Clarify what is blocking creative review",
    notes: "Marketing + product shared ownership",
    color: "#1e4f4f",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-24T00:00:00.000Z",
    ...overrides,
  };
}

function sampleItems(projectId: string): ProjectItem[] {
  return [
    {
      id: "sec_plan",
      projectId,
      kind: "section",
      title: "Plan",
      done: false,
      sortOrder: 0,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "sec_build",
      projectId,
      kind: "section",
      title: "Build",
      done: false,
      sortOrder: 1,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "task_brief",
      projectId,
      parentId: "sec_plan",
      kind: "task",
      title: "Write launch brief",
      done: true,
      sortOrder: 0,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "task_creative",
      projectId,
      parentId: "sec_build",
      kind: "task",
      title: "Creative review",
      done: false,
      sortOrder: 0,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "task_ads",
      projectId,
      parentId: "sec_build",
      kind: "task",
      title: "Prepare ads",
      done: false,
      sortOrder: 1,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
    {
      id: "task_email",
      projectId,
      parentId: "sec_build",
      kind: "task",
      title: "Email sequence",
      done: false,
      sortOrder: 2,
      createdAt: "2026-07-01T00:00:00.000Z",
    },
  ];
}

function installSessionStorage() {
  const store = new Map<string, string>();
  (globalThis as { window: unknown }).window = {
    sessionStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
  };
}

function sessionFromProject(
  overrides: Partial<ProjectsSessionSnapshot> = {},
): ProjectsSessionSnapshot {
  const project = sampleProject();
  const base = buildProjectsSessionSnapshot({
    project,
    items: sampleItems(project.id),
    dependencySignals: [
      { fromItemId: "task_creative", toItemId: "task_ads", label: "ads wait on creative" },
    ],
    blockerSignals: [
      {
        itemId: "task_creative",
        title: "Creative review",
        reason: "Waiting on final copy",
      },
    ],
    milestones: ["Brief approved", "Creative locked", "Launch day"],
    conversationId: "conv_projects_pilot",
    selectedTaskId: "task_creative",
    currentView: "detail",
    scrollPosition: 120,
    activeFilters: ["open"],
    searchQuery: "creative",
  });
  return { ...base, ...overrides };
}

describe("Projects Visual Thinking Pilot Integration (Build 11)", () => {
  beforeEach(() => {
    clearProjectsVtPilotSessionState();
    clearProjectsVtPilotState();
    installSessionStorage();
  });
  afterEach(() => {
    clearProjectsVtPilotSessionState();
    clearProjectsVtPilotState();
    delete (globalThis as { window?: unknown }).window;
  });

  it("builds session snapshot from project + items without inventing a second project", () => {
    const project = sampleProject();
    const snapshot = buildProjectsSessionSnapshot({
      project,
      items: sampleItems(project.id),
    });
    expect(snapshot.projectId).toBe(project.id);
    expect(snapshot.projectName).toBe("Product Launch");
    expect(snapshot.phases.length).toBe(2);
    expect(snapshot.openTaskCount).toBe(3);
    expect(snapshot.completedTaskCount).toBe(1);
    expect(snapshot.tasks.every((t) => t.id.startsWith("task_"))).toBe(true);
  });

  it("recommendation context carries project, phases, blockers, and return route", () => {
    const session = sessionFromProject();
    const ctx = buildProjectsRecommendationContext({
      session,
      userRequest: "I'm stuck on this project.",
      hasProvidedInitialValue: true,
    });
    expect(ctx.sourceExperience).toBe("projects");
    expect(ctx.sourceSessionId).toBe(session.projectId);
    expect(ctx.primaryGoal).toMatch(/launch/i);
    expect(ctx.dependencySignals?.length).toBeGreaterThan(0);
    expect(ctx.returnContext?.returnRoute).toBe("project-homes");
    expect(ctx.hasProvidedInitialValue).toBe(true);
  });

  it("infers blocker purpose when user is stuck", () => {
    const session = sessionFromProject();
    expect(inferProjectsVisualPurpose(session, "I'm stuck on this project.")).toBe(
      "find_blockers",
    );
  });

  it("recommends visual for complex project; not before value; keywords alone do not force", () => {
    const session = sessionFromProject();
    const stuck = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "I'm stuck on this project.",
      hasProvidedInitialValue: true,
    });
    expect(stuck.recommended).toBe(true);
    expect(stuck.primaryActionLabel).toBe("Show Me Visually");
    expect(stuck.keepActionLabel).toBe("Keep Working Here");
    expect(stuck.userFacingMessage).toMatch(/blocking|visual/i);

    const early = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "I'm stuck on this project.",
      hasProvidedInitialValue: false,
    });
    expect(early.recommended).toBe(false);
    expect(early.factors).toContain("timing_before_value");

    const thin = assessProjectsVisualThinkingRecommendation({
      session: sessionFromProject({
        tasks: [
          {
            id: "t1",
            title: "One task",
            done: false,
            parentId: null,
            kind: "task",
            phaseId: null,
          },
        ],
        phases: [{ id: "p1", title: "Work", itemIds: ["t1"] }],
        openTaskCount: 1,
        dependencySignals: [],
        blockerSignals: [],
      }),
      userRequest: "map",
      hasProvidedInitialValue: true,
    });
    expect(thin.recommended).toBe(false);
  });

  it("explicit visual request skips invitation card and opens with project seed", () => {
    expect(
      detectsExplicitProjectsVisualRequest("Show me the blockers visually"),
    ).toBe(true);
    const session = sessionFromProject();
    const rec = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "Open Visual Thinking Studio",
      hasProvidedInitialValue: false,
    });
    expect(rec.recommended).toBe(true);
    expect(rec.recommendationTiming).toBe("explicit_request");
    expect(rec.userFacingMessage).toBe("");

    const invitation = projectProjectsVisualInvitation(rec);
    expect(invitation.visible).toBe(false);

    const adapted = createVisualThinkingContextFromProjects({
      session,
      userRequest: "Open Visual Thinking Studio",
      recommendation: rec,
      explicitlyRequested: true,
      userAcceptedRecommendation: true,
    });
    expect(adapted.integrationRequest.sourceProjectId).toBe(session.projectId);
    expect(adapted.seedRequestText).toContain("Product Launch");
    expect(adapted.seedRequestText).toContain("Creative review");
    expect(adapted.handoff.caller).toBe("projects");
    expect(adapted.handoff.capability).toBe("execution_visualization");
    expect(adapted.workspaceContext.returnContext.selectedTaskId).toBe(
      "task_creative",
    );
  });

  it("analyzes dependencies, circular pairs, and parallel opportunities", () => {
    const session = sessionFromProject({
      dependencySignals: [
        { fromItemId: "a", toItemId: "b" },
        { fromItemId: "b", toItemId: "a" },
        { fromItemId: "task_creative", toItemId: "task_ads" },
      ],
    });
    const analysis = analyzeProjectStructure(session);
    expect(analysis.circularDependencyPairs.length).toBeGreaterThan(0);
    expect(analysis.parallelOpportunities.length).toBeGreaterThan(0);
    expect(analysis.executionRiskNotes.length).toBeGreaterThan(0);
  });

  it("suggestions become pending changes; visual moves never mutate execution", () => {
    expect(visualOrganizationCreatesExecutionWriteback()).toBe(false);
    expect(visualMoveMutatesProjectsExecution()).toBe(false);

    const change = proposeProjectPendingChange({
      projectId: "proj_launch",
      kind: "add_dependency",
      summary: "Ads may depend on creative review",
      affectedItemIds: ["task_creative", "task_ads"],
      proposedPayload: { from: "task_creative", to: "task_ads" },
    });
    expect(change.status).toBe("pending");
    expect(loadPendingChanges("proj_launch").some((c) => c.id === change.id)).toBe(
      true,
    );

    const approved = approveProjectPendingChange({
      projectId: "proj_launch",
      changeId: change.id,
    });
    expect(approved.approved).toBe(true);
    expect(approved.requiresProjectsApply).toBe(true);
    expect(approved.change?.status).toBe("approved");
  });

  it("return restores project context and preserves execution ids", () => {
    const session = sessionFromProject();
    const rec = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "Help me understand this project.",
      hasProvidedInitialValue: true,
    });
    const adapted = createVisualThinkingContextFromProjects({
      session,
      userRequest: "Help me understand this project.",
      recommendation: {
        ...rec,
        recommended: true,
        suggestedPurpose: rec.suggestedPurpose ?? "understand_execution",
      },
      explicitlyRequested: false,
      userAcceptedRecommendation: true,
    });
    const ret = buildProjectsReturnFromVisual({
      request: adapted.integrationRequest,
      sourceProjectId: session.projectId,
      visualThinkingWorkspaceId: "ws_projects_1",
      pendingChangeIds: [],
    });
    expect(ret.returnContext.projectId).toBe(session.projectId);
    expect(ret.returnContext.selectedTaskId).toBe("task_creative");
    expect(ret.returnContext.scrollPosition).toBe(120);
    expect(ret.returnContext.searchQuery).toBe("creative");
    expect(ret.resumeMessage).toMatch(/Welcome back/i);

    expect(
      assertProjectsExecutionUnchanged(
        session.tasks.map((t) => t.id),
        session.tasks.map((t) => t.id),
        session.dependencySignals,
        session.dependencySignals,
      ),
    ).toBe(true);
  });

  it("decline suppresses later invitations for the same project session", () => {
    const session = sessionFromProject();
    declineProjectsVisualThinkingRecommendation({
      projectId: session.projectId,
      projectName: session.projectName,
      notDuringProject: true,
    });
    const second = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "I'm stuck on this project.",
      hasProvidedInitialValue: true,
    });
    expect(second.recommended).toBe(false);
    expect(second.factors).toContain("session_suppress");
  });

  it("exposes selection-scoped project actions", () => {
    const actions = projectSelectedProjectsActions();
    expect(actions.map((a) => a.id)).toEqual(
      expect.arrayContaining([
        "explain",
        "find_dependencies",
        "show_blockers",
        "identify_risks",
        "suggest_next_steps",
      ]),
    );
  });

  it("invitation projection shows Show Me Visually / Keep Working Here", () => {
    const session = sessionFromProject();
    const rec = assessProjectsVisualThinkingRecommendation({
      session,
      userRequest: "I'm stuck on this project.",
      hasProvidedInitialValue: true,
    });
    const invitation = projectProjectsVisualInvitation(rec);
    if (rec.recommended && rec.userFacingMessage) {
      expect(invitation.visible).toBe(true);
      expect(invitation.actions.map((a) => a.id)).toEqual([
        "show_visually",
        "keep_working",
        "not_during_project",
      ]);
    }
  });
});
