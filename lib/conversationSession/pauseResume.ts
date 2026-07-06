/**
 * Pass 2 — pause / resume artifacts on the session stack.
 */

import { applyConversationSessionPatch, loadConversationSession } from "./store";
import type { ConversationSession, SessionArtifact } from "./types";

function newArtifactId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `artifact-${Date.now()}`;
}

export function pauseActiveArtifact(reason?: string): ConversationSession | null {
  const session = loadConversationSession();
  if (!session?.activeArtifact) return session;

  const paused: SessionArtifact = {
    ...session.activeArtifact,
    status: "paused",
    pausedAt: new Date().toISOString(),
    draftContent: session.draftContent ?? session.activeArtifact.draftContent,
  };

  const stack = session.artifactStack.map((a) =>
    a.id === paused.id ? paused : a,
  );
  if (!stack.some((a) => a.id === paused.id)) {
    stack.push(paused);
  }

  return applyConversationSessionPatch({
    activeArtifact: null,
    artifactStack: stack,
    currentJourneyState: reason
      ? { label: "paused", step: reason }
      : session.currentJourneyState,
  });
}

export function resumeArtifact(artifactId: string): ConversationSession | null {
  const session = loadConversationSession();
  if (!session) return null;

  const artifact = session.artifactStack.find((a) => a.id === artifactId);
  if (!artifact) return session;

  const active: SessionArtifact = { ...artifact, status: "active", pausedAt: undefined };
  const stack = session.artifactStack.map((a) =>
    a.id === artifactId ? active : a.status === "active" ? { ...a, status: "paused" as const } : a,
  );

  return applyConversationSessionPatch({
    activeArtifact: active,
    artifactStack: stack,
    draftContent: active.draftContent ?? session.draftContent,
    currentStudio: active.itemType,
  });
}

export function setActiveArtifact(artifact: Omit<SessionArtifact, "id" | "status"> & { id?: string }): ConversationSession {
  const active: SessionArtifact = {
    id: artifact.id ?? newArtifactId(),
    status: "active",
    itemType: artifact.itemType,
    title: artifact.title,
    draftContent: artifact.draftContent,
    documentType: artifact.documentType,
  };

  const session = loadConversationSession();
  const stack = [...(session?.artifactStack ?? [])];
  const existingIdx = stack.findIndex((a) => a.id === active.id);
  if (existingIdx >= 0) {
    stack[existingIdx] = active;
  } else {
    stack.push(active);
  }

  return applyConversationSessionPatch({
    activeArtifact: active,
    artifactStack: stack,
    draftContent: artifact.draftContent,
    currentStudio: artifact.itemType,
  });
}
