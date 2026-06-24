import { describe, expect, it } from "vitest";
import {
  continuationForGuidedWorkflow,
  createConversationWorkflow,
} from "../conversationWorkflowContinuation";
import { isForbiddenResetMessage } from "./acceptedIntentLock";

describe("guided_continue acceptance", () => {
  it("does not reset with generic what-next phrasing", () => {
    const assistant =
      "Would you like to walk through this together and compare your options?";
    const workflow = createConversationWorkflow(assistant, 4);
    expect(workflow?.kind).toBe("guided_continue");

    const result = continuationForGuidedWorkflow(workflow!, {
      currentProblem: "adding a new product line",
    });
    expect(result.action).toBe("reply");
    expect(result.message).not.toMatch(/next piece you want to look at/i);
    expect(isForbiddenResetMessage(result.message)).toBe(false);
  });

  it("opens decision compass when offer names it", () => {
    const assistant =
      "Would you like to walk through it in **Decision Compass** — comparing keep both, replace, or phasing in?";
    const workflow = createConversationWorkflow(assistant, 5);
    const result = continuationForGuidedWorkflow(workflow!);
    expect(result.action).toBe("open_section");
    if (result.action === "open_section") {
      expect(result.section).toBe("decision-compass");
    }
  });
});
