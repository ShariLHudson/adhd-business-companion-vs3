# Conversation Engine Standard

## Purpose

Define how every Spark Estate™ conversation begins, progresses, pauses, changes direction, recovers, and ends.

## Core Principle

A conversation must always know:

- what the user just said
- what question is currently open
- what has already been answered
- what topic is active
- what the next useful move is
- whether the user changed direction
- whether a workflow should continue, pause, or close
- who owns the final visible response

## Required Behaviors

- recognize meaningful answers
- preserve answers across turns
- ask one necessary question at a time
- avoid repeated questions
- support interruption and return
- handle topic changes naturally
- repair misunderstandings
- distinguish ambiguity from refusal
- prevent generic fallback when useful context exists
- support multiple topics without mixing them
- close workflows cleanly
- never expose internal conversation state

## Core Conversation States

- open
- awaiting_answer
- answered
- partially_answered
- interrupted
- topic_changed
- paused
- resumed
- completed
- abandoned
- repaired

## Prohibited Behaviors

- restarting after an answer
- repeated introductions
- generic fallback loops
- forcing a prior workflow
- duplicate responses
- unrelated topic bleed
- asking users to repeat known information
- robotic workflow language

## Success Standard

The user should feel that Shari is listening, remembering, and naturally moving the conversation forward.
