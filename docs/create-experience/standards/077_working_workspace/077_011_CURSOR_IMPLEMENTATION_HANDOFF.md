# 077 — Cursor Implementation Handoff

## Mission

Implement the Universal Working Workspace Experience so every section in every Full Workshop Map is clickable, editable, saveable, reopenable, and supported by contextual help.

## First Audit

Before changing code, identify:

- current Full Workshop Map component;
- section card component;
- current status source;
- click handlers;
- route or overlay used to open sections;
- editor components;
- persistence path;
- autosave path;
- completed-state behavior;
- localStorage dependencies;
- dead buttons;
- unsupported statuses.

Do not delete existing work until it is mapped.

## Implementation Order

1. Establish canonical Section ID and status model.
2. Make the entire section card clickable.
3. Implement `openSection(workId, sectionId)`.
4. Connect all section editors to durable persistence.
5. Add visible save state.
6. Implement completed-section edit and reopen.
7. Add contextual actions.
8. Add return-to-map behavior.
9. Add previous and next section behavior.
10. Connect Project source links.
11. Run browser certification.
12. Remove conflicting local paths only after migration passes.

## Critical Bug to Fix

Current behavior described by the product owner:

- Event Type shows Complete.
- Purpose shows Not Started.
- Audience shows Not Started.
- Sections cannot be clicked to start or edit.
- Completed sections cannot be reopened and edited.

This is a release-blocking defect.

## Acceptance Criteria

- every visible section opens;
- every editable section edits;
- every save is durable;
- every complete section reopens;
- every contextual help action uses section context;
- every map status updates correctly;
- refresh and return preserve content;
- no dead controls;
- no false save messages.
