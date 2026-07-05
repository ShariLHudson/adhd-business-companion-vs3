# Estate Adaptive Intelligence™

**Status:** BINDING · **Runtime:** `lib/estateBrain/adaptiveIntelligence/`  
**Layers:** Adaptive Intelligence → Discovery → Coaching → Navigation

## Vision

Every interaction should leave Spark a little wiser about the member.  
Every future interaction should feel slightly easier, slightly more natural, and slightly more personalized than the one before.

The member should feel:

> Spark understands me better every month.

## Golden rule

Spark should never become repetitive or predictable.  
Its goal is not to repeat previous behavior — it is to become **progressively more helpful** by understanding how this member thinks, decides, creates, learns, and works.

## Worth remembering gate

**Do not learn everything.** A preference is worth remembering only if it helps Spark make a **better decision next time**.

Examples:

| Worth remembering | Not worth storing |
|-------------------|-------------------|
| Prefers conversation over forms | Favorite color |
| Brainstorms before writing | One-off mood |
| Morning focus sessions | Single typo pattern |
| Turns SOPs into checklists | Trivia with no routing impact |

Each preference in `preferenceRegistry.ts` declares which behaviors it influences (`discovery_skip`, `coaching_intro`, `anticipation`, etc.).

## Preference domains

| Domain | Examples |
|--------|----------|
| **Working** | Conversation over forms · step-by-step · detailed vs quick |
| **Communication** | Concise vs detailed · encouraging vs direct |
| **Decision** | Compare options · wants recommendations |
| **Creative** | Templates vs blank page · visual first · brainstorm before write |
| **Learning** | Learn by doing · talk through before typing |
| **Productivity** | Morning focus · clear mind first · SOP → checklist chains |

## Learning confidence

Every learned preference has:

- **Score** (0–100 tendency)
- **Confidence** (0–1 evidence)
- **Observations** (how many reinforcing signals)

| Tier | When | How Spark speaks |
|------|------|------------------|
| **Low** | Few observations | Tentative — *"It seems like you may prefer…"* |
| **Medium** | 2+ observations | Gentle offer — *"You sometimes… Want to…?"* |
| **High** | 3+ observations, confidence ≥ 0.72 | Quiet preparation — *"I know this works well for you…"* |

Spark personalizes **strongly** only at high confidence.

## Adaptive coaching

Early relationship:

> Would you like me to explain each step?

Months later (high confidence on `learn_by_doing`):

> I know you prefer learning by doing, so let's build the first draft together.

High confidence on `brainstorm_before_writing`:

> I've noticed you usually brainstorm before writing. Would you like to spend five minutes exploring ideas before we begin?

## Intelligent anticipation

After meaningful completions — only when pattern confidence is sufficient:

| After | Suggestion |
|-------|------------|
| SOP created | *You usually turn SOPs into checklists. Shall I create one?* |
| Newsletter finished | *You normally schedule social media posts next…* |
| Research completed | *You often save research into your Knowledge Library…* |

Anticipation is **permission-based** — never auto-act.

## Continuous improvement

Spark may periodically ask:

> I've noticed you're working a little differently lately. Should I adjust how I help?

Members can review and edit learned preferences in Memory Center (future UI).  
Declined preferences are not pushed again.

## Pipeline integration

```
Interaction
    ↓
Observe signal (coaching choice · discovery answer · completion)
    ↓
Worth remembering? (impacts future decision)
    ↓
Update preference confidence
    ↓
Discovery skip · prep extras · coaching opener · anticipation
```

**Wired today:**

- `discoveryMode.ts` — skip known questions · record answers
- `discoveryPreparation.ts` — adaptive prep lines
- `estateCoaching.ts` — adaptive opener · record coaching choices
- `adaptiveEstateHintForChat()` — invisible prompt guidance

## Related

- [ESTATE_DISCOVERY_MODE.md](./ESTATE_DISCOVERY_MODE.md)
- [ESTATE_COACHING_ARCHITECTURE.md](./ESTATE_COACHING_ARCHITECTURE.md)
- [SPARK_ESTATE_MEMORY_ARCHITECTURE.md](./SPARK_ESTATE_MEMORY_ARCHITECTURE.md)
- Spec 112 Companion Memory · `lib/intelligence-layer/profileStore.ts`
