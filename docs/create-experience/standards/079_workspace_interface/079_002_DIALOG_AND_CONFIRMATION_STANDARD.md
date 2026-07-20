# 079 — Dialog and Confirmation Standard

## Purpose

Define how confirmations, warnings, choices, and destructive actions are presented.

## Dialog Categories

- informational;
- confirmation;
- decision;
- conflict resolution;
- unsaved-change protection;
- destructive action;
- permission request;
- connection request.

## Required Dialog Anatomy

Every dialog includes:

- clear title;
- plain-language explanation;
- primary action;
- secondary action;
- close or cancel;
- keyboard focus;
- escape behavior where safe;
- accurate consequence statement.

## Destructive Actions

Delete, overwrite, unlink, archive, remove access, and discard must never share ambiguous language.

Preferred labels:

- Move to Trash
- Archive Work
- Remove Project Link
- Replace Current Version
- Discard Unsaved Changes
- Cancel

Avoid generic labels such as:

- OK
- Yes
- Continue

## Unsaved Work

When durable save has not succeeded, the dialog must state:

- what is unsaved;
- whether a recovery copy exists;
- what happens if the member leaves;
- available choices.

## Completion Dialog

Marking a work item or section complete must never imply locking.

Preferred language:

> Mark this complete for now? You can reopen and edit it at any time.

## Accessibility

- initial focus lands on the dialog title or safest action;
- tab focus remains inside the dialog;
- closing restores focus to the triggering control;
- screen readers receive title, description, and action meaning.
