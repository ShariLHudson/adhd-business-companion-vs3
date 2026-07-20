# 079 — Panel, Drawer, and Inspector System

## Purpose

Define reusable secondary surfaces that support work without replacing the main editor.

## Standard Surfaces

### Context Panel

Shows:

- purpose;
- audience;
- constraints;
- related decisions;
- unresolved questions.

### Assistance Panel

Contains:

- Give Me Ideas;
- I’m Not Sure;
- Help Me Think;
- Show Examples;
- Research This;
- Ask Shari;
- Ask Chamber;
- Ask Board.

### Inspector

Shows structured properties such as:

- section status;
- owner;
- due date;
- dependencies;
- tags;
- permissions;
- linked Projects;
- linked Knowledge.

### Notes Panel

Supports private notes attached to Work ID or Section ID.

### History Panel

Shows:

- versions;
- saves;
- completion history;
- reopen history;
- contributor actions;
- restore options.

## Behavior Rules

- only one large secondary panel should be open by default;
- opening a second large panel closes or collapses the first unless split view is intentionally enabled;
- panels preserve unsaved editor content;
- panel state may persist per member;
- closing a panel restores focus to its trigger;
- mobile uses a full-height drawer rather than squeezing the editor.

## Inspector Editing

Editable inspector fields must use the same persistence rules as the editor.

Status changes made in the inspector must update the Full Workshop Map immediately after durable save.
