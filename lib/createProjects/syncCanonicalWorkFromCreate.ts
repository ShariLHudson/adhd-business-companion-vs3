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
  resolveActiveSectionId,
  resolveWorkIdFromWorkflow,
} from "@/lib/universalWorkEngine";
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
  const workId =
    resolveWorkIdFromWorkflow(input.workflow) ||
    input.createWorkflowId ||
    input.workflow.sessionId ||
    undefined;

  return upsertCanonicalWorkRecord({
    id: workId,
    title,
    workType: typeLabel,
    purpose,
    audience,
    kind: input.projectHomeId ? "creation_with_project" : "creation",
    status: input.workflow.assembledOutput && !input.workflow.assembledOutput.stale
      ? "complete"
      : "drafting",
    sections,
    createWorkflowId: input.createWorkflowId ?? input.workflow.sessionId ?? null,
    projectHomeId: input.projectHomeId ?? null,
    conversationContext: input.conversationContext,
    activeSectionId: resolveActiveSectionId(input.workflow),
    assembledBody: input.workflow.assembledOutput?.body ?? null,
    assembledStale: input.workflow.assembledOutput?.stale ?? false,
  });
}
