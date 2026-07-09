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
| [Chamber of Momentum Identity Consolidation (Phase 1)](CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md) | **Implemented** | `chamberOfMomentumIdentity.ts`, manifest, Spark Note routing, room chrome |
| [Chamber of Momentum Routing & Experience Alignment (Phase 2)](CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md) | **Implemented** | `chamberOfMomentumRouting.ts`, `ChamberOfMomentumEntryPanel.tsx`, intent routing |
| [Chamber of Momentum Entry Experience (Phase 3)](CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md) | **Implemented** | Welcome doorway, unsure fallbacks, Idea Vault routing, `ChamberOfMomentumRoomShell` |
| [Chamber of Momentum Project Engine (Phase 4)](CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md) | **Implemented** | `chamberProjectEngine.ts`, `ChamberProjectEntryPanel.tsx`, project doorway + next-action emphasis |
| [Chamber of Momentum Intelligence Decision Logic (Phase 5)](CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md) | **Implemented** | `chamberOfMomentumIntelligence.ts`, natural-language entry, priority routing, energy adaptation |
| [Chamber of Momentum Data & Memory Architecture (Phase 6)](CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md) | **Implemented** | `chamberOfMomentumMemory.ts`, project→win→evidence chain, patterns, blockers, guidance |
| [Chamber of Momentum Demo Experience & Visual Room (Phase 7)](CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md) | **Implemented** | `chamberRoomExperience.ts`, room registry, path/progress panels, Phase 7 copy + layout |
| [Chamber of Momentum Demo Data & Content (Phase 8)](CHAMBER_OF_MOMENTUM_DEMO_DATA_AND_CONTENT_PREPARATION_SPECIFICATION_PHASE8.md) | **Implemented** | `seedChamberDemoData.ts`, `?chamberDemo=1`, Alex scenario, wins/evidence/path seed |
| [Chamber of Momentum Final Demo Checklist (Phase 9)](CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md) | **Implemented** | `chamberFinalDemoChecklist.ts`, welcome title fix, priority-ordered readiness checks |
| [Chamber of Momentum End-to-End Journey (Phase 10)](CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md) | **Implemented** | `chamberMemberJourney.ts`, `ChamberMomentumCard`, decision/review routing, workshop journey |
| [Spark Estate Universal Creation Journey (Phase 11)](SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md) | **Implemented** | `sparkEstateCreationJourney.ts`, `shariCreationExperience.ts`, Shari voice + 8-step journey |
| [Spark Estate Universal Completion & Output (Phase 12)](SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md) | **Implemented** | `sparkEstateCompletionSystem.ts`, review/output menus, review history, Chamber completion bridge |
| [Spark Estate Architecture Map & Integration (Phase 13)](SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md) | **Implemented** | `sparkEstateArchitectureMap.ts`, Phases 1–17 + 24 mapping, integration verification |
| [Spark Estate Intelligence Routing Map (Phase 14)](SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md) | **Implemented** | `sparkEstateIntelligenceRoutingMap.ts`, estate-wide need → intelligence, card selection, energy adaptation |
| [Spark Estate Member Profile & Personalization (Phase 15)](SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md) | **Implemented** | `sparkEstateMemberProfileEngine.ts`, seven profile layers, gradual learning, member control |
| [Spark Estate Card Ecosystem (Phase 16)](SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md) | **Implemented** | `sparkEstateCardEcosystem.ts`, six card types, priority selection, placement, card memory |
| [Spark Estate Conversation Engine & Shari Voice (Phase 17)](SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md) | **Implemented** | `sparkEstateConversationEngine.ts`, universal flow, overwhelm/stuck patterns, room-consistent voice |
| [Spark Estate Room Intelligence Architecture (Phase 18)](SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md) | **Implemented** | `sparkEstateRoomIntelligenceArchitecture.ts`, six expertise groups, room intelligence ownership |
| [Spark Estate Knowledge & Asset Library (Phase 19)](SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md) | **Implemented** | `sparkEstateKnowledgeAndAssetLibraryArchitecture.ts`, contextual retrieval, room connections, Knowledge Card integration |
| [Spark Estate User Journey & Member Lifecycle (Phase 20)](SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md) | **Implemented** | `sparkEstateUserJourneyAndMemberLifecycleArchitecture.ts`, eight lifecycle stages, re-engagement rules |
| [Spark Estate System Governance & Quality Standards (Phase 21)](SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md) | **Implemented** | `sparkEstateSystemGovernanceAndQualityStandards.ts`, source-of-truth owners, new-feature checklist, duplicate prevention |
| [Spark Estate Analytics & Learning System (Phase 22)](SPARK_ESTATE_ANALYTICS_AND_LEARNING_SYSTEM_SPECIFICATION_PHASE22.md) | **Implemented** | `sparkEstateAnalyticsAndLearningSystem.ts`, seven analytics categories, friction detection, founder reporting |
| [Spark Estate Onboarding & First 7 Days (Phase 23)](SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md) | **Implemented** | `sparkEstateOnboardingAndFirst7DaysExperience.ts`, first-week journey, daily arrival merge, gentle onboarding |
| [Spark Estate Daily Companion Experience (Phase 24)](SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md) | **Implemented** | `sparkEstateDailyCompanionExperience.ts`, daily arrival, focus selection, cards, completion rhythm |
| [Spark Estate Room Blueprint Template (Phase 25)](SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md) | **Implemented** | `sparkEstateRoomBlueprintTemplate.ts`, room creation blueprint, validation, governance alignment |
| [Spark Estate AI Prompt & Intelligence Layers (Phase 26)](SPARK_ESTATE_AI_PROMPT_AND_INTELLIGENCE_LAYER_ARCHITECTURE_PHASE26.md) | **Implemented** | `sparkEstateAiPromptAndIntelligenceLayerArchitecture.ts`, seven intelligence layers, prompt structure, quality test |
| [Spark Estate File & Data Architecture (Phase 27)](SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md) | **Implemented** | `sparkEstateFileAndDataArchitectureMap.ts`, ten data layers, one source of truth per domain |
| [Spark Estate Production Readiness (Phase 28)](SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md) | **Implemented** | `sparkEstateProductionReadinessChecklist.ts`, launch decision checks, priority-ordered verification |
| [Regression Test Protocol](REGRESSION_TEST_PROTOCOL.md) | Partial | Estate cases in manifest tests; conversation + creation + clear-my-mind TBD |

## Estate manifest — quick verify

```bash
npx vitest run lib/estate/manifest/estateManifestNavigation.test.ts
```

## Related estate docs

- `docs/estate/ESTATE_PLACE_MASTER_MANIFEST.json` — source of truth
- `docs/estate/ESTATE_PLACE_MASTER_MANIFEST_PROTOCOL.md` — full manifest authoring spec
