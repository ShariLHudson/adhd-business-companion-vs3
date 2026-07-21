/**
 * Resume / continuity for Universal Blueprint Interface.
 * Persists focus location — never mints Work IDs or touches durable repos.
 */

import type { BlueprintDepthMode, CanonicalWorkId } from "@/lib/universalWorkEngine";
import type { BlueprintInterfaceSession, BlueprintStartPath } from "./types";

const STORAGE_KEY = "spark.universalBlueprintInterface.session.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readBlueprintInterfaceSession(
  workId?: string | null,
): BlueprintInterfaceSession | null {
  if (!canUseStorage()) return null;
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

export function writeBlueprintInterfaceSession(
  session: BlueprintInterfaceSession,
): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...session, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // Fail silent — continuity is best-effort in UI layer.
  }
}

export function clearBlueprintInterfaceSession(): void {
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
