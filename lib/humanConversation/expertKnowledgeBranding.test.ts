import { describe, expect, it } from "vitest";
import {
  detectExpertAttributionIssues,
  memberRequestedExpertAttribution,
  scrubExpertAttribution,
  SPARK_EXPERT_KNOWLEDGE_BRANDING_PROMPT,
} from "./expertKnowledgeBranding";
import { SPARK_HUMAN_VOICE_PROMPT_BLOCK } from "./sparkHumanVoice";
import { enforceHumanConversation } from "./enforceHumanConversation";

describe("expert knowledge branding (136)", () => {
  it("prompt block is included in human voice", () => {
    expect(SPARK_EXPERT_KNOWLEDGE_BRANDING_PROMPT).toMatch(/named experts/i);
    expect(SPARK_HUMAN_VOICE_PROMPT_BLOCK).toMatch(/EXPERT KNOWLEDGE BRANDING/i);
  });

  it("detects named-expert attribution", () => {
    const issues = detectExpertAttributionIssues(
      "Stephen Covey says prioritize important but non-urgent work.",
    );
    expect(issues.length).toBeGreaterThan(0);
  });

  it("scrubs Covey-style attribution into Spark voice", () => {
    const { text, rewritten } = scrubExpertAttribution(
      "Stephen Covey says prioritize important but non-urgent work.",
    );
    expect(rewritten).toBe(true);
    expect(text.toLowerCase()).not.toMatch(/covey/);
    expect(text.toLowerCase()).toMatch(/prioritize|proven/);
  });

  it("scrubs according-to wrappers", () => {
    const { text, rewritten } = scrubExpertAttribution(
      "According to Brené Brown, courage starts with vulnerability.",
    );
    expect(rewritten).toBe(true);
    expect(text.toLowerCase()).not.toMatch(/according to/);
    expect(text.toLowerCase()).toMatch(/courage|vulnerability/);
  });

  it("allows attribution when the member asks who said it", () => {
    const user = "Who said to put important but non-urgent work first?";
    expect(memberRequestedExpertAttribution(user)).toBe(true);
    const { rewritten } = scrubExpertAttribution(
      "Stephen Covey said to prioritize important but non-urgent work.",
      user,
    );
    expect(rewritten).toBe(false);
    expect(detectExpertAttributionIssues(
      "Stephen Covey said to prioritize important but non-urgent work.",
      user,
    )).toHaveLength(0);
  });

  it("enforceHumanConversation applies expert scrub", () => {
    const result = enforceHumanConversation({
      response:
        "According to Stephen Covey, prioritize important but non-urgent work first.",
    });
    expect(result.rewritten).toBe(true);
    expect(result.message.toLowerCase()).not.toMatch(/according to stephen/);
  });
});
