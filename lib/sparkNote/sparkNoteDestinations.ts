import type { SparkNoteDailyCard } from "./types";

/** Companion routes for Spark Note optional actions (per routing spec). */
export type SparkNoteDestination = "idea-vault" | "journal" | "momentum";

export const SPARK_NOTE_DESTINATION_ROUTES: Record<SparkNoteDestination, string> = {
  /** Idea Vault — remember this (Evidence Vault™ until dedicated Idea Vault ships). */
  "idea-vault": "/companion?section=evidence-bank",
  journal: "/companion?section=growth-journal",
  momentum: "/companion?section=momentum-builder",
};

export const SPARK_NOTE_CLIPBOARD_KEY = "spark-note-pending-clipboard";

export function buildSparkIdeaClipboard(card: SparkNoteDailyCard): string {
  return `${card.title}\n\n${card.sparkApplication}`;
}

export function buildSparkJournalSeed(card: SparkNoteDailyCard): string {
  return `Today's Spark: ${card.title}\n${card.teaser}\n\n${card.sparkApplication}`;
}

export function stageSparkNoteClipboard(text: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SPARK_NOTE_CLIPBOARD_KEY, text);
  } catch {
    /* quota */
  }
}

export async function copySparkNoteText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function navigateToSparkDestination(
  destination: SparkNoteDestination,
  clipboard: string,
): void {
  if (typeof window === "undefined") return;
  stageSparkNoteClipboard(clipboard);
  window.location.assign(SPARK_NOTE_DESTINATION_ROUTES[destination]);
}
