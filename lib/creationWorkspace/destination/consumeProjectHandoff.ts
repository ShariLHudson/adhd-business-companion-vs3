/**
 * Projects proposal consumer — opens reviewable proposal; creates records only after approval.
 */

import {
  createPersistedProjectHomeWithResult,
  type CreatePersistedProjectHomeResult,
} from "@/lib/projectHomes/homeActions";
import { recommendProjectHome } from "@/lib/projectHomes/roomCatalog";
import {
  CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION,
  MAX_HANDOFF_AGE_MS,
  type CreationWorkspaceProjectHandoff,
  type CreationWorkspaceProjectProposalPhase,
} from "./contracts";
import {
  getHandoffRegistryEntry,
  hasCompletedDestinationEntity,
  isHandoffReusable,
  markHandoffApproved,
  markHandoffCompleted,
  markHandoffFailed,
  markHandoffOpening,
  updateHandoffRegistryEntry,
} from "./registry";
import {
  clearProjectHandoff,
  peekProjectHandoff,
  storeProjectHandoff,
} from "./storage";

export type ConsumeProjectHandoffResult =
  | {
      ok: true;
      mode: "review";
      handoff: CreationWorkspaceProjectHandoff;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      handoff?: CreationWorkspaceProjectHandoff | null;
    };

export type ApproveProjectHandoffResult =
  | {
      ok: true;
      projectId: string;
      createdTaskTitles: string[];
      createdPhaseNames: string[];
      handoff: CreationWorkspaceProjectHandoff;
      persistResult: CreatePersistedProjectHomeResult;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      handoff?: CreationWorkspaceProjectHandoff | null;
    };

function isStale(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_HANDOFF_AGE_MS;
}

export function validateProjectHandoff(
  raw: unknown,
):
  | { ok: true; handoff: CreationWorkspaceProjectHandoff }
  | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Missing Projects handoff." };
  }
  const h = raw as Partial<CreationWorkspaceProjectHandoff>;
  if (h.version !== CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION) {
    return { ok: false, reason: "Unsupported Projects handoff version." };
  }
  if (!h.id || !h.workspaceId || !h.proposedTitle || !Array.isArray(h.phases)) {
    return { ok: false, reason: "Malformed Projects handoff." };
  }
  if (h.createdAt && isStale(h.createdAt)) {
    return { ok: false, reason: "Projects handoff is stale." };
  }
  if (!h.requiresReview) {
    return { ok: false, reason: "Projects handoff must require review." };
  }
  return { ok: true, handoff: h as CreationWorkspaceProjectHandoff };
}

