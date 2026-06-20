import { describe, expect, it } from "vitest";
import {
  getWorkspaceAreaWorkflow,
  WORKSPACE_AREA_WORKFLOWS,
} from "./workspaceAreaWorkflows";

describe("workspaceAreaWorkflows", () => {
  it("defines workflows for major workspaces", () => {
    const ids = [
      "plan-my-day",
      "brain-dump",
      "projects",
      "templates-library",
      "snippets",
      "client-avatars",
      "playbook",
      "time-block",
      "decision-compass",
    ];
    for (const id of ids) {
      const wf = getWorkspaceAreaWorkflow(id);
      expect(wf, id).toBeTruthy();
      expect(wf!.steps.length).toBeGreaterThanOrEqual(4);
      expect(wf!.steps.length).toBeLessThanOrEqual(8);
    }
  });

  it("keeps playbook workflow distinct from section guides", () => {
    expect(WORKSPACE_AREA_WORKFLOWS.playbook.steps[0]).toMatch(/ADHD Strategies/i);
  });
});
