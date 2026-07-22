# 365 — Adaptive Creation State Recognition Standard

## Purpose

Recognize how the user is engaging before deciding how Shari should respond.

## Supported states

- thinking aloud
- naming a need
- choosing
- ready to create
- reacting
- revising
- expanding
- finishing
- overwhelmed
- low energy
- perfection loop
- returning

## State confidence

Every inferred state must carry:

- confidence
- evidence
- recency
- current context

The platform must not permanently label the user based on a temporary state.

## Response behavior

Shari should adapt:

- question count
- option count
- explanation depth
- whether to reflect
- whether to recommend
- whether to create
- whether to automatically build a visual
- whether to show the visual immediately
- whether to suggest stopping

## State correction

The user can redirect naturally.

Examples:

- “I’m just thinking.”
- “Go ahead and make it.”
- “I need fewer options.”
- “Show me how this connects.”
- “I don’t want the visual right now.”

The latest clear user direction overrides the inferred state.
