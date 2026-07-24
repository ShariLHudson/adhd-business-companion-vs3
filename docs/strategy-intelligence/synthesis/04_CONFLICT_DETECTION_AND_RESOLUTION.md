# Conflict Detection and Resolution

## Contract

```ts
StrategySynthesisConflict {
  id, primaryDomainId, secondaryDomainId,
  issue, primaryPosition, secondaryPosition,
  materiality: "low" | "moderate" | "high",
  resolutionMethod:
    | "shared_constraint" | "evidence_priority" | "capacity_priority"
    | "reversibility_priority" | "user_value_priority"
    | "staged_option" | "experiment" | "ask_user",
  resolution?, preferClarify
}
```

Internal only — never dump conflict records or domain labels into member copy.

## Resolution order

1. Confirmed user goals and values  
2. Safety / major harm prevention  
3. Hard constraints  
4. Real capacity  
5. Stronger evidence  
6. Customer trust / existing commitments  
7. Reversibility  
8. Ability to run a bounded experiment  
9. Preservation of useful future options  
10. User preference  

When tension remains:

- explain the meaningful distinction in warm language  
- ask **one** question if it could change the recommendation  
- or offer a staged / experimental path  

Do not pretend the conflict does not exist. Do not force certainty.

## Classic conflicts

| Pair | Tension | Typical method |
|------|---------|----------------|
| Growth + Capacity | Expand vs stabilize | capacity_priority |
| Pricing + Capacity | Raise vs reduce scope | shared_constraint |
| Growth + Pricing | More volume vs value | evidence_priority |
| Pricing + Growth (weak demand) | Raise vs friction | experiment |
| Hiring + Capacity | Hire vs simplify | staged_option |
| Offer + Market | Build vs clarify who | ask_user |
