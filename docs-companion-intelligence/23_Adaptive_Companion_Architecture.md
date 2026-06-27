# Adaptive Companion Architecture
## ADHD Business Ecosystem™ — Future Architecture Sprint (2026–2029)

**Version:** 1.0  
**Authority:** Subordinate to `21_Companion_Constitution.md`  
**Companion to:** `00_Companion_Operating_System_v1.md`  
**Machine registry:** `lib/adaptiveCompanionArchitecture.ts`  
**Future capabilities:** `docs-companion-intelligence/24_Future_Capability_Architecture.md` · `lib/futureCapabilityArchitecture.ts`

---

# Critical Philosophy

We are **not** building an ADHD app.  
We are building an **Adaptive Companion Platform**.

Every architectural decision must support:

- Continuous learning
- Continuous expansion
- Continuous adaptation
- Continuous intelligence improvement

Design for where Companion Intelligence will be in **2–3 years**, not only what is possible today.

## Core principle

**Build systems. Not features.**  
Features come and go. Systems evolve.

## Ultimate goal

The companion users experience in **2029** should be dramatically smarter than the companion launched in **2026** — **without a complete rebuild**.

---

# Architectural Requirement

Every major intelligence layer must be:

| Property | Meaning |
|----------|---------|
| **Modular** | Clear boundaries; one responsibility per module |
| **Expandable** | New dimensions, scenarios, advisors, workspaces without redesign |
| **Replaceable** | Heuristics → models; local → server — swap implementations behind interfaces |
| **Self-improving** | Outcomes feed back into effectiveness scores and trait evolution |
| **Observable** | Health metrics, test suites, inspectors, architecture snapshots |

**No intelligence layer should require a platform rewrite.**

---

# Platform Vision

The companion becomes harder to replace because it learns:

- The user
- Business patterns
- Intervention effectiveness
- Behavioral patterns
- What creates momentum
- What causes friction
- How the user learns
- How the user succeeds

---

# Layer Architecture

Eight trademark layers map to today's codebase. Status reflects **June 2026** implementation.

```
                    ┌─────────────────────────────────────┐
                    │   Continuous Learning Engine (L8)   │
                    │   (gates, evolution, signal bus)     │
                    └─────────────────┬───────────────────┘
                                      │ feeds
    User (L1) ──► Behavioral (L2) ──► Intervention (L3) ──► Governor / Chat
         │              │                    │
         └──────────────┼────────────────────┘
                        ▼
              Trust & Relationship (L4)
                        │
         Predictive (L5) ◄── advisory only, never controlling
                        │
              Ecosystem (L6) ◄── features, workspaces, verticals
                        │
              Board (L7) ◄── advisory, ADHD-filtered, one voice
```

## Intelligence hierarchy (runtime — companion chat)

From `lib/companionIntelligenceRouter.ts` and `lib/companionPrompt.ts`:

0. Trust Engine + Confidence Engine + Adaptive User Intelligence (Sprint 5)  
0b. Action Bias / Anti-overanalysis (Sprint 7)  
0c. Intuitive Awareness (surface intent vs actual need)  
0d. Sales Intelligence / Visibility Intelligence (when context detected)  
1. **ADHD Entrepreneur Intelligence** — PRIMARY  
2. Board of Directors — advisory only  
3. Feature Intelligence — permission-based routing  
4. Outcome Intelligence — goals, progress, follow-through  

**Board rule:** Expert advice is translated, not repeated. ADHD filter always wins.

---

# Layer 1 — User Intelligence

**Learns:** preferences, learning styles, work rhythms, energy patterns, business habits, ADHD patterns.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/intelligence-layer/` | Trait taxonomy, signal store, profile evolution |
| `lib/companionAdaptiveUserEngine.ts` | Living model: rhythms, learning style, intervention memory |
| `lib/ecosystem/userIntelligenceEngine.ts` | Founder-side aggregated signals (no message text) |

### Status: **Partial** (modularity ★★★★☆)

**Strengths**

- Rich trait types (`HumanIntelligence`, `BusinessIntelligence`, `AdhdIntelligence`)
- 46 signal→trait mappings in `signalMapping.ts`
- New dimensions addable via trait paths without router rewrite

**Gaps**

- Profile learning **OFF by default** (`NEXT_PUBLIC_PROFILE_LEARNING`)
- Companion profile is **client localStorage** — no server-authoritative sync
- Relationship memory (`companion-relationship-memory-v1`) separate from `IntelligenceProfile`

### Future requirement

New user dimensions via **registry entries** in `signalMapping.ts` + `types.ts` — not prompt rewrites.

---

# Layer 2 — Behavioral Intelligence

**Contains:** ADHD Entrepreneur Behavioral Framework, validation scenarios, intuitive awareness, sales & visibility intelligence.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/companionValidationFramework.ts` | Scorecard (8 dimensions), scenario evaluation |
| `lib/companionValidationScenarios.ts` | Scenario library (**47** scenarios, **10** categories) |
| `lib/adhdEntrepreneurIntelligence.ts` | 19 ADHD business patterns — primary lens |
| `lib/adhdNativeIntelligence.ts` | 17 friction detectors |
| `lib/adhdMultiTurnPatterns.ts` | 6 multi-turn patterns |
| `lib/companionActionBias.ts` | Action vs overanalysis |
| `lib/companionIntuitiveAwareness.ts` | Surface intent vs actual need |
| `lib/companionSalesIntelligence.ts` | Sales journey patterns |
| `lib/companionVisibilityIntelligence.ts` | Visibility & marketing confidence |

