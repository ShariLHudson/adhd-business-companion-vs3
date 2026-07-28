# Master Audit Findings Matrix

**Date:** 2026-07-27 · Companion to [MASTER_AUDIT_SYNTHESIS.md](MASTER_AUDIT_SYNTHESIS.md) ·
Sources & keys in [AUDIT_INDEX.md](AUDIT_INDEX.md).

Consolidated, **deduplicated** findings across all platform audits, grouped by theme cluster
(T1–T10 from the synthesis). Convergent findings from multiple audits are merged into one row citing
all sources.

**Legend** — Severity: C=Critical, H=High, M=Medium, L=Low; "(i)" = inferred (source stated no
level). Status: OPEN · FIXED · PARKED · SUPERSEDED · DECISION (product decision pending) ·
VERIFY (as-audited on an older baseline; re-verify before acting).

---

## T1 — Single authority not consulted (ownership / registry bypass)

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-01 | Free-form assistant offer arms no owner; confirming "yes" is unowned and claimed by first matcher | C | ownership spine | P3 F1/F19, CR-4 | OPEN |
| MA-02 | Navigation decided without consulting spine ownership (can auto-open a room while awaiting yes/no) | H | frictionlessActionLayer | P3 F4 | OPEN |
| MA-03 | ≥4 navigation routers run in parallel; winner decided by flag/chain order; contract lint-only | H | estate routing | P3 F5/F16, ECR P1–2 | OPEN |
| MA-04 | Ownership turn-gate opens too late (~15 fast-path handlers act before it) | H | ownership gate | P3 F6 | OPEN |
| MA-05 | "Awaiting answer" tracked in ≥5 independent places; spine not the read authority | H | awaiting-state | P3 F8, CR-4/-5/-6 | OPEN |
| MA-06 | No unified continuation owner across pendingChoice / frictionlessPending / universalCreationSession | H | pending-action | CR fracture 3 (R4–R7) | OPEN |
| MA-07 | Canonical 75-place registry bypassed by hard-coded 3-room fallback arrays | H | estate knowledge | EKR #1/#2, CR-1/-2 | OPEN |
| MA-08 | Estate Brain models only 12/75 spaces; ~63 places unreachable in chat | H | estate brain | EKR #3 | OPEN |
| MA-09 | Business identity fragmented across 5+ stores with no sync authority | H | profile data | PROF #7, VIS §6 | OPEN |
| MA-10 | **Create pending question did not own the answer; keyword harvest displaced it** | H | universalCreation | D3, CREATE (D3) | **FIXED (P1)** |

## T2 — Keyword/regex recognition without a semantic layer

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-11 | Acceptance vocabulary fragmented across ≥4 regexes ("go/continue/that one" fall through) | H | acceptance regexes | P3 F7 | OPEN |
| MA-12 | 7 topic-change detectors + 9 emotional classifiers, no shared authority → conflicting verdicts | M | classifiers | P3 F18 | OPEN |
| MA-13 | Over-broad Create/Decision matchers claim ordinary lists / "should I…" phrasing | H(i) | classification | CQ Q1/Q2/Q4 | OPEN |
| MA-14 | Sentence ordinals parsed as menu picks ("only three places" → navigates to item 3) | M(i) | pendingChoice parser | CR-5/-10 | OPEN |
| MA-15 | Business-keyword heuristic fabricated an email recipient ("client" → "Client") | H(i) | discoveryContextHarvest | D3 | **FIXED (P1)** |

## T3 — Stale state survives a pivot

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-16 | Active topic not cleared on non-explicit pivot; fallback replays stored topic, ignores current msg | H(i) | activeTopicGate / coachingFallback | CQ Q5–Q8, P3 F10/F17 | OPEN |
| MA-17 | Clarification ("what does that mean?") silently kills a pending offer (word-overlap gate) | H | pendingAcceptanceAuthority | P3 F11 | OPEN |
| MA-18 | Stale offer resurrected by later "yes" (turn-count / lexical expiry, not topic) | M-H | pendingAcceptanceAuthority | P3 F14 | OPEN |

## T4 — Emotional wording pre-empts practical intent

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-19 | "Overwhelmed"/"stressed" fires relief/environment menu and nulls the explicit practical ask | H | stressRouting / primaryTurnClassifier | P3 F9, CR-9 | OPEN (live-corroborated 2026-07-27) |

## T5 — Monolith orchestrator + parallel routers

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-20 | `CompanionPageClient.tsx` monolith (~15k–22k lines, 100+ branches) deoptimizes build/HMR, blocks review | H | orchestrator | ARCH, ECR, PROF | VERIFY |
| MA-21 | Parallel/duplicate orchestrators & intelligence stacks drift (brain vs universe; 4 presence layers) | H | composition | ARCH | VERIFY |
| MA-22 | `companionStore.ts` god-store (~2,557 lines) as future bottleneck | M | persistence | ARCH | VERIFY |

