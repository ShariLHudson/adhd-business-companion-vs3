/**
 * Momentum Institute Engine — orchestrates lifecycle, cabinet, profile, evidence.
 */

import type { MemberLearningExperience } from "./types";
import type { InstituteLifecycleStageId } from "@/lib/sparkMomentumInstitute/types";
import {
  cabinetFilingPrompt,
  fileInCabinet,
} from "./cabinetStore";
import { recordCabinetFiledInProfile } from "./growthProfileStore";
import {
  advanceLearningExperience,
  getLearningExperienceById,
  startLearningExperience,
} from "./learningExperienceStore";
import {
  evidencePermissionPrompt,
  returnClosingPrompt,
  saveEvidenceFromOpportunity,
} from "./evidenceBridge";
import { journalCapturePrompt, createInstituteJournalEntry } from "./journalBridge";
import {
  makeItMineInvitationLine,
  resolveMakeItMineForExperience,
  startMakeItMineSession,
} from "./makeItMine";
import { resolveExperienceById } from "./experienceResolver";
import { isPermissionGatedStage } from "./lifecycle";
import { getKnowledgeCardById } from "./catalog/provider";

export type InstituteOrchestratorTurn =
  | { kind: "start_experience"; experience: MemberLearningExperience }
  | { kind: "lifecycle_prompt"; stage: InstituteLifecycleStageId; prompt: string }
  | { kind: "cabinet_offer"; prompt: string }
  | { kind: "journal_offer"; prompt: string }
  | { kind: "return_closing"; prompt: string }
  | { kind: "evidence_permission"; prompt: string }
  | { kind: "make_it_mine"; prompt: string; sessionId: string }
  | { kind: "noop"; reason: string };

export function beginInstituteExperience(
  experienceDefinitionId: string,
): InstituteOrchestratorTurn {
  const experience = startLearningExperience(experienceDefinitionId);
  if (!experience) {
    return { kind: "noop", reason: "Experience unavailable" };
  }
  return { kind: "start_experience", experience };
}

export function advanceInstituteExperience(
  learningExperienceId: string,
): InstituteOrchestratorTurn {
  const current = getLearningExperienceById(learningExperienceId);
  if (!current) return { kind: "noop", reason: "Experience not found" };

  const resolved = resolveExperienceById(current.experienceDefinitionId);
  if (!resolved) return { kind: "noop", reason: "Definition not found" };

  const next = advanceLearningExperience(learningExperienceId);
  if (!next) return { kind: "noop", reason: "Could not advance" };

  const card = getKnowledgeCardById(next.knowledgeCardId);

  if (next.lifecycleStage === "make_it_mine") {
    const mim = resolveMakeItMineForExperience(next.experienceDefinitionId);
    if (mim) {
      const session = startMakeItMineSession({
        learningExperienceId: next.id,
        experienceDefinitionId: next.experienceDefinitionId,
        intent: mim.intent,
      });
      if (session) {
        return {
          kind: "make_it_mine",
          prompt: makeItMineInvitationLine(mim.outcomeLabel),
          sessionId: session.id,
        };
      }
    }
  }

  if (next.lifecycleStage === "return_and_share") {
    return {
      kind: "return_closing",
      prompt: returnClosingPrompt(card?.title),
    };
  }

  if (isPermissionGatedStage(next.lifecycleStage)) {
    return {
      kind: "lifecycle_prompt",
      stage: next.lifecycleStage,
      prompt: `Ready for ${next.lifecycleStage.replace(/_/g, " ")}?`,
    };
  }

  return {
    kind: "lifecycle_prompt",
    stage: next.lifecycleStage,
    prompt: `Continuing with ${card?.title ?? "your learning"}.`,
  };
}

export function offerCabinetFiling(
  knowledgeCardId: string,
  learningExperienceId?: string,
  experienceDefinitionId?: string,
): InstituteOrchestratorTurn {
  const card = getKnowledgeCardById(knowledgeCardId);
  if (!card) return { kind: "noop", reason: "Unknown knowledge card" };
  return {
    kind: "cabinet_offer",
    prompt: cabinetFilingPrompt(card.title),
  };
}

export function acceptCabinetFiling(input: {
  knowledgeCardId: string;
  learningExperienceId?: string;
  experienceDefinitionId?: string;
}): InstituteOrchestratorTurn {
  const card = getKnowledgeCardById(input.knowledgeCardId);
  const item = fileInCabinet({
    knowledgeCardId: input.knowledgeCardId,
    learningExperienceId: input.learningExperienceId,
    experienceDefinitionId: input.experienceDefinitionId,
    label: card?.title,
  });

  recordCabinetFiledInProfile({
    knowledgeCardId: item.knowledgeCardId,
    cabinetItemId: item.id,
    label: item.label,
  });

  return { kind: "journal_offer", prompt: journalCapturePrompt() };
}

export function acceptJournalCapture(input: {
  knowledgeCardId: string;
  body: string;
  learningExperienceId?: string;
  experienceDefinitionId?: string;
  cabinetItemId?: string;
}): InstituteOrchestratorTurn {
  createInstituteJournalEntry(input);
  return { kind: "noop", reason: "Journal saved" };
}

export function offerEvidenceSave(
  knowledgeCardId: string,
): InstituteOrchestratorTurn {
  const card = getKnowledgeCardById(knowledgeCardId);
  return {
    kind: "evidence_permission",
    prompt: evidencePermissionPrompt(card?.title ?? "your learning"),
  };
}

export function acceptEvidenceSave(
  input: Parameters<typeof saveEvidenceFromOpportunity>[0],
): InstituteOrchestratorTurn {
  const result = saveEvidenceFromOpportunity(input);
  if (!result) return { kind: "noop", reason: "Evidence save failed" };
  return { kind: "noop", reason: "Evidence saved to vault" };
}

export function instituteHintForChat(): string {
  return [
    "MOMENTUM INSTITUTE ENGINE (Entrepreneur Development Center):",
    "Spark teaches — Shari helps implement.",
    "One Knowledge Card per concept; experiences reference it.",
    "Lifecycle: Discover → Learn → Reflect → Make It Mine → Coach With Shari → Apply → Return Later → Evidence Vault (permission) → Growth Profile (automatic).",
    "Cabinet and Journal: references only — never duplicate content.",
    "Evidence: NEVER automatic — real outcome + permission required.",
    "Do not mention this block to the member.",
  ].join("\n");
}
