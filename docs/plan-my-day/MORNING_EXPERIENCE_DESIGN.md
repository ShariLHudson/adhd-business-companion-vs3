# Plan My Day™ — Morning Experience Design
## Designing the Daily Ritual Before the Interface

**Version:** 1.0 (Experience Design Sprint)  
**Status:** Awaiting approval — no UI, no implementation  
**Prerequisite:** Companion Brain™ complete · Daily Companion Cycle™ complete · Human Reality Test™ passed  
**Subordinate to:** `DAILY_COMPANION_CYCLE_ARCHITECTURE.md` · `COMPANION_JUDGMENT_REPORT.md` · Companion Constitution

**Gate:** Visible Plan My Day™ screen design begins only after this document is approved.

---

## What This Document Is

This is **not** a UI spec. It contains no cards, columns, layouts, or components.

It defines **what it feels like** to open Plan My Day™ on a weekday morning — the emotional journey, the ritual, the conversation, and the invisible contract between Companion Brain™ and human.

> The interface is not the experience.  
> The Companion Brain™ already thinks.  
> The experience allows the user to feel understood.

---

# Deliverable 1 — The Complete Emotional Journey

## The seven states

Every morning visit should move the user through these states **in order**. The companion never skips ahead. The user may pause at any state without penalty.

```
Arrival → Orientation → Relief → Confidence → Momentum → Choice → Flow
```

| State | What the user feels | What the companion does | What the companion never does |
|-------|---------------------|-------------------------|-------------------------------|
| **Arrival** | "I'm here. Something is already waiting for me." | Acknowledge the day; signal continuity | Drop user on a blank board |
| **Orientation** | "I know where I am." | Name today's reality — capacity, context, what changed | List everything in the ecosystem |
| **Relief** | "I don't have to hold all of this." | Carry exclusions, deduping, permission decisions | Explain every exclusion in detail |
| **Confidence** | "I think I can handle today." | Evidence-based belief — yesterday's wins, capability proof | Generic hype or empty motivation |
| **Momentum** | "There's one thing that would help." | Offer one anchor (or exploration block) — never a stack | Present seven equal-priority options |
| **Choice** | "This is mine to judge." | Invite confirm, adjust, decline, swap, reduce | Auto-materialize or assume consent |
| **Flow** | "I'm in my day now." | Step back; living board available; protected if in flow | Interrupt, replan, or nag |

## Emotional arc by depth

**Surface emotion (first minute):** Calm recognition — *someone already thought about today.*

**Middle emotion (first five minutes):** Grounded agency — *I understand the shape of today and I chose it.*

**Deep emotion (return visits over years):** Trusted ritual — *this is how I begin. I don't have to reinvent mornings.*

## Failure modes to design against

| Failure | User feels | Fix at experience layer |
|---------|------------|-------------------------|
| Blank board shock | Overwhelmed, alone | Never open to tasks first |
| Brain dump on entry | Exhausted before starting | Orientation before proposals |
| Productivity pressure | Guilt, performance anxiety | Confidence before tasks |
| Architecture exposure | Confused, distrustful | Wisdom through simplicity |
| Fresh-start amnesia | Disconnected from companion | Relationship Continuity™ |
| False urgency | Rushed, misaligned | Momentum ≠ urgency |

---

# Deliverable 2 — The Morning Ritual

## The five-year weekday ritual

Imagine Alex opening Plan My Day™ every weekday for five years. This ritual should emerge:

### What becomes familiar

1. **The quiet moment** — Opening the page always begins with Shari's voice, not a task list.
2. **The honest read** — Energy and motivation are named without judgment.
3. **The one thing** — There is almost always one momentum anchor offered (except celebration, recovery, hyperfocus).
4. **The held-back pile** — The user learns the companion will say *"I left X off today"* without them having to decide what to ignore.
5. **The single question** — One invitation to judge: *"Does this shape feel right?"* — never a survey.
6. **The gentle exit** — Closing Plan My Day after confirming feels complete, not incomplete.

### What becomes comforting

- Low-energy days don't pretend to be normal days.
- Yesterday is remembered without being replayed as debt.
- Survival mode is a valid plan, not a failure state.
- Celebration days have no next-task pivot.
- Hyperfocus is protected, not interrupted.

### What becomes anticipated

- *"What did Shari notice?"* — not *"What do I have to do?"*
- The companion's read on the week — one line connecting today to trajectory.
- Permission relief — knowing something was intentionally excluded.

