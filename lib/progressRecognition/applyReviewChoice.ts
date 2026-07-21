/**
 * 101 — Apply recognition review choices (suggestion-first).
 */

import type { RecognitionCandidate } from "./contracts";
import {
  saveAccomplishmentRecord,
  saveEvidenceRecognitionRecord,
  saveWinRecord,
} from "./adapters";
import { buildCelebrationRouteOffer } from "./celebrationRouting";
import type { CelebrationRouteOffer } from "./celebrationRouting";

export type ReviewChoiceResult =
  | {
      outcome: "saved_win";
      winId: string;
      celebrationOffer: CelebrationRouteOffer;
    }
  | {
      outcome: "saved_accomplishment";
      accomplishmentId: string;
      celebrationOffer: CelebrationRouteOffer;
    }
  | { outcome: "declined" }
  | { outcome: "duplicate"; kind: "win" | "accomplishment"; id: string }
  | { outcome: "evidence_saved"; evidenceId: string }
  | { outcome: "evidence_refused"; reason: string };

export function applyRecognitionReviewChoice(input: {
  candidate: RecognitionCandidate;
  choiceId: string;
  returnPath?: CelebrationRouteOffer["returnPath"];
}): ReviewChoiceResult {
  const { candidate, choiceId } = input;

  if (choiceId === "not_this_time") {
    return { outcome: "declined" };
  }

  if (candidate.kind === "evidence") {
    if (choiceId !== "save_evidence" && choiceId !== "save_learning_evidence") {
      return { outcome: "declined" };
    }
    const saved = saveEvidenceRecognitionRecord({
      discovery: candidate.title,
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
    });
    if ("refused" in saved) {
      return { outcome: "evidence_refused", reason: saved.refused };
    }
    return { outcome: "evidence_saved", evidenceId: saved.evidenceId };
  }

  if (
    choiceId === "save_win" ||
    choiceId === "celebrate" ||
    choiceId === "save_as_win"
  ) {
    const win = saveWinRecord({
      title: candidate.title,
      significance:
        candidate.significanceScore >= 60 ? "significant" : "meaningful",
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      workId: candidate.workId,
      projectId: candidate.projectId,
      occurredAt: candidate.detectedAt,
    });
    if ("duplicateOf" in win) {
      return { outcome: "duplicate", kind: "win", id: win.duplicateOf.winId };
    }
    return {
      outcome: "saved_win",
      winId: win.winId,
      celebrationOffer: buildCelebrationRouteOffer({
        recognitionType: "win",
        recognitionId: win.winId,
        title: win.title,
        returnPath: input.returnPath ?? {
          workId: candidate.workId,
          projectId: candidate.projectId,
        },
      }),
    };
  }

  if (choiceId === "add_hall" || choiceId === "celebrate_first") {
    const acc = saveAccomplishmentRecord({
      title: candidate.title,
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
      workId: candidate.workId,
      projectId: candidate.projectId,
      blueprintId: candidate.blueprintId,
      occurredAt: candidate.detectedAt,
    });
    if ("duplicateOf" in acc) {
      return {
        outcome: "duplicate",
        kind: "accomplishment",
        id: acc.duplicateOf.accomplishmentId,
      };
    }
    return {
      outcome: "saved_accomplishment",
      accomplishmentId: acc.accomplishmentId,
      celebrationOffer: buildCelebrationRouteOffer({
        recognitionType: "accomplishment",
        recognitionId: acc.accomplishmentId,
        title: acc.title,
        returnPath: input.returnPath ?? {
          workId: candidate.workId,
          projectId: candidate.projectId,
        },
      }),
    };
  }

  return { outcome: "declined" };
}
