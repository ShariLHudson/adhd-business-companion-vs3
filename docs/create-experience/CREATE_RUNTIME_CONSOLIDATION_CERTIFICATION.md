# Create Runtime Consolidation Certification (093)

**Branch:** `deploy/companion-app-v3`  
**Decision:** `UNIVERSAL CREATE RUNTIME CONSOLIDATION PARTIALLY COMPLETE`  
**Date:** 2026-07-20

## Architecture before → after

| Concern | Before | After (authoritative owner) |
|---------|--------|------------------------------|
| Workshop Map / bootstrap | Templates + Event bridge competing | `lib/workTypeSchema` schema-first via `initializeWorkspaceV2Workflow` |
| Section status | Facilitated + EventSection dual vocab | `lib/createSectionLifecycle` (+ Event adapter) |
| Continue | Registry + Event gap-fill list | Registry projections only (`listActiveContinueProjection`) |
| Durable save | Focus path honest; blueprint claimed “Saved” | `lib/creationDurable/savePipeline` classifies stores |
| Commands | Toolbar + card menus diverge | `dispatchCreateWorkCommand` |
| Work runtime | Multiple stores composed ad hoc | `resolveCreateWorkRuntime` |
| Contextual assistance | Ideas / Not Sure only | `lib/createContextualAssistance` (Help Me Think, Examples, Review) |

## Extensibility proof

A minimal `cert_probe` Work Type registers through schema only and receives map → focus → lifecycle → Continue → commands without shared runtime edits. SOP/Checklist product types still use transitional template bootstrap until their schemas ship.

## Tests

- Consolidation cert: `lib/createCertification/universalCreateRuntimeConsolidation.cert.test.ts`
- Related suite run: **66 passed** (Continue, save pipeline, commands, assistance, production foundation, Event workspace, section lifecycle, schema-first)
- Preview smoke (keyboard, offline, Print/PDF, screen reader): **not run**

## Known limitations / deferred

- Unregistered Work Types (SOP, Checklist, …) still template-bootstrap with a console warn
- ContentGenerator may still host map without identical Estate open wiring in all modes
- ActiveWorkCard menus not fully rewritten onto dispatcher (registry mutations already shared)
- Offline queue + multi-tab UI beyond conflict state detection
- Live browser / Preview evidence pending
- Permanent delete confirmation UX still thin

## Commits (this consolidation)

| Hash | Message |
|------|---------|
| `f65b0bac` | docs(create): supersede implementation audit after certified Event foundation |
| `5b6ae5f9` | refactor(create): unify section lifecycle |
| `a19b8b6c` | refactor(create): make workspace bootstrap schema-first |
| `fb539411` | refactor(create): consolidate Continue projections |
| `5cacd510` | refactor(create): unify durable save pipeline |
| `ef1a3757` | refactor(create): centralize command dispatch |
| `04119c11` | feat(create): unify contextual assistance and work runtime |
| `03ec9ec1` | test(create): certify universal runtime consolidation |
