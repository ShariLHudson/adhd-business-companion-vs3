/**
 * Storybook Builder — chapters, styles, and preview for the keepsake experience.
 */

import {
  buildGrowthReportContent,
  type GrowthReportContent,
} from "@/lib/growthReports";
import type { ExportReportType } from "@/lib/memory/export/types";

export type GrowthReportType =
  | "annual"
  | "quarterly"
  | ExportReportType;

export type GrowthReportStyle = "storybook" | "visual" | "detailed";

export type GrowthReportIncludes = {
  wins: boolean;
  evidence: boolean;
  highlights: boolean;
  journey: boolean;
  photos: boolean;
  files: boolean;
  testimonials: boolean;
  certifications: boolean;
  reflections: boolean;
  journal: boolean;
};

function getReportRecipientName(): string {
  return "Your Growth Report";
}

export function storybookReportTypeToExport(
  reportType: GrowthReportType,
): ExportReportType | undefined {
  if (
    reportType === "journal" ||
    reportType === "portfolio" ||
    reportType === "evidence" ||
    reportType === "weekly-wins"
  ) {
    return reportType;
  }
  return undefined;
}

export type StorybookChapterId =
  | "wins"
  | "evidence"
  | "journal"
  | "portfolio"
  | "photos"
  | "voice"
  | "highlights";

export type StorybookStyleId =
  | "keepsake"
  | "annual-reflection"
  | "growth-journey"
  | "legacy";

export type StorybookChapter = {
  id: StorybookChapterId;
  title: string;
  description: string;
  icon: "spark" | "shield" | "quill" | "portfolio" | "camera" | "voice" | "star";
};

export type StorybookStyle = {
  id: StorybookStyleId;
  title: string;
  description: string;
  glyph: string;
  reportType: GrowthReportType;
  reportStyle: GrowthReportStyle;
};

export const STORYBOOK_CHAPTERS: StorybookChapter[] = [
  {
    id: "wins",
    title: "Wins & Celebrations",
    description: "Every milestone worth remembering.",
    icon: "spark",
  },
  {
    id: "evidence",
    title: "Evidence Vault",
    description: "Proof of your growth and resilience.",
    icon: "shield",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Private reflections and lessons learned.",
    icon: "quill",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Projects, creative work and accomplishments.",
    icon: "portfolio",
  },
  {
    id: "photos",
    title: "Photos & Memories",
    description: "Images that tell your story.",
    icon: "camera",
  },
  {
    id: "voice",
    title: "Voice & Conversations",
    description: "Moments captured in your own words.",
    icon: "voice",
  },
  {
    id: "highlights",
    title: "Highlights",
    description: "The memories Spark believes you'll treasure forever.",
    icon: "star",
  },
];

export const STORYBOOK_STYLES: StorybookStyle[] = [
  {
    id: "keepsake",
    title: "Keepsake Storybook",
    description: "Beautifully designed for printing and sharing.",
    glyph: "📖",
    reportType: "annual",
    reportStyle: "storybook",
  },
  {
    id: "annual-reflection",
    title: "Annual Reflection",
    description: "A thoughtful review of the past year.",
    glyph: "🌿",
    reportType: "annual",
    reportStyle: "storybook",
  },
  {
    id: "growth-journey",
    title: "Growth Journey",
    description: "Focuses on progress, lessons and milestones.",
    glyph: "✨",
    reportType: "quarterly",
    reportStyle: "visual",
  },
  {
    id: "legacy",
    title: "Legacy Edition",
    description: "Designed to preserve your story for generations.",
    glyph: "🏡",
    reportType: "annual",
    reportStyle: "detailed",
  },
];

/** Future book types — layout accommodates expansion without redesign. */
export const STORYBOOK_FUTURE_TYPES = [
  "My Story",
  "Annual Reflection",
  "Celebration Book",
  "Family Memory Album",
  "Legacy Collection",
  "Kinsey & Me",
  "Creative Portfolio",
] as const;

const EMPTY_INCLUDES: GrowthReportIncludes = {
  wins: false,
  evidence: false,
  highlights: false,
  journey: false,
  photos: false,
  files: false,
  testimonials: false,
  certifications: false,
  reflections: false,
  journal: false,
};

export function defaultStorybookChapters(): StorybookChapterId[] {
  return ["wins", "evidence", "journal", "portfolio", "photos", "highlights"];
}

export function defaultStorybookStyle(): StorybookStyleId {
  return "keepsake";
}

export function includesFromChapters(
  chapterIds: StorybookChapterId[],
): GrowthReportIncludes {
  const includes = { ...EMPTY_INCLUDES };

  for (const id of chapterIds) {
    switch (id) {
      case "wins":
        includes.wins = true;
        break;
      case "evidence":
        includes.evidence = true;
        break;
      case "journal":
        includes.journal = true;
        break;
      case "portfolio":
        includes.journey = true;
        includes.files = true;
        break;
      case "photos":
        includes.photos = true;
        break;
      case "voice":
        includes.reflections = true;
        break;
      case "highlights":
        includes.highlights = true;
        break;
      default:
        break;
    }
  }

  return includes;
}

export function resolveStorybookStyle(styleId: StorybookStyleId): StorybookStyle {
  return (
    STORYBOOK_STYLES.find((s) => s.id === styleId) ?? STORYBOOK_STYLES[0]
  );
}

export type StorybookPreview = {
  coverTitle: string;
  author: string;
  estimatedPages: number;
  chaptersSelected: number;
  photosIncluded: number;
  lastUpdatedLabel: string;
};

function formatLastUpdated(iso: string | null): string {
  if (!iso) return "Today";
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return "Today";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimatePages(content: GrowthReportContent): number {
  const words = content.body.trim().split(/\s+/).filter(Boolean).length;
  const pages = Math.ceil(words / 250) + 6;
  return Math.max(12, Math.min(pages, 180));
}

function latestContentTimestamp(_content: GrowthReportContent): string | null {
  return new Date().toISOString();
}

export function buildStorybookPreview(input: {
  chapterIds: StorybookChapterId[];
  styleId: StorybookStyleId;
}): StorybookPreview {
  const style = resolveStorybookStyle(input.styleId);
  const includes = includesFromChapters(input.chapterIds);
  const content = buildGrowthReportContent({
    reportType: storybookReportTypeToExport(style.reportType),
    reportStyle: style.reportStyle,
    includes: Object.entries(includes)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key),
  });

  const author = getReportRecipientName();

  return {
    coverTitle: "My Story",
    author: author === "Your Growth Report" ? "You" : author,
    estimatedPages: estimatePages(content),
    chaptersSelected: input.chapterIds.length,
    photosIncluded: input.chapterIds.includes("photos") ? 1 : 0,
    lastUpdatedLabel: formatLastUpdated(latestContentTimestamp(content)),
  };
}
