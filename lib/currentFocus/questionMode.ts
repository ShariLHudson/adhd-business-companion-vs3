/**
 * 066 — reject split_screen question mode for Creation Destinations.
 */

import type { CreateQuestionMode } from "@/lib/createWorkflow";

export const CREATION_DESTINATION_QUESTION_MODE: CreateQuestionMode =
  "current_focus";

export function isLegacySplitScreenQuestionMode(
  mode: CreateQuestionMode | null | undefined,
): boolean {
  return mode === "split_screen";
}

/**
 * Coerce workflow question mode for Creation Destinations.
 * Never returns split_screen.
 */
export function coerceCreationDestinationQuestionMode(
  mode: CreateQuestionMode | null | undefined,
): CreateQuestionMode {
  if (mode === "split_screen" || !mode) {
    return CREATION_DESTINATION_QUESTION_MODE;
  }
  if (mode === "current_focus" || mode === "create_only") {
    return mode === "create_only"
      ? CREATION_DESTINATION_QUESTION_MODE
      : mode;
  }
  return CREATION_DESTINATION_QUESTION_MODE;
}

/** Throws when Creation Destination still requests split_screen. */
export function assertCreationDestinationQuestionMode(
  mode: CreateQuestionMode | null | undefined,
): CreateQuestionMode {
  if (isLegacySplitScreenQuestionMode(mode)) {
    throw new Error(
      "066: questionMode split_screen is rejected for Creation Destinations",
    );
  }
  return coerceCreationDestinationQuestionMode(mode);
}
