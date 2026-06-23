# Future Capability Architecture Review
## ADHD Business Ecosystem™ — Design For What Is Coming

**Version:** 1.0  
**Authority:** Subordinate to `21_Companion_Constitution.md`  
**Companion to:** `23_Adaptive_Companion_Architecture.md`  
**Machine registry:** `lib/futureCapabilityArchitecture.ts`  
**12/10 registration:** `docs-companion-intelligence/25_Capability_Registration_And_12_10_Readiness.md` · `lib/companionCapabilityRegistry.ts`

---

# Critical Reminder

The **current application is only the first visible layer** of the ecosystem.

Many major capabilities have **not yet been built**. Architecture decisions made today must support future capabilities **without major redesign**.

Before implementing any new feature, evaluate it against this document and the programmatic gates in `futureCapabilityArchitecture.ts`.

---

# Architecture Rule

Every new feature should eventually become:

| # | Property | Meaning |
|---|----------|---------|
| 1 | **Observable** | Emits signals; measurable in tests, inspectors, analytics |
| 2 | **Learnable** | Outcomes feed profile evolution and effectiveness scores |
| 3 | **Personalizable** | Adapts to user rhythms, style, and history |
| 4 | **Predictable** | Risk/opportunity hints before failure (advisory only) |
| 5 | **Companion-connected** | Routed through companion intelligence, not a silo |

**If not → reconsider the design.**

Gate: `validateCapabilityDesign()`

---

# Avoid Future Technical Debt

**Do not hardcode logic around:**

- Specific workspaces
- Specific tools
- Specific boards
- Specific interventions
- Specific content types

**Instead:** build systems that allow future capabilities to **register themselves**.

### Registration channels (use these)

| Channel | Module | Use when |
|---------|--------|----------|
| `intervention_registry` | `interventionRegistry.ts` | Companion offers a tool/intervention |
| `signal_registry` | `signalRegistry.ts` | User actions should evolve profile/trust |
| `app_feature_knowledge` | `appFeatureKnowledge.ts` | How-to / navigation routing |
| `ecosystem_intelligence_layer` | `ecosystem-intelligence/` | Vertical offers with priority/suppression |
| `companion_ecosystem_intent` | `companionEcosystemIntent.ts` | Need → feature mapping from chat |
| `tool_routing` | `companionRouting.ts` | Emotional-state routing (migrate to registry) |

**Anti-pattern:** New `if (section === 'foo')` branches in `page.tsx`.

**Target contract:** `EcosystemCapabilityRegistrationContract` in `futureCapabilityArchitecture.ts`.

---

# Companion First Rule

The user should **never** feel they are moving between disconnected tools.

The companion remains the **center** of the experience.

Every future capability should feel like:

> *The companion helping me.*

Not:

> *Opening another module.*

Gate: `runVision2029Test({ companionRemainsCenter: true, ... })`

---

# 2029 Vision Test

Before **major** implementation ask:

> If the ecosystem is **10× larger** in 2029 — will this architecture still work?

If not → **redesign before building.**

Gate: `runVision2029Test()`

---

# Future Capability Categories

Portfolio snapshot (machine-generated): run `formatFutureCapabilityReviewText()` or tests in `futureCapabilityArchitecture.test.ts`.

## 1. Companion Intelligence

| Capability | Status | Registration |
|------------|--------|--------------|
| Trust Engine | Partial | signal_registry |
| Confidence Engine | Partial | signal_registry |
| Adaptive User Intelligence | Partial | signal_registry |
| Predictive Intelligence | Partial | ecosystem_intelligence_layer |
| Relationship Intelligence | Partial | ecosystem_intelligence_layer |
| Learning Intelligence | Stub | signal_registry (gated OFF) |
| Founder Intelligence | Partial | **unregistered** — founder stack only |

**Priority:** Wire founder intelligence companion-first; enable learning path.

---

## 2. Business Intelligence

| Capability | Status | Notes |
|------------|--------|-------|
| Business Profile | Partial | Workspace + chat |
| Client Avatar Intelligence | Partial | Feature knowledge |
| Offer Intelligence | **Future** | Must register before build |
| Marketing Intelligence | Partial | `companionVisibilityIntelligence.ts` |
| Sales Intelligence | Partial | `companionSalesIntelligence.ts` |
| Launch Intelligence | Partial | Validation scenarios (offline) |
| Financial Intelligence | **Future** | Founder revenue module exists |

