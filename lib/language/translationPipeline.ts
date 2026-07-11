/**
 * Translation pipeline stages — ARCH-011.
 *
 * Spark-owned content flows through AI translation + cache; English is canonical.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

export const TRANSLATION_PIPELINE_STAGES = [
  "master-english-content",
  "ai-translation-layer",
  "localized-version",
  "cache",
  "member",
] as const;

export type TranslationPipelineStage =
  (typeof TRANSLATION_PIPELINE_STAGES)[number];

/** Stable cache key for generated Spark-owned translations. */
export function sparkContentTranslationCacheKey(
  assetId: string,
  language: string,
  version = "v1",
): string {
  const safeId = assetId.trim().replace(/[^a-zA-Z0-9:_-]/g, "_");
  return `spark:translation:${safeId}:${language}:${version}`;
}
