# 126 — Networking Event Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `event_plan`  
**Blueprint ID:** `event.networking_event`  
**Title:** Networking Event  
**Package version:** `1.0.0`

## Verdict summary

Networking Event is registered as a Spark Blueprint on the certified Event Work Type and Universal Blueprint Framework. It uses definition data only — no private Networking runtime, store, registry, or save path. Quick Start, Guided Build, and Complete Planning share one canonical Work ID. Domain guidance covers connection design, alone/shy support, badges, follow-up consent, sponsors/virtual conditionals, and networking-specific forgotten items.

## Authoritative implementation

| Area | Path |
|------|------|
| Blueprint definition | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintDefinitions.ts` — `EVENT_BLUEPRINT_NETWORKING_EVENT` |
| Registration | Existing `ensureEventBlueprintsRegistered` / `EVENT_PLAN_BLUEPRINT_DEFINITIONS` (now 6) |
| NL / origin inference | `lib/universalWorkEngine/launch/inferWorkTypeAndBlueprint.ts` |
| Event intelligence hints | `lib/universalWorkEngine/packages/eventPlan/eventBlueprintIntelligence.ts` |
| Public exports | `lib/universalWorkEngine/index.ts` — `NETWORKING_EVENT_BLUEPRINT_ID`, `EVENT_BLUEPRINT_NETWORKING_EVENT` |
| Foundation cert | `lib/universalWorkEngine/packages/eventPlan/networkingEvent.foundation.cert.test.ts` |
| Browser checklist (jsdom) | `components/companion/universalBlueprint/networkingEvent.browserChecklist.test.tsx` |
| Bundle / domain | `docs/create-experience/126_networking_event/` |

## Depth modes

| Mode | Behavior |
|------|----------|
| Quick Start | Purpose, who meets, format, when/where, capacity, promotion, budget essentials |
| Guided Build | Attendee experience, connection design, hosts, hospitality, badges, communications, accessibility, follow-up |
| Complete Planning | Run of show, staffing, safety, contingencies, measurement, post-event review |

Changing depth preserves the same Work ID via `changeBlueprintDepthMode`.

## Conditional sections

- Sponsors — `has_sponsors`
- Virtual / hybrid technology — `is_virtual_or_hybrid`
- Volunteers — `needs_volunteers`

## Integrations (universal owners only)

- Tasks / milestones · Research approve-before-apply · Project bridge · Cartography relationships  
- Chamber routing (`events`, `marketing`, `operations`) · Board review recommendations (advisory)  
- Shari Talk Only (no mutation) · Work on This (related Work) · Body Doubling attaches to existing Work  
- Anywhere-origin launch paths through UWE (Create, Projects, Shari, Chamber, Board, Research, etc.)

## Out of scope (by design)

- Workshop, Webinar, Retreat, Conference, or other new Event Blueprints  
- Networking-specific engines, registries, or durable stores  
- Live Preview 21-step matrix (recommended post-deploy; jsdom checklist covers Create → Blueprint → Quick Start → Guided Build → sponsor context)

## Evidence

- Automated: 13 foundation tests + browser checklist + Event Blueprint framework / Anywhere-Origin / Marketing regression green (see certification)  
- Blockers: `126_NETWORKING_EVENT_BLUEPRINT_BLOCKERS.md`  
- Certification: `126_NETWORKING_EVENT_BLUEPRINT_CERTIFICATION.md`
