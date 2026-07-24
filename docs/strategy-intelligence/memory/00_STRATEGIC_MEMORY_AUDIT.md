# Strategy Intelligence Phase 6 — Strategic Memory Audit

**Branch:** `deploy/companion-app-v3`  
**Date:** 2026-07-23  
**Status:** Audit complete — Phase 6 not previously implemented

## Verdict

Strategy Chamber already persists the **reasoning surface** on the Strategy Work Item (local V1). Decision Records and Synthesis are **derived views**, not stored records. Phase 6 should add a thin **Strategic Decision Memory** layer that remembers decision journeys over time — by **reference** to the Work Item — without becoming Spec 112 companion memory, Evidence Vault storage, or a second Decision Record.

## What already exists (reuse)

| Capability | Location | Persistence |
|------------|----------|-------------|
| Strategy Work Item | `lib/strategyChamber/types.ts` · `strategyWorkItemStore.ts` | localStorage `spark:strategy-work-items:v1` |
| Connections / handoff links | `StrategyConnection` · same store | localStorage `spark:strategy-connections:v1` |
| Active / pause / resume | `pauseStrategyWorkItem` · `resumeStrategyWorkItem` · resumable lists | localStorage active key |
| Decision Record view | `decisionRecord.ts` · `buildIntelligentDecisionRecord` | **Ephemeral** (recomputed) |
| Confirmation gates | `chosenDirection` · `decisionRecordConfirmed` | On Work Item |
| Options / assumptions / risks / experiments | Work Item arrays + engine generators | Partial persist on Work Item; full objects often ephemeral |
| Synthesis | `StrategySynthesisResult` | **Ephemeral** |
| Contribution return | `applyStrategyContributionReturn` | Appends observation + connection |
| Pending handoff | `pendingHandoffStore.ts` | sessionStorage (consume-once) |
| Domain review triggers | Domain packs / `StrategyTypeContract` | Catalog strings — **not** written to Work Item |

### Memory-worthy fields already on Work Item

`decisionStatement`, `currentReality`, `knownFacts`, `observations`, `assumptions`, `unknowns`, `constraints`, `optionsConsidered`, `tradeoffs`, `risks`, `secondOrderEffects`, `chosenDirection`, `notChosen`, `decisionRationale`, `experiments`, `successSignals`, `guardrails`, `confidenceLevel`, `reviewDate`, `decisionRecordConfirmed`, `memberStatements`, domain ids, status lifecycle.

## What Strategic Memory is not

- Full conversation transcripts  
- Spec 112 companion / profile / preference memory (`lib/sparkCompanionMemory`, `lib/estateMemory`)  
- Task / project execution history  
- Evidence Vault document storage  
- A replacement for the Strategy Work Item  
- A second Decision Record JSON blob  
- Autonomous decisions, routing, or execution  

## Duplication risks

| Risk | Avoid by |
|------|----------|
| Copying full Decision Record / Synthesis into a new table | Store links + concise snapshots with truth status |
| Forking `chosenDirection` truth | Work Item remains source of truth for live work; Memory captures confirmed snapshots |
| Spec 112 Memory Center rows for process | Keep Strategy-owned local memory |
| Replacing `StrategyConnection` | Reuse connections; Memory adds outcome/revision/review continuity |
| Treating remembered text as permanent fact | Every entry carries `truthStatus`, timestamps, confirmation, relevance |

## Gaps Phase 6 must close

1. **Aftermath** — “what happened afterward” is not first-class (only stamped observations)  
2. **Evolution / revision** — no versioned decision lineage across seasons  
3. **Review triggers** — domain catalogs never persisted; only optional `reviewDate`  
4. **Cross-session recall** — resume returns to Work Item, not a decision-journey summary  
5. **Epistemic metadata** — Work Item strings do not distinguish assumed vs confirmed vs outdated  
6. **Cloud** — none today; do not invent cloud sync in this phase  

## Canonical persistence today

| Artifact | Canonical |
|----------|-----------|
| Strategy Work Item | **localStorage** (V1) |
| Connections | **localStorage** |
| Pending handoff | sessionStorage |
| Decision Record / Synthesis | Derived only |
| Supabase Strategy tables | **None** |
| IndexedDB Strategy | **None** |

**Local persistence is canonical for Strategy V1.** Phase 6 should match that pattern (`spark:strategy-decision-memory:v1`).

## Behaviors that stay in Strategy vs elsewhere

| Stay in Strategy | Delegate |
|------------------|----------|
| Decision reasoning continuity | Calendar: schedule review moments |
| Assumptions / trade-offs / risks at decision time | Projects: execute approved path |
| Outcome notes linked to the decision | Evidence Vault: store evidence artifacts |
| Revision when the member reopens the decision | Board / Chamber: consultation — link, don’t own |

## Smallest additive architecture

```
lib/strategyChamber/memory/
  types.ts                 — StrategicDecisionMemory + entry contracts
  strategicMemoryStore.ts  — localStorage V1
  captureDecisionMemory.ts — from confirmed Work Item (reference + snapshot)
  recordOutcome.ts
  reviseDecisionMemory.ts
  continuity.ts            — resume / revisit helpers (member-facing copy)
  index.ts
```

**Rules:**
1. Require `strategyWorkItemId`; never mint a second Work Item.  
2. Capture only after direction + Decision Record confirmation (or explicit member confirm).  
3. Entries keep: recordedAt, type, confidence, truthStatus, userConfirmed, source, relevance.  
4. Recommendation snapshots are never decisions (`isDecision: false`).  
5. Contribution returns may append **outcomes** without overwriting the decision.  
6. Do not start Pattern Recognition, Board historical intelligence, cross-Chamber orchestration, or platform-wide memory.

## Migration risks

- Low: additive store; no Work Item schema break required.  
- Optional later: `strategicMemoryId` pointer on Work Item — defer unless resume UX needs it.  
- Do not migrate chat transcripts into Strategic Memory.

## Tests to preserve

Phases 1–5 under `lib/strategyChamber/intelligence/**` remain green. New Phase 6 tests must not treat remembered assumptions as facts.
