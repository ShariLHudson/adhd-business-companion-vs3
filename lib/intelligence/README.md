# Intelligence Layer (internal)

**Intelligence-Ready Architecture™** — every object is built once and enriched for years.

| Document | Purpose |
|----------|---------|
| [INTELLIGENCE_REGISTRY.md](./INTELLIGENCE_REGISTRY.md) | Blueprint: objects × engines × storage |
| [intelligenceReadyTypes.ts](./intelligenceReadyTypes.ts) | Shared hooks (`IntelligenceReadyHooks`, sprint questions) |

When adding a domain type: register it in the registry, add hooks from `IntelligenceReadyHooks`, wire events to `lib/intelligence-layer/` or domain ingest as appropriate.

Users never see `intelligenceMeta` wholesale. Engines write quietly; UI stays calm.
