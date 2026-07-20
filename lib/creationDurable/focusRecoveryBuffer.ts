/**
 * 077_005 — Local recovery buffer for Current Focus drafts.
 * Never constitutes durable success. Cleared only after verified durable save.
 */

import { safeLocalStorageSet } from "@/lib/companionStorageRecovery";

export const FOCUS_RECOVERY_BUFFER_KEY = "spark.creationFocusRecovery.v1";

type BufferMap = Record<
  string,
  { text: string; updatedAt: string; creationId: string; focusId: string }
>;

function bufferKey(creationId: string, focusId: string): string {
  return `${creationId.trim()}::${focusId.trim()}`;
}

function readMap(): BufferMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FOCUS_RECOVERY_BUFFER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as BufferMap;
  } catch {
    return {};
  }
}

function writeMap(map: BufferMap): void {
  if (typeof window === "undefined") return;
  try {
    safeLocalStorageSet(FOCUS_RECOVERY_BUFFER_KEY, JSON.stringify(map));
  } catch {
    /* never crash Creation */
  }
}

/** Persist in-progress Focus text for refresh / crash recovery. */
export function writeFocusRecoveryBuffer(input: {
  creationId: string;
  focusId: string;
  text: string;
}): void {
  const creationId = input.creationId?.trim();
  const focusId = input.focusId?.trim();
  if (!creationId || !focusId) return;
  const text = input.text ?? "";
  const key = bufferKey(creationId, focusId);
  const map = readMap();
  if (!text.trim()) {
    delete map[key];
    writeMap(map);
    return;
  }
  map[key] = {
    text,
    updatedAt: new Date().toISOString(),
    creationId,
    focusId,
  };
  writeMap(map);
}

export function readFocusRecoveryBuffer(
  creationId: string,
  focusId: string,
): string | null {
  const key = bufferKey(creationId, focusId);
  const entry = readMap()[key];
  const text = entry?.text?.trim();
  return text ? entry!.text : null;
}

export function clearFocusRecoveryBuffer(
  creationId: string,
  focusId: string,
): void {
  const key = bufferKey(creationId, focusId);
  const map = readMap();
  if (!(key in map)) return;
  delete map[key];
  writeMap(map);
}

export function hasFocusRecoveryBuffer(
  creationId: string,
  focusId: string,
): boolean {
  return Boolean(readFocusRecoveryBuffer(creationId, focusId));
}
