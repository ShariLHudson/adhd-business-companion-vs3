# Spark Note™ — Intelligence Package Index

Spark Note™ is the daily companion in the bottom-right corner — opposite the Spark Estate Guide Book™.

**Feeling:** *"Spark left me a little surprise today."*

---

## Runtime (implemented v1)

| Layer | Location |
|-------|----------|
| Daily engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Starter catalog (29 cards) | `lib/sparkNote/catalog.ts` |
| UI — collapsed + expanded | `components/companion/SparkNoteChrome.tsx` |
| UI — reactions + My Sparks | `SparkNoteExpanded.tsx`, `SparkNoteMyCollection.tsx` |
| Wiring | `app/companion/CompanionPageClient.tsx` |
| Styles | `app/companion/spark-note.css` |

**Implementation status:** [SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md](../docs/protocols/SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md)

```bash
npx vitest run lib/sparkNote
```

---

## Master spec (canonical)

Installed copies live in `docs/protocols/` — use those for implementation tracking.

| Document | `docs/protocols/` | This bundle |
|----------|-------------------|-------------|
| Complete Intelligence Package | [link](../docs/protocols/SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) | [local](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) |
| Daily Intelligence System | [link](../docs/protocols/SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) | [local](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) |
| Daily Engine Spec | [link](../docs/protocols/SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) | [local](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) |
| Delight Expansion | [link](../docs/protocols/SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md) | [local](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md) |

---

## System protocols (this folder)

| File | Purpose | Runtime status |
|------|---------|----------------|
| [SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) | Combined Parts 1–3 (master) | **Implemented** (v1) — [protocol copy](../docs/protocols/SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) |
| [SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) | Placement, UX, display | **Implemented** |
| [SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) | Selection engine, content model | **Implemented** |
| [SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md) | Reactions, learning, collection | **Implemented** (v1) |
| [SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md](SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md) | App wiring requirements | **Implemented** |
| [SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md](SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md) | CMS / admin workflow | **Partial v1** (`spark-library:validate`, file-based publish) |
| [SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md](SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md) | Authoring standard | **Implemented** (`categoryTaxonomy.ts`, `AUTHORING.md`, validate) |
| [SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md](SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md) | Database schema | **Implemented** (`spark-library/`, `contentDatabase/`) |
| [SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md](SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md) | Advanced selection rules | Partial |
| [SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md](SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md) | Visual card template | **Implemented** (`SparkNoteAnchor`, `SparkNoteExpanded`, `spark-note.css`) |
| [SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md](SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md) | Experience + destination routing | **Implemented** (v1 — `sparkNoteDestinations.ts`, expanded UI) |

---

## Content libraries (authoring — not yet in runtime catalog)

Use these when expanding `lib/sparkNote/catalog.ts` or a future CMS.

| Library | Topic |
|---------|--------|
| [SPARK_NOTE_STARTER_SPARK_LIBRARY.md](SPARK_NOTE_STARTER_SPARK_LIBRARY.md) | Starter set |
| [SPARK_NOTE_INNOVATION_AND_DISCOVERY_SPARK_LIBRARY.md](SPARK_NOTE_INNOVATION_AND_DISCOVERY_SPARK_LIBRARY.md) | Inventions & discoveries |
| [SPARK_NOTE_INSPIRING_PEOPLE_SPARK_LIBRARY.md](SPARK_NOTE_INSPIRING_PEOPLE_SPARK_LIBRARY.md) | Inspiring people |
| [SPARK_NOTE_ENTREPRENEUR_BUSINESS_SPARK_LIBRARY.md](SPARK_NOTE_ENTREPRENEUR_BUSINESS_SPARK_LIBRARY.md) | Entrepreneurs |
| [SPARK_NOTE_SMALL_BUSINESS_ENTREPRENEUR_SPARK_LIBRARY.md](SPARK_NOTE_SMALL_BUSINESS_ENTREPRENEUR_SPARK_LIBRARY.md) | Small business |
| [SPARK_NOTE_CREATIVITY_AND_IDEAS_SPARK_LIBRARY.md](SPARK_NOTE_CREATIVITY_AND_IDEAS_SPARK_LIBRARY.md) | Creativity |
| [SPARK_NOTE_FUN_FACTS_AND_WONDER_SPARK_LIBRARY.md](SPARK_NOTE_FUN_FACTS_AND_WONDER_SPARK_LIBRARY.md) | Fun facts |
| [SPARK_NOTE_QUOTES_WITH_STORIES_SPARK_LIBRARY.md](SPARK_NOTE_QUOTES_WITH_STORIES_SPARK_LIBRARY.md) | Quotes |
| [SPARK_NOTE_HOLIDAY_DATE_BASED_SPARK_LIBRARY.md](SPARK_NOTE_HOLIDAY_DATE_BASED_SPARK_LIBRARY.md) | Holidays & dates |
| [SPARK_NOTE_PERSONAL_GROWTH_AND_ENCOURAGEMENT_SPARK_LIBRARY.md](SPARK_NOTE_PERSONAL_GROWTH_AND_ENCOURAGEMENT_SPARK_LIBRARY.md) | Personal growth |
| [SPARK_NOTE_GRATITUDE_AND_MEANING_SPARK_LIBRARY.md](SPARK_NOTE_GRATITUDE_AND_MEANING_SPARK_LIBRARY.md) | Gratitude & meaning |
| [SPARK_NOTE_PERSONAL_MOMENTS_AND_LIFE_EVENTS_SPARK_LIBRARY.md](SPARK_NOTE_PERSONAL_MOMENTS_AND_LIFE_EVENTS_SPARK_LIBRARY.md) | Personal moments |
| [SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md](SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md) | ADHD-friendly sparks | **In runtime** (`SPARK-ADHD-001`–`008`) |

---

## Daily selection order (runtime)

1. **Personal** — birthday, anniversaries, milestones, membership anniversary
2. **Date-based** — `monthDay`, `months`, seasonal `seasons`
3. **Curated library** — affinity-weighted rotation with repeat prevention

One Spark per day. Not a task. Not a notification.

---

## Adding a new Spark to runtime

1. Author using [SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md](SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md)
2. Add entry to `lib/sparkNote/catalog.ts` (match fields in `lib/sparkNote/types.ts`)
3. Run `npx vitest run lib/sparkNote`

Future: admin CMS per [SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md](SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md).
