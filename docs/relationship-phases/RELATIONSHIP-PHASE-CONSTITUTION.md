# Relationship Phase Constitution
## The Constitution of Companion Intelligence — Relationship Architecture

**Version:** 1.0  
**Status:** Canonical for all Relationship Phase work  
**Authority hierarchy:**

| Rank | Document | Governs |
|------|----------|---------|
| 1 | `docs-companion-intelligence/21_Companion_Constitution.md` | Product behavior, consent, one voice, forbidden actions |
| 2 | `docs/EXPERIENCE_OF_SHARI.md` · `docs/THE_HONEST_SHARI.md` | Shari's presence and believable humanity |
| 3 | `docs/COMPANION_TRUST_ARCHITECTURE.md` | Emotional trust earned over time |
| 4 | `docs/COMPANION_DECISION_INTELLIGENCE.md` | Judgment — Decision Ladder, what Shari does next |
| 5 | **This document** | Relationship phase architecture, progression, activation |
| 6 | `docs/relationship-phases/Relationship-Phase-Roadmap.md` | Phase summaries and registry |
| 7 | `docs/relationship-phases/Phase-*.md` | Per-phase specifications |
| 8 | `lib/companionRelationshipPhases.ts` | Machine registry (must conform to 5–7) |

When product behavior conflicts with phase architecture, **the Companion Constitution wins**.  
When trust/emotional behavior conflicts with a module, **`COMPANION_TRUST_ARCHITECTURE.md` wins** over phase registry convenience.  
When turn/action behavior conflicts with judgment philosophy, **`COMPANION_DECISION_INTELLIGENCE.md` wins** over resource routing convenience.  
When phase architecture conflicts with a single module implementation, **this document wins**.

**Registry:** `lib/companionRelationshipPhases.ts`  
**Resolver:** `getCurrentRelationshipPhase()`

---

## 1. Core Principle

### One companion. One experience.

The user experiences **one trusted companion** — Shari.

They must never experience:

- Modules
- Agents
- Systems
- Dashboards
- Intelligence layers
- Phase numbers
- Architecture terminology

The codebase may contain many intelligence systems. The user experiences **one relationship** that deepens over time.

### Architectural implication

Every intelligence system must:

1. **Feed** the companion's understanding silently
2. **Route** through one voice (`lib/companionPrompt.ts`, chat hint blocks)
3. **Surface** only as natural conversation, light context, or permission-based offers
4. **Never** introduce a second persona, scorecard, or diagnostic frame

Internal chat hints (e.g. `phase10TransformationIntelligenceHintForChat`) are **owner manuals for Shari** — never user-facing labels.

---

## 2. Relationship Before Features

Intelligence capabilities unlock in a fixed developmental order. Future development **must respect this sequence**. Skipping a layer to ship a feature faster is architectural drift.

```
Trust
  → Intelligence
    → Autonomy (preparation, not action)
      → Automation (founder/backend only — never user-facing control loss)
        → Prediction (advisory only)
          → Ecosystem Intelligence (whole-life understanding)
```

| Stage | Meaning | Relationship phase alignment |
|-------|---------|------------------------------|
| **Trust** | User believes Shari understands them before being asked to use tools | Phases 1–2 |
| **Intelligence** | Patterns, business context, connected knowledge | Phases 3–7 |
| **Autonomy** | Companion prepares; user decides | Phase 8 |
| **Wisdom** | What actually works for *this* person over time | Phase 9 |
| **Transformation** | Evidence of who they were vs who they're becoming | Phase 10 |
| **Ecosystem Intelligence** | Whole-life system — why, not only what | Phase 11 |
| **Automation** | Backend execution with consent — Founder Ecosystem track | `lib/ecosystem/automation/` |
| **Prediction** | Advisory risk/readiness signals — never controlling | `lib/predictive-support/`, `lib/ecosystem/digitalTwin/` |

**Rule:** Do not ship prediction or automation behaviors to users who have not earned the underlying relationship evidence. Activation gates exist for this reason.

---

## 3. Phase Progression Philosophy

Each relationship phase answers a different question. The companion **changes behavior** at each level — not by announcing the change, but by what it knows, anticipates, and offers.

