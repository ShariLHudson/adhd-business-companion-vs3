/**
 * Artifact state persistence — session memory for Shari.
 */

import type { Artifact } from "./types";

const STORAGE_KEY = "spark-artifact-state-v1";

let activeArtifact: Artifact | null = null;

export function getActiveArtifact(): Artifact | null {
  if (activeArtifact) return activeArtifact;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    activeArtifact = JSON.parse(raw) as Artifact;
    return activeArtifact;
  } catch {
    return null;
  }
}

export function setActiveArtifact(artifact: Artifact | null): void {
  activeArtifact = artifact;
  if (typeof window === "undefined") return;
  try {
    if (!artifact) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artifact));
  } catch {
    /* noop */
  }
}

export function clearActiveArtifact(): void {
  setActiveArtifact(null);
}

/** Save hooks — Portfolio, Cabinet, Journal, Evidence (permission-gated later). */
export type ArtifactSaveTarget =
  | "portfolio"
  | "institute_cabinet"
  | "journal"
  | "evidence_vault"
  | "paused_project";

export function artifactMaySaveTo(target: ArtifactSaveTarget, artifact: Artifact): boolean {
  switch (target) {
    case "paused_project":
      return artifact.status !== "finalized";
    case "portfolio":
      return artifact.status === "ready_to_finalize" || artifact.status === "finalized";
    case "institute_cabinet":
    case "journal":
    case "evidence_vault":
      return true;
    default:
      return false;
  }
}
