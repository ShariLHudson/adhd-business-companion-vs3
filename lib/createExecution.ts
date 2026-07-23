/**
 * Create → Project → Google execution bridge.
 */

import { classifyArtifactFamily } from "./artifactDestinations";
import { saveProject } from "./companionStore";
import { createSavedWork, linkSavedWorkToProject } from "./savedWorkStore";
import { contentToSheetCsv } from "./googleSheetContent";
import { upsertDocumentMetadata } from "./documentMetadataStore";
import type { GoogleFileKind } from "./googleWorkspace";
import {
  saveProjectExecutionLink,
  type ProjectExecutionLinkKind,
} from "./projectExecutionLinks";
import {
  buildMilestonePlan,
  extractTasksFromDocument,
  saveProjectStructure,
  suggestMilestones,
} from "./projectStructure";

export type ExecutionCapability = {
  canBecomeProject: boolean;
  canExtractTasks: boolean;
  canExportSheet: boolean;
  suggestedProjectName: string;
  suggestedGoal: string;
  suggestedMilestones: string[];
};

const PROJECTABLE_TYPES =
  /\b(sop|marketing plan|business plan|workshop|course|launch|calendar|research|proposal|action plan|plan|outline|strategy)\b/i;

const HEADING_RE = /^#{1,3}\s+(.+)$/m;

export function detectExecutionCapability(
  artifactType: string,
  body: string,
): ExecutionCapability {
  const type = artifactType.trim();
  const text = body.trim();
  const canBecomeProject =
    PROJECTABLE_TYPES.test(type) || text.length > 200;
  const tasks = extractTasksFromDocument(text);
  const title = suggestProjectName(type, text);
  const milestones = suggestMilestones(type, text);

  return {
    canBecomeProject,
    canExtractTasks: tasks.length >= 2,
    canExportSheet:
      /\b(calendar|plan|launch|action|task|checklist|timeline)\b/i.test(
        type,
      ) || tasks.length >= 3,
    suggestedProjectName: title,
    suggestedGoal: suggestProjectGoal(type, text),
    suggestedMilestones: milestones,
  };
}

export function suggestProjectName(artifactType: string, body: string): string {
  const heading = body.match(HEADING_RE)?.[1]?.trim();
  if (heading && heading.length < 80) return heading.replace(/^#+\s*/, "");
  const type = artifactType.trim();
  if (type && type !== "Draft" && type !== "Document") return type;
  const first = body.split("\n").find((l) => l.trim().length > 3)?.trim();
  return first?.slice(0, 60) || "New Project";
}

function suggestProjectGoal(artifactType: string, body: string): string {
  const type = artifactType.toLowerCase();
  if (type.includes("launch")) {
    return "Execute the launch plan with clear milestones and accountability.";
  }
  if (type.includes("workshop")) {
    return "Deliver a polished workshop experience from outline to delivery.";
  }
  if (type.includes("marketing")) {
    return "Implement the marketing plan with trackable next steps.";
  }
  const preview = body.replace(/\s+/g, " ").trim().slice(0, 160);
  return preview || "Turn this document into actionable work.";
}

export { extractTasksFromDocument } from "./projectStructure";

export type CreateProjectFromDocumentResult = {
  projectId: string;
  projectName: string;
  milestoneCount: number;
  taskCount: number;
  savedWorkId: string;
  tasks: string[];
};

export function createProjectFromDocument(input: {
  title: string;
  artifactType: string;
  body: string;
  tasks?: string[];
}): CreateProjectFromDocumentResult {
  const cap = detectExecutionCapability(input.artifactType, input.body);
  const projectName = input.title.trim() || cap.suggestedProjectName;
  const milestonePlan = input.tasks?.length
    ? buildMilestonePlan(input.artifactType, input.body).map((m, i) =>
        i === 0 ? { ...m, tasks: [...m.tasks, ...input.tasks!] } : m,
      )
    : buildMilestonePlan(input.artifactType, input.body);

  const flatTasks = milestonePlan.flatMap((m) => [
    ...m.tasks,
    ...(m.notes ?? []),
  ]);

  const projects = saveProject({
    name: projectName,
    goal: cap.suggestedGoal,
    goals: cap.suggestedMilestones,
    nextAction: flatTasks[0] ?? "Review the plan and pick the first step",
    status: "in-progress",
    horizon: "now",
  });
  const projectId = projects[0]!.id;

  const { milestoneCount, taskCount } = saveProjectStructure(
    projectId,
    milestonePlan,
  );

  const saved = createSavedWork({
    title: projectName,
    artifactType: input.artifactType || "Document",
    body: input.body,
    sourceWorkspace: "content-generator",
    tags: ["execution", "project-source"],
  });
  linkSavedWorkToProject(saved.id, projectId, projectName);

  return {
    projectId,
    projectName,
    milestoneCount,
    taskCount,
    savedWorkId: saved.id,
    tasks: flatTasks,
  };
}

export function linkGoogleAssetToProject(
  projectId: string,
  asset: {
    kind: ProjectExecutionLinkKind;
    url: string;
    fileId?: string;
    label: string;
  },
): void {
  saveProjectExecutionLink({
    projectId,
    kind: asset.kind,
    url: asset.url,
    fileId: asset.fileId,
    label: asset.label,
  });
  const googleKind: GoogleFileKind =
    asset.kind === "sheet"
      ? "sheet"
      : asset.kind === "form"
        ? "form"
        : "doc";
  upsertDocumentMetadata({
    title: asset.label,
    type: asset.label,
    googleUrl: asset.url,
    googleFileId: asset.fileId,
    googleKind,
    projectId,
  });
}

export function buildTaskSheetCsv(tasks: string[]): string {
  const body = ["Task List", ...tasks.map((t) => `- ${t}`)].join("\n");
  return contentToSheetCsv(body);
}

export type ExecutionActionId =
  | "add-to-project"
  | "create-project"
  | "action-plan"
  | "task-list"
  | "google-doc"
  | "google-sheet"
  | "download-pdf";

export function executionActionsForCapability(
  cap: ExecutionCapability,
): ExecutionActionId[] {
  const actions: ExecutionActionId[] = [];
  if (cap.canBecomeProject) {
    actions.push("create-project");
    actions.push("add-to-project");
  }
  if (cap.canExtractTasks) {
    actions.push("action-plan");
    actions.push("task-list");
  }
  actions.push("google-doc");
  // Sheets only when the artifact family is actually a spreadsheet
  // (not merely "plan/calendar" wording that used to over-trigger).
  if (cap.canExportSheet) {
    /* retained on capability for task extraction callers */
  }
  return actions;
}

export function executionActionsForArtifact(
  artifactType: string,
  body: string,
): ExecutionActionId[] {
  const cap = detectExecutionCapability(artifactType, body);
  const actions = executionActionsForCapability(cap);
  const family = classifyArtifactFamily(artifactType, body);
  if (family === "spreadsheet") {
    actions.push("google-sheet");
  }
  if (family === "document" || family === "other" || family === "presentation") {
    actions.push("download-pdf");
  }
  return actions;
}
