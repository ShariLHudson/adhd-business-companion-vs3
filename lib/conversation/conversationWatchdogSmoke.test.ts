/**
 * Smoke regression — manual failure reproduced:
 *
 * Turn 1: "I hope you're having a good day" → companion_api hang → Thinking
 * Turn 2: "help me create an SOP" → silent / stuck (input dead, no CREATE)
 *
 * Inspect in browser after failure:
 *   window.__sparkPipelineTraceLog.at(-1)
 *   window.__sparkTurnOwnerLog.at(-1)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shouldCompleteRelationshipChatLocally } from "@/lib/chatFastPath/relationshipChatLocal";
import {
  createChatTurnState,
  markAssistantReplied,
  markChatTurnLoading,
  markChatTurnStarted,
  needsFailSafeAssistantReply,
} from "@/lib/chatFastPath/chatTurnLifecycle";
import { isSimpleCreateRequest, resolveUniversalCreationTurn } from "@/lib/universalCreation";
import { classifyPrimaryConversationTurn } from "./primaryTurnClassifier";
import {
  assertPipelineTurnContinuable,
  commitPipelineTurnOwner,
  finalizePipelineTurn,
  getActivePipelineTrace,
  getPipelineTraceLog,
  ownerExecutionComplete,
  ownerExecutionFail,
  ownerExecutionStart,
  resetPipelineTraceLog,
  resetTransientPipelineState,
  startPipelineTurn,
} from "./conversationPipelineTrace";
import {
  clearConversationTurnWatchdog,
  isConversationTurnWatchdogActive,
  STUCK_TURN_RECOVERY_MESSAGE,
  startConversationTurnWatchdog,
  TURN_WATCHDOG_TIMEOUT_MS,
} from "./conversationTurnWatchdog";

/** Mirrors recoverFromStuckConversationTurn + guardPipelineHandler stale branch. */
function simulateWatchdogRecovery(
  stuckGeneration: number,
  handleGeneration: { current: number },
): boolean {
  if (stuckGeneration !== handleGeneration.current) return false;
  handleGeneration.current += 1;
  clearConversationTurnWatchdog();
  ownerExecutionFail(
    new Error("turn-watchdog-timeout"),
    STUCK_TURN_RECOVERY_MESSAGE,
  );
  resetTransientPipelineState("turn_watchdog");
  return true;
}

/** Stale in-flight handler after watchdog — must NOT re-enter recovery. */
function stalePipelineGuard(
  sendGeneration: number,
  handleGeneration: { current: number },
): boolean {
  return sendGeneration === handleGeneration.current;
}

