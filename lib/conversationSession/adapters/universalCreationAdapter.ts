/**
 * Pass 2 — Universal Creation adapter (dual-write; UC store is not the owner).
 */

import { pluginById } from "@/lib/universalCreation/documentRegistry";
import type {
  UniversalCreationPhase,
  UniversalCreationSession,
} from "@/lib/universalCreation/types";
import { isUniversalDiscoveryComplete } from "@/lib/universalCreation/types";
import {
  applyConversationSessionPatch,
  getOrCreateConversationSession,
  isConversationSessionSpineEnabled,
} from "../store";
import type {
  AnsweredQuestion,
  ConversationSession,
  CreationMode,
  StudioReadinessLevel,
} from "../types";
import { setActiveArtifact } from "../pauseResume";

function creationModeFromPhase(phase: UniversalCreationPhase): CreationMode {
  if (phase === "discovery") return "discovery";
  if (phase === "preparation" || phase === "guided_creation") return "guided";
  return "guided";
}

function studioReadinessFromSession(uc: UniversalCreationSession): StudioReadinessLevel {
  if (uc.draftContent?.trim()) return 4;
  if (isUniversalDiscoveryComplete(uc.confidence)) return 3;
  if (uc.confidence.score > 0) return 2;
  return 1;
}

function answeredQuestionsFromUniversalCreation(
  uc: UniversalCreationSession,
): AnsweredQuestion[] {
  const plugin = pluginById(uc.documentType);
  const now = new Date().toISOString();
  const out: AnsweredQuestion[] = [];

  for (const q of plugin.discoveryQuestions) {
    const answer = uc.answers[q.id]?.trim();
    if (!answer) continue;
    out.push({
      slot: q.slot,
      questionId: q.id,
      answer,
      answeredAt: now,
    });
  }

  for (const [key, val] of Object.entries(uc.answers)) {
    if (!val?.trim()) continue;
    if (out.some((a) => a.questionId === key)) continue;
    out.push({ slot: key, questionId: key, answer: val.trim(), answeredAt: now });
  }

  return out;
}

function mergeAnsweredQuestions(
  existing: AnsweredQuestion[],
  incoming: AnsweredQuestion[],
): AnsweredQuestion[] {
  const byKey = new Map<string, AnsweredQuestion>();
  for (const q of existing) {
    byKey.set(q.questionId ?? q.slot, q);
  }
  for (const q of incoming) {
    byKey.set(q.questionId ?? q.slot, q);
  }
  return [...byKey.values()];
}

/** Dual-write: mirror Universal Creation session into Conversation Session. */
export function syncUniversalCreationToSession(
  uc: UniversalCreationSession,
): ConversationSession | null {
  if (!isConversationSessionSpineEnabled()) return null;

  const base = getOrCreateConversationSession();
  const plugin = pluginById(uc.documentType);
  const incomingAnswers = answeredQuestionsFromUniversalCreation(uc);
  const mergedAnswers = mergeAnsweredQuestions(base.answeredQuestions, incomingAnswers);
  const readiness = studioReadinessFromSession(uc);

  const patch: Partial<ConversationSession> = {
    currentIntent: "create",
    currentNeed: uc.originalUserText,
    creationMode: creationModeFromPhase(uc.phase),
    universalCreationDocumentType: uc.documentType,
    universalCreationPhase: uc.phase,
    answeredQuestions: mergedAnswers,
    studioReadinessLevel: Math.max(base.studioReadinessLevel, readiness) as StudioReadinessLevel,
    draftContent: uc.draftContent ?? base.draftContent,
    currentStage:
      uc.phase === "review" || uc.phase === "approval"
        ? "review"
        : isUniversalDiscoveryComplete(uc.confidence)
          ? "creating"
          : "exploring",
    currentStudio: plugin.createItemType,
  };

  const next = applyConversationSessionPatch(patch);

  setActiveArtifact({
    itemType: plugin.createItemType,
    title: `New ${plugin.label}`,
    draftContent: uc.draftContent,
    documentType: uc.documentType,
  });

  return next;
}

/** Studio handoff — sync discovery; conversation continues (do not clear UC). */
export function syncUniversalCreationHandoffToSession(
  uc: UniversalCreationSession,
): ConversationSession | null {
  if (!isConversationSessionSpineEnabled()) return null;

  syncUniversalCreationToSession(uc);
  return applyConversationSessionPatch({
    studioReadinessLevel: Math.max(
      loadReadinessFloor(uc),
      3,
    ) as StudioReadinessLevel,
    currentStage: "creating",
    creationMode: "guided",
  });
}

function loadReadinessFloor(uc: UniversalCreationSession): StudioReadinessLevel {
  return studioReadinessFromSession(uc);
}
