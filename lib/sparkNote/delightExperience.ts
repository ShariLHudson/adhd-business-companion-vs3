import type { SparkNoteType } from "./types";

/** Display label for delight spark variety (quick / story / deep). */
export function sparkTypeDisplayLabel(
  sparkType: SparkNoteType | undefined,
): string | null {
  switch (sparkType) {
    case "quick":
      return "Quick Spark";
    case "deep":
      return "Deep Spark";
    default:
      return null;
  }
}

/** Core delight reactions from SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL. */
export const SPARK_DELIGHT_CORE_REACTION_IDS = [
  "loved",
  "smile",
  "idea",
  "save",
] as const;
