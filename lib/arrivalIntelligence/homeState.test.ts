import { describe, expect, it } from "vitest";
import {
  homeChromeForState,
  homeStateDataAttr,
  resolveCompanionHomeState,
} from "./homeState";

describe("homeState", () => {
  it("resolves three distinct home states", () => {
    expect(
      resolveCompanionHomeState({
        visitorKind: "first_onboarding",
        continue: { mode: "onboarding" },
      }),
    ).toBe("FIRST_VISIT");

    expect(
      resolveCompanionHomeState({
        visitorKind: "returning",
        continue: { mode: "empty", prompt: "x" },
      }),
    ).toBe("QUIET_PRESENCE");

    expect(
      resolveCompanionHomeState({
        visitorKind: "onboarding_return",
        continue: { mode: "onboarding" },
      }),
    ).toBe("QUIET_PRESENCE");
  });

  it("exposes DOM-safe state attributes", () => {
    expect(homeStateDataAttr("FIRST_VISIT")).toBe("first-visit");
    expect(homeStateDataAttr("RETURNING_ACTIVE")).toBe("returning-active");
    expect(homeStateDataAttr("QUIET_PRESENCE")).toBe("quiet-presence");
  });

  it("assigns nav visibility by relationship stage", () => {
    expect(homeChromeForState("FIRST_VISIT").navVisibility).toBe("muted");
    expect(homeChromeForState("RETURNING_ACTIVE").navVisibility).toBe("normal");
    expect(homeChromeForState("QUIET_PRESENCE").navVisibility).toBe("calm");
  });

  it("uses welcome-scene layout for relationship welcome states", () => {
    expect(homeChromeForState("FIRST_VISIT").layout).toBe("welcome-scene");
    expect(homeChromeForState("QUIET_PRESENCE").layout).toBe("welcome-scene");
    expect(homeChromeForState("RETURNING_ACTIVE").layout).toBe("standard");
  });
});
