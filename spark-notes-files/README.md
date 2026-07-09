# Spark Note™ — Intelligence Package Index

Spark Note™ is the daily companion in the bottom-right corner — opposite the Spark Estate Guide Book™.

**Feeling:** *"Spark left me a little surprise today."*

---

## Runtime (implemented v1)

| Layer | Location |
|-------|----------|
| Daily engine | `lib/sparkNote/evaluateDailySparkNote.ts` |
| Runtime integration (fallback, wiring) | `lib/sparkNote/runtimeIntegration.ts` |
| Content library | `spark-library/` + `lib/sparkNote/catalog.ts` |
| UI — collapsed widget | `SparkNoteChrome.tsx` → `SparkNoteAnchor.tsx` (`SparkNoteWidget`) |
| UI — expanded card | `SparkNoteExpanded.tsx` (`SparkCardExpanded`) |
| UI — reactions + My Sparks | `SparkNoteExpanded.tsx`, `SparkNoteMyCollection.tsx` |
| Wiring | `app/companion/CompanionPageClient.tsx` |
| Styles | `app/companion/spark-note.css` |

**Runtime integration:** [SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md](../docs/protocols/SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md)

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
| [SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md](SPARK_NOTE_DAILY_INTELLIGENCE_SYSTEM_PROTOCOL.md) | Placement, UX, display | **Implemented** (`SparkNoteChrome`, `SparkNoteAnchor`, `spark-note.css`) |
| [SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md](SPARK_NOTE_DAILY_ENGINE_IMPLEMENTATION_SPEC.md) | Selection engine, content model | **Implemented** (`evaluateDailySparkNote.ts`, `personalSparks.ts`, `librarySelection.ts`) |
| [SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md](SPARK_NOTE_DELIGHT_EXPERIENCE_EXPANSION_PROTOCOL.md) | Reactions, learning, collection | **Implemented** (`delightExperience.ts`, `SparkNoteExpanded`, `My Sparks`) |
| [SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md](SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md) | App wiring requirements | **Implemented** — [protocol copy](../docs/protocols/SPARK_NOTE_RUNTIME_INTEGRATION_PROTOCOL.md) |
| [SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md](SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md) | CMS / admin workflow | **Partial v1** (`spark-library:validate`, file-based publish) |
| [SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md](SPARK_NOTE_CONTENT_LIBRARY_MASTER_STANDARD.md) | Authoring standard | **Implemented** (`categoryTaxonomy.ts`, `AUTHORING.md`, validate) |
| [SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md](SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.md) | Database schema | **Implemented** (`spark-library/`, `contentDatabase/`) |
| [SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md](SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md) | Advanced selection rules | **Implemented** — [protocol copy](../docs/protocols/SPARK_NOTE_SELECTION_INTELLIGENCE_RULES_PROTOCOL.md) |
| [SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md](SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md) | Visual card template | **Implemented** (`SparkNoteAnchor`, `SparkNoteExpanded`, `spark-note.css`) |
| [SPARK_CARD_COLLAPSED_VISUAL_DESIGN_FIX.md](SPARK_CARD_COLLAPSED_VISUAL_DESIGN_FIX.md) | Collapsed companion object (not banner) | **Implemented** — [protocol copy](../docs/protocols/SPARK_CARD_COLLAPSED_VISUAL_DESIGN_FIX.md) |
| [SPARK_CARD_EXPANDED_EXPERIENCE_CORRECTION.md](SPARK_CARD_EXPANDED_EXPERIENCE_CORRECTION.md) | Lightweight expanded card UX | **Implemented** — [protocol copy](../docs/protocols/SPARK_CARD_EXPANDED_EXPERIENCE_CORRECTION.md) |
| [CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md](CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md) | Chamber umbrella identity | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_IDENTITY_CONSOLIDATION_FIX_PHASE1.md) |
| [CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md](CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md) | Chamber entry + intent routing | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_ROUTING_AND_EXPERIENCE_ALIGNMENT_PHASE2.md) |
| [CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md](CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md) | Welcome doorway experience | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_ENTRY_EXPERIENCE_SPECIFICATION_PHASE3.md) |
| [CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md](CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md) | Project doorway + next-action engine | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_PROJECT_ENGINE_SPECIFICATION_PHASE4.md) |
| [CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md](CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md) | Natural-language decision logic | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_INTELLIGENCE_DECISION_LOGIC_SPECIFICATION_PHASE5.md) |
| [CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md](CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md) | Memory architecture + progress chain | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_DATA_AND_MEMORY_ARCHITECTURE_SPECIFICATION_PHASE6.md) |
| [CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md](CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md) | Demo room experience + visual identity | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_DEMO_EXPERIENCE_AND_VISUAL_ROOM_SPECIFICATION_PHASE7.md) |
| [CHAMBER_OF_MOMENTUM_DEMO_DATA_AND_CONTENT_PREPARATION_SPECIFICATION_PHASE8.md](CHAMBER_OF_MOMENTUM_DEMO_DATA_AND_CONTENT_PREPARATION_SPECIFICATION_PHASE8.md) | Demo seed data + Alex scenario | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_DEMO_DATA_AND_CONTENT_PREPARATION_SPECIFICATION_PHASE8.md) |
| [CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md](CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md) | Final demo checklist + fix priority | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_FINAL_DEMO_CHECKLIST_AND_PRIORITY_FIX_ORDER_PHASE9.md) |
| [CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md](CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md) | End-to-end journey + intelligence flow | **Implemented** — [protocol copy](../docs/protocols/CHAMBER_OF_MOMENTUM_END_TO_END_MEMBER_JOURNEY_AND_INTELLIGENCE_FLOW_PHASE10.md) |
| [SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md](SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md) | Universal creation journey + Shari voice | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md) |
| [SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md](SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md) | Completion, output, and review history | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_UNIVERSAL_COMPLETION_AND_OUTPUT_SYSTEM_SPECIFICATION_PHASE12.md) |
| [SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md](SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md) | Architecture map + integration plan | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_ARCHITECTURE_IMPLEMENTATION_MAPPING_AND_INTEGRATION_PLAN_PHASE13.md) |
| [SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md](SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md) | Intelligence routing map | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_INTELLIGENCE_ROUTING_MAP_SPECIFICATION_PHASE14.md) |
| [SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md](SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md) | Member profile + personalization | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_MEMBER_PROFILE_AND_PERSONALIZATION_ENGINE_SPECIFICATION_PHASE15.md) |
| [SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md](SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md) | Card ecosystem | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_CARD_ECOSYSTEM_SPECIFICATION_PHASE16.md) |
| [SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md](SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md) | Conversation engine + Shari voice | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_CONVERSATION_ENGINE_AND_SHARI_VOICE_SPECIFICATION_PHASE17.md) |
| [SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md](SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md) | Room intelligence architecture | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_ROOM_INTELLIGENCE_ARCHITECTURE_SPECIFICATION_PHASE18.md) |
| [SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md](SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md) | Knowledge and asset library architecture | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md) |
| [SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md](SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md) | User journey and member lifecycle architecture | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_USER_JOURNEY_AND_MEMBER_LIFECYCLE_ARCHITECTURE_PHASE20.md) |
| [SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md](SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md) | System governance and quality standards | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_SYSTEM_GOVERNANCE_AND_QUALITY_STANDARDS_SPECIFICATION_PHASE21.md) |
| [SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md](SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md) | Top navigation and profile menu correction | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_TOP_NAVIGATION_AND_PROFILE_MENU_CORRECTION.md) |
| [SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md](SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md) | Onboarding and first 7 days experience | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_ONBOARDING_AND_FIRST_7_DAYS_EXPERIENCE_SPECIFICATION_PHASE23.md) |
| [SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md](SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md) | Daily companion experience | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_DAILY_COMPANION_EXPERIENCE_SPECIFICATION_PHASE24.md) |
| [SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md](SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md) | Room blueprint template | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md) |
| [SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md](SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md) | File and data architecture map | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md) |
| [SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md](SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md) | Demo-to-production readiness checklist | **Implemented** — [protocol copy](../docs/protocols/SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md) |
| [SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md](SPARK_NOTE_COMPLETE_EXPERIENCE_AND_ROUTING_SPECIFICATION.md) | Experience + destination routing | **Implemented** (v1 — `sparkNoteDestinations.ts`, expanded UI) |

