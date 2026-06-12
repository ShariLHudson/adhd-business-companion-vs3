import { describe, expect, it } from "vitest";
import {
  isPriorityDiscussion,
  isTaskDump,
  shouldBlockAutoWorkspaceOpen,
  shouldStayInConversation,
} from "./conversationGating";

describe("conversationGating", () => {
  it("blocks multi-task priority lists", () => {
    expect(
      isPriorityDiscussion(
        "I need to finish my ADHD app, create the sales funnel, emails, and automation.",
      ),
    ).toBe(true);
  });

  it("blocks quantified task dumps", () => {
    expect(
      isTaskDump("write 3 emails, make 4 calls, and post on LinkedIn"),
    ).toBe(true);
    expect(isPriorityDiscussion("write 3 emails and make 4 calls")).toBe(true);
  });

  it("allows single concrete create intent", () => {
    expect(
      isPriorityDiscussion("Write a LinkedIn post about ADHD productivity."),
    ).toBe(false);
  });

  it("detects explicit prioritization language", () => {
    expect(shouldStayInConversation("What should I work on first?")).toBe(true);
  });

  it("allows explicit open during planning mode", () => {
    expect(
      shouldBlockAutoWorkspaceOpen("open create", { stayInConversation: true }),
    ).toBe(false);
    expect(
      shouldBlockAutoWorkspaceOpen("write 3 emails and make 4 calls", {
        stayInConversation: true,
      }),
    ).toBe(true);
  });
});
