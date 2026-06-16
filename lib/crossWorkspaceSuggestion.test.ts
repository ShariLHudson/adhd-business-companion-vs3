import { describe, expect, it } from "vitest";
import {
  crossWorkspaceAcceptLabel,
  crossWorkspaceBesideLine,
  crossWorkspaceContextMessage,
  isCrossWorkspaceSection,
} from "./crossWorkspaceSuggestion";

describe("crossWorkspaceSuggestion", () => {
  it("recognizes cross-workspace targets", () => {
    expect(isCrossWorkspaceSection("brain-dump")).toBe(true);
    expect(isCrossWorkspaceSection("settings")).toBe(false);
  });

  it("builds permission copy", () => {
    expect(crossWorkspaceBesideLine("brain-dump")).toContain(
      "Clear My Mind beside this",
    );
    expect(crossWorkspaceAcceptLabel("brain-dump")).toBe(
      "Yes, open Clear My Mind",
    );
  });

  it("builds contextual tool prompts", () => {
    expect(crossWorkspaceContextMessage("Brain Parking Lot", "brain-dump")).toBe(
      "Capture the thoughts you want to park from Brain Parking Lot.",
    );
  });

  it("includes optional hint in permission line", () => {
    expect(
      crossWorkspaceBesideLine(
        "brain-dump",
        "This works best if you can capture the thoughts somewhere.",
      ),
    ).toContain("capture the thoughts");
  });
});
