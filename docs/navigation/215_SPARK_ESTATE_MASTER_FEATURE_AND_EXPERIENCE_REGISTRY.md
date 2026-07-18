# 215 — Spark Estate Master Feature & Experience Registry

**Runtime source of truth:** `lib/conversationArchitecture/masterFeatureRegistry.ts`  
**Aligns with:** `docs/estate/ESTATE_REGISTRY.md` (Experience → Space → Tool)  
**Complements:** Package 214 roadmap (implementation status)  
**Production deployed:** No

## Goal

No feature, workflow, menu item, destination, or shared service reaches production unless it appears in this registry and meets its **Definition of Complete**.

## Every item tracks

Feature name · Category · User purpose · Welcome Home destination · Conversation Intelligence requirements · CIE integration · HCV status · Gold Standard coverage · UI · Backend · Routing · Authenticated testing · Production readiness · Dependencies · Notes

## Primary categories (17)

Welcome Home · Core Experiences · Chamber · Board · Business Estate · Projects · Journal · Evidence Vault · Discovery · Clear My Mind · Parking Lot · Search · How Do I… · Navigation · Settings · Shared Conversation Services · Intelligence Libraries

## Definition of Complete

`meetsDefinitionOfComplete(row)` requires:

- `productionReadiness === complete`
- UI, backend, routing, authenticated testing = complete or N/A
- CIE = complete or N/A
- HCV = complete or N/A

`assertRegisteredForProduction(id)` fails if missing from registry or incomplete.

## Current snapshot (living)

- Talk It Out: CIE + HCV complete; auth + production not ready
- Shared CIE / HCV / Topic Anchor: backend complete; not platform-wide
- Zero features marked production ready

## Relationship to Estate Registry

Estate Registry owns Experience → Space → Tool placement.  
This Master Feature Registry owns **ship-readiness inventory** across destinations that sit outside the 10-pillar table (Chamber, Talk It Out, Parking Lot, Search, Settings, shared conversation services).
