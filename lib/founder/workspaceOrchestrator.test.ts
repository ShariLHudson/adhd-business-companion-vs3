import { describe, expect, it } from "vitest";

import {
  getExecutiveRecommendation,
  getWorkspace,
  listWorkspaces,
} from "./workspace";
import { FOUNDER_WORKSPACE_IDS } from "./workspace/config";

describe("Workspace Orchestrator™", () => {
  it("lists six executive workspaces", () => {
    const workspaces = listWorkspaces();
    expect(workspaces.length).toBe(6);
    expect(workspaces.map((w) => w.id)).toEqual([...FOUNDER_WORKSPACE_IDS]);
  });

  it("getExecutiveRecommendation returns one high-impact item", () => {
    const rec = getExecutiveRecommendation();
    expect(rec.title.length).toBeGreaterThan(5);
    expect(rec.impactStars).toBeGreaterThanOrEqual(1);
    expect(rec.impactStars).toBeLessThanOrEqual(5);
  });

  it("getWorkspace assembles from existing services without empty id", () => {
    for (const id of FOUNDER_WORKSPACE_IDS) {
      const workspace = getWorkspace(id);
      expect(workspace.id).toBe(id);
      expect(workspace.recommendation.title.length).toBeGreaterThan(3);
      expect(workspace.priorities.length).toBeLessThanOrEqual(3);
      expect(workspace.actions.length).toBeLessThanOrEqual(3);
      expect(workspace.sections.length).toBeGreaterThan(0);
    }
  });

  it("simplify workspace caps overwhelm", () => {
    const workspace = getWorkspace("simplify");
    expect(workspace.priorities.length).toBeLessThanOrEqual(2);
    expect(workspace.actions.length).toBeLessThanOrEqual(1);
  });

  it("build workspace references internal rooms", () => {
    const workspace = getWorkspace("build");
    expect(workspace.roomIds).toContain("spark-command");
    expect(workspace.sections.some((s) => s.items.length > 0)).toBe(true);
  });
});
