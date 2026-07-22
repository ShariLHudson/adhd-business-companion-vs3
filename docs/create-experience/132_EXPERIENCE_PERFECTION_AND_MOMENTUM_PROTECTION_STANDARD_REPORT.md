# 132 — Experience Perfection and Momentum Protection Standard — Implementation Report

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Constitution:** [`docs/constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md`](../constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md)  
**Cursor rule:** `.cursor/rules/experience-perfection-momentum-protection.mdc`  
**Parents:** Spec 128 · Spec 130 · Spec 131 · Create 127–130

---

## Summary

Landed binding Experience Perfection and Momentum Protection governance (constitution **132**) and wired highest-value runtime hooks: intentional Escape dismiss (Rule 2) and soft leave confirm for Create working sessions (Rule 3).

> **Namespace note:** Create Blueprint track `docs/create-experience/132_product_launch_event/` is a different series. This constitution governs Estate-wide momentum / polish / Ten-Second Rule.

---

## Paths

| Kind | Path |
|------|------|
| Constitution | `docs/constitution/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md` |
| Cursor rule | `.cursor/rules/experience-perfection-momentum-protection.mdc` |
| Types | `lib/sparkMomentumProtection/types.ts` |
| Types test | `lib/sparkMomentumProtection/types.test.ts` |
| Window dismiss | `lib/windowDismiss/dismissPolicy.ts` · `useDismissibleWindow` |
| Create working Escape | `components/companion/CreateEstateWorkingPanel.tsx` |
| This report | `docs/create-experience/132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD_REPORT.md` |

**Pointers:** constitution README · 317 Master Index · AGENTS.md · PRODUCT_CONSTITUTION.md · ESTATE_ARCHITECTURAL_AUTHORITY.md · THE_MEMBER_WINS.md · PARKING_LOT.md

---

## Runtime deltas

1. **Intentional Escape (Rule 2)** — `lib/windowDismiss/` documents Spec 132: Escape / outside dismiss closes layers before unexpected navigation.  
2. **Protect in-progress thinking (Rule 3)** — `CreateEstateWorkingPanel` computes `meaningfulEdit` before `useDismissibleWindow`, then confirms leave with `SPARK_MOMENTUM_SOFT_LEAVE_CONFIRM` when dirty.  
3. **Ten-Second Rule™** — `SPARK_TEN_SECOND_RULE` / `SPARK_TEN_SECOND_RULE_QUESTION` constants (shipWhenFails: false).  
4. **12/10 certification IDs** — six reviewer questions in types.  
5. **Momentum-loss metrics (Rule 11)** — eight metric IDs typed; instrumentation deferred (Parking Lot).

---

## Rules 1–12 status

| # | Rule | Status |
|---|------|--------|
| 1 | Protect Momentum Above Everything | **Documented** — guiding conflict rule |
| 2 | Intentional Navigation | **Wired** — windowDismiss Escape/outside path + Create dirty Escape |
| 3 | Protect In-Progress Thinking | **Wired** — Create soft leave confirm when meaningfulEdit |
| 4 | One Navigation Path | **Documented** — Create path polish continues under 127–130 |
| 5 | Interface Truthfulness | **Documented** — Current Focus / counts remain release checklist |
| 6 | Never Create Hidden Anxiety | **Documented** — cert / review gate |
| 7 | Progressive Disclosure Stays Progressive | **Preserved** — Create More Ways ≤3 layers (131 Rule 7) |
| 8 | Momentum Recovery | **Partial** — soft leave copy; full “Ready to continue?” recovery deferred |
| 9 | Every Interaction Builds Trust | **Documented** — ship checklist |
| 10 | Interface Polish Matters | **Documented** — continuous polish law |
| 11 | Measure Momentum Loss | **Types only** — instrumentation parked |
| 12 | Final 12/10 Certification | **Types + checklist** in constitution |

---

## Ten-Second Rule™

- **Doc section:** Constitution — *Permanent release gate — The Ten-Second Rule™*  
- **Types:** `SPARK_TEN_SECOND_RULE` · `SPARK_TEN_SECOND_RULE_QUESTION` in `lib/sparkMomentumProtection/types.ts`

---

## Tests

```text
npx vitest run lib/sparkMomentumProtection/types.test.ts lib/windowDismiss/windowDismiss.test.ts
```

---

## Constraints honored

- Spec 128 wins on architecture exposure / ADHD certification  
- Spec 130 One Creation Rule preserved  
- Spec 131 Create intent law unchanged  
- No large `CompanionPageClient` edits  
- Narrow path staging only (no `git add .`)  
- Momentum Loss Metrics instrumentation deferred (Parking Lot only)
