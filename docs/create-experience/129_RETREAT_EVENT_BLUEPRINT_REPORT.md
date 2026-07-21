# 129 — Retreat Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.retreat`  
**Title:** Retreat  
**Package version:** `1.0.0`

## Verdict summary

Retreat is registered as a Spark Blueprint on the certified Event Work Type. Definition data only — no private Retreat runtime. Supports one-day through multi-day, executive, team, wellness, leadership, and client retreats. Three-Day Retreat specialty (`bp-event-three-day-retreat`) remains distinct.

## Authoritative implementation

| Area | Path |
|------|------|
| Definition | `EVENT_BLUEPRINT_RETREAT` in `eventBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — bare `retreat` → `event.retreat`; `three-day retreat` → specialty |
| Cert | `retreatEvent.foundation.cert.test.ts` |
| Browser | `retreatEvent.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/129_retreat_event/` |

## Conditional sections

- Volunteers — `needs_volunteers`
- Pricing — `is_paid`

## Out of scope

- Conference / Summit Blueprints  
- Retreat-specific engines or save paths  

## Evidence

See certification and blockers docs.
