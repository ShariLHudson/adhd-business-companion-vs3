import { describe, expect, it } from "vitest";
import {
  bootstrapStrategyApplySession,
  processStrategyApplyTurn,
} from "./strategyApplyCoach";

describe("strategyApplyCoach", () => {
  it("bootstraps Start Ugly with first question", () => {
    const boot = bootstrapStrategyApplySession("ugly-first-draft");
    expect(boot?.session.title).toBe("Start Ugly");
    expect(boot?.opener).toContain("Start Ugly");
    expect(boot?.opener).toContain("**");
  });

  it("includes active project in opener without forcing project routing", () => {
    const boot = bootstrapStrategyApplySession("raise-one-client", {
      activeProjectName: "Summit Launch",
    });
    expect(boot?.opener).toContain("Summit Launch");
    expect(boot?.opener).toContain("won't force project routing");
  });

  it("collects answers one at a time", () => {
    const boot = bootstrapStrategyApplySession("shrink-first-step");
    expect(boot).not.toBeNull();
    let session = boot!.session;

    const t1 = processStrategyApplyTurn(session, "My sales page");
    session = t1.session;
    expect(session.answers[session.questions[0]!.id]).toBe("My sales page");
    expect(t1.reply).toContain("**");

    const t2 = processStrategyApplyTurn(session, "Open the doc");
    session = t2.session;
    expect(session.questionIndex).toBe(2);

    const t3 = processStrategyApplyTurn(session, "Just open it");
    expect(t3.session.phase).toBe("done");
    expect(t3.session.plan).toContain("Shrink the First Step");
  });
});
