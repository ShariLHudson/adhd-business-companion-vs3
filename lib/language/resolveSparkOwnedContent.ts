/**
 * Resolve Spark-owned display strings from canonical English + optional cache.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

import {
  effectiveOutputLanguage,
  type LanguageCode,
} from "@/lib/companionLanguage";
import { CANONICAL_LANGUAGE_CODE } from "./types";

type LocalizedMap = Partial<Record<LanguageCode, string>>;

/**
 * Pick localized Spark-owned text. Falls back to English canonical — never silent.
 */
export function resolveSparkOwnedText(
  englishCanonical: string,
  language: LanguageCode,
  localized?: LocalizedMap,
): string {
  const effective = effectiveOutputLanguage(language);
  if (effective === CANONICAL_LANGUAGE_CODE) {
    return englishCanonical;
  }
  const translated = localized?.[effective]?.trim();
  return translated || englishCanonical;
}

/**
 * Merge canonical English fields with a localized overlay for one language.
 */
export function resolveSparkOwnedFields<T extends Record<string, string>>(
  englishFields: T,
  language: LanguageCode,
  localizedOverlay?: Partial<T>,
): T {
  const effective = effectiveOutputLanguage(language);
  if (effective === CANONICAL_LANGUAGE_CODE || !localizedOverlay) {
    return englishFields;
  }
  return { ...englishFields, ...localizedOverlay };
}
