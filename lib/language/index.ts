/**
 * Language & Translation Architecture — public API.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

export type {
  ContentOwnership,
  SparkOwnedContentCategory,
  TranslationPreferences,
  TranslationReadyRecord,
} from "./types";

export {
  CANONICAL_LANGUAGE_CODE,
  DEFAULT_TRANSLATION_PREFERENCES,
} from "./types";

export {
  LANGUAGE_INVARIANT_SYSTEMS,
  SPARK_BRAND_NAMES,
  SPARK_OWNED_CONTENT_CATEGORIES,
} from "./canonicalLanguage";

export {
  TRANSLATION_PIPELINE_STAGES,
  sparkContentTranslationCacheKey,
  type TranslationPipelineStage,
} from "./translationPipeline";

export {
  isMemberOwnedContent,
  isSparkOwnedContent,
  shouldAutoTranslateMemberContent,
} from "./contentOwnership";

export {
  resolveSparkOwnedFields,
  resolveSparkOwnedText,
} from "./resolveSparkOwnedContent";

export { LANGUAGE_DEVELOPMENT_RULES } from "./developmentRules";