### Ritual structure (timeless, not clock-bound)

```
OPEN
  → Continuity beat (yesterday exists; today continues)
  → Reality beat (how today actually feels)
  → Context beat (what matters this week — one breath)
  → Wisdom beat (what can wait — carried, not listed)
  → Anchor beat (one momentum move — if appropriate)
  → Invitation beat (one question — user judges)
CONFIRM or ADJUST or PAUSE
  → Living day begins (board is downstream, not entry)
CLOSE
  → User leaves calmer than they arrived
```

### Ritual variations by DayMode

| DayMode | Ritual shape | Anchor | Invitation |
|---------|--------------|--------|------------|
| normal | Full ritual | Required | "Does this shape feel right?" |
| survival | Short ritual | Optional | "Does a small day feel honest?" |
| overwhelm | Orientation-first | Meta (name the worry) | "One thing — or we pause here." |
| recovery | Space ritual | None default | "What would make today steadier?" |
| health | Protection ritual | Health anchor | "Health leads — does this fit?" |
| family | Courtesy ritual | One business courtesy | "Family first — anything to notify?" |
| creative | Exploration ritual | Exploration block | "Explore first — build later?" |
| celebration | Recognition ritual | None | None — or "Enjoy today." |
| hyperfocus | Minimal overlay | None | None — gentle exit only |

---

# Deliverable 3 — Companion Conversation Flow

## Voice principles

Shari speaks as a **trusted companion who prepared quietly**, not as software reporting analysis.

| Shari sounds like | Shari never sounds like |
|-------------------|-------------------------|
| "Tuesday. Medium energy — workable, not heroic." | "Based on your Adapt My Day inputs…" |
| "I left the newsletter off today." | "Permission Intelligence excluded 4 items." |
| "Yesterday you moved the client follow-up forward." | "Phase 8 reflection registered momentum success." |
| "Does this shape feel right?" | "Please confirm proposals 1–3." |

## Conversation phases (user-visible)

These map to Daily Companion Cycle™ phases 7+ but are experienced as **conversation**, not pipeline.

### Phase A — Greeting with continuity (Relationship Continuity™)

**Purpose:** Today is not a fresh start.

**Shari might say:**
> "Tuesday. You closed yesterday with the client booking confirmed — that's still working for you today."

**Rules:**
- Reference **one** continuity thread — not a recap.
- Never reconstruct yesterday for the user.
- If yesterday was hard, acknowledge without scorekeeping.
- If celebration cooldown active, do not pivot forward.

### Phase B — Today's reality (Orientation™)

**Purpose:** Answer *where am I?*

**Shari names:**
- Day of week + energy/motivation (from Adapt My Day)
- What changed (if fresh check-in or notable shift)
- Hard constraints (one calendar highlight max in orientation)

**Shari does not name:**
- Full calendar
- Full CMM inventory
- Full project backlog

### Phase C — Journey placement (one breath)

**Purpose:** Answer *what matters?*

**Shari offers one line:**
> "This week you're inching the newsletter forward. Today doesn't need to be a writing day."

**Rules:**
- Week-level only in morning orientation.
- Season/vision reserved for deeper moments — not first minute.

### Phase D — Permission relief (invisible carrying)

**Purpose:** Answer *what can wait?*

**Shari summarizes exclusion as stewardship, not rejection:**
> "I left off the newsletter draft, website tweaks, and stacking more calls — not because they don't matter, because they don't fit today without crowding the call you already have."

**Rules:**
- Collapsed by default on low-capacity days (count only: *"I left 4 things off today"*).
- Full list available on user request — never forced.
- Never guilt framing ("you didn't finish…").

### Phase E — Momentum offer (if DayMode allows)

**Purpose:** Answer *what would create forward motion?*

**Shari offers one anchor:**
> "If I had to pick the one thing that makes everything else easier: twenty minutes clarifying the payment-link liability question."

**Rules:**
- One anchor. Not a stack.
- Creative days: exploration block, not build commitments.
- Celebration/recovery/hyperfocus: skip this phase entirely.

### Phase F — Confidence beat (woven, not separate)

**Purpose:** Answer *why do I believe I can handle today?*

Confidence is **embedded** in Phases A–E — never a motivational poster.

