import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendStuckTurnRecoveryMessage,
  clearConversationTurnWatchdog,
  isConversationTurnWatchdogActive,
  startConversationTurnWatchdog,
  STUCK_TURN_RECOVERY_MESSAGE,
  TURN_WATCHDOG_TIMEOUT_MS,
} from "./conversationTurnWatchdog";
import {
  assertPipelineTurnContinuable,
  isPipelineTurnSealed,
  ownerExecutionFail,
  resetPipelineTraceLog,
  resetTransientPipelineState,
  sealPipelineTurn,
  startPipelineTurn,
} from "./conversationPipelineTrace";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { isSimpleCreateRequest } from "@/lib/universalCreation";

describe("conversationTurnWatchdog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearConversationTurnWatchdog();
    resetPipelineTraceLog();
  });

  afterEach(() => {
    clearConversationTurnWatchdog();
    vi.useRealTimers();
  });

  it("fires after the watchdog timeout", () => {
    const onStuck = vi.fn();
    startConversationTurnWatchdog({ generation: 1, turn: 1 }, onStuck, 100);
    expect(isConversationTurnWatchdogActive(1)).toBe(true);
    vi.advanceTimersByTime(99);
    expect(onStuck).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onStuck).toHaveBeenCalledWith({ generation: 1, turn: 1 });
    expect(isConversationTurnWatchdogActive(1)).toBe(false);
  });

  it("does not fire after clearConversationTurnWatchdog", () => {
    const onStuck = vi.fn();
    startConversationTurnWatchdog({ generation: 2, turn: 2 }, onStuck, 100);
    clearConversationTurnWatchdog();
    vi.advanceTimersByTime(200);
    expect(onStuck).not.toHaveBeenCalled();
  });

  it("appendStuckTurnRecoveryMessage removes empty assistant placeholder", () => {
    const next = appendStuckTurnRecoveryMessage([
      { role: "user", content: "hello" },
      { role: "assistant", content: "" },
    ]);
    expect(next).toEqual([
      { role: "user", content: "hello" },
      { role: "assistant", content: STUCK_TURN_RECOVERY_MESSAGE },
    ]);
  });

  it("stuck turn reset allows the next CREATE message to proceed", () => {
    startPipelineTurn({
      turn: 1,
      rawMessage: "I hope you are having a good day.",
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    sealPipelineTurn("stuck");
    ownerExecutionFail(
      new Error("turn-watchdog-timeout"),
      STUCK_TURN_RECOVERY_MESSAGE,
    );
    resetTransientPipelineState("turn_watchdog");

    expect(isPipelineTurnSealed()).toBe(false);
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(true);

    const createText = "Help me create a marketing plan.";
    const decision = classifyPrimaryConversationTurn({ userText: createText });
    expect(decision.type).toBe("TASK_REQUEST");
    expect(isSimpleCreateRequest(createText)).toBe(true);
  });

  it("uses a 9 second default budget", () => {
    expect(TURN_WATCHDOG_TIMEOUT_MS).toBeGreaterThanOrEqual(8_000);
    expect(TURN_WATCHDOG_TIMEOUT_MS).toBeLessThanOrEqual(10_000);
  });
});
