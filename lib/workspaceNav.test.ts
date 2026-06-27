import { describe, expect, it } from "vitest";
import { isSplitWorkspaceSection, shouldOpenBesideChat } from "./workspaceNav";

describe("workspaceNav", () => {
  it("treats menu workspace sections as split-capable", () => {
    expect(shouldOpenBesideChat("templates-library")).toBe(true);
    expect(shouldOpenBesideChat("snippets")).toBe(true);
    expect(shouldOpenBesideChat("content-generator")).toBe(true);
    expect(shouldOpenBesideChat("playbook")).toBe(true);
    expect(shouldOpenBesideChat("brain-dump")).toBe(false);
    expect(shouldOpenBesideChat("plan-my-day")).toBe(false);
  });

  it("keeps standalone tools off the split rail", () => {
    expect(shouldOpenBesideChat("focus-timer")).toBe(false);
    expect(shouldOpenBesideChat("breathe")).toBe(false);
    expect(isSplitWorkspaceSection("progress")).toBe(false);
  });
});
