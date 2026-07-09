/**
 * Chamber of Momentum™ — project engine (Phase 4).
 * Connects existing project storage to a focused, ADHD-friendly doorway.
 *
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md
 * @see docs/protocols/CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md
 */

import {
  logMomentum,
  saveProject,
  type Project,
  type ProjectStatus,
} from "@/lib/companionStore";
import {
  captureChamberProjectCompletion,
  recordChamberProjectBlockerMemory,
  recordChamberProjectStartMemory,
} from "./chamberOfMomentumMemory";
import { pickChamberCelebrationLine } from "./chamber/chamberDemoContent";
import { recordSparkEstateReviewVersion } from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { suggestWorkshopProjectMilestones } from "./chamber/chamberMemberJourney";
import {
  getChamberProjectMeta,
  saveChamberProjectMeta,
  type ChamberProjectBlockerCategory,
  type ChamberProjectMeta,
  type ChamberProjectMomentumState,
} from "./chamberProjectMeta";

export const CHAMBER_PROJECT_ENTRY_PROMPT =
  "What are you trying to accomplish?";

export const CHAMBER_PROJECT_OUTCOME_EXAMPLES = [
  "Launch my website",
  "Create a course",
  "Finish my book",
  "Organize my business",
  "Create a product",
] as const;

export const CHAMBER_PROJECT_BLOCKER_OPTIONS: {
  id: ChamberProjectBlockerCategory;
  label: string;
}[] = [
  { id: "unclear-next-step", label: "Unclear next step" },
  { id: "too-big", label: "Too big" },
  { id: "missing-information", label: "Missing information" },
  { id: "lack-of-time", label: "Lack of time" },
  { id: "low-energy", label: "Low energy" },
  { id: "fear-or-uncertainty", label: "Fear or uncertainty" },
];

export const CHAMBER_PROJECT_MOMENTUM_LABEL: Record<
  ChamberProjectMomentumState,
  string
> = {
  idea: "Idea",
  exploring: "Exploring",
  active: "Active",
  blocked: "Blocked",
  complete: "Complete",
  archived: "Archived",
};

const VAGUE_NEXT_ACTION_RE =
  /^(?:work on|finish|do|complete|start|continue|make progress on)\b/i;

/** Next actions should be specific and physically possible. */
export function isSpecificNextAction(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  if (VAGUE_NEXT_ACTION_RE.test(trimmed)) return false;
  return true;
}

export function mapProjectStatusToMomentumState(
  status: ProjectStatus,
): ChamberProjectMomentumState {
  switch (status) {
    case "completed":
      return "complete";
    case "paused":
      return "archived";
    case "not-started":
      return "idea";
    case "active-focus":
    case "in-progress":
    default:
      return "active";
  }
}

export function mapMomentumStateToProjectStatus(
  state: ChamberProjectMomentumState,
): ProjectStatus {
  switch (state) {
    case "complete":
      return "completed";
    case "archived":
      return "paused";
    case "idea":
      return "not-started";
    case "exploring":
      return "in-progress";
    case "blocked":
      return "paused";
    case "active":
    default:
      return "active-focus";
  }
}

export function suggestProjectBreakdown(goal: string): string[] {
  const text = goal.trim().toLowerCase();
  if (text.includes("course")) {
    return [
      "Define audience",
      "Outline modules",
      "Create first lesson",
      "Record introduction",
      "Upload content",
    ];
  }
  if (text.includes("website") || text.includes("launch")) {
    return [
      "Write the homepage headline",
      "List the three pages you need",
      "Draft the first page copy",
      "Choose one image or visual",
      "Publish a simple first version",
    ];
  }
  if (text.includes("book")) {
    return [
      "Name the reader you are writing for",
      "Outline the chapters",
      "Write the opening scene",
      "Draft chapter one",
      "Schedule one writing session",
    ];
  }
  if (text.includes("workshop")) {
    return suggestWorkshopProjectMilestones();
  }
  return [
    "Name the desired outcome",
    "List what is already done",
    "Choose the smallest next step",
    "Schedule time for that step",
    "Capture one win when it is done",
  ];
}

export type CreateChamberProjectInput = {
  name: string;
  desiredOutcome: string;
  whyItMatters?: string;
  nextAction: string;
  currentState?: string;
};

export function createChamberProject(
  input: CreateChamberProjectInput,
): Project {
  const projects = saveProject({
    name: input.name.trim(),
    goal: input.desiredOutcome.trim(),
    goals: input.desiredOutcome.trim() ? [input.desiredOutcome.trim()] : [],
    nextAction: input.nextAction.trim(),
    status: "active-focus",
    horizon: "now",
  });
  const project = projects[0]!;
  saveChamberProjectMeta({
    projectId: project.id,
    momentumState: "active",
    desiredOutcome: input.desiredOutcome.trim(),
    whyItMatters: input.whyItMatters?.trim() || "",
    currentStateNote: input.currentState?.trim() || "",
  });
  logMomentum("move", `Started project: ${project.name}`);
  recordChamberProjectStartMemory(project);
  return project;
}

export function recordChamberProjectBlocker(
  projectId: string,
  blocker: ChamberProjectBlockerCategory,
): ChamberProjectMeta {
  const existing = getChamberProjectMeta(projectId);
  recordChamberProjectBlockerMemory(projectId, blocker);
  return saveChamberProjectMeta({
    projectId,
    momentumState: "blocked",
    desiredOutcome: existing?.desiredOutcome,
    whyItMatters: existing?.whyItMatters,
    currentStateNote: existing?.currentStateNote,
    blockerCategory: blocker,
  });
}

export function completeChamberProject(
  projectId: string,
  achievement: string,
  lesson?: string,
): Project | null {
  const projects = saveProject({
    id: projectId,
    status: "completed",
  });
  const project = projects.find((p) => p.id === projectId) ?? null;
  if (!project) return null;

  captureChamberProjectCompletion(project, achievement, lesson);
  recordSparkEstateReviewVersion({
    creationId: project.id,
    title: project.name,
    archetype: "project",
    summary: achievement.trim() || project.name,
    changeNote: lesson?.trim() || undefined,
  });
  const celebration = pickChamberCelebrationLine();
  logMomentum(
    "complete",
    `${celebration} ${achievement.trim() || project.name}`,
  );
  return project;
}

export function chamberProjectSummary(project: Project): {
  momentumState: ChamberProjectMomentumState;
  desiredOutcome: string;
  whyItMatters: string;
  nextAction: string;
  hasSpecificNextAction: boolean;
} {
  const meta = getChamberProjectMeta(project.id);
  const momentumState =
    meta?.momentumState ?? mapProjectStatusToMomentumState(project.status);
  return {
    momentumState,
    desiredOutcome: meta?.desiredOutcome || project.goal,
    whyItMatters: meta?.whyItMatters || "",
    nextAction: project.nextAction,
    hasSpecificNextAction: isSpecificNextAction(project.nextAction),
  };
}
