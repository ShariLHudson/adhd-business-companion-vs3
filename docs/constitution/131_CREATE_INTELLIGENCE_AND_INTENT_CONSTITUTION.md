# 131 — Create Intelligence & Intent Constitution™

**Status:** Binding product law — permanent governance  
**Date:** 2026-07-21  
**Authority class:** Product constitution (extends series **113–117** · Create-facing companion to **128**)  
**Cursor rule:** `.cursor/rules/create-intelligence-intent-constitution.mdc`  
**Runtime types:** `lib/sparkCreateIntentConstitution/types.ts`  
**Runtime hooks:** `lib/createEstate/createIntentConfirmation.ts` · `lib/createEstate/resolveCreateBeginOutcome.ts`

**Related:** [128 Simplicity & Cognitive Load](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) · [113 Product Constitution](./113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md) · [series index](./README.md) · [Create 127](../create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION.md) · [Create 129](../create-experience/129_CREATE_EXPERIENCE_POLISH_AND_DECISION_FRICTION_ELIMINATION.md) · [Create 130](../create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION.md) · [Spec 104 Create Philosophy](../CREATE_EXPERIENCE_PHILOSOPHY.md) · [The Member Wins™](../THE_MEMBER_WINS.md)

> **Conflict rule:** Spec **128** wins on complexity, architecture exposure, and ADHD/simplicity certification. Spec **130** One Creation Rule™ still wins — never silently create Work. This Constitution (131) governs *how intent is understood* before confirmation.

---

## Mission

Understand what the user wants to **accomplish** — not keyword match.

Users never learn to “talk to the system.”

Spark adapts to how people think and speak. The member describes a desired outcome; Spark infers intention, confirms when needed, and opens the right work.

---

## Constitutional Principle

**Infer the user’s goal, not just their words.**

Outcomes → intentions → (only then) artifacts / Work Types.

A flyer *for* a workshop is promotional material supporting an event — not a Workshop Plan. Spark must recognize the outcome the member named first.

---

## Intent Rules (1–15)

### 1. Intent Before Artifact

Match the **job to be done**, not the first noun that exists in a catalog.

Example: “flyer for my workshop” → promotional deliverable (Flyer), not Workshop / Event Plan.

### 2. Offer Smart Alternatives

When confidence is below ~95%, do not force a single silent guess.

Present:

- **Most likely** interpretation  
- **Also considered** (2–4 options when medium confidence)

Never create Work from a medium-confidence guess without confirmation (**130**).

### 3. Never Make Users Rewrite

If Spark misread intent, the member chooses another interpretation — they do not retype the whole request to “speak correctly.”

### 4. Intent Categories First

Classify the **intent category** before Work Type:

document · project · plan · strategy · campaign · communication · deliverable · business asset · event

Then refine Work Type inside that category.

### 5. Recognize Relationships

Distinguish **NEW** work from work that **supports EXISTING** work (e.g. a flyer for an existing workshop vs creating a new workshop).

V1: surface the distinction in confirmation language when both interpretations are plausible. Full relationship graph UI is not required here.

### 6. Suggest Before Asking Again

Prefer: “I think you meant one of these…”

Over: blank re-prompt that ignores what they already said.

### 7. More Ways to Start — Calm

Optional start paths stay optional. **≤3 visible decision layers** on Create entrance (Continue Working → Start Something New → More Ways; nested tools stay progressive).

### 8. One Search, Many Results

Natural language Begin is the primary search. Catalogs and frameworks are supporting results — not competing entry exams.

### 9. Context Beats Catalogs

Active work, recent types, and the member’s wording outweigh alphabetical browsing when recommending.

### 10. Navigation Should Confirm Location

When Spark opens Create work, the member should feel: “Yes — this is where that belongs,” not “Did I pick the wrong module?”

### 11. Empty States Must Match Reality

If there is nothing to continue, **Continue Working does not appear**. Empty teaching copy belongs only where an empty list is intentional (e.g. Previous Work inside More Ways).

### 12. Confidence Drives Behavior

| Band | Behavior |
|------|----------|
| **Very high** (~≥95%) | Recommend most likely · confirm Yes / Choose something else |
| **Medium** | Most likely + 2–4 also-considered options |
| **Low** | One clarifying question |
| **Any** | Never silent guess that creates Work |

### 13. Learn From Corrections

When a member rejects an interpretation and picks another, that correction is a signal.

**V1:** hooks and logging shape only. **Intent Memory™** (per-member pattern learning) is a future capability — see below.

### 14. Measure Success

Success = **correct work on the first attempt** (after at most one confirmation), not catalog clicks or time-on-page.

### 15. Certification Gates

No Create intent change is complete without passing the Create Intent Certification gates (below). Working keyword matching that still creates the wrong Work fails.

---

## Create Intent Certification (all must pass)

1. Intent understood before artifact selection  
2. Alternatives offered when confidence &lt; ~95%  
3. Member never forced to rewrite to correct intent  
4. Intent category considered before Work Type  
5. New vs supporting-existing recognized when both plausible  
6. Suggests interpretations before empty re-ask  
7. More Ways ≤3 visible decision layers  
8. One natural-language start; catalogs secondary  
9. Context-aware suggestions beat bare catalogs  
10. Opening work confirms location (human titles, Current Focus)  
11. Continue Working hidden when empty  
12. Confidence bands drive confirm / alternatives / clarify — never silent create  
13. Correction hooks present (Intent Memory deferred)  
14. First-attempt correctness is the stated success metric  
15. Feels natural — adapts to how people think and speak (Shari test)

**Runtime IDs:** `SparkCreateIntentCertificationGateId` in `lib/sparkCreateIntentConstitution/types.ts`.

---

## Final Constitutional Principle

Spark Create intelligence is measured by how well it **adapts to how people already think and speak** — not by how precisely members must name Work Types.

---

## Future capability — Intent Memory™

**Status:** Documented · **not** built as a full personalization system in this release.

Per-member pattern learning (e.g. “when I say flyer I always mean Lead Magnet”) may later:

- Store correction signals with permission (Spec 112 trust gate)  
- Bias medium-confidence ranking toward the member’s history  
- Expire stale patterns  

**V1 hooks only:** confidence bands, also-considered lists, promotional-deliverable heuristics, correction-ready confirm UI. No new durable Intent Memory store until storage and Spec 112 permission paths are explicit.

Parked for milestone tracking: [Parking Lot — Create Intent Memory™](../PARKING_LOT.md).

---

## Order of authority

When this Constitution conflicts with feature convenience or keyword shortcuts:

1. User trust and safety  
2. **113 Product Constitution**  
3. **128** on mental load / architecture exposure / ADHD gates  
4. **130** One Creation Rule™ (confirm before Work exists)  
5. **This Constitution (131)** on intent understanding  
6. Create experience specs **127–129**  
7. Implementation convenience  

---

## Relationship to sibling law

| Document | Relationship |
|----------|----------------|
| [128 Simplicity](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) | Wins on complexity; 131 must not add decision fatigue |
| [130 Create Polish](../create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION.md) | Confirm-everywhere; 131 enriches *what* is confirmed |
| [127 Create Simplification](../create-experience/127_CREATE_EXPERIENCE_SIMPLIFICATION.md) | Companion-first Create; 131 deepens intent intelligence |
| [Spec 104](../CREATE_EXPERIENCE_PHILOSOPHY.md) | Intent before output; 131 is constitutional enforcement for Create routing |
| [132 Momentum Protection](./132_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md) | Protects flow once Create work is open; Escape / soft leave / Ten-Second Rule |

---

**Status:** Permanent v1.0 — binding
