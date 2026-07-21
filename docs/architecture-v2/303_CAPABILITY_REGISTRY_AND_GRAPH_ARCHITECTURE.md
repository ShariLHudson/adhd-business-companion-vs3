# 303 — Capability Registry and Graph Architecture

## Purpose

Create the reusable intelligence contract that allows Collections to cross multiple Chamber Members without duplicating expertise.

## Capability principles

A capability must be:

- atomic enough to reuse
- meaningful enough to certify
- owned by one Member
- discoverable
- versioned
- testable
- adaptable
- attributable
- composable

## Capability examples

Marketing:

- audience.definition
- positioning.strategy
- message.architecture
- campaign.planning
- channel.selection
- marketing.measurement

Finance:

- pricing.analysis
- budget.planning
- cashflow.reasoning
- profitability.analysis
- scenario.forecasting
- roi.analysis

Learning:

- learning.outcome.design
- curriculum.sequence
- activity.design
- assessment.design
- transfer.support

Events:

- event.format.selection
- attendee.experience.design
- event.run_of_show
- event.risk.planning
- event.follow_up

Execution:

- task.decomposition
- dependency.mapping
- milestone.design
- workload.sequencing
- recovery.planning

## Capability Registry

The authoritative registry must support:

- register
- validate
- version
- certify
- deprecate
- replace
- search
- resolve dependencies
- determine owner
- determine compatible consumers
- inspect provenance
- audit usage

## Capability graph

The graph connects:

- Members
- Capabilities
- Collections
- Assets
- Work Types
- Business identities
- user capability states
- Work items

## Dependency types

- requires
- optionallyUses
- enhances
- reviews
- validates
- conflictsWith
- supersedes
- dependsOn
- produces
- consumes

## Orchestration

When an intent is received:

1. Resolve canonical Work.
2. Detect relevant Collection or Blueprint.
3. Read declared capability requirements.
4. Add context-specific capabilities.
5. Resolve owners.
6. Check capability certification.
7. Check user capability and confidence.
8. Determine contribution depth.
9. Request contributions.
10. synthesize through the Collection owner or Shari.
11. present a seamless result.
12. preserve provenance.
13. apply only approved Work changes.

## Contribution depth

Possible levels:

- silent validation
- short contribution
- full contribution
- review
- risk check
- teaching support
- implementation support
- measurement support

Depth must depend on user needs, not Member prestige.

## Conflict resolution

When capabilities conflict:

1. Identify the nature of conflict.
2. Preserve each Member's boundary.
3. Apply Collection priorities.
4. Use user goals and constraints.
5. disclose meaningful tradeoffs.
6. request Board review when strategic.
7. do not hide unresolved material disagreement.

## Duplicate prevention

Reject:

- two active capabilities with materially identical purpose and scope
- Collections embedding copied Member knowledge instead of capability references
- Member-specific versions of universal capabilities
- new capability IDs created only to avoid dependency governance

## Certification

A capability is production certified only when:

- owner is valid
- scope is clear
- inputs and outputs are defined
- tests exist
- evidence rules exist
- adaptation rules exist
- dependencies resolve
- consumers are known
- provenance is retained
- no duplicate capability exists
