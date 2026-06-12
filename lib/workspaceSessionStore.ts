// Persist workspace SOP session — resume exact project/workshop later.

import type { WorkspaceSession } from "./workspaceSop";

const STORAGE_KEY = "companion-workspace-session-v1";

export type PersistedWorkspaceSnapshot = {
  projectId: string | null;
  projectTitle: string | null;
  workflowType: WorkspaceSession["workflowId"];
  currentStep: WorkspaceSession["currentStepId"];
  savedStatus: WorkspaceSession["savedStatus"];
  session: WorkspaceSession;
};

export function toPersistedSnapshot(
  session: WorkspaceSession,
): PersistedWorkspaceSnapshot {
  return {
    projectId: session.projectId,
    projectTitle: session.projectTitle,
    workflowType: session.workflowId,
    currentStep: session.currentStepId,
    savedStatus: session.savedStatus,
    session,
  };
}

export function loadWorkspaceSession(): WorkspaceSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkspaceSnapshot;
    const s = parsed.session ?? parsed;
    if (!s?.workflowId || !s?.currentStepId) return null;
    return normalizeSession(s as WorkspaceSession);
  } catch {
    return null;
  }
}

export function saveWorkspaceSession(session: WorkspaceSession): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = normalizeSession(session);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(toPersistedSnapshot(normalized)),
    );
  } catch {
    /* noop */
  }
}

export function clearWorkspaceSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/** Ensure canonical resume fields stay in sync with SOP state. */
export function normalizeSession(session: WorkspaceSession): WorkspaceSession {
  const projectTitle =
    session.projectTitle?.trim() ||
    session.acceptedValues["workshop-title"]?.trim() ||
    session.acceptedValues["project-name"]?.trim() ||
    null;

  return {
    ...session,
    projectId: session.projectId ?? null,
    projectTitle,
    savedStatus: session.savedStatus ?? "create-flow",
    suggestedOptions: session.suggestedOptions ?? [],
    currentStepHint: session.currentStepHint ?? null,
  };
}

export function syncSessionProjectMeta(
  session: WorkspaceSession,
  meta: {
    projectId?: string | null;
    projectTitle?: string | null;
    savedStatus?: WorkspaceSession["savedStatus"];
    currentStepId?: string;
  },
): WorkspaceSession {
  const next = normalizeSession({
    ...session,
    projectId: meta.projectId !== undefined ? meta.projectId : session.projectId,
    projectTitle:
      meta.projectTitle !== undefined ? meta.projectTitle : session.projectTitle,
    savedStatus:
      meta.savedStatus !== undefined ? meta.savedStatus : session.savedStatus,
    currentStepId:
      meta.currentStepId !== undefined
        ? meta.currentStepId
        : session.currentStepId,
  });
  if (
    next.projectId === session.projectId &&
    next.projectTitle === session.projectTitle &&
    next.savedStatus === session.savedStatus &&
    next.currentStepId === session.currentStepId
  ) {
    return session;
  }
  return next;
}
