import { describe, expect, it } from "vitest";
import { resolveEstateAction } from "./resolveEstateAction";
import { evaluateEstatePlaceTurn } from "../estatePlaceNavigation";
import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";

describe("cafe and coffee house navigation", () => {
  const cafePhrases = [
    "i don't want to talk, i want to go to the cafe",
    "take me to the cafe",
    "go to the coffee house",
  ];

  for (const text of cafePhrases) {
    it(`"${text}" → coffee-house`, () => {
      const turn = evaluateEstatePlaceTurn({ userText: text });
      expect(turn.type).toBe("navigate");
      if (turn.type === "navigate") {
        expect(turn.command.roomId ?? turn.command.entryId).toBe("coffee-house");
      }

      const decision = resolveEstateAction({ userText: text });
      expect(decision.action).toBe("NAVIGATE");

      const direct = detectDirectCommand(text);
      expect(direct?.roomId ?? direct?.entryId).toBe("coffee-house");
    });
  }

  it("corrects false unknown cafe reply → coffee-house", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "there is one off property",
      lastAssistantText:
        "We don't have Cafe on the Estate. Name a place from the map — or we can stay right here.",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("coffee-house");
    }
  });

  it('"take me there" after Coffee House mention → coffee-house navigation', () => {
    const lastAssistantText =
      "The Coffee House might be a good fit — warm, unhurried, and you do not have to talk if you do not want to.";

    const turn = evaluateEstatePlaceTurn({
      userText: "take me there",
      lastAssistantText,
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("coffee-house");
      expect(turn.command.executeImmediately).toBe(true);
    }

    const decision = resolveEstateAction({
      userText: "take me there",
      lastAssistantText,
    });
    expect(decision.action).toBe("NAVIGATE");

    const direct = detectDirectCommand("take me there", { lastAssistantText });
    expect(direct?.roomId ?? direct?.entryId).toBe("coffee-house");
  });

  it('"yes I would" → NAVIGATE coffee-house without chat fallback', () => {
    const lastAssistantText =
      "The Coffee House could be peaceful — want to head there?";
    const decision = resolveEstateAction({
      userText: "yes I would",
      lastAssistantText,
    });
    expect(decision.action).toBe("NAVIGATE");
    if (decision.action === "NAVIGATE" && decision.target.kind === "place") {
      expect(
        decision.target.command.roomId ?? decision.target.command.entryId,
      ).toBe("coffee-house");
      expect(decision.target.command.executeImmediately).toBe(true);
    }
  });
});
