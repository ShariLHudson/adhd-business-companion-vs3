# Create Registry — Per-Type Audit Matrix

**Date:** 2026-07-23  
**Status vocabulary (audit prompt):** working · working-with-limitations · partially-built · visible-but-broken · wrong-route · generic-placeholder · duplicate · obsolete · missing · needs-audit  
**Evidence baseline:** `docs/architecture-v2/SPARK_ESTATE_CREATE_EXPERIENCE_INVENTORY_AND_GAP_AUDIT.md` + current `createCatalogData.ts` / `createParentTypes.ts` / UWE packages.

Browser / Founder certification is **NOT_RUN** for all Create types → no row is marked production-ready.

---

## Status key used here

| Status | Meaning |
|---|---|
| **working-with-limitations** | Registered guided package + automated foundation tests; browser NOT_RUN |
| **partially-built** | Appears in Browse/catalog; opens shared draft generator (not type-specific guided system) |
| **wrong-route** | Card exists but leaves Create intentionally or incorrectly |
| **duplicate** | Same capability represented in ≥2 registries/stacks |
| **needs-audit** | Believed to exist; save/reopen/actions not browser-verified in this pass |

---

## A. Guided Universal Work Engine packages (4)

| ID (runtime) | Member label | Browse parent | Route/builder | Save | Reopen | Project handoff | User-visible today | Audit status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| `event_plan` | Event / Event Plan | Plan Something | UWE eventPlan package | durable + event record | resume via registry | projectSync present | yes | working-with-limitations | `packages/eventPlan/*` |
| `marketing_plan` | Marketing Plan | Market & Sell | UWE marketingPlan (1 blueprint depth) | durable | resume | via UCE | yes | working-with-limitations | `packages/marketingPlan/*` |
| `business_plan` | Business Plan | Build the Business | UWE businessPlan (~60 industry BPs) | durable | resume | via UCE | yes | working-with-limitations | deliverable manifests gap |
| `facebook_community` | Facebook Community | Market & Sell | UWE facebookCommunity | durable | resume | explicit bridge | yes | working-with-limitations | live registration tests |

---

## B. Browse parent types → catalog (30)

| Parent ID | Label | Category (current 7) | Catalog labels | Builder depth | Audit status | Notes |
|---|---|---|---|---|---|---|
| email | Email | Write & Communicate | Email, Follow-Up Email | simple draft | partially-built | subtypes shape prompts |
| social-content | Social Content | Write & Communicate | Social/Facebook/LinkedIn Post, Video Script | simple draft | partially-built | platforms collapsed |
| article-or-blog | Article or Blog | Write & Communicate | Blog Post | simple draft | partially-built | |
| newsletter | Newsletter | Write & Communicate | Newsletter | simple draft | partially-built | |
| presentation | Presentation | Write & Communicate | Presentation | simple draft | partially-built | no deck visuals |
| script | Script | Write & Communicate | Video Script | simple draft | partially-built / duplicate | overlaps social-content |
| marketing-campaign | Marketing Campaign | Market & Sell | Email Sequence, Email Campaign | simple draft | partially-built | multi-touch promised, one draft |
| offer | Offer | Market & Sell | Offer | simple draft | partially-built | |
| sales-funnel | Sales Funnel | Market & Sell | Sales Funnel | simple draft | partially-built | |
| lead-magnet | Lead Magnet | Market & Sell | Lead Magnet | simple draft | partially-built | richer template only |
| promotion | Promotion | Market & Sell | Flyer | simple draft | partially-built | text only |
| launch | Launch | Market & Sell | Launch Plan | simple draft | partially-built / duplicate | overlaps Event + Marketing |
| sales-page | Sales Page | Market & Sell | Sales Page | simple draft | partially-built | |
| landing-page | Landing Page | Market & Sell | Landing Page | simple draft | partially-built | connectedAssetEditor path |
| marketing-plan | Marketing Plan | Market & Sell | Marketing Plan | **guided** | working-with-limitations | see §A |
| facebook-community | Facebook Community | Market & Sell | Facebook Community | **guided** | working-with-limitations | see §A |
| client-onboarding | Client Onboarding | Work With Clients | Client Onboarding | simple draft | partially-built | |
| proposal | Proposal | Work With Clients | Proposal | simple draft | partially-built | phantom workType id |
| client-communication | Client Communication | Work With Clients | Check-In / Referral / Testimonial | simple draft | partially-built | |
| event | Event | Plan Something | Event Plan, Workshop | **guided** (event) | working-with-limitations | Workshop → event path needs-audit |
| course | Course | Plan Something | Course Outline | simple draft | partially-built | outline only |
| five-day-plan | 5-Day Plan | Plan Something | 5-Day Plan | simple draft | partially-built | |
| strategy | Strategy | Build the Business | Marketing/Content Strategy | simple draft | partially-built | |
| business-plan | Business Plan | Build the Business | Business Plan | **guided** | working-with-limitations | see §A |
| sop | Standard Operating Procedure | Build the Business | SOP, Process, Automation, GHL Workflow | simple draft | partially-built | phantom `sop` schema |
| checklist | Checklist | Organize Information | Checklist | simple draft | partially-built | phantom schema |
| guide | Guide | Organize Information | Training Guide | simple draft | partially-built | |
| template | Template | Organize Information | Claude Prompt → AI Prompt | simple draft | partially-built | |
| reference-document | Reference Document | Organize Information | Document | simple draft | partially-built | catch-all |
| content-calendar | Content Calendar | Organize Information | Content Calendar | simple draft | partially-built | |
| *(none)* | Personal | Personal | — | — | missing | Category empty |

Exact parent IDs may use hyphens as in `createParentTypes.ts`; labels above are member-facing.

---

## C. Catalog-only / special rows

| Catalog label | In Browse parent? | Status | Notes |
|---|---|---|---|
| Client Avatar | no (`keep: false`) | wrong-route | `route: "client-avatars"` |
| Automation / Process / GHL Workflow | folded into SOP parent | duplicate | aliases under sop |
| Workshop | folded into Event | needs-audit | must resolve to event_plan, not dead card |
| Claude Prompt | folded into Template | partially-built | |

---

## D. Verification flags (honest)

| Flag | Guided 4 | Simple ~26 |
|---|---|---|
| `routeVerified` | needs-audit (code path exists; browser NOT_RUN) | needs-audit |
| `saveVerified` | durable path exists; browser NOT_RUN | draft persistence exists; browser NOT_RUN |
| `reopenVerified` | resume code exists; browser NOT_RUN | needs-audit |
| `requiredActionsVerified` | partial (export/print vary) | partial |
| `projectHandoffVerified` | partial bridges | picker / optional — needs-audit |
| `isUserVisible` (master rule) | **false under master rule** (not `ready` + all verified) | **false under master rule** |
| Practical menu visibility today | yes (no master gate) | yes if launchable workflow |

Under the **master inventory visibility rule**, **zero** types should currently set `isUserVisible: true` until Founder/browser certification passes. Today’s UI still shows them via legacy gates — that mismatch is the primary migration risk.

---

## E. JSON companion (summary counts)

```json
{
  "catalogItems": 42,
  "browseParentTypes": 30,
  "browseCategories": 7,
  "guidedWorkTypesRegistered": 4,
  "simpleArtifactParents": 26,
  "routedAway": 1,
  "productionReady": 0,
  "workingWithLimitations": 4,
  "partiallyBuilt": 26,
  "emptyCategories": ["personal"],
  "masterNineCategoriesImplemented": false
}
```
