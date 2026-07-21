/**
 * 101 — Business Pulse read model.
 * Does not own records — reflects Wins, Accomplishments, Evidence, Work relationships.
 */

import { listWorkBlueprintStates, listWorkRelationships } from "@/lib/universalWorkEngine";
import { getEvidenceEntries } from "@/lib/evidenceBankStore";
import {
  listAccomplishmentRecords,
  listWinRecords,
} from "./adapters";

export type BusinessPulseModel = {
  primaryStatement: string;
  meaningfulChanges: readonly string[];
  workInMotionCount: number;
  recentWinCount: number;
  recentAccomplishmentCount: number;
  recentEvidenceCount: number;
  nextHelpfulStep: string;
  /** Progressive disclosure panels — empty by default until opened. */
  disclosure: {
    seeWhatMovedForward: readonly string[];
    seeConnections: readonly string[];
    reviewWinsAndAccomplishments: readonly string[];
  };
};

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function buildBusinessPulse(
  nowMs: number = Date.now(),
): BusinessPulseModel {
  void nowMs;
  const since = daysAgoIso(14);
  const works = listWorkBlueprintStates();
  const wins = listWinRecords().filter((w) => w.occurredAt >= since);
  const accomplishments = listAccomplishmentRecords().filter(
    (a) => a.occurredAt >= since,
  );
  const evidence = getEvidenceEntries().filter((e) => e.createdAt >= since);

  const meaningfulChanges: string[] = [];
  if (wins.length > 0) {
    meaningfulChanges.push(
      wins.length === 1
        ? "One meaningful win this stretch."
        : `${wins.length} meaningful wins this stretch.`,
    );
  }
  if (accomplishments.length > 0) {
    meaningfulChanges.push(
      accomplishments.length === 1
        ? "One accomplishment is ready to recognize."
        : `${accomplishments.length} accomplishments were recognized.`,
    );
  }
  if (evidence.length > 0) {
    meaningfulChanges.push(
      evidence.length === 1
        ? "A new discovery was captured in the Evidence Vault."
        : `${evidence.length} discoveries were captured in the Evidence Vault.`,
    );
  }
  if (works.length > 0) {
    meaningfulChanges.push(
      works.length === 1
        ? "One Work item is currently in motion."
        : `You advanced ${works.length} Work items.`,
    );
  }

  let primaryStatement = "Everything is moving steadily.";
  if (accomplishments.length > 0) {
    primaryStatement = "Something substantial landed — worth noticing.";
  } else if (wins.length >= 2) {
    primaryStatement = "You advanced important momentum this week.";
  } else if (works.length === 0 && wins.length === 0) {
    primaryStatement = "A quiet stretch — still belonging here.";
  }

  const connectionLines: string[] = [];
  for (const w of works.slice(0, 5)) {
    const rels = listWorkRelationships(w.workId);
    if (rels.length) {
      connectionLines.push(
        `${w.blueprintId || w.workTypeId}: ${rels.length} connection${
          rels.length === 1 ? "" : "s"
        }`,
      );
    }
  }

  const nextHelpfulStep =
    accomplishments.length > 0
      ? "Review one accomplishment in the Hall when you are ready."
      : wins.length > 0
        ? "Visit the Celebration Garden for a quiet moment, or keep working."
        : works.length > 0
          ? "Continue the Work that feels most alive today."
          : "When something meaningful moves, Spark can help you recognize it.";

  return {
    primaryStatement,
    meaningfulChanges: meaningfulChanges.slice(0, 2),
    workInMotionCount: works.length,
    recentWinCount: wins.length,
    recentAccomplishmentCount: accomplishments.length,
    recentEvidenceCount: evidence.length,
    nextHelpfulStep,
    disclosure: {
      seeWhatMovedForward: [
        ...wins.map((w) => `Win: ${w.title}`),
        ...accomplishments.map((a) => `Accomplishment: ${a.title}`),
      ],
      seeConnections: connectionLines,
      reviewWinsAndAccomplishments: [
        ...wins.map((w) => w.title),
        ...accomplishments.map((a) => a.title),
        ...evidence.slice(0, 3).map((e) => `Evidence: ${e.whatHappened}`),
      ],
    },
  };
}
