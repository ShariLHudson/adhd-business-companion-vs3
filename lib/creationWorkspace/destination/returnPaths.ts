/**
 * Return paths from destination experiences back to Creation Workspace.
 */

import type { CreationWorkspaceReturnContext } from "./contracts";
import { peekReturnContext, storeReturnContext } from "./storage";

export type DestinationReturnAction = {
  id: "return_to_creation_workspace" | "view_source_research" | "view_original_request";
  label: string;
  workspaceId: string | null;
  researchCollectionIds: string[];
  activeSectionId: string | null;
};

export function resolveDestinationReturnActions(input?: {
  returnContext?: CreationWorkspaceReturnContext | null;
  researchCollectionIds?: string[];
  includeOriginalRequest?: boolean;
}): DestinationReturnAction[] {
  const ctx = input?.returnContext ?? peekReturnContext();
  const actions: DestinationReturnAction[] = [
    {
      id: "return_to_creation_workspace",
      label: ctx?.label || "Return to Creation Workspace",
      workspaceId: ctx?.workspaceId ?? null,
      researchCollectionIds: [],
      activeSectionId: ctx?.activeSectionId ?? null,
    },
  ];
  if ((input?.researchCollectionIds?.length ?? 0) > 0) {
    actions.push({
      id: "view_source_research",
      label: "View Source Research",
      workspaceId: ctx?.workspaceId ?? null,
      researchCollectionIds: [...(input?.researchCollectionIds ?? [])],
      activeSectionId: null,
    });
  }
  if (input?.includeOriginalRequest) {
    actions.push({
      id: "view_original_request",
      label: "View Original Request",
      workspaceId: ctx?.workspaceId ?? null,
      researchCollectionIds: [],
      activeSectionId: null,
    });
  }
  return actions;
}

export function rememberReturnContext(
  ctx: CreationWorkspaceReturnContext,
): void {
  storeReturnContext(ctx);
}
