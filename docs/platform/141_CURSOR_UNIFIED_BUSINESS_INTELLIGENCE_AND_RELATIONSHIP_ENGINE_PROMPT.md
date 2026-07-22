# 141 — Cursor Prompt: Unified Business Intelligence & Relationship Engine

**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Status:** Phase 1 foundation (shippable P0) — full Parts 1–16 are multi-sprint  

---

## Mission

Transform Spark Estate into one unified business ecosystem with shared relationship understanding.

**Core:** Everything Knows What It Belongs To. No feature in isolation.  
**Memory model:** One business memory, many windows.

## Non-negotiable — Relationship Integrity Rule™

Do **NOT** invent relationships from similar names alone. Create edges only from:

1. Creation flow lineage  
2. Explicit links  
3. Shared Work / Project context  
4. User confirmation when ambiguous  

Preserve trust.

## Phase 1 P0 (this pass)

1. Store prompt + REPORT under `docs/platform/141_*`; bind Integrity Rule in constitution + Cursor rule  
2. Audit Universal Relationship Graph / Work relationships / IntelligenceReadyHooks / registry / project related hooks  
3. Projects hub surfaces related Work / Maps / Strategies / Conversations / Evidence / Wins where data exists  
4. Create/Work auto-lineage on create (project, blueprint, originatedFrom) — no duplicate linking  
5. Related To panel pattern reusable for major objects  
6. Certification inventory — in-graph vs orphaned; gap register  
7. Browser walk if possible; else honest Provisional  
8. Focused tests; narrow commit + push  

## Constraints

- Specs **128**, **132**, Capture Before Classification, Spec **117** Business Brain  
- Intelligence Blueprint: one shared brain, no duplicate engines  
- Prefer shared graph layers over conflicting Cartographers Studio UI (Prompt 140 may be in flight)  
- Avoid large `CompanionPageClient` edits  
- Never `git add .`  

## Suggested commit

```
feat: unify business relationship integrity and Projects hub (141)

Bind Relationship Integrity Rule, certify graph participation gaps, and surface related Work/maps/conversations from shared lineage without inventing edges from name similarity.
```

## Report

See `141_UNIFIED_BUSINESS_INTELLIGENCE_AND_RELATIONSHIP_ENGINE_REPORT.md`
