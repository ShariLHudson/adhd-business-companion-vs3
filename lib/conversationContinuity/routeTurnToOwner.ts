/**
 * Route a turn to the active conversation owner (domain handlers).
 * Pure of React — CompanionPageClient applies the result.
 */

import {
  answerBoardIntakeStep,
  BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS,
  loadBoardIntakeDraft,
  saveBoardIntakeDraft,
  type BoardDiscussionIntakeDraft,
  type BoardIntakeStep,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import {
  formatUniversalCreationTurnReply,
  loadUniversalCreationSession,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
} from "@/lib/universalCreation";
import type {
  UniversalCreationSession,
  UniversalCreationTurnResult,
} from "@/lib/universalCreation";
import type { ConversationOwner } from "./types";
import { persistConversationOwner } from "./ownerStore";
import { describeOwnerForRecovery } from "./describeOwnerForRecovery";
import { wasRecoveryReplyJustRejected } from "./workflowCorrection";

export type OwnerTurnRouteResult =
  | {
      kind: "universal_creation";
      reply: string;
      session: UniversalCreationSession;
      turn: UniversalCreationTurnResult;
    }
  | {
      kind: "board_intake";
      reply: string;
      draft: BoardDiscussionIntakeDraft;
    }
  | {
      kind: "continue_in_chat";
      /** Skip primary / Decision Engine / broad create routing. */
      owner: ConversationOwner;
      syntheticPrimaryOwner: string;
    }
  | {
      kind: "unhandled";
      reason: string;
    };

function boardIntakeNextPrompt(step: BoardIntakeStep): string {
  switch (step) {
    case "decision":
      return BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[0].prompt;
    case "importance":
      return BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[1].prompt;
    case "options":
      return BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[2].prompt;
    case "concerns":
      return BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[3].prompt;
    case "review":
      return "Here's what I have so far. When you're ready, we can begin the Board discussion.";
    case "ready_to_begin":
      return "Ready when you are — we can begin the Board discussion.";
    case "discussion":
      return "Your Board discussion is open. What would you like to take up?";
    default:
      return "Your earlier Board answers are still here.";
  }
}

export type RouteTurnToOwnerInput = {
  owner: ConversationOwner;
  userText: string;
  lastAssistantText?: string | null;
};

/**
 * Dispatch the member message to the active owner.
 * Does not clear ownership. Does not start a new workflow.
 */
export function routeTurnToOwner(
  input: RouteTurnToOwnerInput,
): OwnerTurnRouteResult {
  const { owner, userText, lastAssistantText } = input;
  const t = userText.trim();
  if (!t) {
    return { kind: "unhandled", reason: "empty" };
  }

  if (owner.kind === "guided_workflow" || owner.kind === "artifact") {
    const turn = resolveUniversalCreationTurn(
      t,
      /* turn */ 0,
      lastAssistantText ?? undefined,
    );
    if (!turn) {
      const session = loadUniversalCreationSession();
      if (!session) {
        return { kind: "unhandled", reason: "uc_session_missing" };
      }
      const recovery = describeOwnerForRecovery(owner);
      // Never repeat a recovery line the member already rejected.
      if (wasRecoveryReplyJustRejected(recovery)) {
        return { kind: "unhandled", reason: "rejected_recovery_repeat" };
      }
      return {
        kind: "universal_creation",
        reply: recovery,
        session,
        turn: {
          kind: "message",
          message: recovery,
          session,
        },
      };
    }
    saveUniversalCreationSession(turn.session);
    persistConversationOwner(
      owner.kind === "guided_workflow"
        ? {
            ...owner,
            awaitingAnswer: turn.kind === "question" || turn.kind === "ready",
          }
        : {
            ...owner,
            awaitingAnswer:
              turn.session.phase === "awaiting_action" ||
              turn.session.phase === "review" ||
              turn.session.phase === "approval",
          },
    );
    return {
      kind: "universal_creation",
      reply: formatUniversalCreationTurnReply(turn),
      session: turn.session,
      turn,
    };
  }

  if (owner.kind === "board_intake") {
    const draft = loadBoardIntakeDraft();
    if (!draft) {
      return { kind: "unhandled", reason: "board_intake_missing" };
    }
    const next = answerBoardIntakeStep(draft, t);
    saveBoardIntakeDraft(next);
    persistConversationOwner({
      kind: "board_intake",
      discussionDraftId: owner.discussionDraftId,
      currentStepId: next.currentStep,
      awaitingAnswer: next.currentStep !== "discussion",
    });
    return {
      kind: "board_intake",
      reply: boardIntakeNextPrompt(next.currentStep),
      draft: next,
    };
  }

  if (
    owner.kind === "chamber_specialist" ||
    owner.kind === "board_director" ||
    owner.kind === "board_discussion"
  ) {
    persistConversationOwner(owner);
    return {
      kind: "continue_in_chat",
      owner,
      syntheticPrimaryOwner: owner.kind,
    };
  }

  return { kind: "unhandled", reason: `owner_${owner.kind}` };
}
