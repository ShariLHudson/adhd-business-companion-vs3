import { describe, expect, it } from "vitest";
import { buildCompanionSystemPrompt } from "../companionPrompt";
import {
  detectForbiddenHumanConversationOpener,
  detectHumanConversationViolation,
  enforceHumanConversation,
  HUMAN_CONVERSATION_PROMPT_BLOCK,
  humanConversationHintForChat,
  containsForbiddenHumanConversationPhrase,
  pickCuriosityOpener,
} from "./index";

describe("Human Conversation", () => {
  it("embeds constitutional block in system prompt", () => {
    const prompt = buildCompanionSystemPrompt("today", "text");
    expect(prompt).toContain("HUMAN CONVERSATION");
    expect(prompt).toContain("CONTEXT BEFORE CONTENT");
    expect(prompt).toContain("SUNROOM TEST");
    expect(prompt).toContain("CURIOSITY INTELLIGENCE");
    expect(prompt).toContain("I'm glad I asked");
  });

  it("prompt block forbids AI template openers", () => {
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toMatch(/It sounds like/i);
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toMatch(/Many people with ADHD/i);
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toMatch(/STOP EXPLAINING ADHD/i);
  });

  it("detects forbidden openers", () => {
    expect(
      detectForbiddenHumanConversationOpener(
        "It sounds like you're overwhelmed today.",
      ),
    ).toBeTruthy();
    expect(
      detectForbiddenHumanConversationOpener(
        "Many people with ADHD struggle with this.",
      ),
    ).toBeTruthy();
    expect(
      detectForbiddenHumanConversationOpener(
        "You know what's interesting? You might be closer than you think.",
      ),
    ).toBeNull();
  });

  it("detects forbidden ADHD lecture phrases in body", () => {
    expect(
      containsForbiddenHumanConversationPhrase(
        "Executive function makes this hard for everyone.",
      ),
    ).toBeTruthy();
  });

  it("rewrites forbidden opener with curiosity language", () => {
    const result = enforceHumanConversation({
      response:
        "It sounds like you're feeling stuck. That tension between starting and finishing is real.\n\nWhat's one piece that feels heaviest?",
      userText: "I keep starting new things",
    });
    expect(result.rewritten).toBe(true);
    expect(result.message).not.toMatch(/^It sounds like/i);
    expect(result.message).toMatch(
      /caught my attention|understand|curious|wonder|interesting/i,
    );
    expect(result.twelveTests.score).toBeGreaterThan(0);
  });

  it("leaves human openers unchanged", () => {
    const human =
      "I've noticed you keep circling back to the same project. Does that feel accurate?\n\nWhat would make today feel lighter?";
    const result = enforceHumanConversation({ response: human });
    expect(result.rewritten).toBe(false);
    expect(result.message).toBe(human);
    expect(result.twelveTests.passed).toBe(true);
  });

  it("embeds twelve tests in constitutional prompt", () => {
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toContain("TWELVE TESTS");
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toContain(
      "Did I answer what they actually meant?",
    );
    expect(HUMAN_CONVERSATION_PROMPT_BLOCK).toContain("CONVERSATION HIERARCHY");
  });

  it("turn hint includes sunroom test and intelligence voice", () => {
    const hint = humanConversationHintForChat({
      userText: "What are the latest Pinterest trends?",
      emotionalState: "unclear",
    });
    expect(hint).toContain("HUMAN CONVERSATION");
    expect(hint).toContain("CONTEXT BEFORE CONTENT");
    expect(hint).toContain("SUNROOM TEST");
    expect(hint).toMatch(/Research turn|glad I asked/i);
  });

  it("turn hint includes yes rule for affirmations", () => {
    const hint = humanConversationHintForChat({
      userText: "yes",
      emotionalState: "overwhelmed",
    });
    expect(hint).toMatch(/YES RULE/i);
  });

  it("uses gentle curiosity when requested", () => {
    const opener = pickCuriosityOpener(2, true);
    expect(opener).toMatch(/here|breath|rush|thoughtful|noticed/i);
  });
});
