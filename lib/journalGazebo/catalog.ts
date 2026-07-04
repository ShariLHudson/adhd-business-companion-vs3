import type {
  JournalFontId,
  JournalInkColor,
  JournalLeatherColor,
  JournalPaperStyle,
  JournalPenStyle,
} from "./types";

export const JOURNAL_NAME_SUGGESTIONS = [
  "My Journey",
  "Reflections",
  "Becoming",
  "The Next Chapter",
  "Quiet Thoughts",
  "My Legacy",
] as const;

export type JournalNameSuggestion = (typeof JOURNAL_NAME_SUGGESTIONS)[number];

export const JOURNAL_PAPER_OPTIONS: {
  id: JournalPaperStyle;
  label: string;
}[] = [
  { id: "cream", label: "Cream stationery" },
  { id: "ivory", label: "Ivory stationery" },
  { id: "parchment", label: "Light parchment" },
  { id: "linen", label: "Linen paper" },
  { id: "cotton", label: "Cotton paper" },
];

export const JOURNAL_INK_OPTIONS: {
  id: JournalInkColor;
  label: string;
  css: string;
}[] = [
  { id: "charcoal", label: "Charcoal", css: "#2a2622" },
  { id: "forest-green", label: "Forest Green", css: "#4a6b58" },
  { id: "navy", label: "Navy", css: "#4a5a6e" },
  { id: "burgundy", label: "Burgundy", css: "#7a4a50" },
  { id: "sepia", label: "Sepia", css: "#8a7058" },
  { id: "plum", label: "Plum", css: "#6e5a78" },
];

export const JOURNAL_PEN_OPTIONS: { id: JournalPenStyle; label: string }[] = [
  { id: "fountain", label: "Fountain Pen" },
  { id: "ballpoint", label: "Ballpoint" },
  { id: "gel", label: "Felt Tip Pen" },
  { id: "pencil", label: "Pencil" },
];

export const JOURNAL_WRITING_FONT_SIZE_OPTIONS = [
  { id: 14, label: "Small" },
  { id: 16, label: "Comfortable" },
  { id: 18, label: "Medium" },
  { id: 20, label: "Large" },
  { id: 22, label: "Roomy" },
  { id: 24, label: "Generous" },
  { id: 28, label: "Bold" },
] as const;

export const JOURNAL_NIB_OPTIONS = [
  { id: "fine" as const, label: "Fine" },
  { id: "medium" as const, label: "Medium" },
  { id: "broad" as const, label: "Broad" },
];

export const JOURNAL_FONT_OPTIONS: {
  id: JournalFontId;
  label: string;
  family: string;
}[] = [
  {
    id: "cormorant",
    label: "Cormorant",
    family: '"Cormorant Garamond", "Palatino Linotype", Georgia, serif',
  },
  {
    id: "lora",
    label: "Georgia",
    family: 'Georgia, "Times New Roman", serif',
  },
  {
    id: "merriweather",
    label: "Merriweather",
    family: '"Merriweather", Georgia, serif',
  },
  {
    id: "source-serif",
    label: "Source Serif",
    family: '"Source Serif 4", Georgia, serif',
  },
  {
    id: "caveat",
    label: "Pinyon Script",
    family: '"Pinyon Script", "Segoe Script", cursive',
  },
  {
    id: "kalam",
    label: "Playfair Display",
    family: '"Playfair Display", Georgia, serif',
  },
];

export const JOURNAL_LEATHER_OPTIONS: {
  id: JournalLeatherColor;
  label: string;
  textureLabel: string;
  swatch: string;
}[] = [
  {
    id: "forest",
    label: "Forest Green",
    textureLabel: "Smooth English leather",
    swatch: "#2f4a3e",
  },
  {
    id: "cognac",
    label: "Chestnut",
    textureLabel: "Distressed saddle leather",
    swatch: "#8b5a3c",
  },
  {
    id: "midnight",
    label: "Deep Navy",
    textureLabel: "Cross-grain leather",
    swatch: "#1e2a38",
  },
  {
    id: "burgundy",
    label: "Burgundy",
    textureLabel: "Pebbled leather",
    swatch: "#5c2e35",
  },
  {
    id: "espresso",
    label: "Charcoal",
    textureLabel: "Fine calfskin",
    swatch: "#3d2b22",
  },
  {
    id: "camel",
    label: "Cream",
    textureLabel: "Linen wrapped",
    swatch: "#a68b5b",
  },
];

export const JOURNAL_WRITING_MODE_OPTIONS = [
  {
    id: "silent" as const,
    label: "Quiet presence",
    description: "I'll step back after greeting — this is your page.",
  },
  {
    id: "gentle" as const,
    label: "Gentle reflection",
    description: "I may ask a thoughtful question now and then, never rushing you.",
  },
  {
    id: "guided" as const,
    label: "Guided journal",
    description: "I'll offer gentle prompts when they might help you begin.",
  },
];

export const JOURNAL_COVER_IMAGE_OPTIONS = [
  { id: "estate-room" as const, label: "Favorite Estate room" },
  { id: "estate-art" as const, label: "Estate artwork" },
  { id: "upload" as const, label: "Upload personal image" },
  { id: "none" as const, label: "No image" },
];

export const ESTATE_COVER_PLACE_OPTIONS = [
  { id: "journal", label: "Journal Gazebo" },
  { id: "gardens", label: "Celebration Garden" },
  { id: "library", label: "Achievement Library" },
  { id: "greenhouse", label: "Growth Greenhouse" },
  { id: "conservatory", label: "Conservatory" },
  { id: "coffee-house", label: "Coffee House" },
];
