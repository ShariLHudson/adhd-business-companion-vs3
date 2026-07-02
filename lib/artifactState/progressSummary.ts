/**
 * “Show me what we have so far” — universal progress summary.
 */

import {
  ARTIFACT_SECTION_STATUS_LABELS,
  ARTIFACT_SOURCE_LABELS,
  type Artifact,
  type ArtifactSection,
  type ArtifactSectionStatus,
} from "./types";
import { canOfferFinalizeActions } from "./finalizeGate";

const SHOW_PROGRESS_RE =
  /\b(?:show me what we have(?:\s+so far)?|what do we have so far|what have we got so far|where are we(?:\s+with this)?|progress so far|what(?:'s| is) our progress|summarize (?:what we have|our progress)|catch me up on (?:this|the draft|the offer|the workshop))\b/i;

export function isShowProgressRequest(text: string): boolean {
  return SHOW_PROGRESS_RE.test(text.trim());
}

function sectionSummaryLine(section: ArtifactSection): string {
  const status = section.status;
  const label = section.label;
  const content = section.content.trim();

  if (section.skipped) {
    return `**${label}:**\nSkipped for now.`;
  }

  if (!content) {
    return `**${label}:**\nNot started yet.`;
  }

  const statusNote = formatStatusNote(status, section.primarySource);
  return `**${label}:**\n${content}\n_${statusNote}_`;
}

function formatStatusNote(
  status: ArtifactSectionStatus,
  source: Artifact["sections"][number]["primarySource"],
): string {
  const base = ARTIFACT_SECTION_STATUS_LABELS[status];
  if (status === "drafted_by_shari") {
    return `${base} — we can revise this.`;
  }
  if (status === "needs_review") {
    return "Needs review — we can revise this.";
  }
  if (status === "answered_by_user") {
    return `Answered — from ${ARTIFACT_SOURCE_LABELS[source].toLowerCase()}.`;
  }
  if (status === "user_edited") {
    return "You edited this.";
  }
  if (status === "approved") {
    return "Approved.";
  }
  return base;
}

export function buildWhatWeHaveSoFarSummary(artifact: Artifact): string {
  const lines = artifact.sections.map(sectionSummaryLine);
  const header = "Here is what we have so far:";
  const body = lines.join("\n\n");
  const footer = "Which part would you like to work on next?";

  let message = `${header}\n\n${body}\n\n${footer}`;

  if (!canOfferFinalizeActions(artifact.status)) {
    message +=
      "\n\n_(Still a working draft — no print, export, or final version yet.)_";
  }

  return message;
}

export function suggestNextSection(artifact: Artifact): ArtifactSection | null {
  const revisit = artifact.revisitSectionIds
    .map((id) => artifact.sections.find((s) => s.id === id))
    .find((s) => s && !s.skipped);
  if (revisit) return revisit;

  const needsReview = artifact.sections.find(
    (s) => !s.skipped && (s.status === "needs_review" || s.unsure),
  );
  if (needsReview) return needsReview;

  const inProgress = artifact.sections.find(
    (s) => !s.skipped && s.status === "in_progress",
  );
  if (inProgress) return inProgress;

  return (
    artifact.sections.find(
      (s) => !s.skipped && !s.content.trim() && s.status === "not_started",
    ) ?? null
  );
}

export function buildNextSectionPrompt(artifact: Artifact): string | null {
  const next = suggestNextSection(artifact);
  if (!next) return null;
  if (next.status === "needs_review" || next.unsure) {
    return `Would you like to revisit **${next.label}**?`;
  }
  if (next.content.trim()) {
    return `We could refine **${next.label}** — or pick another section.`;
  }
  return `We haven't started **${next.label}** yet — want to work on that next?`;
}
