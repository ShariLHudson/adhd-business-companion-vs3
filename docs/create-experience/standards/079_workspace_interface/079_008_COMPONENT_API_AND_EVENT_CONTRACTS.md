# 079 — Component API and Event Contracts

## Workspace Shell

```ts
type WorkspaceShellProps = {
  workId: string;
  sectionId?: string;
  returnContext?: ReturnContext;
  initialPanel?: WorkspacePanel;
};
```

## Map Item

```ts
type WorkshopMapItemProps = {
  workId: string;
  sectionId: string;
  title: string;
  status: SectionStatus;
  required: boolean;
  lastEditedAt?: string;
  blockedReason?: string;
  onOpen: (command: OpenSectionCommand) => void;
};
```

## Assistance Request

```ts
type AssistanceRequest = {
  workId: string;
  sectionId: string;
  action:
    | "ideas"
    | "unsure"
    | "think"
    | "examples"
    | "research"
    | "ask_shari"
    | "ask_chamber"
    | "ask_board";
  selection?: string;
  memberInstruction?: string;
};
```

## Required Interface Events

- `workspace.opened`
- `workspace.return_path.created`
- `workshop_map.opened`
- `workshop_map.section_selected`
- `workspace.panel.opened`
- `workspace.panel.closed`
- `workspace.command.started`
- `workspace.command.succeeded`
- `workspace.command.failed`
- `workspace.dialog.opened`
- `workspace.dialog.confirmed`
- `workspace.dialog.cancelled`
- `workspace.navigation.completed`

## Event Integrity

Events must include Work ID and Section ID where applicable.

Telemetry events may not be treated as proof that the underlying mutation succeeded.
