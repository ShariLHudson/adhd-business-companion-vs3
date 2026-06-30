# SPEC 116 — Conversation Gold Standards™

## Not Rules — Real Conversations

| Field | Value |
|-------|-------|
| **Spec ID** | 116 |
| **Title** | Conversation Gold Standards™ |
| **Version** | 1.0 |
| **Status** | Foundational Reference — living library |
| **Priority** | Critical — primary QA gate for conversational quality |
| **Owner** | Entrepreneurial Transformation Architecture™ |
| **Applies to** | Every conversational feature, prompt, prototype, and release |
| **Related** | **[Spec 119 — Conversation Tests](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md)** (break the engine · Hospitality Check · Cognitive Load · Invisible Work · Spark Question™) · **[Spec 114 — Flow Engine](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md)** · **[Spec 118 — Hidden Work Engine](./SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md)** · **[Spec 106 — Guardrails](./SPARK_CONVERSATION_GUARDRAILS_FRAMEWORK.md)** · **[Spec 107 — State Machine](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md)** · **[Spec 110 — Completion](./SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md)** · **[Spec 113 — Certainty](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md)** · [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) |
| **Supersedes** | [Spec 115 — Conversation Examples](./SPARK_CONVERSATION_EXAMPLES_FRAMEWORK.md) (framework only; catalog lives here) |

---

## Purpose

Instead of rules… **25–50 complete conversations.**

Whenever Cursor gets something wrong — **compare it to the Gold Standard.**

**Adversarial QA:** [Spec 119 — Conversation Validation](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) — **architecture frozen** · eight QA gates · [FREEZE](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md)

**Library:** `docs/conversation-gold-standards/`  
**Catalog:** `lib/sparkConversationGoldStandards/types.ts`

---

## What Every Gold Standard Includes

| Element | Required |
|---------|----------|
| **Shari's responses** (exact copy) | Yes |
| **Internal reasoning** (need, mode, confidence, state) | Yes |
| **Hidden work** ([Spec 118](./SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md) — autosave, link assets, prep draft, retrieve memory) | Yes |
| **Permissions** (explicit gates) | Yes |
| **Suggestions** (numbered choices, environment invitations) | When applicable |
| **Completion** ([Spec 110](./SPARK_CONVERSATION_COMPLETION_FRAMEWORK.md)) | Yes |
| **Certainties** ([Spec 113](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md)) | When work saved |
| **Anti-patterns avoided** | Yes |

---

## Turn Block Format

Each turn uses this structure:

```markdown
### Turn N

**Member:** …

**Shari:** …

**Internal reasoning**
- Need: …
- Flow mode: … ([Spec 114](./SPARK_CONVERSATION_FLOW_ENGINE_FRAMEWORK.md))
- State: … ([Spec 107](./SPARK_CONVERSATION_STATE_MACHINE_FRAMEWORK.md))
- Confidence: high | medium | low

**Hidden work** ([Spec 118](./SPARK_HIDDEN_WORK_ENGINE_FRAMEWORK.md))
- … (or "none")

**Permissions / suggestions**
- … (or "none")
```

---

## Scenario Catalog (target: 50)

**Priority eight** (user-specified):

| # | Opening | File | Status |
|---|---------|------|--------|
| 01 | Help me market my app. | `gs-01-marketing-app.md` | **complete** |
| 02 | I'm overwhelmed. | `gs-02-overwhelmed.md` | **complete** |
| 03 | I have an idea. | `gs-03-have-an-idea.md` | **complete** |
| 04 | I don't know what to do. | `gs-04-dont-know-what-to-do.md` | planned |
| 05 | Should I create a course? | `gs-05-should-i-create-a-course.md` | planned |
| 06 | Help me think. | `gs-06-help-me-think.md` | **complete** |
| 07 | I just had a huge win. | `gs-07-huge-win.md` | **complete** |
| 08 | I need a brain break. | `gs-08-brain-break.md` | **complete** |

**Additional catalog** (planned — see `SPARK_CONVERSATION_GOLD_STANDARD_CATALOG` in types):

Pricing decision · Client email dread · Returning after absence · Print this · Research request · Gallery milestone · Journal processing · Avoiding something · Write a workshop · Launch week · Brand voice · Stuck on naming · Competitor anxiety · First hire · Podcast pitch · Newsletter restart · Burnout · Celebrate quietly · Permission to pause · Multi-project chaos · …

---

## How to Use

1. **Ship gate** — New conversational UX diffed against nearest gold standard
2. **Prompt tuning** — Gold standards override generic LLM behavior
3. **Prototype QA** — `/prototype/*` validated against scenarios
4. **Regression** — When Spec 106, 114, or 107 change, re-walk affected scenarios
5. **Adversarial QA** — Run [Spec 119 Conversation Tests](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md); find failures, not passes

**Cursor rule:** `.cursor/rules/conversation-gold-standards.mdc`

---

## Compare Checklist (when output feels wrong)

- [ ] Reflected intent before solving?
- [ ] One question only?
- [ ] Correct flow mode (coach ≠ create)?
- [ ] Confidence gate before draft?
- [ ] Permission before show/save/export?
- [ ] Hospitality language ([Spec 111](./SPARK_HOSPITALITY_FRAMEWORK.md))?
- [ ] Three certainties if work saved ([Spec 113](./SPARK_CERTAINTY_BEFORE_COMPLETION_FRAMEWORK.md))?
- [ ] Matches nearest gold standard turn-by-turn?

---

## Success Criteria

Gold Standards succeed when:

- Anyone can answer "does this feel like Spark?" in minutes
- Prototypes feel coherent — philosophy, not screens
- Cursor stops inventing conversation patterns ad hoc
- Members recognize themselves in the library

---

**Status:** Living library — expand toward 50 complete scenarios.
