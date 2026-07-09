# Recognition Architecture Library Index

**Source of truth:** [SPARK_RECOGNITION_ENGINE.md](./SPARK_RECOGNITION_ENGINE.md)

## Phase status

| Phase | Status |
|-------|--------|
| Phase 0 — Repository Intelligence | Complete — [PHASE_0_REPOSITORY_INTELLIGENCE.md](./PHASE_0_REPOSITORY_INTELLIGENCE.md) |
| Phase 1 — Shared Foundation | Complete (awaiting review) — [PHASE_1_ARCHITECTURE_AUDIT.md](./PHASE_1_ARCHITECTURE_AUDIT.md), [PHASE_1_FOUNDATION_PLAN.md](./PHASE_1_FOUNDATION_PLAN.md) |
| Phase 2 — Evidence Vault™ | Blocked until review |
| Phase 3 — Celebration system | Not started |
| Phase 4 — Legacy Studio™ | Not started |
| Phase 5 — Hall of Accomplishments™ | Not started |

## Runtime module

`lib/sparkRecognitionEngine/` — shared types, lifecycle, room state, routing, triggers, store.

**Not** `lib/recognition/` (birthday/anniversary milestones — keep separate).

## Spec priority (conflicts)

1. SPARK_RECOGNITION_ENGINE.md / 001
2. 002 Room Interaction Standard
3. 003 Unified Recognition System
4. 030 Recognition Data Model / 058 Shared Schema
5. Room implementation specs 051–055
6. Older prompts/images/notes

## Ingested Architecture Library (recognition folder)