**Priority:** Offer + financial intelligence as registered companion capabilities.

---

## 3. Content Ecosystem

| Capability | Status | Notes |
|------------|--------|-------|
| Create Workspace | Production | intervention_registry |
| Content Planning | Partial | |
| Content Generation | Partial | API + create bucket |
| Content Repurposing | **Future** | |
| Social Posting | Partial | PostCraft — not companion-centered |
| Analytics Feedback | **Future** | |
| Trend Detection | Partial | Founder-only generator |

**Priority:** Repurposing, analytics feedback, companion-routed PostCraft.

---

## 4. Knowledge Ecosystem

| Capability | Status | Notes |
|------------|--------|-------|
| Knowledge Vault | **Future** | |
| SOP Builder | **Future** | |
| Templates | Production | app_feature_knowledge |
| Strategies | Production | app_feature_knowledge |
| Snippets | Production | app_feature_knowledge |
| User Knowledge Graph | Stub | Trait graph only today |

**Priority:** Vault + SOP as knowledge registrations, not new sidebars.

---

## 5. Productivity Ecosystem

| Capability | Status | Notes |
|------------|--------|-------|
| Plan My Day | Production | intervention_registry |
| Adapt My Day | Production | companion_ecosystem_intent |
| Clear My Mind | Production | intervention_registry |
| Decision Compass | Production | companion_ecosystem_intent |
| Projects | Production | app_feature_knowledge |
| Focus Systems | Production | tool_routing (hardcoded — migrate) |
| Energy Systems | Partial | user-health vertical |

**Strength:** Strongest companion-first category today.

**Debt:** `companionRouting.ts` emotional-state → tool map should move to registry.

---

## 6. Communication Ecosystem

| Capability | Status | Notes |
|------------|--------|-------|
| Email | Partial | email-generator |
| Calendar | Partial | Google — not companion-routed |
| Voice | Partial | TTS API |
| Meetings | **Future** | |
| Client Communications | **Future** | |
| Social Media | Partial | PostCraft |

**Priority:** Calendar + meetings as companion-co-work, not separate app.

---

## 7. Analytics Ecosystem (mostly future)

Tracks (when built):

- User behavior
- Business behavior
- Content performance
- Sales performance
- Momentum patterns
- Completion patterns
- Intervention effectiveness

| Capability | Status |
|------------|--------|
| User behavior analytics | Partial |
| Momentum pattern analytics | Partial |
| Completion pattern analytics | Partial |
| Intervention effectiveness | Stub (attribution blocker) |
| Content / sales / business analytics | **Future** |

**Priority:** Close intervention attribution loop — unlocks entire analytics layer.

---

# Portfolio Health (indicative)

Run `evaluateFutureCapabilityPortfolio()` for live counts.

Typical snapshot:

- **~45+ capabilities tracked**
- **~12 production** (mostly productivity + knowledge)
- **~15+ future** (not yet built)
- **~15+ unregistered** (partial/production but not on a registration channel)
- **Companion-disconnected** capabilities need companion-first wiring before scale

---

# Pre-Implementation Checklist

Before any major feature:

1. `validateFutureFeature()` — seven questions from `23_Adaptive_Companion_Architecture.md`
2. `validateCapabilityDesign()` — five architecture properties
3. `runVision2029Test()` — 10× scale + registration + companion center
4. Add entry to `FUTURE_CAPABILITIES` in `futureCapabilityArchitecture.ts`
5. Register via appropriate channel (not `page.tsx` conditionals)
6. Add validation scenarios if behavioral (Layer 2)

```bash
npm test -- --run lib/futureCapabilityArchitecture.test.ts lib/adaptiveCompanionArchitecture.test.ts
```

---

# What We Are Building

Not a chatbot. Not a planner. Not a productivity app. Not disconnected AI features.

An **adaptive companion platform** that can:

- Continuously **grow**
- Continuously **learn**
- Continuously **expand**
- **Integrate** new capabilities
- Become increasingly **personalized**

…without foundational rewrites.

**Design for the ecosystem we know is coming — not just the features visible today.**
