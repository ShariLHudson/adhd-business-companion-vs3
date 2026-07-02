/**
 * Artifact state — create, update, resolve status.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import {
  resolveTemplateSections,
  type CreateTemplateSection,
} from "@/lib/createTemplates";
import { workspaceV2DisplayTitle } from "@/lib/createWorkspaceV2";
import type {
  Artifact,
  ArtifactQuestion,
  ArtifactRevision,
  ArtifactSection,
  ArtifactSectionStatus,
  ArtifactSource,
  ArtifactStatus,
} from "./types";

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyArtifact(
  type: string,
  sections: CreateTemplateSection[],
  opts?: { workflowSessionId?: string | null },
): Artifact {
  const now = new Date().toISOString();
  return {
    id: newId("artifact"),
    type,
    title: type,
    status: "exploring",
    sections: sections.map((s) => emptySection(s)),
    questions: [],
    revisions: [],
    pausedFromSection: null,
    pauseReason: null,
    revisitSectionIds: [],
    createdAt: now,
    updatedAt: now,
    finalizedAt: null,
    workflowSessionId: opts?.workflowSessionId ?? null,
    intelligence: {
      originatedFromKind: "conversation",
      intelligenceMeta: { artifactType: type },
    },
  };
}

function emptySection(s: CreateTemplateSection): ArtifactSection {
  return {
    id: s.id,
    label: s.label,
    status: "not_started",
    content: "",
    primarySource: "template",
    skipped: false,
    unsure: false,
    activeRevisionId: null,
  };
}

export function artifactFromWorkflow(
  workflow: CreateWorkflowState,
  opts?: {
    facilitatedPhase?: "exploring" | "facilitating" | "workspace_active";
    existing?: Artifact | null;
  },
): Artifact {
  const type = resolvedTypeLabel(workflow) || workflow.selectedTypeLabel || "Artifact";
  const templateSections = resolveTemplateSections(workflow) ?? [];
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  const content = workflow.sectionContent ?? {};
  const existingById = new Map(
    (opts?.existing?.sections ?? []).map((s) => [s.id, s]),
  );
  const existingRevisions = opts?.existing?.revisions ?? [];

  const sections: ArtifactSection[] = templateSections.map((tpl) => {
    const prev = existingById.get(tpl.id);
    const text = content[tpl.id]?.trim() ?? "";
    const isSkipped = skipped.has(tpl.id);
    const isActive = workflow.activeSectionId === tpl.id;

    if (isSkipped) {
      return {
        id: tpl.id,
        label: tpl.label,
        status: "approved",
        content: "",
        primarySource: prev?.primarySource ?? "user",
        skipped: true,
        unsure: prev?.unsure ?? false,
        activeRevisionId: prev?.activeRevisionId ?? null,
      };
    }

    if (!text) {
      return {
        id: tpl.id,
        label: tpl.label,
        status: isActive ? "in_progress" : "not_started",
        content: "",
        primarySource: "template",
        skipped: false,
        unsure: prev?.unsure ?? false,
        activeRevisionId: null,
      };
    }

    const status = resolveSectionStatusFromSources(
      prev,
      text,
      workflow,
      tpl.id,
    );

    return {
      id: tpl.id,
      label: tpl.label,
      status,
      content: text,
      primarySource: prev?.primarySource ?? inferSourceFromStatus(status),
      skipped: false,
      unsure: prev?.unsure ?? false,
      activeRevisionId: prev?.activeRevisionId ?? null,
    };
  });

  const artifact: Artifact = {
    id: opts?.existing?.id ?? newId("artifact"),
    type,
    title: workspaceV2DisplayTitle(workflow),
    status: resolveArtifactStatus({
      sections,
      workflow,
      facilitatedPhase: opts?.facilitatedPhase,
      pausedFromSection: opts?.existing?.pausedFromSection ?? null,
      priorStatus: opts?.existing?.status,
    }),
    sections,
    questions: opts?.existing?.questions ?? [],
    revisions: existingRevisions,
    pausedFromSection: opts?.existing?.pausedFromSection ?? null,
    pauseReason: opts?.existing?.pauseReason ?? null,
    revisitSectionIds: opts?.existing?.revisitSectionIds ?? [],
    createdAt: opts?.existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    finalizedAt: opts?.existing?.finalizedAt ?? null,
    workflowSessionId: workflow.sessionId ?? opts?.existing?.workflowSessionId ?? null,
    intelligence: opts?.existing?.intelligence ?? {
      originatedFromKind: "conversation",
      intelligenceMeta: { artifactType: type },
    },
  };

  return artifact;
}

function inferSourceFromStatus(status: ArtifactSectionStatus): ArtifactSource {
  switch (status) {
    case "drafted_by_shari":
      return "shari_suggestion";
    case "user_edited":
      return "manual_edit";
    case "answered_by_user":
      return "user";
    default:
      return "user";
  }
}

function resolveSectionStatusFromSources(
  prev: ArtifactSection | undefined,
  text: string,
  workflow: CreateWorkflowState,
  sectionId: string,
): ArtifactSectionStatus {
  if (prev?.unsure) return "needs_review";
  if (workflow.draftStatus === "ready" && workflow.buildApproved) {
    return prev?.status === "approved" ? "approved" : "needs_review";
  }
  if (prev?.status === "drafted_by_shari" && text !== prev.content) {
    return "user_edited";
  }
  if (prev?.status === "answered_by_user" && text !== prev.content) {
    return "user_edited";
  }
  if (prev?.primarySource === "shari_suggestion") return "drafted_by_shari";
  if (workflow.activeSectionId === sectionId) return "in_progress";
  if (prev?.status === "answered_by_user") return "answered_by_user";
  return "answered_by_user";
}

export function resolveArtifactStatus(input: {
  sections: ArtifactSection[];
  workflow?: CreateWorkflowState | null;
  facilitatedPhase?: "exploring" | "facilitating" | "workspace_active";
  pausedFromSection?: AppSection | null;
  priorStatus?: ArtifactStatus;
}): ArtifactStatus {
  if (input.priorStatus === "finalized") return "finalized";
  if (input.priorStatus === "saved") return "saved";
  if (input.pausedFromSection) return "paused";

  const { sections, workflow, facilitatedPhase } = input;
  const filled = sections.filter(
    (s) => s.skipped || s.content.trim(),
  ).length;
  const needsReview = sections.some(
    (s) => s.status === "needs_review" || s.unsure,
  );
  const allApproved =
    sections.length > 0 &&
    sections.every(
      (s) => s.skipped || s.status === "approved" || (s.content.trim() && !s.unsure),
    );

  if (workflow?.buildApproved && workflow.draftStatus === "ready") {
    if (allApproved && !needsReview) return "ready_to_finalize";
    return "needs_review";
  }

  if (needsReview) return "needs_review";
  if (filled === 0) {
    if (facilitatedPhase === "workspace_active") return "building";
    if (facilitatedPhase === "facilitating") return "ready_to_build";
    return "exploring";
  }
  if (filled > 0) return "working_draft";
  return "building";
}

export function applyUserAnswerToSection(
  artifact: Artifact,
  sectionId: string,
  content: string,
): Artifact {
  const revision = addRevision(artifact, sectionId, content, "user");
  return patchSection(artifact, sectionId, {
    content,
    status: "answered_by_user",
    primarySource: "user",
    activeRevisionId: revision.id,
    unsure: false,
  });
}

export function applyShariSuggestionToSection(
  artifact: Artifact,
  sectionId: string,
  content: string,
): Artifact {
  const revision = addRevision(artifact, sectionId, content, "shari_suggestion");
  return patchSection(artifact, sectionId, {
    content,
    status: "drafted_by_shari",
    primarySource: "shari_suggestion",
    activeRevisionId: revision.id,
  });
}

export function applyManualEditToSection(
  artifact: Artifact,
  sectionId: string,
  content: string,
): Artifact {
  const revision = addRevision(artifact, sectionId, content, "manual_edit");
  return patchSection(artifact, sectionId, {
    content,
    status: "user_edited",
    primarySource: "manual_edit",
    activeRevisionId: revision.id,
  });
}

function addRevision(
  artifact: Artifact,
  sectionId: string,
  content: string,
  source: ArtifactSource,
  label?: string,
): ArtifactRevision {
  const revision: ArtifactRevision = {
    id: newId("rev"),
    sectionId,
    content,
    source,
    createdAt: new Date().toISOString(),
    label,
  };
  artifact.revisions.push(revision);
  return revision;
}

function patchSection(
  artifact: Artifact,
  sectionId: string,
  patch: Partial<ArtifactSection>,
): Artifact {
  const sections = artifact.sections.map((s) =>
    s.id === sectionId ? { ...s, ...patch } : s,
  );
  return {
    ...artifact,
    sections,
    status: resolveArtifactStatus({
      sections,
      priorStatus: artifact.status,
      pausedFromSection: artifact.pausedFromSection,
    }),
    updatedAt: new Date().toISOString(),
  };
}

export function markSectionSkipped(
  artifact: Artifact,
  sectionId: string,
): Artifact {
  return patchSection(artifact, sectionId, {
    skipped: true,
    status: "approved",
    content: "",
  });
}

export function markSectionUnsure(
  artifact: Artifact,
  sectionId: string,
): Artifact {
  return patchSection(artifact, sectionId, {
    unsure: true,
    status: "needs_review",
  });
}

export function clearSection(
  artifact: Artifact,
  sectionId: string,
): Artifact {
  return patchSection(artifact, sectionId, {
    content: "",
    status: "not_started",
    primarySource: "template",
    unsure: false,
    activeRevisionId: null,
  });
}

export function requestSectionRevisit(
  artifact: Artifact,
  sectionId: string,
): Artifact {
  const revisit = new Set(artifact.revisitSectionIds);
  revisit.add(sectionId);
  return {
    ...artifact,
    revisitSectionIds: [...revisit],
    updatedAt: new Date().toISOString(),
  };
}

export function keepBothSectionOptions(
  artifact: Artifact,
  sectionId: string,
  optionA: string,
  optionB: string,
): Artifact {
  const revA = addRevision(artifact, sectionId, optionA, "user", "Option A");
  addRevision(artifact, sectionId, optionB, "shari_suggestion", "Option B");
  return patchSection(artifact, sectionId, {
    content: `${optionA}\n\n---\n\n${optionB}`,
    status: "needs_review",
    primarySource: "user",
    activeRevisionId: revA.id,
  });
}

export function syncQuestionsFromBlueprint(
  artifact: Artifact,
  questions: ArtifactQuestion[],
): Artifact {
  return { ...artifact, questions };
}
