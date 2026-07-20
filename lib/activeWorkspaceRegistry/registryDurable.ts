/**
 * Durable Continue archive/restore — Create graph allowed here only.
 * Keep out of registryCore so Project Homes never loads these edges.
 */

import {
  moveActiveWorkspaceToTrash,
  restoreActiveWorkspace,
} from "./registryCore";

export async function removeActiveWorkspaceFromContinueDurable(
  workspaceId: string,
): Promise<{ ok: true } | { ok: false; message: string; retryable: boolean }> {
  const id = workspaceId.trim();
  if (!id) {
    return {
      ok: false,
      message: "I couldn't find that work to remove.",
      retryable: false,
    };
  }

  moveActiveWorkspaceToTrash(id);

  try {
    const { persistCreationArchive } = await import("@/lib/creationDurable");
    const durable = await persistCreationArchive(id);
    if (!durable.ok) {
      return {
        ok: false,
        message: durable.message,
        retryable: durable.retryable,
      };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function restoreActiveWorkspaceDurable(
  workspaceId: string,
): Promise<
  | { ok: true; workspaceId: string }
  | { ok: false; message: string; retryable: boolean }
> {
  const id = workspaceId.trim();
  const entry = restoreActiveWorkspace(id);
  if (!entry) {
    return {
      ok: false,
      message: "I couldn't restore that work.",
      retryable: false,
    };
  }
  try {
    const { persistCreationMutation } = await import("@/lib/creationDurable");
    const { getRuntimeCreationRecord } = await import(
      "@/lib/currentFocus/creationRecord"
    );
    const runtime = getRuntimeCreationRecord(id);
    if (runtime) {
      const { EMPTY_CREATE_WORKFLOW } = await import(
        "@/lib/createWorkflowState"
      );
      const wf = {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: id,
        eventRecordId: entry.eventRecordId,
        selectedTypeLabel: entry.creationType,
        selectedTemplateName: entry.title,
        workspaceFirst: true,
        questionMode: "current_focus" as const,
      };
      const durable = await persistCreationMutation({ workflow: wf, runtime });
      if (!durable.ok) {
        return {
          ok: false,
          message: durable.message,
          retryable: durable.retryable,
        };
      }
    }
    return { ok: true, workspaceId: entry.workspaceId };
  } catch {
    return { ok: true, workspaceId: entry.workspaceId };
  }
}
