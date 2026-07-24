# Strategic Experiments

**Runtime:** `frameworks/experiments.ts` · `engine/designExperiment.ts`  
**Type:** `StrategicExperiment` in `intelligence/types.ts`

## Contract

Bounded fields include assumptionBeingTested, questionToAnswer, smallAction/action, scope, duration, audience, capacityLimit, evidenceToCollect / evidenceItems, success/stop signals, reviewPoint, decisionThatFollows, optional recommendedDestination.

Compatibility: `smallAction` and string `evidenceToCollect` remain for existing callers.

## Requirements

Experiments must reduce meaningful uncertainty, stay smaller than full implementation, have a boundary, duration or review point, evidence, success signals, stop signals, and a decision that follows.

**Never silently create a Project.** Destination handoff only after member approval.

## Triggers — prefer when

Uncertainty is high · decision is reversible · evidence is weak · a limited test answers the question · full commitment is expensive · user is not ready · customer response or capacity fit is uncertain · competing interpretations exist

## Triggers — skip when

The test cannot reduce uncertainty · burden ≈ full implementation · urgent irreversible decision · evidence already strong · delay increases harm · closing-the-business depth needs more than a casual pilot