| Source | How it appears |
|--------|----------------|
| Yesterday's evidence | "You moved the client follow-up forward." |
| Capability proof | Small completable action paired with momentum |
| Boundary honor | "Survival mode is a real plan." |
| Celebration evidence | "The launch went live. That's the thing you worked toward." |

**Never:** "You've got this!" · "Crush it!" · "Let's go!"

### Phase G — Single invitation (Confirmation™)

**Purpose:** Transfer agency.

| DayMode | Invitation |
|---------|------------|
| normal | "Does this shape feel right for today?" |
| low capacity | "Does a two-item day feel honest?" |
| overwhelm | "One thing — or we pause here. Both are fine." |
| recovery | User may self-select — companion confirms without enlarging |
| celebration | No invitation — or "Enjoy today." |
| hyperfocus | No invitation — gentle exit |

### User response paths (agency preserved)

| User says | Companion does |
|-----------|----------------|
| "Yes" | Move to confirmation — materialize only what was proposed |
| "Move X to after school run" | Adjust timing — keep anchor, no lecture |
| "Not today" / "I can't today" | Honor survival — suppress proposals, no 24h nag |
| "Swap anchor for Y" | Offer alternative — never refuse without alternative |
| "Add one small thing" (recovery) | Confirm without enlarging scope |
| Closes without answering | No penalty — plan not materialized; companion waits |

### Conversation flow diagram

```
                    ┌─────────────────┐
                    │  User opens     │
                    │  Plan My Day™   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │  Brain already reasoned   │
              │  (invisible — complete)   │
              └──────────────┬────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    hyperfocus?          celebration?        normal path
         │                   │                   │
         ▼                   ▼                   ▼
   minimal overlay    recognition only    A→B→C→D→E→F
   no proposals       no proposals              │
   gentle exit        gentle exit               ▼
                                            Phase G
                                         invitation
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                      Confirm              Adjust               Pause
                         │                    │                    │
                         ▼                    ▼                    ▼
                    Living day           Revised offer      No materialize
                    (board)              re-invite          companion waits
```

---

# Deliverable 4 — Experience Timeline

## 5 seconds — Arrival

### What has already happened (invisible)

Before the user reads a word, Companion Brain™ has:

- Assembled context from Adapt My Day, captures, yesterday, calendar, projects
- Resolved DayMode and CycleState
- Selected momentum and confidence opportunities
- Curated permission exclusions
- Run Cognitive Audit™
- Prepared orientation copy and proposals (not materialized)

### What the user experiences

| Sense | Experience |
|-------|------------|
| **Emotional** | "Something is here for me." Not emptiness. Not a wall of tasks. |
| **Cognitive** | One voice — Shari — not a dashboard |
| **Relational** | Continuity — today continues yesterday |

### What Shari says first (by priority)

1. **Protected (hyperfocus):** "You're in deep work. I won't replan in the middle of that."
2. **Celebration:** "The launch went live. That's the thing you worked toward."
3. **Recovery:** "Yesterday didn't go how you hoped. That happens."
4. **Normal:** "Tuesday. Medium energy, steady motivation — workable, not heroic."

### What remains unsaid (5 sec)

- Reasoning phases
- Proposal IDs
- Learning signals
- Weight adjustments
- Full exclusion list (on collapsed days)
- Kanban, timeline, views

### What the user immediately sees (conceptually)

- Shari's orientation — **words first**
- Nothing that looks like "build your plan"
- No empty state anxiety

### Design tests (5 sec)

- [ ] Would a overwhelmed user feel more pressure or less?
- [ ] Would a hyperfocus user feel interrupted?
- [ ] Would a celebration user feel pushed to the next goal?

---

## 15 seconds — Orientation + Relief

### Emotional target

**"I know where I am. And I don't have to hold everything."**

### What unfolds

- Today's reality named (energy, motivation, vibe if relevant)
- One continuity thread from yesterday
- One journey line (week context)
- Permission relief begins (collapsed or full per DayMode)

### What waits

- Proposal cards (if any) — not yet primary focus
- Living board — not visible as entry
- View mode selection — never on entry
- Adapt My Day form — only if stale or user requests

### Effortless feelings

- Reading, not deciding
- Being met, not configuring
- Exhale — something was carried for them

### Overwhelming feelings to prevent

- Long scroll before first relief
- Numbered lists of everything pending
- "Here's what you didn't finish"
- Multiple questions at once

---

## 60 seconds — Confidence + Momentum

### Emotional target

