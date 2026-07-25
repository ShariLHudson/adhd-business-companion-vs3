# Direct Ownership Writes Inventory (Phase 3 Slice 2)

Supported mid-turn API: `claimTurnOwnership` / `releaseTurnOwnership` / `beginOwnershipTurnGate`  
Compatibility wrapper: `beginSpineOwnership` → routes through `claimTurnOwnership({ force: true })` when a turn gate is active.

## Allowed writers

| Path | Role |
|------|------|
| `claimTurnOwnership.ts` | Authoritative mid-turn claim / release; one claim per turn gate |
| `ownershipStore.ts` → `writeConversationOwnership` | Low-level Spine patch; prefer claim API from feature code |
| `applyOwnershipResolution.ts` | Choke-point apply after `resolveConversationOwnership` |
| `beginSpineOwnership` | Compatibility wrapper for CPC feature handlers |

## Remaining CPC call sites (wrapper, not scattered raw writes)

`CompanionPageClient.tsx` still calls `beginSpineOwnership` at Collection / win-save / Create / frictionless offer sites. These are intentional until each site is migrated to `claimTurnOwnership` with an explicit reason. They do **not** bypass the turn gate when one is open (force path).

## Forbidden pattern

```ts
patchConversationSpine({ ownership: { ... } }); // from feature modules
```

Feature modules must use `claimTurnOwnership` or `releaseTurnOwnership`.

## Dual-claim contract

Two mid-turn claims in the same assistant turn: first succeeds; second is rejected with diagnostics (`mid_turn_claim_rejected`). Covered in `ownershipPhase3.test.ts`.
