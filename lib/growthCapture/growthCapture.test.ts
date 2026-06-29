import { describe, expect, it } from "vitest";
import { suggestGrowthDestination } from "./suggestDestination";

describe("suggestGrowthDestination", () => {
  it("suggests evidence for impact language", () => {
    const result = suggestGrowthDestination(
      "Client retention improved 20% after we changed the onboarding strategy.",
    );
    expect(result.destination).toBe("evidence-bank");
  });

  it("suggests portfolio for creation language", () => {
    const result = suggestGrowthDestination(
      "Finished and published the new course landing page.",
    );
    expect(result.destination).toBe("portfolio");
  });

  it("suggests journal for reflection language", () => {
    const result = suggestGrowthDestination(
      "Today I feel proud of how I handled a hard conversation.",
    );
    expect(result.destination).toBe("journal");
  });

  it("returns uncategorized for empty input", () => {
    const result = suggestGrowthDestination("");
    expect(result.destination).toBe("uncategorized");
  });
});
