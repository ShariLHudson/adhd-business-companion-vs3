/**
 * 050 — When to engage contributors vs stay with the Primary Owner.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import { resolveOwnership } from "./resolveOwnership";
import type { CollaborationDecision, CollaborationMode } from "./types";

export type CollaborationTriggerInput = {
  blueprintId?: string | null;
  assetTypeId?: string | null;
  userText?: string;
  /** Specialist review required by certification / dependency */
  specialistReviewNeeded?: boolean;
  dependencyBlocked?: boolean;
  crossDomainAsset?: boolean;
  certificationRequires?: boolean;
  /** User explicitly asked for Event Team / Chamber / another view */
  userAsksTeam?: boolean;
  /** Prefer silence — owner can answer alone */
  ownerCanHandleAlone?: boolean;
  simpleTask?: boolean;
};

const PERSPECTIVE_RE =
  /\b(?:another (?:view|perspective|opinion)|what (?:would|does) (?:the )?(?:board|chamber|team|marketing|finance|content) think|ask (?:the )?(?:board|chamber|team)|event team|get .+ (?:input|take))\b/i;

/**
 * Decide whether collaboration is required, optional, or should be skipped.
 */
export function decideCollaboration(
  input: CollaborationTriggerInput,
): CollaborationDecision {
  const ownership = resolveOwnership({
    blueprintId: input.blueprintId,
    assetTypeId: input.assetTypeId,
    text: input.userText,
  });

  const userText = input.userText ?? "";
  const userAsks =
    Boolean(input.userAsksTeam) || PERSPECTIVE_RE.test(userText);

  if (
    input.ownerCanHandleAlone ||
    (input.simpleTask && !userAsks && !input.specialistReviewNeeded)
  ) {
    return {
      engage: false,
      mode: "silent_contribution",
      contributorIds: [],
      boardAdvisorIds: [],
      reason: "primary_owner_sufficient",
      boardMayOwn: false,
      allowSeparateCreationRecord: false,
    };
  }

  const required =
    input.specialistReviewNeeded ||
    input.dependencyBlocked ||
    input.crossDomainAsset ||
    input.certificationRequires ||
    userAsks;

  if (!required && !input.userAsksTeam) {
    // Optional path — only when spans domains or material improvement signal
    const optional =
      /\b(?:and|plus|also)\b.+\b(?:marketing|budget|finance|workbook|email)\b/i.test(
        userText,
      );
    if (!optional) {
      return {
        engage: false,
        mode: "silent_contribution",
        contributorIds: [],
        boardAdvisorIds: [],
        reason: "no_collaboration_needed",
        boardMayOwn: false,
        allowSeparateCreationRecord: false,
      };
    }
  }

  const boardAsked = /\bboard\b/i.test(userText);
  const mode: CollaborationMode = boardAsked
    ? "board_consultation"
    : userAsks
      ? "visible_contribution"
      : "silent_contribution";

  const contributorIds = pickContributors(
    ownership.supportingContributorIds,
    userText,
  );

  return {
    engage: true,
    mode,
    contributorIds,
    boardAdvisorIds: boardAsked ? ownership.boardAdvisorIds : [],
    reason: required ? "required_collaboration" : "optional_collaboration",
    boardMayOwn: false,
    allowSeparateCreationRecord: false,
  };
}

function pickContributors(
  available: ChamberMemberId[],
  userText: string,
): ChamberMemberId[] {
  const t = userText.toLowerCase();
  const picked: ChamberMemberId[] = [];
  const tryPush = (id: ChamberMemberId) => {
    if (available.includes(id) && !picked.includes(id)) picked.push(id);
  };

  if (/\bfinance|budget\b/.test(t)) tryPush("finance");
  if (/\bmarketing|promo|promot/.test(t)) tryPush("marketing");
  if (/\bcontent|email|copy|workbook\b/.test(t)) tryPush("content");
  if (/\blearning|curriculum|teach\b/.test(t)) tryPush("learning");
  if (/\bclient|attendee|experience\b/.test(t)) tryPush("client-relationships");
  if (/\bcreative|visual|slides|presentation\b/.test(t)) {
    tryPush("creative-studio");
    tryPush("presentations");
  }
  if (/\bleadership\b/.test(t)) tryPush("leadership");

  if (picked.length === 0) return available.slice(0, 2);
  return picked.slice(0, 3);
}

/**
 * Board advice must never open a second Creation Workspace.
 */
export function boardAdviceCreatesWorkspace(): false {
  return false;
}

/**
 * Contributors must not create disconnected / orphan assets.
 */
export function contributorMayCreateOrphan(): false {
  return false;
}
