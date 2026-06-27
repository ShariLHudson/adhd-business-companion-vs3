# Carry Forward
## Every New Day Begins With Hope

**Version:** 1.0  
**Status:** Constitutional — first visit of the day only  
**Code:** `lib/carryForward/`  
**Sibling:** [HONOR_THEIR_INTENT.md](./HONOR_THEIR_INTENT.md) · [COMPANION_RELATIONSHIP.md](./COMPANION_RELATIONSHIP.md)

---

## Mission

Not to summarize yesterday. To decide **what is emotionally healthy to carry into today**.

Every first visit should leave the guest thinking:

> "I'm glad I came."

---

## Core Principle

We do not carry tasks forward. **We carry encouragement forward.**

Yesterday provides context. It never provides judgment.

---

## The Carry Forward Question

Before the first greeting of the day, the Companion quietly asks:

> **"What is the healthiest thing to bring into today?"**

Not what failed. Not what's overdue. What will help this person begin with hope?

---

## What May Carry Forward

Confidence · Hope · Momentum · Permission · Peace · Curiosity · Encouragement · Gratitude · Accomplishment · Progress · Warmth · Relationship

**Never:** shame, pressure, disappointment, missed tasks, broken streaks, statistics.

Enforced: `CARRY_FORWARD_FORBIDDEN_PATTERNS` in `lib/carryForward/rules.ts`

---

## Yesterday Close Tones

| Tone | Example greeting |
|------|------------------|
| `ended_well` | "Yesterday felt like a good step forward. I hope today builds on that." |
| `ended_unfinished` | "We left a few things waiting yesterday. They'll be there whenever you're ready." |
| `ended_overwhelmed` | "I'm really glad you came back today. We'll take today one step at a time." |
| `ended_with_win` | "I hope you took a moment to appreciate what you accomplished yesterday." |
| `ended_frustration` | "Yesterday was one of those days. This one gets to be different." |
| `ended_quiet` | "Good morning." / "I'm glad you're here." |

Library: `CARRY_FORWARD_CATALOG` — 40+ variations, cooldown per line.

---

## Relationship Before Memory

Never sound like:

- "I noticed…"
- "My records show…"
- "Based on your history…"

Sound like someone who remembers naturally:

- "It feels good to see you again."
- "We ended yesterday on a hopeful note."

---

## Honor Today's Intent

Carry Forward applies **only on the first visit of the day**.

Once the guest says *"Help me build a marketing funnel"* — Carry Forward ends. [Honor Their Intent](./HONOR_THEIR_INTENT.md) begins.

---

## Integration

| Layer | Role |
|-------|------|
| `evaluateCarryForward()` | Selects greeting + records cooldown |
| `evaluateWelcomePresenceIntelligence()` | Replaces opening greeting when active |
| `isFirstVisitOfDay()` | Compares `lastArrivalAt` calendar day |
| `inferYesterdayCloseTone()` | Emotional tone only — no task inventory |

---

## Success Test

After a terrible yesterday, the guest opens the Companion and feels **lighter** — not because yesterday disappeared, but because today is a new invitation.

After an incredible breakthrough, warmth celebrates progress — then gently turns toward today.

> "I don't have to prove anything here. I'm welcome. I'm ready for today."

---

## Code Reference

```
lib/carryForward/
├── types.ts
├── rules.ts
├── catalog.ts
├── inferYesterdayTone.ts
├── dayVisit.ts
├── evaluateCarryForward.ts
├── index.ts
└── carryForward.test.ts
```

Registered in `COMPANION_LIBRARY_CATALOG` as `carry-forward`.
