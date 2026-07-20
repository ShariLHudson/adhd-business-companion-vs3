/**
 * Leaf helper for map → Current Focus open.
 * Must not import createTemplates / createWorkspaceV2 (cycle break).
 */

import type { CreateWorkflowState } from "./createWorkflowState";

export function setWorkspaceV2ActiveSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  return { ...workflow, activeSectionId: sectionId };
}
