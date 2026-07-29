/**
 * Regression: an exploratory / aspirational / ideation use of "create" must not
 * open the Create workspace, even when a creation-family keyword (course, plan,
 * membership, …) is present. Only genuine execution intent — or an explicit
 * research→creation handoff — opens Create.
 */
import { describe, expect, it } from "vitest";

import { runRequestIntoCreationWorkspace } from "./runRequestIntoCreationWorkspace";
import { understandUniversalRequest } from "@/lib/universalRequestOutcome/understandRequest";
import { isExplicitCreationRequest } from "@/lib/messageClassification";

function opens(text: string, handoff = false): boolean {
  return runRequestIntoCreationWorkspace(text, {
    persist: false,
    fromResearchUse: handoff,
  }).openDecision.open;
}

describe("exploratory 'create' does not open Create", () => {
  const NO_OPEN = [
    "I want to create some AI innovations to help me in my business.",
    "What AI innovations could I create for my business?",
    "Help me brainstorm AI innovations I could create.",
    "I'm thinking about creating a course.",
    "Help me decide whether to create a membership.",
    "How can I create recurring revenue?",
    "I create handmade journals.",
    "This could create a problem.",
    "Who created this framework?",
    "What does it take to create an advisory board?",
    "My goal is to create a new service.",
    // Robustness: exploratory framing that DOES carry a family keyword
    // (course / business plan) must still stay in conversation.
    "I'm thinking about creating a business plan someday.",
    "I've been thinking about building a course for my clients.",
  ];

  it.each(NO_OPEN)("does not open Create: %s", (text) => {
    expect(opens(text)).toBe(false);
    expect(understandUniversalRequest(text).primaryIntent).not.toBe("create");
  });
});

describe("genuine execution intent still opens Create", () => {
  const OPEN = [
    "Create a business plan for my AI innovation.",
    "Draft an AI innovation roadmap for my business.",
    "Turn these ideas into an AI innovation plan.",
    "Make a marketing plan from this.",
    "Create this document for me.",
  ];

  it.each(OPEN)("opens Create: %s", (text) => {
    expect(opens(text)).toBe(true);
  });
});

describe("explicit navigation and research→creation handoff are preserved", () => {
  it("explicit 'Open Create' is still recognized as an explicit creation request", () => {
    expect(isExplicitCreationRequest("Open Create.")).toBe(true);
    expect(isExplicitCreationRequest("Create this document for me.")).toBe(true);
  });

  it("explicit research→creation handoff still opens Create", () => {
    expect(
      opens("Use this research to write a marketing plan.", true),
    ).toBe(true);
  });

  it("'Use this research to create an advisory board' opens Create WITH the handoff", () => {
    expect(opens("Use this research to create an advisory board.", true)).toBe(true);
  });

  it("the same advisory-board wording WITHOUT the handoff follows the ordinary classifier (no auto-open)", () => {
    expect(opens("Use this research to create an advisory board.")).toBe(false);
  });
});

describe("ordinary conversational questions stay in conversation", () => {
  it("exploratory questions are not explicit creation requests either", () => {
    for (const q of [
      "I want to create some AI innovations to help me in my business.",
      "What could I create for my clients?",
      "I'm thinking about creating a course.",
    ]) {
      expect(isExplicitCreationRequest(q)).toBe(false);
    }
  });
});
