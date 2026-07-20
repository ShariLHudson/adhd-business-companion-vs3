# 079 — Cursor Implementation Handoff

## Mission

Implement one reusable interface system around all 077 workspaces.

## Audit First

Map existing:

- navigation components;
- breadcrumbs;
- modals;
- drawers;
- side panels;
- inspectors;
- toolbars;
- status controls;
- responsive layouts;
- accessibility helpers;
- local interface state;
- duplicate components;
- dead controls.

## Build Order

1. Create shared workspace shell.
2. Create shared return-context service.
3. Create clickable Full Workshop Map item.
4. Create shared section header.
5. Create universal command bar.
6. Create shared assistance panel.
7. Create inspector and history panel.
8. Create standardized dialogs.
9. implement responsive drawers.
10. wire authoritative state.
11. add keyboard and screen-reader behavior.
12. run browser certification.
13. migrate consumers.
14. remove duplicates only after passing regression.

## Required Outcome

The member should experience the same dependable interface whether they are editing an Event, SOP, marketing plan, strategy, checklist, campaign, report, or future work type.