---

## Content libraries (authoring — not yet in runtime catalog)

Use these when expanding `lib/sparkNote/catalog.ts` or a future CMS.

| Library | Topic |
|---------|--------|
| [SPARK_NOTE_STARTER_SPARK_LIBRARY.md](SPARK_NOTE_STARTER_SPARK_LIBRARY.md) | Starter set | **In runtime** (`SPARK-INV-001`–`002`, `PER-001`, `BIZ-001`, `HIST-001`, `FACT-001`, `CREAT-001`, `GROW-001`) |
| [SPARK_NOTE_INNOVATION_AND_DISCOVERY_SPARK_LIBRARY.md](SPARK_NOTE_INNOVATION_AND_DISCOVERY_SPARK_LIBRARY.md) | Inventions & discoveries | **In runtime** (`SPARK-INNOV-001`–`008`) |
| [SPARK_NOTE_INSPIRING_PEOPLE_SPARK_LIBRARY.md](SPARK_NOTE_INSPIRING_PEOPLE_SPARK_LIBRARY.md) | Inspiring people | **In runtime** (`SPARK-PER-001`–`008`) |
| [SPARK_NOTE_ENTREPRENEUR_BUSINESS_SPARK_LIBRARY.md](SPARK_NOTE_ENTREPRENEUR_BUSINESS_SPARK_LIBRARY.md) | Entrepreneurs | **In runtime** (`SPARK-BIZ-001`–`008`) |
| [SPARK_NOTE_SMALL_BUSINESS_ENTREPRENEUR_SPARK_LIBRARY.md](SPARK_NOTE_SMALL_BUSINESS_ENTREPRENEUR_SPARK_LIBRARY.md) | Small business | **In runtime** (`SPARK-SMB-001`–`008`) |
| [SPARK_NOTE_CREATIVITY_AND_IDEAS_SPARK_LIBRARY.md](SPARK_NOTE_CREATIVITY_AND_IDEAS_SPARK_LIBRARY.md) | Creativity | **In runtime** (`SPARK-CREAT-001`–`008`) |
| [SPARK_NOTE_FUN_FACTS_AND_WONDER_SPARK_LIBRARY.md](SPARK_NOTE_FUN_FACTS_AND_WONDER_SPARK_LIBRARY.md) | Fun facts | **In runtime** (`SPARK-FACT-001`–`008`) |
| [SPARK_NOTE_QUOTES_WITH_STORIES_SPARK_LIBRARY.md](SPARK_NOTE_QUOTES_WITH_STORIES_SPARK_LIBRARY.md) | Quotes | **In runtime** (`SPARK-QUOTE-001`–`008`) |
| [SPARK_NOTE_HOLIDAY_DATE_BASED_SPARK_LIBRARY.md](SPARK_NOTE_HOLIDAY_DATE_BASED_SPARK_LIBRARY.md) | Holidays & dates | **In runtime** (`SPARK-HOL-001`–`003`, `HIST-002`–`003`, `SEASON-001`–`002`) |
| [SPARK_NOTE_PERSONAL_GROWTH_AND_ENCOURAGEMENT_SPARK_LIBRARY.md](SPARK_NOTE_PERSONAL_GROWTH_AND_ENCOURAGEMENT_SPARK_LIBRARY.md) | Personal growth | **In runtime** (`SPARK-GROW-001`–`008`) |
| [SPARK_NOTE_GRATITUDE_AND_MEANING_SPARK_LIBRARY.md](SPARK_NOTE_GRATITUDE_AND_MEANING_SPARK_LIBRARY.md) | Gratitude & meaning | **In runtime** (`SPARK-MEAN-001`–`008`) |
| [SPARK_NOTE_PERSONAL_MOMENTS_AND_LIFE_EVENTS_SPARK_LIBRARY.md](SPARK_NOTE_PERSONAL_MOMENTS_AND_LIFE_EVENTS_SPARK_LIBRARY.md) | Personal moments | **In runtime** (`personalSparks.ts` — tone-adapted personal cards) |
| [SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md](SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md) | ADHD-friendly sparks | **In runtime** (`SPARK-ADHD-001`–`008`) |

---

## Daily selection order (runtime)

1. **Personal** — birthday, anniversaries, milestones, launches, workshops, speaking dates, remembrance dates, saved celebrations (`targetDate` vacations/due dates), membership anniversary; then major upcoming personal events within 7 days
2. **Date-based** — `monthDay`, `months`, seasonal `seasons`
3. **Curated library** — affinity-weighted rotation with repeat prevention

One Spark per day. Not a task. Not a notification.

---

## Adding a new Spark to runtime

1. Author using [SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md](SPARK_NOTE_CARD_TEMPLATE_DESIGN_STANDARD.md)
2. Add entry to `lib/sparkNote/catalog.ts` (match fields in `lib/sparkNote/types.ts`)
3. Run `npx vitest run lib/sparkNote`

Future: admin CMS per [SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md](SPARK_NOTE_CONTENT_LIBRARY_AND_ADMIN_PROTOCOL.md).
