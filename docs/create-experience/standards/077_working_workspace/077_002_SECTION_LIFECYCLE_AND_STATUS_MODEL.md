# 077 — Section Lifecycle and Status Model

## Canonical Statuses

- `not_started`
- `in_progress`
- `needs_review`
- `complete_for_now`
- `skipped_for_now`
- `blocked`
- `archived`

## Status Rules

### not_started
No meaningful saved content exists.

### in_progress
Meaningful content exists and the member has not marked the section complete for now.

### needs_review
The member or platform has intentionally flagged the section for review.

### complete_for_now
The member has accepted the section as sufficiently complete at this moment.

### skipped_for_now
The member intentionally deferred the section.

### blocked
The section cannot progress because of a known dependency.

### archived
The section is hidden from active workflow but preserved.

## Editing a Completed Section

When a member opens a completed section:

- the section must be fully readable;
- all editable fields remain editable;
- contextual tools remain available;
- the status remains `complete_for_now` until a meaningful edit is saved;
- after a meaningful edit, the system may ask:
  - “Keep this marked complete?”
  - “Move it back to In Progress?”

The platform must not silently lock or silently change status.

## Completion

Marking complete must:

- save current content;
- create a version checkpoint;
- update section status;
- update map status;
- preserve editability;
- record completion time;
- preserve the ability to reopen.

## Reopen

Reopen must:

- change status to `in_progress`;
- preserve content;
- preserve prior completion history;
- create an audit event;
- return the member to editing.

## Required Status Actions

Each section must support:

- Start
- Continue
- Review
- Edit
- Mark Complete
- Reopen
- Skip for Now
- Mark Needs Review
- Archive where appropriate
