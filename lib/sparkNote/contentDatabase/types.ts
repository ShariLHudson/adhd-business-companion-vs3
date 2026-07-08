import type { RegionCode } from "@/lib/companionLanguage";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";

import type { SparkNoteCategory, SparkNoteType } from "../types";

/** Audience tags for future personalization (content database protocol). */
export type SparkAudience =
  | "Everyone"
  | "Entrepreneurs"
  | "Creators"
  | "Leaders"
  | "Learners";

export type SparkTone =
  | "curious"
  | "playful"
  | "celebratory"
  | "reflective"
  | "encouraging"
  | "supportive";

export type SparkContentStatus = "draft" | "review" | "active" | "archived";

export type SparkDateRules =
  | { type: "evergreen" }
  | { type: "specific_date"; date: string }
  | { type: "season"; value: WelcomeSeason }
  | { type: "months"; months: number[] }
  | { type: "personal_event" };

/**
 * Spark library record — JSON shape in `spark-library/` per
 * SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md
 */
export type SparkContentRecord = {
  spark_id: string;
  title: string;
  /** Display category name (authoring). */
  category: string;
  subcategory?: string;
  audience: SparkAudience[];
  image?: string | null;
  thumbnail?: string | null;
  thumbnail_alt?: string;
  short_teaser: string;
  story: string;
  why_interesting?: string;
  impact: string;
  spark_application: string;
  tags: string[];
  date_rules: SparkDateRules;
  tone: SparkTone;
  status: SparkContentStatus;
  /** Round-trip fields for the runtime engine (optional in JSON). */
  runtime_category?: SparkNoteCategory;
  category_label?: string;
  spark_type?: SparkNoteType;
  short_title?: string;
  priority?: number;
  cooldown_days?: number;
  regions?: RegionCode[];
};

export type SparkDailySelectionReason = "personal" | "date" | "library";

/** Per-day selection metadata (content database protocol). */
export type SparkDailySelectionRecord = {
  sparkId: string;
  date: string;
  selectedReason: SparkDailySelectionReason;
  viewed?: boolean;
  saved?: boolean;
};
