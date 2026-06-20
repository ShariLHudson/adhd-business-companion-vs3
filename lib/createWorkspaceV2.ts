/**
 * Create V2 — workspace-first, chat-support-only.
 * The user edits sections directly; chat brainstorms but never auto-fills the workspace.
 */

import type { CreateBuilderSession } from "./createBuilderChat";
import {
  assistantOfferedBuilderAdd,
  extractPendingBuilderContent,
  isBuilderAddCommand,
} from "./builderContentSync";
import { tryResolveSectionOptionApproval } from "./createSectionDiscovery";
import { assistantOfferedWorkspaceAdd } from "./workspaceApprovalSync";
import { findCatalogItem } from "./createCatalog";
import {
  defaultTemplateFor,
  findCustomTemplate,
  initializeTemplateForWorkflow,
  listAllTemplatesForItem,
  newSectionId,
  resolveTemplateSections,
  saveCustomTemplate,
  type CreateTemplateSection,
  type SavedCustomTemplate,
} from "./createTemplates";
import { effectiveSubtypeLabel, OTHER_OPTION, userFacingCreateTypeLabel } from "./createTypePickers";
import {
  advanceAfterCustomItem,
  advanceAfterItemPick,
  categoryIdForType,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "./createWorkflow";
export const CREATE_WORKSPACE_V2 = true;

/** Blueprint-backed types for workspace-first Create. */
export const CREATE_V2_BLUEPRINT_TYPES = [
  "Email",
  "Newsletter",
  "Lead Magnet",
  "Workshop",
  "Course Outline",
  "SOP",
  "Landing Page",
  "Social Post",
  OTHER_OPTION,
] as const;

export type WorkspaceV2SectionView = CreateTemplateSection & {
  content: string;
  skipped: boolean;
};

export function isCreateV2BlueprintType(typeLabel: string | null | undefined): boolean {
  const t = typeLabel?.trim();
  if (!t) return false;
  if (t === OTHER_OPTION) return true;
  return CREATE_V2_BLUEPRINT_TYPES.includes(
    t as (typeof CREATE_V2_BLUEPRINT_TYPES)[number],
  );
}

export function shouldUseCreateBuilderChatTurns(): boolean {
  return !CREATE_WORKSPACE_V2;
}

export function initializeWorkspaceV2Workflow(
  typeLabel: string,
  customLabel?: string,
): CreateWorkflowState {
  const trimmed = typeLabel.trim();
  const catalogItem = findCatalogItem(trimmed);
  const picked = catalogItem
    ? advanceAfterItemPick(trimmed)
    : trimmed === OTHER_OPTION
      ? advanceAfterCustomItem(customLabel?.trim() || "Custom")
      : advanceAfterCustomItem(customLabel?.trim() || trimmed);

  const itemType = resolvedTypeLabel(picked) || trimmed;
  const preset = defaultTemplateFor(itemType, picked.selectedSubtype);
  const withTemplate = initializeTemplateForWorkflow({
    ...picked,
    categoryId: categoryIdForType(itemType) ?? picked.categoryId,
    selectedTypeLabel: trimmed === OTHER_OPTION ? OTHER_OPTION : trimmed,
    customTypeLabel:
      trimmed === OTHER_OPTION ? customLabel?.trim() || "Custom" : picked.customTypeLabel,
    step: "discovery",
    questionMode: "split_screen",
    useTemplate: true,
    sectionContent: {},
    skippedSectionIds: [],
    discoveryAnswers: {},
    discoverySubphase: null,
    activeSectionId: null,
    pendingFieldApproval: null,
    discoveryIndex: 0,
    templateSections: [...preset.sections],
    selectedTemplateId: preset.id,
    selectedTemplateName: preset.name,
    workspaceFirst: true,
  });
  return withTemplate;
}

export function workspaceV2Sections(
  workflow: CreateWorkflowState,
): WorkspaceV2SectionView[] {
  const sections = resolveTemplateSections(workflow) ?? [];
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  const content = workflow.sectionContent ?? {};
  return sections.map((s) => ({
    ...s,
    content: content[s.id] ?? "",
    skipped: skipped.has(s.id),
  }));
}

export function workspaceV2HasBuildableContent(workflow: CreateWorkflowState): boolean {
  return workspaceV2Sections(workflow).some(
    (s) => s.skipped || Boolean(s.content.trim()),
  );
}

export function buildWorkspaceV2Brief(workflow: CreateWorkflowState): string {
  const typeLabel = resolvedTypeLabel(workflow);
  const subtype = effectiveSubtypeLabel(
    workflow.selectedSubtype,
    workflow.customSubtype,
  );
  const header = subtype
    ? `Creating: ${typeLabel} (${subtype})`
    : `Creating: ${typeLabel}`;

  const lines = workspaceV2Sections(workflow)
    .map((s) => {
      if (s.skipped) return `${s.label}\n[Section marked N/A — omit or minimize in draft]`;
      if (!s.content.trim()) return null;
      return `${s.label}\n${s.content.trim()}`;
    })
    .filter(Boolean) as string[];

  if (!lines.length) return header;
  return `${header}\n\n${lines.join("\n\n")}`;
}

export function updateWorkspaceV2SectionContent(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
): CreateWorkflowState {
  const skipped = (workflow.skippedSectionIds ?? []).filter((id) => id !== sectionId);
  return {
    ...workflow,
    skippedSectionIds: skipped,
    sectionContent: {
      ...workflow.sectionContent,
      [sectionId]: content,
    },
  };
}

export function toggleWorkspaceV2SectionSkipped(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  if (skipped.has(sectionId)) {
    skipped.delete(sectionId);
  } else {
    skipped.add(sectionId);
  }
  const nextContent = { ...workflow.sectionContent };
  if (skipped.has(sectionId)) {
    delete nextContent[sectionId];
  }
  return {
    ...workflow,
    skippedSectionIds: [...skipped],
    sectionContent: nextContent,
  };
}

export function renameWorkspaceV2Section(
  workflow: CreateWorkflowState,
  sectionId: string,
  label: string,
): CreateWorkflowState {
  const sections = resolveTemplateSections(workflow) ?? [];
  const next = sections.map((s) =>
    s.id === sectionId ? { ...s, label: label.trim() || s.label } : s,
  );
  return { ...workflow, templateSections: next };
}

export function deleteWorkspaceV2Section(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const sections = (resolveTemplateSections(workflow) ?? []).filter(
    (s) => s.id !== sectionId,
  );
  const nextContent = { ...workflow.sectionContent };
  delete nextContent[sectionId];
  const skipped = (workflow.skippedSectionIds ?? []).filter((id) => id !== sectionId);
  return {
    ...workflow,
    templateSections: sections,
    sectionContent: nextContent,
    skippedSectionIds: skipped,
  };
}

export function addWorkspaceV2Section(
  workflow: CreateWorkflowState,
  label = "New Section",
): CreateWorkflowState {
  const sections = [...(resolveTemplateSections(workflow) ?? [])];
  const id = newSectionId();
  sections.push({ id, label: label.trim() || "New Section" });
  return { ...workflow, templateSections: sections };
}

/** Reorder sections by index — updates workspace, brief, and custom blueprint order. */
export function reorderWorkspaceV2Sections(
  workflow: CreateWorkflowState,
  fromIndex: number,
  toIndex: number,
): CreateWorkflowState {
  const sections = [...(resolveTemplateSections(workflow) ?? [])];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex >= sections.length ||
    fromIndex === toIndex
  ) {
    return workflow;
  }
  const [moved] = sections.splice(fromIndex, 1);
  if (!moved) return workflow;
  sections.splice(toIndex, 0, moved);
  return applyWorkspaceSectionOrder(workflow, sections);
}

