export type CreateType =
  | "lead-magnet"
  | "marketing-plan"
  | "workshop"
  | "email-sequence"
  | "newsletter"
  | "sop"
  | "landing-page"
  | "social-media-content"
  | "sales-funnel"
  | "course-outline"
  | "client-onboarding"
  | "custom";

export type CreateTemplateField = {
  id: string;
  label: string;
  question: string;
  helpText?: string;
  required: boolean;
  section: string;
};

export const CREATE_TEMPLATE_FIELDS: Record<CreateType, CreateTemplateField[]> = {
  "lead-magnet": [
    {
      id: "audience",
      label: "Audience",
      question: "Who is this lead magnet for?",
      required: true,
      section: "Who is it for?",
    },
    {
      id: "problem",
      label: "Problem",
      question: "What specific problem are they struggling with?",
      required: true,
      section: "Problem",
    },
    {
      id: "desiredOutcome",
      label: "Desired Outcome",
      question: "What result do they want after using this?",
      required: true,
      section: "Desired Outcome",
    },
    {
      id: "promotion",
      label: "What You Are Promoting",
      question: "What do you want this lead magnet to lead people toward?",
      helpText:
        "Example: workshop, product, consultation, ecosystem, course, book, email list.",
      required: true,
      section: "Promotion",
    },
    {
      id: "format",
      label: "Format",
      question: "What format should this be?",
      helpText:
        "Example: checklist, workbook, guide, quiz, cheat sheet, video, email course.",
      required: true,
      section: "Format",
    },
    {
      id: "promise",
      label: "Promise",
      question: "What promise should this lead magnet make?",
      required: true,
      section: "Promise",
    },
    {
      id: "outline",
      label: "Main Sections",
      question: "What main points or sections should it include?",
      required: true,
      section: "Outline",
    },
    {
      id: "cta",
      label: "Call To Action",
      question: "What should the reader do next after finishing it?",
      required: true,
      section: "Delivery & CTA",
    },
    {
      id: "tone",
      label: "Tone",
      question: "What tone should it have?",
      helpText:
        "Example: warm, simple, encouraging, funny, direct, professional.",
      required: false,
      section: "Notes",
    },
    {
      id: "avoid",
      label: "Avoid",
      question: "Is there anything you do not want included?",
      required: false,
      section: "Notes",
    },
  ],
  "marketing-plan": [],
  workshop: [],
  "email-sequence": [],
  newsletter: [],
  sop: [],
  "landing-page": [],
  "social-media-content": [],
  "sales-funnel": [],
  "course-outline": [],
  "client-onboarding": [],
  custom: [],
};

/** Catalog / picker label → guided template type id. */
export const CATALOG_LABEL_TO_CREATE_TYPE: Record<string, CreateType> = {
  "Lead Magnet": "lead-magnet",
  "Marketing Plan": "marketing-plan",
  Workshop: "workshop",
  "Email Sequence": "email-sequence",
  Newsletter: "newsletter",
  SOP: "sop",
  "Landing Page": "landing-page",
  "Social Post": "social-media-content",
  "Sales Funnel": "sales-funnel",
  "Course Outline": "course-outline",
  "Client Onboarding": "client-onboarding",
  Custom: "custom",
};

export function catalogLabelToCreateType(
  catalogLabel: string | null | undefined,
): CreateType | null {
  const label = catalogLabel?.trim();
  if (!label) return null;
  return CATALOG_LABEL_TO_CREATE_TYPE[label] ?? null;
}

export function hasGuidedTemplateFields(catalogLabel: string | null | undefined): boolean {
  const type = catalogLabelToCreateType(catalogLabel);
  if (!type) return false;
  return getTemplateFields(type).length > 0;
}

export function getTemplateFields(type: CreateType): CreateTemplateField[] {
  return CREATE_TEMPLATE_FIELDS[type] ?? [];
}

export function getRequiredFields(type: CreateType): CreateTemplateField[] {
  return getTemplateFields(type).filter((field) => field.required);
}

export function getNextRequiredField(
  type: CreateType,
  values: Record<string, string>,
): CreateTemplateField | null {
  return (
    getRequiredFields(type).find((field) => !values[field.id]?.trim()) ?? null
  );
}

export function guidedRequiredFieldsComplete(
  type: CreateType,
  values: Record<string, string>,
): boolean {
  return getRequiredFields(type).every((field) => values[field.id]?.trim());
}

export function getTemplateProgress(
  type: CreateType,
  values: Record<string, string>,
) {
  const required = getRequiredFields(type);
  const completed = required.filter((field) => values[field.id]?.trim());
  return {
    completed: completed.length,
    total: required.length,
    complete: completed.length === required.length,
  };
}
