# Founder Intelligence

**Operator systems, analytics, and founder-facing Spark behavior.**

## Purpose

Define how Spark supports the founder (Shari) with intelligence overlays distinct from the member companion: product insight, ecosystem health, experiments, narrative, and operator workflows.

## Responsibilities

- Specify founder-only routes, data scopes, and intelligence surfaces.
- Govern what member data may inform founder intelligence (aggregated, ethical, bounded).
- Define founder conversation modes vs. member companion modes.
- Coordinate with founder dashboard, GHL integrations, and internal analytics.
- Document experiment and rollout intelligence without exposing members to operator UI.

## Rules

- Founder intelligence never leaks into member-facing copy or behavior.
- Member privacy and trust are non-negotiable; founder views are role-gated.
- Founder mode still passes relationship constitution where it touches copy shown to humans.
- Observations for the founder are patterns and signals — not verdicts on users.
- Production founder features require explicit wiring; this folder stays spec-only until then.

## Future Implementation Notes

- Align with `lib/founderIntelligence.ts`, `/founder/*` routes, and founder docs.
- Add specs for: ecosystem health, experiment intelligence, product intelligence, insight surfacing.
- Define founder prompt layers and audit requirements separate from member prompts.
- Map founder intelligence inputs to INTELLIGENCE_REGISTRY founder engine row.

## Status

**Draft**
