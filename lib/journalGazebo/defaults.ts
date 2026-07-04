import type { JournalGazeboConfig } from "./types";

/** Elegant defaults for “Open Today's Page” — no setup required. */
export function todaysPageJournalDefaults(): Partial<JournalGazeboConfig> {
  return {
    name: "Today's Page",
    paperStyle: "cream",
    fontId: "caveat",
    inkColor: "charcoal",
    leatherColor: "cognac",
    penStyle: "fountain",
    nibSize: "medium",
    writingMode: "silent",
    coverImageKind: "none",
    showSparkFlame: true,
    embossedTitle: "",
  };
}
