# 236 — Blueprint Createability Certification & Testing

## Certification ID

`certification.blueprint.createability`

## Purpose

Prevent any Blueprint from being released when its promised outputs cannot actually be created and used.

## Certification gates

### Gate 1 — Promise integrity

Every promised output is listed in the Createability Manifest.

### Gate 2 — Input completeness

Required user inputs and questions are defined.

### Gate 3 — Capability availability

The accountable capability and all contributors exist and are certified.

### Gate 4 — Creation path

The output has a real direct, structured, composed, or connected creation flow.

### Gate 5 — Persistence

The output can be saved.

### Gate 6 — Editability

The output can be revised without recreating it from scratch.

### Gate 7 — Exact resume

Partial work resumes at the correct point with prior answers intact.

### Gate 8 — Reuse

The output can be referenced by other Blueprints or Work objects where allowed.

### Gate 9 — Project handoff

Any promised handoff is implemented, intentional, and preserves Create as source of truth.

### Gate 10 — Export integrity

Any promised export produces a valid, usable artifact.

### Gate 11 — Calculation integrity

Any calculation, score, forecast, or financial model is reproducible and testable.

### Gate 12 — Status honesty

Unavailable outputs are not presented as available.

## Required test cases

Every Blueprint must test:

- blank start
- partial completion
- exact resume
- edit after save
- low-energy mode
- advanced mode
- missing input
- conflicting input
- failed connected capability
- unavailable output
- Project handoff accepted
- Project handoff declined
- reuse by another Blueprint
- archive and reopen
- version update

## Calculation testing

For calculation outputs:

- formulas are defined
- units are defined
- assumptions are visible
- inputs are traceable
- results are reproducible
- edge cases are tested
- invalid inputs are rejected
- changes recalculate correctly

## Composed output testing

For multi-capability packages:

- owner remains clear
- contributors do not overwrite each other
- outputs share one source of truth
- provenance is retained
- partial failures degrade safely
- final package is coherent

## Failure conditions

Certification fails if:

- one output is only described but not created
- save is missing
- resume restarts incorrectly
- calculations cannot be reproduced
- output destination is unclear
- Project handoff duplicates the source
- export is broken
- required capability is missing
- future output is shown as available
- user cannot revise the output

## Certification result

Use:

- `pass`
- `pass_with_declared_limits`
- `fail`
- `blocked`

## Release rule

A Blueprint may enter production only with:

- `pass`, or
- `pass_with_declared_limits` when all limits are visible to the user

A Blueprint with `fail` or `blocked` status must not be presented as fully available.
