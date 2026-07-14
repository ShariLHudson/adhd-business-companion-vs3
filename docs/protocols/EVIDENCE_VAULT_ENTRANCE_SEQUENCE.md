# Evidence Vault™ — Entrance Sequence

## Flow

```
Estate Navigation
        ↓
Evidence Vault
        ↓
Evidence Vault Entrance (closed doors + key in lock)
        ↓
Unlock the Evidence Vault (key turn)
        ↓
Hinged door leaves open (~110°) — interior already behind
        ↓
Existing Evidence Vault UI fades in
```

## Implementation

| Step | Behavior | Code |
|------|----------|------|
| Navigate to vault | Dedicated panel | `CompanionPageClient.tsx` |
| Closed doors | `/backgrounds/evidence-vault-background.png` + door leaf crops | `evidenceVaultDoor.ts`, `EvidenceVaultEntrance.tsx` |
| Key | Already inserted in lock — hotspot + glow | `EvidenceVaultEntrance.tsx` |
| Unlock | `key_ready → unlocking → opening → open` | `EstateCollectionRoomEngine.tsx` |
| Persist | Unlocked ≠ first-entry ≠ evidence stored | `evidenceVaultDoor.ts` |
| Return visits | Skip ritual when unlocked | `resolveInitialEvidenceVaultDoorState` |
| Dev reset | `window.__resetEvidenceVaultAccess()` | development only |

**Timings:** arrival 400ms · unlock 500ms · doors 1200ms (+100ms stagger) · UI settle 250ms.

**Skip entrance:** always available during animation; `add` / `browse` modes also set `EVIDENCE_VAULT_SKIP_ENTRANCE_KEY`.

**Future:** Settings toggle to replay entrance (not built).

**Assets:** `evidence-vault-door-left.png`, `evidence-vault-door-right.png`, `evidence-vault-room-static.png`, `evidence-vault-interior-reveal.png`.
