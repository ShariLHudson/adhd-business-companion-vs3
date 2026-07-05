/**
 * Fresh turn isolation — a failed turn must not block the next message.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { shouldCompleteRelationshipChatLocally } from "@/lib/chatFastPath/relationshipChatLocal";
import { isSimpleCreateRequest } from "@/lib/universalCreation";
import {
  assertPipelineTurnContinuable,
  commitPipelineTurnOwner,
  finalizePipelineTurn,
  getActivePipelineTrace,
  getPipelineTraceLog,
  isPipelineTurnSealed,
  ownerExecutionComplete,
  ownerExecutionStart,
  ownerExecutionFail,
  resetTransientPipelineState,
  resetPipelineTraceLog,
  sealPipelineTurn,
  startPipelineTurn,
} from "./conversationPipelineTrace";

describe("freshConversationTurn", () => {
  beforeEach(() => {
    resetPipelineTraceLog();
  });

  it("relationship failure then CREATE — previous lock has zero influence", () => {
    const relationshipText = "I hope you are having a good day.";

    startPipelineTurn({
      turn: 1,
      rawMessage: relationshipText,
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    ownerExecutionStart("relationship_chat", "companion_api");
    ownerExecutionFail(
      new Error("companion-chat-timeout"),
      "Something got tangled for a second, but I'm still here.",
    );
    sealPipelineTurn("relationship_chat_owner_complete");
    expect(isPipelineTurnSealed()).toBe(true);
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(false);

    resetTransientPipelineState("incoming_message");

    expect(isPipelineTurnSealed()).toBe(false);
    expect(getActivePipelineTrace()).toBeNull();
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(true);

    const createText = "Help me create a marketing plan.";
    const createDecision = classifyPrimaryConversationTurn({
      userText: createText,
      lastAssistantText:
        "Something got tangled for a second, but I'm still here.",
    });

    expect(createDecision.type).toBe("TASK_REQUEST");
    expect(shouldCompleteRelationshipChatLocally(createDecision, createText)).toBe(
      false,
    );
    expect(isSimpleCreateRequest(createText)).toBe(true);

    startPipelineTurn({
      turn: 2,
      rawMessage: createText,
      owner: "frictionless:universal_creation",
      intent: "TASK_REQUEST",
    });
    commitPipelineTurnOwner(
      "frictionless:universal_creation",
      "create_fast_path",
    );
    ownerExecutionStart("frictionless:universal_creation", "create_fast_path");
    expect(assertPipelineTurnContinuable("create_fast_path")).toBe(true);
    ownerExecutionComplete();
    finalizePipelineTurn();

    const completed = getPipelineTraceLog().at(-1);
    expect(completed?.owner).toBe("frictionless:universal_creation");
    expect(completed?.ownerComplete).toBe(true);
    expect(isPipelineTurnSealed()).toBe(true);

    resetTransientPipelineState("incoming_message");
    expect(isPipelineTurnSealed()).toBe(false);
    expect(assertPipelineTurnContinuable("create_terminal")).toBe(true);
  });

  it("resetTransientPipelineState clears blocked owner without flushing history", () => {
    startPipelineTurn({
      turn: 1,
      rawMessage: "hello",
      owner: "relationship_chat",
      intent: "RELATIONSHIP_CHAT",
    });
    ownerExecutionStart("relationship_chat", "companion_api");
    expect(getActivePipelineTrace()?.ownerComplete).toBe(false);

    resetTransientPipelineState("incoming_message");

    expect(getActivePipelineTrace()).toBeNull();
    expect(isPipelineTurnSealed()).toBe(false);
  });
});
