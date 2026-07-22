# 132 — Experience Perfection and Momentum Protection Standard™

**Status:** Binding product law — permanent governance  
**Date:** 2026-07-21  
**Authority class:** Product constitution (extends series **113–117** · complements **128** and **131**)  
**Cursor rule:** `.cursor/rules/experience-perfection-momentum-protection.mdc`  
**Runtime types:** `lib/sparkMomentumProtection/types.ts`  
**Runtime hooks:** `lib/windowDismiss/` · Create working-session Escape dirty guard

**Related:** [128 Simplicity & Cognitive Load](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) · [131 Create Intelligence & Intent](./131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md) · [113 Product Constitution](./113_SPARK_ESTATE_PRODUCT_CONSTITUTION.md) · [series index](./README.md) · [The Member Wins™](../THE_MEMBER_WINS.md) · [Create 127–130](../create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION.md)

> **Source filename note:** The founding prompt was labeled `32_EXPERIENCE_PERFECTION_AND_MOMENTUM_PROTECTION_STANDARD.md`. Series position is **132** — next to Create / constitution track **127–131**.

> **Namespace note:** Create Blueprint track documents under `docs/create-experience/132_product_launch_event/` use the same numeral for a different series. **This file (132 Constitution)** governs Estate-wide experience perfection and momentum protection. Create 132 Product Launch Event Blueprint does not override this law.

> **Conflict rule:** Spec **128** still wins on complexity, architecture exposure, and ADHD/simplicity certification. Spec **131** still governs Create intent understanding. Spec **130** One Creation Rule™ still wins — never silently create Work. This Standard (132) governs momentum, polish, intentional navigation, interface truthfulness, and the Ten-Second Rule.

---

## Mission

Spark Estate is no longer being evaluated solely on functionality.

It is now evaluated on how well it protects the user's momentum.

Every interaction should:

- preserve thinking
- reduce interruption
- maintain trust

Small inconsistencies matter because they interrupt cognitive flow.

The platform must continuously eliminate them.

---

## Constitutional Principle

**Never surprise the user. Never interrupt momentum. Never make recovery harder than continuation.**

---

## Momentum Protection Rules (1–12)

### 1. Protect Momentum Above Everything

The platform's highest UX priority is maintaining momentum.

Whenever two valid behaviors exist, choose the one that is least likely to interrupt the user's thinking.

### 2. Every Navigation Event Must Be Intentional

The system must never unexpectedly move a user to another location.

Example: **Escape** should:

- close
- collapse
- cancel
- dismiss

before it ever changes location.

Escape must never navigate away from a working session unless the user explicitly configured it.

### 3. Protect In-Progress Thinking

If unfinished work exists:

- Leaving should require an intentional user decision.
- Unexpected navigation should never discard focus.

### 4. One Navigation Path

Every major destination should have one obvious route.

Avoid:

Create → Create → Create → Workspace

Instead:

Create → Workspace

One destination. One path.

### 5. Interface Truthfulness

Everything visible must accurately represent reality.

Progress · Counts · Labels · Statuses · Step numbers · Completion · Current Focus must always agree.

The interface must never contradict itself.

### 6. Never Create Hidden Anxiety

Small inconsistencies create doubt.

Example: “4 steps” labeled when only 3 are visible → the member wonders “Did I miss something?”

Spark Estate should eliminate these moments.

### 7. Progressive Disclosure Must Stay Progressive

When optional sections are opened, they should remain calm.

No optional panel should become another dashboard.

Large collections should automatically:

- group
- collapse
- recommend
- search

rather than expose everything simultaneously.

### 8. Momentum Recovery

Whenever interruption occurs, Spark Estate should immediately help the user continue.

Prefer: “You were writing your Flyer. Ready to continue?”

Never: “Welcome Home. Goodbye. Start over.”

### 9. Every Interaction Must Build Trust

Ask: Would this interaction increase confidence — or cause uncertainty?

Uncertainty should be removed.

