/**
 * Destination Gallery — outcome crystals for where Spark sends completed work.
 * @see docs/estate/recognition/library/156_DESTINATION_GALLERY_ARCHITECTURE.md
 */

import { estateBackgroundPath } from "@/lib/estate/estatePlaceMedia";

export const DESTINATION_GALLERY_PLACE_ID = "destination-gallery" as const;

export const DESTINATION_GALLERY_BG_VERSION = "20260709a" as const;

export const DESTINATION_GALLERY_BG_FILENAME =
  "destination-gallery.png" as const;

export const DESTINATION_GALLERY_BG =
  `${estateBackgroundPath(DESTINATION_GALLERY_BG_FILENAME)}?v=${DESTINATION_GALLERY_BG_VERSION}` as const;

/** Crystal base status — tiny, tasteful indicator (Architecture 156). */
export type DestinationCrystalStatus =
  | "ready"
  | "needs-connection"
  | "recently-used"
  | "favorite";

export const DESTINATION_CRYSTAL_STATUS_META: Readonly<
  Record<
    DestinationCrystalStatus,
    { label: string; glyph: string; description: string }
  >
> = {
  ready: {
    label: "Ready",
    glyph: "🟢",
    description: "Connected and available",
  },
  "needs-connection": {
    label: "Needs Connection",
    glyph: "🟡",
    description: "Not yet connected",
  },
  "recently-used": {
    label: "Recently Used",
    glyph: "🔵",
    description: "Last destination used",
  },
  favorite: {
    label: "Favorite",
    glyph: "⭐",
    description: "Member's default choice",
  },
};

export type DestinationCrystalId =
  | "schedule"
  | "write"
  | "save"
  | "spark-social-media"
  | "print"
  | "create";

export type DestinationCrystal = {
  id: DestinationCrystalId;
  /** Member-facing outcome name — never an app brand as the primary label */
  name: string;
  purpose: string;
  /** Connected services (Spark Hands) — not member destinations */
  hands: readonly string[];
  capabilities: readonly string[];
  /** Social / publish crystals require explicit member approval before going live */
  requiresPublishApproval?: boolean;
};

export const DESTINATION_GALLERY_CRYSTALS: readonly DestinationCrystal[] = [
  {
    id: "schedule",
    name: "Schedule",
    purpose: "Schedule work, meetings, reminders and focus sessions.",
    hands: ["Google Calendar"],
    capabilities: [
      "Create calendar events",
      "Schedule focus sessions",
      "Schedule workshops",
      "Block work time",
      "Add reminders",
    ],
  },
  {
    id: "write",
    name: "Document",
    purpose: "Save written content.",
    hands: ["Google Docs"],
    capabilities: [
      "Create documents",
      "Save workshops",
      "Save blog posts",
      "Save SOPs",
      "Save books",
      "Save journals",
      "Save meeting notes",
    ],
  },
  {
    id: "save",
    name: "Store",
    purpose: "Store important files.",
    hands: ["Google Drive"],
    capabilities: [
      "Save files",
      "Create folders",
      "Organize projects",
      "Store PDFs",
      "Store images",
      "Store presentations",
    ],
  },
  {
    id: "spark-social-media",
    name: "Share",
    purpose: "Prepare content for publishing.",
    hands: [
      "Facebook",
      "Instagram",
      "LinkedIn",
      "Pinterest",
      "TikTok",
      "YouTube",
    ],
    capabilities: [
      "Create posts",
      "Create captions",
      "Create Pinterest pins",
      "Create carousels",
      "Create video descriptions",
      "Adapt content for each platform",
    ],
    requiresPublishApproval: true,
  },
  {
    id: "print",
    name: "Print",
    purpose: "Prepare printable versions.",
    hands: ["Print", "PDF", "Download"],
    capabilities: [
      "Print",
      "Save as PDF",
      "Download",
      "Export workbook",
      "Export checklist",
      "Export journal",
      "Export worksheets",
    ],
  },
  {
    id: "create",
    name: "Design",
    purpose: "Create visual assets.",
    hands: ["Canva"],
    capabilities: [
      "Create presentations",
      "Create graphics",
      "Create social images",
      "Create workbooks",
      "Create guides",
      "Create PDFs",
    ],
  },
] as const;

export const DESTINATION_GALLERY_OFFER_LINE =
  "Where would you like me to send this?" as const;

/** Phrases that should open Destination Gallery (intent routing). */
export const DESTINATION_GALLERY_INTENT_RE =
  /\b(?:save this|schedule this|put this on my calendar|create a document|save to google docs|save to(?: google)? drive|create a canva|make a workbook|print this|download this|export this|create social media|post this|share this|send this somewhere|where (?:should|would) (?:i|we|you) send)\b/i;

export function isDestinationGalleryIntent(text: string): boolean {
  return DESTINATION_GALLERY_INTENT_RE.test(text.trim());
}

export function getDestinationCrystal(
  id: DestinationCrystalId,
): DestinationCrystal | null {
  return DESTINATION_GALLERY_CRYSTALS.find((c) => c.id === id) ?? null;
}
