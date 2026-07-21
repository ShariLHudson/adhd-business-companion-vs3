/**
 * Per–Work Type workspace environment preferences (091).
 * Photograph/chrome separation mirrors chatBackdrop — environment only.
 */

import type {
  WorkspaceEnvironmentId,
  WorkspaceThemeId,
  WorkTypeWorkspacePreference,
} from "./types";

const STORAGE_KEY = "spark.workTypeWorkspaceEnvironment.v1";

type PreferenceMap = Record<string, WorkTypeWorkspacePreference>;

/** In-memory fallback for Node tests / SSR — never a durable SoT. */
let memoryStore: PreferenceMap = {};

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function readAll(): PreferenceMap {
  if (!canUseStorage()) return { ...memoryStore };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PreferenceMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: PreferenceMap): void {
  if (!canUseStorage()) {
    memoryStore = { ...map };
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Fail silent — preference is non-critical.
  }
}

export function getWorkTypeWorkspacePreference(
  workTypeId: string,
): WorkTypeWorkspacePreference | null {
  const id = workTypeId.trim();
  if (!id) return null;
  return readAll()[id] ?? null;
}

export function setWorkTypeWorkspacePreference(input: {
  workTypeId: string;
  environmentId: WorkspaceEnvironmentId;
  themeId?: WorkspaceThemeId;
}): WorkTypeWorkspacePreference {
  const workTypeId = input.workTypeId.trim();
  const next: WorkTypeWorkspacePreference = {
    workTypeId,
    environmentId: input.environmentId,
    themeId: input.themeId ?? "default",
  };
  const all = readAll();
  all[workTypeId] = next;
  writeAll(all);
  return next;
}

export function clearWorkTypeWorkspacePreference(workTypeId: string): void {
  const id = workTypeId.trim();
  if (!id) return;
  const all = readAll();
  delete all[id];
  writeAll(all);
}

/** Test helper */
export function resetWorkTypeWorkspacePreferencesForTests(): void {
  memoryStore = {};
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
