/**
 * Resume / continuity for Universal Blueprint Interface.
 * Persists focus location — never mints Work IDs or touches durable repos.
 * Uses sessionStorage when available; in-memory fallback for Node / tests.
 */

import type { BlueprintDepthMode, CanonicalWorkId } from "@/lib/universalWorkEngine";
import type { BlueprintInterfaceSession, BlueprintStartPath } from "./types";

const STORAGE_KEY = "spark.universalBlueprintInterface.session.v1";

/** In-memory fallback when sessionStorage is unavailable (Node cert / SSR). */
let memorySession: BlueprintInterfaceSession | null = null;

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

export function readBlueprintInterfaceSession(
  workId?: string | null,
): BlueprintInterfaceSession | null {
  if (canUseStorage()) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BlueprintInterfaceSession;
      if (!parsed?.workId) return null;
      if (workId && parsed.workId !== workId) return null;
      return parsed;
    } catch {
      return null;
    }
  }
  if (!memorySession) return null;
  if (workId && memorySession.workId !== workId) return null;
  return memorySession;
}

export function writeBlueprintInterfaceSession(
  session: BlueprintInterfaceSession,
): void {
  const next = { ...session, updatedAt: new Date().toISOString() };
  memorySession = next;
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Fail silent — continuity is best-effort in UI layer.
  }
}

export function clearBlueprintInterfaceSession(): void {
  memorySession = null;
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildBlueprintInterfaceSession(input: {
  workId: CanonicalWorkId | string;
  workTypeId: string;
  blueprintId?: string | null;
  depthMode?: BlueprintDepthMode | null;
  currentSectionId?: string | null;
  currentQuestionId?: string | null;
  startPath?: BlueprintStartPath | null;
  approvedKnownContextKeys?: readonly string[];
  sourceWorkId?: CanonicalWorkId | string | null;
}): BlueprintInterfaceSession {
  return {
    workId: input.workId as CanonicalWorkId,
    workTypeId: input.workTypeId,
    blueprintId: input.blueprintId ?? null,
    depthMode: input.depthMode ?? null,
    currentSectionId: input.currentSectionId ?? null,
    currentQuestionId: input.currentQuestionId ?? null,
    startPath: input.startPath ?? null,
    approvedKnownContextKeys: [...(input.approvedKnownContextKeys ?? [])],
    sourceWorkId: (input.sourceWorkId as CanonicalWorkId | null) ?? null,
    updatedAt: new Date().toISOString(),
  };
}
