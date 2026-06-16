import { describe, expect, it } from "vitest";
import { buildProjectCoachHandoff } from "./projectCoachHandoff";
import type { WorkspaceContext } from "./workspaceAwareness";

describe("projectCoachHandoff", () => {
  it("shows topic picker when project has a real name", () => {
    const msg = buildProjectCoachHandoff({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemId: "p1",
      selectedItemName: "ADHD Business Ecosystem Development",
    } as WorkspaceContext);
    expect(msg?.content).toContain("ADHD Business Ecosystem Development");
    expect(msg?.showTopicPicker).toBe(true);
  });

  it("falls back to title coaching when untitled", () => {
    const msg = buildProjectCoachHandoff({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemId: "p1",
      selectedItemName: "Untitled project",
    } as WorkspaceContext);
    expect(msg?.content).toContain("title");
    expect(msg?.showTopicPicker).toBeFalsy();
  });
});
