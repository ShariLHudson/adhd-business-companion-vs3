/**
 * 077 / 098 — Shared map → Current Focus open. Work-type agnostic.
 * Authoritative selection via Universal Work Engine section runtime.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { selectWorkSection } from "@/lib/universalWorkEngine";

export function openWorkshopMapSection(
  workflow: CreateWorkflowState,
  sectionId: string,
): CreateWorkflowState {
  return selectWorkSection(workflow, sectionId);
}
