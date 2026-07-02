/**
 * Estate Journey Engine™ — paused work when leaving mid-task.
 */

import type { AppSection } from "@/lib/companionUi";
import { getActiveArtifact } from "@/lib/artifactState/store";
import { getJourneyEngineState, patchJourneyEngine } from "./journeyStore";
import type { EstatePausedWork, EstatePausedWorkKind, PauseJourneyWorkInput } from "./types";

const MAX_PAUSED_WORK = 12;

function newPausedWorkId(): string {
  return `paused-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function inferPausedKindFromArtifactType(type: string): EstatePausedWorkKind {
  const t = type.toLowerCase();
  if (t.includes("funnel") || t.includes("sales")) return "sales-funnel";
  if (t.includes("newsletter")) return "newsletter";
  if (t.includes("workshop")) return "workshop";
  if (t.includes("decision")) return "decision";
  if (t.includes("lesson")) return "lesson";
  if (t.includes("challenge")) return "challenge";
  if (t.includes("simulation")) return "simulation";
  if (t.includes("research")) return "research";
  return "artifact";
}

function pausedVerb(kind: EstatePausedWorkKind): string {
  switch (kind) {
    case "workshop":
      return "building your";
    case "newsletter":
    case "sales-funnel":
      return "working on your";
    case "decision":
      return "deciding on your";
    case "lesson":
      return "in your lesson on";
    case "challenge":
      return "in your challenge";
    case "simulation":
      return "in your simulation";
    case "research":
      return "researching";
    default:
      return "working on";
  }
}

export function pauseJourneyWork(input: PauseJourneyWorkInput): EstatePausedWork {
  const entry: EstatePausedWork = {
    id: newPausedWorkId(),
    kind: input.kind,
    label: input.label,
    entryId: input.entryId,
    section: input.section,
    artifactId: input.artifactId,
    pausedAt: new Date().toISOString(),
    reason: input.reason,
    resumeHint: input.resumeHint,
  };

  patchJourneyEngine((journey) => {
    const withoutDup = journey.pausedWork.filter(
      (p) =>
        !(input.artifactId && p.artifactId === input.artifactId) &&
        !(p.label.toLowerCase() === input.label.toLowerCase() && p.kind === input.kind),
    );
    return {
      ...journey,
      pausedWork: [entry, ...withoutDup].slice(0, MAX_PAUSED_WORK),
      currentArtifactId: input.artifactId ?? journey.currentArtifactId,
    };
  });

  return entry;
}

export function resumeJourneyWork(workId: string): EstatePausedWork | null {
  let removed: EstatePausedWork | null = null;
  patchJourneyEngine((journey) => {
    const idx = journey.pausedWork.findIndex((p) => p.id === workId);
    if (idx < 0) return journey;
    removed = journey.pausedWork[idx]!;
    const pausedWork = journey.pausedWork.filter((p) => p.id !== workId);
    return {
      ...journey,
      pausedWork,
      currentArtifactId:
        removed.artifactId === journey.currentArtifactId ?
          null
        : journey.currentArtifactId,
    };
  });
  return removed;
}

export function clearJourneyPausedWorkForArtifact(artifactId: string): void {
  patchJourneyEngine((journey) => ({
    ...journey,
    pausedWork: journey.pausedWork.filter((p) => p.artifactId !== artifactId),
    currentArtifactId:
      journey.currentArtifactId === artifactId ? null : journey.currentArtifactId,
  }));
}

/** Capture in-progress artifact when member leaves a room mid-build. */
export function captureActiveArtifactAsPausedWork(
  fromEntryId?: string,
  fromSection?: AppSection,
): EstatePausedWork | null {
  const artifact = getActiveArtifact();
  if (!artifact) return null;
  if (artifact.status === "finalized" || artifact.status === "saved") return null;

  const inProgress =
    artifact.status === "building" ||
    artifact.status === "working_draft" ||
    artifact.status === "exploring" ||
    artifact.status === "ready_to_build" ||
    artifact.status === "needs_review";

  if (!inProgress && artifact.status !== "paused") return null;

  return pauseJourneyWork({
    kind: inferPausedKindFromArtifactType(artifact.type || artifact.title),
    label: artifact.title || artifact.type,
    entryId: fromEntryId,
    section: fromSection ?? artifact.pausedFromSection ?? undefined,
    artifactId: artifact.id,
    reason: "left room while working",
    resumeHint: `Continue ${artifact.title || artifact.type}`,
  });
}

export function mostRecentPausedWork(
  state = getJourneyEngineState(),
): EstatePausedWork | null {
  return state.pausedWork[0] ?? null;
}

export function pausedWorkReturnPhrase(work: EstatePausedWork): string {
  return `${pausedVerb(work.kind)} ${work.label}`;
}
