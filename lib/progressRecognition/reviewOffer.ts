/**
 * 101 — Quiet recognition review prompts (suggestion-first).
 */

import type { RecognitionCandidate } from "./contracts";
import { getRecognitionPreferences } from "./preferences";

export type RecognitionReviewOffer = {
  candidateId: string;
  kind: "win" | "accomplishment";
  prompt: string;
  choices: readonly { id: string; label: string }[];
};

export function buildRecognitionReviewOffer(
  candidate: RecognitionCandidate,
): RecognitionReviewOffer | null {
  const prefs = getRecognitionPreferences();
  if (prefs.doNotSuggestRecognition) return null;
  if (candidate.kind === "evidence") return null;

  if (candidate.kind === "win") {
    return {
      candidateId: candidate.candidateId,
      kind: "win",
      prompt: `You moved forward by completing “${candidate.title}”. Would you like to save this as a win?`,
      choices: [
        { id: "save_win", label: "Save as a win" },
        { id: "celebrate", label: "Celebrate this" },
        { id: "not_this_time", label: "Not this time" },
      ],
    };
  }

  return {
    candidateId: candidate.candidateId,
    kind: "accomplishment",
    prompt: `“${candidate.title}” looks like an accomplishment. Would you like to add it to the Hall of Accomplishments?`,
    choices: [
      { id: "add_hall", label: "Add to Hall" },
      { id: "celebrate_first", label: "Celebrate first" },
      { id: "save_as_win", label: "Save as a win instead" },
      { id: "not_this_time", label: "Not this time" },
    ],
  };
}

/** Prefer a single prompt — accomplishment wins when both exist. */
export function pickPrimaryReviewCandidate(
  candidates: readonly RecognitionCandidate[],
): RecognitionCandidate | null {
  const accomplishment = candidates.find((c) => c.kind === "accomplishment");
  if (accomplishment) return accomplishment;
  return candidates.find((c) => c.kind === "win") ?? null;
}
