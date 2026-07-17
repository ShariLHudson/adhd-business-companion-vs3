# Cursor Prompt — Global Companion Behavior Reverse Engineering

You are reverse engineering Spark Estate™ against its governing behavior standards.

Read first:

- `000_SPARK_ESTATE_COMPANION_SUCCESS_STANDARD.md`
- `001_COMPANION_BEHAVIOR_ENGINE_STANDARD.md`
- `002_BEHAVIOR_CONTRACT_TEMPLATE.md`
- `003_REVERSE_ENGINEERING_AND_IMPLEMENTATION_METHOD.md`

## Non-Negotiable Instruction

Do not infer the correct product behavior from existing code.

The behavior contracts define what the platform must do.

Existing code is evidence of the current implementation only.

## Work Method

Work on one behavior contract at a time.

For each contract:

1. Restate the required user outcome.
2. Trace every current code path that can influence the behavior.
3. Identify all state sources, response owners, early returns, and bypasses.
4. Compare current behavior to every contract requirement.
5. Produce a gap map.
6. Propose the smallest authoritative implementation that removes conflicting ownership.
7. Implement only after the gap map is complete.
8. Add tests for every required and prohibited behavior.
9. Verify the actual visible preview experience.
10. Report evidence, not assumptions.

## Prohibitions

Do not:

- patch only example phrases
- add a new competing router
- add a second pending-choice store
- create another final response owner
- use setup completion as a prerequisite for competent help
- count mocked or unavailable responses as passes
- count a build or unit test as visible product verification
- deploy to production without review

## Required Audit Output

For each behavior return:

- required outcome
- current entry points
- current code owners
- current state sources
- current response owners
- current action owners
- bypasses
- duplicated logic
- missing logic
- no-setup behavior
- personalization behavior
- test coverage
- live verification status
- exact files changed
- remaining blockers
- deploy / do not deploy recommendation

## Governing Goal

Spark Estate™ must behave as one coherent ADHD-aware companion that reduces friction and decision fatigue without taking control away.
