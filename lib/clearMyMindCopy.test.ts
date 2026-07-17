import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_ACK_CONTINUE_LABEL,
  CLEAR_MY_MIND_CAPTURE_BUTTON,
  CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM,
  CLEAR_MY_MIND_CONTINUE_PROMPT,
  CLEAR_MY_MIND_HEADER,
  CLEAR_MY_MIND_NEXT_SECTION,
  CLEAR_MY_MIND_REFLECTION_LEAD,
  CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
  clearMyMindHeldCountLine,
  CLEAR_MY_MIND_SPLIT_CONFIRM,
  CLEAR_MY_MIND_SPLIT_HEADLINE,
} from "./clearMyMindCopy";
import { MORE_CLUSTER_FALLBACK } from "./brainDumpClusterModel";
import { OVERFLOW_CLUSTER_FALLBACK } from "./clearMyMindCopy";

describe("clearMyMindCopy", () => {
  it("uses constitutional header copy", () => {
    expect(CLEAR_MY_MIND_HEADER).toBe("Clear My Mind");
    expect(CLEAR_MY_MIND_WORKSPACE_SUBTITLE).toMatch(/everything competing/i);
  });

  it("uses continuous capture continue prompt", () => {
    expect(CLEAR_MY_MIND_CONTINUE_PROMPT).toMatch(/anything else/i);
  });

  it("formats held count for My Thoughts invitation", () => {
    expect(clearMyMindHeldCountLine(27)).toContain("27");
    expect(clearMyMindHeldCountLine(27)).toMatch(/safely/i);
  });

  it("uses Continue action for capture — never Save", () => {
    expect(CLEAR_MY_MIND_CAPTURE_BUTTON).toBe("Continue");
    expect(CLEAR_MY_MIND_CAPTURE_BUTTON_CONFIRM).toBe("I've got it.");
    expect(CLEAR_MY_MIND_CAPTURE_BUTTON.toLowerCase()).not.toContain("save");
    expect(CLEAR_MY_MIND_CAPTURE_BUTTON.toLowerCase()).not.toContain("hold");
  });

  it("uses companion split language", () => {
    expect(CLEAR_MY_MIND_SPLIT_HEADLINE).toMatch(/different thoughts/i);
    expect(CLEAR_MY_MIND_SPLIT_CONFIRM).toMatch(/yes, separate them/i);
  });

  it("uses conversation reflection language after Continue", () => {
    expect(CLEAR_MY_MIND_REFLECTION_LEAD).toMatch(/safely out of your head/i);
    expect(CLEAR_MY_MIND_NEXT_SECTION).toMatch(/help most right now/i);
    expect(CLEAR_MY_MIND_ACK_CONTINUE_LABEL.length).toBeGreaterThan(0);
  });
});
