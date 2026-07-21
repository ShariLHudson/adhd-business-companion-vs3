/**
 * Shared Create session — chat and workspace read/write the same workflow state.
 */

import { allocateCanonicalWorkId } from "@/lib/universalWorkEngine";
import { logCreateBuild } from "./createBuild";
import {
  answeredDiscoveryCount,
  discoveryComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "./createWorkflow";

export type SharedCreateSessionSnapshot = {
  sessionId: string;
  mode: "create_only" | "split_screen";
  itemType: string;
  subtype: string | null;
  templateId: string | null;
  templateStructure: CreateWorkflowState["templateSections"];
  questionsAsked: number;
  answersGiven: Record<string, string>;
  readyToBuild: boolean;
  buildRequested: boolean;
  draftStatus: CreateWorkflowState["draftStatus"];
  draftContent: string;
  errorMessage: string | null;
};

export function snapshotSharedCreateSession(
  workflow: CreateWorkflowState,
  sessionId?: string | null,
): SharedCreateSessionSnapshot {
  const itemType = resolvedTypeLabel(workflow);
  const mode =
    workflow.questionMode === "split_screen" ? "split_screen" : "create_only";
  return {
    sessionId: sessionId ?? workflow.sessionId ?? "local",
    mode,
    itemType,
    subtype: workflow.selectedSubtype ?? workflow.customSubtype ?? null,
    templateId: workflow.selectedTemplateId ?? null,
    templateStructure: workflow.templateSections ?? null,
    questionsAsked: answeredDiscoveryCount(workflow),
    answersGiven: { ...workflow.discoveryAnswers },
    readyToBuild:
      workflow.step === "readiness" ||
      workflow.step === "add-detail" ||
      discoveryComplete(itemType, workflow),
    buildRequested:
      workflow.draftStatus === "building" || workflow.readinessConfirmed === true,
    draftStatus: workflow.draftStatus,
    draftContent: workflow.draftContent ?? "",
    errorMessage: workflow.draftStatus === "error" ? "generation-failed" : null,
  };
}

export function logSharedCreateSession(
  message: string,
  workflow: CreateWorkflowState,
  sessionId?: string | null,
  extra?: Record<string, unknown>,
): void {
  const snap = snapshotSharedCreateSession(workflow, sessionId);
  logCreateBuild(message, { ...snap, ...extra });
}

export function newCreateSessionId(): string {
  return allocateCanonicalWorkId({ origin: "create" });
}

export function withSharedSessionId(
  workflow: CreateWorkflowState,
  sessionId?: string | null,
): CreateWorkflowState {
  if (!sessionId || workflow.sessionId === sessionId) return workflow;
  return { ...workflow, sessionId };
}
