import { describe, expect, it } from "vitest";
import {
  bootstrapBusinessStrategySession,
  processBusinessStrategyTurn,
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
  it("walks one question at a time", () => {
    let { session } = bootstrapBusinessStrategySession("Marketing Strategy");
    let r = processBusinessStrategyTurn(session, "Grow my email list");
    session = r.session;
    expect(r.reply).toContain("outcome");
    r = processBusinessStrategyTurn(session, "500 subscribers");
    session = r.session;
    expect(session.questionIndex).toBeGreaterThan(0);
  });

  it("reaches readiness after all answers", () => {
    let { session } = bootstrapBusinessStrategySession("Sales Strategy");
    const answers = ["More clients", "Steady revenue", "Small business owners", "Predictable pipeline", "Fear of outreach"];
    for (const a of answers) {
      const r = processBusinessStrategyTurn(session, a);
      session = r.session;
    }
    expect(session.phase).toBe("readiness");
    const built = processBusinessStrategyTurn(session, "Build Strategy");
    expect(built.session.draft).toContain("Sales Strategy");
  });
});
