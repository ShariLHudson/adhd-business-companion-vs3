/**
 * Global workspace approval sync — one path for every open workspace beside chat.
 * Assistant generates → user approves → pending content writes to the active field.
 * Approval phrases are never saved. Confirm only after a real fill is resolved.
 */

import type { AppSection } from "./companionUi";
import type { WorkspaceContext, WorkspaceFieldId } from "./workspaceAwareness";
import {
  buildWorkspaceFillAck,
  inferAvatarFieldFromContext,
  suggestNextWorkspaceField,
} from "./workspaceAwareness";
import {
  assistantOfferedBuilderAdd,
  extractPendingBuilderContent,
  isBuilderAddCommand,
  isBuilderApprovalPhrase,
  isInvalidBuilderFieldValue,
  tryResolveBuilderApproval,
} from "./builderContentSync";
import {
  tryResolveSectionOptionApproval,
  verifySectionWrite,
} from "./createSectionDiscovery";
import type { CreateWorkflowState } from "./createWorkflow";
import { resolvedTypeLabel } from "./createWorkflow";
import {
  tryResolveSuggestionSelection,
  type SuggestionSelection,
} from "./workspaceSuggestion";
import type { WorkspaceSession } from "./workspaceSop";

export type WorkspaceApprovalFill = {
  field: WorkspaceFieldId;
  value: string;
  stepId?: string;
};

export type WorkspaceApprovalResult = {
  fill: WorkspaceApprovalFill;
  reply: string;
  focusField: WorkspaceFieldId;
  sessionPatch?: WorkspaceSession;
};

/** True when the assistant offered to add generated content to the workspace. */
export function assistantOfferedWorkspaceAdd(assistantText: string): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  if (assistantOfferedBuilderAdd(t)) return true;
  return (
    /\bwould you like (?:to )?(?:use|add|put)\b/i.test(t) ||
    /\b(?:shall|should) i add (?:these|those|this|them)\b/i.test(t) ||
    /\badd (?:these|those) (?:as |to |in )\b/i.test(t)
  );
}

/** Infer which workspace field the pending assistant content targets. */
export function inferPendingApprovalField(
  ctx: WorkspaceContext,
  lastAssistantText: string,
  userText = "",
): WorkspaceFieldId | null {
  const la = lastAssistantText.toLowerCase();

  if (ctx.section === "projects") {
    if (/\b(?:steps?|tasks?)\b/.test(la)) return "project-tasks";
    if (/\bgoals?\b/.test(la)) return "project-goals";
    if (/\boutcome\b/.test(la)) return "project-goal";
    if (/\btitle\b/.test(la)) return "project-title";
    return suggestNextWorkspaceField(ctx, userText)?.field ?? "project-tasks";
  }

  if (ctx.section === "client-avatars") {
    return inferAvatarFieldFromContext(lastAssistantText, userText);
  }

  if (ctx.section === "playbook") {
    if (/\b(?:steps?|plan)\b/.test(la)) return "workshop-sections";
    if (/\b(?:sections?|outline)\b/.test(la)) return "workshop-sections";
    if (/\baudience\b/.test(la)) return "workshop-audience";
    if (/\b(?:story|narrative)\b/.test(la)) return "workshop-story";
    if (/\bexercise\b/.test(la)) return "workshop-exercise";
    if (/\boffer\b/.test(la)) return "workshop-offer";
    if (/\bproblem\b/.test(la)) return "workshop-problem";
    return suggestNextWorkspaceField(ctx, userText)?.field ?? null;
  }

  if (ctx.section === "content-generator") {
    if (/\bsubject\b/.test(la)) return "create-brief";
    if (/\b(?:opening|intro)\b/.test(la)) return "create-brief";
    if (/\b(?:cta|call to action)\b/.test(la)) return "create-cta";
    if (/\bhook\b/.test(la)) return "create-hook";
    return suggestNextWorkspaceField(ctx, userText)?.field ?? "create-brief";
  }

  return suggestNextWorkspaceField(ctx, userText)?.field ?? null;
}

export function isWorkspaceApprovalMessage(text: string): boolean {
  return isBuilderAddCommand(text) || isBuilderApprovalPhrase(text);
}

/** Split bullet/numbered lists into individual task lines for project-tasks. */
export function normalizeApprovalFillValue(
  field: WorkspaceFieldId,
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (field !== "project-tasks") return trimmed;

  const lines = trimmed
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[*•\-]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  return lines.length ? lines.join("\n") : trimmed;
}