| Phase | Name | Question answered | What changes in the companion |
|-------|------|-------------------|-------------------------------|
| **1** | Initial Trust | *"Do you understand me enough to help?"* | Conversation-first onboarding; blocks auto-routing; seeds profile; offers first value |
| **2** | Progressive Discovery | *"Do you understand how I work?"* | Invisible observation — patterns, energy, learning style, challenges |
| **3** | Adaptive Relationship | *"Do you understand my patterns?"* | Anticipates friction; predictive patterns; operating manual |
| **4** | Business Operating Partner | *"Can you help me run my business?"* | Business health, opportunities, operating context |
| **5** | Companion Intelligence Ecosystem | *"Do you know who I'm becoming?"* | Long-horizon memory, growth signals, legacy checkpoints, partial wisdom |
| **6** | Companion Intelligence Network | *"Is everything connected?"* | Knowledge graph; asset reuse; resource discovery |
| **7** | Business Intelligence Ecosystem | *"Do you understand my business as a system?"* | Offer, content, revenue, visibility, sales, strategic focus |
| **8** | Autonomous Preparation | *"Is work ready when I arrive?"* | Preparation kits; permission prompts; re-entry briefs — **prepare, never act** |
| **9** | Wisdom Intelligence | *"What actually works for me?"* | Personal wisdom from evidence — not generic advice |
| **10** | Legacy & Transformation | *"Have I changed more than I realized?"* | Then/now, pattern evolution, strengths, transformation narrative |
| **11** | Ecosystem Intelligence | *"Do you understand my whole life, not just my business?"* | Life domains, capacity, interconnections, capacity-aware guidance |

### Progression is evidence-gated, not time-gated alone

Days and sessions are necessary but not sufficient. Phases require **observed signals** — patterns, graph nodes, domain mentions, transformation evidence. See Section 7.

### Resolver order (current implementation)

`getCurrentRelationshipPhase()` returns the **highest** qualifying phase:

```
11 → 10 → 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1
```

Phases 8 and 9 are consulted when activation gates are met. Highest qualifying phase wins. See `docs/adr/ADR-011-relationship-phase-resolver-order.md`.

---

## 4. Intelligence Layer Mapping

Relationship phases span seven architectural layers. This mapping shows **where implementations live today** and **known fragmentation**.

### Layer definitions

| Layer | Responsibility |
|-------|----------------|
| **Identity** | Who the user is — business, audience, goals, desired outcomes |
| **Context** | Current turn, workspace, emotional state, active workflow |
| **State** | Phase flags, activation gates, relationship day count, cooldowns |
| **Memory** | Persistent observations, patterns, wins, wisdom, graphs |
| **Reasoning** | Inference engines — business OS, transformation, ecosystem, preparation |
| **Orchestration** | Turn routing, hint assembly, consent, one owner per turn |
| **Experience** | What the user sees — chat, Getting To Know You panel, workspaces |

### Phase → layer mapping

| Phase | Identity | Context | State | Memory | Reasoning | Orchestration | Experience |
|-------|----------|---------|-------|--------|-----------|---------------|------------|
| 1 | ● | | ● | ○ | | ● | ● |
| 2 | ● | | ● | ● | ○ | ● | ○ |
| 3 | | | ● | ● | ● | ● | ○ |
| 4 | ● | | ● | ○ | ● | ● | ○ |
| 5 | | | ● | ● | ● | ● | ● |
| 6 | | | ● | ● | ● | ● | ● |
| 7 | ● | | ● | ● | ● | ● | ● |
| 8 | | | ● | ○ | ● | ● | ● |
| 9 | | | ● | ● | ● | ● | ● |
| 10 | ● | | ● | ● | ● | ● | ● |
| 11 | ● | | ● | ● | ● | ● | ● |

● = primary owner today · ○ = partial or downstream consumer

### Implementation locations by layer

#### Identity Layer

| Module | Role |
|--------|------|
| `lib/phase1Onboarding.ts` | `Phase1RelationshipProfile` — win, business, challenge, outcome |
| `lib/phase2ProgressiveDiscovery.ts` | Business, goals, audience refinement |
| `lib/companionStore.ts` | Business profile, avatars |
| `lib/intelligence-layer/types.ts` | `HumanIntelligence`, `BusinessIntelligence` trait maps |

