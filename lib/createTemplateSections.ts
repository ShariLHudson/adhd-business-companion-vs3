import { type CreateType } from "./createTemplateFields";

export type TemplateSectionForEdit = {
  id: string;
  label: string;
};

const SECTIONS_BY_TYPE: Partial<Record<CreateType, TemplateSectionForEdit[]>> = {
  "lead-magnet": [
    { id: "title", label: "Title" },
    { id: "audience", label: "Audience" },
    { id: "problem", label: "Problem" },
    { id: "desiredOutcome", label: "Desired Outcome" },
    { id: "promise", label: "Promise" },
    { id: "format", label: "Format" },
    { id: "outline", label: "Outline" },
    { id: "cta", label: "Call To Action" },
  ],
  workshop: [
    { id: "title", label: "Workshop Title" },
    { id: "audience", label: "Audience" },
    { id: "problem", label: "Problem" },
    { id: "outcome", label: "Outcome" },
    { id: "teachingPoints", label: "Teaching Points" },
    { id: "activities", label: "Activities" },
    { id: "offer", label: "Offer" },
    { id: "cta", label: "Call To Action" },
  ],
  "marketing-plan": [
    { id: "audience", label: "Audience" },
    { id: "offer", label: "Offer" },
    { id: "goals", label: "Goals" },
    { id: "messaging", label: "Messaging" },
    { id: "contentStrategy", label: "Content Strategy" },
    { id: "leadGeneration", label: "Lead Generation" },
    { id: "salesStrategy", label: "Sales Strategy" },
    { id: "timeline", label: "Timeline" },
  ],
};

const DEFAULT_SECTIONS: TemplateSectionForEdit[] = [
  { id: "title", label: "Title" },
  { id: "audience", label: "Audience" },
  { id: "mainContent", label: "Main Content" },
  { id: "cta", label: "Call To Action" },
];

export function getTemplateSectionsForEdit(type: CreateType): TemplateSectionForEdit[] {
  return SECTIONS_BY_TYPE[type] ?? DEFAULT_SECTIONS;
}