### 10. Interface Polish Matters

At Spark Estate's quality level, tiny issues are not tiny.

One incorrect count · one broken keyboard shortcut · one confusing label · one duplicate menu can collectively erode trust.

Every release should eliminate dozens of these small interruptions.

### 11. Measure Momentum Loss

Future usability testing should measure:

- Times the user hesitated
- Unexpected navigation
- Wrong assumptions
- Recoveries
- Repeated clicks
- Backtracking
- Searching
- Abandoned work

Those are better indicators than click counts.

**Runtime IDs:** `SparkMomentumLossMetricId` in `lib/sparkMomentumProtection/types.ts`.

### 12. Final 12/10 Certification

Before any major experience is certified, ask independent reviewers:

1. Did anything interrupt your thinking?
2. Did anything surprise you?
3. Did you ever wonder what to do?
4. Did you ever lose confidence?
5. Did you ever feel lost?
6. Did you stop thinking about your work and start thinking about the software?

If any answer is **yes** → continue refining.

**Runtime IDs:** `SparkMomentumProtectionCertificationQuestionId` in `lib/sparkMomentumProtection/types.ts`.

---

## Ultimate Product Principle

The best version of Spark Estate is the one the user almost forgets they are using.

When the user says:

> “I just kept working.”

rather than:

> “I figured out the app.”

the platform has succeeded.

---

## One more thing — progression note

Usability reviews move from architecture → polish. That is the desired progression.

At first, comments are about major architectural friction:

- wrong Work Type
- too many decisions
- duplicate entry points
- overwhelming maps
- confusing navigation

Later, comments are about:

- the Escape key
- a progress count mismatch
- a redundant menu item

That means reviewers are no longer fighting the platform — they are noticing the details. The overall experience has become intuitive enough for small imperfections to stand out. Protect that progress; keep refining the details.

---

## Permanent release gate — The Ten-Second Rule™

For every new feature, ask:

> Can a first-time user understand what to do within ten seconds without reading documentation or being taught?

If the answer is **no**, do not ship it yet.

This rule aligns with:

- Companion First
- One Question
- One Focus
- Everything Else Can Wait
- Simplicity Constitution (128)
- Momentum Protection (this Standard)

**Purpose:** Keep Spark Estate from becoming a powerful platform that slowly grows harder to use. A simple, practical test that protects the experience as capability expands.

**Runtime constant:** `SPARK_TEN_SECOND_RULE` / `SPARK_TEN_SECOND_RULE_QUESTION` in `lib/sparkMomentumProtection/types.ts`.

---

## Order of authority

When this Standard conflicts with feature convenience or polish shortcuts:

1. User trust and safety  
2. **113 Product Constitution**  
3. **128** on mental load / architecture exposure / ADHD gates  
4. **130** One Creation Rule™ (confirm before Work exists)  
5. **131** on Create intent understanding  
6. **This Standard (132)** on momentum, intentional navigation, truthfulness, polish, Ten-Second Rule, and 12/10 cert  
7. Create experience specs **127–129**  
8. Implementation convenience  

---

## Relationship to sibling law

| Document | Relationship |
|----------|----------------|
| [128 Simplicity](./128_SPARK_ESTATE_SIMPLICITY_AND_COGNITIVE_LOAD_CONSTITUTION.md) | Wins on complexity; 132 deepens momentum / polish / Ten-Second Rule |
| [131 Create Intent](./131_CREATE_INTELLIGENCE_AND_INTENT_CONSTITUTION.md) | Intent before artifact; 132 protects flow once Create work is open |
| [130 Create Polish](../create-experience/130_CREATE_EXPERIENCE_FINAL_POLISH_AND_CERTIFICATION.md) | Confirm-everywhere + 12/10 Create checklist; 132 is Estate-wide |
| [The Member Wins™](../THE_MEMBER_WINS.md) | Member ease; 132 operationalizes “kept working” |

---

**Status:** Permanent v1.0 — binding
