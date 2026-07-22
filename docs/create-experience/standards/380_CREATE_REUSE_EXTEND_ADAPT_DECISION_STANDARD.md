# 380 — Create, Reuse, Extend or Adapt Decision Standard

## Purpose

Choose the lowest-friction action that solves the user's actual need.

## Decision order

Evaluate in this order:

1. Is the need already solved?
2. Is there an existing artifact that can be reused unchanged?
3. Can an existing artifact be adapted for this audience, channel, or situation?
4. Can an existing artifact be extended?
5. Should related artifacts be combined?
6. Should an overloaded artifact be separated?
7. Is a genuinely new creation justified?

## Required recommendation object

```yaml
creation_strategy_decision:
  requested_outcome:
  recommended_action:
  primary_artifact_id:
  related_artifact_ids:
  confidence:
  reason:
  expected_user_effort:
  expected_reuse_value:
  duplication_risk:
  content_drift_risk:
  next_action:
```

## Approved action enum

- use_existing
- update_existing
- extend_existing
- adapt_existing
- merge_existing
- split_existing
- connect_existing
- create_new
- create_simple_first_version
- route_to_blueprint
- link_to_project
- promote_to_knowledge
- no_action_needed

## Shari language

Examples:

> “You already have a Client Welcome Guide that covers most of this. The simplest path is to add a short ‘What Happens Next’ section rather than create another guide.”

> “This is different enough to deserve its own checklist, but it should stay connected to the existing closing procedure.”

> “You do not need a full manual for this. A five-step reset checklist should solve the problem.”
