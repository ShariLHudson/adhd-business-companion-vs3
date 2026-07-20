/**
 * 077 — Shared map → Current Focus open. Work-type agnostic.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { setWorkspaceV2ActiveSection } from "@/lib/createWorkspaceV2";

export function openWorkshopMapSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  const id = sectionId.trim();
  if (!id) return workflow;
  return setWorkspaceV2ActiveSection(
    {
      ...workflow,
      showAllWorkspaceSections: true,
      workspaceFirst: true,
    },
    id,
  );
}
