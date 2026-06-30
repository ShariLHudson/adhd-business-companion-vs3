# SPEC 115 — Spark Conversation Examples™

> **Superseded by [Spec 116 — Conversation Gold Standards](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md).**  
> Use `docs/conversation-gold-standards/` and `lib/sparkConversationGoldStandards/types.ts` going forward.

## Gold-Standard Conversations for Every Scenario

| Field | Value |
|-------|-------|
| **Spec ID** | 115 |
| **Title** | Spark Conversation Examples™ |
| **Version** | 1.0 |
| **Status** | Foundational Reference |
| **Priority** | Critical — release gate for conversational quality |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | All conversational features, prompts, prototypes, and QA |
| **Related** | **[Spec 114 — Conversation Flow Engine](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)** · **[Spec 106 — Guardrails](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md)** · **[Spec 107 — State Machine](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)** · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) |

---

## Purpose

Not rules. **Real conversations.**

Twenty to thirty complete walkthroughs become the **gold standard**.

Whenever Cursor produces something that doesn't feel right — compare it against the examples.

**Types:** `lib/sparkConversationExamples/types.ts`

---

## What Each Example Documents

For every scenario, document:

| Field | Required |
|-------|----------|
| Member opening | Yes |
| Every Spark response | Yes |
| Flow mode per turn ([Spec 114](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)) | Yes |
| State per turn ([Spec 107](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)) | Yes |
| Hidden processes (quiet work, memory, retrieval) | Yes |
| Every permission gate | Yes |
| Numbered choices when offered | Yes |
| Environment suggestion (if any) | Yes |
| Completion + certainties ([Spec 110](./SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md) · [Spec 113](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md)) | Yes |
| What would be **wrong** | Yes |

**Type:** `SparkConversationExampleRecord`

---

## Priority Scenarios (V1 — six)

**Type:** `SparkConversationExampleScenarioId` · `SPARK_CONVERSATION_EXAMPLE_SCENARIOS`

---

### Scenario 1 — "I need help marketing my app."

**Intent:** Marketing help — must not assume launch plan vs. messaging vs. discovery.

**Flow arc:** Welcome → Understand → Clarify (numbered) → Explore → Permission → Review → Complete

**Status:** Template — full turn-by-turn to be authored

---

### Scenario 2 — "I'm overwhelmed."

**Intent:** Support first — not task list.

**Flow arc:** Support → one small step → optional environment → continue

**Mode emphasis:** `support` · `coach` — not `create`

**Status:** Template

---

### Scenario 3 — "I have an idea."

**Intent:** Capture and explore — not immediate business plan.

**Flow arc:** Listen → Understand → Explore → optional capture → permission before formal doc

**Status:** Template

---

### Scenario 4 — "I don't know what to do."

**Intent:** Orientation — stuck protocol likely.

**Flow arc:** Support → numbered help choices → coach or explore

**Status:** Template

---

### Scenario 5 — "I need to write a workshop."

**Intent:** Creation — sufficient understanding before draft.

**Flow arc:** Understand → Clarify audience/outcome → Explore outline → Permission → Review

**Mode emphasis:** high confidence gate before `create`

**Status:** Template

---

### Scenario 6 — "I'm avoiding something."

**Intent:** Emotional + decision — not productivity shame.

**Flow arc:** Support → coach → gentle clarify → never pressure

**Mode emphasis:** `coach` · `support` — never imply "behind"

**Status:** Template

---

## Additional Scenarios (V2 — target 20–30)

Planned categories:

- Pricing decision
- Client email dread
- Returning after absence
- "Just print this"
- Research request
- Gallery milestone
- Journal emotional processing
- Multi-project overwhelm
- Brand voice clarification
- Launch week chaos

**Type:** `SPARK_CONVERSATION_EXAMPLE_V2_CATEGORIES`

---

## How to Use Examples

1. **Ship gate** — New conversational UI compared to nearest scenario
2. **Prompt tuning** — Examples override generic LLM defaults
3. **Prototype QA** — `/prototype/*` routes validated against scenarios
4. **Regression** — When guardrails or flow engine changes, re-walk scenarios

---

## Anti-Patterns (Document in Each Example)

Each example should show what **not** to do:

- Multiple questions in one turn
- "Opening the Conservatory..."
- Draft after two questions
- "You should..."
- Toolbar Save/Export ending
- "I remember everything..."
- Exaggerated praise
- Forced closure

Aligns with [Spec 106](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md).

---

## File Organization (Implementation)

```
docs/conversation-examples/
  scenario-01-marketing-app.md
  scenario-02-overwhelmed.md
  ...
lib/sparkConversationExamples/
  types.ts
  scenarios.ts          # metadata + status
```

---

## Success Criteria

Examples succeed when:

- Any team member can judge "does this feel like Spark?" in minutes
- Prototypes diverge less from philosophy
- Flow Engine rules have concrete reference turns
- Members recognize themselves in scenarios

---

## Cursor Implementation Notes

**Cursor rule:** `.cursor/rules/conversation-examples.mdc` (apply when authoring conversation UX)

When conversational output feels wrong → open the matching scenario in `docs/conversation-examples/` and diff.
