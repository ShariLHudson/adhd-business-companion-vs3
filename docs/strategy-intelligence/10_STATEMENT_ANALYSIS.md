# Statement Analysis — Epistemic Layer

**Phase:** Strategy Intelligence Phase 2  
**Runtime:** `lib/strategyChamber/intelligence/statementAnalysis.ts` · `engine/analyzeStrategicStatement.ts`  
**Canonical domain model:** `lib/strategyChamber/domainModel.ts` (unchanged)

## Why two layers

| Layer | Type | Answers |
|-------|------|---------|
| Strategic role | `StrategicInputClassification` | What *kind of strategic material* is this? (goal, risk, option…) |
| Statement nature | `StrategicStatementNature` | What *epistemic standing* does this claim have? |

They must stay separate. A risk can be a feeling. An observation can play the role of evidence without being a proven fact. Collapsing them into one union forces false certainty.

## Natures

`fact` · `observation` · `interpretation` · `assumption` · `feeling` · `unknown`

## Behavioral rules

- Feelings must not be presented as evidence.
- Assumptions must not be presented as facts.
- Observations must not be presented as proven causes.
- Interpretations remain tentative unless supported.
- Unknowns remain visible.
- Original member wording is preserved (`originalText`).
- Members are never asked to label their own statements.

## Relationship to EvidenceStrength

Nature informs how `EvidenceStrength` is interpreted in copy and intake. Assumed / anecdotal strength is preferred for feelings and assumptions. Confirmed strength is reserved for supported facts.
