# Master Audit Synthesis — Platform-Wide Architecture

**Date:** 2026-07-27 · **Type:** documentation-only synthesis · **Sources:** see [AUDIT_INDEX.md](AUDIT_INDEX.md)

This document consolidates the platform's existing audits (repository, architecture-readiness,
visible-experience, conversation-quality, conversation-regression, Phase-3 ownership, arbitration,
the Create/D3 ledger, estate-knowledge, estate-cleanup, profile, and business-estate) into one
picture. It performs **no new audit** and changes **no code**. Every claim traces to a source in the
index; where sources disagree or may be stale, that is called out rather than smoothed over.

Companion artifacts: the deduplicated table is in
[MASTER_AUDIT_FINDINGS_MATRIX.md](MASTER_AUDIT_FINDINGS_MATRIX.md); the sequenced remediation is in
[ARCHITECTURE_STABILIZATION_ROADMAP.md](ARCHITECTURE_STABILIZATION_ROADMAP.md).

---

## 1. The one finding under all the findings

Across otherwise unrelated audits, the same shape recurs:

> **A correct single authority exists, but nothing downstream is required to consult it.**

- **Conversation ownership** — a well-built ownership/Boundary spine exists, yet navigation routers,
  the recommendation stack, the rhythm loop, acceptance matchers, and the LLM prompt each decide
  independently (P3 root-cause R-A; F1, F3, F4, F6, F8; CQ "conflations").
- **Estate knowledge** — one canonical **75-place registry** exists, but chat FAQ and menus are
  assembled from hard-coded 3-room arrays and a 12-space brain slice; ~63 places are unreachable in
  conversation (EKR #1–#4; CR fracture 1).
- **Navigation** — ≥4 routers race, resolved by flag order or chain position, with the "one owner"
  contract enforced only by lint (P3 F5, F16; ECR Phase 1–2).
- **Business identity** — profile data is fragmented across 5+ stores with no sync authority
  (PROF #7; VIS §6).
- **Create discovery** — the pending question did not own the user's answer; content-keyword harvest
  displaced it (D3).

These are not five bugs; they are five faces of one meta-defect. That reframing is the synthesis's
central claim and the organizing principle of the roadmap.

## 2. D3 is the proof-of-pattern — and the template

The Create/D3 defect is the smallest, fully-closed instance of the meta-defect: the pending slot did
not own the answer, so a keyword heuristic fabricated the value. The fix that shipped this week
(commits `c1f7a28c → aaa40220`, verified on preview `73hkl0ln6`) establishes a reusable contract:

1. **The declared authority writes first** (pending slot bound authoritatively before enrichment).
2. **Everything else supplements, never overrides** (harvest fills only empty, non-owned slots).
3. **Recognition is used to decide *what next*, never to decide *ownership*** (the gap engine chooses
   the next question; it no longer routes the answer).
4. **No business-keyword heuristics** as an ownership mechanism.

The same four rules generalize directly to conversation ownership (spine writes first; injectors
supplement; classifiers inform, never claim the turn) and to estate knowledge (registry is authority;
menus render from it, never from parallel arrays). **D3 should be treated as the pattern's pilot, not
a one-off.**

## 3. Recurring themes

| # | Theme | Where it appears |
|---|-------|------------------|
| T1 | Single authority not consulted (ownership / registry bypass) | P3 R-A/R-D, EKR, CR-1, PROF-7, ARCH (parallel stacks), D3 |
| T2 | Keyword/regex recognition with no semantic layer | CQ (named explicitly), P3 F7/F18, CR-5/-10, D3 (banned heuristics) |
| T3 | Stale state survives a pivot | CQ Q5–Q8, P3 F11/F14/F17 |
| T4 | Emotional wording pre-empts practical intent | P3 F9, CR-9 — **corroborated live** (see §5) |
| T5 | Monolith orchestrator + parallel routers | ARCH (`CompanionPageClient` ~15k), ECR (~18k), PROF (~22k), CR, P3 F5/F16 |
| T6 | Built-but-not-wired code / dead paths | VIS (daily-three, welcome fork, ProfilePanel), P3 F10/F15/F20, ARCH |
| T7 | Registry / asset / label truthfulness | EKR (live-status, media), ECR (Library≠Institute), VIS/PROF (™ names) |
| T8 | Build / deploy / runtime health | ARCH (build fails, 762 lint, 22 test fails), VIS (login persistence **Critical**, prod lag) |
| T9 | Double-pass / duplicate computation | ARB (arbitration ×2), CQ Q9 |
| T10 | Library completeness & canon duplication | REPO (missing HEI/CAP/EXEC libraries, split motifs) |

## 4. Severity landscape (as audited — verify before acting)

**Critical, and blocking if still live:**

- **Login session-persistence failure** — valid credentials can be locked out when `localStorage`
  can't persist the auth token within 5s; fix reported as *local, uncommitted, not deployed* (VIS §12).
  This gates everything and should be re-verified first.
- **Production build fails / 28 TS errors / constitutional `companionBehaviorAudit` regression**
  (ARCH) — **but** audited 2026-06-25 on `safety/clear-my-mind-working`; must be re-checked on the
  current deploy branch before treated as live.
- **Free-form assistant offer arms no owner; "yes" is unowned** (P3 F1/F19) — the single biggest
  user-facing conversation hole.
- **Butterfly Conservatory media/status disconnect** (EKR §3.2, doc's own "critical").

**Resolved / superseded (do not re-litigate):**

- **My Business Estate "not implemented"** (PROF 043) is **superseded by BE (058A)**: built,
  submenu bug fixed; only founder preview sign-off remains.
- **D3** recipient fabrication + reroute: **fixed (Phase 1)**, verified on preview.

## 5. A firsthand corroboration

During the D3 deployed-preview verification (2026-07-27), answering the email-recipient question with
*"…and honestly I just need them to know I'm overwhelmed"* caused the Boundary to **park Create** and
return an emotional-support reply. That is exactly theme **T4** (P3 F9 / CR-9): a feeling word
pre-empts an explicit practical ask. It is intended safety behavior today, but it confirms the
audits' observation is live on `deploy/companion-app-v3`, not merely historical.

## 6. Governance posture the audits share

Every source is audit-first or contract-first and converges on the same rules, which the roadmap
adopts as invariants: **report root cause before code; do not batch unrelated fixes; preserve
existing safeguards; subtract/consolidate before adding (migration freeze); and no code-only "done" —
verification (tests or preview walkthrough) is required.** D3 followed exactly this discipline and is
the worked example.

## 7. Confidence & limits of this synthesis

- This is a synthesis of **documents**, not a fresh code audit. Findings inherit their sources'
  baselines and staleness (see [AUDIT_INDEX.md](AUDIT_INDEX.md) → Provenance).
- Severities without a source-stated level are marked "(inferred)" in the matrix.
- Overlapping findings across CQ/CR/P3 are corroborating across baselines, not proof of the same live
  lines. Re-verification on the current deploy branch is Phase 0 of the roadmap.
- Only **D3** carries a verified current-state fix.