### Status: **Production** (modularity ★★★☆☆)

**Strengths**

- Test-driven validation — all scenarios must pass scorecard
- Categories expand by adding scenario arrays (sales, visibility sprints)
- Specialized intelligence modules merge into intuitive awareness

**Gaps**

- **47 scenarios today** — target **200–500+**
- Categories are TypeScript union (`ScenarioCategory`) — migrate to **data-driven registry**
- Scorecard is **offline (vitest)** — not yet runtime policy in `CompanionGovernor`
- Behavior rules fragmented across ~15 modules

### Future requirement

```typescript
// Target: scenarios as data, categories derived at runtime
getBehavioralCategoryIds() // already in adaptiveCompanionArchitecture.ts
```

Scenario performance feeds Continuous Learning (Layer 8).

---

# Layer 3 — Intervention Intelligence

**Tracks:** what was recommended, accepted, ignored, worked, failed.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/intelligence-layer/interventionRegistry.ts` | 10 intervention buckets |
| `lib/ecosystem-intelligence/ecosystemEngine.ts` | Priority + suppression across 17 verticals |
| `lib/companionGovernor.ts` | Terminal turn outcomes |
| `lib/conversationIntervention.ts` | Card suppression during discovery |

### Status: **Partial** (modularity ★★★★☆)

**Strengths**

- Stable bucket identity for trust attribution
- `evaluateEcosystem` pattern — add vertical = add engine + register signal

**Gaps**

- Effectiveness loop incomplete — trust audit exists, outcome attribution partial
- Governor not yet sole entry (`page.tsx` still orchestrates — see OS doc)
- `companionEcosystemIntent.ts` — only 4 feature-routing rules

### Future requirement

Intervention effectiveness **continuously improves** via Layer 8 feedback.

---

# Layer 4 — Trust & Relationship Intelligence

**Tracks:** trust indicators, confidence indicators, engagement, re-entry, follow-through.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/companionTrustEngine.ts` | Trust snapshot + hints |
| `lib/companionConfidenceEngine.ts` | Evidence-based wins |
| `lib/intelligence-layer/trustSignals.ts` | Trust evidence collection |
| `lib/relationship-intelligence/relationshipEngine.ts` | People/memory offers |
| `lib/companionOutcomeThread.ts` | Thread continuity |

### Status: **Partial** (modularity ★★★☆☆)

**Gaps**

- Trust trait evolution **gated** on attribution wiring (`learningGates.ts`)
- Three relationship stores (companion memory, relationship-intelligence, founder graph)
- 8 trust scenarios vs 47 behavioral — expand trust validation suite

### Future requirement

Relationship model grows more accurate over time — single relationship store behind interface.

---

# Layer 5 — Predictive Intelligence

**Future-forward layer** — not "what happened?" but "what is likely next?"

Examples: burnout risk, overwhelm risk, launch avoidance, confidence crash, follow-through risk.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/predictive-support/predictiveEngine.ts` | Companion predictive offers |
| `lib/predictive-support/predictivePatterns.ts` | Rule-based risk detection |
| `lib/ecosystem/digitalTwin/predictionEngine.ts` | Founder digital twin |

### Status: **Partial** (modularity ★★★☆☆)

**Constraint:** Predictions remain **advisory**. Never controlling. Never auto-act.

**Gaps**

- Heuristic thresholds only — no accuracy feedback loop
- Two prediction systems not unified

---

# Layer 6 — Ecosystem Intelligence

**Understands:** features, tools, workspaces, future modules.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/ecosystem-intelligence/` | 17 vertical layers, hub, priority ladder |
| `lib/ecosystem/` | Founder event-sourced ecosystem (phases 1–19) |
| `lib/companionEcosystemIntent.ts` | Chat → feature mapping |

### Status: **Production** (modularity ★★★★★)

**Strengths**

- `LayerSignal` + `gatherEcosystemSignals` — best extensibility pattern in codebase
- New workspace = register layer, no routing rewrite

**Gaps**

- Naming collision: companion hub vs founder `lib/ecosystem/`
- `crossSystemIntelligenceHub` has `"future"` integration stubs

---

# Layer 7 — Board Intelligence

