# Phase 3 — Adaptive Relationship Intelligence

**Registry ID:** `phase_3_adaptive_relationship`  
**Module:** `lib/phase3AdaptiveRelationship.ts`  
**Storage key:** `companion-phase3-adaptive-relationship-v1`  
**Status:** `active`

---

## Phase Name

Adaptive Relationship Intelligence

---

## Purpose

Learn patterns and anticipate needs — move from reactive help to relationship-aware support.

Tagline: *"Learn patterns and anticipate needs."*

---

## User Experience

The user should feel:

- The companion remembers recurring friction (Mondays, visibility, decision loops)
- Help arrives with context — not generic coaching
- Milestone: *"You understand my patterns."*

---

## Intelligence Goal

Maintain **predictive patterns** and a **user operating manual** derived from Phase 2 discovery + intervention effectiveness.

---

## Activation Requirements

`isPhase3AdaptiveRelationshipActive(now)` requires **all**:

1. Phase 1 complete
2. ≥**5** sessions **OR** ≥**14** relationship days (`MIN_PHASE3_SESSIONS`, `MIN_PHASE3_DAYS`)
3. **Either:**
   - ≥1 ADHD pattern with count ≥2 in Phase 2, **or**
   - ≥1 predictive pattern with count ≥2 in Phase 3 state, **or**
   - Phase 2 learning-style confidence ≥ **0.4**

---

## Companion Behaviors

- `observePhase3Turn()` — maps user text to predictive patterns (Monday friction, decision loops, etc.)
- Promotes ADHD patterns from Phase 2 into predictive patterns
- `buildUserOperatingManual()` — friction, momentum, decision preferences
- `phase3AdaptiveRelationshipHintForChat()` — chat guidance when active
- Evaluates milestones: `understand_patterns`, `help_before_ask`

---

## Intelligence Collected

`Phase3AdaptiveRelationshipState`:

- `predictivePatterns[]` — id, label, count, confidence (`early` | `growing` | `strong`), lastSeen
- `milestones` — boolean flags for relationship milestones
- Cross-reads Phase 2 patterns, resources, learning style, challenges
- Reads `getUserInterventionEffectiveness()` for adaptive weight ≥50 interventions

---

## Outputs

- User Operating Manual sections (how they learn, decide, build confidence, friction, momentum)
- Predictive pattern labels for panel display
- Foundation for Phase 4 business partnership activation (Phase 4 requires Phase 3 active)

---

## Example Conversations

*Recovered from implementation behavior.*

**Pattern-aware support**

> **User:** It's Monday and I'm already behind — everything feels hard.  
> **Shari:** *(Phase 3 may have `monday_friction` pattern elevated.)* Monday mornings have been a friction point for you before. Want one small win before the week runs away?

**Anticipation milestone**

> *(After ≥8 sessions, helpful resource score ≥60, learning confidence ≥0.45, and patterns present — `help_before_ask` milestone may be true.)*

---

## Future Expansion Opportunities

Reserved for future specification:

- Dedicated Phase 3 panel section (currently folded into operating manual displays)
- Expanded predictive pattern library beyond `PATTERN_SIGNALS` in module
