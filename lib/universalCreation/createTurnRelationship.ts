/**
 * Authoritative Create turn relationship — one decision before Create handlers.
 */

import { isExplicitDocumentContinue } from "@/lib/conversationStabilization/workflowResumeDecision";
import { isActiveWorkspaceResumeRequest } from "@/lib/activeWorkspaceRegistry";
import { isCreateResumeRequest } from "@/lib/workspaceIntent";
import { looksLikeKnowledgeQuestion } from "@/lib/platformIntent";
import { isCreateIrrelevantUserTurn } from "@/lib/conversationContinuity/createOwnershipGuard";
import { isExplicitOwnerExit, isExplicitTaskChange } from "@/lib/conversationContinuity/exitRules";
import { isCreateWorkflowContinuation } from "@/lib/pendingChoice/listContinuation";
import { isSimpleCreateRequest } from "./createFastPath";
import type { UniversalCreationSession } from "./types";
import { getCreateLifecycle, isCreateParked } from "./createLifecycle";
import { isBareGenericAcceptance } from "@/lib/pendingAcceptanceAuthority";
import { EXPLICIT_EMAIL_START_OVER_RE } from "./emailWorkflowCompletion";
import { isCreateRevisionInstruction } from "./createRevisionDetect";
import type { ConversationBoundaryDecision } from "@/lib/conversationBoundary";

export { isCreateRevisionInstruction } from "./createRevisionDetect";

export type CreateTurnRelationship =
  | "continue-create"
  | "revise-create"
  | "answer-create-question"
  | "explicit-return-to-create"
  | "temporary-detour"
  | "exit-create"
  | "replace-create"
  | "unrelated-turn";

export type CreateTurnRelationshipDecision = {
  relationship: CreateTurnRelationship;
  /** Create fast-path / UC handler may run. */
  createEligible: boolean;
  /** Park Create (preserve session) before Companion answers. */
  shouldPark: boolean;
  /** Resume parked Create for this turn. */
  shouldResume: boolean;
  /** Hard-clear Create session. */
  shouldExit: boolean;
  reason: string;
};

const EXPLICIT_RETURN_RE =
  /\b(?:go back to|return to|let'?s go back to|back to|continue|finish|let'?s finish)\b.{0,48}\b(?:the |my )?(?:email|draft|document|newsletter|letter)\b|\bback to what we were writing\b|\blet'?s finish (?:the |my )?(?:email|draft)\b/i;

const CREATE_MENU_RE =
  /^(?:\d{1,2}|copy(?:\s+email)?|make\s+changes|save\s+for\s+later|create\s+gmail(?:\s+draft)?|send(?:\s+email)?)\b/i;

