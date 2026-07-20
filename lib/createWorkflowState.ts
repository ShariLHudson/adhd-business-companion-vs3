/**
 * Leaf Create workflow state — types, empty shell, and type-label helpers.
 * Safe for registry / creationRecord / createTemplates (no createSectionDiscovery).
 */

import { effectiveCreateTypeLabel } from "./createTypePickers";

export type CreateTemplateSection = { id: string; label: string };

export type DiscoverySubphase = "questions" | "sections";

export type DraftStatus = "idle" | "building" | "ready" | "error";

export type CreateQuestionMode =
  | "create_only"
  | "current_focus"
  | "split_screen";

export type CreateWorkflowStep =
  | "category"
  | "type"
  | "confirm"
  | "template"
  | "discovery"
  | "add-detail"
  | "readiness"
  | "improve"
  | "export";

export type DiscoveryQuestion = {
  id: string;
  prompt: string;
  why: string;
  placeholder?: string;
};

export type PendingFieldApproval = {
  kind: "discovery" | "section";
  questionId?: string;
  sectionId?: string;
  sectionLabel?: string;
  fieldLabel?: string;
  summary: string;
  rawAnswer: string;
};

export type CreateWorkflowState = {
  step: CreateWorkflowStep;
  categoryId: string | null;
  selectedTypeLabel: string | null;
  selectedSubtype: string | null;
  customTypeLabel: string | null;
  customSubtype: string | null;
  discoveryAnswers: Record<string, string>;
  sectionContent?: Record<string, string>;
  activeSectionId?: string | null;
  discoverySubphase?: DiscoverySubphase | null;
  pendingSectionOptions?: string[] | null;
  discoveryIndex: number;
  readinessConfirmed: boolean;
  buildApproved: boolean;
  selectedTemplateId: string | null;
  selectedTemplateName: string | null;
  templateSections: CreateTemplateSection[] | null;
  useTemplate: boolean;
  draftStatus: DraftStatus;
  draftContent: string | null;
  sessionId?: string | null;
  skippedQuestionIds?: string[];
  skippedSectionIds?: string[];
  completedSectionIds?: string[];
  completedSectionVersions?: Record<
    string,
    { content: string; completedAt: string }
  >;
  questionMode: CreateQuestionMode;
  pendingFieldApproval?: PendingFieldApproval | null;
  workspaceFirst?: boolean;
  creationWorkspaceKind?: "event" | null;
  eventRecordId?: string | null;
  focusSectionIds?: string[];
  showAllWorkspaceSections?: boolean;
  workspaceKnownFacts?: string[];
  workspaceCurrentFocus?: {
    title: string;
    reason: string;
    actionLabel: string;
    estimatedEffort?: string | null;
    assetTypeId?: string | null;
    sectionId?: string | null;
  } | null;
  workspacePhaseLabel?: string | null;
  workspaceSecondaryRecommendations?: {
    title: string;
    reason: string;
  }[];
  universalCreationState?: string | null;
  originalRequest?: string | null;
  workingIntent?: string | null;
};

export const EMPTY_CREATE_WORKFLOW: CreateWorkflowState = {
  step: "category",
  categoryId: null,
  selectedTypeLabel: null,
  selectedSubtype: null,
  customTypeLabel: null,
  customSubtype: null,
  discoveryAnswers: {},
  sectionContent: {},
  activeSectionId: null,
  discoverySubphase: null,
  pendingSectionOptions: null,
  discoveryIndex: 0,
  readinessConfirmed: false,
  buildApproved: false,
  selectedTemplateId: null,
  selectedTemplateName: null,
  templateSections: null,
  useTemplate: true,
  draftStatus: "idle",
  draftContent: null,
  questionMode: "create_only",
  pendingFieldApproval: null,
  completedSectionIds: [],
  completedSectionVersions: {},
  skippedSectionIds: [],
};

export function resolvedTypeLabel(state: CreateWorkflowState): string {
  return (
    effectiveCreateTypeLabel(state.selectedTypeLabel, state.customTypeLabel) ||
    state.selectedTypeLabel?.trim() ||
    ""
  );
}
