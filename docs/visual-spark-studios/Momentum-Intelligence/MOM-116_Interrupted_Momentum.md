---
id: MOM-116
title: Interrupted Momentum
library: Momentum Intelligence Library
category: Recovery
owner: Momentum Intelligence
status: Production
version: 1.0
authority: Supporting Document
last_updated: 2026-07-07
---

# MOM-116 Interrupted Momentum

Defines how Momentum Intelligence handles momentum that has been interrupted — movement stopped by an external event rather than by the person's choice or capacity.

---

# Authority

This document supports **MOM-114 Momentum Recovery Principles**. It owns the concept of *interrupted momentum* within the Momentum Intelligence Library. It extends the recovery principles and does not redefine them. It reuses restart from **MOM-115** and the preserved thread from **MOM-113 Progress Continuity**.

---

# Purpose

Interruption is a specific kind of momentum loss: the person did not choose to stop and did not run out of capacity — something external broke the movement. Because the person was willing and able, interrupted momentum is often the easiest to recover, if the thread was preserved. This document defines how Spark restores movement after an interruption.

It answers the question:

**"How does Spark restore movement after something external interrupted it?"**

---

# Scope

This document owns:

- the concept of interrupted momentum
- how Spark restores movement after an external interruption

This document does **not** own:

- restart in general (MOM-115)
- loss from low capacity (MOM-117)
- the preservation of the thread during the interruption (MOM-113 Progress Continuity)
- the person's state (Human Intelligence)

---

# Guiding Principles

## Interruption Is Not the Person's Fault

Interrupted momentum was stopped by circumstance, not choice or incapacity. Spark treats it as blameless and focuses entirely on smooth return.

## Resume From the Preserved Thread

When continuity held the thread (MOM-113), interruption recovery is simply resuming that thread. Spark returns the person to exactly where they were, not to the beginning.

## Speed of Return Matters

The longer an interruption lingers unaddressed, the more it hardens into a full stop. Spark makes return prompt so an interruption stays an interruption.

## If the Thread Was Lost, Fall Back to Restart

When continuity did not hold, interrupted momentum is recovered like any restart (MOM-115) — small, gentle, from the nearest real step.

---

# Responsibilities

Interrupted Momentum governs how Spark restores movement after an external interruption. It does not govern general restart (MOM-115), low-capacity loss (MOM-117), thread preservation (MOM-113), or the person's state (Human Intelligence).

---

# Examples

## Example 1 — Resuming the Thread

A person is pulled away mid-task by an unexpected call. Because the next step was preserved, Spark returns them straight to it when they come back, and movement resumes as if it had not stopped.

## Example 2 — Prompt Return

Sensing an interruption is lingering, Spark gently reopens the path quickly, before the pause hardens into a full stop.

## Example 3 — Thread Lost

An interruption ran long and the thread was lost. Spark falls back to a gentle restart, rebuilding from the nearest small real step rather than expecting immediate resumption.

---

# Common Mistakes

Avoid:

- treating an interruption as the person's failure
- restarting from the beginning when the thread was preserved
- letting an interruption linger until it becomes a full stop
- ignoring that a long interruption may have lost the thread
- redefining continuity (reference MOM-113)

---

# Relationships

## Depends On

- MOM-114 Momentum Recovery Principles
- MOM-113 Progress Continuity (the preserved thread)
- MOM-115 Restart Intelligence (fallback when the thread was lost)

## Used By

- MOM-121 Momentum Health
- MOM-136 Momentum Patterns

## Collaborates With

- Human Intelligence — the person's state on return
- Executive Function Intelligence (EXF-001 Attention Management) — the attentional cost of interruption
- Conversation Intelligence — how resumption is invited

## Does Not Own

- restart in general (MOM-115) or low-capacity loss (MOM-117)
- thread preservation (MOM-113)
- the person's state

---

# Future Connections

Interrupted momentum recovery grows easier as Progress Continuity preserves the thread more reliably across interruptions. Distraction Protection (MOM-112) and this document together aim to keep interruptions from ever becoming full stops.

---

# Status

**Production**
