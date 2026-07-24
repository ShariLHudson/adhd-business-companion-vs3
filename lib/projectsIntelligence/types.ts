/**
 * Projects Intelligence — pilot contracts for Visual Thinking integration.
 * Projects owns execution. Visual Thinking owns understanding / organization.
 */

import type { Project, ProjectItem, ProjectStatus } from "@/lib/companionProjectsStore";

export type ProjectsVisualPurpose =
  | "understand_execution"
  | "identify_dependencies"
  | "find_blockers"
  | "see_project_flow"
  | "organize_complex_work"
  | "clarify_phases"
  | "review_progress"
  | "identify_missing_work"
  | "understand_responsibilities"
  | "plan_next_steps"
  | "evaluate_risks"
  | "prepare_for_meeting"
  | "communicate_plan";

/** Optional dependency edge — Projects store may not yet persist these. */
export type ProjectDependencySignal = {
  fromItemId: string;
  toItemId: string;
  label?: string | null;
};

export type ProjectBlockerSignal = {
  itemId: string;
  title: string;
  reason: string;
};

export type ProjectRiskSignal = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  relatedItemIds: string[];
};

/**
 * Scoped project snapshot for VT handoff — never dump the full Projects library.
 */
export type ProjectsSessionSnapshot = {
  projectId: string;
  projectName: string;
  projectGoal: string;
  projectStatus: ProjectStatus;
  horizon: Project["horizon"];
  currentFocus: string | null;
  nextStep: string | null;
  notes: string | null;
  /** Sections act as phases when first-class phases are absent. */
  phases: Array<{ id: string; title: string; itemIds: string[] }>;
  milestones: string[];
  tasks: Array<{
    id: string;
    title: string;
    done: boolean;
    parentId: string | null;
    kind: ProjectItem["kind"];
    phaseId: string | null;
  }>;
  dependencySignals: ProjectDependencySignal[];
  blockerSignals: ProjectBlockerSignal[];
  riskSignals: ProjectRiskSignal[];
  openTaskCount: number;
  completedTaskCount: number;
  conversationId: string | null;
  selectedTaskId: string | null;
  currentView: string | null;
  scrollPosition: number | null;
  activeFilters: string[];
  searchQuery: string | null;
};

export type ProjectsReturnContext = {
  projectId: string;
  projectName: string;
  selectedTaskId: string | null;
  currentView: string | null;
  scrollPosition: number | null;
  activeFilters: string[];
  searchQuery: string | null;
  conversationId: string | null;
  resumePrompt: string | null;
  returnRoute: "project-homes" | "goals-projects" | "projects";
};

export type ProjectExecutionWritebackKind =
  | "group_tasks"
  | "add_dependency"
  | "remove_dependency"
  | "change_owner"
  | "change_date"
  | "change_priority"
  | "change_status"
  | "add_task"
  | "rename_milestone"
  | "reorder_phase";

/**
 * Pending suggestion only — never applied without explicit approval.
 */
export type ProjectPendingChange = {
  id: string;
  kind: ProjectExecutionWritebackKind;
  summary: string;
  affectedItemIds: string[];
  proposedPayload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  provenance: "visual_suggestion" | "user_request" | "analysis";
};
