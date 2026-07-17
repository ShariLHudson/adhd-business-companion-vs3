# Cursor Prompt — Audit the Conversation Engine

Audit the full conversation path without changing code.

## Trace

Map:

- user input entry points
- message persistence
- active-question state
- pending-answer state
- workflow state
- turn decision
- specialist routing
- fallback routing
- final response composition
- UI rendering
- duplicate message creation
- early returns
- retries and effects

## Required Failure Corpus

Include:

1. collaboration answer ignored
2. subscription procrastination routed to repeated Finance introduction
3. generic “tell me what you need”
4. numbered choice after New Chat
5. unrelated prior noun bleed
6. repeated workflow prompts
7. topic change during an active workflow

## Deliverable

Create:

`docs/conversation-engine/audits/CONVERSATION_ENGINE_GAP_MAP.md`

Report:

- authoritative owners
- competing owners
- bypasses
- missing state
- fallback sources
- duplicate-render paths
- contract status
- smallest safe global implementation order

Do not implement. Do not deploy.
