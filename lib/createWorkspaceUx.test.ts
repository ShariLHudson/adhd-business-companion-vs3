import { describe, expect, it } from "vitest";
import { createPromptQuestion } from "./createWorkspaceUx";

describe("createWorkspaceUx", () => {
  it("uses type-specific prompt questions", () => {
    expect(createPromptQuestion("Proposal")).toMatch(/proposal/i);
    expect(createPromptQuestion("Blog Post")).toMatch(/blog/i);
    expect(createPromptQuestion("Something New")).toBe("What's this about?");
  });
});
