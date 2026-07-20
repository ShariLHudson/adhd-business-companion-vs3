# 076 — Work Identity Standard

## 1. Purpose
Define one authoritative identity model for every meaningful piece of work in Spark Estate.

## 2. Core Rule
A work item has one immutable Work ID throughout its lifecycle.

Titles, locations, views, classifications, project links, and status may change.

The Work ID may not.

## 3. Required Identity Fields

```ts
type WorkIdentity = {
  id: string;
  userId: string;

  originalRequest: string;
  workingIntent: string;

  classificationType: string;
  workspaceType: string;
  templateId?: string;

  humanTitle: string;
  sourceSurface: string;

  parentWorkId?: string;
  derivativeOfWorkId?: string;
  projectId?: string;

  lifecycleState: string;
  status: string;

  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
};
```

## 4. Original Request
`originalRequest` preserves the member’s first meaningful request that caused the work item to exist.

It is immutable.

It may not be rewritten into a cleaned summary and then treated as the original.

## 5. Working Intent
`workingIntent` captures what the member is currently trying to accomplish.

It may evolve through explicit reclassification.

Changes must be versioned.

## 6. Classification Type
Classification controls:

- structure
- workspace type
- default sections
- research prompts
- views
- output options
- Project conversion

Downstream systems may enrich classification.

They may not reinterpret it into an unrelated work type.

## 7. Human Title
The title must:

- be readable
- reflect the work
- remove command language
- remove meta phrases
- avoid duplicate suffixes
- avoid internal runtime labels
- avoid type mashups

Good:

- Client Onboarding Checklist
- Fall Leadership Retreat
- Q4 Marketing Strategy

Bad:

- Create a Client Onboarding Checklist
- Client Onboarding Checklist Workshop Onboarding
- Universal Creation Session 4

## 8. Lineage
Linked derivatives must preserve lineage.

Examples:

- strategy → Project
- SOP → checklist
- research → report
- event plan → execution plan
- framework → template

Lineage is explicit.

## 9. Duplicate vs Branch
Duplicate creates an independent copy with source reference.

Branch creates an intentional alternative version with stronger lineage.

Neither may overwrite the original.

## 10. Identity Resolution
When a member asks to continue, the platform resolves:

- explicit title
- active Work ID
- recent relevant work
- linked Project
- current destination context

Ambiguity must be resolved before mutation.

## 11. Identity Persistence
Identity is persisted before the workspace is declared created.

A visible workspace without a durable Work ID is not a successfully created work item.

## 12. Identity Across Surfaces
Every surface must use the same Work ID.

Local display IDs may exist but may not become competing identities.

## 13. Identity Conflict
When two records appear to represent the same work:

- do not merge automatically
- compare lineage and timestamps
- ask the member when necessary
- preserve both until resolved
- record merge decisions

## 14. Certification
Prove:

- immutable Work ID
- stable title after refresh
- title rename without identity change
- correct classification
- originalRequest persistence
- workingIntent persistence
- Projects and Welcome Home resolve same work
- duplicate and branch produce new IDs with lineage
