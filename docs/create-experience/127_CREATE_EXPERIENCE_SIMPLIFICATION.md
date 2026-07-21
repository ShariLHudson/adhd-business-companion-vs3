# 127 — Create Experience Simplification & ADHD Optimization

**Status:** P0 slice shipped (companion-first gates)  
**Date:** 2026-07-21  
**Related:** Spec 104 Create Philosophy · 056 Create Redesign · Primary Action Feedback · Spec 073 Human-Readable Identity

## Goal

Transform Create from architecture-first into companion-first:

- Productive work in under 30 seconds
- Wrong Work Type never silently created
- No internal architecture exposed
- No dead-end / orphaned work states
- Calm first experience (Spark Estate standard)

## Hidden from members

UWE · Blueprint Framework · Routing · Relationships · Work Types · Depth Engine — implementation only.

## Member language

| Never say | Prefer |
|-----------|--------|
| Blueprint | Guided Framework · Proven Planning Method · Recommended Structure |
| Work Type | kind of plan / what you're creating |
| Registry / Builder / Runtime / Identity IDs | human titles only |

## Flow (max two decisions)

1. **Describe** what you want to create  
2. **One confirmation** (“It sounds like you'd like to create a Marketing Plan”)  
3. **Open working document** — primary “Open My Plan” (or equivalent)

## P0 certification gates (this slice)

1. Intent confirmation before Work creation  
2. Start Method removed from Create entrance (companion chooses)  
3. Open My Plan primary after structure create  
4. Blueprint / Work Type jargon hidden on Create entrance + UBI active  
8. No Work / Blueprint IDs in member-facing Create ack  
9. Immediate Open action after successful structure create  

## Runtime owners

| Concern | Code |
|---------|------|
| Intent confirm | `lib/createEstate/resolveCreateBeginOutcome.ts` · `createIntentConfirmation.ts` |
| Entrance UI | `components/companion/CreateEstateEntrancePanel.tsx` |
| Skip Start Method | `UniversalBlueprintInterface` `companionLed` |
| Auto-broaden browse | `browseCompatibleBlueprintsAutoBroaden` |
| Quick Start focus slice | `lib/createEstate/quickStartFocusSections.ts` |
| Continue Working | Create entrance + `CreateWorkspaceResumeList` |

## Tests

- `lib/createEstate/resolveCreateBeginOutcome.test.ts`
- `lib/universalBlueprintInterface/browseBlueprints.autoBroaden.test.ts`
- Updated UBI Create-entrance wiring + browser checklist (no ID chrome)

## Backlog (deferred)

See `127_CREATE_EXPERIENCE_SIMPLIFICATION_REPORT.md`.
