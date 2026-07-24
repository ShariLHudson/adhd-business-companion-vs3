/**
 * UI-handler integration tests — exercise the same decision gates CompanionPageClient uses.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { isInformationalChatTurn } from "@/lib/chatFastPath/chatTurnGuarantee";
import {
  classifyRequestedArtifactType,
  detectStrategyEntryMode,
  processIntentWorkflowOnUserTurn,
} from "@/lib/conversationStabilization/intentClassificationGate";
import { resetIntentWorkflowStoreForTests } from "@/lib/conversationStabilization/intentWorkflowStore";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import {
  decideShariResponse,
  shariAnswerFirstHintForChat,
  shouldBlockImmediateExperienceOpen,
  shouldSuppressRouteBeforeAnswer,
} from "./index";

beforeEach(() => {
  resetIntentWorkflowStoreForTests();
});

describe("answer-first handler gates (CompanionPageClient path)", () => {
  const scenarios = [
    "How do I set up a vendor table or booth at an event?",
    "How do I find Facebook groups where I can market my business?",
    "How do I create a strategic plan?",
    "What should a client intake form include?",
    "Give me ideas for promoting my webinar.",
    "Do you think it is worth paying for a vendor booth at this event?",
    "My QR code will not scan from my computer screen.",
    "I keep putting off contacting people about my platform.",
  ];

  it("ordinary help turns prefer chat and block immediate experience opens", () => {
    for (const text of scenarios) {
      const d = decideShariResponse(text);
      expect(d.directAnswerRequired, text).toBe(true);
      expect(shouldSuppressRouteBeforeAnswer(d), text).toBe(true);
      expect(shouldBlockImmediateExperienceOpen(d), text).toBe(true);
      expect(isInformationalChatTurn(text), text).toBe(true);
      expect(isSimpleCreateRequest(text), text).toBe(false);
      expect(shariAnswerFirstHintForChat(d)).toMatch(/ANSWER-FIRST/);
    }
  });

  it("strategy education does not claim intent-workflow strategyAction", () => {
    const text = "How do I set up a strategic plan?";
    expect(classifyRequestedArtifactType(text)).toBe("unknown");
    expect(detectStrategyEntryMode(text)).toBeNull();
    const result = processIntentWorkflowOnUserTurn({
      userText: text,
      turn: 1,
      activeOwner: { kind: "general_chat" },
    });
    expect(result.strategyAction).toBeNull();
  });

  it("explicit creation and navigation still route", () => {
    const create = decideShariResponse(
      "Create a strategic plan for my business.",
    );
    expect(create.routingAllowed).toBe(true);
    expect(shouldSuppressRouteBeforeAnswer(create)).toBe(false);

    const nav = decideShariResponse("Take me to the Research Library.");
    expect(nav.routingAllowed).toBe(true);
    expect(nav.directAnswerRequired).toBe(false);
    expect(shouldBlockImmediateExperienceOpen(nav)).toBe(false);
  });
});