function approvalFromSuggestion(
  selection: SuggestionSelection,
  field: WorkspaceFieldId,
  ctx: WorkspaceContext,
): WorkspaceApprovalResult | null {
  const value = normalizeApprovalFillValue(field, selection.value);
  if (isInvalidBuilderFieldValue(value)) return null;
  return {
    fill: { field, value },
    reply: buildWorkspaceFillAck({ field, value }, ctx, "medium"),
    focusField: field,
  };
}

function approvalFromBuilderContent(
  userText: string,
  lastAssistantText: string,
  field: WorkspaceFieldId,
  ctx: WorkspaceContext,
): WorkspaceApprovalResult | null {
  const resolved = tryResolveBuilderApproval(userText, lastAssistantText, field);
  if (!resolved) return null;
  const value = normalizeApprovalFillValue(field, resolved.value);
  if (isInvalidBuilderFieldValue(value, userText)) return null;
  return {
    fill: { field, value },
    reply: buildWorkspaceFillAck({ field, value }, ctx, "medium"),
    focusField: field,
  };
}

/** Create split-screen: numbered option pick for active template section. */
function tryCreateSectionApproval(
  userText: string,
  workflow: CreateWorkflowState,
  lastAssistantText: string,
  ctx: WorkspaceContext,
): WorkspaceApprovalResult | null {
  if (workflow.questionMode !== "split_screen") return null;
  const pick = tryResolveSectionOptionApproval(
    userText,
    workflow,
    lastAssistantText,
  );
  if (!pick && workflow.activeSectionId && isBuilderAddCommand(userText)) {
    const pending = extractPendingBuilderContent(lastAssistantText);
    const sectionId = workflow.activeSectionId;
    if (
      pending &&
      verifySectionWrite(workflow, sectionId, pending)
    ) {
      const sections = workflow.templateSections ?? [];
      const section = sections.find((s) => s.id === sectionId);
      const label = section?.label ?? sectionId;
      return {
        fill: { field: "create-brief", value: pending },
        reply: `Added to **${label}**:\n${pending}`,
        focusField: "create-brief",
      };
    }
  }
  if (!pick) return null;
  if (!verifySectionWrite(workflow, pick.sectionId, pick.value)) return null;

  const sections =
    workflow.templateSections ??
    [];
  const section = sections.find((s) => s.id === pick.sectionId);
  const label = section?.label ?? pick.sectionId;

  return {
    fill: { field: "create-brief", value: pick.value },
    reply: `Added to **${label}**:\n${pick.value}`,
    focusField: "create-brief",
  };
}

/**
 * Resolve a user approval into a workspace fill — shared by all workspace coaches.
 * Returns null when the message is not an approval or no pending content exists.
 */
export function tryResolveWorkspaceApprovalTurn(opts: {
  userText: string;
  lastAssistantText: string;
  ctx: WorkspaceContext;
  sopSession?: WorkspaceSession | null;
  createWorkflow?: CreateWorkflowState | null;
}): WorkspaceApprovalResult | null {
  const { userText, lastAssistantText, ctx, sopSession, createWorkflow } = opts;
  const trimmed = userText.trim();
  if (!trimmed || !isWorkspaceApprovalMessage(trimmed)) return null;

  const pendingContent = extractPendingBuilderContent(lastAssistantText);
  const offered = assistantOfferedWorkspaceAdd(lastAssistantText);
  if (!pendingContent && !offered) {
    const selection = tryResolveSuggestionSelection(
      trimmed,
      sopSession ?? null,
      lastAssistantText,
    );
    if (!selection) return null;
  }

  if (createWorkflow && ctx.section === "content-generator") {
    const createApproval = tryCreateSectionApproval(
      trimmed,
      createWorkflow,
      lastAssistantText,
      ctx,
    );
    if (createApproval) return createApproval;
  }

  const field =
    inferPendingApprovalField(ctx, lastAssistantText, trimmed) ??
    suggestNextWorkspaceField(ctx, trimmed)?.field;
  if (!field) return null;

  const selection = tryResolveSuggestionSelection(
    trimmed,
    sopSession ?? null,
    lastAssistantText,
  );
  if (selection) {
    return approvalFromSuggestion(selection, field, ctx);
  }

  return approvalFromBuilderContent(trimmed, lastAssistantText, field, ctx);
}

export function workspaceApprovalSyncHintForChat(section: AppSection): string {
  return [
    "WORKSPACE APPROVAL SYNC (mandatory):",
    `- Active workspace: ${section}.`,
    "- When you generate a list or draft, end with a clear offer: Would you like me to add these?",
    "- On yes / use that / add these: the APP generates the content — never save the approval phrase.",
    "- Confirm what was added only after the workspace field updates.",
    "- Continue from the current workspace state — do not restart discovery.",
  ].join("\n");
}
