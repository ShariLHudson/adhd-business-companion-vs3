# Intentional Restoration & Estate Guide Integration™

**Status:** BINDING · **Runtime:** `lib/estateRestoration/`  
**Parent:** [SPARK_RESTORATION_INTELLIGENCE.md](./SPARK_RESTORATION_INTELLIGENCE.md)

## Philosophy

Spark does not say *"take a break."*

Spark offers **restorative Estate experiences** — intentional, enjoyable, mentally refreshing. The Estate Guide is not documentation. It is part of the Estate experience.

Reading should feel like a peaceful walk with someone who knows every story — never like leaving work behind.

## When to offer

| Signal | Trigger |
|--------|---------|
| Mental fatigue | `mental_fatigue` |
| Frustration | `frustration` |
| Stuck without progress | `stuck` |
| Revision loops | `revision_loop` |
| Decision fatigue | `decision_fatigue` |
| Cognitive overload | `cognitive_overload` |
| Extended intense work | `extended_work` |
| Natural pause | `natural_pause` |

**Always optional.** Never block forward intent.

## Intelligent story selection

Stories come from `data/estateGuideSpreads.ts` via `storyRegistry.ts`:

| Context | Example stories |
|---------|-----------------|
| Momentum work | Celebration Garden · Hall of Accomplishments |
| Journal / writing | Writing Gazebo · Reading Nooks |
| Business planning | Round Table · Strategy Studio |
| Overwhelmed | Butterfly Conservatory · Lakeside Hammock · Gardens |

Selection considers: current place · workspace · emotional state · unread stories · favorite companions.

## Two delivery modes

### Offer (permission first)

*"You've been doing thoughtful work. Would you enjoy a story from the Observatory?"*

### Tell inline (Shari shares conversationally)

*"Before we jump back in, I have a story I'd love to share with you…"*

Member may listen in chat **or** say *"I'd love to read more"* → Estate Guide opens to exact spread.

## Return to work

After reading:

*"Welcome back. Feeling ready to continue with your SOP?"*

Or: *"Did anything in that story spark a new idea?"*

## Adaptive memory

`estate-restoration-v1` stores:

- Stories read
- Favorites
- Offer cooldown (8 turns)
- Pending return context

Future: companion chains (*"You loved the Stables — try the Apple Orchard"*).

## Pipeline position

```
Emotional regulation
    ↓
Intentional Restoration (fatigue / stuck / revision)
    ↓
Estate Guide (orientation questions)
    ↓
Universal Creation → Discovery → …
```

## Forbidden

- "Take a break" · "You should rest"
- Feature tours · help-article tone
- Forced navigation · guilt on decline

## Related

- [UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md](../UNIVERSAL_EXPERIENCE_STANDARDS_FRAMEWORK.md) — restoration pattern
- [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md)
- `data/estateGuideSpreads.ts` — story source of truth
