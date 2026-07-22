# 130 — Create Experience Final Polish & Certification

**Status:** Implementing  
**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Parents:** 127 (`36701c3e`, `daaba3ff`) · Spec 128 (`4ffc0fe4`) · 129 (`bd653240`)  
**Related:** Spec 104 Create Philosophy · Spec 128 Simplicity · Primary Action Feedback · 073 Human-Readable Identity

## Goal

Make Create feel predictable and forgiving: every creation path confirms before Work exists, titles reflect intent, clutter is manageable, empty states teach, and a short Undo window forgives accidental creates — without flattening the estate or exposing architecture.

## Constitutional rule — One Creation Rule™

**No path may create Work without explicit confirmation.**

Applies to: natural language Begin · Browse Ideas · Guided Frameworks · Previous Work (open/resume only) · Templates · Recommendations · future methods.

Pattern (every method):

1. **Intent** — member names or picks what they want  
2. **Confirmation** — “It looks like you'd like to create a {Type}.”  
3. **Creation** — only after Create {Type}  
4. **Immediate Open** — workspace + Current Focus  
5. **Recovery** — Undo available briefly until meaningful editing begins  

## Spec 128 gates (must pass)

1. Hide complexity — Manage My Work / More Ways stay optional  
2. One purpose / one primary action per screen  
3. Never expose Blueprint / Work Type / Registry jargon  
4. Recommend before asking — context-aware Browse Ideas preserved from 129  
5. Every control acts, explains disabled, or is removed  

## Requirements (1–14)

| # | Requirement | Runtime owner |
|---|-------------|---------------|
| 1 | One Creation Rule — confirm everywhere | `createIntentConfirmation` · `resolveCreateBeginOutcome` · `resolveCatalogCreateConfirm` · entrance panel |
| 2 | Eliminate accidental clutter | Manage My Work on Continue Working — archive / trash / restore / delete permanent |
| 3 | Intelligent title generation | `createTitleFromIntent` · registry `originalRequest` · never template-name titles when intent exists |
| 4 | Remove dead elements | Primary-action feedback; disabled reasons; purge silent no-ops |
| 5 | Meaningful visual recognition | `workTypeVisual` accent + icon on Continue cards |
| 6 | Empty states must teach | Continue Working · Previous Work copy in `copy.ts` |
| 7 | Continue Working quality | Title · Work Type · Current Focus · Last Worked · Progress · one Continue |
| 8 | No Untitled unless intentional | Prefer `New {Type}` / intent title over bare Untitled |
| 9 | Consistency | Same Intent → Confirm → Create → Open → Current Focus |
| 10 | Trust | No surprise create / title swap / hide / duplicate unfinished UI |
| 11 | Recovery | `postCreateUndo` short window until meaningful edit |
| 12 | Accessibility | Icons supplement labels; keyboard confirm; focus order |
| 13 | Final Polish Audit | Report pass/fail |
| 14 | 12/10 Experience Test | Independent tester checklist in report |

## Protect

- 127 confirm-before-create NL gate  
- 129 hierarchy · rename · More Ways merge · context-aware suggestions  
- Focus Mode workshop map  
- Spec 128 — no architecture in member copy  
- Avoid large `CompanionPageClient` rewrites (behavior audit)  

## Tests

- `lib/createEstate/createPolish130.test.ts`  
- `lib/createEstate/createTitleFromIntent.test.ts`  
- Extended `resolveCreateBeginOutcome.test.ts`  
