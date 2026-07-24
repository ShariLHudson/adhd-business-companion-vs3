# Universal Request-to-Outcome Intelligence Standard™

**Runtime:** `lib/universalRequestOutcome/`  
**Create Begin wiring:** `lib/createEstate/resolveCreateBeginOutcome.ts`  
**Catalog scoring:** `lib/createCatalog.ts`

## Problem

Spark Estate was collapsing broad creation requests into the nearest small catalog keyword:

- “Create a five-day social media content plan” → Social Post / Facebook Post (last-match catalog + bare `social media` / `facebook` defaults)
- Duration, series, and plan intent were discarded
- Exact templates gated success; unknown creations stalled or opened blank shells

## Mission

Understand the intended outcome compositionally, build a dynamic blueprint without requiring an exact template, produce substantive content, then offer contextual next uses (Create, Projects, Visual Thinking, Strategic Planning, Research).

Templates deepen results. They do not make creation possible.

## Compositional intent

Requests may include research + creation + duration + channel + campaign purpose simultaneously. The platform must not pick one phrase and discard the rest.

## Contracts

- `UniversalRequestUnderstanding` — full request understanding with preserved qualifiers
- `RequestInterpretationValidation` — catches dropped duration/plan/series
- `DynamicCreationBlueprint` — structure whether or not a specialized profile exists
- `ResearchCollection` — reusable research object with honest freshness status
- `CreationPackage` — shared substantive result across destinations
- `OutcomeSubstanceValidation` — rejects one-post output for multi-day plans

## Fallback hierarchy

1. Exact specialized profile  
2. Closely related pattern  
3. General structural family  
4. Dynamically inferred structure  
5. One essential clarification only when required  
6. Research when needed  
7. Useful partial with localized limitations  

Never stop solely because an exact profile is missing.

## Live research truthfulness

Statuses:

- `current_research_completed`
- `stable_knowledge_used`
- `current_research_unavailable`
- `current_research_partial`
- `user_sources_used`
- `estate_sources_used`
- `not_required`

Do not label stable model knowledge as current research.  
`getLiveResearchProviderStatus()` reports whether a production provider is configured.

## Research This / Use This Research

- `captureResearchThisContext` — topic + surrounding context  
- `createResearchCollection` — durable collection  
- `resolveUseThisResearchOptions` — relevant choices only; empty when outcome already specified  

## Destination boundaries

| Destination | Owns |
|-------------|------|
| Create | Writing, sections, versions, asset package |
| Projects | Phases, tasks, dates — via **proposal review** first |
| Visual Thinking | Structural / visual projection of the package |
| Strategic Planning | Strategic candidates, not approved strategy |
| Research | Findings, sources, freshness |

## Clarification policy

Ask only when missing information is essential. A useful adaptable first draft beats a long intake.

## Migration from narrow classifiers

Create Begin, catalog matching, builder type resolution, and conversation artifact inference now consult Universal Request Understanding before social-post keyword defaults.