#### Context Layer

| Module | Role |
|--------|------|
| `lib/companionIntelligence.ts` | Per-turn understanding, advisor hints |
| `lib/companionIntelligenceRouter.ts` | Unified turn router |
| `lib/companionTurnArbiter.ts` | Workspace lock, discovery, triage |
| `lib/messageClassification.ts` | Lane classification |

#### State Layer

| Module | Role |
|--------|------|
| `lib/companionRelationshipPhases.ts` | Registry + `getCurrentRelationshipPhase()` |
| `lib/phase1Onboarding.ts` … `lib/phase6CompanionIntelligenceNetwork.ts` | Per-phase `isPhaseNActive()` gates |
| `lib/businessIntelligenceEcosystem.ts` | Phase 7 gate |
| `lib/autonomousPreparation.ts` | Phase 8 gate |
| `lib/wisdomIntelligence.ts` | Phase 9 gate |
| `lib/transformationIntelligence.ts` | Phase 10 gate |
| `lib/ecosystemIntelligence.ts` | Phase 11 gate |

#### Memory Layer

| Module | Role |
|--------|------|
| `lib/phase2ProgressiveDiscovery.ts` | Patterns, challenges, energy, resources |
| `lib/phase3AdaptiveRelationship.ts` | Predictive patterns |
| `lib/phase5CompanionIntelligenceEcosystem.ts` | Multi-year memory, wisdom insights |
| `lib/phase6CompanionIntelligenceNetwork.ts` | Companion knowledge graph |
| `lib/businessIntelligenceEcosystem.ts` | Business knowledge graph |
| `lib/companionAdaptiveUserEngine.ts` | Living user model |
| `lib/intelligence-layer/` | Master profile architecture (partial wiring) |
| `lib/ecosystem/memory/` | Founder relationship graph (**separate system**) |

#### Reasoning Layer

| Module | Role |
|--------|------|
| `lib/phase4BusinessOperatingPartner.ts` | Business health, opportunities |
| `lib/business-os/businessEngine.ts` | Business OS evaluation |
| `lib/businessIntelligenceEcosystem.ts` | Offer, content, revenue, visibility, sales |
| `lib/autonomousPreparation.ts` | Preparation kit assembly |
| `lib/transformationIntelligence.ts` | Transformation snapshot builder |
| `lib/ecosystemIntelligence.ts` | Whole-life domain inference |
| `lib/adhdNativeIntelligence.ts` | ADHD operating system lens |
| `lib/adhdEntrepreneurIntelligence.ts` | Primary business decision lens |

#### Orchestration Layer

| Module | Role |
|--------|------|
| `app/companion/CompanionPageClient.tsx` | Turn handling, hint stacking, workspace routing |
| `lib/companionPrompt.ts` | System prompt assembly |
| `docs-companion-intelligence/00_Companion_Operating_System_v1.md` | Target: `CompanionGovernor` single entry (**not fully implemented**) |
| Per-phase `*HintForChat()` functions | Internal Shari guidance blocks |

#### Experience Layer

| Module | Role |
|--------|------|
| `components/companion/GettingToKnowYouPanel.tsx` | Phase 5–7, 10–11 manual sections |
| `app/companion/CompanionPageClient.tsx` | Chat UI |
| `lib/relationshipPhaseSummaryForChat()` | Internal phase summary in chat context |

### Known fragmentation (documented, not invented)

From `lib/adaptiveCompanionArchitecture.ts` and `docs-companion-intelligence/23_Adaptive_Companion_Architecture.md`:

| Risk | Description |
|------|-------------|
| **Three stacks** | Companion profile (`lib/intelligence-layer/`), vertical hub (`lib/ecosystem-intelligence/`), founder ecosystem (`lib/ecosystem/`) |
| **Triple board model** | Board advisors without shared registry |
| **Dual user intelligence** | Local profile vs server `userIntelligenceEngine` |
| **Dual prediction** | `lib/predictive-support/` vs `lib/ecosystem/digitalTwin/` |
| **Triple relationship memory** | `companion-relationship-memory`, `relationship-intelligence/`, founder memory graph |
| **Phase 9 split** | Resolved — dedicated `wisdomIntelligence.ts`; Phase 5 Wisdom Engine hidden when Phase 9 active |
| **Resolver skip** | Phases 8–9 bypassed in `getCurrentRelationshipPhase()` |
| **Governor gap** | `CompanionPageClient.tsx` orchestrates ~15 systems per turn; OS doc targets single governor |