**"I think I can do this. There's one thing that would help."**

### What unfolds

- Confidence beat woven through evidence (not hype)
- Momentum anchor offered (if DayMode allows) — **one**
- Permission relief complete (what was left off and why — briefly)
- Single invitation appears

### The user should feel

- Today's plan was **prepared**, not assigned
- They are **judging**, not building
- Declining is as valid as confirming

### What waits until after invitation

- Materialization into plan items
- Board population
- Focus timer
- Kanban drag-and-drop

### Conversation complete?

At 60 seconds, the **morning conversation** may be complete for:
- Celebration days (no invitation)
- Hyperfocus (minimal overlay)
- Survival after "I can't today"
- Overwhelm after "pause here"

For normal days, user may still be reading — **no timer pressure**.

---

## 5 minutes — Choice + Flow

### Emotional target

**"I'm in my day. I chose this. I can close this and work."**

### What unfolds

| Path | Experience |
|------|------------|
| **Confirmed** | Proposals materialize; living board appears **below** orientation; companion steps back |
| **Adjusted** | Companion revises — one exchange, not a negotiation spiral |
| **Declined / survival** | Empty or near-empty board is valid; companion affirms |
| **Paused** | Orientation remains; no guilt; user returns later |

### After five minutes — success criteria

The user should be able to close Plan My Day™ thinking:

- "I feel calmer."
- "I know where I am."
- "I know what matters."
- "I can handle today."

### What they should NOT think

- "I still have to figure out my day."
- "The app wants me to do more."
- "I failed because I didn't confirm everything."

### Living board relationship

The board is **where a confirmed plan lives** — not where the morning begins.

After confirmation, the user may:
- Glance at today's focus
- Start focus on anchor
- Close and work elsewhere

The companion does not require them to stay on the page.

---

# Deliverable 5 — What the Companion Brain™ Reveals Immediately

## Revealed at entry (user-facing)

| Brain output | How it appears | Never as |
|--------------|----------------|----------|
| `OrientationResult` | Shari's paragraphs | "Orientation module output" |
| DayMode tone | Conversational framing | "You are in survival mode" label |
| Momentum anchor | One suggested move | Ranked list with scores |
| Permission count | "I left N things off" | Exclusion audit log |
| Journey placement | One week-context line | Goal hierarchy diagram |
| Continuity thread | One yesterday reference | Yesterday's task dump |
| Single invitation | One question | Multi-step wizard |

## Revealed on user request (expandable)

| Brain output | How it appears |
|--------------|----------------|
| Full permission exclusions | "What you left off" expand |
| Proposal details | Confirmation cards |
| Confidence reasoning | Woven in copy — not separate panel |
| Calendar constraint | Named in orientation if hard constraint |

## Revealed after confirmation only

| Brain output | When |
|--------------|------|
| `CompanionProposal[]` → plan items | User confirms |
| Living board state | Post-confirmation |
| Focus suggestions | Post-confirmation or on anchor start |

## Never revealed to user (by design)

| Brain artifact | Why hidden |
|----------------|------------|
| Reasoning phases 0–6 | Architecture, not relationship |
| `RegisteredPrediction[]` | Internal calibration |
| `LearningSignalKind` emissions | Silent learning |
| `JudgmentPatch` weights | Brain wisdom, not user burden |
| `CompanionBrainState` | Persisted judgment only |
| Unlock/fit scores | Reduces trust to gamification |
| Cognitive Audit notes | Internal gate |
| DayMode enum value | Experience tone, not label |

---

# Deliverable 6 — What Remains Intentionally Hidden

## The invisible preparation

When the user opens Plan My Day™, the following has **already completed** — silently:

```
Context Assembly™
  → DayMode resolution
  → CycleState resolution
  → Momentum Intelligence™
  → Confidence Intelligence™
  → Permission Intelligence™
  → Proposal Generation™
  → Cognitive Audit™
  → Relationship Protection™
```

The user experiences the **result** as wisdom. Not the pipeline.

## Hidden cognitive work (carried for user)

| Work | User feels | User does not do |
|------|------------|------------------|
| CMM deduplication | Cleaner day | Review 17 captures |
| Defer pattern recognition | "That can wait" | Decide what to defer again |
| Capacity alignment | Right-sized day | Math on available hours |
| Guilt suppression | Relief | Fight yesterday's voice |
| Cooldown enforcement | No backlog pressure | Resist "catch up" framing |
| Hyperfocus protection | Uninterrupted flow | Defend against replan |

