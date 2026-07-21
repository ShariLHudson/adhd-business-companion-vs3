# 320 — Privacy, Trust, Consent, and User Control Architecture

## Purpose

Define how Spark Estate uses personal, business, behavioral, confidence, health, and contextual information responsibly.

## Trust principles

Spark Estate must be:

- transparent
- minimally invasive
- purpose-limited
- correctable
- consent-aware
- reversible
- respectful
- non-manipulative

## Data classes

### User-confirmed facts

Examples:

- business name
- services
- audience
- preferences
- goals

### Inferred facts

Examples:

- likely business identity
- possible capability level
- probable current priority

Inferences must include confidence and decay.

### Temporary context

Examples:

- low energy today
- only 20 minutes
- high decision fatigue
- urgent deadline

Temporary context should expire unless explicitly saved.

### Sensitive context

Examples:

- health
- finances
- family
- trauma
- faith
- political beliefs
- mental health
- confidence vulnerabilities

Sensitive context requires heightened purpose limitation.

## Consent levels

### Explicit

The user directly asks the platform to store, use, connect, or act.

### Contextual

The use is necessary to fulfill the immediate request and is reasonably expected.

### Inferred

The platform believes data may be useful but lacks confirmation.

Inferred use must remain low-risk, visible when material, and easy to correct.

## User controls

Users must be able to:

- review meaningful Business DNA
- correct facts
- remove stale information
- mark information private
- change support preferences
- reset inferred capability state
- disable a recommendation category
- decline personalization
- request explanation
- separate businesses
- control Work changes

## Prohibited uses

Do not use user vulnerability to:

- increase engagement
- create urgency
- pressure purchase
- encourage dependency
- manipulate decisions
- hide alternatives
- shame unfinished Work

## Capability and confidence data

Capability and confidence data must not:

- become a permanent label from weak evidence
- be exposed publicly
- be used to diminish the user
- be treated as a clinical assessment
- automatically restrict access to advanced material
- override explicit user preference

## Business separation

For users with multiple businesses:

- preserve business-specific context
- prevent accidental cross-use
- require explicit linking for sensitive data
- retain independent goals, Work, and metrics
- allow shared personal preferences only when appropriate

## Connected sources

Connected-source access must be:

- purpose-specific
- minimally scoped
- user-initiated or clearly expected
- logged
- revocable
- isolated by account and business context

## Decision transparency

For meaningful recommendations, users may ask:

- What did you use?
- Why did you recommend this?
- What assumptions did you make?
- What would change the recommendation?

## Retention

Every data class should declare:

- reason for retention
- retention duration
- owner
- correction method
- deletion method
- whether it is temporary or durable

## Required tests

- user correction
- deletion
- temporary-context expiration
- business separation
- inferred-data visibility
- sensitive-context restrictions
- connected-source scope
- recommendation explanation
- non-manipulation
- profile review
- consent revocation
