/**
 * P0.26 — Active artifact execution intake session (browser).
 */

import type { ArtifactExecutionDraft } from "./artifactExecutionAuthority";

export type ArtifactExecutionSession = {
  phase: "collecting" | "ready";
  draft: ArtifactExecutionDraft;
  startedAtTurn: number;
};

const STORAGE_KEY = "companion-artifact-execution-v1";

export function loadArtifactExecutionSession(): ArtifactExecutionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArtifactExecutionSession;
    if (!parsed?.draft?.kind) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveArtifactExecutionSession(
  session: ArtifactExecutionSession,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* noop */
  }
}

export function clearArtifactExecutionSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
