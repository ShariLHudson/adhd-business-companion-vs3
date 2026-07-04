import type { JournalBookmarkColor, JournalGazeboConfig } from "./types";

export const JOURNAL_RIBBON_CENTER_Y = 50;

/** Premium silk ribbon — default forest green. */
const RIBBON_BY_BOOKMARK: Record<JournalBookmarkColor, { main: string; highlight: string; sheen: string }> = {
  forest: { main: "#2d5a42", highlight: "#4a7a5e", sheen: "#6a9a78" },
  burgundy: { main: "#6b3040", highlight: "#8a4455", sheen: "#a85a6a" },
  navy: { main: "#2a3848", highlight: "#3d5068", sheen: "#5a7090" },
  gold: { main: "#8a6a28", highlight: "#b89248", sheen: "#d4b870" },
};

export function journalRibbonColors(
  config: Pick<JournalGazeboConfig, "bookmarkColor">,
): { main: string; highlight: string; sheen: string } {
  const color = config.bookmarkColor ?? "forest";
  return RIBBON_BY_BOOKMARK[color] ?? RIBBON_BY_BOOKMARK.forest;
}

/** Ribbon still draped on the center stitching — first-open ceremony moment. */
export function isRibbonAtCenter(tasselY: number): boolean {
  return Math.abs(tasselY - JOURNAL_RIBBON_CENTER_Y) < 1.5;
}
