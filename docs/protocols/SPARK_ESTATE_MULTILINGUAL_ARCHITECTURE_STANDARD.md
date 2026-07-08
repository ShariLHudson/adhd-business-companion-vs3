# Spark Estate™ Multilingual Architecture Standard

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | **Foundation standard — binding for all new member-facing work** |
| **Authority** | [Estate Constitution](../estate/01%20-%20Spark%20Estate%20Constitution.md) · [Estate Language (Bible §7)](../estate/bible/Section%2007%20-%20Estate%20Language.md) · [Universal Experience Standards](../UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) |
| **Related code** | `lib/companionLanguage.ts` · `lib/companionI18n.ts` · `lib/estate/canonicalEstateRegistry.ts` |
| **Applies to** | Spark Estate™, Companion™, Spark Note™ / Spark Cards™, Guide Book™, Discovery Key™, navigation, room chrome, and all curated content |

> **Canonical copy:** [docs/estate/SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md](../estate/SPARK_ESTATE_MULTILINGUAL_ARCHITECTURE_STANDARD.md)

---

## Purpose

Spark is being built for members who think, feel, and work in more than one language.

This standard exists **before** multilingual support is fully implemented so we do not hardcode English into components, registries, and content models in ways that require expensive rework later.

**Rule:** English is the **authoring language** and **fallback language** — not the only language path.

---

## Design principles

### 1. Separate identity from display

Stable IDs never change when language changes.

| Layer | Stable (language-neutral) | Localized (per language) |
|-------|---------------------------|---------------------------|
| Room | `placeId` / `roomId` (`welcome-home`, `library`) | `name`, `trademark`, `purpose`, `navigationPhrases` |
| Spark | `spark_id` (`SPARK-INV-001`) | `title`, `short_teaser`, `story`, `impact`, `spark_application` |
| Guide card | `guideEntryId` | `title`, `summary`, `steps[]` |
| Navigation | `nav.*` keys (`nav.home`) | translated string in language pack |
| Member content | record `id` | body text as authored — **not auto-translated** |

**Never** use English display text as a lookup key.

### 2. Three language channels

Members already have distinct language preferences in `LanguageCommunicationPrefs`:

| Channel | Pref field | What it controls |
|---------|------------|------------------|
| **Interface** | `interfaceLanguage` | Buttons, labels, menus, room names in chrome, empty states, errors |
| **Companion response** | `responseLanguage` | Shari's spoken/written replies in conversation |
| **Content creation** | `contentLanguage` | Drafts the member creates (posts, journal, plans) |

**V1 rule:** Interface and response languages may match by default (`withUnifiedAppLanguage`). Architecture must still treat them as separate so a member can read UI in Spanish while asking Shari questions in English, or vice versa.

### 3. Estate language survives translation

[Estate Language — Bible §7](../estate/bible/Section%2007%20-%20Estate%20Language.md) applies in **every** locale.

Translated copy must still:

- Sound like a place, not software
- Use **walk**, **visit**, **Guidebook** — not dashboard, module, workflow
- Preserve trademarked place names where canon requires (`Welcome Home™`, `Momentum Institute™`)
- Avoid surveillance tone and database voice in all languages

Translation is not literal word substitution. It is **voice-preserving localization**.

### 4. Fallback, never silence

If a string is missing in the member's language:

1. Fall back to English (`en`)
2. Log a missing-key warning in development
3. Never show a raw key like `nav.settings` to members
4. Never block the experience

---

## Supported languages

### Canonical language codes

Use ISO-style codes from `LanguageCode` in `lib/companionLanguage.ts`:

`en` · `es` · `ur` · `tl` · `fr` · `de` · `pt` · `nl` · `it` · `pl` · `zh` · `ja`

Add new codes only in `companionLanguage.ts` — not ad hoc in components.

### Rollout tiers

| Tier | Languages | Expectation |
|------|-----------|-------------|
| **Tier 1 — Live UI** | `en`, `es`, `ur`, `tl` | Full interface packs; companion hints |
| **Tier 2 — Companion** | Tier 1 + `fr`, `de`, `pt`, `nl`, `it`, `pl`, `zh`, `ja` | Response language hints; partial UI |
| **Tier 3 — Curated content** | Per library | Spark Cards, Guide entries, Discovery — phased |

---

## Translation rules

### What must be translatable

| Category | Examples |
|----------|----------|
| System UI | Settings, auth, buttons, toasts, aria labels |
| Estate navigation | Room names, Wander menu, place picker, map labels |
| Guide Book | Card titles, summaries, step text, flipbook chrome |
| Spark Cards | Title, teaser, story, why it matters, spark application, category label |
| Discovery Key | Headline, body, CTA (when `translations` populated) |
| Empty / error states | Human repair copy — estate voice in every language |
| Date & number formatting | Via `region` + `dateFormat` prefs — not hardcoded US formats |

### What must NOT be translated automatically