export function moveWorkspaceV2Section(
  workflow: CreateWorkflowState,
  sectionId: string,
  direction: "up" | "down",
): CreateWorkflowState {
  const sections = resolveTemplateSections(workflow) ?? [];
  const fromIndex = sections.findIndex((s) => s.id === sectionId);
  if (fromIndex < 0) return workflow;
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  return reorderWorkspaceV2Sections(workflow, fromIndex, toIndex);
}

function applyWorkspaceSectionOrder(
  workflow: CreateWorkflowState,
  sections: CreateTemplateSection[],
): CreateWorkflowState {
  const next = { ...workflow, templateSections: sections };
  persistCustomBlueprintSectionOrder(next);
  return next;
}

/** When editing a saved custom blueprint, keep section order in sync. */
export function persistCustomBlueprintSectionOrder(
  workflow: CreateWorkflowState,
): void {
  if (typeof window === "undefined") return;
  const id = workflow.selectedTemplateId;
  if (!id) return;
  const custom = findCustomTemplate(id);
  if (!custom) return;
  const sections = resolveTemplateSections(workflow);
  if (!sections?.length) return;
  saveCustomTemplate({
    id: custom.id,
    name: custom.name,
    itemType: custom.itemType,
    subtype: custom.subtype,
    sections: sections.map((s) => ({ ...s })),
  });
}

