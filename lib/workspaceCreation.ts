// Creation workspace — chat beside any draft, template, snippet, or project.

import {
  normalizeArtifactType,
  shouldLockArtifactType,
} from "./artifactType";
import {
  isUnresolvedCreateType,
  userFacingCreateTypeLabel,
} from "./createTypePickers";
import {
  formatSavedArtifactForPrompt,
  type SavedArtifactRecord,
} from "./savedArtifact";
import type { AppSection } from "./companionUi";
import type { CreateWorkflowState } from "./createWorkflow";
import type { WorkspaceSession } from "./workspaceSop";
import { getWorkflow } from "./workspaceSop";

export type CreatePanelContext = {
  section?: AppSection;
  selectedItemName?: string | null;
  draftPreview?: string | null;
};

/** Create split-view — chat + draft canvas, not a step-by-step form wizard. */
export function isCreateWorkspaceChat(ctx: CreatePanelContext | null): boolean {
  return ctx?.section === "content-generator";
}

export type CreationSource =
  | "generated"
  | "chat"
  | "template"
  | "snippet"
  | "project"
  | "email"
  | "content-type";

export type CreationWorkspaceInput = {
  itemType: string;
  title: string;
  draftContent?: string;
  brief?: string;
  stage?: string;
  source?: CreationSource;
  linkedProjectId?: string | null;
  linkedProjectName?: string | null;
  templateId?: string;
  snippetKind?: string;
  /** When true, itemType stays fixed unless the user explicitly changes it. */
  artifactTypeLocked?: boolean;
  /** Panel discovery answers — preserved when opening Work With Shari. */
  createWorkflow?: CreateWorkflowState;
  /** Parent plan/project when this is a child artifact. */
  parentWorkflowTitle?: string | null;
  parentWorkflowPanel?: AppSection | null;
};

export type CreationWorkspaceContext = CreationWorkspaceInput & {
  section: AppSection;
  stage: string;
  draftContent: string;
  artifactTypeLocked: boolean;
};

export function toCreationContext(
  section: AppSection,
  input: CreationWorkspaceInput,
): CreationWorkspaceContext {
  const draft = input.draftContent ?? "";
  const raw = (input.itemType ?? "").trim();
  const itemType = raw ? normalizeArtifactType(raw) : "";
  return {
    section,
    itemType,
    title: input.title,
    draftContent: draft,
    brief: input.brief,
    stage:
      input.stage ??
      (draft.trim() ? "editing draft" : "starting compose"),
    source: input.source,
    linkedProjectId: input.linkedProjectId,
    linkedProjectName: input.linkedProjectName,
    templateId: input.templateId,
    snippetKind: input.snippetKind,
    artifactTypeLocked:
      input.artifactTypeLocked ?? shouldLockArtifactType(itemType),
    parentWorkflowTitle: input.parentWorkflowTitle ?? null,
    parentWorkflowPanel: input.parentWorkflowPanel ?? null,
  };
}

export function formatCreationContextForPrompt(
  ctx: CreationWorkspaceContext | null,
  savedArtifact?: SavedArtifactRecord | null,
): string | undefined {
  if (!ctx) return undefined;

  const displayType = userFacingCreateTypeLabel(ctx.itemType);
  const lines = [
    "CURRENT CREATION WORKSPACE:",
    ...(displayType
      ? [
          `- Creating: ${displayType}${ctx.artifactTypeLocked ? " (LOCKED — do not switch to another format)" : ""}`,
        ]
      : ["- Creating: (type not chosen yet — ask what they want to make)"]),
    `- Title: ${ctx.title || "(untitled)"}`,
    `- Draft exists: ${ctx.draftContent.trim() ? "yes" : "no"}`,
    `- Linked project: ${ctx.linkedProjectName?.trim() || "none"}`,
    `- Current focus: ${ctx.stage}`,
  ];

  if (ctx.source) lines.push(`- Source: ${ctx.source}`);
  if (ctx.snippetKind) lines.push(`- Snippet kind: ${ctx.snippetKind}`);

  if (ctx.draftContent.trim()) {
    lines.push(
      "",
      "DRAFT (editable in panel beside chat — suggest changes; user accepts or edits directly):",
      ctx.draftContent.slice(0, 6000),
    );
  }

  if (ctx.brief?.trim() && ctx.brief !== ctx.draftContent) {
    lines.push("", `Brief / notes: ${ctx.brief.trim().slice(0, 1200)}`);
  }

  if (ctx.parentWorkflowTitle?.trim()) {
    lines.push(
      "",
      `PARENT WORKFLOW: ${ctx.parentWorkflowTitle} (stay in this context — child draft beside chat, not a new generic Create session).`,
    );
  }

  lines.push("", CREATION_COACH_RULES);

  const savedBlock = formatSavedArtifactForPrompt(savedArtifact);
  if (savedBlock) lines.push("", savedBlock);

  return lines.join("\n");
}

