import { describe, expect, it } from "vitest";
import {
  COMMUNICATION_ANCHOR_QUIET_RULES,
  QUIET_AMBIENT_MOMENTS,
  evaluateQuietMoments,
  isForbiddenIdleCopy,
  mergeQuietMotions,
  resolveQuietMomentsPhase,
} from "./index";

describe("Quiet Moments™", () => {
  it("progresses through phases as idle time increases", () => {
    expect(resolveQuietMomentsPhase({ idleMs: 0 })).toBe("settling");
    expect(resolveQuietMomentsPhase({ idleMs: 30_000 })).toBe("quiet");
    expect(resolveQuietMomentsPhase({ idleMs: 300_000 })).toBe("deep-quiet");
    expect(
      resolveQuietMomentsPhase({ idleMs: 300_000, isUserTyping: true }),
    ).toBe("active");
  });

  it("keeps communication anchor quiet without demanding attention", () => {
    const quiet = evaluateQuietMoments({ idleMs: 120_000 });
    expect(quiet.anchorMode).toBe("quiet");
    expect(quiet.suppressIdleEntertainment).toBe(true);
    expect(COMMUNICATION_ANCHOR_QUIET_RULES.noPulse).toBe(true);
    expect(COMMUNICATION_ANCHOR_QUIET_RULES.noTypeHerePlaceholder).toBe(true);
  });

  it("forbids idle surveillance and entertainment copy", () => {
    expect(isForbiddenIdleCopy("Are you still there?").forbidden).toBe(true);
    expect(isForbiddenIdleCopy("Tip of the day: batch your email").forbidden).toBe(
      true,
    );
    expect(isForbiddenIdleCopy("Type here to get started").forbidden).toBe(true);
    expect(isForbiddenIdleCopy("Come on in.").forbidden).toBe(false);
  });

  it("welcomes ADHD returns without guilt", () => {
    const afterTwenty = evaluateQuietMoments({
      idleMs: 60_000,
      returnAfterMinutes: 20,
    });
    expect(afterTwenty.welcomeReturnWithoutGuilt).toBe(true);
    expect(isForbiddenIdleCopy("Where did you go?").forbidden).toBe(true);
  });

  it("passes the five-minute test when silence is trusted", () => {
    const fiveMin = evaluateQuietMoments({ idleMs: 310_000 });
    expect(fiveMin.fiveMinuteTestPassed).toBe(true);
    expect(fiveMin.temporalDrift?.subtle).toBe(true);
    expect(fiveMin.allowedMotions.length).toBeGreaterThan(0);
  });

  it("softens motion during recovery without going empty", () => {
    const recovery = evaluateQuietMoments({
      idleMs: 120_000,
      recoveryGentle: true,
    });
    expect(recovery.allowedMotions).toContain("curtains");
    expect(recovery.ambientAudioEligible).toBe(false);
  });

  it("defines ambient moments that never demand attention", () => {
    expect(QUIET_AMBIENT_MOMENTS.length).toBeGreaterThanOrEqual(10);
    for (const moment of QUIET_AMBIENT_MOMENTS) {
      expect(moment.designerNote.length).toBeGreaterThan(0);
      expect(moment.motion.length).toBeGreaterThan(0);
    }
  });

  it("merges quiet motions without stripping existing life", () => {
    const merged = mergeQuietMotions(
      ["rain"],
      ["steam", "curtains"],
      "quiet",
    );
    expect(merged).toContain("rain");
    expect(merged).toContain("steam");
    expect(mergeQuietMotions(["rain"], ["steam"], "active")).toEqual(["rain"]);
  });
});
