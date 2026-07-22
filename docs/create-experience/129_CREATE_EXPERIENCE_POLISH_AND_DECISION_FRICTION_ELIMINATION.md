# 129 — Create Experience Polish & Decision Friction Elimination

**Status:** Implemented  
**Date:** 2026-07-21  
**Parent:** Spec 127 Create Simplification · Spec 128 Simplicity & Cognitive Load Constitution  
**Related:** Spec 104 Create Philosophy · 056 Create Redesign · Spec 073 Human-Readable Identity · Primary Action Feedback

## Goal

After 127 (confirm-before-create + Focus Mode map) and 128 (hide complexity), polish Create so members never have to think about the software:

- Rename always works and syncs everywhere
- One resume path per Work
- No duplicate reassurance messaging
- Clear exit destinations
- One optional start surface (“More Ways to Start”)
- Suggestions match current Work context
- Persistent orientation + calmer nav hierarchy

## Governing gates (Spec 128)

1. Hide complexity — advanced tools stay collapsed  
2. One purpose / one primary action per screen  
3. Remove decisions — eliminate duplicate Continue / Customize vs Browse  
4. Never expose architecture  
5. Recommend before asking — context-aware defaults  

## Requirements

| # | Requirement | Runtime owner |
|---|-------------|---------------|
| 1 | Restore Rename everywhere | `renameActiveWorkspaceTitleDurable` · resume list inline · working panel |
| 2 | One resume entry point | `CreateWorkspaceResumeList` only (no twin Continue CTA) |
| 3 | Eliminate duplicate messaging | Single intro line on entrance |
| 4 | Clarify exit navigation | `CREATE_RETURN_TO_*` · `formatAppBackLabel` Return-to passthrough |
| 5 | Merge Customize + Browse | `CREATE_ESTATE_MORE_WAYS_HEADING` |
| 6 | Context-aware suggestions | `lib/createEstate/contextAwareSuggestions.ts` |
| 7 | Persistent orientation | Active destination highlight in Welcome Home menu |
| 8 | Simplify header navigation | Today / Create / Reflect / Guidance / Estate labels |
| 9 | Advanced features hidden | Inside More Ways to Start |
| 10 | Reduce visual competition | Continue → Start new → Optional |
| 11 | Remove mismatched recommendations | Work-type context filter |
| 12 | Certification | Unit tests + report; browser cert deferred |

## Member language

| Never | Prefer |
|-------|--------|
| Back to Focus (ambiguous) | Return to Welcome Home · Return to My Focus · Return to Create |
| Customize + Browse for inspiration | More Ways to Start (Optional) |
| Blueprint / Work Type | Guided Frameworks · Browse Ideas |
| Duplicate Continue cards | One Continue Working card with Current Focus |

## Hierarchy (Create entrance)

1. **Continue Working** — Current Focus + Continue → (+ inline rename)  
2. **Start Something New** — describe + Begin (confirm gate from 127 preserved)  
3. **More Ways to Start (Optional)** — collapsed: Guided Frameworks · Browse Ideas · Previous Work · Personal / Company templates  

## Protect

- 127 confirm-before-create (`resolveCreateBeginOutcome` → confirm)  
- Focus Mode workshop map (`workshopMapModes`)  
- Spec 128 — no architecture jargon in UI  

## Tests

- `lib/createEstate/createPolish129.test.ts`  
- `lib/createEstate/contextAwareSuggestions.test.ts`  
- Updated destination / guided-conversation copy contracts  
