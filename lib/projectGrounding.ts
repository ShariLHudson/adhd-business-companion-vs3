/**
 * Project grounding — AI may only reference project fields that exist in the
 * data model AND are visible in the current Projects workspace view.
 */

import type { WorkspacePanelDetail } from "./workspaceAwareness";

/** Fields the user can see and edit in the Projects workspace (by view). */
export type VisibleProjectField =
  | "name"
  | "outcome"
  | "goals"
  | "nextStep"
  | "horizon"
  | "status"
  | "color"
  | "tasks"
  | "timeBlocks"
  | "notes"
  | "conversations"
  | "files";

export type ProjectGroundingSnapshot = {
  view: WorkspacePanelDetail["view"];
  stage?: string;
  visibleFields: VisibleProjectField[];
  /** Human labels for visible fields (for prompt). */
  visibleLabels: string[];
  /** Fields that exist in the model but are NOT on screen right now. */
  hiddenFromUser: string[];
  values: {
    name?: string | null;
    outcome?: string | null;
    nextStep?: string | null;
    horizon?: string | null;
    status?: string | null;
    color?: string | null;
    conversationCount?: number;
    fileCount?: number;
  };
};

const FIELD_LABEL: Record<VisibleProjectField, string> = {
  name: "Project name",
  outcome: "Outcome (why it matters)",
  goals: "Goals",
  nextStep: "Next step",
  horizon: "Time horizon",
  status: "Status",
  color: "Project color",
  tasks: "Tasks & sections",
  timeBlocks: "Time blocks",
  notes: "Notes",
  conversations: "Conversations",
  files: "Files",
};

/** Internal / removed concepts the AI must never cite as project fields. */
export const FORBIDDEN_PROJECT_REFERENCES = [
  "priority",
  "priority field",
  "milestone",
  "milestones",
  "deadline field",
  "outcome field",
  "goal field",
  "internal schema",
  "project priority",
] as const;

function isCreateTitleStage(ctx: WorkspacePanelDetail): boolean {
  return (
    ctx.view === "create" &&
    Boolean(ctx.stage?.includes("title") && !ctx.stage?.includes("outcome"))
  );
}

function isCreateOutcomeStage(ctx: WorkspacePanelDetail): boolean {
  return ctx.view === "create" && Boolean(ctx.stage?.includes("outcome"));
}

function isDetailHorizonNow(ctx: WorkspacePanelDetail): boolean {
  return ctx.selectedItemHorizon === "Now";
}

/** Which project fields are on screen for the user right now. */
export function visibleProjectFields(
  ctx: WorkspacePanelDetail,
): VisibleProjectField[] {
  if (ctx.view === "list") {
    const fields: VisibleProjectField[] = ["name"];
    if (ctx.showProjectColor) fields.push("color");
    return fields;
  }
  if (ctx.view === "create") {
    if (isCreateTitleStage(ctx)) return ["name"];
    if (isCreateOutcomeStage(ctx)) return ["name", "outcome"];
    return ["name"];
  }
  if (ctx.view === "detail") {
    const fields: VisibleProjectField[] = [
      "name",
      "outcome",
      "goals",
      "horizon",
      "status",
      "color",
      "tasks",
      "timeBlocks",
      "notes",
      "conversations",
      "files",
    ];
    if (isDetailHorizonNow(ctx)) fields.push("nextStep");
    return fields;
  }
  return [];
}

export function buildProjectGrounding(
  ctx: WorkspacePanelDetail,
): ProjectGroundingSnapshot {
  const visible = visibleProjectFields(ctx);
  const allModelFields: VisibleProjectField[] = [
    "name",
    "outcome",
    "goals",
    "nextStep",
    "horizon",
    "status",
    "color",
    "tasks",
    "timeBlocks",
    "notes",
    "conversations",
    "files",
  ];
  const hiddenFromUser = allModelFields
    .filter((f) => !visible.includes(f))
    .map((f) => FIELD_LABEL[f]);

  return {
    view: ctx.view,
    stage: ctx.stage,
    visibleFields: visible,
    visibleLabels: visible.map((f) => FIELD_LABEL[f]),
    hiddenFromUser,
    values: {
      name: ctx.selectedItemName,
      outcome: ctx.selectedItemGoal,
      nextStep: ctx.nextAction,
      horizon: ctx.selectedItemHorizon,
      status: ctx.selectedItemStatus,
      color: ctx.selectedItemColor,
      conversationCount: ctx.projectConversationCount,
      fileCount: ctx.projectFileCount,
    },
  };
}

export function isProjectFieldVisible(
  field: VisibleProjectField,
  ctx: WorkspacePanelDetail,
): boolean {
  return visibleProjectFields(ctx).includes(field);
}

