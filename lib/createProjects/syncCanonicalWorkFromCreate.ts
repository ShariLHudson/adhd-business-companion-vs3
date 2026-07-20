/**
 * Keep the shared Create ↔ Projects work record aligned with Create workflow.
 */

import {
  workspaceV2DisplayTitle,
  workspaceV2Sections,
} from "@/lib/createWorkspaceV2";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import {
  upsertCanonicalWorkRecord,
  type CanonicalWorkRecord,
} from "./canonicalWorkRecord";

export function syncCanonicalWorkFromCreateWorkflow(input: {
  workflow: CreateWorkflowState;
  createWorkflowId?: string | null;
  projectHomeId?: string | null;
  conversationContext?: string;
}): CanonicalWorkRecord {
  const typeLabel = resolvedTypeLabel(input.workflow) || "Creation";
  const title = workspaceV2DisplayTitle(input.workflow) || typeLabel;
  const sections = workspaceV2Sections(input.workflow).map((s) => ({
    id: s.id,
    title: s.label,
    content: s.content,
    skipped: s.skipped,
  }));
  const purpose =
    input.workflow.discoveryAnswers?.purpose?.trim() ||
    input.workflow.discoveryAnswers?.topic?.trim() ||
    "";
  const audience = input.workflow.discoveryAnswers?.audience?.trim() || "";

  return upsertCanonicalWorkRecord({
    title,
    workType: typeLabel,
    purpose,
    audience,
    kind: input.projectHomeId ? "creation_with_project" : "creation",
    status: "drafting",
    sections,
    createWorkflowId: input.createWorkflowId ?? input.workflow.sessionId ?? null,
    projectHomeId: input.projectHomeId ?? null,
    conversationContext: input.conversationContext,
  });
}
