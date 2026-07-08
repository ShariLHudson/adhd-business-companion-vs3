# Spark Estate™ Multilingual Architecture Standard

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Status** | **Foundation standard — binding for all new member-facing work** |
| **Authority** | [Estate Constitution](./01%20-%20Spark%20Estate%20Constitution.md) · [Estate Language (Bible §7)](./bible/Section%2007%20-%20Estate%20Language.md) · [Universal Experience Standards](../UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) |
| **Related code** | `lib/companionLanguage.ts` · `lib/companionI18n.ts` · `lib/estate/canonicalEstateRegistry.ts` |
| **Applies to** | Spark Estate™, Companion™, Spark Note™ / Spark Cards™, Guide Book™, Discovery Key™, navigation, room chrome, and all curated content |

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

[Bible Section 7 — Estate Language](./bible/Section%2007%20-%20Estate%20Language.md) applies in **every** locale.

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

### JSON shape — UI pack

```json
{
  "nav.home": "Home",
  "estate.wander": "Wander the estate",
  "estate.room.library.name": "The Library"
}
```

### JSON shape — Spark translation overlay

Stored beside or inside the spark record — **never** replace the English source file.

```json
{
  "spark_id": "SPARK-INV-001",
  "locale": "es",
  "title": "La nota Post-it®",
  "short_teaser": "Un experimento fallido se convirtió en una de las herramientas favoritas del mundo para capturar ideas.",
  "story": "…",
  "impact": "…",
  "spark_application": "…",
  "category_label": "Invención",
  "status": "review"
}
```

File path convention:

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

Spark Note™ / Spark Cards™ use `SparkContentRecord` (`lib/sparkNote/contentDatabase/types.ts`).

### Translatable fields

| Field | Translate? |
|-------|------------|
| `title` | Yes |
| `short_title` | Yes |
| `short_teaser` | Yes |
| `story` | Yes |
| `why_interesting` | Yes (if present) |
| `impact` | Yes |
| `spark_application` | Yes |
| `category` / `category_label` | Yes (display only) |
| `thumbnail_alt` | Yes |
| `tags` | Optional — keep English tags for analytics; display tags may localize later |
| `spark_id`, `date_rules`, `status`, `runtime_category` | **No** |

### Resolution order

```text
1. translations[member.interfaceLanguage] on record (future)
2. sidecar file spark-library/.../translations/{id}.{lang}.json
3. English canonical record
```

### Component rule

`SparkNoteAnchor`, `SparkNoteExpanded`, and collection views must receive **already-resolved** display strings from a selector — e.g. `resolveSparkDisplay(record, lang)` — not read English fields directly in JSX.

```ts
// ✅ Correct
const display = resolveSparkDisplay(spark, interfaceLanguage);
return <h2>{display.title}</h2>;

// ❌ Wrong — hardcodes English path
return <h2>{spark.title}</h2>;
```

Personal sparks (`personalSparks.ts`) generate copy at runtime in `responseLanguage` via templates — separate path, same resolver interface.

---

## Guide translation

The Spark Estate Guide Book™ (`lib/sparkKnowledge/estateGuide.ts`, How Do I, Discovery) spans multiple content shapes.

### Guide Book layers

| Layer | ID stability | Translation |
|-------|--------------|-------------|
| Flipbook chrome | `guide.*` UI keys | `ui.json` |
| How Do I cards | `howDoI.card.{id}` | `guide/how-do-i/{id}.{lang}.json` |
| Estate place descriptions | `placeId` | `estate-places.json` per locale |
| Discovery Key entries | `discoveryId` | `translations` on `DiscoveryFutureMeta` |
| Ecosystem search labels | `ecosystem.{id}` | guide locale files |

### Place descriptions

Canonical English lives in `canonicalEstateRegistry.ts` today. **Target:** move member-visible strings to locale files; registry holds only IDs, routes, aliases, and English **authoring seed** for export.

```ts
getPlaceDisplay(placeId: string, lang: LanguageCode): {
  name: string;
  trademark?: string;
  purpose?: string;
  navigationPhrases: string[];
}
```

`navigationPhrases` must be localized so voice navigation works in the member's language.

### Guide voice

Guide copy is Shari speaking. Translators need the [Personality Guide](../06%20-%20Shari%20Personality%20Guide.md) and Estate Language §7 — not generic product strings.

---

## User content rules

Member content is **sacred and original**.

| Content | Storage | Display | Translation |
|---------|---------|---------|-------------|
| Journal entries | As authored | As authored | **Never auto** |
| Brain dump captures | As authored | As authored | **Never auto** |
| Plans & goals | As authored | As authored | **Never auto** |
| Create™ drafts | `contentLanguage` at write time | As authored | Optional **member-initiated** "translate for me" in conversation only |
| Saved Spark reactions | Enum keys (`inspiring`) | Localized label via UI key | N/A |
| Personal Spark events | Template-generated in `responseLanguage` | Same | Regenerate if language changes — do not translate cached text blindly |

### Conversation about user content

Shari may **summarize or reflect** member content in `responseLanguage` even when the source text is another language — that is interpretation, not overwriting stored content.

### Privacy

Never send member content to batch translation services without explicit member action and policy disclosure.

---

## Room names

### Canon names

Official place names come from [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md) and Bible §3.

| Rule | Detail |
|------|--------|
| **placeId** | Stable forever (`library`, `momentum-institute`) |
| **English name** | Authoring default in registry export |
| **Trademark** | Keep ™ on canon names in all locales unless legal review says otherwise |
| **Display** | Always via `getPlaceDisplay(placeId, lang)` in UI |

### Examples

