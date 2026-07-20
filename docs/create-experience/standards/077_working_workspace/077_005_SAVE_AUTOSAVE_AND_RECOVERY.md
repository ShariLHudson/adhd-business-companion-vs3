# 077 — Save, Autosave, and Recovery

## Manual Save

Every section must provide a visible Save action.

Manual save must:

- validate the Section ID;
- persist current content;
- update modified time;
- update map status if needed;
- create or update a version checkpoint;
- report success or failure truthfully.

## Autosave

Autosave must occur:

- after meaningful idle time;
- before leaving a section;
- before status changes;
- before completion;
- before opening another work item where possible.

## Recovery

The platform must protect work during:

- browser refresh;
- navigation away;
- accidental close;
- temporary network loss;
- application crash;
- session expiration.

## Resume

Returning to a work item must restore:

- correct Work ID;
- correct section;
- latest durable content;
- unsaved recovery content when newer;
- current status;
- last cursor or viewport position when available;
- next useful action.

## Conflict Handling

When two versions conflict:

- preserve both;
- show differences;
- allow choose, merge, or duplicate;
- never silently discard either version.
