/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearConversationOwner,
  persistConversationOwner,
} from "./ownerStore";
import { resolveContinuityTurnGate } from "./resolveContinuityGate";
import {
  clearRejectedRecoveryReply,
  detectWorkflowCorrection,
  rememberRejectedRecoveryReply,
  wasRecoveryReplyJustRejected,
} from "./workflowCorrection";
import {
  clearUniversalCreationSession,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
} from "@/lib/universalCreation";
import { getActiveConversationOwner } from "./resolveActiveOwner";

describe("workflowCorrection", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearConversationOwner();
    clearUniversalCreationSession();
    clearRejectedRecoveryReply();
  });

  it("detects document → online event correction", () => {
    const start = startUniversalCreationTurn(
      "Help me create a document for my clients.",
      1,
    )!;
    saveUniversalCreationSession(start.session);
    const owner = getActiveConversationOwner();
    persistConversationOwner(owner);

    const result = detectWorkflowCorrection(
      "I am not creating a document. I am creating an online event.",
      owner,
    );
    expect(result.isCorrection).toBe(true);
    expect(result.correctedIntent).toBe("online_event");
    expect(result.ack.toLowerCase()).toContain("online event");
  });

  it("clears sticky create ownership on correction", () => {
    const start = startUniversalCreationTurn(
      "Help me create a document for my clients.",
      1,
    )!;
    saveUniversalCreationSession(start.session);
    persistConversationOwner(getActiveConversationOwner());

    const gate = resolveContinuityTurnGate({
      userText:
        "I am not creating a document. I am creating an online event.",
    });
    expect(gate.action).toBe("clear_owner_continue");
    if (gate.action === "clear_owner_continue") {
      expect(gate.reason).toBe("workflow_correction");
      expect(gate.correctionAck?.toLowerCase()).toContain("online event");
    }
  });

  it("blocks repeating a rejected recovery reply", () => {
    const reply =
      "We were creating your document. Let's continue from where we left off.";
    rememberRejectedRecoveryReply(reply);
    expect(wasRecoveryReplyJustRejected(reply)).toBe(true);
    expect(wasRecoveryReplyJustRejected("Something else")).toBe(false);
  });
});
