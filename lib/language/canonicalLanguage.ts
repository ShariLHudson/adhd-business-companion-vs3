/**
 * Canonical language and brand identity — ARCH-011.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

import { CANONICAL_LANGUAGE_CODE } from "./types";

export { CANONICAL_LANGUAGE_CODE };

/** Trademarked names — consistent worldwide; not localized. */
export const SPARK_BRAND_NAMES = {
  spark: "Spark",
  sparkEstate: "Spark Estate",
  visualSparkStudios: "Visual Spark Studios",
  kinsey: "Kinsey",
} as const;

/** Spark-owned content that must be authored in English first. */
export const SPARK_OWNED_CONTENT_CATEGORIES = [
  "spark-guide",
  "spark-card",
  "estate-canon",
  "chamber-bio",
  "room-introduction",
  "welcome-message",
  "tutorial",
  "help-article",
  "discovery-prompt",
  "guided-reflection",
  "quote",
  "educational",
  "audio-script",
  "tooltip",
  "onboarding",
] as const;

/** One app — language changes presentation, not these systems. */
export const LANGUAGE_INVARIANT_SYSTEMS = [
  "companion-intelligence",
  "memory",
  "feature-set",
  "canonical-content-library",
  "account",
  "subscription",
] as const;
