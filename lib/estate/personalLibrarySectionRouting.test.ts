import { describe, expect, it } from "vitest";
import { resolveEstateLocationShell } from "./directory/shell";

describe("Personal Library section routing (entry-and-reachability correction)", () => {
  it("routes the personal-library place to the new personal-library section", () => {
    expect(resolveEstateLocationShell("personal-library").section).toBe(
      "personal-library",
    );
  });

  it("leaves Achievement Library (library place) unchanged on growth-library", () => {
    expect(resolveEstateLocationShell("library").section).toBe("growth-library");
  });
});