| Doc | Path | Notes |
|-----|------|-------|
| 089 Confidence Building Standard | [library/089_CONFIDENCE_BUILDING_STANDARD.md](./library/089_CONFIDENCE_BUILDING_STANDARD.md) | Confidence from evidence, not empty praise |
| 090 Daily Experience Standard | [library/090_DAILY_EXPERIENCE_STANDARD.md](./library/090_DAILY_EXPERIENCE_STANDARD.md) | Welcome → orient → converse → optional rooms → wrap-up; never start over |
| 091 Spark Estate Constitution | [library/091_SPARK_ESTATE_CONSTITUTION.md](./library/091_SPARK_ESTATE_CONSTITUTION.md) | Non-negotiables: member, meaning, trust, conversation, long-term relationship |
| 092 Member-First Philosophy | [library/092_MEMBER_FIRST_PHILOSOPHY.md](./library/092_MEMBER_FIRST_PHILOSOPHY.md) | Friction, autonomy, clarity, trust — redesign if not |
| 093 Companion Over Features | [library/093_COMPANION_OVER_FEATURES_STANDARD.md](./library/093_COMPANION_OVER_FEATURES_STANDARD.md) | One continuous companion; features support relationship |
| 094 Preserve Meaning Standard | [library/094_PRESERVE_MEANING_STANDARD.md](./library/094_PRESERVE_MEANING_STANDARD.md) | Capture significance, context, lessons — not just data |
| 095 Room Philosophy Standard | [library/095_ROOM_PHILOSOPHY_STANDARD.md](./library/095_ROOM_PHILOSOPHY_STANDARD.md) | One purpose, outcome, question, value — no duplicate rooms |
| 096 AI Behavior Guardrails | [library/096_AI_BEHAVIOR_GUARDRAILS.md](./library/096_AI_BEHAVIOR_GUARDRAILS.md) | Never force workflows, invent memories, or override member choice |
| 097 Long-Term Relationship Standard | [library/097_LONG_TERM_RELATIONSHIP_STANDARD.md](./library/097_LONG_TERM_RELATIONSHIP_STANDARD.md) | Remember, welcome back, adapt, celebrate — years of companionship |
| 098 Spark Estate Design Language | [library/098_SPARK_ESTATE_DESIGN_LANGUAGE.md](./library/098_SPARK_ESTATE_DESIGN_LANGUAGE.md) | Warm materials, calm light, space, minimal clutter, purposeful motion |
| 099 Visual Spark Studios Design Principles | [library/099_VISUAL_SPARK_STUDIOS_DESIGN_PRINCIPLES.md](./library/099_VISUAL_SPARK_STUDIOS_DESIGN_PRINCIPLES.md) | Transformation, lasting value, empathy, attention, timeless over trends |
| 100 Spark Estate Master Manifest | [library/100_SPARK_ESTATE_MASTER_MANIFEST.md](./library/100_SPARK_ESTATE_MASTER_MANIFEST.md) | Master index: 001–100 section map (Foundation → Constitution) |
| 101 Evidence Vault UX Specification | [library/101_EVIDENCE_VAULT_UX_SPECIFICATION.md](./library/101_EVIDENCE_VAULT_UX_SPECIFICATION.md) | First/return visits, door/key, Discovery File, search, print, rediscovery, exit |
| 102 Hall of Accomplishments UX Specification | [library/102_HALL_OF_ACCOMPLISHMENTS_UX_SPECIFICATION.md](./library/102_HALL_OF_ACCOMPLISHMENTS_UX_SPECIFICATION.md) | Foyer, exhibits, tours, timeline, search, induction — living museum, not a database |
| 103 Celebration Garden UX Specification | [library/103_CELEBRATION_GARDEN_UX_SPECIFICATION.md](./library/103_CELEBRATION_GARDEN_UX_SPECIFICATION.md) | Quick recognition, full ritual, sapling growth, reflection, exit — quiet, low friction |
| 104 Celebration Room UX Specification | [library/104_CELEBRATION_ROOM_UX_SPECIFICATION.md](./library/104_CELEBRATION_ROOM_UX_SPECIFICATION.md) | Arrival, intensity, joyful acknowledgement, save flow, room connections — genuine, never exaggerated |
| 105 Legacy Studio UX Specification | [library/105_LEGACY_STUDIO_UX_SPECIFICATION.md](./library/105_LEGACY_STUDIO_UX_SPECIFICATION.md) | Story drafting, attachments, reflection prompts, Hall prep, version history — minimal effort |
| 106 Room-to-Room Transitions | [library/106_ROOM_TO_ROOM_TRANSITIONS.md](./library/106_ROOM_TO_ROOM_TRANSITIONS.md) | Preserve context, explain why, allow cancel, immediate return — natural transitions |
| 107 Contextual AI Dialogue Library | [library/107_CONTEXTUAL_AI_DIALOGUE_LIBRARY.md](./library/107_CONTEXTUAL_AI_DIALOGUE_LIBRARY.md) | Room-specific dialogue for Vault, Garden, Celebration Room, Legacy, Hall |
| 108 Member Onboarding Experience | [library/108_MEMBER_ONBOARDING_EXPERIENCE.md](./library/108_MEMBER_ONBOARDING_EXPERIENCE.md) | Welcome → Estate intro → first discovery/celebration/accomplishment → return — no tutorials |
| 109 Recognition Edge Cases | [library/109_RECOGNITION_EDGE_CASES.md](./library/109_RECOGNITION_EDGE_CASES.md) | Empty Hall, duplicates, deleted sources, reclassification, interrupted ceremonies, offline |
| 110 Recognition System Roadmap | [library/110_RECOGNITION_SYSTEM_ROADMAP.md](./library/110_RECOGNITION_SYSTEM_ROADMAP.md) | Phases: Foundation → Shared recognition → Estate rooms → Life Story → Meaning → Future intelligence |
| 111 Evidence Vault Conversation Playbook | [library/111_EVIDENCE_VAULT_CONVERSATION_PLAYBOOK.md](./library/111_EVIDENCE_VAULT_CONVERSATION_PLAYBOOK.md) | Capture, follow-ups, preserve confirm, rediscovery, exit — conversations, not forms |
| 112 Hall Curator Playbook | [library/112_HALL_CURATOR_PLAYBOOK.md](./library/112_HALL_CURATOR_PLAYBOOK.md) | Curator voice: welcome, tours, exhibit intros, reflection, farewell |
| 113 Celebration Dialogue Library | [library/113_CELEBRATION_DIALOGUE_LIBRARY.md](./library/113_CELEBRATION_DIALOGUE_LIBRARY.md) | Quiet + joyful celebration dialogue — authentic, optional, tone-respecting |
| 114 Legacy Story Prompts | [library/114_LEGACY_STORY_PROMPTS.md](./library/114_LEGACY_STORY_PROMPTS.md) | Optional prompts: what happened, why it mattered, what changed, what future-you should remember |
| 115 Hall Exhibit Template | [library/115_HALL_EXHIBIT_TEMPLATE.md](./library/115_HALL_EXHIBIT_TEMPLATE.md) | Exhibit sections: title, story, why it mattered, people, media, legacy, related discoveries |
| 116 Recognition API Spec | [library/116_RECOGNITION_API_SPEC.md](./library/116_RECOGNITION_API_SPEC.md) | Shared APIs: create, update, search, print/export, Hall candidate, Hall exhibit |
| 117 Recognition Database Schema | [library/117_RECOGNITION_DATABASE_SCHEMA.md](./library/117_RECOGNITION_DATABASE_SCHEMA.md) | Tables: recognition_records, hall_exhibits, attachments, tags, relationships, member_preferences |
| 118 Recognition Analytics Standard | [library/118_RECOGNITION_ANALYTICS_STANDARD.md](./library/118_RECOGNITION_ANALYTICS_STANDARD.md) | Usage, completion, rediscovery, return visits, satisfaction — never addictive engagement metrics |
| 119 Recognition Security Standard | [library/119_RECOGNITION_SECURITY_STANDARD.md](./library/119_RECOGNITION_SECURITY_STANDARD.md) | Secure storage, audit history, permissions, export integrity, privacy by default |
| 120 Recognition Deployment Checklist | [library/120_RECOGNITION_DEPLOYMENT_CHECKLIST.md](./library/120_RECOGNITION_DEPLOYMENT_CHECKLIST.md) | UX, routing, DB, APIs, a11y, performance, security, backup, acceptance — no deploy until critical pass |
| 121 Multi-Turn Conversation Standard | [library/121_MULTI_TURN_CONVERSATION_STANDARD.md](./library/121_MULTI_TURN_CONVERSATION_STANDARD.md) | Preserve intent; no unnecessary restarts; sync room + conversation context |
| 122 Interruption and Resume Standard | [library/122_INTERRUPTION_AND_RESUME_STANDARD.md](./library/122_INTERRUPTION_AND_RESUME_STANDARD.md) | Pause, resume later, save partial progress, explain where the member left off |
| 123 Voice Interaction Standard | [library/123_VOICE_INTERACTION_STANDARD.md](./library/123_VOICE_INTERACTION_STANDARD.md) | Natural pacing, interruptible speech, voice confirmations, seamless voice↔text |
| 124 Multimodal Experience Standard | [library/124_MULTIMODAL_EXPERIENCE_STANDARD.md](./library/124_MULTIMODAL_EXPERIENCE_STANDARD.md) | Coordinate text, voice, images, documents, room visuals — switch modalities without losing context |
| 125 Multiple Discovery Handling | [library/125_MULTIPLE_DISCOVERY_HANDLING.md](./library/125_MULTIPLE_DISCOVERY_HANDLING.md) | Separate discoveries intelligently; confirm before save; allow edit before preserve |
| 126 Ambiguous Request Routing | [library/126_AMBIGUOUS_REQUEST_ROUTING.md](./library/126_AMBIGUOUS_REQUEST_ROUTING.md) | One clarifying question; avoid assumptions; preserve conversation momentum |
| 127 Unfinished Work Recovery | [library/127_UNFINISHED_WORK_RECOVERY.md](./library/127_UNFINISHED_WORK_RECOVERY.md) | Offer resume / review draft / discard — member always decides |
| 128 Memory Decision Framework | [library/128_MEMORY_DECISION_FRAMEWORK.md](./library/128_MEMORY_DECISION_FRAMEWORK.md) | Remember preferences, discoveries, long-term projects — not temporary/ephemeral noise |
| 129 Room Conflict Resolution | [library/129_ROOM_CONFLICT_RESOLUTION.md](./library/129_ROOM_CONFLICT_RESOLUTION.md) | Priority: explicit request → active workflow → recognition → conversation |
| 130 Production Conversation Examples | [library/130_PRODUCTION_CONVERSATION_EXAMPLES.md](./library/130_PRODUCTION_CONVERSATION_EXAMPLES.md) | Real-world examples for Vault, Garden, Room, Legacy, Hall, switches, recovery |
| 131 Shared Capability Library Overview | [library/131_SHARED_CAPABILITY_LIBRARY_OVERVIEW.md](./library/131_SHARED_CAPABILITY_LIBRARY_OVERVIEW.md) | Compose reusable capabilities; one companion, not separate GPTs |

**Also in Downloads (not yet ingested into library/):** Estate `002`–`088` (full series present in Downloads).  
**Estate 132–140:** Missing as `NNN_*` — do not confuse with SIOS `SPARK-132`–`SPARK-140`.  
**Collision warning:** Estate `NNN_*` and SIOS `SPARK-NNN_*` are different libraries sharing numbers.

**Library note:** Docs **089–131** ingested under `library/`. Fresh audit: [SPARK_ESTATE_V2_COMPREHENSIVE_AUDIT.md](./SPARK_ESTATE_V2_COMPREHENSIVE_AUDIT.md).
