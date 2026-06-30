# Spark Coaching Archetypes™ — Future Evolution

| Field | Value |
|-------|-------|
| **Status** | **Documented only** — not implemented |
| **Mode** | [Observation Mode](./SPARK_OBSERVATION_MODE.md) remains active |
| **Rule** | No behavior changes until Rule of Three + Evolution Board approval |
| **Replaces (eventually)** | Growing phrase-regex lists in the Wisdom Layer |
| **Principle** | [The Shari Principle™](./THE_SHARI_PRINCIPLE.md) · [Conversation Coach](./SPARK_CONVERSATION_COACH.md) |

---

## Why archetypes

Live testing showed Spark can coach well — but **phrase-by-phrase matching** does not scale.

Shari does not think: *"They said procrastinating, so run pattern 7."*

She thinks: *"This person is in **Emotional Avoidance** — I've seen this before."*

**Coaching archetypes** group conversations into reusable patterns Spark already knows how to hold — the way Shari naturally coaches across different words and situations.

| Today (v1) | Future (archetypes) |
|------------|----------------------|
| Regex / phrase signals | Archetype classification |
| Many small pattern files | One archetype → one coaching stance |
| Maintenance grows with every new phrase | New phrases map to existing archetypes |
| Inconsistent edge cases | Consistent Shari-like responses |

**This document is the blueprint.** Nothing here ships until evidence supports it.

---

## The archetype set (v0 catalog)

These are **coaching stances**, not features. Each archetype defines how Spark listens, what it wonders about, and what it withholds until the moment is right.

| Archetype | What the member is really in | Spark's first job |
|-----------|------------------------------|-------------------|
| **Decision Overload** | Too many paths feel equally important | Reduce choices · find one gentle starting point |
| **Emotional Avoidance** | Knows what to do · can't begin · something underneath | Curiosity before strategy · no timers/tools yet |
| **Quit Temptation** | Wants to walk away from something meaningful | Gentle challenge + emotional support · honor the feeling |
| **Fear of Failure** | Stuck because getting it wrong feels dangerous | Normalize risk · shrink the stakes · permission to be imperfect |
| **Fear of Success** | Pulling back when things might actually work | Explore what success would change · identity safety |
| **Perfectionism** | Can't ship because it's not ready enough | Finish lines · good-enough thresholds · relief from the loop |
| **Celebration** | Win, milestone, or breakthrough worth marking | Witness first · Gallery/momentum only with permission |
| **Momentum** | Energy is present · channel it without over-structuring | Protect the spark · one anchor · don't over-plan |
| **Reflection** | Processing · meaning-making · debrief | Listen · synthesize · no rush to action |
| **Confidence Building** | Doubt in capability · imposter edges | Evidence · agency · small proof — not cheerleading |

Archetypes may overlap. A single turn can have a **primary** archetype and a secondary undertone. Shari holds both — Spark should too, invisibly.

---

## How archetypes relate to today's Wisdom Layer (mapping notes)

**No runtime wiring yet.** This table is for observers and future implementers — to see where v1 signals already point.

| Current v1 signal | Likely archetype |
|-------------------|------------------|
| Emotional Blocker (`explore`) | Emotional Avoidance |
| Cognitive overload / fifteen things | Decision Overload |
| Gentle challenge — quit / go back to crafts | Quit Temptation |
| Encouragement + doubt language | Confidence Building |
| Hidden intent — proxy deliverable | Often Decision Overload or Perfectionism |
| Gallery opportunity | Celebration |
| Mentor moment · synthesis | Reflection |
| Positive momentum language | Momentum |

Phrase matchers stay **frozen** — do not expand them further. Use Observation Mode to confirm whether these groupings hold across real conversations.

---

## Archetype anatomy (future shape)

When implemented, each archetype should carry — without exposing any of this to members:

```
ArchetypeId
  ├── recognition signals (lightweight — not an ever-growing regex farm)
  ├── primary member need (Wisdom Before Information)
  ├── hospitality stance (what to validate first)
  ├── curiosity openers (Shari-tested — not generic)
  ├── withheld until ready (tools, timers, workspaces, plans)
  ├── optional normalization (ADHD, perfectionism — use sparingly)
  ├── synthesis timing (when to name the pattern)
  └── exit condition (member feels lighter / clearer — then strategy)
```

**Respond to archetypes, not phrases.** New member language should classify into an existing archetype whenever possible — only add a new archetype when Shari would recognize a genuinely different coaching stance.

---

## Founder judgment (non-negotiable)

Archetypes are not an excuse to therapize every conversation.

| Member signal | Archetype judgment |
|---------------|-------------------|
| "Start a timer" | Honor the request — not Emotional Avoidance excavation |
| "Print this" | Practical — no archetype deep-dive |
| "Just venting" | Reflection or off — listen, don't diagnose |
| Avoidance + explicit tool ask | Brief warmth · then the tool |

The superpower is **knowing when to dig and when not to** — archetypes serve that judgment; they do not replace it.

---

## Desired conversation flow (by archetype family)

### Stuck / heavy (Avoidance · Quit · Fear · Perfectionism · Decision Overload)

```
Member names the weight
    ↓
Understand (archetype recognized internally)
    ↓
Explore (one gentle question)
    ↓
Reduce emotional burden
    ↓
Together decide if action fits
```

Member finishes feeling: *"I understand why I've been stuck"* before *"Here's what we can do next."*

### Light / forward (Celebration · Momentum · Confidence)

```
Witness what's true
    ↓
Amplify without over-directing
    ↓
Optional next step — member's pace
```

### Processing (Reflection)

```
Listen
    ↓
Mirror · synthesize when earned
    ↓
No forced action
```

---

## Observation Mode — what to log now

While archetypes are **not built**, reviewers should tag conversations in the [Learning Log](./CONVERSATION_LEARNING_LOG.md) when a pattern repeats:

| Log field (suggested) | Example |
|-----------------------|---------|
| **Primary archetype (hypothesis)** | Emotional Avoidance |
| **Surface words** | "procrastinating on taxes" |
| **Did Spark match the archetype?** | Y/N — too fast to strategy? |
| **Better archetype fit?** | Perfectionism instead? |

**Review question (add to observation when relevant):**

> Did Spark respond to the **coaching situation** Shari would recognize — not just the literal words?

When the **same archetype** appears in three unrelated conversations with the same miss, add a row to the [Evolution Board](./SPARK_EVOLUTION_BOARD.md).

---

## Implementation gate (future)

| Step | Requirement |
|------|-------------|
| 1 | Document only ← **we are here** |
| 2 | Observe · tag archetypes in Learning Log |
| 3 | Rule of Three on classification accuracy or coaching miss |
| 4 | Evolution Board approval |
| 5 | Minimal Wisdom Layer refactor — archetype router, not new features |
| 6 | Re-validate CT-05 · CT-11 · relevant scorecards |

**Do not:**

- Add new regex lists per phrase
- Ship archetype UI to members
- Redesign conversation architecture (105–119)
- Implement during Observation Mode without board approval

---

## Related

- [SPARK_WISDOM_LAYER_FRAMEWORK.md](./SPARK_WISDOM_LAYER_FRAMEWORK.md) — current wisdom loop (120–131)
- [conversation-tests/ct-05.md](./conversation-tests/ct-05.md) — emotional blocker validation
- [WISDOM_LAYER_VALIDATION_GATE.md](./WISDOM_LAYER_VALIDATION_GATE.md)
- [PARKING_LOT.md](./PARKING_LOT.md)

---

**Status:** Future evolution · documented June 28, 2026 · Observation Mode active · no runtime changes
