/**
 * Wiring adapter: build the shared Conversation Boundary Decision from live
 * conversation state, computed ONCE per turn.
 *
 * S4 Phase 0 — pre-turn snapshot invariant. The Boundary Decision MUST be
 * computed from a snapshot captured BEFORE any state machine ingests the
 * current user message (notably `processActiveTopicOnUserTurn`, which writes the
 * current turn's text into ActiveTopic.unresolvedNeed). `resolveTurnBoundaryDecision`
 * therefore reads ONLY the passed snapshot — never the live stores — so it can
 * never observe a mutation caused by the same turn it is classifying.
 *
 * Contract: call `captureBoundaryPreTurnSnapshot()` at the very top of the turn,
 * then pass the result to `resolveTurnBoundaryDecision`. There is no live-store
 * fallback by design.
 */

import {
  resolveConversationBoundary,
  type BoundaryActiveTopic,
  type BoundaryActiveWork,
  type BoundaryPendingQuestion,
  type BoundarySuspendedItem,
  type ConversationBoundaryDecision,
  type PendingAnswerRole,
} from "./conversationBoundary";
import { toBoundarySuspendedItems } from "./conversationSuspension";
import {
  getActiveTopic,
  isActiveTopicUnresolved,
} from "./conversationStabilization/activeTopicStore";
import { loadSuspensionState } from "./conversationStabilization/suspensionStore";
import { loadUniversalCreationSession } from "./universalCreation";
import { getCreateLifecycle } from "./universalCreation/createLifecycle";
import { getDocumentCreationProfile } from "./universalCreation/documentCreationProfiles";
import type {
  UniversalCreationSession,
  UniversalDiscoverySlot,
} from "./universalCreation/types";

/**
 * S4.1 — map the workflow-agnostic discovery slot to a general answer role. The
 * four slots are shared by every Create workflow, so no per-workflow config.
 */
const SLOT_TO_ROLE: Record<UniversalDiscoverySlot, PendingAnswerRole> = {
  who: "recipient",
  why: "goal",
  what: "subject",
  success: "outcome",
};

function activeTopicSnapshot(): BoundaryActiveTopic | null {
  const topic = getActiveTopic();
  if (!topic) return null;
  return {
    topicId: topic.topicId,
    goal: topic.userGoal,
    unresolvedNeed: topic.unresolvedNeed,
    resolved: !isActiveTopicUnresolved(topic),
    startedAtTurn: topic.startedAtTurn,
    updatedAtTurn: topic.updatedAtTurn,
  };
}

/** True when the Create session is awaiting a member answer (discovery/action). */
function createIsAwaitingAnswer(session: UniversalCreationSession): boolean {
  return getCreateLifecycle(session).state === "awaiting_input";
}

function activeCreateSnapshot(): BoundaryActiveWork | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;
  if (session.lifecycle === "exited" || session.lifecycle === "completed") {
    return null;
  }
  return {
    kind: "create",
    id: `uc:${session.documentType}:t${session.startedAtTurn}`,
    artifactType: session.documentType,
    // S4 Phase 1 — the goal lets the Boundary tell a related discovery answer
    // ("update the client on the timeline") from an unrelated errand ("my dog
    // threw up"). Sourced from the original Create request + document type.
    goal: [session.originalUserText, session.documentType]
      .filter(Boolean)
      .join(" "),
    awaitingAnswer: createIsAwaitingAnswer(session),
    // Any in-progress Create is worth preserving on interrupt/switch.
    suspendable: true,
  };
}

/**
 * S4 Phase 1 — the pending Create discovery question, so the Boundary can decide
 * `answer_pending_question`. Present only while the Create is awaiting a member
 * answer (discovery phase); other awaiting phases keep their explicit
 * menu/acceptance handling in createTurnRelationship and are left null here.
 */
function pendingCreateQuestionSnapshot(): BoundaryPendingQuestion | null {
  const session = loadUniversalCreationSession();
  if (!session) return null;
  if (session.lifecycle === "exited" || session.lifecycle === "completed") {
    return null;
  }
  if (session.phase !== "discovery") return null;
  if (getCreateLifecycle(session).state !== "awaiting_input") return null;

  // S4.1 — carry the pending slot's role, the still-outstanding roles (a member
  // may answer a not-yet-asked slot), and the workflow's OWN authored affordances
  // (signalPatterns). The Boundary evaluates conformance; it holds no domain words.
  const profile = getDocumentCreationProfile(session.documentType);
  const questions = profile.discoveryQuestions;
  const answers = session.answers ?? {};
  const outstanding = questions.filter((question) => !answers[question.id]);
  if (outstanding.length === 0) {
    return { kind: "open", expects: "free" };
  }
  const idx = session.questionIndex;
  const pending =
    idx >= 0 && idx < questions.length && !answers[questions[idx]!.id]
      ? questions[idx]!
      : outstanding[0]!;
  const outstandingRoles = Array.from(
    new Set(outstanding.map((question) => SLOT_TO_ROLE[question.slot])),
  );
  const affordances = outstanding.flatMap(
    (question) => question.signalPatterns ?? [],
  );
  return {
    kind: "open",
    expects: "free",
    role: SLOT_TO_ROLE[pending.slot],
    outstandingRoles,
    affordances,
  };
}

/** The full set of prior-turn inputs the Boundary Decision reads. */
export type BoundaryPreTurnSnapshot = {
  activeTopic: BoundaryActiveTopic | null;
  activeWork: BoundaryActiveWork | null;
  pendingQuestion: BoundaryPendingQuestion | null;
  suspended: BoundarySuspendedItem[];
};

/**
 * Capture the prior-turn conversation state. Call this at the very top of the
 * turn, BEFORE any state machine (ActiveTopic, IntentWorkflow, Create) ingests
 * the current user message. Pure read of the stores; never mutates.
 */
export function captureBoundaryPreTurnSnapshot(): BoundaryPreTurnSnapshot {
  return {
    activeTopic: activeTopicSnapshot(),
    activeWork: activeCreateSnapshot(),
    pendingQuestion: pendingCreateQuestionSnapshot(),
    suspended: toBoundarySuspendedItems(loadSuspensionState()),
  };
}

/**
 * Compute the turn's Boundary Decision from a previously captured pre-turn
 * snapshot. Reads ONLY the snapshot — never the live stores — so a same-turn
 * mutation (e.g. ActiveTopic.unresolvedNeed being set to the current message)
 * can never contaminate the decision.
 */
export function resolveTurnBoundaryDecision(input: {
  userText: string;
  turn: number;
  lastAssistantText?: string | null;
  snapshot: BoundaryPreTurnSnapshot;
}): ConversationBoundaryDecision {
  return resolveConversationBoundary({
    userText: input.userText,
    turn: input.turn,
    activeTopic: input.snapshot.activeTopic,
    activeWork: input.snapshot.activeWork,
    pendingQuestion: input.snapshot.pendingQuestion,
    suspended: input.snapshot.suspended,
    lastAssistantText: input.lastAssistantText ?? undefined,
  });
}
