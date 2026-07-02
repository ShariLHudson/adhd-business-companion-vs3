import { describe, expect, it } from "vitest";
import {
  recoverEstateWorkspaceOfferFromChat,
  registerEstateWorkspaceOfferFromAssistant,
} from "./estateOfferContinuation";

describe("estateOfferContinuation", () => {
  it("registers Creative Studio pending from assistant invitation", () => {
    const pending = registerEstateWorkspaceOfferFromAssistant({
      assistantText:
        "The Creative Studio™ is a good place to map out the funnel together. Would you like me to take us there?",
      priorUserText: "i need help creating a sales funnel",
      offeredAtTurn: 3,
    });
    expect(pending?.target).toBe("content-generator");
    expect(pending?.initialPrompt).toBe("i need help creating a sales funnel");
  });

  it("recovers pending for yes after studio offer", () => {
    const pending = recoverEstateWorkspaceOfferFromChat({
      lastAssistantText:
        "I can help build that.\n\nThe Creative Studio™ is a good place to map out the funnel together. Would you like me to take us there?",
      priorUserText: "i need help creating a sales funnel",
      currentTurn: 5,
    });
    expect(pending?.target).toBe("content-generator");
    expect(pending?.artifactType).toBe("Sales Funnel");
  });
});
