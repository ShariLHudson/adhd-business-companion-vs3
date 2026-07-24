# Domain Selection and Loading

## Primary domain

Chosen from the full strategic context:

- surface statement and goal  
- concern / opportunity / evidence  
- existing options  
- latest classified input  
- current judgment stage  
- Strategy Work Item fields  

Not keyword-only. Phrase-level overrides exist for classic cross-domain asks when registry scoring is weak.

Examples:

| Ask | Primary |
|-----|---------|
| Raise membership price? | Pricing |
| Need more customers | Growth (unless market fit is clearly the issue) |
| Hire a VA? | Hiring and Delegation |
| Too many things to work on | Capacity and Focus |
| Change who the program is for | Customer and Market |

## Secondary domain

Load **one** secondary only when it could materially change:

- the next question  
- the option set  
- the recommendation  
- risk analysis  
- experiment  
- handoff destination  

### Threshold (at least one)

- Could reverse the likely recommendation  
- Could eliminate options  
- Reveals a major constraint  
- Changes reversibility or risk  
- Missing essential evidence  
- Better experiment  
- Changes correct next destination  

If none apply → primary only.

### Pair registry

`STRATEGY_DOMAIN_PAIR_RULES` validates pairs (`active` | `partial` | `unavailable`).  
Arbitrary pairs are not allowed. Incomplete packs stay `partial`/`unavailable` — never invent knowledge.

### Low confidence

Diffuse asks (“Everything is wrong…”) → clarify first. Do not load several candidate domains.

### Fallback

Unavailable secondary → continue with primary. Do not block the conversation.
