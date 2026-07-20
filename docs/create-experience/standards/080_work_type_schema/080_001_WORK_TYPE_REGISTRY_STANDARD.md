# 080 — Work Type Registry Standard

## Purpose

Create one authoritative registry for every work type available through Create, Projects, Chamber Members, Founder Studio, Business Estate, and future destinations.

## Required Registry Fields

```ts
type WorkTypeRegistryEntry = {
  workTypeId: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  version: string;
  status: "draft" | "active" | "deprecated" | "retired";
  schemaId: string;
  defaultOutputTypes: string[];
  projectConversionMode:
    | "whole_work"
    | "section_tasks"
    | "milestones"
    | "custom";
  consumerDestinations: string[];
  certificationSuite: string;
};
```

## Registry Rules

- One Work Type ID has one authoritative schema.
- Aliases may route to the same Work Type ID.
- A consumer may configure presentation but may not duplicate the schema.
- Deprecated work types must preserve opening and editing of existing work.
- A renamed work type retains its Work Type ID.

## Example IDs

- `event_plan`
- `marketing_campaign`
- `standard_operating_procedure`
- `strategic_plan`
- `business_plan`
- `content_plan`
- `course`
- `presentation`
- `report`
- `checklist`
- `framework`
- `client_onboarding`
- `meeting_plan`
- `launch_plan`