const EXIT_CREATE_RE =
  /\b(?:forget (?:the |my )?(?:email|draft)|never ?mind (?:the |my )?(?:email|draft)|cancel (?:the |my )?(?:email|draft)|i(?:'m| am) done with (?:the |my )?(?:email|draft)|stop (?:working on )?the email)\b/i;

const DETOUR_QUESTION_RE =
  /\?\s*$/;

const CREATE_TOPIC_RE =
  /\b(?:email|draft|subject|copy|gmail|make changes|newsletter|this (?:draft|email)|the (?:draft|email))\b/i;

export function isExplicitReturnToCreate(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return (
    EXPLICIT_RETURN_RE.test(t) ||
    isExplicitDocumentContinue(t) ||
    isActiveWorkspaceResumeRequest(t) ||
    isCreateResumeRequest(t)
  );
}

/**
 * Single choke-point decision for Create vs Companion for this user turn.
 */
export function classifyCreateTurnRelationship(input: {
  userText: string;
  session: UniversalCreationSession | null;
  lastAssistantText?: string | null;
  continueCreationPriority?: boolean;
  /**
   * Shared Conversation Boundary Decision — the single authority for whether this
   * turn belongs to the active Create. When present, it replaces the legacy
   * lastAssistantText / message-position heuristic for claiming a discovery answer.
   */
  boundaryDecision?: ConversationBoundaryDecision;
}): CreateTurnRelationshipDecision {
  const t = input.userText.trim();
  const session = input.session;
  const life = getCreateLifecycle(session);
  const hasWorkflow =
    life.state === "active" ||
    life.state === "awaiting_input" ||
    life.state === "parked" ||
    life.state === "resumed";
  const parked = isCreateParked(session);

  if (!t) {
    return {
      relationship: "unrelated-turn",
      createEligible: false,
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: "empty",
    };
  }

  // Explicit return BEFORE exit — "go back to the email" matches exit's "go back".
  if (hasWorkflow && isExplicitReturnToCreate(t)) {
    return {
      relationship: "explicit-return-to-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: parked,
      shouldExit: false,
      reason: "explicit_return",
    };
  }

  // Explicit start-over / write a different email — replace, don't hard-abandon.
  if (hasWorkflow && EXPLICIT_EMAIL_START_OVER_RE.test(t)) {
    return {
      relationship: "replace-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: false,
      shouldExit: true,
      reason: "explicit_start_over",
    };
  }

  // Hard exit / forget the email (not a return-to-create phrase)
  if (
    hasWorkflow &&
    (EXIT_CREATE_RE.test(t) ||
      (isExplicitOwnerExit(t) &&
        CREATE_TOPIC_RE.test(t) &&
        !isExplicitReturnToCreate(t)))
  ) {
    return {
      relationship: "exit-create",
      createEligible: false,
      shouldPark: false,
      shouldResume: false,
      shouldExit: true,
      reason: "explicit_exit_create",
    };
  }

  // Revision before replace/detour — "make warmer" must not restart Create.
  // Requires an actual draft to revise (has-draft or parked-with-draft); the
  // lastAssistantText position heuristic is intentionally NOT a trigger here, so a
  // discovery answer that happens to contain a revision-like verb ("update the
  // client on the timeline") is not misread as revising a non-existent draft.
  if (
    hasWorkflow &&
    isCreateRevisionInstruction(t) &&
    (life.hasDraft || parked)
  ) {
    return {
      relationship: "revise-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: parked,
      shouldExit: false,
      reason: parked ? "parked_revision" : "revision_instruction",
    };
  }

  // Replace with a different explicit create (new artifact)
  if (
    hasWorkflow &&
    isSimpleCreateRequest(t) &&
    !CREATE_TOPIC_RE.test(t) &&
    isExplicitTaskChange(t)
  ) {
    return {
      relationship: "replace-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: false,
      shouldExit: true,
      reason: "replace_create",
    };
  }

  // Temporary detour — park and let Companion answer
  const detourQuestion =
    DETOUR_QUESTION_RE.test(t) && !CREATE_TOPIC_RE.test(t);
  const sideDetour =
    /\b(?:side question|quick question|unrelated|by the way|btw)\b/i.test(t) ||
    (detourQuestion &&
      (looksLikeKnowledgeQuestion(t) ||
        /\b(?:do i need|should i|can i|is it|are there)\b/i.test(t)));

  if (hasWorkflow && (sideDetour || detourQuestion || isCreateIrrelevantUserTurn(t))) {
    return {
      relationship: "temporary-detour",
      createEligible: false,
      shouldPark: true,
      shouldResume: false,
      shouldExit: false,
      reason: sideDetour ? "side_question_detour" : "temporary_detour",
    };
  }

  // No Create workflow — unrelated or new create (handled elsewhere)
  if (!hasWorkflow) {
    return {
      relationship: isSimpleCreateRequest(t) ? "continue-create" : "unrelated-turn",
      createEligible: isSimpleCreateRequest(t),
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: isSimpleCreateRequest(t) ? "new_create" : "no_create_workflow",
    };
  }

  // Parked — only return/revision/menu may touch Create
  if (parked) {
    if (CREATE_MENU_RE.test(t) || isCreateWorkflowContinuation(t)) {
      return {
        relationship: "continue-create",
        createEligible: true,
        shouldPark: false,
        shouldResume: true,
        shouldExit: false,
        reason: "parked_menu_or_continuation",
      };
    }
    // New explicit create while parked — replace the parked workflow (don't stall).
    if (isSimpleCreateRequest(t)) {
      return {
        relationship: "replace-create",
        createEligible: true,
        shouldPark: false,
        shouldResume: false,
        shouldExit: true,
        reason: "parked_replace_with_new_create",
      };
    }
    return {
      relationship: "unrelated-turn",
      createEligible: false,
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: "parked_blocks_unrelated",
    };
  }

  // Explicit Create-domain continuation signals (menu selection, bare acceptance,
  // list continuation) — unambiguous actions on the Create itself, not
  // message-position guesses, so they remain Create-owned regardless of Boundary.
  const bareContinue =
    isBareGenericAcceptance(t) ||
    isCreateWorkflowContinuation(t) ||
    CREATE_MENU_RE.test(t);
  if (bareContinue) {
    return {
      relationship: "continue-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: "create_bare_continue",
    };
  }

  // Discovery answer — the shared Boundary Decision is the SOLE authority for
  // whether this turn belongs to the active Create. The legacy lastAssistantText /
  // message-length position heuristic is removed: a reply is consumed as a
  // discovery answer ONLY when the Boundary classified it as answering the pending
  // question (or continuing the current topic). Absent a granting Boundary
  // decision, an unrelated statement is never captured as an answer.
  const boundaryGrantsCreateAnswer =
    input.boundaryDecision?.decision === "answer_pending_question" ||
    input.boundaryDecision?.decision === "continue_current_topic";
  if (
    life.state === "awaiting_input" &&
    boundaryGrantsCreateAnswer &&
    !DETOUR_QUESTION_RE.test(t)
  ) {
    return {
      relationship: "answer-create-question",
      createEligible: true,
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: "create_discovery_answer",
    };
  }

  // Explicit new create while active → continue if same family, else unrelated
  if (isSimpleCreateRequest(t)) {
    return {
      relationship: "continue-create",
      createEligible: true,
      shouldPark: false,
      shouldResume: false,
      shouldExit: false,
      reason: "simple_create_request",
    };
  }

  return {
    relationship: "unrelated-turn",
    createEligible: false,
    shouldPark: true,
    shouldResume: false,
    shouldExit: false,
    reason: "unrelated_with_active_create",
  };
}

/** Whether Create handlers may produce a reply this turn. */
export function createHandlerEligible(
  decision: CreateTurnRelationshipDecision,
): boolean {
  return decision.createEligible;
}

/**
 * Parked / detour turns belong to Companion chat — not Create, not howto failsafe.
 */
export function isParkedCreateCompanionDetour(
  decision: CreateTurnRelationshipDecision,
): boolean {
  return (
    decision.relationship === "temporary-detour" ||
    decision.reason === "side_question_detour" ||
    decision.reason === "parked_blocks_unrelated" ||
    decision.reason === "temporary_detour" ||
    decision.reason === "unrelated_with_active_create"
  );
}
