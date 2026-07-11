# ARCH-011 — Language & Translation Architecture

## Status

**Approved**

This document defines how Spark Estate™ supports multiple languages while maintaining a single source of truth for all Spark-owned intellectual property.

---

# 1. Purpose

Spark Estate™ is designed to serve members around the world.

The application must provide a natural experience in the member's preferred language without requiring multiple manually maintained versions of Spark content.

---

# 2. Guiding Principles

There is:

- One application
- One companion
- One intelligence
- One memory
- One feature set
- One canonical content library

**Language changes presentation, not functionality.**

---

# 3. Canonical Language

**English** is the canonical language.

All Spark-owned content is authored in English first.

Examples include:

- Spark Guide
- Spark Cards
- Estate Canon
- Chamber Member bios
- Room introductions
- Welcome messages
- Tutorials
- Help documentation
- Discovery prompts
- Guided reflections
- Quotes
- Educational content
- Audio scripts

English remains the permanent source of truth.

---

# 4. Translation Philosophy

Spark-owned content should never require manual maintenance across multiple languages.

Instead:

```text
Master English Content
        ↓
AI Translation Layer
        ↓
Localized Version
        ↓
Cache
        ↓
Member
```

If English content changes, localized versions can be regenerated automatically.

---

# 5. Translation-Ready Requirement

**Beginning immediately:**

Every Spark-owned content asset must be translation-ready.

This includes:

- markdown documents
- Spark Cards
- room descriptions
- guides
- prompts
- instructional content
- Chamber introductions
- onboarding
- tooltips
- help articles

Avoid hard-coded English text inside components whenever practical.

**Implementation standard:** [Spark Estate™ Multilingual Architecture Standard](../estate/SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md)

---

# 6. Translation Behavior

## 6.1 Interface

Menus, buttons, navigation, labels, settings, and system messages always display in the selected **interface language**.

**Code:** `lib/companionI18n.ts` · `LanguageCommunicationPrefs.interfaceLanguage`

---

## 6.2 Spark Responses

Spark responds in the member's selected **conversation language** unless the member requests another language.

**Code:** `buildResponseLanguageHint()` in `lib/companionLanguage.ts`

---

## 6.3 Spark-Owned Content

Examples:

- Spark Guide
- Spark Cards
- Estate descriptions
- Chamber bios
- Tutorials

These should appear in the selected language. Translations may be generated and cached automatically.

**Code:** `resolveSparkOwnedText()` in `lib/language/`

---

## 6.4 Member-Owned Content

Member journals, evidence, projects, brain dumps, notes, strategies, and documents remain in the language originally written.

The application **never silently rewrites user content**. Translation occurs only when requested.

**Code:** `shouldAutoTranslateMemberContent()` in `lib/language/`

---

# 7. Brand Names

Brand names remain consistent worldwide.

Examples:

- Spark™
- Spark Estate™
- Visual Spark Studios™
- Kinsey

Other feature names may later support localized display names while preserving the official trademarked English name.

**Code:** `SPARK_BRAND_NAMES` in `lib/language/canonicalLanguage.ts`

---

# 8. Language Settings

## 8.1 Default View

**Language** — a single selection controls:

- interface
- Spark responses
- Spark-owned content
- voice
- navigation
- room descriptions
- guides
- Spark Cards

Most members never need additional settings.

**Code:** `withUnifiedAppLanguage()` in `lib/companionLanguage.ts`

---

## 8.2 Advanced Language Settings

Available for members with specialized needs.

Includes:

- Interface Language
- Conversation Language
- Content Creation Language
- Voice Language
- Translation Preferences
- Region
- Date Format
- Time Format
- Number Format

**Code:** `LanguageCommunicationPrefs` in `lib/companionLanguage.ts` · Settings panel

---

# 9. Translation Preferences

Future options:

- Automatically translate Spark-owned content
- Preserve my writing in its original language
- Translate my writing only when requested
- Always answer in my selected language
- Allow multilingual conversations

**Code:** `TranslationPreferences` in `lib/language/types.ts`

---

# 10. Future Expansion

The architecture must support additional languages without requiring manual duplication of Spark-owned content.

New languages should primarily require:

- interface translations
- AI-assisted localization
- caching

rather than rebuilding content libraries.

---

# 11. Development Rules

Beginning immediately:

1. Do **not** duplicate Spark-owned content across language folders.
2. Store one canonical English version.
3. Design all new Spark-owned content to be translation-ready.
4. Keep business logic independent from language presentation.
5. Avoid hard-coded English strings when a translation key is appropriate.

**Code review checklist:** `LANGUAGE_DEVELOPMENT_RULES` in `lib/language/developmentRules.ts`

---

# 12. Governing Principle

The member should feel that Spark Estate™ was created in their language while Visual Spark Studios™ maintains only one authoritative version of its intellectual property.

---

# Related Documents

| Document | Role |
|----------|------|
| [SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md](../estate/SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md) | Binding implementation standard — keys, resolvers, rollout tiers |
| [ARCH-010_PRESENTATION_LAYER_ARCHITECTURE.md](./ARCH-010_PRESENTATION_LAYER_ARCHITECTURE.md) | Presentation vs feature logic — language is orthogonal to presentation mode |

**Runtime module:** `lib/language/`  
**Member prefs:** `lib/companionLanguage.ts` · `lib/companionUserLanguage.ts`  
**Interface strings:** `lib/companionI18n.ts`
