/**
 * Facilitated creation session — in-memory until workspace persists workflow.
 */

import type { FacilitatedCreationSession } from "./types";
import { resolveArtifactTypeFromText } from "./intent";

let activeSession: FacilitatedCreationSession | null = null;

export function getFacilitatedCreationSession(): FacilitatedCreationSession | null {
  return activeSession;
}

export function clearFacilitatedCreationSession(): void {
  activeSession = null;
}

export function startFacilitatedCreationSession(
  artifactType: string,
): FacilitatedCreationSession {
  activeSession = {
    artifactType,
    phase: "facilitating",
    questionIndex: 0,
    activeSectionId: null,
    sectionAnswers: {},
    workspaceConsentOffered: false,
    reviewOffered: false,
    startedAt: new Date().toISOString(),
  };
  return activeSession;
}

export function ensureFacilitatedSessionFromText(
  userText: string,
): FacilitatedCreationSession | null {
  const artifactType = resolveArtifactTypeFromText(userText);
  if (!artifactType) return null;
  if (activeSession?.artifactType === artifactType) return activeSession;
  return startFacilitatedCreationSession(artifactType);
}

export function patchFacilitatedCreationSession(
  patch: Partial<FacilitatedCreationSession>,
): FacilitatedCreationSession | null {
  if (!activeSession) return null;
  activeSession = { ...activeSession, ...patch };
  return activeSession;
}

export function markWorkspaceFacilitationActive(
  artifactType: string,
): FacilitatedCreationSession {
  if (activeSession?.artifactType === artifactType) {
    activeSession = {
      ...activeSession,
      phase: "workspace_active",
      questionIndex: 0,
    };
    return activeSession;
  }
  return startFacilitatedCreationSession(artifactType);
}
