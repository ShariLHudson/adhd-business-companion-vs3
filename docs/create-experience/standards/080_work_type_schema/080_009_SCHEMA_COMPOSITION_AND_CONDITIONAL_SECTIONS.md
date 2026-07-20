# 080 — Schema Composition and Conditional Sections

## Purpose

Allow work types to share compatible section patterns without duplicating their implementation.

## Reusable Section Families

- Purpose
- Audience
- Goals
- Measures
- Budget
- Schedule
- Risks
- Responsibilities
- Research
- Review
- Final Output

A reusable section family provides common behavior.

The work-type schema provides domain-specific prompts, examples, completion criteria, and editor modes.

## Conditional Sections

Examples:

- An Event gains Venue sections when `format = in_person`.
- An Event gains Online Platform sections when `format = virtual`.
- A Campaign gains Paid Media sections when paid channels are selected.
- An SOP gains Compliance Review when regulated activity is involved.
- A Course gains Certification Requirements when certification is offered.

## Member Control

When a conditional section appears, explain why.

Members may hide optional conditional sections when they are not relevant.

Required conditional sections may be deferred but not silently omitted.