## T6 — Built-but-not-wired code / dead paths

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-23 | Daily-three suggestion engine exists but is never imported/rendered (largest daily gap) | H(i) | daily engagement | VIS §3 | OPEN |
| MA-24 | Welcome-Home post-intro three-choice fork is dead (`complete…()` never called; invitations unmounted) | M(i) | welcome home | VIS §2 | OPEN |
| MA-25 | Context-preserving recovery branches dead behind `BRIDGE_RESPONDER_DISABLED` | H | coachingFallback | P3 F10 | OPEN |
| MA-26 | Dead chamber-lock helper; 10 dead prompt fields; dormant per-domain engines | M/L | prompt/legacy | P3 F15/F20, ARCH | OPEN |
| MA-27 | 173 ingested intelligence docs not loaded at runtime (documentation-only) | M(i) | intelligence wiring | VIS | OPEN |

## T7 — Registry / asset / label truthfulness

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-28 | Three incompatible "live" definitions (`status==="live"` 9 · `isLiveEstatePlace` ~44 · unfiltered wander) | H(i) | live filter | EKR #4/#10, CR fracture 4 | OPEN |
| MA-29 | Wander offers `planned` places navigation blocks (Conservatory/Porch Swing/Possibility House) | H(i) | routing | EKR #10, CR-3/-9 | DECISION |
| MA-30 | Butterfly Conservatory: `planned` yet offered; background/media mismatch; no brain space | C | assets/routing | EKR #5 | OPEN |
| MA-31 | `LIBRARY_ENTRY` id `library` named **Momentum Institute™** → wrong-room routing | M(i) | registry | ECR P1–2 | OPEN |
| MA-32 | Approved ™ names (My Business Estate / People I Help) absent or mismatched in UI | M | naming | VIS §6/§7, PROF #5 | PARTIAL/SUPERSEDED |
| MA-33 | Asset map drift: missing `.webp`s, typo paths, wrong-plate art (Library shows Institute) | L-M | assets | ECR P4, EKR #11 | OPEN |

## T8 — Build / deploy / runtime health

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-34 | **Login session-persistence failure** locks out valid users when storage can't persist token in 5s | C | auth | VIS §12 | OPEN (fix local, undeployed) |
| MA-35 | Production build FAILS; 28 TS errors; two runtime-crash imports | C | build | ARCH | VERIFY |
| MA-36 | 762 ESLint problems (343 err / 419 warn), mostly React-Compiler/hooks in the monolith | H | lint | ARCH | VERIFY |
| MA-37 | 22 test failures in 18 files, clustered in **core companion behavior**; `companionBehaviorAudit` regressed | C/H | tests/governance | ARCH | VERIFY |
| MA-38 | Production branch lags deploy branch by weeks of shipped work | H | deployment | VIS | VERIFY |

## T9 — Double-pass / duplicate computation

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-39 | `arbitrateConversationRouting` computed twice per turn (decision copy vs destination copy) | L (risk) | conversation routing | ARB, CQ Q9 | DEFERRED |

## T10 — Library completeness & canon duplication

| ID | Finding | Sev | Subsystem | Source | Status |
|----|---------|-----|-----------|--------|--------|
| MA-40 | Architecturally-referenced intelligence libraries HEI / CAP / EXEC exist only as concepts | H(i) | intelligence architecture | REPO §8 | OPEN |
| MA-41 | Canon duplicated/split across parallel libraries (therapy-dog CONV-012/ADHD-028; CONSTITUTION motifs) | M(i) | canon | REPO §6 | OPEN |
| MA-42 | Library numbering gaps & one duplicate number (Recognition 140; CONV seeds missing) | M-L(i) | doc integrity | REPO §5 | OPEN |

---

## Create defect ledger (tracked separately — do not batch)

| ID | Defect | Sev | Status |
|----|--------|-----|--------|
| D1 | Duplicated / raw-echo subject options in `draftComposer.ts` | M(i) | OPEN (separate) |
| D2 | Stale "tax documents" subject | — | CLOSED (test artifact) |
| D2′ | Account/server Create-history bleed into a new draft | — | PARKED (needs account audit) |
| D3 | Recipient fabrication + answer reroute + premature draft | H(i) | **FIXED (Phase 1)** |
| D4 | Trailing concatenation in presentation copy | L | OPEN (low) |
| D5 | Draft appears after a single answer (skips remaining discovery) | — | DECISION (may be intended) |

## Counts (as consolidated, not weighted by staleness)

- Critical: 5 (MA-30, MA-34, MA-35, MA-37, plus P3 F1/MA-01 user-facing) · **1 fixed** (D3 line).
- High: ~17 · Medium: ~13 · Low/risk: ~5.
- Fixed/verified: **D3 series** (MA-10, MA-15). Superseded: My Business Estate "not implemented" (043 → 058A).
- Requires re-verification (older baseline): MA-20/21/22, MA-35/36/37/38.
