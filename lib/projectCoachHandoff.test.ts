import { describe, expect, it } from "vitest";
import {
  buildProjectCoachHandoff,
  projectCoachTopicOpener,
} from "./projectCoachHandoff";
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
    expect(msg?.content).toContain("What kind of help do you need right now?");
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

  it("opens planning with overview focus", () => {
    const opener = projectCoachTopicOpener(
      { need: "planning", focus: "plan-overview" },
      {
        section: "projects",
        selectedItemName: "Launch Workshop",
      } as WorkspaceContext,
    );
    expect(opener.content).toContain("overview");
    expect(opener.focusField).toBe("project-goal");
  });

  it("opens tasks with next-action focus", () => {
    const opener = projectCoachTopicOpener(
      { need: "tasks", focus: "task-next-action" },
      null,
    );
    expect(opener.content).toContain("next action");
    expect(opener.focusField).toBe("project-next-action");
  });
});
