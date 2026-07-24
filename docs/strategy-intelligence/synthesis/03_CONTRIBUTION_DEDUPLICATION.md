# Contribution Extraction and Deduplication

## Extraction

Do not merge full domain files. Pull only relevant contributions:

- hidden underlying question  
- evidence need  
- assumption  
- material constraint / capacity check  
- option pattern  
- trade-off dimension  
- risk  
- experiment pattern  
- review trigger  
- routing consideration  

### Budgets (default)

| Role | Max high-value contributions |
|------|------------------------------|
| Primary | 5 |
| Secondary | 3 |

Constants: `PRIMARY_CONTRIBUTION_BUDGET`, `SECONDARY_CONTRIBUTION_BUDGET`.

## Deduplication

`mergeDomainContributions` / `dedupeLines` remove or merge:

- identical questions  
- equivalent assumptions  
- repeated constraints  
- synonymous options  
- duplicate risks  
- overlapping trade-offs  
- repeated evidence prompts  
- repeated handoff recommendations  

Example merge:

- Pricing: is the offer financially sustainable?  
- Capacity: can delivery be sustained at this workload?  
→ One line: are price and delivery sustainable together?

Primary contributions win on ties when content is equivalent.
