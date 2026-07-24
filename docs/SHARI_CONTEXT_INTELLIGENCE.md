# Shari Context Intelligence

**Runtime SoT:** `lib/shariAnswerFirst/contextResolver.ts`  
**Approved Estate fields:** `collectApprovedBusinessEstateContext()` (`lib/profile/guidedFieldHelp.ts`)  
**Snapshot helper:** `buildApprovedBusinessSnapshot()` (`lib/profile/businessSnapshot.ts`)

---

## Principle

People think in context. Libraries and chat must use **relevant** context — not dump database state.

## Resolver

`resolveRelevantUserContext({ request, helpMode, professionalRole })` returns ranked `ShariContextItem`s with:

- key / value
- source (`profile` · `business_estate` · `conversation` · …)
- confidence
- relevant / allowedForResponse
- compact `promptBlock` for companion-chat hints

## Known-context-first guard

`isUnnecessaryContextQuestion(text, context)` rejects questions like “What do you sell?” when products/offers/People I Help are already known.

## What is wired today

- Approved Business Estate field paths
- Legacy business profile (sells, ideal client, role)
- Primary People I Help avatar summary
- Thread corrections / assumptions from `conversationContinuity`

## Not dumped every turn

Full Brain, full project list, full calendar, raw research archives — only when relevance ranking selects them (future extensions stay in this resolver).

## Deprecation

Do not create a second client-side “business context for chat” loader. Extend `resolveRelevantUserContext`.
