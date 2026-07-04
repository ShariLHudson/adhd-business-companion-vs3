/**
 * Conversation turn pipeline — timeout recovery and dev logging.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LAYER_TIMEOUT_MS,
  logPipelineTurnFailure,
  runReliableSyncLayer,
} from "./conversationTurnPipeline";

describe("conversationTurnPipeline", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.__sparkConversationPipelineLog = [];
    }
  });

  it("returns result when layer completes within budget", () => {
    const result = runReliableSyncLayer(
      "decision_engine",
      () => "ok",
      "fallback",
      { turn: 1, userText: "hello" },
    );
    expect(result).toBe("ok");
  });

  it("returns fallback and logs when layer throws", () => {
    const priorLogLen =
      typeof window !== "undefined"
        ? (window.__sparkConversationPipelineLog?.length ?? 0)
        : 0;
    const result = runReliableSyncLayer(
      "frictionless",
      () => {
        throw new Error("routing confusion");
      },
      null,
      { turn: 2, userText: "garden", intent: "DIRECT_COMMAND" },
    );
    expect(result).toBeNull();
    if (typeof window !== "undefined") {
      expect(window.__sparkConversationPipelineLog?.length).toBeGreaterThan(
        priorLogLen,
      );
      const last = window.__sparkConversationPipelineLog?.at(-1);
      expect(last?.recovered).toBe(true);
      expect(last?.failureReason).toContain("routing confusion");
      expect(last?.selectedHandler).toBe("recovered:frictionless");
    }
  });

  it("logs turn failure with elapsed time", () => {
    if (typeof window === "undefined") return;
    logPipelineTurnFailure({
      turn: 3,
      userText: "help me plan",
      intent: "TASK_REQUEST",
      failureReason: "companion-chat-timeout",
      elapsedMs: LAYER_TIMEOUT_MS.companion_chat,
      selectedHandler: "companion_api",
    });
    const last = window.__sparkConversationPipelineLog?.at(-1);
    expect(last?.failureReason).toBe("companion-chat-timeout");
    expect(last?.recovered).toBe(true);
    expect(last?.elapsedMs).toBe(LAYER_TIMEOUT_MS.companion_chat);
  });
});
