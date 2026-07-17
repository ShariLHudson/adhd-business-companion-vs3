# Cursor Implementation Prompt — Global Chamber Topic Ownership Gate

Implement one global active-topic ownership layer for all Chamber and specialist conversations.

Follow:

- `docs/companion-behavior/contracts/022_GLOBAL_CHAMBER_TOPIC_OWNERSHIP_AND_CONTEXT_PRESERVATION_CONTRACT.md`
- CB-017
- CB-021
- Shared Chamber Navigate-Gate
- the completed gap map

## Required Implementation

### Authoritative Owner

Establish one authoritative active-topic state owner in the Conversation Engine.

Do not allow individual members, help routers, navigation handlers, or arrival components to maintain competing topic state.

### Topic Lifecycle

Support:

- identify
- await clarification
- accept clarification
- ready to answer
- answer
- complete
- cancel
- explicit topic change

### Fallback Gate

Before any generic fallback, evaluate:

```ts
if (activeTopic && activeTopic.status !== "answered" && activeTopic.status !== "completed") {
  blockGenericFallback();
  continueActiveTopic();
}
```

Equivalent logic is acceptable.

### Response Gate

Before early exit, confirm one of:

- substantive answer was produced
- explicit navigation completed
- clarification is genuinely required
- user cancelled
- task completed

A member introduction, arrival greeting, alias match, or generic acknowledgment is not a substantive answer.

### Knowledge Retrieval

When the active topic maps to a Chamber member:

- retrieve the member’s knowledge contribution
- preserve Shari as response owner
- continue to final composition
- do not show specialist identity unless the product design explicitly calls for a labeled advisory contribution

### Topic Replacement

Replace the active topic only when:

- user explicitly changes subject
- user initiates a different command
- user selects a valid destination
- current task is completed or cancelled

Weak keyword matches must not replace it.

## Required Tests

### Client Relationships

Input:

`i want to build relationships with my new adhd app members but don't know where to start`

Pass:

- no specialist self-introduction
- no generic help
- relevant answer using Client Relationships knowledge
- one visible response

Follow-up:

`how do i build good relationships with new adhd app members`

Pass:

- topic preserved
- no restart
- no settings/reminders/Clear My Mind prompt
- answer advances

### Content

`what is the best type of content for instagram vs facebook vs linkedin`

Pass:

- no Chamber arrival
- no generic fallback
- substantive answer path continues

### Finance

`why do i procrastinate about cancelling subscriptions i don't use`

Pass:

- no Finance introduction
- no generic fallback
- substantive answer path continues

### Explicit Navigation

`take me to Client Relationships`

Pass:

- navigation occurs once
- topic behavior remains valid
- no duplicate response

### Topic Change

Start with a client relationship question, then say:

`actually help me set a reminder`

Pass:

- explicit topic change recognized
- reminder path may proceed
- old topic does not leak

### Ambiguous Short Reply

After a clarification question, user says:

`yes`

Pass:

- answer applies to the pending clarification
- no restart
- no generic help

## Required Report

Return:

- files changed
- authoritative topic-state owner
- generic fallbacks gated
- early exits removed or guarded
- tests added
- test results
- preview commit
- authenticated preview URL
- remaining limitations
- deploy or do-not-deploy recommendation

## Constraints

- preview only
- no production deployment
- no member-specific patches
- no knowledge-library changes
- stop after preview evidence
