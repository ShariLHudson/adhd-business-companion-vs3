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

/** Estate icon keys for gallery chips — never emoji in the visible card. */
export type SparkNoteGalleryIconKey =
  | "spark"
  | "flame"
  | "book"
  | "compass"
  | "seal"
  | "lens"
  | "leaf";

/** One illustrated chip in a Tell Me More gallery — a visual module, not decoration only. */
export type SparkNoteExpandedGalleryItem = {
  /** @deprecated Prefer `icon` — kept for authored library JSON that still stores a motif key/emoji. */
  emblem?: string;
  /** Estate-style icon key rendered as line art (never emoji). */
  icon?: SparkNoteGalleryIconKey;
  caption: string;
  /** Short explanation revealed when the chip is selected. */
  detail?: string;
  /** Optional secondary image for this angle. */
  imageSrc?: string;
  imageAlt?: string;
};

/** One step in a Tell Me More mini timeline — a visual module, not a paragraph. */
export type SparkNoteExpandedTimelineItem = {
  label: string;
  detail?: string;
};

/**
 * Second-layer "Tell Me More" content — authored independently from the
 * front (`teaser` / `whatHappened` / `whyItMatters` / `sparkApplication`).
 * Every field here must be genuinely new information, never a rephrase of
 * the front. See docs/spark-card/SPARK_CARD_IMAGERY_AND_TELL_ME_MORE_FIX_REPORT.md
 */
export type SparkNoteExpandedContent = {
  /** A specific "zoom in" detail — not mentioned anywhere on the front. */
  lookCloser?: string;
  /** Behind-the-scenes context — a second story beat, not a rephrase. */
  deeperStory?: string;
  /** What happened after / because of the front's story. */
  whatHappenedNext?: string;
  /** A surprising link between this Spark and today / modern life. */
  unexpectedConnection?: string;
  /** New facts — never a repeat of front copy. */
  newFacts?: string[];
  /** One small, concrete thing to try right now — distinct from Spark In Action. */
  tryThis?: string;
  /** Small illustrated gallery — visual module. */
  gallery?: SparkNoteExpandedGalleryItem[];
  /** Mini timeline — visual module for sequence-driven Sparks. */
  timeline?: SparkNoteExpandedTimelineItem[];
  /** Attribution / further reading, when relevant. */
  sources?: string[];
};

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
  /** Authored second-layer "Tell Me More" content — optional; generator fills gaps. */
  expanded?: SparkNoteExpandedContent;
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
  /** Authored second-layer "Tell Me More" content — optional; generator fills gaps. */
  expanded?: SparkNoteExpandedContent;
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