**Unification is a platform goal — not a license to merge Relationship Phases with Founder Ecosystem Phases.**

---

## 5. Companion Rules

Future development **MUST NOT:**

| Rule | Rationale |
|------|-----------|
| Create competing companion voices | One Shari — Board of Directors advice is translated, not repeated |
| Create separate assistant personalities | Wisdom Companion, ADHD Business, etc. are **audience/content** modifiers — not separate companions in one session |
| Expose internal phases to users | No "You're in Phase 7" — milestones are felt, not labeled |
| Expose intelligence scores | No productivity scores, trait percentages, or confidence KPIs in UX |
| Expose architecture terminology | No "Founder Intelligence," "signal bus," or "knowledge graph" in user-facing copy |
| Bypass relationship development | No Phase 10 transformation narratives without evidence gates |
| Stack unlimited hint blocks per turn | Each phase hint competes for prompt attention — respect One Owner Per Turn |
| Auto-execute on preparation or prediction | Phase 8 prepares; prediction advises — user always decides |
| Merge Relationship and Founder Ecosystem phase numbers | See Section 6 |

Future development **MUST:**

| Rule | Source |
|------|--------|
| Route new intelligence through existing phase modules or a new phase (Section 8) | This constitution |
| Add activation gates with evidence thresholds | Section 7 |
| Add tests for activation and validation | Existing pattern: `*Validation.test.ts` |
| Update phase documentation when changing gates | `docs/relationship-phases/` |
| Pass the seven-question future feature gate | `lib/adaptiveCompanionArchitecture.ts` → `validateFutureFeature()` |

---

## 6. Founder Ecosystem Separation

### Two systems. Two roadmaps. Two namespaces.

| | **Relationship Phases** | **Founder Ecosystem Phases** |
|---|------------------------|------------------------------|
| **Purpose** | Human relationship growth with Shari | Business operating system — events, dashboards, actions, automation |
| **Audience** | Every user | Founder/backend surfaces |
| **Registry** | `lib/companionRelationshipPhases.ts` | `lib/ecosystem/index.ts` |
| **State model** | localStorage + conversation signals | Event stream + materialized views |
| **Phases** | 1–11 (ends at 11) | 1–19 (Phase 18 not found) |
| **Documentation** | `docs/relationship-phases/` | `lib/ecosystem/README.md` (partial) |

### Why numbering collisions caused confusion

The same phase number means different things:

| Number | Relationship Phase | Founder Ecosystem Phase |
|--------|-------------------|------------------------|
| 10 | Legacy & Transformation Intelligence | Stage-Aware Recommendation Engine |
| 11 | Ecosystem Intelligence (whole life) | Action & Workspace Integration |
| 12 | *Does not exist* | Founder Command Center |
| 13 | *Does not exist* | Adaptive Founder Companion |

Developers referencing "Phase 10" without a namespace have shipped features to the wrong mental model.

### How to reference each system

**In code comments:**
```typescript
// Relationship Phase 10 — Legacy & Transformation Intelligence
// Founder Ecosystem Phase 10 — Stage-Aware Recommendations
```

**In PR titles:**
```
[Relationship P10] Add transformation reflection cooldown
[Founder Ecosystem P12] Wire command center selectors
```

**In planning documents:** Always prefix with `Relationship` or `Founder Ecosystem`.

**In user-facing copy:** Neither system's phase numbers appear. Ever.

### Integration boundary

Founder Ecosystem modules may **inform** relationship intelligence (e.g. event stream → patterns). Relationship phases may **consume** founder summaries. They must not **share phase IDs, storage keys, or resolver logic**.

---

## 7. Intelligence Activation Rules

### Governing law

> Intelligence activates only when sufficient **evidence**, **relationship history**, and **confidence** exist.

