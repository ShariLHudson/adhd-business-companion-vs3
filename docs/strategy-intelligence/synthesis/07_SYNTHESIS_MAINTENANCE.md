# Synthesis Maintenance

## Extension rules

1. Add domain packs under `domains/` — do not invent synthesis knowledge for incomplete packs.  
2. Register pairs in `pairRegistry.ts` with honest `active` | `partial` | `unavailable` status.  
3. Add secondary hints in `suggestSecondaryDomain.ts` only when material.  
4. Add threshold reasons in `secondaryThreshold.ts` — never load “related” domains by default.  
5. Add conflict rules in `resolveConflicts.ts` with a resolution method from the contract.  
6. Keep contribution budgets tight. Prefer merge over longer lists.  
7. Never duplicate live `StrategicOption` / `StrategicRisk` / `StrategicExperiment` / `StrategicRecommendation` / next-move contracts.  

## Out of scope (do not start from synthesis)

- Strategic Memory  
- Board collaboration  
- Cross-Chamber orchestration  
- Evidence Vault integration  
- Cloud persistence of synthesis state  
- Loading more than one secondary by default  

## Incomplete domains

If a secondary pack is partial/unavailable:

- continue with primary  
- do not invent secondary knowledge  
- do not block conversation  
- record that another perspective may help later  

## Versioning

Pair rules carry a `version` string. Bump when merge guidance or conflict posture changes materially.
