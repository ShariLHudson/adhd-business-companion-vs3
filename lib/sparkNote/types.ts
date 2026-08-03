import type { RegionCode } from "@/lib/companionLanguage";
import type { PersonalDate } from "@/lib/recognition/types";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

/**
 * Spark Card categories — the 12 approved numbered Spark Editions (001–012).
 * Each value is an edition code; see `lib/sparkNote/sparkEditions.ts` for the
 * number → label → edition-cover mapping (collection layer only — edition covers
 * are never used as individual card hero images).
 */
export type SparkNoteCategory =
  | "001" // Discovery
  | "002" // People & Stories
  | "003" // Creativity & Inspiration
  | "004" // Nature & Places
  | "005" // Curiosity
  | "006" // Words & Origins
  | "007" // Strategy
  | "008" // Reflection
  | "009" // Adventure
  | "010" // Business
  | "011" // Innovation
  | "012"; // Wonder

export type SparkNoteType = "quick" | "story" | "deep";

/**
 * New scheduling model (Volumes 2–4 + seasonal collections). Additive and
 * optional — legacy Volume 1 records keep using `monthDay` / `months` /
 * `seasons`. One normalization layer (`scheduling/normalizedSchedule.ts`)
 * converts BOTH shapes into a single internal model before selection.
 */
export type SparkDisplayRule =
  | "core"
  | "seasonal"
  | "exact-date"
  | "calculated-date";

/** Holidays whose date is computed each year (see scheduling/calculatedDates). */
export type SparkCalculatedDateRule =
  | "thanksgiving-us"
  | "memorial-day-us"
  | "mothers-day-us"
  | "mlk-day-us"
  | "winter-solstice"
  | "spring-equinox";

/** Season keyword used by the new seasonal cards (Iowa collections). */
export type SparkSeason = "spring" | "summer" | "autumn" | "winter";

/** Which authored collection a card belongs to. */
export type SparkCollection = "core" | "iowa-seasons";

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

  // --- New scheduling model (additive; legacy fields above still apply) -------
  // Present on Volumes 2–4 + seasonal cards. The normalization layer reads these
  // when `displayRule` is set, otherwise it falls back to the legacy fields.
  /** How this card is scheduled. When set, takes precedence over legacy fields. */
  displayRule?: SparkDisplayRule;
  /** Computed-holiday rule (only with `displayRule: "calculated-date"`). */
  dateRule?: SparkCalculatedDateRule;
  /** Single season keyword (only with `displayRule: "seasonal"`). */
  season?: SparkSeason;
  /** Flat exact-date month (1–12) — new-model equivalent of `monthDay.month`. */
  month?: number;
  /** Flat exact-date day (1–31) — new-model equivalent of `monthDay.day`. */
  day?: number;
  /** Which content volume this card came from (1–4). Filtering/admin only. */
  volume?: number;
  /** Which authored collection (core / iowa-seasons). Filtering/admin only. */
  collection?: SparkCollection;

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