| Forbidden | Required |
|-----------|----------|
| Guessing | Signal thresholds in `isPhaseNActive()` |
| Simulated knowing | `evidence: "early" \| "growing" \| "strong"` levels |
| Fabricated certainty | "Only if that fits — correct me if not" language in reflections |
| Flattery without evidence | Phase 10 validation: `validateLegacyAccuracy()` |
| Hustle advice when overloaded | Phase 11: `adaptRecommendationToCapacity()` |

### Activation pattern (all phases)

Every `isPhaseN…Active()` function follows this structure:

1. **Prerequisite phases** must be active (dependency chain)
2. **Time/session floors** where applicable (days, session counts)
3. **Evidence floors** — graph nodes, pattern counts, domain signals, transformation items
4. **Cooldowns** on offers — reflections, insights, preparation (4–5 day windows in code)

### Current activation summary

| Phase | Key gates (from code) |
|-------|----------------------|
| 1 | Complete when onboarding conversation finishes |
| 2 | Phase 1 complete |
| 3 | ≥5 sessions or ≥14 days + patterns or learning confidence ≥0.4 |
| 4 | Phase 3 + business context + ≥30 days or ≥12 sessions |
| 5 | Phase 4 + ≥90 days or ≥20 sessions |
| 6 | Phase 5 + knowledge graph ≥4 nodes |
| 7 | Phase 6 + business depth + business graph ≥3 nodes |
| 8 | Phase 7 + ≥2 prepared kits |
| 9 | Phase 7 + history floor + patterns + wisdom evidence |
| 10 | Phase 7 + ≥90 days + transformation snapshot thresholds |
| 11 | Phase 7 + ≥4 life domains + ≥2 interconnection chains |

### Adding new intelligence

Before activating any new capability:

1. Define **what evidence** proves the insight
2. Define **minimum observations** before first offer
3. Define **cooldown** between offers
4. Define **correction path** — user can reject the insight
5. Add **validation tests** — follow `TransformationIntelligenceValidation.test.ts` pattern
6. Add **chat hint** — internal only, one voice

---

## 8. Future Phase Policy

### Current boundary

The relationship roadmap **ends at Phase 11**. There is no Relationship Phase 12.

### When a new relationship phase may be added

A Phase 12+ proposal must satisfy **all**:

1. **Genuinely new intelligence capability** — not a feature dressed as a phase
2. **Cannot fit naturally** inside Phases 1–11 without overloading an existing module
3. **Changes the companion relationship itself** — new milestone, new user feeling, new evidence model
4. **Passes** `validateFutureFeature()` seven-question gate
5. **Passes** Companion Constitution Articles I–III
6. **Includes** module, tests, registry entry, phase doc, and resolver update
7. **Reviewed** via ADR (Architecture Decision Record) before implementation

### Phase inflation is forbidden

Do **not** create new phases for:

- Individual workspaces (Create, Plan My Day, Projects)
- Founder dashboard sections
- Single chat features or hint blocks
- Founder Ecosystem capabilities
- UI redesigns or navigation changes
- Bug fixes or routing patches

These belong in feature modules, Founder Ecosystem phases, or the Companion Operating System — not the relationship roadmap.

### Completing existing phases before adding new ones

Priority debt before Phase 12 consideration:

- Reduce orchestration fragmentation (Governor)

---

## 9. Architecture Decision Record

**Checkpoint date:** 2026-06-24  
**Purpose:** Historical record preventing re-litigation of known state.

### ADR-001: Relationship phase registry

- **Decision:** Eleven relationship phases registered in `lib/companionRelationshipPhases.ts`
- **Status:** Accepted
- **Consequence:** Roadmap ends at 11 unless ADR approves Phase 12+

### ADR-002: Phase 8 — implemented but unwired

- **Decision:** `lib/autonomousPreparation.ts` built with full test suite
- **Status:** **Superseded** by ADR-009 (2026-06-24) — wired to chat, panel, resolver
- **See:** `docs/adr/ADR-009-wire-phase-8.md`

### ADR-003: Phase 9 — partially implemented

