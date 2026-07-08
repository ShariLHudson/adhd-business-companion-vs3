# Spark Note™ Content Library

File-based Spark content database and **v1 admin workflow** (no CMS UI yet).

Protocols: `SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md` · `SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md` · `SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md`

**Authoring:** [AUTHORING.md](AUTHORING.md)

## Layout

```
spark-library/
├── inventions/
├── inspiring-people/
├── small-business/
├── creativity/
├── fun-facts/
├── personal-growth/
├── adhd-friendly/
├── holidays/
├── quotes/
└── manifest.json          ← runtime bundle (generated)
```

Each folder holds one JSON file per Spark (`SPARK-INV-001.json`, etc.).

## Record format

See `lib/sparkNote/contentDatabase/types.ts` (`SparkContentRecord`).

Required fields: `spark_id`, `title`, `category`, `subcategory` (recommended when active), `audience`, `short_teaser`, `story`, `impact`, `spark_application`, `tags`, `date_rules`, `tone`, `status`, `runtime_category`.

## Spark status (admin)

| Status | Selection engine |
|--------|------------------|
| `draft` | Hidden |
| `review` | Hidden — awaiting human check |
| `active` | Eligible for daily selection |
| `archived` | Preserved, not selected |

## Publish workflow (no app code change)

```
Create JSON  →  draft
      ↓
npm run spark-library:validate
      ↓
Set status: review  →  human quality check
      ↓
Set status: active
      ↓
npm run spark-library:export
      ↓
npx vitest run lib/sparkNote
```

Quality checks (protocol): curiosity · connection · simplicity · inspiration — enforced by `validate-spark-library.ts`.

Balance targets (active library): inventions 25% · people 20% · business 15% · history 15% · holidays 10% · fun facts 10% · reflection 5%.

## Commands

```bash
npm run spark-library:export    # rebuild manifest.json from folder JSON
npm run spark-library:validate  # required fields + balance report
```

## Seed source

`lib/sparkNote/catalogSeed.ts` bootstraps library files via `npm run spark-library:export`.

Future: admin UI + AI-assisted draft → review → publish per admin protocol.
