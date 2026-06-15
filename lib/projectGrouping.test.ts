import { describe, expect, it } from "vitest";
import {
  groupProjectsByList,
  projectListGroup,
  timeBlockDateGroup,
} from "./projectGrouping";
import type { Project, TimeBlock } from "./companionStore";

function project(status: Project["status"]): Project {
  return {
    id: "p1",
    name: "Test",
    goal: "",
    horizon: "now",
    status,
    nextAction: "",
    color: "#1e4f4f",
    createdAt: "",
    updatedAt: "",
  };
}

describe("projectGrouping", () => {
  it("groups projects by active / not-started / completed", () => {
    expect(projectListGroup("in-progress")).toBe("active");
    expect(projectListGroup("not-started")).toBe("not-started");
    expect(projectListGroup("completed")).toBe("completed");
    const groups = groupProjectsByList([
      project("in-progress"),
      project("not-started"),
      project("completed"),
    ]);
    expect(groups.active).toHaveLength(1);
    expect(groups["not-started"]).toHaveLength(1);
    expect(groups.completed).toHaveLength(1);
  });

  it("puts unscheduled blocks in Time Bank group", () => {
    const block: TimeBlock = {
      id: "b1",
      title: "Work",
      date: "",
      startTime: "09:00",
      durationMin: 30,
      energy: "medium",
      status: "pending",
      createdAt: "",
    };
    expect(timeBlockDateGroup(block)).toBe("bank");
  });
});
