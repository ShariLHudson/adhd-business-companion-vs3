# Phase 1 — Shared Foundation Plan

**Status:** Foundation complete — awaiting review  
**Stop line:** No Evidence Vault rebuild until audit is approved

---

## Module: `lib/sparkRecognitionEngine/`

| File | Responsibility |
|------|----------------|
| `types.ts` | Record types, lifecycle, tone, room IDs, flow state |
| `wings.ts` | Estate Wings constants |
| `lifecycle.ts` | Valid transitions; never auto-induct |
| `roomState.ts` | visual_room, conversation_context, requested_destination, active_recognition_flow |
| `routing.ts` | Preserve-first, tone routing, context lock, member override |
| `triggers.ts` | Recognition trigger phrases (v1 rule-based) |
| `coldStart.ts` | Empty-room copy |
| `store.ts` | recognition_records + hall exhibits persistence |
| `index.ts` | Public API |
| `sparkRecognitionEngine.test.ts` | Foundation acceptance tests |

---

## Non-goals (this phase)

- Rebuilding Evidence Vault UI
- Hall gallery walk
- Celebration rituals
- Migrating all existing stores
- Wiring CompanionPageClient (awaiting review)

---

## Success for Phase 1 foundation

- [x] Audit + gap analysis documented
- [x] Shared types + store compile
- [x] Room state tracks four required fields
- [x] Routing helpers: preserve-first, tone → garden/room, no auto Hall
- [x] Tests for lifecycle + routing + already-here gate
- [x] Review package returned to Shari
