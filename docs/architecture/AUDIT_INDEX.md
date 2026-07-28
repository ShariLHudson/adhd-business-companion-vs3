# Audit Index — Source Documents for the Master Synthesis

Supporting index for [MASTER_AUDIT_SYNTHESIS.md](MASTER_AUDIT_SYNTHESIS.md),
[MASTER_AUDIT_FINDINGS_MATRIX.md](MASTER_AUDIT_FINDINGS_MATRIX.md), and
[ARCHITECTURE_STABILIZATION_ROADMAP.md](ARCHITECTURE_STABILIZATION_ROADMAP.md).

**Synthesis date:** 2026-07-27. **Method:** documentation-only. No new audit was performed;
this catalogs the existing audit artifacts that the synthesis consolidates. Each source was
produced at its own baseline — findings are true *as audited*, not asserted as currently live.

| Key | Document | Type | Date | Baseline / branch | Scope |
|-----|----------|------|------|-------------------|-------|
| REPO | `000_MASTER_REPOSITORY_AUDIT.md` | Inventory audit | — | `9dc09da` | Filesystem/library inventory, numbering & duplication integrity |
| ARCH | `docs/ARCHITECTURE_AUDIT.md` | Readiness audit | 2026-06-25 | `safety/clear-my-mind-working` (~191 paths) | Build/lint/test gates; monolith & parallel-stack debt; **verdict: do not commit** |
| VIS | `002_VISIBLE_EXPERIENCE_IMPLEMENTATION_AUDIT.md` | Feature-wiring audit | 2026-07-11 | `deploy/companion-app-v3` @ `17c6e8a` | 12 visible experiences: documented / partial / not-routed / broken |
| CQ | `docs/CONVERSATION_QUALITY_AUDIT_NOTE.md` | Root-cause audit | — | unversioned | Two conversation-quality failures traced to routing/state roots |
| CR | `docs/CONVERSATION_REGRESSION_AUDIT.md` | Regression audit | 2026-07-05 | `main` @ `964e77a` | 10 conversation regressions → 5 architectural fractures |
| P3 | `PHASE3_AUDIT.md` | Ownership audit | — | `deploy/companion-app-v3` @ `2144d535` | 21 findings (F1–F21) → ~9 fixes; ownership-spine thesis |
| ARB | `docs/ARBITRATION_DOUBLE_PASS_ARCHITECTURE_NOTE.md` | Architecture note | — | — | Double-pass arbitration smell (tracked, deferred) |
| CREATE | `HANDOFF_CREATE_STABILIZATION.md` | Handoff + ledger | — | `deploy/companion-app-v3` | Create defect ledger D1–D5, D2′ |
| D3 | `docs/create/D3_PENDING_SLOT_BINDING_CONTRACT.md` | Design contract | 2026-07-27 | `deploy/companion-app-v3` | D3 pending-slot binding; **fixed Phase 1** |
| EKR | `docs/ESTATE_KNOWLEDGE_REGISTRY_AUDIT.md` | Knowledge audit | 2026-07-05 | — | 75-place registry vs 5 disconnected knowledge layers |
| ECR | `docs/ESTATE_CLEANUP_ROADMAP.md` | Roadmap | v1.0 | V4 | Simplification-only, 5 gated phases |
| PROF | `043_PROFILE_REPOSITORY_AUDIT_REPORT.md` | Repository audit | 2026-07-11 | — | Profile center / My Business Estate (**largely superseded by BE**) |
| BE | `058A_MY_BUSINESS_ESTATE_LIVE_PATH_AUDIT.md` | Live-path audit | 2026-07-11 | `8fb488f` | My Business Estate now built; submenu bug fixed; sign-off pending |

## D3 remediation series (landed on `deploy/companion-app-v3`)

| Commit | Summary |
|--------|---------|
| `c1f7a28c` | opt-in `{ supplementOnly, protectSlotId }` merge (infra) |
| `669fc22c` | remove recipient keyword fabrication |
| `25649de5` | authoritative pending-slot routing |
| `aaa40220` | draft path obeys supplement-only |

Deployed & verified on preview `73hkl0ln6` (= `aaa40220`) on 2026-07-27.

## Provenance & staleness

Baselines differ across sources (`main`, `deploy/companion-app-v3`, `safety/clear-my-mind-working`)
and span 2026-06-25 → 2026-07-27. Consequences the synthesis honors:

- **ARCH** ran on a different branch a month before this synthesis; its build/TS/lint counts are
  point-in-time and must be **re-verified** on the current deploy branch, not assumed live.
- **PROF (043)** is **largely superseded by BE (058A)**, which reports My Business Estate as built.
- **CQ / CR / P3** target different code states; their overlapping findings are *corroborating
  observations across baselines*, not necessarily the same live lines today.
- **D3** is the one finding here with a verified current fix.
