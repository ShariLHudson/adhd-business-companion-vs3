# 213 — Gold Standard Conversation Library Initial Build Plan

**Runtime:** `lib/goldStandardConversationLibrary/buildPlan.ts`  
**Progress:** `getGoldBuildProgress()`

## Goal

First certified conversation corpus for Spark Estate.

## Target

**300–500** conversations (`GOLD_LIBRARY_TARGET_MIN` / `MAX`).

## Initial categories

Business decisions · Hiring · Marketing · Sales · ADHD overwhelm · Prioritization · Time management · Client conversations · Pricing · Product development · Team building · Difficult decisions · Creative blocks · Planning · Confidence · Reflection · Repairs · Topic continuity · Endings

Defined in `GOLD_BUILD_CATEGORIES`.

## Each conversation includes

- Topic / Topic Anchor
- Intent
- Conversation goal
- Phases via turns + approved moves
- Blocked alternatives
- Shari voice notes (`whyItWorks` / `avoids`)
- Validation checklist (`quality` cert)

## Certification

Every conversation must:

1. pass `certifyConversation` / `isFullyCertified`
2. be reviewed
3. be indexed in the catalog
4. include regression references where applicable

Runtime retrieval must call `certifyReadyForRuntime(id)` conceptually — only certified entries should guide generation.
