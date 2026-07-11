/**
 * Language & Translation Architecture — types.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

import type { LanguageCode } from "@/lib/companionLanguage";

export const CANONICAL_LANGUAGE_CODE = "en" as const satisfies LanguageCode;

/** Who authored the content — determines translation policy. */
export type ContentOwnership = "spark-owned" | "member-owned";

/** Spark-owned asset categories that must stay translation-ready. */
export type SparkOwnedContentCategory =
  | "spark-guide"
  | "spark-card"
  | "estate-canon"
  | "chamber-bio"
  | "room-introduction"
  | "welcome-message"
  | "tutorial"
  | "help-article"
  | "discovery-prompt"
  | "guided-reflection"
  | "quote"
  | "educational"
  | "audio-script"
  | "tooltip"
  | "onboarding";

/** Future member-facing translation preference toggles. */
export type TranslationPreferences = {
  autoTranslateSparkOwned: boolean;
  preserveMemberWriting: boolean;
  translateMemberWritingOnRequest: boolean;
  alwaysAnswerInSelectedLanguage: boolean;
  allowMultilingualConversations: boolean;
};

export const DEFAULT_TRANSLATION_PREFERENCES: TranslationPreferences = {
  autoTranslateSparkOwned: true,
  preserveMemberWriting: true,
  translateMemberWritingOnRequest: true,
  alwaysAnswerInSelectedLanguage: true,
  allowMultilingualConversations: true,
};

/** Canonical English record + optional localized overlays (cache or sidecar). */
export type TranslationReadyRecord<T extends Record<string, unknown>> = T & {
  /** Stable id — never localized. */
  id: string;
  /** English source strings — permanent source of truth. */
  canonicalLanguage: typeof CANONICAL_LANGUAGE_CODE;
  /** Generated or cached localized fields keyed by language code. */
  translations?: Partial<Record<LanguageCode, Partial<T>>>;
};
