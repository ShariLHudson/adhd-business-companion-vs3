# Spark Note™ Daily Experience — Implementation Status

Canonical specs:

- **[Complete Intelligence Package](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md)** — master source of truth
- [Daily Intelligence System](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md)
- [Daily Engine Implementation](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md)
- [Delight Experience Expansion](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md)

## Status: **Implemented** (v1)

### Architecture (per engine spec)

| Layer | Module |
|-------|--------|
| Content — Spark Card Library | `lib/sparkNote/catalog.ts` |
| Logic — Daily Spark Engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Library selection / repeat rules | `lib/sparkNote/librarySelection.ts` |
| Personalization | `lib/sparkNote/personalSparks.ts` |
| Seasonal personality | `lib/sparkNote/seasonalPersonality.ts` |
| Preference learning | `lib/sparkNote/preferenceLearning.ts` |
| Persistence | `lib/sparkNote/persistence.ts` |
| Display | `SparkNoteChrome`, `SparkNoteWidget`, `SparkCardExpanded` |

### Daily selection (3 steps)

1. **Personal** — birthday, anniversaries, milestones, membership anniversary
2. **Date-based** — `monthDay` holidays/history, `months` seasonal, `seasons` personality
3. **Curated library** — variety, cooldowns, yesterday exclusion, category rotation

### Content model

| Spec field | Implementation |
|------------|----------------|
| `spark_id` | `id` (e.g. `SPARK-INV-001`) |
| `title` / `short_title` | `title` / `shortTitle` |
| `short_teaser` | `teaser` |
| What Happened | `whatHappened` |
| Why Is It Interesting | `whyInteresting` (optional) |
| Why Does It Matter | `whyItMatters` |
| Spark Application | `sparkApplication` |
| `thumbnail_image` / primary image | `thumbnailSrc` / `imageSrc` |
| `date_rules` | `monthDay`, `months`, `regions` |
| `tags` | `tags` |

### Repeat prevention

- Same card not shown two days in a row (when alternatives exist)
- Recent category avoided in library rotation
- Cooldown per spark (`lastShownById`)
- Viewed / favorites / completed tracking

### Delight layer (v1)

| Feature | Status |
|---------|--------|
| One-tap reactions (❤️ 😊 💡 🤔 🌱 😐) + ⭐ save | `SparkNoteExpanded` |
| Preference learning | `preferenceLearning.ts` → weighted library picks |
| My Sparks collection | `SparkNoteMyCollection` |
| Gentle connections | Copy-to-capture / journal seed — optional, no pressure |
| Spark types | `quick` / `story` / `deep` on catalog entries |
| Visual Spark Shelf | Future |

### Card template (design standard)

One card template for all Spark categories — per `spark-notes-files/SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md`:

| Spec element | Implementation |
|--------------|----------------|
| Collapsed — Today's Spark + flame + thumb + title + teaser | `SparkNoteAnchor.tsx` |
| Expanded — Image, Title, Category, What Happened?, Why It Matters, Spark It Into Your Life | `SparkNoteExpanded.tsx` |
| Parchment / gold / teal styling | `app/companion/spark-note.css` |
| Reactions + optional actions | `SparkNoteExpanded.tsx` |

### Complete Intelligence Package (master)

All three parts of [SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) are implemented at v1. Gaps: illustrated assets per card, user depth picker, dedicated Idea Vault room, server-side journal records, Visual Spark Shelf, admin CMS.

### Experience & routing

Per [SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md](SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md):

| Spec | Implementation | Status |
|------|----------------|--------|
| 6 learning reactions + "How did this land?" | `SparkNoteExpanded.tsx` | **v1** |
| ⭐ Save Spark → My Sparks | `persistence.ts`, `SparkNoteMyCollection.tsx` | **v1** |
| 💡 Capture → Idea Vault / Momentum / Journal | `sparkNoteDestinations.ts` | **v1** (routes + clipboard staging) |
| 💡 Gave me an idea → Capture / Explore / Project | `SparkNoteExpanded.tsx` picker | **v1** |
| My Sparks shelf buckets | `mySparksCollection.ts` | **v1** (labels on saved items) |
| Deep Journal / Idea Vault record creation | Server-side records | Future |

### Verify

```bash
npx vitest run lib/sparkNote
```

### Future (not v1)

- Admin CMS (`spark-notes-files/SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md`)
- Visual Spark Shelf (saved Sparks as a shelf UI)
- Share Spark / connect to project (deep workflow links)
- Illustrated assets per card