/** Open proposal review — never creates project records. */
export function consumeCreationWorkspaceProjectHandoff(input?: {
  handoff?: CreationWorkspaceProjectHandoff | null;
}): ConsumeProjectHandoffResult {
  const raw = input?.handoff ?? peekProjectHandoff();
  const validated = validateProjectHandoff(raw);
  if (!validated.ok) {
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_project",
      handoff: (raw as CreationWorkspaceProjectHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;
  if (!isHandoffReusable(handoff.id)) {
    return {
      ok: false,
      reason: "Projects handoff already consumed or superseded.",
      stage: "registry_guard",
      handoff,
    };
  }
  markHandoffOpening(handoff.id);
  updateHandoffRegistryEntry(handoff.id, { status: "ready_for_review" });
  storeProjectHandoff(handoff);
  return { ok: true, mode: "review", handoff };
}

export function updateProjectProposalSelection(
  handoff: CreationWorkspaceProjectHandoff,
  patch: {
    phaseId?: string;
    milestoneId?: string;
    taskId?: string;
    selected?: boolean;
    title?: string;
    description?: string;
  },
): CreationWorkspaceProjectHandoff {
  const phases: CreationWorkspaceProjectProposalPhase[] = handoff.phases.map(
    (phase) => {
      if (patch.phaseId && phase.id === patch.phaseId && patch.taskId == null && patch.milestoneId == null) {
        return {
          ...phase,
          selected: patch.selected ?? phase.selected,
          name: patch.title ?? phase.name,
          description: patch.description ?? phase.description,
        };
      }
      return {
        ...phase,
        milestones: phase.milestones.map((m) =>
          patch.milestoneId && m.id === patch.milestoneId
            ? {
                ...m,
                selected: patch.selected ?? m.selected,
                title: patch.title ?? m.title,
              }
            : m,
        ),
        tasks: phase.tasks.map((t) =>
          patch.taskId && t.id === patch.taskId
            ? {
                ...t,
                selected: patch.selected ?? t.selected,
                title: patch.title ?? t.title,
                description: patch.description ?? t.description,
              }
            : t,
        ),
      };
    },
  );
  const next = { ...handoff, phases };
  storeProjectHandoff(next);
  return next;
}

/**
 * Create project records only for approved/selected phases, milestones, and tasks.
 */
export function approveCreationWorkspaceProjectHandoff(input: {
  handoff?: CreationWorkspaceProjectHandoff | null;
  mode: "approve_all" | "approve_selected";
}): ApproveProjectHandoffResult {
  const raw = input.handoff ?? peekProjectHandoff();
  const validated = validateProjectHandoff(raw);
  if (!validated.ok) {
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_project",
      handoff: (raw as CreationWorkspaceProjectHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;
  const existing = hasCompletedDestinationEntity({
    workspaceId: handoff.workspaceId,
    destination: "projects",
  });
  if (existing?.destinationEntityId) {
    return {
      ok: false,
      reason:
        "A project already exists for this Creation Workspace. Open the existing project or create a new version intentionally.",
      stage: "duplicate_guard",
      handoff,
    };
  }
  const entry = getHandoffRegistryEntry(handoff.id);
  if (entry?.status === "completed" || entry?.status === "consumed") {
    return {
      ok: false,
      reason: "This project handoff was already completed.",
      stage: "registry_guard",
      handoff,
    };
  }

  const phases =
    input.mode === "approve_all"
      ? handoff.phases.map((p) => ({
          ...p,
          selected: true,
          milestones: p.milestones.map((m) => ({ ...m, selected: true })),
          tasks: p.tasks.map((t) => ({ ...t, selected: true })),
        }))
      : handoff.phases.filter((p) => p.selected);

  if (!phases.length) {
    return {
      ok: false,
      reason: "No phases selected for approval.",
      stage: "approval_empty",
      handoff,
    };
  }

  const createdPhaseNames: string[] = [];
  const createdTaskTitles: string[] = [];
  const pieces: string[] = [
    `Source Creation Workspace: ${handoff.workspaceId}`,
    `Purpose: ${handoff.purpose}`,
  ];

  for (const phase of phases) {
    if (input.mode === "approve_selected" && !phase.selected) continue;
    createdPhaseNames.push(phase.name);
    pieces.push(`Phase: ${phase.name}`);
    for (const m of phase.milestones) {
      if (input.mode === "approve_selected" && !m.selected) continue;
      pieces.push(`Milestone (${phase.name}): ${m.title}`);
    }
    for (const t of phase.tasks) {
      if (input.mode === "approve_selected" && !t.selected) continue;
      createdTaskTitles.push(t.title);
      const desc = t.description?.trim() ? ` — ${t.description.trim()}` : "";
      pieces.push(`Task (${phase.name}): ${t.title}${desc}`);
    }
  }

  if (handoff.dependencies.length) {
    pieces.push(`Dependencies: ${handoff.dependencies.join("; ")}`);
  }
  if (handoff.risks.length) {
    pieces.push(`Risks: ${handoff.risks.join("; ")}`);
  }
  if (handoff.completionCriteria.length) {
    pieces.push(`Done when: ${handoff.completionCriteria.join("; ")}`);
  }

  const room = recommendProjectHome(
    `${handoff.proposedTitle} ${handoff.purpose}`,
  );

  try {
    const persistResult = createPersistedProjectHomeWithResult({
      name: handoff.proposedTitle,
      purpose: handoff.purpose,
      projectHomeId: room.roomId,
      pieces,
    });
    if (!persistResult.persisted || !persistResult.home) {
      markHandoffFailed(handoff.id, "project_persist", "retry_project_approve");
      storeProjectHandoff(handoff);
      return {
        ok: false,
        reason: persistResult.error ?? "Could not create the project.",
        stage: "project_persist",
        handoff,
      };
    }

    markHandoffApproved(handoff.id, persistResult.home.id);
    markHandoffCompleted(handoff.id, persistResult.home.id);
    clearProjectHandoff();

    return {
      ok: true,
      projectId: persistResult.home.id,
      createdTaskTitles,
      createdPhaseNames,
      handoff,
      persistResult,
    };
  } catch (err) {
    markHandoffFailed(handoff.id, "project_persist", "retry_project_approve");
    storeProjectHandoff(handoff);
    return {
      ok: false,
      reason:
        err instanceof Error ? err.message : "Project approval failed.",
      stage: "project_persist",
      handoff,
    };
  }
}

/** Keep as proposal — do not create records; leave handoff for later. */
export function keepProjectHandoffAsProposal(
  handoff?: CreationWorkspaceProjectHandoff | null,
): CreationWorkspaceProjectHandoff | null {
  const h = handoff ?? peekProjectHandoff();
  if (!h) return null;
  updateHandoffRegistryEntry(h.id, { status: "ready_for_review" });
  storeProjectHandoff(h);
  return h;
}

export function cancelProjectHandoff(
  handoff?: CreationWorkspaceProjectHandoff | null,
): void {
  const h = handoff ?? peekProjectHandoff();
  if (h) {
    updateHandoffRegistryEntry(h.id, { status: "cancelled" });
  }
  clearProjectHandoff();
}
