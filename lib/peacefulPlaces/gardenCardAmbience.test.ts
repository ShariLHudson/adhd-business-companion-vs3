import { describe, expect, it } from "vitest";
import { GARDEN_DESTINATION_CARDS } from "./gardenDestinationCards";

describe("gardenCardAmbience", () => {
  it("registers hover preview audio for key invitation cards", () => {
    expect(GARDEN_DESTINATION_CARDS["pause-reset"]?.hoverAmbienceUrl).toContain(
      "hall-of-reflections",
    );
    expect(GARDEN_DESTINATION_CARDS["evening-hearth"]?.hoverAmbienceUrl).toContain(
      "evening-hearth",
    );
    expect(GARDEN_DESTINATION_CARDS["bedroom-window"]?.hoverAmbienceUrl).toContain(
      "bedroom-window",
    );
  });
});
