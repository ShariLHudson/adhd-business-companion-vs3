import { describe, expect, it } from "vitest";
import {
  bootstrapStrategyApplySession,
  buildStrategyApplyOpener,
  processStrategyApplyTurn,
  questionsForStrategy,
} from "./strategyApplyCoach";
import { getStrategy } from "./strategySystem";

describe("strategyApplyCoach", () => {
  it("bootstraps Start Ugly with a clean coaching opener", () => {
    const boot = bootstrapStrategyApplySession("ugly-first-draft");
    expect(boot?.session.title).toBe("Start Ugly");
    expect(boot?.opener).toContain("Start Ugly");
    expect(boot?.opener).toContain("Let's apply this to your situation.");
    expect(boot?.opener).not.toContain("**");
  });

  it("formats Protect Your Baseline opener with step 1 coaching", () => {
    const boot = bootstrapStrategyApplySession("protect-your-baseline");
    expect(boot?.opener).toContain("Protect Your Baseline");
    expect(boot?.opener).toContain("Step 1:");
    expect(boot?.opener).toContain("Name three basics that keep you functional");
    expect(boot?.opener).toContain("What does that look like for you right now?");
  });

  it("stores active project on session without putting it in the opener", () => {
    const boot = bootstrapStrategyApplySession("protect-your-baseline", {
      activeProjectName: "Finish building my website",
    });
    expect(boot?.session.activeProjectName).toBe("Finish building my website");
    expect(boot?.opener).not.toContain("Finish building my website");
    expect(boot?.opener).not.toContain("You mentioned");
    expect(boot?.opener).toContain("Step 1:");
  });

  it("collects answers one at a time", () => {
    const boot = bootstrapStrategyApplySession("protect-your-baseline");
    expect(boot).not.toBeNull();
    let session = boot!.session;

    const t1 = processStrategyApplyTurn(session, "Sleep, meals, and a walk");
    session = t1.session;
    expect(session.answers[session.questions[0]!.id]).toBe(
      "Sleep, meals, and a walk",
    );
    expect(t1.reply).toContain("Step 2:");

    const t2 = processStrategyApplyTurn(session, "On the calendar like meetings");
    session = t2.session;
    expect(session.questionIndex).toBe(2);

    const t3 = processStrategyApplyTurn(session, "Cut a call before I skip lunch");
    expect(t3.session.phase).toBe("done");
    expect(t3.session.plan).toContain("Protect Your Baseline");
  });

  it("builds opener from first chat prompt", () => {
    const strategy = getStrategy("protect-your-baseline");
    expect(strategy).toBeTruthy();
    const questions = questionsForStrategy(strategy!);
    const opener = buildStrategyApplyOpener(strategy!, questions[0]!);
    expect(opener.split("\n")[0]).toBe("Protect Your Baseline");
  });
});
