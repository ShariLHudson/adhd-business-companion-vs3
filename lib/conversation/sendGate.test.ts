/**
 * Send gate regression — failed prior turn must not block the next message.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import { isCreateTerminalDecision } from "@/lib/conversation/createTerminalOwner";
import {
  assertPipelineTurnContinuable,
  finalizePipelineTurn,
  ownerExecutionComplete,
  ownerExecutionStart,
  resetPipelineTraceLog,
  resetTransientPipelineState,
  sealPipelineTurn,
  startPipelineTurn,
} from "@/lib/conversation/conversationPipelineTrace";
import {
  buildSendGateSnapshot,
  canSendChatMessage,
  getSendAttemptLog,
  logSendAttempt,
  resetSendAttemptLog,
  uiSendGateBlocked,
} from "@/lib/conversation/sendGateDiagnostics";

const CREATE_TEXT = "help me create an SOP";

describe("send gate", () => {
  beforeEach(() => {
    resetPipelineTraceLog();
    resetSendAttemptLog();
  });

  it("does not block send when isSending/isLoading is true", () => {
    expect(uiSendGateBlocked(CREATE_TEXT, true)).toBeNull();
    expect(canSendChatMessage(CREATE_TEXT)).toBe(true);
  });

  it("blocks only empty trim", () => {
    expect(uiSendGateBlocked("   ", false)).toBe("empty_trim");
    expect(uiSendGateBlocked("create an SOP", false)).toBeNull();
  });

  it("stuck prior turn — reset clears seal so next CREATE send is accepted", () => {
    startPipelineTurn({
      turn: 1,
      rawMessage: "I hope you are having a good day",
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    ownerExecutionStart("relationship_chat", "companion_api");
    sealPipelineTurn("relationship_chat_owner_complete");
    ownerExecutionFailSimulation();

    expect(assertPipelineTurnContinuable("companion_api")).toBe(false);

    const preReset = buildSendGateSnapshot({
      rawText: CREATE_TEXT,
      trimmedText: CREATE_TEXT,
      isSending: true,
      isThinking: true,
      isStreaming: false,
    });
    expect(preReset.turnSealed).toBe(true);

    resetTransientPipelineState("incoming_message");

    const postReset = buildSendGateSnapshot({
      rawText: CREATE_TEXT,
      trimmedText: CREATE_TEXT,
      isSending: false,
      isThinking: false,
      isStreaming: false,
    });
    expect(postReset.turnSealed).toBe(false);
    expect(assertPipelineTurnContinuable("create_terminal")).toBe(true);

    const engine = evaluateSparkDecisionEngine({ userText: CREATE_TEXT });
    expect(isCreateTerminalDecision(engine)).toBe(true);

    logSendAttempt({
      ...postReset,
      returnReasonIfBlocked: null,
    });
    expect(getSendAttemptLog().at(-1)?.returnReasonIfBlocked).toBeNull();
  });

  it("SEND_ATTEMPT log records create message with no block reason", () => {
    const snapshot = logSendAttempt(
      buildSendGateSnapshot({
        rawText: CREATE_TEXT,
        trimmedText: CREATE_TEXT,
        isSending: false,
        isThinking: false,
        isStreaming: false,
      }),
    );
    expect(snapshot.returnReasonIfBlocked).toBeNull();
    expect(snapshot.trimmedText).toBe(CREATE_TEXT);
  });
});

function ownerExecutionFailSimulation(): void {
  ownerExecutionComplete();
  finalizePipelineTurn();
}
