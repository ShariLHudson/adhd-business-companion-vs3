/**
 * Purpose Anchor — every visual thinking session starts with intent.
 */

import type { VisualFocusMode } from "@/lib/visualFocus/types";

export type PurposeAnchorMode = VisualFocusMode | "decision-compass";

export type PurposeAnchor = {
  question: string;
  userAnswer: string;
  mode: PurposeAnchorMode;
  capturedAt: string;
};

export const PURPOSE_ANCHOR_QUESTIONS: Record<PurposeAnchorMode, string> = {
  "mind-map": "What are you trying to figure out?",
  "decision-tree": "What decision are you exploring?",
  "strategy-map": "What outcome are you trying to achieve?",
  "relationship-map": "What relationships are you trying to understand?",
  "project-map": "What project are you breaking down?",
  "business-canvas": "What business are we mapping?",
  "visual-kanban": "What ideas are you organizing?",
  "decision-compass": "What are you deciding between?",
};

export function purposeQuestionForMode(mode: PurposeAnchorMode): string {
  return PURPOSE_ANCHOR_QUESTIONS[mode];
}

export function createPurposeAnchor(
  mode: PurposeAnchorMode,
  userAnswer: string,
): PurposeAnchor {
  const answer = userAnswer.trim();
  return {
    question: purposeQuestionForMode(mode),
    userAnswer: answer,
    mode,
    capturedAt: new Date().toISOString(),
  };
}

export function purposeAnchorTitle(anchor: PurposeAnchor, max = 80): string {
  const t = anchor.userAnswer.trim();
  if (!t) return "Untitled map";
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