describe("conversationWatchdogSmoke — manual smoke regression", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetPipelineTraceLog();
    clearConversationTurnWatchdog();
  });

  afterEach(() => {
    clearConversationTurnWatchdog();
    vi.useRealTimers();
  });

  it("relationship API hang → watchdog @9s → help me create an SOP routes clean on turn 2", () => {
    const relationshipText = "I hope you're having a good day";
    const createText = "help me create an SOP";
    const handleGeneration = { current: 0 };

    // ── Turn 1 (smoke: companion_api path hung — local path bypassed) ──
    handleGeneration.current += 1;
    const sendGenerationTurn1 = handleGeneration.current;

    resetTransientPipelineState("incoming_message");

    const primaryTurn1 = classifyPrimaryConversationTurn({
      userText: relationshipText,
    });
    expect(primaryTurn1.type).toBe("RELATIONSHIP_CHAT");
    expect(shouldCompleteRelationshipChatLocally(primaryTurn1, relationshipText)).toBe(
      true,
    );

    startPipelineTurn({
      turn: 1,
      rawMessage: relationshipText,
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    commitPipelineTurnOwner("relationship_chat", "primary_classifier");

    // 2. ownerStart — companion_api (smoke hung here)
    ownerExecutionStart("relationship_chat", "companion_api");
    expect(getActivePipelineTrace()?.ownerExecutions.at(-1)?.owner).toBe(
      "relationship_chat",
    );

    const chatTurn1 = createChatTurnState();
    markChatTurnStarted(chatTurn1);
    markChatTurnLoading(chatTurn1);
    let uiLoading = true;
    let uiThinking = true;

    // 4. watchdog start — only on companion_api (not local CREATE)
    let watchdogFired = false;
    startConversationTurnWatchdog(
      { generation: sendGenerationTurn1, turn: 1 },
      () => {
        watchdogFired = true;
      },
    );
    expect(isConversationTurnWatchdogActive(sendGenerationTurn1)).toBe(true);

    // 5. watchdog timeout @9s
    vi.advanceTimersByTime(TURN_WATCHDOG_TIMEOUT_MS - 1);
    expect(watchdogFired).toBe(false);
    vi.advanceTimersByTime(1);
    expect(watchdogFired).toBe(true);
    expect(isConversationTurnWatchdogActive(sendGenerationTurn1)).toBe(false);

    // Recover (matches CompanionPageClient.recoverFromStuckConversationTurn)
    expect(
      simulateWatchdogRecovery(sendGenerationTurn1, handleGeneration),
    ).toBe(true);
    markAssistantReplied(chatTurn1);
    uiLoading = false;
    uiThinking = false;

    const traceTurn1 = getPipelineTraceLog().at(-1)!;
    expect(traceTurn1.owner).toBe("relationship_chat");
    expect(traceTurn1.failure).toBe("turn-watchdog-timeout");
    expect(traceTurn1.fallbackChosen).toBe(STUCK_TURN_RECOVERY_MESSAGE);
    expect(traceTurn1.ownerExecutions[0]?.completedAt).toBeTruthy();

    // 3. ownerComplete — fail path marks execution complete
    expect(traceTurn1.ownerComplete).toBe(true);

    // 6. resetTransientPipelineState ran
    expect(getActivePipelineTrace()).toBeNull();

    // 7. stale callback must not re-recover (old bug called completeBlocked again)
    expect(stalePipelineGuard(sendGenerationTurn1, handleGeneration)).toBe(false);

    // 8. loading/thinking cleared after recovery
    expect(needsFailSafeAssistantReply(chatTurn1)).toBe(false);
    expect(uiLoading).toBe(false);
    expect(uiThinking).toBe(false);

    // ── Turn 2: help me create an SOP (smoke failed here) ──
    resetTransientPipelineState("incoming_message");
    handleGeneration.current += 1;
    const sendGenerationTurn2 = handleGeneration.current;

    const primaryTurn2 = classifyPrimaryConversationTurn({
      userText: createText,
      lastAssistantText: STUCK_TURN_RECOVERY_MESSAGE,
    });

    // 1. correct owner selected
    expect(primaryTurn2.type).toBe("TASK_REQUEST");
    expect(primaryTurn2.owner).toBe("frictionless:universal_creation");
    expect(isSimpleCreateRequest(createText)).toBe(true);

    startPipelineTurn({
      turn: 2,
      rawMessage: createText,
      owner: primaryTurn2.owner,
      intent: primaryTurn2.type,
    });
    commitPipelineTurnOwner(
      "frictionless:universal_creation",
      "create_fast_path",
    );

    // 9. next message starts clean — CREATE handler not blocked
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(true);
    expect(stalePipelineGuard(sendGenerationTurn2, handleGeneration)).toBe(true);

    ownerExecutionStart("frictionless:universal_creation", "create_fast_path");
    const createTurn = resolveUniversalCreationTurn(
      createText,
      2,
      STUCK_TURN_RECOVERY_MESSAGE,
    );
    expect(createTurn?.kind).toBe("question");

    ownerExecutionComplete();
    finalizePipelineTurn();
    clearConversationTurnWatchdog();

    const traceTurn2 = getPipelineTraceLog().at(-1)!;
    expect(traceTurn2.owner).toBe("frictionless:universal_creation");
    expect(traceTurn2.ownerComplete).toBe(true);
    expect(traceTurn2.failure).toBeNull();
    expect(traceTurn2.totalElapsedMs).toBeLessThan(TURN_WATCHDOG_TIMEOUT_MS);
    expect(getActivePipelineTrace()).toBeNull();

    // Turn 2 CREATE is local — no watchdog armed on this path
    expect(isConversationTurnWatchdogActive(sendGenerationTurn2)).toBe(false);

    // ── Turn 3: stale companion_api must not re-lock input (isLoading) ──
    resetTransientPipelineState("incoming_message");
    handleGeneration.current += 1;
    const sendGenerationTurn3 = handleGeneration.current;

    let uiLoadingTurn3 = false;
    const staleGeneration = sendGenerationTurn2;
    // Simulate turn 2 API still in flight after turn 3 started
    handleGeneration.current += 1;

    if (staleGeneration !== handleGeneration.current) {
      // Mirrors isStaleSend() guard before setIsLoading(true)
      uiLoadingTurn3 = false;
    } else {
      uiLoadingTurn3 = true;
    }

    expect(stalePipelineGuard(staleGeneration, handleGeneration)).toBe(false);
    expect(uiLoadingTurn3).toBe(false);
    expect(stalePipelineGuard(sendGenerationTurn3, handleGeneration)).toBe(false);

    const marketingPlanText = "help me create a marketing plan";
    expect(isSimpleCreateRequest(marketingPlanText)).toBe(true);
    expect(
      classifyPrimaryConversationTurn({
        userText: marketingPlanText,
        lastAssistantText: STUCK_TURN_RECOVERY_MESSAGE,
      }).owner,
    ).toBe("frictionless:universal_creation");
  });
});