- **Decision:** Wisdom Intelligence specified; no dedicated module created
- **Status:** **Superseded** by ADR-010 (2026-06-24) — `lib/wisdomIntelligence.ts` created and wired
- **See:** `docs/adr/ADR-010-phase-9-wisdom-module.md`

### ADR-004: Phase 10 — active

- **Decision:** `lib/transformationIntelligence.ts` implements Legacy & Transformation Intelligence
- **Status:** Accepted and wired
- **Integration:** Chat hints, panel, resolver, validation tests
- **Note:** Resolver requires Phase 7, not Phase 9 — intentional in code; narrative order differs

### ADR-005: Phase 11 — active

- **Decision:** `lib/ecosystemIntelligence.ts` implements whole-life Ecosystem Intelligence
- **Status:** Accepted and wired
- **Integration:** Chat hints, panel, resolver (highest phase), validation tests
- **Note:** Name collides with Adaptive Architecture "Layer 6 — Ecosystem Intelligence" — different scope (relationship vs platform layer)

### ADR-006: Founder Ecosystem remains separate

- **Decision:** `lib/ecosystem/` phases 1–19 are a distinct roadmap
- **Status:** Accepted
- **Consequence:** Never renumber or merge with relationship phases

### ADR-007: Resolver skips Phases 8 and 9

- **Decision:** `getCurrentRelationshipPhase()` jumped 7 → 10 → 11
- **Status:** **Superseded** by ADR-011 (2026-06-24) — resolver now 11 → 10 → 9 → 8 → 7 → …
- **See:** `docs/adr/ADR-011-relationship-phase-resolver-order.md`

### ADR-009: Wire Phase 8

- **Status:** Accepted — see `docs/adr/ADR-009-wire-phase-8.md`

### ADR-010: Phase 9 wisdom module

- **Status:** Accepted — see `docs/adr/ADR-010-phase-9-wisdom-module.md`

### ADR-011: Resolver order

- **Status:** Accepted — see `docs/adr/ADR-011-relationship-phase-resolver-order.md`

### ADR-008: Documentation recovered from chat

- **Decision:** Phase prompts were implemented via Cursor sessions without repo docs
- **Status:** Remediated — `docs/relationship-phases/` created 2026-06-24
- **Consequence:** This constitution prevents recurrence

---

## 10. North Star

### What are we actually building?

We are building **a trusted companion** — not a chatbot, not a dashboard, not an AI tool.

A companion that:

- **Learns** — through invisible discovery, not interrogation
- **Remembers** — patterns, wins, struggles, and growth across years
- **Adapts** — to capacity, season, business stage, and life context
- **Helps** — with evidence-based support before impressive analysis
- **Grows** — alongside the user as trust deepens from first conversation to whole-life understanding

The relationship phases are the **developmental spine** of that companion. Each phase adds depth without adding noise. The architecture may be complex; the experience must remain simple.

**Milestone test:** After every session, the user should feel more understood — never more managed.

**Final law:** If a feature makes the companion feel like software, it violates this constitution. If it makes the companion feel like someone who knows them better than last month, it belongs.

---

## Appendix A — Quick reference

| Need | Go to |
|------|-------|
| Product behavior law | `docs-companion-intelligence/21_Companion_Constitution.md` |
| Phase details | `docs/relationship-phases/Phase-*.md` |
| Phase summary table | `docs/relationship-phases/Relationship-Phase-Roadmap.md` |
| System separation | `docs/relationship-phases/README.md` |
| Machine registry | `lib/companionRelationshipPhases.ts` |
| Platform layer health | `lib/adaptiveCompanionArchitecture.ts` |
| Founder backend | `lib/ecosystem/index.ts` |
| Future feature gate | `validateFutureFeature()` in `lib/adaptiveCompanionArchitecture.ts` |

---

## Appendix B — Document maintenance

| Trigger | Action |
|---------|--------|
| New phase module added | Update Sections 3, 4, 7, 9; add Phase doc |
| Activation threshold changed | Update Section 7 and corresponding Phase doc |
| Phase wired/unwired | Update ADR section and README status table |
| Founder Ecosystem phase added | Do **not** update this document — separate ADR track |
| Companion Constitution amended | Review this document for conflicts |

**Owner:** Architecture / product — not individual feature PRs without constitution review.
