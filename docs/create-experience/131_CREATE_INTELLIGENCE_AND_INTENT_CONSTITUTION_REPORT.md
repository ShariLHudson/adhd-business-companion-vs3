# 131 — Create Intelligence & Intent Constitution — Implementation Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Constitution:** [`docs/constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md`](../constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md)  
**Cursor rule:** `.cursor/rules/create-intelligence-intent-constitution.mdc`  
**Parents:** Create 127–130 · Spec 128

---

## Summary

Landed binding Create intent governance (like Spec 128) and wired highest-value runtime hooks that preserve **130 confirm-everywhere**.

---

## Paths

| Kind | Path |
|------|------|
| Constitution | `docs/constitution/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md` |
| Cursor rule | `.cursor/rules/create-intelligence-intent-constitution.mdc` |
| Types | `lib/sparkCreateIntentConstitution/types.ts` |
| Types test | `lib/sparkCreateIntentConstitution/types.test.ts` |
| Intent helpers | `lib/createEstate/createIntentConfirmation.ts` |
| Begin resolver | `lib/createEstate/resolveCreateBeginOutcome.ts` |
| Entrance UI | `components/companion/CreateEstateEntrancePanel.tsx` |
| Catalog | `lib/createCatalogData.ts` (Flyer) |
| Runtime test | `lib/createEstate/createIntent131.test.ts` |
| This report | `docs/create-experience/131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION_REPORT.md` |

**Pointers:** constitution README · 317 Master Index · AGENTS.md · PRODUCT_CONSTITUTION.md · ESTATE_ARCHITECTURAL_AUTHORITY.md · THE_MEMBER_WINS.md · PARKING_LOT.md

---

## Runtime deltas

1. **Intent before artifact** — `detectPromotionalDeliverableIntent` runs before catalog / prompt detect; “flyer/brochure for workshop” → Flyer (not Workshop / Event Plan).  
2. **Smart alternatives (Rule 2)** — medium confidence confirm includes `alsoConsidered` + message “I think you meant… I also considered…”.  
3. **Never rewrite (Rule 3)** — `switchCreateBeginConfirmType` keeps original text; UI chips switch most-likely.  
4. **Continue Working empty (Rule 11)** — section omitted when no active workspaces.  
5. **More Ways calm (Rule 7)** — Personal/Company templates nested under progressive `<details>`; `data-max-decision-layers={3}`.  
6. **130 preserved** — Begin still returns `confirm` only; Work opens only after explicit Create {Type}.

---

## Rules 1–15 status

| # | Rule | Status |
|---|------|--------|
| 1 | Intent Before Artifact | **Wired** — promotional deliverable heuristic |
| 2 | Offer Smart Alternatives | **Wired** — medium `alsoConsidered` + UI |
| 3 | Never Make Users Rewrite | **Wired** — switch confirm type |
| 4 | Intent Categories First | **Types** — category IDs; full routing taxonomy deferred |
| 5 | Recognize Relationships | **Partial** — also-considered surfaces supporting vs event; full graph deferred |
| 6 | Suggest Before Asking Again | **Wired** — alternatives message |
| 7 | More Ways ≤3 layers | **Wired** — templates progressive; cap constant |
| 8 | One Search, Many Results | **Preserved** — NL Begin primary |
| 9 | Context Beats Catalogs | **Preserved** — 129 suggestion context unchanged |
| 10 | Navigation Confirms Location | **Preserved** — human titles / Current Focus (130) |
| 11 | Empty States Match Reality | **Wired** — Continue Working hidden when empty |
| 12 | Confidence Drives Behavior | **Wired** — high / medium(+alts) / low clarify |
| 13 | Learn From Corrections | **Hooks only** — switch path ready; no durable store |
| 14 | Measure First-Attempt Success | **Documented** — metric ownership deferred |
| 15 | Certification Gates | **Types + checklist** in constitution |

---

## Intent Memory™ — deferred

**Status:** Future capability (constitution § Future + Parking Lot).

- No new per-member Intent Memory store in this release.  
- V1 keeps correction-ready confirm UI and confidence/also-considered hooks.  
- Full pattern learning requires Spec 112 permission + durable storage design.  
- Light personalization was **not** added — no existing Create intent preference storage found.

---

## Tests

```text
npx vitest run lib/sparkCreateIntentConstitution/types.test.ts lib/createEstate/createIntent131.test.ts lib/createEstate/resolveCreateBeginOutcome.test.ts lib/createEstate/createPolish130.test.ts
```

---

## Constraints honored

- No silent Work creation (130)  
- Spec 128 wins on architecture exposure  
- No large `CompanionPageClient` edits  
- Narrow path staging only (no `git add .`)
