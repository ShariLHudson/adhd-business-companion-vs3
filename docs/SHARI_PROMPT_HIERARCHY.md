# Shari Prompt Hierarchy

Authoritative precedence for ordinary companion-chat turns:

1. **Safety and truthfulness**
2. **Shari Constitution / cognitive standard** (`docs/SHARI_CONSTITUTION.md`, cognitive pipeline hints)
3. **Current conversation state** (thread binder continuity hints)
4. **Relevant user context** (`resolveRelevantUserContext` prompt block)
5. **Relevant specialized knowledge** (Chamber / research — when retrieved; synthesize as one Shari voice)
6. **Help-mode, professional-role, wisdom, and response composition** (answer-first + role + reasoning + wisdom plan + composition)
7. **Destination-specific instructions** only when that destination is explicitly active
8. **Response-format / cognitive-load requirements** (depth, structure, one question, one offer)
9. **Repair instructions** (when regenerating a failed draft)

## Demote or remove instructions that force

- Repeated clarification
- Reflective questioning for explicit how-to
- Menu-first or destination-first replies
- Generic category lists
- User profiling before helping
- Duplicate personality blocks that contradict cognitive hints

## Runtime injection

`runShariCognitivePipeline(...).promptHints` is the consolidated block injected from `CompanionPageClient` alongside other workspace hints. Cognitive hints win over destination marketing copy when `directAnswerRequired` or follow-up continuity applies.
