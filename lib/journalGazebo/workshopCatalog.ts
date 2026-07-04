import type {
  JournalBookmarkStyle,
  JournalPaperStyle,
  JournalPenStyle,
} from "./types";

export type JournalWorkshopPaperId =
  | "cream-cotton"
  | "rice"
  | "lined"
  | "dot-grid"
  | "sketch"
  | "mixed";

/** Workshop paper — maps to stored `paperStyle`. */
export const JOURNAL_WORKSHOP_PAPER_OPTIONS: {
  workshopId: JournalWorkshopPaperId;
  paperStyle: JournalPaperStyle;
  label: string;
  texture: string;
}[] = [
  {
    workshopId: "cream-cotton",
    paperStyle: "cotton",
    label: "Cream cotton",
    texture: "cream-cotton",
  },
  {
    workshopId: "rice",
    paperStyle: "parchment",
    label: "Rice paper",
    texture: "rice",
  },
  {
    workshopId: "lined",
    paperStyle: "linen",
    label: "Traditional lined",
    texture: "lined",
  },
  {
    workshopId: "dot-grid",
    paperStyle: "ivory",
    label: "Dot grid",
    texture: "dot-grid",
  },
  {
    workshopId: "sketch",
    paperStyle: "cream",
    label: "Blank sketch",
    texture: "sketch",
  },
  {
    workshopId: "mixed",
    paperStyle: "parchment",
    label: "Mixed journal",
    texture: "mixed",
  },
];

export const JOURNAL_WORKSHOP_PEN_OPTIONS: {
  id: JournalPenStyle;
  label: string;
  deskClass: string;
}[] = [
  { id: "fountain", label: "Fountain pen", deskClass: "fountain" },
  { id: "gel", label: "Fine liner", deskClass: "liner" },
  { id: "pencil", label: "Pencil", deskClass: "pencil" },
  { id: "ballpoint", label: "Calligraphy pen", deskClass: "calligraphy" },
];

export const JOURNAL_WORKSHOP_BOOKMARK_OPTIONS: {
  id: JournalBookmarkStyle;
  label: string;
}[] = [
  { id: "tassel", label: "Leather tassel" },
  { id: "ribbon", label: "Ribbon" },
  { id: "flower", label: "Pressed flower" },
  { id: "gold-leaf", label: "Gold leaf" },
];
