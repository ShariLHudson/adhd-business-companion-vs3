# Spark Note™ Content Library

File-based Spark content database per `SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md`.

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

Required fields: `spark_id`, `title`, `category`, `audience`, `short_teaser`, `story`, `impact`, `spark_application`, `tags`, `date_rules`, `tone`, `status`.

## Adding a Spark (no app code change)

1. Create `spark-library/{category-folder}/SPARK-XXX-NNN.json`
2. Run `npm run spark-library:export`
3. Run `npx vitest run lib/sparkNote`

The selection engine loads `manifest.json` automatically.

## Seed source

`lib/sparkNote/catalogSeed.ts` is the authoring seed used by the export script when bootstrapping or refreshing library files.
