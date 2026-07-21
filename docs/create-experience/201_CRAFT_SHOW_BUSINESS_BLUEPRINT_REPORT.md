# 201 — Craft Show Business Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `business_plan`  
**Blueprint ID:** `business.craft_show`  
**Title:** Craft Show Business  
**Package version:** `1.0.0`

## Verdict summary

Craft Show Business is a Spark Business Blueprint on the new Business Plan Work Type. It is an ongoing maker operating system — products, booth, calendar, POS, leads, money, and post-show learning — with a Guided+ path to linked Event Work for each confirmed show. Definition data only; no private runtime.

## Authoritative implementation

| Area | Path |
|------|------|
| Work Type | `registerBusinessPlanWorkType.ts` · `businessPlanMap.ts` |
| Definition | `BUSINESS_BLUEPRINT_CRAFT_SHOW` in `businessBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — craft show business / blueprint → `business.craft_show` |
| Detection | `isBusinessPlanCreationRequest.ts` (does not steal bare “business plan” docs or bare “craft show”) |
| Cert | `businessPlan.foundation.cert.test.ts` |
| Browser | `craftShowBusiness.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/201_CRAFT_SHOW_BUSINESS_BLUEPRINT.md` |

## Depth-gated sections (examples)

- Booth Design, Show Discovery, Jury Applications, Annual Calendar — `depth_at_least: guided_build`
- Travel, Packing, Vendor Documents, Analytics — `depth_at_least: complete_planning`
- Linked Show Event Plans — `guided_build+`

## Out of scope

- A separate Event Blueprint for a single craft show date (use Event Work Type when generating a linked show plan)
- Generic document “business plan” Create path

## Evidence

See certification and blockers docs.
