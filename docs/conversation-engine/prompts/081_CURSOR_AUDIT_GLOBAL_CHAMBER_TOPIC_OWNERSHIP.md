# Cursor Audit Prompt — Global Chamber Topic Ownership and Context Preservation

Audit the complete runtime path for active-topic preservation.

Do not implement first.

## Trace These Incidents

### Client Relationships

1. “I want to build relationships with my new ADHD app members but don’t know where to start.”
2. Platform introduces Client Relationships Intelligence.
3. User asks again.
4. Platform falls into unrelated generic help.

### Content

Normal content question routes to Chamber arrival and never answers.

### Finance

Subscription question routes to Finance introduction and never answers.

### AI & Technology

Webinar-equipment question is initially answered, but member introduction and unreliable research behavior appear in the same flow.

## Identify

- where active intent is stored
- whether active topic state exists
- how topic state survives across turns
- when it is cleared
- what generic fallback owners exist
- what help-router triggers exist
- whether arrival greetings can early-exit
- whether specialist activation can early-exit
- whether unanswered user goals are detectable
- whether clarification answers advance state
- whether alias routing overrides topic ownership
- whether Shari remains the final response owner
- whether generic help text is allowed during an unresolved topic
- all code paths that emit:
  - “What would help you move forward today?”
  - “I’m here—tell me what you need”
  - “Tell me what you’re trying to do—settings, reminders, Clear My Mind…”

## Required Deliverable

Create:

`docs/conversation-engine/audits/GLOBAL_CHAMBER_TOPIC_OWNERSHIP_GAP_MAP.md`

Include:

- current state owners
- fallback owners
- early-exit points
- topic-clear conditions
- topic-replacement conditions
- member activation path
- response ownership path
- affected Chamber members
- proposed authoritative owner
- smallest global implementation slice
- tests required
- preview risks
- deploy recommendation

## Constraints

- no member-specific patches
- no phrase-specific exceptions
- no knowledge-library edits
- no production deployment
- stop after audit and recommendation
