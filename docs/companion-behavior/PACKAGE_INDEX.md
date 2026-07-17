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

## Cursor prompts

| ID | File |
|----|------|
| CB-004 | `prompts/004_CURSOR_GLOBAL_REVERSE_ENGINEERING_PROMPT.md` |
| CB-014 | `prompts/014_CURSOR_START_HERE_IMPLEMENTATION_PROMPT.md` |

## Manifests & audits

| File | Role |
|------|------|
| `MANIFEST.json` | Machine-readable package index |
| `BEHAVIOR_CONTRACT_MANIFEST.md` | Contract status + owners + live gates |
| `PACKAGE_INDEX.md` | This human index |
| `audits/007_NEW_CHAT_AND_CONTEXT_ISOLATION_GAP_MAP.md` | CB-007 gap map (repo audit) |

## Active implementation

| Contract | Owner |
|----------|--------|
| CB-007 | `lib/conversationReset/resetActiveConversation.ts` |
