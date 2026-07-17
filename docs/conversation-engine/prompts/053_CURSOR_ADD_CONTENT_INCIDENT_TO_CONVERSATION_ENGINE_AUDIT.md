# Cursor Prompt — Add Content Incident to Conversation Engine Audit

Add the incident in:

`docs/companion-behavior/audits/052_CB_021_CONTENT_INTELLIGENCE_HANDOFF_LOOP_INCIDENT.md`

to both:

- CB-021 advisory handoff audit scope
- Package 3 Conversation Engine audit corpus

## Trace These Exact Inputs

1. `what is the best type of content to create for instagram`
2. Repeat the same question.
3. `i am asking what is the best type of content to create for instagram vs fb or linked in`

## Identify

- exact source of `What would help you move forward today?`
- exact source of the Content Intelligence introduction
- exact source of `Of course — here's Content.`
- every assistant message created per user turn
- whether the user message reaches Content Intelligence
- whether Content Intelligence returns structured analysis or only startup copy
- whether specialist activation resets active conversation state
- whether the Shari composer is bypassed
- whether the Finance and Content incidents share the same code path
- whether one global fix can resolve both

## Required Deliverables

1. Update or create:

`docs/conversation-engine/audits/CONVERSATION_ENGINE_GAP_MAP.md`

2. Update or create:

`docs/companion-behavior/audits/021_ADVISORY_HANDOFF_AND_RESPONSE_OWNERSHIP_GAP_MAP.md`

## Recommendation Requirement

Return a single recommended authoritative boundary for:

- specialist selection
- active-context transfer
- structured specialist contribution
- one final response owner
- duplicate-response prevention

## Constraints

- Do not patch Finance and Content separately.
- Do not merely remove introduction strings.
- Do not hide duplicate responses in the UI.
- Do not implement until both audits identify the shared owner and shared failure path.
- Do not deploy production.
