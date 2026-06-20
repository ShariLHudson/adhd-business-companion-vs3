import {
  catalogLabelToCreateType,
  getRequiredFields,
  getTemplateFields,
  hasGuidedTemplateFields,
  type CreateTemplateField,
} from "./createTemplateFields";
import type { DiscoveryQuestion } from "./createWorkflow";

export function templateFieldToDiscoveryQuestion(
  field: CreateTemplateField,
): DiscoveryQuestion {
  return {
    id: field.id,
    prompt: field.question,
    why: field.helpText ?? "",
    placeholder: field.helpText,
  };
}

export function guidedDiscoveryQuestions(
  typeLabel: string,
): DiscoveryQuestion[] | null {
  const type = catalogLabelToCreateType(typeLabel);
  if (!type) return null;
  const fields = getTemplateFields(type);
  if (!fields.length) return null;
  return fields.map(templateFieldToDiscoveryQuestion);
}

export function guidedRequiredDiscoveryQuestions(
  typeLabel: string,
): DiscoveryQuestion[] | null {
  const type = catalogLabelToCreateType(typeLabel);
  if (!type) return null;
  const fields = getRequiredFields(type);
  if (!fields.length) return null;
  return fields.map(templateFieldToDiscoveryQuestion);
}

export { hasGuidedTemplateFields, catalogLabelToCreateType };
