/**
 * Cross-room continuity — artifact pauses when member leaves Create.
 */

import type { AppSection } from "@/lib/companionUi";
import type { Artifact } from "./types";

const PAUSE_ROOM_SECTIONS: ReadonlySet<AppSection> = new Set([
  "momentum-institute",
  "grow-observatory",
  "brain-dump",
  "decision-compass",
  "focus-audio",
  "quick-recharge",
  "how-do-i",
  "growth-library",
]);

export function shouldPauseArtifactForSection(section: AppSection): boolean {
  return PAUSE_ROOM_SECTIONS.has(section);
}

export function pauseArtifactForRoom(
  artifact: Artifact,
  fromSection: AppSection,
  reason?: string,
): Artifact {
  return {
    ...artifact,
    status: "paused",
    pausedFromSection: fromSection,
    pauseReason: reason ?? `Visited ${fromSection}`,
    updatedAt: new Date().toISOString(),
  };
}

export function resumeArtifact(artifact: Artifact): Artifact {
  return {
    ...artifact,
    status: artifact.finalizedAt ? "finalized" : "working_draft",
    pausedFromSection: null,
    pauseReason: null,
    updatedAt: new Date().toISOString(),
  };
}

export function buildArtifactReturnGreeting(artifact: Artifact): string {
  const type = artifact.title || artifact.type;
  if (artifact.status !== "paused" && artifact.status !== "saved") {
    return `Welcome back. We can continue shaping your **${type}** whenever you're ready.`;
  }
  return (
    `Welcome back. We were building your **${type}**. ` +
    `Would you like to continue where we left off?`
  );
}

export function artifactContinuityHint(artifact: Artifact | null): string | undefined {
  if (!artifact) return undefined;
  if (artifact.status !== "paused" && artifact.status !== "saved") return undefined;
  return [
    "ARTIFACT CONTINUITY:",
    `Paused artifact: ${artifact.type} (${artifact.title}).`,
    artifact.pausedFromSection
      ? `Member stepped away to ${artifact.pausedFromSection}.`
      : "",
    "On return: welcome back + offer to continue where they left off.",
    "Do not restart or discard section progress.",
  ]
    .filter(Boolean)
    .join("\n");
}
