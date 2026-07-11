# Evidence Vault™ — Entrance Sequence

## Flow

```
Estate Navigation
        ↓
Evidence Vault
        ↓
Evidence Vault Entrance
        ↓
Click the key
        ↓
Doors unlock
        ↓
Doors slowly swing open
        ↓
Evidence Vault room
        ↓
Spark welcomes the member
        ↓
Evidence Vault conversation begins
```

## Implementation

| Step | Behavior | Code |
|------|----------|------|
| Navigate to vault | `enterEvidenceVaultRoomCore` — dedicated panel, no frosted overlay | `directEstateVisit.ts`, `CompanionPageClient.tsx` |
| Entrance | Door + key ritual; room dimmed behind doors | `EvidenceVaultEntrance.tsx` |
| Click key | `unlocking` phase — lock plate turns | `EstateCollectionRoomEngine.tsx` |
| Doors open | `opening` phase — 1.1s swing animation | `evidence-vault-entrance.css` |
| Room visible | `inside` — Discovery File folder | `DiscoveryFileExperience.tsx` |
| Spark welcome | Deferred until `EVIDENCE_VAULT_ENTRANCE_COMPLETE_EVENT` | `evidenceVaultArrival.ts` |
| Conversation | Chat + vault context replies | `CompanionPageClient.tsx` |

**Skip entrance:** `add` / `browse` modes set `EVIDENCE_VAULT_SKIP_ENTRANCE_KEY`.