/** Creation phase (workspace sections) — not finished draft editing. */
export function isCreateWorkspaceV2Phase(
  workflow: CreateWorkflowState | null | undefined,
  builderPhase?: string | null,
): boolean {
  if (!CREATE_WORKSPACE_V2 || !workflow?.workspaceFirst) return false;
  if (builderPhase === "done") return false;
  if (workflow.draftStatus === "ready" && Boolean(workflow.draftContent?.trim())) {
    return false;
  }
  return true;
}

export function setWorkspaceV2ActiveSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  return { ...workflow, activeSectionId: sectionId };
}

export type WorkspaceV2SectionAcceptance = {
  sectionId: string;
  sectionLabel: string;
  value: string;
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Which workspace section chat content should land in. */
export function resolveWorkspaceV2TargetSectionId(
  workflow: CreateWorkflowState,
  lastAssistantText: string,
): string | null {
  if (workflow.activeSectionId) return workflow.activeSectionId;

  const sections = workspaceV2Sections(workflow);
  for (const section of sections) {
    if (
      new RegExp(`\\b${escapeRegExp(section.label)}\\b`, "i").test(
        lastAssistantText,
      )
    ) {
      return section.id;
    }
  }

  const nextEmpty = sections.find((s) => !s.skipped && !s.content.trim());
  return nextEmpty?.id ?? sections[0]?.id ?? null;
}

export function tryResolveWorkspaceV2SectionApproval(
  userText: string,
  lastAssistantText: string,
  workflow: CreateWorkflowState,
): WorkspaceV2SectionAcceptance | null {
  if (!workflow.workspaceFirst) return null;
  const trimmed = userText.trim();
  if (!trimmed || !isBuilderAddCommand(trimmed)) return null;

  const pick = tryResolveSectionOptionApproval(
    trimmed,
    workflow,
    lastAssistantText,
  );
  if (pick) {
    const section = (resolveTemplateSections(workflow) ?? []).find(
      (s) => s.id === pick.sectionId,
    );
    return {
      sectionId: pick.sectionId,
      sectionLabel: section?.label ?? pick.sectionId,
      value: pick.value,
    };
  }

  const pending = extractPendingBuilderContent(lastAssistantText);
  const offered =
    assistantOfferedWorkspaceAdd(lastAssistantText) ||
    assistantOfferedBuilderAdd(lastAssistantText);
  if (!pending && !offered) return null;
  if (!pending?.trim()) return null;

  const sectionId = resolveWorkspaceV2TargetSectionId(workflow, lastAssistantText);
  if (!sectionId) return null;
  const section = (resolveTemplateSections(workflow) ?? []).find(
    (s) => s.id === sectionId,
  );
  return {
    sectionId,
    sectionLabel: section?.label ?? sectionId,
    value: pending.trim(),
  };
}

export function applyWorkspaceV2SectionAcceptance(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
): CreateWorkflowState {
  const existing = workflow.sectionContent?.[sectionId]?.trim();
  const merged = existing ? `${existing}\n\n${content.trim()}` : content.trim();
  return {
    ...updateWorkspaceV2SectionContent(workflow, sectionId, merged),
    activeSectionId: sectionId,
    pendingSectionOptions: null,
  };
}

/** Next section to fill after the one just updated (skips N/A and filled). */
export function nextWorkspaceV2SectionAfter(
  workflow: CreateWorkflowState,
  afterSectionId: string,
): WorkspaceV2SectionView | null {
  const sections = workspaceV2Sections(workflow);
  const start = sections.findIndex((s) => s.id === afterSectionId);
  for (let i = start + 1; i < sections.length; i++) {
    const s = sections[i]!;
    if (!s.skipped && !s.content.trim()) return s;
  }
  for (let i = 0; i < (start >= 0 ? start : sections.length); i++) {
    const s = sections[i]!;
    if (!s.skipped && !s.content.trim()) return s;
  }
  return null;
}

export function buildWorkspaceV2AcceptanceReply(
  sectionLabel: string,
  workflow: CreateWorkflowState,
  afterSectionId: string,
): string {
  const sections = workspaceV2Sections(workflow);
  const filled = sections.filter((s) => s.skipped || s.content.trim()).length;
  const next = nextWorkspaceV2SectionAfter(workflow, afterSectionId);

  let reply = `I've added that to **${sectionLabel}**.`;
  reply += `\n\n${filled} of ${sections.length} sections have content or are N/A.`;
  if (next) {
    reply += `\n\nWould you like help with **${next.label}** next?`;
  }
  return reply;
}

export function shouldSuppressLegacyCreateChatHints(
  workflow: CreateWorkflowState | null | undefined,
): boolean {
  return Boolean(CREATE_WORKSPACE_V2 && workflow?.workspaceFirst);
}

export function formatCreateWorkspaceV2ExplorationHint(
  session: { typeLabel: string | null; workflow: CreateWorkflowState },
  userText: string,
  sectionLabel?: string | null,
): string {
  const type = session.typeLabel ?? "content";
  const display = userFacingCreateTypeLabel(type) ?? type;
  const active = session.workflow.activeSectionId
    ? (resolveTemplateSections(session.workflow) ?? []).find(
        (s) => s.id === session.workflow.activeSectionId,
      )?.label
    : null;
  const focus = sectionLabel ?? active;

  return [
    `CREATE V2 SUPPORT (mandatory — overrides approval / auto-apply hints):`,
    `- Active: **${display}** workspace beside chat. User types in section boxes; chat never writes there.`,
    focus ? `- They are brainstorming **${focus}**.` : "",
    userText.trim() ? `- User said: "${userText.trim()}"` : "",
    "- Give ideas, examples, research, suggestions, or feedback only.",
    "- Do not ask permission to save, approve, or apply chat text to the workspace.",
    `- End with copy guidance, e.g.: Here are some ideas for **${focus ?? "this section"}**. Copy any parts you like into that box.`,
    "- Never use fill tags or approval-style buttons in chat.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function needIdeasPromptForSection(
  typeLabel: string,
  sectionLabel: string,
): string {
  const display = userFacingCreateTypeLabel(typeLabel) ?? typeLabel;
  return `I need ideas for the **${sectionLabel}** section of my ${display}. Suggest a few directions — I'll copy what I like into the ${sectionLabel} box.`;
}

export function workspaceV2DisplayTitle(workflow: CreateWorkflowState): string {
  const typeLabel = resolvedTypeLabel(workflow);
  if (workflow.selectedTypeLabel === OTHER_OPTION && workflow.customTypeLabel?.trim()) {
    return workflow.customTypeLabel.trim();
  }
  if (workflow.selectedTemplateName?.trim() && findCustomTemplate(workflow.selectedTemplateId ?? "")) {
    return workflow.selectedTemplateName.trim();
  }
  return userFacingCreateTypeLabel(typeLabel) ?? typeLabel ?? "Create";
}

export function updateWorkspaceV2DisplayTitle(
  workflow: CreateWorkflowState,
  title: string,
): CreateWorkflowState {
  const trimmed = title.trim();
  if (!trimmed) return workflow;
  if (workflow.selectedTypeLabel === OTHER_OPTION) {
    return { ...workflow, customTypeLabel: trimmed };
  }
  const custom = workflow.selectedTemplateId
    ? findCustomTemplate(workflow.selectedTemplateId)
    : null;
  if (custom) {
    return { ...workflow, selectedTemplateName: trimmed };
  }
  return { ...workflow, selectedTemplateName: trimmed };
}

export function savedBlueprintsForWorkflow(
  workflow: CreateWorkflowState,
): { id: string; name: string }[] {
  const itemType = resolvedTypeLabel(workflow);
  if (!itemType) return [];
  return listAllTemplatesForItem(itemType, workflow.selectedSubtype)
    .filter((t) => t.source === "custom")
    .map((t) => ({ id: t.id, name: t.name }));
}

/** Save section structure + order as a named blueprint for reuse. */
export function saveWorkspaceV2Blueprint(
  workflow: CreateWorkflowState,
  name: string,
): { workflow: CreateWorkflowState; saved: SavedCustomTemplate } | null {
  const itemType = resolvedTypeLabel(workflow);
  const sections = resolveTemplateSections(workflow);
  const trimmed = name.trim();
  if (!itemType || !sections?.length || !trimmed) return null;

  const existingCustom = workflow.selectedTemplateId
    ? findCustomTemplate(workflow.selectedTemplateId)
    : null;

  const saved = saveCustomTemplate({
    id: existingCustom?.id,
    name: trimmed,
    itemType,
    subtype: workflow.selectedSubtype,
    sections: sections.map((s) => ({ ...s })),
  });

  return {
    saved,
    workflow: {
      ...workflow,
      selectedTemplateId: saved.id,
      selectedTemplateName: saved.name,
      templateSections: [...saved.sections],
      workspaceFirst: true,
    },
  };
}

/** Load a saved blueprint structure (keeps content for matching section ids). */
export function loadWorkspaceV2Blueprint(
  workflow: CreateWorkflowState,
  templateId: string,
): CreateWorkflowState | null {
  const custom = findCustomTemplate(templateId);
  if (!custom) return null;
  const prevContent = workflow.sectionContent ?? {};
  const sectionContent: Record<string, string> = {};
  for (const section of custom.sections) {
    if (prevContent[section.id]?.trim()) {
      sectionContent[section.id] = prevContent[section.id]!;
    }
  }
  return {
    ...workflow,
    selectedTemplateId: custom.id,
    selectedTemplateName: custom.name,
    templateSections: [...custom.sections],
    sectionContent,
    skippedSectionIds: (workflow.skippedSectionIds ?? []).filter((id) =>
      custom.sections.some((s) => s.id === id),
    ),
    workspaceFirst: true,
  };
}

export function bootstrapCreateWorkspaceV2FromWorkflow(
  typeLabel: string,
  workflow: CreateWorkflowState,
): { session: CreateBuilderSession; opener: string } {
  const resolved = resolvedTypeLabel(workflow) || typeLabel;
  const display = userFacingCreateTypeLabel(resolved) ?? resolved;
  return {
    session: {
      typeLabel: resolved,
      workflow: { ...workflow, questionMode: "split_screen" },
      phase: "workspace",
    },
    opener:
      `Your **${display}** workspace is open — edit sections on the right. ` +
      `Chat is here when you want ideas or a second opinion.`,
  };
}

export function bootstrapWorkspaceV2Session(
  typeLabel: string,
  customLabel?: string,
): { session: CreateBuilderSession; opener: string } {
  const workflow = initializeWorkspaceV2Workflow(typeLabel, customLabel);
  const resolved = resolvedTypeLabel(workflow) || typeLabel;
  const display = userFacingCreateTypeLabel(resolved) ?? resolved;
  return {
    session: {
      typeLabel: resolved,
      workflow,
      phase: "workspace",
    },
    opener:
      `Your **${display}** blueprint is open beside you.\n\n` +
      `Type directly into each section — chat is here when you want ideas, examples, or a second opinion. ` +
      `Nothing from chat goes into the workspace unless you paste it yourself.`,
  };
}

export function formatCreateWorkspaceV2ChatHint(
  session: CreateBuilderSession | null,
): string | undefined {
  if (!CREATE_WORKSPACE_V2 || !session || session.phase === "done") return undefined;
  const type = session.typeLabel ?? "content";
  const display = userFacingCreateTypeLabel(type) ?? type;
  const sections = workspaceV2Sections(session.workflow);
  const filled = sections.filter((s) => s.skipped || s.content.trim()).length;

  return [
    `ACTIVE MODE: ${display} (Workspace-first Create).`,
    "CREATE V2 RULES (mandatory — override any conflicting hint about auto-apply, approval, or filling fields):",
    "- The workspace panel is the source of truth — the user types and pastes into sections directly.",
    "- Chat SUPPORTS ONLY: brainstorm, research, examples, wording suggestions, section review, feedback.",
    "- Chat NEVER writes to workspace sections. Never auto-fill fields from chat.",
    "- Never ask permission to save, approve, or apply chat content to the workspace.",
    "- NEVER offer to insert, apply, or save chat content into the workspace.",
    "- When sharing ideas, end with copy guidance, e.g.: Here are some ideas for **Purpose**. Copy any parts you like into the Purpose box.",
    "- NEVER ask discovery form questions to fill the workspace. NEVER mark sections complete.",
    "- NEVER generate a full draft in chat — user clicks Build Draft in the workspace when ready.",
    "- When they ask for ideas: give 3–5 concrete options in chat only.",
    `- Artifact: ${type}. Workspace sections: ${sections.length} (${filled} with content or N/A).`,
  ].join("\n");
}
