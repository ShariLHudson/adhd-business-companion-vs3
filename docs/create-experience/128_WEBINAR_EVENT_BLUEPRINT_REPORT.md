# 128 — Webinar Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.webinar`  
**Title:** Webinar  
**Package version:** `1.0.0`

## Verdict summary

Webinar is registered as a Spark Blueprint on the certified Event Work Type and Universal Blueprint Framework. Definition data only — no private Webinar runtime, store, registry, or save path. Quick Start, Guided Build, and Complete Planning share one canonical Work ID. Domain focus: engagement over broadcast, clear CTA, moderator workflow, rehearsal, accessibility, replay, and follow-up action.

Specialty Blueprints remain distinct:

- Online Workshop → `bp-event-online-workshop`
- Workshop → `event.workshop`
- Webinar → `event.webinar`

## Authoritative implementation

| Area | Path |
|------|------|
| Blueprint definition | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintDefinitions.ts` — `EVENT_BLUEPRINT_WEBINAR` |
| Registration | `EVENT_PLAN_BLUEPRINT_DEFINITIONS` (now 8) |
| NL / origin inference | `lib/universalWorkEngine/launch/inferWorkTypeAndBlueprint.ts` |
| Event intelligence hints | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintIntelligence.ts` |
| Public exports | `WEBINAR_EVENT_BLUEPRINT_ID`, `EVENT_BLUEPRINT_WEBINAR` |
| Foundation cert | `webinarEvent.foundation.cert.test.ts` |
| Browser checklist | `webinarEvent.browserChecklist.test.tsx` |
| Bundle / domain | `docs/create-experience/128_webinar_event/` |

## Conditional sections

- Recording and replay (`swag`) — `will_record`
- Ticket pricing — `is_paid`

## Out of scope

- Retreat, Conference, Summit, or other new Event Blueprints  
- Webinar-specific engines or save paths  

## Evidence

See `128_WEBINAR_EVENT_BLUEPRINT_CERTIFICATION.md` and `128_WEBINAR_EVENT_BLUEPRINT_BLOCKERS.md`.
