/**
 * 051 / 050 — Owner and contributor coordination.
 * One owner · many contributors · one result · no orphan drafts.
 */

import {
  boardAdviceCreatesWorkspace,
  buildContributorContextPacket,
  buildUnifiedOwnerResponse,
  contributorMayCreateOrphan,
  decideCollaboration,
  resolveOwnership,
  synthesizeOwnershipConflict,
  type CollaborationMode,
} from "@/lib/creationOwnership";
import { resolveCreationOwnership } from "./ownershipResolver";

export function coordinateCollaboration(input: {
  blueprintId?: string | null;
  assetTypeId?: string | null;
  eventRecordId?: string | null;
  userText?: string;
  ownerVoice?: string;
  nextStep?: string | null;
}): {
  primaryOwner: string;
  contributors: string[];
  boardAdvisors: string[];
  mode: CollaborationMode;
  engage: boolean;
  oneResult: true;
  noDuplicateDrafts: true;
  boardMayOwn: false;
  allowSeparateCreationRecord: false;
  boardCreatesWorkspace: false;
  contributorContext: ReturnType<typeof buildContributorContextPacket>;
  unifiedReply: string | null;
} {
  const ownership = resolveOwnership({
    blueprintId: input.blueprintId,
    assetTypeId: input.assetTypeId,
  });
  const decision = decideCollaboration({
    blueprintId: input.blueprintId,
    assetTypeId: input.assetTypeId,
    userText: input.userText,
  });
  const legacy = resolveCreationOwnership({
    assetTypeId: input.assetTypeId,
  });

  const contributorContext = buildContributorContextPacket({
    eventRecordId: input.eventRecordId,
    assetTypeId: input.assetTypeId,
    blueprintId: input.blueprintId,
    latestUserGoal: input.userText,
    requestedContributionScope: decision.engage
      ? "Provide domain expertise for the owner to synthesize"
      : "Stay with Primary Owner",
  });

  const unifiedReply = input.ownerVoice
    ? buildUnifiedOwnerResponse({
        ownerVoice: input.ownerVoice,
        nextStep: input.nextStep,
      })
    : null;

  return {
    primaryOwner: String(ownership.primaryOwner || legacy.primaryOwner),
    contributors: decision.contributorIds.length
      ? decision.contributorIds
      : legacy.contributorIds,
    boardAdvisors: decision.boardAdvisorIds,
    mode: decision.mode,
    engage: decision.engage,
    oneResult: true,
    noDuplicateDrafts: true,
    boardMayOwn: false,
    allowSeparateCreationRecord: contributorMayCreateOrphan(),
    boardCreatesWorkspace: boardAdviceCreatesWorkspace(),
    contributorContext,
    unifiedReply,
  };
}

export function synthesizeCollaboratorConflict(input: {
  assetTypeId?: string | null;
  blueprintId?: string | null;
  advice: Array<{ from: string; advice: string; weight?: "suggestion" | "risk" | "requirement" }>;
  userMustDecide?: boolean;
}) {
  return synthesizeOwnershipConflict(input);
}
