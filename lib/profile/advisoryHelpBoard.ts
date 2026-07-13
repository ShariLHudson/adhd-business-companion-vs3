/**
 * Board discussion from Estate/People advisory context — no Boardroom redesign.
 * Creates a discussion record in the existing boardroom store; does not navigate.
 */

import {
  generateDecisionBrief,
  generateOpeningDiscussion,
  recommendBestBoard,
  titleFromSituation,
  upsertBoardroomDiscussion,
  type BoardroomDiscussionRecord,
} from "@/lib/boardroom";
import type { AdvisoryContext } from "@/lib/profile/advisoryHelpTypes";
import { ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM } from "@/lib/profile/advisoryHelpTypes";

export function buildBoardSituationFromAdvisory(
  context: AdvisoryContext,
): string {
  const parts = [
    context.userQuestion?.trim() ||
      `Need a Board perspective on ${context.areaId.replace(/-/g, " ")}.`,
    `Source area: ${context.areaId}${context.stageId ? ` / ${context.stageId}` : ""}.`,
    context.avatarId ? `Avatar: ${context.avatarId}.` : "",
    "Approved Business Estate and People I Help context are available — do not re-ask known facts.",
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Start an in-context Board discussion using existing Boardroom generators.
 * Does not navigate to the Boardroom room.
 */
export function startAdvisoryBoardDiscussion(
  context: AdvisoryContext,
): {
  discussion: BoardroomDiscussionRecord;
  didNavigate: false;
  contract: typeof ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM;
} {
  const situation = buildBoardSituationFromAdvisory(context);
  const memberIds = recommendBestBoard(situation).slice(0, 5);
  const turns = generateOpeningDiscussion({
    situation,
    memberIds,
    style: "quick-review",
  });
  const brief = generateDecisionBrief({
    situation,
    memberIds,
    turns,
  });
  const now = new Date().toISOString();
  const discussion: BoardroomDiscussionRecord = {
    id: `adv-board-${Date.now().toString(36)}`,
    title: titleFromSituation(situation),
    createdAt: now,
    updatedAt: now,
    situation,
    assemblyMode: "assemble-best",
    memberIds,
    style: "quick-review",
    turns,
    brief,
    recordedDecision: null,
    revisitAt: null,
    outcomeNotes: null,
    status: "in-progress",
  };
  upsertBoardroomDiscussion(discussion);
  return {
    discussion,
    didNavigate: false,
    contract: ADVISORY_HELP_MAY_AUTO_NAVIGATE_BOARDROOM,
  };
}

export function summarizeBoardForOverlay(
  discussion: BoardroomDiscussionRecord,
): {
  agreement: string[];
  differences: string[];
  decisionPoints: string[];
  nextStep: string;
} {
  return {
    agreement: discussion.brief.areasOfAgreement.slice(0, 4),
    differences: discussion.brief.differentPerspectives.slice(0, 4),
    decisionPoints: discussion.brief.questionsStillToAnswer.slice(0, 4),
    nextStep:
      discussion.brief.possibleNextSteps[0] ??
      "Return to your Business Area and decide what feels true for you.",
  };
}
