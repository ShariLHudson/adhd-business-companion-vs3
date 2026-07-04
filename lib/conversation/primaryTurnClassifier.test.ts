import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import {
  classifyPrimaryConversationTurn,
  primaryTurnAllowsKernel,
} from "./primaryTurnClassifier";

describe("primaryTurnClassifier", () => {
  const CASES = [
    {
      text: "I hope you're having a good day.",
      type: "RELATIONSHIP_CHAT",
      owner: "chat",
    },
    {
      text: "I need a cup of coffee.",
      type: "IMPLIED_NEED",
      owner: "frictionless:implied_need",
    },
    {
      text: "Take me to the Coffee House.",
      type: "DIRECT_COMMAND",
      owner: "kernel",
    },
    {
      text: "Help me create an SOP.",
      type: "TASK_REQUEST",
      owner: "frictionless:discovery",
    },
    {
      text: "I'm overwhelmed.",
      type: "EMOTIONAL_SUPPORT",
      owner: "frictionless:support",
    },
    {
      text: "Research AI tools for coaches.",
      type: "INFORMATION_OR_RESEARCH",
      owner: "chat:research",
    },
  ] as const;

  it.each(CASES)("$type — $text", ({ text, type, owner }) => {
    const decision = classifyPrimaryConversationTurn({ userText: text });
    expect(decision.type).toBe(type);
    expect(decision.owner).toBe(owner);
    expect(decision.confidence).toBe("high");
    expect(decision.blockSecondaryResponders).toBe(true);
    if (type === "DIRECT_COMMAND") {
      expect(primaryTurnAllowsKernel(decision)).toBe(true);
    } else {
      expect(primaryTurnAllowsKernel(decision)).toBe(false);
      expect(decision.blockKernelNavigation).toBe(true);
    }
  });

  it("relationship chat blocks collection and bridge overwrite", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "Thank you.",
    });
    expect(decision.blockCollectionOffer).toBe(true);
    expect(decision.blockBridgeResponder).toBe(true);
  });

  it("implied need blocks kernel navigation", () => {
    const decision = classifyPrimaryConversationTurn({
      userText: "I need a break.",
    });
    expect(decision.type).toBe("IMPLIED_NEED");
    expect(decision.blockKernelNavigation).toBe(true);
  });

  it("primary ownership routes frictionless by type only", () => {
    const coffee = classifyPrimaryConversationTurn({
      userText: "I need a cup of coffee.",
    });
    const coffeeFrictionless = resolveFrictionlessAction({
      userText: "I need a cup of coffee.",
      currentTurn: 1,
      primaryTurn: coffee,
    });
    expect(coffeeFrictionless.category).toBe("implied_need");
    expect(coffeeFrictionless.localReply).toMatch(/Coffee House/i);

    const relationship = classifyPrimaryConversationTurn({
      userText: "I hope you're having a good day.",
    });
    const chatFrictionless = resolveFrictionlessAction({
      userText: "I hope you're having a good day.",
      currentTurn: 2,
      primaryTurn: relationship,
    });
    expect(chatFrictionless.category).toBe("none");

    const task = classifyPrimaryConversationTurn({
      userText: "Help me create an SOP.",
    });
    const taskFrictionless = resolveFrictionlessAction({
      userText: "Help me create an SOP.",
      currentTurn: 3,
      primaryTurn: task,
    });
    expect(taskFrictionless.category).toBe("universal_creation");
  });
});
