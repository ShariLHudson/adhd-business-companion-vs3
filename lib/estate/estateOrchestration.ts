/**
 * Estate Turn Orchestration™ — Phase 2A shadow evaluator.
 *
 * Single decision per turn for future handleSend wiring. Observe-only today.
 *
 * @see docs/estate/ESTATE_TURN_ORCHESTRATION_PLAN.md
 */

import {
  applyRoutingSuppression,
  cancelActiveTask,
  completeActiveTask,
  createActiveTaskLockState,
  detectSparkTaskAcknowledgment,
  detectSparkTaskPermissionQuestion,
  detectSparkTaskPromise,
  detectTaskRequest,
  isActiveTaskBlockingRouting,
  isBareAffirmation,
  isEstateInvitationMessage,
  isTaskArtifactDemand,
  isTaskCancellationPhrase,
  isTaskCompletionPhrase,
  isTaskContinuationPhrase,
  isTaskStatusInquiryPhrase,
  isUserCorrectionOverride,
  markTaskDelivering,
  openActiveTask,
  promoteTaskToWorking,
  resolveAffirmationDuringTask,
  shouldSuppressRoomRouting,
  touchActiveTask,
  type ActiveTask,
  type ActiveTaskLockState,
} from "./activeTaskLock";
import { evaluateEstateTurn } from "./estateTurn";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";

export type EstateOrchestrationContext = {
  userText: string;
  lastAssistantText: string | null;
  priorUserText: string | null;
  conversationTurn: number;
  currentPlaceId: string | null;
  workspacePanel: string | null;
  overwhelmed: boolean;
  activeTask: ActiveTask | null;
  taskLockState: ActiveTaskLockState;
  pendingEstateInvitation: boolean;
  inDirectEstateVisit: boolean;
  informationalTurn: boolean;
};

export type EstateOrchestrationDecision =
  | { kind: "continue_task"; task: ActiveTask; reason: string }
  | { kind: "begin_task"; task: ActiveTask; reason: string }
  | { kind: "complete_task"; task: ActiveTask; reason: string }
  | { kind: "cancel_task"; task: ActiveTask; reason: string }
  | {
      kind: "navigate";
      placeId: string;
      reason: string;
      resolutionKind: string;
    }
  | {
      kind: "suggest_places";
      placeIds: readonly string[];
      reason: string;
    }
  | { kind: "invite_place"; placeId: string; reason: string }
  | {
      kind: "stay_conversation";
      suppressRouting: boolean;
      reason: string;
    }
  | { kind: "execute_pending"; pendingKind: "estate" | "collection"; reason: string };

export type EstateOrchestrationResult = {
  decision: EstateOrchestrationDecision;
  nextTaskLockState: ActiveTaskLockState;
  suppressRoomRouting: boolean;
};

