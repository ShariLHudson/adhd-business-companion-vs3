/** Journal Gazebo — customization & session types. */

import type { JournalIntentionId } from "./journalIntentions";

export type { JournalIntentionId };

export type JournalPaperStyle =
  | "cream"
  | "ivory"
  | "parchment"
  | "linen"
  | "cotton"
  | "champagne"
  | "blush"
  | "sage";

export type JournalInkColor =
  | "charcoal"
  | "forest-green"
  | "navy"
  | "burgundy"
  | "sepia"
  | "plum";

export type JournalPenStyle = "fountain" | "ballpoint" | "gel" | "pencil" | "brush";

export type JournalNibSize = "fine" | "medium" | "broad";

export type JournalWritingMode = "silent" | "gentle" | "guided";

export type JournalLeatherColor =
  | "cognac"
  | "espresso"
  | "forest"
  | "midnight"
  | "burgundy"
  | "camel";

export type JournalCoverImageKind =
  | "estate-room"
  | "estate-art"
  | "upload"
  | "none";

export type JournalFontId =
  | "cormorant"
  | "lora"
  | "merriweather"
  | "source-serif"
  | "caveat"
  | "kalam";

export type JournalBookmarkColor = "burgundy" | "forest" | "navy" | "gold";

export type JournalBookmarkStyle = "tassel" | "ribbon" | "flower" | "gold-leaf";

export const JOURNAL_BOOKMARK_OPTIONS: {
  id: JournalBookmarkColor;
  label: string;
}[] = [
  { id: "burgundy", label: "Burgundy" },
  { id: "forest", label: "Forest" },
  { id: "navy", label: "Navy" },
  { id: "gold", label: "Gold" },
];

export type JournalGazeboConfig = {
  id: string;
  /** Journal title on cover and pages. */
  name: string;
  /** Name engraved on the cover — who the journal belongs to. */
  ownerName?: string;
  /** Ribbon bookmark — chosen during preparation. */
  bookmarkColor?: JournalBookmarkColor;
  bookmarkStyle?: JournalBookmarkStyle;
  /** Optional dedication — shown when the journal opens. */
  dedication?: string;
  leatherColor: JournalLeatherColor;
  embossedTitle: string;
  showSparkFlame: boolean;
  coverImageKind: JournalCoverImageKind;
  coverImageUrl?: string;
  coverEstatePlaceId?: string;
  /** Shelf template or custom commission path */
  shelfTemplateId?: string;
  coverMaterial?: "leather" | "linen";
  embossingStyle?: "gold" | "silver" | "blind";
  penVariant?: string;
  /**
   * What this journal is for — prayer, gratitude, health, etc.
   * Shapes page watermarks and blank-page questions.
   */
  intention?: JournalIntentionId;
  /**
   * Soft Estate place marks in the page corner.
   * Default true; false = clear pages (questions still match intention).
   */
  showPageWatermarks?: boolean;
  paperStyle: JournalPaperStyle;
  fontId: JournalFontId;
  inkColor: JournalInkColor;
  penStyle: JournalPenStyle;
  nibSize: JournalNibSize;
  /** Base handwriting size in px — fixed on the page so lines stay put. */
  writingFontSize?: number;
  writingMode: JournalWritingMode;
  createdAt: string;
  updatedAt: string;
};

export type JournalGazeboPhase =
  | "arrival"
  /** Room breathes — desk prepared, envelope waiting; no interruption. */
  | "estate"
  | "envelope-opening"
  /** Letter unfolds — full stationery, blurred world behind. */
  | "letter"
  /** Wrapped journal — ribbon, paper, reveal. */
  | "gift-unwrap"
  /** @deprecated alias — use `letter` */
  | "welcome-note"
  /** Letter folds — camera turns toward the Writing Desk. */
  | "writing-desk-arrival"
  | "creating"
  | "book-creation"
  | "return-greeting"
  | "journal-desk"
  /** Portrait admire before cover opens. */
  | "journal-reveal"
  | "journal-opening"
  /** First-journal dedication pages — once per journal. */
  | "ceremony"
  | "writing"
  /** Journal closed — resting in the Gazebo. */
  | "gazebo-rest"
  | "desk";

export type JournalCeremonyStep = 0 | 1 | 2 | 3;

export type JournalCreationStep =
  | "name"
  | "paper"
  | "writing-hand"
  | "cover"
  | "presence";

export const JOURNAL_TAG_PREFIX = "gazebo-journal:";

export function journalConfigTag(configId: string): string {
  return `${JOURNAL_TAG_PREFIX}${configId}`;
}

export function parseJournalConfigTag(tags: string[]): string | null {
  const tag = tags.find((t) => t.startsWith(JOURNAL_TAG_PREFIX));
  return tag ? tag.slice(JOURNAL_TAG_PREFIX.length) : null;
}
