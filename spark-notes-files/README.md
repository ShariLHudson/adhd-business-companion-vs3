# Spark Note™ — Intelligence Package Index

**Master spec:** [SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md](../docs/protocols/SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md)

**Runtime implementation:** `lib/sparkNote/` + `components/companion/SparkNote*.tsx`

## Protocol files in this bundle

| Document | Role |
|----------|------|
| [SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md) | Combined source of truth |
| [SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) | Part 1 — UX, placement, display |
| [SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) | Part 2 — selection engine, content model |
| [SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md) | Part 3 — reactions, learning, collection |
| [SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md](SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md) | App wiring requirements |
| [SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md](SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md) | CMS / admin (future) |
| `SPARK_NOTE_*_SPARK_LIBRARY.md` | Category content libraries (authoring) |

## Verify implementation

```bash
npx vitest run lib/sparkNote
```
