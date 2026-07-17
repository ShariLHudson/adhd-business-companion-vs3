# Cursor Audit Prompt — Global Intent, Workflow State, and Strategy Library

Audit before implementation.

## Primary Incident

Trace:

1. `i need to create a new strategy for better communications with my VA`
2. ADHD or Business classification appears
3. user answers clearly
4. old Create Document continuation appears
5. user rejects document flow
6. classification restarts
7. user repeats request
8. strategy experience opens

## Strategy Library Requirement

The existing Strategy Library must be preserved and placed under:

**Get Advice → Strategy Library**

Do not recommend deleting it.

## Audit Questions

Identify:

- current Strategy Library route
- all Strategy Library entry points
- whether it is considered current, legacy, or mixed
- where ADHD/Business classification is triggered
- where custom strategy creation begins
- whether browse, apply, create, and resume are distinct
- where old strategy drafts are stored
- whether strategy state is semantically validated
- where Create Document state is stored and resumed
- why strategy intent can become document intent
- whether classification answers persist
- why classification restarts
- whether Get Advice exists as a navigation owner
- where Strategy Library should be registered under Get Advice
- current menus, dropdowns, cards, and routes that expose strategies
- whether duplicate Strategy destinations exist
- whether old and new Strategy UI paths conflict
- all early exits
- all generic fallback paths
- all response-owner bypasses

## Required Deliverable

Create:

`docs/conversation-engine/audits/GLOBAL_INTENT_WORKFLOW_AND_STRATEGY_LIBRARY_GAP_MAP.md`

Include:

- intent-classification owners
- artifact-type owners
- workflow-state owners
- Strategy Library routes
- Get Advice navigation owner
- stale-state resume conditions
- classification persistence
- duplicate or legacy paths
- exact source of the Create Document mismatch
- authoritative owner recommendation
- smallest shared implementation slice
- Strategy Library preservation plan
- Get Advice placement plan
- migration risks
- tests required
- preview recommendation

## Constraints

- no page-specific patches
- no VA-specific exceptions
- no deletion of the Strategy Library
- no production deployment
- no implementation yet
- stop after the audit
