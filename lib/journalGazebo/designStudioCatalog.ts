import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";
import {
  JOURNAL_ESTATE_COVER_ART_URL,
  JOURNAL_GAZEBO_COVER_ART_URL,
} from "./journalGazeboMedia";
import { JOURNAL_FONT_OPTIONS, JOURNAL_INK_OPTIONS, JOURNAL_LEATHER_OPTIONS } from "./catalog";
import type { JournalCoverImageKind, JournalLeatherColor, JournalPaperStyle } from "./types";

export type PrintedCoverDesign = {
  id: string;
  label: string;
  description: string;
  coverImageKind: JournalCoverImageKind;
  coverEstatePlaceId?: string;
  previewClass: string;
  previewImageUrl: string;
};

export const JOURNAL_PRINTED_COVER_DESIGNS: PrintedCoverDesign[] = [
  {
    id: "gazebo-watercolor",
    label: "Journal Gazebo",
    description: "The gazebo scene — soft garden light",
    coverImageKind: "estate-room",
    coverEstatePlaceId: "journal-gazebo",
    previewClass: "jg-design-cover--gazebo",
    previewImageUrl: JOURNAL_GAZEBO_COVER_ART_URL,
  },
  {
    id: "old-world-heritage",
    label: "Old World",
    description: "Heritage linen — embossed estate pattern",
    coverImageKind: "estate-room",
    coverEstatePlaceId: "my-estate",
    previewClass: "jg-design-cover--oldworld",
    previewImageUrl: JOURNAL_ESTATE_COVER_ART_URL,
  },
  {
    id: "celebration-garden",
    label: "Celebration Garden",
    description: "Garden blooms in gentle watercolor",
    coverImageKind: "estate-room",
    coverEstatePlaceId: "gardens",
    previewClass: "jg-design-cover--garden",
    previewImageUrl: ESTATE_ROOM_BG.celebrationGarden,
  },
];

export const JOURNAL_DESIGN_PAPER_OPTIONS: {
  id: JournalPaperStyle;
  label: string;
  description: string;
  textureClass: string;
}[] = [
  {
    id: "cotton",
    label: "Cream cotton",
    description: "Soft woven cotton — warm and forgiving",
    textureClass: "jg-design-paper--cotton",
  },
  {
    id: "ivory",
    label: "Warm ivory",
    description: "Smooth ivory with a gentle warmth",
    textureClass: "jg-design-paper--ivory",
  },
  {
    id: "champagne",
    label: "Champagne",
    description: "Pale gold undertone — luminous and calm",
    textureClass: "jg-design-paper--champagne",
  },
  {
    id: "parchment",
    label: "Rice paper",
    description: "Delicate rice paper with gentle translucence",
    textureClass: "jg-design-paper--rice",
  },
  {
    id: "linen",
    label: "Traditional lined",
    description: "Classic lines for steady handwriting",
    textureClass: "jg-design-paper--lined",
  },
  {
    id: "blush",
    label: "Soft blush",
    description: "A whisper of rose — tender and personal",
    textureClass: "jg-design-paper--blush",
  },
  {
    id: "sage",
    label: "Garden sage",
    description: "Quiet green-grey — reflective and grounded",
    textureClass: "jg-design-paper--sage",
  },
  {
    id: "cream",
    label: "Blank sketch",
    description: "Open ivory for drawing and dreaming",
    textureClass: "jg-design-paper--sketch",
  },
];

export const JOURNAL_FOUNTAIN_PEN_IMAGE = "/images/monte-blanc-pen-no-background.png";

export const JOURNAL_DESIGN_PEN_OPTIONS = [
  {
    id: "fountain" as const,
    label: "Fountain pen",
    description: "Montblanc-style — lacquer barrel, gold nib",
    previewClass: "jg-design-pen--fountain",
    previewImageUrl: JOURNAL_FOUNTAIN_PEN_IMAGE,
  },
  {
    id: "ballpoint" as const,
    label: "Ballpoint pen",
    description: "Polished lacquer with silver accents",
    previewClass: "jg-design-pen--ballpoint",
    previewImageUrl: "/images/journal-gazebo/pen-ballpoint.svg",
  },
  {
    id: "gel" as const,
    label: "Felt tip pen",
    description: "Fine felt liner — smooth, steady lines",
    previewClass: "jg-design-pen--felt",
    previewImageUrl: "/images/journal-gazebo/pen-felt.svg",
  },
  {
    id: "pencil" as const,
    label: "Pencil",
    description: "Brass-capped graphite — soft and forgiving",
    previewClass: "jg-design-pen--pencil",
    previewImageUrl: "/images/journal-gazebo/pen-pencil.svg",
  },
  {
    id: "brush" as const,
    label: "Brush pen",
    description: "Calligraphy brush — thick and thin in one stroke",
    previewClass: "jg-design-pen--brush",
    previewImageUrl: "/images/journal-gazebo/pen-felt.svg",
  },
];

export { JOURNAL_FONT_OPTIONS as JOURNAL_DESIGN_FONT_OPTIONS } from "./catalog";
export { JOURNAL_INK_OPTIONS as JOURNAL_DESIGN_INK_OPTIONS } from "./catalog";
export { JOURNAL_LEATHER_OPTIONS } from "./catalog";
