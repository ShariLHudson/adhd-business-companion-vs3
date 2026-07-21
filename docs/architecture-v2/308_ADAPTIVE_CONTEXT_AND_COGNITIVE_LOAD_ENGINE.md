# 308 — Adaptive Context and Cognitive Load Engine

## Purpose

Define how Spark Estate adapts every recommendation, conversation, workspace, and next step to the user's current practical and cognitive capacity.

## Mission

Reduce:

- decision fatigue
- startup friction
- working-memory load
- unnecessary navigation
- task-switching
- overwhelm
- repeated decisions
- interruption recovery cost

## Context dimensions

### Energy

- depleted
- low
- moderate
- strong

### Focus

- scattered
- limited
- workable
- deep

### Motivation

- resistant
- low
- willing
- strong

Energy and motivation must remain separate.

### Stress

- calm
- elevated
- high
- overloaded

### Available time

- under 10 minutes
- 10–25 minutes
- 25–60 minutes
- 1–2 hours
- extended

Support exact time when known.

### Decision load

- light
- moderate
- high
- exhausted

### Urgency

- no deadline
- flexible
- soon
- urgent
- critical

### Environmental context

- quiet
- interrupted
- meeting-heavy
- traveling
- caregiving
- public space
- low privacy

### Accessibility and health context

Include only what the user chooses to share or what is necessary for safe adaptation.

## Sources

Context may come from:

- direct user statement
- Plan/Adapt My Day
- Rhythms
- calendar
- recent conversation
- active Work
- current deadline
- user-set preference
- temporary inference

Temporary inference must decay quickly.

## Cognitive-load rules

### Low energy

- show one next step
- reduce choices
- avoid long explanations
- use existing context
- offer partial completion
- prioritize progress over completeness

### High decision load

- narrow to one or two recommendations
- explain the basis briefly
- avoid asking for preferences already known
- use defaults that are reversible
- defer nonessential choices

### Limited focus

- shorten steps
- create stopping points
- preserve exact resume
- avoid branching workflows
- use visible progress

### Urgent + overloaded

- identify the minimum safe outcome
- distinguish essential from optional
- draft or structure more of the work
- avoid teaching unless required
- state what can wait

### Strong capacity

- allow deeper work
- support comparison
- show dependencies
- invite strategy
- allow advanced review

## Decision Fatigue Budget

The platform may estimate a temporary decision budget based on:

- number of recent choices
- unresolved Work
- context signals
- user statements
- time pressure
- prior abandonment

It must not present a hidden clinical judgment.

The estimate is for interface adaptation only.

## Choice architecture

Default maximum visible choices:

- overloaded: 1–2
- low capacity: 2–3
- normal capacity: 3–5
- exploratory: more through progressive disclosure

Do not expose dozens of Chamber Members, Collections, or Blueprints at once.

## Startup-friction reduction

When a user returns, Spark Estate should prioritize:

- meaningful continue
- plan/adapt the day
- help me choose

For active Work, show:

- where they stopped
- what remains
- the smallest useful next action
- estimated effort
- why it matters

## Interruption recovery

Every guided experience must preserve:

- Work ID
- current section
- last completed action
- unresolved question
- next suggested step
- relevant context
- generated drafts
- approved changes

## Future-feeling reinforcement

When appropriate, Shari may ask:

- How will you feel once this is finished?
- What will become easier after this is done?
- What would completing this free you to do?

This should support motivation, not manipulate the user.

## Non-punitive behavior

Never:

- shame missed tasks
- imply laziness
- display failure streaks
- force completion
- turn every unfinished item into urgency
- add more reminders merely because something is incomplete

## Required tests

- energy and motivation remain separate
- low-energy response
- decision-load reduction
- limited-time adaptation
- urgent/overloaded minimum-safe outcome
- strong-capacity deeper mode
- choice limits
- exact resume
- temporary inference decay
- no clinical labeling
- non-punitive language
- accessibility
