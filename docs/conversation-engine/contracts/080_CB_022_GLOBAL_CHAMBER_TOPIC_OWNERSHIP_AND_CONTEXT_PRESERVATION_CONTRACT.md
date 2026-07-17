# CB-022 — Global Chamber Topic Ownership and Context Preservation Contract

## Purpose

Prevent Spark Estate™ from losing, replacing, or restarting an active Chamber-related conversation before the user’s actual question is answered.

This contract applies globally to every Chamber member and every specialist knowledge library.

It must not be implemented as separate fixes for Finance, Content, AI & Technology, Client Relationships, or any other member.

## Confirmed Failure Pattern

The recurring sequence is:

1. The user asks a normal domain question.
2. A Chamber member is selected or introduced.
3. The user provides the requested context.
4. The platform loses the active topic.
5. A generic fallback, help router, arrival greeting, or unrelated destination prompt takes over.
6. The user’s question remains unanswered.

Observed examples include:

- Finance Intelligence
- Content Intelligence
- AI & Technology Intelligence
- Client Relationships Intelligence
- Create-document workflows

## Governing Rule

Once a valid user intent and topic have been identified, Spark Estate must preserve that active topic until one of the following occurs:

- the question is substantively answered
- the user explicitly changes topics
- the user requests navigation
- the user cancels
- the current task is completed
- a necessary clarification is answered and the conversation advances

A generic fallback must never replace an active, answerable topic.

## Required Topic State

Maintain structured state equivalent to:

```ts
type ActiveTopicState = {
  topicId: string;
  domain?: string;
  userGoal: string;
  lastAnsweredQuestion?: string;
  unresolvedNeed?: string;
  selectedKnowledgeSources: string[];
  responseOwner: "shari";
  status:
    | "identified"
    | "awaiting_clarification"
    | "ready_to_answer"
    | "answered"
    | "completed"
    | "cancelled";
  confidence: "high" | "medium" | "low";
  startedAtTurn: number;
  updatedAtTurn: number;
};
```

## Required Behavior

### 1. Preserve the user’s goal

The platform must keep the original user goal available across turns.

Example:

> “I want to build relationships with my new ADHD app members but don’t know where to start.”

The preserved goal is:

> Build strong relationships with new ADHD platform members.

### 2. Advance after clarification

When the user answers a relevant question, the system must move from:

`awaiting_clarification`  
to  
`ready_to_answer`

It must not ask the user to explain the same need again.

### 3. Block unrelated generic fallbacks

The following must be suppressed while an active topic is unresolved:

- “I’m here—tell me what you need.”
- “What would help you move forward today?”
- “Tell me what you’re trying to do—settings, reminders, Clear My Mind…”
- generic help menus
- unrelated destination suggestions
- member arrival greetings
- repeated specialist introductions

### 4. Keep one response owner

All knowledge contributions must flow to Shari.

No Chamber member may become a separate visible speaker.

### 5. Do not restart discovery

Do not return to broad discovery after the user has already supplied a clear goal.

### 6. Respect explicit topic changes

A new explicit user topic may replace the active topic.

A weak keyword collision, alias match, or generic help trigger may not.

### 7. Resolve before rerouting

Do not route to navigation, settings, reminders, Clear My Mind, or another destination unless:

- the user asked for that destination
- the answer requires it
- the user accepts a suggestion
- a valid current menu choice resolves to it

### 8. Continue normal reasoning

When a Chamber library is relevant, retrieve its knowledge contribution and continue through the normal decision and response pipeline.

Do not early-exit after member selection, arrival text, or alias resolution.

## Relationship to Existing Contracts

CB-022 works with:

- CB-017 Conversation Progression and Redundant Question Prevention
- CB-021 Advisory Handoff and Single-Response Ownership
- Shared Chamber Navigate-Gate
- Decision Engine
- Conversation Engine
- Shari Response Composer

CB-022 does not replace these contracts.

It governs persistent topic ownership across the full turn sequence.

## Definition of Done

A user can ask a domain question, provide context, and receive a relevant answer without:

- repeated introductions
- generic fallback prompts
- unrelated help menus
- topic loss
- duplicate responses
- unnecessary restart
