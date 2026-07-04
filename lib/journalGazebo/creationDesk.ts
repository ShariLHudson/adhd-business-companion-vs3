/**
 * Writing Desk creation — Experience Pass 2.
 * One beautiful decision at a time. No save buttons.
 */

import type {
  JournalCoverImageKind,
  JournalFontId,
  JournalInkColor,
  JournalLeatherColor,
  JournalPaperStyle,
  JournalPenStyle,
} from "./types";

export type WritingDeskCreationStep =
  | "name"
  | "cover-leather"
  | "cover-embossing"
  | "cover-art"
  | "paper"
  | "writing-style"
  | "pen"
  | "ink"
  | "gift-preparing"
  | "gift-wrapped"
  | "gift-unwrapping"
  | "gift-revealed"
  | "journal-opening"
  | "ceremony";

export type JournalEmbossingStyle = "gold" | "silver" | "blind";

export type JournalPenVariant =
  | "elegant-fountain"
  | "classic-ballpoint"
  | "mechanical-pencil"
  | "calligraphy";

export const WRITING_DESK_CREATION_STEPS: WritingDeskCreationStep[] = [
  "name",
  "cover-leather",
  "cover-embossing",
  "cover-art",
  "paper",
  "writing-style",
  "pen",
  "ink",
  "gift-preparing",
  "gift-wrapped",
  "gift-unwrapping",
  "gift-revealed",
  "journal-opening",
  "ceremony",
];

export const GIFT_PREPARING_MS = 4800;
export const GIFT_UNWRAP_MS = 2200;
export const JOURNAL_OPEN_FROM_GIFT_MS = 1300;

export const JOURNAL_NAME_SUGGESTIONS = [
  "Daily Reflections",
  "Prayer Journal",
  "Family Memories",
  "Business Ideas",
  "Gratitude",
  "Dreams",
  "Health Journey",
  "Travel Journal",
] as const;

export const JOURNAL_LEATHER_SWATCHES: {
  id: JournalLeatherColor;
  label: string;
}[] = [
  { id: "forest", label: "Forest Green" },
  { id: "burgundy", label: "Rich Burgundy" },
  { id: "midnight", label: "Navy Blue" },
  { id: "cognac", label: "Saddle Brown" },
  { id: "espresso", label: "Black Executive" },
];

export const JOURNAL_PAPER_SAMPLES: {
  id: JournalPaperStyle;
  label: string;
}[] = [
  { id: "cream", label: "Estate Cream" },
  { id: "ivory", label: "Ivory Cotton" },
  { id: "linen", label: "Warm Linen" },
  { id: "parchment", label: "Parchment" },
];

export const JOURNAL_WRITING_STYLE_SAMPLES: {
  id: JournalFontId;
  label: string;
  sample: string;
  nib?: "fine" | "medium" | "broad";
}[] = [
  {
    id: "caveat",
    label: "Elegant Script",
    sample: "Today I noticed the light…",
  },
  {
    id: "cormorant",
    label: "Classic Fountain",
    sample: "A thought worth keeping.",
    nib: "medium",
  },
  {
    id: "lora",
    label: "Neat Print",
    sample: "Three things I want to remember.",
  },
  {
    id: "source-serif",
    label: "Modern Journal",
    sample: "What would make tomorrow easier?",
  },
  {
    id: "merriweather",
    label: "Vintage Correspondence",
    sample: "My dearest friend,",
  },
  {
    id: "lora",
    label: "Book Manuscript",
    sample: "Chapter One — where it began.",
    nib: "broad",
  },
];

export const JOURNAL_PEN_ILLUSTRATIONS: {
  id: JournalPenVariant;
  penStyle: JournalPenStyle;
  nibSize: "fine" | "medium" | "broad";
  label: string;
}[] = [
  {
    id: "elegant-fountain",
    penStyle: "fountain",
    nibSize: "medium",
    label: "Elegant Fountain Pen",
  },
  {
    id: "classic-ballpoint",
    penStyle: "ballpoint",
    nibSize: "medium",
    label: "Classic Ballpoint",
  },
  {
    id: "mechanical-pencil",
    penStyle: "pencil",
    nibSize: "medium",
    label: "Mechanical Pencil",
  },
  {
    id: "calligraphy",
    penStyle: "fountain",
    nibSize: "broad",
    label: "Calligraphy Pen",
  },
];

export const JOURNAL_INK_BOTTLES: {
  id: JournalInkColor;
  label: string;
  css: string;
}[] = [
  { id: "charcoal", label: "Black", css: "#1f1c19" },
  { id: "sepia", label: "Sepia", css: "#5c4a38" },
  { id: "forest-green", label: "Forest Green", css: "#2f4a3e" },
  { id: "navy", label: "Deep Blue", css: "#1e3348" },
  { id: "burgundy", label: "Burgundy", css: "#5c2e35" },
];

export const JOURNAL_EMBOSSED_STYLES: {
  id: JournalEmbossingStyle;
  label: string;
}[] = [
  { id: "gold", label: "Gold Embossing" },
  { id: "silver", label: "Silver Embossing" },
  { id: "blind", label: "Blind Embossing" },
];

export const JOURNAL_COVER_ART_OPTIONS: {
  id: JournalCoverImageKind;
  label: string;
}[] = [
  { id: "none", label: "Plain Leather" },
  { id: "estate-room", label: "Estate Room Artwork" },
  { id: "upload", label: "Upload Your Own Image" },
];
