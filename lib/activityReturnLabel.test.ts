import { describe, expect, it } from "vitest";
import { activityReturnLabel } from "./activityReturnLabel";

describe("activityReturnLabel", () => {
  it("uses strategy hub titles when opened from Strategies", () => {
    expect(activityReturnLabel("adhd")).toBe("ADHD Strategies");
    expect(activityReturnLabel("business")).toBe("Business Strategies");
    expect(activityReturnLabel("home")).toBe("Strategies");
  });

  it("falls back to Focus or Guided Exercises", () => {
    expect(activityReturnLabel(undefined, "focus")).toBe("Focus");
    expect(activityReturnLabel(undefined, "guided-exercises")).toBe(
      "Guided Exercises",
    );
  });
});