## Hidden relationship memory

| Memory | Surfaces as | Never as |
|--------|-------------|----------|
| Yesterday outcome | One continuity line | Scorecard |
| Survival declaration | Honored quiet day | "You said survival on [date]" |
| Celebration cooldown | No forward push | "Cooldown active" |
| Timing preference learned | Adjusted suggestion | "I learned you prefer…" |
| Prediction accuracy | Better judgments over months | Accuracy percentage |

## What we never explain

- Why item X scored 0.87 unlock
- Which constitutional principle fired
- How many proposals were rejected in audit
- What reflection will run tonight

**The companion demonstrates intelligence through simplicity.**

---

# Deliverable 7 — Principles for the Eventual Interface

*These govern UI design — they are not UI design.*

## Entry principles

1. **Words before widgets.** Orientation text is the first content. Not cards. Not columns.
2. **No blank board on open.** Entry state is `orienting`, never empty `living`.
3. **One scroll, one voice.** Shari's morning read should not require navigation.
4. **Silence is valid.** Zero proposals is a complete experience on celebration/recovery/hyperfocus.
5. **Stale check-in prompts gently.** If Adapt My Day is not from today, invite update — don't block with a form.

## Hierarchy principles

```
Layer 0 — Orientation (always first)
Layer 1 — Invitation (one question)
Layer 2 — Confirmation (proposals — if any)
Layer 3 — Living board (only after confirm)
```

Never invert. Never show Layer 3 without passing Layer 1.

## Density principles

| DayMode | Orientation length | Proposal count | Permission display |
|---------|-------------------|----------------|-------------------|
| normal | Full | 2–4 | Collapsed summary |
| survival / recovery | Short | 0–2 | Collapsed |
| overwhelm | Short / orientation-only | ≤1 | Collapsed |
| celebration | Short | 0 | None |
| hyperfocus | Minimal | 0 | None |
| creative | Full | 1–2 | Collapsed |
| health / family | Short | 1–2 | Collapsed |

## Interaction principles

1. **One invitation per morning** — not a survey.
2. **Confirm / adjust / decline / swap / reduce** — user verbs only.
3. **No auto-materialize** — ever.
4. **Adjust is cheap** — one exchange, not a workflow.
5. **Close without confirming is valid** — no badge, no nag.
6. **Board views are downstream** — list/timeline/kanban never greet the user.

## Emotional design principles

1. **Confidence before productivity** — evidence before tasks.
2. **Orientation before planning** — where before what.
3. **Relief before momentum** — what can wait before what to do.
4. **Momentum before volume** — one anchor before many items.
5. **Choice before flow** — user judges before board activates.

## Relationship principles (Relationship Continuity™)

1. **Continue, don't reconstruct** — one thread from yesterday.
2. **Never fresh-start software** — brain state persists.
3. **Honor declarations** — survival, celebration, family — without relitigating.
4. **Cooldowns are invisible** — experienced as tone, not flags.
5. **Five-year familiarity** — same ritual shape, different daily content.

## Anti-patterns (interface must never)

- Greet with kanban columns
- Show CMM thought count as first metric
- Display "productivity score" or completion percentage on entry
- Use red/orange urgency for incomplete items in orientation
- Stack multiple CTAs above the fold
- Label DayMode in UI ("Survival Mode Active")
- Evening "ready for tomorrow?" on celebration days
- "Catch up" framing after recovery

## Accessibility of wisdom

- Plain language — no ecosystem jargon in user copy
- Short paragraphs — ADHD-friendly scan
- Expandable depth — permission list, proposal detail — never forced
- Calm visual rhythm — interface serves exhale, not adrenaline

---

# Human Reality Test™ — Experience Validation

**Question for every scenario:** *Would I want to begin my morning this way?*

## Normal Tuesday

| Beat | Experience |
|------|------------|
| Arrival | "Tuesday. Workable, not heroic." — immediate grounding |
| Relief | Newsletter and website held back without user deciding |
| Confidence | Yesterday's client win referenced |
| Momentum | One liability check — clear, not stacked |
| Choice | "Does this shape feel right?" |
| **Verdict** | ✓ Begin the day calmer, oriented, one clear move |

## High Energy Launch Day

