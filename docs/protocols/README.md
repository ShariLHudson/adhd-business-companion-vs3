# Spark Fix Protocols

Source bundle: `Spark_Fix_Protocol_Files.zip` (installed 2026-07-08).

These protocols define cross-cutting fixes for conversation stability, routing, navigation, workflows, and regression coverage.

| Protocol | Status | Notes |
|----------|--------|-------|
| [Estate Manifest Runtime Integration](ESTATE_MANIFEST_RUNTIME_INTEGRATION_PROTOCOL.md) | **Implemented** | Reader: `lib/estate/manifest/estatePlaceMasterManifest.ts`. Tests: `lib/estate/manifest/estateManifestNavigation.test.ts`. Audit: `docs/estate/ESTATE_MANIFEST_RUNTIME_DEPENDENCY_REPORT.md` |
| [Conversation State Stability](CONVERSATION_STATE_STABILITY_PROTOCOL.md) | Pending | Audit input handlers, streaming, and state sync in `CompanionPageClient.tsx` |
| [Intent Router Separation](INTENT_ROUTER_SEPARATION_PROTOCOL.md) | Partial | `classifyCompanionIntent`, `estateKernelGate` exist; `"ok"` must not navigate |
| [Navigation Transaction](NAVIGATION_TRANSACTION_PROTOCOL.md) | Pending | `goToPlace` confirms before visual load; needs transaction gate |
| [Clear My Mind Flow](CLEAR_MY_MIND_FLOW_PROTOCOL.md) | Partial | `clear-my-mind` place exists; verify instructions, save, sort, exit copy |
| [Creation Workflow Engine](CREATION_WORKFLOW_ENGINE_PROTOCOL.md) | Partial | `lib/collaborativeDocumentWorkflow.ts` v2.0 exists; wire all creation intents |
| [Old UI Reference Cleanup](OLD_UI_REFERENCE_CLEANUP_PROTOCOL.md) | **Implemented** | `lib/conversationFirstLanguage.ts`, prompts, help articles |
| [Estate Wander Mode](ESTATE_WANDER_MODE_PROTOCOL.md) | **Implemented** | `lib/estate/manifest/estateWanderMode.ts`, Room dropdown in `EstateRoomExperienceMenu.tsx` |
| [Spark Note Daily Experience](SPARK_NOTE_DAILY_EXPERIENCE_PROTOCOL.md) | **Implemented** | Master: [Complete Intelligence Package](SPARK_NOTE_COMPLETE_INTELLIGENCE_PACKAGE.md); routing: [Experience & Routing Spec](SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md) |
| [Spark Card Collapsed Visual Design Fix](SPARK_CARD_COLLAPSED_VISUAL_DESIGN_FIX.md) | **Implemented** | `SparkNoteAnchor.tsx`, `spark-note.css` — compact companion object, bottom-right |
| [Spark Card Expanded Experience Correction](SPARK_CARD_EXPANDED_EXPERIENCE_CORRECTION.md) | **Implemented** | `SparkNoteExpanded.tsx`, `spark-note.css` — lightweight note, not article panel |
| [Regression Test Protocol](REGRESSION_TEST_PROTOCOL.md) | Partial | Estate cases in manifest tests; conversation + creation + clear-my-mind TBD |

## Estate manifest — quick verify

```bash
npx vitest run lib/estate/manifest/estateManifestNavigation.test.ts
```

## Related estate docs

- `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` — source of truth
- `docs/estate/ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md` — full manifest authoring spec
