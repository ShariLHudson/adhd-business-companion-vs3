# 321 — Intelligence Observability, Audit, and Architecture Health

## Purpose

Define how Spark Estate detects architectural drift, routing failures, duplicate intelligence, stale knowledge, unsafe adaptation, and broken source-of-truth rules.

## Observability layers

### Architecture health

Monitor:

- duplicate registries
- orphan objects
- missing owners
- conflicting owners
- dependency cycles
- uncertified production dependencies
- deprecated usage
- version conflicts
- private runtime creation
- shadow Work

### Routing health

Monitor:

- unresolved intents
- wrong destination
- repeated rerouting
- accidental auto-launch
- bypassed locks
- duplicate Work creation
- failed resume
- user corrections
- fallback frequency

### Knowledge health

Monitor:

- stale sources
- unresolved conflicts
- low-evidence recommendations
- missing provenance
- duplicated knowledge
- deprecated frameworks
- unsupported certainty

### Adaptation health

Monitor:

- excessive options
- unnecessary questions
- incorrect capability assumptions
- energy/motivation conflation
- overuse of confidence labels
- low-energy experiences that remain too heavy
- recommendation repetition
- ignored user preferences

### Conversation health

Monitor:

- robotic phrasing
- repeated scripts
- premature advice
- excessive routing
- awaiting-answer violations
- menu overload
- missing context reuse
- correction recovery

## Audit log requirements

Material actions should log:

- actor
- time
- business context
- Work ID
- intent
- route
- capability
- owner
- Collection
- source versions
- assumptions
- approval
- mutation
- result

Logs must avoid unnecessary sensitive content.

## Architecture health report

Required sections:

- overall status
- critical violations
- source-of-truth risks
- duplicate-risk candidates
- registry health
- certification health
- stale knowledge
- routing failures
- adaptation concerns
- maintenance gaps
- recommended actions

## Severity levels

- informational
- low
- moderate
- high
- critical

Critical examples:

- duplicate canonical Work creation
- private persistence path
- revoked capability used in production
- cross-business private-data leak
- silent consequential mutation
- missing owner for production capability

## Drift detection

Detect when implementation diverges from:

- Constitution
- registry contracts
- Member boundaries
- Collection manifests
- capability contracts
- Blueprint contracts
- Work Type contracts
- privacy rules
- conversation rules

## User-reported signals

User statements such as:

- this is not what I asked
- why did it take me here
- I already told you this
- stop suggesting that
- this feels overwhelming
- it lost my work
- it created another copy

should become structured quality signals.

## Health dashboard

Recommended views:

- architecture
- registries
- Members
- capabilities
- Collections
- Blueprints
- routing
- Work integrity
- knowledge freshness
- adaptive experience
- certification
- maintenance

## Required tests

- architecture violation detection
- duplicate Work detection
- stale knowledge warning
- routing correction capture
- privacy-safe logging
- severity classification
- certification drift
- dashboard accuracy
- false-positive review
- incident traceability
