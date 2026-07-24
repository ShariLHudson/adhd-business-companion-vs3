/**
 * Native Create consumer — hydrates Create editor from Creation Workspace handoff.
 * Does not regenerate content from the original prompt.
 */

import {
  bootstrapWorkspaceV2Session,
  updateWorkspaceV2SectionContent,
} from "@/lib/createWorkspaceV2";
import type { CreateBuilderSession } from "@/lib/createBuilderChat";
import type { CreateWorkflowState } from "@/lib/createWorkflowState";
import { hasActiveCreateSession } from "@/lib/createSessionStore";
import {
  CREATION_WORKSPACE_CREATE_HANDOFF_VERSION,
  MAX_HANDOFF_AGE_MS,
  type CreationWorkspaceCreateHandoff,
} from "./contracts";
import {
  getHandoffRegistryEntry,
  isHandoffReusable,
  markHandoffConsumed,
  markHandoffFailed,
  markHandoffOpening,
} from "./registry";
import {
  clearCreateHandoff,
  peekCreateHandoff,
  storeCreateHandoff,
} from "./storage";

export type CreateHandoffConflict =
  | { kind: "none" }
  | {
      kind: "active_unsaved";
      options: Array<"open_as_new" | "save_current_and_open" | "cancel">;
    }
  | {
      kind: "matching_linked";
      destinationEntityId: string;
      options: Array<"update_existing" | "open_existing" | "create_new_version">;
    };

export type ConsumeCreateHandoffResult =
  | {
      ok: true;
      session: CreateBuilderSession;
      handoff: CreationWorkspaceCreateHandoff;
      workflow: CreateWorkflowState;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      conflict?: CreateHandoffConflict;
      handoff?: CreationWorkspaceCreateHandoff | null;
    };

function isStale(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_HANDOFF_AGE_MS;
}

export function validateCreateHandoff(
  raw: unknown,
):
  | { ok: true; handoff: CreationWorkspaceCreateHandoff }
  | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Missing Create handoff payload." };
  }
  const h = raw as Partial<CreationWorkspaceCreateHandoff>;
  if (h.version !== CREATION_WORKSPACE_CREATE_HANDOFF_VERSION) {
    return { ok: false, reason: "Unsupported Create handoff version." };
  }
  if (!h.id || !h.workspaceId || !h.title || !Array.isArray(h.sections)) {
    return { ok: false, reason: "Malformed Create handoff." };
  }
  if (h.createdAt && isStale(h.createdAt)) {
    return { ok: false, reason: "Create handoff is stale." };
  }
  const substantive = h.sections.filter(
    (s) => s && typeof s.body === "string" && s.body.trim().length >= 12,
  );
  if (substantive.length < 1) {
    return {
      ok: false,
      reason: "Create handoff has no substantive sections.",
    };
  }
  return { ok: true, handoff: h as CreationWorkspaceCreateHandoff };
}

export function detectCreateHandoffConflict(input?: {
  hasActiveWorkspaceSession?: boolean;
  hasFilledSections?: boolean;
  linkedEntityId?: string | null;
}): CreateHandoffConflict {
  if (input?.linkedEntityId) {
    return {
      kind: "matching_linked",
      destinationEntityId: input.linkedEntityId,
      options: ["update_existing", "open_existing", "create_new_version"],
    };
  }
  const active =
    input?.hasActiveWorkspaceSession ??
    (hasActiveCreateSession() || Boolean(input?.hasFilledSections));
  if (active && input?.hasFilledSections !== false) {
    // Only conflict when there is filled content or a stored session
    if (input?.hasFilledSections || hasActiveCreateSession()) {
      return {
        kind: "active_unsaved",
        options: ["open_as_new", "save_current_and_open", "cancel"],
      };
    }
  }
  return { kind: "none" };
}

/**
 * Map handoff sections onto a bootstrapped Create workflow.
 * Preserves order, hierarchy labels, user edits, and sources — never regenerates.
 */
