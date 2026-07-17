# Companion Behavior Foundation — Package Index

**Governing source for platform behavior.**  
**Authoritative root:** `docs/companion-behavior/`  
**Package:** Spark Estate Companion Behavior Foundation — Updated

Do not duplicate these documents into `.cursor/rules/`.

---

## Authoritative standards

| ID | File |
|----|------|
| CB-000 | `standards/000_SPARK_ESTATE_COMPANION_SUCCESS_STANDARD.md` |
| CB-001 | `standards/001_COMPANION_BEHAVIOR_ENGINE_STANDARD.md` |
| CB-003 | `standards/003_REVERSE_ENGINEERING_AND_IMPLEMENTATION_METHOD.md` |
| CB-005 | `standards/005_FRICTION_AND_DECISION_FATIGUE_STANDARD.md` |
| CB-012 | `standards/012_LIVE_BEHAVIOR_RELEASE_GATE.md` |
| CB-013 | `standards/013_BEHAVIOR_LIBRARY_BUILD_ORDER.md` |
| **CB-015** | **`standards/015_ONE_COMPANION_IDENTITY_AND_SHARI_VOICE_STANDARD.md`** |

Every visible user-facing response must comply with **CB-015**.

## Contracts

| ID | File |
|----|------|
| CB-002 | `contracts/002_BEHAVIOR_CONTRACT_TEMPLATE.md` |
| CB-006 | `contracts/006_DEFAULT_COMPETENCE_AND_PROGRESSIVE_PERSONALIZATION_CONTRACT.md` |
| CB-007 | `contracts/007_NEW_CHAT_AND_CONTEXT_ISOLATION_BEHAVIOR_CONTRACT.md` |
| CB-008 | `contracts/008_CONTINUE_WHERE_LEFT_OFF_BEHAVIOR_CONTRACT.md` |
| CB-009 | `contracts/009_HELP_ME_CHOOSE_NEXT_STEP_BEHAVIOR_CONTRACT.md` |
| CB-010 | `contracts/010_OVERWHELM_AND_TASK_FRICTION_BEHAVIOR_CONTRACT.md` |
| CB-011 | `contracts/011_RETURN_AFTER_ABSENCE_BEHAVIOR_CONTRACT.md` |
| CB-017 | `contracts/017_CONVERSATION_PROGRESSION_AND_REDUNDANT_QUESTION_PREVENTION_CONTRACT.md` |
| CB-021 | `contracts/021_ADVISORY_HANDOFF_IDENTITY_CONTINUITY_AND_SINGLE_RESPONSE_OWNERSHIP_CONTRACT.md` |
| **CB-022** | **`contracts/022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md`** |

## Cursor prompts

| ID | File |
|----|------|
| CB-004 | `prompts/004_CURSOR_GLOBAL_REVERSE_ENGINEERING_PROMPT.md` |
| CB-014 | `prompts/014_CURSOR_START_HERE_IMPLEMENTATION_PROMPT.md` |
| CB-018 | `prompts/018_CURSOR_AUDIT_CB_017_CONVERSATION_PROGRESSION.md` |
| (file 022) | `prompts/022_CURSOR_AUDIT_CB_021_ADVISORY_HANDOFF.md` — audit prompt for **CB-021** (not contract CB-022) |
| CB-022 audit | `prompts/080_CURSOR_AUDIT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP.md` |
| CB-022 implement | `prompts/082_CURSOR_IMPLEMENT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GATE.md` |

## Manifests, audits & verification

| File | Role |
|------|------|
| `MANIFEST.json` | Machine-readable package index |
| `BEHAVIOR_CONTRACT_MANIFEST.md` | Contract status + owners + live gates |
| `PACKAGE_INDEX.md` | This human index |
| `audits/007_NEW_CHAT_AND_CONTEXT_ISOLATION_GAP_MAP.md` | CB-007 gap map (repo audit) |
| `audits/016_CB_007_AUTHENTICATED_PREVIEW_VERIFICATION_CHECKLIST.md` | CB-007 live preview checklist (fill Result Template → then `live_verified`) |
| `audits/017_CONVERSATION_PROGRESSION_GAP_MAP.md` | CB-017 gap map (gap_map_complete) |
| `verification/019_CB_017_LIVE_REGRESSION_CHECKLIST.md` | CB-017 authenticated preview checklist |
| `audits/021_ADVISORY_HANDOFF_AND_RESPONSE_OWNERSHIP_GAP_MAP.md` | CB-021 gap map (INC-001 Finance + INC-002 Content) |
| `verification/023_CB_021_LIVE_REGRESSION_CHECKLIST.md` | CB-021 Finance live checklist |
| `audits/052_CB_021_CONTENT_INTELLIGENCE_HANDOFF_LOOP_INCIDENT.md` | CB-021-INC-002 Content handoff loop |
| `verification/054_CONTENT_INTELLIGENCE_HANDOFF_LIVE_CHECKLIST.md` | Content Intelligence live checklist |
| `prompts/053_CURSOR_ADD_CONTENT_INCIDENT_TO_CONVERSATION_ENGINE_AUDIT.md` | Add Content incident to Package 3 audit |
| `audits/084_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_MANIFEST_UPDATE.md` | CB-022 package registration notes |
| `verification/083_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_LIVE_CHECKLIST.md` | CB-022 live regression checklist |

## Active implementation

| Contract | Owner |
|----------|--------|
| CB-007 | `lib/conversationReset/resetActiveConversation.ts` |
| CB-017 | Audit complete — implementation not started; recommend `lib/conversationStabilization/` progression boundary |
| CB-021 | Audit complete — implementation not started; recommend advisory orchestration before Chamber writers |
| **CB-022** | **Implemented (preview)** — gap map + `lib/conversationStabilization/activeTopic*` + chamber navigate gate; live checklist pending authenticated preview |
| **CB-022 addendum** | **Implemented (preview)** — intent/workflow gate + Get Advice → Strategy Library; live `088` authenticated pending |

## Behavioral Operating System (Packages 2–7)

Larger permanent architecture — **does not replace** CB-007 / CB-017 / CB-021.

| Resource | Path |
|----------|------|
| Bundle index | `docs/behavioral-os/PACKAGE_INDEX.md` |
| Package 2 (in progress) | `docs/companion-intelligence/` — knowledge map complete |
| Packages 3–7 | placed; Package 3 audit in progress |
| Research capability | `docs/research-capability/` — RC-001 gap map complete |
