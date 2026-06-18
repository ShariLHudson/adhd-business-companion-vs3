/**
 * Maps discovery answers into template sections for the split-screen Create workspace.
 */

import {
  discoveryQuestionProgress,
  discoveryQuestionsForState,
  discoveryComplete,
  readinessSummary,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "./createWorkflow";
import { resolveTemplateName } from "./createTemplates";
import {
  buildOutlineSectionStatuses,
  incompleteTemplateSections,
  isInSectionDiscoveryPhase,
} from "./createSectionDiscovery";

export type DiscoveryWorkspaceSection = {
  id: string;
  label: string;
  content: string | null;
  status: "empty" | "partial" | "filled";
};

export type DiscoveryWorkspaceView = {
  itemType: string;
  templateName: string | null;
  progress: { current: number; total: number };
  currentQuestion: string | null;
  incompleteSectionLabels: string[];
  collectedAnswers: { label: string; value: string }[];
  templateSections: DiscoveryWorkspaceSection[];
  isReady: boolean;
};

export function buildDiscoveryWorkspaceView(
  workflow: CreateWorkflowState,
): DiscoveryWorkspaceView | null {
  const typeLabel = resolvedTypeLabel(workflow);
  if (!typeLabel) return null;

  const progress = discoveryQuestionProgress(typeLabel, workflow);
  const current = discoveryQuestionsForState(typeLabel, workflow);
  const templateSections = buildOutlineSectionStatuses(typeLabel, workflow);
  const incomplete = incompleteTemplateSections(workflow);

  const currentQuestion = isInSectionDiscoveryPhase(workflow)
    ? workflow.activeSectionId
      ? templateSections.find((s) => s.id === workflow.activeSectionId)?.label ??
        null
      : incomplete.length
        ? `Which section next? (${incomplete.map((s) => s.label).join(", ")})`
        : null
    : (current?.prompt ?? null);

  return {
    itemType: typeLabel,
    templateName: workflow.useTemplate ? resolveTemplateName(workflow) : null,
    progress,
    currentQuestion,
    incompleteSectionLabels: incomplete.map((s) => s.label),
    collectedAnswers: readinessSummary(typeLabel, workflow.discoveryAnswers),
    templateSections,
    isReady:
      workflow.step === "readiness" ||
      workflow.step === "add-detail" ||
      discoveryComplete(typeLabel, workflow),
  };
}
