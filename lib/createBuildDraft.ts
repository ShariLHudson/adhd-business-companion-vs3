/**
 * Shared Create draft build — same entry point for create-only and split-screen.
 */

import type { CreateWorkflowState } from "./createWorkflow";
import { logCreateBuild } from "./createBuild";

export type CreateQuestionMode = "create_only" | "split_screen";

export type CreateBuildDraftParams = {
  brief: string;
  type: string;
  workflow: CreateWorkflowState;
  /** True when triggered from Shari Chat beside Create. */
  fromChat?: boolean;
  mode?: CreateQuestionMode;
};

export type CreateBuildDraftHandler = (
  params: CreateBuildDraftParams,
) => Promise<boolean>;

export function logChatBuildDraftTriggered(
  params: Pick<CreateBuildDraftParams, "type" | "workflow" | "mode">,
): void {
  logCreateBuild("chatBuildDraftTriggered", {
    itemType: params.type,
    mode: params.mode ?? params.workflow.questionMode ?? "split_screen",
    sessionId: params.workflow.sessionId ?? "local",
  });
}

export function logSharedBuildDraftCalled(
  params: Pick<CreateBuildDraftParams, "type" | "fromChat" | "mode">,
): void {
  logCreateBuild("sharedBuildDraftCalled", {
    itemType: params.type,
    fromChat: params.fromChat ?? false,
    mode: params.mode ?? "split_screen",
  });
}

export function logDraftGenerated(itemType: string, length: number): void {
  logCreateBuild("draftGenerated", { itemType, length });
}

export function logDraftRenderedInWorkspace(itemType: string, length: number): void {
  logCreateBuild("draftRenderedInWorkspace", { itemType, length });
}

export function logDraftGenerationFailed(
  itemType: string,
  message: string,
): void {
  logCreateBuild("draftGenerationFailed", { itemType, message });
}
