# 324 — Constitutional Certification & Cursor Adoption Handoff

## Purpose

Require Cursor and all future implementation work to adopt the Constitution.

## Cursor adoption steps

Cursor must:

1. add the Constitution to the architecture source of truth
2. reference it from implementation guidance
3. map current systems to constitutional owners
4. identify constitutional conflicts
5. identify shadow systems
6. identify hard-coded registry drift
7. identify duplicate context and lifecycle owners
8. propose remediation
9. add constitutional tests
10. report compliance

## Required repository artifacts

Create or update:

- `PLATFORM_CONSTITUTION.md`
- `ARCHITECTURE_OWNER_MATRIX.md`
- `CONSTITUTIONAL_COMPLIANCE_REPORT.md`
- `CONSTITUTIONAL_EXCEPTIONS.md`
- `ARCHITECTURE_DECISION_REGISTRY.md`
- `SHADOW_SYSTEM_AUDIT.md`
- `CONSTITUTIONAL_TEST_PLAN.md`

## Certification gates

### Gate 1 — Constitution installed

The Constitution exists in the repository and is referenced by architecture documentation.

### Gate 2 — Owners mapped

Every major concept has one named owner.

### Gate 3 — Shadow systems identified

Potential duplicate owners are listed and classified.

### Gate 4 — Registry alignment

User-facing catalogs derive from authoritative registries.

### Gate 5 — Context alignment

Business and Work context use canonical owners.

### Gate 6 — Create/Project integrity

Create remains content source; Projects remain execution owner.

### Gate 7 — Runtime truthfulness

Availability and implementation status match reality.

### Gate 8 — Certification alignment

All certification modules report into one authority.

### Gate 9 — Migration safety

Remediation plans preserve data and support rollback.

### Gate 10 — Future-development guardrails

Contribution guidance requires constitutional owner checks before new architecture.

## Certification result

Use:

- pass
- pass with declared limits
- fail
- blocked

## Required Cursor response

Cursor must return:

- constitutional conflicts found
- owners confirmed
- shadow systems found
- fixes completed
- migrations required
- tests added
- remaining exceptions
- certification result
