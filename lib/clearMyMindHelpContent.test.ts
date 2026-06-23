import { describe, expect, it } from "vitest";
import { CLEAR_MY_MIND_HELP } from "./clearMyMindHelpContent";
import { getWorkspaceHelpContent } from "./workspaceHelpContent";

describe("clearMyMindHelpContent", () => {
  it("describes the current capture workflow", () => {
    expect(CLEAR_MY_MIND_HELP.workflow[0]).toMatch(/Capture/i);
    expect(CLEAR_MY_MIND_HELP.workflow[0]).toMatch(/commas/i);
  });

  it("documents Smart Split choices", () => {
    const split = CLEAR_MY_MIND_HELP.workflow.find((step) =>
      step.includes("Smart Split"),
    );
    expect(split).toMatch(/Separate Them/);
    expect(split).toMatch(/Keep As Entered/);
  });

  it("documents Mental Landscape and thought actions", () => {
    expect(CLEAR_MY_MIND_HELP.workflow.join(" ")).toMatch(/Everything is held/);
    expect(CLEAR_MY_MIND_HELP.workflow.join(" ")).toMatch(/View thoughts/i);
    expect(CLEAR_MY_MIND_HELP.workflow.join(" ")).toMatch(/Mark Done/);
  });

  it("avoids legacy planner and library language", () => {
    const blob = JSON.stringify(CLEAR_MY_MIND_HELP);
    expect(blob).not.toMatch(/one card per thought/i);
    expect(blob).not.toMatch(/one thing at a time/i);
    expect(blob).not.toMatch(/find priorities/i);
    expect(blob).not.toMatch(/shape next steps/i);
    expect(blob).not.toMatch(/\bLibrary\b/i);
  });

  it("powers the in-panel How To Use dropdown", () => {
    const help = getWorkspaceHelpContent("brain-dump");
    expect(help?.areaName).toBe("Clear My Mind");
    expect(help?.workflow).toHaveLength(6);
    expect(help?.workflow[5]).toMatch(/Add More Thoughts/);
  });
});
