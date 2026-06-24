# Relationship Phases — Canonical Reference

This folder is the **permanent documentation** for the ADHD Business Ecosystem™ **Companion Relationship Phase** roadmap (Phases 1–11).

**Governing document:** [`RELATIONSHIP-PHASE-CONSTITUTION.md`](./RELATIONSHIP-PHASE-CONSTITUTION.md) — relationship architecture, progression law, activation rules, and system separation.

**Authority hierarchy:** `21_Companion_Constitution.md` (product behavior) → `RELATIONSHIP-PHASE-CONSTITUTION.md` (phase architecture) → this README → phase files → `lib/companionRelationshipPhases.ts`.

**Registry:** `lib/companionRelationshipPhases.ts`  
**Resolver:** `getCurrentRelationshipPhase()` in the same file.

---

## Two phase systems — must remain separate

The codebase contains **two independent phase numbering systems**. They must not be merged, renumbered, or conflated in planning or implementation.

| System | Scope | Registry | Phases |
|--------|-------|----------|--------|
| **Companion Relationship Phases** | User-facing companion relationship evolution | `lib/companionRelationshipPhases.ts` | 1–11 |
| **Founder Ecosystem Phases** | Event-sourced founder backend, dashboards, automation | `lib/ecosystem/index.ts` (comments) | 1–19 (Phase 18 not found) |

### Why they must stay separate

1. **Different audiences** — Relationship phases govern how Shari evolves with a user over months/years. Founder Ecosystem phases govern backend intelligence, dashboards, actions, and founder-only tooling.
2. **Colliding numbers** — Founder Ecosystem Phase 10 = Stage-Aware Recommendations. Relationship Phase 10 = Legacy & Transformation Intelligence™. Same number, different meaning.
3. **Different activation models** — Relationship phases use localStorage state + conversation signals. Founder Ecosystem phases use event streams, materialized views, and namespaced exports.
4. **Documented fragmentation** — `docs-companion-intelligence/23_Adaptive_Companion_Architecture.md` describes three intelligence stacks (companion profile, vertical hub, founder ecosystem) that are intentionally modular today.

### Which files belong to which roadmap

#### Companion Relationship Phases (this folder)

| Phase | Primary module | Tests |
|-------|----------------|-------|
| 1 | `lib/phase1Onboarding.ts` | `lib/phase1Onboarding.test.ts` |
| 2 | `lib/phase2ProgressiveDiscovery.ts` | `lib/phase2ProgressiveDiscovery.test.ts` |
| 3 | `lib/phase3AdaptiveRelationship.ts` | `lib/phase3AdaptiveRelationship.test.ts` |
| 4 | `lib/phase4BusinessOperatingPartner.ts` | `lib/phase4BusinessOperatingPartner.test.ts` |
| 5 | `lib/phase5CompanionIntelligenceEcosystem.ts` | `lib/phase5CompanionIntelligenceEcosystem.test.ts` |
| 6 | `lib/phase6CompanionIntelligenceNetwork.ts` | `lib/phase6CompanionIntelligenceNetwork.test.ts` |
| 7 | `lib/businessIntelligenceEcosystem.ts` | `lib/BusinessIntelligenceValidation.test.ts` |
| 8 | `lib/autonomousPreparation.ts` | `lib/AutonomousPreparationValidation.test.ts` |
| 9 | `lib/wisdomIntelligence.ts` | `lib/WisdomIntelligenceValidation.test.ts` |
| 10 | `lib/transformationIntelligence.ts` | `lib/TransformationIntelligenceValidation.test.ts` |
| 11 | `lib/ecosystemIntelligence.ts` | `lib/EcosystemIntelligenceValidation.test.ts` |

**Cross-cutting:** `lib/companionRelationshipPhases.test.ts` validates phase resolution.

**UI integration:** `app/companion/CompanionPageClient.tsx` (chat hints), `components/companion/GettingToKnowYouPanel.tsx` (panel sections).

#### Founder Ecosystem Phases (not documented in this folder)

| Location | Purpose |
|----------|---------|
| `lib/ecosystem/` | Phases 1–19 backend modules |
| `lib/ecosystem/README.md` | Phase 1 event engine overview |
| `lib/founderIntelligence.ts` | Founder Intelligence™ dashboard (companion-adjacent) |
| `components/founder/`, `components/companion/FounderCommandCenter.tsx` | Partial UI for FE phases 12+ |

---

## Current implementation status (as of registry)

| Phase | Registry `status` | Module | Chat wired | Panel wired | In `getCurrentRelationshipPhase()` |
|-------|-------------------|--------|------------|-------------|-----------------------------------|
| 1 | active | Yes | Yes | Yes | Yes |
| 2 | active | Yes | Yes | Yes | Yes |
| 3 | active | Yes | Yes | Yes | Yes |
| 4 | active | Yes | Yes | Yes | Yes |
| 5 | active | Yes | Yes | Yes | Yes |
| 6 | active | Yes | Yes | Yes | Yes |
| 7 | active | Yes | Yes | Yes | Yes |
| 8 | active | Yes | Yes | Yes | Yes |
| 9 | active | Yes | Yes | Yes | Yes |
| 10 | active | Yes | Yes | Yes | Yes |
| 11 | active | Yes | Yes | Yes | Yes |

**Resolver:** `getCurrentRelationshipPhase()` evaluates **11 → 10 → 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1** (highest qualifying phase wins).

---

## Future recommended build order

Based on registry dependencies and current wiring gaps:

1. **Stabilize navigation and Phase 1 onboarding** — Phase 1 guards affect workspace routing.
2. **Validate Phases 8–11 in production** — wiring complete; QA cross-domain insights and preparation offers.
3. **Reduce orchestration fragmentation** — Companion Governor single entry (see Constitution).
4. **Founder Ecosystem phases** — separate track under `lib/ecosystem/`; do not merge with relationship phases.

---

## How to use this documentation

- **Planning a relationship-phase feature?** Start with the phase file here, then read the module named in that file.
- **Planning founder dashboard/automation?** Use `lib/ecosystem/` — not this folder.
- **Adding a new relationship phase?** Update `lib/companionRelationshipPhases.ts`, add a module, tests, and a new file in this folder.

---

## Related documentation

| Document | Relevance |
|----------|-----------|
| `Relationship-Phase-Roadmap.md` | Master summary of all 11 phases |
| `docs-companion-intelligence/00_Companion_Operating_System_v1.md` | Turn routing and companion behavior OS |
| `docs/ARCHITECTURAL_GUARDRAILS.md` | Workspace boundaries, Companion Intelligence rules |
| `HANDOFF.md` | Product spine (Chat/Make/Do) — does not list relationship phases |
