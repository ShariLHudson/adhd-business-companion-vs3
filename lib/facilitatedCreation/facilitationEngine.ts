/**
 * One-question-at-a-time facilitation — chat before and inside workspace.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  setWorkspaceV2ActiveSection,
  updateWorkspaceV2SectionContent,
} from "@/lib/createWorkspaceV2";
import { isCreateExplorationRequest } from "@/lib/createExplorationMode";
import { facilitationQuestionsForType } from "./facilitationBlueprint";
import {
  getFacilitatedCreationSession,
  patchFacilitatedCreationSession,
} from "./sessionStore";
import type { FacilitatedCreationSession } from "./types";
import { buildWorkspaceOpenConsentOffer } from "./workspaceConsent";
import { shouldCaptureAsFieldAnswer } from "@/lib/createExplorationMode";
import { recordUserSectionAnswer } from "@/lib/artifactState/bridge";

export type FacilitationTurnResult =
  | { kind: "none" }
  | { kind: "stay_in_chat"; hint: string }
  | { kind: "offer_workspace"; message: string }
  | {
      kind: "apply_section";
      workflow: CreateWorkflowState;
      sectionId: string;
      sectionLabel: string;
      nextPrompt: string | null;
    };

function currentQuestion(session: FacilitatedCreationSession) {
  const questions = facilitationQuestionsForType(session.artifactType);
  return questions[session.questionIndex] ?? null;
}

function nextQuestionAfter(
  session: FacilitatedCreationSession,
  index: number,
) {
  const questions = facilitationQuestionsForType(session.artifactType);
  return questions[index + 1] ?? null;
}

export function formatFacilitatedCreationChatHint(
  session: FacilitatedCreationSession | null,
  workflow?: CreateWorkflowState | null,
): string | undefined {
  if (!session) return undefined;
  const questions = facilitationQuestionsForType(session.artifactType);
  const q = currentQuestion(session);
  const lines = [
    `FACILITATED CREATION (mandatory): Shari is a master facilitator — not a content generator.`,
    `Artifact: ${session.artifactType}. Phase: ${session.phase}.`,
    "- Do NOT open or emphasize the split workspace until the member confirms or structure is clear.",
    "- Ask ONE question at a time. Wait for the answer.",
    "- Never imply the artifact is finished. Use: \"Here is what we have so far\" / \"working draft\" / \"We can keep shaping this.\"",
    "- Never say: finished, complete, final version, ready to print — unless member explicitly asks to finalize.",
    "- Member may edit any section, skip, research first, change direction, or ask to see progress.",
  ];
  if (session.phase === "workspace_active" && workflow) {
    lines.push(
      `- Workspace is open with EMPTY sections until the member answers. Update ONLY the section they just answered.`,
    );
    if (q) {
      lines.push(`- Current facilitation focus: **${q.prompt}** → section **${q.sectionId}**.`);
    }
  } else if (q) {
    lines.push(`- Next facilitation question (chat only until workspace opens): ${q.prompt}`);
  }
  lines.push(`- ${questions.length} sections in blueprint.`);
  return lines.join("\n");
}

export function processFacilitatedWorkspaceTurn(
  userText: string,
  workflow: CreateWorkflowState,
  lastAssistantText: string,
): FacilitationTurnResult {
  const session = getFacilitatedCreationSession();
  if (!session || session.phase !== "workspace_active") return { kind: "none" };
  if (isCreateExplorationRequest(userText)) return { kind: "none" };

  const trimmed = userText.trim();
  if (!trimmed || !shouldCaptureAsFieldAnswer(trimmed)) return { kind: "none" };

  const q = currentQuestion(session);
  if (!q) return { kind: "none" };

  const sectionId = q.sectionId;
  const existing = workflow.sectionContent?.[sectionId]?.trim();
  const merged = existing ? `${existing}\n\n${trimmed}` : trimmed;

  let nextWorkflow = updateWorkspaceV2SectionContent(workflow, sectionId, merged);
  nextWorkflow = setWorkspaceV2ActiveSection(nextWorkflow, sectionId);

  const nextIndex = session.questionIndex + 1;
  const nextQ = nextQuestionAfter(session, session.questionIndex);
  patchFacilitatedCreationSession({
    questionIndex: nextIndex,
    activeSectionId: sectionId,
    sectionAnswers: { ...session.sectionAnswers, [sectionId]: merged },
  });

  recordUserSectionAnswer(nextWorkflow, sectionId, merged, session);

  const sections = facilitationQuestionsForType(session.artifactType);
  const sectionLabel =
    sections.find((s) => s.sectionId === sectionId)?.prompt ?? q.prompt;

  return {
    kind: "apply_section",
    workflow: nextWorkflow,
    sectionId,
    sectionLabel: q.sectionId,
    nextPrompt: nextQ?.prompt ?? null,
  };
}

export function shouldOfferWorkspaceFromFacilitation(
  userText: string,
  session: FacilitatedCreationSession | null,
): string | null {
  if (!session || session.workspaceConsentOffered) return null;
  if (session.phase !== "facilitating") return null;
  const questions = facilitationQuestionsForType(session.artifactType);
  if (session.questionIndex < Math.min(2, questions.length)) return null;
  patchFacilitatedCreationSession({ workspaceConsentOffered: true });
  return buildWorkspaceOpenConsentOffer(session.artifactType);
}

export function facilitationOpenerForWorkspace(artifactType: string): string {
  const q = facilitationQuestionsForType(artifactType)[0];
  return (
    `Your **${artifactType}** workspace is open beside you — sections start empty.\n\n` +
    (q
      ? `Let's shape it together. ${q.prompt}`
      : "What should we work on first?")
  );
}
