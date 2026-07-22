import { describe, expect, it } from "vitest";
import {
  BACK_TO_ESTATE,
  formatAppBackLabel,
  isEstateHomeDestination,
  NAV_CLEAR_MY_MIND,
  NAV_HOME,
  NAV_MY_THOUGHTS,
  navigationDestinationForSection,
  sectionHasEmbeddedChatBack,
} from "./navigationBack";

describe("navigationBack", () => {
  it("formats standard back labels", () => {
    expect(formatAppBackLabel(NAV_CLEAR_MY_MIND)).toBe(
      "Back to Clear My Mind",
    );
    expect(formatAppBackLabel(NAV_MY_THOUGHTS)).toBe("Back to My Thoughts");
    expect(formatAppBackLabel(NAV_HOME)).toBe("Return to Welcome Home");
    expect(formatAppBackLabel("Home")).toBe("Return to Welcome Home");
    expect(formatAppBackLabel("Back to Home")).toBe("Return to Welcome Home");
    expect(formatAppBackLabel("Return to Estate")).toBe("Return to Welcome Home");
    expect(formatAppBackLabel("Return to Welcome Home")).toBe(
      "Return to Welcome Home",
    );
    expect(isEstateHomeDestination("Estate")).toBe(true);
    expect(BACK_TO_ESTATE).toBe("Welcome Home");
  });

  it("flags immersive rooms with in-panel chat back", () => {
    expect(sectionHasEmbeddedChatBack("brain-dump")).toBe(true);
    expect(sectionHasEmbeddedChatBack("life-experience")).toBe(true);
    expect(sectionHasEmbeddedChatBack("breathe")).toBe(false);
  });

  it("maps trademark workspace sections", () => {
    expect(navigationDestinationForSection("brain-dump")).toBe(NAV_CLEAR_MY_MIND);
    expect(navigationDestinationForSection("plan-my-day")).toBe("Plan My Day");
    expect(navigationDestinationForSection("projects")).toBe("Projects");
  });
});