| placeId | English | Notes |
|---------|---------|-------|
| `welcome-home` | Welcome Home™ | Arrival law — short, warm |
| `library` | The Library™ | Article may vary by language |
| `momentum-institute` | Momentum Institute™ | Proper name — do not literal-translate brand |

### Components that show room names

- Estate room button & dropdown
- Wander menu
- Map & place picker
- Breadcrumbs / orientation (if any)
- Spark Note destination chips
- Conversation place confirmations

**All** must use the resolver — not `room.name` from legacy registry in JSX.

### Navigation phrases

`navigationPhrases` in the registry are **locale-specific voice aliases**, not English-only regex fodder.

Intent matching (`matchCanonicalPlaceInText`) should eventually consult the phrase list for the active `responseLanguage`.

---

## Navigation terms

### System navigation keys

Initial keys in `lib/companionI18n.ts`:

```
nav.home
nav.settings
```

Expand to full estate set:

```
nav.guide
nav.wander
nav.map
nav.my-sparks
nav.how-do-i
estate.action.sit
estate.action.walk
estate.action.visit
estate.action.return-home
```

### Estate verbs (localized)

Bible §7 verbs must have consistent translations:

| English canon | Key | Intent |
|---------------|-----|--------|
| Walk | `estate.verb.walk` | Move through estate |
| Visit | `estate.verb.visit` | Enter a room |
| Sit | `estate.verb.sit` | Stay in a place |
| Go | `estate.verb.go` | Simple movement |
| Wander | `estate.wander` | Exploratory navigation |

Avoid translating these as "click", "open", or "launch" in any language.

### AppSection vs member copy

`AppSection` (`growth-library`, `how-do-i`) is internal routing. Member-facing labels always come from UI keys or place display resolver.

---

## Future AI translation support

AI assists translation — it does not replace architecture.

### Allowed AI uses

| Use | Guardrails |
|-----|------------|
| **Draft translation** for Spark / Guide authoring | Human review → `review` status before Live |
| **On-demand "translate this for me"** in conversation | Member-initiated; ephemeral; does not overwrite source |
| **Live companion** in `responseLanguage` | Already via `buildResponseLanguageHint()` |
| **Missing key suggestion** | Dev/admin tool only; never auto-merge to production |

### Forbidden AI uses

- Auto-translating member journal/brain dump content in storage
- Replacing human-reviewed Spark library English without editorial workflow
- Guessing place names that differ from canon
- Exposing raw translation prompts in member UI

### Translation workflow (future CMS)

```text
Author (en) → draft
     ↓
AI assist (optional) → locale draft
     ↓
Human review → approved
     ↓
Publish → translations/{id}.{lang}.json
     ↓
Runtime resolver → member sees localized card
```

Status values mirror content database: `draft` | `review` | `active` | `archived` **per locale**.

### Discovery Key placeholder

`DiscoveryFutureMeta.translations` in `lib/estateDiscovery/types.ts` is already reserved. Shape when implemented:

```ts
translations?: Partial<Record<LanguageCode, {
  title: string;
  body: string;
  cta?: string;
}>> | null;
```

---

## Implementation rules for Cursor and engineers

### Do

- Add new member-visible strings as **keys** in locale files
- Thread `interfaceLanguage` from `LanguageCommunicationPrefs` into display resolvers
- Use `getUiString()` or successor `resolveString(key, lang)` in components
- Keep English JSON as authoritative authoring source for Sparks
- Write components that accept `display: ResolvedSparkDisplay` props
- Test fallback: missing `es` key shows English, not crash

### Do not

- Put English sentences directly in JSX except one-off prototypes marked `// i18n-todo`
- Use `room.name` or `spark.title` in UI without passing through resolver
- Branch UI on `if (lang === 'es')` inline — use packs
- Create duplicate place names in components "for now"
- Translate member content in `useEffect` on load

### PR checklist

- [ ] No new hardcoded member-facing English without a `// i18n-todo` ticket reference
- [ ] New UI strings have `en` key and entry in `UiTranslationKey` (or `keys.ts`)
- [ ] Room labels use `placeId` keys
- [ ] Spark/content changes consider `translations/` sidecar path
- [ ] Estate Language §7 read aloud in English; reviewer confirms intent for other locales when added

---

## Phased rollout

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **M0 — This document** | Architecture frozen | No new English-only debt |
| **M1 — UI shell** | Settings, auth, nav, estate chrome | `lib/i18n/locales/{en,es,ur,tl}/ui.json` |
| **M2 — Places** | Room names & Wander | `estate-places.json` + `getPlaceDisplay()` |
| **M3 — Spark Cards** | Library overlays | `translations/*.json` + `resolveSparkDisplay()` |
| **M4 — Guide** | How Do I + flipbook | Guide locale files |
| **M5 — Discovery** | Discovery Key translations | CMS `translations` field |
| **M6 — AI assist** | Authoring workflow | Review queue, not runtime guess |

---

## Related documents

- [Estate Language — Bible §7](./bible/Section%2007%20-%20Estate%20Language.md)
- [SPARK_ESTATE_CANONICAL_REGISTRY.md](./SPARK_ESTATE_CANONICAL_REGISTRY.md)
- [SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md](../protocols/SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md)
- [Discovery CMS README](../estate-intelligence/discovery-cms/README.md)
- `lib/companionLanguage.ts` — language prefs & prompt hints
- `lib/companionI18n.ts` — current UI string resolver (v0)

---

## Summary

**IDs stay stable. Copy moves through language packs. English is the fallback, not the architecture.**

If we follow this standard now, Spark Estate can welcome members in many languages without breaking place identity, Guide voice, or the sanctity of what members write themselves.
