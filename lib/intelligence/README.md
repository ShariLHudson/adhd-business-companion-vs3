# Intelligence Layer (internal)

**Intelligence-Ready Architecture** — every object is built once and enriched for years.

| Document | Purpose |
|----------|---------|
| [INTELLIGENCE_REGISTRY.md](./INTELLIGENCE_REGISTRY.md) | Blueprint: objects × engines × storage |
| [intelligenceReadyTypes.ts](./intelligenceReadyTypes.ts) | Shared hooks (`IntelligenceReadyHooks`, sprint questions) |
| [relationshipIntegrity.ts](./relationshipIntegrity.ts) | **141** Relationship Integrity Rule — trusted edge sources only |
| [ensureCreateLineage.ts](./ensureCreateLineage.ts) | Auto-lineage from explicit Create/Work context |
| [relationshipGraphParticipation.ts](./relationshipGraphParticipation.ts) | Certification inventory / gap register |

When adding a domain type: register it in the registry, add hooks from `IntelligenceReadyHooks`, wire events to `lib/intelligence-layer/` or domain ingest as appropriate.

**Relationship Integrity (141):** never invent edges from title similarity. See `.cursor/rules/relationship-integrity.mdc`.

Users never see `intelligenceMeta` wholesale. Engines write quietly; UI stays calm.
