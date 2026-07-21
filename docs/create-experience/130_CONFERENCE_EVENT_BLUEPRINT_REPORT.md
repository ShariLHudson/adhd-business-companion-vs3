# 130 — Conference Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.conference`  
**Title:** Conference  
**Package version:** `1.0.0`

## Verdict summary

Conference is registered as a Spark Blueprint on the certified Event Work Type. Definition data only — no private Conference runtime. Supports single-day through multi-day, association, corporate, user, leadership, industry, and hybrid conferences.

## Authoritative implementation

| Area | Path |
|------|------|
| Definition | `EVENT_BLUEPRINT_CONFERENCE` in `eventBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — `conference` → `event.conference` |
| Cert | `conferenceEvent.foundation.cert.test.ts` |
| Browser | `conferenceEvent.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/130_conference_event/` |

## Conditional sections

- Sponsors — `has_sponsors`
- Exhibitors — `has_exhibitors`
- Volunteers — `needs_volunteers`
- Ticket pricing — `is_paid`

## Out of scope

- Summit or other new Event Blueprints beyond Conference  
- Conference-specific engines or save paths  

## Evidence

See certification and blockers docs.
