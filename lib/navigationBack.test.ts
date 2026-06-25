import { describe, expect, it } from "vitest";
import {
  formatAppBackLabel,
  NAV_CLEAR_MY_MIND,
  NAV_MY_THOUGHTS,
  navigationDestinationForSection,
} from "./navigationBack";

describe("navigationBack", () => {
  it("formats standard back labels", () => {
    expect(formatAppBackLabel(NAV_CLEAR_MY_MIND)).toBe(
      "Back to Clear My Mind™",
    );
    expect(formatAppBackLabel(NAV_MY_THOUGHTS)).toBe("Back to My Thoughts™");
    expect(formatAppBackLabel("Back to Home")).toBe("Back to Home");
  });

  it("maps trademark workspace sections", () => {
    expect(navigationDestinationForSection("brain-dump")).toBe(NAV_CLEAR_MY_MIND);
    expect(navigationDestinationForSection("plan-my-day")).toBe("Plan My Day™");
    expect(navigationDestinationForSection("projects")).toBe("Projects™");
  });
});
