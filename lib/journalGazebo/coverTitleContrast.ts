import type { JournalGazeboConfig, JournalLeatherColor } from "./types";

export type CoverTitleTone = "on-dark" | "on-light";

type CoverChoice =
  | { kind: "leather"; leatherColor: JournalLeatherColor }
  | { kind: "printed"; designId: string };

const DARK_LEATHERS = new Set<JournalLeatherColor>([
  "forest",
  "midnight",
  "burgundy",
  "espresso",
]);

/** Light cover → dark title. Dark cover → light title. */
export function resolveCoverTitleTone(
  _config: JournalGazeboConfig,
  coverChoice: CoverChoice | null,
): CoverTitleTone {
  if (!coverChoice) return "on-dark";
  if (coverChoice.kind === "leather") {
    return DARK_LEATHERS.has(coverChoice.leatherColor) ? "on-dark" : "on-light";
  }
  return "on-light";
}
