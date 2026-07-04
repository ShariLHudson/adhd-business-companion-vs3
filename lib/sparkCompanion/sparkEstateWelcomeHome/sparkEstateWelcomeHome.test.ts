import { describe, expect, it } from "vitest";
import {
  containsForbiddenAbsenceCopy,
  evaluateSparkWelcomeHome,
} from "./evaluateWelcomeHome";
import { constitutionalReturnGreeting } from "./principles";
import { sparkEstateWelcomeHomeHintForChat } from "./sparkEstateWelcomeHomeHintForChat";
import { SPARK_WELCOME_HOME_MESSAGE } from "./types";

describe("sparkEstateWelcomeHome", () => {
  it("uses glad you're here in constitutional greeting", () => {
    expect(constitutionalReturnGreeting()).toContain(SPARK_WELCOME_HOME_MESSAGE);
    expect(constitutionalReturnGreeting()).not.toMatch(/welcome back/i);
  });

  it("detects return moment", () => {
    const d = evaluateSparkWelcomeHome({
      userText: "I'm back — haven't been here in a while",
    });
    expect(d.isReturnMoment).toBe(true);
    expect(d.signals).toContain("returning");
  });

  it("detects absence shame", () => {
    const d = evaluateSparkWelcomeHome({
      userText: "I feel guilty I abandoned my project and broke my streak",
    });
    expect(d.signals).toContain("absence_shame");
    expect(d.signals).toContain("unfinished_guilt");
  });

  it("flags forbidden absence copy", () => {
    expect(
      containsForbiddenAbsenceCopy("You haven't logged in for 184 days"),
    ).toBe(true);
    expect(containsForbiddenAbsenceCopy(SPARK_WELCOME_HOME_MESSAGE)).toBe(
      false,
    );
  });

  it("return hint forbids streak language", () => {
    const hint = sparkEstateWelcomeHomeHintForChat({
      userText: "I'm back after months away",
      isReturning: true,
    });
    expect(hint).toContain(SPARK_WELCOME_HOME_MESSAGE);
    expect(hint).toContain("No day-counts");
  });
});
