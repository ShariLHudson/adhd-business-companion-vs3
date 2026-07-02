/**
 * Bridge — sync artifact state from Create workflow + facilitated session.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { FacilitatedCreationSession } from "@/lib/facilitatedCreation/types";
import { facilitationQuestionsForType } from "@/lib/facilitatedCreation/facilitationBlueprint";
import {
  applyManualEditToSection,
  applyUserAnswerToSection,
  artifactFromWorkflow,
  syncQuestionsFromBlueprint,
} from "./artifactModel";
import { getActiveArtifact, setActiveArtifact } from "./store";
import type { Artifact, ArtifactQuestion } from "./types";
import { finalizeBlockedLanguage, workingDraftLanguageRules } from "./finalizeGate";
import { artifactContinuityHint } from "./continuity";

export function syncArtifactFromWorkflow(
  workflow: CreateWorkflowState,
  session?: FacilitatedCreationSession | null,
): Artifact {
  const existing = getActiveArtifact();
  const facilitatedPhase =
    session?.phase === "workspace_active"
      ? "workspace_active"
      : session?.phase === "facilitating"
        ? "facilitating"
        : session?.phase === "exploring"
          ? "exploring"
          : undefined;

  let artifact = artifactFromWorkflow(workflow, {
    facilitatedPhase,
    existing,
  });

  if (session?.artifactType) {
    const questions: ArtifactQuestion[] = facilitationQuestionsForType(
      session.artifactType,
    ).map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      prompt: q.prompt,
      answered: Boolean(workflow.sectionContent?.[q.sectionId]?.trim()),
      revisitRequested: artifact.revisitSectionIds.includes(q.sectionId),
    }));
    artifact = syncQuestionsFromBlueprint(artifact, questions);
  }

  setActiveArtifact(artifact);
  return artifact;
}

export function recordUserSectionAnswer(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
  session?: FacilitatedCreationSession | null,
): Artifact {
  const existing = syncArtifactFromWorkflow(workflow, session);
  const artifact = applyUserAnswerToSection(existing, sectionId, content);
  setActiveArtifact(artifact);
  return artifact;
}

export function recordManualSectionEdit(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
): Artifact {
  const existing = syncArtifactFromWorkflow(workflow);
  const artifact = applyManualEditToSection(existing, sectionId, content);
  setActiveArtifact(artifact);
  return artifact;
}

export function formatArtifactStateChatHint(
  artifact: Artifact | null,
): string | undefined {
  if (!artifact) return undefined;
  const filled = artifact.sections.filter(
    (s) => s.skipped || s.content.trim(),
  ).length;
  const lines = [
    `ARTIFACT STATE: ${artifact.type} — status **${artifact.status}**.`,
    `Sections: ${artifact.sections.length} (${filled} with content).`,
    "- Track answered_by_user vs drafted_by_shari — member must know what is theirs.",
    finalizeBlockedLanguage(),
    workingDraftLanguageRules(),
    artifactContinuityHint(artifact),
  ].filter(Boolean);
  return lines.join("\n");
}

export function getArtifactForChat(): Artifact | null {
  return getActiveArtifact();
}
