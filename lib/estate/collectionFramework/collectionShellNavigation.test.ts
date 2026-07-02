import { describe, expect, it } from "vitest";
import { resolveEstateLocationShell } from "../directory/shell";

describe("collection room shell navigation", () => {
  it("maps celebration places to collection sections", () => {
    expect(resolveEstateLocationShell("gardens").section).toBe("wins-this-week");
    expect(resolveEstateLocationShell("celebration-garden").section).toBe(
      "wins-this-week",
    );
    expect(resolveEstateLocationShell("celebration-room").section).toBe(
      "growth-reports",
    );
  });

  it("maps story collection destinations", () => {
    expect(resolveEstateLocationShell("journal").section).toBe("growth-journal");
    expect(resolveEstateLocationShell("greenhouse").section).toBe(
      "growth-greenhouse",
    );
    expect(resolveEstateLocationShell("evidence-vault").section).toBe(
      "evidence-bank",
    );
    expect(resolveEstateLocationShell("library").section).toBe("growth-library");
  });
});
