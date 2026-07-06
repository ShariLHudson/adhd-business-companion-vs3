import { composeAiExtensionsCenterView } from "@/lib/founderAiExtensions";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import {
  EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS,
  EXECUTIVE_RESOURCE_ADMISSION_RULE,
  EXECUTIVE_RESOURCES_CENTER_HEADLINE,
  EXECUTIVE_RESOURCES_CENTER_SUMMARY,
} from "../types";
import type { ExecutiveResourcesCenterView } from "../types";

export function composeExecutiveResourcesCenterView(): ExecutiveResourcesCenterView & {
  aiExtensions: ReturnType<typeof composeAiExtensionsCenterView>;
} {
  return {
    product: "founder",
    generatedAt: new Date().toISOString(),
    headline: EXECUTIVE_RESOURCES_CENTER_HEADLINE,
    summary: EXECUTIVE_RESOURCES_CENTER_SUMMARY,
    admissionRule: EXECUTIVE_RESOURCE_ADMISSION_RULE,
    admissionQuestions: EXECUTIVE_RESOURCE_ADMISSION_QUESTIONS,
    integrationCenterHref: `${FOUNDER_STUDIO_BASE}/executive-integration-center`,
    knowledgeVaultHref: `${FOUNDER_STUDIO_BASE}/founder-knowledge-vault`,
    aiExtensions: composeAiExtensionsCenterView(),
  };
}
