import {
  CREATION_WORKSPACE_ACTIVE_KEY,
  CREATION_WORKSPACE_STORAGE_KEY,
  type CreationWorkspace,
} from "./types";
import { nowIso } from "./ids";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* fail silent — keep in-memory */
  }
}

export function saveCreationWorkspace(workspace: CreationWorkspace): void {
  const list = readJson<CreationWorkspace[]>(CREATION_WORKSPACE_STORAGE_KEY, []);
  const next = {
    ...workspace,
    updatedAt: nowIso(),
    lastOpenedAt: nowIso(),
  };
  const idx = list.findIndex((w) => w.id === next.id);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  writeJson(CREATION_WORKSPACE_STORAGE_KEY, list.slice(0, 40));
  writeJson(CREATION_WORKSPACE_ACTIVE_KEY, { activeWorkspaceId: next.id });
}

export function loadCreationWorkspace(
  id: string,
): CreationWorkspace | null {
  return (
    readJson<CreationWorkspace[]>(CREATION_WORKSPACE_STORAGE_KEY, []).find(
      (w) => w.id === id,
    ) ?? null
  );
}

export function loadActiveCreationWorkspace(): CreationWorkspace | null {
  const active = readJson<{ activeWorkspaceId: string | null }>(
    CREATION_WORKSPACE_ACTIVE_KEY,
    { activeWorkspaceId: null },
  );
  if (!active.activeWorkspaceId) return null;
  return loadCreationWorkspace(active.activeWorkspaceId);
}

export function listCreationWorkspaces(): CreationWorkspace[] {
  return readJson<CreationWorkspace[]>(CREATION_WORKSPACE_STORAGE_KEY, []).sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function groupCreationWorkspaces(list: CreationWorkspace[]): {
  continuePrevious: CreationWorkspace[];
  recentlyUpdated: CreationWorkspace[];
  needsMyInput: CreationWorkspace[];
  researchUpdated: CreationWorkspace[];
  readyToUse: CreationWorkspace[];
  handedOff: CreationWorkspace[];
} {
  return {
    continuePrevious: list.filter((w) =>
      ["first_draft", "developing", "paused", "needs_research"].includes(
        w.status,
      ),
    ),
    recentlyUpdated: list.slice(0, 8),
    needsMyInput: list.filter((w) => w.status === "needs_user_input"),
    researchUpdated: list.filter((w) => w.status === "needs_research"),
    readyToUse: list.filter((w) =>
      ["ready_for_review", "ready_for_destination"].includes(w.status),
    ),
    handedOff: list.filter((w) => w.status === "handed_off"),
  };
}