| Category | Rule |
|----------|------|
| **Member-authored content** | Journal entries, brain dumps, plans, posts, saved notes — stored and displayed as written |
| **Member names & proper nouns** | Never transliterate unless member chooses |
| **Stable IDs** | `SPARK-INV-001`, `welcome-home`, `nav.home` |
| **URLs & routes** | `/companion`, `growth-library` — internal; never member-visible |
| **Code comments & logs** | English for engineering |
| **Trademark symbols** | Keep ™ on canon place names |

### Authoring vs runtime

| Content type | Authoring language | Runtime behavior |
|--------------|-------------------|------------------|
| Spark library JSON | English first | Load `translations[lang]` overlay when present |
| Guide entries | English first | Same overlay pattern |
| Room registry | English in seed | Resolve via `getPlaceDisplay(placeId, lang)` |
| UI strings | Key-based packs | `getUiString(key, lang)` |
| AI conversation | Member `responseLanguage` | Prompt hint via `buildResponseLanguageHint()` |

### Quality bar

- Short sentences. ADHD-friendly in every language.
- No machine-translation tone in Tier 1 locales — human review required before Live.
- Gender-neutral where the language allows without awkwardness.
- RTL readiness: `isRtlLanguage()` exists; layout must not assume LTR-only (future `ar` / full `ur` script).

---

## Language files

### Directory layout (target)

```
lib/i18n/
  index.ts                 # resolveString(), getPlaceDisplay(), types
  keys.ts                  # UiTranslationKey union (generated or maintained)
  locales/
    en/
      ui.json              # system + navigation strings
      estate-places.json   # room names, nav phrases (keyed by placeId)
      estate-nav.json      # Wander, map, chrome
    es/
      ui.json
      estate-places.json
      estate-nav.json
    ur/
    tl/
    …
```

**Migration path:** `lib/companionI18n.ts` becomes the thin resolver over `locales/` — existing `UiTranslationKey` pattern is the seed, not the final form.

### Key naming convention

Use dot-separated namespaces:

```
nav.home
nav.settings
estate.wander
estate.room.welcome-home.name
estate.room.welcome-home.phrase.go-home
spark.category.invention
spark.action.save
spark.action.more-like-this
guide.flipbook.title
settings.language
error.network.gentle
```

**Rules:**

- Keys are `lower-kebab` after the namespace
- Place keys use **placeId**, not English name
- Spark keys use **spark_id** for content overlays — not inline in `ui.json`

### JSON shape — Spark translation overlay

```
spark-library/
  inventions/
    SPARK-INV-001.json          # English canonical (authoring)
    translations/
      SPARK-INV-001.es.json
      SPARK-INV-001.ur.json
```

---

## Spark Card translation

Translatable: `title`, `short_title`, `short_teaser`, `story`, `why_interesting`, `impact`, `spark_application`, `category_label`, `thumbnail_alt`.

Components must use `resolveSparkDisplay(record, lang)` — not `spark.title` directly in JSX.

---

## Guide translation

| Layer | Translation |
|-------|-------------|
| Flipbook chrome | `guide.*` UI keys |
| How Do I cards | `guide/how-do-i/{id}.{lang}.json` |
| Estate place descriptions | `estate-places.json` per locale |
| Discovery Key | `DiscoveryFutureMeta.translations` |

Target API: `getPlaceDisplay(placeId, lang)` for room names and navigation phrases.

---

## User content rules

Member content is **never auto-translated** in storage. Optional member-initiated translation in conversation only. Shari may reflect content in `responseLanguage` without overwriting the source.

---

## Room names & navigation terms

- Display via `getPlaceDisplay(placeId, lang)` — not `room.name` in JSX
- `placeId` stable forever; trademarks preserved per canon
- Estate verbs (`walk`, `visit`, `sit`, `wander`) localized — never as "click" or "launch"
- `AppSection` is internal routing only

---

## Future AI translation support

| Allowed | Forbidden |
|---------|-----------|
| Draft translation with human review | Auto-translate member journal/brain dump storage |
| Member-initiated "translate for me" in chat | Guessing canon place names |
| `buildResponseLanguageHint()` for companion | Auto-merge AI drafts to production |

Workflow: Author (en) → AI draft (optional) → human review → `translations/{id}.{lang}.json` → runtime resolver.

---

## Implementation rules for Cursor and engineers

**Do:** keys in locale files, thread `interfaceLanguage`, use resolvers, English as Spark authoring source.

**Do not:** English in JSX (without `// i18n-todo`), inline `if (lang === 'es')`, duplicate place names in components.

---

## Phased rollout

| Phase | Deliverable |
|-------|-------------|
| **M0** | This document |
| **M1** | UI shell locale files |
| **M2** | `getPlaceDisplay()` |
| **M3** | Spark translation sidecars |
| **M4** | Guide locale files |
| **M5** | Discovery translations |
| **M6** | AI authoring assist |

---

## Summary

**IDs stay stable. Copy moves through language packs. English is the fallback, not the architecture.**
