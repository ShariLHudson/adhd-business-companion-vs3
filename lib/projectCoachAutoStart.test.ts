import { describe, expect, it } from "vitest";
import { buildProjectCoachAutoStart } from "./projectCoachAutoStart";
import type { WorkspaceContext } from "./workspaceAwareness";

describe("projectCoachAutoStart", () => {
  it("coaches missing title on detail", () => {
    const msg = buildProjectCoachAutoStart({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemName: "Untitled project",
      selectedItemId: "p1",
    } as WorkspaceContext);
    expect(msg?.content).toContain("doesn't have a title");
    expect(msg?.focusField).toBe("project-title");
  });

  it("coaches outcome after title exists", () => {
    const msg = buildProjectCoachAutoStart({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemName: "VIP Workshop",
      selectedItemGoal: null,
      selectedItemId: "p1",
    } as WorkspaceContext);
    expect(msg?.content).toContain("success looks like");
    expect(msg?.focusField).toBe("project-goal");
  });

  it("suggests first task when outcome set but no tasks", () => {
    const msg = buildProjectCoachAutoStart({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemName: "ADHD App",
      selectedItemGoal: "Ship beta",
      projectTaskCount: 0,
      selectedItemId: "p1",
    } as WorkspaceContext);
    expect(msg?.content).toContain("what needs to happen first");
  });
});
