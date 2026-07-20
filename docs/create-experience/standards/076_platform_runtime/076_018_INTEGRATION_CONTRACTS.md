# 076 — Integration Contracts

## 1. Purpose
Define how the Universal Creation Experience exchanges work with other Spark Estate capabilities without duplicating identity, content, or ownership.

## 2. Universal Integration Rule
Integrations exchange references, context, permissions, and bounded outputs.

They do not create hidden copies by default.

## 3. Canonical Integration Packet

```ts
type UniversalCreationIntegrationPacket = {
  workId: string;
  sectionId?: string;
  title: string;
  classificationType: string;
  originalRequest: string;
  workingIntent: string;
  requestedOutcome: string;
  relevantContent?: string;
  audience?: string;
  goals?: string[];
  constraints?: string[];
  priorDecisions?: string[];
  permissions: string[];
  returnDestination: string;
};
```

## 4. Projects Contract
Universal Creation owns the content source of truth.

Projects owns execution.

Turning work into a Project may derive:

- outcomes
- tasks
- milestones
- owners
- dates
- dependencies
- risks
- reminders

The Project stores the source Work ID.

## 5. Chamber Contract
A Chamber Member receives:

- bounded work context
- a specific request
- relevant sections
- member permissions

The Chamber returns:

- recommendations
- proposed revisions
- questions
- risks
- examples
- research suggestions

The member chooses what enters the work.

## 6. Board Contract
The Board receives decision context.

The Board returns:

- perspectives
- pros and cons
- tradeoffs
- risks
- alternatives
- unresolved questions

The Board does not silently rewrite the source work.

## 7. Research Contract
Research receives:

- work context
- section context
- intended use
- depth
- freshness
- source expectations

Research returns:

- findings
- citations
- uncertainty
- relevance
- write-back options

## 8. Knowledge Contract
Publishing to Knowledge creates a linked published version.

The source Work ID remains authoritative.

## 9. Cartography Contract
Cartography may visualize:

- structure
- dependencies
- timelines
- relationships
- options
- decisions

Maps link to the source Work ID and relevant sections.

## 10. Founder Studio Contract
Founder Studio may create private founder-level work using the same architecture with stricter privacy and visibility controls.

## 11. Business Estate Contract
Business Estate sections may create or link Universal Work items rather than embedding separate incompatible editors.

## 12. Calendar and Rhythms Contract
Work may create:

- calendar events
- reminders
- rhythms
- review dates

These require explicit member approval unless a pre-authorized rule exists.

## 13. Email and Sharing Contract
Sending must distinguish:

- draft
- preview
- sent
- failed

Attachments and links must resolve to real outputs.

## 14. Conversion Contract
Conversions create linked derivatives.

Example:

```text
Strategy Work ID A
→ Project ID P
→ Presentation Work ID B
→ Checklist Work ID C
```

All links preserve lineage.

## 15. Return Contract
Every integration must define:

- where control returns
- what changed
- what was saved
- what remains pending
- next recommended step

## 16. Certification
Prove:

- same Work ID across surfaces
- no hidden duplicates
- Chamber returns to same work
- Board returns to same work
- Research writes back
- Project retains source linkage
- Knowledge publishes linked version
- Calendar action requires approval
- failed send/export is truthful
