import { describe, expect, it } from "vitest";

import {
  getDecisionBoardDiscussion,
  getMissionBoardDiscussion,
  getQuestionBoardDiscussion,
} from "./advisoryCouncilBridge";

describe("Founder Advisory Council bridge", () => {
  it("getMissionBoardDiscussion resolves default listening-rooms mission", () => {
    const discussion = getMissionBoardDiscussion("listening-rooms");
    expect(discussion).not.toBeNull();
    expect(discussion!.topicId).toBe("listening-rooms");
    expect(discussion!.perspectiveCount).toBe(7);
  });

  it("getQuestionBoardDiscussion maps executive questions to topics", () => {
    const discussion = getQuestionBoardDiscussion("product-build-next");
    expect(discussion?.topicId).toBe("listening-rooms");
  });

  it("getDecisionBoardDiscussion maps decision vault entries", () => {
    const discussion = getDecisionBoardDiscussion("dec-invest-restart");
    expect(discussion?.topicId).toBe("listening-rooms");
  });

  it("getMissionBoardDiscussion falls back to missionIds on unmapped mission", () => {
    const discussion = getMissionBoardDiscussion("marketing-launch");
    expect(discussion?.topicId).toBe("automation-studio");
  });
});
