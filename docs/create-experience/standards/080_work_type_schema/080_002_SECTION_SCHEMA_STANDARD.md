# 080 — Section Schema Standard

## Purpose

Define the reusable schema for every section shown in a Full Workshop Map.

## Canonical Section Schema

```ts
type SectionSchema = {
  sectionTypeId: string;
  title: string;
  purpose: string;
  description?: string;
  defaultStatus: "not_started";
  required: boolean;
  order: number;
  dependencies?: string[];
  conditionalWhen?: string;
  editorMode:
    | "rich_text"
    | "structured_form"
    | "checklist"
    | "table"
    | "timeline"
    | "budget"
    | "canvas"
    | "hybrid";
  starterPrompt: string;
  unsurePrompt: string;
  ideasPrompt: string;
  examplesPrompt: string;
  researchPrompt?: string;
  reviewCriteria: string[];
  completionCriteria: string[];
  projectConversion?: {
    mode: "task" | "milestone" | "task_group" | "none";
  };
};
```

## Section Requirements

Every section must:

- explain why it matters;
- accept direct member editing;
- offer a useful starting point;
- support “I’m Not Sure”;
- support “Give Me Ideas”;
- define completion criteria;
- remain editable after completion;
- preserve versions;
- update the Full Workshop Map after durable save.

## Required and Optional Sections

Required sections may be skipped only with acknowledgment.

Optional sections may be hidden from the recommended path but must remain discoverable.

Conditional sections appear when a relevant decision activates them.

## Dependency Rules

Dependencies should guide, not unnecessarily block.

A blocked section must explain:

- what it depends on;
- why;
- what the member can do now;
- how to unblock it.
