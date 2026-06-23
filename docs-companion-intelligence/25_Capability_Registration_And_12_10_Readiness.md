# Capability Registration & 12/10 Readiness
## ADHD Business Ecosystem™ — Companion Architecture Sprint

**Version:** 1.0  
**Authority:** Subordinate to `21_Companion_Constitution.md`  
**Companion to:** `24_Future_Capability_Architecture.md`  
**Machine registries:**
- `lib/companionCapabilityRegistry.ts`
- `lib/companionCapabilityReadiness.ts`

---

# Mission

The ecosystem must become a **12/10 adaptive companion platform** — one intelligent ADHD entrepreneur companion that knows every capability, learns from every interaction, routes only when helpful, and improves over time.

---

# 12/10 Standard

A capability is **not done** when it works. It is done when the companion can:

1. Understand when the user needs it  
2. Explain why it may help  
3. Ask permission before opening it  
4. Pass context into it  
5. Continue the thread inside it  
6. Learn whether it helped  
7. Use that learning next time  
8. Protect trust, confidence, and momentum  

---

# Capability Registry

Every capability registers in `COMPANION_CAPABILITY_REGISTRY` with:

| Section | Fields |
|---------|--------|
| **Identity** | id, name, category, status, ownerModule, routingType |
| **User need mapping** | surface intents, actual needs, ADHD patterns, business situations, emotional states, friction types |
| **Routing rules** | intent patterns, when to offer / not, confidence threshold, contraindications, permission language |
| **Context contract** | user goal, problem, project, profile, avatar, thread, emotional state, energy, learning style, outcome thread |
| **Learning signals** | offer shown/accepted/dismissed, opened, completed, abandoned, returned, success, frustration |
| **Outcome signals** | reduce overwhelm, decide, start/finish action, confidence, momentum, business progress |

### Routing types

| Type | Behavior |
|------|----------|
| `workspace` | Permission-first open beside chat (`matchRegisteredCapabilityForText`) |
| `intelligence` | In-conversation support (`sales_call_support`, `visibility_support`) |
| `future` | Lightweight hook — identity + need mapping until shipped |

---

# Registry-Driven Routing

**Before:** Hardcoded `RULES[]` in `companionEcosystemIntent.ts`  
**After:** `detectEcosystemProblemIntent()` → `matchRegisteredCapabilityForText()`

The companion asks:

> *What registered capability best fits this actual need?*

Not:

> *Does this string match one hardcoded feature?*

`companionIntelligenceRouter.ts` injects `capabilityRoutingHintForChat()` into turn intelligence.

### Intentional exceptions

- **Adapt My Day** — registered for readiness tracking; offers remain in `CompanionPageClient.tsx` (`isAdaptMyDayIntent`) to avoid duplicate routing.  
- **Explicit write-in-chat** — `help me write/draft` suppressed from auto-workspace routing (stay in co-creation).

---

# Intervention Tracking

`recordCapabilityIntervention()` connects capabilities to `interventionRegistry` buckets via `recordTrustEvidence()`:

```typescript
recordCapabilityIntervention({
  capabilityId: "clear_my_mind",
  action: "offer_accepted",
  reason: "mental_load",
  confidence: 0.85,
});
```

Required for Adaptive User Intelligence™ and intervention effectiveness analytics.

---

# Readiness Scoring

`buildCompanionReadinessScore(capabilityId)` scores nine dimensions:

- Discoverability  
- Routing quality  
- Context carryover  
- Learning feedback  
- Outcome tracking  
- Trust impact  
- Confidence impact  
- Momentum protection  
- Future scalability  

### Thresholds

| Status | Overall score | Gate |
|--------|---------------|------|
| **production** | 90+ | `validateCapabilityDesign()` + `runVision2029Test()` |
| **partial** | 75+ | Same |
| **future** | Minimum registration | Identity + need mapping + context contract |

Run portfolio:

```bash
npm test -- --run lib/companionCapabilityRegistry.test.ts lib/companionCapabilityReadiness.test.ts
```

---

# Registered Capabilities (Sprint)

### Production (12)
Clear My Mind, Decision Compass, Plan My Day, Create Workspace, Content Tools, Templates, Strategies, Snippets, Projects, (+ Adapt My Day tracked)

### Partial (10)
Adapt My Day, Focus Audio, Voice, Email, Calendar, Social Posting, Client Avatar, Sales Call Support, Visibility Support

### Future hooks (7)
Analytics, Knowledge Vault, SOP Builder, PostCraft, GHL, Founder Intelligence, Offer Intelligence

---

# Pre-Build Checklist

1. Add entry to `COMPANION_CAPABILITY_REGISTRY`  
2. `validateCapabilityDesign()` — five properties  
3. `runVision2029Test()` — registration + companion center  
4. `validateFutureFeature()` — seven outcome questions (doc 23)  
5. `buildCompanionReadinessScore()` — meet threshold for status  
6. Wire `recordCapabilityIntervention` on offer/accept/dismiss in UI (incremental)  
7. No new hardcoded branches in `CompanionPageClient.tsx` for routing logic  

---

# Remaining Debt (incremental)

| Area | Next step |
|------|-----------|
| `CompanionPageClient.tsx` | Emit `recordCapabilityIntervention` on workspace offers |
| `companionRouting.ts` | Migrate emotional-state tool map to registry |
| PostCraft / GHL / Calendar | Companion-first registration when shipped |
| Intervention attribution | Enable learning gates for effectiveness loop |

---

# Ultimate Goal

Every capability can be **discovered, routed, personalized, learned from, measured, and expanded** without rewriting the foundation.

This is how the app moves from good to **12/10**.
