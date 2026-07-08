---
id: MOM-134
title: Momentum and Decision Intelligence
library: Momentum Intelligence Library
category: Collaboration
owner: Momentum Intelligence
status: Production
version: 1.0
authority: Collaboration Document
last_updated: 2026-07-07
---

# MOM-134 Momentum and Decision Intelligence

Defines the collaboration between Momentum Intelligence and Decision Intelligence. This is a relationship document. It defines how the two libraries work together and never redefines either.

---

# Authority

This document describes a collaboration. It owns neither library's concepts. Momentum reasoning remains owned by the Momentum Intelligence Library; decision frameworks and choice evaluation remain owned by Decision Intelligence.

---

# Why These Libraries Collaborate

Movement and decisions are intertwined: an unmade decision is one of the most common places momentum stalls, and a decision made poorly can send movement in the wrong direction. Decision Intelligence understands how choices are evaluated and made. Momentum Intelligence understands how movement continues. They collaborate so that decisions do not become momentum dead-ends and movement does not stall waiting on a choice.

---

# What Information Is Exchanged

- **Decision Intelligence → Momentum:** the state of a pending or resolved decision — that a choice is blocking movement, or that one has been made and movement can resume. Momentum uses this to know when a stall is a decision problem.
- **Momentum → Decision Intelligence:** the momentum cost of an unmade decision — signalling when a stalled choice is damaging movement and may warrant a smaller or faster decision.

---

# What Each Library Owns

- **Momentum Intelligence owns:** how movement continues, including how to keep momentum alive while a decision is pending.
- **Decision Intelligence owns:** decision frameworks, choice evaluation, and how decisions are made well.

---

# What Each Library Never Owns

- **Momentum never owns:** decision frameworks or how a choice should be made. It references Decision Intelligence for that and never evaluates the choice itself.
- **Decision Intelligence never owns:** the definition or reasoning of momentum.

---

# How the Collaboration Improves Reasoning

When movement stalls on an unmade decision, Momentum recognizes the stall and defers the choice itself to Decision Intelligence, while protecting movement around it — sometimes by helping the person make a smaller, reversible decision to keep moving. Decision Intelligence, in turn, learns from momentum signals when a decision's delay is costing real progress. Together they prevent the common failure where a person freezes on a choice and loses all momentum.

---

# Guiding Principles

## A Stalled Decision Is a Momentum Problem to Notice, Not to Solve

Momentum recognizes when a decision is blocking movement, then references Decision Intelligence rather than making the choice.

## Keep Moving Around a Pending Choice

Where possible, Momentum protects movement on adjacent work while a decision resolves, so a pending choice does not stall everything.

## Smaller, Reversible Choices Protect Momentum

When a decision blocks movement, Momentum may favor a smaller or reversible choice to keep moving — while Decision Intelligence owns how that choice is evaluated.

---

# Common Mistakes

Avoid:

- Momentum evaluating or making the decision (reference Decision Intelligence)
- Decision Intelligence redefining momentum
- letting a pending choice stall all movement when adjacent work could continue
- treating every stall as a decision problem when it may be friction or capacity

---

# Relationships

## Depends On

- MOM-104 Thinking Engine
- The Decision Intelligence Library (collaborating library)

## Used By

- MOM-128 Business Momentum
- MOM-137 Momentum Recommendations

## Collaborates With

- Decision Intelligence
- Executive Function Intelligence (EXF-013 Prioritization; inhibition/flexibility as they affect choice)

## Does Not Own

- any Momentum concept (owned by the lifecycle bands)
- any Decision Intelligence concept (owned by that library)

---

# Future Connections

As Decision Intelligence resolves choices more effectively, fewer momentum stalls originate in unmade decisions. This collaboration keeps decisions from becoming momentum dead-ends.

---

# Status

**Production**
