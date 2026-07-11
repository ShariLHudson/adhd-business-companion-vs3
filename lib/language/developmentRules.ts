/**
 * Language architecture development rules — code review checklist.
 *
 * @see docs/architecture/ARCH-011_LANGUAGE_AND_TRANSLATION_ARCHITECTURE.md
 */

export const LANGUAGE_DEVELOPMENT_RULES = {
  mustNot: [
    "duplicate Spark-owned content across language folders",
    "use English display text as a lookup key",
    "auto-translate member-owned journals, evidence, or brain dumps",
    "silently rewrite user-authored content",
    "branch business logic on interface language",
  ] as const,
  must: [
    "store one canonical English version of Spark-owned content",
    "design new Spark-owned content to be translation-ready",
    "keep business logic independent from language presentation",
    "use translation keys for interface strings when practical",
    "fall back to English when a localized string is missing",
  ] as const,
  sparkOwnedBelongsIn: [
    "lib/ content modules with English canonical fields",
    "locale packs (lib/companionI18n.ts and future guide locales)",
    "translation cache / sidecar JSON — not duplicated source trees",
  ] as const,
  memberOwnedBelongsIn: [
    "member stores as authored",
    "contentLanguage at write time for Create drafts",
  ] as const,
} as const;
