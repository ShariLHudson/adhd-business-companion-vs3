# P0-06 — Memory Center V1 Deferral

**Date:** 2026-07-22  
**Decision:** **Defer** member-facing Memory Center wiring for V1.

## Rationale

| Piece | State |
|-------|--------|
| Spec 112 section IDs / types | `lib/sparkCompanionMemory/types.ts` — typed only |
| Core Memory executor | `runCoreMemory` — test-only / unused on companion-chat path |
| Memory Center UI | **Missing** — no route, store, or edit/delete controls |
| Spec 117 retrieve | Not a production chat executor |

Honest V1 would require: permissioned persistence (Spec 112), a read model, chat-path retrieval, and a calm member control surface. That is larger than a safe session patch and must not fake a Memory Center behind empty UI.

## V1 product claim

Do **not** tell members they can open or edit a Memory Center until the above lands. Session / adaptive prefs may continue quietly without implying Spec 112 Memory Center product completeness.

## Re-open when

1. Durable preference / memory store with Spec 112 permission paths  
2. Companion-chat retrieve uses that store (or Spec 117 executor)  
3. Minimal frosted Memory Center UI (edit · delete · turn off) with tests  

*End of deferral note.*
