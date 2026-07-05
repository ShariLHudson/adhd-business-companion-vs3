import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { createFastPathRecoveryLine } from "@/lib/universalCreation/createFastPath";
import {
  isVagueHelpRequest,
  vagueHelpLocalReply,
} from "./vagueHelpLocal";

describe("vagueHelpLocal", () => {
  it.each(["i need help", "help me", "Help me.", "not sure what i need"])(
    "detects vague help: %s",
    (text) => {
      expect(isVagueHelpRequest(text)).toBe(true);
    },
  );

  it("replies warmly without builder or generic fallback copy", () => {
    const reply = vagueHelpLocalReply();
    expect(reply).toMatch(/glad you said/i);
    expect(reply).not.toMatch(/builder|tell me what you need/i);
  });

  it("does not route bare help through create recovery", () => {
    const text = "i need help";
    const primary = classifyPrimaryConversationTurn({ userText: text });
    const frictionless = resolveFrictionlessAction({
      userText: text,
      primaryTurn: primary,
      currentTurn: 1,
    });
    expect(frictionless.localReply).not.toBe(createFastPathRecoveryLine(text));
    if (frictionless.localReply) {
      expect(frictionless.localReply).not.toMatch(/builder|ran into a problem/i);
    }
  });
});
