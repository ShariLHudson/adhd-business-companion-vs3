# 127 — Workshop Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.workshop`  
**Title:** Workshop  
**Package version:** `1.0.0`

## Verdict summary

Workshop is registered as a Spark Blueprint on the certified Event Work Type and Universal Blueprint Framework. It uses definition data only — no private Workshop runtime, store, registry, or save path. Quick Start, Guided Build, and Complete Planning share one canonical Work ID. Domain guidance covers learning outcomes, practice, facilitation, materials, accessibility, follow-up implementation, and workshop-specific forgotten items.

Specialty Event Blueprints remain distinct:

- Online Workshop → `bp-event-online-workshop`
- One-Day Workshop → `bp-event-one-day-workshop`
- General Workshop → `event.workshop`

## Authoritative implementation

| Area | Path |
|------|------|
| Blueprint definition | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintDefinitions.ts` — `EVENT_BLUEPRINT_WORKSHOP` |
| Registration | Existing `ensureEventBlueprintsRegistered` / `EVENT_PLAN_BLUEPRINT_DEFINITIONS` (now 7) |
| NL / origin inference | `lib/universalWorkEngine/launch/inferWorkTypeAndBlueprint.ts` |
| Event intelligence hints | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintIntelligence.ts` |
| Public exports | `lib/universalWorkEngine/index.ts` — `WORKSHOP_EVENT_BLUEPRINT_ID`, `EVENT_BLUEPRINT_WORKSHOP` |
| Foundation cert | `lib/universalWorkEngine/packages/eventPlan/workshopEvent.foundation.cert.test.ts` |
| Browser checklist (jsdom) | `components/companion/universalBlueprint/workshopEvent.browserChecklist.test.tsx` |
| Bundle / domain | `docs/create-experience/127_workshop_event/` |

## Depth modes

| Mode | Behavior |
|------|----------|
| Quick Start | Purpose, participants, outcomes, format, when/where, core agenda/activity, registration, promotion, budget |
| Guided Build | Content architecture, activities/pacing, facilitation, participant materials, accessibility, communications, follow-up |
| Complete Planning | Facilitator guide / run of show, staffing, day-of, contingencies, measurement, post-workshop review |

Changing depth preserves the same Work ID via `changeBlueprintDepthMode`.

## Conditional sections

- Virtual / hybrid technology — `is_virtual_or_hybrid`
- Ticket pricing — `is_paid`
- Volunteers — `needs_volunteers`

## Integrations (universal owners only)

- Tasks / milestones · Research approve-before-apply · Project bridge · Cartography relationships  
- Chamber routing (`events`, `learning`, `content`, `marketing`, `project-management`) · Board review recommendations (advisory)  
- Shari Talk Only (no mutation) · Work on This (related Work) · Body Doubling attaches to existing Work  
- Anywhere-origin launch paths through UWE

## Out of scope (by design)

- Webinar, Retreat, Conference, Summit, or other new Event Blueprints  
- Workshop-specific engines, registries, or durable stores  
- Live Preview 23-step matrix (recommended post-deploy; jsdom checklist covers Create → Blueprint → Quick Start → Guided Build → virtual context)

## Evidence

- Automated: 13 foundation tests + browser checklist + Networking + Event Blueprint framework / Anywhere-Origin / Marketing regression green (see certification)  
- Blockers: `127_WORKSHOP_EVENT_BLUEPRINT_BLOCKERS.md`  
- Certification: `127_WORKSHOP_EVENT_BLUEPRINT_CERTIFICATION.md`
