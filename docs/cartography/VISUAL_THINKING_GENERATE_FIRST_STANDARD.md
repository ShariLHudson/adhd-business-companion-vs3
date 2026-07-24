# Visual Thinking Studio — Generate-First Knowledge Completion Standard™ (Corrective Build 6.6)

**Also see:** [VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md](./VISUAL_THINKING_STUDIO_RENAME_AND_RESEARCH_COMPLETION_STANDARD.md) (Corrective Build 7.1 — research must produce the requested result; destination name is Visual Thinking Studio).  
**Recommendation:** [VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md](./VISUAL_THINKING_RECOMMENDATION_INTELLIGENCE_STANDARD.md) — accepted/explicit recommendations continue through generate-first without a second confirmation.

## Mission

When a member clearly asks Spark Estate to teach, explain, research, compare, create, or build something, Spark Estate begins producing the useful result.

**GENERATE FIRST. ASK ONLY WHEN PROGRESS CANNOT CONTINUE SAFELY.**

## Request-as-authorization

A clear outcome request is authorization to create. Do not ask “Would you like me to create this?” when the request already answered that question.

Confirmation remains appropriate only for external side effects, spending/publishing, materially divergent outcomes, consequential assumptions, or an explicit review-before-create request.

## Generate-first philosophy

Replace “Do I have every piece of information?” with:

> How much useful and trustworthy work can I complete now, and what remaining information can I acquire without interrupting the user?

## Creation-mode inference

| Language | Mode |
|---|---|
| Teach / show me how / create / research / compare / build for me | `build_for_me` |
| Walk through with me / ask me questions | `guide_me` |
| Make my own / blank visual | `build_myself` |

Secondary entry actions remain available before a request is entered. After the request is entered, route automatically.

## Detail-level inference

Infer essentials / guided / detailed / thorough from language. When unspecified, use Adaptive Companion or **guided**. Never block creation on a missing depth preference.

## Clarification necessity

Ask only when the missing information:

1. Materially affects the result  
2. Cannot be safely inferred  
3. Cannot be obtained through approved research  
4. Is not available from existing user or Estate knowledge  
5. Cannot use a placeholder without misleading  

Do not ask for publicly researchable product or topic facts.

Runtime: `assessClarificationNecessity` in `lib/cartographersStudio/visualThinkingGenerateFirst.ts`.

## Automatic gap resolution

Hierarchy: existing Knowledge Package → user content → Estate source → structural inference → external research → focused clarification → optional omission.

Researchable gaps create research tasks automatically. They do not restart Understanding or Experience Orchestration.

## Research routing

When live research is unavailable: generate stable process content, mark freshness-sensitive details locally, avoid fabricating current UI labels, keep the result usable.

## Safe partial generation

`structure_ready` and `partial_ready` proceed to useful generation. Only `not_ready` may block all generation.

## Generation handoff

Handoff must carry approved knowledge items, safe scope, research-pending areas, instructional substance (not the raw request alone), uncertainties, and prohibited fabrication areas.

## Result substance validation

`assessGeneratedResultSubstance` rejects request-echo, empty expanders, guides without steps, comparisons without options, and checklists without actionable items. Those results must not be marked complete.

## User-echo protection

The original request may appear as a subtitle or “what you asked for” note. It cannot be the primary substantive result.

## Automatic continuation

For clear `build_for_me` requests: understand → experience → knowledge → research route → generate → present without pause at each internal stage.

Visible copy stays human: “Creating your guide…”, optional quiet progress labels. Never expose Knowledge Package, readiness enums, or engine names.

## Panel behavior

After submission: infer mode and detail, show one acknowledgement, continue automatically. One focused question only when Clarification Assessment requires it. Research updates merge into the visible guide without a blocking research screen.

## Edit preservation

Research completion updates only affected blocks. User-edited blocks are not overwritten without confirmation rules.

## Failure recovery

Research failure preserves safe content. Insufficient generation retries once with substance reasons, then honest recovery — never discard useful blocks.

## Adaptive Companion boundaries

May influence detail, pacing, and secondary views. May not turn clear requests into questionnaires, hide required gaps, block safe generation, or replace content with summaries.

## Scenarios

A. Loom + YouTube — build_for_me, guided, meaningful steps, research for current labels  
B. Internal SOP — structure + one focused question for the real workflow  
C. Medicare — begin automatically with authoritative research where required  
D. CRM comparison — reasonable scope, research current facts  
E. User-led map — `build_myself`, no completed guide  
F. Legal termination policy — safe framework + clarification; never fabricate legal completeness  

## Exclusions

Full visual canvas · intelligent layout redesign · unsupported crawling · fake citations · fabricated current product details · new approval screens · Build 7+ redesigns

## Workspace handoff

Only substantive generated results enter a `build_for_me` Thinking Workspace. Partial useful results may enter with honest localized notices. See [Workspace Foundation](./VISUAL_THINKING_WORKSPACE_FOUNDATION_STANDARD.md).

## Runtime

`lib/cartographersStudio/visualThinkingGenerateFirst.ts`  
Wired through Request · Understanding · Knowledge handoff · Generation · `VisualThinkingRequestPanel`