export const CREATION_COACH_RULES = `CREATE WORKSPACE RULES (Business Asset Builder — NOT a chat generator, NOT a form wizard):
- The workspace beside chat is the SOURCE OF TRUTH. Chat guides; the panel stores, saves, and exports.
- Never tell the user their work is "in chat" when a draft is visible in Create — it lives in the workspace.
- Chat is a normal conversation: answer questions, explain, brainstorm, research, coach, and review.
- Never mention workflow steps, fields (Audience, Topic, CTA), or "we're on step X".
- When Create is open beside chat, relevant content auto-applies to the draft — NEVER ask "Would you like me to apply/save/add this?"
- User may brainstorm idea lists in chat — those stay in chat until they pick a direction; then auto-apply the chosen content.
- Reference what's already visible (type, title, draft). Never ask "what's your title?" if the title is on screen.
- Reference templates, snippets, business profile, and audience when asked.`;

/** API hint when Create is open beside chat — ChatGPT + Google Docs, not a wizard. */
export function formatCreationCoGuideHint(
  ctx: CreatePanelContext,
  creationContext?: CreationWorkspaceContext | null,
  opts?: { draftVisible?: boolean },
): string {
  const type =
    creationContext?.itemType?.trim() ||
    ctx.selectedItemName?.trim() ||
    "content";
  const title = creationContext?.title?.trim();
  const hasDraft =
    opts?.draftVisible !== false &&
    Boolean(
      creationContext?.draftContent?.trim() || ctx.draftPreview?.trim(),
    );

  const lines = [
    "CREATE WORKSPACE MODE (ACTIVE — draft canvas beside chat):",
    "Behave like ChatGPT beside a Google Doc. Talk naturally. No form wizard.",
    "- Answer questions fully (what makes a good plan, top challenges, examples, etc.).",
    "- Brainstorm, research, coach, explain — never route answers into hidden fields.",
    "- Do NOT mention Audience / Topic / CTA steps or 'current step'.",
    `- Visible work: **${type}**${title ? ` — ${title}` : ""}.`,
    opts?.draftVisible === false
      ? "- The draft is NOT visible in the panel right now. Do NOT tell the user they can see it on screen."
      : hasDraft
        ? "- A draft is visible in the panel. Reference it. Update it automatically when they provide content — do NOT ask permission."
        : "- Help while the draft generates or while they compose in the panel.",
    "- When they share content for the draft: apply it silently to the panel and continue the conversation.",
  ];

  return lines.join("\n");
}

export function buildCreationWorkspaceOpenMessage(
  ctx: CreationWorkspaceContext,
): string {
  const hasDraft = Boolean(ctx.draftContent.trim());
  const displayType = userFacingCreateTypeLabel(ctx.itemType);

  if (hasDraft && displayType) {
    const titlePart = ctx.title.trim() ? ` — **${ctx.title.trim()}**` : "";
    const proj = ctx.linkedProjectName?.trim()
      ? ` It's linked to **${ctx.linkedProjectName.trim()}**.`
      : "";
    return `I can see your **${displayType}** draft beside us${titlePart}.${proj} Ask me anything while you edit — explain, brainstorm, tighten wording, or say what to change.`;
  }

  if (displayType) {
    return `Let's build this **${displayType}** together. Talk through ideas here while you work in the panel beside you.`;
  }

  return "What would you like to create? Pick a type in the panel or tell me here.";
}

/** Skip SOP step-one when user already has a draft open beside chat. */
export function bootstrapSessionForExistingDraft(
  session: WorkspaceSession,
): WorkspaceSession {
  const wf = getWorkflow(session.workflowId);
  const draftStep =
    wf.steps.find((s) => s.id.endsWith("-draft")) ??
    wf.steps[wf.steps.length - 1]!;
  const draftIdx = wf.steps.indexOf(draftStep);
  const completed =
    draftIdx > 0
      ? wf.steps.slice(0, draftIdx).map((s) => s.id)
      : wf.steps.map((s) => s.id);

  return {
    ...session,
    currentStepId: draftStep.id,
    completedStepIds: completed,
    lastAssistantQuestion: null,
    currentStepHint:
      "User already has a draft in the workspace panel. Help refine it — do not restart the SOP from step one.",
    suggestedValue: null,
    suggestedOptions: [],
    pendingConfirmation: false,
  };
}
