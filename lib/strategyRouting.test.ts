import { describe, expect, it } from "vitest";
import {
  absorbBusinessStrategyFromUserMessage,
  bootstrapBusinessStrategySession,
  buildBusinessStrategyDraft,
} from "./businessStrategyBuilder";
import { classifyStrategyIntent, parseStrategyDisambiguationChoice } from "./strategyRouting";

describe("strategyRouting", () => {
  it("detects business create intent", () => {
    expect(classifyStrategyIntent("Help me create a marketing strategy")).toBe(
      "business_create",
    );
  });

  it("detects adhd apply intent", () => {
    expect(classifyStrategyIntent("I'm overwhelmed and can't get started")).toBe(
      "adhd_apply",
    );
  });

  it("flags ambiguous create strategy", () => {
    expect(classifyStrategyIntent("How do I create a strategy?")).toBe("ambiguous");
  });

  it("parses disambiguation replies", () => {
    expect(parseStrategyDisambiguationChoice("ADHD")).toBe("adhd_apply");
    expect(parseStrategyDisambiguationChoice("business")).toBe("business_create");
  });
});

describe("businessStrategyBuilder", () => {
  it("opens with conversational coaching, not a fixed first question", () => {
    const { session, opener } = bootstrapBusinessStrategySession("Marketing Strategy");
    expect(session.phase).toBe("coaching");
    expect(opener).not.toMatch(/^\*\*What is this strategy for\?\*\*$/m);
    expect(opener.toLowerCase()).toContain("no checklist");
  });

  it("absorbs natural language into the plan draft", () => {
    let { session } = bootstrapBusinessStrategySession("Product Strategy");
    session = absorbBusinessStrategyFromUserMessage(
      session,
      "I'm launching a group coaching program for ADHD entrepreneurs over the next 8 weeks. Success is 12 signups.",
      "",
    );
    expect(session.answers.purpose ?? session.answers.notes).toBeTruthy();
    expect(session.draft).toContain("Product Strategy");
  });

  it("builds weekly outline when timeframe mentions weeks", () => {
    let { session } = bootstrapBusinessStrategySession("Marketing Strategy");
    session = absorbBusinessStrategyFromUserMessage(
      session,
      "8 week visibility push for my workshop",
      "What's the timeframe?",
    );
    expect(session.answers.timeframe).toMatch(/8 week/i);
    const draft = buildBusinessStrategyDraft(session);
    expect(draft).toContain("Week 1");
  });

  it("build strategy command refreshes draft", () => {
    let { session } = bootstrapBusinessStrategySession("Marketing Strategy");
    session = absorbBusinessStrategyFromUserMessage(
      session,
      "Grow my email list for coaches",
      "",
    );
    session = absorbBusinessStrategyFromUserMessage(session, "build strategy", "");
    expect(session.draft).toContain("Marketing Strategy");
  });
});
