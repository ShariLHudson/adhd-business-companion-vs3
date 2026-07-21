# 134 — Challenge Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.challenge`  
**Title:** Challenge  
**Package version:** `1.0.0`

## Verdict summary

Challenge is registered as a Spark Blueprint on the certified Event Work Type. Definition data only — no private Challenge runtime. Focuses on purpose, daily outcomes, content rhythm, accountability, community check-ins, missed-day recovery, communications, accessibility/timezones, and follow-through. Workshop remains distinct (`event.workshop`).

## Authoritative implementation

| Area | Path |
|------|------|
| Definition | `EVENT_BLUEPRINT_CHALLENGE` in `eventBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — N-day / habit / plan a challenge → `event.challenge` |
| Cert | `challengeEvent.foundation.cert.test.ts` |
| Browser | `challengeEvent.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/134_challenge_event/` |

## Conditional sections

- Prizes and Recognition — `has_prizes` (section id `swag`)
- Pricing — `is_paid` (section id `revenue_pricing`)
- Community Leads — `needs_volunteers`

## Out of scope

- Additional Event Blueprints beyond Challenge  
- Challenge-specific engines or save paths  

## Evidence

See certification and blockers docs.
