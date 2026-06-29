/**
 * Storybook Builder — chapters, styles, and preview for the keepsake experience.
 */

import {
  buildGrowthReportContent,
  getReportRecipientName,
  type GrowthReportIncludes,
  type GrowthReportStyle,
  type GrowthReportType,
} from "@/lib/growthReports";

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

function estimatePages(content: ReturnType<typeof buildGrowthReportContent>): number {
  let pages = 6;
  pages += Math.ceil(content.wins.length / 2);
  pages += Math.ceil(content.evidence.length / 2);
  pages += Math.ceil(content.journal.length / 3);
  pages += Math.ceil(content.journey.length / 2);
  pages += Math.ceil(content.highlights.length / 3);
  pages += Math.ceil(content.reflections.length / 2);
  pages += Math.ceil(content.photos.length / 4) * 2;
  pages += Math.ceil(content.files.length / 4);
  return Math.max(12, Math.min(pages, 180));
}

function latestContentTimestamp(
  content: ReturnType<typeof buildGrowthReportContent>,
): string | null {
  const stamps: number[] = [new Date(content.generatedAt).getTime()];
  for (const w of content.wins) stamps.push(new Date(w.ts).getTime());
  for (const e of content.evidence) stamps.push(new Date(e.createdAt).getTime());
  for (const j of content.journal) stamps.push(new Date(j.createdAt).getTime());
  for (const h of content.highlights) {
    stamps.push(new Date(h.date || h.createdAt).getTime());
  }
  for (const j of content.journey) {
    stamps.push(new Date(j.date || j.createdAt).getTime());
  }
  const max = Math.max(...stamps);
  return Number.isFinite(max) ? new Date(max).toISOString() : null;
}

export function buildStorybookPreview(input: {
  chapterIds: StorybookChapterId[];
  styleId: StorybookStyleId;
}): StorybookPreview {
  const style = resolveStorybookStyle(input.styleId);
  const includes = includesFromChapters(input.chapterIds);
  const content = buildGrowthReportContent({
    reportType: style.reportType,
    reportStyle: style.reportStyle,
    includes,
  });

  const author = getReportRecipientName();

  return {
    coverTitle: "My Story",
    author: author === "Your Growth Report" ? "You" : author,
    estimatedPages: estimatePages(content),
    chaptersSelected: input.chapterIds.length,
    photosIncluded: content.photos.length,
    lastUpdatedLabel: formatLastUpdated(latestContentTimestamp(content)),
  };
}
