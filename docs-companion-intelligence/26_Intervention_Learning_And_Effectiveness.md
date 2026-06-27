# Intervention Learning Engine & Companion Effectiveness System
## Sprint 8 — Continuously Improving Companion

**Version:** 1.0  
**Modules:**
- `lib/companionInterventionLearning.ts`
- `lib/companionEffectiveness.ts`

---

# Philosophy Shift

**Old goal:** Did the companion give a smart response?  
**New goal:** Did the user move forward?

Optimize for progress, confidence, momentum, trust, and outcomes — not impressive analysis.

---

# Intervention Lifecycle

```
Recommendation → Accepted/Dismissed → Opened → Used → Completed → Returned → Outcome
```

Tracked per intervention at **user level** and **ecosystem level** (localStorage).

### API

```typescript
recordInterventionLifecycle({ interventionId, stage });
recordCapabilityIntervention({ capabilityId, action }); // also updates lifecycle
getUserInterventionEffectiveness();
getAdaptiveInterventionWeight("clear_my_mind");
rankInterventionsForContext({ emotionalState: "overwhelmed" });
```

---

# Adaptive Weighting

`adaptiveWeight` combines acceptance, completion, reported usefulness, momentum impact, and confidence impact.

When overwhelmed, ranking prefers historically effective interventions (e.g. Clear My Mind 85% vs Decision Compass 15%).

---

# Companion Effectiveness Score

`buildCompanionEffectivenessScore()` — dimensions:

- Progress, Confidence, Momentum, Trust, Completion, Follow-through, Intervention success, Business movement

### User Outcome Profile

`recordUserOutcome()`, `getUserOutcomeProfile()` — tracks decisions, actions, completions, confidence, momentum, and business outcomes.

### Learning Style Validation

`recordLearningStyleOffer()` — measures **action rate**, not preference alone.

### Predictive Hooks (future)

`getPredictiveRiskFramework()` — burnout, launch avoidance, visibility avoidance, follow-through, confidence crash (storage only, `enabled: false`).

---

# Privacy

Learns patterns, not judgments. Never labels, shames, or presents negative scores to users.

---

# Integration

- `companionCapabilityRegistry.ts` → lifecycle on every intervention event
- `companionAdaptiveUserEngine.ts` → `computeInterventionEffectiveness()` reads learning data
- `companionIntelligenceRouter.ts` → injects learning + effectiveness hints

```bash
npm test -- --run lib/companionInterventionLearning.test.ts lib/companionEffectiveness.test.ts
```
