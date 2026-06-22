# Sprint 1 — Unified Signal Bus Rollback

## Instant rollback (no deploy)

```javascript
localStorage.setItem("companion-flag-unified-signal-bus", "0");
localStorage.removeItem("companion-flag-signal-bus-diagnostics");
```

Reload the page. Legacy intelligence path only; shadow store stops growing.

## Environment rollback

Unset or set false:

```
NEXT_PUBLIC_UNIFIED_SIGNAL_BUS=false
```

## Code rollback

Revert PR-B (ingest mirrors + CompanionPageClient hook), then PR-A if needed.

## Verify rollback

1. `localStorage.getItem("companion-flag-unified-signal-bus")` → `"0"` or null
2. Send chat message — `companion-signal-bus-shadow-v1` does not grow
3. `npx vitest run lib/intelligence-layer/intelligence-layer.test.ts lib/intelligence-stack-e2e.test.ts` — green

## Protected behavior

Rollback does not affect:

- `companion-intelligence-profile-v1`
- `companion-intelligence-signals-v1`
- Offers, routing, prompts (unchanged when bus was off)

Shadow store (`companion-signal-bus-shadow-v1`) may remain on disk but is inert when flag is off.
