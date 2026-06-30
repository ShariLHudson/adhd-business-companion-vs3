# Spark Alpha™ — Relationship Prototype

| Field | Value |
|-------|-------|
| **Name** | Spark Alpha™ |
| **Status** | Active milestone — validation phase |
| **Route** | `/spark-alpha` (development) |
| **Freeze** | [Architecture Freeze](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md) |
| **Principle** | [The Member Wins™](./THE_MEMBER_WINS.md) |
| **QA** | [Spec 119](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) · [Spec 116](./SPARK_CONVERSATION_GOLD_STANDARDS_FRAMEWORK.md) |
| **Types** | `lib/sparkAlpha/` |

---

## Mission

Do **not** build the full ADHD Business Ecosystem™.

Do **not** build additional features.

Do **not** redesign the UI.

Build the **smallest possible** version of Spark that answers one question:

> **Would Shari choose to use this instead of ChatGPT for her own business every day?**

Everything else is secondary.

**Closing sentence:**

> Build the smallest amount of software necessary to create the largest possible feeling of partnership.

---

## Success criteria

After **20–30 minutes** with Spark, the member forgets they are operating software and feels they were working alongside a **trusted thinking partner**.

| Goal | Not the goal |
|------|----------------|
| Relief · clarity · confidence · momentum | Impressive AI |

### Spark Alpha is successful when

A member can talk for 20–30 minutes and:

- never feels lost
- never searches menus
- never wonders where something went
- never feels rushed
- never feels like operating software
- feels **more clear at the end** than at the beginning

### One final question (every internal test)

> If Shari had both ChatGPT and Spark open, would she **naturally choose Spark** for this conversation?

If anything other than immediate **yes** → stop adding features. Improve conversation · hidden work · feeling. Repeat.

---

## Scope — keep existing

| Keep (do not redesign) | Alpha adds |
|------------------------|------------|
| Login page | `/spark-alpha` relationship prototype |
| Welcome House | Conservatory + frosted conversation only |
| Welcome experience | Invisible layer + dev panel |

---

## Welcome flow

1. Spark greets naturally: **"How can I help today?"**
2. Member responds by **voice or text**
3. Conversation begins **immediately**
4. No menus · no dashboards · no feature selection

**Conversation is the interface.**

---

## Conversation

The **Conversation Engine** governs everything.

Frozen specs in force:

| Spec | |
|------|--|
| 106 | Conversation Guardrails™ |
| 114 | Conversation Flow Engine™ |
| 113 | Certainty Before Completion™ |
| 111 | Spark Hospitality™ |
| 118 | Hidden Work Engine™ |
| 108 | Environment Integration™ |

Every response → complete [QA framework](./SPARK_CONVERSATION_TESTS_FRAMEWORK.md) (eight gates).

Failures improve the **Conversation Engine** — not the interface.

---

## Workspace

**One environment:** The **Conservatory**.

- Existing frosted-glass conversation workspace pattern
- Large readable typography · calm layout · minimal interface
- Conversation primary
- **No** dashboard · ribbon · unnecessary controls · feature overload

**Question to answer:** Does the Conservatory help people think, feel calmer, or work better?

If not → refine before expanding the Estate.

---

## Workspace Context Manager™

**Intent → Context.** Not what the user clicks.

Every conversation creates a **temporary workspace context**. Example:

**Conversation:** *Market my ADHD app*

**Context Manager quietly loads:**

Marketing Planner · Brand Voice · Client Avatar · Business Brain · Previous Marketing Work · Related Spark Cards · Research · Templates

**Nothing visible. Everything ready.**

Mid-conversation: *"Actually let's talk about pricing."*

**Quietly unloads** marketing-weighted modules · **loads** Pricing Strategy · Offers · Positioning · Financial Planning

No menus · no loading screen · no clicking. Conversation continues.

**Implementation:** `lib/sparkAlpha/workspaceContextManager.ts`

---

## The conversation unit

A Spark conversation is:

> **One continuous thinking session around a single intent that may evolve — but never resets unless the member explicitly starts something new.**

