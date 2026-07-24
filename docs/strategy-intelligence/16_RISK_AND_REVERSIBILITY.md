# Risk and Reversibility

**Runtime:** `frameworks/risk.ts` · `frameworks/reversibility.ts` · `frameworks/reversibilityDepth.ts` · `frameworks/secondOrderThinking.ts`  
**Canonical reversibility:** `domainModel.ts` — **do not rename**

## Risk contract (`StrategicRisk`)

Proportionate fields: id, description, likelihood, impact, detectability, controllability, reversibility, warningSigns, mitigations, optional acceptable / whyItMatters.

`RiskAssessment` remains the lighter conversation-facing summary used by earlier phases.

Rules:

- Show only the most meaningful risks (usually ≤2)
- Include warning signs and mitigations
- Avoid fear-heavy language
- Answer: what could happen, why it matters, likelihood, seriousness, detectability, controllability, reversibility

## Reversibility depth

| Level | Depth |
|-------|--------|
| Easily reversible | Prefer action or small test; avoid overanalysis; lightweight comparison |
| Moderately reversible | Check assumptions; identify recovery cost; compare realistic alternatives |
| Difficult / effectively irreversible | Deeper evidence; more than one option; second-order effects; careful readiness; Board/other perspective when helpful |

Reversibility is never the only factor.

## Second-order effects

Identify one or two meaningful effects that may change the decision. No long hypothetical chains.
