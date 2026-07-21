# 135 — Masterclass Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.masterclass`  
**Title:** Masterclass  
**Package version:** `1.0.0`

## Verdict summary

Masterclass is registered as a Spark Blueprint on the certified Event Work Type. Definition data only — no private Masterclass runtime. Focuses on promise, learning outcomes, curriculum with demonstrations, guided implementation, worksheets, pre-work, replay, and long-term application. Workshop (`event.workshop`) and Webinar (`event.webinar`) remain distinct.

## Authoritative implementation

| Area | Path |
|------|------|
| Definition | `EVENT_BLUEPRINT_MASTERCLASS` in `eventBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — masterclass / master class → `event.masterclass` |
| Cert | `masterclassEvent.foundation.cert.test.ts` |
| Browser | `masterclassEvent.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/135_masterclass_event/` |

## Conditional sections

- Pricing — `is_paid` (section id `revenue_pricing`)
- Helpers — `needs_volunteers`

## Out of scope

- Additional Event Blueprints beyond Masterclass  
- Masterclass-specific engines or save paths  

## Evidence

See certification and blockers docs.
