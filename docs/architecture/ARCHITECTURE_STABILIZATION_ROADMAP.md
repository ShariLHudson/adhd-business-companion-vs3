# Architecture Stabilization Roadmap

**Date:** 2026-07-27 · Companion to [MASTER_AUDIT_SYNTHESIS.md](MASTER_AUDIT_SYNTHESIS.md) and
[MASTER_AUDIT_FINDINGS_MATRIX.md](MASTER_AUDIT_FINDINGS_MATRIX.md) (finding IDs `MA-##` below).

A sequenced, **gated** remediation plan synthesizing the fix orders proposed by the individual audits
(P3 R-A…R-J; CR fix order; EKR phases; ECR phases 1–5; VIS phase plan). It plans **no new features**
and prescribes no code here — it orders work already recommended by the sources. Each phase completes
and is verified before the next begins.

## Governing invariants (from every source audit)

1. **Report root cause before code.** No implementation without an approved root-cause note.
2. **One authority owns; everything else supplements.** The D3 contract, generalized (see §D3).
3. **No batching unrelated fixes.** One defect class per change; D1/D3/D5 stay separate.
4. **Subtract before adding.** Migration-freeze / simplification-only posture (ECR).
5. **No code-only "done."** Green tests or a preview walkthrough is the completion gate.
6. **No business-keyword heuristics** as an ownership or routing mechanism.

## The D3 template (already shipped) {#D3}

D3 (commits `c1f7a28c → aaa40220`, verified on preview `73hkl0ln6`) is the pilot for invariant #2 and
the shape every later phase reuses:

> declared authority writes first → others supplement empty slots only → recognition decides *what
> next*, never *who owns* → no keyword heuristics.

Phase 2 of D3 (explicit `pendingQuestionId`) remains **deferred** and is folded into Phase 4 below.

---

## Phase 0 — Re-verify the criticals (blocks everything)

**Goal:** establish current truth before acting on month-old findings. **Findings:** MA-34, MA-35,
MA-36, MA-37, MA-38.

- Re-run build / typecheck / lint / test on the **current** `deploy/companion-app-v3` (ARCH ran on a
  different branch on 2026-06-25 — do not assume its counts are live).
- Confirm the **login session-persistence** fix (MA-34) state: is it committed and deployed? It gates
  all user access.
- Confirm production-branch currency (MA-38).

**Exit:** a one-page current-state readout: build green? login fix deployed? which ARCH findings still
reproduce? **Risk:** low (diagnostic only). Nothing downstream starts until this readout exists.

## Phase 1 — Conversation ownership spine as the single authority

**Goal:** make the ownership spine the authority that navigation, recommendation, and acceptance all
consult. This is the meta-defect's core (synthesis §1). **Findings:** MA-01, MA-02, MA-04, MA-05,
MA-11 (P3 R-A/R-B/R-C).

- First-class `pendingAssistantQuestion`: a free-form assistant question that ends in "?" arms an
  owner so the next "yes" is owned (MA-01).
- Move the ownership turn-gate to the top of `handleSend` so fast-path handlers can't pre-empt it (MA-04).
- Make the spine's `expectedReply` the single read-authority for "awaiting answer"; collapse the ≥5
  trackers (MA-05).
- Unify acceptance vocabulary on one constant (MA-11).

**Exit:** "assistant asks → user says yes → same owner continues" holds in integration tests; no
handler acts before the gate. **Risk:** medium-high (hot path) — land as small guarded commits, D3-style.

## Phase 2 — Low-risk turn-safety guards

**Goal:** ship the high-impact, low-risk guards the audits rank first. **Findings:** MA-17, MA-19,
MA-14, MA-16 (CR fix order; P3 F9/F11).

- Clarification must not kill a pending offer: `if (isClarificationRequest(t)) return false` (MA-17).
- Emotional-word routing returns false when the same message carries an explicit practical ask (MA-19,
  the T4 behavior corroborated live 2026-07-27).
- Ordinals only count when the message is menu-selection-shaped (MA-14).
- Tear down stale topic/thread on a real pivot; fallbacks read the current message (MA-16).

