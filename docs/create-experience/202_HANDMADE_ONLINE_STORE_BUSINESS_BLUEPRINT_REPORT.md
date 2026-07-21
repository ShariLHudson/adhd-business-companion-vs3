# 202 — Handmade Online Store Business Blueprint Report

**Date:** 2026-07-21  
**Work Type:** `business_plan`  
**Blueprint ID:** `business.handmade_online_store`  
**Title:** Handmade Online Store  
**Package version:** `1.0.0`

## Verdict summary

Handmade Online Store is a Spark Business Blueprint on the Business Plan Work Type for maker ecommerce across marketplaces (Etsy, Shopify, and similar). Covers products, photography, listings/SEO, shipping, service, reviews, email/social, money, and review rhythm. Definition data only; no private runtime.

## Authoritative implementation

| Area | Path |
|------|------|
| Work Type | `registerBusinessPlanWorkType.ts` · `businessPlanMap.ts` |
| Definition | `BUSINESS_BLUEPRINT_HANDMADE_ONLINE_STORE` in `businessBlueprintDefinitions.ts` |
| NL | `inferWorkTypeAndBlueprint.ts` — handmade online store / handmade shop / Etsy → `business.handmade_online_store` |
| Detection | `isBusinessPlanCreationRequest.ts` |
| Cert | `businessPlan.foundation.cert.test.ts` |
| Browser | `handmadeOnlineStoreBusiness.browserChecklist.test.tsx` |
| Bundle | `docs/create-experience/202_HANDMADE_ONLINE_STORE_BUSINESS_BLUEPRINT.md` |

## Depth-gated sections (examples)

- Marketplaces, Listings/SEO, Photography — `depth_at_least: guided_build`
- Shipping, Customer Service, Reviews, Email, Social — deeper modes as defined
- Automation / Analytics — complete planning where gated

## Out of scope

- Marketing Plan Work Type (use Marketing Blueprint for campaign-first work)
- Generic document “business plan” Create path

## Evidence

See certification and blockers docs.