/** User-facing missing-info line — never names internal field ids. */
export function groundedMissingPrompt(
  field: VisibleProjectField,
  ctx: WorkspacePanelDetail,
): string {
  if (!isProjectFieldVisible(field, ctx)) {
    return "What would success look like for this project?";
  }
  switch (field) {
    case "outcome":
      return "I don't see a clear outcome yet. Would you like to add one?";
    case "nextStep":
      return "I don't see a next step on screen yet. Want to add one?";
    case "name":
      return "What would you like to call this project?";
    default:
      return "What would success look like for this project?";
  }
}

/** Coach reason for the model — no internal field names. */
export function groundedCoachReason(
  field: VisibleProjectField,
  ctx: WorkspacePanelDetail,
): string {
  if (!isProjectFieldVisible(field, ctx)) {
    return "Ask what success looks like — only reference what is on screen.";
  }
  const v = buildProjectGrounding(ctx).values;
  switch (field) {
    case "name":
      return v.name?.trim()
        ? "Confirm or refine the project name on screen."
        : "No project name visible yet — start there.";
    case "outcome":
      return v.outcome?.trim()
        ? "Outcome is on screen — confirm or refine it."
        : "No clear outcome on screen yet — invite them to add one.";
    case "nextStep":
      return v.nextStep?.trim()
        ? "Next step is visible — help refine it."
        : "No next step on screen yet — suggest one small step.";
    case "horizon":
      return "Horizon is visible in the project overview.";
    case "status":
      return "Status is visible in the project overview.";
    case "color":
      return "Project color is visible in the overview.";
    case "conversations":
      return "Past companion chats for this project are listed in Conversations.";
    case "files":
      return "Exported docs and saved links are listed in Files.";
    default:
      return "Guide using only what they can see in Projects.";
  }
}

export function formatProjectGroundingForPrompt(
  ctx: WorkspacePanelDetail,
): string {
  const g = buildProjectGrounding(ctx);
  const lines = [
    "PROJECT GROUNDING (mandatory when discussing this project):",
    "- Read ONLY the project data below. Do not infer, assume, or hallucinate.",
    "- Reference ONLY fields listed under VISIBLE — never hidden or internal fields.",
    `- VISIBLE on screen: ${g.visibleLabels.join(", ") || "project list only"}`,
  ];

  if (g.hiddenFromUser.length) {
    lines.push(
      `- NOT on screen (do NOT mention): ${g.hiddenFromUser.join(", ")}`,
    );
  }

  lines.push(
    "- Never say: priority, milestones, outcome field, goal field, or other schema terms.",
    "- If something is missing and the field IS visible, say e.g. \"I don't see a clear outcome yet\" — not \"your outcome field is empty.\"",
    "- If the field is NOT visible, ask: \"What would success look like for this project?\"",
  );

  if (g.values.name?.trim()) {
    lines.push(`- Project name on screen: ${g.values.name.trim()}`);
  }
  if (
    isProjectFieldVisible("outcome", ctx) &&
    g.values.outcome?.trim()
  ) {
    lines.push(`- Outcome on screen: ${g.values.outcome.trim()}`);
  } else if (
    isProjectFieldVisible("outcome", ctx) &&
    !g.values.outcome?.trim()
  ) {
    lines.push("- Outcome: not filled in yet (user can add in Overview)");
  }
  if (isProjectFieldVisible("nextStep", ctx)) {
    if (g.values.nextStep?.trim()) {
      lines.push(`- Next step on screen: ${g.values.nextStep.trim()}`);
    } else {
      lines.push("- Next step: not set yet");
    }
  }
  if (isProjectFieldVisible("horizon", ctx) && g.values.horizon) {
    lines.push(`- Horizon on screen: ${g.values.horizon}`);
  }
  if (isProjectFieldVisible("status", ctx) && g.values.status) {
    lines.push(`- Status on screen: ${g.values.status}`);
  }
  if (isProjectFieldVisible("color", ctx) && g.values.color) {
    lines.push(`- Project color on screen: ${g.values.color}`);
  }
  if (isProjectFieldVisible("conversations", ctx)) {
    const n = g.values.conversationCount ?? 0;
    lines.push(
      n > 0
        ? `- Conversations on screen: ${n} saved chat${n === 1 ? "" : "s"} with Shari`
        : "- Conversations: none saved yet for this project",
    );
  }
  if (isProjectFieldVisible("files", ctx)) {
    const n = g.values.fileCount ?? 0;
    lines.push(
      n > 0
        ? `- Files on screen: ${n} linked doc${n === 1 ? "" : "s"} or link${n === 1 ? "" : "s"}`
        : "- Files: none linked yet — exports from Create appear here",
    );
  }

  return lines.join("\n");
}

export const PROJECT_GROUNDING_RULE = `PROJECT GROUNDING RULE
When discussing a project, only reference fields that exist in the project workspace AND are visible to the user right now.
Never reference hidden fields, old schema fields, removed fields, priority, milestones, or internal data structures.
Before advising, read the actual project context provided — do not infer or assume.
If information is missing and the field is visible: "I don't see a clear outcome yet. Would you like to add one?" (not "your outcome field is empty").
If the field is not on screen: "What would success look like for this project?"`;
