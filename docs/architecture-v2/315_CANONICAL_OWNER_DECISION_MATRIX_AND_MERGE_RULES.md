# 315 — Canonical Owner Decision Matrix & Merge Rules

## Purpose

Provide Cursor with a repeatable way to select the authoritative owner when multiple implementations exist.

## Decision factors

For each competing implementation score:

- current production use
- data volume
- number of consumers
- architectural alignment
- stable identity
- lifecycle completeness
- permission model
- provenance
- versioning
- relationship support
- test coverage
- migration cost
- maintainability
- alignment with files 307–312

## Preferred owner characteristics

Prefer the implementation that:

- already owns canonical identity
- has the broadest legitimate reuse
- preserves stable IDs
- supports relationships
- supports lifecycle
- supports multiple businesses
- supports authorization
- supports exact resume
- is not tied to one UI
- can be extended without duplication
- aligns with Universal Work and Creation Ecosystem standards

## Merge strategies

Use one of:

### Retain and extend

Keep the strongest owner and add missing fields or relationships.

### Adapter

Keep a thin compatibility layer that translates old calls into the canonical service.

### Projection

Keep a generated read model for a specific UI or reporting need.

### Snapshot

Preserve historical state without making it authoritative.

### Relationship conversion

Replace copied data with links to canonical records.

### Controlled migration

Move records into the canonical owner with validation and rollback.

### Deprecation

Stop new writes, preserve reads temporarily, and remove only after migration and verification.

## Never merge by

- silently overwriting IDs
- dropping records
- copying data without provenance
- maintaining dual authoritative writes indefinitely
- leaving ambiguous ownership
- changing user-visible behavior without validation
- using file naming alone as proof of ownership

## Required owner matrix columns

- concept
- candidate A
- candidate B
- selected owner
- rationale
- extension plan
- migration plan
- compatibility plan
- test plan
- rollback plan
- approval state