| Examples | |
|----------|--|
| "Help me market my app" | → messaging · audience · launch |
| "I feel overwhelmed" | → clarity · journaling · planning |
| "I have an idea" | → shaping · deciding |

| Must not | |
|----------|--|
| ❌ Split into separate "tasks" | |
| ❌ Force new builders or modules | |
| ❌ Reset context between steps | |

**The conversation is the structure. Not the tool.**

---

## Build the Invisible Layer™

After every meaningful turn, quietly determine:

> What could Spark have prepared while we were talking?

Examples: organized notes · connected Business Assets™ · linked conversations · Spark Card™ signal · research prep · remembered decision · connected ideas · next steps · opportunities · Business Brain™ update

**Do not automatically present.** **Log only** — discover patterns before exposing to members.

Invisible work = thoughtful preparation — not automation for its own sake.

---

## Permission boundary

| Spark may (prepare silently) | Spark may never (without permission) |
|------------------------------|--------------------------------------|
| Autosave · memory proposals · link ideas · retrieve context · prepare drafts internally · organize Brain structure · preload research · suggest next steps (not execute) | Create final work · send · publish · auto-switch environments · launch features · modify member content · export · save final versions · generate final outputs · email |

> **Prepare freely. Act only with permission.**

**Types:** `lib/sparkAlpha/actionBoundaries.ts`

---

## What Spark is allowed to show

**ONLY:**

| Visible | |
|---------|--|
| Conversation | frosted glass |
| Environment | background / mood (Conservatory) |
| Folded Estate Map | single object (when implemented) |
| Suggestion bubbles | *"Would you like to…"* |

**Everything else invisible** unless member explicitly requests.

---

## ❌ Not allowed in Spark Alpha

| Forbidden | Why |
|-----------|-----|
| Dashboards | Collapses to SaaS |
| Tool menus | Conversation is the interface |
| Feature selection screens | |
| Sidebar navigation trees | |
| Forced Step 1 / Step 2 UI | |
| Auto-switching environments without permission | |
| Pop-up modals for actions | |
| Multi-panel layouts | |
| Dense UI competing with conversation | |

One productivity panel collapses the entire experience.

---

## Hidden Work Log (developer only)

After every conversation turn, log:

- Hidden work completed
- Hidden work prepared
- Suggestions considered
- Suggestions **intentionally withheld**
- Why Spark made those decisions

Members **never** see this.

**Implementation:** `lib/sparkAlpha/hiddenWorkLog.ts`

---

## Developer panel (Ctrl + Shift + D)

**For us. Not the member.**

| Section | |
|---------|--|
| Hidden Work | completed · prepared · withheld |
| Conversation Intent | current primary intent |
| Confidence | flow confidence |
| Business Brain Loaded | MVC bundle summary |
| Modules Loaded | Context Manager modules |
| Research Prepared | |
| Suggestions Withheld | + reasons |
| Permission Required | pending gates |
| Environment Score | Conservatory relevance |

**Component:** `components/sparkAlpha/SparkAlphaDevPanel.tsx`

---

## Iceberg essence

| Member experiences | Spark experiences |
|--------------------|-------------------|
| One conversation | Dozens of systems collaborating |

Everything **available** to Spark. Almost nothing **exposed** to the member.

> Spark is a frosted-glass conversation that stays continuous while the world around it shifts and the system quietly does all the work underneath.

---

## Development philosophy

We are no longer building software.

**We are building a relationship.**

Every line of code should move Spark closer to a trusted companion that quietly carries mental burden while leaving the member **calmer, more capable, and confident** about what comes next.

---

## Parking Lot

All features outside Alpha → [PARKING_LOT.md](./PARKING_LOT.md)

---

## Cursor

- `.cursor/rules/spark-alpha.mdc`
- `.cursor/rules/spark-conversation-architecture-frozen.mdc`
- `.cursor/rules/conversation-tests.mdc`

**Status:** Alpha v1.0 — relationship prototype active
