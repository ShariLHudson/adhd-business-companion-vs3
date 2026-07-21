# 309 — Adaptive Recommendation and Next Best Action Engine

## Purpose

Define how Spark Estate chooses the most useful next action across Work, Collections, Blueprints, Chamber capabilities, Projects, and current context.

## Core principle

The goal is not to recommend everything useful.

The goal is to recommend what is most useful now.

## Inputs

The engine may consider:

- explicit user intent
- active business
- Business DNA
- active identities
- business stage
- active Work
- deadlines
- dependencies
- capability requirements
- user knowledge
- user experience
- user confidence
- current context
- available time
- energy
- motivation
- decision load
- previous recommendations
- recent completion
- user preferences
- risk
- strategic value

## Candidate action types

- continue existing Work
- answer directly
- clarify one necessary fact
- create new Work
- connect existing Work
- use a Blueprint
- start a Project
- create a task
- request Research
- ask a Chamber capability
- ask the Board
- use Body Doubling
- review or revise
- generate an output
- defer
- rest or reduce scope
- talk it out

## Scoring dimensions

Possible dimensions:

- relevance
- urgency
- dependency value
- effort fit
- cognitive fit
- strategic value
- risk reduction
- momentum value
- confidence support
- reuse of existing Work
- reversibility
- user preference
- duplication risk

No single score should hide a material safety, legal, financial, or ethical concern.

## Recommendation output

A recommendation should contain:

- recommended action
- short reason
- estimated effort
- expected benefit
- Work connection
- whether it is reversible
- one alternative when useful
- confidence
- assumptions

## Recommendation styles

### Direct

Use when:

- intent is clear
- action is low risk
- context fit is strong
- user prefers decisiveness

### Two good choices

Use when:

- two options are meaningfully different
- user agency matters
- decision fatigue is high
- a single choice would require an unsupported assumption

### Guided comparison

Use when:

- stakes are high
- tradeoffs are material
- user has capacity
- the decision cannot be safely simplified

### No recommendation yet

Use when:

- critical information is missing
- context is contradictory
- the user wants reflection only
- regulated professional review is necessary

## Avoiding recommendation fatigue

The engine must:

- avoid repeating declined recommendations
- remember snoozed or deferred suggestions
- avoid recommending new work when existing work is more relevant
- limit simultaneous priorities
- distinguish idea from commitment
- allow "not now"
- avoid turning every conversation into a workflow

## Progress-aware behavior

When Work already exists:

- resume rather than recreate
- prefer completing high-value partial Work
- recognize blockers
- suggest a smaller next step
- surface dependencies
- preserve the user's source of truth

## Confidence-sensitive behavior

Low confidence should not automatically mean more information.

Often the better next action is:

- review evidence
- complete a small proof step
- rehearse
- get feedback
- use a checklist
- body double
- compare two options
- celebrate prior capability

## Explainability

The user should be able to ask:

- Why this?
- Why now?
- What did you base this on?
- What are the alternatives?
- What happens if I wait?

The explanation should be understandable and concise.

## Feedback loop

Capture:

- accepted
- declined
- deferred
- modified
- completed
- abandoned
- helpful
- unhelpful
- too much
- too basic
- too advanced

Use feedback to improve future recommendations without locking the user into a fixed type.

## Required tests

- active Work preferred over duplicate creation
- low-energy action fit
- high-urgency prioritization
- confidence-sensitive action
- declined recommendation suppression
- deferred recommendation handling
- explanation
- assumption visibility
- user override
- no forced workflow
- one source of truth
