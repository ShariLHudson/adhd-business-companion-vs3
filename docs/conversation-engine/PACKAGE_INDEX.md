# Conversation Engine — Package 3

**Standard:** `standards/029_CONVERSATION_ENGINE_STANDARD.md`  
**Contracts:** `contracts/030_CONVERSATION_ENGINE_CONTRACT_INDEX.md`  
**Audit prompt:** `prompts/031_CURSOR_AUDIT_CONVERSATION_ENGINE.md`  
**Release checklist:** `verification/032_CONVERSATION_ENGINE_RELEASE_CHECKLIST.md`

| Field | Status |
|-------|--------|
| Placement | complete |
| Audit | **in_progress** (failure corpus + advisory handoff path) |
| Gap map | `audits/CONVERSATION_ENGINE_GAP_MAP.md` |
| Content incident addendum | `prompts/053_CURSOR_ADD_CONTENT_INCIDENT_TO_CONVERSATION_ENGINE_AUDIT.md` |
| **CB-022 topic ownership** | **`implemented_preview`** — gap map + active-topic owner; unit tests green; live `083` pending authenticated preview |

### CB-022 package files (Conversation Engine)

| # | Path |
|---|------|
| 080 | `contracts/080_CB_022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md` |
| 081 | `prompts/081_CURSOR_AUDIT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP.md` |
| 082 | `prompts/082_CURSOR_IMPLEMENT_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GATE.md` |
| 083 | `verification/083_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_LIVE_CHECKLIST.md` |
| 084 | `audits/084_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_MANIFEST_UPDATE.md` |

Depends on Package 2 review. Overlaps CB-017 / CB-021 / **CB-022** — **one shared Chamber navigate + active-topic fix** for all members; do not phrase-patch.
