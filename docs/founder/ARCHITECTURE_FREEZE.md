# Founder Studio™ — Architecture Freeze

**Version 1.0 · Binding as of July 2026**

| | |
|---|---|
| **Status** | **FROZEN** — architecture complete · **implementation transition active** |
| **Transition** | [FOUNDER_V1_IMPLEMENTATION_TRANSITION.md](./FOUNDER_V1_IMPLEMENTATION_TRANSITION.md) |
| **Supersedes** | Open-ended Founder architecture sprints |
| **Does not freeze** | Implementation, integrations, UX polish, real data, learning |
| **Entry point** | [FOUNDER_V1.md](./FOUNDER_V1.md) |

---

## Declaration

**Founder Studio Version 1.0 architecture is complete.**

We are no longer designing Founder. We are now building Founder.

The executive intelligence stack, room model, composition layers, and documentation authority are defined. Future development **implements and refines** this vision — it does not redesign it.

Binding transition: [FOUNDER_V1_IMPLEMENTATION_TRANSITION.md](./FOUNDER_V1_IMPLEMENTATION_TRANSITION.md)

This freeze mirrors the discipline applied to Spark Conversation Architecture (Specs 105–131): **discover and refine from evidence**, do not architect from impulse.

---

## What is frozen

| Domain | Frozen element |
|--------|----------------|
| **Intelligence engines** | The engine set in `lib/intelligence/INTELLIGENCE_REGISTRY.md` — no new executive engines |
| **Headquarters model** | Executive Command Center™ as single morning surface — six panels, six questions, one recommendation |
| **Composition pattern** | Engines compose via bridges; Command Center composes engines — no parallel dashboards |
| **Room catalog** | Founder rooms in `lib/founderStudio/rooms.ts` — no new rooms without freeze override |
| **Attention model** | Rule of One primary recommendation; Rule of Three where expansion is offered |
| **Permission model** | Draft-only prep; no auto-execute, auto-publish, auto-send |
| **Documentation authority** | `docs/founder/` governance docs + Constitution + Blueprint hierarchy |
| **Naming** | Canonical ™ names for executive systems (see registry) |

---

## What may still evolve (explicitly allowed)

Future work follows **five priorities** — see [FOUNDER_V1_IMPLEMENTATION_TRANSITION.md](./FOUNDER_V1_IMPLEMENTATION_TRANSITION.md):

| Priority | Work type |
|----------|-----------|
| **1** | **Real implementation** — sample repositories → live data |
| **2** | **Real integrations** — PostCraft, GHL, GitHub, Cursor, Google, AI Studio, social |
| **3** | **Executive experience** — typography, spacing, motion, accessibility, calm polish |
| **4** | **Companion intelligence** — better recommendations and learning in *existing* engines |
| **5** | **Automation** — prepare, recommend, monitor, review — always permission-gated |

Also allowed: **performance**, **refinement**, **copy**, **scoring weights**, **edge cases**.

**Not allowed:** new intelligence layers, duplicate dashboards, architecture expansion without override.

---

## What is NOT allowed without explicit founder override

| Prohibited | Why |
|------------|-----|
| **New intelligence engines** | Duplicates composition; increases cognitive load |
| **Duplicate systems** | Two places for the same executive question violates One Office |
| **New dashboards** | Founder is headquarters, not a tile farm |
| **Additional architecture layers** | Stack is complete; deepen don't stack |
| **Unnecessary features** | Must pass [NO_FEATURE_CREEP.md](./NO_FEATURE_CREEP.md) |
| **Feature-first rooms** | Rooms are places; features live inside composition |
| **Bypassing Judgment** | Nothing speaks to Shari without competing fairly for attention |
| **Bypassing permission** | Preparation yes; action only with approval |

---

## Override process

Architecture freeze may be overridden only when **all** are true:

1. Written proposal explains why existing capability cannot serve the need  
2. [NO_FEATURE_CREEP.md](./NO_FEATURE_CREEP.md) — majority yes on gate questions  
3. [EXECUTIVE_VALUE_SCORE.md](./EXECUTIVE_VALUE_SCORE.md) — score exceeds current backlog top quartile  
4. Shari explicit approval — architecture change is a founder decision, not a developer convenience  

Default answer to "should we add a new engine/room/dashboard?" is **no — improve what exists**.

---

## Relationship to other freezes

| System | Freeze document |
|--------|-----------------|
| Spark Conversation | `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` |
| Spark Estate places | `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md` |
| Founder Studio | **This document** |

Founder and Companion are siblings — Founder never surfaces system errors, never speaks like software to members, and never merges member conversation architecture with executive architecture.

---

## Success criterion

The freeze succeeds when, one year from now:

- The **room list and engine registry** are recognizably the same  
- Sample data is largely **replaced** with real integrations  
- Recommendations are **measurably better** — not structurally different  
- Shari still opens **Executive Command Center™** first — and trusts it more  

**Stable architecture. Evolving intelligence.**
