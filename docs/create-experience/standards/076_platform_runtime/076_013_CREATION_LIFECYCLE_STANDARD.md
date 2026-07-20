# 076 — Creation Lifecycle Standard

## 1. Purpose
Define the universal lifecycle of living work across Spark Estate.

## 2. Lifecycle Model

```ts
type WorkLifecycleState =
  | "idea"
  | "discovery"
  | "drafting"
  | "developing"
  | "reviewing"
  | "approved"
  | "executing"
  | "maintaining"
  | "completed"
  | "published"
  | "archived"
  | "deleted";
```

## 3. Lifecycle Is Not Strictly Linear
Members may move backward, forward, pause, branch, or revisit.

The platform should support natural movement while protecting real dependencies.

## 4. Idea
A spark, note, problem, opportunity, or rough intention exists.

Required capabilities:

- capture
- preserve
- classify later
- connect to future work
- avoid forcing full structure

## 5. Discovery
The platform is learning enough to create useful structure.

Discovery must be proportional.

It may not become a repeated-question trap.

## 6. Drafting
A first usable structure or draft exists.

Drafting must permit immediate editing.

## 7. Developing
The member is expanding, researching, deciding, organizing, and refining.

## 8. Reviewing
The work is being checked for:

- completeness
- accuracy
- clarity
- risk
- alignment
- readiness

## 9. Approved
A version has been intentionally accepted.

Approval creates a milestone version.

Approval does not lock future revision.

## 10. Executing
The work is being acted upon through Projects, tasks, calendar, rhythms, or other execution capabilities.

## 11. Maintaining
The work remains active and requires periodic updates.

Examples:

- SOP
- policy
- strategy
- budget
- content calendar
- client process

## 12. Completed
The intended outcome is complete for now.

Completed work remains editable and reusable.

## 13. Published
A selected version is made available to an audience, Knowledge, a client, a team, or another surface.

The source work remains linked.

## 14. Archived
The work is preserved but removed from active views.

## 15. Deleted
Deletion is soft by default.

Permanent deletion is separate.

## 16. Lifecycle Transitions

```ts
type LifecycleTransition = {
  from: WorkLifecycleState;
  to: WorkLifecycleState;
  reason: string;
  initiatedBy: "member" | "system" | "authorized_collaborator";
  createdAt: string;
};
```

## 17. Automatic Transitions
Automatic transitions are allowed only when:

- the rule is explicit
- the member can understand it
- the transition is reversible
- no consequential meaning is inferred without evidence

Example: editing archived work may return it to developing after member confirmation.

## 18. Member-Facing Language
Prefer:

- Ready to continue
- Draft ready
- Needs your review
- In progress
- Complete for now
- Published
- Archived

Avoid technical lifecycle language when plain language is clearer.

## 19. Lifecycle and Projects
Execution status may update lifecycle, but Projects does not own content identity.

## 20. Certification
Prove:

- valid transitions
- invalid transition blocking
- milestone version on approval
- completed work remains editable
- archive and restore
- soft delete and restore
- published version linkage
- no accidental lifecycle changes
