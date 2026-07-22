/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getProjectItems, saveProject } from "@/lib/companionStore";
import {
  addInboxTask,
  applyInboxGrouping,
  listInboxTasks,
  suggestInboxGrouping,
} from "./projectInbox";

const PROJECTS_KEY = "companion-projects-v1";
const PROJECT_ITEMS_KEY = "companion-project-items-v1";

describe("projectInbox (137 Capture Before Classification)", () => {
  beforeEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  it("adds a task to Inbox without creating a section", () => {
    const list = saveProject({ name: "Launch", goal: "Ship calmly" });
    const projectId = list[0]!.id;
    addInboxTask(projectId, "Draft launch post");
    const items = getProjectItems(projectId);
    expect(items.some((i) => i.kind === "section")).toBe(false);
    const inbox = listInboxTasks(projectId);
    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.title).toBe("Draft launch post");
    expect(inbox[0]?.parentId).toBeUndefined();
  });

  it("suggests Marketing grouping for related Inbox tasks", () => {
    const list = saveProject({ name: "Brand", goal: "Warm presence" });
    const projectId = list[0]!.id;
    addInboxTask(projectId, "Write Instagram caption");
    addInboxTask(projectId, "Plan marketing content calendar");
    addInboxTask(projectId, "Buy groceries");
    const suggestion = suggestInboxGrouping(listInboxTasks(projectId));
    expect(suggestion?.label).toBe("Marketing");
    expect(suggestion?.taskIds.length).toBeGreaterThanOrEqual(2);
  });

  it("applies grouping into a section and clears those Inbox tasks", () => {
    const list = saveProject({ name: "Brand", goal: "Warm presence" });
    const projectId = list[0]!.id;
    addInboxTask(projectId, "Draft social post");
    addInboxTask(projectId, "Content outline for campaign");
    const suggestion = suggestInboxGrouping(listInboxTasks(projectId));
    expect(suggestion).toBeTruthy();
    applyInboxGrouping(projectId, suggestion!);
    const inbox = listInboxTasks(projectId);
    expect(inbox.every((t) => !suggestion!.taskIds.includes(t.id))).toBe(true);
    const items = getProjectItems(projectId);
    expect(
      items.some(
        (i) =>
          i.kind === "section" &&
          i.title.toLowerCase() === suggestion!.label.toLowerCase(),
      ),
    ).toBe(true);
  });
});
