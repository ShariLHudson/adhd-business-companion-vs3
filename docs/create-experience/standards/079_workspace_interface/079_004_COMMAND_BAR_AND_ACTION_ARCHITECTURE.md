# 079 — Command Bar and Action Architecture

## Purpose

Define consistent placement and behavior for common actions.

## Primary Commands

Always available when applicable:

- Save;
- Undo;
- Redo;
- Status;
- Give Me Ideas;
- I’m Not Sure;
- Help Me Think;
- Research;
- Ask Shari;
- More.

## Secondary Commands

Available through More or contextual menus:

- Show Examples;
- Ask Chamber;
- Ask Board;
- Add Note;
- Add Task;
- History;
- Duplicate;
- Branch;
- Export;
- Print;
- Share;
- Archive;
- Delete.

## Action Priority

1. preserve work;
2. continue current work;
3. obtain contextual assistance;
4. manage status;
5. create derivatives or outputs;
6. perform administrative actions.

## Loading and Completion

Every command must support:

- idle;
- loading;
- success;
- failure;
- disabled with explanation where applicable.

A command may not disappear after selection unless its replacement state is obvious.

## Keyboard Support

Recommended shortcuts:

- Save: `Ctrl/Cmd + S`
- Undo: `Ctrl/Cmd + Z`
- Redo: `Ctrl/Cmd + Shift + Z`
- Open command palette: `Ctrl/Cmd + K`
- Return to map: configurable and documented

Shortcuts must not conflict with browser or assistive technology behavior.
