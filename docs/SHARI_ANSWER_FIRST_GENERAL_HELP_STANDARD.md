# Shari Answer-First General Help Standard™

**Parent:** [Shari Core Conversation Intelligence](./SHARI_CORE_CONVERSATION_INTELLIGENCE_STANDARD.md)  
**Runtime:** `lib/shariAnswerFirst/`  
**Primary wiring:** `app/companion/CompanionPageClient.tsx` (`handleSend`)  
**Allies:** `lib/chatFastPath/chatTurnGuarantee.ts` · `lib/universalCreation/createFastPath.ts` · `lib/conversationStabilization/intentClassificationGate.ts`

## Mission

Make Shari powerfully useful in ordinary conversation. A member can ask a question, request advice, ask how to do something, explore an idea, compare choices, understand a topic, brainstorm, or work through a problem—and receive a natural, substantive, context-aware answer **directly in chat**.

Members must not be forced to understand or select Research Library, Create, Projects, Visual Thinking, Strategic Planning, a Chamber member, a document type, a workflow, a template, or an output format before Shari helps.

## Core belief

Shari is the primary experience. Other Spark Estate capabilities support her. They must not stand between Shari and a helpful answer.

## Answer-first principle

**ANSWER FIRST.**

Route, create, research, or open another experience only when:

1. the member explicitly requests it;
2. the task cannot be completed appropriately in ordinary chat;
3. current external information is necessary (handled honestly in chat);
4. the conversation naturally develops into a larger piece of work;
5. another experience would provide clear additional value and the member accepts the offer.

## Default conversation flow

User message → understand the complete request → determine whether a direct answer is possible → generate a substantive conversational answer → maintain context for follow-up → optionally offer **one** relevant next step.

Not: classify destination → route → open experience → wait for choice.

## Response decision contract

`ShariResponseDecision` (`lib/shariAnswerFirst/types.ts`) — internal only, never shown to members.

Key fields: `primaryHelpMode`, `directAnswerPossible`, `directAnswerRequired`, `currentResearchRequired`, question-versus-action flags, `answerDepth`, `answerStructure`, `optionalCapabilityOffer`, `routingAllowed`, `confidence`, `reasons`.

Decision entry: `decideShariResponse(rawRequest)`.

Suppress route-before-answer: `shouldSuppressRouteBeforeAnswer(decision)`.  
Block immediate Create/Projects/Research opens: `shouldBlockImmediateExperienceOpen(decision)`.

## Help modes (internal)

`direct_answer` · `explanation` · `how_to_guidance` · `advice` · `comparison` · `brainstorming` · `reflective_thinking` · `troubleshooting` · `simple_planning` · `simple_creation` · `research` · `formal_creation` · `project_execution` · `visual_exploration` · `strategic_work` · `explicit_navigation`

## How-to / advice / comparison / brainstorming / troubleshooting / reflective / simple planning

See mission brief. How-to answers are procedural and practical in chat. Advice includes judgment and tradeoffs. Comparisons are contextual. Brainstorming is varied. Troubleshooting is ordered checks. Reflective stays conversational (Talk It Out design preserved). Lightweight planning stays in chat unless execution tracking is requested.

## Depth inference

Greater depth: “step by step”, “in detail”, “walk me through”, “everything I need”, “teach me”, complexity, high consequence.  
Brevity: “quickly”, “just tell me”, “briefly”, narrow facts.

## Conversational continuity

Follow-ups inherit prior topic and goal. Do not reset intent classification per turn when the member is continuing the same thread.

## Answer quality & substance validation

Useful answers are relevant, substantive, practical, context-aware, naturally organized, honest about uncertainty, free of platform jargon, and written in Shari’s warm human voice.

`validateShariAnswerSubstance` rejects destination-menu-only, route-before-answer, warning-only, request-echo, thin, and generic filler responses.  
`evaluateAndRepairAnswerFirst` produces repair instructions when validation fails (observability + future regeneration).

## Capability-offer policy

After answering, at most **one** primary soft next step unless the member asks for options. A direct answer may end with no platform offer.

## Routing precedence

1. Safety and essential clarification  
2. Explicit direct destination command  
3. Explicit formal creation or execution command  
4. Current research requirement (honest handling in chat)  
5. Direct conversational answer  
6. Optional capability offer  

Keyword routing must not sit above direct conversational help.

## Question versus action

| Phrase | Behavior |
|--------|----------|
| How do I create a strategic plan? | Answer (how-to) |
| Create a strategic plan for my business. | Formal creation |
| What should go into a podcast launch project? | Answer |
| Turn this into a podcast launch project. | Project handoff |
| How would I research my competitors? | Explain method |
| Research my current competitors. | Current-research posture in chat |
| Take me to the Research Library. | Navigate |

## Research decision

Do not claim current facts without current research. When live research is unavailable: give stable general guidance, identify what needs verification, state the limitation naturally—do not block the entire answer.

## Business Estate context

Use approved member context when relevant. Do not force re-entry of known facts. Do not expose internal retrieval language.

## Shari voice

Warm, capable, calm, conversational, practical. No robotic headings, destination menus, or “Based on your query” language.

## Chat UI

Ordinary questions, long answers, follow-ups, steps, examples, inline checklists, optional restrained handoffs—without leaving conversation for the first answer.

## Saved answers & handoffs

Prefer existing saved-conversation / Spark Card paths.  
`ShariConversationHandoff` stores answer + context for Create / Projects / Visual / Research / Strategy when the member accepts a later offer (`storeShariConversationHandoff`).

## Specialized intelligence

Chamber and platform knowledge may enrich answers behind the scenes. Do not require the member to pick a Chamber member first. Optional specialist invitation only after helping.

## Migration from route-first behavior

Demoted / gated:

- Companion-first workspace offers before answer  
- Research workspace connection early-returns  
- Frictionless immediate Create / Projects / Research / How-To Guide opens for answer-first turns  
- Strategy Library local replies for strategy *education* questions  
- CREATE fast path for questions about creating  
- Estate kernel navigation side-effects when `answerFirstPreferChat`

Preserved:

- Explicit “take me to / open …” navigation  
- Explicit create / project / strategy build commands  
- Talk It Out reflective posture  

## Evaluation set & tests

- Cases: `lib/shariAnswerFirst/evaluationSet.ts`  
- Unit / eval: `lib/shariAnswerFirst/shariAnswerFirst.test.ts`  
- Strategy education: `lib/conversationStabilization/intentWorkflowGate.test.ts`  
- Chat system hint: `shariAnswerFirstHintForChat`

## Browser validation

Required scenarios A–O in the build brief. If authenticated browser validation cannot run in the agent environment, report that honestly and use the manual checklist in the final report.

## Related documentation

Update pointers in Universal Request-to-Outcome, Research Library, Create, Creation Workspace, Projects, Visual Thinking, Strategic Planning, Chamber routing, Talk It Out, and Adaptive Companion docs to reference this standard: **answer first; capabilities support**.
