# 136 — Fundraiser / Gala Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.fundraiser_gala`  
**Title:** Fundraiser / Gala  
**Package version:** `1.0.0`

## Verdict summary

Fundraiser / Gala is registered as a Spark Blueprint on the certified Event Work Type. Definition data only — no private Fundraiser runtime. Focuses on mission, fundraising goals, donor experience, sponsors, auction/giving technology, stewardship, and financial accountability. Business Luncheon remains distinct.

## Authoritative implementation

| Area | Path |
|------|------|
| Definition | `EVENT_BLUEPRINT_FUNDRAISER_GALA` in `eventBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — fundraiser / gala / benefit dinner → `event.fundraiser_gala` |
| Cert | `fundraiserGalaEvent.foundation.cert.test.ts` |
| Browser | `fundraiserGalaEvent.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/136_fundraiser_gala_event/` |

## Conditional sections

- Sponsors — `has_sponsors`
- Auction — `has_auction` (section id `vendors`)
- Volunteers — `needs_volunteers`
- Ticket and Giving Levels — `is_paid`

## Out of scope

- Additional Event Blueprints beyond Fundraiser / Gala  
- Fundraiser-specific engines or save paths  

## Evidence

See certification and blockers docs.
