# 412 — AI Prompt, Workflow & Agent Design Intelligence

## Purpose

Help users build reliable AI-assisted workflows rather than isolated clever prompts.

## Prompt design layers

- role and purpose
- task
- context
- constraints
- examples
- output structure
- quality criteria
- uncertainty behavior
- stopping conditions

## Workflow design

Define:

- trigger
- input
- context source
- AI step
- deterministic step
- human review
- output destination
- failure handling
- logging
- improvement loop

## Prompt pattern library

### Transform

Rewrite, summarize, classify, extract, convert.

### Generate

Draft, ideate, expand, compose.

### Evaluate

Score, compare, critique, test.

### Decide

Recommend using explicit criteria and uncertainty.

### Plan

Sequence work, dependencies, risks, milestones.

### Retrieve-and-answer

Use approved sources and cite evidence.

### Tool-use

Call systems for exact data or action.

## Agent design rule

Use an agent only when the task requires:

- multiple dependent steps
- dynamic tool choice
- changing state
- recovery
- iterative evaluation

## Agent safeguards

- narrow permissions
- explicit goals
- bounded tool access
- step logging
- retries with limits
- rollback
- approval gates
- failure escalation

## ADHD adaptation

- provide ready-to-use first versions
- avoid requiring prompt-engineering vocabulary
- offer one recommended workflow
- hide advanced configuration
- preserve examples
- support voice and rough notes