export function hydrateCreateWorkflowFromHandoff(
  handoff: CreationWorkspaceCreateHandoff,
): CreateBuilderSession {
  const artifactType =
    handoff.recommendedArtifactType?.trim() || "Social Post";
  const boot = bootstrapWorkspaceV2Session(artifactType);
  const ordered = [...handoff.sections].sort((a, b) => a.order - b.order);

  // Prefer handoff section structure over empty template shells
  const templateSections = ordered.map((s) => ({
    id: s.id,
    label: s.title,
  }));

  let workflow: CreateWorkflowState = {
    ...boot.session.workflow,
    selectedTypeLabel: artifactType,
    templateSections,
    sectionContent: {},
    originalRequest: handoff.purpose || handoff.title,
    workingIntent: handoff.purpose,
    discoveryAnswers: {
      ...boot.session.workflow.discoveryAnswers,
      purpose: handoff.purpose || handoff.title,
      audience: handoff.intendedAudience || "",
      use: handoff.intendedUse || "",
      title: handoff.title,
    },
    draftStatus: "ready",
    workspaceFirst: true,
    completedSectionIds: [],
    completedSectionVersions: {},
  };

  for (const section of ordered) {
    let body = section.body.trim();
    if (section.sources.length) {
      body = `${body}\n\nSources:\n${section.sources.map((s) => `- ${s}`).join("\n")}`;
    }
    if (section.notes.length) {
      body = `${body}\n\nNotes:\n${section.notes.map((n) => `- ${n}`).join("\n")}`;
    }
    if (section.userEdited) {
      body = `${body}\n\n(Preserved your edits from Creation Workspace)`;
    }
    workflow = updateWorkspaceV2SectionContent(workflow, section.id, body);
  }

  // Supporting items as an appendix section when present
  if (handoff.supportingItems.length) {
    const supportId = `support_${handoff.id}`;
    workflow = {
      ...workflow,
      templateSections: [
        ...(workflow.templateSections ?? []),
        { id: supportId, label: "Supporting research notes" },
      ],
    };
    const supportBody = handoff.supportingItems
      .map((s) => `## ${s.title}\n${s.body}`)
      .join("\n\n");
    workflow = updateWorkspaceV2SectionContent(workflow, supportId, supportBody);
  }

  if (handoff.assumptions.length || handoff.unresolvedAreas.length) {
    const metaId = `meta_${handoff.id}`;
    workflow = {
      ...workflow,
      templateSections: [
        ...(workflow.templateSections ?? []),
        { id: metaId, label: "Assumptions & open questions" },
      ],
    };
    const metaBody = [
      handoff.assumptions.length
        ? `Assumptions:\n${handoff.assumptions.map((a) => `- ${a}`).join("\n")}`
        : null,
      handoff.unresolvedAreas.length
        ? `Unresolved:\n${handoff.unresolvedAreas.map((a) => `- ${a}`).join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");
    workflow = updateWorkspaceV2SectionContent(workflow, metaId, metaBody);
  }

  const filledIds = (workflow.templateSections ?? [])
    .filter((s) => (workflow.sectionContent?.[s.id] ?? "").trim())
    .map((s) => s.id);

  workflow = {
    ...workflow,
    completedSectionIds: filledIds,
    activeSectionId: templateSections[0]?.id ?? null,
    draftContent: ordered.map((s) => `## ${s.title}\n${s.body}`).join("\n\n"),
  };

  return {
    ...boot.session,
    typeLabel: artifactType,
    phase: "workspace",
    workflow,
  };
}

export function consumeCreationWorkspaceCreateHandoff(input?: {
  handoff?: CreationWorkspaceCreateHandoff | null;
  conflictOverride?: "open_as_new" | "save_current_and_open" | "cancel";
  hasActiveWorkspaceSession?: boolean;
  hasFilledSections?: boolean;
  linkedEntityId?: string | null;
}): ConsumeCreateHandoffResult {
  const raw = input?.handoff ?? peekCreateHandoff();
  const validated = validateCreateHandoff(raw);
  if (!validated.ok) {
    if (raw && typeof raw === "object" && "id" in raw) {
      markHandoffFailed(String((raw as { id: string }).id), "validate_create");
    }
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_create",
      handoff: (raw as CreationWorkspaceCreateHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;

  if (!isHandoffReusable(handoff.id)) {
    const entry = getHandoffRegistryEntry(handoff.id);
    return {
      ok: false,
      reason:
        entry?.status === "consumed" || entry?.status === "completed"
          ? "This Create handoff was already consumed."
          : "Create handoff is no longer reusable.",
      stage: "registry_guard",
      handoff,
    };
  }

  const conflict = detectCreateHandoffConflict({
    hasActiveWorkspaceSession: input?.hasActiveWorkspaceSession,
    hasFilledSections: input?.hasFilledSections,
    linkedEntityId: input?.linkedEntityId,
  });

  if (conflict.kind === "active_unsaved") {
    if (input?.conflictOverride === "cancel") {
      return {
        ok: false,
        reason: "Cancelled — existing Create work preserved.",
        stage: "conflict_cancel",
        conflict,
        handoff,
      };
    }
    if (
      !input?.conflictOverride ||
      (input.conflictOverride !== "open_as_new" &&
        input.conflictOverride !== "save_current_and_open")
    ) {
      // Preserve handoff for retry
      storeCreateHandoff(handoff);
      return {
        ok: false,
        reason: "Active Create work would be overwritten.",
        stage: "conflict",
        conflict,
        handoff,
      };
    }
  }

  if (conflict.kind === "matching_linked") {
    if (!input?.conflictOverride || input.conflictOverride === "cancel") {
      storeCreateHandoff(handoff);
      return {
        ok: false,
        reason: "A linked Create asset already exists.",
        stage: "conflict",
        conflict,
        handoff,
      };
    }
  }

  markHandoffOpening(handoff.id);

  try {
    const session = hydrateCreateWorkflowFromHandoff(handoff);
    const sessionId =
      session.workflow.sessionId ||
      `cw_create_${handoff.workspaceId}_${Date.now().toString(36)}`;
    const workflow: CreateWorkflowState = {
      ...session.workflow,
      sessionId,
    };
    const finalSession: CreateBuilderSession = {
      ...session,
      workflow,
    };

    // Persist success markers before clearing storage
    markHandoffConsumed(handoff.id, sessionId);
    clearCreateHandoff();

    return {
      ok: true,
      session: finalSession,
      handoff,
      workflow,
    };
  } catch (err) {
    markHandoffFailed(handoff.id, "hydrate_create", "retry_create_consume");
    storeCreateHandoff(handoff);
    return {
      ok: false,
      reason:
        err instanceof Error
          ? err.message
          : "Could not hydrate Create from handoff.",
      stage: "hydrate_create",
      handoff,
    };
  }
}
