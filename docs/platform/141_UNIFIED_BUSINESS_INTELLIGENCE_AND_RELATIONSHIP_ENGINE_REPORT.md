# 141 — Unified Business Intelligence & Relationship Engine — Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Binds:** Spec **117** Business Brain · Spec **128** · Spec **132** · Constitution **113** / **117**  
**Verdict:** **Provisional** — Phase 1 foundation shipped; full Parts 1–16 deferred  

---

## Prompt stored

`docs/platform/141_CURSOR_UNIFIED_BUSINESS_INTELLIGENCE_AND_RELATIONSHIP_ENGINE_PROMPT.md`

## Relationship Integrity Rule — locations

| Artifact | Path |
|----------|------|
| Cursor rule | `.cursor/rules/relationship-integrity.mdc` |
| Constitution 113 article | `docs/constitution/113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md` |
| Constitution 117 section | `docs/constitution/117_TRUST_MEMORY_AND_RELATIONSHIP_CONSTITUTION.md` |
| Series index | `docs/constitution/README.md` |
| Runtime gate | `lib/intelligence/relationshipIntegrity.ts` |
| Create lineage | `lib/intelligence/ensureCreateLineage.ts` |

**Law:** Durable edges only from creation lineage · explicit link · shared Work/Project context · user confirmation. Never from title similarity alone.

---

## Graph audit summary (existing)

| Layer | Status | Notes |
|-------|--------|-------|
| `IntelligenceReadyHooks` | Present | `originatedFromId` · `connectionIds` · `intelligenceMeta` |
| `INTELLIGENCE_REGISTRY.md` | Present | Object × engine blueprint |
| UWE `workRelationships` | **Primary runtime graph** | `linkWorkRelationship` · reverse lookup added |
| `findRelatedWork` | Suggestion / duplicate-risk | Title overlap is suggestion-only — must not auto-edge |
| Create attach lineage | Wired | `ensureCreateLineage` from explicit contract fields |
| Projects 137 hooks | Extended | Conversations / files / links / notes + Work / maps / strategies / evidence / wins from edges |
| ConnectedWorkDisclosure | Present | Explicit member links (`explicit_user_link`) |
| RelatedToPanel | New reusable pattern | Used on Project Homes Connections |
| LIG typed edges | Partial | Hooks exist; not universally populated |
| Business Pulse / Strategies catalog | Orphaned / partial | Gap register |

Inventory code: `lib/intelligence/relationshipGraphParticipation.ts`

### Participation counts (Phase 1 inventory)

See `countByParticipationStatus()` — mix of `in_graph` · `partial` · `orphaned` · `planned`. Honest gap register for Phase 2+.

---

## Runtime shipped

| Area | Change |
|------|--------|
| Integrity gate | `canCreateRelationshipEdge` · `relationshipLinkDecision` · suggestion-only reasons |
| Edge provenance | Optional `edgeSource` on `WorkRelationship` |
| Reverse lookup | `listWorkRelationshipsForTarget` · `listAllWorkRelationships` |
| Create lineage | `attachOriginRelationships` → `ensureCreateLineage` (no title invention) |
| Projects hub | `summarizeRelatedProjectWork` + Related To groups on Project Homes |
| Related To UI | `components/companion/RelatedToPanel.tsx` |

---

## Tests

```
npx vitest run \
  lib/intelligence/relationshipIntegrity.test.ts \
  lib/intelligence/ensureCreateLineage.test.ts \
  lib/intelligence/relationshipGraphParticipation.test.ts \
  lib/projects/projectRelatedWork.test.ts
```

---

## Browser walk

**Provisional** — MCP/browser live walk not run this pass. Code-level wiring verified via unit tests.

---

## Deferred (later phases of 141)

- Full Parts 1–16 platform rewrite (Business Pulse deep bridge, Wins auto-lineage, Strategy target kind, conversation as first-class edge kind)  
- Typed LIG population across all living objects  
- Cartographers Studio UI coordination with Prompt 140 (shared edges already preferred)  
- Live ADHD / browser certification of Projects Related To  
- Evidence Vault ↔ Project auto-lineage beyond explicit links  

---

## Certification verdict

**Provisional Phase 1** — Integrity Rule bound · shared lineage helpers · Projects hub surfaces trusted related Work/maps · gap register published. Not a full-platform Certified claim for Parts 1–16.
