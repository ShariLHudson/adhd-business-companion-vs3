import { describe, expect, it } from "vitest";
import {
  buildWorkspaceCoachAutoStart,
  workspaceCoachSeedKey,
} from "./workspaceCoachAutoStart";
import type { WorkspaceContext } from "./workspaceAwareness";

describe("workspaceCoachAutoStart", () => {
  it("delegates project detail coaching", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "projects",
      title: "Projects",
      view: "detail",
      selectedItemName: "Untitled project",
      selectedItemId: "p1",
    } as WorkspaceContext);
    expect(msg?.content).toContain("doesn't have a title");
  });

  it("coaches brain dump capture mode", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "brain-dump",
      title: "Clear My Mind",
      view: "capture",
      stage: "capture session",
    } as WorkspaceContext);
    expect(msg?.content).toContain("loudest thought");
  });

  it("coaches brain dump library mode", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "brain-dump",
      title: "Clear My Mind",
      view: "library",
      stage: "library",
    } as WorkspaceContext);
    expect(msg?.content).toContain("saved thoughts");
  });

  it("coaches strategies workspace with strategy name", () => {
    const msg = buildWorkspaceCoachAutoStart({
      section: "playbook",
      title: "Strategies",
      selectedItemName: "Body Double",
    } as WorkspaceContext);
    expect(msg?.content).toContain("Body Double");
    expect(msg?.content).toContain("apply");
  });

  it("builds stable seed keys per workspace", () => {
    const ctx = {
      section: "brain-dump",
      title: "Clear My Mind",
      view: "capture",
      stage: "capture session",
    } as WorkspaceContext;
    expect(workspaceCoachSeedKey(ctx)).toBe("brain-dump:capture:capture session");
  });
});