**Expertise sources** — advisors added, modified, or retired without affecting UX. **One Companion** always.

### Canonical modules

| Surface | Roles |
|---------|-------|
| Companion workspace | 4 roles: marketing, operations, planning, mindset |
| Founder board | 7 advisors: CEO, marketing, sales, operations, productivity, accountability, wellness |
| Legacy `companionIntelligence.ts` | 8 `AdvisorType`s (discovery-era) |

### Status: **Partial** (modularity ★★☆☆☆)

**Gap:** Three parallel advisor models — **highest consolidation priority** for Board layer.

### Future requirement

Shared advisor registry:

```typescript
// Target interface (not yet built)
type AdvisorRegistryEntry = {
  id: string;
  domain: string;
  hintBuilder: (context: TurnContext) => string | undefined;
  retired?: boolean;
};
```

---

# Layer 8 — Continuous Learning Engine

**Learns from:** user outcomes, scenario performance, intervention success, companion effectiveness.

### Canonical modules

| Module | Role |
|--------|------|
| `lib/intelligence-layer/profileEvolution.ts` | Trait updates (learning rate 0.15) |
| `lib/intelligence-layer/learningGates.ts` | Master + trust gates |
| `lib/intelligence-layer/signalBus.ts` | Unified bus (shadow mode) |
| `lib/ecosystem/learning/` | Founder automation score adjustments |

### Status: **Stub** (modularity ★★☆☆☆)

**Critical:** Production learning **OFF by default**. Signal bus in **shadow only**.

### Rollout criteria (before calling learning "live")

1. Trust attribution wired (`trustAttribution.ts` → `learningGates.ts`)
2. Unified signal bus parity validated (`shadowDiagnostics.ts`)
3. Server profile sync strategy defined
4. Rollback runbook exercised (`SPRINT1_ROLLBACK.md`)

---

# Three-Stack Reality (must unify)

Today three parallel stacks coexist:

| Stack | Location | Owns |
|-------|----------|------|
| **Companion profile** | `intelligence-layer/` | Traits, trust, local profile |
| **Companion vertical hub** | `ecosystem-intelligence/` | 17 layers, priority, suppression |
| **Founder ecosystem** | `lib/ecosystem/` | Events, board, cross-system hub, learning |

**Unification priorities** (from `evaluateArchitectureHealth()`):

1. `CompanionGovernor` as single turn entry
2. Data-driven scenario category registry (200–500+ target)
3. Unified signal bus with staged learning rollout
4. Shared advisor registry for Board Intelligence
5. Server-authoritative user profile sync
6. Intervention outcome attribution → Continuous Learning loop

---

# Future Feature Validation Gate

Every future feature must answer **yes** to all seven:

1. Does it improve **user outcomes**?
2. Does it improve **trust**?
3. Does it improve **confidence**?
4. Does it reduce **friction**?
5. Does it improve **momentum**?
6. Does it fit the **One Companion** philosophy?
7. Can it **evolve without architectural debt**?

**If not → do not build.**

Programmatic gate: `validateFutureFeature()` in `lib/adaptiveCompanionArchitecture.ts`.

---

# Self-Evolving Platform Roadmap

| Horizon | Capability |
|---------|------------|
| **2026** | 47+ validated scenarios; visibility + sales intelligence; architecture registry; learning infrastructure (gated) |
| **2027** | 100+ scenarios; runtime behavioral hints in Governor; profile learning staged rollout; unified signal bus |
| **2028** | 200+ scenarios; intervention effectiveness scores; predictive accuracy tracking; advisor registry |
| **2029** | 500+ scenarios; self-improving intervention selection; personalized behavioral models; cross-device user intelligence |

The companion should eventually learn **new behavioral patterns, intervention types, user archetypes, and business situations** without major platform redesigns.

---

# Observability

| Tool | Purpose |
|------|---------|
| `evaluateArchitectureHealth()` | Layer maturity, scenario counts, flag status |
| `formatArchitectureHealthText()` | Human-readable snapshot |
| `runCompanionValidationFramework()` | 47 behavioral scenarios |
| `formatScenarioLibrarySummary()` | Per-category pass rates, interventions |
| Trust Inspector (`/companion/trust-inspector`) | Dev trust pipeline (flag-gated) |
| `lib/intelligence-stack-e2e.test.ts` | Cross-layer smoke |

Run architecture health in tests:

```bash
npm test -- --run lib/adaptiveCompanionArchitecture.test.ts lib/futureCapabilityArchitecture.test.ts
```

See also: `24_Future_Capability_Architecture.md` for ecosystem capability categories and registration channels.

---

# What We Are Not Building

- A chatbot
- A planner
- A productivity app
- A collection of disconnected AI features

We are building an **adaptive companion platform** that becomes more intelligent, personalized, helpful, and effective every year.

**Design for evolution. Design for adaptation. Design for continuous intelligence growth.**
