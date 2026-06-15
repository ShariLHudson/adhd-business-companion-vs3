import { describe, expect, it } from "vitest";
import {
  CREATE_FEATURED,
  createPromptQuestion,
  resolveFeaturedType,
} from "./createWorkspaceUx";

describe("createWorkspaceUx", () => {
  it("has featured create types", () => {
    expect(CREATE_FEATURED.map((f) => f.label)).toContain("Proposal");
    expect(CREATE_FEATURED.map((f) => f.label)).toContain("Presentation");
  });

  it("maps social post to social campaign type", () => {
    const social = CREATE_FEATURED.find((f) => f.label === "Social Post")!;
    expect(resolveFeaturedType(social)).toBe("Social Campaign");
  });

  it("uses type-specific prompt questions", () => {
    expect(createPromptQuestion("Proposal")).toMatch(/proposal/i);
    expect(createPromptQuestion("Something New")).toBe("What's this about?");
  });
});
