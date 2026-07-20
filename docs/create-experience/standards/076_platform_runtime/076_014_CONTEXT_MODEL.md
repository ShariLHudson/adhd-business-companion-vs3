# 076 — Universal Creation Context Model

## 1. Purpose
Define the context available to every creation action so assistance, research, routing, and recommendations remain relevant.

## 2. Context Principle
Context must be sufficient to reduce repetition without becoming an uncontrolled data dump.

Only relevant, permitted, current context should be included.

## 3. Context Layers

### 3.1 Member Context
- member identity
- preferences
- communication style
- accessibility needs
- working patterns
- energy or focus when explicitly available
- permissions

### 3.2 Business Context
- business identity
- audience
- offers
- brand
- values
- goals
- constraints
- current initiatives

### 3.3 Work Context
- Work ID
- title
- original request
- working intent
- classification
- lifecycle
- current status
- structure
- current content

### 3.4 Section Context
- Section ID
- title
- purpose
- current content
- unresolved items
- research state
- review state
- dependencies

### 3.5 Project Context
- linked Project
- milestones
- tasks
- deadlines
- owners
- dependencies
- risks
- progress

### 3.6 Collaboration Context
- active Chamber Member
- active Board Director
- prior recommendations
- unresolved questions
- selected perspectives

### 3.7 Destination Context
- current Estate location
- source surface
- current view
- entry action
- navigation history relevant to the turn

### 3.8 Temporal Context
- created date
- last opened
- stale research
- upcoming deadlines
- recent changes
- return-after-absence duration

## 4. Canonical Context Packet

```ts
type UniversalCreationContextPacket = {
  member: {
    userId: string;
    preferences?: Record<string, unknown>;
  };

  work: {
    workId: string;
    title: string;
    originalRequest: string;
    workingIntent: string;
    classificationType: string;
    lifecycleState: string;
  };

  section?: {
    sectionId: string;
    title: string;
    purpose?: string;
    content?: string;
    unresolved?: string[];
  };

  project?: {
    projectId: string;
    nextMilestone?: string;
    blockers?: string[];
  };

  business?: {
    audience?: string;
    goals?: string[];
    constraints?: string[];
    values?: string[];
  };

  collaboration?: {
    chamberMember?: string;
    boardDirector?: string;
    priorAdvice?: string[];
  };

  request: {
    intent: string;
    requestedOutcome: string;
    depth?: string;
  };
};
```

## 5. Relevance Rules
Do not include:

- unrelated historical conversations
- stale assumptions
- sensitive information not needed for the action
- entire documents when a section summary is enough
- other work items unless explicitly relevant

## 6. Context Freshness
Each context source should have:

- timestamp
- source
- confidence
- version

Stale context must be labeled or refreshed.

## 7. Context Priority
When context conflicts:

1. explicit current member statement
2. current authoritative work state
3. recent confirmed member preference
4. persisted business context
5. inferred context

Inferences must never override explicit current intent.

## 8. Context for “Give Me Ideas”
Must include:

- section purpose
- audience
- goal
- existing content
- constraints
- previous decisions

## 9. Context for “I Don’t Know”
Must include enough information to:

- simplify
- recommend
- show examples
- infer a starter answer
- identify missing knowledge

## 10. Context for Research
Must include:

- research question
- current section
- intended use
- required freshness
- jurisdiction or market when relevant
- desired depth
- source expectations

## 11. Context Privacy
Context use must respect:

- member permissions
- data minimization
- destination boundaries
- private Founder Studio content
- sensitive personal information
- future tenant separation

## 12. Context Write-Back
New facts learned during work should not automatically become permanent member or business memory.

Write-back requires:

- explicit member action
- clearly defined platform rule
- or verified work persistence within the current Work ID

## 13. Certification
Prove:

- relevant context included
- unrelated context excluded
- current statements override stale context
- section research is section-aware
- Chamber/Board receive bounded context
- sensitive context is not over-shared
- return summary uses accurate state