export function evaluateEstateOrchestration(
  context: EstateOrchestrationContext,
): EstateOrchestrationResult {
  const userText = context.userText.trim();
  let state = context.taskLockState ?? createActiveTaskLockState();
  let activeTask = context.activeTask ?? state.activeTask;

  if (!userText) {
    return finish({
      kind: "stay_conversation",
      suppressRouting: false,
      reason: "empty turn",
    });
  }

  if (
    context.informationalTurn &&
    !isActiveTaskBlockingRouting(activeTask)
  ) {
    return finish({
      kind: "stay_conversation",
      suppressRouting: shouldSuppressRoomRouting(state, context.conversationTurn),
      reason: "informational turn",
    });
  }

  // Priority 4 — exact place request (beats active task continuation)
  const placeResolution = resolveEstatePlace(userText);
  if (shouldNavigateFromResolution(placeResolution)) {
    if (activeTask) {
      activeTask = cancelActiveTask(activeTask);
      state = { ...state, activeTask: null };
    }
    return finish({
      kind: "navigate",
      placeId: placeResolution.placeId,
      reason: placeResolution.reason,
      resolutionKind: placeResolution.kind,
    });
  }

  // Priority 0 — active task lock / continuation (before correction override)
  if (activeTask) {
    if (isTaskCancellationPhrase(userText)) {
      activeTask = cancelActiveTask(activeTask);
      state = { ...state, activeTask: null };
      return finish({
        kind: "cancel_task",
        task: activeTask,
        reason: "member cancelled task",
      });
    }

    if (isTaskCompletionPhrase(userText)) {
      if (
        activeTask.status === "ready_to_deliver" ||
        activeTask.status === "delivering"
      ) {
        activeTask = completeActiveTask(activeTask, context.conversationTurn);
        state = { ...state, activeTask: null };
        return finish({
          kind: "complete_task",
          task: activeTask,
          reason: "member acknowledged delivery",
        });
      }

      activeTask = touchActiveTask(activeTask, context.conversationTurn);
      state = { ...state, activeTask };
      return finish({
        kind: "continue_task",
        task: activeTask,
        reason: "member closing phrase before delivery — stay on task",
      });
    }

    const affirmation = resolveAffirmationDuringTask({
      userText,
      lastAssistantText: context.lastAssistantText,
      activeTask,
      priorUserText: context.priorUserText,
    });

    if (
      affirmation === "task_continuation" ||
      isTaskContinuationPhrase(userText, activeTask) ||
      isTaskArtifactDemand(userText)
    ) {
      activeTask = touchActiveTask(activeTask, context.conversationTurn);
      if (activeTask.status === "begin") {
        activeTask = promoteTaskToWorking(activeTask, context.conversationTurn);
      }
      if (activeTask.status === "ready_to_deliver") {
        activeTask = markTaskDelivering(activeTask, context.conversationTurn);
      }
      state = { ...state, activeTask };
      return finish({
        kind: "continue_task",
        task: activeTask,
        reason:
          affirmation === "task_continuation"
            ? "affirmation continues active task"
            : isTaskArtifactDemand(userText)
              ? "task artifact demand"
              : "task continuation phrase",
      });
    }

    if (isUserCorrectionOverride(userText)) {
      state = applyRoutingSuppression(state, context.conversationTurn);
      activeTask = touchActiveTask(activeTask, context.conversationTurn);
      state = { ...state, activeTask };
      return finish({
        kind: "stay_conversation",
        suppressRouting: true,
        reason: "user correction override during active task",
      });
    }

    if (isActiveTaskBlockingRouting(activeTask)) {
      if (
        isTaskStatusInquiryPhrase(userText) ||
        !detectTaskRequest(userText, { activeTask })
      ) {
        activeTask = touchActiveTask(activeTask, context.conversationTurn);
        state = { ...state, activeTask };
        return finish({
          kind: "continue_task",
          task: activeTask,
          reason: "active task lock",
        });
      }
    }
  }

  // Recover task lane when member follows up after Spark ack but state was lost
  if (
    !activeTask &&
    context.priorUserText &&
    detectSparkTaskAcknowledgment(context.lastAssistantText) &&
    isTaskStatusInquiryPhrase(userText)
  ) {
    const priorRequest = detectTaskRequest(context.priorUserText);
    if (priorRequest) {
      activeTask = openActiveTask({
        kind: priorRequest.kind,
        topic: priorRequest.topic,
        sourceUserText: context.priorUserText,
        conversationTurn: context.conversationTurn,
        status: "working",
      });
      state = { ...state, activeTask };
      return finish({
        kind: "continue_task",
        task: activeTask,
        reason: "task follow-up after Spark acknowledgment",
      });
    }
  }

  // Priority 1 — user correction override
  if (isUserCorrectionOverride(userText)) {
    state = applyRoutingSuppression(state, context.conversationTurn);
    if (activeTask && activeTask.status !== "cancelled") {
      activeTask = touchActiveTask(activeTask, context.conversationTurn);
      state = { ...state, activeTask };
    }
    return finish({
      kind: "stay_conversation",
      suppressRouting: true,
      reason: "user correction override",
    });
  }

  // Priority 2 — pending estate invitation yes (stub: context flag only in 2A)
  if (
    context.pendingEstateInvitation &&
    isBareAffirmation(userText) &&
    isEstateInvitationMessage(context.lastAssistantText)
  ) {
    return finish({
      kind: "execute_pending",
      pendingKind: "estate",
      reason: "estate invitation accepted",
    });
  }

  // Affirmation after Spark task promise or permission question (before new task detection)
  const affirmation = resolveAffirmationDuringTask({
    userText,
    lastAssistantText: context.lastAssistantText,
    activeTask,
    priorUserText: context.priorUserText,
  });
  if (affirmation === "task_continuation") {
    const priorRequest = context.priorUserText
      ? detectTaskRequest(context.priorUserText)
      : null;
    const permission = detectSparkTaskPermissionQuestion(
      context.lastAssistantText,
    );
    const promise = detectSparkTaskPromise(context.lastAssistantText);
    const kind =
      priorRequest?.kind ??
      permission?.kind ??
      promise?.kind ??
      activeTask?.kind ??
      "research";
    const topic =
      activeTask?.topic ??
      priorRequest?.topic ??
      context.priorUserText?.trim() ??
      "requested work";

    if (activeTask && isActiveTaskBlockingRouting(activeTask)) {
      activeTask = touchActiveTask(activeTask, context.conversationTurn);
      if (activeTask.status === "begin") {
        activeTask = promoteTaskToWorking(activeTask, context.conversationTurn);
      }
      state = { ...state, activeTask };
      return finish({
        kind: "continue_task",
        task: activeTask,
        reason: permission
          ? "yes after Spark task permission question"
          : "yes after Spark task promise",
      });
    }

    activeTask = openActiveTask({
      kind,
      topic,
      sourceUserText: context.priorUserText ?? userText,
      conversationTurn: context.conversationTurn,
      status: "working",
    });
    state = { ...state, activeTask };
    return finish({
      kind: priorRequest ? "continue_task" : "begin_task",
      task: activeTask,
      reason: permission
        ? "yes after Spark task permission question"
        : "yes after Spark task promise",
    });
  }

  // Priority 5 — explicit new task request
  const taskRequest = detectTaskRequest(userText, { activeTask });
  if (taskRequest) {
    activeTask = openActiveTask({
      kind: taskRequest.kind,
      topic: taskRequest.topic,
      sourceUserText: userText,
      conversationTurn: context.conversationTurn,
    });
    state = { ...state, activeTask };
    return finish({
      kind: "begin_task",
      task: activeTask,
      reason: `explicit ${taskRequest.kind} request`,
    });
  }

  // Spark promised work on prior turn without member re-request
  const sparkPromise = detectSparkTaskPromise(context.lastAssistantText);
  if (sparkPromise && context.priorUserText) {
    const priorRequest = detectTaskRequest(context.priorUserText);
    if (priorRequest && priorRequest.kind === sparkPromise.kind) {
      activeTask = openActiveTask({
        kind: priorRequest.kind,
        topic: priorRequest.topic,
        sourceUserText: context.priorUserText,
        conversationTurn: context.conversationTurn,
        status: "working",
      });
      state = { ...state, activeTask };
      return finish({
        kind: "begin_task",
        task: activeTask,
        reason: "Spark accepted deliverable on prior turn",
      });
    }
  }

  // Priority 9 — emotional / need suggestion (blocked when routing suppressed)
  const routingSuppressed = shouldSuppressRoomRouting(
    state,
    context.conversationTurn,
  );
  if (!routingSuppressed && !activeTask) {
    const needTurn = evaluateEstateTurn(userText);
    if (needTurn.mode === "invite" && needTurn.primaryPlaceId) {
      return finish({
        kind: "invite_place",
        placeId: needTurn.primaryPlaceId,
        reason: needTurn.reason,
      });
    }
    if (needTurn.mode === "suggest" && needTurn.placeIds.length > 0) {
      return finish({
        kind: "suggest_places",
        placeIds: needTurn.placeIds,
        reason: needTurn.reason,
      });
    }
  }

  // Priority 10 — stay in conversation
  return finish({
    kind: "stay_conversation",
    suppressRouting: routingSuppressed,
    reason: routingSuppressed
      ? "routing suppressed — active task or correction window"
      : "general conversation",
  });

  function finish(decision: EstateOrchestrationDecision): EstateOrchestrationResult {
    const suppressRoomRouting =
      decision.kind === "stay_conversation"
        ? decision.suppressRouting
        : decision.kind === "continue_task" ||
            decision.kind === "begin_task" ||
            shouldSuppressRoomRouting(state, context.conversationTurn);

    return {
      decision,
      nextTaskLockState: state,
      suppressRoomRouting,
    };
  }
}

export function shouldOrchestratorSuppressRoomRouting(
  result: EstateOrchestrationResult,
): boolean {
  return result.suppressRoomRouting;
}

export function orchestrationWouldRouteToPlace(
  decision: EstateOrchestrationDecision,
): boolean {
  return (
    decision.kind === "navigate" ||
    decision.kind === "invite_place" ||
    decision.kind === "suggest_places" ||
    decision.kind === "execute_pending"
  );
}
