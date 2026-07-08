import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

export type SparkNoteCategory =
  | "invention"
  | "inventor"
  | "entrepreneur"
  | "business"
  | "history"
  | "holiday"
  | "fun_fact"
  | "quote"
  | "creativity"
  | "personal_growth"
  | "gratitude"
  | "adhd_friendly"
  | "personal";

export type SparkNoteType = "quick" | "story" | "deep";

export type SparkNoteReaction =
  | "loved"
  | "smile"
  | "idea"
  | "think"
  | "encouraged"
  | "pass"
  | "save";

export type SparkNoteCatalogEntry = {
  id: string;
  category: SparkNoteCategory;
  /** quick | story | deep — delight variety. */
  sparkType?: SparkNoteType;
  /** Display category label on expanded card. */
  categoryLabel: string;
  title: string;
  /** Collapsed card title — defaults to title when omitted. */
  shortTitle?: string;
  teaser: string;
  whatHappened: string;
  /** Optional — unusual or surprising angle (spec story section). */
  whyInteresting?: string;
  whyItMatters: string;
  sparkApplication: string;
  /** Primary expanded-card image. */
  imageSrc?: string;
  /** Optional thumbnail for collapsed card. */
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  /** Fixed calendar observance — only on this date. */
  monthDay?: { month: number; day: number };
  /** Seasonal month(s) without a fixed day — e.g. December holidays. */
  months?: number[];
  /** Season personality — spring, summer, autumn, winter, holiday. */
  seasons?: WelcomeSeason[];
  regions?: RegionCode[];
  /** Higher wins when multiple date entries match. */
  priority?: number;
  /** Days before the same spark may appear again in rotation. */
  cooldownDays?: number;
  /** Content tags for future interest matching and admin. */
  tags?: string[];
};

export type SparkNoteDailyCard = {
  id: string;
  category: SparkNoteCategory;
  categoryLabel: string;
  sparkType: SparkNoteType;
  title: string;
  shortTitle: string;
  teaser: string;
  whatHappened: string;
  whyInteresting?: string;
  whyItMatters: string;
  sparkApplication: string;
  imageSrc?: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  tags?: string[];
  /** personal | date | library */
  source: "personal" | "date" | "library";
};

export type EvaluateDailySparkNoteInput = {
  now?: Date;
  region?: RegionCode;
  firstName?: string | null;
  birthday?: { month: number; day: number } | null;
  personalDates?: PersonalDate[];
  memberSinceIso?: string | null;
  /** Force re-evaluation (tests). */
  forceRefresh?: boolean;
};

export type EvaluateDailySparkNoteOutput = {
  card: SparkNoteDailyCard | null;
};
