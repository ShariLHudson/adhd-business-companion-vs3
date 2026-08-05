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
import { getRuntimeCreationRecord } from "./currentFocus";
import { getVisualFocusMapById } from "./visualFocus/store";
import { meaningfulNodeCount } from "./visualFocus/mapReadiness";

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
    // ResumeWorkKind has no dedicated member for these two — this field is
    // descriptive metadata only (never branched on for eligibility scoring;
    // the member-facing option kind is decided separately by
    // companionLedContinue.ts's own continuityKind(), which already handles
    // both correctly). "create" matches prior silent-default behavior.
    case "active-creation":
    case "visual-focus-map":
      return "create";
    case "saved-work":
      return "create";
    default: {
      // Compile-time guard — see the matching guard in buildSignalForItem.
      const _exhaustive: never = type;
      return _exhaustive;
    }
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
    // 2026-08-05 fix — active-creation and visual-focus-map were added to
    // HOME_RESUME_CONTINUITY_TYPES (continuityManifest.ts) in two separate
    // commits five weeks apart, but neither touched this switch, so both
    // silently fell to `default: viewedOnly: true` and could never become
    // eligible for Continue Where I Left Off regardless of real work done.
    // Standard 071 requires the opposite ("may never become unreachable").
    case "active-creation": {
      const workspaceId = item.id.replace(/^active-creation:/, "");
      const record = getRuntimeCreationRecord(workspaceId);
      const answeredQuestionCount = record
        ? countAnsweredFields(record.sectionContent)
        : 0;
      const hasDraft = Boolean(record?.draftContent?.trim());
      return {
        ...base,
        answeredQuestionCount,
        contentCharCount: charCount(record?.draftContent),
        modifiedDocument: hasDraft,
        viewedOnly: answeredQuestionCount === 0 && !hasDraft,
      };
    }
    case "visual-focus-map": {
      const map = item.visualFocusMapId
        ? getVisualFocusMapById(item.visualFocusMapId)
        : null;
      const nodeCount = map ? meaningfulNodeCount(map) : 0;
      return {
        ...base,
        answeredQuestionCount: nodeCount,
        viewedOnly: nodeCount === 0,
      };
    }
    // Deliberately excluded from HOME_RESUME_CONTINUITY_TYPES — saved-work
    // is finished output owned by My Work, not unfinished work to resume.
    // Kept here only so the switch is exhaustive over ContinuityItemType.
    case "saved-work":
      return { ...base, viewedOnly: true };
    default: {
      // Compile-time guard: if ContinuityItemType ever grows, this fails to
      // typecheck until a case is added above — the exact silent-drift
      // pattern that caused this bug in the first place.
      const _exhaustive: never = item.type;
      return _exhaustive;
    }
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
