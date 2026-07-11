/** Executive Resources Center — single authoritative location for external resources. */

import type { ResourceDepartment } from "./resources";
import type { ExecutiveSearchArchitectureView } from "./executiveSearch";

export type { ResourceDepartment, ResourceDepartmentId, ExecutiveResourceItem } from "./resources";
export type { ExecutiveSearchScope, ExecutiveSearchScopeId, ExecutiveSearchArchitectureView } from "./executiveSearch";
export {
  EXECUTIVE_SEARCH_HEADLINE,
  EXECUTIVE_SEARCH_SCOPES,
  EXECUTIVE_SEARCH_SUMMARY,
  composeExecutiveSearchArchitecture,
} from "./executiveSearch";

export type ExecutiveResourceAdmissionQuestionId =
  | "weekly-use"
  | "saves-time"
  | "ecosystem-contribution"
  | "resources-center"
  | "founder-understanding";

export type ExecutiveResourceAdmissionQuestion = {
  id: ExecutiveResourceAdmissionQuestionId;
  question: string;
};

export const EXECUTIVE_RESOURCES_CENTER_HEADLINE =
  "Executive Resources Center";

export const EXECUTIVE_RESOURCES_CENTER_SUMMARY =
  "The single authoritative location for external systems, AI tools, calendars, documents, dashboards, and executive links. Do not scatter important resources throughout Founder.";

export const EXECUTIVE_RESOURCE_ADMISSION_RULE =
  "Whenever a new external tool becomes important to Visual Spark Studios, all five questions must be YES before it is added here.";

export const EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS: readonly ExecutiveResourceAdmissionQuestion[] =
  [
    { id: "weekly-use", question: "Does Shari use this at least weekly?" },
    { id: "saves-time", question: "Does it save time?" },
    { id: "ecosystem-contribution", question: "Does it contribute to the Spark ecosystem?" },
    {
      id: "resources-center",
      question: "Should it be available from the Executive Resources Center?",
    },
    {
      id: "founder-understanding",
      question: "Does Founder need to understand what this tool does?",
    },
  ] as const;

export type ExecutiveResourcesCenterView = {
  product: "founder";
  generatedAt: string;
  headline: string;
  summary: string;
  admissionRule: string;
  admissionQuestions: readonly ExecutiveResourceAdmissionQuestion[];
  integrationCenterHref: string;
  knowledgeVaultHref: string;
  masterLibraryHref: string;
  departments: readonly ResourceDepartment[];
  executiveSearch: ExecutiveSearchArchitectureView;
};

export function evaluateExecutiveResourceAdmission(
  answers: readonly boolean[],
): boolean {
  if (answers.length !== EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS.length) {
    return false;
  }
  return answers.every(Boolean);
}
