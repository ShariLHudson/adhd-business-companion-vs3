# ADHD Business Ecosystem™
# Live Reality
## How This Connects to the Entire Ecosystem

This document explains **why** Live Reality exists and how it relates to every current and future part of the ecosystem.

This is **not** a Plan My Day feature.  
This is **not** a Shape Today feature.  
This is a **Companion Brain** capability.

The ecosystem has **one brain**. Everything else is simply a different way of interacting with it.

**Sibling:** `LIVE_REALITY_ARCHITECTURE.md` (implementation) · `plan-my-day/DAILY_COMPANION_CYCLE_ARCHITECTURE.md`

---

## The Core Principle

The user should never have to update multiple places.

The user tells the companion once. The companion updates everything that needs to know.

**One update. One brain. Many experiences.**

This is how a real companion behaves.

---

## What Live Reality Actually Is

Live Reality is the continuously changing understanding of the user's current situation.

Examples:

- Current energy
- Current motivation
- Current stress
- Current focus
- Current health
- Available time
- Unexpected events
- Family priorities
- Business priorities
- Mental capacity
- Interruptions
- Mood
- Current location
- Current commitments
- Anything that changes today's reality

The **Companion Brain** continuously reasons from this. Nothing else should.

---

## Shape Today (formerly Adapt My Day)

**Purpose:** Collect today's reality.

It does **not** build the plan. It informs the Companion Brain.

Think of Shape Today as asking: *"What is true right now?"*

The Companion Brain decides what that means.

| Consumes | Contributes |
|----------|-------------|
| Live judgment (for framing) | `day-state` reality signals |

---

## Plan My Day

**Consumes** Live Reality

**Purpose:** Create today's best plan.

Whenever Live Reality changes, Plan My Day automatically changes — not because the user rebuilt it, because the Companion Brain re-evaluated everything.

| Consumes | Contributes |
|----------|-------------|
| Live judgment, memory | `plan-items` signals (future) |

---

## Clear My Mind

**Produces** Live Reality

Example — user says:

- *"I'm exhausted."*
- *"I'm worried about Mom."*
- *"I can't focus."*
- *"I have a migraine."*

Those become Live Reality signals. The user never has to repeat them in Shape Today. The companion already knows.

| Consumes | Contributes |
|----------|-------------|
| Live judgment (tone) | `capture` reality signals |

---

## My Thoughts

**Produces** Live Reality

Ideas. Concerns. Business thoughts. Health concerns. Relationship concerns. Future plans.

The companion notices changes in thinking. These become context.

| Consumes | Contributes |
|----------|-------------|
| Live judgment | `capture` reality signals |

---

## Focus My Brain

**Consumes** Live Reality

Example: energy drops → focus session changes, music changes, timer suggestions change, break timing changes.

The user doesn't configure this. The companion adapts.

| Consumes | Contributes |
|----------|-------------|
| Live judgment, capacity | `focus-session` signals (future) |

---

## Projects

**Consumes** Live Reality

Projects remain the same. Today's **recommendations** change.

- If health changes → projects may pause
- If launch week begins → project priorities shift

The projects don't change. Today's judgment changes.

| Consumes | Contributes |
|----------|-------------|
| Live judgment | `project` context signals (future) |

---

## Founder Intelligence

**Consumes everything. Produces wisdom.**

Founder Intelligence asks:

- What patterns am I seeing?
- What habits are emerging?
- Where is confidence growing?
- What decisions improve outcomes?
- What leadership traits are developing?

Founder Intelligence **never** changes today's plan. It helps the companion make better judgments tomorrow.

| Consumes | Contributes |
|----------|-------------|
| All signals, reflection outcomes | Learning signals, patterns |

---

## Business Intelligence

**Consumes:** Live Reality, Projects, CRM, Sales, Content, Marketing, Meetings, Calendar, Revenue, Offers

Business Intelligence understands how today's reality affects the business.

It does **not** tell the user: *"Productivity down."*

It says: *"This week may not be the right week to launch."*

That is wisdom.

| Consumes | Contributes |
|----------|-------------|
| Live judgment, business context | Capacity-aware recommendations |

---

## PostCraft

**Consumes** Live Reality

- Low energy → suggest easier content
- High creativity → suggest writing
- Recovery day → suggest nothing

The companion should know when **not** to create.

| Consumes | Contributes |
|----------|-------------|
| Live judgment, creative capacity | Content timing signals (future) |

---

## Decision Compass

**Consumes** Live Reality

The same decision can change depending on energy, stress, health, confidence, available time.

The companion reasons from today's reality. Not yesterday's.

| Consumes | Contributes |
|----------|-------------|
| Live judgment | Decision context (future) |

---

## Google Workspace (future)

Calendar. Email. Docs. Tasks. Meetings.

Current reality should influence recommendations. **Not** overwrite user data.

---

## GHL (future)

Lead follow-up. Appointments. Campaigns. Tasks.

If today's reality changes, **recommendations** change. Not commitments.

---

## Memory vs Live Reality

| Memory | Live Reality |
|---------|----------------|
| *"This happened."* | *"This is true now."* |
| Stores history | Moves with the day |

The Companion Brain uses both.

---

## Living Intelligence Graph

The graph connects everything. Live Reality becomes another signal — **not** another database.

Every intelligence layer can reference it.

---

## Reflection Intelligence

Reflection asks:

- How did today's reality affect today's outcome?
- What did we learn?
- What should change next time?

This improves future judgment.

---

## Prediction Intelligence (future)

The companion begins anticipating.

Example: every Thursday afternoon energy usually drops → plan lighter work.

Not because of a rule. Because the companion learned.

---

## Relationship Intelligence

Perhaps the most important consumer.

It notices stress, recovery, joy, growth, grief, celebration.

It changes **tone**. Not personality.

| Consumes | Contributes |
|----------|-------------|
| Live judgment, emotional signals | Relationship tone calibration |

---

## The User Experience

The user should never think:

- *"I updated Plan My Day."*
- *"I updated Shape Today."*
- *"I updated Projects."*
- *"I updated Focus."*

Instead they should feel:

- *"I told Shari what was going on."*
- *"Everything else just understood."*

That is the experience.

---

## The Architectural Rule

Every workspace must answer two questions:

1. **What intelligence do I consume?**
2. **What intelligence do I contribute?**

No workspace exists alone. Every workspace participates in the Companion Brain.

**Code registry:** `lib/companionJudgmentClient/workspaceIntelligence.ts`

---

## Future Growth

This architecture supports Founder Intelligence, Business Intelligence, PostCraft, Google Workspace, GHL, Knowledge Graph, analytics, predictions, automation, voice, wearables, health integrations, research, and learning — **without redesign**.

The ecosystem grows. The Companion Brain remains one brain.

---

## Final Principle

The ecosystem should never feel like many connected apps.

It should feel like **one companion** with many ways of helping.

Every workspace is simply another conversation with the same mind.

That is the architecture we are building.
