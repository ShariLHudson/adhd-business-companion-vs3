/**
 * Map continuity manifest rows to resume eligibility signals.
 */

import type { IdealClientAvatar } from "./companionStore";
import { getAvatars, getProjectItems, getProjects } from "./companionStore";
import { loadCreateSession } from "./createSessionStore";
import {
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
} from "./createWorkflowRecordStore";
import type { ContinuityItemType, ContinuityManifestItem } from "./continuityManifest";
import { loadDecisionCompassSession } from "./decisionCompassSessionStore";
import { loadStrategyApplySession } from "./strategyApplySessionStore";
import {
  pickMostRecentEligibleResume,
  type ResumeWorkKind,
  type ResumeWorkSignal,
} from "./resumeWorkEligibility";
import { loadWorkspaceSessionMeta } from "./workspaceSessionStore";

function charCount(...parts: (string | null | undefined)[]): number {
  return parts.map((part) => part?.trim() ?? "").join("").length;
}

function countAnsweredFields(answers: Record<string, string>): number {
  return Object.values(answers).filter((value) => value?.trim()).length;
}

export function mapContinuityTypeToResumeKind(
  type: ContinuityItemType,
): ResumeWorkKind {
  switch (type) {
    case "create-draft":
    case "create-saved-for-later":
      return "create";
    case "decision-compass":
      return "decision-compass";
    case "project":
      return "project";
    case "strategy-apply":
      return "strategy-apply";
    case "workspace-sop":
      return "workspace-sop";
    case "client-avatar":
      return "create";
    default:
      return "create";
  }
}

function avatarContentChars(avatar: IdealClientAvatar): number {
  return charCount(
    avatar.who,
    avatar.painPoints,
    avatar.goals,
    avatar.solution,
    avatar.objections,
    avatar.messagingAngle,
  );
}

function avatarAnsweredFieldCount(avatar: IdealClientAvatar): number {
  let count = 0;
  if (avatar.who?.trim()) count += 1;
  if (avatar.painPoints?.trim()) count += 1;
  if (avatar.goals?.trim()) count += 1;
  if (avatar.solution?.trim()) count += 1;
  if (avatar.objections?.trim()) count += 1;
  if (avatar.messagingAngle?.trim()) count += 1;
  return count;
}

function createDraftPreview(): { preview: string; answeredCount: number } {
  const workflow = loadWorkflowRecord();
  if (workflow) {
    return {
      preview: workflow.draftContent ?? "",
      answeredCount: countAnsweredFields(workflow.collectedAnswers),
    };
  }
  const session = loadCreateSession();
  if (!session) return { preview: "", answeredCount: 0 };
  return {
    preview:
      session.genSeed.draft?.trim() ||
      session.creationContext.draftContent?.trim() ||
      "",
    answeredCount: session.genSeed.type ? 1 : 0,
  };
}

function buildSignalForItem(item: ContinuityManifestItem): ResumeWorkSignal {
  const base: ResumeWorkSignal = {
    kind: mapContinuityTypeToResumeKind(item.type),
    id: item.id,
    title: item.title,
    lastTouchedAt: item.lastTouchedAt,
  };

  switch (item.type) {
    case "create-draft": {
      const { preview, answeredCount } = createDraftPreview();
      return {
        ...base,
        contentCharCount: preview.length,
        answeredQuestionCount: answeredCount,
        modifiedDocument: Boolean(preview.trim()),
      };
    }
    case "create-saved-for-later": {
      const record = loadSavedWorkflowRecord();
      const preview = record?.draftContent ?? "";
      return {
        ...base,
        savedProgress: true,
        contentCharCount: preview.length,
        answeredQuestionCount: countAnsweredFields(record?.collectedAnswers ?? {}),
        modifiedDocument: Boolean(preview.trim()),
      };
    }
    case "workspace-sop": {
      const meta = loadWorkspaceSessionMeta();
      const session = meta?.session;
      const acceptedText = Object.values(session?.acceptedValues ?? {}).join("");
      return {
        ...base,
        completedStepCount: session?.completedStepIds.length ?? 0,
        contentCharCount: acceptedText.length,
      };
    }
    case "decision-compass": {
      const snapshot = loadDecisionCompassSession();
      const answers = snapshot?.answers ?? {};
      return {
        ...base,
        answeredQuestionCount: countAnsweredFields(answers),
        completedStepCount: snapshot?.completedSteps.length ?? 0,
        contentCharCount: charCount(
          snapshot?.decision,
          snapshot?.optionA,
          snapshot?.optionB,
          snapshot?.draft,
          ...Object.values(answers),
        ),
      };
    }
    case "strategy-apply": {
      const snapshot = loadStrategyApplySession();
      const answers = snapshot?.answers ?? {};
      return {
        ...base,
        answeredQuestionCount: countAnsweredFields(answers),
        contentCharCount: charCount(
          snapshot?.generatedPlan,
          ...Object.values(answers),
        ),
      };
    }
    case "project": {
      const project = getProjects().find((row) => row.id === item.projectId);
      const taskCount = getProjectItems(item.projectId).filter(
        (row) => row.kind === "task" || row.kind === "subtask",
      ).length;
      const contentCharCount = charCount(
        project?.nextAction,
        project?.goal,
        ...(project?.goals ?? []),
      );
      return {
        ...base,
        createdTaskCount: taskCount,
        contentCharCount,
        viewedOnly: taskCount === 0 && contentCharCount < 40,
      };
    }
    case "client-avatar": {
      const avatar = getAvatars().find((row) => row.id === item.avatarId);
      if (!avatar) {
        return { ...base, viewedOnly: true };
      }
      const answeredQuestionCount = avatarAnsweredFieldCount(avatar);
      return {
        ...base,
        answeredQuestionCount,
        contentCharCount: avatarContentChars(avatar),
        viewedOnly: answeredQuestionCount === 0,
      };
    }
    default:
      return { ...base, viewedOnly: true };
  }
}

export function buildResumeWorkSignals(
  items: ContinuityManifestItem[],
): ResumeWorkSignal[] {
  return items.map(buildSignalForItem);
}

export function pickEligibleContinuityItem<T extends ContinuityManifestItem>(
  items: T[],
): T | null {
  const signals = buildResumeWorkSignals(items);
  const eligible = pickMostRecentEligibleResume(signals);
  if (!eligible) return null;
  return items.find((item) => item.id === eligible.id) ?? null;
}