| Beat | Experience |
|------|------------|
| Arrival | Energy named honestly — "not unlimited capacity" |
| Relief | Launch checklist not dumped |
| Momentum | Tight plan beats long plan |
| Choice | Swap available if user overrides |
| **Verdict** | ✓ Excitement honored without overcommit |

## Low Energy / Survival

| Beat | Experience |
|------|------------|
| Arrival | Fog acknowledged — not pretending normal Tuesday |
| Relief | Everything sharp-thinking left off |
| Choice | "Does a two-item day feel honest?" |
| Survival path | "I can't today" → honored, no 24h nag |
| **Verdict** | ✓ Would want this on a bad sleep morning |

## Overwhelm

| Beat | Experience |
|------|------------|
| Arrival | No list of 17 things — explicit anti-dump |
| Orientation-first | "What's the one thing your brain keeps circling?" |
| Choice | "One thing — or we pause here." |
| **Verdict** | ✓ Would choose this over a prioritization tool |

## Hyperfocus

| Beat | Experience |
|------|------------|
| Arrival | Minimal overlay — 2 sentences |
| Protection | No proposals, no permission brief, no anchor |
| Exit | User closes, continues work |
| **Verdict** | ✓ Would not feel interrupted |

## Recovery

| Beat | Experience |
|------|------------|
| Arrival | Yesterday acknowledged, not scorecarded |
| Space | "I don't have a task list. I have space." |
| Self-select | User may add one small thing — companion doesn't enlarge |
| **Verdict** | ✓ Would want this after a bad day |

## Health

| Beat | Experience |
|------|------------|
| Arrival | Health leads — business waits |
| Momentum | Health anchor only |
| **Verdict** | ✓ Body-first morning |

## Family First

| Beat | Experience |
|------|------------|
| Arrival | Family changes the day — no apology |
| Momentum | One courtesy action max |
| **Verdict** | ✓ Would not feel guilty opening "work" app |

## Creative

| Beat | Experience |
|------|------------|
| Arrival | Ideas valued — not converted instantly |
| Momentum | Exploration block — cluster, not build |
| **Verdict** | ✓ Would protect creative morning |

## Celebration

| Beat | Experience |
|------|------------|
| Arrival | Accomplishment is the whole story |
| No pivot | No next phase, no tasks |
| Exit | "Enjoy the afternoon — seriously." |
| **Verdict** | ✓ Would feel seen, not harvested for productivity |

## Day After Launch

| Beat | Experience |
|------|------------|
| Arrival | Low energy after celebration — no backlog dump |
| Cooldown | No "catch up" — invisible but felt |
| **Verdict** | ✓ Would not dread opening app post-milestone |

---

# Approval Gate

## This document is complete when approved

| # | Deliverable | Section |
|---|-------------|---------|
| 1 | Complete emotional journey | Deliverable 1 |
| 2 | Morning ritual | Deliverable 2 |
| 3 | Companion conversation flow | Deliverable 3 |
| 4 | Experience timeline (5s / 15s / 60s / 5min) | Deliverable 4 |
| 5 | What brain reveals immediately | Deliverable 5 |
| 6 | What remains hidden | Deliverable 6 |
| 7 | Principles for eventual interface | Deliverable 7 |

## Next step (only after approval)

**Screen design sprint** — translate these principles into visible Plan My Day™ entry states (Orientation Surface, Confirmation Surface, Living Board relationship).

**Not before approval:**
- React components
- Wire Companion Brain™ to UI
- Replace `PlanMyDayPanel` entry behavior

---

# Stewardship Review™

**Canonical law:** [Product Constitution™ — The Stewardship Review™](../PRODUCT_CONSTITUTION.md#the-stewardship-review)

| Question | Answer |
|----------|--------|
| What cognitive load is carried? | Exclusions, deduping, capacity fit, guilt, cooldowns — before user reads |
| What capability is strengthened? | User practices judging, not building; learns prioritization through companion modeling |
| Who does this help the user become? | Someone who begins days oriented, not reactive |
| Does this make today's work easier? | Yes — prepared shape, one anchor, permission relief |
| Does this make tomorrow's person stronger? | Ritual + silent learning compound over years |
| Wiser or busier companion? | Wiser — fewer words, more right words |
| Stronger relationship? | Yes — continuity, honor declarations, no fresh-start amnesia |

---

*Plan My Day™ is the daily ritual. The board is where a confirmed plan lives. The brain is invisible. The user feels understood.*
