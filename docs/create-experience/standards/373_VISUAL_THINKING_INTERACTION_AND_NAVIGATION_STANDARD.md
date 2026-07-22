# 373 — Visual Thinking Interaction & Navigation Standard

## Purpose

Make automatically generated visuals editable, useful, and navigable.

## Supported user actions

- select a node
- open source item
- rename a node label
- expand one branch
- collapse branch
- focus branch
- compare two items
- trace origin
- trace outcome
- add a relationship
- correct a relationship
- remove a relationship
- hide a relationship
- restore a hidden relationship
- reorder within a view
- delete a visual view
- create an alternate view
- save a preferred view
- return to previous view

## Deletion rules

Deleting a visual node from a view does not automatically delete the source artifact.

The system must clearly distinguish:

- remove from this view
- disconnect relationship
- archive source item
- delete source item

Destructive source deletion requires explicit confirmation.

## Navigation rule

Opening a visual node must take the user to the source item, not a copied visual version.

## Preserve orientation

When returning:

- restore prior focus
- retain expanded branches
- retain selected item
- retain filter state
