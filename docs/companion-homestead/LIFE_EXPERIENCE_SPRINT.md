# Companion Homestead™
## Life Experience Sprint™ (Sprint Zero)

**Version:** 1.0  
**Status:** Active development cycle — **no new features unless experience-proven**  
**Duration:** One full cycle (minimum 7 living days recommended)  
**Prerequisite:** Living Room first production experience shipped (`ArrivalLivingRoomExperience`)

---

## The rule for this cycle

| Stop | Start |
|------|-------|
| Adding features | Living inside the Homestead |
| Adding intelligence | Recording what you feel |
| Adding rooms | Fixing what breaks the illusion |
| Pretending it's unfinished | Pretending it's **already finished** |

**The goal is not to build. The goal is to live inside it.**

---

## Mission

Every interaction should answer one question:

> **Would someone genuinely want to come back tomorrow?**

---

## Daily rhythm

Open the Companion Homestead™ **at least five times each day** in different contexts.

### Time-of-day visits (required)

| Slot | Intent |
|------|--------|
| **Morning** | First open — arrival, greeting, today's reality |
| **Midday** | Return after absence — continuity, rhythm |
| **Late afternoon** | Energy shift — recommendation, room transition |
| **Evening** | Wind-down — tone, silence permission |
| **Late night** | Low capacity — no pressure, calm |

### Context visits (rotate through the week)

After at least one of each during the sprint:

| Context | What you're testing |
|---------|---------------------|
| **Productive work session** | Return from workspace — does life continue? |
| **Frustrating bug** | Emotional safety — shame-free welcome? |
| **Personal win** | Celebration — dwell before next goal? |
| **Feeling overwhelmed** | Window Seat bias — no productivity push? |
| **Feeling creative** | Studio path — permission, not pressure? |

**Minimum:** 5 visits/day × 7 days = **35 visit records** before sprint close.

---

## After every visit

Record answers in [`life-experience-reviews/sprint-zero-log.md`](./life-experience-reviews/sprint-zero-log.md) using the [review template](./life-experience-reviews/REVIEW_TEMPLATE.md).

### The ten questions

| # | Question | Format |
|---|----------|--------|
| **1** | **First feeling** — emotion in first five seconds | **One word only** |
| **2** | **Did it feel alive?** — life continued while away? | Yes / No + why not |
| **3** | **Did anything feel like software?** | List every app-awareness moment → redesign candidates |
| **4** | **Did Shari sound like Shari?** | Yes / No — rewrite lines that fail kitchen test |
| **5** | **Did anything feel repetitive?** | Greeting · movement · recommendation · conversation · objects · atmosphere · silence |
| **6** | **What made you smile?** | **One thing only** — if nothing, why |
| **7** | **Did you feel rushed?** | Where — enough silence? breathing room? |
| **8** | **Did you leave better?** | Calmer · clearer · more hopeful · more capable · more connected · same |
| **9** | **Would you open it again?** | Not for work — because you **wanted** to |
| **10** | **One tiny improvement** | **One only** — small craftsmanship, never full redesign |

---

## Build rule (hard gate)

During Sprint Zero:

```
NO new features
NO new intelligence modules
NO new rooms
NO "while we're here" refactors
```

**Exception — experience-proven fix only:**

A change may ship if **all** are true:

1. Observed during a logged visit (cite visit ID in PR)  
2. Solves a real experience problem from questions 3, 5, 7, or 9  
3. Smallest possible craftsmanship diff  
4. Does not add capability — only deepens warmth, calm, aliveness, or believability  
5. Passes all existing gates (`test`, `audit:companion`, `build`)

**Ideas are not enough. Experience comes first.**

### PR title format during sprint

```
experience: [one tiny improvement from visit YYYY-MM-DD #N]
```

---

## Redesign candidate pipeline

Moments from **Question 3** (felt like software) go to:

| Field | Action |
|-------|--------|
| Visit log | Recorded raw |
| Sprint summary | Grouped by theme at week end |
| Fix queue | Max **3** items approved for craftsmanship PRs |
| Everything else | Waits — no scope creep |

Themes to watch (from human experience review):

- Confirmation taps that feel like UX flows  
- Nav chrome breaking immersion  
- Forced questions before "sit down"  
- Recommendation too fast after vulnerability  
- Modulo/random discovery patterns  
- Greeting repetition across days  

---

## Weekly synthesis (end of sprint)

Answer once:

1. **One word** that best describes the week in the Homestead  
2. **Three moments** you still remember (not features)  
3. **Three redesign candidates** worth fixing next — ranked  
4. **One thing** that must never change (The One Constant)  
5. **Final question:** *Would you open it tomorrow because you wanted to?* — honest yes/no  

---

## Success

Success is **not** more functionality.

Success is someone quietly thinking:

> **"I've missed this place."**

When that happens, the Companion Homestead™ has stopped being software. It has become part of someone's life.

---

## Authority

This sprint is **subordinate to** nothing for duration — it **pauses** feature expansion.

It remains **aligned with:**

- [`LIVING_LIFE_ENGINE.md`](./LIVING_LIFE_ENGINE.md) — observations feed the engine, not vice versa  
- [`FIRST_PRODUCTION_EXPERIENCE.md`](./FIRST_PRODUCTION_EXPERIENCE.md) — first minute is primary test surface  
- [`COMPANION_HOMESTEAD_MANIFESTO.md`](../COMPANION_HOMESTEAD_MANIFESTO.md) — emotional promise unchanged  

---

## Quick start

1. `npm run dev` → open `/companion`  
2. Complete one visit → fill [review template](./life-experience-reviews/REVIEW_TEMPLATE.md)  
3. Paste into [sprint-zero-log.md](./life-experience-reviews/sprint-zero-log.md)  
4. Repeat 5× daily for 7 days  
5. Write weekly synthesis  
6. Ship max 3 experience-proven craftsmanship PRs  

**Do not build until you've lived.**
