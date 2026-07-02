/**
 * Revision commands — update one section, never regenerate whole artifact.
 */

import type { Artifact } from "./types";
import {
  applyManualEditToSection,
  clearSection,
  keepBothSectionOptions,
  markSectionSkipped,
  markSectionUnsure,
  requestSectionRevisit,
} from "./artifactModel";

export type ArtifactRevisionCommand =
  | { kind: "show_progress" }
  | { kind: "change_section"; sectionId: string; sectionLabel: string }
  | { kind: "rewrite_section"; sectionId: string; sectionLabel: string }
  | { kind: "skip_section"; sectionId: string; sectionLabel: string }
  | { kind: "mark_unsure"; sectionId: string; sectionLabel: string }
  | { kind: "save_later" }
  | { kind: "start_over_section"; sectionId: string; sectionLabel: string }
  | { kind: "compare_versions"; sectionId: string; sectionLabel: string }
  | { kind: "keep_both"; sectionId: string; sectionLabel: string }
  | { kind: "none" };

const SAVE_LATER_RE =
  /\b(?:save (?:this )?for later|come back (?:to this )?later|pick (?:this )?up later|pause (?:this|the) (?:project|draft|for now))\b/i;

const UNSURE_RE =
  /\b(?:not sure|unsure|mark (?:this|it) as unsure|don't know yet)\b/i;

const START_OVER_RE =
  /\b(?:start over|clear (?:this|the)|redo|reset)\b(?:\s+(?:with|on))?\b/i;

const COMPARE_RE =
  /\b(?:compare (?:two )?versions?|show (?:both|two) options?|keep both)\b/i;

function matchSectionByLabel(
  artifact: Artifact,
  text: string,
): { id: string; label: string } | null {
  const lower = text.toLowerCase();
  for (const s of artifact.sections) {
    const labelLower = s.label.toLowerCase();
    if (lower.includes(labelLower)) {
      return { id: s.id, label: s.label };
    }
    const stem = labelLower.slice(0, Math.min(4, labelLower.length));
    if (stem.length >= 4 && lower.includes(stem)) {
      return { id: s.id, label: s.label };
    }
    if (lower.includes(s.id.toLowerCase())) {
      return { id: s.id, label: s.label };
    }
  }
  return null;
}

export function parseArtifactRevisionCommand(
  text: string,
  artifact: Artifact | null,
): ArtifactRevisionCommand {
  const t = text.trim();
  if (!t || !artifact) return { kind: "none" };

  if (SAVE_LATER_RE.test(t)) return { kind: "save_later" };

  const section = matchSectionByLabel(artifact, t);

  if (/\bskip\b/i.test(t) && section) {
    return {
      kind: "skip_section",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (COMPARE_RE.test(t) && section) {
    return {
      kind: "keep_both",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (START_OVER_RE.test(t) && section) {
    return {
      kind: "start_over_section",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (UNSURE_RE.test(t) && section) {
    return {
      kind: "mark_unsure",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (/\b(?:change|update|revise)\b/i.test(t) && section) {
    return {
      kind: "change_section",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (/\b(?:rewrite|redo|rework)\b/i.test(t) && section) {
    return {
      kind: "rewrite_section",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  if (/\bcompare\b/i.test(t) && section) {
    return {
      kind: "compare_versions",
      sectionId: section.id,
      sectionLabel: section.label,
    };
  }

  return { kind: "none" };
}

export type RevisionCommandResult = {
  artifact: Artifact;
  reply: string;
  pauseRequested?: boolean;
};

export function applyArtifactRevisionCommand(
  artifact: Artifact,
  command: ArtifactRevisionCommand,
): RevisionCommandResult | null {
  switch (command.kind) {
    case "none":
    case "show_progress":
      return null;
    case "skip_section":
      return {
        artifact: markSectionSkipped(artifact, command.sectionId),
        reply: `Got it — we'll skip **${command.sectionLabel}** for now. You can come back anytime.`,
      };
    case "mark_unsure":
      return {
        artifact: markSectionUnsure(artifact, command.sectionId),
        reply: `I'll mark **${command.sectionLabel}** as unsure — no pressure to finalize that part yet.`,
      };
    case "start_over_section":
      return {
        artifact: clearSection(artifact, command.sectionId),
        reply: `**${command.sectionLabel}** is cleared. What would you like to put there instead?`,
      };
    case "change_section":
    case "rewrite_section":
      return {
        artifact: requestSectionRevisit(artifact, command.sectionId),
        reply: `Sure — what would you like **${command.sectionLabel}** to say instead?`,
      };
    case "compare_versions": {
      const revisions = artifact.revisions.filter(
        (r) => r.sectionId === command.sectionId,
      );
      if (revisions.length < 2) {
        return {
          artifact: requestSectionRevisit(artifact, command.sectionId),
          reply: `We only have one version of **${command.sectionLabel}** so far. Want to try a different direction?`,
        };
      }
      const lines = revisions
        .slice(-2)
        .map((r, i) => `**Version ${i + 1}:**\n${r.content}`)
        .join("\n\n");
      return {
        artifact: requestSectionRevisit(artifact, command.sectionId),
        reply: `Here are two versions of **${command.sectionLabel}**:\n\n${lines}\n\nWhich direction feels closer — or should we keep both?`,
      };
    }
    case "keep_both":
      return {
        artifact: requestSectionRevisit(artifact, command.sectionId),
        reply: `Tell me both options for **${command.sectionLabel}** — I'll keep them side by side for you to compare.`,
      };
    case "save_later":
      return {
        artifact: { ...artifact, status: "saved", updatedAt: new Date().toISOString() },
        reply:
          "I'll keep this as a paused project — nothing is lost. We can pick it up whenever you're ready.",
        pauseRequested: true,
      };
    default:
      return null;
  }
}

export function applyKeepBothOptions(
  artifact: Artifact,
  sectionId: string,
  optionA: string,
  optionB: string,
): RevisionCommandResult {
  const section = artifact.sections.find((s) => s.id === sectionId);
  return {
    artifact: keepBothSectionOptions(artifact, sectionId, optionA, optionB),
    reply: `Both options are saved under **${section?.label ?? sectionId}** — marked needs review so you can choose when ready.`,
  };
}
