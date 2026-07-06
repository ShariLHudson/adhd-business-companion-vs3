/** Founder Studio™ marketing orchestration — PostCraft creates · GHL delivers */

export const MARKETING_ORCHESTRATION_HEADLINE = "Founder decides · PostCraft creates · GoHighLevel delivers";

export const MARKETING_ORCHESTRATION_SUMMARY =
  "Founder makes recommendations, prepares everything, and coordinates PostCraft and GoHighLevel — then receives status and analytics back.";

export type MarketingOrchestrationStep = {
  id: string;
  label: string;
};

export type MarketingDepartmentRole = {
  id: "postcraft" | "gohighlevel";
  name: string;
  responsibilities: readonly string[];
};

export const MARKETING_ORCHESTRATION_STEPS: readonly MarketingOrchestrationStep[] = [
  { id: "founder-studio", label: "Founder Studio™" },
  { id: "recommendations", label: "Makes recommendations" },
  { id: "prepares", label: "Prepares everything" },
] as const;

export const POSTCRAFT_DEPARTMENT: MarketingDepartmentRole = {
  id: "postcraft",
  name: "PostCraft™",
  responsibilities: [
    "Creates content",
    "Creates campaigns",
    "Stores content assets",
  ],
};

export const GHL_DEPARTMENT: MarketingDepartmentRole = {
  id: "gohighlevel",
  name: "GoHighLevel",
  responsibilities: [
    "Builds workflows",
    "Email campaigns",
    "Funnels",
    "CRM",
    "Memberships",
    "Automations",
  ],
};

export const MARKETING_FEEDBACK_STEP = {
  id: "feedback",
  label: "Founder receives status and analytics back.",
} as const;

export const MARKETING_ORCHESTRATION_FLOW = {
  headline: MARKETING_ORCHESTRATION_HEADLINE,
  summary: MARKETING_ORCHESTRATION_SUMMARY,
  steps: MARKETING_ORCHESTRATION_STEPS,
  departments: [POSTCRAFT_DEPARTMENT, GHL_DEPARTMENT] as const,
  feedback: MARKETING_FEEDBACK_STEP,
} as const;
