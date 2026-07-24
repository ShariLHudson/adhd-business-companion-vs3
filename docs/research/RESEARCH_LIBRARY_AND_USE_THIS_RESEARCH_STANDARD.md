# Research Library and Use This Research Standard™

**Runtime:** `lib/researchLibrary/` · **UI:** `components/companion/researchLibrary/ResearchLibraryPanel.tsx`  
**Related:** [Universal Request-to-Outcome Intelligence](../constitution/UNIVERSAL_REQUEST_TO_OUTCOME_INTELLIGENCE_STANDARD.md) · [Shari Answer-First General Help](../SHARI_ANSWER_FIRST_GENERAL_HELP_STANDARD.md) · [Creation Workspace](../creation-workspace/CREATION_WORKSPACE_STANDARD.md) · Create · Projects · Visual Thinking Studio · Strategic Planning · My Business Estate writeback

**Answer-first:** General research *methodology* is answered in chat. Current-specific lookups use honest research status in conversation — do not force Research Library before a useful answer.

**Use This Research → Create:** substantive outcomes open the **Creation Workspace** for development before Create polish, unless the result is a simple single-item creation.

## Mission

Research is a first-class Spark Estate experience. A member can have a natural, ongoing research conversation with Shari, gather trustworthy information, ask follow-up questions, and then use the resulting research anywhere appropriate — without being forced to choose a format first.

## Official experience name

**Research Library**

Suggested description:

> Explore a question, gather useful information, and decide what you want to do with what you discover.

Not: web search only · knowledge database · report generator · citation manager · research dashboard.

## Core principle

Research is a conversation first. It becomes a reusable **Research Collection** behind the scenes.

## Two modes (inferred — never asked)

| Mode | Example | Behavior |
|------|---------|----------|
| Open research | “Research podcasting.” | Help immediately; grow the collection; offer Use This Research after substance |
| Research with outcome | “…and create a five-day content plan.” | Research → build the result automatically → present result first |

Do **not** ask “What would you like to do with this research?” when the original request already answered that.

## Opening experience

Primary prompt: *What would you like to explore, understand, or investigate?*

Secondary: Continue Previous Research · Review Saved Research

Never require topic classification, source type, depth, output type, destination, map type, or document format before beginning.

## Research Session

Canonical model: `ResearchSession` in `lib/researchLibrary/types.ts`.

Modes (inferred): `open_exploration` · `focused_question` · `comparison` · `current_information` · `source_based` · `research_with_outcome` · `selected_context_research`.

## Research Collection

Reusable first-class object: `ResearchCollectionRecord`. Persists independently of the chat transcript. Organized view sections:

What I Asked · What We Found · Important Findings · Key Facts · Examples · Options or Comparisons · Risks or Cautions · Unresolved Questions · Sources · My Notes · What I Could Do With This

## Live research truthfulness

Statuses include: `current_research_in_progress` · `current_research_completed` · `current_research_partial` · `current_research_unavailable` · `stable_knowledge_used` · `user_sources_used` · `Estate_sources_used` · `connected_sources_used` · `mixed_sources_used`.

Never claim current research completed unless a live provider or approved connected source actually ran. When unavailable: continue with stable knowledge, label honestly, offer Retry Current Research.

**Production status (this build):** live research provider is **unavailable** (`getLiveResearchProviderStatus().liveResearchAvailable === false`). Stable knowledge powers useful conversation.

## Research This

Contextual action via `queueResearchThis` / `ContextualResearchRequest`. Preserves source experience, selection, surrounding context, and return context so the member does not re-explain “this.”

## Use This Research

`inferResearchUseOptions()` returns ~3–5 relevant choices — never the full catalog. Format offered only when substantive findings exist, the user asks to organize/use, or a natural pause — not at the start of every answer.

## Format inference and freeform requests

Ordinary language (“turn this into a list”, “make a form”, “build a strategy”) routes through Universal Request-to-Outcome + Dynamic Creation Blueprint. Exact templates are not required.

## Outcomes and handoffs

| Outcome | Behavior |
|---------|----------|
| List | Prioritized / organized — not a raw findings dump |
| Document | Purpose, sections, evidence — Create handoff |
| Form | Instructions, sections, fields, types — not question suggestions only |
| Visual | Full Research Collection payload → Visual Thinking Studio |
| Strategy | Evidence, options, tradeoffs, risks — proposed until confirmed |
| Project | Phases/tasks — **Project Proposal Review**; approval before records |
| Create | Creation Package linked to Research Collection |
| Business Estate | Propose only; approval before authoritative writes |

## Result-first rule

When the user requests a result, show the substantive result before additional destinations.

## Clarification policy

Ask only when necessary. Do not ask format/destination/create when a useful first result can be inferred.

## Persistence

Sessions, collections, notes, links, return context, failure/retry state — local store keys in `lib/researchLibrary/persistence.ts`. Refresh restores conversation and findings without unnecessarily re-running completed research.

## Failure and recovery

Live unavailable → stable + honest label + retry. Research failure → preserve findings. Creation failure → retry creation without re-research. Handoff failure → preserve result. Visual failure → preserve written research.

## Accessibility

Keyboard conversation controls · semantic headings · visible focus · large targets · screen-reader status · no color-only meaning · narrow-screen layout.

## Observability

Internal events via `trackResearchLibraryEvent` — never expose telemetry or store sensitive research body text in analytics.

## Navigation

Build menu (near Create · Projects · Visual Thinking Studio). Natural-language: open Research Library · research this · help me research · continue my research · show my saved research · use this research.

## Tests

`lib/researchLibrary/researchLibrary.test.ts` covers scenarios A–L (open chat, explicit outcome, Use This Research, list/document/form/visual/strategy/project, research-only, five-day plan, step-by-step guide, truthfulness).

## Rollout guidance

1. Ship conversational Research Library + collections + Use This Research.  
2. Wire live research provider when available — keep status honesty.  
3. Deepen destination writebacks (Create seed, VT populate, Strategy/Projects review) without inventing second engines.  
4. Merge related collections UI with approval before destructive merge.
