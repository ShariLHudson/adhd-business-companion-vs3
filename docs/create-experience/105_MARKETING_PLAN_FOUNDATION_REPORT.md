# 105 — Marketing Plan Work Type Foundation Report

**Date:** 2026-07-21  
**Work Type ID:** `marketing_plan`  
**Blueprint ID:** `marketing_plan.simple` (Simple Marketing Plan)  
**Package version:** `1.0.0`

## Verdict summary

Marketing Plan is registered as the first non-Event Work Type on the Universal Work Engine. Simple Marketing Plan supports Quick Start, Guided Build, and Complete Planning on one canonical Work ID. No Marketing-specific runtime, save path, or private registry was added.

## Authoritative files and public exports

| Area | Path |
|------|------|
| Section map (leaf) | `lib/workTypeSchema/schemas/marketingPlanMap.ts` |
| Work Type package | `lib/universalWorkEngine/packages/marketingPlan/registerMarketingPlanWorkType.ts` |
| Blueprint definition | `lib/universalWorkEngine/packages/marketingPlan/marketingPlanBlueprint.ts` |
| Blueprint registration | `lib/universalWorkEngine/packages/marketingPlan/registerMarketingPlanBlueprints.ts` |
| Map groups | `lib/universalWorkEngine/packages/marketingPlan/marketingPlanMapGroups.ts` |
| NL detector | `lib/universalWorkEngine/packages/marketingPlan/isMarketingPlanCreationRequest.ts` |
| Public API | `lib/universalWorkEngine/index.ts` — `ensureMarketingPlanWorkTypeRegistered`, `ensureMarketingPlanBlueprintsRegistered`, `MARKETING_PLAN_*`, `isMarketingPlanCreationRequest` |
| Create Begin | `lib/createEstate/resolveCreateBeginOutcome.ts` — `isMarketingPlanDomain` |
| Create UI | `components/companion/CreateEstateEntrancePanel.tsx` — Event / Marketing Blueprint switcher |

## Work Type registration

- Registered through `registerWorkTypePackage` (universal registry only)
- Capabilities: tasks, milestones, research, chamber, board, cartography, project bridge, print, export
- Certification requirement ids: `marketing_plan.foundation`, `.map`, `.depth`, `.anywhere_origin`
- Does **not** mint Work IDs or call durable storage

## Blueprint registration

- One Spark Blueprint: **Simple Marketing Plan** (`marketing_plan.simple`)
- Registered through `registerBlueprint` (universal Blueprint registry)
- No additional Marketing Plan Blueprints in this phase

## Schema and sections (16 + system)

1. Purpose and Desired Outcome  
2. Business and Offer  
3. People You Want to Reach  
4. Where Things Stand Now (Guided+)  
5. Positioning and Core Message (Guided+)  
6. Marketing Goals (Guided+)  
7. Channels and Places to Show Up  
8. Content and Communication (Guided+)  
9. Offer Path and Calls to Action (Guided+)  
10. Simple Activity Plan (Guided+)  
11. Budget, Time, and Energy (Complete+)  
12. Measures and Signals  
13. Risks, Assumptions, and Gaps (Complete+)  
14. Next Actions  
15. Review and Improvement Rhythm (Complete+)  
16. Final Plan and Deliverables (Complete+)  

Quick Start keeps required sections only; optional depth-gated sections appear in Guided / Complete.

## Adaptive questions

Foundation questions cover offer, audience, outcome, primary channel, next actions, and success signal. Guided adds core message; Complete adds capacity and risks. Each question includes purpose, why it matters, examples, depth wording, low-energy wording, known-context keys, skip / don't-know / postpone behavior, and affected sections / deliverables / tasks / research.

## Depth modes

All three modes share one Work ID via `changeBlueprintDepthMode`. Quick Start uses lower-friction and depth-specific prompts.

## Research

Uses universal research attachment: draft → review → approve → apply. Rejected findings do not alter Work. Apply records change summaries; section content updates remain explicit / approved.

## Projects / Cartography / Chamber / Board / Shari / Body Doubling

- Project bridge recommendations on the Blueprint; relationships via `linkWorkRelationship`
- Cartography relationship kinds: supports, informs, depends_on, related_to, part_of
- Chamber lead: `marketing`; supporting ids from Chamber registry
- Board review recommendations for plan, audience, positioning, budget, channels, risk, readiness, measurement
- Shari: `talk_only` (no mutation) and `work_on_this` (related Work)
- Body Doubling: origin + section focus through Anywhere-Origin

## Deliverables

Concise / detailed plan, one-page action plan, audience & message summary, channel plan, activity calendar, tasks, milestones, measurement plan, assumptions & risks, review checklist, print/export — via universal output infrastructure.

## Tests

- `lib/universalWorkEngine/packages/marketingPlan/marketingPlan.foundation.cert.test.ts`
- `components/companion/universalBlueprint/marketingPlan.browserChecklist.test.tsx`
- Updated: architecture boundaries, Create Begin, CREATE fast path (Marketing Plan exits document UC)

## Browser evidence

Automated jsdom checklist: Create Blueprint browser lists Simple Marketing Plan and starts Work with `marketing_plan.simple` + `marketing_plan` Work Type. Manual production walkthrough of the full 20-step UI matrix remains recommended on Preview after deploy.

## Regressions

- Event Blueprint framework cert: passing  
- Anywhere-Origin Event certification suite: passing  
- Architecture boundaries: passing (unknown Work Type probe updated; `marketing_plan` now registered)

## Unresolved risks (non-blocking)

1. Durable Blueprint Supabase persistence remains a shared UWE follow-on (same residual as Event 104).  
2. Create Estate host still opens legacy Create workspace after Anywhere-Origin for Marketing Plan — UWE Work is minted; fuller Working Panel host bind for Marketing is a follow-on (do not rewrite dirty `CompanionPageClient`).  
3. Full manual 20-step browser matrix on live Preview not executed in this agent session (jsdom + unit evidence covered).
