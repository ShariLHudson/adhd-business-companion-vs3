// Persist active Create workspace — draft + context survive navigation and refresh.

import { isCreatePersistencePaused } from "./createPersistencePause";
import type { WorkspacePanelDetail } from "./workspaceAwareness";
import type { CreationWorkspaceContext } from "./workspaceCreation";
import type { SavedArtifactRecord } from "./savedArtifact";

export type CreateGenSeed = {
  type?: string;
  brief?: string;
  topic?: string;
  sourceText?: string;
  draft?: string;
  autoGenerate?: boolean;
};

export type CreateSessionSnapshot = {
  genSeed: CreateGenSeed;
  creationContext: CreationWorkspaceContext;
  workspaceDetail: WorkspacePanelDetail | null;
  savedArtifact?: SavedArtifactRecord | null;
  updatedAt: string;
};

const STORAGE_KEY = "companion-create-session-v1";

let memorySession: CreateSessionSnapshot | null = null;

export function saveCreateSession(
  snapshot: Omit<CreateSessionSnapshot, "updatedAt">,
): void {
  if (isCreatePersistencePaused()) return;
  if (!snapshot.genSeed.type && !snapshot.genSeed.draft?.trim()) return;
  memorySession = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...snapshot,
        updatedAt: new Date().toISOString(),
      } satisfies CreateSessionSnapshot),
    );
  } catch {
    /* noop */
  }
}

export function loadCreateSession(): CreateSessionSnapshot | null {
  if (memorySession) return memorySession;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreateSessionSnapshot;
    if (!parsed?.genSeed) return null;
    if (!parsed.genSeed.type && !parsed.genSeed.draft?.trim()) return null;
    if (!parsed.creationContext?.section) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCreateSession(): void {
  memorySession = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function hasActiveCreateSession(): boolean {
  return loadCreateSession() !== null;
}
