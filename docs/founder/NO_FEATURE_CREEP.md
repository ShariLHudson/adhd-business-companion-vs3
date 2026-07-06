# Founder Studio™ — No Feature Creep

**Permanent gate for every proposed feature, room, engine, or integration**

| | |
|---|---|
| **Status** | Binding |
| **Parent** | [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md) |
| **When to use** | Before any GitHub issue, sprint proposal, or "quick addition" |

---

## The rule

> If the answer is **NO** to most questions below, **improve an existing capability** instead of creating a new one.

Feature creep is how executive software becomes overwhelming. Founder Studio exists to reduce load — not to accumulate modules.

---

## The eight questions

Every proposal must answer honestly:

| # | Question | Pass means |
|---|----------|------------|
| 1 | **Does this save measurable time?** | Shari or team spends less time finding, deciding, or preparing — not just "could" |
| 2 | **Does this reduce cognitive load?** | Fewer decisions about what to look at; less context switching |
| 3 | **Does this improve executive decisions?** | Better next decision quality — not more information |
| 4 | **Does this increase organizational wisdom?** | Company remembers, connects, or learns — durable value |
| 5 | **Does this strengthen the Spark ecosystem?** | Companion, Estate, PostCraft, members, or revenue benefit |
| 6 | **Does this make Founder more enjoyable to use?** | Calmer, more elegant, more trustworthy — not busier |
| 7 | **Does this help Shari build her company?** | Direct line to mission, revenue, product, or team |
| 8 | **Does this create long-term competitive advantage?** | Hard for generic AI or off-the-shelf tools to replicate |

**Scoring:** Count yes answers. **6+ yes** → may proceed to [EXECUTIVE_VALUE_SCORE.md](./EXECUTIVE_VALUE_SCORE.md). **4–5** → redesign as refinement of existing system. **≤3** → reject or park in Parking Lot.

---

## Default alternatives (when answer is no)

| Instead of… | Do… |
|-------------|-----|
| New dashboard | Improve Executive Command Center panel or deep-link to existing room |
| New intelligence engine | Feed existing engine (Research, Discovery, Judgment) |
| New room | Extend existing room's detail view or integration shortcut |
| New external tool link | Add to **Executive Resources Center** after five-question gate — see [EXECUTIVE_RESOURCES_CENTER.md](./EXECUTIVE_RESOURCES_CENTER.md) |
| New notification type | Fold into Discovery brief or Judgment pyramid tier |
| New settings page | Conversational preference or Memory Center pattern |
| Duplicate data store | Lineage + enrich existing object in registry |
| "Quick widget" | Prep offer in Executive Assistant queue |

---

## Red flags (automatic pause)

Stop and escalate if the proposal includes any of:

- "Just one more tab…"  
- "While we're here, let's also…"  
- "Other apps have this…"  
- "It would be easy to add…"  
- "We need a dashboard for…"  
- "Let's build a new engine for…"  
- "Shari might want to see everything…"  

---

## Parking lot

Ideas that fail the gate but have merit go to `docs/PARKING_LOT.md` — not into the codebase.

Review parking lot quarterly against [EXECUTIVE_VALUE_SCORE.md](./EXECUTIVE_VALUE_SCORE.md), not weekly against enthusiasm.

---

## Accountability

Every GitHub issue for Founder Studio should include:

```
No Feature Creep: _/8 yes
Executive Value Score: ___
Proposed alternative if rejected: ___
```

Reviewers may block merge on insufficient gate evidence during architecture freeze.
