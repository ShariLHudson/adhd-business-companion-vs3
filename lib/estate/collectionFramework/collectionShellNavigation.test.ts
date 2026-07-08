import { describe, expect, it } from "vitest";
import { resolveEstateLocationShell } from "../directory/shell";

describe("collection room shell navigation", () => {
  it("maps celebration garden place to home room shell", () => {
    expect(resolveEstateLocationShell("gardens").section).toBe("home");
    expect(resolveEstateLocationShell("celebration-garden").section).toBe("home");
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
