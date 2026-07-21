# 318 — Universal Knowledge, Retrieval, and Provenance Architecture

## Purpose

Define how Spark Estate stores, retrieves, evaluates, combines, updates, and attributes knowledge across Chamber Members, Collections, capabilities, Blueprints, Shari, the Board, and the Intelligence Library.

## Core principles

Knowledge must be:

- owned
- versioned
- attributable
- retrievable
- evidence-aware
- bounded
- maintainable
- adaptable
- testable

No generated answer should appear authoritative merely because it sounds confident.

## Knowledge layers

### Platform knowledge

Defines:

- architecture
- universal behavior
- Work contracts
- routing
- governance
- accessibility
- cognitive-load rules

### Member knowledge

Defines domain expertise owned by a Chamber Member.

### Capability knowledge

Defines the exact reasoning and evidence required to perform a reusable capability.

### Collection knowledge

Defines how capabilities combine for a coherent business purpose.

### Blueprint knowledge

Defines guided implementation for a specific outcome.

### User knowledge

Includes:

- confirmed business facts
- preferences
- prior decisions
- Work history
- capability evidence
- confidence corrections
- active context

### External knowledge

Includes:

- current public information
- connected-source data
- uploaded files
- research results
- linked business records

## Retrieval pipeline

1. Resolve user intent.
2. Resolve active business and Work.
3. Resolve likely Collection and capabilities.
4. Identify authoritative knowledge owners.
5. Retrieve platform and domain constraints.
6. Retrieve relevant user-confirmed context.
7. Retrieve Work-specific history.
8. Retrieve current external evidence when required.
9. evaluate source quality and freshness.
10. resolve conflicts.
11. synthesize with provenance.
12. apply adaptation rules.
13. preserve approval boundaries.

## Retrieval priority

Recommended priority:

1. current user instruction
2. canonical Work state
3. user-confirmed business facts
4. current authoritative platform contracts
5. certified capability knowledge
6. certified Member knowledge
7. Collection and Blueprint guidance
8. connected source data
9. current external research
10. inferred user context
11. general background knowledge

Lower-priority information must not override higher-priority authoritative information without disclosure.

## Provenance contract

Every material contribution should retain:

- source type
- source ID
- owner
- version
- retrieval date
- freshness
- evidence quality
- confidence
- assumptions
- transformation applied
- Work ID
- capability ID
- Collection ID when applicable

## Evidence quality

Suggested levels:

- authoritative
- strong
- moderate
- limited
- anecdotal
- unknown

Evidence quality must influence:

- wording
- confidence
- recommendation strength
- whether more research is needed
- whether professional review is required

## Knowledge conflicts

When sources conflict:

1. identify authoritative ownership
2. compare freshness
3. compare evidence quality
4. distinguish fact from recommendation
5. preserve material disagreement
6. explain the chosen interpretation
7. avoid false certainty
8. escalate when consequential

## Freshness

Every knowledge object should declare:

- stable
- slow-changing
- frequently changing
- real-time

Frequently changing knowledge must trigger current verification when material.

## Duplication prevention

Do not copy full Member knowledge into:

- Collections
- Blueprints
- Shari prompts
- Board profiles
- implementation files
- UI content

Reference authoritative knowledge and add only context-specific composition rules.

## Retrieval boundaries

The system must not retrieve:

- unrelated private business data
- sensitive information without purpose
- stale inferred data when current confirmed data exists
- another business's confidential context
- deprecated knowledge without warning

## Required tests

- owner resolution
- retrieval priority
- current Work preference
- source freshness
- evidence-quality handling
- conflict resolution
- provenance retention
- business-context isolation
- duplicate prevention
- deprecated knowledge behavior
- external verification trigger