**Exit:** the CQ/CR transcripts stop reproducing; regression tests added. **Risk:** low.

## Phase 3 — Estate knowledge from one registry

**Goal:** chat/menus render from the canonical 75-place registry, not parallel arrays. **Findings:**
MA-07, MA-08, MA-28, MA-29, MA-30, MA-31 (EKR phases; ECR phases 1–2, 4).

- Compile-time `estateKnowledgeRegistry` view; retire hard-coded 3-room pools via `pickRegistryPlaceIds`
  / `queryPlaces` (MA-07).
- One `live` policy; wander stops offering places navigation blocks (MA-28, MA-29 — needs a product
  decision on which `planned`+asset places go live).
- Split `library` vs `momentum-institute`; single `goToPlace(roomId)` entry; asset resolver + wrong-plate
  fixes (MA-31, MA-30, MA-33).

**Exit:** every roomId reachable only via `goToPlace`; menus enumerate the registry; zero "offered but
blocked" places. **Risk:** medium; product decision gates MA-29.

## Phase 4 — Model hardening & de-duplication

**Goal:** remove the structural sources of drift once behavior is proven. **Findings:** MA-03, MA-12,
MA-20, MA-21, MA-22, MA-39, and **D3 Phase 2**.

- One `classifyTurn()` authority; retire the 7+9 parallel classifiers (MA-12).
- Collapse competing routers to delegation/null (MA-03); document the ~40-stage precedence with
  invariant tests (MA-03).
- Compute arbitration once and thread it (MA-39).
- Introduce explicit `pendingQuestionId` in Create; drop the implicit `questionIndex` assumption
  (**D3 Phase 2**).
- Begin extracting the monolith (`useCompanionTurnPipeline`, panel registry) and slicing the god-store
  (MA-20, MA-22) — **only after** Phase 0 confirms these still reproduce.

**Exit:** one classifier, one router entry, one arbitration pass; monolith measurably smaller. **Risk:**
high — largest surface; strictly gated behind Phases 0–3 and their green suites.

## Phase 5 — Wire the built-but-dark experiences

**Goal:** activate code that already exists but isn't reachable (no new features). **Findings:** MA-23,
MA-24, MA-25, MA-27, plus VIS quick wins (Discovery Key asset, chamber deep link).

- Render the daily-three engine (MA-23); wire the Welcome-Home fork (MA-24); revive context-preserving
  recovery (MA-25).
- Wire relevant ingested intelligence rather than leaving it documentation-only (MA-27).

**Exit:** each experience reachable and covered by a walkthrough. **Risk:** low-medium.

## Phase 6 — Canon & library hygiene (parallelizable, non-runtime)

**Goal:** doc-layer integrity. **Findings:** MA-40, MA-41, MA-42, MA-32 (naming truthfulness), plus the
Create ledger tail (D1, D4; D5 as a product decision).

- Resolve the missing HEI/CAP/EXEC libraries (concept vs library) (MA-40); de-duplicate split canon
  (MA-41); fix numbering (MA-42); align UI labels to approved ™ names (MA-32).
- Address D1 (duplicate subject options) and D4 as isolated Create fixes; take the D5 draft-timing
  product decision explicitly. **Do not batch these with each other or with D3.**

**Exit:** canon single-sourced; ledger items each closed or decided on their own. **Risk:** low.

---

## Sequencing rationale

Phase 0 exists because the heaviest findings (build, login, monolith) come from an older baseline and
must be re-confirmed, not assumed. After that, the order runs **guards before surgery**: cheap
turn-safety guards (Phase 2) and the ownership spine (Phase 1) land before the structural collapses
(Phase 4), exactly as P3, CQ, and CR each recommend independently. Estate (Phase 3) is separable and
can run in parallel with Phases 1–2 by a different owner. D3 is the proof that this order works: one
authority, supplements only, verified before "done."

## Out of scope for this roadmap

New rooms/features, the wisdom/prompt-persona layer, UI redesign, and any Supabase-write changes not
already recommended by a source audit. This document orders **existing** recommendations; it does not
originate product scope.
