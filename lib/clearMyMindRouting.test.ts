import { describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_SECTION,
  isClearMyMindSection,
  shouldOpenClearMyMindStandalone,
} from "./clearMyMindRouting";
import { shouldOpenBesideChat } from "./workspaceNav";
import { supportsWorkspace } from "./workspaceMode";

describe("clearMyMindRouting", () => {
  it("uses brain-dump as the canonical section", () => {
    expect(CLEAR_MY_MIND_SECTION).toBe("brain-dump");
    expect(isClearMyMindSection("brain-dump")).toBe(true);
    expect(isClearMyMindSection("focus")).toBe(false);
  });

  it("always opens standalone, never beside chat", () => {
    expect(shouldOpenClearMyMindStandalone("brain-dump")).toBe(true);
    expect(shouldOpenBesideChat("brain-dump")).toBe(false);
    expect(supportsWorkspace("brain-dump")).toBe(false);
  });
});
