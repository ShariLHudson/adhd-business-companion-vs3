# 278 — Blueprint Context Connection Certification & Tests

## Certification ID

`certification.blueprint.context_connection`

## Purpose

Prevent a Blueprint from entering production when it cannot reliably connect to the user’s established business information.

## Certification gates

### Gate 1 — Active business

The Blueprint identifies and displays the active business.

### Gate 2 — Canonical profile load

Relevant Business Profile and Business DNA fields load successfully.

### Gate 3 — Avatar and offer load

Selected client avatars, offers, products, and services are available.

### Gate 4 — Prefill

Known information is prefilled without forcing re-entry.

### Gate 5 — Question suppression

The Blueprint does not ask for reliable existing information again.

### Gate 6 — Ambiguity handling

Multiple businesses, avatars, or offers are handled with concise selection.

### Gate 7 — Override control

Local overrides are supported and correctly scoped.

### Gate 8 — Canonical update permission

Canonical data changes only with explicit permission.

### Gate 9 — Provenance

Inherited and overridden fields retain source provenance.

### Gate 10 — Exact resume

The Blueprint resumes with the same selected business, avatar, offer, and overrides.

### Gate 11 — Chamber propagation

All capability contributors receive and return the correct context envelope.

### Gate 12 — Create and Project continuity

Create artifacts and linked Projects preserve the same business context.

### Gate 13 — Conflict detection

Conflicting values are surfaced or resolved by deterministic authority rules.

### Gate 14 — Staleness handling

Stale information is confirmed only when it materially affects the work.

### Gate 15 — Isolation

No data leaks between businesses, avatars, users, or Blueprint sessions.

## Required test cases

Every Blueprint must test:

- one business and one avatar
- one business with multiple avatars
- multiple businesses
- archived business
- archived avatar
- missing Business DNA
- stale business description
- current-session override
- Blueprint-only override
- canonical update accepted
- canonical update declined
- new avatar creation
- new offer creation
- launch from Create
- launch from Project
- resume after partial completion
- canonical profile changed during active session
- Chamber capability called with context
- Chamber capability returns conflicting context
- Project handoff
- cross-business isolation
- failed profile load
- offline or temporary dependency failure

## Repeated-question test

Certification fails if the Blueprint asks for a field already available and reliable unless:

- explicit confirmation is required for safety
- multiple valid contexts exist
- the information is stale and material
- the current work intentionally differs

## Data-integrity test

Certification fails if:

- the Blueprint creates unlinked duplicate profile records
- a local override alters canonical data without permission
- one business’s context appears in another business
- avatar data is applied to the wrong output
- context is lost during resume
- Project handoff strips provenance
- capability contributors use generic defaults despite available context

## Certification results

Use:

- `pass`
- `pass_with_declared_limits`
- `fail`
- `blocked`

## Production rule

No Blueprint is production-certified unless it passes both:

- Blueprint Createability Certification
- Blueprint Context Connection Certification

A Blueprint that can create outputs but cannot connect to the user’s established business context is incomplete.
