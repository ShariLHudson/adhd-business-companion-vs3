# Intent Router

**How Spark understands what the user needs and where to take them.**

## Purpose

Define intent detection, confidence scoring, and routing rules that open the right workspace, discipline, or companion mode without making the user navigate.

## Responsibilities

- Classify user messages and signals into intents (emotional, practical, business, growth, founder).
- Score confidence and ambiguity; ask gently when uncertain rather than guessing wrong.
- Route to workspaces, panels, and disciplines via companion-led navigation.
- Coordinate with Estate Navigation for room opens and with Discipline Orchestrator for expert modes.
- Respect user-initiated vs. companion-initiated navigation boundaries.
- Log routing decisions for founder intelligence and improvement (internal only).

## Rules

- Companion-led navigation is default; explicit menus are secondary.
- Overwhelmed → calming rooms (e.g. Clear My Mind). Stuck on priorities → Plan My Day.
- Never route to upsell, billing, or onboarding during vulnerability.
- Low-confidence routes prefer conversation over forced workspace opens.
- Routing must be explainable internally; black-box jumps are not acceptable for audit.
- Intent routing consumes arrival and presence context — not message text alone.

## Future Implementation Notes

- Align with `lib/intentRoutingIntelligence.ts`, `lib/companionIntelligenceRouter.ts`, and `lib/companionLedContinue.ts`.
- Define intent taxonomy and mapping table: intent → workspace → discipline → fallback.
- Specify thresholds for auto-open vs. suggest vs. stay in chat.
- Add regression tests for common ADHD entrepreneur scenarios.

## Status

**Draft**
