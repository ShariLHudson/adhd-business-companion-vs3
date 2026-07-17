# 155–157 — Evidence Vault Open and Discovery Cleanup (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `156_EVIDENCE_VAULT_OPEN_AND_DISCOVERY_LIVE_CHECKLIST.md` passes.

## Root cause

1. Locked UI stacked explanation CTAs (Begin Discovery / Learn Why) beside the key.
2. `shouldMountEvidenceVaultHome` still mounted home under `vaultPanel === "discovery"`, ghosting the dashboard under Today's Discovery.
3. Entrance completion left `vaultPanel` null + Discovery File `folder` cover before discovery.
4. Global Show Conversation chip appeared over the Vault.

## What shipped

- Locked: doors + moving key + “Click the moving key to open the Vault.” only
- Key open → Today's Discovery (`filePhase: "open"`) — no Discovery File cover
- Home unmounts during discovery; discovery panel fully opaque
- How Do I… on Today's Discovery
- Show Conversation hidden for Evidence Vault

## Owners

| Concern | Owner |
|---------|--------|
| Vault state | `EstateCollectionRoomEngine` |
| Locked / key | `VaultKeyInteraction` + `EvidenceVaultEntrance` |
| Discovery panel | `DiscoveryFileExperience` |
| How Do I… | discovery panel + `evidenceVaultHome.ts` |
| Saved discovery | draft + evidence bank adapter |

## Automated tests

`evidenceVaultLockedCopy` + `evidenceVaultDoor` — **passed**
