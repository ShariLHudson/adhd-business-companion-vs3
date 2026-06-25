import { describe, expect, it } from "vitest";
import { thoughtPreview, thoughtTitle } from "./thoughtCard";

describe("thoughtCard", () => {
  it("derives title from first line", () => {
    expect(
      thoughtTitle({
        id: "1",
        text: "Call doctor\nFollow up on labs",
        createdAt: new Date().toISOString(),
      }),
    ).toBe("Call doctor");
  });

  it("uses explicit title when set", () => {
    expect(
      thoughtTitle({
        id: "1",
        text: "Long body text here",
        title: "Short title",
        createdAt: new Date().toISOString(),
      }),
    ).toBe("Short title");
  });

  it("shows preview when body extends beyond title", () => {
    const preview = thoughtPreview({
      id: "1",
      text: "Headline\nMore detail about the thought that continues.",
      createdAt: new Date().toISOString(),
    });
    expect(preview).toContain("More detail");
  });
});
